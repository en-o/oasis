package cn.tannn.oasis.dao;

import cn.tannn.oasis.entity.PlatformDict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

/**
 * 平台字典 DAO
 *
 * @author tan
 */
public interface PlatformDictDao extends JpaRepository<PlatformDict, Integer>, JpaSpecificationExecutor<PlatformDict> {

    /**
     * 根据路由路径查询
     */
    Optional<PlatformDict> findByRoutePath(String routePath);

    /**
     * 根据路由路径列表查询
     */
    List<PlatformDict> findByRoutePathIn(List<String> routePaths);

    /**
     * 查询所有启用的平台
     */
    List<PlatformDict> findByEnabledTrueOrderBySortAsc();

    /**
     * 查询所有平台（按排序）
     */
    List<PlatformDict> findAllByOrderBySortAsc();

    /**
     * 检查路由路径是否存在
     */
    boolean existsByRoutePath(String routePath);
}
