package cn.tannn.oasis.entity;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

/**
 * 导航项表
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-08-26
 */
@Entity
@Table(name = "nav_item", indexes = {
        @Index(name = "idx_sort", columnList = "sort"),
        @Index(name = "idx_category", columnList = "category")
})
@Comment("导航项表")
@Schema(description = "导航项")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Navigation extends SerializableBean<Navigation> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    /**
     * 名称
     */
    @Column(columnDefinition = "varchar(100)", nullable = false)
    @Comment("名称")
    @Schema(description = "名称")
    private String name;

    /**
     * 访问地址
     */
    @Column(columnDefinition = "varchar(500)", nullable = false)
    @Comment("访问地址")
    @Schema(description = "访问地址")
    private String url;

    /**，多个逗号隔开
     * 排序值（越小越靠前）
     */
    @ColumnDefault("1")
    @Comment("排序值")
    @Schema(description = "排序值")
    private Integer sort;

    /**
     * 分类，多个逗号隔开
     */
    @Column(columnDefinition = "varchar(200)", nullable = false)
    @Comment("分类，多个逗号隔开")
    @Schema(description = "分类，多个逗号隔开")
    private String category;

    /**
     * 图标[base64/url]
     */
    @Column(columnDefinition = "text")
    @Comment("图标[base64/url]")
    @Schema(description = "图标[base64/url]")
    private String icon;

    /**
     * 备注
     */
    @Column(columnDefinition = "varchar(500)")
    @Comment("备注")
    @Schema(description = "备注")
    private String remark;

    /**
     * 登录账号
     */
    @Column(columnDefinition = "varchar(100)")
    @Comment("登录账号")
    @Schema(description = "登录账号")
    private String account;

    /**
     * 登录密码
     */
    @Column(columnDefinition = "varchar(255)")
    @Comment("登录密码")
    @Schema(description = "登录密码")
    private String password;


    /**
     * 是否运行查看登录信息；false、密钥查看，true、直接查看，默认true
     */
    @Column(columnDefinition = "boolean")
    @ColumnDefault("true")
    @Comment("是否运行查看登录信息；false、不查看，true、查看，默认true")
    @Schema(description = "是否运行查看登录信息；false、密钥查看，true、直接查看，默认true")
    private Boolean lookAccount;

    /**
     * 导航登录信息查看密钥
     */
    @Column(columnDefinition = "varchar(100)")
    @ColumnDefault("'tan'")
    @Comment("导航登录信息查看密钥")
    @Schema(description = "导航登录信息查看密钥")
    private String nvaAccessSecret;

    /**
     * 状态；0、停用，1、启用，默认1
     */
    @Column(columnDefinition = "smallint")
    @ColumnDefault("1")
    @Comment("状态；0、停用，1、启用")
    @Schema(description = "状态；0、停用，1、启用")
    private Integer status;
}
