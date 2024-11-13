package kr.or.nextit.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import kr.or.nextit.backend.component.ProfileStorage;
import kr.or.nextit.backend.model.Profile;
import kr.or.nextit.backend.model.User;
import kr.or.nextit.backend.service.DoctorInfoService;
import kr.or.nextit.backend.service.ProfileService;
import kr.or.nextit.backend.service.UserService;
import kr.or.nextit.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final DoctorInfoService doctorInfoService;
    private final ProfileStorage profileStorage;
    private final ProfileService profileService;

    // 유저 한명 조회
    @GetMapping("/detail/{id}")
    public Map<String, Object> getUserByNo(@PathVariable("id") int userNo) {
        Map<String, Object> response = new HashMap<>();

        User user = userService.getUserByNo(userNo);
        response.put("user", user);

        // 의사일 경우만 경력과 학력 출력
        if (user.getAdmin() == 1) {
            response.put("career", doctorInfoService.getDoctorCareer(userNo));
            response.put("education", doctorInfoService.getDoctorEducation(userNo));
        }
        return response;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user, HttpServletResponse response) {
        // 사용자가 입력한 ID로 사용자 조회
        User existingUser = userService.getUserById(user.getUserId());

        if (existingUser == null || !passwordEncoder.matches(user.getUserPass(), existingUser.getUserPass())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // JWT 토큰 생성
        String token = jwtUtil.generateToken(existingUser.getUserId(), existingUser.getRole());

        // JWT 토큰을 쿠키에 저장
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true); // 클라이언트 스크립트에서 접근할 수 없도록 설정
        cookie.setSecure(false); // HTTPS에서만 전송
        cookie.setPath("/"); // 모든 경로에서 유효하도록 설정
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7일 동안 유지
        response.addCookie(cookie); // 응답에 쿠키 추가

        // SameSite 속성을 응답 헤더에 추가
//        response.setHeader("Set-Cookie", "token=" + token + "; HttpOnly; Secure; Path=/; Max-Age=" + (7 * 24 * 60 * 60) + "; SameSite=Strict");

        // 아이디 저장 옵션 추가 (쿠키로 저장)
        if (user.isRememberMe()) { // 클라이언트에서 체크박스 상태를 포함하여 보내도록 수정 필요
            Cookie idCookie = new Cookie("savedId", user.getUserId());
            idCookie.setHttpOnly(true); // 클라이언트 스크립트에서 접근할 수 없도록 설정
            idCookie.setSecure(false); // HTTPS에서만 전송
            idCookie.setPath("/"); // 모든 경로에서 유효하도록 설정
            idCookie.setMaxAge(7 * 24 * 60 * 60); // 7일 동안 유지
            response.addCookie(idCookie); // 응답에 쿠키 추가

            // SameSite 속성을 응답 헤더에 추가
            response.setHeader("Set-Cookie", "savedId=" + user.getUserId() + "; HttpOnly; Secure; Path=/; Max-Age=" + (7 * 24 * 60 * 60) + "; SameSite=Strict");
        }

        return ResponseEntity.ok(token); // 로그인 성공 시 토큰 반환
    }

    @PostMapping("/register")
    public ResponseEntity<Void> registerUser(@RequestBody User user) {
        userService.insertUser(user);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/registerDoctor")
    public ResponseEntity<Void> registerDoctor(@RequestPart("user") User user,
                                               @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        //1.회원정보 저장
        userService.registerUserDoctor(user);
        // 2. 프로필 이미지가 있으면 처리
        if (profileImage != null && !profileImage.isEmpty()) {
            String randomProfileName = profileStorage.storeProfile(profileImage); // 파일 저장 처리
            String profilePath = "/profile/" + randomProfileName;

            // 3. Profile DTO 생성
            Profile profile = new Profile();
            profile.setDoctorNo(user.getUserNo()); // 새로 저장된 doctorNo를 사용
            profile.setFileOriginalName(profileImage.getOriginalFilename());
            profile.setFileName(randomProfileName);
            profile.setFilePath(profilePath);
            profile.setFileSize((int) profileImage.getSize());

            // 로그 추가
            System.out.println("프로필 데이터 저장: " + profile);

            // 4. 프로필 이미지 정보 저장
            profileService.uploadProfile(profile); // 프로필 저장 서비스 호출
        }
        return ResponseEntity.status(201).build();
    }
    @GetMapping("/check-id/{id}")
    public boolean checkId(@PathVariable("id") String userId) {
        return userService.checkIdExists(userId);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/patients")
    public ResponseEntity<List<User>> getPatientList() {
        return ResponseEntity.ok(userService.getPatientList());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<User>> getDoctorList() {
        return ResponseEntity.ok(userService.getDoctorList());
    }

    @GetMapping("/admins")
    public ResponseEntity<List<User>> getAdminList() {
        return ResponseEntity.ok(userService.getAdminList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(userService.getUserByNo(id));
    }

    @GetMapping("/doctorDetail/{doctorNo}")
    public ResponseEntity<User> getDoctorDetail(@PathVariable("doctorNo") int doctorNo) {
        return ResponseEntity.ok(userService.getDoctorDetail(doctorNo));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // 현재 로그인한 사용자 정보 가져오기
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        // "Bearer " 접두사 제거
        String jwt = token.substring(7);

        // JWT에서 사용자 ID 추출
        String userId = jwtUtil.getUserIdFromToken(jwt);

        if (userId == null) {
            return ResponseEntity.status(401).body(null); // JWT가 유효하지 않으면 401 응답
        }

        // 사용자 ID로 사용자 정보 조회
        User user = userService.getUserById(userId);

        if (user == null) {
            return ResponseEntity.status(404).body(null); // 사용자 정보가 없으면 404 응답
        }

        return ResponseEntity.ok(user); // 사용자 정보 반환
    }

    @PutMapping("/updateUser/{userNo}")
    public ResponseEntity<Void> updateUser(
            @PathVariable int userNo,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @RequestBody User user) {

        // JWT 토큰을 Authorization 헤더에서 추출 (Bearer 스킴이 붙어있다고 가정)
        String jwt = authorizationHeader.substring(7); // "Bearer " 이후의 문자열

        user.setUserNo(userNo);
        userService.updateUser(user, jwt); // JWT를 함께 전달

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update/{userNo}")
    public ResponseEntity<Void> updateUser(
            @PathVariable int userNo,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @RequestPart("user") User user,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {

        // JWT 토큰을 Authorization 헤더에서 추출 (Bearer 스킴이 붙어있다고 가정)
        String jwt = authorizationHeader.substring(7); // "Bearer " 이후의 문자열

        user.setUserNo(userNo);
        userService.updateUser(user, jwt); // JWT를 함께 전달
        // 2. 프로필 이미지가 있으면 처리
        if (profileImage != null && !profileImage.isEmpty()) {

            // 1. 기존 프로필 이미지 삭제
            Profile existingProfile = profileService.getProfileById(userNo);
            if (existingProfile != null) {
                profileStorage.deleteProfile(existingProfile.getFilePath()); // 기존 파일 삭제
                profileService.removeProfile(existingProfile.getDoctorNo()); // DB의 기존 프로필 레코드 삭제
            }
            System.out.println("프로필 이미지가 존재함: " + profileImage.getOriginalFilename());
            String randomProfileName = profileStorage.storeProfile(profileImage); // 파일 저장 처리
            System.out.println("저장된 프로필 이름: " + randomProfileName);
            String profilePath = "/profile/" + randomProfileName;

            // 3. Profile DTO 생성
            Profile profile = new Profile();
            profile.setDoctorNo(userNo); // 새로 저장된 doctorNo를 사용
            profile.setFileOriginalName(profileImage.getOriginalFilename());
            profile.setFileName(randomProfileName);
            profile.setFilePath(profilePath);
            profile.setFileSize((int) profileImage.getSize());

            // 로그 추가
            System.out.println("프로필 데이터 저장: " + profile);

            // 4. 프로필 이미지 정보 저장
            profileService.uploadProfile(profile); // 프로필 저장 서비스 호출
        }
        return ResponseEntity.noContent().build();
    }

    // 관리자 - 미승인된 의사 목록
    @GetMapping("/unauthorized")
    public List<User> UnauthorizedDoctorList() {
        return userService.UnauthorizedDoctorList();
    }

    // 관리자 - 의사 권한 승인
    @PutMapping("/approve/{doctorNo}")
    public int ApproveDoctorAuthority(@PathVariable int doctorNo) {
        return userService.ApproveDoctorAuthority(doctorNo);
    }
}
