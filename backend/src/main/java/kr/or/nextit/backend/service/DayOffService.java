package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.DayOffMapper;
import kr.or.nextit.backend.model.DayOff;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DayOffService {
    private final DayOffMapper dayOffMapper;

    // 관리자 - 휴무 신청 목록 전체
    public List<DayOff> getAllDayOffList() {
        return dayOffMapper.getAllDayOffList();
    }

    // 의사 - 휴무 신청 목록
    public List<DayOff> getDoctorDayOffList(int doctorNo) {
        return dayOffMapper.getDoctorDayOffList(doctorNo);
    }

    // 휴무 신청 조회 (휴무 번호)
    public DayOff getDayOffByNo(int dayOffNo) {
        return dayOffMapper.getDayOffByNo(dayOffNo);
    }

    // 휴무 등록
    public int insertDayOff(DayOff dayOff) {
        return dayOffMapper.insertDayOff(dayOff);
    }

    // 휴무 수정
    public int updateDayOff(DayOff dayOff) {
        return dayOffMapper.updateDayOff(dayOff);
    }

    // 관리자 - 휴무 승인
    public int approveDayOffStatus(int dayOffNo) {
        return dayOffMapper.approveDayOffStatus(dayOffNo);
    }

    // 휴무 삭제
    public int deleteDayOff(int dayOffNo) {
        return dayOffMapper.deleteDayOff(dayOffNo);
    }
}
