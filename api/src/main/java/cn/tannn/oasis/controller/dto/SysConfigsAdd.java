package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import cn.tannn.oasis.utils.ImageUtils;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 添加系统配置表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "添加系统配置表")
@ToString
@Getter
@Setter
public class SysConfigsAdd extends SerializableBean<SysConfigsAdd> {


    /**
     * 配置键
     */
    @Schema(description = "配置键")
    @NotBlank(message = "配置键不允许为空")
    private String configKey;


    /**
     * 站点标题
     */
    @Schema(description = "站点标题")
    @NotBlank(message = "站点标题不允许为空")
    private String siteTitle;


    /**
     * 站点 Logo
     */
    @Schema(description = "站点 Logo[base64/url]")
    private String siteLogo;


    /**
     * 默认打开方式；0、当前页，1、新标签页
     */
    @Schema(description = "默认打开方式；0、当前页，1、新标签页")
    @NotNull(message = "默认打开方式；0、当前页，1、新标签页不允许为空")
    private Integer defaultOpenMode;


    /**
     * 是否隐藏后台入口；0、显示，1、隐藏
     */
    @Schema(description = "是否隐藏后台入口；0、显示，1、隐藏")
    @NotNull(message = "是否隐藏后台入口；0、显示，1、隐藏不允许为空")
    private Integer hideAdminEntry;


    /**
     * 管理员用户名
     */
    @Schema(description = "管理员用户名")
    @NotBlank(message = "管理员用户名不允许为空")
    private String username;


    /**
     * 管理员密码
     */
    @Schema(description = "管理员密码")
    @NotBlank(message = "管理员密码不允许为空")
    private String password;

    public String getSiteLogo() {
        return ImageUtils.processImage(siteLogo);
    }
}
