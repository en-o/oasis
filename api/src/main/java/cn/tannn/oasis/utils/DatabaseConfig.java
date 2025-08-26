package cn.tannn.oasis.utils;

import cn.tannn.oasis.entity.BackupConfig;
import lombok.Data;
import org.springframework.core.env.ConfigurableEnvironment;

@Data
public class DatabaseConfig {
    private String env;
    private String url;
    private String username;
    private String password;
    private String driverClassName;

    public DatabaseConfig(String env, String url, String username, String password, String driverClassName) {
        this.env = env;
        this.url = url;
        this.username = username;
        this.password = password;
        this.driverClassName = driverClassName;
    }


    /**
     * 从Spring环境配置创建数据库配置
     */
    public static DatabaseConfig fromEnvironmentH2(ConfigurableEnvironment env) {
        String activeProfile = env.getProperty("spring.profiles.active", "dev");

        // 优先从环境变量读取，如果没有则从Spring配置读取
        String url = System.getenv("CONFIGS_DB_URL");
        if (url == null || url.trim().isEmpty()) {
            url = env.getProperty("spring.datasource.url");
        }

        String username = System.getenv("CONFIGS_DB_USERNAME");
        if (username == null || username.trim().isEmpty()) {
            username = env.getProperty("spring.datasource.username");
        }

        String password = System.getenv("CONFIGS_DB_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            password = env.getProperty("spring.datasource.password");
        }

        String driverClassName = System.getenv("CONFIGS_DB_DRIVER_CLASS_NAME");
        if (driverClassName == null || driverClassName.trim().isEmpty()) {
            driverClassName = env.getProperty("spring.datasource.driver-class-name");
        }

        return new DatabaseConfig(
                activeProfile,
                url,
                username,
                password,
                driverClassName
        );
    }


    /**
     * 创建 MySQL 数据库配置
     */
    public static DatabaseConfig createMysqlConfig(BackupConfig config) {
        return new DatabaseConfig(
                "backup",
                config.getUrl(),
                config.getUsername(),
                config.getPassword(),
                config.getDriverClassName()
        );
    }

}
