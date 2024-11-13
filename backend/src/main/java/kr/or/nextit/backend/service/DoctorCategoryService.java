package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.DoctorCategoryMapper;
import kr.or.nextit.backend.model.DoctorCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorCategoryService {

    private final DoctorCategoryMapper doctorcategoryMapper;

    // 최상위 카테고리 가져오기
    public List<DoctorCategory> getAllCategories() {
        List<DoctorCategory> topCategories = doctorcategoryMapper.selectTopCategories();
        for (DoctorCategory category : topCategories) {
            // 각 카테고리의 하위 카테고리도 조회하여 추가
            List<DoctorCategory> subCategories = doctorcategoryMapper.selectSubCategories(category.getCategoryId());
            category.setSubcategories(subCategories);  // subcategories 필드를 모델에 추가 필요
        }
        return topCategories;
    }

    // 카테고리 순서 변경
    public void updateCategoryOrder(List<DoctorCategory> categories) {
        for (DoctorCategory category : categories) {
            // 상위 카테고리 순서 변경
            doctorcategoryMapper.updateCategoryOrder(category.getCategoryId(), category.getCategoryOrder());
            for (DoctorCategory subCategory : category.getSubcategories()) {
                // 하위 카테고리 순서 변경
                doctorcategoryMapper.updateCategoryOrder(subCategory.getCategoryId(), subCategory.getCategoryOrder());
            }
        }
    }

    // 카테고리 이름 변경
    public void updateCategoryName(List<DoctorCategory> categories) {
        for (DoctorCategory category : categories) {
            // 상위 카테고리 이름 변경
            doctorcategoryMapper.updateCategoryName(category.getCategoryId(), category.getName());
            for (DoctorCategory subCategory : category.getSubcategories()) {
                // 하위 카테고리 이름 변경
                doctorcategoryMapper.updateCategoryName(subCategory.getCategoryId(), subCategory.getName());
            }
        }
    }

//    // 특정 카테고리의 하위 카테고리 조회
//    public List<Category> getSubCategories(int parentId) {
//        return categoryMapper.selectSubCategories(parentId);
//    }
}
