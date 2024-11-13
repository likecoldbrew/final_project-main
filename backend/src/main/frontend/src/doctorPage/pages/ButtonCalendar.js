import React, { useState, useRef, useEffect } from "react";

export default function ButtonCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && event.target instanceof Node && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate?.getDate() === i &&
        selectedDate?.getMonth() === currentDate.getMonth() &&
        selectedDate?.getFullYear() === currentDate.getFullYear();
      days.push(
        <button
          key={i}
          onClick={() => selectDate(i)}
          className={`p-2 m-1 w-8 h-8 text-center ${
            isSelected
              ? "bg-blue-500 text-white rounded-full"
              : "hover:bg-gray-200 rounded-full"
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={selectedDate ? selectedDate.toLocaleDateString("ko-KR") : ""}
          readOnly
          className="p-2 border rounded-l-md w-40"
          placeholder="날짜 선택"
        />
        <button
          onClick={toggleCalendar}
          className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          선택
        </button>
      </div>
      {showCalendar && (
        <div ref={calendarRef} className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg shadow-md z-10">
          <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded">
              &lt;
            </button>
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded">
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-medium">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
}