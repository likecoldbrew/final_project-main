package kr.or.nextit.backend.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Data
public class DoctorInfo {
    private int educationId;
    private int careerId;
    private String userName;        // 의사 이름
    private String userNo;        // 의사 번호
    private int doctorNo;
    private List<String> userNames; // 의사 이름 리스트
    private String departmentName;  // 진료과 이름
    private int departmentNo;  // 진료과 번호
    private int treatmentNo;  // 진료부서 번호
    private String treatmentName; //진료부서 이름
    private List<String> treatments; // 진료 분야 리스트
    private String careerInfo;      // 경력
    private String careerDate;      // 경력 날짜
    private String educationBackground;       // 학력
    private String educationDate;   // 학력 취득일

    public void setTreatments(String treatments) {
        if (treatments != null) {
            this.treatments = Arrays.asList(treatments.split(","));
        } else {
            this.treatments = new ArrayList<>();
        }
    }

    public void setUserNames(String userNames) {
        if (userNames != null) {
            this.userNames = Arrays.asList(userNames.split(","));
        } else {
            this.userNames = new ArrayList<>();
        }
    }
}