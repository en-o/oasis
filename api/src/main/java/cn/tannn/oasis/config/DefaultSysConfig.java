package cn.tannn.oasis.config;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/9/8 17:16
 */
@Component
@ConfigurationProperties(prefix = "oasis.config")
@Getter
@Setter
@ToString
public class DefaultSysConfig {
    /**
     * 默认账户名
     */
    private String defUsername = "tan";

    /**
     * 默认账户密码
     */
    private String defPassword = "123";

    /**
     * 默认站点标题
     */
    private String defSiteTitle = "Oasis";
}
