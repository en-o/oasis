package cn.tannn.oasis.controller.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 开放API接口信息
 *
 * @author tan
 * @date 2025-02-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenApiEndpoint {

    /**
     * 权限标识（唯一），如: nav:list, nav:add, category:list
     */
    private String permission;

    /**
     * 接口名称（显示用）
     */
    private String name;

    /**
     * 接口路径
     */
    private String path;

    /**
     * 请求方法: GET, POST
     */
    private String method;

    /**
     * 是否需要API Key认证
     */
    private boolean needAuth;

    /**
     * 请求体示例（JSON字符串，仅POST请求）
     */
    private String requestExample;

    /**
     * 响应体示例（JSON字符串）
     */
    private String responseExample;

    /**
     * 接口说明
     */
    private String description;
}
