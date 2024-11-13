package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.PaymentMapper;
import kr.or.nextit.backend.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentMapper paymentMapper;

    @Autowired
    public PaymentService(PaymentMapper paymentMapper) {
        this.paymentMapper = paymentMapper;
    }

    // 모든 결제 정보를 가져오는 메서드
    public List<Payment> getAllPayments() {
        return paymentMapper.getAllPayments();
    }

    // 특정 유저의 결제 내역을 가져오는 메서드
    public List<Payment> getPaymentsByUserNo(int userNo) {
        return paymentMapper.getPaymentsByUserNo(userNo);
    }

    // 특정 impuid로 결제 정보를 조회하는 메서드
    public Payment getPaymentByImpUid(String impuid) {
        return paymentMapper.getPaymentByImpUid(impuid);
    }

    // 새로운 결제 정보를 삽입하는 메서드
    public void insertPayment(Payment payment) {
        paymentMapper.insertPayment(payment);
    }

    // 결제 정보를 업데이트하는 메서드
    public void updatePayment(Payment payment) {
        paymentMapper.updatePayment(payment);
    }

    // impuid로 결제 정보를 삭제하는 메서드
    public void deletePaymentByImpUid(String impuid) {
        paymentMapper.deletePaymentByImpUid(impuid);
    }

    // impuid로 결제 건수를 확인하는 메서드 (중복 결제 검사)
    public int countByImpUid(String impuid) {
        return paymentMapper.countByImpUid(impuid);
    }

    // 결제 유효성을 검사하는 메서드
    public boolean verifyPayment(String impuid, int userNo) {
        // Check if the payment is already processed
        return countByImpUid(impuid) == 0; // 0이면 결제 가능
    }
}
