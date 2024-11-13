import React, { useEffect, useState } from "react";
import { Clock, Utensils } from "lucide-react";
import Weather from "../../components/Weather";
import DoctorSchedule from "../components/DoctorSchedule";
import DoctorMeal from "../components/DoctorMeal";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const Home = () => {
    //식단 목록
    const [weekMeal, setWeekMeal] = useState([]);
    //모달창 관리(한 달 식단표)
    const [mealScheduleOpen, setMealScheduleOpen] = useState(false);
    //예약 환자 정보
    const [patientList, setPatientList] = useState([]);
    //유저정보
    const { userInfo } = useUser();

    useEffect(() => {
        fetchThisWeekMeal();
        fetchReserveList();
    }, [userInfo]);

    // 한 주 식단 조회
    const fetchThisWeekMeal = async () => {
        try {
            const response = await fetch("/api/meal/thisweek");
            const data = await response.json();
            if (data) {
                setWeekMeal(data);
            }
        } catch (error) {
            console.error("Error fetching day off data:", error);
        }
    };

    //예약 환자 정보 불러오기
    const fetchReserveList = async () => {
        if (userInfo.userNo) {
            try {
                const response = await fetch(`/api/reserve/${userInfo.userNo}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                //예약 승인 대기 중인 환자만 필터링
                const filteredData = data.filter(item => item.status === 0);
                setPatientList(filteredData);
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("정보 로딛중 오류가 발생했습니다. 새로고침을 해주세요"); // 오류 알림 추가
            }
        }
    };

    //모달창 열기
    const handleMealSchedule = () => {
        setMealScheduleOpen(true);
    };

    //모달창 닫기
    const goClose = () => {
        setMealScheduleOpen(false);
    };

    //요일별 색상 (뜬금 없이 하고 싶어짐)
    const weekColors = {
        "월요일": "text-rose-500", // 빨강
        "화요일": "text-amber-500", // 주황
        "수요일": "text-green-500", // 노랑
        "목요일": "text-blue-500", // 초록
        "금요일": "text-fuchsia-500" // 파랑
    };

    return (
      <div className="px-8 py-2 bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
              {/* 의사 근무표 */}
              <div className="bg-white px-4 rounded-lg shadow">
                  <DoctorSchedule />
              </div>
              {/*날씨*/}
              <Weather />
              {/* 식단표*/}
              <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between">
                      <div>
                          <h2 className="text-xl font-semibold mb-4 flex items-center">
                              <Utensils className="mr-2" /> 식단
                          </h2>
                      </div>
                      <div onClick={handleMealSchedule}
                           className="text-yellow-500 hover:font-bold hover:text-yellow-600 cursor-pointer">이번달 식단보기
                      </div>
                  </div>
                  {weekMeal && weekMeal.map((meal, index) => {
                      const mealDate = new Date(meal.mealDate); // 날짜 포맷에 맞게 변환 (예: 2024-11-04 => 월요일)
                      const dayOfWeek = mealDate.toLocaleString("ko-KR", { weekday: "long" }); // 요일 이름 가져오기 (예: "월요일")
                      const formattedMeal = meal.todayMeal.replace(/\n/g, ", ");
                      return (
                        <div key={index} className="flex mb-4 space-x-2 ml-3">
                            <div className="max-w-40 mr-2"><strong><span
                              className={`${weekColors[dayOfWeek] || "text-gray-500"} max-w-40 mr-2 `}>{dayOfWeek} </span>식단 :
                            </strong></div>
                            <div>{formattedMeal}</div>
                        </div>
                      );
                  })}
              </div>

              {/* Personal Alerts Section */}
              <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between">
                      <div>
                          <h2 className="text-xl font-semibold mb-4 flex items-center">
                              <Clock className="mr-2" /> 예약현황
                          </h2>
                      </div>
                      <Link to={`/doctor/reserv/${userInfo.userNo}`}
                            className="text-sky-500 hover:font-bold hover:text-sky-600 cursor-pointer">예약 승인 페이지로 이동
                      </Link>
                  </div>
                  {patientList ? patientList.slice(0, 5).map((patient, index) => {
                      return (
                        <div key={index} className="flex items-center mb-4 space-x-2 ml-3">
                            <span className="mr-3">{index + 1}</span>
                            <span>환자 이름 :</span>
                            <span className="w-[65px] mx-2 font-bold text-sky-700"> {patient.userName}</span>
                            <span className="ml-2"> 증상 :</span>
                            <span
                              className="mx-2 w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-bold text-sky-700">{patient.symptom}</span>
                            <span className="ml-2">희망 진료일 : </span>
                            <span className="mx-2 font-bold text-sky-700">{format(patient.reserveTime, "yyyy-MM-dd")}</span>

                        </div>
                      );
                  }) : "예약 신청 환자가 없습니다."}
              </div>
          </div>
          {mealScheduleOpen &&
            <DoctorMeal onClose={goClose} />
          }
      </div>
    );
};

export default Home;
