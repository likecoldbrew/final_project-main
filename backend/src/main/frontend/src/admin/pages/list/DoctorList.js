import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Filter, Grid, List, Loader, Mail, Phone, Search } from "lucide-react";
import { Camera, CancelPresentation } from "@mui/icons-material";
import Pagination from "../../components/Pagination";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isGridView, setIsGridView] = useState(true);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false); // 전화 모달 상태
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [profileImgs, setProfileImgs] = useState({});

  // 페이지
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isGridView ? 12 : 10;

  // 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 해당하는 데이터 추출
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  // API 호출
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users/doctors"); // Spring Boot 서버에서 데이터 가져오기
        const data = await response.json();
        setDoctors(data); // 상태 업데이트
        data.forEach((doctor) => {
          fetchProfile(doctor.userNo);
        });
        setFilteredDoctors(data); // 필터링된 목록 초기화
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = [...doctors];

    if (searchTerm) {
      result = result.filter((doctor) =>
        Object.values(doctor).some((value) => {
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
        (doctor) => doctor.status.toLowerCase() === statusFilter.toLowerCase()
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

    setFilteredDoctors(result);
  }, [searchTerm, statusFilter, doctors, sortColumn, sortDirection]);

  // 프로필 이미지 호출
  const fetchProfile = async (userNo) => {
    try {
      const response = await fetch(`/api/profile/${userNo}`);
      if (response.ok) {
        const profileData = await response.json();
        setProfileImgs((prevImgs) => ({
          ...prevImgs,
          [userNo]: profileData.filePath // 의사별 프로필 이미지 저장
        }));
      } else {
        console.error(`Failed to fetch profile image for userNo: ${userNo}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // 이메일 모달
  const openEmailModal = (e, value) => {
    const { clientX, clientY } = e; // 클릭된 위치를 가져옵니다.
    // 클릭된 위치에 여유를 두고 모달 위치 설정
    setModalPosition({
      top: clientY + 10 + window.scrollY,  // 스크롤 위치도 반영
      left: clientX + 10 + window.scrollX // 스크롤 위치도 반영
    });
    setIsEmailOpen(true); // 이메일 모달을 열기 위해 상태를 변경합니다.
    setIsPhoneOpen(false);
    setSelectedDoctor(value); // 선택된 의사 데이터 저장
  };

  // 전화번호 모달
  const openPhoneModal = (e, value) => {
    const { clientX, clientY } = e; // 클릭된 위치를 가져옵니다.
    // 클릭된 위치에 여유를 두고 모달 위치 설정
    setModalPosition({
      top: clientY + 10 + window.scrollY,  // 스크롤 위치도 반영
      left: clientX + 10 + window.scrollX // 스크롤 위치도 반영
    });
    setIsPhoneOpen(true); // 전화 모달을 열기 위해 상태를 변경합니다.
    setIsEmailOpen(false);
    setSelectedDoctor(value); // 선택된 의사 데이터 저장
  };

  const closeModal = () => {
    setIsEmailOpen(false);
    setIsPhoneOpen(false); // 모달을 닫습니다.
    setSelectedDoctor(null); // 모달을 닫을 때 선택 데이터 초기화
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
          <div className="flex items-center space-x-2">
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
            <button
              onClick={() => setIsGridView(true)}
              className={`p-2.5 rounded m-0 ${isGridView ? "bg-cyan-50 dark:bg-gray-700 border" : ""}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setIsGridView(false)}
              className={`p-2.5 rounded m-0 ${!isGridView ? "bg-cyan-50 dark:bg-gray-700 border" : ""}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {isGridView ? (
          <>
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((doctor) => (
                <li
                  key={doctor.userId}
                  className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white dark:bg-gray-800 text-center shadow"
                >
                  <div className="flex flex-1 flex-col p-8">
                    {profileImgs[doctor.userNo] ? (
                      <img
                        src={profileImgs[doctor.userNo]} // 프로필 이미지
                        alt={`${doctor.userName}'s profile`}
                        className="mx-auto h-32 w-32 rounded-full object-cover border"
                      />
                    ) : (
                      <Camera className="mx-auto h-32 w-32 rounded-full object-cover border" /> // 이미지가 없을 때 Camera 아이콘
                    )}
                    <dl className="mt-1 flex grow flex-col justify-between">
                      <dt className="sr-only">Name</dt>
                      <dd className="mt-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            doctor.status === "N"
                              ? "bg-green-50 text-green-700 ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-red-600/20"
                          }`}>
                        <Link to={`/admin/users/${doctor.userNo}/${doctor.admin}`}>
                          {doctor.userName}
                        </Link>
                      </span>
                      </dd>
                      <dt className="sr-only">Rank</dt>
                      <dd className="mt-3">
                        {doctor.departmentName}
                        <span
                          className="ml-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">{doctor.rank}</span>
                      </dd>
                    </dl>
                  </div>
                  <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-600">
                    <div className="flex w-0 flex-1">
                      <button
                        onClick={(e) => openEmailModal(e, doctor)}
                        className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg py-4 text-sm font-semibold text-gray-900 dark:text-gray-300"
                      >
                        <Mail aria-hidden="true" className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Email
                      </button>
                    </div>
                    <div className="-ml-px flex w-0 flex-1">
                      <button
                        onClick={(e) => openPhoneModal(e, doctor)}
                        className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg py-4 text-sm font-semibold text-gray-900 dark:text-gray-300"
                      >
                        <Phone aria-hidden="true" className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Call
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div>
              {/* 이메일 모달 */}
              {isEmailOpen && selectedDoctor && (
                <div
                  className="absolute bg-opacity-75 flex justify-center items-center z-50"
                  style={{
                    top: `${modalPosition.top}px`,
                    left: `${modalPosition.left}px`
                  }}
                >
                  <div className="flex justify-between items-center border bg-white p-8 rounded-lg shadow-lg w-80">
                    {selectedDoctor.email}
                    <button
                      className="text-yellow-400 rounded-md"
                      onClick={closeModal}
                    >
                      <CancelPresentation />
                    </button>
                  </div>
                </div>
              )}

              {/* 전화 모달 */}
              {isPhoneOpen && selectedDoctor && (
                <div
                  className="absolute bg-opacity-75 flex justify-center items-center z-50"
                  style={{
                    top: `${modalPosition.top}px`,
                    left: `${modalPosition.left}px`
                  }}
                >
                  <div className="flex justify-between items-center border bg-white p-8 rounded-lg shadow-lg w-80">
                    {selectedDoctor.phone}
                    <button
                      className="text-rose-400 rounded-md"
                      onClick={closeModal}
                    >
                      <CancelPresentation />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
          // 그리드 뷰
        ) : (
          // 리스트 뷰
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
                  onClick={() => handleSort("departmentName")}
                >
                  진료과{" "}
                  {sortColumn === "departmentName" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={14} className="inline" />
                    ) : (
                      <ChevronDown size={14} className="inline" />
                    ))}
                </th>
              </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((doctor) => (
                <tr key={doctor.userNo}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="text-sm font-medium">
                        {doctor.userNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {doctor.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex  text-xs leading-5 font-semibold rounded-full ${
                          doctor.status === "N"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <Link to={`/admin/users/${doctor.userNo}/${doctor.admin}`}>
                          {doctor.userName}
                        </Link>
                        {/* 링크로 감싸기 */}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {doctor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {doctor.departmentName}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {currentItems.length === 0 ? null : (
          <div>
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredDoctors.length}
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
export default DoctorList;
