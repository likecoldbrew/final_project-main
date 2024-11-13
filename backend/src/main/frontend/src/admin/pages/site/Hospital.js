import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";

export default function Hospital() {
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [hospitalInfo, setHospitalInfo] = useState({
    hospitalNameKr: "",
    hospitalNameEn: "",
    hospitalAdd: "",
    huntingLine: "",
    businessRegistrationNumber: "",
    reserveNumber: "",
    reserveTime: "",
    clinicTime: "",
    intro: "",
    copyright: "",
    greetings: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/hospital/all"); // Spring Boot 서버에서 데이터 가져오기
        const data = await response.json();
        // 데이터가 있으면 hospitalInfo 상태에 값을 설정
        if (data) {
          setHospitalInfo({
            hospitalNameKr: data.hospitalNameKr || "",
            hospitalNameEn: data.hospitalNameEn || "",
            hospitalAdd: data.hospitalAdd || "",
            huntingLine: data.huntingLine || "",
            businessRegistrationNumber: data.businessRegistrationNumber || "",
            reserveNumber: data.reserveNumber || "",
            reserveTime: data.reserveTime || "",
            clinicTime: data.clinicTime || "",
            intro: data.intro || "",
            copyright: data.copyright || "",
            greetings: data.greetings || ""
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHospitalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/hospital/update`, {
        method: "PUT", // 수정 시에는 보통 PUT 메서드를 사용
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(hospitalInfo) // hospitalInfo 객체를 JSON으로 변환하여 전송
      });

      if (response.ok) {
        const updatedHospital = await response.json();
        console.log("병원 정보가 성공적으로 수정되었습니다:", updatedHospital);
        alert("병원 정보가 수정되었습니다.");
      } else {
        console.error("병원 정보 수정에 실패했습니다.");
        alert("병원 정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating hospital info:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center text-gray-400">
          <Loader className="animate-spin" size={50} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-5xl mx-auto my-6 p-5 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto p-6 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hospitalNameKr" className="block text-sm font-bold text-gray-700">병원 한글명</label>
              <input
                type="text"
                id="hospitalNameKr"
                name="hospitalNameKr"
                value={hospitalInfo.hospitalNameKr}
                onChange={handleChange}
                placeholder="병원 한글명 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="hospitalNameEn" className="block text-sm font-bold text-gray-700">병원 영문명</label>
              <input
                type="text"
                id="hospitalNameEn"
                name="hospitalNameEn"
                value={hospitalInfo.hospitalNameEn}
                onChange={handleChange}
                placeholder="병원 영문명을 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="hospitalAdd" className="block text-sm font-bold text-gray-700">병원 주소</label>
              <input
                type="text"
                id="hospitalAdd"
                name="hospitalAdd"
                value={hospitalInfo.hospitalAdd}
                onChange={handleChange}
                placeholder="병원 주소를 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="huntingLine" className="block text-sm font-bold text-gray-700">대표번호</label>
              <input
                type="text"
                id="huntingLine"
                name="huntingLine"
                value={hospitalInfo.huntingLine}
                onChange={handleChange}
                placeholder="대표번호를 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="businessRegistrationNumber" className="block text-sm font-bold text-gray-700">사업자
                번호</label>
              <input
                type="text"
                id="businessRegistrationNumber"
                name="businessRegistrationNumber"
                value={hospitalInfo.businessRegistrationNumber}
                onChange={handleChange}
                placeholder="사업자 번호를 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="reserveNumber" className="block text-sm font-bold text-gray-700">예약 전화번호</label>
              <input
                type="text"
                id="reserveNumber"
                name="reserveNumber"
                value={hospitalInfo.reserveNumber}
                onChange={handleChange}
                placeholder="예약 전화번호를 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="clinicTime" className="block text-sm font-bold text-gray-700">진료 시간</label>
              <textarea
                id="clinicTime"
                name="clinicTime"
                value={hospitalInfo.clinicTime}
                onChange={handleChange}
                placeholder="진료 시간을 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows={3}
                required
              />
            </div>
            <div>
              <label htmlFor="reserveTime" className="block text-sm font-bold text-gray-700">예약 전화 가능 시간</label>
              <textarea
                id="reserveTime"
                name="reserveTime"
                value={hospitalInfo.reserveTime}
                onChange={handleChange}
                placeholder="예약 전화 가능 시간을 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="my-6">
            <label htmlFor="intro" className="block text-sm font-bold text-gray-700 mb-2">병원 소개</label>
            <textarea
              id="intro"
              name="intro"
              value={hospitalInfo.intro}
              onChange={handleChange}
              placeholder="병원 소개를 입력하세요"
              className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300
                    focus:ring focus:ring-indigo-200 focus:ring-opacity-50 min-h-[100px]"
              rows={7}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="greetings" className="block text-sm font-bold text-gray-700">인사말</label>
              <textarea
                id="greetings"
                name="greetings"
                value={hospitalInfo.greetings}
                onChange={handleChange}
                placeholder="인사말을 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows={2}
                required
              />
            </div>
            <div>
              <label htmlFor="copyright" className="block text-sm font-bold text-gray-700">저작권 표시</label>
              <input
                type="text"
                id="copyright"
                name="copyright"
                value={hospitalInfo.copyright}
                onChange={handleChange}
                placeholder="저작권 표시 말을 입력하세요"
                className="mt-1 block w-full border p-3 rounded shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 px-4 py-2 border border-transparent rounded-md text-md font-medium text-white
            bg-lime-400 bg-opacity-80 hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-lime-400"
          >
            저장
          </button>
        </form>
      </div>
    </>
  );

};