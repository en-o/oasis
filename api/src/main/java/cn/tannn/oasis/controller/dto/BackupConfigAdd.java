// src/main/java/cn/tannn/oasis/dto/BackupConfigAdd.java
package cn.tannn.oasis.controller.dto;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BackupConfigAdd extends SerializableBean<BackupConfigAdd> {
    @NotBlank(message = "数据库连接地址不能为空")
    @Schema(description = "数据库连接地址", requiredMode = Schema.RequiredMode.REQUIRED)
    private String url;

    @NotBlank(message = "数据库用户名不能为空")
    @Schema(description = "数据库用户名", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @NotBlank(message = "数据库密码不能为空")
    @Schema(description = "数据库密码", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "定时表达式，支持Cron表达式（如：0 0 2 * * ?）或秒数（如：3600）",
            example = "0 0 2 * * ?")
    private String schedule;

    @Schema(description = "是否启用定时备份",defaultValue = "false")
    private Boolean enabled;

    @Schema(description = "配置描述")
    private String description;
}
