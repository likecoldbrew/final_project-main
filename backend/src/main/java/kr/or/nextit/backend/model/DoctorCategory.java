package kr.or.nextit.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class DoctorCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // IDENTITY 전략 사용
    private int categoryId;
    private String name;
    private int parentId; // 부모 카테고리 ID
    private String status;
    private int categoryOrder;
    private String urlName;

    // 하위 카테고리 저장 필드
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "parentCategory")
    private List<DoctorCategory> subcategories;

    // 부모 카테고리와의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parentId", insertable = false, updatable = false) // 부모 ID와 연결
    private DoctorCategory parentCategory;
}
