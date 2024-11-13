package kr.or.nextit.backend.mapper;

import java.util.List;

import kr.or.nextit.backend.model.Doctor;
import org.apache.ibatis.annotations.Mapper;
import kr.or.nextit.backend.model.User;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    // 모든 유저 조회
    List<User> getAllUsers();

    // 환자 목록 조회
    List<User> getPatientList();

    // 의사 목록 조회
    List<User> getDoctorList();

    // 관리자 목록 조회
    List<User> getAdminList();

    // 특정 유저 조회
    User getUserByNo(int userNo);

    // 특정 유저 조회
    User getUserById(String userId);

    // 유저 추가
    void insertUser(User user);

    // 회원가입시 의사 정보 추가
    void insertDoctor(Doctor doctor);
    // 유저 수정
    void updateUser(User user);

    // 유저 삭제
    void deleteUser(int userNo);

    // 의사 이름 조회
    List<User> getDoctorsName();

    // ID 중복 확인 메서드
    boolean checkIdExists(@Param("userId") String userId);
    
      //특정 의사 조회
    User getDoctorDetail(int doctorNo);

    // 관리자 - 미승인된 의사 목록
    List<User> UnauthorizedDoctorList();

    // 관리자 - 의사 권한 승인
    int ApproveDoctorAuthority(int doctorNo);
}
