package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
//@Table(name = "medical_department")  // 테이블 이름을 명시
@Data
public class MedicalDepartment {
    @Id
    @GeneratedValue
    private int departmentNo;    // 진료과 ID
    private String departmentName; // 진료과 이름
}
