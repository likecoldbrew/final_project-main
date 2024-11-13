import React, { useEffect, useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
import { light } from "@mui/material/styles/createPalette";
import axios from "axios";
import Skeleton from "react-loading-skeleton";

//환자관리->환자진료등록->의료기록변경 모달창
export default function ChangeMedicalRecord({
                                              selectedPatientInfo,
                                              onClose
                                            }) {



  const [loading, setLoading] = useState(true);
  const [diagnosisInfo, setDiagnosisInfo] = useState();
  const fetchDiagnosisInfo = async (recordId) => {
    try {
      const response = await axios.get(`/api/medical_record/patientPrescription/${recordId}`);
      if (response.status === 200) {
        setDiagnosisInfo(response.data); // 데이터 상태로 설정
      } else {
        throw new Error("처방 내역 API 응답 실패");
      }
    } catch (error) {
      console.error("Error fetching patient prescription:", error);
    }
  };

  const [prescriptionInfo, setPrescriptionInfo] = useState();
  const fetchPrescriptionInfo = async (recordId) => {
    try {
      const response = await axios.get(`/api/prescription/patientPrescription/${recordId}`);
      if (response.status === 200) {
        setPrescriptionInfo(response.data);  // ChangeMedicalRecord로 전달할 상태 업데이트
      } else {
        throw new Error("처방전 API 응답 실패");
      }
    } catch (error) {
      console.error("Error fetching prescription data:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("button1");

  const handleChangeDiagnosis = (e) => {
    const { name, value } = e.target;
    setDiagnosisInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePrescription = (e) => {
    const { name, value } = e.target;
    setPrescriptionInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

//put 추가
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    // console.log({
    //   diagnosis: diagnosisInfo,
    //   prescription: prescriptionInfo
    // });

    try {
      // 의료 기록 업데이트
      const medicalRecordResponse = await fetch(`/api/medical_record/updateMedicalRecord/${selectedPatientInfo.recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctorNo: diagnosisInfo.doctorNo,
          diagnosis: diagnosisInfo.diagnosis,
          treatment: diagnosisInfo.treatment,
          prescription: diagnosisInfo.prescription,
          notes: diagnosisInfo.notes
        })
      });

      if (!medicalRecordResponse.ok) {
        const errorResponse = await medicalRecordResponse.text(); // 서버의 응답 텍스트 가져오기
        throw new Error(`의료 기록 응답이 올바르지 않습니다: ${errorResponse}`);
      }

      const prescriptionData = {
        prescriptionId: prescriptionInfo.prescriptionId,
        medicalRecordId: diagnosisInfo.recordId,
        medicationName: prescriptionInfo.medicationName,
        dosage: prescriptionInfo.dosage,
        frequency: prescriptionInfo.frequency,
        duration: prescriptionInfo.duration,
        instructions: prescriptionInfo.instructions
      };


      // 처방 정보 업데이트
      const prescriptionResponse = await fetch(`/api/prescription/updatePrescription/${prescriptionInfo.prescriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(prescriptionData)

      });

      if (!prescriptionResponse.ok) {
        const errorResponse = await prescriptionResponse.text();
        console.error(`처방 기록 업데이트 오류 응답: ${errorResponse}`);
        throw new Error(`처방 기록 응답이 올바르지 않습니다: ${errorResponse}`);
      }

      // fetchDiagnosisInfo(selectedPatientInfo.recordId);
      // fetchPrescriptionInfo(prescriptionInfo.prescriptionId);

      onClose(); // 모달 닫기
    } catch (error) {
      console.error("Error updating records:", error);
      alert("진료 기록 또는 처방 업데이트 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (selectedPatientInfo) {
      fetchDiagnosisInfo(selectedPatientInfo.recordId);
      fetchPrescriptionInfo(selectedPatientInfo.recordId);
    }
  }, [selectedPatientInfo]);

  console.log(diagnosisInfo);
  console.log(prescriptionInfo);

  useEffect(() => {
    setLoading(!diagnosisInfo && !prescriptionInfo);
  }, [diagnosisInfo, prescriptionInfo]);

  return loading
    ? (
      <div className="font-sans">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">의료 기록</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="w-full border-b mb-4">
              <Skeleton height={30} />
            </div>
            <div className={"w-full space-y-4"}>
              <div>
                <Skeleton height={10} />
                <Skeleton height={20} />
              </div>
              <div>
                <Skeleton height={10} />
                <Skeleton height={20} />
              </div>
              <div>
                <Skeleton height={10} />
                <Skeleton height={20} />
              </div>
              <div>
                <Skeleton height={10} />
                <Skeleton height={20} />
              </div>
              <div>
                <Skeleton height={10} />
                <Skeleton height={20} />
              </div>
            </div>
            <div className="w-full justify-end space-x-4 mt-6">
              <Skeleton height={30} />
            </div>
          </div>
        </div>
      </div>
    )
    : (
      <div className="font-sans">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">의료 기록</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "button1"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("button1")}
              >
                진단 수정
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "button2"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("button2")}
              >
                약물 처방 수정
              </button>
            </div>
            {activeTab === "button1" ? (
              <form className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">환자명</label>
                    <input
                      type="text"
                      name="userName"
                      defaultValue={diagnosisInfo.userName}
                      className="w-full p-2 border rounded text-gray-500"
                      readOnly
                    />
                  </div>
                  <div className="hidden">
                    <label className="block mb-1">담당의</label>
                    <input
                      type="text"
                      name="doctorNo"
                      defaultValue={diagnosisInfo.doctorNo}
                      className="w-full p-2 border rounded"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">진단명</label>
                  <input
                    type="text"
                    name="diagnosis"
                    defaultValue={diagnosisInfo.diagnosis}
                    onBlur={handleChangeDiagnosis}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">치료내용</label>
                  <input
                    type="text"
                    name="treatment"
                    defaultValue={diagnosisInfo.treatment}
                    onBlur={handleChangeDiagnosis}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">처방내용</label>
                  <input
                    type="text"
                    name="prescription"
                    defaultValue={diagnosisInfo.prescription}
                    onBlur={handleChangeDiagnosis}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">추가사항</label>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={diagnosisInfo.notes}
                    onBlur={handleChangeDiagnosis}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </form>) : (
              <form>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="hidden">
                      <label className="block mb-1">처방 내역 ID</label>
                      <input
                        type="text"
                        name="medicalRecordId"
                        defaultValue={prescriptionInfo.prescriptionId}
                        className="w-full p-2 border rounded text-gray-400"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1">환자 이름</label>
                      <input
                        type="text"
                        name="userName"
                        defaultValue={prescriptionInfo.userName}
                        className="w-full p-2 border rounded text-gray-400"
                        readOnly
                      />
                    </div>
                    <div className="hidden">
                      <label className="block mb-1">환자 ID</label>
                      <input
                        type="text"
                        name="userNo"
                        defaultValue={prescriptionInfo.userNo}
                        className="w-full p-2 border rounded text-gray-400"
                        readOnly
                      />
                    </div>
                    <div className="hidden">
                      <label className="block mb-1">약물 ID</label>
                      <input
                        type="text"
                        name="medicationName"
                        defaultValue={prescriptionInfo.medicalRecordId}
                        onBlur={handleChangePrescription}
                        className="w-full p-2 border rounded"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1">약물 이름</label>
                      <input
                        type="text"
                        name="medicationName"
                        defaultValue={prescriptionInfo.medicationName}
                        onBlur={handleChangePrescription}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">용량</label>
                      <input
                        type="text"
                        name="dosage"
                        defaultValue={prescriptionInfo.dosage}
                        onBlur={handleChangePrescription}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">복용 빈도</label>
                      <input
                        type="text"
                        name="frequency"
                        defaultValue={prescriptionInfo.frequency}
                        onBlur={handleChangePrescription}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">복용 기간</label>
                      <input
                        type="text"
                        name="duration"
                        defaultValue={prescriptionInfo.duration}
                        onBlur={handleChangePrescription}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">복용 지침</label>
                      <input
                        type="text"
                        name="instructions"
                        defaultValue={prescriptionInfo.instructions}
                        onBlur={handleChangePrescription}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}
