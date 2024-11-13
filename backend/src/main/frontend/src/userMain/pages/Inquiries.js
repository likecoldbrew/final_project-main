import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import AlertModal from "../components/AlertModal";
import { format } from "date-fns";

const Inquiries = () => {
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [inquiries, setInquiries] = useState([]); // 게시글 가져오기
  const [currentPage, setCurrentPage] = useState(Number(page) || 1); // URL에서 페이지 번호 설정
  const [selectedType, setSelectedType] = useState(""); // 선택된 유형 값
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { userInfo, isLoading } = useUser(); //유저 정보
  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);

  //페이지 이동시 화면 맨위로 이동
  useEffect(() => {
    if (!isLoading && !userInfo.userId) {
      setModalMessage("로그인 후 이용가능합니다.");
      setModalButtonText("로그인 하기");
      setAlertModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/main/login"); //
    } else {
      window.scrollTo(0, 0);
    }
    fetchInquiries(); // userInfo가 있는 경우에만 호출
  }, [userInfo, isLoading]);

  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  // 게시글 정보 가져오기
  const fetchInquiries = async () => {
    try {
      const response = await fetch(`/api/inquiries/${userInfo.userNo}`);
      const data = await response.json();
      // 날짜 포맷 변환
      const formattedData = data.map((inquiries) => ({
        ...inquiries,
        createAt: format(inquiries.createAt, "yyyy-MM-dd") // 날짜 포맷 변경
      }));
      // userInfo.userNo와 같은 userNo를 가진 게시글만 필터링
      setInquiries(formattedData);
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  //선택한 유형으로 필터링
  const filteredInquiries = selectedType ? inquiries.filter(inquiry => inquiry.type === selectedType) : inquiries;
  const currentItems = filteredInquiries.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    navigate(`/main/inquiry/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };

  //선택된 유형
  const handleTypeSelect = (type) => {
    if (type === "전체") {
      setSelectedType("");
    } else {
      setSelectedType(type);
    }
    setCurrentPage(1); // Reset to the first page when a type is selected
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow flex-col pr-8">
          <div className="flex-col min-h-full space-y-4 items-center justify-center">
            <div className="flex justify-start items-center space-x-4 mb-4">
              <p className="text-xl font-bold">
                문의 유형 선택
              </p>
              <button onClick={() => handleTypeSelect("전체")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-100 hover:font-bold">
                전체
              </button>
              <button onClick={() => handleTypeSelect("건의 및 제안")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-100 hover:font-bold">
                건의 및 제안
              </button>
              <button onClick={() => handleTypeSelect("불편")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-200 hover:font-bold">
                불편
              </button>
              <button onClick={() => handleTypeSelect("예약")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-200 hover:font-bold">
                예약
              </button>
              <button onClick={() => handleTypeSelect("진료")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-200 hover:font-bold">
                진료
              </button>
              <button onClick={() => handleTypeSelect("수납")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-200 hover:font-bold">
                수납
              </button>
              <button onClick={() => handleTypeSelect("기타")}
                      className="px-4 py-2 rounded-md bg-white text-sky-700 hover:bg-sky-200 hover:font-bold">
                기타
              </button>
            </div>
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
                    style={{ width: "500px" }}
                  >
                    제목
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "300px" }}
                  >
                    유형
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    답변 상태
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    작성일
                  </th>
                </tr>
                </thead>
                <tbody>
                {inquiries.length > 0 && currentItems.length > 0 ? (
                  <>
                    {currentItems.map((inquiries, index) => (
                      <tr key={inquiries.id} className="border-t border-blue-200">
                        <td className="px-4 py-2 text-center h-12">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          <Link
                            to={`/main/inquiry/detail/${inquiries.inquirieId}`} // 제목 클릭 시 이동할 경로
                            state={{ selectCategory, selectSubCategory }} // 카테고리 값 넘겨주기
                            className="text-blue-500 hover:underline"
                          >
                            {inquiries.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {inquiries.type}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {inquiries.answer ? (
                            <div className="bg-green-100 rounded-[10px] inline-block px-4 py-1">
                              답변완료
                            </div>
                          ) : (
                            <div className="bg-red-100 rounded-[10px] inline-block px-4 py-1">
                              대기중
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {inquiries.createAt}
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
            <div className="flex justify-end">
              <Link
                to={`/main/inquiry/register`}
                state={{ selectCategory, selectSubCategory }}
                className="text-sky-600 hover:underline mr-4"
              >
                <button
                  className="px-4 hover:bg-sky-200 hover:font-bold py-2 border rounded-md bg-white  text-blue-500 disabled:text-gray-300">
                  1대1 문의 등록
                </button>
              </Link>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              {inquiries.length > 0 ?
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
                >
                  이전
                </button> : null}
              {inquiries.length > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(
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
              {inquiries.length > 0 ?
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
                >
                  다음
                </button> : null}
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
      />

    </div>
  );
};

export default Inquiries;
