import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "../../styles/meal.css";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import MealRegister from "./MealRegister";
import MealModify from "./MealModify";
import { ArrowForwardIos, SetMeal } from "@mui/icons-material";

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
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToToday = () => {
    toolbar.onNavigate("TODAY");
  };

  // 현재 달과 비교하기 위해 날짜 정보 가져오기
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const selectedMonth = toolbar.date.getMonth();

  return (
    <div className="flex justify-between items-center">
      <div className="rbc-btn-group">
        <button onClick={goToBack} className="text-blue-400 hover:text-blue-600">
          <ArrowForwardIos size={25} className="rotate-180" />
        </button>
      </div>

      <div className="flex justify-center items-center font-bold text-xl text-gray-700 pb-4">
        <div>{toolbar.label}</div>
        {/* 현재 달이 아닌 경우에만 FoodBank 아이콘 표시 */}
        {selectedMonth !== currentMonth && (
          <div onClick={goToToday} className="ml-1 flex cursor-pointer">
            <SetMeal style={{ fontSize: 28 }} />
          </div>
        )}
      </div>

      <div className="rbc-btn-group">
        <button onClick={goToNext} className="text-blue-400 hover:text-blue-600">
          <ArrowForwardIos size={25} />
        </button>
      </div>
    </div>
  );
};

export default function Meal() {
  const [list, setList] = useState([]); // 식단 목록
  const [clickDate, setClickDate] = useState("");
  const [clickId, setClickId] = useState(0); // 이벤트 클릭 정보
  const [openRegister, setOpenRegister] = useState(false);
  const [openModify, setOpenModify] = useState(false);

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


  /* 달력 슬롯 클릭 함수 */
  // 달력의 빈 공간(슬롯)을 클릭하거나 드래그하여 날짜 또는 시간 범위를 선택할 때 실행
  const goSelectSlot = (param) => {
    const selectedDay = param.start;

    // 주말(토요일(6), 일요일(0))인 경우, 선택을 취소
    if (selectedDay.getDay() === 0 || selectedDay.getDay() === 6) {
      return;  // 주말이면 아무 작업도 하지 않음
    }

    setClickDate(param.start); // 클릭한 날짜 담기
    setOpenRegister(true); // 스케줄 입력 팝업 오픈
  };

  /* 캘린더 일정 클릭 함수 */
  // 이미 등록된 이벤트(스케줄)를 클릭할 때 실행되는 함수
  const goSelectEvent = (param) => {
    setClickId(param.mealId);
    setOpenModify(true); // 모달 열기
  };

  /* 모달 닫기 */
  const goClose = (param) => {
    if (param.close === "Register") setOpenRegister(false);
    if (param.close === "Modify") setOpenModify(false);

    if (param.update) {
      fetchMealList();  // 상태 변경은 모달을 닫을 때만 호출
    }
  };

  return (
    <>
      <div className="flex items-center justify-center p-6">
        <div className="w-4/5 shadow-lg rounded-md">
          <div id={"meal-calendar-wrapper"} className="md:p-10 p-5 bg-white rounded-md">
            {/* 달력 영역 */}
            <Calendar
              localizer={localizer}
              events={list}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 920, width: "100%" }} // 달력의 너비를 100%로 설정
              views={["month"]} // month 뷰만 표시
              defaultView="month" // 기본 뷰 설정
              onSelectSlot={goSelectSlot}
              onSelectEvent={goSelectEvent}
              components={{
                toolbar: CustomToolbar // 커스텀 툴바 설정
              }}
              // 날짜 형식 변경
              formats={{
                dayFormat: "eeee", // 전체 요일 표시
                weekdayFormat: (date) => weekdays[getDay(date)], /// 요일 이름을 전체로 표시 (예: "월요일")
                dateFormat: (date) => format(date, `M월 d일 (${weekdays[getDay(date)]})`, { locale: ko }),
                monthHeaderFormat: (date, culture, localizer) =>
                  localizer.format(date, "yyyy년 M월 식단표", culture)
              }}
              selectable
            />
          </div>
          {/* 식단 등록 */}
          {openRegister && (
            <MealRegister
              onClose={goClose}
              clickDate={clickDate}
            />
          )}
          {/* 식단 수정 */}
          {openModify && (
            <MealModify
              onClose={goClose}
              clickId={clickId}
            />
          )}
        </div>
      </div>
    </>
  );
}