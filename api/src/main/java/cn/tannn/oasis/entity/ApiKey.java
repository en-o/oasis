package cn.tannn.oasis.entity;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

/**
 * API Key表 - 第三方开发授权
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-02-05
 */
@Entity
@Table(name = "api_key", indexes = {
        @Index(name = "idx_api_key", columnList = "apiKey", unique = true)
})
@Comment("API Key表")
@Schema(description = "API Key")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class ApiKey extends SerializableBean<ApiKey> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * API Key
     */
    @Column(columnDefinition = "varchar(128)", nullable = false, unique = true)
    @Comment("API Key")
    @Schema(description = "API Key")
    private String apiKey;

    /**
     * 名称/描述
     */
    @Column(columnDefinition = "varchar(100)", nullable = false)
    @Comment("名称")
    @Schema(description = "名称")
    private String name;

    /**
     * 过期时间
     */
    @Column
    @Comment("过期时间，null表示永久")
    @Schema(description = "过期时间，null表示永久")
    private LocalDateTime expireTime;

    /**
     * 创建时间
     */
    @Column(nullable = false)
    @Comment("创建时间")
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    /**
     * 状态；0、禁用，1、启用，默认1
     */
    @Column(columnDefinition = "smallint")
    @ColumnDefault("1")
    @Comment("状态；0、禁用，1、启用")
    @Schema(description = "状态；0、禁用，1、启用")
    private Integer status;

    /**
     * 权限范围（逗号分隔）: nav,category,publish
     */
    @Column(columnDefinition = "varchar(200)")
    @Comment("权限范围，逗号分隔：nav,category,publish")
    @Schema(description = "权限范围，逗号分隔：nav,category,publish")
    private String permissions;

    /**
     * 备注
     */
    @Column(columnDefinition = "varchar(500)")
    @Comment("备注")
    @Schema(description = "备注")
    private String remark;

    /**
     * 检查是否已过期
     */
    public boolean isExpired() {
        return expireTime != null && LocalDateTime.now().isAfter(expireTime);
    }

    /**
     * 检查是否启用
     */
    public boolean isEnabled() {
        return status != null && status == 1;
    }

    /**
     * 检查是否有效（启用且未过期）
     */
    public boolean isValid() {
        return isEnabled() && !isExpired();
    }

    /**
     * 检查是否有指定权限
     */
    public boolean hasPermission(String permission) {
        if (permissions == null || permissions.trim().isEmpty()) {
            return true; // 未设置权限范围表示拥有所有权限
        }
        String[] perms = permissions.split(",");
        for (String perm : perms) {
            if (perm.trim().equalsIgnoreCase(permission)) {
                return true;
            }
        }
        return false;
    }
}
