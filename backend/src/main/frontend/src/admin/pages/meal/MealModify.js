import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader } from "lucide-react";

const MealModify = ({ onClose, clickId }) => {
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [meal, setMeal] = useState({
    mealId: clickId,
    todayMeal: "",
    mealDate: new Date() // 초기값 설정 (현재 날짜)
  });

  // 데이터 조회
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        setLoading(true);  // 로딩 시작
        const response = await fetch(`/api/meal/${clickId}`);
        const data = await response.json();
        if (data) {
          setMeal({
            ...data,
            todayMeal: data.todayMeal,
            mealDate: new Date(data.mealDate) // 문자열을 Date 객체로 변환
          });
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchMeal();

    // 모달이 열릴 때 스크롤을 자연스럽게 이동
    window.scrollTo({ top: 160, behavior: "smooth" });
  }, []);

  // 식단일자 변경 핸들러
  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setMeal((prev) => ({
      ...prev,
      mealDate: selectedDate
    }));
  };

  // 오늘의 식단 변경 핸들러
  const handleTodayMealChange = (event) => {
    const newMeal = event.target.value;

    // dayOff의 dayOffType을 업데이트
    setMeal((prev) => ({
      ...prev,
      todayMeal: newMeal
    }));
  };


  // 수정
  const handleUpdate = () => {
    const fetchMealUpdate = async () => {
      const updateMeal = {
        mealId: meal.mealId,
        todayMeal: meal.todayMeal,
        mealDate: meal.mealDate.toISOString()  // 날짜 변환
      };

      try {
        const response = await fetch("/api/meal/modify", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateMeal)  // JSON 형식으로 데이터 전송
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

    fetchMealUpdate();
  };

  // 삭제
  const handleDelete = () => {
    const confirmDelete = window.confirm("삭제하시겠습니까?");
    if (!confirmDelete) {
      return; // 사용자가 취소를 클릭하면 함수 종료
    }

    const fetchMealDelete = async () => {
      try {
        const response = await fetch(`/api/meal/remove/${clickId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: clickId
        });

        if (response.ok) {
          alert("삭제되었습니다.");
          onClose({ close: "Modify", update: "삭제" }); // 삭제 후 모달 닫기
        } else {
          alert("실패"); // 삭제 실패에 대한 알림
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchMealDelete();
  };

  return (
    <div
      className="transition duration-150 ease-in-out z-10 absolute top-[23rem] right-0 bottom-0 left-48"
      id="modal"
    >
      <div role="alert" className="container mx-auto w-11/12 md:w-2/3 max-w-lg">
        <div className="relative py-8 px-5 md:px-10 shadow-md rounded border border-gray-400 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-[414px]">
              <div className="text-center text-gray-400">
                <Loader className="animate-spin" size={50} />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-gray-800 text-lg font-bold tracking-normal leading-tight mb-4">
                식단 {meal.todayMeal ? "수정" : "등록"}
              </h1>
              {/* 날짜 입력 */}
              <label
                htmlFor="mealDate"
                className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
              >
                날짜
              </label>
              <input
                id="mealDate"
                type="date"
                className="mb-4 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
                placeholder="날짜"
                value={format(meal.mealDate, "yyyy-MM-dd")} // 날짜 형식 변환
                onChange={handleDateChange}
                readOnly={true}
              />
              <label
                htmlFor="todayMeal"
                className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
              >
                오늘의 식단
              </label>
              <textarea
                className="mb-8 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full flex items-center p-3 text-sm border-gray-300 rounded border"
                name="todayMeal" id="todayMeal"
                placeholder="식단" cols="30" rows="8"
                value={meal.todayMeal} // 상태값을 value로 지정
                onChange={handleTodayMealChange} // 상태 업데이트
              >
              </textarea>

              <div
                className="flex items-center justify-center w-full">
                {meal.todayMeal ? (
                  <button
                    onClick={handleDelete}
                    className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-200
                      transition duration-150 ease-in-out bg-rose-100 hover:bg-rose-200 text-gray-500
                      border hover:border-gray-300 rounded px-8 py-2 text-sm"
                  >
                    삭제
                  </button>
                ) : null}
                <button
                  onClick={handleUpdate}
                  className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200
                      transition duration-150 ease-in-out bg-blue-100 hover:bg-blue-200 text-gray-500
                      border hover:border-gray-300 rounded px-8 py-2 text-sm"
                >
                  저장
                </button>
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

export default MealModify;