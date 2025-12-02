
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.constant.SQLOperator;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.NavigationAdd;
import cn.tannn.oasis.controller.dto.NavigationEdit;
import cn.tannn.oasis.controller.dto.NavigationPage;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.service.NavigationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 导航项表
 *
 * @author tan
 * @date 2025-08-26
 */
@PathRestController("navigation")
@Slf4j
@Tag(name = "导航项")
@RequiredArgsConstructor
public class NavigationController {

    private final NavigationService navigationService;

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取详情", description = "详情")
    public ResultVO<Navigation> info(@PathVariable("id") Long id) {
        Navigation bean = navigationService.findOnly("id", id).orElse(new Navigation());
        return ResultVO.success(bean);
    }

    @Operation(summary = "新增导航项")
    @PostMapping("append")
    public ResultVO<String> append(@RequestBody @Valid NavigationAdd append) {
        navigationService.create(append);
        return ResultVO.success();
    }

    @Operation(summary = "管理端分页")
    @PostMapping("page")
    public ResultPageVO<Navigation, JpaPageResult<Navigation>> page(@RequestBody @Valid NavigationPage page) {
        Page<Navigation> byBean = navigationService.findPage(page, page.getPage());
        JpaPageResult<Navigation> pageResult = JpaPageResult.toPage(byBean);
        return ResultPageVO.success(pageResult, "查询成功");
    }


    @Operation(summary = "集合")
    @GetMapping("lists")
    public ResultVO<List<Navigation>> lists() {
        List<Navigation> finds = navigationService.finds();
        return ResultVO.success(finds);
    }

    @Operation(summary = "根据平台类型获取导航列表")
    @GetMapping("lists/platform")
    @Parameter(name = "showPlatform", description = "平台类型，null表示不过滤", required = false)
    public ResultVO<List<Navigation>> listsByPlatform(@RequestParam(required = false) Integer showPlatform) {
        List<Navigation> finds;
        if (showPlatform == null) {
            finds = navigationService.finds();
        } else {
            finds = navigationService.findByShowPlatform(showPlatform);
        }
        return ResultVO.success(finds);
    }

    @Operation(summary = "删除")
    @DeleteMapping("delete")
    @Parameter(name = "id", description = "id", required = true)
    public ResultVO<String> delete(@RequestParam("id") Integer id) {
        navigationService.deleteEq("id", id);
        return ResultVO.success();
    }

    @Operation(summary = "编辑导航项")
    @PostMapping("edit")
    public ResultVO<String> edit(@RequestBody @Valid NavigationEdit edit) {
        navigationService.update(edit, SQLOperator.EQ);
        return ResultVO.success();
    }

}
