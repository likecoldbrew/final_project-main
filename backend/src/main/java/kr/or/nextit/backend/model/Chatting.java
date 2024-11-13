package kr.or.nextit.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Transient;
import lombok.Data;

import java.util.*;

@Data
public class Chatting {
    private int chattingNo;          // 채팅 번호
    private int userNo;
    @JsonProperty("chattingRoomId")
    private int chattingRoomId;      // 채팅방 ID

    @JsonProperty("inviteUserNo")
    private int inviteUserNo;        // 초대한 사람 번호
    private int lastReadMessageId;
    @ElementCollection
    @JsonProperty("userNos")
    private List<Integer> userNos;   // 여러 사용자 번호 리스트

    private Date joinAt;             // 방 들어간 시간
    private String status;            // 방 나감 여부 (Y/N)

    @Transient
    private String userNames;        // 쉼표로 나열된 사용자 이름 목록

    @Transient
    private String userName;         // 현재 사용자 이름

    @Transient
    private String lastMessageId;

    @Transient
    private String lastMessage;      // 마지막 채팅 메시지

    @Transient
    private String unreadMessageCount;

    @Transient
    private String totalUnRead;
}
