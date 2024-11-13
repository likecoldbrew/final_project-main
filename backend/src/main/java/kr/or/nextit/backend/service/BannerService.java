package kr.or.nextit.backend.service;


import kr.or.nextit.backend.mapper.BannerMapper;
import kr.or.nextit.backend.model.Banner;
import kr.or.nextit.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerMapper bannerMapper;
    private final FileUtil fileUtil;

    // 관리자 - 배너 전체 목록 조회
    public List<Banner> getAllBanners() {
        return bannerMapper.getAllBanners();
    }

    // 사용자 - 배너 목록 조회
    public List<Banner> getMainBannerList() {
        return bannerMapper.getMainBannerList();
    }

    // 배너 하나 조회
    public Banner getBannerById(int bannerId) {
        return bannerMapper.getBannerById(bannerId);
    }

    // 배너 이미지 불러오기
    public ResponseEntity<Resource> viewBanner(Banner banner) throws IOException {
        return ResponseEntity.ok(fileUtil.getFileResource(banner.getBannerPath()));
    }

    // 최대 banner_order 값 조회
    public int getMaxBannerOrder() {
        return bannerMapper.getMaxBannerOrder();
    }

    // 배너 등록
    public int uploadBanner(Banner banner) {
        return bannerMapper.uploadBanner(banner);
    }

    // 배너 순서 변경
    public void changeBannerOrder(List<Banner> banners) {
        for (Banner banner : banners) {
            // 각 배너에 대해 순서 변경 수행
            bannerMapper.changeBannerOrder(banner.getBannerId(), banner.getBannerOrder());
        }
    }

    // 배너 숨김 처리 (상태 변경)
    public int changeStatusBannerInvisible(int bannerId) {
        return bannerMapper.changeStatusBannerInvisible(bannerId);
    }

    // 배너 표시 처리 (상태 변경)
    public int changeStatusBannerVisible(int bannerId) {
        return bannerMapper.changeStatusBannerVisible(bannerId);
    }

    // 배너 삭제
    public int removeBanner(int bannerId) {
        return bannerMapper.removeBanner(bannerId);
    }
}
