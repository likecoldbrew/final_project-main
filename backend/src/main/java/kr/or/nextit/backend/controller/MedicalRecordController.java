package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.MedicalRecord;
import kr.or.nextit.backend.model.Prescription;
import kr.or.nextit.backend.model.UpdatePatientDetailDto;
import kr.or.nextit.backend.model.User;
import kr.or.nextit.backend.service.MedicalRecordService;
import kr.or.nextit.backend.service.PrescriptionService;
import kr.or.nextit.backend.service.ReserveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical_record")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    private final PrescriptionService prescriptionService;
    private final ReserveService reserveService;

    // 환자 진단 목록 조회
    @GetMapping("/user")
    public List<MedicalRecord> getUserMedicalRecordList(@RequestParam int userNo) {
        return medicalRecordService.getUserMedicalRecordList(userNo);
    }

    @GetMapping("/{doctorNo}")
    public List<MedicalRecord> getMedicalRecordList(@PathVariable("doctorNo") int doctorNo) {
        return medicalRecordService.getMedicalRecordList(doctorNo);
    }

    @GetMapping("/patientCheckList")
    public ResponseEntity<List<MedicalRecord>> getAllPatientList() {
        return ResponseEntity.ok(medicalRecordService.getAllPatientList());
    }

    @GetMapping("/patientPrescription/{recordId}")
    public ResponseEntity<MedicalRecord> patientPrescription(@PathVariable("recordId") int recordId) {
        return ResponseEntity.ok(medicalRecordService.patientPrescription(recordId));
    }

    // 환자 진료 정보 수정 엔드포인트
    @PutMapping("/updateRecord")
    public ResponseEntity<String> updateRecord(@RequestBody MedicalRecord medicalRecord) {
        try {
            medicalRecordService.updateMedicalRecord(medicalRecord);
            return ResponseEntity.ok("Medical record updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating medical record");
        }
    }

    // 기존의 환자 진료 정보 수정 엔드포인트를 유지
    @PutMapping("/updateRecord/{recordId}")
    public ResponseEntity<Void> updateMedicalRecord(
            @PathVariable("recordId") int recordId,
            @RequestBody MedicalRecord updatedRecord) {
        medicalRecordService.updateMedicalRecord(recordId, updatedRecord);
        return ResponseEntity.noContent().build();
    }


    // 새로운 진료 기록 추가
    @PostMapping("/insertPatientMedicalRecord")
    public ResponseEntity<Map<String, String>> insertPatientMedicalRecord(@RequestBody UpdatePatientDetailDto patientDetailDto) {
        try {
            // 진료 기록을 삽입하고 생성된 ID를 받아옵니다.
//            int medicalRecordId = medicalRecordService.insertPatientMedicalRecord(medicalRecord);
            // 진료 기록을 삽입
            medicalRecordService.insertPatientMedicalRecord(patientDetailDto);
            prescriptionService.addPrescription(patientDetailDto.getPrescription());
            return ResponseEntity.ok(Collections.singletonMap("message", "Medical record inserted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/reserve/updateReserveStatus/{reserveId}")
    public ResponseEntity<?> updateReserveStatus(
            @PathVariable int reserveId,
            @RequestBody Map<String, Integer> status) {
        try {
            reserveService.updateReserveStatus(reserveId, status.get("status"));
            return ResponseEntity.ok().body(Collections.singletonMap("message", "Status updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 환자 진료 정보 수정 엔드포인트
    @PutMapping("/updateMedicalRecord/{recordId}")
    public ResponseEntity<String> updatePatientMedicalRecord(
            @PathVariable("recordId") int recordId,
            @RequestBody MedicalRecord medicalRecord) {
        try {
//            medicalRecord.setRecordId(recordId);
            medicalRecordService.updateMedicalRecord(recordId, medicalRecord);
            return ResponseEntity.ok("Medical record updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating medical record");
        }
    }
    // 로그인 유저 진단 목록 조회
    @GetMapping("/loginUser/{userNo}")
    public List<MedicalRecord> loginUserMedicalRecord(@PathVariable int userNo) {
        return medicalRecordService.loginUserMedicalRecord(userNo);
    }

    // 로그인 유저 특정 기록 목록 조회
    @GetMapping("/detail")
    public MedicalRecord getMedicalRecordDetail(int recordId) {
        return medicalRecordService.selectMedicalRecord(recordId);
    }

}
