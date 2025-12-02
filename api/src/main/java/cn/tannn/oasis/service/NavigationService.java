package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.controller.dto.NavigationAdd;
import cn.tannn.oasis.entity.Navigation;
import jakarta.validation.Valid;

import java.util.List;

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

    /**
     * 新增导航项
     * @param append NavigationAdd
     */
    void create(@Valid NavigationAdd append);

    /**
     * 根据平台类型获取导航列表
     * @param showPlatform 平台类型
     * @return 导航列表
     */
    List<Navigation> findByShowPlatform(Integer showPlatform);
}
