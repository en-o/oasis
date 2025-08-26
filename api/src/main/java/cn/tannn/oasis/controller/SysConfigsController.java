
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.constant.SQLOperator;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.LoginPassword;
import cn.tannn.oasis.controller.dto.SysConfigsEdit;
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.SysConfigsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * 系统配置表
 *
 * @author tan
 * @date 2025-08-26
 */
@PathRestController("sysConfigs")
@Slf4j
@Tag(name = "系统配置")
@RequiredArgsConstructor
public class  SysConfigsController {

    private final SysConfigsService sysConfigsService;

    @GetMapping("/")
    @Operation(summary = "查询系统配置", description = "详情")
    public ResultVO<SysConfigs> info() {
        SysConfigs bean = sysConfigsService.findOnly("configKey", "MAIN").orElse(SysConfigs.newInstance());
        return ResultVO.success(bean);
    }

    @Operation(summary = "编辑系统配置表")
    @PostMapping("edit")
    public ResultVO<String> edit(@RequestBody  @Valid SysConfigsEdit edit)  {
        sysConfigsService.update(edit, SQLOperator.EQ);
        return ResultVO.success();
    }

    @PostMapping(value = "/login")
    public ResultVO<Boolean> login(LoginPassword login){
        sysConfigsService.login(login.getUsername(), login.getPassword());
        return ResultVO.success("登录成功",true);
    }

}
