import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";
import AlertModal from "../components/AlertModal";

const MyReserve = () => {
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [reserves, setReserves] = useState([]); // 게시글 가져오기
  const [currentPage, setCurrentPage] = useState(Number(page) || 1); // URL에서 페이지 번호 설정
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);

  //로그인 안하면 접근 못하게 막기
  /* 시작점 */
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token"); // JWT를 로컬 스토리지에서 가져옴
    if (token) {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}` // JWT 포함
          }
        });

        console.log(response.ok)
        if (response.ok) {
          const data = await response.json(); // 서버에서 반환하는 사용자 정보
          setIsLoading(true); //로그인 상태 확인용
          setUserInfo(data); // 사용자 정보 상태 업데이트
          fetchInquiries(data);
        } else {
          console.error("사용자 정보를 가져오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 중 오류 발생:", error);
      }
    }else{
      setModalMessage("로그인 후 이용가능합니다.");
      setModalButtonText("로그인 하기");
      setAlertModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/main/login"); // 로그인페이지로 보내기
    }
  };

  useEffect(()=>{
    fetchUserInfo()
  },[])
  /* 종료점 */

  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  // 예약 내역
  const fetchInquiries = async (userInfo) => {
    try {
      const response = await fetch(`/api/reserve/login/user?userNo=${userInfo.userNo}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setReserves(data); // 배열 형태의 데이터로 업데이트
      } else {
        console.error("Fetched data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setReserves([]); // 오류 발생 시 빈 배열로 초기화
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reserves.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(reserves.length / itemsPerPage);

  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    navigate(`/main/myReserve/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow flex-col pr-8">
          <div className="flex-col min-h-full space-y-4 items-center justify-center">
            <div className="overflow-x-auto">
              <table className="w-full h-3 rounded-[10px] bg-white p-4 shadow-blue-700 relative">
                <thead>
                <tr>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "80px" }}
                  >
                    번호
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "100px" }}
                  >
                    예약 신청일
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    예약한 진료과
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "100px" }}
                  >
                    담당의
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    예약 상태
                  </th>
                </tr>
                </thead>
                <tbody>
                {reserves.length > 0 && currentItems.length > 0 ? (
                  <>
                    {currentItems.map((reserve, index) => (
                      <tr key={`${index}-${reserve.reserveid}`} className="border-t border-blue-200">
                        <td className="px-4 py-2 text-center h-12">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2 text-center h-12 text-sky-600">
                          {format(reserve.reserveTime, "yyyy-MM-dd")}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {reserve.departmentName}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {reserve.doctorName}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {reserve.status === 0 ? (
                            <div className="bg-red-100 rounded-[10px] inline-block px-4 py-1">
                              대기중
                            </div>
                          ) : reserve.status === 1 ? (
                            <div className="bg-green-100 rounded-[10px] inline-block px-4 py-1">
                              승인 완료
                            </div>
                          ) : (
                            <div className="bg-sky-100 rounded-[10px] inline-block px-4 py-1">
                              진료 완료
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (<tr className="border-t border-blue-200">
                  <td colSpan="5" className="px-4 py-2  h-12 text-center">
                    문의하신 내용이 없습니다.
                  </td>
                </tr>)
                }
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              {reserves.length > 0 && (
                <>
                  <button
                    onClick={() => handlePageChange(startPage - 1)}
                    disabled={startPage === 1}
                    className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
                  >
                    이전
                  </button>
                  {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === pageNumber
                            ? "bg-sky-300 text-white"
                            : "bg-white text-blue-500"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(endPage + 1)}
                    disabled={endPage >= totalPages}
                    className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
                  >
                    다음
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        message={modalMessage}
        buttonText={modalButtonText}
        isSuccess={isSuccess}
        redirectPath={modalRedirectPath}
        state={{ selectCategory, selectSubCategory }}
      />
    </div>
  );
};

export default MyReserve;
