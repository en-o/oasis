package cn.tannn.oasis.dao;

import cn.tannn.jdevelops.jpa.repository.JpaBasicsRepository;
import cn.tannn.oasis.entity.Navigation;

import java.util.List;

/**
 * 导航项表
 *
 * @author tan
 * @date 2025-08-26
 */
public interface NavigationDao extends JpaBasicsRepository<Navigation, Integer> {
    /**
     * 根据分类查询是否存在
     *
     * @param category 分类
     * @return 是否存在
     */
    boolean existsByCategory(String category);

    /**
     * 根据名称查询是否存在
     * @param name name
     * @return true存在 false不存在
     */
    boolean existsByName(String name);

    /**
     * 根据平台类型和状态查询导航列表
     * @param showPlatform 平台类型
     * @param status 状态（1:启用）
     * @return 导航列表
     */
    List<Navigation> findByShowPlatformAndStatusOrderBySortAsc(Integer showPlatform, Integer status);
}
