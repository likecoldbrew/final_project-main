import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";

const PrescriptionHistory = () => {
  const { subcategory } = useParams();
  const { page } = useParams();
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null); // State to track the expanded question

  // API 호출
  useEffect(() => {
    fetchFaqs();
  }, []);

  // FAQ 정보 호출
  const fetchFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/faq/all");
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQ info:", error);
      setError("FAQ 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 2;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = faqs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(faqs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    navigate(`/faq/${pageNumber}`, {
      state: { selectCategory, selectSubCategory },
    });
  };

  const toggleAnswer = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index); // Toggle the answer
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow flex-col pr-8">
          <div className="flex-col min-h-full space-y-4 items-center justify-center">
            {loading ? (
              <p>Loading...</p>
            ) : faqs.length > 0 ? (
              currentItems.map((faq, index) => (
                <div key={index} className="bg-white p-4 rounded shadow">
                  <p
                    className="font-semibold cursor-pointer"
                    onClick={() => toggleAnswer(index)} // Toggle answer on click
                  >
                    {faq.question}
                  </p>
                  {expandedIndex === index && ( // Conditionally render answer
                    <>
                      <hr className="border-t border-sky-200 mb-4 mt-4" />{" "}
                      {/* 구분선 추가 */}
                      <p className="text-gray-600">{faq.answer}</p>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>검색 결과가 없습니다.</p>
            )}
            <div className="flex justify-end">
              <Link
                to={`/faq/register`} // 목록 페이지로 돌아가기
                state={{ selectCategory, selectSubCategory }}
                className="text-sky-600 hover:underline mr-4"
              >
                <button className="px-4 hover:bg-sky-200 hover:font-bold py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300">
                  Faq 등록하기
                </button>
              </Link>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
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

export default PrescriptionHistory;
