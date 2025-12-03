package cn.tannn.oasis.config;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * SPA 回退异常处理器
 * <p>
 * Spring Boot 3 中处理 SPA 路由的最终解决方案：
 * 1. 使用 @ControllerAdvice 拦截 NoResourceFoundException
 * 2. 对于非 API、非静态资源的请求，转发到 index.html
 * 3. 优先级设为 -1000（比 jdevelops 的 ControllerExceptionHandler 更高）
 * </p>
 * <p>
 * Spring Boot 3.2+ 将静态资源 404 作为 NoResourceFoundException 抛出，
 * 会被全局异常处理器捕获，因此需要在全局异常处理器之前拦截该异常。
 * </p>
 *
 * @author tannn
 */
@ControllerAdvice
@Order(-1000)
public class SpaFallbackExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(SpaFallbackExceptionHandler.class);

    /**
     * 处理 NoResourceFoundException
     * 将非 API、非静态资源的 404 请求转发到 index.html
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ModelAndView handleNoResourceFound(NoResourceFoundException ex, HttpServletRequest request) {
        String path = request.getRequestURI();

        log.debug("NoResourceFoundException for path: {}", path);

        // 如果是 API 请求，返回 null 使用默认的错误处理
        if (isApiRequest(path)) {
            log.debug("API request, use default error handling: {}", path);
            return null;
        }

        // 如果是静态资源请求（带文件扩展名），返回 null 使用默认的错误处理
        if (isStaticResource(path)) {
            log.debug("Static resource request, use default error handling: {}", path);
            return null;
        }

        // 如果是文档请求，返回 null 使用默认的错误处理
        if (isDocRequest(path)) {
            log.debug("Doc request, use default error handling: {}", path);
            return null;
        }

        // 所有其他 404 请求都转发到 index.html，由前端路由处理
        log.info("SPA fallback: {} -> /index.html", path);
        return new ModelAndView("forward:/index.html");
    }

    /**
     * 判断是否是 API 请求
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
     * 判断是否是静态资源请求
     */
    private boolean isStaticResource(String path) {
        return path.matches(".*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json|txt|xml|html)$");
    }

    /**
     * 判断是否是文档相关请求
     */
    private boolean isDocRequest(String path) {
        return path.startsWith("/doc.html") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger") ||
               path.startsWith("/webjars/");
    }
}
