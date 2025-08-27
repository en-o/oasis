package cn.tannn.oasis.controller.vo;

import cn.tannn.oasis.entity.SysConfigs;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/27 14:50
 */
@Data
public class SiteInfo {

    /**
     * 站点标题
     */
    @Schema(description = "站点标题")
    private String siteTitle;


    /**
     * 站点 Logo
     */
    @Schema(description = "站点 Logo[base64/url]")
    private String siteLogo;

    /**
     * 默认打开方式；0、当前页，1、新标签页
     */
    @Schema(description = "默认打开方式；0、当前页，1、新标签页")
    private Integer defaultOpenMode;

    /**
     * 是否隐藏后台入口；0、显示，1、隐藏
     */
    @Schema(description = "是否隐藏后台入口；0、显示，1、隐藏")
    private Integer hideAdminEntry;


    public static SiteInfo to(SysConfigs configs){
        SiteInfo siteInfo = new SiteInfo();
        siteInfo.setSiteTitle(configs.getSiteTitle());
        siteInfo.setSiteLogo(configs.getSiteLogo());
        siteInfo.setDefaultOpenMode(configs.getDefaultOpenMode());
        siteInfo.setHideAdminEntry(configs.getHideAdminEntry());
        return siteInfo;
    }
}
