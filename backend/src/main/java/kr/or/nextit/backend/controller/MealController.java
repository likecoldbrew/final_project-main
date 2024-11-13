package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.Meal;
import kr.or.nextit.backend.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meal")
@RequiredArgsConstructor
public class MealController {
    private final MealService mealService ;

    // 식단 목록 전체 조회
    @GetMapping("/all")
    public List<Meal> getAllMealList() {
        return mealService.getAllMealList();
    }

    // 식단 하나 조회
    @GetMapping("/{mealId}")
    public Meal getMealById(@PathVariable int mealId) {
        return mealService.getMealById(mealId);
    }

    // 식단 한 주 조회
    @GetMapping("/thisweek")
    public List<Meal> getMealsThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.FRIDAY);
        return mealService.getMealsByDateRange(startOfWeek, endOfWeek);
    }

    // 식단 등록
    @PostMapping("/register")
    public int registerMeal(@RequestBody Meal meal) {
        return mealService.registerMeal(meal);
    }

    // 식단 수정
    @PutMapping("/modify")
    public int modifyMeal(@RequestBody Meal meal) {
        return mealService.modifyMeal(meal);
    }

    // 식단 삭제
    @PutMapping("/remove/{mealId}")
    public int removeMeal(@PathVariable int mealId) {
        return mealService.removeMeal(mealId);
    }
}
