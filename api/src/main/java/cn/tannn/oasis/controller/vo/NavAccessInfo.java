package cn.tannn.oasis.controller.vo;

import cn.tannn.oasis.entity.Navigation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.Comment;

/**
 * 网页的访问账号
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/27 16:21
 */
@Schema(description = "网页的访问账号")
@Getter
@Setter
@ToString
public class NavAccessInfo {

    /**
     * 登录账号
     */
    @Column(columnDefinition = "varchar(100)")
    @Comment("登录账号")
    @Schema(description = "登录账号")
    private String account;

    /**
     * 登录密码
     */
    @Column(columnDefinition = "varchar(255)")
    @Comment("登录密码")
    @Schema(description = "登录密码")
    private String password;

    public NavAccessInfo() {
    }

    public NavAccessInfo(Navigation navigation ) {
        this.account = navigation.getAccount();
        this.password = navigation.getPassword();
    }

    public NavAccessInfo(String account, String password) {
        this.account = account;
        this.password = password;
    }
}
