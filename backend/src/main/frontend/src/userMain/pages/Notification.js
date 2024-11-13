import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { Search } from "lucide-react";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import axios from "axios";

const Notification = () => {
  const { subcategory } = useParams(); // URL에서 subcategory 가져오기
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [notices, setNotices] = useState([]); // 게시글 가져오기
  const [filterNotices, setFilterNotices] = useState([]);//필터링된 공지사항
  const [searchNotice, setSearchNotice] = useState(""); //검색어
  const [selectOption, setSelectOption] = useState("title"); // 필터링 옵션
  const [currentPage, setCurrentPage] = useState(Number(page) || 1); // URL에서 페이지 번호 설정
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate

  // API 호출
  useEffect(() => {
    fetchNotices();
    window.scrollTo(0, 0);
  }, []);

  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  useEffect(() => {
    if (searchNotice.trim() !== "") {
      fetchSearchNotice(searchNotice);
    }
  }, [selectOption]);

  // 게시글 정보 가져오기
  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/board/allNotice");
      const data = await response.json();
      // 날짜 포맷 변환
      const formattedData = data.map((board) => ({
        ...board,
        createAt: format(board.createAt, "yyyy-MM-dd") // 날짜 포맷 변경
      }));
      setNotices(formattedData); // 변환된 데이터로 상태 업데이트
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  //검색어 입력
  const fetchSearchNotice = async (value) => {
    setSearchNotice(value);
    if (value.trim() === "") {
      fetchNotices();
      setFilterNotices([]);// 검색어가 비어 있을 때 전체 목록 표시
      return;
    }
    try {
      const response = await axios.get(`/api/board/allNoticeByOption?option=${selectOption}&value=${value}`);
      setFilterNotices(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  };

  //디바운스 하기
  const debounceSearch = useCallback(
    debounce((value) => {
      fetchSearchNotice(value);
    }, 150), [notices, selectOption]
  );

  //검색어 입력 핸들링
  const handleSearchNotice = (e) => {
    const value = e.target.value;
    setSearchNotice(value);
    debounceSearch(value);
  };

  //엔터키 누르면 검색
  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      debounceSearch.cancel(); // 디바운싱된 호출을 취소
      fetchSearchNotice(searchNotice); // 즉시 검색 수행
    }
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filterNotices.length>0? filterNotices: notices).slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(notices.length / itemsPerPage);

  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    // 페이지 번호와 함께 selectCategory와 selectSubCategory를 state로 전달
    navigate(`main/notice/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };

  if (!notices) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="flex flex-col items-center justify-center mt-8">
        <div className="flex max-w-3xl w-full mr-72">
          {/* 검색 옵션 필터링*/}
          <select
            value={selectOption}
            onChange={(e) => setSelectOption(e.target.value)}
            className="form-select border rounded-l-md px-4 py-2"
            aria-label="검색 옵션 선택"
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
          </select>
          {/* 검색어 */}
          <input
            type="text"
            className="form-input border rounded-l-md px-4 py-2 w-full"
            placeholder="찾고 싶은 내용을 검색해보세요"
            value={searchNotice}
            onChange={handleSearchNotice}
            onKeyDown={handleEnterKey}
          />
          {/* 검색 버튼 */}
          <button
            className="bg-sky-200 hover:bg-sky-200 text-white px-4 py-2 rounded-r-md"
            onClick={() => {
              debounceSearch.cancel(); // 디바운싱된 호출을 취소
              fetchSearchNotice(searchNotice); // 즉시 검색 수행
            }}
            aria-label="공지사항 검색"
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
                    style={{ width: "500px" }}
                  >
                    제목
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
                          to={`/main/notice/detail/${board.boardId}`} // 제목 클릭 시 이동할 경로
                          state={{ selectCategory, selectSubCategory }} // 카테고리 값 넘겨주기
                          className="text-blue-500 hover:underline"
                        >
                          {board.title}
                        </Link>
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

export default Notification;
