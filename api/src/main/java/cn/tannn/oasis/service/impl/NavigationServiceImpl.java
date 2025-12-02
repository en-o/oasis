package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.controller.dto.NavigationAdd;
import cn.tannn.oasis.dao.NavigationDao;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.service.NavigationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

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

    @Override
    public boolean categoryUse(String category) {
        return this.getJpaBasicsDao().existsByCategory(category);
    }

    @Override
    public void create(NavigationAdd append) {
        if (this.getJpaBasicsDao().existsByName(append.getName())) {
            throw new IllegalArgumentException("名称已存在");
        }
        getJpaBasicsDao().save(append.to(Navigation.class));
    }

    @Override
    public List<Navigation> findByShowPlatform(Integer showPlatform) {
        // status=1 表示启用状态
        return getJpaBasicsDao().findByShowPlatformAndStatusOrderBySortAsc(showPlatform, 1);
    }
}
