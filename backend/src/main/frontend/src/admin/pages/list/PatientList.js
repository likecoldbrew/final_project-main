import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Filter, Loader, Search } from "lucide-react";
import Pagination from "../../components/Pagination";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  // 페이지
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 10개의 항목 표시

  // 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 해당하는 데이터 추출
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // API 호출
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users/patients"); // Spring Boot 서버에서 데이터 가져오기
        const data = await response.json();
        setPatients(data); // 상태 업데이트
        setFilteredPatients(data); // 필터링된 목록 초기화
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    let result = [...patients];

    if (searchTerm) {
      result = result.filter((patient) =>
        Object.values(patient).some((value) => {
          if (value !== null && value !== undefined) {
            return value
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter(
        (patient) =>
          patient.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortColumn] ?? "";
      const bValue = b[sortColumn] ?? "";

      // 모든 값들을 문자열로 변환 후 정렬
      const aString = aValue.toString();
      const bString = bValue.toString();

      // localeCompare를 사용하여 한국어와 숫자 모두 정렬
      return sortDirection === "asc"
        ? aString.localeCompare(bString, "ko", { numeric: true })
        : bString.localeCompare(aString, "ko", { numeric: true });
    });

    setFilteredPatients(result);
  }, [searchTerm, statusFilter, patients, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
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

  return (
    <div>
      <div className="container mx-auto p-4">
        {/* 검색 및 필터 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full border px-4 py-2 pl-10 pr-4 rounded-md bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="px-4 py-2 bg-cyan-50 dark:bg-gray-700 rounded-md flex items-center border"
              >
                <Filter size={18} />
                <span className="ml-2">Filter</span>
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                  <div className="p-4">
                    <label className="block mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option>All Status</option>
                      <option value={"N"}>Active</option>
                      <option value={"Y"}>Disabled</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사용자 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border">
          <table className="w-full">
            <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("userNo")}
              >
                번호{" "}
                {sortColumn === "userNo" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={14} className="inline" />
                  ) : (
                    <ChevronDown size={14} className="inline" />
                  ))}
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("userId")}
              >
                아이디{" "}
                {sortColumn === "userId" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={14} className="inline" />
                  ) : (
                    <ChevronDown size={14} className="inline" />
                  ))}
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("userName")}
              >
                이름{" "}
                {sortColumn === "userName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={14} className="inline" />
                  ) : (
                    <ChevronDown size={14} className="inline" />
                  ))}
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("phone")}
              >
                전화번호{" "}
                {sortColumn === "phone" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={14} className="inline" />
                  ) : (
                    <ChevronDown size={14} className="inline" />
                  ))}
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                이메일{" "}
                {sortColumn === "email" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={14} className="inline" />
                  ) : (
                    <ChevronDown size={14} className="inline" />
                  ))}
              </th>
            </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.length === 0 ? ( // 데이터가 없을 경우 체크
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  값이 없습니다.
                </td>
              </tr>
            ) : (
              currentItems.map((patient) => (
                <tr key={patient.userNo}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="text-sm font-medium">
                        {patient.userNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {patient.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.status === "N"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <Link to={`/admin/users/${patient.userNo}/${patient.admin}`}>
                          {patient.userName}
                        </Link>
                      {/* 링크로 감싸기 */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {patient.email}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {currentItems.length === 0 ? null : (
          <div>
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredPatients.length}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          </div>
        )
        }
      </div>
    </div>
  );
};
export default PatientList;
