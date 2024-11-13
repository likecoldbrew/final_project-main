package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.AiRecommend;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AiRecommendMapper {
    void addRecommendation(AiRecommend airecommend); // 추천 추가 메서드
    List<AiRecommend> getRecommendationsByUser(int userNo);
}

