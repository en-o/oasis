package cn.tannn.oasis.controller;

import cn.tannn.oasis.entity.SitePublish;
import cn.tannn.oasis.service.SitePublishService;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA 回退控制器
 * 处理 404 错误，将前端路由请求转发到 index.html
 * API 请求的 404 正常返回错误，不会被转发
 *
 * 支持两种模式：
 * 1. 严格模式（strict-route-validation=true）：只有在 SitePublish 中配置的路径才会被转发（生产环境推荐）
 * 2. 宽松模式（strict-route-validation=false）：所有非 API 路径都转发到前端（开发环境推荐）
 *
 * @author tannn
 */
@Controller
@RequiredArgsConstructor
public class SpaFallbackController implements ErrorController {

    private final SitePublishService sitePublishService;

    /**
     * 是否启用严格路由验证
     * true: 只有配置的路径才能访问（生产模式）
     * false: 所有非 API 路径都转发到前端（开发模式）
     */
    @Value("${oasis.config.strict-route-validation:true}")
    private boolean strictRouteValidation;

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());

            // 只处理 404 错误
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                Object errorUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
                String path = errorUri != null ? errorUri.toString() : "";

                // 如果是 API 请求，返回 404 错误而不是转发到 index.html
                if (isApiRequest(path)) {
                    return null;
                }

                // 严格模式：只有配置的路径才转发
                if (strictRouteValidation) {
                    if (isConfiguredRoute(path)) {
                        return "forward:/index.html";
                    }
                    // 未配置的路径，返回 404
                    return null;
                }

                // 宽松模式：所有非 API 路径都转发到前端处理
                return "forward:/index.html";
            }
        }

        // 其他错误使用默认处理
        return null;
    }

    /**
     * 判断是否是 API 请求
     * 根据路径前缀判断
     */
    private boolean isApiRequest(String path) {
        return path.startsWith("/navigation") ||
               path.startsWith("/navCategory") ||
               path.startsWith("/sysConfigs") ||
               path.startsWith("/webs") ||
               path.startsWith("/data") ||
               path.startsWith("/sitePublish") ||
               path.startsWith("/login") ||
               path.startsWith("/init") ||
               path.startsWith("/api");
    }

    /**
     * 判断是否是已配置的路由
     * 检查路径是否在 SitePublish 配置中
     * 仅在严格模式下使用
     */
    private boolean isConfiguredRoute(String path) {
        // 移除开头的斜杠
        String routePath = path.startsWith("/") ? path.substring(1) : path;

        // 空路径不处理（首页由 SpaController 处理）
        if (routePath.isEmpty()) {
            return false;
        }

        try {
            // 查询配置
            SitePublish config = sitePublishService.getByRoutePath(routePath);
            // 如果配置存在且启用，则认为是有效路由
            return config != null && config.getEnabled();
        } catch (Exception e) {
            // 查询失败或未找到，返回 false
            return false;
        }
    }
}
