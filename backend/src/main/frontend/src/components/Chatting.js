import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { format } from "date-fns";
import axios from "axios";
import { DoorOpen } from "lucide-react";

const SOCKET_SERVER_URL = "http://localhost:8080/ws";

const Chatting = () => {
  const stompClientRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connectWebSocket = () => {
    if (stompClientRef.current) {
      return;
    }

    const socket = new SockJS(SOCKET_SERVER_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 40000,
      heartbeatOutgoing: 40000,

      onConnect: () => {
        console.log("STOMP: WebSocket connected");
        stompClientRef.current = client;
        reconnectAttemptsRef.current = 0;

        if (userInfo) {
          subscribeToUserUpdates(client, userInfo.userNo);
          subscribeToChatRoomUpdates(client, userInfo.userNo); // Subscribe to room updates
        }
        subscribeToRoomMessages(client);
      },
      onStompError: handleDisconnect,
      onWebSocketClose: handleDisconnect,
      onDisconnect: handleDisconnect
    });

    client.activate();
  };

  const subscribeToChatRoomUpdates = (client, userNo) => {
    client.subscribe(`/topic/chatRooms`, (message) => {
      const roomUpdate = JSON.parse(message.body);

      // Only update chat rooms if the invitee matches the current user
      if (roomUpdate.invitee === userNo &&
        (roomUpdate.type === "NEW_ROOM" || roomUpdate.type === "UPDATE_PARTICIPANTS")) {
        fetchChatRooms(userNo);
      }
    });
  };

  const handleDisconnect = () => {
    console.log("Attempting to reconnect...");
    setTimeout(connectWebSocket, 5000); // 5초 후 재연결 시도
  };
