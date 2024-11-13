package kr.or.nextit.backend.model;

import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
public class BoardFiles {
    private int fileId; // 파일 ID
    private int boardId; // 게시글 ID
    private String fileName; // 파일 이름
    private String fileOriginalName; // 원본 파일 이름
    private String filePath; // 파일 경로
    private String fileType; // 파일 타입 (예: 이미지, 문서 등등)
    private int fileSize; // 파일 크기 (바이트 단위)
    
}