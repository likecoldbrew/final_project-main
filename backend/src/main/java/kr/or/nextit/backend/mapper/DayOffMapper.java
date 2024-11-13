package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.DayOff;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DayOffMapper {
    // 관리자 - 휴무 신청 목록 전체
    List<DayOff> getAllDayOffList();

    // 의사 - 휴무 신청 목록
    List<DayOff> getDoctorDayOffList(int doctorNo);

    // 휴무 신청 조회 (휴무 번호)
    DayOff getDayOffByNo(int dayOffNo);

    // 휴무 등록
    int insertDayOff(DayOff dayOff);

    // 휴무 수정
    int updateDayOff(DayOff dayOff);

    // 관리자 - 휴무 승인
    int approveDayOffStatus(int dayOffNo);

    // 휴무 삭제
    int deleteDayOff(int dayOffNo);
}
