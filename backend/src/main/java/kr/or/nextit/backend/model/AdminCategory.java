package kr.or.nextit.backend.model;

import lombok.Data;
import jakarta.persistence.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class AdminCategory {
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
    private List<AdminCategory> subcategories;

    // 부모 카테고리와의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parentId", insertable = false, updatable = false) // 부모 ID와 연결
    private AdminCategory parentCategory;
}
