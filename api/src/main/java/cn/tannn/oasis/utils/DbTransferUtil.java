package cn.tannn.oasis.utils;

import lombok.extern.slf4j.Slf4j;

import java.sql.*;
import java.util.*;

@Slf4j
public class DbTransferUtil {

    private static final int BATCH_SIZE = 1000; // 批处理大小

    /**
     * 列信息实体类
     */
    public static class ColumnInfo {
        public String columnName;
        public String dataType;
        public int columnSize;
        public int decimalDigits;
        public boolean nullable;
        public String defaultValue;
        public boolean autoIncrement;
        public String remarks;

        public ColumnInfo(String columnName, String dataType, int columnSize, int decimalDigits,
                          boolean nullable, String defaultValue, boolean autoIncrement, String remarks) {
            this.columnName = columnName;
            this.dataType = dataType;
            this.columnSize = columnSize;
            this.decimalDigits = decimalDigits;
            this.nullable = nullable;
            this.defaultValue = defaultValue;
            this.autoIncrement = autoIncrement;
            this.remarks = remarks;
        }
    }

    /**
     * 表结构信息
     */
    public static class TableStructure {
        public String tableName;
        public List<ColumnInfo> columns;
        public List<String> primaryKeys;
        public Map<String, List<String>> indexes;
        public String engine;
        public String charset;

        public TableStructure(String tableName) {
            this.tableName = tableName;
            this.columns = new ArrayList<>();
            this.primaryKeys = new ArrayList<>();
            this.indexes = new HashMap<>();
        }
    }

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
                // 1. 获取完整的表结构
                TableStructure tableStructure = getCompleteTableStructure(sourceConn, tableName, sourceCfg);
                if (tableStructure == null) {
                    throw new RuntimeException("未找到表结构: " + tableName);
                }

                // 2. 目标库删表重建
                dropTableIfExists(targetConn, tableName);
                createTableFromStructure(targetConn, tableStructure, targetCfg);

                // 3. 查询源库数据并获取列信息
                List<List<Object>> data = new ArrayList<>();
                List<String> columns = new ArrayList<>();
                int totalRows = queryTableData(sourceConn, tableName, data, columns);

