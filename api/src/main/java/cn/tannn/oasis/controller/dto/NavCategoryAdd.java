package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 添加导航分类表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "添加导航分类表")
@ToString
@Getter
@Setter
public class NavCategoryAdd extends SerializableBean<NavCategoryAdd> {


    /**
     * 分类名称
     */
    @Schema(description = "分类名称")
    @NotBlank(message = "分类名称不允许为空")
    private String categoryName;


    /**
     * 排序值
     */
    @Schema(description = "排序值(默认1,正序)")
    private Integer sort;

}
