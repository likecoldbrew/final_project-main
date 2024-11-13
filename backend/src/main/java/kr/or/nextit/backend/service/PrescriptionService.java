package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.PrescriptionMapper;
import kr.or.nextit.backend.model.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class PrescriptionService {
    private final PrescriptionMapper prescriptionMapper;

    // 의사 처방 목록 조회
    public List<Prescription> getPrescriptionList(int doctorNo) {
        return prescriptionMapper.getPrescriptionList(doctorNo);
    }

    // 환자 처방 목록 조회
    public List<Prescription> getUserPrescriptionList(int userNo) {
        return prescriptionMapper.getUserPrescriptionList(userNo);
    }

    //특정 유저 처방 내역 목록
    public List<Prescription> selectPrescription(int userNo) {
        return prescriptionMapper.selectPrescription(userNo);
    }

    //특정 처방 내역 상세 조회
    public Prescription selectPrescriptionDetail(int prescriptionId) {
        return prescriptionMapper.selectPrescriptionDetail(prescriptionId);
    }

    // 처방 내역 추가
    public void addPrescription(Prescription prescription) {
        prescriptionMapper.insertPrescription(prescription);
    }

    public void updatePrescription(int prescriptionId, Prescription prescription) {
        prescription.setPrescriptionId(prescriptionId); // prescriptionId를 설정
        prescriptionMapper.updatePrescription(prescription);
    }

    public Prescription patientPrescription(int medicalRecordId) {
        return prescriptionMapper.patientPrescription(medicalRecordId);
    }

}
