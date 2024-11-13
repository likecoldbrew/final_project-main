import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { BedDouble, Check, Loader } from "lucide-react";
import Room from "./Room";

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return dateString;
  return format(new Date(dateString), "yyyy/MM/dd");
};

export default function Hospitalization() {
  const [list, setList] = useState([]); // 입원 목록
  const pendingList = list.filter((item) => item.status === 1); // 승인 대기 목록
  const hospitalizedList = list.filter((item) => item.status === 2); // 현재 입원 중인 환자 목록
  const dischargedList = list.filter((item) => item.status === 3); // 퇴원 환자 목록
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 오픈 여부
  const [approvalModeRow, setApprovalModeRow] = useState(null);
  const [dischargeModeRow, setDischargeModeRow] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    fetchHospitalizationList();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center text-gray-400">
          <Loader className="animate-spin" size={50} />
        </div>
      </div>
    );
  }

  /* 조회 */
  const fetchHospitalizationList = async () => {
    try {
      setLoading(true);  // 로딩 시작
      const response = await fetch("/api/hospitalization/all");
      const data = await response.json();

      if (data && data.length > 0) {
        setList(data);
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  // 입원 승인 핸들러
  const handleApproveClick = (id) => {
    const fetchAdminApprove = async () => {
      try {
        const response = await fetch(`/api/hospitalization/approve/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: id
        });

        if (response.ok) {
          alert("승인되었습니다.");
          setApprovalModeRow(null); // Reset specific row mode
          fetchHospitalizationList();
        } else {
          alert("실패");
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchAdminApprove();
  };

  // 퇴원 승인 핸들러
  const handleDischargeClick = (id) => {
    const fetchAdminDischarge = async () => {
      try {
        const response = await fetch(`/api/hospitalization/discharge/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: id
        });

        if (response.ok) {
          alert("퇴원 처리되었습니다.");
          setDischargeModeRow(null); // Reset specific row mode
          fetchHospitalizationList();
        } else {
          alert("실패");
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }

    };
    fetchAdminDischarge();
  };


  return (
    <>
      <div className="font-sans w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            >
              <BedDouble size={20} className="mr-2" />
              병실 현황
            </button>
            {isModalOpen && <Room isOpen={isModalOpen} closeModal={closeModal} currentItem={hospitalizedList} />}
          </div>

          <div className="space-y-8">
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">의사명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">방
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">호실명
                  </th>
                  <th
                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">자리
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">층
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">입원일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">예정
                    퇴원일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">구분
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {pendingList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4 text-gray-500">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  pendingList.map((item) => (
                    <tr key={item.hospitalizationId}>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.userName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.departmentName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.doctorName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.diseaseName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomType}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.seatNo}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.floor}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.dueDate)}</td>
                      <td className="px-6 py-3 flex justify-center text-center whitespace-nowrap">
                        {approvalModeRow === item.hospitalizationId ? (
                          <button
                            className="flex items-center px-2 py-1 rounded-md text-white bg-yellow-400 hover:bg-yellow-500"
                            onClick={() => handleApproveClick(item.hospitalizationId)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            승인
                          </button>
                        ) : (
                          <span
                            className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 cursor-pointer"
                            onClick={() => setApprovalModeRow(item.hospitalizationId)} // Set specific row mode
                          >
                            승인 대기
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">의사명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">방
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">호실명
                  </th>
                  <th
                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">자리
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">층
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">입원일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">예정
                    퇴원일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">구분
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {hospitalizedList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4 text-gray-500">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  hospitalizedList.map((item) => (
                    <tr key={item.hospitalizationId}>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.userName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.departmentName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.doctorName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.diseaseName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomType}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.seatNo}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.floor}</td>
                      <td className="px-6 py-3  text-center whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.dueDate)}</td>
                      <td className="px-6 py-3 flex justify-center text-center whitespace-nowrap">
                        {dischargeModeRow === item.hospitalizationId ? (
                          <button
                            className="flex items-center px-2 py-1 rounded-md text-white bg-green-500 hover:bg-green-600"
                            onClick={() => handleDischargeClick(item.hospitalizationId)}
                          >
                            {/*<BatteryFull className="mr-2 h-4 w-4" />*/}
                            퇴원 처리
                          </button>
                        ) : (
                          <span
                            className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 cursor-pointer"
                            onClick={() => setDischargeModeRow(item.hospitalizationId)} // 클릭 시 상태 변경
                          >
                            입원 중
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">의사명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">방
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">호실명
                  </th>
                  <th
                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">자리
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">층
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">입원일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">예정
                    퇴원일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">퇴원일
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {dischargedList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4 text-gray-500">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  dischargedList.map((item) => (
                    <tr key={item.hospitalizationId}>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.userName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.departmentName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.doctorName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.diseaseName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.roomType}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.roomName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.seatNo}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.floor}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{formatDate(item.dueDate)}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{formatDate(item.endDate)}</td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}