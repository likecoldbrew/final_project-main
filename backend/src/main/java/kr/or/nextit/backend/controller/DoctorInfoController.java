package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.DoctorInfo;
import kr.or.nextit.backend.model.UpdateCareerDto;
import kr.or.nextit.backend.model.User;
import kr.or.nextit.backend.service.DoctorInfoService;
import kr.or.nextit.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctorsInfo")
@RequiredArgsConstructor
public class DoctorInfoController {

    private final DoctorInfoService doctorInfoService;
    private final UserService userService;

    @GetMapping("/all")
    public List<DoctorInfo> getDoctors() {
        return doctorInfoService.getAllDoctors();
    }


    // 의사 검색
    @GetMapping("/search")
    public List<DoctorInfo> searchDoctors(@RequestParam String name) {
        return doctorInfoService.searchDoctors(name);
    }

    //전체 진료과(의사가 있는 경우)
    @GetMapping("/allDepartment")
    public List<DoctorInfo> getDepartments() {
        return doctorInfoService.getAllDepartments();
    }

    //전체 진료과(의사여부 상관없이)
    @GetMapping("/departmentAll")
    public List<DoctorInfo> getAllDepartments() {
        return doctorInfoService.getDepartmentAll();
    }


    //진료과로 특정 유저 조회
    @GetMapping("/doctor/{departmentNo}")
    public List<DoctorInfo> getDoctorsByDepartment(@PathVariable int departmentNo) {
        return doctorInfoService.getDoctorsByDepartment(departmentNo);
    }

    //전체 진료과
    @GetMapping("/allTreatment")
    public List<DoctorInfo> getTreatments() {
        return doctorInfoService.getAllTreatments();
    }

    // 진료과 검색
    @GetMapping("/department")
    public List<DoctorInfo> searchDepartment(@RequestParam String departmentName) {
        return doctorInfoService.searchDepartment(departmentName);
    }

    // 유저 한명 조회
    @GetMapping("/{userNo}")
    public Map<String, Object> getUserByNo(@PathVariable("userNo") int userNo) {
        Map<String, Object> response = new HashMap<>();

        User user = userService.getUserByNo(userNo);
        response.put("user", user);

        // 의사일 경우만 경력과 학력 출력
        if (user.getAdmin() == 1) {
            response.put("career", doctorInfoService.getDoctorCareer(userNo));
            response.put("education", doctorInfoService.getDoctorEducation(userNo));
        }
        return response;
    }

    @PostMapping("/educationAndCareer/register")
    public ResponseEntity<Map<String, String>> registerDoctorInfo(@RequestBody DoctorInfo doctorInfo) {
        try {
            // 교육 정보 삽입
            doctorInfoService.insertDoctorEducation(doctorInfo);
            // 경력 정보 삽입
            doctorInfoService.insertDoctorCareer(doctorInfo);

            return ResponseEntity.ok(Collections.singletonMap("message", "Doctor education and career registered successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 경력 & 학력 수정
    @PutMapping("/educationAndCareer/update")
    public ResponseEntity<Void> updateDoctorInfo(@RequestBody UpdateCareerDto updateCareerDto) {
        doctorInfoService.updateCareer(updateCareerDto);
        return ResponseEntity.ok().build();
    }
}
