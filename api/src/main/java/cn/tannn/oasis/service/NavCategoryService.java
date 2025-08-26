package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.controller.dto.NavCategoryAdd;
import cn.tannn.oasis.entity.NavCategory;
import jakarta.validation.Valid;

/**
 * 导航分类表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
public interface NavCategoryService extends J2Service<NavCategory> {
    /**
     * 分类是否存在
     * @param category 分类
     * @return true存在 false不存在
     */
    boolean categoryExists(String category);

    /**
     * 创建导航分类
     * @param append NavCategoryAdd
     */
    void create(@Valid NavCategoryAdd append);
}
