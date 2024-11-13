package kr.or.nextit.backend.service;

import kr.or.nextit.backend.mapper.ChattingMessageMapper;
import kr.or.nextit.backend.model.ChattingMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChattingMessageService {

    @Autowired
    private ChattingMessageMapper chattingMessageMapper;

    // 특정 채팅방의 메시지를 가져오는 메서드
    public List<ChattingMessage> getMessagesByChatRoomId(int chattingRoomId) {
        return chattingMessageMapper.selectMessagesByRoomId(chattingRoomId);
    }

    public ChattingMessage insertChattingMessage(ChattingMessage chattingMessage) {
        chattingMessageMapper.insertChattingMessage(chattingMessage);
        return chattingMessage;
    }



}
