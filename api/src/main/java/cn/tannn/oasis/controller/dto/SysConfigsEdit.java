package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.annotations.jpa.JpaUpdate;
import cn.tannn.oasis.utils.ImageUtils;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 编辑系统配置表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "编辑系统配置表")
@ToString
@Getter
@Setter
public class SysConfigsEdit {


    /**
     * 配置键
     */
    @Schema(description = "配置键", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "配置键不允许为空")
    @JpaUpdate(unique = true)
    private String configKey;

    /**
     * 站点标题
     */
    @Schema(description = "站点标题")
    private String siteTitle;

    /**
     * 站点 Logo[base64/url]
     */
    @Schema(description = "站点[base64/url]")
    private String siteLogo;

    /**
     * 默认打开方式；0、当前页，1、新标签页
     */
    @Schema(description = "默认打开方式；0、当前页，1、新标签页")
    private Integer defaultOpenMode;

    /**
     * 是否隐藏后台入口；0、显示，1、隐藏
     */
    @Schema(description = "是否隐藏后台入口；0、显示，1、隐藏")
    private Integer hideAdminEntry;

    /**
     * 管理员用户名
     */
    @Schema(description = "管理员用户名")
    private String username;

    /**
     * 管理员密码
     */
    @Schema(description = "管理员密码")
    private String password;


    public String getSiteLogo() {
        return ImageUtils.processImage(siteLogo);
    }
}
