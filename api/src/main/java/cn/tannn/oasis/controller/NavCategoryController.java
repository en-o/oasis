
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.exception.built.BusinessException;
import cn.tannn.jdevelops.jpa.request.Sorteds;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.entity.NavCategory;
import cn.tannn.oasis.service.NavCategoryService;
import cn.tannn.oasis.controller.dto.NavCategoryAdd;

import cn.tannn.oasis.service.NavigationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

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
    private final NavigationService navigationService;

    @Operation(summary = "新增导航分类")
    @PostMapping("append")
    public ResultVO<String> append(@RequestBody @Valid NavCategoryAdd append) {
        navCategoryService.create(append);
        return ResultVO.success();
    }

    @Operation(summary = "集合")
    @GetMapping("lists")
    public ResultVO<List<NavCategory>> lists() {
        Sorteds defs = Sorteds.defs();
        defs.fixSort(0,"sort");
        List<NavCategory> finds = navCategoryService.finds(defs);
        return ResultVO.success(finds);
    }

    @Operation(summary = "删除")
    @DeleteMapping("delete")
    @Parameter(name = "category", description = "分类名称", required = true)
    public ResultVO<String> delete(@RequestParam("categoryName") String categoryName) {
        if(navigationService.categoryUse(categoryName)){
            throw new BusinessException("该分类下存在导航项，无法删除");
        }
        navCategoryService.deleteEq("categoryName", categoryName);
        return ResultVO.success();
    }


}
