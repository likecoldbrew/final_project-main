package kr.or.nextit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class ChattingMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int messageId;           // 메시지 ID
    private int chattingRoomId;      // 채팅방 ID
    private int sender;              // 보낸 사람 ID
    private String message;          // 메시지 내용
    private Date sendAt;

    @Transient
    private String userName;         // 전송 시 사용할 사용자 이름

    @Transient
    private String departmentName;         // 전송 시 사용할 사용자의 진료과
}
