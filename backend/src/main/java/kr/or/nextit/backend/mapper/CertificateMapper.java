package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Certificate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CertificateMapper {

    void insertCertificate(Certificate certificate); // Create

    List<Certificate> selectCertificateByUserNo(@Param("userNo") int userNo); // Read by UserNo

    List<Certificate> selectCertificateByDoctorNo(int doctorNo);

    Certificate selectCertificateById(@Param("certificateId") int certificateId); // Read by ID

    List<Certificate> selectAllCertificates(); // Read all

    void updateCertificate(Certificate certificate); // Update

    void deleteCertificate(@Param("certificateId") int certificateId); // Delete

}
