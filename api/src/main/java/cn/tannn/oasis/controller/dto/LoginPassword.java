package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;

/**
 * 用户登录（账密）
 * @author tan
 * @date 2022/7/1  11:13
 */
@Schema(description = "用户登录（账密）")
@ToString
@Getter
@Setter
public class LoginPassword extends SerializableBean<LoginPassword> {
    /**
     * 登录名
     */
    @Schema(description = "登录名", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "登录名不能为空")
    private String username;

    /**
     * 登录密码
     */
    @Schema(description = "登录密码", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "登录密码不能为空")
    private String password;


    public void setUsername(String loginName) {
        this.username = StringUtils.trim(loginName);
    }

}
