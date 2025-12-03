package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.annotations.jpa.JpaUpdate;
import cn.tannn.oasis.utils.ImageUtils;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 编辑导航项表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "编辑导航项表")
@ToString
@Getter
@Setter
public class NavigationEdit {

    /**
     * id
     */
    @Schema(description = "id", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    @JpaUpdate(unique = true)
    private Integer id;


    /**
     * 名称
     */
    @Schema(description = "名称")
    private String name;

    /**
     * 访问地址
     */
    @Schema(description = "访问地址")
    private String url;

    /**
     * 排序值
     */
    @Schema(description = "排序值")
    private Integer sort;

    /**
     * 分类
     */
    @Schema(description = "分类")
    private String category;

    /**
     * 图标[base64/url]
     */
    @Schema(description = "图标[base64/url]")
    private String icon;

    /**
     * 备注
     */
    @Schema(description = "备注")
    private String remark;

    /**
     * 登录账号
     */
    @Schema(description = "登录账号")
    private String account;

    /**
     * 登录密码
     */
    @Schema(description = "登录密码")
    private String password;

    @Schema(description = "导航登录信息查看密钥")
    private String nvaAccessSecret;

    @Schema(description = "是否运行查看登录信息；false、密钥查看，true、直接查看，默认true")
    private Boolean lookAccount;

    /**
     * 状态；0、停用，1、启用
     */
    @Schema(description = "状态；0、停用，1、启用")
    private Integer status;

    /**
     * 发布页面（逗号分隔的routePath）
     */
    @Schema(description = "发布页面，逗号分隔的routePath，如：dev,cp,public", example = "dev,cp")
    private String showPlatform;


    public String getIcon() {
        return ImageUtils.processImage(icon);
    }
}
