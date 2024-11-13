package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class AiRecommend {
    @Id
    @GeneratedValue
    private int recommendId;               // 추천 ID
    private int userNo;                    // 환자 ID
    private String symptomDescription;      // 입력된 증상 설명
    private int recommendedDepartmentNo;    // 추천 진료과 ID
    private int recommendedDoctorNo;    // 추천된 의사 ID (nullable)
    private Date recommendDate;             // 추천 날짜
}