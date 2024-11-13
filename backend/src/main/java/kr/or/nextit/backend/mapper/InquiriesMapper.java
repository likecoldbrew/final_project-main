package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Inquiries;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InquiriesMapper {
    // 문의사항 전체 조회
    List<Inquiries> allInquiries();
    // 특정 문의글 조희
    Inquiries selectInquiry(int inquirieId);
    // 문의사항 등록
    void createInquiry(Inquiries inquiries);
    // 관리자 - 문의사항 답변 등록 (수정)
    void updateAdminInquiry(Inquiries inquiries);
    // 회원 - 문의사항 삭제
    void deleteUserInquiry(int inquirieId);
    // 관리자 - 문의사항 삭제 (답변 초기화)
    void deleteAdminInquiry(int inquirieId);
    // 관리자 - 문의사항 전체 조회
    List<Inquiries> totalAdminInquiries();
    // 관리자 - 회원 문의사항 표시
    void showInquiry(int inquirieId);
    // 회원이 작성한 문의글 목록 조회
    List<Inquiries> selectUserInquiries(int userNo);
}

