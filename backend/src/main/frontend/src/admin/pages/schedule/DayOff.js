import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "../../styles/calendar.css";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useUser } from "../../../utils/UserContext";
import DayOffRegister from "./DayOffRegister";
import DayOffModify from "./DayOffModify";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material"; // MUI 컴포넌트
import { CheckCircle } from "@mui/icons-material"
import { SquareArrowRight, SquareArrowLeft, CalendarFold } from "lucide-react"

// date-fns localizer 설정
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'ko': ko },
});

const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// CustomToolbar 컴포넌트 정의
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToToday = () => {
    toolbar.onNavigate('TODAY');
  };

  return (
    <div className="flex justify-between items-center">
      <div className="rbc-btn-group">
        <button onClick={goToBack} className="text-gray-500 hover:text-gray-800">
          <SquareArrowLeft size={25}/>
        </button>
      </div>

      <div className="font-bold text-xl text-gray-700 cursor-pointer pb-2" onClick={goToToday}>
        {toolbar.label}
      </div>

      <div className="rbc-btn-group">
        <button onClick={goToNext} className="text-gray-500 hover:text-gray-800">
          <SquareArrowRight size={25}/>
        </button>
      </div>
    </div>
  );
};

export default function DayOff() {
  const { userInfo } = useUser();
  const [list, setList] = useState([]); // 휴무 목록
  const [clickDate, setClickDate] = useState("");
  const [clickInfo, setClickInfo] = useState({}); // 이벤트 클릭 정보
  const [openRegister, setOpenRegister] = useState(false);
  const [openModify, setOpenModify] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]); // 사용자 필터 목록
  const [userFilters, setUserFilters] = useState({}); // 사용자 필터

  /* 조회 */
  const fetchDayOffList = async () => {
    try {
      const response = await fetch('/api/dayOff/all');
      const data = await response.json();

      if (data && data.length > 0) {
        const users = {}; // 사용자 필터 상태 초기화
        data.forEach(item => {
          users[item.userName] = true; // 초기 상태는 모두 체크
        });
        setUserFilters(users); // 사용자 필터 상태 설정

        setList(data.map((item) => {
          let label;
          switch (item.dayOffType) {
            case 0: label = `${item.userName} 휴무`; break;
            case 1: label = `${item.userName} 오전 반차`; break;
            case 2: label = `${item.userName} 오후 반차`; break;
            default: label = null;
          }

          return {
            ...item,
            title: label, // title은 문자열로 설정
            start: new Date(item.dayOff), // 시작 시간을 Date 객체로 변환
            end: new Date(item.dayOff), // 종료 시간을 Date 객체로 변환
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  useEffect(() => {
    fetchDayOffList();
  },[]);

  useEffect(() => {
    applyUserFilters();
  }, [userFilters, list]);

  /* 사용자 필터 변경 */
  const handleUserFilterChange = (userName) => {
    setUserFilters((prevFilters) => ({
      ...prevFilters,
      [userName]: !prevFilters[userName], // 해당 사용자 필터 토글
    }));
  };

  /* 필터 적용 */
  const applyUserFilters = () => {
    const filtered = list.filter((event) => userFilters[event.userName]);
    setFilteredEvents(filtered);
  };

  // console.log(list)

  /* 달력 슬롯 클릭 함수 */
  // 달력의 빈 공간(슬롯)을 클릭하거나 드래그하여 날짜 또는 시간 범위를 선택할 때 실행
  const goSelectSlot = (param) => {
    setClickDate(param.start); // 클릭한 날짜 담기
    setOpenRegister(true); // 스케줄 입력 팝업 오픈
  };

  /* 캘린더 일정 클릭 함수 */
  // 이미 등록된 이벤트(스케줄)를 클릭할 때 실행되는 함수
  const goSelectEvent = (param) => {
    setClickInfo({
      id: param.dayOffNo,
    });
    setOpenModify(true); // 모달 열기
  };

  /* 모달 닫기 */
  const goClose = (param) => {
    if (param.close === "Register") setOpenRegister(false);
    if (param.close === "Modify") setOpenModify(false);

    if (param.update) {
      fetchDayOffList();  // 상태 변경은 모달을 닫을 때만 호출
    }
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || "#4d9aff"; // 이벤트의 배경색을 결정
    return {
      style: { backgroundColor },
    };
  };

  return (
    <>
      <div className="flex items-center justify-center p-6">
        <div className="w-full shadow-lg rounded-md">
          <div id={'dayOff-calendar-wrapper'} className="md:p-8 p-5 bg-white rounded-md">
            {/* 사용자 체크박스 필터 */}
            <fieldset style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '2rem' }}>
              <legend style={{ padding: '0 5px', fontWeight: 'bold', color: '#333' }}>사용자 필터</legend>
              <FormGroup row className="grid grid-cols-2 gap-x-2">
                {Object.keys(userFilters).map((user) => (
                  <FormControlLabel
                    key={user}
                    control={<Checkbox checked={userFilters[user]} onChange={() => handleUserFilterChange(user)} />}
                    label={user}
                    className="pl-2"
                  />
                ))}
              </FormGroup>
            </fieldset>

            {/* 달력 영역 */}
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 800, width: '100%' }} // 달력의 너비를 100%로 설정
              views={['month']} // month 뷰만 표시
              defaultView="month" // 기본 뷰 설정
              onSelectSlot={goSelectSlot}
              onSelectEvent={goSelectEvent}
              eventPropGetter={eventStyleGetter}
              components={{
                toolbar: CustomToolbar, // 커스텀 툴바 설정
                event: ({ event }) => (
                  <div className="flex items-center">
                    {event.status === 'Y' && <CheckCircle style={{ fontSize: '20px', color: 'black',
                      backgroundColor: 'white', borderRadius: '100%', padding: '0', marginRight: '5px' }} />}
                    {event.title}
                  </div>
                ),
              }}
              // 날짜 형식 변경
              formats={{
                dayFormat: 'eeee', // 전체 요일 표시
                weekdayFormat: (date) => weekdays[getDay(date)], /// 요일 이름을 전체로 표시 (예: "월요일")
                dateFormat: "dd",
                monthHeaderFormat: (date, culture, localizer) =>
                  localizer.format(date, "yyyy년 M월", culture),
              }}
              selectable
            />
          </div>
          {/* 휴무 등록 */}
          {openRegister && (
            <DayOffRegister
              onClose={goClose}
              clickDate={clickDate}
              userInfo={userInfo}
            />
          )}
          {/* 휴무 수정 */}
          {openModify && (
            <DayOffModify
              onClose={goClose}
              clickInfo={clickInfo}
            />
          )}
        </div>
      </div>
    </>
  );
}