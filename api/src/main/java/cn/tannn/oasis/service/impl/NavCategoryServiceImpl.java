package cn.tannn.oasis.service.impl;

import cn.tannn.jdevelops.jpa.service.J2ServiceImpl;
import cn.tannn.oasis.entity.NavCategory;
import cn.tannn.oasis.service.NavCategoryService;
import cn.tannn.oasis.dao.NavCategoryDao;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

/**
 * 导航分类表
 *
 * @author tan
 * @version 0.0.1
 * @date 2025-08-26
 */
@Slf4j
@Service
public class NavCategoryServiceImpl extends J2ServiceImpl<NavCategoryDao, NavCategory, Integer> implements NavCategoryService {

    public NavCategoryServiceImpl() {
        super(NavCategory.class);
    }

}
