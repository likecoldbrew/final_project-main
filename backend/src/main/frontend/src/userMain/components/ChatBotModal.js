import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Map from "../components/Map";

const modalStyle = {
  position: "fixed",
  bottom: "20px",
  right: "110px",
  width: "450px",
  height: "550px",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  fontFamily: "Arial, sans-serif",
  zIndex: 1000
};

const headerStyle = {
  backgroundColor: "#75b4bf",
  color: "white",
  padding: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px"
};

const contentStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between", // 입력 필드를 하단에 배치
  height: "90%" // 전체 높이 사용
};

const messageContainerStyle = {
  marginBottom: "20px",
  maxHeight: "480px",
  overflowY: "auto"
};

const messageStyle = {
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  maxWidth: "80%"
};

const assistantMessageStyle = {
  ...messageStyle,
  backgroundColor: "#f0f0f0",
  marginRight: "auto",
  fontsize: "12px"
};

const userMessageStyle = {
  ...messageStyle,
  backgroundColor: "#4db0ab",
  color: "white",
  marginLeft: "auto",
  textAlign: "right",
  fontsize: "12px"
};

const buttonContainerStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px"
};

const buttonStyle = {
  padding: "5px 9px",
  border: "1px solid #bbe9f2",
  borderRadius: "4px",
  backgroundColor: "rgba(193,240,250,0.3)",
  fontSize: "14px",
  cursor: "pointer"
};

const inputContainerStyle = {
  display: "flex",
  position: "relative",
  gap: "10px"
};

const inputStyle = {
  flex: 1,
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc"
};

const sendButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#75b4bf",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const sendButtonHoverStyle = {
  ...sendButtonStyle,
  fontWeight: "bold",
  backgroundColor: "#51909c"
};

