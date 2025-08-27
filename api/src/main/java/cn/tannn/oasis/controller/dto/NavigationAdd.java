package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import cn.tannn.oasis.utils.ImageUtils;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 添加导航项表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "添加导航项表")
@ToString
@Getter
@Setter
public class NavigationAdd extends SerializableBean<NavigationAdd> {


    /**
     * 名称
     */
    @Schema(description = "名称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "名称不允许为空")
    private String name;


    /**
     * 访问地址
     */
    @Schema(description = "访问地址", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "访问地址不允许为空")
    private String url;


    /**
     * 排序值
     */
    @Schema(description = "排序值(默认1,正序)")
    private Integer sort;

    /**
     * 分类
     */
    @Schema(description = "分类", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "分类不允许为空")
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


    public String getIcon() {
        return ImageUtils.processImage(icon);
    }
}
