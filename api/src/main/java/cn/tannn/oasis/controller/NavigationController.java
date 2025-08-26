
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.constant.SQLOperator;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.jdevelops.result.utils.ListTo;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.service.NavigationService;
import cn.tannn.oasis.controller.dto.NavigationAdd;
import cn.tannn.oasis.controller.dto.NavigationEdit;
import cn.tannn.oasis.controller.dto.NavigationPage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

/**
 * 导航项表
 *
 * @author tan
 * @date 2025-08-26
 */
@PathRestController("navigation")
@Slf4j
@Tag(name = "导航项表接口")
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
        navigationService.saveOneByVo(append);
        return ResultVO.success();
    }

    @Operation(summary = "分页查询")
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
