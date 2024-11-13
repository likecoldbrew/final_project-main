import React, { useState } from "react";
import { Search, BedDouble, UserPlus, LogOut, Calendar } from "lucide-react";

export default function HospitalListOrChange() {
  const [searchName, setSearchName] = useState("");
  const [patients, setPatients] = useState([
    { name: "홍길동", room: "5인실", admissionDate: "2024-09-13", status: "퇴원중" },
    { name: "김철수", room: "5인실", admissionDate: "2024-09-13", status: "입원중" }
  ]);
  const [expandedPatientIndex, setExpandedPatientIndex] = useState(null);

  const handleSearch = () => {
    console.log("Searching for:", searchName);
    // Implement search functionality here
  };

  const handleRoomStatus = () => {
    console.log("Checking room status");
    // Implement room status check here
  };

  const handleAdmission = () => {
    console.log("Processing admission request");
    // Implement admission request here
  };

  const handleDischarge = (name) => {
    console.log("Processing discharge for:", name);
    // Implement discharge request here
  };

  const handleExtendStay = (name) => {
    console.log("Extending stay for:", name);
    // Implement stay extension here
  };

  const toggleExpand = (index) => {
    setExpandedPatientIndex(expandedPatientIndex === index ? null : index);
  };

  return (
    <div className="font-sans max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="이름 검색"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            >
              <Search size={20} className="mr-2" />
              검색
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {patients.map((patient, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-2" onClick={() => toggleExpand(index)}
                   style={{ cursor: "pointer" }}>
                <span className="font-semibold">환자 이름: {patient.name}</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${patient.status === "입원중" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {patient.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>병실: {patient.room}</p>
                <p>입원기간: {patient.admissionDate} ~ 현재</p>
              </div>
              {expandedPatientIndex === index && (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleDischarge(patient.name)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-1" />
                    퇴원신청
                  </button>
                  <button
                    onClick={() => handleExtendStay(patient.name)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                  >
                    <Calendar size={16} className="mr-1" />
                    입원연장
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
