package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.Prescription;
import kr.or.nextit.backend.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescription")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    // 의사 처방 목록 조회
    @GetMapping("/{doctorNo}")
    public List<Prescription> getPrescriptionList(@PathVariable("doctorNo") int doctorNo) {
        return prescriptionService.getPrescriptionList(doctorNo);
    }

    // 환자 처방 목록 조회
    @GetMapping("/user")
    public List<Prescription> getUserPrescriptionList(int userNo) {
        return prescriptionService.getUserPrescriptionList(userNo);
    }

    // 특정 유저 기록 목록 조회 (진료과도 들어감)
    @GetMapping("/all/{userNo}")
    public List<Prescription> getMedicalRecordDetail(@PathVariable int userNo) {
        return prescriptionService.selectPrescription(userNo);
    }

    @GetMapping("/detail")
    public Prescription getPrescriptionDetail(@RequestParam int prescriptionId) {
        return prescriptionService.selectPrescriptionDetail(prescriptionId);
    }

    //특정 환자 정보 불러오기
    @GetMapping("/patientPrescription/{medicalRecordId}")
    public ResponseEntity<Prescription> patientPrescription(@PathVariable("medicalRecordId") int medicalRecordId) {
        return ResponseEntity.ok(prescriptionService.patientPrescription(medicalRecordId));
    }

    // 처방 내역 추가
    @PostMapping("/insertAddPrescription")
    public ResponseEntity<String> addPrescription(@RequestBody Prescription prescription) {
        prescriptionService.addPrescription(prescription);
        return new ResponseEntity<>("처방 내역이 추가되었습니다.", HttpStatus.CREATED);
    }

    @PutMapping("/updatePrescription/{prescriptionId}")
    public ResponseEntity<String> updatePrescription(
            @PathVariable("prescriptionId") int prescriptionId,
            @RequestBody Prescription prescription) {
        try {
            // prescriptionId를 Prescription 객체에 설정
            prescription.setPrescriptionId(prescriptionId);
            // 처방 정보 업데이트 서비스 호출
            prescriptionService.updatePrescription(prescriptionId, prescription);
            return ResponseEntity.ok("Prescription updated successfully.");
        } catch (Exception e) {
            e.printStackTrace(); // 예외 스택 추적
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating prescription: " + e.getMessage());
        }
    }




}
