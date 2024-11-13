package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.RecommendDepartmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendDepartmentService {

    private final RecommendDepartmentMapper recommendDepartmentMapper;

    public List<String> findRelevantDepartments(String symptomText) {
        // DB에서 모든 키워드를 가져옴
        List<String> allKeywords = recommendDepartmentMapper.findAllKeywords();

        // 사용자가 입력한 문장에서 일치하는 키워드 필터링
        List<String> matchedKeywords = allKeywords.stream()
                .filter(symptomText::contains) // 증상 문장에 포함된 키워드만 선택
                .collect(Collectors.toList());

        if (matchedKeywords.isEmpty()) return Collections.emptyList();  // 일치하는 키워드가 없으면 빈 리스트 반환

        List<String> departmentNames = new ArrayList<>();

        while (!matchedKeywords.isEmpty()) {
            List<Integer> departmentNos = recommendDepartmentMapper.findDepartmentsByKeywords(matchedKeywords, matchedKeywords.size());

            if (!departmentNos.isEmpty()) {
                departmentNames = recommendDepartmentMapper.findDepartmentNamesByNos(departmentNos);
                break;
            } else {
                matchedKeywords.remove(0); // 키워드 리스트의 첫 번째 요소 제거
            }
        }

        return departmentNames;
    }

}

