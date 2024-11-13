package kr.or.nextit.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성
    private int userNo;

    private String userId;

    private String userPass; // 비밀번호 (암호화 필요)

    private String userName;

    private String userRrn; // 주민등록번호
    private String email;
    private String phone;
    private String userAdd;
    private String userAdd2;

    private Timestamp createAt; // 생성일자

    private Timestamp updateAt; // 수정일자

    // admin: 0 = 환자, 1 = 의사, 2 = 관리자, 4=의사 가입 승인 대기중
    private int admin;

    private String status; // 삭제 여부 ('Y', 'N')

    @Transient
    private int doctorNo; //

    @Transient
    private int departmentNo;


    @Transient // DB에 저장되지 않는 필드
    private String departmentName; // 부서명 (의사일 경우)

    @Transient // DB에 저장되지 않는 필드
    private int department; // 진료과 (의사일 경우)

    @Transient // DB에 저장되지 않는 필드
    private String treatment; // 진료부서 (의사일 경우)

    @Transient
    private String rank; // 직급 (의사일 경우)

    @Transient // DB에 저장되지 않는 필드
    private boolean rememberMe; // 아이디 저장 옵션 추가
    @Transient
    private MultipartFile profileImage; // 프로필 이미지 파일

    // 역할(Role) 가져오기
    public String getRole() {
        switch (admin) {
            case 0:
                return "PATIENT";
            case 1:
                return "DOCTOR";
            case 2:
                return "ADMIN";
            default:
                return "UNKNOWN";
        }
    }

    // 엔티티가 처음 저장되기 전 실행되는 메서드
    @PrePersist
    protected void onCreate() {
        this.createAt = Timestamp.from(Instant.now()); // 현재 시간 설정
        this.status = "N"; // 기본값 'N' 설정
    }

    // 엔티티가 업데이트될 때 호출되는 메서드
    @PreUpdate
    protected void onUpdate() {
        this.updateAt = Timestamp.from(Instant.now()); // 수정 시간 갱신
    }

    // Custom getter for rememberMe
    public boolean isRememberMe() {
        return rememberMe;
    }
        @Transient
    private String treatments; // 진료 분야 리스트

    public void setTreatments(String treatments) {
        if (treatments != null) {
            this.treatments = String.join(", ", treatments.split(","));
        } else {
            this.treatments = "";
        }
    }
}
