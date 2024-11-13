import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";
import { Search } from "lucide-react";
import debounce from "lodash.debounce";
import axios from "axios";

const Community = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const { page } = useParams(); // URL에서 page만 가져오기
  const [currentPage, setCurrentPage] = useState(Number(page) || 1); // URL에서 페이지 번호 설정
  const [boards, setBoards] = useState([]); // 게시글 가져오기
  const [filteredBoards, setFilteredBoards] = useState([]); // 게시글 가져오기
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 추가
  const [searchOption, setSearchOption] = useState("title"); // 검색어 상태 추가
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const { userInfo } = useUser(); //유저정보

  // API 호출
  useEffect(() => {
    fetchBoards();
    window.scrollTo(0, 0);
  }, []);

  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      handleSearch(searchTerm);
    }
  }, [searchOption]);

  // 게시글 정보 가져오기
  const fetchBoards = async () => {
    try {
      const response = await fetch("/api/board/all");
      const data = await response.json();
      // 날짜 포맷 변환
      const formattedData = data.map((board) => ({
        ...board,
        createAt: format(board.createAt, "yyyy-MM-dd") // 날짜 포맷 변경
      }));
      setBoards(formattedData); // 변환된 데이터로 상태 업데이트
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  //검색어 입력
  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      fetchBoards();
      setFilteredBoards([]);// 검색어가 비어 있을 때 전체 목록 표시
      return;
    }
    try {
      const response = await axios.get(`/api/board/allByOption?option=${searchOption}&value=${value}`
      );
      setFilteredBoards(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  };

  //디바운스 하기(게시글이랑, 필터 조건있을때만 검색)
  const debounceSearch = useCallback(
    debounce((value) => {
      handleSearch(value);
    }, 150), [boards, searchOption]
  );

  // 검색어 입력 핸들링
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debounceSearch(value);
  };

  // 엔터 키 입력 핸들링
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      debounceSearch.cancel(); // 디바운싱된 호출을 취소
      handleSearch(searchTerm); // 즉시 검색 수행
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 총 페이지 수 계산
  const totalPages = Math.ceil(boards.length / itemsPerPage);

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredBoards.length > 0 ? filteredBoards : boards).slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    navigate(`/community/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };

  if (!boards) {
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
      <div className="flex flex-col items-center justify-center mt-8">
        <div className="flex max-w-3xl w-full mr-72">
          {/* 검색 옵션 필터링*/}
          <select
            value={searchOption}
            onChange={(e) => setSearchOption(e.target.value)}
            className="form-select border rounded-l-md px-4 py-2"
            aria-label="검색 옵션 선택"
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="writer">작성자</option>
          </select>
          {/* 검색어 */}
          <input
            type="text"
            className="form-input border rounded-l-md px-4 py-2 w-full"
            placeholder="찾고 싶은 내용을 검색해보세요"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          {/* 검색 버튼 */}
          <button
            className="bg-sky-200 hover:bg-sky-200 text-white px-4 py-2 rounded-r-md"
            onClick={() => {
              debounceSearch.cancel(); // 디바운싱된 호출을 취소
              handleSearch(searchTerm); // 즉시 검색 수행
            }}
            aria-label="후기글 검색"
          >
            <Search className="hover:font-bold" />
          </button>
        </div>
      </div>
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
                {currentItems && currentItems.length > 0 ? (
                  currentItems.map((board, index) => (
                    <tr key={board.id} className="border-t border-blue-200">
                      <td className="px-4 py-2 text-center h-12">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 text-center h-12">
                        <Link
                          to={`/community/detail/${board.boardId}`} // 제목 클릭 시 이동할 경로
                          state={{ selectCategory, selectSubCategory }} // 카테고리 값 넘겨주기
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
                  ))
                ) : (
                  <tr className="border-t border-blue-200">
                    <td colSpan="5" className="text-center py-4">
                      작성된 게시글이 없습니다
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              {userInfo.userId ? (
                <>
                  <Link
                    to={`/board/register`}
                    state={{ selectCategory, selectSubCategory }}
                    className="text-sky-600 hover:underline mr-4"
                  >
                    <button
                      className="px-4 hover:bg-sky-200 hover:font-bold py-2 border rounded-md bg-white  text-blue-500 disabled:text-gray-300">
                      후기 등록
                    </button>
                  </Link>
                </>
              ) : null}
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
    </div>
  );
};
export default Community;
