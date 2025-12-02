package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.exception.built.BusinessException;
import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.controller.dto.SitePublishAdd;
import cn.tannn.oasis.controller.dto.SitePublishEdit;
import cn.tannn.oasis.dao.SitePublishDao;
import cn.tannn.oasis.entity.SitePublish;
import cn.tannn.oasis.service.SitePublishService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 站点发布配置 ServiceImpl
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-12-02
 */
@Slf4j
@Service
public class SitePublishServiceImpl extends J2ServiceImpl<SitePublishDao, SitePublish, Integer> implements SitePublishService {

    public SitePublishServiceImpl() {
        super(SitePublish.class);
    }

    @Override
    public void create(SitePublishAdd add) {
        // 验证路由路径
        if (SitePublish.isReservedPath(add.getRoutePath())) {
            throw new BusinessException("路由路径不能使用保留路径: admin 或 / (根路径)");
        }

        if (routePathExists(add.getRoutePath())) {
            throw new BusinessException("路由路径已存在，请勿重复添加");
        }

        SitePublish entity = add.to(SitePublish.class);
        getJpaBasicsDao().save(entity);
    }

    @Override
    public void update(SitePublishEdit edit) {
        SitePublish entity = getJpaBasicsDao().findById(edit.getId())
                .orElseThrow(() -> new BusinessException("站点发布配置不存在"));

        // 验证路由路径
        if (SitePublish.isReservedPath(edit.getRoutePath())) {
            throw new BusinessException("路由路径不能使用保留路径: admin 或 / (根路径)");
        }

        // 检查路由路径是否被其他配置占用
        if (!entity.getRoutePath().equals(edit.getRoutePath())
                && routePathExists(edit.getRoutePath(), edit.getId())) {
            throw new BusinessException("路由路径已被其他配置占用");
        }

        entity.setName(edit.getName());
        entity.setRoutePath(edit.getRoutePath());
        entity.setHideAdminEntry(edit.getHideAdminEntry());
        entity.setEnabled(edit.getEnabled());
        entity.setSort(edit.getSort());
        entity.setDescription(edit.getDescription());

        getJpaBasicsDao().save(entity);
    }

    @Override
    public SitePublish getByRoutePath(String routePath) {
        return getJpaBasicsDao().findByRoutePath(routePath)
                .orElse(null);
    }

    @Override
    public List<SitePublish> listEnabled() {
        return getJpaBasicsDao().findByEnabledTrueOrderBySortAsc();
    }

    @Override
    public boolean routePathExists(String routePath) {
        return getJpaBasicsDao().existsByRoutePath(routePath);
    }

    @Override
    public boolean routePathExists(String routePath, Integer excludeId) {
        return getJpaBasicsDao().findByRoutePath(routePath)
                .map(entity -> !entity.getId().equals(excludeId))
                .orElse(false);
    }
}