export default function ChatBotModal({ isOpen, onClose }) {
  //마우스 호버 스타일 적용변수
  const [isHoveringSendButton, setIsHoveringSendButton] = useState(false);
  //카테고리 관련
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  //챗봇 메세지
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요?" }
  ]);
  //유저가 입력하는 메세지
  const [inputMessage, setInputMessage] = useState("");
  // 메시지 컨테이너
  const messageContainerRef = useRef(null);
  // 진료과 추전을 위한 변수
  const [waitingForSymptoms,setWaitingForSymptoms] =useState(false);
  // 진료과 추천을 위한 증상들
  const [symptoms, setSymptoms] = useState([]) ;
  //병원 정보
  const [hospital, setHospital] = useState("");
  //진료과 정보
  const [department, setDepartment] = useState([]);

  //처음 화면 로딩시 정보들 다 가져오기
  useEffect(() => {
    fetchHospital();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
  }, [messages]);

  //병원 정보 호출
  const fetchHospital = async () => {
    try {
      const response = await fetch("/api/hospital/all");
      const data = await response.json();
      setHospital(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //진료과 정보 및 해당 진료과 의사 이름 호출
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/allDepartment");
      const data = await response.json();
      setDepartment(data); // 응답 데이터 설정
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //버튼 클릭시
  const handleButtonClick = (action) => {
    // 클릭된 버튼에 따라 입력한 메시지 추가
    setInputMessage(action); // inputMessage 상태를 클릭한 버튼의 action으로 업데이트
    handleSendMessage(action); // action을 인자로 전달
  };
  
  // 메세지 입력시
  const handleSendMessage = async (message) => {
    // e.preventDefault();
    if (message && message.trim()) {
      //사용자 메세지 추가
      const newMessages = [...messages, { role: "user", content: message }];
      let response = "";
      // 입력 메시지에 따라 DB에서 정보 요청
      // 1.운영시간 관련
      if (message.includes("시간") || message.includes("운영") || message.includes("언제") || message.includes("몇시") || inputMessage.includes("몇 시") || inputMessage.includes("평일") || inputMessage.includes("주말") || inputMessage.includes("공휴일")) {
        response = (
          <>
            <p>현재 저희 메디곰은</p>
            <p className="font-bold text-[#4db0ab]">{hospital.clinicTime}</p>
            로 운영되고 있습니다.
            <p className="my-4">더 자세한 정보는 아래 링크를 클릭하시면 확인하실 수 있습니다.</p> <Link
            to={`/hospitalInfo`}
            className="text-blue-500 hover:underline"
          > > 병원 정보 보러가기
          </Link>
          </>
        );
      }
      // 2. 예약 관련
      else if (message.includes("예약") || message.includes("온라인")) {
        response = (
          <>
            <p>전화로 예약하시길 원하신다면</p>
            <p className="font-bold text-[#4db0ab]">{hospital.reserveNumber}</p>
            로 전화주시면 친절하게 예약해드리겠습니다.

            <p className="mt-4">※ 전화예약 가능 시간 ※</p>
            <p className="font-bold text-[#4db0ab]">{hospital.reserveTime}</p>

            <p className="mt-4"><span className="text-rose-400">온라인으로 예약</span>을 하고 싶으시다면</p>
            <p className="mb-4"><span className="underline">로그인을 하신 후</span> <span className="font-bold text-[#4db0ab]">온라인 예약 페이지</span>에서
              쉽게 예약하실 수 있습니다.</p>
            <Link
              to={`/main/mediReserve`}
              className="text-blue-500 hover:underline "
            > > 온라인 예약 하러가기
            </Link>
          </>);
      }
      // 2. 전화 관련
      else if (message.includes("전화") || message.includes("번호")) {
        response = (
          <>
            <p>병원 대표 전화번호는</p>
            <p><span className="font-bold text-[#4db0ab]">{hospital.huntingLine}</span> 입니다.</p>
            <p className="mt-4"><span className="text-rose-400">진료 예약</span>의 경우</p>
            <p><span className="font-bold text-[#4db0ab]">{hospital.reserveNumber}</span>로 전화주시면 됩니다.</p>
          </>);
      }
      // 병원 위치 관련
      else if (message.includes("위치") || message.includes("어디") && !message.includes("진료")) {
        response = (
          <>
            <p>저희 메디곰은</p>
            <p><span className="font-bold text-[#4db0ab]">{hospital.hospitalAdd}</span>에 있습니다.</p>
            <div>
              <div className="mt-4">
                <Map width="250px" height="150px" />
              </div>
            </div>
            <p className="my-4">더 자세한 정보는 아래 링크를 클릭하시면 확인하실 수 있습니다.</p> <Link
            to={`/main/hospitalInfo`}
            className="text-blue-500 hover:underline"
          > > 병원 정보 보러가기
          </Link>
          </>);
      }
      // 진료과 추천
      else if (message.includes("진료과") && message.includes("추천")) {
        const response = <p>현재 증상을 입력해주세요.</p>;
        newMessages.push({ role: "assistant", content: response }); // JSX 요소 추가
        setMessages(newMessages);
        setInputMessage("");
        setWaitingForSymptoms(true); // 증상 입력 대기 상태
        return; // 함수 종료
      }
      // 증상 입력 후 진료과 추천
      else if (waitingForSymptoms) {
        const newSymptoms = [...symptoms, inputMessage];
        setSymptoms(newSymptoms);
        console.log("입력한 증상", symptoms)
        // API를 통해 진료과 추천 요청
        try {
          const result = await fetch("/api/recommend/departmentBySymptom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptomText: newSymptoms.join(" ") }),
          });
          const data = await result.json();

          if (data.length > 0) {
            if (data.length === 1) {
              // 추천 진료과가 하나일 때
              response = (
                <>
                  해당 증상에는 다음 진료과를 추천합니다.
                  <p className="mb-4">추천 진료과: <span className="font-bold text-blue-400">{data[0]}</span></p>
                  <Link to="/main/mediReserve" className="text-blue-500 hover:underline">예약하러 가기</Link>
                </>
              );
              setWaitingForSymptoms(false);
            } else {
              // 추천 진료과가 여러 개일 때
              response = (
                <>
                  해당 증상에는 다음과 같은 진료과들이 적합합니다.
                  <p className="mb-4">추천 진료과: <span className="font-bold text-blue-400">{data.join(", ")}</span></p>
                  <p>더 자세한 추천을 원하시면 다른 증상을 추가로 입력해 주세요.</p>
                </>
              );
            }
          } else {
            response = "적합한 진료과를 찾을 수 없습니다. 다른 증상을 입력해 주세요.";
          }
        } catch (error) {
          console.error("API 요청 중 오류 발생:", error);
          response = "진료과 추천 요청 중 문제가 발생했습니다.";
        }
      }
      // 3. 진료과 관련
      else if (message.includes("진료") || message.includes("부서")) {
        response = (
          <>
            <p>저희 메디곰에는</p>
            <p><span className="font-bold text-[#4db0ab]">
               {department.map((dept, index) => (
                 <span key={index}>{dept.departmentName}{index < department.length - 1 ? ", " : ""}</span>
               ))}
            </span>가 있습니다.</p>
            <p className="my-4">진료과에 대한 자세한 정보는 아래 링크에서 확인하실 수 있습니다.</p> <Link
            to={`/main/department`}
            className="text-blue-500 hover:underline"
          > > 진료과 정보 보러가기
          </Link>
          </>
        );
      }
      // 3. 담당의 관련(부서 이름 입력해야만 나옴)
      else if (message.includes("담당의") || message.includes("의사")) {
        const foundDepartment = department.find(dept => inputMessage.includes(dept.departmentName));
        if (foundDepartment) {
          response = (
            <>
              <p>{foundDepartment.departmentName} 담당의는</p>
              <p>
          <span>
            {foundDepartment.userNames.map((name, index) => (
              <span> <span key={index}
                           className="font-bold text-[#4db0ab]">{name}</span> 님{index < foundDepartment.userNames.length - 1 ? ", " : ""}</span>
            ))}
          </span>이 있습니다.
              </p>
              <p className="my-4">진료과별 담당의에 대한 자세한 정보는 아래 링크에서 확인하실 수 있습니다.</p> <Link
              to={`/main/department`}
              className="text-blue-500 hover:underline"
            > > 진료과 정보 보러가기
            </Link>
            </>
          );
        } else {
          response = <p>죄송하지만, 해당 부서에 대한 정보를 찾을 수 없습니다.</p>;
        }
      }
      //4.증명서 관련
      else if (message.includes("증명서") || message.includes("발급") || message.includes("진단서") || message.includes("확인서") || message.includes("소견서")) {
        response = (
          <>
            <p className="mt-4"><span className="text-rose-400">증명서 발급</span>을 하고 싶으시다면</p>
            <p className="mb-4"><span className="underline">로그인을 하신 후</span> <span className="font-bold text-[#4db0ab]">증명서 발급 페이지</span>에서
              쉽게 신청하실 수 있습니다.</p>
            <p className="mb-4">증명서 신청 결과는 <span className="font-bold text-[#4db0ab]">마이페이지에서</span> 확인할 수 있으며,
              결제일로부터 <span className="underline">7일간만</span> 다운 받으실 수 있습니다.
            </p>
            <p className="mt-4">※ 발급가능 진단서 종류 ※</p>
            <p className="mb-4"><span className="font-bold text-[#4db0ab]">① 진단서</span>, <span
              className="font-bold text-[#4db0ab]">② 의사소견서</span>,
              <span className="font-bold text-[#4db0ab]">③ 입퇴원 확인서</span></p>
            <Link
              to={`/main/certificate`}
              className="text-blue-500 hover:underline "
            > > 증명서 발급 신청 하러가기
            </Link>
          </>);

      }

     else {
        response = `죄송하지만 그에 대한 정보를 찾을 수 없습니다.`;
      }
      newMessages.push({ role: "assistant", content: response });
      setMessages(newMessages);
      setInputMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyle}>
      <div style={headerStyle}>
        <div>ChatBot</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
          X
        </button>
      </div>
      <div style={contentStyle}>
        <div ref={messageContainerRef} style={messageContainerStyle}>
          {messages.map((message, index) => (
            <div key={index}>
              <div style={message.role === "assistant" ? assistantMessageStyle : userMessageStyle}>
                {message.content}
              </div>
              {/* 마지막 메시지가 assistant일 경우 버튼을 렌더링 */}
              {message.role === "assistant" && index === messages.length - 1 && (
                <div style={buttonContainerStyle}>
                  {["병원 위치", "예약", "진료과 추천"].map((type)=>(
                    <button key={type} onClick={()=>handleButtonClick(type)} style={buttonStyle}>{type}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage)}} style={inputContainerStyle}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            style={inputStyle}
          />
          <button
            type="submit"
            style={isHoveringSendButton ? { ...sendButtonStyle, ...sendButtonHoverStyle } : sendButtonStyle}
            onMouseEnter={() => setIsHoveringSendButton(true)}
            onMouseLeave={() => setIsHoveringSendButton(false)}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}