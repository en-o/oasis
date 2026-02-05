package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.request.Sorteds;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.config.OpenApiRegistry;
import cn.tannn.oasis.controller.dto.ApiKeyAdd;
import cn.tannn.oasis.controller.vo.ApiKeyVO;
import cn.tannn.oasis.controller.vo.OpenApiEndpoint;
import cn.tannn.oasis.entity.ApiKey;
import cn.tannn.oasis.service.ApiKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * API Key 管理
 *  用来跟运维平台集成的 { @link  OpenApiController }
 * @author tan
 * @date 2025-02-05
 */
@PathRestController("apiKey")
@Slf4j
@Tag(name = "API Key管理")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final OpenApiRegistry openApiRegistry;

    @Operation(summary = "获取可授权的接口清单")
    @GetMapping("endpoints")
    public ResultVO<List<OpenApiEndpoint>> endpoints() {
        // 只返回需要认证的接口（可授权的）
        List<OpenApiEndpoint> authEndpoints = openApiRegistry.getAllEndpoints().stream()
                .filter(OpenApiEndpoint::isNeedAuth)
                .collect(Collectors.toList());
        return ResultVO.success(authEndpoints);
    }

    @Operation(summary = "创建API Key")
    @PostMapping("append")
    public ResultVO<ApiKeyVO> append(@RequestBody @Valid ApiKeyAdd add) {
        ApiKey apiKey = apiKeyService.generateApiKey(add);
        // 创建时返回完整Key（不脱敏）
        return ResultVO.success("创建成功", ApiKeyVO.fromEntity(apiKey, false));
    }

    @Operation(summary = "获取API Key列表")
    @GetMapping("lists")
    public ResultVO<List<ApiKey>> lists() {
        Sorteds sorteds = Sorteds.defs();
        sorteds.fixSort(1, "createTime"); // 按创建时间倒序
        List<ApiKey> finds = apiKeyService.finds(sorteds);
        return ResultVO.success(finds);
    }

    @Operation(summary = "删除API Key")
    @DeleteMapping("delete")
    @Parameter(name = "id", description = "API Key ID", required = true)
    public ResultVO<Boolean> delete(@RequestParam("id") Integer id) {
        apiKeyService.deleteEq("id", id);
        log.info("API Key已删除: id={}", id);
        return ResultVO.success("删除成功", true);
    }

    @Operation(summary = "禁用API Key")
    @PostMapping("revoke")
    @Parameter(name = "id", description = "API Key ID", required = true)
    public ResultVO<Boolean> revoke(@RequestParam("id") Integer id) {
        apiKeyService.revokeApiKey(id);
        return ResultVO.success("已禁用", true);
    }

    @Operation(summary = "启用API Key")
    @PostMapping("enable")
    @Parameter(name = "id", description = "API Key ID", required = true)
    public ResultVO<Boolean> enable(@RequestParam("id") Integer id) {
        apiKeyService.enableApiKey(id);
        return ResultVO.success("已启用", true);
    }
}
