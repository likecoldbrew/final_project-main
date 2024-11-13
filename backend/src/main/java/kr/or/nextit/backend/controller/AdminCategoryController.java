package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.AdminCategory;
import kr.or.nextit.backend.service.AdminCategoryService;
import kr.or.nextit.backend.mapper.AdminCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    // 상위 및 하위 카테고리 가져오기
    @GetMapping("/admin")
    public ResponseEntity<List<AdminCategory>> getAllCategories() {
        try {
            List<AdminCategory> categories = adminCategoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            // 오류 로그 추가
            System.err.println("Error fetching categories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 카테고리 순서 변경
    @PutMapping("/admin/update/order")
    public ResponseEntity<String> updateCategoryOrder(@RequestBody List<AdminCategory> categories) {
        try {
            adminCategoryService.updateCategoryOrder(categories);
            return ResponseEntity.ok("Category order updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category order.");
        }
    }

    // 카테고리 이름 변경
    @PutMapping("/admin/update/name")
    public ResponseEntity<String> updateCategoryName(@RequestBody List<AdminCategory> categories) {
        try {
            adminCategoryService.updateCategoryName(categories);
            return ResponseEntity.ok("Category order updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category order.");
        }
    }
}
