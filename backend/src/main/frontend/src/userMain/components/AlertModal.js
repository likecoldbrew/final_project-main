import React from "react";
import { useNavigate } from "react-router-dom";

const AlertModal = ({ isOpen, onClose, onPaymentModalClose, message, buttonText, isSuccess, redirectPath, state}) => {
  if (!isOpen) return null;
  const navigate = useNavigate(); // useNavigate 훅 사용
  //페이지 이동이 필요할 경우
  const handleClose = () => {
    //결제창 모달이 열려있는 결제창 모달이랑 같이 닫기
    if (onPaymentModalClose) {
      onPaymentModalClose();
    }
    //이동할 경로가 있다면 이동하기
    if (redirectPath) {
      navigate(redirectPath, { state: state, replace: true });
    }
    onClose()
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-[900]">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="bg-white rounded-lg p-6 relative z-10 shadow-lg w-80 text-center">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times; {/* 'X' 문자 */}
        </button>

        <div
          className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isSuccess ? "animate-bounce bg-green-400" : "animate-spin bg-red-400"
          }`}
        >
          <span className="text-2xl">{isSuccess ? "😊" : "😟"}</span>
        </div>
        <h2 className={`text-xl font-bold mb-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}>
          {isSuccess ? "Success" : "ERROR"}
        </h2>
        <p>{message}</p>
        <button
          onClick={handleClose}
          className="mt-6 px-4 py-2 bg-sky-200  rounded-md hover:bg-sky-500 focus:outline-none hover:font-bold hover:text-white"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
export default AlertModal;