package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.AdminCategoryMapper;
import kr.or.nextit.backend.model.AdminCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {

    private final AdminCategoryMapper admincategoryMapper;

    // 최상위 카테고리 가져오기
    public List<AdminCategory> getAllCategories() {
        List<AdminCategory> topCategories = admincategoryMapper.selectTopCategories();
        for (AdminCategory category : topCategories) {
            // 각 카테고리의 하위 카테고리도 조회하여 추가
            List<AdminCategory> subCategories = admincategoryMapper.selectSubCategories(category.getCategoryId());
            category.setSubcategories(subCategories);  // subcategories 필드를 모델에 추가 필요
        }
        return topCategories;
    }

    // 카테고리 순서 변경
    public void updateCategoryOrder(List<AdminCategory> categories) {
        for (AdminCategory category : categories) {
            // 상위 카테고리 순서 변경
            admincategoryMapper.updateCategoryOrder(category.getCategoryId(), category.getCategoryOrder());
            for (AdminCategory subCategory : category.getSubcategories()) {
                // 하위 카테고리 순서 변경
                admincategoryMapper.updateCategoryOrder(subCategory.getCategoryId(), subCategory.getCategoryOrder());
            }
        }
    }

    // 카테고리 이름 변경
    public void updateCategoryName(List<AdminCategory> categories) {
        for (AdminCategory category : categories) {
            // 상위 카테고리 이름 변경
            admincategoryMapper.updateCategoryName(category.getCategoryId(), category.getName());
            for (AdminCategory subCategory : category.getSubcategories()) {
                // 하위 카테고리 이름 변경
                admincategoryMapper.updateCategoryName(subCategory.getCategoryId(), subCategory.getName());
            }
        }
    }
}
