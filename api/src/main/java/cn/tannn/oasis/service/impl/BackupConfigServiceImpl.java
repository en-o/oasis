package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.dao.BackupConfigDao;
import cn.tannn.oasis.entity.BackupConfig;
import cn.tannn.oasis.service.BackupConfigService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 数据备份配置
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/26 15:30
 */
@Service
public class BackupConfigServiceImpl extends J2ServiceImpl<BackupConfigDao, BackupConfig, Integer> implements BackupConfigService {

    public BackupConfigServiceImpl() {
        super(BackupConfig.class);
    }

    @Override
    public BackupConfig getConfig() {
        List<BackupConfig> configs = getJpaBasicsDao().findAll();
        if (configs.isEmpty()) {
            return null;
        }
        // 返回第一个配置，如果需要多个配置，可以根据业务需求修改
        return configs.get(0);
    }

    @Override
    public void saveOrUpdate(BackupConfig config) {
        // 新增时，先检查是否已存在配置
        BackupConfig existConfig = getConfig();
        if (existConfig != null) {
            // 如果已存在，更新现有配置
            config.setId(existConfig.getId());
        }
        getJpaBasicsDao().save(config);
    }

    @Override
    public BackupConfig getEnabledConfig() {
        List<BackupConfig> configs = getJpaBasicsDao().findAll();
        return configs.stream()
                .filter(config -> Boolean.TRUE.equals(config.getEnabled()))
                .findFirst()
                .orElse(null);
    }
}
