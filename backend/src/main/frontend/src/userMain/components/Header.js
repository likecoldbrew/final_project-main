import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/tailwind.css";
import AlertModal from "./AlertModal";
import { useUser } from "../../utils/UserContext";
import { useCategoryContext } from "../../utils/CategoryContext";

const Header = () => {
  //카테고리 관련
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectCategory, setSelectCategory] = useState(null);
  const [selectSubCategory, setSelectSubCategory] = useState(null);
  const { isCategoryUpdate, setIsCategoryUpdate } = useCategoryContext(); // 카테고리 변경 시 재렌더링
  const location = useLocation();
  // 병원정보
  const [hospital, setHospital] = useState("");//병원 정보
  //유저정보
  const { userInfo, setUserInfo } = useUser();
  //nav 이동
  const navigate = useNavigate();
  //모달관련
  const [modalOpen, setModalOpen] = useState(false); // 모달 상태
  const [modalMessage, setModalMessage] = useState(""); // 모달 메시지
  const [modalButtonText, setModalButtonText] = useState(""); // 버튼 텍스트
  const [isSuccess, setIsSuccess] = useState(false); // 모달 성공 여부 상태
  const [redirectPath, setRedirectPath] = useState("");

  // 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category/main");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error); // 에러 로깅 추가
      }
    };
    fetchCategories();
    setIsCategoryUpdate(false);
  }, [isCategoryUpdate]);


  //병원 정보
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await fetch("/api/hospital/all");
        const data = await response.json();
        setHospital(data);
      } catch (error) {
        console.error("Error fetching doctor info:", error);
      }
    };
    fetchHospital();
  }, []);


  //카테고리 선택
  const handleSubCategorySelect = (categoryName, subCategoryName) => {
    setSelectCategory(categoryName);
    setSelectSubCategory(subCategoryName);
  };
  //모달창 내용
  const showAlertModal = (message, buttonText, isSuccess = false, redirectPath) => {
    setModalMessage(message);
    setModalButtonText(buttonText);
    setModalOpen(true);
    setIsSuccess(isSuccess); // isSuccess 상태 업데이트
    setRedirectPath(redirectPath); // redirectPath 상태 업데이트
  };

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token"); // 토큰 제거
    setUserInfo({});
    navigate("/main"); // 메인 페이지로 리다이렉트
  };

  // 회사명 대문자로 구분
  const splitHospitalName = (name) => {
    return name.match(/([A-Z][a-z]+)/g) || [];
  };
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center mr-auto w-1/5">
              <Link to="/main" className="h-24 mr-2">
                <img src="/images/mediGom_Logo.png" className="h-12 sm:h-16 md:h-20 lg:h-24" alt="logo" />
              </Link>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                {hospital ? (
                  splitHospitalName(hospital.hospitalNameEn).map((part, index) => (
                    <span key={index}
                          className={index === 0 ? "text-lg sm:text-xl md:text-2xl font-bold text-gray-800" : "text-lg sm:text-xl md:text-2xl font-bold text-yellow-500"}>
                      {part}
                    </span>
                  ))
                ) : null}
              </span>
            </div>
            <div className="flex flex-col items-end w-4/5">
              <div className="flex space-x-4 mb-2">
                {userInfo.userId ? (
                  <>
                    <p className="text-[18px] content-center text-sky-700">{userInfo.userId}<span
                      className="text-[14px]  content-center text-sky-700">({userInfo.userName})</span>님 반갑습니다!</p>
                    <button onClick={handleLogout}
                            className="text-sky-600 hover:text-sky-800 hover:font-bold  hover:bg-sky-300 rounded-[10px]  border-2 border-sky-200 px-2 py-1 transition-colors">
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/main/empSite">
                      <button className="text-sky-600 hover:text-sky-800 hover:font-bold transition-colors">
                        (직원)로그인
                      </button>
                    </Link>
                    <Link to="/main/login">
                      <button className="text-sky-600 hover:text-sky-800 hover:font-bold transition-colors">
                        로그인
                      </button>
                    </Link>
                    <Link to="/main/signUp">
                      <button className="text-sky-600 hover:text-sky-800 hover:font-bold transition-colors">
                        회원가입
                      </button>
                    </Link>
                  </>
                )}

              </div>
              <nav
                className="flex justify-around mt-6 space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 pr-10 pt-2 w-full flex-grow">
                {categories.map((category, index) => (
                  <div
                    key={`${index}-${category.id}`} // category의 고유 ID 사용
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.name)}
                  >
                    <Link
                      to={(category.categoryId
                        === 140 && !userInfo) ? "#" : `/main/${category.subcategories[0]?.urlName}`} // 첫 번째 하위 카테고리로 링크 설정
                      state={{
                        selectCategory: category.name,
                        selectSubCategory: category.subcategories[0]?.name
                      }}
                      className="cursor-pointer text-sky-600 text-lg sm:text-base lg:text-xl hover:font-bold hover:text-sky-800 transition-colors"
                      onClick={(e) => {
                        if (category.categoryId
                          === 140 && !userInfo) {
                          e.preventDefault(); // 기본 링크 클릭 방지
                          showAlertModal("로그인 후 이용 가능합니다.", "로그인 페이지로 이동", false, "/login"); // 모달 표시
                        } else {
                          handleSubCategorySelect(category.name, category.subcategories[0]?.name); // 클릭 시 상태 설정
                        }
                      }}
                    >
                      {category.name}
                    </Link>
                    {hoveredCategory === category.name &&
                      category.subcategories &&
                      category.subcategories.length > 0 && (
                        <div
                          className="absolute left-0 mt-2 w-40 sm:w-36 lg:w-48 bg-white border rounded shadow-lg"
                          onMouseEnter={() => setHoveredCategory(category.name)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.categoryId} // sub의 고유 ID 사용
                              to={(sub.categoryId === 134 || (sub.categoryId >= 140 && sub.categoryId <= 144)) && !userInfo ? "#" : `/main/${sub.urlName}`}
                              state={{
                                selectCategory: category.name,
                                selectSubCategory: sub.name
                              }}
                              onClick={(e) => {
                                if ((sub.categoryId === 134 || (sub.categoryId >= 140 && sub.categoryId <= 144)) && !userInfo) {
                                  e.preventDefault(); // 기본 링크 클릭 방지
                                  showAlertModal("로그인 후 이용 가능합니다.", "로그인 페이지로 이동", false, "/login");
                                } else {
                                  handleSubCategorySelect(category.name, category.subcategories[0]?.name); // 클릭 시 상태 설정
                                }
                              }}
                            >
                              <div
                                className="px-3 py-1 sm:px-2 sm:py-1 lg:px-4 lg:py-2 hover:bg-sky-100 cursor-pointer hover:font-bold z-50">
                                {sub.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
      {modalOpen && ( // modalOpen이 true일 때만 AlertModal 렌더링
        <AlertModal
          isOpen={modalOpen}
          message={modalMessage}
          buttonText={modalButtonText}
          onClose={() => setModalOpen(false)}
          isSuccess={isSuccess}
          redirectPath={redirectPath}
        />
      )}
    </>
  );
};

export default Header;
