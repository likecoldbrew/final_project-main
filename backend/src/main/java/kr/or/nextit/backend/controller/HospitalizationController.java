package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.DayOff;
import kr.or.nextit.backend.model.Hospitalization;
import kr.or.nextit.backend.service.HospitalizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitalization")
@RequiredArgsConstructor
public class HospitalizationController {
    private final HospitalizationService hospitalizationService;

    // 전체 유저 입원 내역 목록 조회
    @GetMapping("/all")
    public List<Hospitalization> getAllHospitalizationList() {
        return hospitalizationService.getAllHospitalizationList();
    }

    // 의사 - 방 정보 가져오기
    @GetMapping("/room/{roomNo}")
    public Hospitalization getRoomInfoByRoomNo(@PathVariable int roomNo) {
        return hospitalizationService.getRoomInfoByRoomNo(roomNo);
    }

    // 의사 - 입원 신청 내역 목록 조회
    @GetMapping("/doctor/{doctorNo}")
    public List<Hospitalization> getHospitalizationListByDoctor(@PathVariable("doctorNo") int doctorNo) {
        return hospitalizationService.getHospitalizationListByDoctor(doctorNo);
    }

    // 특정 유저 입원 내역 목록 조회
    @GetMapping("/{userNo}")
    public List<Hospitalization> getHospitalizationListByUser(@PathVariable("userNo") int userNo) {
        return hospitalizationService.getHospitalizationListByUser(userNo);
    }

    // 입원 내역 하나 조회
    @GetMapping("/detail/{hospitalizationId}")
    public Hospitalization getHospitalizationDetail(@PathVariable("hospitalizationId") int hospitalizationId) {
        return hospitalizationService.getHospitalizationByHospitalId(hospitalizationId);
    }

    // 의사 - 입원 등록
    @PostMapping("/register")
    public int registerHospitalization(@RequestBody Hospitalization hospitalization) {
        return hospitalizationService.registerHospitalization(hospitalization);
    }

    // 의사 - 입원 수정
    @PutMapping("/modify")
    public int modifyHospitalization(@RequestBody Hospitalization hospitalization) {
        return hospitalizationService.modifyHospitalization(hospitalization);
    }

    // 관리자 - 입원 승인
    @PutMapping("/approve/{hospitalizationId}")
    public int approveHospitalizationByHospitalId(@PathVariable("hospitalizationId") int hospitalizationId) {
        return hospitalizationService.approveHospitalizationByHospitalId(hospitalizationId);
    }

    // 관리자 - 퇴원으로 변경
    @PutMapping("/discharge/{hospitalizationId}")
    public int dischargeHospitalizationByHospitalId(@PathVariable("hospitalizationId") int hospitalizationId) {
        return hospitalizationService.dischargeHospitalizationByHospitalId(hospitalizationId);
    }
}
