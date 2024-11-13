package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.MedicalRecordMapper;
import kr.or.nextit.backend.mapper.ReserveMapper;
import kr.or.nextit.backend.model.MedicalRecord;
import kr.or.nextit.backend.model.UpdatePatientDetailDto;
import kr.or.nextit.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class MedicalRecordService {
    private final MedicalRecordMapper medicalRecordMapper;
    private final ReserveMapper reserveMapper;

    // 환자 진단 목록 조회
    public List<MedicalRecord> getUserMedicalRecordList(int userNo) {
        return medicalRecordMapper.getUserMedicalRecordList(userNo);
    }
    // 목록 조회
    public List<MedicalRecord> getMedicalRecordList(int doctorNo) {
        return medicalRecordMapper.getMedicalRecordList(doctorNo);
    }

    public List<MedicalRecord> getAllPatientList() {
        return medicalRecordMapper.getAllPatientList();
    }

    // 환자 진료 정보 수정 메서드
    public void updateMedicalRecord(MedicalRecord medicalRecord) {
        medicalRecordMapper.updatePatient(medicalRecord);
    }

    public void updateMedicalRecord(int recordId, MedicalRecord updatedRecord) {
        medicalRecordMapper.updateMedicalRecord(recordId, updatedRecord);
    }

    public void insertPatientMedicalRecord(UpdatePatientDetailDto patientDetailDto) {
        medicalRecordMapper.insertPatientMedicalRecord(patientDetailDto);
    }

    public MedicalRecord patientPrescription(int recordId) {
        return medicalRecordMapper.patientPrescription(recordId);
    }

    //로그인 유저 진료 정보 메서드
    public List<MedicalRecord> loginUserMedicalRecord(int userNo) {return medicalRecordMapper.loginUserMedicalRecord(userNo);}

    public MedicalRecord selectMedicalRecord(int recordId) {return medicalRecordMapper.selectMedicalRecord(recordId);}

}
