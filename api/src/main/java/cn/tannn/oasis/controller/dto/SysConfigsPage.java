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
 * 分页查询系统配置表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Schema(description = "分页查询系统配置表")
@ToString
@Getter
@Setter
public class SysConfigsPage extends SerializableBean<SysConfigsPage> {

    /**
     * id
     */
    @Schema(description = "id")
    @JpaSelectOperator(operatorWrapper = SQLOperatorWrapper.EQ, connect = SQLConnect.AND)
    private Integer id;

    /**
     * 分页排序
     */
    @Schema(description = "分页排序")
    @JpaSelectIgnoreField
    @Valid
    private PagingSorteds page;

    public PagingSorteds getPage() {
        if (page == null) {
            return new PagingSorteds().fixSort(1, "id");
        }
        return page;
    }
}
