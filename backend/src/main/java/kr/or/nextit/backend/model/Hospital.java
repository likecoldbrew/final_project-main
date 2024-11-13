package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
public class Hospital {
    @Id
    @GeneratedValue
    private String hospitalNameKr;    // 병원 한글명
    private String hospitalNameEn;    // 병원 영문명
    private String hospitalAdd; // 병원 주소
    private String huntingLine; // 대표번호
    private String businessRegistrationNumber;  // 사업자 번호
    private String reserveNumber;   // 예약 전화번호
    private String reserveTime; // 예약 전화 가능 시간
    private String clinicTime;  // 진료 시간
    private String intro;   // 병원 소개
    private String copyright;   // 저작권 표시
    private String greetings;   // 인사말
}
