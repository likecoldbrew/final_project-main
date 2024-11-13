import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import axios from "axios";
import debounce from "lodash.debounce";
import DoctorInfoModal from "../components/DoctorInfoModal";
import { Camera } from "lucide-react";


const DoctorInfo = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 추가
  const [selectedDoctor, setSelectedDoctor] = useState(null); // 선택된 의사
  const [selectedUserNo, setSelectedUserNo] = useState(null); // 선택된 의사의 userNo 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [education, setEducation] = useState([]); // 학력
  const [career, setCareer] = useState([]); // 경력
  const [isScrolled, setIsScrolled] = useState(false);//화면 스크롤 여부
  const [profileImgs, setProfileImgs] = useState({});// 프로필 사진들
  const icon = "🔍";

  // API 호출
  useEffect(() => {
    fetchDoctors();
  }, []);

  //의사 정보 호출
  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/all");
      const data = await response.json();
      setDoctors(data);
      //해당 의사 번호로 프로필 사진 찾아서 넣기
      data.forEach((doctor) => {
        fetchProfile(doctor.userNo);
      });
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

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


  const fetchDetail = async (userNo) => {
    try {
      const response = await fetch(`/api/doctorsInfo/${userNo}`); // Spring Boot 서버에서 데이터 가져오기
      const data = await response.json();
      setSelectedDoctor(data.user); // 의사선택
      setEducation(data.education); // 의사학력
      setCareer(data.career); // 의사경력
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  // 검색 함수
  const handleSearch = async (searchValue) => {
    if (searchValue.trim() === "") {
      // 검색어가 비어있으면 전체 의사 목록을 다시 가져옵니다.
      fetchDoctors();
      return;
    }
    try {
      const response = await axios.get(
        `/api/doctorsInfo/search?name=${encodeURIComponent(searchValue)}`
      );
      setDoctors(response.data);
    } catch (error) {
      console.error("Error searching doctor info:", error);
    }
  };

  // 디바운싱된 검색 함수
  const debouncedSearch = useCallback(
    debounce((value) => {
      handleSearch(value);
    }, 150), // 300ms 지연
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

  const handleDoctorClick = (doctor) => {
    setSelectedUserNo(doctor.userNo);
    fetchDetail(doctor.userNo);
    setIsModalOpen(true); // 모달 열기
    setIsScrolled(window.scrollY > 0); // 스크롤 상태 확인
  };
  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="flex flex-col items-center justify-center mt-8">
        <div className="flex max-w-3xl w-full">
          <input
            type="text"
            className="form-input border rounded-l-md px-4 py-2 w-full"
            placeholder="찾고 싶은 의료진 이름을 검색해보세요"
            value={searchTerm}
            onChange={handleInputChange} // 입력 시 디바운스된 검색 함수 호출
            onKeyDown={handleKeyDown} // 엔터 키 핸들링
          />
          <button
            className="bg-sky-100 hover:bg-sky-200 text-white px-4 py-2 rounded-r-md"
            onClick={() => {
              debouncedSearch.cancel(); // 디바운싱된 호출을 취소
              handleSearch(searchTerm); // 즉시 검색 수행
            }}
            aria-label="의사 검색"
          >
            {icon}
          </button>
        </div>
      </div>
      <div className=" container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {doctors.length > 0 ? ( // 데이터가 있을 때만 표시
              doctors.map((doctor) => (
                <div
                  key={doctor.userNo}
                  onClick={() => handleDoctorClick(doctor)}
                  className="bg-white p-4 rounded shadow"
                >
                  <div className="flex items-center">
                    {profileImgs[doctor.userNo] ? (
                      <img
                        src={profileImgs[doctor.userNo]} // 프로필 이미지
                        alt={`${doctor.userName}'s profile`}
                        className="w-24 h-24 rounded-[10px] object-cover mr-5"
                      />
                    ) : (
                      <Camera className="text-gray-500 w-11 h-11 ml-6 rounded-[10px] object-cover mr-11" /> // 이미지가 없을 때 Camera 아이콘
                    )}
                    <div>
                      <h2 className="text-xl font-semibold mt-4 mb-4">
                        {doctor.userName}
                      </h2>
                      <p className="text-gray-600">진료과: {doctor.departmentName}</p>
                      <p className="text-gray-600">진료분야: {doctor.treatments.join(", ")}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>의사정보를 찾을 수 없습니다...</p> // 로딩 중일 때 표시
            )}
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
      <DoctorInfoModal
        isOpen={isModalOpen} // 모달 상태
        onClose={() => setIsModalOpen(false)} // 모달 닫기 핸들러
        doctor={selectedDoctor} // 선택된 의사
        userNo={selectedUserNo}
        education={education}                 // 학력 정보
        career={career}                       // 경력 정보
        isScrolled={isScrolled}
      />
    </div>
  );
};

export default DoctorInfo;
