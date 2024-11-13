import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import Post from "../components/Post";
import AlertModal from "../components/AlertModal";

const OnlineReserve = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; //카테고리 값 받아오고 넘겨주기
  //예약정보
  const [reserve, setReserve] = useState([]);
  //의사정보
  const [doctorInfo, setDoctorInfo] = useState([]);
  //진료과 정보
  const [departmentInfo, setDepartmentInfo] = useState([]);
  //오늘날짜
  const today = new Date().toISOString().split("T")[0];
  //유저 확인 여부
  const [userCheck, setUserCheck] = useState(false);
  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 입력 정보 폼
  const [userInfoData, setUserInfoData] = useState({
    userName: "",
    rrn1: "",
    rrn2: "",
    departmentNo: "",
    doctorNo: "",
    reserveTime: "",
    symptom: ""
  });

  //에러메세지 폼
  const [errMsg, setErrMsg] = useState({
    userName: "",
    rrn: "",
    departmentNo: "",
    doctorNo: "",
    reserveTime: "",
    symptom: ""
  });

  /* 시작점 */
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token"); // JWT를 로컬 스토리지에서 가져옴
    if (token) {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}` // JWT 포함
          }
        });

        console.log(response.ok)
        if (response.ok) {
          const data = await response.json(); // 서버에서 반환하는 사용자 정보
          setIsLoading(true); //로그인 상태 확인용
          setUserInfo(data); // 사용자 정보 상태 업데이트
          fetchUsers(data); //사용자정보조회
        } else {
          console.error("사용자 정보를 가져오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 중 오류 발생:", error);
      }
    }else{
      setModalMessage("로그인 후 이용가능합니다.");
      setModalButtonText("로그인 하기");
      setAlertModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/main/login"); // 로그인페이지로 보내기
    }
  };

  useEffect(()=>{
    fetchUserInfo()
    fetchDepartments()
  },[])
  /* 종료점 */

  useEffect(() => {
    fetchDoctors(); // departmentNo가 변경될 때만
  }, [userInfoData.departmentNo]);

  //입력값
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfoData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === "rrn1" && value.length === 6) {
      document.getElementById("rrn2").focus();
    }
    if (name === "reserveTime") {
      // 선택한 날짜가 일요일인지 확인
      const selectedDate = new Date(value);
      const isSunday = selectedDate.getDay() === 0; // 0은 일요일을 나타냅니다.
      if (isSunday) {
        setErrMsg((prev) => ({
          ...prev,
          reserveTime: "일요일은 선택할 수 없습니다."
        }));
      } else {
        setErrMsg((prev) => ({
          ...prev,
          reserveTime: ""
        }));
      }
    }
  };


  //유효성 검사
  const validate = (e) => {
    let isValid = true;
    //유저확인
    if(!userCheck){
      setErrMsg(prev => ({ ...prev, userName: "본인 확인은 필수 입니다." }));
      setErrMsg(prev => ({ ...prev, rrn: "주민번호는 필수 입니다." }));
      isValid = false;
    }
    //진료과 확인
    if (!userInfoData.departmentNo) {
      setErrMsg(prev => ({ ...prev, departmentNo: "진료과 선택은 필수 입니다." }));
      isValid = false;
    }
    //담당의 확인
    if (!userInfoData.doctorNo) {
      setErrMsg(prev => ({ ...prev, doctorNo: "의사 선택은 필수 입니다." }));
      isValid = false;
    }
    //예약일 화인
    if (!userInfoData.reserveTime) {
      setErrMsg(prev => ({ ...prev, reserveTime: "예약일 선택은 필수입니다." }));
      isValid = false;
    }
    //증상 확인
    if (!userInfoData.symptom) {
      setErrMsg(prev => ({ ...prev, symptom: "증상 입력은 필수입니다." }));
      isValid = false;
    }
    return isValid;
  };


  const userCheckBtn = (e) => {
    e.preventDefault();
    let hasError = false;
    //이름 확인
    const nameRex = /^[가-힣A-Za-z]+$/;
    if (!userInfoData.userName) {
      setErrMsg(prev => ({ ...prev, userName: "이름은 필수 입니다." }));
      hasError = true;
    } else if (!nameRex.test(userInfoData.userName)) {
      setErrMsg(prev => ({ ...prev, userName: "이름은 한글과 영문만 사용할 수 있습니다." }));
      hasError = true;
    } else if (userInfoData.userName !== userInfo.userName) {
      setErrMsg(prev => ({ ...prev, userName: "로그인 하신 유저와 정보가 일치하지 않습니다." }));
      hasError = true;
    } else {
      setErrMsg(prev => ({ ...prev, userName: "" }));
    }
    // 주민번호 확인
    if (!userInfoData.rrn1 || !userInfoData.rrn2) {
      setErrMsg(prev => ({ ...prev, rrn: "주민번호 입력은 필수 입니다." }));
      hasError = true;
    } else if (!/^[0-9]{6}$/.test(userInfoData.rrn1) || !/^[0-9]{7}$/.test(userInfoData.rrn2)) {
      setErrMsg(prev => ({ ...prev, rrn: "주민번호는 숫자만 입력 가능합니다." }));
      hasError = true;
    } else {
      const year = parseInt(userInfoData.rrn1.substring(0, 2));
      const month = parseInt(userInfoData.rrn1.substring(2, 4));
      const day = parseInt(userInfoData.rrn1.substring(4, 6));
      const gender = userInfoData.rrn2[0];
      const yearFix = gender === "1" || gender === "2" ? 1900 : 2000;
      //생일 양식
      const birthDate = new Date(yearFix + year, month - 1, day);
      if (
        birthDate.getFullYear() !== yearFix + year ||
        birthDate.getMonth() + 1 !== month ||
        birthDate.getDate() !== day
      ) {
        setErrMsg(prev => ({ ...prev, rrn: "올바른 주민등록번호가 아닙니다." }));
        hasError = true;
      } else {
        setErrMsg(prev => ({ ...prev, rrn: "" }));
      }
    }
    if (userInfo.userRrn !== userInfoData.rrn1 + "-" + userInfoData.rrn2) {
      setErrMsg(prev => ({ ...prev, rrn: "가입하신 회원 정보와 일치하지 않습니다." }));
      hasError = true;
    } else {
      setModalMessage("회원 정보가 확인 되었습니다.");
      setModalButtonText("확인");
      setAlertModalOpen(true);
      setIsSuccess(true);
    }
    //에러여부
    if (hasError) {
      setUserCheck(false);  // 에러가 있을 때 userCheck를 true로 설정
    } else {
      setUserCheck(true); // 에러가 없을 때 userCheck를 false로 설정
    }
    return !hasError;
  };

  //진료과 정보 불러오기
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/allDepartment");
      const data = await response.json();
      setDepartmentInfo(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //의사 정보 불러오기
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`/api/doctorsInfo/doctor/${userInfoData.departmentNo}`);
      const data = await response.json();
      setDoctorInfo(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  // 전송

  const goReserve = async (e) => {
    e.preventDefault();
    //유효성 체크
    if (!validate()) {
      return;
    }
    //정보담기
    const reserveData = {
      userNo: userInfo.userNo,
      doctorNo: userInfoData.doctorNo,
      medicalDepartment: userInfoData.departmentNo,
      reserveTime: userInfoData.reserveTime,
      symptom: userInfoData.symptom
    };
    try {
      const result = await fetch("/api/reserve/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reserveData)
      });
      if (result.ok) {
        // 게시글 등록 성공 시
        setModalMessage("예약 신청이 완료되었습니다..");
        setModalButtonText("예약 내역 페이지로 이동");
        setAlertModalOpen(true);
        setIsSuccess(true); // isSuccess 상태 업데이트
        setRedirectPath("/main/myReserve");
      } else {
        // 에러 처리
        const errorText = await result.text(); // 에러 메시지 받아오기
        console.log(`게시글 등록에 실패했습니다.  ${errorText}`);
        alert(`게시글 등록에 실패했습니다.  ${errorText}`);
      }
    } catch (error) {
      console.error("Error registering board:", error);
      alert("게시글 등록 중 오류가 발생했습니다.");
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow flex-col pr-2">
          <div className="flex flex-col min-h-full space-y-10">
            {/*예약 설명*/}
            <div className="w-full p-4 bg-white border border-sky-200 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 text-blue-500">예약 정보</h2>
              <ul className="list-disc pl-5">
                <li className="mb-2">
                  메디곰 <span className="text-red-500 font-bold">회원 전용 메뉴</span>입니다.
                </li>
                <li className="mb-2">
                  정확한 이용자 식별을 위해 주민등록번호를 수집 및 이용하며 입력하신 정보는 저장되지 않습니다.
                </li>
                <li className="mb-2 font-bold">
                  병원 방문일로부터 21일 이내 해외방문력과 증상(발열, 기침, 호흡곤란, 피부발진 등)이 있으신 분은 질병관리청 콜센터(1339)나 보건소 또는 진료예약센터(1599-7123)로
                  문의하시기 바랍니다.
                </li>
                <li className="mb-2 mt-4 text-sky-700">
                  인터넷 예약 절차
                </li>
              </ul>
              {/* 순서 목록을 위한 div */}
              <div className="flex space-x-4 mt-2 ">
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.01
                  </div>
                  <div className="mx-2 text-center mt-2">환자 정보 확인</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.02
                  </div>
                  <div className="mx-2 text-center mt-2">희망하는 진료과 및 날짜 선택</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.03
                  </div>
                  <div className="mx-2 text-center mt-2">현재 증상 작성</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.04
                  </div>
                  <div className="mx-2 text-center mt-2">예약 신청</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.05
                  </div>
                  <div className="mx-2 text-center my-2">마이페이지에서 승인여부 확인</div>
                </div>
              </div>
            </div>
            {/* 예약 정보 입력 칸*/}
            <div className="w-full p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-blue-500 mb-4">환자 정보 입력</h2>
              <form className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col w-1/4 mb-2">
                    <label htmlFor="userName" className="block mb-1 font-bold">환자 이름</label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={userInfoData.userName}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="환자 이름을 입력하세요"
                      onChange={handleChange}
                      disabled={userCheck}
                    />
                    {errMsg.userName && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.userName}
                    </p>)}
                  </div>
                  <div className="flex flex-col w-2/3 mb-2">
                    <label htmlFor="rrn1" className="block mb-1 font-bold">주민번호</label>
                    <div className="flex items-center space-x-1 w-full">
                      <input
                        type="text"  // type을 'rrn1'에서 'text'로 수정
                        id="rrn1"
                        name="rrn1"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="900123"
                        maxLength={6}
                        onChange={handleChange}
                        disabled={userCheck}
                      />
                      <span className="flex items-center">-</span>
                      <input
                        type="password"
                        id="rrn2"
                        name="rrn2"
                        maxLength={7}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="0xxxxxx"
                        onChange={handleChange}
                        disabled={userCheck}
                      />
                    </div>
                    {errMsg.rrn && (  // 오류 메시지를 두 개의 입력 필드 아래에 표시
                      <p className="text-red-500 text-sm mt-1">
                        {errMsg.rrn}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col mb-2">
                    <label className={`block mb-1 ${errMsg.userName || errMsg.rrn ? "mt-0" : "mt-6"}`}> </label>
                    <div className="flex items-center space-x-1 w-full">
                      <button
                        onClick={userCheckBtn}
                        className="px-4 py-2 border rounded-md bg-sky-100 text-blue-500 hover:bg-sky-200 hover:font-bold h-full">
                        확인
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-10 flex flex-col space-y-7">
                  <div>
                    <label className="block mb-1 font-bold">진료과 선택</label>
                    <select name="departmentNo" onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled={!userCheck}>
                      <option value="">진료과를 선택하세요</option>
                      {departmentInfo.length > 0 ? (
                        departmentInfo.map((department, index) => (<option key={index} value={department.departmentNo}
                                                                           className="py-10">{department.departmentName}</option>))
                      ) : null}

                    </select>
                    {errMsg.departmentNo && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.departmentNo}
                    </p>)}
                  </div>
                  <div>
                    <label className="block mb-1 font-bold">담당의 선택</label>
                    <select name="doctorNo" onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled={!userCheck || !userInfoData.departmentNo}>
                      <option value="">진료를 희망하는 의사를 선택하세요</option>
                      {doctorInfo.length > 0 ? (
                        doctorInfo.map((doctor, index) => (<option value={doctor.userNo}>{doctor.userName}</option>))
                      ) : null}
                      추가 진료과 옵션
                    </select>
                    {errMsg.doctorNo && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.doctorNo}
                    </p>)}
                  </div>
                  <div>
                    <label htmlFor="reserveTime" className="block mb-1 font-bold">날짜 선택</label>
                    <input
                      type="date"
                      name="reserveTime"
                      className="w-full p-2 border border-gray-300 rounded"
                      min={today}
                      onChange={handleChange}
                      disabled={!userCheck || !userInfoData.departmentNo || !userInfoData.doctorNo}
                    />
                    {errMsg.reserveTime && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.reserveTime}
                    </p>)}
                  </div>
                  <div>
                    <label htmlFor="symptom" className="block mb-1 font-bold">증상</label>
                    <textarea
                      value={userInfoData.symptom}
                      name="symptom"
                      rows="5"
                      className="w-full border border-gray-300 p-2 rounded-md h-[200px]"
                      onChange={handleChange}
                      disabled={!userCheck || !userInfoData.departmentNo || !userInfoData.doctorNo || !userInfoData.reserveTime}
                    />
                    {errMsg.symptom && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.symptom}
                    </p>)}
                  </div>
                  <div className="flex justify-end">
                    {userInfo ? (
                      <button
                        type="submit"
                        onClick={goReserve}
                        className="px-4 py-2 border rounded-md bg-white text-blue-500 hover:bg-sky-200 hover:font-bold">
                        예약하기
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
      {/*완료 알림 모달창*/}
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        message={modalMessage}
        buttonText={modalButtonText}
        isSuccess={isSuccess}
        redirectPath={modalRedirectPath}
        state={{ selectCategory, selectSubCategory }}
      />

    </div>
  );
};
export default OnlineReserve;
