package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.config.OpenApiConfig;
import cn.tannn.oasis.controller.dto.ApiKeyAdd;
import cn.tannn.oasis.dao.ApiKeyDao;
import cn.tannn.oasis.entity.ApiKey;
import cn.tannn.oasis.service.ApiKeyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

/**
 * API Key 服务实现
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-02-05
 */
@Slf4j
@Service
public class ApiKeyServiceImpl extends J2ServiceImpl<ApiKeyDao, ApiKey, Integer> implements ApiKeyService {

    private final OpenApiConfig openApiConfig;

    public ApiKeyServiceImpl(OpenApiConfig openApiConfig) {
        super(ApiKey.class);
        this.openApiConfig = openApiConfig;
    }

    @Override
    public ApiKey generateApiKey(ApiKeyAdd add) {
        // 检查名称是否已存在
        if (getJpaBasicsDao().existsByName(add.getName())) {
            throw new IllegalArgumentException("API Key名称已存在");
        }

        // 生成唯一的API Key
        String rawKey = UUID.randomUUID().toString().replace("-", "");
        String encryptedKey = encryptKey(rawKey);
        String fullKey = openApiConfig.getKeyPrefix() + encryptedKey;

        // 确保生成的key不重复
        while (getJpaBasicsDao().existsByApiKey(fullKey)) {
            rawKey = UUID.randomUUID().toString().replace("-", "");
            encryptedKey = encryptKey(rawKey);
            fullKey = openApiConfig.getKeyPrefix() + encryptedKey;
        }

        // 创建ApiKey实体
        ApiKey apiKey = new ApiKey();
        apiKey.setApiKey(fullKey);
        apiKey.setName(add.getName());
        apiKey.setCreateTime(LocalDateTime.now());
        apiKey.setExpireTime(LocalDateTime.now().plusDays(add.getExpireDays()));
        apiKey.setStatus(1);
        apiKey.setPermissions(add.getPermissions());
        apiKey.setRemark(add.getRemark());

        return getJpaBasicsDao().save(apiKey);
    }

    @Override
    public boolean validateApiKey(String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return false;
        }
        Optional<ApiKey> optionalApiKey = getJpaBasicsDao().findByApiKey(apiKey);
        if (optionalApiKey.isEmpty()) {
            log.debug("API Key不存在: {}", maskKey(apiKey));
            return false;
        }
        ApiKey key = optionalApiKey.get();
        if (!key.isValid()) {
            log.debug("API Key无效(禁用或过期): {}", maskKey(apiKey));
            return false;
        }
        return true;
    }

    @Override
    public Optional<ApiKey> getByApiKey(String apiKey) {
        return getJpaBasicsDao().findByApiKey(apiKey);
    }

    @Override
    public boolean hasPermission(String apiKey, String permission) {
        Optional<ApiKey> optionalApiKey = getJpaBasicsDao().findByApiKey(apiKey);
        return optionalApiKey.map(key -> key.hasPermission(permission)).orElse(false);
    }

    @Override
    public void revokeApiKey(Integer id) {
        getJpaBasicsDao().findById(id).ifPresent(apiKey -> {
            apiKey.setStatus(0);
            getJpaBasicsDao().save(apiKey);
            log.info("API Key已禁用: id={}, name={}", id, apiKey.getName());
        });
    }

    @Override
    public void enableApiKey(Integer id) {
        getJpaBasicsDao().findById(id).ifPresent(apiKey -> {
            apiKey.setStatus(1);
            getJpaBasicsDao().save(apiKey);
            log.info("API Key已启用: id={}, name={}", id, apiKey.getName());
        });
    }

    /**
     * 使用HMAC-SHA256加密
     */
    private String encryptKey(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    openApiConfig.getSecretKey().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            // 使用URL安全的Base64编码，并截取前32位
            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            return encoded.substring(0, Math.min(32, encoded.length()));
        } catch (Exception e) {
            log.error("加密API Key失败", e);
            throw new RuntimeException("生成API Key失败");
        }
    }

    /**
     * 脱敏显示API Key
     */
    private String maskKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 12) {
            return "****";
        }
        return apiKey.substring(0, 8) + "****" + apiKey.substring(apiKey.length() - 4);
    }
}
