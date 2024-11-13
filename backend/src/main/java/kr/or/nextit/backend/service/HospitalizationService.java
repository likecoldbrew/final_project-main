package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.HospitalizationMapper;
import kr.or.nextit.backend.model.Hospitalization;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalizationService {
    private final HospitalizationMapper hospitalizationMapper;

    // 전체 유저 입원 내역 목록 조회
    public List<Hospitalization> getAllHospitalizationList() {
        return hospitalizationMapper.getAllHospitalizationList();
    }

    // 의사 - 방 정보 가져오기
    public Hospitalization getRoomInfoByRoomNo(int roomNo) {
        return hospitalizationMapper.getRoomInfoByRoomNo(roomNo);
    }

    // 의사 - 입원 신청 내역 목록 조회
    public List<Hospitalization> getHospitalizationListByDoctor(int doctorNo) {
        return hospitalizationMapper.getHospitalizationListByDoctor(doctorNo);
    }

    // 특정 유저 입원 내역 목록 조회
    public List<Hospitalization> getHospitalizationListByUser(int userNo) {
        return hospitalizationMapper.getHospitalizationListByUser(userNo);
    }

    // 입원 내역 하나 조회
    public Hospitalization getHospitalizationByHospitalId(int hospitalizationId) {
        return hospitalizationMapper.getHospitalizationByHospitalId(hospitalizationId);
    }

    // 의사 - 입원 등록
    public int registerHospitalization(Hospitalization hospitalization) {
        return hospitalizationMapper.registerHospitalization(hospitalization);
    }

    // 의사 - 입원 수정
    public int modifyHospitalization(Hospitalization updatedHospitalization) {
        return hospitalizationMapper.modifyHospitalization(updatedHospitalization);
    }

    // 관리자 - 입원 승인
    public int approveHospitalizationByHospitalId(int hospitalizationId) {
        return hospitalizationMapper.approveHospitalizationByHospitalId(hospitalizationId);
    }

    // 관리자 - 퇴원으로 변경
    public int dischargeHospitalizationByHospitalId(int hospitalizationId) {
        return hospitalizationMapper.dischargeHospitalizationByHospitalId(hospitalizationId);
    }
}

