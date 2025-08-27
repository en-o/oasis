package cn.tannn.oasis.controller.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 导航项表
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-08-26
 */
@Schema(description = "导航项")
@Getter
@Setter
@ToString
public class NavigationVO {

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
     * 排序值（越小越靠前）
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
     * 是否运行查看登录信息；false、密钥查看，true、直接查看，默认true
     */
    @Schema(description = "是否运行查看登录信息；false、密钥查看，true、直接查看，默认true")
    private Boolean lookAccount;

    /**
     * 导航登录信息查看密钥
     */
    @Schema(description = "导航登录信息查看密钥")
    private String nvaAccessSecret;

    /**
     * 状态；0、停用，1、启用，默认1
     */
    @Schema(description = "状态；0、停用，1、启用")
    private Integer status;
}
