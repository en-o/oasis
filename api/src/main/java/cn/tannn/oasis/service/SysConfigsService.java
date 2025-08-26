package cn.tannn.oasis.service;

import cn.tannn.jdevelops.jpa.service.J2Service;
import cn.tannn.oasis.entity.SysConfigs;

/**
 * 系统配置表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
public interface SysConfigsService extends J2Service<SysConfigs> {

    /**
     * 登录
     * @param username 账户
     * @param password 登录密码
     */
    void login(String username, String password);
}
