import { useEffect, useState } from "react";

const DayOffRegister = ({ onClose, clickDate, userInfo }) => {
  const [type, setType] = useState(0); // 선택한 값 저장
  const [color, setColor] = useState("#60a5ff"); // 기본 배경색 저장

  useEffect(() => {
    // 모달이 열릴 때 스크롤을 자연스럽게 이동
    window.scrollTo({ top: 230, behavior: 'smooth' });
  }, [])

  // 셀렉트박스 값 변경 핸들러
  const handleSelectChange = (event) => {
    setType(event.target.value);
  };

  // 색상 선택 핸들러
  const handleColorChange = (event) => {
    setColor(event.target.value);
  };

  // 저장
  const handleSave = () => {
    const fetchDayOffSave = async () => {
      const newDayOff = {
        doctorNo: userInfo.userNo,
        dayOff: clickDate.toISOString(),
        dayOffType: type,
        color: color,
      };

      try {
        const response = await fetch("/api/dayOff/insert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newDayOff),  // JSON 형식으로 데이터 전송
        });
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchDayOffSave();
    onClose({ close: "Register", update: "등록" });
  };

  return (
    <div
      className="transition duration-150 ease-in-out z-10 absolute top-[30rem] right-0 bottom-0 left-48"
      id="modal"
    >
      <div role="alert" className="container mx-auto w-11/12 md:w-2/3 max-w-lg">
        <div className="relative py-8 px-5 md:px-10 shadow-md rounded border border-gray-400 bg-white">
          <h1 className="text-gray-800 text-lg font-bold tracking-normal leading-tight mb-4">
            휴무 신청
          </h1>
          <label
            htmlFor="name"
            className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
          >
            이름
          </label>
          <input
            id="name"
            className="mb-4 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
            placeholder="이름"
            value={userInfo.userName}
            readOnly={true}
          />
          <label
            htmlFor="type"
            className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
          >
            유형
          </label>
          {/* 셀렉트박스 */}
          <select value={type} onChange={handleSelectChange}
                  className="mb-4 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center px-2 text-sm border-gray-300 rounded border">
            <option value={0}>휴무</option>
            <option value={1}>오전 반차</option>
            <option value={2}>오후 반차</option>
          </select>
          {/* 색상 선택 */}
          <label
            htmlFor="color"
            className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
          >
            배경색
          </label>
          <select
            id="color"
            value={color}
            onChange={handleColorChange}
            className="mb-8 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center px-2 text-sm border-gray-300 rounded border"
            style={{ color: color }}
          >
            {/* 무지개색 옵션 */}
            <option value="#60a5ff" style={{ color: "#60a5ff" }}>Blue</option>
            <option value="#86e3ce" style={{ color: "#86e3ce" }}>Green</option>
            <option value="#ffaf6e" style={{ color: "#ffaf6e" }}>Orange</option>
            <option value="#fa897b" style={{ color: "#fa897b" }}>Red</option>
            <option value="#ccabd8" style={{ color: "#ccabd8" }}>Purple</option>
            <option value="#abcdde" style={{ color: "#abcdde" }}>Skyblue</option>
            <option value="#b19f9a" style={{ color: "#b19f9a" }}>Brown</option>
          </select>

          <div className="flex items-center justify-center w-full">
            <button
              onClick={handleSave}
              className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200
                      transition duration-150 ease-in-out bg-blue-100 hover:bg-blue-200 text-gray-500
                      border hover:border-gray-300 rounded px-8 py-2 text-sm"
            >
              등록
            </button>
            <button
              onClick={() => onClose({ close: "Register" })}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                    transition duration-150 ease-in-out bg-gray-100 hover:bg-gray-200 text-gray-500
                    border hover:border-gray-300 rounded px-8 py-2 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayOffRegister;