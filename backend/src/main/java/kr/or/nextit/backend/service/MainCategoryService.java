package kr.or.nextit.backend.service;


import kr.or.nextit.backend.mapper.MainCategoryMapper;
import kr.or.nextit.backend.model.MainCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MainCategoryService {

    private final MainCategoryMapper mainCategoryMapper;

    // 최상위 카테고리 가져오기
    public List<MainCategory> getAllCategories() {
        List<MainCategory> topCategories = mainCategoryMapper.selectTopCategories();
        for (MainCategory mainCategory : topCategories) {
            // 각 카테고리의 하위 카테고리도 조회하여 추가
            List<MainCategory> subCategories = mainCategoryMapper.selectSubCategories(mainCategory.getCategoryId());
            mainCategory.setSubcategories(subCategories);  // subcategories 필드를 모델에 추가 필요
        }
        return topCategories;
    }

    public MainCategory getCategoryWithParent(String urlName) {
        return mainCategoryMapper.selectCategoryWithParent(urlName);
    }

    // 카테고리 순서 변경
    public void updateCategoryOrder(List<MainCategory> categories) {
        for (MainCategory category : categories) {
            // 상위 카테고리 순서 변경
            mainCategoryMapper.updateCategoryOrder(category.getCategoryId(), category.getCategoryOrder());
            for (MainCategory subCategory : category.getSubcategories()) {
                // 하위 카테고리 순서 변경
                mainCategoryMapper.updateCategoryOrder(subCategory.getCategoryId(), subCategory.getCategoryOrder());
            }
        }
    }

    // 카테고리 이름 변경
    public void updateCategoryName(List<MainCategory> categories) {
        for (MainCategory category : categories) {
            // 상위 카테고리 이름 변경
            mainCategoryMapper.updateCategoryName(category.getCategoryId(), category.getName());
            for (MainCategory subCategory : category.getSubcategories()) {
                // 하위 카테고리 이름 변경
                mainCategoryMapper.updateCategoryName(subCategory.getCategoryId(), subCategory.getName());
            }
        }
    }
}