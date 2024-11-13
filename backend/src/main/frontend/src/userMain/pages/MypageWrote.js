import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";
import AlertModal from "../components/AlertModal";

const MypageWrote = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [boards, setBoards] = useState([]); // 게시글 가져오기
  const [loading, setLoading] = useState(true); // 로딩 메시지
  const [currentPage, setCurrentPage] = useState(Number(page) || 1); // URL에서 페이지 번호 설정
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/main");
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
          fetchBoards(data);

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

  // URL에서 page가 변경될 때 currentPage 업데이트setRedirectPath
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  // 게시글 정보 가져오기
  const fetchBoards = async (userInfo) => {
    try {
      const response = await fetch(`/api/board/${userInfo.userNo}`);
      const data = await response.json();
      // 날짜 포맷 변환
      const formattedData = data.map((board) => ({
        ...board,
        createAt: format(board.createAt, "yyyy-MM-dd") // 날짜 포맷 변경
      }));
      setBoards(formattedData); // 변환된 데이터로 상태 업데이트
      setLoading(false); // 로딩 완료
    } catch (error) {
      console.error("Error fetching boards:", error);
      setLoading(false); // 로딩 종료
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = boards.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(boards.length / itemsPerPage);
// 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    // 페이지 번호와 함께 selectCategory와 selectSubCategory를 state로 전달
    navigate(`/main/community/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  const updateViews = (boardId, boardUserId) => {
    if (boardUserId !== userInfo.userId) {
      fetch(`/api/board/views/${boardId}`, {
        method: "PUT"
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to update views");
          }
          return response.json();
        })
        .then(data => {
          console.log("Views updated successfully:", data);
        })
        .catch(error => {
          console.error("Error updating views:", error);
        });
    }
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
                    글 번호
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "300px" }}
                  >
                    제목
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "120px" }}
                  >
                    작성자
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "80px" }}
                  >
                    조회수
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "120px" }}
                  >
                    작성일자
                  </th>
                </tr>
                </thead>
                <tbody>
                {boards.length > 0 && currentItems.length > 0 ? (
                  <>
                    {currentItems.map((board, index) => (
                      <tr key={board.id} className="border-t border-blue-200">
                        <td className="px-4 py-2 text-center h-12">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          <Link
                            to={`/main/community/detail/${board.boardId}`} // 제목 클릭 시 이동할 경로
                            // state={{ selectCategory, selectSubCategory }} // 카테고리 값 넘겨주기
                            onClick={() => {
                              updateViews(board.boardId, board.userId); // 조회수 업데이트 API로 boardId, userId 넘겨줌
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            {board.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {board.userId}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {board.views}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {board.updateAt
                            ? format(board.updateAt, "yyyy-MM-dd")
                            : format(board.createAt, "yyyy-MM-dd")}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (<tr className="border-t border-blue-200">
                  <td colSpan="5" className="px-4 py-2  h-12 text-center">
                    작성하신 후기글이 없습니다.
                  </td>
                </tr>)}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
              >
                이전
              </button>
              {[...Array(endPage - startPage + 1).keys()].map((index) => {
                const pageNumber = startPage + index;
                return (
                  <button
                    key={pageNumber}
                    className={`px-4 py-2 border rounded-md ${currentPage === pageNumber ? "active bg-sky-300 text-white" : "bg-white text-blue-500"}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
              >
                다음
              </button>
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
export default MypageWrote;
