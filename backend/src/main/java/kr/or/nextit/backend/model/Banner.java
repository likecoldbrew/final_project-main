package kr.or.nextit.backend.model;

import jakarta.persistence.Transient;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;

@Data
public class Banner {
    private int bannerId; // 배너 ID
    private String bannerName; // 배너 이름
    private String bannerOriginalName; // 원본 배너 이름
    private String bannerPath; // 배너 경로
    private int bannerSize; // 배너 크기 (바이트 단위)
    private int bannerOrder; // 배너 순서
    private Timestamp uploadedAt; // 업로드 날짜
    private String status;  // 표시 여부
    @Transient
    private MultipartFile banners;
}