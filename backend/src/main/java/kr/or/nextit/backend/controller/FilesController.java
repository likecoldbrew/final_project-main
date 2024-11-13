package kr.or.nextit.backend.controller;


import kr.or.nextit.backend.model.Files;
import kr.or.nextit.backend.service.FilesService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FilesController {

    private final FilesService filesService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<List<String>> uploadFiles(@RequestParam(value = "files") MultipartFile[] files, @RequestParam(value = "boardId") int boardId) {
        List<Files> filesList = new ArrayList<>();
        List<String> fileUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String randomFileName = UUID.randomUUID().toString();
                String filePath = "/uploads/" + randomFileName + "_" + file.getOriginalFilename();
                fileUrls.add(filePath);
                try {
                    file.transferTo(new File(filePath));
                    Files boardFiles = new Files();
                    boardFiles.setFileName(randomFileName + "_" + file.getOriginalFilename());
                    boardFiles.setFileOriginalName(file.getOriginalFilename());
                    boardFiles.setFilePath(filePath);
                    boardFiles.setFileSize((int) file.getSize());
                    boardFiles.setFileType(file.getContentType());
                    filesList.add(boardFiles);
                } catch (IOException e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Collections.singletonList("파일 업로드 중 오류가 발생했습니다: " + e.getMessage()));
                }
            }
        }
        filesService.saveFiles(filesList, boardId);
        return ResponseEntity.ok(fileUrls);
    }


    @GetMapping("/view/{fileId}")
    public ResponseEntity<Resource> viewFile(@PathVariable int fileId) throws IOException {
        Files file = filesService.getFileById(fileId);
        if (file == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        // 캐시 비활성화
        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        ResponseEntity<Resource> response = filesService.readFile(file);
        return ResponseEntity.status(response.getStatusCode())
                .headers(headers)
                .body(response.getBody());
    }

    // 특정 파일 삭제 요청 처리 (파일 ID를 URL 경로 변수로 받음)
    @DeleteMapping("/delete/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Integer fileId) {
        try {
            // 파일 삭제 서비스 호출
            filesService.deleteFiles(fileId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //파일 다운로드
    @GetMapping("/download/{fileId}")
    public ResponseEntity<FileSystemResource> downloadFile(@PathVariable("fileId") int fileId) {
        // 파일 ID로 파일 정보를 DB에서 조회 (예: 파일 경로 포함)
        Files file = filesService.getFileById(fileId); // 해당 ID의 파일 정보를 가져오는 서비스 메서드

        if (file == null) {
            System.out.println("File not found in the database for ID: " + fileId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // 파일이 없으면 404 반환
        }

        File fileToDownload = new File(file.getFilePath());

        if (!fileToDownload.exists()) {
            System.out.println("File does not exist at path: " + file.getFilePath());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // 파일이 존재하지 않으면 404 반환
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileOriginalName() + "\"");

        return ResponseEntity.ok()
                .headers(headers)
                .body(new FileSystemResource(fileToDownload));
    }

}
