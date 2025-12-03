package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.controller.dto.SitePublishAdd;
import cn.tannn.oasis.controller.dto.SitePublishEdit;
import cn.tannn.oasis.entity.SitePublish;
import jakarta.validation.Valid;

import java.util.List;

/**
 * 站点发布配置 Service
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-12-02
 */
public interface SitePublishService extends J2Service<SitePublish> {

    /**
     * 创建站点发布配置
     *
     * @param add 新增参数
     */
    void create(@Valid SitePublishAdd add);

    /**
     * 更新站点发布配置
     *
     * @param edit 编辑参数
     */
    void update(@Valid SitePublishEdit edit);

    /**
     * 根据路由路径查询配置
     *
     * @param routePath 路由路径
     * @return 站点发布配置
     */
    SitePublish getByRoutePath(String routePath);

    /**
     * 查询所有启用的配置
     *
     * @return 启用的配置列表
     */
    List<SitePublish> listEnabled();

    /**
     * 路由路径是否存在
     *
     * @param routePath 路由路径
     * @return 是否存在
     */
    boolean routePathExists(String routePath);

    /**
     * 路由路径是否存在（排除指定ID）
     *
     * @param routePath 路由路径
     * @param excludeId 排除的ID
     * @return 是否存在
     */
    boolean routePathExists(String routePath, Integer excludeId);

    /**
     * 设置默认页（确保只有一个默认页）
     *
     * @param id 站点发布配置ID
     */
    void setDefaultPage(Integer id);

    /**
     * 获取默认页
     *
     * @return 默认页配置，如果不存在则返回 null
     */
    SitePublish getDefaultPage();
}
