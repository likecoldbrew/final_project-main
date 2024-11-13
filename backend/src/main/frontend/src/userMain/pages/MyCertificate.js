import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { addDays, format } from "date-fns";
import PaymentModal from "../components/PaymentModal";
import AlertModal from "../components/AlertModal";

const MyCertificate = () => {
  const { page } = useParams(); // URL에서 page만 가져오기
  const location = useLocation(); // 현재 location 가져오기
  const { selectCategory, selectSubCategory } = location.state || {}; // 헤더에서 전달받은 값
  const [certificates, setCertificates] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // 결제 모달 열기 상태
  const [selectedCertificate, setSelectedCertificate] = useState(null); // 선택한 증명서 정보
  const [freeCertificate, setFreeCertificate] = useState([]); // 무료인 의사진단서들
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
          fetchCertificates(data);
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

  // URL에서 page가 변경될 때 currentPage 업데이트
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  useEffect(() => {
    if (selectedCertificate && !selectedCertificate.needsPayment) {
      handlePaymentSuccess();
    }
  }, [selectedCertificate]);

  // 증명서 신청 내역
  const fetchCertificates = async (userInfo) => {
    try {
      const response = await fetch(`/api/certificates/user/${userInfo.userNo}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const certificatesOfType2 = data.filter(
          certificate => certificate.certificateType === 2 && certificate.validUntil === null && certificate.status === 1
        );
        if (certificatesOfType2.length > 0) {
          setSelectedCertificate(certificatesOfType2[0]);
        }
        setCertificates(data); // 전체 데이터 업데이트
      } else {
        console.error("Fetched data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setCertificates([]);
    }
  };

  //결제를 위한 것
  const handlePaymentButtonClick = (certificate) => {
    let certificateName;
    let amount;
    switch (certificate.certificateType) {
      case 1:
        certificateName = "진단서";
        amount = 10000;
        break;
      case 2:
        certificateName = "의사소견서";
        amount = 1000;
        break;
      case 3:
        certificateName = "입·퇴원 확인서";
        amount = 3000;
        break;
      default:
        certificateName = "존재하지 않는 증명서";
        amount = 0;
    }
    setSelectedCertificate({
      ...certificate, certificateName, amount, needsPayment: true
    });
    setPaymentModalOpen(true);
  };


  // status, 만료일 변경
  const handlePaymentSuccess = async () => {
    console.log("Payment Success Function Called");
    if (selectedCertificate) {
      const validUntil = addDays(new Date(), 7);
      const updatedCertificate = {
        ...selectedCertificate,
        status: 2,
        validUntil: validUntil
      };
      try {
        const response = await fetch(`/api/certificates/${selectedCertificate.certificateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedCertificate)
        });
        if (response.ok) {
          // 업데이트 성공 시, 목록을 다시 가져와 업데이트합니다.
          fetchCertificates();
        } else {
          console.error("Failed to update certificate status and expiration date.");
        }
      } catch (error) {
        console.error("Error updating certificate:", error);
      }
    }
  };

  // 증명서 다운용
  const handleDownloadClick = (userNo, certificateId, certificateType) => {
    const windowFeatures = "width=800,height=600,scrollbars=yes,resizable=yes";
    const newWindow = window.open(
      `http://localhost:8080/certificates/print/${userNo}/${certificateId}/${certificateType}`,
      "_blank",
      windowFeatures
    );
    if (newWindow) newWindow.focus();
  };

  //만료일 계산용
  const isExpired = (validUntil) => {
    const today = new Date();
    const expirationDate = new Date(validUntil);
    return expirationDate < today;
  };

  //한 페이지당 게시글 수
  const itemsPerPage = 10; // 페이지당 항목 수

  // 현재 페이지에 해당하는 항목 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = certificates.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(certificates.length / itemsPerPage);

  // 페이지 범위 계산 (예: 1~5, 6~10, 11~15 페이지 버튼 표시)
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    navigate(`/main/applicationHistory/page/${pageNumber}`, {
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
                    style={{ width: "80px" }}
                  >
                    번호
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "150px" }}
                  >
                    증명서 종류
                  </th>

                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "180px" }}
                  >
                    발급용도
                  </th>

                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "130px" }}
                  >
                    진료과
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "130px" }}
                  >
                    담당의
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "130px" }}
                  >
                    발급 신청 상태
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "130px" }}
                  >
                    다운로드
                  </th>
                  <th
                    className="px-4 py-2 text-center h-12"
                    style={{ width: "130px" }}
                  >
                    만료일
                  </th>
                </tr>
                </thead>
                <tbody>
                {certificates.length > 0 && currentItems.length > 0 ? (
                  <>
                    {currentItems.map((certificate, index) => (
                      <tr key={certificate.certificateId} className="border-t border-blue-200">
                        <td className="px-4 py-2 text-center h-12">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {certificate.certificateType === 1 ? (
                            <div className="text-sky-500">
                              진단서
                            </div>
                          ) : certificate.certificateType === 2 ? (
                            <div className="text-green-500">
                              의사 소견서
                            </div>
                          ) : (
                            <div className="text-yellow-500">
                              입·퇴원 확인서
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {certificate.purpose}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {certificate.departmentName}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {certificate.doctorName}
                        </td>
                        <td className="px-4 py-2 text-center h-12">
                          {certificate.status === 0 ? (
                            <div className="bg-red-100 rounded-[10px] inline-block px-4 py-1">
                              대기중
                            </div>
                          ) : certificate.status === 1 ? (
                            <div className="bg-sky-100 rounded-[10px] inline-block px-4 py-1">
                              승인 완료
                            </div>
                          ) : (
                            <div className="bg-green-100 rounded-[10px] inline-block px-4 py-1">
                              발급완료
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {certificate.status === 0 ? (
                              <div className="bg-green-100 rounded-[10px] inline-block px-4 py-1">대기중</div>) :
                            certificate.certificateType !== 2 && certificate.status === 1 ? (
                              <div onClick={() => handlePaymentButtonClick(certificate)}
                                   className="bg-rose-100 rounded-[10px] inline-block px-4 py-1 cursor-pointer  hover:font-bold">
                                결제하기
                              </div>) : (
                              isExpired(certificate.validUntil) ? (
                                <div className="bg-gray-300 rounded-[10px] inline-block px-4 py-1">
                                  기간만료
                                </div>
                              ) : (
                                <div
                                  className="bg-green-100 rounded-[10px] inline-block px-4 py-1 cursor-pointer hover:font-bold"
                                  onClick={() => handleDownloadClick(userInfo.userNo, certificate.certificateId, certificate.certificateType)}
                                >
                                  다운받기
                                </div>
                              )
                            )
                          }
                        </td>
                        <td className="px-4 py-2 text-center  h-12">
                          {certificate.status === 2 ? format(certificate.validUntil, "yyyy-MM-dd") : "결제 후 7일"}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (<tr className="border-t border-blue-200">
                  <td colSpan="5" className="px-4 py-2  h-12 text-center">
                    신청하신 증명서가 없습니다.
                  </td>
                </tr>)
                }
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              {certificates.length > 0 ?
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
                >
                  이전
                </button> : null}
              {certificates.length > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(
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
              {certificates.length > 0 ?
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
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          certificateName={selectedCertificate?.certificateName}
          amount={selectedCertificate?.amount}
          userNo={userInfo.userNo}
          userName={userInfo.userName}
          handlePaymentSuccess={handlePaymentSuccess}
        />
      )}
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

export default MyCertificate;
