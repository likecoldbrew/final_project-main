package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.DoctorCategory;
import kr.or.nextit.backend.service.DoctorCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class DoctorCategoryController {

    private final DoctorCategoryService doctorCategoryService;

    @GetMapping("/doctor")
    public ResponseEntity<List<DoctorCategory>> getAllCategories() {
        try {
            List<DoctorCategory> categories = doctorCategoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            // 오류 로그 추가
            System.err.println("Error fetching categories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 카테고리 순서 변경
    @PutMapping("/doctor/update/order")
    public ResponseEntity<String> updateCategoryOrder(@RequestBody List<DoctorCategory> categories) {
        try {
            doctorCategoryService.updateCategoryOrder(categories);
            return ResponseEntity.ok("Category order updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category order.");
        }
    }

    // 카테고리 이름 변경
    @PutMapping("/doctor/update/name")
    public ResponseEntity<String> updateCategoryName(@RequestBody List<DoctorCategory> categories) {
        try {
            doctorCategoryService.updateCategoryName(categories);
            return ResponseEntity.ok("Category order updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category order.");
        }
    }

}
