package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.ChattingMapper;
import kr.or.nextit.backend.model.Chatting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChattingService {
    private final ChattingMapper chattingMapper;

    public List<Chatting> selectChattingByRoomId(int chattingRoomId) {
        return chattingMapper.selectChattingByRoomId(chattingRoomId);
    }

    public List<Chatting> selectAllChatting(int userNo) {
        return chattingMapper.selectAllChatting(userNo);
    }

    public void insertChatting(Chatting chatting) {
        chattingMapper.insertChatting(chatting);
    }

    // 여러 Chatting 객체를 DB에 삽입
    public void insertChattingList(List<Chatting> chattingList) {
        chattingMapper.insertChattingList(chattingList); // Use batch insert method
    }

    public int generateNewChatRoomId() {
        List<Integer> existingChatRoomIds = chattingMapper.findAllChatRoomIds();
        int newChatRoomId = 1;

        while (existingChatRoomIds.contains(newChatRoomId)) {
            newChatRoomId++;
        }

        return newChatRoomId;
    }

    public void leaveChattingRoom(int chattingRoomId, int userNo) {
        chattingMapper.leaveChattingRoom(chattingRoomId, userNo);
    }

    public List<Integer> getUserNosInRoom(int chattingRoomId) {
        return chattingMapper.getUserNosInRoom(chattingRoomId);
    }

    public void updateLastReadMessageId(int lastReadMessageId, int chattingRoomId, int userNo) {

        chattingMapper.updateLastReadMessageId(lastReadMessageId, chattingRoomId, userNo);
    }

    public int getTotalUnreadMessages(int userNo) {
        return chattingMapper.getTotalUnreadMessages(userNo);
    }
}
