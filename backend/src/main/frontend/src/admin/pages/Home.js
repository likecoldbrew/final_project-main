import React, { useEffect, useState } from "react";
import Weather from "../../components/Weather";
import { Clock, MailPlus, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useUser } from "../../utils/UserContext";
import AllEmploySchedule from "./schedule/AllEmploySchedule";

const Home = () => {
  //유저 정보
  const { userInfo } = useUser();
  //식단
  const [weekMeal, setWeekMeal] = useState([]);
  //1대1문의
  const [userInquiries, setUserInquiries] = useState([]);

  useEffect(() => {
    fetchThisWeekMeal();
    fetchInquiryList();
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

  //1대1 문의 조회
  const fetchInquiryList = async () => {
    try {
      const response = await fetch("/api/inquiries/all");
      const data = await response.json();
      if (data && data.length > 0) {
        setUserInquiries(
          data.filter((item) => item.status === "Y" && item.answer == null));
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };


  //요일별 색상 (뜬금 없이 하고 싶어짐)
  const weekMealColors = {
    "월요일": "text-rose-500", // 빨강
    "화요일": "text-amber-500", // 주황
    "수요일": "text-green-500", // 노랑
    "목요일": "text-blue-500", // 초록
    "금요일": "text-fuchsia-500" // 파랑
  };

  return (
    <div className="bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Home</h1>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
        {/* 의사 근무표 */}
        <div className="bg-white px-4 rounded-lg shadow">
          <AllEmploySchedule />
        </div>
        {/*날씨*/}
        <Weather />
        {/* 식단표*/}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Utensils className="mr-2 text-[#66cdaa]" /> 식단
              </h2>
            </div>
            <Link to={"/admin/meal"}
                  className="text-[#66cdaa] hover:text-[#3b8a6f] hover:font-bold cursor-pointer">식단 등록 · 수정 하러 가기
            </Link>
          </div>
          {weekMeal && weekMeal.map((meal, index) => {
            const mealDate = new Date(meal.mealDate);
            const dayOfWeek = mealDate.toLocaleString("ko-KR", { weekday: "long" });
            const formattedMeal = meal.todayMeal.replace(/\n/g, ", ");
            return (
              <div key={index} className="flex mb-4 space-x-2 ml-3">
                <div className="max-w-40 mr-2"><strong><span
                  className={`${weekMealColors[dayOfWeek] || "text-gray-500"} max-w-40 mr-2 `}>{dayOfWeek} </span>식단 :
                </strong></div>
                <div>{formattedMeal}</div>
              </div>
            );
          })}
        </div>
        {/* 1대1문의 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="mr-2 text-[#66cdaa]" /> 1대1 문의 내역
              </h2>
            </div>
            <Link to={`/admin/site/board?category=inquiry`}
                  className="text-[#66cdaa] hover:text-[#3b8a6f] hover:font-bold cursor-pointer">1대1 문의 답변하러 가기
            </Link>
          </div>
          {userInquiries ? userInquiries.slice(0, 5).map((inquiry, index) => {
            return (
              <div key={index} className="flex items-center mb-4 space-x-2 ml-3">
                <MailPlus size={20} className="mr-2 " />
                <span>유형 :</span>
                <span
                  className="w-[65px] overflow-hidden text-ellipsis whitespace-nowrap text-[#3eb38b] mr-2">{inquiry.type}</span>
                <span className="ml-2">제목 :</span>
                <span
                  className="text-[#3eb38b] w-[180px] mr-2 overflow-hidden text-ellipsis whitespace-nowrap">{inquiry.title}</span>
                <span className="ml-2">작성일 :</span>
                <span className="text-[#3eb38b] ">{format(inquiry.createAt, "yy.MM.dd")}</span>
              </div>
            );
          }) : "작성된 문의글이 없습니다."}
        </div>
      </div>
    </div>
  );
};
export default Home;
