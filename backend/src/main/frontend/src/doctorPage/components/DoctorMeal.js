import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "../style/doctorMeal.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";

// date-fns localizer 설정
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "ko": ko }
});

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

// CustomToolbar 컴포넌트 정의
const CustomToolbar = (toolbar) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex justify-center items-center font-bold text-xl text-gray-700 pb-4">
        <div>{toolbar.label}</div>
      </div>
    </div>
  );
};

export default function DoctorMeal({onClose}) {
  const [list, setList] = useState([]); // 식단 목록

  /* 조회 */
  const fetchMealList = async () => {
    try {
      const response = await fetch("/api/meal/all");
      const data = await response.json();

      if (data && data.length > 0) {
        setList([...data.map((item) => {
          return {
            title: item.todayMeal,
            start: new Date(item.mealDate),
            end: new Date(item.mealDate),
            mealId: item.mealId
          };
        })]);
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  useEffect(() => {
    fetchMealList();
  }, []);


  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
        <div className="bg-white p-5 rounded-md shadow-lg relative w-4/5 md:w-1/2 h-[90%]">
          <button
            onClick={onClose}
            className="absolute text-[16px] right-2 mr-7 text-gray-600 hover:text-rose-400 hover:font-bold"
          >
            X 닫기
          </button>
          <div id={"doctorMealStyle"} className="px-4 pt-4  h-full">
            {/* 달력 영역 */}
            <Calendar
              localizer={localizer}
              events={list}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', width: '100%' }}
              views={["month"]} // month 뷰만 표시
              defaultView="month" // 기본 뷰 설정
              components={{
                toolbar: CustomToolbar // 커스텀 툴바 설정
              }}
              // 날짜 형식 변경
              formats={{
                dayFormat: "eeee", // 전체 요일 표시
                weekdayFormat: (date) => weekdays[getDay(date)], /// 요일 이름을 전체로 표시 (예: "월요일")
                dateFormat: (date) => format(date, `M월 d일 (${weekdays[getDay(date)]})`, { locale: ko }),
                monthHeaderFormat: (date, culture, localizer) =>
                  localizer.format(date, "yyyy년 M월 식단표 🍴", culture)
              }}
            />
          </div>
        </div>
      </div>
  );
}