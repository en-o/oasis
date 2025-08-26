package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.entity.SysConfigs;
import cn.tannn.oasis.service.SysConfigsService;
import cn.tannn.oasis.dao.SysConfigsDao;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

/**
 * 系统配置表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Slf4j
@Service
public class SysConfigsServiceImpl extends J2ServiceImpl<SysConfigsDao, SysConfigs, Integer> implements SysConfigsService {

    public SysConfigsServiceImpl() {
        super(SysConfigs.class);
    }

}
