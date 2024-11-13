package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
public class Community {
    private int boardId;
    private String title;
    private String content;
    private Timestamp createAt;
    private Timestamp updateAt;
    private int views;
    private int userNo;
    private String userId;
    private String status;
    private List<Files> files; // 첨부파일 정보
}