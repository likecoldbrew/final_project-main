package kr.or.nextit.backend.controller;


import kr.or.nextit.backend.component.BannerStorage;
import kr.or.nextit.backend.model.Banner;
import kr.or.nextit.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/banner")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;
    private final BannerStorage bannerStorage;

    // 관리자 - 배너 전체 목록 조회
    @GetMapping("/adminAll")
    public List<Banner> getAllBanners() {
        return bannerService.getAllBanners();
    }

    // 사용자 - 배너 목록 조회
    @GetMapping("/list")
    public List<Banner> getMainBannerList() {
        return bannerService.getMainBannerList();
    }

    // 특정 배너 조회
    @GetMapping("/{bannerId}")
    public Banner getBannerById(@PathVariable("bannerId") int bannerId) {
        return bannerService.getBannerById(bannerId);
    }

    // 배너 이미지 불러오기
    @GetMapping("/view/{bannerId}")
    public ResponseEntity<Resource> viewBanner(@PathVariable int bannerId) throws IOException {
        Banner banner = bannerService.getBannerById(bannerId);

        if (banner == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return bannerService.viewBanner(banner);
    }

    // 배너 등록
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public int uploadBanner(@RequestParam(value = "banners") MultipartFile[] banners) throws IOException {
        int uploadedCount = 0;
        // 최대 banner_order 값을 가져옴
        int maxOrder = bannerService.getMaxBannerOrder(); // maxOrder가 null이면 0으로 설정
        int order = maxOrder + 1;  // 첫 번째 배너의 order 값 설정

        for (MultipartFile banner : banners) {
            if (!banner.isEmpty()) {
                // 파일 저장
                String randomBannerName = bannerStorage.storeBanner(banner);
                String bannerPath = "/banner/" + randomBannerName;

                // 배너 객체 생성
                Banner bannerImage = new Banner();
                bannerImage.setBannerName(randomBannerName);
                bannerImage.setBannerOriginalName(banner.getOriginalFilename());
                bannerImage.setBannerPath(bannerPath);
                bannerImage.setBannerSize((int) banner.getSize());
                bannerImage.setBannerOrder(order++);

                // 배너 업로드
                int count = bannerService.uploadBanner(bannerImage);

                if (count > 0) {
                    uploadedCount++;
                } else {
                    System.out.println("DB에 배너 업로드 실패: " + bannerImage.getBannerName());
                }
            }
        }
        // 업로드된 배너 개수 반환
        return uploadedCount;
    }

    // 배너 순서 변경
    @PutMapping("/change/order")
    public void changeBannerOrder(@RequestBody List<Banner> banners) {
        bannerService.changeBannerOrder(banners);
    }

    // 배너 숨김 처리 (상태 변경)
    @PutMapping("/change/N")
    public int changeStatusBannerInvisible(@RequestParam("bannerId") int bannerId) {
        return bannerService.changeStatusBannerInvisible(bannerId);
    }

    // 배너 표시 처리 (상태 변경)
    @PutMapping("/change/Y")
    public int changeStatusBannerVisible(@RequestParam("bannerId") int bannerId) {
        return bannerService.changeStatusBannerVisible(bannerId);
    }

    // 배너 삭제
    @DeleteMapping("/remove/{bannerId}")
    public int removeBanner(@PathVariable int bannerId) {
        Banner banner = bannerService.getBannerById(bannerId);

        if (banner != null) {
            String bannerName = banner.getBannerName(); // bannerName을 로컬 변수로 저장
            if (bannerName != null) { // null 체크
                int deletedCount = bannerService.removeBanner(bannerId); // DB에서 배너 삭제
                if (deletedCount > 0) {
                    bannerStorage.deleteBanner(bannerName); // 파일 시스템에서 삭제
                    return 1; // 삭제 성공
                } else {
                    return 0; // DB에서 삭제되지 않았을 경우 실패
                }
            } else {
                return 0; // 파일 경로가 없어서 삭제 실패
            }
        } else {
            return 0; // 배너가 없어서 삭제 실패
        }
    }
}
