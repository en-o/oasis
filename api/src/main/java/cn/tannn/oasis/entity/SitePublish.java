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

/**
 * 站点发布配置表
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-12-02
 */
@Entity
@Table(name = "site_publish", indexes = {
        @Index(name = "idx_route_path", columnList = "routePath", unique = true)
})
@Comment("站点发布配置表")
@Schema(description = "站点发布配置")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class SitePublish extends SerializableBean<SitePublish> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * 页面名称
     */
    @Column(columnDefinition = "varchar(100)", nullable = false)
    @Comment("页面名称")
    @Schema(description = "页面名称")
    private String name;

    /**
     * 路由路径（如：site、dev、cp）
     * 不允许使用 admin 和空（根路径）
     */
    @Column(columnDefinition = "varchar(100)", nullable = false)
    @Comment("路由路径")
    @Schema(description = "路由路径，如：site、dev、cp（不包含前缀斜杠，不允许使用admin和根路径）")
    private String routePath;

    /**
     * 是否隐藏管理入口
     */
    @Column(columnDefinition = "boolean")
    @ColumnDefault("false")
    @Comment("是否隐藏管理入口")
    @Schema(description = "是否隐藏管理入口，true隐藏，false显示")
    private Boolean hideAdminEntry;

    /**
     * 是否启用
     */
    @Column(columnDefinition = "boolean")
    @ColumnDefault("true")
    @Comment("是否启用")
    @Schema(description = "是否启用，true启用，false禁用")
    private Boolean enabled;

    /**
     * 排序值（越小越靠前）
     */
    @Column(columnDefinition = "int")
    @ColumnDefault("1")
    @Comment("排序值")
    @Schema(description = "排序值")
    private Integer sort;

    /**
     * 描述说明
     */
    @Column(columnDefinition = "varchar(500)")
    @Comment("描述说明")
    @Schema(description = "描述说明")
    private String description;

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
}
