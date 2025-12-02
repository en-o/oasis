package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 平台字典新增 DTO
 *
 * @author tan
 */
@Getter
@Setter
@ToString
@Schema(description = "平台字典新增")
public class PlatformDictAdd extends SerializableBean<PlatformDictAdd> {

    @NotBlank(message = "路由路径不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9-_]+$", message = "路由路径只能包含字母、数字、横杠和下划线")
    @Schema(description = "路由路径，如：dev、cp、public", example = "dev", requiredMode = Schema.RequiredMode.REQUIRED)
    private String routePath;

    @NotBlank(message = "平台名称不能为空")
    @Size(max = 100, message = "平台名称最多100个字符")
    @Schema(description = "平台名称", example = "开发运维平台", requiredMode = Schema.RequiredMode.REQUIRED)
    private String platformName;

    @Size(max = 500, message = "描述最多500个字符")
    @Schema(description = "描述说明", example = "用于开发和运维团队")
    private String description;

    @Schema(description = "是否启用", example = "true")
    private Boolean enabled = true;

    @Schema(description = "排序值", example = "1")
    private Integer sort = 1;
}
