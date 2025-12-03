
package cn.tannn.oasis.controller;

import cn.tannn.jdevelops.annotations.web.mapping.PathRestController;
import cn.tannn.jdevelops.jpa.constant.SQLOperator;
import cn.tannn.jdevelops.jpa.result.JpaPageResult;
import cn.tannn.jdevelops.jpa.select.EnhanceSpecification;
import cn.tannn.jdevelops.result.response.ResultPageVO;
import cn.tannn.jdevelops.result.response.ResultVO;
import cn.tannn.oasis.controller.dto.NavigationAdd;
import cn.tannn.oasis.controller.dto.NavigationEdit;
import cn.tannn.oasis.controller.dto.NavigationPage;
import cn.tannn.oasis.entity.Navigation;
import cn.tannn.oasis.service.NavigationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 导航项表
 *
 * @author tan
 * @date 2025-08-26
 */
@PathRestController("navigation")
@Slf4j
@Tag(name = "导航项")
@RequiredArgsConstructor
public class NavigationController {

    private final NavigationService navigationService;

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取详情", description = "详情")
    public ResultVO<Navigation> info(@PathVariable("id") Long id) {
        Navigation bean = navigationService.findOnly("id", id).orElse(new Navigation());
        return ResultVO.success(bean);
    }

    @Operation(summary = "新增导航项")
    @PostMapping("append")
    public ResultVO<String> append(@RequestBody @Valid NavigationAdd append) {
        navigationService.create(append);
        return ResultVO.success();
    }

    @Operation(summary = "管理端分页")
    @PostMapping("page")
    public ResultPageVO<Navigation, JpaPageResult<Navigation>> page(@RequestBody @Valid NavigationPage page) {

        Specification<Navigation> beanWhere = EnhanceSpecification.beanWhere(page, and -> {
            String routePath = page.getShowPlatform();
            and.likes(StringUtils.hasText(routePath), "showPlatform", routePath);
        });

        Page<Navigation> byBean = navigationService.findPage(beanWhere, page.getPage().pageable());

        JpaPageResult<Navigation> pageResult = JpaPageResult.toPage(byBean);
        return ResultPageVO.success(pageResult, "查询成功");
    }


    @Operation(summary = "集合")
    @GetMapping("lists")
    public ResultVO<List<Navigation>> lists() {
        List<Navigation> finds = navigationService.finds();
        return ResultVO.success(finds);
    }


    @Operation(summary = "删除")
    @DeleteMapping("delete")
    @Parameter(name = "id", description = "id", required = true)
    public ResultVO<String> delete(@RequestParam("id") Integer id) {
        navigationService.deleteEq("id", id);
        return ResultVO.success();
    }

    @Operation(summary = "编辑导航项")
    @PostMapping("edit")
    public ResultVO<String> edit(@RequestBody @Valid NavigationEdit edit) {
        navigationService.getJpaBasicsDao().findById(edit.getId()).ifPresent(jpaBasics -> {
            // 通用字段更新（只更新非 null 值）
            if (edit.getName() != null) jpaBasics.setName(edit.getName());
            if (edit.getUrl() != null) jpaBasics.setUrl(edit.getUrl());
            if (edit.getSort() != null) jpaBasics.setSort(edit.getSort());
            if (edit.getCategory() != null) jpaBasics.setCategory(edit.getCategory());
            if (edit.getIcon() != null) jpaBasics.setIcon(edit.getIcon());
            if (edit.getRemark() != null) jpaBasics.setRemark(edit.getRemark());
            if (edit.getAccount() != null) jpaBasics.setAccount(edit.getAccount());
            if (edit.getPassword() != null) jpaBasics.setPassword(edit.getPassword());
            if (edit.getNvaAccessSecret() != null) jpaBasics.setNvaAccessSecret(edit.getNvaAccessSecret());
            if (edit.getLookAccount() != null) jpaBasics.setLookAccount(edit.getLookAccount());
            if (edit.getStatus() != null) jpaBasics.setStatus(edit.getStatus());
            if(edit.getShowPlatform() == null || edit.getShowPlatform().isBlank()){
                jpaBasics.setShowPlatform(null);
            }else {
                jpaBasics.setShowPlatform(edit.getShowPlatform());
            }
            navigationService.saveOne(jpaBasics);
        });
        return ResultVO.success();
    }

}
