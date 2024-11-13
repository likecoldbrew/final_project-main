import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Modal from "react-modal";
import ChangeMedicalRecord from "./ChangeMedicalRecord";
import { useParams } from "react-router-dom";

Modal.setAppElement("#root");

const UserReservationCheck = () => {
  const { doctorNo } = useParams();
  const no = parseInt(doctorNo);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUserReserve = async () => {
      if (isNaN(no)) {
        console.error("Invalid doctorNo:", doctorNo);
        return;
      }

      setLoading(true); // 데이터 로딩 시작
      try {
        const response = await fetch(`/api/reserve/${no}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("데이터를 가져오는 중 오류가 발생했습니다."); // 오류 알림 추가
      } finally {
        setLoading(false); // 데이터 로딩 종료
      }
    };

    fetchUserReserve();
  }, [no]);

  useEffect(() => {
    const result = patients.filter((user) => user.status === 0);
    if (searchTerm) {
      setFilteredUsers(
        result.filter((user) =>
          Object.values(user).some((value) =>
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    } else {
      setFilteredUsers(result);
    }
  }, [searchTerm, patients]);

  const handleApprove = async (reserveId) => {
    if (!reserveId) {
      console.error("Invalid reserveId:", reserveId);
      return;
    }

    const confirmApprove = window.confirm("승인하시겠습니까?");
    if (!confirmApprove) {
      return;
    }

    try {
      const response = await fetch(`/api/reserve/${reserveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: 1 })
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error updating status:", errorMessage);
      } else {
        setPatients((prevPatients) =>
          prevPatients.map((user) =>
            user.reserveId === reserveId ? { ...user, status: 1 } : user
          )
        );
      }
    } catch (error) {
      console.error("Error sending approval request:", error);
    }
  };

  if (loading) {
    return <div className="text-center">로딩 중...</div>; // 로딩 상태 표시
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">내 예약환자 확인</h1>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 pl-10 pr-4 rounded-md bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">환자이름</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">승인상태</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">환자증상</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">요청상태</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <tr key={user.reserveId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{user.userName}</td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{user.status === 0 ? "대기중" : "승인완료"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{user.symptom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => handleApprove(user.reserveId)}
                    className="bg-violet-400 hover:bg-violet-500  text-sm  text-white font-bold py-2 px-4 rounded"
                  >
                    승인
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-xs font-medium text-center text-gray-500">예약 환자가 없습니다.</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserReservationCheck;
