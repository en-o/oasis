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
import org.springframework.transaction.annotation.Transactional;

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
            throw new BusinessException("路由路径不能使用保留路径，保留路径包括: "
                    + SitePublish.getReservedPathsDescription());
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
            throw new BusinessException("路由路径不能使用保留路径，保留路径包括: "
                    + SitePublish.getReservedPathsDescription());
        }

        // 检查路由路径是否被其他配置占用
        if (!entity.getRoutePath().equals(edit.getRoutePath())
                && routePathExists(edit.getRoutePath(), edit.getId())) {
            throw new BusinessException("路由路径已被其他配置占用");
        }

        // 如果是默认页，不允许禁用
        if (entity.getDefPage() && !edit.getEnabled()) {
            throw new BusinessException("默认页不允许禁用，请先设置其他页面为默认页");
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefaultPage(Integer id) {
        // 查询目标配置
        SitePublish target = getJpaBasicsDao().findById(id)
                .orElseThrow(() -> new BusinessException("站点发布配置不存在"));

        // 如果目标配置未启用，不允许设为默认
        if (!target.getEnabled()) {
            throw new BusinessException("禁用的页面不能设置为默认页，请先启用该页面");
        }

        // 查询所有当前的默认页
        List<SitePublish> currentDefaults = getJpaBasicsDao().findAllByDefPageTrue();

        // 将所有默认页设为非默认
        for (SitePublish defPage : currentDefaults) {
            if (!defPage.getId().equals(id)) {
                defPage.setDefPage(false);
                getJpaBasicsDao().save(defPage);
                log.info("将站点 [{}] 设置为非默认页", defPage.getName());
            }
        }

        // 设置目标配置为默认页
        target.setDefPage(true);
        getJpaBasicsDao().save(target);
        log.info("将站点 [{}] 设置为默认页", target.getName());
    }

    @Override
    public SitePublish getDefaultPage() {
        return getJpaBasicsDao().findByDefPageTrue().orElse(null);
    }
}
