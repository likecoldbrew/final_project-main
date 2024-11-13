package kr.or.nextit.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Random;

@Entity
@Data
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성
    private int certificateId; // 증명서 ID

    private int userNo; // 유저 정보
    private int doctorNo; // 의사 정보

    private int certificateType; // 타입 (1: 진단, 2: 소견, 3: 입퇴원)

    private String disease; // 병명

    private String content; // 내용
    private String note; //비고
    private String purpose;
    private Date outbreakAt; // 발병일

    private int referenceId;
    public String formattedOutbreakAt() {
        if (outbreakAt == null) {
            return "";
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy년MM월dd일");
        return sdf.format(outbreakAt);
    }

    private Date visitAt; // 진료일

    public String formattedVisitAt() {
        if (visitAt == null) {
            return "";
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy년MM월dd일");
        return sdf.format(visitAt);
    }

    private Date createAt; // 증명서 발급일

    private Date validUntil; // 유효기간

    private int status; // 상태 (0: 발급 대기, 1: 발급 완료)

    @Transient
    private String userName; // 사용자 이름
    @Transient
    private String userRrn; // 사용자 주민등록번호
    @Transient
    private String userAdd; // 사용자 주소
    @Transient
    private String userAdd2; // 사용자 주소 추가 정보
    @Transient
    private String phone; // 사용자 전화번호

    @Transient
    private String doctorName; // 의사 이름
    @Transient
    private String diagnosis; // 진단 내용



    // Method to extract age from 주민등록번호
    public int age() {
        if (userRrn == null || userRrn.length() < 14) {
            throw new IllegalArgumentException("Invalid 주민등록번호 format.");
        }

        String birthDateStr = userRrn.substring(0, 6); // Extract YYMMDD
        String genderIndicator = userRrn.substring(7, 8); // Extract gender indicator

        // Determine the century based on gender indicator
        int birthYear = Integer.parseInt(birthDateStr.substring(0, 2));
        int birthMonth = Integer.parseInt(birthDateStr.substring(2, 4));
        int birthDay = Integer.parseInt(birthDateStr.substring(4, 6));

        if (genderIndicator.equals("1") || genderIndicator.equals("2")) {
            birthYear += 1900; // 1900s
        } else {
            birthYear += 2000; // 2000s
        }

        Calendar birthDate = Calendar.getInstance();
        birthDate.set(birthYear, birthMonth - 1, birthDay); // Month is 0-based in Calendar

        Calendar today = Calendar.getInstance();

        int age = today.get(Calendar.YEAR) - birthDate.get(Calendar.YEAR);

        // Adjust age if birthday has not occurred yet this year
        if (today.get(Calendar.DAY_OF_YEAR) < birthDate.get(Calendar.DAY_OF_YEAR)) {
            age--;
        }

        return age;
    }

    // Method to get gender from 주민등록번호
    public String gender() {
        if (userRrn == null || userRrn.length() < 14) {
            throw new IllegalArgumentException("Invalid 주민등록번호 format.");
        }

        String genderIndicator = userRrn.substring(7, 8); // Extract gender indicator

        return genderIndicator.equals("1") || genderIndicator.equals("3") ? "남" : "여";
    }

    // Method to get birthdate from 주민등록번호
    public String birth() {
        if (userRrn == null || userRrn.length() < 14) {
            throw new IllegalArgumentException("Invalid 주민등록번호 format.");
        }

        String birthDateStr = userRrn.substring(0, 6); // Extract YYMMDD
        int birthYear = Integer.parseInt(birthDateStr.substring(0, 2));
        int birthMonth = Integer.parseInt(birthDateStr.substring(2, 4));
        int birthDay = Integer.parseInt(birthDateStr.substring(4, 6));

        // Determine the century based on the gender indicator
        String genderIndicator = userRrn.substring(7, 8);
        if (genderIndicator.equals("1") || genderIndicator.equals("2")) {
            birthYear += 1900; // 1900s
        } else {
            birthYear += 2000; // 2000s
        }

        // Format the birth date as "YYYY.MM.DD"
        return String.format("%04d.%02d.%02d", birthYear, birthMonth, birthDay);
    }
    //병록번호
    public String medicalRn() {
        if (userRrn == null || userRrn.isEmpty()) {
            throw new IllegalArgumentException("주민등록번호는 null이거나 비어있을 수 없습니다.");
        }
        String[] arr = userRrn.split("-");
        long rn = Long.parseLong(arr[0]) + Long.parseLong(arr[1]);

        return Long.toHexString(rn);
    }

    public String today() {
        return new SimpleDateFormat("yyyyMMdd").format(new Date());
    }

    public String diseaseCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 2; i++) { // 두 번 반복
            char randomLetter = (char) ('A' + random.nextInt(26));
            int number = random.nextInt(100); // 0 ~ 99 사이의 숫자
            sb.append(String.format("%c%02d", randomLetter, number));
            if (i == 0) {
                sb.append("-"); // 첫 번째 코드와 두 번째 코드 사이에 " - " 추가
            }
        }

        return sb.toString(); // 최종 문자열 반환
    }

    public String todayDate() {
        return new SimpleDateFormat("yyyy년 MM월 dd일").format(new Date());
    }

    public String licenseNumber() {
        Random random = new Random();
        int number = random.nextInt(100000);  // 0 ~ 99999 사이의 랜덤 숫자 생성

        // 숫자 앞에 0을 붙여 8자리로 변환
        return String.format("%08d", number);
    }
    @Transient
    private String departmentName;
    private Date startDate;
    private Date endDate;

    public String formattedStartDate() {
        if (startDate == null) {
            return "";
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd");
        return sdf.format(startDate);
    }

    public String formattedEndDate() {
        if (endDate == null) {
            return "";
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd");
        return sdf.format(endDate);
    }
}
