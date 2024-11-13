import React, { useState } from "react";
import { Search, BedDouble, UserPlus, LogOut, Calendar } from "lucide-react";

const HospitalApplication = () => {
  const [searchName, setSearchName] = useState("");
  const [patients, setPatients] = useState([
    { name: "홍길동", room: "5인실", admissionDate: "2024-09-13", status: "퇴원중" },
    { name: "김철수", room: "5인실", admissionDate: "2024-09-13", status: "입원중" }
  ]);

  const handleSearch = () => {
    console.log("Searching for:", searchName);
    // In a real application, you would implement the search functionality here
  };

  const handleRoomStatus = () => {
    console.log("Checking room status");
    // In a real application, you would implement the room status check here
  };

  const handleAdmission = (name) => {
    console.log("Processing admission request for:", name);
    // Implement admission request here
  };

  const handleDischarge = (name) => {
    console.log("Processing discharge for:", name);
    // In a real application, you would implement the discharge request here
  };

  const handleExtendStay = (name) => {
    console.log("Extending stay for:", name);
    // In a real application, you would implement the stay extension here
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
            <button
              onClick={handleRoomStatus}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
            >
              <BedDouble size={20} className="mr-2" />
              병실 현황
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {patients.map((patient, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">환자 이름: {patient.name}</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    patient.status === "입원중" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>병실: {patient.room}</p>
                <p>입원기간: {patient.admissionDate} ~ 현재</p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleAdmission(patient.name)}
                  className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 flex items-center"
                >
                  <UserPlus size={16} className="mr-1" />
                  입원신청
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalApplication;