package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.CertificateMapper;
import kr.or.nextit.backend.model.Certificate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CertificateService {

    @Autowired
    private CertificateMapper certificateMapper;

    public void createCertificate(Certificate certificate) {
        certificateMapper.insertCertificate(certificate);
    }

    public List<Certificate> getCertificatesByUserNo(int userNo) {
        return certificateMapper.selectCertificateByUserNo(userNo);
    }

    public List<Certificate> getCertificatesByDoctorNo(int doctorNo) {
        return certificateMapper.selectCertificateByDoctorNo(doctorNo);
    }

    public Certificate getCertificateById(int certificateById) {
        return certificateMapper.selectCertificateById(certificateById);
    }

    public List<Certificate> getAllCertificates() {
        return certificateMapper.selectAllCertificates();
    }

    public void updateCertificate(Certificate certificate) {
        certificateMapper.updateCertificate(certificate);
    }

    public void deleteCertificate(int certificateId) {
        certificateMapper.deleteCertificate(certificateId);
    }

}
