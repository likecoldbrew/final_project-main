import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "../../style/doctorCalendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import React, { useEffect, useState } from "react";
import { ko } from "date-fns/locale";
import { useUser } from "../../../utils/UserContext";
import DayOffRegister from "./DayOffRegister";
import DayOffModify from "./DayOffModify";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material"; // MUI 컴포넌트
import { CheckCircle } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ScrollableContent from "../ScrollableContent";

// date-fns localizer 설정
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "ko": ko }
});

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

  return (
    <div className="flex items-center justify-center ">
      <span><button onClick={goToBack} className="text-center border rounded p-1.5 px-5">이전</button></span>
      <span className="flex-center p-3 px-12 rbc-toolbar-label font-semibold ">
        <button onClick={goToToday}>{toolbar.label}</button>
      </span>
      <span><button onClick={goToNext} className="text-center border rounded p-1.5 px-5">다음</button></span>
    </div>

  );
};

export default function DayOff() {
  const { doctorNo } = useParams();
  const id = parseInt(doctorNo);
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
      const response = await fetch(`/api/dayOff/doctor/${id}`);
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
            case 0:
              label = `${item.userName} 휴무`;
              break;
            case 1:
              label = `${item.userName} 오전 반차`;
              break;
            case 2:
              label = `${item.userName} 오후 반차`;
              break;
            default:
              label = null;
          }

          return {
            ...item,
            title: (
              <div className="flex items-center">
                {item.status === "Y" && <CheckCircle style={{ color: "black", marginRight: "5px" }} />}
                {label}
              </div>
            ), // 아이콘과 제목을 포함한 JSX 요소
            start: new Date(item.dayOff), // 시작 시간을 Date 객체로 변환
            end: new Date(item.dayOff) // 종료 시간을 Date 객체로 변환
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  useEffect(() => {
    fetchDayOffList();
  }, []);

  useEffect(() => {
    applyUserFilters();
  }, [userFilters, list]);

  /* 사용자 필터 변경 */
  const handleUserFilterChange = (userName) => {
    setUserFilters((prevFilters) => ({
      ...prevFilters,
      [userName]: !prevFilters[userName] // 해당 사용자 필터 토글
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
      id: param.dayOffNo
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
      style: { backgroundColor }
    };
  };

  return (
    <>
      <div className="flex items-center justify-center p-6">
        <div className="w-full shadow-lg rounded-md">
          <div className="md:p-8 p-5 bg-white rounded-md">

            {/* 달력 영역 */}
            <div id="doctor">
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 800, width: "100%" }} // 달력의 너비를 100%로 설정
                views={["month", "week", "day"]} // agenda 뷰 제외
                defaultView="month" // 기본 뷰 설정
                onSelectSlot={goSelectSlot}
                onSelectEvent={goSelectEvent}
                eventPropGetter={eventStyleGetter}
                components={{
                  toolbar: CustomToolbar // 커스텀 툴바 설정
                }}
                selectable
              />
            </div>
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