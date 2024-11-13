package kr.or.nextit.backend.mapper;

import kr.or.nextit.backend.model.Chatting;

import java.util.List;

public interface ChattingMapper {
    List<Chatting> selectChattingByRoomId(int chattingRoomId);

    List<Chatting> selectAllChatting(int userNo);

    void insertChatting(Chatting chatting);

    void insertChattingList(List<Chatting> chattingList);

    List<Integer> findAllChatRoomIds();

    void leaveChattingRoom(int chattingRoomId, int userNo);

    List<Integer> getUserNosInRoom(int chattingRoomId);

    void updateLastReadMessageId(int lastReadMessageId, int chattingRoomId, int userNo);

    int getTotalUnreadMessages(int userNo);

}
