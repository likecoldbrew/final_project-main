package kr.or.nextit.backend.controller;

import kr.or.nextit.backend.model.Chatting;
import kr.or.nextit.backend.service.ChattingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatting")
@RequiredArgsConstructor
public class ChattingController {

    private final ChattingService chattingService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.createRoom/{userNo}")
    public void addChatting(
            @DestinationVariable int userNo,
            @Payload Chatting chatRoomRequest,
            SimpMessageHeaderAccessor headerAccessor) {

        String username = (String) headerAccessor.getSessionAttributes().get("username");

        int chattingRoomId = chatRoomRequest.getChattingRoomId();
        List<Integer> userNos = chatRoomRequest.getUserNos();

        Map<String, Object> roomUpdate = new HashMap<>();
        roomUpdate.put("type", "NEW_ROOM");

        List<Chatting> chattingList = new ArrayList<>();
        for (int inviteUserNo : userNos) {
            Chatting chatting = new Chatting();
            chatting.setChattingRoomId(chattingRoomId);
            chatting.setInviteUserNo(inviteUserNo);
            chatting.setUserNo(userNo); // Set the inviter's userNo
            chatting.setUserName(username);
            chatting.setUserNos(userNos);
            chattingList.add(chatting);
        }

        chattingService.insertChattingList(chattingList);

        roomUpdate.put("room", chattingList);

        for (int inviteUserNo : userNos) {
            messagingTemplate.convertAndSend("/topic/chatRooms/" + inviteUserNo, roomUpdate);
        }
    }


    @GetMapping("/{chattingRoomId}")
    public ResponseEntity<List<Chatting>> getChattingByRoomId(@PathVariable int chattingRoomId) {
        List<Chatting> chatList = chattingService.selectChattingByRoomId(chattingRoomId);
        return ResponseEntity.ok(chatList);
    }

    @GetMapping("/user/{userNo}")
    public ResponseEntity<List<Chatting>> getAllChatting(@PathVariable int userNo) {
        List<Chatting> chatList = chattingService.selectAllChatting(userNo);
        return ResponseEntity.ok(chatList);
    }

    @GetMapping("/chattingRoomId")
    public ResponseEntity<Map<String, Object>> generateUniqueRoomId() {
        int roomId = chattingService.generateNewChatRoomId(); // Ensure this method creates a unique ID
        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/leave/{chattingRoomId}")
    public ResponseEntity<Void> leaveChatRoom(@PathVariable int chattingRoomId, @RequestBody Map<String, Object> payload) {
        int userNo = (int) payload.get("userNo");
        chattingService.leaveChattingRoom(chattingRoomId, userNo);

        // 업데이트된 채팅방 유저 정보를 가져와 전송
        Map<String, Object> roomUpdate = new HashMap<>();
        roomUpdate.put("type", "USER_LEFT");
        roomUpdate.put("chattingRoomId", chattingRoomId);
        roomUpdate.put("userNo", userNo);

        // 남아있는 유저들에게 채팅방 유저 상태 전송
        List<Integer> remainingUserNos = chattingService.getUserNosInRoom(chattingRoomId);
        for (int remainingUserNo : remainingUserNos) {
            messagingTemplate.convertAndSend("/topic/chatRooms/" + remainingUserNo, roomUpdate);
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/updateLastReadMessage")
    public ResponseEntity<Void> updateLastReadMessage(@RequestBody Map<String, Object> payload) {
        int lastReadMessageId = (int) payload.get("lastReadMessageId");
        int chattingRoomId = (int) payload.get("chattingRoomId");
        int userNo = (int) payload.get("userNo");

        chattingService.updateLastReadMessageId(lastReadMessageId, chattingRoomId, userNo);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/totalUnReadMessage/{userNo}")
    public ResponseEntity<Map<String, Integer>> getTotalUnreadMessages(@PathVariable int userNo) {
        int totalUnreadMessages = chattingService.getTotalUnreadMessages(userNo);

        Map<String, Integer> response = new HashMap<>();
        response.put("totalUnreadMessages", totalUnreadMessages);

        return ResponseEntity.ok(response);
    }
}
