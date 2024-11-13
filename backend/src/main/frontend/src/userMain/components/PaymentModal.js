import React, { useState } from "react";
import axios from "axios";
import AlertModal from "./AlertModal";

const PaymentModal = ({
                        isOpen,
                        onClose,
                        certificateName,
                        amount,
                        redirect_url,
                        userNo,
                        userName,
                        onSuccess,
                        handlePaymentSuccess
                      }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    if (paymentMethod) {
      const { IMP } = window;
      IMP.init("imp37441202"); // 가맹점 번호 지정
      IMP.request_pay(
        {
          pg: `${paymentMethod}`, // 결제 방식 지정
          payMethod: `${paymentMethod}`,
          name: "메디곰 증명서 발급",
          amount: amount, // 충전할 금액
          m_redirect_url: redirect_url // 만약 새창에서 열린다면 결제 완료 후 리다이렉션할 주소
        },
        async function(rsp) {
          if (rsp.success) {
            // 결제 성공 시 DB에 결제 정보 저장
            try {
              const response = await axios.post(
                `http://localhost:8080/verify/${rsp.imp_uid}?userNo=${userNo}`, // POST 요청
                {
                  name: "메디곰 증명서 발급",
                  payMethod: paymentMethod,
                  amount: amount,
                  status: "paid",
                  userNo: userNo
                }
              );
              console.log("결제 검증 및 DB 저장 성공:", response.data);
              setIsSuccess(true); // 성공 여부 설정
              setModalMessage("결제 검증 성공");
              setModalButtonText("다운로드 하러 가기");
              setAlertModalOpen(true);
              setRedirectPath("/main/applicationHistory");
              await handlePaymentSuccess();
            } catch (error) {
              console.error("결제 검증 실패:", error);
              alert("결제 검증 실패");
            }
          } else {
            setIsSuccess(false); // 성공 여부 설정
            setModalMessage("결제를 취소하였습니다.");
            setModalButtonText("신청 내역 페이지로 이동");
            setAlertModalOpen(true);
            setRedirectPath("/main/applicationHistory");
            console.log(rsp);
          }
        }
      );
      // setTimeout(() => onClose(), 100);
    }
  };
  const goCancel = () => {
    setIsSuccess(false); // 성공 여부 설정
    setModalMessage("결제를 취소하셨습니다.");
    setModalButtonText("확인");
    setAlertModalOpen(true);
    setRedirectPath("/main/applicationHistory");
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg  w-11/12  max-w-xl shadow-lg">
        <div className="bg-sky-100 rounded-lg ">
          <h2 className="p-6 text-2xl font-bold mb-4 text-center">증명서 결제</h2>
        </div>
        <div className="p-6 mx-4 mb-6">
          <div className="mb-2 text-center">
            <p className="font-bold mb-2"><span className="text-sky-400"> {userName}</span> 님</p>
            <p className="font-bold mb-2">증명서 발급을 위한 결제창 입니다.</p>
            <p>진단서는 10,000원, 입퇴원 확인서는 3,000원 입니다.</p>
          </div>
          <div className="mt-10 mb-10">
            <p><span className="font-bold text-xl">신청 증명서 : </span> <span
              className="text-sky-300 font-bold text-lg">{certificateName}</span></p>
          </div>
          <div>
            <p><span className="font-bold text-xl">금액 : </span> <span
              className="text-sky-300 font-bold text-lg">{amount}</span></p>
          </div>
          <div className="mt-10">
            <h3 className="text-lg font-bold mb-4">결제 방법</h3>
            <div className="flex gap-4">
              <button
                className={`flex-1 flex items-center p-3 h-[80px] border-2 rounded transition-all duration-200 border-yellow-400 hover:bg-yellow-100 ${
                  paymentMethod === "kakaopay"
                    ? "border-yellow-500 bg-yellow-100"
                    : "border-gray-300 bg-white"
                }`}
                onClick={() => setPaymentMethod("kakaopay")}
              >
                <img src="/images/kakao.png" alt="kakaopayLogo" className="w-1/3 ml-6 mr-2" /> <span
                className="font-bold">카카오페이</span>
              </button>
              <button
                className={`flex-1 flex items-center p-3 border-2 rounded  h-[80px] transition-all duration-200 border-sky-400 hover:bg-blue-100 ${
                  paymentMethod === "tosspay"
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300 bg-white"
                }`}
                onClick={() => setPaymentMethod("tosspay")}
              >
                <img src="/images/toss.png" alt="kakaopayLogo" className="w-1/3 ml-6 mr-2" /> <span
                className="font-bold">토스페이</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex p-6 justify-end gap-4">
          <button
            className="px-4 py-2 rounded text-gray-700 bg-pink-200 hover:bg-pink-300 hover:font-bold transition-colors"
            onClick={goCancel}
          >
            취소
          </button>
          <button
            className={`px-4 py-2 rounded transition-colors ${
              paymentMethod ? "bg-sky-200 hover:bg-sky-300 hover:font-bold" : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handlePayment}
            disabled={!paymentMethod}
          >
            결제하기
          </button>
        </div>
      </div>
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onPaymentModalClose={onClose}  // PaymentModal 닫기 콜백 전달
        message={modalMessage}
        buttonText={modalButtonText}
        isSuccess={isSuccess}
      />
    </div>
  );
};

export default PaymentModal;
