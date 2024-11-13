package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.Hospital;
import kr.or.nextit.backend.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/hospital")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping("/all")
    public Hospital getHospitalInfo() {
        return  hospitalService.getHospitalInfo();
    }

    // 병원 정보 수정
    @PutMapping("/update")
    public int updateHospitalInfo(@RequestBody Hospital updatedHospital) {
        return hospitalService.updateHospitalInfo(updatedHospital);
    }
}
