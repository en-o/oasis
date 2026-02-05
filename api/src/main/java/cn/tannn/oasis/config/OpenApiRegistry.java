package cn.tannn.oasis.config;

import cn.tannn.oasis.controller.vo.OpenApiEndpoint;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 开放API接口注册表
 * 集中管理所有开放接口的权限和认证配置
 *
 * @author tan
 * @date 2025-02-05
 */
@Component
public class OpenApiRegistry {

    private final List<OpenApiEndpoint> endpoints = new ArrayList<>();

    /**
     * key: 接口路径(如 /openapi/nav/list), value: OpenApiEndpoint
     */
    private final Map<String, OpenApiEndpoint> pathMap = new LinkedHashMap<>();

    public OpenApiRegistry() {
        // ===== 公开接口（无需认证） =====
        register(OpenApiEndpoint.builder()
                .permission("endpoints").name("获取开放接口清单")
                .path("/openapi/endpoints").method("GET").needAuth(false).build());

        // ===== 导航相关 =====
        register(OpenApiEndpoint.builder()
                .permission("nav:page").name("分页查询导航")
                .path("/openapi/nav/page").method("POST").needAuth(true).build());
        register(OpenApiEndpoint.builder()
                .permission("nav:add").name("新增导航")
                .path("/openapi/nav/append").method("POST").needAuth(true).build());
        register(OpenApiEndpoint.builder()
                .permission("nav:edit").name("修改导航")
                .path("/openapi/nav/edit").method("POST").needAuth(true).build());

        // ===== 分类相关 =====
        register(OpenApiEndpoint.builder()
                .permission("category:list").name("获取分类列表")
                .path("/openapi/category/list").method("GET").needAuth(true).build());
        register(OpenApiEndpoint.builder()
                .permission("category:add").name("新增分类")
                .path("/openapi/category/append").method("POST").needAuth(true).build());

        // ===== 发布页面相关 =====
        register(OpenApiEndpoint.builder()
                .permission("publish:list").name("获取发布页面列表")
                .path("/openapi/publish/list").method("GET").needAuth(true).build());
    }

    private void register(OpenApiEndpoint endpoint) {
        endpoints.add(endpoint);
        pathMap.put(endpoint.getPath(), endpoint);
    }

    /**
     * 获取所有接口清单
     */
    public List<OpenApiEndpoint> getAllEndpoints() {
        return Collections.unmodifiableList(endpoints);
    }

    /**
     * 根据路径获取接口信息
     */
    public Optional<OpenApiEndpoint> getByPath(String path) {
        return Optional.ofNullable(pathMap.get(path));
    }

    /**
     * 判断某个路径是否需要API Key认证
     */
    public boolean needAuth(String path) {
        OpenApiEndpoint endpoint = pathMap.get(path);
        // 未注册的接口默认需要认证
        return endpoint == null || endpoint.isNeedAuth();
    }

    /**
     * 判断某个路径是否是已注册的开放接口
     */
    public boolean isRegistered(String path) {
        return pathMap.containsKey(path);
    }

    /**
     * 检查API Key是否有权限访问指定路径
     * @param permissions API Key的权限字符串（逗号分隔的permission标识）
     * @param path 请求路径
     */
    public boolean hasPermission(String permissions, String path) {
        if (permissions == null || permissions.isEmpty()) {
            // 没有指定权限，不能访问任何接口
            return false;
        }
        OpenApiEndpoint endpoint = pathMap.get(path);
        if (endpoint == null) {
            return false;
        }
        Set<String> permSet = Arrays.stream(permissions.split(","))
                .map(String::trim)
                .collect(Collectors.toSet());
        return permSet.contains(endpoint.getPermission());
    }
}
