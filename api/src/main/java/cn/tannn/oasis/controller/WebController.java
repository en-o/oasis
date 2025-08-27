package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.NavigationPage;
import cn.tannn.oasis.controller.vo.NavAccessInfo;
import cn.tannn.oasis.controller.vo.NavigationVO;
import cn.tannn.oasis.controller.vo.SiteInfo;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.NavigationService;
import cn.tannn.oasis.service.SysConfigsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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

    @GetMapping("/site")
    @Operation(summary = "站点信息", description = "详情")
    public ResultVO<SiteInfo> siteInfo() {
        SysConfigs bean = sysConfigsService.findOnly("configKey", "MAIN").orElse(SysConfigs.newInstance());
        return ResultVO.success(SiteInfo.to(bean));
    }

    @Operation(summary = "获取导航项")
    @PostMapping("navs")
    public ResultPageVO<NavigationVO, JpaPageResult<NavigationVO>> navsPage(@RequestBody @Valid NavigationPage page) {
        Page<Navigation> byBean = navigationService.findPage(page, page.getPage());
        JpaPageResult<NavigationVO> pageResult = JpaPageResult.toPage(byBean,NavigationVO.class);
        return ResultPageVO.success(pageResult, "查询成功");
    }

    @Operation(summary = "获取导航项登录信息")
    @GetMapping("navs/access/{id}")
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


}
