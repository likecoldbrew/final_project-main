import React, { useState, useEffect } from "react";
import {
  X,
  Label,
  Input,
  Button,
  Filter,
  List,
  Grid,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  UserPlus
} from "lucide-react";
//여기서 등록 새로 파..selectCertificateByDoctorNo 이 쿼리 써서 새로 파.. userno 연결해
const Certificates = ({ userInfo: initialUserInfo, closeModal }) => {
  console.log(initialUserInfo);

  const [userInfo, setUserInfo] = useState({
    userName: "",
    diagnosis: "",
    content: "",
    note: "",
    purpose: "",
    doctorName: "",
    roomType: "",
    seatNo: "",
    diseaseName: "",
    startDate: "",
    dueDate: "",
    endDate: "",
    departmentName: "",
    certificateType: ""
  });

  useEffect(() => {
    if (initialUserInfo) {
      setUserInfo({
        userNo: initialUserInfo.userNo || "",
        userName: initialUserInfo.userName || "",
        diagnosis: initialUserInfo.diagnosis || "", // 여기서 userNo를 가져옵니다.
        content: initialUserInfo.content || "",
        note: initialUserInfo.note || "",
        purpose: initialUserInfo.purpose || "",
        doctorNo: initialUserInfo.doctorNo || "",
        doctorName: initialUserInfo.doctorName || "",
        roomType: initialUserInfo.roomType || "",
        seatNo: initialUserInfo.seatNo || "",
        diseaseName: initialUserInfo.diseaseName || "",
        startDate: initialUserInfo.startDate || "",
        dueDate: initialUserInfo.dueDate || "",
        endDate: initialUserInfo.endDate || "",
        departmentName: initialUserInfo.departmentName || "",
        certificateId: initialUserInfo.certificateId || "",
        certificateType: initialUserInfo.certificateType || ""
      });
    }
  }, [initialUserInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value
    }));
    console.log(handleInputChange);
  };

  const getCertificateTypeLabel = (type) => {
    switch (type) {
      case 1:
        return "진단서";
      case 2:
        return "소견서";
      case 3:
        return "입퇴원서";
      default:
        return "";
    }
  };

  console.log("환자정보 제대로 나오나 확인", userInfo);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지
    try {
      const response = await fetch(`/api/certificates/${userInfo.certificateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...userInfo,
          status: 1 // 상태를 1로 업데이트
        })
      });
      console.log("승인요청임", response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const text = await response.text(); // 텍스트로 응답 가져오기
      const data = text ? JSON.parse(text) : null; // 텍스트가 비어 있으면 null로 설정

      console.log("Update Success:", data);
      closeModal(); // 모달 닫기
    } catch (error) {
      console.error("Update Failed:", error);
    }
  };

  return (
    <div className="font-sans">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          {/* X 버튼 추가 */}
          <div className="flex justify-between items-center mb-4 ">
            <h2 className="text-xl font-bold">진단서 요청</h2>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                환자 성명
              </label>
              <input
                id="userName"
                type="text"
                name="userName"
                value={userInfo.userName}
                placeholder="환자명"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
            <div>
              <label
                htmlFor="certificateType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                증명서 종류
              </label>
              <input
                id="certificateType"
                type="text"
                name="certificateType"
                value={getCertificateTypeLabel(userInfo.certificateType)}
                placeholder="증명서 종류"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                readOnly
              >
              </input>
            </div>
            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                제출 기관
              </label>
              <input
                id="purpose"
                type="text"
                name="purpose"
                value={userInfo.purpose}
                placeholder="제출 기관"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                readOnly
              >
              </input>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 mb-6">
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                진단 내용
              </label>
              <textarea
                id="content"
                type="text"
                name="content"
                value={userInfo.content}
                onChange={handleInputChange}
                className="w-[850px] h-[100px] border rounded p-1 "
                placeholder="내용을 입력하세요."
              />
            </div>
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                추가 사항
              </label>
              <textarea
                id="note"
                type="text"
                name="note"
                value={userInfo.note}
                onChange={handleInputChange}
                className="w-[850px] h-[50px] border rounded p-1 "
                placeholder="내용을 입력하세요."
              />
            </div>
          </div>
          <div className="mb-6 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-700 mb-2">
              진단서 발급을 승인 하시겠습니까?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                취소
              </button>
              <button
                onClick={handleRegisterSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                승인
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Certificates;
