package cn.tannn.oasis.api.entity;

import cn.tannn.jdevelops.result.bean.SerializableBean;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

/**
 * 导航分类表
 *
 * @author tnnn
 * @version V1.0
 * @date 2025-08-26
 */
@Entity
@Table(name = "nav_category", indexes = {
        @Index(name = "idx_category_name", columnList = "category_name", unique = true)
})
@Comment("导航分类表")
@Schema(description = "导航分类")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@DynamicUpdate
@DynamicInsert
public class NavCategory extends SerializableBean<NavCategory> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * 分类名称（唯一）
     */
    @Column( columnDefinition = "varchar(50)", nullable = false)
    @Comment("分类名称")
    @Schema(description = "分类名称")
    private String categoryName;

    /**
     * 排序值（越小越靠前）
     */
    @Column(columnDefinition = "int default 0")
    @Comment("排序值")
    @Schema(description = "排序值")
    private Integer sortOrder;

}
