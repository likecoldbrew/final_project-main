package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.AdminCategory;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AdminCategoryMapper {
    // 최상위 카테고리 조회
    List<AdminCategory> selectTopCategories();

    // 특정 카테고리의 하위 카테고리 조회
    List<AdminCategory> selectSubCategories(int parentId);

    // 카테고리 순서 변경
    void updateCategoryOrder(int categoryId, int categoryOrder);

    // 카테고리 이름 변경
    void updateCategoryName(int categoryId, String name);

    // ..(int) => parameterType="int"
    // ..(int, String) => parameterType="map"
    // ..(aObject) => parameterType="map"
    // ..(aObject, bObject) => parameterType="map" #{aObject.a} #{aObject.b} #{bObject.a}
}

