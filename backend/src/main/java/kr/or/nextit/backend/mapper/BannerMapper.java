package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Banner;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BannerMapper {
    // 관리자 - 배너 전체 목록 조회
    List<Banner> getAllBanners();

    // 사용자 - 배너 목록 조회
    List<Banner> getMainBannerList();

    // 배너 하나 조회
    Banner getBannerById(int bannerId);

    // 최대 banner_order 값 조회
    int getMaxBannerOrder();

    // 배너 업로드
    int uploadBanner(Banner banner);

    // 배너 순서 변경
    int changeBannerOrder(int bannerId, int bannerOrder);

    // 배너 숨김 처리 (상태 변경)
    int changeStatusBannerInvisible(int bannerId);

    // 배너 표시 처리 (상태 변경)
    int changeStatusBannerVisible(int bannerId);

    // 배너 삭제
    int removeBanner(int bannerId);
}