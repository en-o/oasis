package cn.tannn.oasis.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA 回退控制器
 * 处理 404 错误，将前端路由请求转发到 index.html
 * API 请求的 404 正常返回错误，不会被转发
 *
 * @author tannn
 */
@Controller
public class SpaFallbackController implements ErrorController {

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
                    // 返回 null 会使用 Spring Boot 默认的错误处理
                    return null;
                }

                // 非 API 请求（如自定义页面 /test, /dev 等），转发到 index.html
                // 让前端 React Router 处理
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
}
