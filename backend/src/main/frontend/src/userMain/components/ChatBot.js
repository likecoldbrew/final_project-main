import React, { useState } from "react";
import ChatBotModal from "./ChatBotModal";

const ChatBot = () => {
  const icon = "💬"; // 채팅 아이콘
  const name = "챗봇"; // 이름
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  const handleOpenModal = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // 모달 닫기
  };
  return (
    <div className="sticky top-1/3 right-4 p-4 h-40">
      <button  onClick={handleOpenModal}  className="w-full text-sky-800 font-bold py-2 px-4 rounded flex flex-col items-center justify-center transition-colors">
        <div className="w-16 h-16 bg-sky-100 hover:bg-sky-200 rounded-full  flex items-center justify-center mb-2">
          <span className="text-3xl">{icon}</span>
        </div>
        {name}
      </button>
      <ChatBotModal isOpen={isModalOpen} onClose={handleCloseModal} /> {/* 모달 추가 */}
    </div>
  );
};
export default ChatBot;
