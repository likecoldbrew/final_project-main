package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Prescription;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Mapper
public interface PrescriptionMapper {
    // 의사 처방 목록 조회
    List<Prescription> getPrescriptionList(int doctorNo);

    // 환자 처방 목록 조회
    List<Prescription> getUserPrescriptionList(int userNo);

    // 특정 유저 처방 조회
    List<Prescription> selectPrescription(int userNo);

    // 특정 처방 상세 조회
    Prescription selectPrescriptionDetail(int prescriptionId);

    // 처방 내역 추가
    void insertPrescription(Prescription prescription);

    // 처방 내역 수정
    void updatePrescription(Prescription prescription);

    //특정 처방 내역 업데이트 (doctor)
    Prescription patientPrescription(int medicalRecordId);
}
