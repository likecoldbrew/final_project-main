package kr.or.nextit.backend.controller;


import kr.or.nextit.backend.component.ProfileStorage;
import kr.or.nextit.backend.model.Profile;
import kr.or.nextit.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;
    private final ProfileStorage profileStorage;

    // 특정 배너 조회
    @GetMapping("/{doctorNo}")
    public Profile getProfileById(@PathVariable("doctorNo") int doctorNo) {
        return profileService.getProfileById(doctorNo);
    }

    // 배너 이미지 불러오기
    @GetMapping("/view/{doctorNo}")
    public ResponseEntity<Resource> viewProfile(@PathVariable int doctorNo) throws IOException {
        Profile profile = profileService.getProfileById(doctorNo);
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return profileService.viewProfile(profile);
    }

    // 프로필 등록
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadProfile(@RequestParam(value = "file", required = false) MultipartFile file, @RequestParam(value = "doctorNo") int doctorNo) { // 배열로 변경
        // 3. 파일 처리 로직
        if (file != null && !file.isEmpty()) {
            String randomProfileName = profileStorage.storeProfile(file);
            String profilePath = "/profile/" + randomProfileName;
            Profile profileImage = new Profile();
            profileImage.setDoctorNo(doctorNo);
            profileImage.setFileName(randomProfileName);
            profileImage.setFileOriginalName(file.getOriginalFilename());
            profileImage.setFilePath(profilePath);
            profileImage.setFileSize((int) file.getSize());
            int count = profileService.uploadProfile(profileImage);
            if (count > 0) {
                System.out.println("등록완료");
            } else {
                System.out.println("업로드 실패");
            }
        }
        return ResponseEntity.ok("게시글이 등록되었습니다.");
    }

    // 배너 삭제
    @DeleteMapping("/remove/{doctorNo}")
    public int removeBanner(@PathVariable int doctorNo) {
        Profile profile = profileService.getProfileById(doctorNo);

        if (profile != null) {
            String profilePath = profile.getFilePath(); // bannerPath를 로컬 변수로 저장
            if (profilePath != null) { // null 체크
                int deletedCount = profileService.removeProfile(doctorNo); // DB에서 배너 삭제
                if (deletedCount > 0) {
                    profileStorage.deleteProfile(profilePath); // 파일 시스템에서 삭제
                    return 1; // 삭제 성공
                } else {
                    return 0; // DB에서 삭제되지 않았을 경우 실패
                }
            } else {
                return 0; // 파일 경로가 없어서 삭제 실패
            }
        } else {
            return 0; // 배너가 없어서 삭제 실패
        }
    }
}
