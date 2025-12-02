package cn.tannn.oasis.service;

import cn.tannn.oasis.entity.PlatformDict;

import java.util.List;

/**
 * 平台字典 Service
 *
 * @author tan
 */
public interface PlatformDictService {

    /**
     * 获取所有平台字典（按排序）
     */
    List<PlatformDict> listAll();

    /**
     * 获取所有启用的平台字典（按排序）
     */
    List<PlatformDict> listEnabled();

    /**
     * 根据路由路径查询
     */
    PlatformDict getByRoutePath(String routePath);

    /**
     * 根据ID查询
     */
    PlatformDict getById(Integer id);

    /**
     * 新增平台字典
     */
    void add(PlatformDict platformDict);

    /**
     * 更新平台字典
     */
    void update(PlatformDict platformDict);

    /**
     * 删除平台字典
     */
    void delete(Integer id);

    /**
     * 检查路由路径是否已存在（排除指定ID）
     */
    boolean existsByRoutePath(String routePath, Integer excludeId);
}
