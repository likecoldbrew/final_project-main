package kr.or.nextit.backend.service;


import jakarta.transaction.Transactional;
import kr.or.nextit.backend.mapper.DoctorInfoMapper;
import kr.or.nextit.backend.model.DoctorInfo;
import kr.or.nextit.backend.model.UpdateCareerDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorInfoService {

    private final DoctorInfoMapper doctorInfoMapper;

    //전체 의사 조회
    public List<DoctorInfo> getAllDoctors() {
        return doctorInfoMapper.getDoctors();
    }

    //의사가 있는 전체 진료과 조회
    public List<DoctorInfo> getAllDepartments() {
        return doctorInfoMapper.getDepartments();
    }

    //전체 진료과 조회
    public List<DoctorInfo> getDepartmentAll() {
        return doctorInfoMapper.getAllDepartments();
    }

    //전체 진료부서 조회
    public List<DoctorInfo> getAllTreatments() {
        return doctorInfoMapper.getTreatments();
    }

    //진료과로 특정 의사 조회
    public List<DoctorInfo> getDoctorsByDepartment(int departmentNo) {
        return doctorInfoMapper.selectDoctorsByDepartment(departmentNo);
    }

    //의사 검색
    public List<DoctorInfo> searchDoctors(String searchTerm) {
        return doctorInfoMapper.searchDoctors(searchTerm);
    }

    // 진료과 검색
    public List<DoctorInfo> searchDepartment(String departmentName) {
        return doctorInfoMapper.searchDepartment(departmentName);
    }

    // 의사 경력 조회
    public List<DoctorInfo> getDoctorCareer(int userNo) {
        return doctorInfoMapper.getDoctorCareer(userNo);
    }

    // 의사 학력 조회
    public List<DoctorInfo> getDoctorEducation(int userNo) {
        return doctorInfoMapper.getDoctorEducation(userNo);
    }

    // 의사 경력 학력 등록 및 수정
//    public int insertDoctorCareerAndEducation(DoctorInfo doctorInfo) {
//        return doctorInfoMapper.insertDoctorCareerAndEducation(doctorInfo);
//    }

    public int insertDoctorEducation(DoctorInfo doctorInfo) {
        return doctorInfoMapper.insertDoctorEducation(doctorInfo);
    }

    public int insertDoctorCareer(DoctorInfo doctorInfo) {
        return doctorInfoMapper.insertDoctorCareer(doctorInfo);
    }

    @Transactional
    public void updateCareer(UpdateCareerDto updateCareerDto) {
        int educationUpdateResult = doctorInfoMapper.updateDoctorEducation(updateCareerDto);

//        try {
//            // 경력 정보 업데이트
////            int careerUpdateResult = doctorInfoMapper.updateDoctorCareer(updateCareerDto);
//
//            // 학력 정보 업데이트
//            int educationUpdateResult = doctorInfoMapper.updateDoctorEducation(updateCareerDto);
//
//            // 업데이트가 정상적으로 이루어졌다면
////            if (careerUpdateResult == 0 && educationUpdateResult == 0) {
////                throw new RuntimeException("Failed to update Career and Education");
////            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            throw new RuntimeException(e.getMessage());
//        }
    }

}
