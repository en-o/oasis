package cn.tannn.oasis.config;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 开放API配置
 *
 * @author tan
 * @date 2025-02-05
 */
@Component
@ConfigurationProperties(prefix = "oasis.openapi")
@Getter
@Setter
@ToString
public class OpenApiConfig {

    /**
     * API Key加密密钥（不同部署必须使用不同的密钥）
     */
    private String secretKey = "default-oasis-secret-key-2024";

    /**
     * API Key前缀
     */
    private String keyPrefix = "oasis_";
}
