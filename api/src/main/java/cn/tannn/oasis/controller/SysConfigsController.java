
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.constant.SQLOperator;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.jdevelops.result.utils.ListTo;
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.SysConfigsService;
import cn.tannn.oasis.controller.dto.SysConfigsAdd;
import cn.tannn.oasis.controller.dto.SysConfigsEdit;
import cn.tannn.oasis.controller.dto.SysConfigsPage;
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
 * 系统配置表
 *
 * @author tan
 * @date 2025-08-26
 */
@PathRestController("sysConfigs")
@Slf4j
@Tag(name = "系统配置表接口")
@RequiredArgsConstructor
public class  SysConfigsController {

    private final SysConfigsService sysConfigsService;

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取详情", description = "详情")
    public ResultVO<SysConfigs> info(@PathVariable("id") Long id) {
        SysConfigs bean = sysConfigsService.findOnly("id", id).orElse(new SysConfigs());
        return ResultVO.success(bean);
    }

    @Operation(summary = "新增系统配置表")
    @PostMapping("append")
    public ResultVO<String> append(@RequestBody @Valid SysConfigsAdd append) {
            sysConfigsService.saveOneByVo(append);
        return ResultVO.success();
    }

    @Operation(summary = "分页查询")
    @PostMapping("page")
    public ResultPageVO<SysConfigs, JpaPageResult<SysConfigs>> page(@RequestBody @Valid SysConfigsPage page) {
        Page<SysConfigs> byBean =  sysConfigsService.findPage(page, page.getPage());
        JpaPageResult<SysConfigs> pageResult = JpaPageResult.toPage(byBean);
        return ResultPageVO.success(pageResult, "查询成功");
    }

    @Operation(summary = "集合")
    @GetMapping("lists")
    public ResultVO<List<SysConfigs>> lists() {
        List<SysConfigs> finds = sysConfigsService.finds();
        return ResultVO.success(finds);
    }

    @Operation(summary = "删除")
    @DeleteMapping("delete")
    @Parameter(name = "id", description = "id", required = true)
    public ResultVO<String> delete(@RequestParam("id") Integer id) {
            sysConfigsService.deleteEq("id", id);
        return ResultVO.success();
    }

    @Operation(summary = "编辑系统配置表")
    @PostMapping("edit")
    public ResultVO<String> edit(@RequestBody  @Valid SysConfigsEdit edit)  {
            sysConfigsService.update(edit, SQLOperator.EQ);
        return ResultVO.success();
    }

}
