package cn.tannn.oasis.utils;

import lombok.extern.slf4j.Slf4j;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class DbTransferUtil {

    private static final int BATCH_SIZE = 1000; // 批处理大小

    /**
     * 从 sourceDb 迁移表到 targetDb，先删表再建表再导入数据
     *
     * @param sourceCfg 源数据库配置
     * @param targetCfg 目标数据库配置
     * @param tableName 表名
     */
    public static void transferTable(DatabaseConfig sourceCfg, DatabaseConfig targetCfg, String tableName) throws Exception {
        log.info("开始迁移表: {} 从 {} 到 {}", tableName, sourceCfg.getDriverClassName(), targetCfg.getDriverClassName());
        long startTime = System.currentTimeMillis();

        try (
                Connection sourceConn = getConnection(sourceCfg);
                Connection targetConn = getConnection(targetCfg)
        ) {
            // 设置事务
            targetConn.setAutoCommit(false);

            try {
                // 1. 获取表结构
                String createTableSql = getCreateTableSql(sourceConn, tableName);
                if (createTableSql == null) {
                    throw new RuntimeException("未找到表结构: " + tableName);
                }

                // 2. 目标库删表重建
                dropTableIfExists(targetConn, tableName);
                createTable(targetConn, createTableSql, targetCfg);

                // 3. 查询源库数据并获取列信息
                List<List<Object>> data = new ArrayList<>();
                List<String> columns = new ArrayList<>();
                int totalRows = queryTableData(sourceConn, tableName, data, columns);

                // 4. 批量插入数据
                if (!data.isEmpty()) {
                    insertDataInBatch(targetConn, tableName, columns, data);
                }

                // 提交事务
                targetConn.commit();

                long costTime = System.currentTimeMillis() - startTime;
                log.info("表 {} 迁移完成，行数: {}，耗时: {} ms", tableName, totalRows, costTime);

            } catch (Exception e) {
                targetConn.rollback();
                throw e;
            }
        }
    }

    /**
     * 双向数据迁移
     *
     * @param config1   数据库配置1
     * @param config2   数据库配置2
     * @param tableName 表名
     * @param direction 迁移方向：1表示从config1到config2，2表示从config2到config1
     */
    public static void bidirectionalTransfer(DatabaseConfig config1, DatabaseConfig config2,
                                             String tableName, int direction) throws Exception {
        if (direction == 1) {
            transferTable(config1, config2, tableName);
        } else if (direction == 2) {
            transferTable(config2, config1, tableName);
        } else {
            throw new IllegalArgumentException("迁移方向只能是1或2");
        }
    }

    /**
     * 测试数据库连接
     *
     * @param config 数据库配置
     * @return 连接是否成功
     */
    public static boolean testConnection(DatabaseConfig config) {
        try (Connection conn = getConnection(config)) {
            return conn != null && !conn.isClosed();
        } catch (Exception e) {
            log.error("数据库连接测试失败: {}", config.getUrl(), e);
            return false;
        }
    }

    /**
     * 获取表的行数
     *
     * @param config    数据库配置
     * @param tableName 表名
     * @return 行数
     */
    public static long getTableRowCount(DatabaseConfig config, String tableName) throws Exception {
        try (Connection conn = getConnection(config);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + tableName)) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        }
        return 0;
    }

    /**
     * 检查表是否存在
     *
     * @param conn      数据库连接
     * @param tableName 表名
     * @return 表是否存在
     */
    public static boolean tableExists(Connection conn, String tableName) throws SQLException {
        DatabaseMetaData metaData = conn.getMetaData();
        try (ResultSet rs = metaData.getTables(null, null, tableName, new String[]{"TABLE"})) {
            return rs.next();
        }
    }

    /**
     * 获取数据库连接
     */
    private static Connection getConnection(DatabaseConfig cfg) throws Exception {
        if (cfg.getDriverClassName() != null) {
            Class.forName(cfg.getDriverClassName());
        }

        Connection conn = DriverManager.getConnection(cfg.getUrl(), cfg.getUsername(), cfg.getPassword());

        // 设置连接属性
        conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);

        return conn;
    }

    /**
     * 查询表数据
     */
    private static int queryTableData(Connection sourceConn, String tableName,
                                      List<List<Object>> data, List<String> columns) throws SQLException {
        String sql = "SELECT * FROM " + tableName;
        log.debug("查询SQL: {}", sql);

        try (Statement stmt = sourceConn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            ResultSetMetaData meta = rs.getMetaData();
            int columnCount = meta.getColumnCount();

            // 获取列名
            for (int i = 1; i <= columnCount; i++) {
                columns.add(meta.getColumnName(i));
            }

            // 读取数据
            int rowCount = 0;
            while (rs.next()) {
                List<Object> row = new ArrayList<>();
                for (int i = 1; i <= columnCount; i++) {
                    Object value = rs.getObject(i);
                    row.add(value);
                }
                data.add(row);
                rowCount++;
            }

            return rowCount;
        }
    }

    /**
     * 批量插入数据
     */
    private static void insertDataInBatch(Connection targetConn, String tableName,
                                          List<String> columns, List<List<Object>> data) throws SQLException {
        if (data.isEmpty()) {
            return;
        }

        StringBuilder sql = new StringBuilder("INSERT INTO " + tableName + " (");
        sql.append(String.join(",", columns)).append(") VALUES (");
        sql.append("?,".repeat(columns.size()));
        sql.setLength(sql.length() - 1);
        sql.append(")");

        log.debug("插入SQL: {}", sql);

        try (PreparedStatement ps = targetConn.prepareStatement(sql.toString())) {
            int batchCount = 0;

            for (List<Object> row : data) {
                for (int i = 0; i < row.size(); i++) {
                    ps.setObject(i + 1, row.get(i));
                }
                ps.addBatch();
                batchCount++;

                // 批量执行
                if (batchCount >= BATCH_SIZE) {
                    ps.executeBatch();
                    ps.clearBatch();
                    batchCount = 0;
                    log.debug("已批量插入 {} 条记录", BATCH_SIZE);
                }
            }

            // 执行剩余的批次
            if (batchCount > 0) {
                ps.executeBatch();
                log.debug("已批量插入剩余 {} 条记录", batchCount);
            }
        }
    }

    /**
     * 删除表（如果存在）
     */
    private static void dropTableIfExists(Connection conn, String tableName) throws SQLException {
        String sql = "DROP TABLE IF EXISTS " + tableName;
        log.debug("删除表SQL: {}", sql);
        executeSql(conn, sql);
    }

    /**
     * 创建表
     */
    private static void createTable(Connection conn, String createTableSql, DatabaseConfig config) throws SQLException {
        // 根据目标数据库类型调整建表语句
        String adjustedSql = adjustCreateTableSql(createTableSql, config);
        log.debug("建表SQL: {}", adjustedSql);
        executeSql(conn, adjustedSql);
    }

    /**
     * 根据目标数据库类型调整建表语句
     */
    private static String adjustCreateTableSql(String createTableSql, DatabaseConfig config) {
        if (createTableSql == null) {
            return null;
        }

        String sql = createTableSql;
        String driverClassName = config.getDriverClassName().toLowerCase();

        // MySQL 到 H2 的调整
        if (driverClassName.contains("h2")) {
            sql = sql.replaceAll("(?i)AUTO_INCREMENT", "AUTO_INCREMENT");
            sql = sql.replaceAll("(?i)ENGINE=\\w+", "");
            sql = sql.replaceAll("(?i)DEFAULT CHARSET=\\w+", "");
            sql = sql.replaceAll("(?i)COLLATE=\\w+", "");
        }
        // H2 到 MySQL 的调整
        else if (driverClassName.contains("mysql")) {
            if (!sql.toUpperCase().contains("ENGINE=")) {
                sql = sql.replaceAll(";$", "") + " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            }
        }

        return sql;
    }

    /**
     * 获取建表语句（兼容 H2/MySQL）
     */
    private static String getCreateTableSql(Connection conn, String tableName) throws SQLException {
        String sql = null;

        try {
            // 尝试 MySQL 方式
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SHOW CREATE TABLE " + tableName)) {
                if (rs.next()) {
                    sql = rs.getString(2);
                }
            }
        } catch (SQLException e) {
            // 尝试 H2 方式
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SCRIPT SIMPLE NODATA")) {
                while (rs.next()) {
                    String line = rs.getString(1);
                    if (line.toUpperCase().startsWith("CREATE TABLE") &&
                            line.toUpperCase().contains(tableName.toUpperCase())) {
                        sql = line;
                        break;
                    }
                }
            } catch (SQLException ex) {
                // 如果都失败，尝试通过元数据构建
                sql = buildCreateTableFromMetadata(conn, tableName);
            }
        }

        return sql;
    }

    /**
     * 通过数据库元数据构建建表语句
     */
    private static String buildCreateTableFromMetadata(Connection conn, String tableName) throws SQLException {
        DatabaseMetaData metaData = conn.getMetaData();
        StringBuilder sql = new StringBuilder("CREATE TABLE " + tableName + " (");

        // 获取列信息
        try (ResultSet columns = metaData.getColumns(null, null, tableName, null)) {
            boolean first = true;
            while (columns.next()) {
                if (!first) {
                    sql.append(", ");
                }
                first = false;

                String columnName = columns.getString("COLUMN_NAME");
                String typeName = columns.getString("TYPE_NAME");
                int columnSize = columns.getInt("COLUMN_SIZE");
                boolean nullable = columns.getInt("NULLABLE") == DatabaseMetaData.columnNullable;

                sql.append(columnName).append(" ").append(typeName);

                if (columnSize > 0 && !typeName.toUpperCase().contains("TEXT") &&
                        !typeName.toUpperCase().contains("BLOB")) {
                    sql.append("(").append(columnSize).append(")");
                }

                if (!nullable) {
                    sql.append(" NOT NULL");
                }
            }
        }

        // 获取主键信息
        try (ResultSet primaryKeys = metaData.getPrimaryKeys(null, null, tableName)) {
            List<String> pkColumns = new ArrayList<>();
            while (primaryKeys.next()) {
                pkColumns.add(primaryKeys.getString("COLUMN_NAME"));
            }
            if (!pkColumns.isEmpty()) {
                sql.append(", PRIMARY KEY (").append(String.join(", ", pkColumns)).append(")");
            }
        }

        sql.append(")");
        return sql.toString();
    }

    /**
     * 执行SQL语句
     */
    private static void executeSql(Connection conn, String sql) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        }
    }
}
