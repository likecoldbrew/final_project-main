package kr.or.nextit.backend.controller;



import kr.or.nextit.backend.model.Faq;
import kr.or.nextit.backend.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;
    // 목록 조회
    @GetMapping("/all")
    public List<Faq> selectAllFaq() {
        return faqService.selectAllFaq();
    }

    //전체 후기길 필터링
    @GetMapping("/allByOption")
    public List<Faq> getAllFaqByOption(@RequestParam String option, @RequestParam String value) {
        return faqService.getAllFaqByOption(option, value);
    }

    // 아이템 하나 조회
    @GetMapping("/detail")
    public Faq selectFaq(int faqId) {
        return faqService.selectFaq(faqId);
    }

    // 등록
    @PostMapping("/register")
    public ResponseEntity<Void> createFaq(@RequestParam String title,
                                          @RequestParam String content) {
        Faq faq = new Faq(); // Faq 객체 생성
        faq.setTitle(title);
        faq.setContent(content);
        faqService.insertFaq(faq);
        return new ResponseEntity<>(HttpStatus.CREATED); // 생성 성공
    }

    // 수정
    @PutMapping("/update/{faqId}")
    public ResponseEntity<Void> updateFaq(@PathVariable("faqId") int faqId,
                                          @RequestParam("title") String title,
                                          @RequestParam("content") String content) {
        // FAQ 항목을 데이터베이스에서 조회
        Faq faq = faqService.selectFaq(faqId);

        // 해당 ID로 FAQ 항목이 존재하지 않을 경우
        if (faq == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found 응답
        }

        // 제목과 내용을 수정
        faq.setTitle(title);
        faq.setContent(content);

        // 수정된 FAQ 항목을 데이터베이스에 저장
        faqService.updateFaq(faq);

        return new ResponseEntity<>(HttpStatus.OK); // 200 OK 응답
    }

    // 삭제
    @PutMapping("/delete/{faqId}")
    public ResponseEntity<Void> deleteFaq(@PathVariable("faqId") int faqId) {
        // ID로 FAQ 항목을 데이터베이스에서 조회
        Faq faq = faqService.selectFaq(faqId);

        // 해당 ID로 FAQ 항목이 존재하지 않을 경우
        if (faq == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found 응답
        }

        // FAQ 항목 삭제
        faqService.deleteFaq(faqId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content 응답
    }

    // 관리자 페이지 - 살리기
    @PutMapping("/show/{faqId}")
    public ResponseEntity<Void> showFaq(@PathVariable("faqId") int faqId) {
        // ID로 FAQ 항목을 데이터베이스에서 조회
        Faq faq = faqService.selectFaq(faqId);

        // 해당 ID로 FAQ 항목이 존재하지 않을 경우
        if (faq == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found 응답
        }

        // FAQ 항목 표시
        faqService.showFaq(faqId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content 응답
    }

    // 관리자 페이지 - 목록 조회
    @GetMapping("/admin/all")
    public List<Faq> selectAdminAllFaq() {
        return faqService.selectAdminAllFaq();
    }
}
