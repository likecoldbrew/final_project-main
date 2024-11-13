import React from "react";
import { format } from "date-fns";

const AllEmployScheduleModal = ({ isOpen, onClose, selectedEvents }) => {
  if (!isOpen) return null;
  console.log("들어오는 이벤트", selectedEvents);
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-start items-start z-50">
      <div className="bg-white p-5 rounded-lg w-1/6 md:w-1/6 lg:w-1/4 shadow-lg ml-[550px] mt-96">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover: font-bold float-right">X</button>
        <h2 className="text-xl font-bold mb-4">{format(selectedEvents[0].dayOff,"MM월 dd일")} 휴무 일정</h2>
        <ul className="list-disc ml-6">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <li key={index} className="py-1">
                {event.title}
              </li>
            ))
          ) : (
            <li className="text-gray-500">이 날짜에 등록된 일정이 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
export default AllEmployScheduleModal;