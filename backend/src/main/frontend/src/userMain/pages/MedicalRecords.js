import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";
import AlertModal from "../components/AlertModal";

const MedicalRecords = () => {
  //페이징을 위한 값
  const { page } = useParams();
  // 현재 location에서 카테고리명 받기
  const location = useLocation();
  // 선택된 카테고리 값들
  const { selectCategory, selectSubCategory } = location.state || {};
  //진료 기록
  const [records, setRecords] = useState([]); // 게시글 가져오기
  //페이징 변수
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  /// 페이지 이동을 위한 useNavigate
  const navigate = useNavigate();
  //유저 정보
  const { userInfo, isLoading } = useUser();
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
    fetchRecords();
  }, [isLoading]);


  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);


  // 게시글 정보 가져오기
  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/medical_record/loginUser/${userInfo.userNo}`);
      const data = await response.json();
      // 날짜 포맷 변환

      const formattedData = data.map((record) => ({
        ...record,
        createAt: format(record.createAt, "yyyy-MM-dd"),
        outbreakAt: format(record.outbreakAt, "yyyy-MM-dd")
      }));
      setRecords(formattedData); // 변환된 데이터로 상태 업데이트
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = records.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(records.length / itemsPerPage);

  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    navigate(`/main/medicalHistory/page/${pageNumber}`, {
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
                    style={{ width: "150px" }}
                  >
                    진료 내역
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "200px" }}
                  >
                    방문일
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "450px" }}
                  >
                    진단
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "200px" }}
                  >
                    진료과
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "200px" }}
                  >
                    담당의
                  </th>
                </tr>
                </thead>
                <tbody>
                {records.length > 0 && currentItems.length > 0 ? (
                  <>
                    {currentItems.map((record, index) => (
                      <tr key={record.recordId} className="border-t border-blue-200">
                        <td className="px-4 py-2 text-center h-12">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {record.createAt}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          <Link
                            to={`/main/medicalHistory/detail/${record.recordId}`} // 제목 클릭 시 이동할 경로
                            state={{ selectCategory, selectSubCategory }} // 카테고리 값 넘겨주기
                            className="text-blue-500 hover:underline"
                          >
                            {record.diagnosis}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {record.departmentName}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {record.doctorName}
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
              {records.length > 0 ? (
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
              ) : null}
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

export default MedicalRecords;
