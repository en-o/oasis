package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.authentication.ApiMapping;
import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.request.Sorteds;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.jpa.select.EnhanceSpecification;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.config.DefaultSysConfig;
import cn.tannn.oasis.controller.dto.NavigationPage;
import cn.tannn.oasis.controller.dto.NavigationSitePage;
import cn.tannn.oasis.controller.vo.NavAccessInfo;
import cn.tannn.oasis.controller.vo.NavigationVO;
import cn.tannn.oasis.controller.vo.SiteInfo;
import cn.tannn.oasis.entity.NavCategory;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.entity.SitePublish;
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.NavCategoryService;
import cn.tannn.oasis.service.NavigationService;
import cn.tannn.oasis.service.SitePublishService;
import cn.tannn.oasis.service.SysConfigsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * 前端接口
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/27 16:19
 */
@PathRestController("webs")
@Slf4j
@Tag(name = "导航主页")
@RequiredArgsConstructor
public class WebController {

    private final NavigationService navigationService;
    private final SysConfigsService sysConfigsService;
    private final DefaultSysConfig defaultSysConfig;
    private final NavCategoryService navCategoryService;
    private final SitePublishService sitePublishService;


    @ApiMapping(value = "/site", checkToken = false, method = RequestMethod.GET)
    @Operation(summary = "站点信息", description = "获取站点配置信息，支持根据 routePath 覆盖配置")
    public ResultVO<SiteInfo> siteInfo(
            @Parameter(description = "路由路径，如：dev、cp（可选，为空则返回默认配置）")
            @RequestParam(value = "routePath", required = false) String routePath) {

        // 获取默认系统配置
        SysConfigs sysConfig = sysConfigsService.findOnly("configKey", "MAIN")
                .orElse(SysConfigs.newInstance(defaultSysConfig));
        SiteInfo siteInfo = SiteInfo.to(sysConfig);

        // 如果提供了 routePath，尝试获取 SitePublish 配置并覆盖
        if (StringUtils.hasText(routePath)) {
            try {
                SitePublish sitePublish = sitePublishService.getByRoutePath(routePath);
                if (sitePublish != null && sitePublish.getEnabled()) {
                    // 使用 SitePublish 的 hideAdminEntry 覆盖系统配置
                    siteInfo.setHideAdminEntry(sitePublish.getHideAdminEntry() ? 1 : 0);
                    log.debug("使用 SitePublish 配置覆盖 hideAdminEntry: routePath={}, hideAdminEntry={}",
                            routePath, sitePublish.getHideAdminEntry());
                }
            } catch (Exception e) {
                log.warn("查询 SitePublish 配置失败: routePath={}, error={}", routePath, e.getMessage());
            }
        }

        return ResultVO.success(siteInfo);
    }

    @Operation(summary = "获取网站集合-分页", description = "支持根据 showPlatform 过滤发布页面")
    @ApiMapping(value = "navs", checkToken = false, method = RequestMethod.POST)
    public ResultPageVO<NavigationVO, JpaPageResult<NavigationVO>> navsPage(
            @RequestBody @Valid NavigationSitePage page) {

        // 提取 showPlatform 参数作为过滤条件，然后移除自动 LIKE 查询
        String routePath = page.getShowPlatform();

        Specification<Navigation> beanWhere = EnhanceSpecification.beanWhere(page, x -> {
            x.eq(true, "status", 1);
            x.isNull("showPlatform").or( or -> {
                or.likes(StringUtils.hasText(routePath), "showPlatform", routePath);
            });
        });

        Page<Navigation> byBean = navigationService.findPage(beanWhere, page.getPage().pageable());

        // 转换为 VO
        List<NavigationVO> voList = byBean.getContent().stream()
                .map(nav -> {
                    NavigationVO vo = new NavigationVO();
                    vo.setId(nav.getId());
                    vo.setName(nav.getName());
                    vo.setUrl(nav.getUrl());
                    vo.setSort(nav.getSort());
                    vo.setCategory(nav.getCategory());
                    vo.setIcon(nav.getIcon());
                    vo.setRemark(nav.getRemark());
                    vo.setLookAccount(nav.getLookAccount());
                    vo.setStatus(nav.getStatus());
                    // 设置是否有账户信息，但不暴露具体内容
                    vo.setHasAccount(nav.getAccount() != null && !nav.getAccount().trim().isEmpty() &&
                                     nav.getPassword() != null && !nav.getPassword().trim().isEmpty());
                    return vo;
                }).toList();

        JpaPageResult<NavigationVO> pageResult = new JpaPageResult<>();
        pageResult.setCurrentPage(byBean.getNumber() + 1);
        pageResult.setPageSize(byBean.getSize());
        pageResult.setTotalPages(byBean.getTotalPages());
        pageResult.setTotal(byBean.getTotalElements()); // 使用数据库查询的总数
        pageResult.setRows(voList);

        return ResultPageVO.success(pageResult, "查询成功");
    }

    @Operation(summary = "获取网站登录信息")
    @ApiMapping(value = "navs/access/{id}", checkToken = false, method = RequestMethod.GET)
    public ResultVO<NavAccessInfo> navsAccess(
            @PathVariable("id") Integer id,
            @RequestParam(value = "nvaAccessSecret", required = false) String nvaAccessSecret) {
        Navigation navigation = navigationService.getJpaBasicsDao().findById(id)
                .orElseThrow(() -> new IllegalArgumentException("请确定数据存不存在！"));
        if (navigation.getLookAccount()) {
            return ResultVO.success(new NavAccessInfo(navigation));
        } else if (navigation.getNvaAccessSecret().equals(nvaAccessSecret)) {
            return ResultVO.success(new NavAccessInfo(navigation));
        } else {
            return ResultVO.failMessage("密钥错误，无法查看");
        }
    }

    @Operation(summary = "网站分类")
    @ApiMapping(value = "category", checkToken = false, method = RequestMethod.GET)
    public ResultVO<List<NavCategory>> category() {
        Sorteds defs = Sorteds.defs();
        defs.fixSort(0, "sort");
        List<NavCategory> finds = navCategoryService.finds(defs);
        return ResultVO.success(finds);
    }
}
