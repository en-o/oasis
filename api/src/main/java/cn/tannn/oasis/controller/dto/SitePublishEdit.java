package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 编辑站点发布配置
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-12-02
 */
@Schema(description = "编辑站点发布配置")
@ToString
@Getter
@Setter
public class SitePublishEdit extends SerializableBean<SitePublishEdit> {

    /**
     * 主键ID
     */
    @Schema(description = "主键ID")
    @NotNull(message = "主键ID不允许为空")
    private Integer id;

    /**
     * 配置名称
     */
    @Schema(description = "配置名称")
    @NotBlank(message = "配置名称不允许为空")
    private String name;

    /**
     * 路由路径
     */
    @Schema(description = "路由路径，如：/site、/dev、/cp")
    @NotBlank(message = "路由路径不允许为空")
    private String routePath;

    /**
     * 显示的平台类型
     */
    @Schema(description = "显示的平台类型，0:dev主页, 1:cp主页等，null表示不过滤")
    private Integer showPlatform;

    /**
     * 是否隐藏管理入口
     */
    @Schema(description = "是否隐藏管理入口，true隐藏，false显示")
    @NotNull(message = "是否隐藏管理入口不允许为空")
    private Boolean hideAdminEntry;

    /**
     * 是否启用
     */
    @Schema(description = "是否启用，true启用，false禁用")
    @NotNull(message = "是否启用不允许为空")
    private Boolean enabled;

    /**
     * 排序值
     */
    @Schema(description = "排序值（默认1，正序）")
    private Integer sort;

    /**
     * 描述说明
     */
    @Schema(description = "描述说明")
    private String description;
}
