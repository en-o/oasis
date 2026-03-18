package cn.tannn.oasis.dao;

import cn.tannn.jdevelops.jpa.repository.JpaBasicsRepository;
import cn.tannn.oasis.entity.ApiKey;

import java.util.Optional;

/**
 * API Key DAO
 *
 * @author tan
 * @date 2025-02-05
 */
public interface ApiKeyDao extends JpaBasicsRepository<ApiKey, Integer> {

    /**
     * 根据apiKey查询
     *
     * @param apiKey apiKey
     * @return ApiKey
     */
    Optional<ApiKey> findByApiKey(String apiKey);

    /**
     * 根据apiKey判断是否存在
     *
     * @param apiKey apiKey
     * @return true存在
     */
    boolean existsByApiKey(String apiKey);

    /**
     * 根据名称判断是否存在
     *
     * @param name 名称
     * @return true存在
     */
    boolean existsByName(String name);
}