                // 4. 批量插入数据 - 传递表结构信息
                if (!data.isEmpty()) {
                    insertDataInBatch(targetConn, tableName, columns, data, tableStructure);
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
     * 获取完整的表结构信息
     */
    private static TableStructure getCompleteTableStructure(Connection conn, String tableName, DatabaseConfig config) throws SQLException {
        TableStructure structure = new TableStructure(tableName);
        String driverClassName = config.getDriverClassName().toLowerCase();

        // 先尝试通过不同方式获取列信息
        if (driverClassName.contains("mysql")) {
            if (!getMySQLColumnInfo(conn, tableName, structure)) {
                getColumnInfoFromMetaData(conn, tableName, structure, driverClassName);
            }
        } else if (driverClassName.contains("h2")) {
            if (!getH2ColumnInfo(conn, tableName, structure)) {
                getColumnInfoFromMetaData(conn, tableName, structure, driverClassName);
            }
        } else {
            getColumnInfoFromMetaData(conn, tableName, structure, driverClassName);
        }

        // 获取主键信息
        getPrimaryKeyInfo(conn, tableName, structure);

        // 获取索引信息
        getIndexInfo(conn, tableName, structure);

        // 获取表属性（MySQL特有）
        if (driverClassName.contains("mysql")) {
            getMySQLTableProperties(conn, tableName, structure);
        }

        return structure.columns.isEmpty() ? null : structure;
    }

    /**
     * 通过MySQL的SHOW COLUMNS获取列信息
     */
    private static boolean getMySQLColumnInfo(Connection conn, String tableName, TableStructure structure) {
        String sql = "SHOW FULL COLUMNS FROM " + tableName;
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String columnName = rs.getString("Field");
                String type = rs.getString("Type");
                String nullable = rs.getString("Null");
                String key = rs.getString("Key");
                String defaultValue = rs.getString("Default");
                String extra = rs.getString("Extra");
                String comment = rs.getString("Comment");

                // 解析数据类型和长度
                String[] typeInfo = parseTypeInfo(type);
                String dataType = typeInfo[0];
                int columnSize = typeInfo[1] != null ? Integer.parseInt(typeInfo[1]) : 0;
                int decimalDigits = typeInfo[2] != null ? Integer.parseInt(typeInfo[2]) : 0;

                boolean isNullable = "YES".equalsIgnoreCase(nullable);
                boolean autoIncrement = extra != null && extra.toLowerCase().contains("auto_increment");

                // 清理和验证默认值
                defaultValue = cleanDefaultValue(defaultValue, dataType);

                ColumnInfo columnInfo = new ColumnInfo(columnName, dataType, columnSize, decimalDigits,
                        isNullable, defaultValue, autoIncrement, comment);
                structure.columns.add(columnInfo);
            }
            return true;
        } catch (SQLException e) {
            log.debug("使用SHOW COLUMNS获取MySQL列信息失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 清理和验证默认值
     */
    private static String cleanDefaultValue(String defaultValue, String dataType) {
        if (defaultValue == null) {
            return null;
        }

        String trimmed = defaultValue.trim();

        // 空字符串默认值
        if (trimmed.isEmpty()) {
            return isStringType(dataType) ? "''" : null;
        }

        // NULL值
        if ("NULL".equalsIgnoreCase(trimmed)) {
            return null; // NULL默认值在建表时通过nullable处理
        }

        // 跳过包含特殊字符或转义序列的默认值
        if (trimmed.contains("U&'") ||
                trimmed.contains("\\\\") ||
                trimmed.matches(".*\\\\[0-9a-fA-F]{4}.*")) {
            log.debug("跳过包含特殊字符的默认值: {}", trimmed);
            return null;
        }

        // 函数默认值
        if (trimmed.toUpperCase().matches("CURRENT_TIMESTAMP.*|NOW\\(\\)|SYSDATE\\(\\)")) {
            return trimmed;
        }

        return trimmed;
    }

    /**
     * 通过H2的信息模式获取列信息
     */
    private static boolean getH2ColumnInfo(Connection conn, String tableName, TableStructure structure) {
        String sql = "SELECT COLUMN_NAME, TYPE_NAME, COLUMN_SIZE, DECIMAL_DIGITS, IS_NULLABLE, " +
                "COLUMN_DEFAULT, IS_AUTOINCREMENT, REMARKS " +
                "FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_NAME = ? ORDER BY ORDINAL_POSITION";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tableName.toUpperCase()); // H2通常使用大写表名

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String columnName = rs.getString("COLUMN_NAME");
                    String typeName = rs.getString("TYPE_NAME");
                    int columnSize = rs.getInt("COLUMN_SIZE");
                    int decimalDigits = rs.getInt("DECIMAL_DIGITS");
                    boolean nullable = "YES".equalsIgnoreCase(rs.getString("IS_NULLABLE"));
                    String defaultValue = rs.getString("COLUMN_DEFAULT");
                    boolean autoIncrement = "YES".equalsIgnoreCase(rs.getString("IS_AUTOINCREMENT"));
                    String remarks = rs.getString("REMARKS");

                    // 清理H2的默认值
                    defaultValue = cleanDefaultValue(defaultValue, typeName);

                    ColumnInfo columnInfo = new ColumnInfo(columnName, typeName, columnSize, decimalDigits,
                            nullable, defaultValue, autoIncrement, remarks);
                    structure.columns.add(columnInfo);
                }
                return true;
            }
        } catch (SQLException e) {
            log.debug("使用INFORMATION_SCHEMA获取H2列信息失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 通过DatabaseMetaData获取列信息（备用方案）
     */
    private static void getColumnInfoFromMetaData(Connection conn, String tableName, TableStructure structure, String driverClassName) throws SQLException {
        DatabaseMetaData metaData = conn.getMetaData();

        // 尝试不同的表名格式
        String[] tableNameVariants = {tableName, tableName.toUpperCase(), tableName.toLowerCase()};

        for (String tableNameVariant : tableNameVariants) {
            try (ResultSet columns = metaData.getColumns(null, null, tableNameVariant, null)) {
                if (!columns.next()) {
                    continue; // 尝试下一个表名格式
                }

                // 重置ResultSet
                columns.beforeFirst();

                while (columns.next()) {
                    String columnName = columns.getString("COLUMN_NAME");
                    String typeName = columns.getString("TYPE_NAME");
                    int columnSize = columns.getInt("COLUMN_SIZE");
                    int decimalDigits = columns.getInt("DECIMAL_DIGITS");
                    boolean nullable = columns.getInt("NULLABLE") == DatabaseMetaData.columnNullable;
                    String defaultValue = columns.getString("COLUMN_DEF");
                    String remarks = columns.getString("REMARKS");

                    // 检查是否为自增列
                    boolean autoIncrement = false;
                    try {
                        String isAutoIncrement = columns.getString("IS_AUTOINCREMENT");
                        autoIncrement = "YES".equalsIgnoreCase(isAutoIncrement);
                    } catch (SQLException e) {
                        // 某些数据库驱动可能不支持这个字段，尝试其他方式
                        if (driverClassName.contains("mysql")) {
                            // MySQL可以通过EXTRA字段判断
                            try {
                                String extra = columns.getString("IS_GENERATEDCOLUMN");
                                autoIncrement = "YES".equalsIgnoreCase(extra);
                            } catch (SQLException ex) {
                                log.debug("无法获取自增信息: {}", ex.getMessage());
                            }
                        }
                    }

                    // 清理默认值
                    defaultValue = cleanDefaultValue(defaultValue, typeName);

                    ColumnInfo columnInfo = new ColumnInfo(columnName, typeName, columnSize, decimalDigits,
                            nullable, defaultValue, autoIncrement, remarks);
                    structure.columns.add(columnInfo);
                }

                if (!structure.columns.isEmpty()) {
                    break; // 成功获取到列信息，退出循环
                }
            }
        }

        if (structure.columns.isEmpty()) {
            throw new SQLException("无法获取表 " + tableName + " 的列信息");
        }
    }

    /**
     * 解析MySQL的类型信息，如 varchar(100), decimal(10,2)
     */
    private static String[] parseTypeInfo(String typeString) {
        String[] result = new String[3]; // [类型, 长度, 精度]

        if (typeString == null) {
            return result;
        }

        int parenIndex = typeString.indexOf('(');
        if (parenIndex == -1) {
            result[0] = typeString.toUpperCase();
            return result;
        }

        result[0] = typeString.substring(0, parenIndex).toUpperCase();

        int closeParenIndex = typeString.indexOf(')', parenIndex);
        if (closeParenIndex != -1) {
            String sizeString = typeString.substring(parenIndex + 1, closeParenIndex);
            String[] sizeParts = sizeString.split(",");

            if (sizeParts.length > 0) {
                result[1] = sizeParts[0].trim();
            }
            if (sizeParts.length > 1) {
                result[2] = sizeParts[1].trim();
            }
        }

        return result;
    }

    /**
     * 获取主键信息
     */
    private static void getPrimaryKeyInfo(Connection conn, String tableName, TableStructure structure) throws SQLException {
        DatabaseMetaData metaData = conn.getMetaData();

        // 尝试不同的表名格式
        String[] tableNameVariants = {tableName, tableName.toUpperCase(), tableName.toLowerCase()};

        for (String tableNameVariant : tableNameVariants) {
            try (ResultSet primaryKeys = metaData.getPrimaryKeys(null, null, tableNameVariant)) {
                while (primaryKeys.next()) {
                    String columnName = primaryKeys.getString("COLUMN_NAME");
                    if (!structure.primaryKeys.contains(columnName)) {
                        structure.primaryKeys.add(columnName);
                    }
                }

                if (!structure.primaryKeys.isEmpty()) {
                    break; // 成功获取到主键信息，退出循环
                }
            }
        }

        // 如果通过元数据获取不到主键，尝试其他方式
        if (structure.primaryKeys.isEmpty()) {
            tryGetPrimaryKeyBySQL(conn, tableName, structure);
        }
    }

    /**
     * 通过SQL查询获取主键信息
     */
    private static void tryGetPrimaryKeyBySQL(Connection conn, String tableName, TableStructure structure) {
        try {
            // 尝试MySQL的方式
            String sql = "SHOW KEYS FROM " + tableName + " WHERE Key_name = 'PRIMARY'";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {

                while (rs.next()) {
                    String columnName = rs.getString("Column_name");
                    if (!structure.primaryKeys.contains(columnName)) {
                        structure.primaryKeys.add(columnName);
                    }
                }
                return;
            }
        } catch (SQLException e) {
            log.debug("MySQL方式获取主键失败: {}", e.getMessage());
        }

        try {
            // 尝试H2的方式
            String sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.INDEXES " +
                    "WHERE TABLE_NAME = ? AND PRIMARY_KEY = TRUE ORDER BY ORDINAL_POSITION";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, tableName.toUpperCase());
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        String columnName = rs.getString("COLUMN_NAME");
                        if (!structure.primaryKeys.contains(columnName)) {
                            structure.primaryKeys.add(columnName);
                        }
                    }
                }
            }
        } catch (SQLException e) {
            log.debug("H2方式获取主键失败: {}", e.getMessage());
        }
    }

    /**
     * 获取索引信息
     */
    private static void getIndexInfo(Connection conn, String tableName, TableStructure structure) throws SQLException {
        DatabaseMetaData metaData = conn.getMetaData();

        // 尝试不同的表名格式
        String[] tableNameVariants = {tableName, tableName.toUpperCase(), tableName.toLowerCase()};

        for (String tableNameVariant : tableNameVariants) {
            try (ResultSet indexes = metaData.getIndexInfo(null, null, tableNameVariant, false, false)) {
                Map<String, List<String>> tempIndexes = new HashMap<>();

                while (indexes.next()) {
                    String indexName = indexes.getString("INDEX_NAME");
                    String columnName = indexes.getString("COLUMN_NAME");

                    // 跳过主键索引和空值
                    if ("PRIMARY".equals(indexName) || indexName == null || columnName == null) {
                        continue;
                    }

                    tempIndexes.computeIfAbsent(indexName, k -> new ArrayList<>()).add(columnName);
                }

                if (!tempIndexes.isEmpty()) {
                    structure.indexes.putAll(tempIndexes);
                    break; // 成功获取到索引信息，退出循环
                }
            }
        }

        // 如果通过元数据获取不到索引，尝试其他方式
        if (structure.indexes.isEmpty()) {
            tryGetIndexesBySQL(conn, tableName, structure);
        }
    }

    /**
     * 通过SQL查询获取索引信息
     */
    private static void tryGetIndexesBySQL(Connection conn, String tableName, TableStructure structure) {
        try {
            // 尝试MySQL的方式
            String sql = "SHOW INDEX FROM " + tableName + " WHERE Key_name != 'PRIMARY'";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {

                while (rs.next()) {
                    String indexName = rs.getString("Key_name");
                    String columnName = rs.getString("Column_name");

                    if (indexName != null && columnName != null) {
                        structure.indexes.computeIfAbsent(indexName, k -> new ArrayList<>()).add(columnName);
                    }
                }
                return;
            }
        } catch (SQLException e) {
            log.debug("MySQL方式获取索引失败: {}", e.getMessage());
        }

        try {
            // 尝试H2的方式
            String sql = "SELECT INDEX_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.INDEXES " +
                    "WHERE TABLE_NAME = ? AND PRIMARY_KEY = FALSE ORDER BY INDEX_NAME, ORDINAL_POSITION";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, tableName.toUpperCase());
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        String indexName = rs.getString("INDEX_NAME");
                        String columnName = rs.getString("COLUMN_NAME");

                        if (indexName != null && columnName != null) {
                            structure.indexes.computeIfAbsent(indexName, k -> new ArrayList<>()).add(columnName);
                        }
                    }
                }
            }
        } catch (SQLException e) {
            log.debug("H2方式获取索引失败: {}", e.getMessage());
        }
    }

    /**
     * 获取MySQL表属性
     */
    private static void getMySQLTableProperties(Connection conn, String tableName, TableStructure structure) throws SQLException {
        String sql = "SHOW TABLE STATUS LIKE ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tableName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    structure.engine = rs.getString("Engine");
                    structure.charset = rs.getString("Collation");
                }
            }
        } catch (SQLException e) {
            log.debug("获取MySQL表属性失败: {}", e.getMessage());
        }
    }

    /**
     * 根据表结构创建表
     */
    private static void createTableFromStructure(Connection conn, TableStructure structure, DatabaseConfig config) throws SQLException {
        String sql = buildCreateTableSql(structure, config);
        log.debug("建表SQL: {}", sql);
        executeSql(conn, sql);

        // 创建索引
        createIndexes(conn, structure, config);
    }

    /**
     * 构建建表SQL
     */
    private static String buildCreateTableSql(TableStructure structure, DatabaseConfig config) {
        StringBuilder sql = new StringBuilder("CREATE TABLE ").append(structure.tableName).append(" (");
        String driverClassName = config.getDriverClassName().toLowerCase();
        boolean isMySQL = driverClassName.contains("mysql");
        boolean isH2 = driverClassName.contains("h2");

        // 添加列定义
        for (int i = 0; i < structure.columns.size(); i++) {
            if (i > 0) {
                sql.append(", ");
            }
            ColumnInfo column = structure.columns.get(i);
            sql.append(buildColumnDefinition(column, isMySQL, isH2));
        }

        // 添加主键
        if (!structure.primaryKeys.isEmpty()) {
            sql.append(", PRIMARY KEY (");
            sql.append(String.join(", ", structure.primaryKeys));
            sql.append(")");
        }

        sql.append(")");

        // 添加表选项
        if (isMySQL) {
            sql.append(" ENGINE=").append(structure.engine != null ? structure.engine : "InnoDB");
            sql.append(" DEFAULT CHARSET=utf8mb4");
        }

        return sql.toString();
    }

    /**
     * 构建列定义
     */
    private static String buildColumnDefinition(ColumnInfo column, boolean isMySQL, boolean isH2) {
        StringBuilder def = new StringBuilder();
        def.append(column.columnName).append(" ");

        // 数据类型转换
        String dataType = convertDataType(column.dataType, column.columnSize, column.decimalDigits, isMySQL, isH2);
        def.append(dataType);

        // NOT NULL
        if (!column.nullable) {
            def.append(" NOT NULL");
        }

        // 自增
        if (column.autoIncrement) {
            if (isMySQL) {
                def.append(" AUTO_INCREMENT");
            } else if (isH2) {
                def.append(" AUTO_INCREMENT");
            }
        }

        // 默认值 - 改进处理逻辑
        if (column.defaultValue != null && !column.autoIncrement) {
            String processedDefault = processDefaultValue(column.defaultValue, column.dataType, isMySQL, isH2);
            if (processedDefault != null && !processedDefault.trim().isEmpty()) {
                def.append(" DEFAULT ").append(processedDefault);
            }
        }

        // 注释
        if (column.remarks != null && !column.remarks.trim().isEmpty() && isMySQL) {
            String processedComment = processComment(column.remarks);
            def.append(" COMMENT '").append(processedComment).append("'");
        }

        return def.toString();
    }

    /**
     * 处理默认值
     */
    private static String processDefaultValue(String defaultValue, String dataType, boolean isMySQL, boolean isH2) {
        if (defaultValue == null || defaultValue.trim().isEmpty()) {
            return null;
        }

        String trimmedDefault = defaultValue.trim();

        // 处理特殊的默认值
        if ("NULL".equalsIgnoreCase(trimmedDefault)) {
            return "NULL";
        }

        // 处理MySQL的函数默认值
        if (trimmedDefault.toUpperCase().startsWith("CURRENT_TIMESTAMP") ||
                trimmedDefault.toUpperCase().startsWith("NOW()") ||
                trimmedDefault.toUpperCase().startsWith("SYSDATE()")) {
            if (isH2) {
                return "CURRENT_TIMESTAMP";
            } else {
                return trimmedDefault;
            }
        }

        // 处理包含Unicode转义或特殊字符的字符串默认值
        if (trimmedDefault.contains("U&'") || trimmedDefault.contains("\\")) {
            log.debug("跳过包含特殊字符的默认值: {}", trimmedDefault);
            return null; // 跳过这种复杂的默认值
        }

        // 处理字符串类型的默认值
        if (isStringType(dataType)) {
            // 如果已经有引号，先去掉外层引号再重新添加
            if ((trimmedDefault.startsWith("'") && trimmedDefault.endsWith("'")) ||
                    (trimmedDefault.startsWith("\"") && trimmedDefault.endsWith("\""))) {
                String content = trimmedDefault.substring(1, trimmedDefault.length() - 1);
                // 转义单引号
                content = content.replace("'", "''");
                return "'" + content + "'";
            } else {
                // 直接添加引号并转义
                String escaped = trimmedDefault.replace("'", "''");
                return "'" + escaped + "'";
            }
        }

        // 处理布尔值
        if (isBooleanType(dataType)) {
            if ("true".equalsIgnoreCase(trimmedDefault) || "1".equals(trimmedDefault)) {
                return isMySQL ? "1" : "TRUE";
            } else if ("false".equalsIgnoreCase(trimmedDefault) || "0".equals(trimmedDefault)) {
                return isMySQL ? "0" : "FALSE";
            }
        }

        // 数值类型直接返回
        if (isNumericType(dataType)) {
            // 检查是否为有效数字
            try {
                Double.parseDouble(trimmedDefault);
                return trimmedDefault;
            } catch (NumberFormatException e) {
                log.debug("无效的数字默认值: {}", trimmedDefault);
                return null;
            }
        }

        // 其他情况直接返回
        return trimmedDefault;
    }

    /**
     * 处理注释内容
     */
    private static String processComment(String comment) {
        if (comment == null) {
            return "";
        }

        // 转义单引号并移除可能的特殊字符
        return comment.replace("'", "''")
                .replace("\n", " ")
                .replace("\r", " ")
                .replace("\t", " ")
                .replaceAll("\\\\[0-9a-fA-F]{4}", ""); // 移除Unicode转义序列
    }

    /**
     * 判断是否为布尔类型
     */
    private static boolean isBooleanType(String dataType) {
        String upperType = dataType.toUpperCase();
        return upperType.equals("BOOLEAN") || upperType.equals("BOOL") ||
                upperType.equals("BIT") || upperType.equals("TINYINT");
    }

    /**
     * 判断是否为数值类型
     */
    private static boolean isNumericType(String dataType) {
        String upperType = dataType.toUpperCase();
        return upperType.contains("INT") || upperType.contains("DECIMAL") ||
                upperType.contains("NUMERIC") || upperType.contains("FLOAT") ||
                upperType.contains("DOUBLE") || upperType.contains("REAL");
    }

    /**
     * 数据类型转换
     */
    private static String convertDataType(String originalType, int columnSize, int decimalDigits, boolean isMySQL, boolean isH2) {
        String upperType = originalType.toUpperCase();

        // MySQL 到 H2 的转换
        if (isH2) {
            switch (upperType) {
                case "TINYINT":
                    return "TINYINT";
                case "SMALLINT":
                    return "SMALLINT";
                case "MEDIUMINT":
                case "INT":
                case "INTEGER":
                    return "INTEGER";
                case "BIGINT":
                    return "BIGINT";
                case "FLOAT":
                    return "FLOAT";
                case "DOUBLE":
                case "DOUBLE PRECISION":
                    return "DOUBLE";
                case "DECIMAL":
                case "NUMERIC":
                    return decimalDigits > 0 ? String.format("DECIMAL(%d,%d)", columnSize, decimalDigits) : String.format("DECIMAL(%d)", columnSize);
                case "CHAR":
                    return String.format("CHAR(%d)", columnSize);
                case "VARCHAR":
                    return String.format("VARCHAR(%d)", columnSize);
                case "TEXT":
                case "LONGTEXT":
                case "MEDIUMTEXT":
                    return "TEXT";
                case "BLOB":
                case "LONGBLOB":
                case "MEDIUMBLOB":
                    return "BLOB";
                case "DATE":
                    return "DATE";
                case "TIME":
                    return "TIME";
                case "DATETIME":
                case "TIMESTAMP":
                    return "TIMESTAMP";
                case "YEAR":
                    return "INTEGER";
                case "BIT":
                case "BOOLEAN":
                    return "BOOLEAN";
                default:
                    return "VARCHAR(255)";
            }
        }

        // H2 到 MySQL 的转换
        if (isMySQL) {
            switch (upperType) {
                case "TINYINT":
                    return "TINYINT";
                case "SMALLINT":
                    return "SMALLINT";
                case "INTEGER":
                case "INT":
                    return "INT";
                case "BIGINT":
                    return "BIGINT";
                case "FLOAT":
                    return "FLOAT";
                case "DOUBLE":
                case "DOUBLE PRECISION":
                    return "DOUBLE";
                case "DECIMAL":
                case "NUMERIC":
                    return decimalDigits > 0 ? String.format("DECIMAL(%d,%d)", columnSize, decimalDigits) : String.format("DECIMAL(%d)", columnSize);
                case "CHAR":
                    return String.format("CHAR(%d)", Math.min(columnSize, 255));
                case "VARCHAR":
                    return columnSize > 65535 ? "TEXT" : String.format("VARCHAR(%d)", columnSize);
                case "CLOB":
                case "TEXT":
                    return "TEXT";
                case "BLOB":
                    return "BLOB";
                case "DATE":
                    return "DATE";
                case "TIME":
                    return "TIME";
                case "TIMESTAMP":
                    return "DATETIME";
                case "BOOLEAN":
                case "BOOL":
                    return "TINYINT(1)";
                default:
                    return "VARCHAR(255)";
            }
        }

        // 默认返回原类型
        if (columnSize > 0 && needsSize(upperType)) {
            if (decimalDigits > 0) {
                return String.format("%s(%d,%d)", originalType, columnSize, decimalDigits);
            } else {
                return String.format("%s(%d)", originalType, columnSize);
            }
        }
        return originalType;
    }

    /**
     * 判断数据类型是否需要长度
     */
    private static boolean needsSize(String dataType) {
        String upperType = dataType.toUpperCase();
        return upperType.contains("CHAR") || upperType.contains("VARCHAR") ||
                upperType.contains("DECIMAL") || upperType.contains("NUMERIC");
    }

    /**
     * 判断是否为字符串类型
     */
    private static boolean isStringType(String dataType) {
        String upperType = dataType.toUpperCase();
        return upperType.contains("CHAR") || upperType.contains("VARCHAR") ||
                upperType.contains("TEXT") || upperType.contains("CLOB");
    }

    /**
     * 创建索引
     */
    private static void createIndexes(Connection conn, TableStructure structure, DatabaseConfig config) {
        for (Map.Entry<String, List<String>> entry : structure.indexes.entrySet()) {
            String indexName = entry.getKey();
            List<String> columns = entry.getValue();

            try {
                String sql = String.format("CREATE INDEX %s ON %s (%s)",
                        indexName, structure.tableName, String.join(", ", columns));
                log.debug("创建索引SQL: {}", sql);
                executeSql(conn, sql);
            } catch (SQLException e) {
                log.warn("创建索引 {} 失败: {}", indexName, e.getMessage());
            }
        }
    }

    /**
     * 双向数据迁移
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
                                          List<String> columns, List<List<Object>> data,
                                          TableStructure structure) throws SQLException {
        if (data.isEmpty()) {
            return;
        }

        // 找出自增列的索引
        Set<Integer> autoIncrementColumns = new HashSet<>();
        List<String> insertColumns = new ArrayList<>();
        List<Integer> insertColumnIndices = new ArrayList<>();

        for (int i = 0; i < columns.size(); i++) {
            String columnName = columns.get(i);
            boolean isAutoIncrement = false;

            // 检查是否为自增列
            for (ColumnInfo columnInfo : structure.columns) {
                if (columnInfo.columnName.equalsIgnoreCase(columnName) && columnInfo.autoIncrement) {
                    isAutoIncrement = true;
                    autoIncrementColumns.add(i);
                    break;
                }
            }

            // 非自增列才加入插入列表
            if (!isAutoIncrement) {
                insertColumns.add(columnName);
                insertColumnIndices.add(i);
            }
        }

        // 如果没有非自增列，说明表只有自增列，这种情况很少见
        if (insertColumns.isEmpty()) {
            log.warn("表 {} 只包含自增列，跳过数据插入", tableName);
            return;
        }

        // 构建INSERT SQL，只包含非自增列
        StringBuilder sql = new StringBuilder("INSERT INTO " + tableName + " (");
        sql.append(String.join(",", insertColumns)).append(") VALUES (");
        sql.append("?,".repeat(insertColumns.size()));
        sql.setLength(sql.length() - 1);
        sql.append(")");

        log.debug("修正后的插入SQL: {}", sql);

        try (PreparedStatement ps = targetConn.prepareStatement(sql.toString())) {
            int batchCount = 0;

            for (List<Object> row : data) {
                // 只设置非自增列的值
                for (int i = 0; i < insertColumnIndices.size(); i++) {
                    int originalIndex = insertColumnIndices.get(i);
                    Object value = row.get(originalIndex);
                    ps.setObject(i + 1, value);
                }
                ps.addBatch();
                batchCount++;

                if (batchCount >= BATCH_SIZE) {
                    ps.executeBatch();
                    ps.clearBatch();
                    batchCount = 0;
                    log.debug("已批量插入 {} 条记录", BATCH_SIZE);
                }
            }

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
     * 打印表结构信息（用于调试）
     */
    public static void printTableStructure(DatabaseConfig config, String tableName) throws Exception {
        try (Connection conn = getConnection(config)) {
            TableStructure structure = getCompleteTableStructure(conn, tableName, config);

            if (structure == null) {
                log.info("表 {} 不存在或无法获取结构", tableName);
                return;
            }

            log.info("=== 表结构信息: {} ===", tableName);
            log.info("列信息:");
            for (ColumnInfo column : structure.columns) {
                log.info("  {} {} {} {} {} {} {} {}",
                        column.columnName,
                        column.dataType,
                        column.columnSize > 0 ? "(" + column.columnSize + (column.decimalDigits > 0 ? "," + column.decimalDigits : "") + ")" : "",
                        column.nullable ? "NULL" : "NOT NULL",
                        column.autoIncrement ? "AUTO_INCREMENT" : "",
                        column.defaultValue != null ? "DEFAULT '" + column.defaultValue + "'" : "",
                        column.remarks != null ? "COMMENT '" + column.remarks + "'" : "",
                        ""
                );
            }

            if (!structure.primaryKeys.isEmpty()) {
                log.info("主键: {}", String.join(", ", structure.primaryKeys));
            }

            if (!structure.indexes.isEmpty()) {
                log.info("索引:");
                for (Map.Entry<String, List<String>> entry : structure.indexes.entrySet()) {
                    log.info("  {}: {}", entry.getKey(), String.join(", ", entry.getValue()));
                }
            }

            if (structure.engine != null) {
                log.info("引擎: {}", structure.engine);
            }

            if (structure.charset != null) {
                log.info("字符集: {}", structure.charset);
            }
        }
    }

    /**
     * 获取所有表名
     */
    public static List<String> getTableNames(DatabaseConfig config) throws Exception {
        List<String> tableNames = new ArrayList<>();

        try (Connection conn = getConnection(config)) {
            DatabaseMetaData metaData = conn.getMetaData();

            try (ResultSet tables = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (tables.next()) {
                    String tableName = tables.getString("TABLE_NAME");
                    // 过滤系统表
                    if (!isSystemTable(tableName)) {
                        tableNames.add(tableName);
                    }
                }
            }
        }

        return tableNames;
    }

    /**
     * 判断是否为系统表
     */
    private static boolean isSystemTable(String tableName) {
        if (tableName == null) {
            return true;
        }

        String upperName = tableName.toUpperCase();

        // MySQL系统表
        if (upperName.startsWith("INFORMATION_SCHEMA") ||
                upperName.startsWith("PERFORMANCE_SCHEMA") ||
                upperName.startsWith("SYS") ||
                upperName.startsWith("MYSQL")) {
            return true;
        }

        // H2系统表
        if (upperName.startsWith("INFORMATION_SCHEMA") ||
                upperName.startsWith("SYS") ||
                upperName.startsWith("SYSTEM_")) {
            return true;
        }

        return false;
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
