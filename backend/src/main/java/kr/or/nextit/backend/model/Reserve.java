package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Data
public class Reserve {
    @Id
    @GeneratedValue
    private int reserveId;      // 진료 예약 id
    private int userNo;         // 환자 id
    private int doctorNo;       // 의사 id
    private int medicalDepartment; // 진료과
    @Transient
    private String departmentName; // 진료과 이름
    private Timestamp reserveTime; // 예약 시간 (assuming it's in String format, adjust if needed)
    private String symptom;     // 증상
    private int status;         // 대기중:0, 승인완료:1
    @Transient
    private String userName; // 환자 이름
    @Transient
    private String doctorName;  // 의사 이름
}
