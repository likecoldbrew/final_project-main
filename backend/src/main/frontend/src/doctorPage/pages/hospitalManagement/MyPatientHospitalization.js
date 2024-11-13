import React, { useEffect, useState } from "react";
import Room from "./Room";
import { Search, Loader } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MyPatientHospitalization = () => {
  const { doctorNo } = useParams();
  const id = parseInt(doctorNo);
  const [list, setList] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  const [searchTermMedical, setSearchTermMedical] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPatientIndex, setExpandedPatientIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // 방 정보
  const [room, setRoom] = useState({
    roomNo: 0,
    roomType: "",
    roomName: "",
    floor: ""
  });

  // 환자별 상태 관리
  const [openStates, setOpenStates] = useState({});
  const [selectedValues, setSelectedValues] = useState({});

  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫았을 때 방 정보 가져옴
  const closeModal = (param) => {
    setIsModalOpen(false);

    if (param) {
      setRoom({
        roomNo: param.roomNo,
        roomType: param.roomType,
        roomInfo: `${param.roomName} ${param.seatNo}번`,
        floor: param.floor
      });
    }
  };

  useEffect(() => {
    console.log("room", room);
  }, [room]);

  useEffect(() => {
    fetchHospitalizationList();
    fetchMedicalRecords();
  }, [id]);

  // 병실 전체 현황
  const fetchHospitalizationList = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hospitalization/all");
      const data = await response.json();

      setList(data);
    } catch (error) {
      console.error("Error fetching day off data:", error);
    } finally {
      setLoading(false);
    }
  };

  //환자 진료 기록
  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get(`/api/medical_record/${id}`);
      setMedicalRecords(response.data);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    }
  };

  useEffect(() => {
    const filteredRecords = medicalRecords.filter(record => record.treatment);
    const result = filteredRecords.filter(record =>
      record.userName.toLowerCase().includes(searchTermMedical.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTermMedical.toLowerCase()) ||
      record.prescription.toLowerCase().includes(searchTermMedical.toLowerCase())
    );
    setFilteredMedicalRecords(result);
  }, [medicalRecords, searchTermMedical]);

  //입퇴원날짜
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  //Hospitalization으로 값 전달
  const handleApprovalSubmit = async (record, roomNo) => {

    try {
      const response = await fetch("/api/hospitalization/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          {
            roomNo: roomNo,
            userNo: record.userNo,
            doctorNo: record.doctorNo,
            departmentNo: record.departmentNo,
            diseaseName: record.diagnosis,
            startDate: startDate,
            dueDate: dueDate
          })
      });
      if (!response.ok) {
        // 서버가 정상 응답을 반환하지 않은 경우
        const errorMessage = await response.text();
        throw new Error(`서버 오류: ${errorMessage}`);
      }
      const result = await response.json(); // 서버로부터 받은 응답 처리

      // 등록된 환자를 리스트에서 제거
      setFilteredMedicalRecords(prevRecords =>
        prevRecords.filter(item => item.recordId !== record.recordId)
      );

    } catch (error) {
      console.error("Insert Failed:", error);
    }
  };


  const toggleDropdown = (patientId, index) => {
    setOpenStates(prevStates => ({
      ...prevStates,
      [patientId]: prevStates[patientId] === index ? null : index
    }));
  };

  const handleSelect = (patientId, index, value) => {
    setSelectedValues(prevValues => ({
      ...prevValues,
      [patientId]: {
        ...prevValues[patientId],
        [index]: value
      }
    }));
    toggleDropdown(patientId, index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader size={50} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="font-sans max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTermMedical}
              onChange={(e) => setSearchTermMedical(e.target.value)}
              placeholder="이름 검색"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
          >
            전체 병실 현황
          </button>
          {isModalOpen &&
            <Room isOpen={isModalOpen} closeModal={closeModal} currentItem={list.filter(item => item.status === 2)} />}
        </div>

        <div className="space-y-4">
          {filteredMedicalRecords.length === 0 || filteredMedicalRecords.filter((patient) => !list.some((item) => item.userNo === patient.userNo)).length === 0 ? (
            <div className="text-center py-4 text-gray-500">입원 신청한 환자가 없습니다.</div>
          ) : (
            filteredMedicalRecords
              .filter((patient) => !list.some((item) => item.userNo === patient.userNo)) // 등록된 환자는 필터링
              .map((patient) => (
                <div key={patient.recordId} className="border border-gray-200 rounded-md p-4">
                  <div
                    className="flex justify-between items-center mb-2"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setExpandedPatientIndex(expandedPatientIndex === patient.recordId ? null : patient.recordId)
                    }
                  >
                    <span className="font-semibold">환자 이름: {patient.userName}</span>
                    <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">입원 신청</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>증상: {patient.diagnosis}</p>
                    <p>치료: {patient.treatment}</p>
                  </div>
                  {expandedPatientIndex === patient.recordId && (
                    <div className="p-5">
                      <div className="flex items-center gap-3 ">
                        <h2 className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 whitespace-nowrap">병실 선택</h2>
                        <div className="flex w-full">
                          <input
                            type="text"
                            name="roomType"
                            value={room.roomType}
                            readOnly={true}
                            className="border rounded-md w-full mr-2 text-center bg-transparent"
                          />
                          <input
                            type="text"
                            name="roomName"
                            value={room.roomInfo}
                            readOnly={true}
                            className="border rounded-md w-full mr-2 text-center bg-transparent"
                          />
                          <input
                            type="text"
                            name="floor"
                            value={room.floor}
                            readOnly={true}
                            className="border rounded-md w-full mr-2 text-center bg-transparent"
                          />
                          <input
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="border rounded-md w-full mr-2 text-center bg-transparent"
                          />
                          <input
                            type="date"
                            name="dueDate"
                            value={dueDate}
                            onChange={handleDueDateChange}
                            className="border rounded-md w-full mr-2 text-center bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end whitespace-nowrap mt-3">
                        <button
                          onClick={() => handleApprovalSubmit(patient, room.roomNo)}
                          className="text-sm bg-amber-200 text-amber-700 hover:bg-amber-300 hover:text-white p-3 rounded-md mb-1 mr-2"
                        >
                          승인요청
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPatientHospitalization;
