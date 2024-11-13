package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.MealMapper;
import kr.or.nextit.backend.model.Meal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@Service
public class MealService {
    private final MealMapper mealMapper;

    public List<Meal> getAllMealList() {
        return mealMapper.getAllMealList();
    }

    public Meal getMealById(int mealId) {
        return mealMapper.getMealById(mealId);
    }

    // 식단 한 주 조회
    public List<Meal> getMealsByDateRange(LocalDate startDate, LocalDate endDate) {
        return mealMapper.getMealsByDateRange(startDate, endDate);
    }


    public int registerMeal(Meal meal) {
        return mealMapper.registerMeal(meal);
    }

    public int modifyMeal(Meal meal) {
        return mealMapper.modifyMeal(meal);
    }

    public int removeMeal(int mealId) {
        return mealMapper.removeMeal(mealId);
    }
}
