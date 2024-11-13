package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.Certificate;
import kr.or.nextit.backend.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @PostMapping
    public ResponseEntity<Void> createCertificate(@RequestBody Certificate certificate) {
        certificateService.createCertificate(certificate);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 해당 유저의 인증서 가져오기
    @GetMapping("/user/{userNo}")
    public ResponseEntity<List<Certificate>> getCertificatesByUserNo(@PathVariable int userNo) {
        List<Certificate> certificates = certificateService.getCertificatesByUserNo(userNo); // 서비스 호출 변경
        return ResponseEntity.ok(certificates); // List<Certificate> 반환
    }

    //의사에게 등록된 유저들의 인증서 가져오기
    @GetMapping("/doctor/{doctorNo}")
    public ResponseEntity<List<Certificate>> getCertificatesByDoctorNo(@PathVariable int doctorNo) {
        List<Certificate> certificates = certificateService.getCertificatesByDoctorNo(doctorNo); // 서비스 호출 변경
        return ResponseEntity.ok(certificates); // List<Certificate> 반환
    }

    // 전체 인증서 가져오기
    @GetMapping
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        List<Certificate> certificates = certificateService.getAllCertificates();
        return ResponseEntity.ok(certificates);
    }

    // 수정
    @PutMapping("/{certificateId}")
    public ResponseEntity<Void> updateCertificate(@PathVariable int certificateId, @RequestBody Certificate certificate) {
        certificate.setCertificateId(certificateId);
        certificateService.updateCertificate(certificate);
        return ResponseEntity.ok().build();
    }

    // 삭제
    @DeleteMapping("/{certificateId}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable int certificateId) {
        certificateService.deleteCertificate(certificateId);
        return ResponseEntity.noContent().build();
    }
}
