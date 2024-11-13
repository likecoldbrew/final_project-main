package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Meal;
import org.apache.ibatis.annotations.Mapper;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface MealMapper {
    List<Meal> getAllMealList();

    Meal getMealById(int MealId);

    List<Meal> getMealsByDateRange(LocalDate startDate, LocalDate endDate);

    int registerMeal(Meal Meal);

    int modifyMeal(Meal Meal);

    int removeMeal(int MealId);
}
