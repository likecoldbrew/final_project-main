package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Hospitalization;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RecommendDepartmentMapper {
    List<Integer> findDepartmentsByKeywords(@Param("keywords") List<String> keywords, @Param("keywordCount") int keywordCount);
    List<String> findDepartmentNamesByNos(@Param("departmentNos") List<Integer> departmentNos);
    List<String> findAllKeywords();  // 모든 키워드를 가져오는 메서드
}
