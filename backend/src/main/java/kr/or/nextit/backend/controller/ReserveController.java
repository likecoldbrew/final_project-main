package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.mapper.ReserveMapper;
import kr.or.nextit.backend.model.Reserve;
import kr.or.nextit.backend.service.ReserveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reserve")
@RequiredArgsConstructor
public class ReserveController {

    private final ReserveService reserveService;
    private final ReserveMapper reserveMapper;

    // 의사 예약 목록 조회
    @GetMapping("/{doctorNo}")
    public List<Reserve> getReserveList(@PathVariable("doctorNo") int doctorNo) {
        return reserveService.getReserveList(doctorNo);
    }

    // 환자 예약 목록 조회
    @GetMapping("/user/{userNo}")
    public List<Reserve> getUserReserveList(@PathVariable int userNo) {
        return reserveService.getUserReserveList(userNo);
    }

    // 로그인 유저 예약 목록 조회 (예약일 기준 정렬 && 진료과, 의사이름 포함)
    @GetMapping("/login/user")
    public List<Reserve> loginUserReserveList(int userNo) {
        return reserveService.loginUserReserveList(userNo);
    }
    // 특정 의사의 승인된 예약 목록을 조회하는 엔드포인트 추가
    @GetMapping("/reserved_patient/{doctorNo}")
    public List<Reserve> getDoctorReserveUserList(@PathVariable int doctorNo) {
        return reserveService.getDoctorNoReserveUser(doctorNo);
    }

    // 새로운 예약 추가
    @PostMapping
    public ResponseEntity<Void> createReserve(@RequestBody Reserve reserve) {
        reserveService.saveReserve(reserve);
        return ResponseEntity.ok().build();
    }

    // 모든 예약 조회
    @GetMapping("/all")
    public ResponseEntity<List<Reserve>> getAllReserves() {
        List<Reserve> reserves = reserveService.getAllReserves();
        return ResponseEntity.ok(reserves);
    }

    @PutMapping("/{reserveId}")
    public ResponseEntity<String> updateReserveStatus(@PathVariable int reserveId, @RequestBody Map<String, Object> updates) {
        try {
            int status = (int) updates.get("status");
            // 필요한 경우 userNo도 받아오세요
            reserveMapper.updateReserveStatus(reserveId, status); // reserveId를 사용하세요

            return ResponseEntity.ok("Status updated successfully");
        } catch (Exception e) {
            // 로그에 오류 메시지 출력
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating status: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Reserve> addReserve(@RequestBody Reserve reserve) {
        Reserve createdReserve = reserveService.requestReserve(reserve);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReserve);
    }
    // 예약 ID로 특정 예약 조회
    @GetMapping("/reserve/{reserveId}")
    public ResponseEntity<Reserve> getReserveById(@PathVariable int reserveId) {
        Reserve reserve = reserveService.getReserveById(reserveId);
        return ResponseEntity.ok(reserve);
    }

//    // 예약 삭제
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteReserve(int id) {
//        reserveService.deleteReserve(id);
//        return ResponseEntity.noContent().build();
//    }


}
