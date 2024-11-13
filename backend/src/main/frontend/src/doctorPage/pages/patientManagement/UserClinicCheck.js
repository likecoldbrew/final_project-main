import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Modal from "react-modal";
import UserStateChange from "./UserStateChange";
import ChangeMedicalRecord from "./ChangeMedicalRecord";
import { useParams } from "react-router-dom";
import axios from "axios";
import MyPatientHospitalization from "../hospitalManagement/MyPatientHospitalization";

Modal.setAppElement("#root");

const UserClinicCheck = () => {
  const { doctorNo } = useParams();
  const id = parseInt(doctorNo);
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptionUpdate, setPrescriptionUpdate] = useState([]);
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  const [isUserStateChangeOpen, setIsUserStateChangeOpen] = useState(false);
  const [isChangMedicalRecordOpen, setIsChangeMedicalRecordOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTermDiagnosis, setSearchTermDiagnosis] = useState(""); // 진단 기록 검색어
  const [searchTermMedical, setSearchTermMedical] = useState(""); // 의료 기록 검색어
  const [searchTermPrescription, setSearchTermPrescription] = useState("");
  const [filteredReserve, setFilteredReserve] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [patientInfo, setPatientInfo] = useState([]);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const [prescriptionInfo, setPrescriptionInfo] = useState([]);

  useEffect(() => {
    const fetchReservePatientData = async () => {
      try {
        const userReserveResponse = await fetch(`/api/reserve/reserved_patient/${id}`);
        if (!userReserveResponse.ok) {
          throw new Error("예약 환자 API 응답 실패");
        }
        const userReserveData = await userReserveResponse.json();
        setPatients(userReserveData);
      } catch (error) {
        console.error("Error fetching reservation data:", error);
      }
    };
    fetchReservePatientData();
    setIsUpdated(false);
  }, [id, isUpdated]);

  useEffect(() => {
    const approvedPatients = patients.filter(patient => patient.status === 1);
    const result = approvedPatients.filter(patient =>
      patient.userName.toLowerCase().includes(searchTermDiagnosis.toLowerCase()) // 환자 이름으로 필터링
    );
    setFilteredReserve(result);
  }, [patients, searchTermDiagnosis]);


  const [selectedRecordId, setSelectedRecordId] = useState(null); // 선택된 기록 ID

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get(`/api/medical_record/${id}`);
      if (response.status === 200) {
        setMedicalRecords(response.data)
        ; // 모든 기록 저장
      } else {
        throw new Error("의료 기록 API 응답 실패");
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
    }
  };

// 초기 기록 로드
  useEffect(() => {
    fetchMedicalRecords();
  }, []);


  useEffect(() => {
    if (medicalRecords?.length > 0) {
      const filteredRecords = medicalRecords.filter(record => record.treatment);
      const result = filteredRecords.filter(record =>
        record.userName.toLowerCase().includes(searchTermMedical.toLowerCase()) || // 환자 이름으로 필터링
        record.diagnosis.toLowerCase().includes(searchTermMedical.toLowerCase()) || // 진단으로 필터링
        record.prescription.toLowerCase().includes(searchTermMedical.toLowerCase()) // 처방전으로 필터링
      );
      setFilteredMedicalRecords(result);
    }
  }, [medicalRecords, searchTermMedical]);

  const formatDate = (date) => {
    if (!date) {
      return "날짜 정보 없음"; // 날짜가 없을 경우 기본 메시지 반환
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "날짜 형식 오류"; // 잘못된 형식 처리
    }

    return dateObj.toLocaleDateString(); // 원하는 형식으로 날짜 포맷팅
  };

  const openUserStateChangeModal = (patient) => {
    setPatientInfo(patient);
    setPrescriptionInfo(patient);
    setIsUserStateChangeOpen(true);
  };

  const openChangeMedicalRecordModal = (record) => {
    setSelectedPatientInfo(record);
    setIsChangeMedicalRecordOpen(true);
  };

  const closeModal = () => {
    setIsUserStateChangeOpen(false);
    setIsChangeMedicalRecordOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-blue-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-0">
        <div className="flex flex-col md:flex-row justify-start items-center md:space-y-0 h-12">
          <h2 className="text-md font-bold px-6 py-4">진단 기록</h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 pl-10 pr-4 h-8 rounded-md bg-blue-50"
              value={searchTermDiagnosis}
              onChange={(e) => setSearchTermDiagnosis(e.target.value)}
            />
            <Search className="absolute left-3 top-2 text-gray-400" size={17} />
          </div>
        </div>
      </div>

      {/* 예약 승인된 환자 목록 진단 등록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-1.5">
        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">환자이름</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">환자증상</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">예약일자</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">진단등록</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
          {filteredReserve.length > 0 ? (
            filteredReserve.map((patient) => (
              <tr key={patient.reserveId}>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{filteredReserve.indexOf(patient) + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{patient.userName}</td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{patient.symptom ? patient.symptom : "증상 정보 없음"}</td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{formatDate(patient.reserveTime)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex-center items-center space-x-1">
                    <button
                      onClick={() => openUserStateChangeModal(patient)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      등록
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-xs font-medium text-center text-gray-500">예약된 환자가 없습니다.</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      {/* 의료 기록: treatment가 있는 데이터만 표시 */}
      <div className="bg-orange-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-8">
        <div className="flex flex-col md:flex-row justify-start items-center md:space-y-0 h-12">
          <h2 className="text-md font-bold px-6 py-4">의료 기록</h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 pl-10 pr-4 h-8 rounded-md bg-orange-50"
              value={searchTermMedical}
              onChange={(e) => setSearchTermMedical(e.target.value)}
            />
            <Search className="absolute left-3 top-2 text-gray-400" size={17} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mt-1.5">
        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">환자 이름</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">진단기록</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">처방전</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">진료일자</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">진단수정</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
          {filteredMedicalRecords.length > 0 ? (
            filteredMedicalRecords.map((record) => (
              <tr key={record.recordId}>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{filteredMedicalRecords.indexOf(record) + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.diagnosis}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.prescription}</td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{formatDate(record.updateAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => openChangeMedicalRecordModal(record)}
                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                  >
                    등록
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-xs font-medium text-center text-gray-500">의료 기록이 없습니다.</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      {/* Modal 컴포넌트 */}
      {/*{modalType === "userStateChange" && (*/}
      <Modal
        isOpen={isUserStateChangeOpen}
        onRequestClose={closeModal}
        className="inset-0 flex items-center justify-center z-50 "
        overlayClassName="fixed inset-0 bg-black bg-opacity-30"
        onSave={(updated) => {
          setIsUpdated(updated);
        }}
      >
        {isUserStateChangeOpen && (
          <UserStateChange patientInfo={patientInfo} prescriptionInfo={prescriptionInfo}
                           onClose={() => setIsUserStateChangeOpen(false)}// 모달 닫기 함수
                           onSave={(updated) => setIsUpdated(updated)} // 부모에서 전달한 onSave 함수
          />
        )}
      </Modal>

      <Modal
        isOpen={isChangMedicalRecordOpen}
        onRequestClose={closeModal}
        className="inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30"
      >
        {isChangMedicalRecordOpen && (
          <ChangeMedicalRecord
            selectedPatientInfo={selectedPatientInfo}
            onClose={() => setIsChangeMedicalRecordOpen(false)}
          />
        )}
      </Modal>

    </div>
  );
};

export default UserClinicCheck;


