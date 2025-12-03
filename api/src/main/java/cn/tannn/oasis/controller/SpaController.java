package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.authentication.ApiMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * SPA 前端路由控制器
 * <p>
 * 用于处理已知的前端路由，避免进入 404 流程：
 * - 这个控制器处理已知的前端路由，直接转发到 index.html
 * - 对于未知的前端路由，会被 SpaFallbackExceptionHandler 捕获并转发
 * - 这样可以提高已知路由的性能
 * </p>
 *
 * @author tannn
 */
@Controller
public class SpaController {

    /**
     * 处理已知的前端路由
     * 将这些路由请求直接转发到 index.html，避免 404 流程
     */
    @ApiMapping(value = {
            "/",
            "/admin",
            "/admin/**"
    }, method = RequestMethod.GET, checkToken = false)
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
