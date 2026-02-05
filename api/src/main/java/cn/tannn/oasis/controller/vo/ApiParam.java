package cn.tannn.oasis.controller.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * API参数定义
 *
 * @author tan
 * @date 2025-02-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiParam {

    /**
     * 参数名称
     */
    private String name;

    /**
     * 参数类型: String, Integer, Boolean, Object, Array
     */
    private String type;

    /**
     * 是否必传
     */
    private boolean required;

    /**
     * 参数描述
     */
    private String description;

    /**
     * 默认值（可选）
     */
    private String defaultValue;

    /**
     * 嵌套参数（用于Object类型）
     */
    private List<ApiParam> children;
}
