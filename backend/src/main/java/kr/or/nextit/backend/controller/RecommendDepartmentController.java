package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.service.RecommendDepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
public class RecommendDepartmentController {

    private final RecommendDepartmentService recommendDepartmentService;

    //증상으로 부서 조회
    @PostMapping("/departmentBySymptom")
    public List<String> findDepartment(@RequestBody Map<String, String> payload) {
        String symptomText = payload.get("symptomText");

        // 증상 텍스트를 그대로 Service로 전달
        return recommendDepartmentService.findRelevantDepartments(symptomText);
    }
}

