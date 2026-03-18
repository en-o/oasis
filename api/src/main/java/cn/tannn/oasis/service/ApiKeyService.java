package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.controller.dto.ApiKeyAdd;
import cn.tannn.oasis.entity.ApiKey;
import jakarta.validation.Valid;

import java.util.Optional;

/**
 * API Key 服务接口
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-02-05
 */
public interface ApiKeyService extends J2Service<ApiKey> {

    /**
     * 生成API Key
     *
     * @param add 创建参数
     * @return 新创建的ApiKey（包含完整key）
     */
    ApiKey generateApiKey(@Valid ApiKeyAdd add);

    /**
     * 验证API Key是否有效
     *
     * @param apiKey API Key字符串
     * @return true有效 false无效
     */
    boolean validateApiKey(String apiKey);

    /**
     * 根据API Key获取实体
     *
     * @param apiKey API Key字符串
     * @return ApiKey实体
     */
    Optional<ApiKey> getByApiKey(String apiKey);

    /**
     * 检查是否有指定权限
     *
     * @param apiKey     API Key字符串
     * @param permission 权限标识
     * @return true有权限
     */
    boolean hasPermission(String apiKey, String permission);

    /**
     * 禁用API Key
     *
     * @param id API Key ID
     */
    void revokeApiKey(Integer id);

    /**
     * 启用API Key
     *
     * @param id API Key ID
     */
    void enableApiKey(Integer id);
}
