package kr.or.nextit.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class MainCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // IDENTITY 전략 사용
    private int categoryId;
    private String name;
    private int parentId; // 부모 카테고리 ID
    private String status;
    private int categoryOrder;
    private String urlName;

    // 하위 카테고리 저장 필드
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "parentMainCategory")
    private List<MainCategory> subcategories;

    // 부모 카테고리와의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parentId", insertable = false, updatable = false) // 부모 ID와 연결
    private MainCategory parentMainCategory;

    // 추가 필드: 서브 카테고리 이름과 부모 카테고리 이름
    @Transient // 이 필드는 DB에 저장하지 않도록 표시
    private String subCategory;; // 서브 카테고리 이름

    @Transient // 이 필드는 DB에 저장하지 않도록 표시
    private String parentCategory;; // 부모 카테고리 이름

}