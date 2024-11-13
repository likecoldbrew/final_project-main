package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.DoctorInfo;
import kr.or.nextit.backend.model.UpdateCareerDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DoctorInfoMapper {
    List<DoctorInfo> getDoctors();  // 최상위 카테고리 조회

    List<DoctorInfo> getDepartments();  // 의사가 있는 전체 진료과 조회

    List<DoctorInfo> getAllDepartments(); //전체 진료과

    List<DoctorInfo> getTreatments(); //전체 진료부서

    List<DoctorInfo> searchDoctors(String searchTerm); //이름으로 의사 조회

    List<DoctorInfo> searchDepartment(String departmentName); // 진료과 이름으로 의사 조회

    //부서 번호로 이름 조회
    List<DoctorInfo> selectDoctorsByDepartment(int departmentNo);

    // 의사 경력 조회
    List<DoctorInfo> getDoctorCareer(int userNo);

    // 의사 학력 조회
    List<DoctorInfo> getDoctorEducation(int userNo);
    // 의사 - 마이페이지 경력 학력 등록 및 수정
//    int insertDoctorCareerAndEducation(DoctorInfo doctorInfo);

    int insertDoctorEducation(DoctorInfo doctorInfo);

    int insertDoctorCareer(DoctorInfo doctorInfo);

    int updateDoctorEducation(UpdateCareerDto updateCareerDto);

    int updateDoctorCareer(UpdateCareerDto updateCareerDto);
}

