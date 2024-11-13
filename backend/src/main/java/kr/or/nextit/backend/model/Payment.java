package kr.or.nextit.backend.model;

import lombok.*;

@AllArgsConstructor
@Data
@Builder
public class Payment {
    private String impuid; // 거래 고유 번호
    private int userNo;
    private String name; //상품명
    private String payMethod; // 결제 종류 카카오페이, 토스
    private Long amount; // 결제금액
    private String status; // 결제여부 paid : 1 , 그 외 실패
}