package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jwt.standalone.pojo.TokenSign;
import cn.tannn.jdevelops.jwt.standalone.service.LoginService;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.jdevelops.utils.jwt.module.SignEntity;
import cn.tannn.oasis.controller.dto.LoginPassword;
import cn.tannn.oasis.service.SysConfigsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;

/**
 * 登录
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/27 16:49
 */
@PathRestController()
@Slf4j
@Tag(name = "登录")
@RequiredArgsConstructor
public class LoginController {

    private final SysConfigsService sysConfigsService;
    private final LoginService loginService;

    @Operation(summary = "登录")
    @PostMapping(value = "/login")
    public ResultVO<String> login(LoginPassword login){
        sysConfigsService.login(login.getUsername(), login.getPassword());
        SignEntity<String> signEntity = SignEntity.init(login.getUsername());
        TokenSign token = loginService.login(signEntity);
        return ResultVO.success("登录成功",token.getSign());
    }

}
