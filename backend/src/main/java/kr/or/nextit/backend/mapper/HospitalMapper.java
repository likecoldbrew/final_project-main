package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Hospital;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface HospitalMapper {
    // 병원 정보 조회
    Hospital getHospitalInfo();
    // 병원 정보 수정
    int updateHospitalInfo(Hospital hospital);
}

