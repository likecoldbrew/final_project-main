import "../styles/pagination.css";
import {
  KeyboardArrowLeft,
  KeyboardDoubleArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";

const Pagination = ({
                      itemsPerPage,
                      totalItems,
                      currentPage,
                      handlePageChange,
                    }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 페이지 번호 계산
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // 현재 페이지 기준으로 보여줄 페이지 범위 설정
  const maxPageNumbersToShow = 5;
  let visiblePageNumbers = [];

  // 페이지가 5개 이상일 경우 표시할 페이지 번호 계산
  if (totalPages <= maxPageNumbersToShow) {
    visiblePageNumbers = pageNumbers;
  } else {
    const startPage = Math.floor((currentPage - 1) / maxPageNumbersToShow) * maxPageNumbersToShow + 1;
    const endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages);
    visiblePageNumbers = pageNumbers.slice(startPage - 1, endPage);
  }

  return (
    <div className="pagination">
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="prev-next"
      >
        <KeyboardDoubleArrowLeft />
      </button>

      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="prev-next"
      >
        <KeyboardArrowLeft />
      </button>

      {visiblePageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={number === currentPage ? "active" : ""}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="prev-next"
      >
        <KeyboardArrowRight />
      </button>

      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="prev-next"
      >
        <KeyboardDoubleArrowRight />
      </button>
    </div>
  );
};

export default Pagination;