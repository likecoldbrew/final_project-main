package kr.or.nextit.backend.model;

import lombok.Data;

@Data
public class UpdatePatientDetailDto {
    MedicalRecord medicalRecord;
    Prescription prescription;
}
