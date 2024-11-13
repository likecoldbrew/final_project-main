package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Faq {
    @Id
    @GeneratedValue
    private int faqId;
    private String title;
    private String content;
    private String status;
}