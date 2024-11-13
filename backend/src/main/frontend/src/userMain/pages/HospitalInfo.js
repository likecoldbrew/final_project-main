import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import Map from "../components/Map";
import PharmacyMap from "../components/PharmacyMap";

const HospitalInfo = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const [hospital, setHospital] = useState("");

  // API 호출
  useEffect(() => {
    fetchHospital();
    window.scrollTo(0, 0);
  }, []);

  //병원 정보
  const fetchHospital = async () => {
    try {
      const response = await fetch("/api/hospital/all");
      const data = await response.json();
      setHospital(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className=" container mx-auto px-4 py-5 flex flex-grow">
        <main className="flex-grow flex-col pr-8">
          <div className="flex-col min-h-full space-y-4 items-center justify-center">
            <h2 className="text-xl flex-grow flex-col font-bold mt-0 mb-4">
              병원 소개
            </h2>
            <div
              className="flex-col flex-grow bg-white p-4 border border-blue-300 rounded shadow relative"
              style={{ height: "30%", whiteSpace: "pre-line" }}
            >
              {" "}
              <div
                style={{
                  backgroundImage: `url('/images/mediGom_Logo.png')`,
                  height: "90%", // 부모 div와 높이를 맞춤
                  backgroundSize: "contain", // 이미지 크기 조정
                  backgroundPosition: "center", // 중앙에 위치
                  backgroundRepeat: "no-repeat", // 반복하지 않음
                  opacity: 0.3, // 투명도 설정 (0.0 ~ 1.0 범위)
                  position: "absolute", // 절대 위치로 설정
                  top: 10,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 0 // 배경 이미지가 다른 내용 아래에 위치하도록 설정
                }}
              />
              {/* 텍스트 내용 */}
              <h2 className="text-xl flex-grow text-center font-bold m-8 relative ">
                {hospital ? <>{hospital.intro}</> : null}
              </h2>
            </div>
            <h2 className="text-xl flex-grow flex-col font-bold my-12">
              진료시간
            </h2>
            <div className="flex-col bg-white flex-grow p-4 border border-blue-300 rounded shadow relative text-lg ">
              {hospital ? (
                <p>
                  <span className="font-bold whitespace-pre-line leading-10">{hospital.clinicTime}</span>
                </p>
              ) : (
                <p>병원 정보가 없습니다.</p>
              )}
            </div>
            <h2 className="text-xl flex-grow flex-col font-bold my-12">
              예약 전화 가능 시간
            </h2>
            <div className="flex-col bg-white flex-grow p-4 border border-blue-300 rounded shadow relative text-lg ">
              {hospital ? (
                <p>
                  <span className="font-bold whitespace-pre-line leading-10">{hospital.reserveTime}</span>
                </p>
              ) : (
                <p>병원 정보가 없습니다.</p>
              )}
            </div>
            <h2 className="text-xl flex-grow font-bold my-12">병원 위치</h2>
            <div className=" bg-white flex-grow  p-4 border border-blue-300 rounded shadow relative ">
              {hospital ? (
                <div>
                  <p className="text-center font-bold">
                    {hospital.hospitalAdd}
                  </p>
                  <br />
                </div>
              ) : (
                <p>병원 정보가 없습니다.</p>
              )}
              <div className="flex justify-center">
                <Map />
              </div>
            </div>
            <h2 className="text-xl flex-grow font-bold my-12">근처 약국위치</h2>
            <div className=" bg-white flex-grow  p-4 border border-blue-300 rounded shadow relative ">
              <p className="text-center font-bold">
                ※ 마커를 클릭하면 약국 이름이 뜹니다.
              </p>
              <br />
              <div className="flex justify-center">
                <PharmacyMap />
              </div>
            </div>
          </div>
        </main>
        <div className="flex flex-col space-y-4 mt-10">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default HospitalInfo;
