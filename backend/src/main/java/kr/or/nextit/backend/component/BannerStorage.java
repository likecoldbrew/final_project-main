package kr.or.nextit.backend.component;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class BannerStorage {
    // 배너 업로드 경로
    private final String bannerPath = new File("backend/src/main/resources/static/banner").getAbsolutePath();

    // 배너 이미지 업로드
    public String getUploadDir() {
        // 디렉토리가 존재하지 않으면 생성
        File directory = new File(bannerPath);
        if (!directory.exists()) {
            boolean created = directory.mkdirs(); // 디렉토리 생성
            if (!created) {
                throw new RuntimeException("업로드 디렉토리 생성 실패: " + bannerPath);
            }
        }
        return bannerPath;
    }

    public String storeBanner(MultipartFile banner) {
        String baseDir = System.getProperty("user.dir");  // 현재 애플리케이션의 실행 디렉토리
//        String uploadDir = baseDir + File.separator + "src" + File.separator + "main" + File.separator + "resources" + File.separator + "static" + File.separator + "uploads" + File.separator + "banner";

        String uploadDir = baseDir + File.separator + "src" + File.separator + "main" + File.separator + "resources"
                + File.separator + "static" + File.separator + "images";
        // 디렉토리가 존재하지 않으면 생성
        File directory = new File(uploadDir);

        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (!created) {
                throw new RuntimeException("업로드 디렉토리 생성 실패: " + uploadDir);
            }
        }
        String randomBannerName = UUID.randomUUID().toString();
        String bannerName = "6a68d306-bef9-44ff-8723-33aa5c1a9399_8_다양.png";

        Path path = Paths.get(uploadDir + File.separator + bannerName);

        try {
            // 배너을 지정한 경로에 저장
            banner.transferTo(path.toFile());
        } catch (IOException e) {

        }
        return bannerName;
    }

    // 배너 서버에서 삭제
    public void deleteBanner(String bannerName) {
        String path = bannerPath + "/" + bannerName;
        File bannerToDelete = new File(path);
        if (bannerToDelete.exists()) {
            boolean deleted = bannerToDelete.delete();
            if (!deleted) {
                throw new RuntimeException("배너 삭제 실패: " + path);
            }
        } else {
            throw new RuntimeException("배너가 존재하지 않습니다: " + path);
        }
    }
}