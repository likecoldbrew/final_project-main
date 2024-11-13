package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
public class DayOff {
    @Id
    @GeneratedValue
    private int dayOffNo;
    private int doctorNo ;
    private Timestamp dayOff;
    private int dayOffType;
    private String status;
    private String color;
    private String userName;    // 의사이름
}