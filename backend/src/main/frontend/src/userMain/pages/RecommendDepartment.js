import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";

const RecommendDepartment = () => {
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [selectedType, setSelectedType] = useState(""); // 선택된 유형 값
  const [symptom, setSymptom] = useState(""); // 유저가 입력한 증상
  const [symptoms, setSymptoms] = useState([]); // 입력된 모든 증상의 배열
  const [recommendations, setRecommendations] = useState([]); // 각 증상에 대한 추천 내역
  const [lastResult, setLastResult] = useState(null); // 마지막 추천 결과
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { userInfo } = useUser(); //유저 정보

  //페이지 이동시 화면 맨위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  //엔터키 입력시 바로 증상 추천
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(symptom);
    }
  };

  // 추천하기 버튼 클릭 시 처리
  const handleRecommendationSubmit = (e) => {
    e.preventDefault(); // 기본 경로 이동 방지
    handleSubmit(symptom); // 현재 symptom 상태를 가지고 추천 요청
  };

  //submit 부분
  const handleSubmit = async(inputSymptom)  => {
    if (!inputSymptom.trim()) return; // 빈 입력값 무시

    // 현재 입력된 증상을 배열에 추가
    const updatedSymptoms = [...symptoms, inputSymptom];
    setSymptoms(updatedSymptoms); // 상태 업데이트
    setSymptom(""); // 입력 필드 초기화

    try {
      // fetch를 사용하여 백엔드에 POST 요청 전송
      const response = await fetch("/api/recommend/departmentBySymptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomText: updatedSymptoms.join(" ") }),
      });

      if (response.ok) {
        const data = await response.json();

        let message;
        if (data.length === 1) {
          // 진료과가 하나일 때
          message = (
            <>
              해당 증상은 "<span className="font-bold text-blue-400">{data[0]}</span>"를 방문하시는 것이 좋습니다.
              <div className="mt-4">
                <Link to="/main/mediReserve" className="text-blue-500 hover:underline ml-2">> 예약하러 가기</Link>
              </div>
            </>
          );
          setLastResult(data[0]);
        } else if (data.length > 1) {
          // 여러 진료과가 있을 때
          if (lastResult) {
            // 마지막으로 하나의 진료과가 나왔을 때
            message = (
              <>
                해당 증상들을 종합해봤을 때 "<span className="font-bold text-blue-400">{lastResult}</span>"가 적합한 것 같습니다.
                <div className="mt-4">
                  <Link to="/main/mediReserve" className="text-blue-500 hover:underline ml-2">예약하러 가기</Link>
                </div>
              </>
            );
          } else {
            message = (
              <>
                해당 증상은 "<span className="font-bold text-blue-400">{data.join(", ")}</span>"가 적합합니다. 더 자세한 추천을 원하신다면 다른 증상들을 추가로 입력해주세요.
              </>
            )
          }
        } else {
          // 진료과가 없을 때
          message =  (
            <>
              현재 입력한 증상에 적합한 <span className="underline font-semibold">진료과를 찾을 수 없습니다.</span> 다른 증상을 입력해보세요.
            </>
          )
        }

        // 추천 결과를 화면에 추가
        setRecommendations((prev) => [
          ...prev,
          { symptom: inputSymptom, message },
        ]);
      } else {
        console.error("추천 요청 실패:", response.statusText);
      }
    } catch (error) {
      console.error("추천 오류:", error);
    }
  };

  // 증상 초기화
  const handleResetSymptoms = () => {
    setSymptom("");
    setSymptoms([]);
    setRecommendations([]);
    setLastResult(null);
  };

  //증상 버튼을 클릭할 시
  const handleTypeSelect = (type) => {
    handleSubmit(type); // 선택된 증상으로 추천 메시지를 표시
  };


  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow flex-col pr-8">
          <div className="flex-col min-h-full space-y-4 items-center justify-center">
            <div className="flex justify-start items-center space-x-4 mb-4">
              <p className="text-xl font-bold">
                증상 선택
              </p>
              {["복통", "두통", "발열", "몸살", "출혈"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleSubmit(type)}
                  className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-100 hover:font-bold"
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <div className="w-full h-auto rounded-[10px] bg-white p-4 shadow-blue-700 flex flex-col">
                {/* 내용 출력 */}
                <div className="overflow-y-auto flex-grow mt-4 space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index}>
                      <div className="p-2 bg-sky-100 bg-opacity-65 rounded-[10px] shadow text-right mb-3">
                        {rec.symptom}
                      </div>
                      <div className="p-2 bg-green-100 bg-opacity-75 rounded-[10px] shadow text-left">
                        {rec.message}
                      </div>
                    </div>
                  ))}
                  {symptoms.length>0? (
                    <button
                      onClick={handleResetSymptoms}
                      className="mt-4 bg-pink-100 text-pink-700 hover:font-bold px-4 py-2 rounded self-end"
                    >
                      증상 새로 입력하기
                    </button>
                  ):null}

                </div>
                {/* 입력란 */}
                <form onSubmit={(e) => e.preventDefault()} className="bg-white p-2 shadow-md flex flex-col mt-4">
                  <label className="mb-1">증상을 입력하세요:</label>
                  <div className="flex flex-col">
                   <textarea
                     value={symptom}
                     onChange={(e) => setSymptom(e.target.value)}
                     onKeyDown={handleKeyDown}
                     rows={2}
                     className="w-full p-2 resize-none border rounded mb-2"
                   />
                    <button type="button"
                            onClick={() => handleSubmit(symptom)}
                            className="bg-sky-200 text-sky-700 hover:font-bold px-4 py-2 rounded self-end">
                      추천받기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  )
    ;
};

export default RecommendDepartment;
