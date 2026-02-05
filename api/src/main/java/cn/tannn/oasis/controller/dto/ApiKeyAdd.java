package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 添加API Key
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-02-05
 */
@Schema(description = "添加API Key")
@ToString
@Getter
@Setter
public class ApiKeyAdd extends SerializableBean<ApiKeyAdd> {

    /**
     * 名称/描述
     */
    @Schema(description = "名称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "名称不允许为空")
    private String name;

    /**
     * 有效天数
     */
    @Schema(description = "有效天数，0表示永久", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "有效天数不允许为空")
    @Min(value = 0, message = "有效天数最小为0(永久)")
    @Max(value = 365, message = "有效天数最大为365天")
    private Integer expireDays;

    /**
     * 权限范围（逗号分隔）: nav:page,nav:add,category:list 等
     */
    @Schema(description = "权限范围，逗号分隔的接口权限标识，如：nav:page,nav:add,category:list", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "权限范围不允许为空，请至少选择一个接口权限")
    private String permissions;

    /**
     * 备注
     */
    @Schema(description = "备注")
    private String remark;
}
