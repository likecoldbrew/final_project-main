import React, { useEffect, useState } from "react";
import { Loader, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import BoardDetail from "./BoardDetail";
import BoardRegister from "./BoardRegister";
import { format } from "date-fns";

const Button = ({ variant, className, isActive, children, ...props }) => {
  const baseClass = "px-4 py-2 rounded text-left bg-amber-50";
  const variantClass = variant === "outline" ? "border border-gray-300" : "text-gray-700";
  const activeClass = isActive ? "font-bold" : ""; // 활성화된 경우 텍스트를 두껍게
  return (
    <button className={`${baseClass} ${variantClass} ${activeClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function BoardList() {
  const navigate = useNavigate(); // useNavigate 사용
  const [searchParams] = useSearchParams(); // URL 파라미터를 가져옴
  const initialCategory = searchParams.get("category") || "notice"; // URL에서 category를 가져오거나 기본값 설정
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [list, setList] = useState([]); // 데이터 저장
  const [category, setCategory] = useState(initialCategory); // 초기 카테고리 설정을 URL에서 가져온 값으로 설정
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열기/닫기 상태
  const [currentItem, setCurrentItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 모달 유형 ('edit' 또는 'register')

  let endpoint;

  switch (category) {
    case "review":
      endpoint = "/api/board/admin/all";
      break;
    case "notice":
      endpoint = "/api/board/admin/notice";
      break;
    case "faq":
      endpoint = "/api/faq/admin/all";
      break;
    case "inquiry":
      endpoint = "/api/inquiries/admin/total";
      break;
    default:
      endpoint = "/api/board/admin/notice";
      break;
  }

  // 선택된 항목 관리
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false); // 전체 선택 상태

  // 검색 상태 추가
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [searchFilter, setSearchFilter] = useState("전체"); // 검색 필터
  const [statusFilter, setStatusFilter] = useState("All"); // 상태 필터

  // 등록 버튼 클릭 핸들러
  const handleRegisterClick = () => {
    setCurrentItem(category);
    setModalType("register");
    setIsModalOpen(true);
  };

  // 상세보기 버튼 클릭 핸들러
  const handleEditClick = (item) => {
    setCurrentItem(item);
    setModalType("edit");
    setIsModalOpen(true);
  };

  // 모달 닫을 때
  const handleCloseModal = (param = false) => {
    if (param) {
      fetchData(endpoint);
    }
    setIsModalOpen(false);
    setCurrentItem(null);
    setModalType(null);
  };

  // API 호출 함수
  const fetchData = async (endpoint) => {
    try {
      setLoading(true);
      const response = await fetch(endpoint); // Spring Boot 서버에서 데이터 가져오기
      const data = await response.json();
      setList(data || []); // 상태 업데이트
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 카테고리 변경 시 데이터 로드
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    navigate(`?category=${newCategory}`);
  };


  // 카테고리 변경 시 데이터 로드
  useEffect(() => {
    fetchData(endpoint);
    // 카테고리 변경 시 전체 선택 해제 및 선택된 항목 초기화
    setIsAllSelected(false);
    setSelectedItems([]);
  }, [category]);


  // URL이 변경되면 카테고리 상태 업데이트
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  // 검색어 또는 필터 변경 시 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm, searchFilter, statusFilter]);


  // 페이지
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 10개의 항목 표시

  // 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 해당하는 데이터 추출
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // 검색 필터링 로직 추가
  const filteredItems = list.filter(item => {
    const title = item.title ? item.title.toLowerCase() : "";
    const content = item.content ? item.content.toLowerCase() : "";
    const userId = item.userId ? item.userId.toLowerCase() : "";

    const matchesSearchTerm = (
      (searchFilter === "전체" && (
        title.includes(searchTerm.toLowerCase()) ||
        content.includes(searchTerm.toLowerCase()) ||
        userId.includes(searchTerm.toLowerCase())
      )) ||
      (searchFilter === "제목" && title.includes(searchTerm.toLowerCase())) ||
      (searchFilter === "내용" && content.includes(searchTerm.toLowerCase())) ||
      (searchFilter === "사용자" && userId.includes(searchTerm.toLowerCase()))
    );

    const matchesStatusFilter = (statusFilter === "All") || (item.status === statusFilter);

    return matchesSearchTerm && matchesStatusFilter;
  });

  // 필터링된 데이터에 대한 현재 항목
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // 문의 답변 대기 개수
  const count = list.filter(item => category === "inquiry" && !item.answer && item.status === "Y").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center text-gray-400">
          <Loader className="animate-spin" size={50} />
        </div>
      </div>
    );
  }

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // 전체 선택 핸들러
  const handleSelectAllChange = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      const allItemIds = currentItems.map(item => item.boardId || item.faqId || item.inquirieId);
      setSelectedItems(allItemIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      alert("숨길 항목을 선택하세요.");
      return;
    }

    try {
      // 선택된 항목들에 대해 숨김 요청 보내기
      const deleteRequests = selectedItems.map(itemId => {
        // 각 항목의 ID에 맞는 URL 설정
        const item = list.find(item =>
          item.boardId === itemId || item.faqId === itemId || item.inquirieId === itemId
        );

        const url = item.boardId
          ? `/api/board/delete/${item.boardId}`
          : item.faqId
            ? `/api/faq/delete/${item.faqId}`
            : item.inquirieId
              ? `/api/inquiries/delete/user/${item.inquirieId}`
              : `/api/board/delete/${item.boardId}`; // 기본 URL

        return fetch(url, {
          method: "PUT"
        });
      });

      // 모든 숨김 요청을 병렬로 실행
      const responses = await Promise.all(deleteRequests);

      // 응답 체크
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        alert("선택된 항목들이 숨김되었습니다.");
        handleCloseModal(true);
        setSelectedItems([]); // 선택 상태 초기화
        setIsAllSelected(false); // 전체 선택 상태 해제
      } else {
        alert("일부 항목 숨김에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("숨김 중 오류가 발생했습니다.");
    }
  };

  // 표시 핸들러
  const handleShow = async () => {
    if (selectedItems.length === 0) {
      alert("표시할 항목을 선택하세요.");
      return;
    }

    try {
      // 선택된 항목들에 대해 표시 요청 보내기
      const showRequests = selectedItems.map(itemId => {
        // 각 항목의 ID에 맞는 URL 설정
        const item = list.find(item =>
          item.boardId === itemId || item.faqId === itemId || item.inquirieId === itemId
        );

        const url = item.boardId
          ? `/api/board/show/${item.boardId}`
          : item.faqId
            ? `/api/faq/show/${item.faqId}`
            : item.inquirieId
              ? `/api/inquiries/show/${item.inquirieId}`
              : `/api/board/show/${item.boardId}`; // 기본 URL

        return fetch(url, {
          method: "PUT"
        });
      });

      // 모든 표시 요청을 병렬로 실행
      const responses = await Promise.all(showRequests);

      // 응답 체크
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        alert("선택된 항목들이 표시되었습니다.");
        handleCloseModal(true);
        setSelectedItems([]); // 선택 상태 초기화
        setIsAllSelected(false); // 전체 선택 상태 해제
      } else {
        alert("일부 항목 표시에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("표시 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mx-auto my-4 flex flex-col rounded-xl">
      <div className="flex-1 flex">
        <main className="flex-1 p-4">
          <div className="flex justify-between mb-4">
            <div className="flex justify-start space-x-2">
              <Button
                variant="outline"
                onClick={() => handleCategoryChange("notice")}
                isActive={category === "notice"}
              >
                공지사항
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCategoryChange("review")}
                isActive={category === "review"}
              >
                진료 후기
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCategoryChange("faq")}
                isActive={category === "faq"}
              >
                FAQ
              </Button>
              <Button
                variant="outline"
                className="relative"
                onClick={() => handleCategoryChange("inquiry")}
                isActive={category === "inquiry"}
              >
                1:1 문의
                <span
                  className={`absolute -top-1.5 -right-1.5 bg-red-500 font-normal text-white text-xs
                                    rounded-full w-5 h-5 flex items-center justify-center transition-opacity duration-300
                                    ${count > 0 ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                                {count}
                              </span>
              </Button>

            </div>
          </div>

          <div
            className="flex justify-between mb-2 w-full h-16 items-center space-x-4 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center">
              {/* 카테고리 */}
              <h1 className="text-2xl font-bold mr-4">
                {category.toUpperCase()}
              </h1>
              {/* 상태 필터 추가 */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border p-2 rounded mr-1"
              >
                <option value="All">상태</option>
                <option value="Y">공개</option>
                <option value="N">비공개</option>
              </select>
              {/* 검색 입력 필드 및 필터 옵션 */}
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="border rounded px-2 py-1 mr-1 h-10"
              >
                <option value="전체">전체</option>
                <option value="제목">제목</option>
                <option value="내용">내용</option>
                <option value="사용자">사용자</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="border px-4 py-2 pl-10 pr-4 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="flex space-x-2">
            </div>
          </div>

          <div
            className="flex justify-between mb-2 w-full items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="ml-3 mr-2 w-4 h-4"
                checked={isAllSelected}
                onChange={handleSelectAllChange}
              />
              <div className="cursor-pointer" onClick={handleSelectAllChange}>전체 선택</div>

              <div className="ml-2">
                <div className="cursor-pointer px-2 border-0 bg-gray-400 text-white rounded"
                     onClick={handleDelete}>숨김
                </div>
              </div>

              <div className="ml-2">
                <div className="cursor-pointer px-2 border-0 bg-emerald-500 bg-opacity-75 text-white rounded"
                     onClick={handleShow}>표시
                </div>
              </div>

            </div>

            <div className="flex space-x-2">
              {
                category === "notice" || category === "faq" ? (
                  <div
                    className="cursor-pointer px-2 border-0 bg-rose-400 bg-opacity-75 text-white rounded mr-1"
                    onClick={handleRegisterClick}>등록</div>
                ) : null
              }
            </div>
          </div>

          <div className="space-y-1">
            {currentItems.map((item) => (
              <div key={item.boardId || item.faqId || item.inquirieId}>
                <div
                  className="flex w-full h-16 items-center space-x-4 p-3 border rounded cursor-pointer bg-white"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedItems.includes(item.boardId || item.faqId || item.inquirieId)}
                    onChange={() => handleCheckboxChange(item.boardId || item.faqId || item.inquirieId)}
                  />
                  <div // 클릭 시 모달 열기
                    className="flex w-full justify-between"
                    onClick={() => handleEditClick(item)}>
                    <div>
                      <div className="font-semibold text-left">
                        {item.type ? `[${item.type}]` : null} {item.title}
                      </div>
                      <div className="text-sm text-gray-600 text-left">
                        {item.userId}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      {category === "inquiry" ? (
                        <div className={`mr-2 ${item.answer ? "text-blue-500" : "text-gray-800"}`}>
                          {item.answer ? "답변 완료" : "답변 대기"}
                        </div>
                      ) : null}
                      <div
                        className={`mr-2 ${item.status === "Y" ? "text-green-600" : "text-rose-600"}`}>
                        {item.status === "Y" ? "공개" : "비공개"}
                      </div>
                      <div>
                        {item.createAt ? format(new Date(item.createAt), "yyyy년 MM월 dd일 HH:mm:ss") : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div>
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredItems.length}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          </div>

          {/* 모달 컴포넌트 */}
          {modalType === "edit" && (
            <BoardDetail
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              currentItem={{ ...currentItem, category }}    // 현재 카테고리 정보를 함께 전달
            />
          )}

          {modalType === "register" && (
            <BoardRegister
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              category={currentItem}
            />
          )}

        </main>
      </div>
    </div>
  );

}