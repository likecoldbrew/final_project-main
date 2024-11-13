package kr.or.nextit.backend.service;
import kr.or.nextit.backend.mapper.HospitalMapper;
import kr.or.nextit.backend.model.Hospital;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalMapper hospitalMapper;

    public Hospital getHospitalInfo() {
        return hospitalMapper.getHospitalInfo();
    }

    // 병원 정보 수정 메서드
    public int updateHospitalInfo(Hospital updatedHospital) {
        return hospitalMapper.updateHospitalInfo(updatedHospital);
    }
}

