import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import axios from "axios";
import debounce from "lodash.debounce";
import { Search } from "lucide-react";

const Faq = () => {
  const { subcategory } = useParams();
  const { page } = useParams();
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [faqs, setFaqs] = useState([]);
  const [filterFaqs, setFilterFaqs] = useState([]);
  const [searchFaqs, setSearchFaqs] = useState("");
  const [selectOption, setSelectOption] = useState("title");
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(null); // 클릭한 질문

  // API 호출
  useEffect(() => {
    fetchFaqs();
    window.scrollTo(0, 0);
  }, []);

  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
    setExpandedIndex(null); // 페이지 변경 시 expandedIndex 초기화
  }, [page]);

  //검색어가 있으면 옵션따라 검색되게
  useEffect(() => {
    if (searchFaqs.trim() !== "") {
      fetchSearchFaq(searchFaqs);
    }
  }, [selectOption]);

  // FAQ 정보 호출
  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/faq/all");
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQ info:", error);
    }
  };

  //검색어 입력
  const fetchSearchFaq = async (value) => {
    setSearchFaqs(value);
    if (value.trim() === "") {
      fetchFaqs();
      setFilterFaqs([]);// 검색어가 비어 있을 때 전체 목록 표시
      return;
    }
    try {
      const response = await axios.get(`/api/faq/allByOption?option=${selectOption}&value=${value}`);
      setFilterFaqs(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  };

  //디바운스 하기
  const debounceSearch = useCallback(
    debounce((value) => {
      fetchSearchFaq(value);
    }, 150), [faqs, selectOption]
  );

  //검색어 입력 핸들링
  const handleSearchFaq = (e) => {
    const value = e.target.value;
    setSearchFaqs(value);
    debounceSearch(value);
  };

  //엔터키 누르면 검색
  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      debounceSearch.cancel(); // 디바운싱된 호출을 취소
      fetchSearchFaq(searchFaqs); // 즉시 검색 수행
    }
  };

  const itemsPerPage = 7;
  const indexOfLastItem = currentPage * itemsPerPage;
  const totalPages = Math.ceil(faqs.length / itemsPerPage);
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filterFaqs.length > 0 ? filterFaqs : faqs).slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  const handlePageChange = (pageNumber) => {
    navigate(`/main/faq/page/${pageNumber}`, {
      state: { selectCategory, selectSubCategory }
    });
  };

  const toggleAnswer = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index); // Toggle the answer
  };

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
            value={searchFaqs}
            onChange={handleSearchFaq}
            onKeyDown={handleEnterKey}
          />
          {/* 검색 버튼 */}
          <button
            className="bg-sky-200 hover:bg-sky-200 text-white px-4 py-2 rounded-r-md"
            onClick={() => {
              debounceSearch.cancel(); // 디바운싱된 호출을 취소
              fetchSearchFaq(selectOption); // 즉시 검색 수행
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
            {faqs < 0 ? (
              <p>Loading...</p>
            ) : faqs.length > 0 ? (
              currentItems.map((faq, index) => (
                <div key={index} className="bg-white p-4 rounded shadow ">
                  <p
                    className="font-semibold cursor-pointer"
                    onClick={() => toggleAnswer(index)} // Toggle answer on click
                  >
                    {faq.title}
                  </p>
                  {expandedIndex === index && ( // Conditionally render answer
                    <>
                      <hr className="border-t border-sky-200 mb-4 mt-4" />
                      {" "}
                      {/* 구분선 추가 */}
                      <p className="text-gray-600 w-[850px]" style={{ whiteSpace: "pre-line" }}>{faq.content}</p>

                    </>
                  )}
                </div>
              ))
            ) : (
              <p>검색 결과가 없습니다.</p>
            )}
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
        <div className="flex flex-col space-y-4 overflow-hidden">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default Faq;
