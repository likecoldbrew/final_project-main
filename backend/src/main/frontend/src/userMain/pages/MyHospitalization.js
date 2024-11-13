import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";
import AlertModal from "../components/AlertModal";

const MyHospitalization = () => {
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [hospitalization, setHospitalization] = useState([]); // 예약정보 가져오기
  const [currentPage, setCurrentPage] = useState(Number(page) || 1); // URL에서 페이지 번호 설정
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { userInfo, isLoading } = useUser(); //유저 정보
// AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);
  //로그인 안하면 접근 못하게 막기
  useEffect(() => {
    if (!isLoading && !userInfo.userId) {
      setModalMessage("로그인 후 이용가능합니다.");
      setModalButtonText("로그인 하기");
      setAlertModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/main/login"); // 로그인페이지로 보내기
    } else {
      window.scrollTo(0, 0);
    }
    fetchHospitalization();
  }, [isLoading, userInfo]);

  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);


  // 예약 내역
  const fetchHospitalization = async () => {
    try {
      const response = await fetch(`/api/hospitalization/${userInfo.userNo}`);
      const data = await response.json();
      const formattedData = data.map((hospitalization) => ({
        ...hospitalization,
        startDate: format(hospitalization.startDate, "yyyy-MM-dd"),
        dueDate: format(hospitalization.dueDate, "yyyy-MM-dd"),
        endDate: format(hospitalization.endDate, "yyyy-")
      }));
      setHospitalization(formattedData);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setHospitalization([]); // 오류 발생 시 빈 배열로 초기화
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = hospitalization.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(hospitalization.length / itemsPerPage);
  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);


  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    navigate(`/main/hospitalization/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };
  //입원일 계산
  const calculateHospitalizationPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end - start;
    // 밀리초를 일수로 변환
    return differenceInTime / (1000 * 60 * 60 * 24);
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
                    style={{ width: "200px" }}
                  >
                    진단명
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    진료과
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    담당의
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    입원상태
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "130px" }}
                  >
                    입원일
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "100px" }}
                  >
                    입원기간
                  </th>
                </tr>
                </thead>
                <tbody>
                {hospitalization.length > 0 && currentItems.length > 0 ? (
                  <>
                    {currentItems.map((hospital, index) => (
                      <tr key={hospital.hospitalizationId} className="border-t border-blue-200">
                        <td className="px-4 py-2 text-center h-12">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2 text-center h-12 text-sky-600">
                          <Link
                            to={`/main/hospitalization/detail/${hospital.hospitalizationId}`}
                            state={{ selectCategory, selectSubCategory }} // 카테고리 값 넘겨주기
                            className="text-blue-500 hover:underline"
                          >
                            {hospital.diseaseName}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {hospital.departmentName}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {hospital.doctorName}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {hospital.status === 1 ? (
                            <div className="bg-red-100 rounded-[10px] font-bold inline-block px-4 py-1">
                              입원신청 확인중
                            </div>
                          ) : hospital.status === 2 ? (
                            <div className="bg-green-100 rounded-[10px] font-bold inline-block px-4 py-1">
                              입원중
                            </div>
                          ) : (
                            <div className="bg-sky-100 rounded-[10px] font-bold inline-block px-4 py-1">
                              퇴원
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {hospital.startDate ? hospital.startDate : "대기중"}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {hospital.endDate ? `${calculateHospitalizationPeriod(hospital.startDate, hospital.endDate)}일` : `입원 ${Math.floor(calculateHospitalizationPeriod(hospital.startDate, new Date()))}일 째`}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (<tr className="border-t border-blue-200">
                  <td colSpan="5" className="px-4 py-2  h-12 text-center">
                    예약 내역이 없습니다.
                  </td>
                </tr>)
                }
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              {hospitalization.length > 0 && (
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

export default MyHospitalization;
