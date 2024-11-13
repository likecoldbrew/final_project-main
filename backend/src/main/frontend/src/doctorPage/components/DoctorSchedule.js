import React, { useEffect, useState } from "react";
import { ko } from "date-fns/locale";
import { eachDayOfInterval, getDay } from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useUser } from "../../utils/UserContext";
import '../style/doctorCalendar.css';
import { format,  parse, startOfWeek,} from "date-fns";
import { BriefcaseMedical, SquareArrowLeft, StepBack, StepForward } from "lucide-react";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'ko': ko },
});

const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const calendarStyle = {
  height: 450,
  width: '100%',
  fontSize: '16px',
};

const CustomToolbar = ({ date, label, onNavigate }) => {
  // 현재 달과 비교하기 위해 날짜 정보 가져오기
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const selectedMonth = date.getMonth();

  return (
    <div className="flex justify-between items-center">
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate("PREV")} className="text-blue-400 hover:text-blue-600">
          <StepBack size={22} />
        </button>
      </div>
      <div className="flex justify-center items-center font-bold text-xl text-gray-700 pb-4">
        <div>{label}</div>
        {selectedMonth !== currentMonth && (
          <div onClick={() => onNavigate("TODAY")} className="ml-1 flex cursor-pointer">
            <BriefcaseMedical style={{ fontSize: 28 }} />
          </div>
        )}
      </div>
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate("NEXT")} className="text-blue-400 hover:text-blue-600">
          <StepForward size={22} />
        </button>
      </div>
    </div>
  )
};

const CustomEvent = ({ event }) => {
  // console.log("이벤트", event)
  return (
    <div className={`rounded-[10px] ${event.dayOff ? "font-bold" : ""}`} style={{
      backgroundColor: event.dayOff? '#95e5f5': 'transparent' , // 배경색을 투명으로 설정
      border: 'none', // 경계선 없애기 (필요 시)
      textAlign: 'center',
      color: event.isHoliday ? 'red' : event.dayOff? '#2897ad' : 'black',
      padding: '3px 0', // 여백 조정
    }}>
      {event.title} {/* 여기에 이벤트의 제목을 가운데 정렬합니다 */}
    </div>
  );
};


const DoctorSchedule = () => {
  //휴무 목록
  const [dayOff, setDayOff] = useState([]);
  //유저정보
  const {userInfo}=useUser()

  useEffect(() => {
    fetchDayOffList();
  }, [userInfo]);



  //휴무정보 불러오기
  const fetchDayOffList = async () => {
    try {
      const response = await fetch(`/api/dayOff/doctor/${userInfo.userNo}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setDayOff(
          data
            .filter((item) => item.status === "Y")
            .map((item) => {
              let title;
              switch (item.dayOffType) {
                case 0:
                  title = `연차`;
                  break;
                case 1:
                  title = `오전 반차`;
                  break;
                case 2:
                  title = `오후 반차`;
                  break;
                default:
                  title = null;
              }
              return {
                ...item,
                title, // 설정된 제목 사용
                start: new Date(item.dayOff), // 시작 시간을 Date 객체로 변환
                end: new Date(item.dayOff), // 종료 시간을 Date 객체로 변환
              };
            })
        );
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  // 모든 날짜 생성
  const createEvents = (start, end) => {
    const days = eachDayOfInterval({ start, end });
    const events = days.flatMap(day => {
      const dayOffEvents = dayOff.filter(event => event.start.toDateString() === day.toDateString());
      const dayOfWeek = day.getDay(); // 요일을 가져옵니다 (0: 일요일, 6: 토요일)

      // 기본 이벤트 설정
      let dailyEvents = [];
      if (dayOfWeek === 0) { // 일요일
        dailyEvents.push({ title: "병원 휴무", start: day, end: day, isHoliday: true });
      }
      if (dayOfWeek === 6 && dayOffEvents.length === 0) { // 토요일
        dailyEvents.push({ title: "오전 근무", start: day, end: day });
      }

      // 휴무 이벤트 추가
      if (dayOffEvents.length > 0) {
        dayOffEvents.forEach(event => {
          dailyEvents.push({
            ...event,
            start: day,
            end: day,
          });
        });
      }

      return dailyEvents;
    });
    return events;
  };

  const startDate = new Date(2024, 0, 1); // 예시: 2024년 1월 1일
  const endDate = new Date(2025, 11, 31); // 예시: 2100년 12월 31일

  const events = createEvents(startDate, endDate);

  return (
    <>
      <div id="doctorMainCalendar" className=" mt-1 px-3 py-2.5">
        <Calendar
          localizer={localizer}
          startAccessor="start"
          endAccessor="end"
          selectable={false}
          style={calendarStyle}
          events={events}
          views={['month']}
          defaultView="month"
          // 버튼 텍스트 변경
          messages={{
            today: "오늘",
            previous: "지난달",
            next: "다음달",
            month: "월",
            week: "주",
            day: "일",
            agenda: "일정",
          }}
          // 사용자 정의 툴바 적용
          components={{
            toolbar: CustomToolbar, // 사용자 정의 툴바 적용
            event: CustomEvent, // 사용자 정의 이벤트 컴포넌트 적용
          }}
          // 날짜 형식 변경
          formats={{
            dayFormat: 'eeee', // 전체 요일 표시
            weekdayFormat: (date) => weekdays[getDay(date)], /// 요일 이름을 전체로 표시 (예: "월요일")
            dateFormat: "d",
            monthHeaderFormat: (date, culture, localizer) =>
              localizer.format(date, "yyyy년 MM월 진료일정", culture),
          }}
          eventPropGetter={() => ({
            style: { cursor: 'default' } // 커서 모양 고정
          })}
        />
      </div>
    </>
  );
};

export default DoctorSchedule;
