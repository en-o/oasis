package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.entity.BackupConfig;

/**
 * 数据备份配置
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/26 15:30
 */
public interface BackupConfigService extends J2Service<BackupConfig> {

    /**
     * 获取备份配置（获取第一个配置）
     * @return 备份配置
     */
    BackupConfig getConfig();

    /**
     * 保存或更新备份配置
     * @param config 备份配置
     */
    void saveOrUpdate(BackupConfig config);

    /**
     * 获取启用的备份配置
     * @return 启用的备份配置
     */
    BackupConfig getEnabledConfig();
}
