package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Files;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FilesMapper {
    // 첨부파일 저장
    void save(Files file);

    // 첨부파일 모두 저장
    void saveAll(List<Files> files);

    // 특정 파일 조회
    Files selectFile(int fileId);

    // 특정 게시글의 모든 첨부파일 조회
    List<Files> selectAllFiles(int boardId);

    // 첨부파일 삭제
    void deleteFiles(int fileId);

    //파일 이름 중복 체크(중복 저장 예방용)
    int countByFileNameAndBoardId(@Param("fileName") String fileName, @Param("boardId") int boardId);
}