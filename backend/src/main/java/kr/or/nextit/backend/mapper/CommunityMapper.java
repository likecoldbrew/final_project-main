package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Community;
import kr.or.nextit.backend.model.Files;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommunityMapper {
    //게시글 전체 조회
    List<Community> selectAllBoardsWithUser();

    //게시글 전체 조회 필터링
    List<Community> selectAllBoardsByOptions(@Param("option") String option, @Param("value") String value);

    //공지사항 전체 조회
    List<Community> selectAllBoardsWithAdmin();

    //공지사항 전체 필터링 조회
    List<Community> selectAllNoticesByOptions(@Param("option") String option, @Param("value") String value);

    //특정 게시글 조회
    List<Community> selectBoard(int boardId);

    // 게시글 등록
    int insertBoard(Community boardDTO);

    // 게시글 수정
    int updateBoard(Community boardDTO);

    // 파일 삭제를 위한 메소드 추가
    void deleteFilesByIds(@Param("fileIds") List<Integer> fileIds);

    //조회수
    void updateViews(int boardId);

    // 첨부파일 삽입
    int insertBoardFiles(List<Files> files);

    // 게시글 삭제
    int deleteBoard(int boardId);

    // 관리자 페이지 - 게시판 전체 조회
    List<Community> getAdminAllBoards();

    // 관리자 페이지 - 공지사항 전체 조회
    List<Community> getAdminAllNotices();

    // 관리자 페이지 - 게시글 살리기
    int showBoard(int boardId);

    // 관리자 페이지 - 회원 작성 글 목록 조회
    List<Community> getUserBoardList(int userNo);
}

