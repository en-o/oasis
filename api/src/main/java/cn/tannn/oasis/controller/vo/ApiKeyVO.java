package cn.tannn.oasis.controller.vo;

import cn.tannn.oasis.entity.ApiKey;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * API Key 返回VO
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-02-05
 */
@Schema(description = "API Key返回信息")
@ToString
@Getter
@Setter
public class ApiKeyVO {

    @Schema(description = "ID")
    private Integer id;

    @Schema(description = "API Key（列表时脱敏显示）")
    private String apiKey;

    @Schema(description = "名称")
    private String name;

    @Schema(description = "过期时间")
    private LocalDateTime expireTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "状态；0、禁用，1、启用")
    private Integer status;

    @Schema(description = "权限范围")
    private String permissions;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "是否已过期")
    private Boolean expired;

    /**
     * 从实体转换（脱敏）
     */
    public static ApiKeyVO fromEntity(ApiKey entity) {
        return fromEntity(entity, true);
    }

    /**
     * 从实体转换
     *
     * @param entity 实体
     * @param mask   是否脱敏
     */
    public static ApiKeyVO fromEntity(ApiKey entity, boolean mask) {
        ApiKeyVO vo = new ApiKeyVO();
        vo.setId(entity.getId());
        vo.setApiKey(mask ? maskKey(entity.getApiKey()) : entity.getApiKey());
        vo.setName(entity.getName());
        vo.setExpireTime(entity.getExpireTime());
        vo.setCreateTime(entity.getCreateTime());
        vo.setStatus(entity.getStatus());
        vo.setPermissions(entity.getPermissions());
        vo.setRemark(entity.getRemark());
        vo.setExpired(entity.isExpired());
        return vo;
    }

    /**
     * 脱敏显示API Key
     */
    private static String maskKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 12) {
            return "****";
        }
        return apiKey.substring(0, 8) + "****" + apiKey.substring(apiKey.length() - 4);
    }
}
