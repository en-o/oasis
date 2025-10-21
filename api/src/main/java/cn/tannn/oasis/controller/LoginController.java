package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.authentication.ApiMapping;
import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jwt.standalone.pojo.TokenSign;
import cn.tannn.jdevelops.jwt.standalone.service.LoginService;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.jdevelops.utils.jwt.module.SignEntity;
import cn.tannn.oasis.config.DefaultSysConfig;
import cn.tannn.oasis.controller.dto.LoginPassword;
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.SysConfigsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Optional;

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
    private final DefaultSysConfig defaultSysConfig;

    @Operation(summary = "登录")
    @ApiMapping(value = "/login",checkToken = false,method = RequestMethod.POST)
    public ResultVO<String> login(@RequestBody @Valid LoginPassword login){
        sysConfigsService.login(login.getUsername(), login.getPassword());
        SignEntity<String> signEntity = SignEntity.init(login.getUsername());
        TokenSign token = loginService.login(signEntity);
        return ResultVO.success("登录成功",token.getSign());
    }

    @Operation(summary = "初始化系统配置-里面有登录信息")
    @ApiMapping(value = "init",checkToken = false,method = RequestMethod.GET)
    public ResultVO<Boolean> initSysConfig()  {
        Optional<SysConfigs> configs = sysConfigsService.findOnly("configKey", "MAIN");
        if(configs.isPresent()){
            log.info("系统配置已存在不允许初始化");
            return ResultVO.success("系统配置已存在不允许初始化",false);
        }else {
            SysConfigs bean = SysConfigs.newInstance(defaultSysConfig);
            sysConfigsService.saveOne(bean);
            log.info("完成系统配置初始化");
            return ResultVO.success("完成初始化",true);
        }

    }

}
