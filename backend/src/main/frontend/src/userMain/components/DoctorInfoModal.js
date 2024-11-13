import React, { useEffect, useState } from "react";
import '../style/userCalendar.css'
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek, isWeekend, eachDayOfInterval} from "date-fns";
import { ko } from "date-fns/locale";

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
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', marginLeft:'150px' }}>
        {label}
      </div>
      <div>
        <button className="border-sky-200 border rounded-[10px] p-2 mx-1 text-[12px] hover:font-bold hover:bg-sky-100" onClick={() => onNavigate('PREV')}>지난달</button>
        <button className="border-sky-200 border rounded-[10px] p-2 mx-1 text-[12px] hover:font-bold hover:bg-sky-100" onClick={() => onNavigate('TODAY')}>이번달</button>
        <button className="border-sky-200 border rounded-[10px] p-2 mx-1 text-[12px] hover:font-bold hover:bg-sky-100" onClick={() => onNavigate('NEXT')}>다음달</button>
      </div>
    </div>
  )
};

const CustomEvent = ({ event }) => {
  return (
    <div className={`rounded-[10px] ${event.dayOff? "font-bold":"" }`} style={{
      backgroundColor: event.dayOff? '#f5bfc5': 'transparent' , // 배경색을 투명으로 설정
      border: 'none', // 경계선 없애기 (필요 시)
      textAlign: 'center',
      color: event.isHoliday ? 'red' : 'black',
      padding: '5px 0', // 여백 조정
    }}>
      {event.title} {/* 여기에 이벤트의 제목을 가운데 정렬합니다 */}
    </div>
  );
};


const DoctorInfoModal = ({ isOpen, isScrolled, onClose, doctor, career, education, userNo }) => {
  if (!isOpen) return null;
  //휴무 목록
  const [list, setList] = useState([]);

  useEffect(() => {
      fetchDayOffList();
  }, []);

  // console.log("넘어오는 의사정보", doctor.userNo);
  const fetchDayOffList = async () => {
    try {
      const response = await fetch(`/api/dayOff/doctor/${userNo}`);
      const data = await response.json();
      console.log("들오오는 일정", data)
      if (data && data.length > 0) {
        setList(
          data
            .filter((item) => item.status === "Y") // status가 "Y"인 항목만 남김
            .map((item) => {
              let title;
              // dayOffType에 따른 제목 설정
              switch (item.dayOffType) {
                case 0:
                  title = `휴무`;
                  break;
                case 1:
                  title = `오전 휴무`;
                  break;
                case 2:
                  title = `오후 휴무`;
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
    const events = days.map(day => {
      const dayOffEvent = list.find(event => event.start.toDateString() === day.toDateString());
      const dayOfWeek = day.getDay(); // 요일을 가져옵니다 (0: 일요일, 6: 토요일)

      if (dayOfWeek === 0) { // 일요일
        return { title: "병원 휴무", start: day, end: day, isHoliday: true };
      } else if (dayOfWeek === 6) { // 토요일
        return { title: "오전 진료", start: day, end: day };
      } else if (!dayOffEvent) { // 평일 진료
        return { title: "진료", start: day, end: day };
      } else {
        return { ...dayOffEvent }; // 이미 등록된 이벤트가 있을 때
      }
    });
    return events;
  };

  const startDate = new Date(2024, 0, 1); // 예시: 2024년 1월 1일
  const endDate = new Date(2025, 11, 31); // 예시: 2100년 12월 31일

  const events = createEvents(startDate, endDate);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      {/*필요서 ${isScrolled ? '' : 'mt-72'} 추가*/}
      <div className={`bg-white w-5/12 p-6 rounded shadow-lg ${isScrolled ? "max-h-[100vh]" : "mt-[130px] max-h-[calc(100vh-11rem)]"} overflow-y-auto max-h-[100vh]`}>
        <h2 className="text-2xl font-semibold mb-6">
          {doctor ? doctor.userName : "의사 정보"}
        </h2>

        <h3 className="text-xl font-bold mb-3">학력</h3>
        <div className="mb-4 rounded-[10px] border border-sky-200 px-3 py-2.5">
          {education && education.length > 0 ? (
            <ul className="list-disc list-inside ml-2">
              {education.map((edu) => (
                <li key={edu.id}><span className="mr-2">{edu.educationDate}</span> <span
                  className=" text-sky-500 font-bold">{edu.educationBackground}</span></li>
              ))}
            </ul>
          ) : (
            <p>학력 정보가 없습니다.</p>
          )}
        </div>

        <h3 className="text-xl  font-bold mb-3">경력</h3>
        <div className="mb-4 mt-4 rounded-[10px] border border-sky-200 px-3 py-2.5">
          {career && career.length > 0 ? (
            <ul className="list-disc list-inside ml-2">
              {career.map((car) => (
                <li key={car.id}><span className="mr-2">{car.careerDate}</span> <span
                  className=" text-sky-500 font-bold">{car.careerInfo}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>경력 정보가 없습니다.</p>
          )}
        </div>
        <h3 className="text-xl  font-bold mb-3">진료 일정</h3>
        <div id="userCalendarContainer" className="mb-4 mt-1 rounded-[10px] border border-sky-200 px-3 py-2.5">
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
                localizer.format(date, "yyyy년 MM월", culture),
            }}
            eventPropGetter={() => ({
              style: { cursor: 'default' } // 커서 모양 고정
            })}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mt-4 bg-sky-200 hover:font-bold px-4 py-2 rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfoModal;
