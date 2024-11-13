package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Reserve;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReserveMapper {

    // 의사 예약 목록
    List<Reserve> getReserveList(int doctorNo);

    // 환자 예약 목록
    List<Reserve> getUserReserveList(int userNo);

    // 예약 추가
    void insertReserve(Reserve reserve);

    // 모든 예약 조회
    List<Reserve> selectAllReserves();

    // ID로 특정 예약 조회
    Reserve selectReserveById(@Param("reserveId") int reserveId);

    // 예약 삭제
    void deleteReserve(@Param("reserveId") int reserveId);

    // 예약 상태 업데이트
    void updateReserveStatus(@Param("reserveId") int reserveId, @Param("status") int status);

    List<Reserve> getDoctorNoReserveUser(int doctorNo);

    // 로그인 유저 예약 목록(예약날짜 기준으로 정렬 && 진료과, 의사이름 포함)
    List<Reserve> loginUserReserveList(int userNo);

    //예약 신청
    void requestReserve(Reserve reserve);
}
