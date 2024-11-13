package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.Certificate;
import kr.or.nextit.backend.model.Hospital;
import kr.or.nextit.backend.service.CertificateService;
import kr.or.nextit.backend.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/certificates")
public class CertificateViewController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private HospitalService hospitalService;

    // 특정 인증서의 정보를 HTML로 렌더링
    @GetMapping("/print/{userNo}/{certificateId}/{certificateType}")
    public String viewCertificate(@PathVariable int userNo, @PathVariable int certificateId, @PathVariable int certificateType, Model model) {
        Certificate certificate = certificateService.getCertificateById(certificateId);
        Hospital hospital = hospitalService.getHospitalInfo();

        if (certificate != null) {
            model.addAttribute("certificate", certificate);
            model.addAttribute("stamp", certificate.getDoctorName().split(""));
            model.addAttribute("hospital", hospital);

            // certificateType에 따라 다른 템플릿 리턴
            if (certificateType == 1 || certificateType == 2) {
                return "medicalReport"; // 1 또는 2일 경우
            } else if (certificateType == 3) {
                return "adAndDis"; // 3일 경우
            } else {
                return "error"; // 잘못된 certificateType일 경우
            }
        } else {
            return "error"; // 인증서가 없을 경우 에러 페이지
        }
    }

}
