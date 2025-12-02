package cn.tannn.oasis.entity;

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

/**
 * 平台字典
 * 用于管理不同的导航页面平台
 *
 * @author tan
 */
@Entity
@Table(name = "platform_dict", indexes = {
        @Index(name = "idx_route_path", columnList = "routePath", unique = true),
        @Index(name = "idx_enabled", columnList = "enabled")
})
@Comment("平台字典")
@Schema(description = "平台字典 - 管理不同的导航页面平台")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class PlatformDict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "主键ID")
    private Integer id;

    @Column(columnDefinition = "varchar(100)", nullable = false, unique = true)
    @Comment("路由路径")
    @Schema(description = "路由路径，如：dev、cp、public（不包含前缀斜杠）", example = "dev")
    private String routePath;

    @Column(columnDefinition = "varchar(100)", nullable = false)
    @Comment("平台名称")
    @Schema(description = "平台名称", example = "开发运维平台")
    private String platformName;

    @Column(columnDefinition = "varchar(500)")
    @Comment("描述说明")
    @Schema(description = "描述说明")
    private String description;

    @Column(columnDefinition = "boolean")
    @ColumnDefault("true")
    @Comment("是否启用")
    @Schema(description = "是否启用")
    private Boolean enabled;

    @Column(columnDefinition = "int")
    @ColumnDefault("1")
    @Comment("排序值")
    @Schema(description = "排序值，数字越小越靠前")
    private Integer sort;

    /**
     * 检查路由路径是否为保留路径
     */
    public static boolean isReservedPath(String path) {
        if (path == null) {
            return false;
        }
        String cleanPath = path.trim().toLowerCase();
        // 移除前缀斜杠
        if (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }
        // 检查是否为空或保留路径
        return cleanPath.isEmpty() || "admin".equals(cleanPath);
    }

    /**
     * 验证路由路径格式
     */
    public static boolean isValidRoutePath(String path) {
        if (path == null || path.trim().isEmpty()) {
            return false;
        }
        String cleanPath = path.trim();
        // 移除前缀斜杠
        if (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }
        // 只能包含字母、数字、横杠和下划线
        return cleanPath.matches("^[a-zA-Z0-9-_]+$");
    }
}
