import React, { useEffect, useState } from "react";
import { ko } from "date-fns/locale";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "../../styles/adminMainCalendar.css";
import { PawPrint, StepBack, StepForward } from "lucide-react";
import AllEmployScheduleModal from "./AllEmployScheduleModal";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "ko": ko }
});

const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const calendarStyle = {
  height: 450,
  width: "100%",
  fontSize: "16px"
};

const CustomToolbar = ({ date, label, onNavigate }) => {
  // 현재 달과 비교하기 위해 날짜 정보 가져오기
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const selectedMonth = date.getMonth();

  return (
    <div className="flex justify-between items-center">
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate("PREV")} className="text-[#66cdaa] hover:text-[#3b8a6f]">
          <StepBack size={22} />
        </button>
      </div>
      <div className="flex justify-center items-center font-bold text-xl text-gray-700 pb-4">
        <div className="mr-3">{label}</div>
        {selectedMonth !== currentMonth && (
          <div onClick={() => onNavigate("TODAY")}
               className="ml-1 flex cursor-pointer text-[#66cdaa] hover:text-[#3b8a6f]">
            <PawPrint style={{ fontSize: 28 }} />
          </div>
        )}
      </div>
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate("NEXT")} className="text-[#66cdaa] hover:text-[#3b8a6f]">
          <StepForward size={22} />
        </button>
      </div>
    </div>
  );
};

//일정 스타일
const CustomEvent = ({ event }) => {
  return (
    <div className="text-xs font-bold" style={{
      border: "none", // 경계선 없애기 (필요 시)
      textAlign: "center",
      color: event.isHoliday ? "red" : event.dayOff ? "#2897ad" : "black"
    }}>
      {event.title} {/* 여기에 이벤트의 제목을 가운데 정렬합니다 */}
    </div>
  );
};

const AllEmploySchedule = () => {
  //휴무 목록
  const [allEmpDayOff, setAllEmpOff] = useState([]);
  //선택한 날짜의 휴무 목록
  const [selectedEvents, setSelectedEvents] = useState([]);
  //휴무 목록 모달창
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchAllEmpDayOffList();
  }, []);


  //휴무정보 불러오기
  const fetchAllEmpDayOffList = async () => {
    try {
      const response = await fetch("/api/dayOff/all");
      const data = await response.json();

      if (data && data.length > 0) {
        setAllEmpOff(
          data.filter((item) => item.status === "Y").map((list) => {
            let title;
            // dayOffType에 따른 제목 설정
            switch (list.dayOffType) {
              case 0:
                title = `${list.userName} 휴무`;
                break;
              case 1:
                title = `${list.userName} 오전휴무`;
                break;
              case 2:
                title = `${list.userName} 오후휴무`;
                break;
              default:
                title = null;
            }
            return {
              ...list,
              title, // 설정된 제목 사용
              start: new Date(list.dayOff), // 시작 시간을 Date 객체로 변환
              end: new Date(list.dayOff) // 종료 시간을 Date 객체로 변환
            };
          }));
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  // 일정 슬롯 클릭했을 때 모달창 열림
  const handleSlotClick = (slotInfo) => {
    const selectedDateEvents = allEmpDayOff.filter(event =>
      event.start.toDateString() === slotInfo.start.toDateString()
    );
    if (selectedDateEvents.length > 0) {
      setSelectedEvents(selectedDateEvents);
      setModalIsOpen(true);
    }
  };

  // 일정 글자 클릭했을 때도 모달창 열림
  const handleEventClick = (event) => {
    handleSlotClick({ start: event.start });
  };

  // "+N more" 버튼 클릭 시 모달창 열림
  const handleShowMore = (events, date) => {
    handleSlotClick({ start: date });
  };


  return (
    <div id="adminMainCalendar" className=" mt-1 px-3 py-2.5">
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={calendarStyle}
        events={allEmpDayOff}
        views={["month"]}
        defaultView="month"
        // 사용자 정의 툴바 적용
        components={{
          toolbar: CustomToolbar, // 사용자 정의 툴바 적용
          event: CustomEvent // 사용자 정의 이벤트 컴포넌트 적용
        }}
        // 날짜 형식 변경
        formats={{
          dayFormat: "eeee", // 전체 요일 표시
          weekdayFormat: (date) => weekdays[getDay(date)], /// 요일 이름을 전체로 표시 (예: "월요일")
          dateFormat: "d",
          monthHeaderFormat: (date, culture, localizer) =>
            localizer.format(date, "yyyy년 MM월 직원 근무표", culture)
        }}
        eventPropGetter={() => ({ style: { cursor: "pointer" } })}
        selectable
        onSelectEvent={handleEventClick}
        onSelectSlot={handleSlotClick}
        onShowMore={handleShowMore}
      />
      {modalIsOpen && (
        <AllEmployScheduleModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          selectedEvents={selectedEvents}
        />
      )}
    </div>
  );
};

export default AllEmploySchedule;
