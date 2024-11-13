package kr.or.nextit.backend.model;

import jakarta.persistence.Transient;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class Files {
    private int fileId; // 파일 ID
    private int boardId; // 게시글 ID
    private String fileName; // 파일 이름
    private String fileOriginalName; // 원본 파일 이름
    private String filePath; // 파일 경로
    private String fileType; // 파일 타입 (예: 이미지, 문서 등)
    private int fileSize; // 파일 크기 (바이트 단위)
    @Transient
    private MultipartFile file;
}