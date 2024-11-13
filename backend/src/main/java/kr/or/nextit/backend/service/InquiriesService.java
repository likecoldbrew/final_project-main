package kr.or.nextit.backend.service;


import kr.or.nextit.backend.mapper.InquiriesMapper;
import kr.or.nextit.backend.model.Inquiries;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiriesService {
    private final InquiriesMapper inquiriesMapper;

    // 문의사항 전체 조회
    public List<Inquiries> allInquiries() {
        return inquiriesMapper.allInquiries();
    }

    // 특정 문의글 조회
    public Inquiries selectInquiry(int inquirieId) {
        return inquiriesMapper.selectInquiry(inquirieId);
    }

    // 문의사항 등록
    public void createInquiry(Inquiries inquiries) {
        inquiriesMapper.createInquiry(inquiries);
    }

    // 관리자 - 문의사항 답변 등록 (수정)
    public void updateAdminInquiry(Inquiries inquiries) {
        inquiriesMapper.updateAdminInquiry(inquiries);
    }

    // 회원 - 문의사항 삭제
    public void deleteUserInquiry(int inquirieId) {
        inquiriesMapper.deleteUserInquiry(inquirieId);
    }

    // 관리자 - 문의사항 삭제 (답변 초기화)
    public void deleteAdminInquiry(int inquirieId) {
        inquiriesMapper.deleteAdminInquiry(inquirieId);
    }
    // 관리자 - 문의사항 전체 조회
    public List<Inquiries> totalAdminInquiries() {
        return inquiriesMapper.totalAdminInquiries();
    }

    // 관리자 - 회원 문의사항 표시
    public void showInquiry(int inquirieId) {
        inquiriesMapper.showInquiry(inquirieId);
    }

    // 회원이 작성한 문의글 목록 조회
    public List<Inquiries> selectUserInquiries(int userNo) {
        return inquiriesMapper.selectUserInquiries(userNo);
    }
}
