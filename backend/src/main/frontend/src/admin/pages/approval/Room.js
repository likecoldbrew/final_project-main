import React, { useState, useEffect } from "react";
import { PlayArrow, Close } from "@mui/icons-material";

export default function Room({ isOpen, closeModal, currentItem }) {
  const [list, setList] = useState([]);
  const [floor, setFloor] = useState(3); // 현재 층을 관리하는 상태

  if (!isOpen) return null;

  useEffect(() => {
    if (currentItem) {
      setList(currentItem.map((item) => ({
        userName: item.userName,
        roomType: item.roomType,
        roomNum: parseInt(item.roomName.substring(0, 3)), // 첫 3글자만 자르기
        seatNo: item.seatNo,
      })));
    }
  }, []);

  const renderRoom = (roomNum, beds) => (
    <div key={roomNum} className="border-2 border-gray-800 p-2 aspect-square relative">
      <div className="absolute top-0 right-0 bg-yellow-100 rounded-bl-xl px-2 py-1 text-sm font-semibold">
        {roomNum}호
      </div>
      <div className={`grid ${beds > 1 ? 'grid-cols-2' : ''} gap-2 h-full pt-4`}>
        {[...Array(beds)].map((_, bedIndex) => {
          const roomNo = bedIndex + 1;

          const room = list.find(item => item.roomNum === roomNum && item.seatNo === roomNo);
          return (
            <div key={bedIndex} className="relative">
              <div className="absolute top-1 left-1 w-5 h-5 border border-gray-800 flex items-center justify-center text-xs bg-white">
                {bedIndex + 1}
              </div>
              <div className="h-full flex items-center justify-center">
                <div className="w-full h-3/4 mt-2 border border-gray-800 rounded-lg bg-white">
                  <input
                    type="text"
                    className={`w-full h-full text-center bg-transparent ${
                      room ? "font-bold" : "text-sm"
                    }`}
                    placeholder="Empty"
                    value={room ? room.userName : ""}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed left-48 inset-0 flex items-center justify-center">
      <div className="bg-white px-4 pt-5 pb-10 rounded-lg border w-2/3 max-w-5xl relative">
        {/* X 버튼 - 오른쪽 상단 끝에 배치 */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 rounded text-gray-500 hover:text-black focus:outline-none"
        >
          <Close />
        </button>

        <div className="flex justify-center items-center space-x-4">
          {/* 왼쪽 버튼 - 3층일 때 숨김 처리, 공간 유지 */}
          <button
            onClick={() => setFloor(3)}
            className={`rounded text-gray-400 hover:text-gray-500 rotate-180 ${floor === 3 ? "invisible" : ""}`}
          >
            <PlayArrow />
          </button>

          {/* 방 렌더링 */}
          <div className="w-full">
            {floor === 3 ? (
              <div>
                <div className="text-2xl text-center mb-4">3F</div>
                <div className="grid grid-cols-4 gap-4">
                  {[301, 302, 303, 304].map(roomNum => renderRoom(roomNum, 1))}
                  {[305, 306, 307, 308].map(roomNum => renderRoom(roomNum, 2))}
                  {[309, 310, 311, 312].map(roomNum => renderRoom(roomNum, 4))}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl text-center mb-4">4F</div>
                <div className="grid grid-cols-3 gap-4">
                {[401, 402, 403].map(roomNum => renderRoom(roomNum, 6))}
                  {[404, 405, 406].map(roomNum => renderRoom(roomNum, 6))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 버튼 - 4층일 때 숨김 처리, 공간 유지 */}
          <button
            onClick={() => setFloor(4)}
            className={`rounded text-gray-400 hover:text-gray-500 ${floor === 4 ? "invisible" : ""}`}
          >
            <PlayArrow />
          </button>
        </div>
      </div>
    </div>
  );
}
