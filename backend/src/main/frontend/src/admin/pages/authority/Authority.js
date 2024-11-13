import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, BatteryFull } from 'lucide-react'

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return dateString;
  return format(new Date(dateString), 'yyyy-MM-dd　HH:mm');
};

export default function Authority() {
  const [list, setList] = useState([]); // 회원 목록

  const filterList = list.filter((item) => item.admin === 3); // 승인 대기 목록

  /* 조회 */
  const fetchAllUserList = async () => {
    try {
      const response = await fetch('/api/users/unauthorized');
      const data = await response.json();

      if (data && data.length > 0) {
        setList(data);
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  useEffect(() => {
    fetchAllUserList();
  }, []);

  // 권한 승인 핸들러
  const handleApproveClick = (doctorNo) => {
    const fetchAdminApprove = async () => {
      try {
        const response = await fetch(`/api/users/approve/${doctorNo}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: doctorNo,
        });

        if (response.ok) {
          alert('의사 권한 승인되었습니다.');
          fetchAllUserList();
        } else {
          alert('실패');
        }
      } catch (error) {
        console.error("Error fetching day off data:", error);
      }
    };

    fetchAdminApprove();
  }

  return (
    <>
      <div className="p-4 space-y-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2
            className="text-lg p-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white text-center">
            승인 대기 목록
          </h2>
          <table className="w-full">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">아이디</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료과</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">진료 분야
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">직급</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">가입일자</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">구분</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filterList.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-4 text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filterList.map((item) => (
                <tr key={item.userNo}>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.userId}
                    </span>
                  </td>
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
                      {item.treatments}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {item.phone}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span className={item.completed ? "line-through text-gray-500" : ""}>
                      {formatDate(item.createAt)}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex justify-center text-center whitespace-nowrap">
                    <button className="flex items-center px-2 py-1 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                            onClick={() => handleApproveClick(item.userNo)}>
                      <Check className="mr-2 h-4 w-4" />
                      의사 승인
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}