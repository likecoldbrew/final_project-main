package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
public class Hospitalization {
    @Id
    @GeneratedValue
    private int hospitalizationId;  // 입원 번호
    private int userNo;        // 유저 번호
    private int doctorNo;        // 의사 번호
    private int roomNo;         // 병실 번호
    @Transient
    private String doctorName;        // 의사 이름
    private int departmentNo;     // 부서번호
    @Transient
    private String departmentName;     // 부서이름
    private String diseaseName;      // 환자 병명
    private int status;      // 입원 상태 (1 입원 대기 2 입원 3 퇴원)
    private Timestamp startDate;      // 입원 시작일
    private Timestamp dueDate;      // 퇴원 예정일
    private Timestamp endDate;      // 퇴원일
    @Transient
    private String userName;     // 환자이름
    @Transient
    private String roomType;     // 방 타입 (몇인실)
    @Transient
    private String roomName;     // 호실 이름
    @Transient
    private int seatNo;     // 자리 번호
    @Transient
    private String floor;   // 층
}
