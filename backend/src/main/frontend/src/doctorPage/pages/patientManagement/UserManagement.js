import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";

const UserManagement = () => {
  const { userNo } = useParams(); // URL에서 userNo 가져오기
  const id = parseInt(userNo);

  const [allPatient, setAllPatient] = useState({
    users: {}, // users를 배열로 설정
    records: []
  });
  console.log(userNo);

  // API 호출
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [userResponse, recordResponse] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/medical_record/${id}`)
        ]);

        const userData = await userResponse.json();
        const recordData = await recordResponse.json();

        // console.log(userData);
        console.log(recordData);

        setAllPatient({
          users: userData || {}, // userData.user가 배열이라고 가정
          records: recordData.map((record) => ({
            ...record,
            createAt: format(new Date(record.createAt), "yyyy.MM.dd") // 진단일자 포맷팅
            // 진단일자 포맷팅
          }))
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchUsers();
  }, [id]);

  const { users, records } = allPatient;

  console.log(allPatient);


  const [filteredUsers, setFilteredUsers] = useState([]); // 필터링된 사용자를 저장하는 배열
  const [searchTerm, setSearchTerm] = useState("");

  //필터링 로직
  useEffect(() => {
    let result = [...records]; // users 배열을 기준으로 필터링

    if (searchTerm) {
      result = result.filter(record =>
        Object.values(record).some(value => {
          if (value !== null && value !== undefined) {
            return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );
    }
    setFilteredUsers(result); // 필터링된 결과 설정
  }, [searchTerm, allPatient]);


  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">환자 목록</h1>
      </div>
      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 pl-10 pr-4 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* 회원 전체 목록 리스트 뷰 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th
              className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">번호
            </th>
            <th
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">환자이름
            </th>
            <th
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">진료과
            </th>
            <th
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">담당의
            </th>
            <th
              className="px-12 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">진료내역
            </th>
            <th
              className="px-12 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">처방내역
            </th>
            <th
              className="px-12 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">약물처방내역
            </th>
          </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No users found.
              </td>
            </tr>
          ) : (filteredUsers.map((record, index) => (
              <tr key={record.recordId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.userName}</td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.departmentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{users.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.notes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.treatment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.prescription}</td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
