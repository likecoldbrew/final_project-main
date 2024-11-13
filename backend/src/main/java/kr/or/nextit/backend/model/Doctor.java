package kr.or.nextit.backend.model;

import lombok.Data;

import jakarta.persistence.*;

import java.util.List;

@Entity
//@Table(name = "doctors")  // 테이블 이름을 명시
@Data
public class Doctor {
    @Id
    @GeneratedValue
    private int doctorNo;        // 의사 ID
    private int doctorUserNo;    // 의사 사용자 ID (users 테이블과 연결)
    private int department;     // 진료과 ID (medical_department 테이블과 연결)
    private String treatment;      // 진료 분야 (comma-separated)
    private String rank;
}
