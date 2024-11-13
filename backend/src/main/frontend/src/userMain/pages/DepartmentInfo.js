import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import axios from "axios";
import debounce from "lodash.debounce";
import Modal from "../components/DepartmentModal"; // 모달 임포트

const DepartmentInfo = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const [department, setDepartment] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 추가
  const [selectedDepartment, setSelectedDepartment] = useState(null); // 선택된 부서 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가
  const icon = "🔍";

  // API 호출
  useEffect(() => {
    fetchDepartments();
  }, []);

  //의사 정보 호출 -> 여기서 진료과 진료분야 추출
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/allDepartment");
      const data = await response.json();
      console.log("들어오는거", data);
      setDepartment(data); // 응답 데이터 설정
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  // 검색 함수
  const handleSearch = async (searchValue) => {
    if (searchValue.trim() === "") {
      // 검색어가 비어있으면 전체 의사 목록을 다시 가져옵니다.
      fetchDepartments();
      return;
    }
    try {
      const response = await axios.get(
        `/api/doctorsInfo/department?departmentName=${encodeURIComponent(searchValue)}`
      );
      setDepartment(response.data);
    } catch (error) {
      console.error("Error searching doctor info:", error);
    }
  };

  // 디바운싱된 검색 함수
  const debouncedSearch = useCallback(
    debounce((value) => {
      handleSearch(value);
    }, 150), // 150ms 지연
    []
  );

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // 엔터 키 입력 핸들링
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      debouncedSearch.cancel(); // 디바운싱된 호출을 취소
      handleSearch(searchTerm); // 즉시 검색 수행
    }
  };

  // 부서 클릭 핸들러
  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept); // 클릭한 부서 설정
    setIsModalOpen(true); // 모달 열기
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="flex flex-col items-center justify-center mt-8">
        <div className="flex max-w-3xl w-full">
          <input
            type="text"
            className="form-input border rounded-l-md px-4 py-2 w-full"
            placeholder="찾고 싶은 진료과를 검색해보세요"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-sky-100 hover:bg-sky-200 text-white px-4 py-2 rounded-r-md"
            onClick={() => {
              debouncedSearch.cancel(); // 디바운싱된 호출을 취소
              handleSearch(searchTerm); // 즉시 검색 수행
            }}
            aria-label="진료과 검색"
          >
            {icon}
          </button>
        </div>
      </div>
      <div className=" container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {department.length > 0 ? (
              department.map((dept, index) => (
                <div
                  key={index}
                  className="bg-white  hover:bg-sky-200 hover:font-bold h-36 border border-blue-300 p-4 rounded shadow"
                  onClick={() => handleDepartmentClick(dept)}
                >
                  <h2 className="text-xl font-semibold mb-3">
                    {dept.departmentName}
                  </h2>{" "}
                  {/* 의사 이름 */}
                  <p className="text-gray-600">
                    진료분야: {dept.treatments.join(", ")}
                  </p>{" "}
                  {/* 진료 분야 */}
                </div>
              ))
            ) : (
              <p>Loading...</p> // 로딩 중일 때 표시
            )}
          </div>
        </main>
        <div className="flex flex-col ">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen} // 모달 상태
        onClose={() => setIsModalOpen(false)} // 모달 닫기 핸들러
        department={selectedDepartment} // 선택된 부서 전달
      />
    </div>
  );
};

export default DepartmentInfo;
