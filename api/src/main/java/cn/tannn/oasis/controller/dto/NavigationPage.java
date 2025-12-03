package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.annotations.jpa.JpaSelectIgnoreField;
import cn.tannn.jdevelops.annotations.jpa.JpaSelectOperator;
import cn.tannn.jdevelops.annotations.jpa.enums.SQLConnect;
import cn.tannn.jdevelops.annotations.jpa.enums.SQLOperatorWrapper;
import cn.tannn.jdevelops.jpa.request.PagingSorteds;
import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 分页查询导航项表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "分页查询导航项表")
@ToString
@Getter
@Setter
public class NavigationPage extends SerializableBean<NavigationPage> {


    @JpaSelectOperator(operatorWrapper = SQLOperatorWrapper.LIKE, connect = SQLConnect.AND)
    @Schema(description = "名称")
    private String name;

    @Schema(description = "分类")
    @JpaSelectOperator(operatorWrapper = SQLOperatorWrapper.LIKE, connect = SQLConnect.AND)
    private String category;

    @Schema(description = "状态；0、停用，1、启用")
    @JpaSelectOperator(operatorWrapper = SQLOperatorWrapper.EQ, connect = SQLConnect.AND)
    private Integer status;

    @Schema(description = "发布页面，逗号分隔的routePath，如：dev,cp,public")
    @JpaSelectIgnoreField
    private String showPlatform;

    /**
     * 分页排序
     */
    @Schema(description = "分页排序")
    @JpaSelectIgnoreField
    @Valid
    private PagingSorteds page;

    public PagingSorteds getPage() {
        if (page == null) {
            return new PagingSorteds().fixSort(0, "sort");
        }
        return page.append(0, "sort");
    }
}
