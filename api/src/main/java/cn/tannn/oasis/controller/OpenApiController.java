package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.authentication.ApiMapping;
import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.request.Sorteds;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.jpa.select.EnhanceSpecification;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.config.OpenApiRegistry;
import cn.tannn.oasis.controller.dto.NavCategoryAdd;
import cn.tannn.oasis.controller.dto.NavigationAdd;
import cn.tannn.oasis.controller.dto.NavigationEdit;
import cn.tannn.oasis.controller.dto.NavigationPage;
import cn.tannn.oasis.entity.ApiKey;
import cn.tannn.oasis.entity.NavCategory;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.entity.SitePublish;
import cn.tannn.oasis.service.ApiKeyService;
import cn.tannn.oasis.service.NavCategoryService;
import cn.tannn.oasis.service.NavigationService;
import cn.tannn.oasis.service.SitePublishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

/**
 * 开放API - 第三方调用接口
 * 所有接口不需要JWT认证，通过openApiKey进行认证
 *
 * @author tan
 * @date 2025-02-05
 */
@PathRestController("openapi")
@Slf4j
@Tag(name = "开放API")
@RequiredArgsConstructor
public class OpenApiController {
    private static final String API_KEY_HEADER = "X-Api-Key";
    private final NavigationService navigationService;
    private final NavCategoryService navCategoryService;
    private final SitePublishService sitePublishService;
    private final OpenApiRegistry openApiRegistry;
    private final ApiKeyService apiKeyService;

    // ==================== 导航相关 ====================

    @Operation(summary = "分页查询导航")
    @ApiMapping(value = "nav/page", method = RequestMethod.POST, checkToken = false)
    public ResultPageVO<Navigation, JpaPageResult<Navigation>> navPage(
            HttpServletRequest request,
            @RequestBody @Valid NavigationPage page) {
        checkPermission(request);

        Specification<Navigation> beanWhere = EnhanceSpecification.beanWhere(page, and -> {
            String routePath = page.getShowPlatform();
            and.likes(StringUtils.hasText(routePath), "showPlatform", routePath);
        });

        Page<Navigation> byBean = navigationService.findPage(beanWhere, page.getPage().pageable());
        JpaPageResult<Navigation> pageResult = JpaPageResult.toPage(byBean);
        return ResultPageVO.success(pageResult, "查询成功");
    }

    @Operation(summary = "新增导航")
    @ApiMapping(value = "nav/append", method = RequestMethod.POST, checkToken = false)
    public ResultVO<Boolean> navCreate(HttpServletRequest request, @RequestBody @Valid NavigationAdd add) {
        checkPermission(request);
        navigationService.create(add);
        return ResultVO.success("创建成功", true);
    }

    @Operation(summary = "修改导航")
    @ApiMapping(value = "nav/edit", method = RequestMethod.POST, checkToken = false)
    public ResultVO<Boolean> navEdit(HttpServletRequest request, @RequestBody @Valid NavigationEdit edit) {
        checkPermission(request);
        navigationService.getJpaBasicsDao().findById(edit.getId()).ifPresent(navigation -> {
            if (edit.getName() != null) {
                navigation.setName(edit.getName());
            }
            if (edit.getUrl() != null) {
                navigation.setUrl(edit.getUrl());
            }
            if (edit.getSort() != null) {
                navigation.setSort(edit.getSort());
            }
            if (edit.getCategory() != null) {
                navigation.setCategory(edit.getCategory());
            }
            if (edit.getIcon() != null) {
                navigation.setIcon(edit.getIcon());
            }
            if (edit.getRemark() != null) {
                navigation.setRemark(edit.getRemark());
            }
            if (edit.getStatus() != null) {
                navigation.setStatus(edit.getStatus());
            }
            if (edit.getShowPlatform() == null || edit.getShowPlatform().isBlank()) {
                navigation.setShowPlatform(null);
            } else {
                navigation.setShowPlatform(edit.getShowPlatform());
            }
            navigationService.saveOne(navigation);
        });
        return ResultVO.success("修改成功", true);
    }

    // ==================== 分类相关 ====================

    @Operation(summary = "获取分类列表")
    @ApiMapping(value = "category/list", method = RequestMethod.GET, checkToken = false)
    public ResultVO<List<NavCategory>> categoryList(HttpServletRequest request) {
        checkPermission(request);
        Sorteds sorteds = Sorteds.defs();
        sorteds.fixSort(0, "sort");
        List<NavCategory> finds = navCategoryService.finds(sorteds);
        return ResultVO.success(finds);
    }

    @Operation(summary = "新增分类")
    @ApiMapping(value = "category/append", method = RequestMethod.POST, checkToken = false)
    public ResultVO<Boolean> categoryCreate(HttpServletRequest request, @RequestBody @Valid NavCategoryAdd add) {
        checkPermission(request);
        navCategoryService.create(add);
        return ResultVO.success("创建成功", true);
    }

    // ==================== 发布页面相关 ====================

    @Operation(summary = "获取发布页面列表")
    @ApiMapping(value = "publish/list", method = RequestMethod.GET, checkToken = false)
    public ResultVO<List<SitePublish>> publishList(HttpServletRequest request) {
        checkPermission(request);
        Sorteds sorteds = Sorteds.defs();
        sorteds.fixSort(0, "id");
        List<SitePublish> finds = sitePublishService.finds(sorteds);
        return ResultVO.success(finds);
    }

    /**
     * 检查权限 - 从请求头获取API Key并验证权限
     */
    private void checkPermission(HttpServletRequest request) {
        String apiKeyValue = request.getHeader(API_KEY_HEADER);
        if (apiKeyValue == null || apiKeyValue.isBlank()) {
            // X-Api-Key
            throw new RuntimeException("缺少第三方验证请求头");
        }
        ApiKey apiKey = apiKeyService.getByApiKey(apiKeyValue)
                .orElseThrow(() -> new RuntimeException("无效的 API Key"));
        if (apiKey.getStatus() != 1) {
            throw new RuntimeException("API Key 已被禁用");
        }
        if (apiKey.isExpired()) {
            throw new RuntimeException("API Key 已过期");
        }
        String path = request.getRequestURI();
        // 移除 contextPath 前缀
        String contextPath = request.getContextPath();
        if (path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        if (!openApiRegistry.hasPermission(apiKey.getPermissions(), path)) {
            throw new RuntimeException("API Key没有访问 " + path + " 的权限");
        }
    }
}
