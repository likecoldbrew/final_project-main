
package kr.or.nextit.backend.model;

import jakarta.persistence.Transient;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;

@Data
public class Profile {
    private int picNo;
    private int doctorNo;
    private String fileOriginalName;
    private String fileName;
    private String filePath;
    private int fileSize;
    private Timestamp uploadedAt;
}