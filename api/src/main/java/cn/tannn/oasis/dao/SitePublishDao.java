package cn.tannn.oasis.dao;

import cn.tannn.jdevelops.jpa.repository.JpaBasicsRepository;
import cn.tannn.oasis.entity.SitePublish;

import java.util.List;
import java.util.Optional;

/**
 * 站点发布配置 DAO
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-12-02
 */
public interface SitePublishDao extends JpaBasicsRepository<SitePublish, Integer> {

    /**
     * 根据路由路径查询
     *
     * @param routePath 路由路径
     * @return 站点发布配置
     */
    Optional<SitePublish> findByRoutePath(String routePath);

    /**
     * 查询所有启用的配置
     *
     * @return 启用的配置列表
     */
    List<SitePublish> findByEnabledTrueOrderBySortAsc();

    /**
     * 查询路由路径是否存在
     *
     * @param routePath 路由路径
     * @return 是否存在
     */
    boolean existsByRoutePath(String routePath);

    /**
     * 查询默认页
     *
     * @return 默认页配置
     */
    Optional<SitePublish> findByDefPageTrue();

    /**
     * 查询所有默认页（用于确保只有一个默认页）
     *
     * @return 默认页列表
     */
    List<SitePublish> findAllByDefPageTrue();
}
