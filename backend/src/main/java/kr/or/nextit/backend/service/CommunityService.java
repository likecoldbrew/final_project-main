package kr.or.nextit.backend.service;


import jakarta.transaction.Transactional;
import kr.or.nextit.backend.mapper.CommunityMapper;
import kr.or.nextit.backend.mapper.FilesMapper;
import kr.or.nextit.backend.model.Community;
import kr.or.nextit.backend.model.Files;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {
    private final CommunityMapper communityMapper;
    private final FilesMapper filesMapper;
    private final FilesService filesService;

    //병원후기글 전체 조회
    public List<Community> getAllBoardsWithUser() {
        return communityMapper.selectAllBoardsWithUser();
    }

    //병원후기글 전체 조회 필터
    public List<Community> getAllBoardsByOption(String option, String value) {
        return communityMapper.selectAllBoardsByOptions(option, value);
    }

    //공지사항글 전체 조회
    public List<Community> getAllBoardsWithAdmin() {
        return communityMapper.selectAllBoardsWithAdmin();
    }

    //공지사항 전체 조회 필터
    public List<Community> getAllNoticesByOption(String option, String value) {
        return communityMapper.selectAllNoticesByOptions(option, value);
    }

    // 특정 게시글 조회와 첨부파일 포함
    public Community selectBoard(int boardId) {
        Community board = communityMapper.selectBoard(boardId).get(0); // 게시글 정보 가져오기
        List<Files> files = filesMapper.selectAllFiles(boardId); // 첨부파일 정보 가져오기
        board.setFiles(files); // 게시글에 첨부파일 추가
        return board; // 게시글과 첨부파일 정보를 포함한 Community 객체 반환
    }

    // 게시글 등록
    public int registerBoard(Community boardDTO) {
        int retValue = communityMapper.insertBoard(boardDTO);
        if (boardDTO.getFiles() != null && !boardDTO.getFiles().isEmpty()) {
            int boardId = boardDTO.getBoardId(); // 방금 등록한 게시글 ID
            List<Files> fileList = boardDTO.getFiles();
            for (Files file : fileList) {
                file.setBoardId(boardId); // 파일의 board_id 설정
            }
            filesService.saveFiles(fileList, boardId); // 리스트 전체를 한 번에 삽입
        }
        return retValue;
    }

    // 게시글 업데이트
    @Transactional
    public int updateBoard(Community board, int deletedFileId) {
        int result = communityMapper.updateBoard(board);
        if (result > 0) {
            int boardId = board.getBoardId();
            // 삭제할 파일 처리
            if (deletedFileId > 0) {
                filesService.deleteFiles(deletedFileId); // 단일 파일 삭제
            }
            // 새로 추가할 파일 처리
            List<Files> fileList = board.getFiles();
            List<String> existingFileNames = new ArrayList<>();
            // 기존 파일 이름 목록 생성
            if (fileList != null && !fileList.isEmpty()) {
                // 기존 파일 이름을 데이터베이스에서 가져옴
                List<Files> existingFiles = filesService.selectAllFiles(boardId);
                for (Files existingFile : existingFiles) {
                    existingFileNames.add(existingFile.getFileOriginalName()); // 기존 파일 이름 추가
                }
                // 새로 추가할 파일 처리
                List<Files> newFiles = new ArrayList<>(); // 새로 추가할 파일 리스트
                for (Files file : fileList) {
                    // 중복 파일이 아닌 경우에만 boardId 설정
                    if (!existingFileNames.contains(file.getFileOriginalName())) {
                        file.setBoardId(boardId); // boardId 설정
                        newFiles.add(file); // 새로 추가할 파일 리스트에 추가
                    }
                }
                // 새로 추가할 파일 저장
                if (!newFiles.isEmpty()) {
                    filesService.saveFiles(newFiles, boardId); // 두 개의 파라미터를 전달
                }
            }
            return result;
        }
        return 0;
    }

    // 게시글 삭제
    public int deleteBoard(int boardId) {
        return communityMapper.deleteBoard(boardId);
    }

    // 관리자 페이지 - 게시판 전체 조회
    public List<Community> getAdminAllBoards() {
        return communityMapper.getAdminAllBoards();
    }

    // 관리자 페이지 - 공지사항 전체 조회
    public List<Community> getAdminAllNotices() {
        return communityMapper.getAdminAllNotices();
    }

    // 관리자 페이지 - 게시글 살리기
    public int showBoard(int boardId) {
        return communityMapper.showBoard(boardId);
    }

    // 관리자 페이지 - 회원 작성 글 목록 조회
    public List<Community> getUserBoardList(int userNo) {
        return communityMapper.getUserBoardList(userNo);
    }

    // 조회수 증가
    @Transactional
    public void updateViews(int boardId) {
        communityMapper.updateViews(boardId);
    }

}
