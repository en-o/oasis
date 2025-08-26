package cn.tannn.oasis.dao;

import cn.tannn.jdevelops.jpa.repository.JpaBasicsRepository;
import cn.tannn.oasis.entity.NavCategory;

/**
 * 导航分类表
 *
 * @author tan
 * @date 2025-08-26
 */
public interface NavCategoryDao extends JpaBasicsRepository<NavCategory, Integer> {

    /**
     * 是否存在该分类
     * @param category category
     * @return true存在,false不存在
     */
    boolean existsByCategoryName(String category);
}
