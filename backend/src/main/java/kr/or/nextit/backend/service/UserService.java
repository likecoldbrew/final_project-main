package kr.or.nextit.backend.service;

import jakarta.persistence.EntityNotFoundException;
import kr.or.nextit.backend.mapper.UserMapper;
import kr.or.nextit.backend.model.Doctor;
import kr.or.nextit.backend.model.User;
import kr.or.nextit.backend.repository.UserRepository;
import kr.or.nextit.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;


    public void insertUser(User user) {
        user.setUserPass(passwordEncoder.encode(user.getUserPass())); // 비밀번호 암호화
        userRepository.save(user);
    }

    @Transactional
    public void registerUserDoctor(User user) {
        user.setUserPass(passwordEncoder.encode(user.getUserPass())); // 비밀번호 암호화
        // users 테이블에 사용자 데이터 삽입 (userNo 자동 생성)
        userMapper.insertUser(user); // user.userNo에 자동 생성된 user_no가 저장됨
        // 생성된 userNo를 doctorNo로 사용하여 doctors 테이블에 데이터 삽입
        Doctor doctor = new Doctor();
        doctor.setDoctorNo(user.getUserNo());
        doctor.setDepartment(user.getDepartment());
        doctor.setTreatment(user.getTreatment());
        doctor.setRank(user.getRank());
        userMapper.insertDoctor(doctor);
    }


    @Transactional
    public void updateUser(User user, String jwt) {
        // JWT에서 사용자 ID 추출
        String username = jwtUtil.extractUsername(jwt);

        // 기존 사용자 정보를 조회
        User existingUser = userRepository.findById((long) user.getUserNo())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // 비밀번호 처리
        if (user.getUserPass() != null && !user.getUserPass().isEmpty()) {
            // 새로운 비밀번호가 입력된 경우 비밀번호 암호화
            user.setUserPass(passwordEncoder.encode(user.getUserPass()));
        } else {
            // 새로운 비밀번호가 입력되지 않은 경우 기존 비밀번호 사용
            user.setUserPass(existingUser.getUserPass());
        }
        // 기존 사용자 정보 업데이트
        existingUser.setUserId(user.getUserId());
        existingUser.setUserPass(user.getUserPass());
        existingUser.setUserName(user.getUserName());
        existingUser.setUserRrn(user.getUserRrn());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhone(user.getPhone());
        existingUser.setUserAdd(user.getUserAdd());
        existingUser.setUserAdd2(user.getUserAdd2());
        existingUser.setAdmin(user.getAdmin());
		existingUser.setStatus(user.getStatus());
        // 업데이트 쿼리 호출
        userRepository.save(existingUser);
    }

    // 목록 조회
    public List<User> getAllUsers() {
        return userMapper.getAllUsers();
    }

    public List<User> getPatientList() {
        return userMapper.getPatientList();
    }

    public List<User> getDoctorList() {
        return userMapper.getDoctorList();
    }

    public List<User> getAdminList() {
        return userMapper.getAdminList();
    }

    public User getUserByNo(int userNo) {
        return userMapper.getUserByNo(userNo);
    }

    public User getUserById(String userId) {
        return userMapper.getUserById(userId);
    }

    // 유저 삭제
    public void deleteUser(int userNo) {
        userMapper.deleteUser(userNo);
    }

    public boolean checkIdExists(String userId) {
        userMapper.checkIdExists(userId);
        return userMapper.checkIdExists(userId);
    }

    public User getDoctorDetail(int doctorNo) {
        User user = userMapper.getDoctorDetail(doctorNo);
        if (user == null) {
            throw new EntityNotFoundException("User not found with userNo: " + doctorNo);
        }
        return user;
    }
    
        // 관리자 - 미승인된 의사 목록
    public List<User> UnauthorizedDoctorList() {
        return userMapper.UnauthorizedDoctorList();
    }

    // 관리자 - 의사 권한 승인
    public int ApproveDoctorAuthority(int doctorNo) {
        return userMapper.ApproveDoctorAuthority(doctorNo);
    }
}
