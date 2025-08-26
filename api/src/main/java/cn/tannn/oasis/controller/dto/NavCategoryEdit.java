package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.annotations.jpa.JpaUpdate;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 编辑导航分类表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "编辑导航分类表")
@ToString
@Getter
@Setter
public class NavCategoryEdit {

    /**
     * id
     */
    @Schema(description = "id", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    @JpaUpdate(unique = true)
    private Integer id;


    /**
     * 分类名称
     */
    @Schema(description = "分类名称")
    private String categoryName;

    /**
     * 排序值
     */
    @Schema(description = "排序值")
    private Integer sort;


}
