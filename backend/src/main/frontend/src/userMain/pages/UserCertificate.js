import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import AlertModal from "../components/AlertModal";
import { format } from "date-fns";

const UserCertificate = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; //카테고리 값 받아오고 넘겨주기
  //진료내역 정보
  const [medicalRecords, setMedicalRecords] = useState([]);
  //입원내역 정보
  const [hospitalization, setHospitalization] = useState([]);


  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 입력 정보 폼
  const [certificateData, setCertificateData] = useState({
    certificateType: "",
    medicalRecord: "",
    medicalDepartment: "",
    medicalDoctor: "",
    medicalDoctorNo: "",
    purpose: ""
  });

  //에러메세지 폼
  const [errMsg, setErrMsg] = useState({
    certificateType: "",
    medicalRecord: "",
    purpose: ""
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
          fetchRecords(data)
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
  },[])
  /* 종료점 */

  useEffect(() => {

  }, [certificateData.certificateType]);

  //진료내역 불러오기
  const fetchRecords = async (userInfo) => {
    try {
      const response = await fetch(`/api/medical_record/loginUser/${userInfo.userNo}`);
      const data = await response.json();
      setMedicalRecords(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //입원내역 불러오기
  const fetchHospitalization = async () => {
    try {
      const response = await fetch(`/api/hospitalization/${userInfo.userNo}`);
      const data = await response.json();
      setHospitalization(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //입력값
  const handleInputValue = (e) => {
    const { name, value } = e.target;
    setCertificateData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === "medicalRecord") {
        let selectedRecord;
        if (certificateData.certificateType === "3") {
          selectedRecord = hospitalization.find(record => record.hospitalizationId === parseInt(value));
        } else {
          selectedRecord = medicalRecords.find(record => record.recordId === parseInt(value));
        }
        if (selectedRecord) {
          updatedData.medicalDepartment = selectedRecord.departmentName;
          updatedData.medicalDoctor = selectedRecord.doctorName;
          updatedData.medicalDoctorNo = selectedRecord.doctorNo;
        }
      }
      return updatedData;
    });
  };

  //유효성 검사
  const validate = (e) => {
    //증명서 종류 선택
    if (!certificateData.certificateType) {
      setErrMsg(prev => ({ ...prev, certificateType: "증명서 종류 선택은 필수 입니다." }));
    }
    //진료 내역 선택
    if (!certificateData.medicalRecord) {
      setErrMsg(prev => ({ ...prev, medicalRecord: "증명서 종류 선택은 필수 입니다." }));
    }
    //신청목적
    if (!certificateData.purpose) {
      setErrMsg(prev => ({ ...prev, purpose: "신청 목적은 필수입니다." }));
    }
  };

  // 전송
  const goCertificate = async (e) => {
    e.preventDefault();
    //유효성 체크
    validate();
    //정보담기
    const certificateFormData = {
      userNo: userInfo.userNo,
      doctorNo: certificateData.medicalDoctorNo,
      certificateType: certificateData.certificateType,
      purpose: certificateData.purpose,
      referenceId: certificateData.medicalRecord,
      status: 0
    };

    try {
      const result = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(certificateFormData)
      });
      if (result.ok) {
        // 게시글 등록 성공 시
        setModalMessage("증명서 발급 신청이 완료되었습니다..");
        setModalButtonText("증명서 신청 내역 페이지로 이동");
        setAlertModalOpen(true);
        setIsSuccess(true);
        setRedirectPath("/main/applicationHistory");
      } else {
        // 에러 처리
        const errorText = await result.text();
        console.log(`증명서 발급 신청에 실패했습니다.  ${errorText}`);
        alert(`증명서 발급 신청에 실패했습니다.  ${errorText}`);
      }
    } catch (error) {
      console.error("Error registering board:", error);
      alert("증명서 발급 신청 중 오류가 발생했습니다.");
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
              <h2 className="text-lg font-bold text-blue-500 mb-4">증명서 발급</h2>
              <ul className="list-disc pl-5">
                <li className="mb-2">
                  메디곰 <span className="text-red-500 font-bold">회원 전용 메뉴</span>입니다.
                </li>
                <li className="mb-2">
                  저희 메디곰에서는 환자의 편의를 도모하기 위해 진단서, 의사소견서, 입퇴원 확인서 등 (재)발급 서비스를 실시하고 있습니다.
                </li>
                <li className="mb-2 font-bold">
                  새로운 전산시스템 가동으로 발급서비스가 일부 불안정 할 수 있으니 이 점 양해 부탁드립니다.
                </li>
                <li className="mb-2 mt-4 text-sky-700">
                  증명서 발급 신청 절차
                </li>
              </ul>
              {/* 순서 목록을 위한 div */}
              <div className="flex space-x-4 mt-2 ">
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.01
                  </div>
                  <div className="mx-2 text-center mt-2">증명서 종류 선택</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.02
                  </div>
                  <div className="mx-2 text-center mt-2">희망하는 진료내역 선택</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.03
                  </div>
                  <div className="mx-2 text-center mt-2">담당의사 작성</div>
                </div>
                <div className="flex flex-col items-center border rounded-[10px] flex-1  min-w-[120px]">
                  <div className="w-full font-bold text-lg mb-2 bg-sky-100 text-center py-2 rounded-t-[10px]">STEP.04
                  </div>
                  <div className="mx-2 text-center my-2">마이페이지에서 승인 여부 확인</div>
                </div>
              </div>
            </div>
            {/* 예약 정보 입력 칸*/}
            <div className="w-full p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-blue-500 mb-6">증명서 발급 신청</h2>
              <form className="space-y-4">
                <div className="mb-2 flex flex-col space-y-7">
                  <div>
                    <label htmlFor="certificateType" className="block mb-1 font-bold">증명서 종류 선택</label>
                    <select name="certificateType" onChange={handleInputValue}
                            className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">발급 희망하는 증명서 종류를 선택하세요.</option>
                      <option value="1">진단서</option>
                      <option value="2">의사소견서</option>
                      <option value="3">입퇴원확인서</option>

                    </select>
                    {errMsg.certificateType && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.certificateType}
                    </p>)}
                  </div>
                  <div>
                    <label htmlFor="medicalRecord" className="block mb-1 font-bold">진료 내역 선택</label>
                    <select name="medicalRecord" onChange={handleInputValue}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled={!certificateData.certificateType}
                    >
                      <option value=""> 발급 희망하는 {certificateData.certificateType === "3" ? "입원" : "진료"} 내역을 선택하세요.
                      </option>

                      {certificateData.certificateType === "3" && hospitalization.length > 0 ?
                        hospitalization.map((item, index) => (
                          <option key={index} value={item.hospitalizationId}>
                            진단명 : {item.diseaseName} | 진료과 : {item.departmentName} | 입원일
                            : {format(item.startDate, "yyyy-MM-dd") || "대기중"}
                          </option>
                        ))
                        : certificateData.certificateType === "3" ? (
                          <option disabled>입원내역이 없습니다.</option>
                        ) : null}

                      {certificateData.certificateType !== "3" && medicalRecords.length > 0 ?
                        medicalRecords.map((item, index) => (
                          <option key={index} value={item.recordId}>
                            진단명 : {item.diagnosis} | 진료과 : {item.departmentName} | 방문일
                            : {format(item.createAt, "yyyy-MM-dd")}
                          </option>
                        ))
                        : certificateData.certificateType !== "3" ? (
                          <option disabled>진료내역이 없습니다.</option>
                        ) : null}
                    </select>
                    {errMsg.medicalRecord && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.medicalRecord}
                    </p>)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col w-1/2 ">
                        <label htmlFor="medicalDepartment" className="block mb-1 font-bold">진료과</label>
                        <input
                          type="text"
                          id="medicalDepartment"
                          name="medicalDepartment"
                          value={certificateData.medicalDepartment}
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="진료내역을 선태하면 자동으로 입력됩니다."
                          onChange={handleInputValue}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col w-1/2">
                        <label htmlFor="medicalDoctor" className="block mb-1 font-bold">담당의</label>
                        <div className="flex items-center space-x-1 w-full">
                          <input
                            type="text"
                            id="medicalDoctor"
                            value={certificateData.medicalDoctor}
                            name="medicalDoctor"
                            placeholder="진료내역을 선태하면 자동으로 입력됩니다."
                            className="w-full p-2 border border-gray-300 rounded"
                            onChange={handleInputValue}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="purpose" className="block mb-1 font-bold">신청 목적</label>
                    <textarea
                      value={certificateData.purpose}
                      name="purpose"
                      rows="3"
                      placeholder="예) 학교 제출용, 학원 제출용, 보험 청구용"
                      className="w-full border border-gray-300 p-2 rounded-md h-[100px]"
                      onChange={handleInputValue}
                      disabled={!certificateData.certificateType || !certificateData.medicalRecord}
                    />
                    {errMsg.purpose && (<p className="text-red-500 text-sm mt-1">
                      {errMsg.purpose}
                    </p>)}
                  </div>
                  <div className="flex justify-end">
                    {userInfo ? (
                      <button
                        type="submit"
                        onClick={goCertificate}
                        className="px-4 py-2 border rounded-md bg-white text-blue-500 hover:bg-sky-200 hover:font-bold">
                        신청하기
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
export default UserCertificate;
