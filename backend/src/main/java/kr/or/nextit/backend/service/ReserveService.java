package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.ReserveMapper;
import kr.or.nextit.backend.model.Reserve;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReserveService {

    @Autowired
    private ReserveMapper reserveMapper;

    // 의사 예약 목록 조회
    public List<Reserve> getReserveList(int doctorNo) {
        return reserveMapper.getReserveList(doctorNo);
    }

    // 환자 예약 목록 조회
    public List<Reserve> getUserReserveList(int userNo) {
        return reserveMapper.getUserReserveList(userNo);
    }

    // 예약 추가
    public void saveReserve(Reserve reserve) {
        reserveMapper.insertReserve(reserve);
    }

    // 모든 예약 조회
    public List<Reserve> getAllReserves() {
        return reserveMapper.selectAllReserves();
    }

    public ReserveService(ReserveMapper reserveMapper) {
        this.reserveMapper = reserveMapper;
    }

    public Reserve getReserveById(int reserveId) {
        return reserveMapper.selectReserveById(reserveId);
    }

    // 예약 삭제
    public void deleteReserve(int id) {
        reserveMapper.deleteReserve(id);
    }

    public void updateReserveStatus(@Param("reserveId") int reserveId, @Param("status") int status) {
        // 예외 처리를 추가하여 해당 예약이 존재하는지 확인 후 업데이트
        reserveMapper.updateReserveStatus(reserveId, status);
    }

    // 승인된 예약 목록을 가져오는 메서드 추가
    public List<Reserve> getDoctorNoReserveUser(int doctorNo) {
        return reserveMapper.getDoctorNoReserveUser(doctorNo);
    }

    public void updateReserveStatusTwo(int reserveId, int status) {
        reserveMapper.updateReserveStatus(reserveId, status);
    }

    // 로그인 유저 예약 목록 조회
    public List<Reserve> loginUserReserveList(int userNo) {
        return reserveMapper.loginUserReserveList(userNo);
    }

    // 예약 신청
    public Reserve requestReserve(Reserve reserve) {
        reserveMapper.requestReserve(reserve);
        return reserve;
    }

}
