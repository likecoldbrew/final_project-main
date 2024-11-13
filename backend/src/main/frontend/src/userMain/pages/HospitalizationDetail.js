import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";

const HospitalizationDetail = ({ hospitalizationId }) => {
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [hospitalization, setHospitalization] = useState(null);
  const { userInfo } = useUser(); //유저정보

  useEffect(() => {
    fetchHospitalizationDetail();
  }, [hospitalizationId]);

  const formatDate = (timestamp) => {
    return timestamp ? timestamp.slice(0, 10) : "";
  };

  const fetchHospitalizationDetail = async () => {
    try {
      const response = await fetch(`/api/hospitalization/detail/${hospitalizationId}`);
      const data = await response.json();
      if (data) {
        const formattedData = {
          ...data,
          startDate: data.startDate ? formatDate(data.startDate) : "입원대기중",
          dueDate: data.dueDate ? formatDate(data.dueDate) : "퇴원예정일 미정",
          endDate: data.endDate ? formatDate(data.endDate) : "입원중"
        };
        setHospitalization(formattedData);
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setHospitalization([]); // 오류 발생 시 빈 배열로 초기화
    }
  };

  //입원일 계산
  const calculateHospitalizationPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end - start;
    // 밀리초를 일수로 변환
    return differenceInTime / (1000 * 60 * 60 * 24);
  };


  //값이 없을 때 화면에 띄워줄 거
  if (!hospitalization) {
    return (
      <div className="flex justify-center items-center h-screen">
        입원내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <div className="w-full rounded-[10px] bg-white p-6 shadow-blue-700 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl">
                <span className="font-bold">진단명 : <span
                  className="text-sky-500"> {hospitalization.diseaseName}</span></span>
              </div>
              <div className="text-gray-600">입원 상태: <span
                className="text-green-600 font-bold">{hospitalization.status === 1 ? "입원 대기 중" : hospitalization.status === 2 ? "입원중" : "퇴원"}</span>
              </div>
            </div>

            <hr className="border-t border-sky-200  mb-6" />
            <div className="mt-4 h-[350px]">
              <p className="font-bold">방문과 : <span
                className="font-medium text-sky-800 mr-11"> {hospitalization.departmentName}</span>
                담당의 : <span className="font-medium text-sky-800 mr-11"> {hospitalization.doctorName}</span></p>
              <hr className="border-t border-2 border-dashed border-sky-200 mb-6 mt-4" />
              <p className="mb-6">입원실 유형 :
                <span className="font-bold text-sky-800 mr-6"> {hospitalization.roomType}  </span> <span
                  className="mr-6">||</span> 호실 : <span
                  className="font-bold text-sky-800 mr-6"> {hospitalization.roomName}</span> <span
                  className="mr-6">||</span> 층수 : <span
                  className="font-bold text-sky-800 mr-10"> {hospitalization.floor}</span>
              </p>
              <p className="mb-6">입원 시작일 : <span
                className="font-bold text-sky-800"> {hospitalization.startDate}</span></p>
              <p className="mb-6">퇴원 예정일 : <span
                className="font-bold text-sky-800"> {hospitalization.dueDate}</span></p>
              <p className="mb-6">퇴원일 : <span
                className="font-bold text-sky-800"> {hospitalization.endDate}</span></p>
              {hospitalization.dueDate ? (
                <p className="mb-6">비고 :
                  {(() => {
                    const period = calculateHospitalizationPeriod(hospitalization.dueDate, hospitalization.endDate);
                    return period > 0 ? (
                      <p className="mt-2 mb-6"> ● 회복이 느려 <span className="underline">예정일 보다 <span className="font-bold text-sky-800">{period}</span>일 더 입원</span>하였음.</p>
                    ) : period === 0 ? (
                      "예정일 대로 퇴원하였음"
                    ) : (
                      <p> ● 회복 속도가 좋아  <span className="underline">예정보다 <span className="font-bold text-sky-800">{Math.abs(period)}</span>일 일찍 퇴원</span>하였음.</p>
                    );
                  })()}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end items-center">
            <Link
              to={`/prescript`} // 목록 페이지로 돌아가기
              state={{ selectCategory, selectSubCategory }}
              className="text-sky-600 hover:underline mr-4"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </main>
        <div className="flex flex-col space-y-4">
        <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default HospitalizationDetail;
