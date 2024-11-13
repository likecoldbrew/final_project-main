import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, BedDouble, Loader } from "lucide-react";
import Room from "./Room";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return dateString;
  return format(new Date(dateString), "yyyy/MM/dd");
};


export default function Hospitalization() {
  const { doctorNo } = useParams();
  const id = parseInt(doctorNo);
  const [list, setList] = useState([]); // 입원 목록
  const pendingList = list.filter((item) => item.status === 1); // 승인 대기 목록
  const hospitalizedList = list.filter((item) => item.status === 2); // 현재 입원 중인 환자 목록
  const dischargedList = list.filter((item) => item.status === 3); // 퇴원 환자 목록
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 오픈 여부
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  /* 조회(입원중) */
  const fetchHospitalizationList = async () => {
    try {
      setLoading(true);  // 로딩 시작
      const response = await fetch(`/api/hospitalization/doctor/${id}`);
      const data = await response.json();

      if (data && data.length > 0) {
        setList(data);
      }
      console.log(data);
    } catch (error) {
      console.error("Error fetching day off data:", error);
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  useEffect(() => {
    fetchHospitalizationList();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center text-gray-400"><Loader size={50} /></div>
      </div>
    );
  }

  return (
    <>
      <div className="font-sans w-full mx-auto p-6">
        <div className="flex justify-start items-center mb-4">
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
          >
            내 환자 병실 위치
          </button>
          {isModalOpen && <Room isOpen={isModalOpen} closeModal={closeModal} currentItem={hospitalizedList} />}
        </div>
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="space-y-8">
            {/*승인 대기중*/}
            <h2>환자 입원 승인요청 대기 중</h2>
            <div className="bg-white border rounded-lg overflow-hidden" style={{ marginTop: "6px" }}>
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">구분
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
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.diseaseName}</td>
                      <td className="px-6 py-3 flex justify-center text-center whitespace-nowrap">
                          <span
                            className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 cursor-pointer"
                          >
                            승인대기 중
                          </span>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomType}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.seatNo}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.floor}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.dueDate)}</td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>

            {/* 현재 입원 중인 환자 목록*/}
            <h2>입원 중인 환자</h2>
            <div className="bg-white border rounded-lg overflow-hidden" style={{ marginTop: "6px" }}>
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    구분
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
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.userName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.departmentName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.diseaseName}</td>
                      <td className="px-6 py-3 flex justify-center text-center whitespace-nowrap">
                          <span
                            className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 cursor-pointer"
                          >
                            입원중
                          </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.roomType}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.roomName}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.seatNo}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{item.floor}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{formatDate(item.dueDate)}</td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>

            {/*퇴원 환자*/}
            <h2>퇴원한 내 환자</h2>
            <div className="bg-white border rounded-lg overflow-hidden" style={{ marginTop: "6px" }}>
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">환자명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">병명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">구분
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
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.userName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.departmentName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.diseaseName}</td>
                      <td className="px-6 py-3 flex justify-center text-center whitespace-nowrap">
                          <span
                            className="px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 cursor-pointer"
                          >
                            퇴원
                          </span>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomType}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.roomName}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.seatNo}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{item.floor}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">{formatDate(item.dueDate)}</td>
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