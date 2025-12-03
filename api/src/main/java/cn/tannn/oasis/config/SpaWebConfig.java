package cn.tannn.oasis.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Map;

/**
 * SPA 前端路由配置
 * <p>
 * Spring Boot 3 中处理 SPA 路由的最佳实践：
 * 1. 使用 ErrorViewResolver 处理 404 错误，将非 API 请求转发到 index.html
 * 2. 静态资源错误优先级高于普通的 ErrorController，因此使用 ErrorViewResolver 更可靠
 * </p>
 *
 * @author tannn
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    /**
     * 配置视图控制器
     * 显式处理根路径和已知的前端路由
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 根路径转发到 index.html
        registry.addViewController("/").setViewName("forward:/index.html");
    }

    /**
     * 自定义错误视图解析器
     * 处理 404 错误，将非 API 请求转发到 index.html
     * 这是 Spring Boot 3 处理 SPA 路由的推荐方式
     */
    @Bean
    public ErrorViewResolver spaErrorViewResolver() {
        return (request, status, model) -> {
            // 只处理 404 错误
            if (status != HttpStatus.NOT_FOUND) {
                return null;
            }

            String path = request.getRequestURI();

            // 如果是 API 请求，返回 null 使用默认的错误处理
            if (isApiRequest(path)) {
                return null;
            }

            // 如果是静态资源请求（有文件扩展名），返回 null 使用默认的错误处理
            // 这样可以避免将真正的静态资源 404 错误误判为前端路由
            if (isStaticResource(path)) {
                return null;
            }

            // 所有其他 404 请求都转发到 index.html，由前端路由处理
            return new ModelAndView("forward:/index.html");
        };
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
     * 判断是否是静态资源请求
     * 根据文件扩展名判断
     */
    private boolean isStaticResource(String path) {
        // 常见的静态资源扩展名
        return path.matches(".*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json|txt|xml)$");
    }
}
