package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.entity.Navigation;

/**
 * 导航项表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
public interface NavigationService extends J2Service<Navigation> {
    /**
     * 分类是否被使用
     * @param category 分类
     * @return true存在 false不存在
     */
    boolean categoryUse(String category);
}
