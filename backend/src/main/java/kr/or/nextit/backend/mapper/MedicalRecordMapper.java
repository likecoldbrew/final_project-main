package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.MedicalRecord;
import kr.or.nextit.backend.model.UpdatePatientDetailDto;
import kr.or.nextit.backend.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Mapper
public interface MedicalRecordMapper {
    /**
     * 특정 의사에 대한 환자의 진료 기록 목록을 조회합니다.
     *
     * @param doctorNo 의사 ID
     * @return 환자의 진료 기록 리스트
     */
    // 환자 진단 목록 조회
    List<MedicalRecord> getUserMedicalRecordList(int userNo);

    // 예약 목록
    List<MedicalRecord> getMedicalRecordList(int doctorNo);

    // 환자 전체 목록(+진료의 etc)
    List<MedicalRecord> getAllPatientList();

    // 업데이트된 레코드를 조회하는 메서드
    MedicalRecord getMedicalRecordById(int recordId);

    // 환자 진료 정보 등록하는 메서드
    void insertPatientMedicalRecord(UpdatePatientDetailDto patientDetailDto);

    void updatePatient(MedicalRecord medicalRecord);

    void updateMedicalRecord(int recordId, MedicalRecord updatedRecord);

    MedicalRecord patientPrescription(int recordId);

    // 로그인 유저 진단 목록 조회
    List<MedicalRecord> loginUserMedicalRecord(int userNo);

    // 로그인한 유저 특정 진단 기록 조회용
    MedicalRecord selectMedicalRecord(int recordId);

}
