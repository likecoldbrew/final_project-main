
package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
public class Meal {
    @Id
    @GeneratedValue
    private int mealId;
    private String todayMeal;
    private Timestamp mealDate;
}