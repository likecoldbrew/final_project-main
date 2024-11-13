package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.ChattingMessage;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ChattingMessageMapper {
    void insertChattingMessage(ChattingMessage chattingMessage);
    List<ChattingMessage> selectMessagesByRoomId(int chattingRoomId);
    void updateLastMessage(int chattingRoomId, String lastMessage);
}
