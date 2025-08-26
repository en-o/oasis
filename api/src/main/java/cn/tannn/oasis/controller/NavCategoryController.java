
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.constant.SQLOperator;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.jdevelops.result.utils.ListTo;
import cn.tannn.oasis.entity.NavCategory;
import cn.tannn.oasis.service.NavCategoryService;
import cn.tannn.oasis.controller.dto.NavCategoryAdd;
import cn.tannn.oasis.controller.dto.NavCategoryEdit;
import cn.tannn.oasis.controller.dto.NavCategoryPage;

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
 * 导航分类表
 *
 * @author tan
 * @date 2025-08-26
 */
@PathRestController("navCategory")
@Slf4j
@Tag(name = "导航分类表接口")
@RequiredArgsConstructor
public class NavCategoryController {

    private final NavCategoryService navCategoryService;

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取详情", description = "详情")
    public ResultVO<NavCategory> info(@PathVariable("id") Long id) {
        return ResultVO.success(navCategoryService.findOnly("id", id).orElse(new NavCategory()));
    }

    @Operation(summary = "新增导航分类表")
    @PostMapping("append")
    public ResultVO<String> append(@RequestBody @Valid NavCategoryAdd append) {
        navCategoryService.saveOneByVo(append);
        return ResultVO.success();
    }

    @Operation(summary = "分页查询")
    @PostMapping("page")
    public ResultPageVO<NavCategory, JpaPageResult<NavCategory>> page(@RequestBody @Valid NavCategoryPage page) {
        Page<NavCategory> byBean = navCategoryService.findPage(page, page.getPage());
        JpaPageResult<NavCategory> pageResult = JpaPageResult.toPage(byBean);
        return ResultPageVO.success(pageResult, "查询成功");
    }

    @Operation(summary = "集合")
    @GetMapping("lists")
    public ResultVO<List<NavCategory>> lists() {
        List<NavCategory> finds = navCategoryService.finds();
        return ResultVO.success(finds);
    }

    @Operation(summary = "删除")
    @DeleteMapping("delete")
    @Parameter(name = "id", description = "id", required = true)
    public ResultVO<String> delete(@RequestParam("id") Integer id) {
        navCategoryService.deleteEq("id", id);
        return ResultVO.success();
    }

    @Operation(summary = "编辑导航分类表")
    @PostMapping("edit")
    public ResultVO<String> edit(@RequestBody @Valid NavCategoryEdit edit) {
        navCategoryService.update(edit, SQLOperator.EQ);
        return ResultVO.success();
    }

}
