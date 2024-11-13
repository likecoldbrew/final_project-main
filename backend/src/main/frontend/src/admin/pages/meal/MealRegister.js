import { useEffect, useState } from "react";
import { format } from "date-fns";

const MealRegister = ({ onClose, clickDate }) => {
  const [todayMeal, setTodayMeal] = useState(""); // 식단 등록

  useEffect(() => {
    // 모달이 열릴 때 스크롤을 자연스럽게 이동
    window.scrollTo({ top: 160, behavior: 'smooth' });
  }, []);

  // 입력 값 변경 시 상태 업데이트 함수
  const handleChange = (e) => {
    setTodayMeal(e.target.value);
  };

  // 저장
  const handleSave = () => {
    const fetchMealSave = async () => {
      const newMeal = {
        todayMeal: todayMeal,
        mealDate: clickDate.toISOString(),
      };

      try {
        const response = await fetch("/api/meal/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMeal),  // JSON 형식으로 데이터 전송
        });

        if (response.ok) {
          // alert("성공");
        } else {
          alert("실패");
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchMealSave();
    onClose({ close: "Register", update: "등록" });
  };

  return (
    <div
      className="transition duration-150 ease-in-out z-10 absolute top-[23rem] right-0 bottom-0 left-48"
      id="modal"
    >
      <div role="alert" className="container mx-auto w-11/12 md:w-2/3 max-w-lg">
        <div className="relative py-8 px-5 md:px-10 shadow-md rounded border border-gray-400 bg-white">
          <h1 className="text-gray-800 text-lg font-bold tracking-normal leading-tight mb-4">
            식단 등록
          </h1>
          <label
            htmlFor="meal"
            className="text-gray-800 text-sm font-bold leading-tight tracking-normal"
          >
            날짜
          </label>
          <input
            id="meal"
            type="date"
            className="mb-4 mt-2 text-gray-600 focus:outline-none focus:border focus:border-gray-500 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
            placeholder="날짜"
            value={format(clickDate, "yyyy-MM-dd")} // 날짜 형식 변환
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
            value={todayMeal} // 상태값을 value로 지정
            onChange={handleChange} // 상태 업데이트
          >
          </textarea>
          <div className="flex items-center justify-center w-full">
            <button
              onClick={handleSave}
              className="mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200
                      transition duration-150 ease-in-out bg-blue-100 hover:bg-blue-200 text-gray-500
                      border hover:border-gray-300 rounded px-8 py-2 text-sm"
            >
              저장
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

export default MealRegister;