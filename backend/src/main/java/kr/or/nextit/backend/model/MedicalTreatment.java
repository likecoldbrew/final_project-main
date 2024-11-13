package kr.or.nextit.backend.model;

import lombok.Data;

import jakarta.persistence.*;

@Entity
//@Table(name = "medical_treatment")  // 테이블 이름을 명시
@Data
public class MedicalTreatment {
    @Id
    @GeneratedValue
    private int treatmentNo;      // 진료 분야 ID
    private String treatmentName;   // 진료 분야 이름
}
