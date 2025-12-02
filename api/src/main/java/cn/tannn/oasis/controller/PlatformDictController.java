package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.PlatformDictAdd;
import cn.tannn.oasis.controller.dto.PlatformDictEdit;
import cn.tannn.oasis.entity.PlatformDict;
import cn.tannn.oasis.service.PlatformDictService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 平台字典管理
 *
 * @author tan
 */
@PathRestController("platformDict")
@Slf4j
@Tag(name = "平台字典管理")
@RequiredArgsConstructor
public class PlatformDictController {

    private final PlatformDictService platformDictService;

    @Operation(summary = "获取所有平台字典")
    @GetMapping("/lists")
    public ResultVO<List<PlatformDict>> listAll() {
        try {
            List<PlatformDict> list = platformDictService.listAll();
            return ResultVO.success(list);
        } catch (Exception e) {
            log.error("获取平台字典列表失败", e);
            return ResultVO.failMessage("获取失败: " + e.getMessage());
        }
    }

    @Operation(summary = "获取启用的平台字典")
    @GetMapping("/enabled")
    public ResultVO<List<PlatformDict>> listEnabled() {
        try {
            List<PlatformDict> list = platformDictService.listEnabled();
            return ResultVO.success(list);
        } catch (Exception e) {
            log.error("获取启用的平台字典列表失败", e);
            return ResultVO.failMessage("获取失败: " + e.getMessage());
        }
    }

    @Operation(summary = "根据路由路径获取平台字典")
    @GetMapping("/route/{routePath}")
    public ResultVO<PlatformDict> getByRoutePath(
            @Parameter(description = "路由路径", example = "dev")
            @PathVariable String routePath) {
        try {
            PlatformDict dict = platformDictService.getByRoutePath(routePath);
            if (dict == null) {
                return ResultVO.failMessage("平台字典不存在");
            }
            return ResultVO.success(dict);
        } catch (Exception e) {
            log.error("查询平台字典失败: {}", routePath, e);
            return ResultVO.failMessage("查询失败: " + e.getMessage());
        }
    }

    @Operation(summary = "根据ID获取平台字典")
    @GetMapping("/{id}")
    public ResultVO<PlatformDict> getById(
            @Parameter(description = "平台字典ID", example = "1")
            @PathVariable Integer id) {
        try {
            PlatformDict dict = platformDictService.getById(id);
            if (dict == null) {
                return ResultVO.failMessage("平台字典不存在");
            }
            return ResultVO.success(dict);
        } catch (Exception e) {
            log.error("查询平台字典失败: {}", id, e);
            return ResultVO.failMessage("查询失败: " + e.getMessage());
        }
    }

    @Operation(summary = "新增平台字典")
    @PostMapping("/append")
    public ResultVO<String> add(@Valid @RequestBody PlatformDictAdd dto) {
        try {
            PlatformDict platformDict = dto.to(PlatformDict.class);
            platformDictService.add(platformDict);
            return ResultVO.successMessage("新增成功");
        } catch (IllegalArgumentException e) {
            log.warn("新增平台字典失败: {}", e.getMessage());
            return ResultVO.failMessage(e.getMessage());
        } catch (Exception e) {
            log.error("新增平台字典失败", e);
            return ResultVO.failMessage("新增失败: " + e.getMessage());
        }
    }

    @Operation(summary = "更新平台字典")
    @PutMapping("/update")
    public ResultVO<String> update(@Valid @RequestBody PlatformDictEdit dto) {
        try {
            PlatformDict platformDict = dto.to(PlatformDict.class);
            platformDictService.update(platformDict);
            return ResultVO.successMessage("更新成功");
        } catch (IllegalArgumentException e) {
            log.warn("更新平台字典失败: {}", e.getMessage());
            return ResultVO.failMessage(e.getMessage());
        } catch (Exception e) {
            log.error("更新平台字典失败", e);
            return ResultVO.failMessage("更新失败: " + e.getMessage());
        }
    }

    @Operation(summary = "删除平台字典")
    @DeleteMapping("/delete/{id}")
    public ResultVO<String> delete(
            @Parameter(description = "平台字典ID", example = "1")
            @PathVariable Integer id) {
        try {
            platformDictService.delete(id);
            return ResultVO.successMessage("删除成功");
        } catch (IllegalArgumentException e) {
            log.warn("删除平台字典失败: {}", e.getMessage());
            return ResultVO.failMessage(e.getMessage());
        } catch (Exception e) {
            log.error("删除平台字典失败", e);
            return ResultVO.failMessage("删除失败: " + e.getMessage());
        }
    }
}
