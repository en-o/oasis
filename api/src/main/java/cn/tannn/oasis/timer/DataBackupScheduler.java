package cn.tannn.oasis.timer;

import cn.tannn.oasis.entity.BackupConfig;
import cn.tannn.oasis.utils.DatabaseConfig;
import cn.tannn.oasis.utils.DbTransferUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class DataBackupScheduler {

    private ScheduledExecutorService executor;
    private ScheduledFuture<?> scheduledFuture;
    private BackupConfig currentConfig;
    private volatile boolean isRunning = false;

    /**
     * 需要备份的表名列表
     */
    public static final String[] BACKUP_TABLES = {
            "nav_category",
            "nav_item",
            "backup_config",
            "system_config"
    };

    /**
     * 启动定时备份任务
     * @param config 备份配置
     * @param h2Config H2数据库配置
     */
    public synchronized void start(BackupConfig config, DatabaseConfig h2Config) {
        // 先停止现有任务
        stop();

        if (config == null || !Boolean.TRUE.equals(config.getEnabled()) ||
                config.getSchedule() == null || config.getSchedule().trim().isEmpty()) {
            log.warn("未启用定时备份或定时参数为空");
            return;
        }

        this.currentConfig = config;
        this.executor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "DataBackupScheduler");
            t.setDaemon(true);
            return t;
        });

        // 判断 schedule 是否为 cron 表达式还是秒数
        if (isCronExpression(config.getSchedule())) {
            startWithCron(config, h2Config);
        } else {
            startWithFixedRate(config, h2Config);
        }

        this.isRunning = true;
        log.info("定时备份任务已启动，配置: {}", config.getSchedule());
    }

    /**
     * 使用固定频率启动（兼容旧版本，schedule 为秒数）
     */
    private void startWithFixedRate(BackupConfig config, DatabaseConfig h2Config) {
        try {
            long intervalSeconds = Long.parseLong(config.getSchedule());
            DatabaseConfig mysqlConfig = DatabaseConfig.createMysqlConfig(config);

            this.scheduledFuture = executor.scheduleAtFixedRate(
                    () -> executeBackup(h2Config, mysqlConfig),
                    0,
                    intervalSeconds,
                    TimeUnit.SECONDS
            );

            log.info("使用固定频率模式，间隔: {} 秒", intervalSeconds);
        } catch (NumberFormatException e) {
            log.error("无效的时间间隔配置: {}", config.getSchedule(), e);
            throw new IllegalArgumentException("时间间隔必须是数字或有效的cron表达式");
        }
    }

    /**
     * 使用 Cron 表达式启动
     */
    private void startWithCron(BackupConfig config, DatabaseConfig h2Config) {
        try {
            CronExpression cronExpression = CronExpression.parse(config.getSchedule());
            DatabaseConfig mysqlConfig = DatabaseConfig.createMysqlConfig(config);

            // 计算下次执行时间
            scheduleNextExecution(cronExpression, h2Config, mysqlConfig);
            log.info("使用Cron表达式模式: {}", config.getSchedule());

        } catch (Exception e) {
            log.error("无效的Cron表达式: {}", config.getSchedule(), e);
            throw new IllegalArgumentException("无效的Cron表达式: " + config.getSchedule());
        }
    }

    /**
     * 递归调度下次执行
     */
    private void scheduleNextExecution(CronExpression cronExpression,
                                       DatabaseConfig h2Config,
                                       DatabaseConfig mysqlConfig) {
        if (executor.isShutdown()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextExecution = cronExpression.next(now);

        if (nextExecution != null) {
            long delayMillis = nextExecution.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    - now.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            this.scheduledFuture = executor.schedule(() -> {
                executeBackup(h2Config, mysqlConfig);
                // 调度下次执行
                scheduleNextExecution(cronExpression, h2Config, mysqlConfig);
            }, delayMillis, TimeUnit.MILLISECONDS);

            log.debug("下次备份时间: {}", nextExecution);
        }
    }

    /**
     * 执行备份任务
     */
    private void executeBackup(DatabaseConfig h2Config, DatabaseConfig mysqlConfig) {
        try {
            log.info("开始执行数据备份...");
            long startTime = System.currentTimeMillis();

            for (String tableName : BACKUP_TABLES) {
                try {
                    DbTransferUtil.transferTable(h2Config, mysqlConfig, tableName);
                    log.debug("表 {} 备份完成", tableName);
                } catch (Exception e) {
                    log.error("表 {} 备份失败", tableName, e);
                }
            }

            long costTime = System.currentTimeMillis() - startTime;
            log.info("定时备份完成，耗时: {} ms", costTime);

        } catch (Exception e) {
            log.error("定时备份失败", e);
        }
    }

    /**
     * 停止定时备份任务
     */
    public synchronized void stop() {
        if (scheduledFuture != null) {
            scheduledFuture.cancel(false);
            scheduledFuture = null;
        }

        if (executor != null) {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
            executor = null;
        }

        this.isRunning = false;
        this.currentConfig = null;
        log.info("定时备份任务已停止");
    }

    /**
     * 检查任务是否正在运行
     */
    public boolean isRunning() {
        return isRunning && scheduledFuture != null && !scheduledFuture.isCancelled();
    }

    /**
     * 获取当前配置
     */
    public BackupConfig getCurrentConfig() {
        return currentConfig;
    }

    /**
     * 立即执行一次备份（不影响定时任务）
     */
    public void executeOnce(BackupConfig config, DatabaseConfig h2Config) {
        if (config == null) {
            throw new IllegalArgumentException("备份配置不能为空");
        }

        DatabaseConfig mysqlConfig = DatabaseConfig.createMysqlConfig(config);

        // 使用独立的线程执行
        Thread backupThread = new Thread(() -> executeBackup(h2Config, mysqlConfig), "ManualBackup");
        backupThread.setDaemon(true);
        backupThread.start();
    }



    /**
     * 判断是否为 Cron 表达式
     * 简单判断：包含空格且有多个字段的可能是cron表达式
     */
    private boolean isCronExpression(String schedule) {
        if (schedule == null || schedule.trim().isEmpty()) {
            return false;
        }

        // 如果是纯数字，认为是秒数
        try {
            Long.parseLong(schedule.trim());
            return false;
        } catch (NumberFormatException e) {
            // 不是数字，可能是cron表达式
        }

        // cron表达式通常包含空格分隔的字段
        String[] parts = schedule.trim().split("\\s+");
        return parts.length >= 5; // 至少5个字段（秒 分 时 日 月）
    }
}
