package cn.tannn.oasis.config;

import cn.tannn.oasis.controller.vo.ApiParam;
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

    // 通用响应结构
    private static final String RESPONSE_SUCCESS = """
            {
              "code": 200,
              "message": "操作成功",
              "data": ...,
              "ts": 1738742400000
            }""";

    private static final String RESPONSE_PAGE = """
            {
              "code": 200,
              "message": "查询成功",
              "data": {
                "currentPage": 1,
                "pageSize": 10,
                "totalPages": 1,
                "total": 5,
                "rows": [...]
              },
              "ts": 1738742400000
            }""";

    public OpenApiRegistry() {
        // ===== 公开接口（无需认证） =====
        register(OpenApiEndpoint.builder()
                .permission("endpoints").name("获取开放接口清单")
                .path("/openapi/endpoints").method("GET").needAuth(false)
                .description("获取所有可用的开放API接口列表")
                .responseExample("""
                        {
                          "code": 200,
                          "data": [
                            {
                              "permission": "nav:page",
                              "name": "分页查询导航",
                              "path": "/openapi/nav/page",
                              "method": "POST",
                              "needAuth": true
                            }
                          ]
                        }""")
                .build());

        // ===== 导航相关 =====
        register(OpenApiEndpoint.builder()
                .permission("nav:page").name("分页查询导航")
                .path("/openapi/nav/page").method("POST").needAuth(true)
                .description("分页查询导航列表，支持按发布平台过滤")
                .requestParams(Arrays.asList(
                        ApiParam.builder().name("showPlatform").type("String").required(false)
                                .description("发布页面，逗号分隔的routePath，如：dev,cp,public").build(),
                        ApiParam.builder().name("name").type("String").required(false)
                                .description("名称（模糊匹配）").build(),
                        ApiParam.builder().name("category").type("String").required(false)
                                .description("分类（模糊匹配）").build(),
                        ApiParam.builder().name("page").type("Object").required(false)
                                .description("分页参数")
                                .children(Arrays.asList(
                                        ApiParam.builder().name("pageIndex").type("Integer").required(false)
                                                .description("页码，从1开始").defaultValue("1").build(),
                                        ApiParam.builder().name("pageSize").type("Integer").required(false)
                                                .description("每页条数").defaultValue("10").build()
                                )).build()
                ))
                .requestExample("""
                        {
                          "showPlatform": "dev",
                          "page": {
                            "pageIndex": 1,
                            "pageSize": 10
                          }
                        }""")
                .responseExample(RESPONSE_PAGE)
                .build());

        register(OpenApiEndpoint.builder()
                .permission("nav:add").name("新增导航")
                .path("/openapi/nav/append").method("POST").needAuth(true)
                .description("新增一个导航链接")
                .requestParams(Arrays.asList(
                        ApiParam.builder().name("name").type("String").required(true)
                                .description("名称").build(),
                        ApiParam.builder().name("url").type("String").required(true)
                                .description("访问地址").build(),
                        ApiParam.builder().name("sort").type("Integer").required(false)
                                .description("排序值(默认1,正序)").defaultValue("1").build(),
                        ApiParam.builder().name("category").type("String").required(true)
                                .description("分类，多个逗号隔开").build(),
                        ApiParam.builder().name("icon").type("String").required(false)
                                .description("图标[base64/url]").build(),
                        ApiParam.builder().name("remark").type("String").required(false)
                                .description("备注").build(),
                        ApiParam.builder().name("status").type("Integer").required(false)
                                .description("状态；0=停用，1=启用").defaultValue("1").build(),
                        ApiParam.builder().name("showPlatform").type("String").required(false)
                                .description("发布页面，逗号分隔的routePath，如：dev,cp,public").build()
                ))
                .requestExample("""
                        {
                          "name": "示例网站",
                          "url": "https://example.com",
                          "sort": 1,
                          "category": "工具",
                          "icon": "https://example.com/favicon.ico",
                          "remark": "这是一个示例网站",
                          "status": 1,
                          "showPlatform": "dev"
                        }""")
                .responseExample("""
                        {
                          "code": 200,
                          "message": "创建成功",
                          "data": true,
                          "ts": 1738742400000
                        }""")
                .build());

        register(OpenApiEndpoint.builder()
                .permission("nav:edit").name("修改导航")
                .path("/openapi/nav/edit").method("POST").needAuth(true)
                .description("修改已有的导航链接，只需传入要修改的字段")
                .requestParams(Arrays.asList(
                        ApiParam.builder().name("id").type("Integer").required(true)
                                .description("导航项ID").build(),
                        ApiParam.builder().name("name").type("String").required(false)
                                .description("名称").build(),
                        ApiParam.builder().name("url").type("String").required(false)
                                .description("访问地址").build(),
                        ApiParam.builder().name("sort").type("Integer").required(false)
                                .description("排序值").build(),
                        ApiParam.builder().name("category").type("String").required(false)
                                .description("分类，多个逗号隔开").build(),
                        ApiParam.builder().name("icon").type("String").required(false)
                                .description("图标[base64/url]").build(),
                        ApiParam.builder().name("remark").type("String").required(false)
                                .description("备注").build(),
                        ApiParam.builder().name("status").type("Integer").required(false)
                                .description("状态；0=停用，1=启用").build(),
                        ApiParam.builder().name("showPlatform").type("String").required(false)
                                .description("发布页面，逗号分隔的routePath，如：dev,cp,public").build()
                ))
                .requestExample("""
                        {
                          "id": 1,
                          "name": "修改后的名称",
                          "url": "https://new-url.com",
                          "sort": 2,
                          "status": 1
                        }""")
                .responseExample("""
                        {
                          "code": 200,
                          "message": "修改成功",
                          "data": true,
                          "ts": 1738742400000
                        }""")
                .build());

        // ===== 分类相关 =====
        register(OpenApiEndpoint.builder()
                .permission("category:list").name("获取分类列表")
                .path("/openapi/category/list").method("GET").needAuth(true)
                .description("获取所有导航分类列表")
                .responseExample("""
                        {
                          "code": 200,
                          "data": [
                            {
                              "id": 1,
                              "categoryName": "工具",
                              "sort": 1
                            },
                            {
                              "id": 2,
                              "categoryName": "文档",
                              "sort": 2
                            }
                          ],
                          "ts": 1738742400000
                        }""")
                .build());

        register(OpenApiEndpoint.builder()
                .permission("category:add").name("新增分类")
                .path("/openapi/category/append").method("POST").needAuth(true)
                .description("新增一个导航分类")
                .requestParams(Arrays.asList(
                        ApiParam.builder().name("categoryName").type("String").required(true)
                                .description("分类名称").build(),
                        ApiParam.builder().name("sort").type("Integer").required(false)
                                .description("排序值(默认1,正序)").defaultValue("1").build()
                ))
                .requestExample("""
                        {
                          "categoryName": "新分类",
                          "sort": 10
                        }""")
                .responseExample("""
                        {
                          "code": 200,
                          "message": "创建成功",
                          "data": true,
                          "ts": 1738742400000
                        }""")
                .build());

        // ===== 发布页面相关 =====
        register(OpenApiEndpoint.builder()
                .permission("publish:list").name("获取发布页面列表")
                .path("/openapi/publish/list").method("GET").needAuth(true)
                .description("获取所有发布页面配置列表")
                .responseExample("""
                        {
                          "code": 200,
                          "data": [
                            {
                              "id": 1,
                              "name": "开发环境",
                              "routePath": "dev",
                              "hideAdminEntry": false,
                              "enabled": true,
                              "defPage": true,
                              "sort": 1
                            }
                          ],
                          "ts": 1738742400000
                        }""")
                .build());
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
