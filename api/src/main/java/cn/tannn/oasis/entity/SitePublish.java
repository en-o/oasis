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
     * 是否默认页
     */
    @Column(columnDefinition = "boolean")
    @ColumnDefault("false")
    @Comment("是否默认页")
    @Schema(description = "是否默认页，true默认页，false正常页")
    private Boolean defPage;

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
     * 保留路径包括：
     * - 根路径（空）
     * - 管理路径：admin
     * - API 路径：navigation, navCategory, sysConfigs, webs, data, sitePublish, login, init, api
     * - 文档路径：doc, v3, swagger, webjars
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
        // 移除后缀斜杠
        if (cleanPath.endsWith("/")) {
            cleanPath = cleanPath.substring(0, cleanPath.length() - 1);
        }

        // 检查是否为空（根路径）
        if (cleanPath.isEmpty()) {
            return true;
        }

        // 提取第一段路径（用于匹配）
        String firstSegment = cleanPath.split("/")[0];

        // 保留路径列表
        return "admin".equals(firstSegment) ||
               "navigation".equals(firstSegment) ||
               "navcategory".equals(firstSegment) ||
               "sysconfigs".equals(firstSegment) ||
               "webs".equals(firstSegment) ||
               "data".equals(firstSegment) ||
               "sitepublish".equals(firstSegment) ||
               "login".equals(firstSegment) ||
               "init".equals(firstSegment) ||
               "api".equals(firstSegment) ||
               "doc".equals(firstSegment) ||
               "v3".equals(firstSegment) ||
               "swagger".equals(firstSegment) ||
               "webjars".equals(firstSegment);
    }

    /**
     * 获取保留路径列表（用于错误提示）
     */
    public static String getReservedPathsDescription() {
        return "/ (根路径)、admin、navigation、navCategory、sysConfigs、webs、data、sitePublish、" +
               "login、init、api、doc、v3、swagger、webjars";
    }
}
