package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Hospitalization;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface HospitalizationMapper {
    // 전체 유저 입원 내역 목록 조회
    List<Hospitalization> getAllHospitalizationList();
    // 의사 - 방 정보 가져오기
    Hospitalization getRoomInfoByRoomNo(int roomNo);
    // 의사 - 입원 신청 내역 목록 조회
    List<Hospitalization> getHospitalizationListByDoctor(int doctorNo);
    // 특정 유저 입원 내역 목록 조회
    List<Hospitalization> getHospitalizationListByUser(int userNo);  // 최상위 카테고리 조회
    // 입원 내역 하나 조회
    Hospitalization getHospitalizationByHospitalId(int hospitalizationId);
    // 의사 - 입원 등록
    int registerHospitalization(Hospitalization hospitalization);
    // 의사 - 입원 수정
    int modifyHospitalization(Hospitalization hospitalization);
    // 관리자 - 입원 승인
    int approveHospitalizationByHospitalId(int hospitalizationId);
    // 관리자 - 퇴원으로 변경
    int dischargeHospitalizationByHospitalId(int hospitalizationId);
}

