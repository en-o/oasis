package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.request.Sorteds;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.SitePublishAdd;
import cn.tannn.oasis.controller.dto.SitePublishEdit;
import cn.tannn.oasis.entity.SitePublish;
import cn.tannn.oasis.service.SitePublishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 站点发布配置
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-12-02
 */
@PathRestController("sitePublish")
@Slf4j
@Tag(name = "站点发布配置")
@RequiredArgsConstructor
public class SitePublishController {

    private final SitePublishService sitePublishService;

    @Operation(summary = "新增站点发布配置")
    @PostMapping("append")
    public ResultVO<String> append(@RequestBody @Valid SitePublishAdd append) {
        sitePublishService.create(append);
        return ResultVO.success();
    }

    @Operation(summary = "更新站点发布配置")
    @PutMapping("update")
    public ResultVO<String> update(@RequestBody @Valid SitePublishEdit edit) {
        sitePublishService.update(edit);
        return ResultVO.success();
    }

    @Operation(summary = "获取配置列表")
    @GetMapping("lists")
    public ResultVO<List<SitePublish>> lists() {
        Sorteds defs = Sorteds.defs();
        defs.fixSort(0, "sort");
        List<SitePublish> finds = sitePublishService.finds(defs);
        return ResultVO.success(finds);
    }

    @Operation(summary = "获取所有启用的配置")
    @GetMapping("enabled")
    public ResultVO<List<SitePublish>> listEnabled() {
        List<SitePublish> enabled = sitePublishService.listEnabled();
        return ResultVO.success(enabled);
    }

    @Operation(summary = "根据路由路径获取配置")
    @GetMapping("route/{routePath}")
    @Parameter(name = "routePath", description = "路由路径", required = true)
    public ResultVO<SitePublish> getByRoutePath(@PathVariable String routePath) {
        SitePublish config = sitePublishService.getByRoutePath(routePath);
        return ResultVO.success(config);
    }

    @Operation(summary = "根据ID获取配置详情")
    @GetMapping("{id}")
    @Parameter(name = "id", description = "配置ID", required = true)
    public ResultVO<SitePublish> getById(@PathVariable Integer id) {
        SitePublish config = sitePublishService.getJpaBasicsDao().findById(id).orElseThrow();
        return ResultVO.success(config);
    }

    @Operation(summary = "删除配置")
    @DeleteMapping("delete/{id}")
    @Parameter(name = "id", description = "配置ID", required = true)
    public ResultVO<String> delete(@PathVariable Integer id) {
        sitePublishService.deleteEq("id",id);
        return ResultVO.success();
    }
}
