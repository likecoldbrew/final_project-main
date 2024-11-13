package kr.or.nextit.backend.service;


import kr.or.nextit.backend.mapper.FaqMapper;
import kr.or.nextit.backend.model.Community;
import kr.or.nextit.backend.model.Faq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqService {
    private final FaqMapper faqMapper;
    // 목록 조회
    public List<Faq> selectAllFaq() {
        return faqMapper.selectAllFaq();
    }

    //병원후기글 전체 조회 필터
    public List<Faq> getAllFaqByOption(String option, String value) {
        return faqMapper.selectAllFaqByOption(option, value);}

    // 아이템 하나 조회
    public Faq selectFaq(int faqId) {
        return faqMapper.selectFaq(faqId);
    }
    // 등록
    public void insertFaq(Faq faq) {
        faqMapper.insertFaq(faq); // 게시글 업데이트 호출
    }

    // 수정
    public void updateFaq(Faq faq) {
        faqMapper.updateFaq(faq);
    }

    // 삭제
    public void deleteFaq(int faqId) {
        faqMapper.deleteFaq(faqId);
    }

    // 관리자 - 표시
    public void showFaq(int faqId) {
        faqMapper.showFaq(faqId);
    }

    // 관리자 - 목록 조회
    public List<Faq> selectAdminAllFaq() {
        return faqMapper.selectAdminAllFaq();
    }
}
