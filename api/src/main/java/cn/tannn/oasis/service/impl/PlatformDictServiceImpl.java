package cn.tannn.oasis.service.impl;

import cn.tannn.oasis.dao.PlatformDictDao;
import cn.tannn.oasis.entity.PlatformDict;
import cn.tannn.oasis.service.PlatformDictService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 平台字典 Service 实现
 *
 * @author tan
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PlatformDictServiceImpl implements PlatformDictService {

    private final PlatformDictDao platformDictDao;

    @Override
    public List<PlatformDict> listAll() {
        return platformDictDao.findAllByOrderBySortAsc();
    }

    @Override
    public List<PlatformDict> listEnabled() {
        return platformDictDao.findByEnabledTrueOrderBySortAsc();
    }

    @Override
    public PlatformDict getByRoutePath(String routePath) {
        return platformDictDao.findByRoutePath(routePath).orElse(null);
    }

    @Override
    public PlatformDict getById(Integer id) {
        return platformDictDao.findById(id).orElse(null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(PlatformDict platformDict) {
        // 验证路由路径
        validateRoutePath(platformDict.getRoutePath(), null);

        // 设置默认值
        if (platformDict.getEnabled() == null) {
            platformDict.setEnabled(true);
        }
        if (platformDict.getSort() == null) {
            platformDict.setSort(1);
        }

        platformDictDao.save(platformDict);
        log.info("新增平台字典成功: {}", platformDict.getRoutePath());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(PlatformDict platformDict) {
        // 检查是否存在
        PlatformDict existing = getById(platformDict.getId());
        if (existing == null) {
            throw new IllegalArgumentException("平台字典不存在: " + platformDict.getId());
        }

        // 验证路由路径
        validateRoutePath(platformDict.getRoutePath(), platformDict.getId());

        platformDictDao.save(platformDict);
        log.info("更新平台字典成功: {}", platformDict.getRoutePath());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Integer id) {
        PlatformDict existing = getById(id);
        if (existing == null) {
            throw new IllegalArgumentException("平台字典不存在: " + id);
        }

        platformDictDao.deleteById(id);
        log.info("删除平台字典成功: {}", existing.getRoutePath());
    }

    @Override
    public boolean existsByRoutePath(String routePath, Integer excludeId) {
        PlatformDict existing = getByRoutePath(routePath);
        if (existing == null) {
            return false;
        }
        // 如果有排除ID，且找到的记录ID等于排除ID，则不算重复
        return excludeId == null || !existing.getId().equals(excludeId);
    }

    /**
     * 验证路由路径
     */
    private void validateRoutePath(String routePath, Integer excludeId) {
        if (routePath == null || routePath.trim().isEmpty()) {
            throw new IllegalArgumentException("路由路径不能为空");
        }

        // 移除前缀斜杠
        String cleanPath = routePath.trim();
        if (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }

        // 检查是否为保留路径
        if (PlatformDict.isReservedPath(cleanPath)) {
            throw new IllegalArgumentException("路由路径不能使用保留路径: admin 或 / (根路径)");
        }

        // 检查格式
        if (!PlatformDict.isValidRoutePath(cleanPath)) {
            throw new IllegalArgumentException("路由路径格式错误，只能包含字母、数字、横杠和下划线");
        }

        // 检查重复
        if (existsByRoutePath(cleanPath, excludeId)) {
            throw new IllegalArgumentException("路由路径已存在: " + cleanPath);
        }
    }
}
