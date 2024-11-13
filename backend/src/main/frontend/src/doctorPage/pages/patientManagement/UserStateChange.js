import React, { useState, useEffect } from "react";
import { Search, UserPlus, Edit, X } from "lucide-react";

export const UserStateChange = ({
                                  patientInfo: initialPatientInfo,
                                  prescriptionInfo: initialPrescriptionInfo,
                                  onClose,
                                  onSave
                                }) => {
  const [activeTab, setActiveTab] = useState("button1");
  const [patientInfo, setPatientInfo] = useState({
    userName: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    doctorNo: "",
    certificateType: []
  });

  useEffect(() => {
    if (initialPatientInfo) {
      setPatientInfo({
        reserveId: initialPatientInfo.reserveId || "",
        userNo: initialPatientInfo.userNo || "",
        userName: initialPatientInfo.userName || "",
        diagnosis: initialPatientInfo.diagnosis || "",
        treatment: initialPatientInfo.treatment || "",
        prescription: initialPatientInfo.prescription || "",
        notes: initialPatientInfo.notes || "",
        doctorNo: initialPatientInfo.doctorNo || "",
        certificateType: []
      });
    }
  }, [initialPatientInfo]);

  const [prescriptionInfo, setPrescriptionInfo] = useState({
    userNo: "",
    userName: "",
    medicalRecordId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });

  useEffect(() => {
    if (initialPrescriptionInfo) {
      setPrescriptionInfo({
        medicalRecordId: initialPrescriptionInfo.recordId || "",
        userNo: initialPatientInfo.userNo || "",
        userName: initialPatientInfo.userName || "",
        doctorNo: initialPatientInfo.doctorNo || "",
        medicationName: initialPrescriptionInfo.medicationName || "",
        dosage: initialPrescriptionInfo.dosage || "",
        frequency: initialPrescriptionInfo.frequency || "",
        duration: initialPrescriptionInfo.duration || "",
        instructions: initialPrescriptionInfo.instructions || ""
      });
    }
  }, [initialPrescriptionInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputPrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecordSubmit = async () => {
    console.log(onSave);
    if (typeof onSave !== "function") {
      console.error("onSave is not a function");
      return;
    }

    const body = {
      medicalRecord: {
        userNo: patientInfo.userNo,
        doctorNo: patientInfo.doctorNo,
        diagnosis: patientInfo.diagnosis,
        treatment: patientInfo.treatment,
        prescription: patientInfo.prescription,
        notes: patientInfo.notes
      },
      prescription: {
        userNo: patientInfo.userNo, // 환자 사용자 번호 추가
        doctorNo: patientInfo.doctorNo, // 의사 번호 추가
        medicationName: prescriptionInfo.medicationName,
        dosage: prescriptionInfo.dosage,
        frequency: prescriptionInfo.frequency,
        duration: prescriptionInfo.duration,
        instructions: prescriptionInfo.instructions
      }
    };

    try {
      // 첫 번째 API 호출: 진료 기록 추가
      const response = await fetch("/api/medical_record/insertPatientMedicalRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      // 예약 상태 업데이트
      await fetch(`/api/medical_record/reserve/updateReserveStatus/${patientInfo.reserveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: 2 })
      });

      onSave(true);
      onClose();
    } catch (error) {
      console.error("Insert Failed:", error);
    }
  };

  return (
    <div className="font-sans">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">환자 정보 등록</h2>
            <button className="text-blue-500 hover:text-blue-700" onClick={onClose}>
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
              진단 등록
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "button2"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("button2")}
            >
              약물 처방 등록
            </button>
          </div>
          <main className="flex-1 p-5">
            {activeTab === "button1" ? (
              <form className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">환자명</label>
                    <input
                      type="text"
                      name="userName"
                      value={patientInfo.userName}
                      className="w-full p-2 border rounded"
                      readOnly
                    />
                  </div>
                  <div className="hidden">
                    <label className="block mb-1">담당 의사 번호</label>
                    <input
                      type="text"
                      name="doctorNo"
                      value={patientInfo.doctorNo}
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
                    value={patientInfo.diagnosis}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">치료내용</label>
                  <input
                    type="text"
                    name="treatment"
                    value={patientInfo.treatment}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">처방내용</label>
                  <input
                    type="text"
                    name="prescription"
                    value={patientInfo.prescription}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">추가사항</label>
                  <input
                    type="text"
                    name="notes"
                    value={patientInfo.notes}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">환자 이름</label>
                    <input
                      type="text"
                      value={prescriptionInfo.userName}
                      className="w-full p-2 border rounded"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-1">환자 ID</label>
                    <input
                      type="text"
                      value={prescriptionInfo.userNo}
                      className="w-full p-2 border rounded"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-1">담당 의사</label>
                    <input
                      type="text"
                      value={prescriptionInfo.doctorNo}
                      className="w-full p-2 border rounded"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-1">약물 이름</label>
                    <input
                      type="text"
                      name="medicationName"
                      value={prescriptionInfo.medicationName}
                      onChange={handleInputPrescriptionChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">용량</label>
                    <input
                      type="text"
                      name="dosage"
                      value={prescriptionInfo.dosage}
                      onChange={handleInputPrescriptionChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">복용 빈도</label>
                    <input
                      type="text"
                      name="frequency"
                      value={prescriptionInfo.frequency}
                      onChange={handleInputPrescriptionChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">복용 기간</label>
                    <input
                      type="text"
                      name="duration"
                      value={prescriptionInfo.duration}
                      onChange={handleInputPrescriptionChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">복용 지침</label>
                    <input
                      type="text"
                      name="instructions"
                      value={prescriptionInfo.instructions}
                      onChange={handleInputPrescriptionChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
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
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleRecordSubmit}
              >
                등록
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default UserStateChange;