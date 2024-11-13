package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.DayOff;
import kr.or.nextit.backend.service.DayOffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dayOff")
@RequiredArgsConstructor
public class DayOffController {
    private final DayOffService dayOffService ;

    // 관리자 - 휴무 신청 목록 전체 조회
    @GetMapping("/all")
    public List<DayOff> getAllDayOffList() {
        return dayOffService.getAllDayOffList();
    }

    // 의사 - 휴무 신청 목록 조회
    @GetMapping("/doctor/{doctorNo}")
    public List<DayOff> getDoctorDayOffList(@PathVariable int doctorNo) {
        return dayOffService.getDoctorDayOffList(doctorNo);
    }

    // 휴무 신청 조회 (휴무 번호로 조회)
    @GetMapping("/detail/{dayOffNo}")
    public DayOff getDayOffByNo(@PathVariable int dayOffNo) {
        return dayOffService.getDayOffByNo(dayOffNo);
    }

    // 휴무 신청 등록
    @PostMapping("/insert")
    public int insertDayOff(@RequestBody DayOff dayOff) {
        return dayOffService.insertDayOff(dayOff);
    }

    // 휴무 신청 수정
    @PutMapping("/update")
    public int updateDayOff(@RequestBody DayOff dayOff) {
        return dayOffService.updateDayOff(dayOff);
    }

    // 관리자 - 휴무 승인
    @PutMapping("/approve/{dayOffNo}")
    public int approveDayOffStatus(@PathVariable int dayOffNo) {
        return dayOffService.approveDayOffStatus(dayOffNo);
    }

    // 휴무 신청 삭제
    @DeleteMapping("/delete/{dayOffNo}")
    public int deleteDayOff(@PathVariable int dayOffNo) {
        return dayOffService.deleteDayOff(dayOffNo);
    }
}
