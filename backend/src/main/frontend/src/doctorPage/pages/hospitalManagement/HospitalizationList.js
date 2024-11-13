import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, BatteryFull } from "lucide-react";
import Room from "./Room";

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return dateString;
  return format(new Date(dateString), "yyyy/MM/dd");
};

export default function HospitalizationList() {
  const [list, setList] = useState([]); // 입원 목록

  const pendingList = list.filter((item) => item.status === 1); // 승인 대기 목록
  const hospitalizedList = list.filter((item) => item.status === 2); // 현재 입원 중인 환자 목록
  const dischargedList = list.filter((item) => item.status === 3); // 퇴원 환자 목록

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  /* 조회 */
  const fetchHospitalizationList = async () => {
    try {
      const response = await fetch("/api/hospitalization/all");
      const data = await response.json();

      if (data && data.length > 0) {
        setList(data);
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  useEffect(() => {
    fetchHospitalizationList();
  }, []);

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

  // 입원 승인 핸들러
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
          alert("퇴원으로 변경되었습니다.");
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
      <div className="p-4 space-y-8">
        <div>
          <button onClick={openModal}>모달 열기</button>
          {isModalOpen && <Room isOpen={isModalOpen} closeModal={closeModal} />}
        </div>


        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2
            className="text-lg p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center">
            현재 입원 중인 환자 목록
          </h2>
          <table className="w-full">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">의사명</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">방</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">호실명</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">자리번호</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">층</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">입원일</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">예정 퇴원일
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {hospitalizedList.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-4 text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              hospitalizedList.map((item) => (
                <tr key={item.hospitalizationId}>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.userName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.departmentName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.doctorName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.diseaseName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.roomType}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.roomName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.seatNo}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.floor}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {formatDate(item.startDate)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {formatDate(item.dueDate)}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/*<div className="bg-white shadow rounded-lg overflow-hidden">*/}
        {/*  <h2*/}
        {/*    className="text-lg p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white text-center">*/}
        {/*    퇴원 환자 목록*/}
        {/*  </h2>*/}
        {/*  <table className="w-full">*/}
        {/*    <thead className="bg-gray-50">*/}
        {/*    <tr>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">의사명</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">방</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">호실명</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">자리번호</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">층</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">입원일</th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">예정 퇴원일*/}
        {/*      </th>*/}
        {/*      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">퇴원일</th>*/}
        {/*    </tr>*/}
        {/*    </thead>*/}
        {/*    <tbody className="bg-white divide-y divide-gray-200">*/}
        {/*    {dischargedList.length === 0 ? (*/}
        {/*      <tr>*/}
        {/*        <td colSpan="12" className="text-center py-4 text-gray-500">*/}
        {/*          데이터가 없습니다.*/}
        {/*        </td>*/}
        {/*      </tr>*/}
        {/*    ) : (*/}
        {/*      dischargedList.map((item) => (*/}
        {/*        <tr key={item.hospitalizationId}>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.userName}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.departmentName}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.doctorName}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.diseaseName}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.roomType}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.roomName}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.seatNo}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {item.floor}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {formatDate(item.startDate)}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {formatDate(item.dueDate)}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*          <td className="px-6 py-4 text-center whitespace-nowrap">*/}
        {/*            <span className={item.completed ? "line-through text-gray-500" : ""}>*/}
        {/*              {formatDate(item.endDate)}*/}
        {/*            </span>*/}
        {/*          </td>*/}
        {/*        </tr>*/}
        {/*      )))}*/}
        {/*    </tbody>*/}
        {/*  </table>*/}
        {/*</div>*/}
      </div>
    </>
  );
}