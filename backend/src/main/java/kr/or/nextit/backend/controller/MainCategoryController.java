package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.MainCategory;
import kr.or.nextit.backend.service.MainCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class MainCategoryController {

    private final MainCategoryService mainCategoryService;

    @GetMapping("/main")
    public ResponseEntity<List<MainCategory>> getAllCategories() {
        try {
            List<MainCategory> categories = mainCategoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            // 오류 로그 추가
            System.err.println("Error fetching categories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{urlName}")
    public MainCategory getCategory(@PathVariable String urlName) {
        return mainCategoryService.getCategoryWithParent(urlName);
    }

    // 카테고리 순서 변경
    @PutMapping("/main/update/order")
    public ResponseEntity<String> updateCategoryOrder(@RequestBody List<MainCategory> categories) {
        try {
            mainCategoryService.updateCategoryOrder(categories);
            return ResponseEntity.ok("Category order updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category order.");
        }
    }

    // 카테고리 이름 변경
    @PutMapping("/main/update/name")
    public ResponseEntity<String> updateCategoryName(@RequestBody List<MainCategory> categories) {
        try {
            mainCategoryService.updateCategoryName(categories);
            return ResponseEntity.ok("Category order updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category order.");
        }
    }
}
