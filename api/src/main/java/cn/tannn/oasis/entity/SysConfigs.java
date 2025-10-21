package cn.tannn.oasis.entity;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import cn.tannn.oasis.config.DefaultSysConfig;
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
 * 系统设置
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/26 09:26
 */
@Entity
@Table(name = "system_config", indexes = {
        @Index(name = "idx_config_key", columnList = "configKey", unique = true)
})
@Comment("系统配置表")
@Schema(description = "系统配置")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class SysConfigs extends SerializableBean<SysConfigs> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    /**
     * 配置键（唯一）
     * 由于系统配置通常只有一条记录，可通过 config_key = 'MAIN' 或其他固定值来标识
     */
    @Column( columnDefinition = "varchar(100) not null",nullable = false)
    @Comment("配置键")
    @Schema(description = "配置键")
    private String configKey;

    /**
     * 站点标题
     */
    @Column(columnDefinition = "varchar(100) not null")
    @Comment("站点标题")
    @Schema(description = "站点标题")
    private String siteTitle;

    /**
     * 站点 Logo[base64/url]
     */
    @Column(columnDefinition = "text")
    @Comment("站点 Logo[base64/url]")
    @Schema(description = "站点 Logo[base64/url]")
    private String siteLogo;

    /**
     * 默认打开方式；0、当前页，1、新标签页，默认1
     */
    @Column(nullable = false, columnDefinition = "smallint")
    @ColumnDefault("1")
    @Comment("默认打开方式；0、当前页，1、新标签页")
    @Schema(description = "默认打开方式；0、当前页，1、新标签页")
    private Integer defaultOpenMode;

    /**
     * 是否隐藏后台入口；0、显示，1、隐藏，默认0
     */
    @Column(nullable = false, columnDefinition = "smallint")
    @ColumnDefault("0")
    @Comment("是否隐藏后台入口；0、显示，1、隐藏")
    @Schema(description = "是否隐藏后台入口；0、显示，1、隐藏")
    private Integer hideAdminEntry;

    /**
     * 管理员用户名
     */
    @Column(columnDefinition = "varchar(50) not null")
    @Comment("管理员用户名")
    @Schema(description = "管理员用户名")
    private String username;

    /**
     * 管理员密码
     */
    @Column(columnDefinition = "varchar(255) not null")
    @Comment("管理员密码")
    @Schema(description = "管理员密码")
    private String password;

    public static SysConfigs newInstance(DefaultSysConfig defaultSysConfig){
        SysConfigs sysConfigs = new SysConfigs();
        sysConfigs.setConfigKey("MAIN");
        sysConfigs.setSiteTitle(defaultSysConfig.getDefSiteTitle());
        sysConfigs.setDefaultOpenMode(1);
        sysConfigs.setHideAdminEntry(0);
        sysConfigs.setUsername(defaultSysConfig.getDefUsername());
        sysConfigs.setPassword(defaultSysConfig.getDefPassword());
        return sysConfigs;
    }

}
