package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.component.FileStorage;
import kr.or.nextit.backend.model.Community;
import kr.or.nextit.backend.model.Files;
import kr.or.nextit.backend.service.CommunityService;
import kr.or.nextit.backend.service.FilesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final FilesService filesService;
    private final FileStorage fileStorage; // FileStorage 주입

    //전체 후기글
    @GetMapping("/all")
    public List<Community> getAllBoards() {
        return communityService.getAllBoardsWithUser();
    }

    //전체 후기길 필터링
    @GetMapping("/allByOption")
    public List<Community> getAllBoardsByOption(@RequestParam String option, @RequestParam String value) {
        return communityService.getAllBoardsByOption(option, value);
    }

    //전체 공지사항
    @GetMapping("/allNotice")
    public List<Community> getAllNotices() {
        return communityService.getAllBoardsWithAdmin();
    }

    //전체 공지사항 필터링
    @GetMapping("/allNoticeByOption")
    public List<Community> getAllNoticesByOption(@RequestParam String option, @RequestParam String value) {
        return communityService.getAllNoticesByOption(option, value);
    }

    // 특정 후기글
    @GetMapping("/detail")
    public Community selectBoard(int boardId) {
        return communityService.selectBoard(boardId);
    }

    // 게시글 등록
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<String> registerBoard(@RequestParam("title") String title,
                                                @RequestParam("content") String content,
                                                @RequestParam("userNo") int userNo,
                                                @RequestParam(value = "file", required = false) MultipartFile[] files) { // 배열로 변경
        // 게시글 데이터 처리
        Community boardDTO = new Community();
        boardDTO.setTitle(title);
        boardDTO.setContent(content);
        boardDTO.setUserNo(userNo);
        // 2. 게시글을 먼저 저장 (이후 생성된 게시글 ID를 가져옴)
        communityService.registerBoard(boardDTO);  // 이때 boardDTO에 ID가 할당됨
        int boardId = boardDTO.getBoardId(); // 저장된 게시글의 ID를 가져옴
        // 3. 파일 처리 로직
        if (files != null && files.length > 0) {
            List<Files> filesList = filesService.uploadAndGetFiles(files, boardId); // 업로드한 파일을 게시글 ID와 연관지음
            boardDTO.setFiles(filesList); // 파일 정보를 DTO에 추가
        }
        return ResponseEntity.ok("게시글이 등록되었습니다.");
    }

    // 게시글 업데이트
    @PutMapping("/update/{boardId}")
    public ResponseEntity<String> updateBoard(
            @PathVariable int boardId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("userId") String userId,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "deletedFileId", required = false) Integer deletedFileId) {
        // 1. 기존 게시글을 조회
        Community existingBoard = communityService.selectBoard(boardId);
        if (existingBoard == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("게시글을 찾을 수 없습니다.");
        }
        // 2. 게시글 데이터 수정
        existingBoard.setTitle(title);
        existingBoard.setContent(content);
        existingBoard.setUserId(userId);

        // 3. 새로 업로드할 파일 처리
        List<Files> newFilesList = new ArrayList<>();
        if (files != null && files.length > 0) {
            newFilesList = filesService.uploadAndGetFiles(files, boardId); // 새로운 파일만 업로드
        }
        // 4. 기존 파일과 새로운 파일 리스트를 합치기
        List<Files> allFiles = new ArrayList<>(existingBoard.getFiles()); // 기존 파일 목록 가져오기
        allFiles.addAll(newFilesList); // 새로 업로드한 파일 목록 추가
        existingBoard.setFiles(allFiles); // 합쳐진 파일 목록 설정

        // 5. 게시글 업데이트
        int updateResult = communityService.updateBoard(existingBoard, deletedFileId != null ? deletedFileId : 0);
        if (updateResult == 0) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("게시글 업데이트에 실패했습니다.");
        }
        return ResponseEntity.ok("게시글이 업데이트되었습니다.");
    }

    //조회수 증가
    @PutMapping("/views/{boardId}")
    public void updateViews(@PathVariable int boardId) {
        communityService.updateViews(boardId);
    }

    // 게시글 삭제
    @PutMapping("/delete/{boardId}")
    public ResponseEntity<String> deleteBoard(@PathVariable int boardId) {
        int deletedRows = communityService.deleteBoard(boardId);
        if (deletedRows > 0) {
            return ResponseEntity.ok("게시글이 삭제되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("게시글이 존재하지 않습니다.");
        }
    }

    // 관리자 페이지 - 게시판 전체 조회
    @GetMapping("/admin/all")
    public List<Community> getAdminAllBoards() {
        return communityService.getAdminAllBoards();
    }

    // 관리자 페이지 - 공지사항 전체 조회
    @GetMapping("/admin/notice")
    public List<Community> getAdminAllNotices() {
        return communityService.getAdminAllNotices();
    }

    // 관리자 페이지 - 게시글 살리기
    @PutMapping("/show/{boardId}")
    public ResponseEntity<String> showBoard(@PathVariable int boardId) {
        int showRows = communityService.showBoard(boardId);
        if (showRows > 0) {
            return ResponseEntity.ok("게시글을 다시 살렸습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("게시글이 존재하지 않습니다.");
        }
    }

    // 관리자 페이지 - 회원 작성 글 목록 조회
    @GetMapping("/{userNo}")
    public List<Community> getUserBoardList(@PathVariable("userNo") int userNo) {
        return communityService.getUserBoardList(userNo);
    }


}
