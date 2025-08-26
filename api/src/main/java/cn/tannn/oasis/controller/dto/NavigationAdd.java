package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
    @Schema(description = "名称")
    @NotBlank(message = "名称不允许为空")
    private String name;


    /**
     * 访问地址
     */
    @Schema(description = "访问地址")
    @NotBlank(message = "访问地址不允许为空")
    private String url;


    /**
     * 排序值
     */
    @Schema(description = "排序值")
    @NotNull(message = "排序值不允许为空")
    private Integer sort;


    /**
     * 分类
     */
    @Schema(description = "分类")
    @NotBlank(message = "分类不允许为空")
    private String category;


    /**
     * 图标
     */
    @Schema(description = "图标")
    @NotBlank(message = "图标不允许为空")
    private String icon;


    /**
     * 备注
     */
    @Schema(description = "备注")
    @NotBlank(message = "备注不允许为空")
    private String remark;


    /**
     * 登录账号
     */
    @Schema(description = "登录账号")
    @NotBlank(message = "登录账号不允许为空")
    private String account;


    /**
     * 登录密码
     */
    @Schema(description = "登录密码")
    @NotBlank(message = "登录密码不允许为空")
    private String password;


    /**
     * 状态；0、停用，1、启用
     */
    @Schema(description = "状态；0、停用，1、启用")
    @NotNull(message = "状态；0、停用，1、启用不允许为空")
    private Integer status;

}
