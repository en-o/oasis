package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.authentication.ApiMapping;
import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.request.Sorteds;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
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
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.NavCategoryService;
import cn.tannn.oasis.service.NavigationService;
import cn.tannn.oasis.service.SysConfigsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    @ApiMapping(value = "/site",checkToken = false,method = RequestMethod.GET)
    @Operation(summary = "站点信息", description = "详情")
    public ResultVO<SiteInfo> siteInfo() {
        SysConfigs bean = sysConfigsService.findOnly("configKey", "MAIN")
                .orElse(SysConfigs.newInstance(defaultSysConfig));
        return ResultVO.success(SiteInfo.to(bean));
    }

    @Operation(summary = "获取网站集合-分页")
    @ApiMapping(value = "navs",checkToken = false,method = RequestMethod.POST)
    public ResultPageVO<NavigationVO, JpaPageResult<NavigationVO>> navsPage(@RequestBody @Valid NavigationSitePage page) {
        Page<Navigation> byBean = navigationService.findPage(page, page.getPage());

        // 自定义转换，设置 hasAccount 字段
        List<NavigationVO> voList = byBean.getContent().stream().map(nav -> {
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
        pageResult.setTotal(byBean.getTotalElements());
        pageResult.setRows(voList);

        return ResultPageVO.success(pageResult, "查询成功");
    }

    @Operation(summary = "获取网站登录信息")
    @ApiMapping(value = "navs/access/{id}",checkToken = false,method = RequestMethod.GET)
    public ResultVO<NavAccessInfo> navsAccess(
            @PathVariable("id") Integer id,
            @RequestParam(value = "nvaAccessSecret",required = false) String nvaAccessSecret) {
        Navigation navigation = navigationService.getJpaBasicsDao().findById(id)
                .orElseThrow(() -> new IllegalArgumentException("请确定数据存不存在！"));
        if(navigation.getLookAccount()){
            return ResultVO.success(new NavAccessInfo(navigation));
        }else if(navigation.getNvaAccessSecret().equals(nvaAccessSecret)){
            return ResultVO.success(new NavAccessInfo(navigation));
        }else {
            return ResultVO.failMessage("密钥错误，无法查看");
        }
    }

    @Operation(summary = "网站分类")
    @ApiMapping(value = "category",checkToken = false,method = RequestMethod.GET)
    public ResultVO<List<NavCategory>> category() {
        Sorteds defs = Sorteds.defs();
        defs.fixSort(0,"sort");
        List<NavCategory> finds = navCategoryService.finds(defs);
        return ResultVO.success(finds);
    }
}