// WebSocket 연결을 끊지 않도록 하고, `MAX_RECONNECT_ATTEMPTS`를 사용하지 않음
  useEffect(() => {
    connectWebSocket(); // 컴포넌트 마운트 시 WebSocket 연결

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate(); // 컴포넌트 언마운트 시 연결 종료
      }
    };
  }, []);

  const [stompClient, setStompClient] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentChatRoomId, setCurrentChatRoomId] = useState(null);
  const scrollAreaRef = useRef(null);
  const [inviteUsers, setInviteUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chattingRoomId: null });
  const [isAutoScroll, setIsAutoScroll] = useState(true); // For autoscroll behavior

  //로그인한 유저 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
            fetchChatRooms(data.userNo);
          } else {
            console.error("Failed to fetch user information.");
          }
        } catch (error) {
          console.error("Error fetching user information:", error);
        }
      }
    };
    fetchUserInfo();
  }, []);
  // 초대 할 의사
  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/users/doctors"); // 의사 리스트
      const data = await response.json();
      const userMapping = {};
      data.forEach((user) => {
        userMapping[user.userNo] = user.userName;
      });

      setUserMap(userMapping);
      setInviteUsers(data);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  useEffect(() => {
    const socket = new SockJS(SOCKET_SERVER_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to STOMP");
        if (currentRoom) {
          subscribeToRoom(currentRoom);
        }
      },
      onDisconnect: () => {
        console.log("Disconnected from STOMP");
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [currentRoom]);
  //여기 중요함 실시간 업데이트
  useEffect(() => {
    if (currentChatRoomId) {
      subscribeToRoomMessages(stompClientRef.current);
      fetchMessagesByRoomId(currentChatRoomId);
    }
  }, [currentChatRoomId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // Adjust buffer as needed

        if (isScrolledToBottom) {
          setIsAutoScroll(true);
        } else {
          setIsAutoScroll(false);
        }
      }
    };

    scrollAreaRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      scrollAreaRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      if (isAutoScroll) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, [messages, isAutoScroll]);

  const subscribeToRoom = async (room) => {
    if (stompClient && userInfo) {
      if (currentRoom) {
        stompClient.unsubscribe(`/topic/room/${currentRoom.id}`);
      }
      setMessages([]); // Clear messages when changing rooms
      stompClient.subscribe(`/topic/room/${room.id}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });

      try {
        const response = await fetch(`/api/rooms/${room.id}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setCurrentRoom(room);

        } else {
          console.error("Failed to load messages for the room.");
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
  };

  const subscribeToUserUpdates = (client, userNo) => {
    client.subscribe(`/topic/chatRooms`, (message) => {
      const roomUpdate = JSON.parse(message.body);
      console.log("Room update received:", roomUpdate);

      if (roomUpdate.type === "NEW_ROOM" || roomUpdate.type === "UPDATE_PARTICIPANTS") {
        fetchChatRooms(userNo);
      }
    });
  };

  const subscribeToRoomMessages = (client) => {
    if (currentChatRoomId) {
      // Unsubscribe from previous subscription if exists
      if (stompClientRef.current?.subscription) {
        stompClientRef.current.subscription.unsubscribe();
      }

      // Subscribe to the current chat room
      const subscription = client.subscribe(`/topic/room/${currentChatRoomId}`, (message) => {
        const newMessage = JSON.parse(message.body);

        // Update messages in the current chat room
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Update chat room list: mark messages as read for the current chat room
        setChatRooms((prevChatRooms) => {
          return prevChatRooms.map((room) => {
            if (room.chattingRoomId === currentChatRoomId) {
              return {
                ...room,
                lastMessage: newMessage.message,
                lastMessageId: newMessage.messageId,
                lastReadMessageId: newMessage.messageId,
                hasNewMessage: false, // Clear new message indicator for the active room
              };
            } else if (room.chattingRoomId === newMessage.chattingRoomId) {
              // Show red dot for other rooms with new messages
              return {
                ...room,
                lastMessage: newMessage.message,
                lastMessageId: newMessage.messageId,
                hasNewMessage: true, // Set new message indicator
              };
            }
            return room;
          });
        });
      });

      stompClientRef.current.subscription = subscription;
    }

    // Subscribe to other rooms to show the red dot on new messages
    chatRooms.forEach((room) => {
      client.subscribe(`/topic/room/${room.chattingRoomId}`, (message) => {
        const newMessage = JSON.parse(message.body);

        setChatRooms((prevChatRooms) => {
          return prevChatRooms.map((r) => {
            if (r.chattingRoomId === room.chattingRoomId) {
              return {
                ...r,
                lastMessage: newMessage.message,
                lastMessageId: newMessage.messageId,
                // Set the new message indicator if the message is from a room other than the current one
                hasNewMessage: room.chattingRoomId !== currentChatRoomId,
              };
            }
            return r;
          });
        });
      });
    });
  };

  const fetchChatRooms = async (userNo) => {
    try {
      const response = await axios.get(`/api/chatting/user/${userNo}`);
      if (response.status === 200) {
        // Each room should have lastMessageId and lastReadMessageId
        setChatRooms(response.data);
        console.log(response.data);
        if (response.data.length !== 0) {
          handleRoomClick(response.data[0].chattingRoomId);
        }
      } else {
        console.error("Server error while fetching chat rooms:", response.status);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  const fetchMessagesByRoomId = async (chattingRoomId) => {
    if (!chattingRoomId) {
      console.error("Invalid chat room ID.");
      return;
    }
    try {
      const response = await axios.get(`/api/chatting/messages/${chattingRoomId}`);
      if (response.status === 200) {
        setMessages(response.data);
      } else {
        console.error("Error fetching messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleRoomClick = async (roomId) => {
    setCurrentChatRoomId(roomId);
    await fetchMessagesByRoomId(roomId);

    // 채팅방 클릭 시 읽음 상태 업데이트
    const lastReadMessageId = messages.length > 0 ? messages[messages.length - 1].messageId : null;
    if (lastReadMessageId) {
      try {
        const payload = {
          lastReadMessageId,
          chattingRoomId: roomId,
          userNo: userInfo.userNo
        };
        await axios.post("/api/chatting/updateLastReadMessage", payload);

        setChatRooms((prevChatRooms) =>
          prevChatRooms.map((room) =>
            room.chattingRoomId === roomId
              ? { ...room, lastReadMessageId, hasNewMessage: false } // 방을 클릭하면 hasNewMessage를 false로 설정
              : room
          )
        );
        console.log("Last read message updated successfully");
      } catch (error) {
        console.error("Error updating last read message:", error);
      }
    }
  };
  // Send a message
  const handleSendMessage = async () => {
    const client = stompClientRef.current;
    if (inputMessage.trim() !== "" && currentChatRoomId) {
      const newMessage = {
        message: inputMessage,
        chattingRoomId: currentChatRoomId,
        sender: userInfo.userNo,
        userName: userInfo.userName,
        departmentName: userInfo.departmentName,
        sendAt: new Date()
      };
      console.log(newMessage);
      if (client && client.connected) {
        try {
          client.publish({
            destination: `/app/chat.sendMessage`,
            body: JSON.stringify(newMessage)
          });
          setInputMessage("");
        } catch (error) {
          console.error("Error sending message:", error);
        }
      } else {
        console.error("STOMP client not connected or not initialized.", client);
      }
    } else {
      console.error("Invalid input or no current chat room ID.");
    }
  };

  const handleCreateChatRoom = async (selectedUsers, modalType) => {
    const client = stompClientRef.current;

    if (selectedUsers.length === 0) {
      console.error("No users selected for the chat room.");
      return;
    }

    const inviteMessage = {
      message: `${userInfo.userName}님이 ${selectedUsers.map((userNo) => userMap[userNo]).join(", ")}님을 초대했습니다.`,
      sender: 0
    };

    if (modalType === "create") {
      const generateUniqueRoomId = async () => {
        try {
          const response = await axios.get("/api/chatting/chattingRoomId");
          return response.data.roomId;
        } catch (error) {
          console.error("Error generating unique room ID:", error);
          return null;
        }
      };

      const newChatRoomId = await generateUniqueRoomId();

      const newChatRoom = {
        chattingRoomId: newChatRoomId,
        inviteUserNo: userInfo.userNo,
        userNos: [userInfo.userNo, ...selectedUsers]
      };

      if (client && client.connected) {
        client.publish({
          destination: `/app/chat.createRoom/${userInfo.userNo}`,
          body: JSON.stringify(newChatRoom)
        });

        inviteMessage.chattingRoomId = newChatRoomId;
        client.publish({
          destination: `/app/chat.sendMessage`,
          body: JSON.stringify(inviteMessage)
        });

        // Only notify invited users of the new room
        selectedUsers.forEach((userNo) => {
          client.publish({
            destination: `/topic/chatRooms`,
            body: JSON.stringify({ type: "NEW_ROOM", chattingRoomId: newChatRoomId, invitee: userNo })
          });
        });

        fetchChatRooms(userInfo.userNo);
      }
    } else if (modalType === "invite" && currentChatRoomId) {
      const invite = {
        chattingRoomId: currentChatRoomId,
        inviteUserNo: userInfo.userNo,
        userNos: selectedUsers
      };

      if (client && client.connected) {
        client.publish({
          destination: `/app/chat.createRoom/${userInfo.userNo}`,
          body: JSON.stringify(invite)
        });

        inviteMessage.chattingRoomId = currentChatRoomId;
        client.publish({
          destination: `/app/chat.sendMessage`,
          body: JSON.stringify(inviteMessage)
        });

        selectedUsers.forEach((userNo) => {
          client.publish({
            destination: `/topic/chatRooms`,
            body: JSON.stringify({ type: "UPDATE_PARTICIPANTS", chattingRoomId: currentChatRoomId, invitee: userNo })
          });
        });

        fetchChatRooms(userInfo.userNo);
      }
    }
  };

  const rightClickLeave = (e, chattingRoomId) => {
    e.preventDefault(); // Prevent default context menu
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      chattingRoomId: chattingRoomId
    });
  };

  const handleLeaveRoom = async (chattingRoomId) => {
    const client = stompClientRef.current;

    if (chattingRoomId) {
      try {
        const response = await axios.post(`/api/chatting/leave/${chattingRoomId}`, { userNo: userInfo.userNo });

        if (response.status === 200 || response.status === 204) {
          console.log("Successfully left the chat room");

          // Send a leave message to the chat room
          const leaveMessage = {
            message: `${userInfo.userName}님이 방을 나갔습니다.`,
            chattingRoomId: chattingRoomId,
            sender: 0,
            type: "SYSTEM"
          };

          if (client && client.connected) {
            client.publish({
              destination: `/app/chat.sendMessage`,
              body: JSON.stringify(leaveMessage)
            });
          }

          if (client?.subscription) {
            client.subscription.unsubscribe();
          }

          setChatRooms((prevChatRooms) =>
            prevChatRooms.filter(room => room.chattingRoomId !== chattingRoomId) // Update this to remove the room using the provided chattingRoomId
          );

          if (currentChatRoomId === chattingRoomId) {
            setCurrentChatRoomId(null);
            setMessages([]);
          }
          setContextMenu(prev => ({ ...prev, visible: false }));
        } else {
          console.error("Failed to leave the chat room:", response.status);
        }
      } catch (error) {
        console.error("Error leaving chat room:", error);
      }
    }
  };

  const handleScrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    setIsAutoScroll(true);
  };

  const Modal = ({ onClose, onCreateRoom, modalType }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);

    const toggleUserSelection = (userNo) => {
      setSelectedUsers((prevSelectedUsers) => {
        if (prevSelectedUsers.includes(userNo)) {
          return prevSelectedUsers.filter((id) => id !== userNo);
        } else {
          return [...prevSelectedUsers, userNo];
        }
      });
    };

    const handleAction = () => {
      onCreateRoom(selectedUsers, modalType);
      onClose();
    };

    const currentRoomUsers = currentChatRoomId
      ? chatRooms.find((room) => room.chattingRoomId === currentChatRoomId)?.userNames.split(",").map(name => name.trim()) || []
      : [];
    const filteredInviteUsers = inviteUsers.filter(user => user.userName !== userInfo.userName);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg mb-2 font-semibold">
            {modalType === "create" ? "새 방 만들기" : "초대할 사용자 선택"}
          </h2>
          <ul>
            {filteredInviteUsers.map((user) => (
              <li key={user.userNo}>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={`user-${user.userNo}`} // Unique name for each checkbox
                    checked={selectedUsers.includes(user.userNo)}
                    onChange={() => toggleUserSelection(user.userNo)}
                    disabled={modalType === "invite" && currentRoomUsers.includes(user.userName)} // 방에 있는 사용자는 비활성화
                  />
                  <span>{user.userName}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 m-2 bg-blue-500 text-white rounded-lg"
              onClick={handleAction}
            >
              {modalType === "create" ? "방 만들기" : "초대"}
            </button>
            <button
              className="px-4 py-2 m-2 bg-red-500 text-white rounded-lg mr-2"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 h-full bg-white border-r border-gray-200 shadow-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">채팅방 목록</h2>
          <button
            onClick={() => {
              setModalType("create");
              setShowModal(true);
              fetchDoctors();
            }}
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring"
          >
            방 만들기
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-60px)] px-4 mt-2">
          {chatRooms.map((room) => (
            <button
              key={room.chattingRoomId}
              className={`relative w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                currentChatRoomId === room.chattingRoomId ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleRoomClick(room.chattingRoomId)}
              onContextMenu={(e) => rightClickLeave(e, room.chattingRoomId)}
            >
              {room.userNames.length > 13 ? `${room.userNames.slice(0, 13)}...` : room.userNames}
              <div className="mt-1 text-sm text-gray-600 italic">
                최근대화: {room.lastMessage.length > 8 ? `${room.lastMessage.slice(0, 8)}...` : room.lastMessage}
              </div>
              {/* 새로운 메시지가 있는 경우에만 빨간 점을 표시 */}
              {(room.lastMessageId > room.lastReadMessageId || room.hasNewMessage) && (
                <span
                  className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                  title="New message"
                ></span>
              )}
            </button>
          ))}

        </div>

      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {
              (chatRooms.find((room) => room.chattingRoomId === currentChatRoomId)?.userNames || "")
                .length > 28
                ? chatRooms.find((room) => room.chattingRoomId === currentChatRoomId)?.userNames.slice(0, 28) + "..."
                : chatRooms.find((room) => room.chattingRoomId === currentChatRoomId)?.userNames || ""
            }

          </h2>

          {chatRooms.find((room) => room.chattingRoomId === currentChatRoomId)?.userNames && (
            <button
              onClick={() => {
                setModalType("invite");
                setShowModal(true);
                fetchDoctors();
              }}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring"
            >
              초대
            </button>
          )}
        </div>


        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollAreaRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === userInfo.userNo ? "justify-end" : "justify-start"} ${
                msg.sender === 0 ? "justify-center" : ""
              }`} // 시스템 메시지일 경우 중앙 정렬
            >
              {msg.sender !== userInfo.userNo && msg.sender !== 0 && (
                <div className="flex flex-col items-start mr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    <img
                      src={msg.profileImage || "/default-profile.png"}
                      alt={`${msg.userName}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div
                className={`flex flex-col ${msg.sender === userInfo.userNo ? "items-end" : "items-start"} ${
                  msg.sender === 0 ? "items-center" : ""
                }`} // System message should be centered
              >
                {/* For system messages, display as plain text */}
                {msg.sender !== userInfo.userNo && msg.sender !== 0 && (
                  <p className="text-xs text-gray-500 mb-1">{msg.userName}</p>
                )}

                {/* Chat Bubble */}
                <div
                  className={`rounded-lg p-3 max-w-xs ${
                    msg.sender === userInfo.userNo
                      ? "bg-blue-300 text-black text"
                      : msg.sender === 0
                        ? "bg-gray-500 text-white text-xs"
                        : "bg-gray-200 text-black text"
                  } ${msg.sender === 0 ? "italic" : ""}`}
                >
                  <p>{msg.message}</p>

                  {/* Time with AM/PM Formatting */}
                  {msg.sender !== 0 && (
                    <p
                      className={`text-xs mt-1 opacity-70 ${msg.sender === userInfo.userNo ? "text-left" : "text-right"}`}
                    >
                      {format(new Date(msg.sendAt), "hh:mm a")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Message Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex space-x-3"
          >
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              전송
            </button>
          </form>
        </div>
      </div>

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onCreateRoom={handleCreateChatRoom}
          modalType={modalType}
        />
      )}

      {/* 채팅방 우클릭 작은 모달 */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-300 rounded shadow-lg"
          style={{ top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}
        >
          <button
            className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200"
            onClick={() => handleLeaveRoom(contextMenu.chattingRoomId)}
          >
            <DoorOpen className="mr-2" />방 나가기
          </button>

        </div>
      )}
    </div>
  );

};

export default Chatting;