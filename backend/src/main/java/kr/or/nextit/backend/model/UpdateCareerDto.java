package kr.or.nextit.backend.model;

import lombok.Data;

import java.util.List;

@Data
public class UpdateCareerDto {
    private int doctorNo;
    private List<DoctorInfo> careers;
    private List<DoctorInfo> educations;
}
