package cn.tannn.oasis.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
 * 数据备份配置
 */
@Entity
@Table(name = "backup_config", indexes = {
        @Index(name = "idx_url", columnList = "url", unique = true),
        @Index(name = "idx_enabled", columnList = "enabled")
})
@Comment("数据备份配置")
@Schema(description = "数据备份配置")
@Getter
@Setter
@ToString(exclude = "password") // 避免密码在日志中泄露
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class BackupConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "主键ID")
    private Integer id;

    @Column(columnDefinition = "varchar(500)", nullable = false)
    @Comment("数据库连接地址")
    @Schema(description = "数据库连接地址", example = "jdbc:mysql://localhost:3306/backup_db")
    @NotBlank(message = "数据库连接地址不能为空")
    private String url;

    @Column(columnDefinition = "varchar(100)", nullable = false)
    @Comment("账户")
    @Schema(description = "数据库用户名")
    @NotBlank(message = "数据库用户名不能为空")
    private String username;

    @Column(columnDefinition = "varchar(200)", nullable = false)
    @Comment("密码")
    @Schema(description = "数据库密码")
    @NotBlank(message = "数据库密码不能为空")
    private String password;

    @Column(columnDefinition = "varchar(200)", nullable = false)
    @Comment("驱动类名")
    @Schema(description = "数据库驱动类名", example = "com.mysql.cj.jdbc.Driver")
    @NotBlank(message = "数据库驱动类名不能为空")
    private String driverClassName;

    @Column(columnDefinition = "varchar(100)")
    @Comment("定时表达式（Cron表达式或秒数）")
    @Schema(description = "定时表达式，支持Cron表达式（如：0 0 2 * * ?）或秒数（如：3600）",
            example = "0 0 2 * * ?")
    private String schedule;

    @Column(columnDefinition = "boolean")
    @ColumnDefault("false")
    @Comment("是否启用定时备份")
    @Schema(description = "是否启用定时备份")
    private Boolean enabled;

    @Column(columnDefinition = "varchar(200)")
    @Comment("配置描述")
    @Schema(description = "配置描述")
    private String description;

    @Column(name = "create_time", columnDefinition = "datetime")
    @Comment("创建时间")
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Column(name = "update_time", columnDefinition = "datetime")
    @Comment("更新时间")
    @Schema(description = "更新时间")
    private LocalDateTime updateTime;

    @Column(name = "last_backup_time", columnDefinition = "datetime")
    @Comment("最后备份时间")
    @Schema(description = "最后备份时间")
    private LocalDateTime lastBackupTime;

    @Column(name = "backup_count", columnDefinition = "bigint")
    @ColumnDefault("0")
    @Comment("备份次数")
    @Schema(description = "备份次数")
    private Long backupCount;

    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
        if (this.enabled == null) {
            this.enabled = false;
        }
        if (this.backupCount == null) {
            this.backupCount = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateTime = LocalDateTime.now();
    }

    /**
     * 更新备份统计信息
     */
    public void updateBackupStats() {
        this.lastBackupTime = LocalDateTime.now();
        this.backupCount = (this.backupCount != null ? this.backupCount : 0) + 1;
    }

    /**
     * 检查配置是否完整
     */
    public boolean isConfigComplete() {
        return url != null && !url.trim().isEmpty()
                && username != null && !username.trim().isEmpty()
                && password != null && !password.trim().isEmpty()
                && driverClassName != null && !driverClassName.trim().isEmpty();
    }

    /**
     * 检查是否需要定时备份
     */
    public boolean needScheduledBackup() {
        return Boolean.TRUE.equals(enabled)
                && schedule != null
                && !schedule.trim().isEmpty()
                && isConfigComplete();
    }

    /**
     * 获取显示用的URL（隐藏密码）
     */
    public String getDisplayUrl() {
        if (url == null) return null;
        return url.replaceAll("password=([^&;]+)", "password=****");
    }
}
