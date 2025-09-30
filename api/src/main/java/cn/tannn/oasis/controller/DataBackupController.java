package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.BackupConfigAdd;
import cn.tannn.oasis.entity.BackupConfig;
import cn.tannn.oasis.service.BackupConfigService;
import cn.tannn.oasis.timer.DataBackupScheduler;
import cn.tannn.oasis.utils.DatabaseConfig;
import cn.tannn.oasis.utils.DbTransferUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static cn.tannn.oasis.timer.DataBackupScheduler.BACKUP_TABLES;

/**
 * 数据备份管理
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/26 15:14
 */
@PathRestController("data")
@Slf4j
@Tag(name = "数据管理")
@RequiredArgsConstructor
public class DataBackupController {

    private final BackupConfigService backupConfigService;
    private final DataBackupScheduler scheduler;
    @Autowired
    private ConfigurableEnvironment environment;


    @Operation(summary = "保存备份配置")
    @PostMapping("/config")
    public ResultVO<String> saveConfig(@Valid @RequestBody BackupConfigAdd config) {
        try {
            BackupConfig backupConfig = config.to(BackupConfig.class);
            backupConfig.setDriverClassName("com.mysql.cj.jdbc.Driver");
            backupConfigService.saveOrUpdate(backupConfig);
            if(backupConfig.getEnabled()){
                log.warn("启用新的备份配置，重启定时任务");
                stop();
                start();
            }
            log.info("备份配置保存成功: {}", config.getUrl());
            return ResultVO.successMessage("配置保存成功");
        } catch (Exception e) {
            log.error("保存备份配置失败", e);
            return ResultVO.failMessage("配置保存失败: " + e.getMessage());
        }
    }

    @Operation(summary = "获取备份配置", description = "如果没看就表示没有设置需要进行配置")
    @GetMapping("/config")
    public ResultVO<BackupConfig> getConfig() {
        try {
            BackupConfig config = backupConfigService.getConfig();
            return ResultVO.success(config);
        } catch (Exception e) {
            log.error("获取备份配置失败", e);
            return ResultVO.failMessage("获取配置失败: " + e.getMessage());
        }
    }

    @Operation(summary = "启动定时备份")
    @PostMapping("/start")
    public ResultVO<String> start() {
        try {
            BackupConfig config = backupConfigService.getEnabledConfig();
            if (config == null) {
                return ResultVO.failMessage("未找到启用的备份配置");
            }

            scheduler.start(config, DatabaseConfig.fromEnvironmentH2(environment));
            log.info("定时备份任务启动成功");
            return ResultVO.success("定时备份已启动");
        } catch (Exception e) {
            log.error("启动定时备份失败", e);
            return ResultVO.failMessage("启动失败: " + e.getMessage());
        }
    }

    @Operation(summary = "停止定时备份")
    @PostMapping("/stop")
    public ResultVO<String> stop() {
        try {
            scheduler.stop();
            BackupConfig config = backupConfigService.getEnabledConfig();
            config.setEnabled(false);
            backupConfigService.saveOrUpdate(config);
            log.info("定时备份任务停止成功");
            return ResultVO.success("定时备份已停止");
        } catch (Exception e) {
            log.error("停止定时备份失败", e);
            return ResultVO.failMessage("停止失败: " + e.getMessage());
        }
    }

    @Operation(summary = "立即执行一次备份")
    @PostMapping("/execute")
    public ResultVO<String> executeOnce() {
        try {
            BackupConfig config = backupConfigService.getConfig();
            if (config == null) {
                return ResultVO.failMessage("未找到备份配置");
            }

            scheduler.executeOnce(config, DatabaseConfig.fromEnvironmentH2(environment));
            log.info("手动备份任务已提交执行");
            return ResultVO.success("备份任务已开始执行");
        } catch (Exception e) {
            log.error("执行备份失败", e);
            return ResultVO.failMessage("执行失败: " + e.getMessage());
        }
    }

    @Operation(summary = "获取备份状态")
    @GetMapping("/status")
    public ResultVO<Map<String, Object>> status() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("isRunning", scheduler.isRunning());
            status.put("currentTime", LocalDateTime.now());

            BackupConfig currentConfig = scheduler.getCurrentConfig();
            if (currentConfig != null) {
                status.put("schedule", currentConfig.getSchedule());
                status.put("targetUrl", maskPassword(currentConfig.getUrl()));
            }

            return ResultVO.success(status);
        } catch (Exception e) {
            log.error("获取备份状态失败", e);
            return ResultVO.failMessage("获取状态失败: " + e.getMessage());
        }
    }

    @Operation(summary = "测试数据库连接")
    @PostMapping("/test-connection")
    public ResultVO<String> testConnection(@Valid @RequestBody DatabaseConfig config) {
        try {
            // 连接测试
            if (DbTransferUtil.testConnection(config)) {
                log.info("数据库连接测试成功: {}", maskPassword(config.getUrl()));
                return ResultVO.successMessage("数据库连接测试成功");
            } else {
                log.error("数据库连接测试失败: {}", maskPassword(config.getUrl()));
                return ResultVO.failMessage("数据库连接测试失败");
            }
        } catch (Exception e) {
            log.error("数据库连接测试失败: {}", maskPassword(config.getUrl()), e);
            return ResultVO.failMessage("连接测试失败: " + e.getMessage());
        }
    }

    @Operation(summary = "验证Cron表达式")
    @GetMapping("/validate-cron")
    public ResultVO<String> validateCron(@RequestParam String cronExpression) {
        try {
            org.springframework.scheduling.support.CronExpression.parse(cronExpression);
            return ResultVO.success("Cron表达式格式正确");
        } catch (Exception e) {
            return ResultVO.failMessage("Cron表达式格式错误: " + e.getMessage());
        }
    }


    @Operation(summary = "从MySQL恢复数据到H2")
    @PostMapping("/restore")
    public ResultVO<String> restoreFromMysql() {
        try {
            BackupConfig config = backupConfigService.getConfig();
            if (config == null) {
                return ResultVO.failMessage("未找到备份配置");
            }
            for (String tableName : BACKUP_TABLES) {
                try {
                    // 从MySQL恢复到H2（方向相反）
                    DbTransferUtil.transferTable(DatabaseConfig.createMysqlConfig(config), DatabaseConfig.fromEnvironmentH2(environment), tableName);
                    log.debug("表 {} 备份完成", tableName);
                } catch (Exception e) {
                    log.error("表 {} 备份失败", tableName, e);
                }
            }
            log.info("MySQL数据恢复任务已提交执行");
            return ResultVO.success("数据恢复任务完成");
        } catch (Exception e) {
            log.error("执行数据恢复失败", e);
            return ResultVO.failMessage("恢复失败: " + e.getMessage());
        }
    }


    /**
     * 掩盖密码信息用于日志输出
     */
    private String maskPassword(String url) {
        if (url == null) return null;
        // 简单的密码掩盖逻辑，可以根据需要完善
        return url.replaceAll("password=([^&;]+)", "password=****");
    }
}
