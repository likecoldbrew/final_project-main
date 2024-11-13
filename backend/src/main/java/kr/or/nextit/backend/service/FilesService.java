package kr.or.nextit.backend.service;


import kr.or.nextit.backend.component.FileStorage;
import kr.or.nextit.backend.mapper.FilesMapper;
import kr.or.nextit.backend.model.Files;
import kr.or.nextit.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FilesService {
    private final FilesMapper filesMapper;
    private final FileStorage fileStorage;
    private final FileUtil fileUtil;

    public String getUploadDir() {
        return fileStorage.getUploadDir(); // 메소드로 접근
    }

    public void saveFiles(List<Files> filesList, int boardId) {
        List<Files> newFiles = new ArrayList<>();
        for (Files file : filesList) {
            // 파일 이름 중복 검사
            if (!isFileNameExists(file.getFileName(), boardId)) {
                newFiles.add(file);
            }
        }
        if (!newFiles.isEmpty()) {
            filesMapper.saveAll(newFiles);
        }
    }

    public Files getFileById(int fileId) {
        return filesMapper.selectFile(fileId); // 매퍼에서 파일 ID로 파일 조회
    }

    public ResponseEntity<Resource> readFile(Files file) throws IOException {
        return ResponseEntity.ok(fileUtil.getFileResource(file.getFilePath()));
    }

    // 게시글 ID와 함께 파일 업로드
    public List<Files> uploadAndGetFiles(MultipartFile[] files, int boardId) {
        List<Files> savedFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // 파일 저장
                String randomFileName = fileStorage.storeFile(file);
                String filePath = "/uploads/" + randomFileName; // 실제 파일 경로 설정
                Files savedFile = new Files();
                savedFile.setFileName(randomFileName);
                savedFile.setFileOriginalName(file.getOriginalFilename());
                savedFile.setFilePath(filePath);
                savedFile.setFileType(file.getContentType());
                savedFile.setFileSize((int) file.getSize());
                savedFile.setBoardId(boardId); // 게시글 ID 설정
                filesMapper.save(savedFile); // 단일 파일 저장 호출
                savedFiles.add(savedFile); // 저장된 파일 목록에 추가
            }
        }
        return savedFiles; // 저장된 파일의 목록 반환
    }

    // 게시글 ID로 모든 파일 조회
    public List<Files> selectAllFiles(int boardId) {
        return filesMapper.selectAllFiles(boardId); // 매퍼를 통해 게시글 ID에 연결된 모든 파일 조회
    }

    // 게시글 ID로 파일 삭제
    public void deleteFiles(Integer fileId) {
        Files file = filesMapper.selectFile(fileId);
        if (file != null) {
            String filePath = file.getFilePath(); // filePath를 로컬 변수로 저장
            if (filePath != null) { // null 체크
                filesMapper.deleteFiles(fileId); // DB에서 파일 삭제
                fileStorage.deleteFile(filePath); // 파일 시스템에서 삭제
            } else {
                System.out.println("파일 경로가 null입니다."); // 디버깅용 로그
            }
        } else {
            System.out.println("해당 파일을 찾을 수 없습니다."); // 디버깅용 로그
        }
    }

    // 파일 이름 중복 검사 메서드
    public boolean isFileNameExists(String fileName, int boardId) {
        // 데이터베이스에서 해당 boardId에 대해 fileName이 이미 존재하는지 확인하는 쿼리 실행
        return filesMapper.countByFileNameAndBoardId(fileName, boardId) > 0;
    }
}
