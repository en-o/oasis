package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.service.NavigationService;
import cn.tannn.oasis.dao.NavigationDao;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

/**
 * 导航项表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Slf4j
@Service
public class NavigationServiceImpl extends J2ServiceImpl<NavigationDao, Navigation, Integer> implements NavigationService {

    public NavigationServiceImpl() {
        super(Navigation.class);
    }

}
