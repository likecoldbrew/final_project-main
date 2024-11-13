import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader } from "lucide-react";

const DayOffModify = ({ onClose, clickInfo }) => {
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [dayOff, setDayOff] = useState({
    dayOffNo: clickInfo.id,
    doctorNo: null,
    dayOff: new Date(), // 초기값 설정 (현재 날짜)
    dayOffType: 0, // 초기값 설정
    status: null,
    color: "#60a5ff", // 초기값 설정
    userName: ""
  });

  // 데이터 조회
  useEffect(() => {
    const fetchDayOff = async () => {
      try {
        setLoading(true);  // 로딩 시작
        const response = await fetch(`/api/dayOff/detail/${clickInfo.id}`);
        const data = await response.json();
        if (data) {
          setDayOff({
            ...data,
            dayOff: new Date(data.dayOff) // 문자열을 Date 객체로 변환
          });
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchDayOff();

    // 모달이 열릴 때 스크롤을 자연스럽게 이동
    window.scrollTo({ top: 230, behavior: "smooth" });
  }, []);

  // 휴무일자 변경 핸들러
  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setDayOff((prev) => ({
      ...prev,
      dayOff: selectedDate
    }));
  };

  // 휴무 타입 변경 핸들러
  const handleSelectChange = (event) => {
    const newType = Number(event.target.value); // 선택된 값을 숫자로 변환

    // dayOff의 dayOffType을 업데이트
    setDayOff((prev) => ({
      ...prev,
      dayOffType: newType
    }));
  };

  // 색깔 변경 핸들러
  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setDayOff((prev) => ({
      ...prev,
      color: selectedColor
    }));
  };


  // 수정
  const handleUpdate = () => {
    const fetchDayOffUpdate = async () => {
      const updateDayOff = {
        dayOffNo: dayOff.dayOffNo,
        dayOff: dayOff.dayOff.toISOString(),  // 날짜 변환
        dayOffType: dayOff.dayOffType,
        color: dayOff.color
      };

      try {
        const response = await fetch("/api/dayOff/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateDayOff)  // JSON 형식으로 데이터 전송
        });

        if (response.ok) {
          onClose({ close: "Modify", update: "수정" }); // 성공 후 모달 닫기
        } else {
          alert("실패");
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchDayOffUpdate();
  };

  // 삭제
  const handleDelete = () => {
    const confirmDelete = window.confirm("삭제하시겠습니까?");
    if (!confirmDelete) {
      return; // 사용자가 취소를 클릭하면 함수 종료
    }

    const fetchDayOffDelete = async () => {
      try {
        const response = await fetch(`/api/dayOff/delete/${clickInfo.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: clickInfo.id
        });

        if (response.ok) {
          onClose({ close: "Modify", update: "삭제" }); // 삭제 후 모달 닫기
        } else {
          alert("삭제 실패"); // 삭제 실패에 대한 알림
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchDayOffDelete();
  };

  // 관리자 승인
  const handleAdmin = () => {
    const fetchDayOffAdmin = async () => {

      try {
        const response = await fetch(`/api/dayOff/approve/${clickInfo.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: clickInfo.id
        });

        if (response.ok) {
          onClose({ close: "Modify", update: "승인" }); // 성공 후 모달 닫기
        } else {
          alert("실패");
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchDayOffAdmin();
  };

  return (
    <div
      className="transition duration-150 ease-in-out z-10 absolute top-[28rem] right-0 bottom-0 left-48"
      id="modal"
    >
      <div role="alert" className="container mx-auto w-11/12 md:w-2/3 max-w-lg">
        <div className="relative py-8 px-5 md:px-10 shadow-md rounded border border-gray-400 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-[444px]">
              <div className="text-center text-gray-400">
                <Loader className="animate-spin" size={50} />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-gray-800 text-lg font-bold tracking-normal leading-tight mb-4">
                휴무 관리
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
                value={dayOff.userName}
                readOnly={true}
              />

              {/* 날짜 입력 */}
              <label
                htmlFor="dayOff"
                className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
              >
                날짜
              </label>
              <input
                id="dayOff"
                type="date"
                className="mb-4 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
                placeholder="날짜"
                value={format(dayOff.dayOff, "yyyy-MM-dd")} // 날짜 형식 변환
                onChange={handleDateChange}
              />

              {/* 휴무 유형 셀렉트박스 */}
              <label
                htmlFor="type"
                className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
              >
                유형
              </label>
              <select value={dayOff.dayOffType} onChange={handleSelectChange}
                      className="mb-4 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center px-2 text-sm border-gray-300 rounded border">
                <option value={0}>휴무</option>
                <option value={1}>오전 반차</option>
                <option value={2}>오후 반차</option>
              </select>

              {/* 색상 선택 셀렉트박스 */}
              <label
                htmlFor="color"
                className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
              >
                배경색
              </label>
              <select
                value={dayOff.color}
                onChange={handleColorChange}
                className="mb-8 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center px-2 text-sm border-gray-300 rounded border"
                style={{ color: dayOff.color }}
              >
                <option value="#60a5ff" style={{ color: "#60a5ff" }}>Blue</option>
                <option value="#86e3ce" style={{ color: "#86e3ce" }}>Green</option>
                <option value="#ffaf6e" style={{ color: "#ffaf6e" }}>Orange</option>
                <option value="#fa897b" style={{ color: "#fa897b" }}>Red</option>
                <option value="#ccabd8" style={{ color: "#ccabd8" }}>Purple</option>
                <option value="#abcdde" style={{ color: "#abcdde" }}>Skyblue</option>
                <option value="#b19f9a" style={{ color: "#b19f9a" }}>Brown</option>
              </select>

              <div
                className={`flex items-center ${dayOff.status !== "Y" ? `justify-between` : `justify-center`}  w-full`}>
                <button
                  onClick={handleDelete}
                  className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-200
                    transition duration-150 ease-in-out bg-rose-100 hover:bg-rose-200 text-gray-500
                    border hover:border-gray-300 rounded px-8 py-2 text-sm"
                >
                  삭제
                </button>
                {dayOff.status !== "Y" && (
                  <button
                    onClick={handleUpdate}
                    className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200
                      transition duration-150 ease-in-out bg-blue-100 hover:bg-blue-200 text-gray-500
                      border hover:border-gray-300 rounded px-8 py-2 text-sm"
                  >
                    저장
                  </button>
                )}
                {dayOff.status !== "Y" && (
                  <button
                    onClick={handleAdmin}
                    className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200
                    transition duration-150 ease-in-out bg-green-100 hover:bg-green-200 text-gray-500
                    border hover:border-gray-300 rounded px-8 py-2 text-sm"
                  >
                    승인
                  </button>
                )}
                <button
                  onClick={() => onClose({ close: "Modify" })}
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                    transition duration-150 ease-in-out bg-gray-100 hover:bg-gray-200 text-gray-500
                    border hover:border-gray-300 rounded px-8 py-2 text-sm"
                >
                  취소
                </button>
              </div>
            </>
          )}
        < /div>
      </div>
    </div>
  );
};

export default DayOffModify;