package kr.or.nextit.backend.component;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Component
public class ProfileStorage {
    // 배너 업로드 경로
    private final String profilePath = new File("backend/src/main/resources/static/profile").getAbsolutePath();

    // 배너 이미지 업로드
    public String getUploadDir() {
        // 디렉토리가 존재하지 않으면 생성
        File directory = new File(profilePath);
        if (!directory.exists()) {
            boolean created = directory.mkdirs(); // 디렉토리 생성
            if (!created) {
                throw new RuntimeException("업로드 디렉토리 생성 실패: " + profilePath);
            }
        }
        return profilePath;
    }

    // 프로필 서버에 저장
    public String storeProfile(MultipartFile file) {
        String uploadPath = getUploadDir();
        String randomFileName = UUID.randomUUID().toString();
        String fileName = randomFileName + "_" + file.getOriginalFilename();
        File targetFile = new File(uploadPath, fileName);
        try {
            // 파일을 지정한 경로에 저장
            file.transferTo(targetFile);
            System.out.println("파일 저장 성공: " + targetFile.getAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다: " + e.getMessage());
        }
        return fileName; // 저장된 파일의 랜덤 이름 반환
    }

    // 프로필 서버에서 삭제
    public void deleteProfile(String profilePath) {
        File profileToDelete = new File(profilePath);
        if (profileToDelete.exists()) {
            boolean deleted = profileToDelete.delete();
            if (!deleted) {
                throw new RuntimeException("배너 삭제 실패: " + profilePath);
            }
        } else {
            System.out.println("배너 파일이 존재하지 않아 삭제하지 않습니다: " + profilePath);
        }
    }
}