import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import SubCategories from "../components/SubCategory";
import QuickMenu from "../components/QuickMenu";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import AlertModal from "../components/AlertModal";

const InquiriesRegist = () => {
  const { boardId } = useParams(); // URL에서 boardId 가져오기 (선택적)
  const navigate = useNavigate();
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const {userInfo}=useUser(); //유저정보
  // AlertModal 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);

  //질문 등록
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    //만약 로그인을 안했을 경우
    if(!userInfo.userId){
      setModalMessage("로그인 후 이용가능합니다.");
      setModalButtonText("로그인 하기");
      setModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/login"); // 로그인페이지로 보내기
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userNo", userInfo.userNo); // 예시로 userNo 추가
    formData.append("type", selectedType);


    try {
      const response = await fetch("/api/inquiries/register", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        // 게시글 등록 성공 시
        setModalMessage("문의가 등록되었습니다.");
        setModalButtonText("1대1 문의 페이지로 이동");
        setModalOpen(true);
        setIsSuccess(true); // isSuccess 상태 업데이트
        setRedirectPath("/inquiry");
      } else {
        // 에러 처리
        const errorText = await response.text(); // 에러 메시지 받아오기
        console.log(`게시글 등록에 실패했습니다.  ${errorText}`);
        alert(`게시글 등록에 실패했습니다.  ${errorText}`);
      }
    } catch (error) {
      console.error("Error registering board:", error);
      alert("게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 유형 선택 처리 함수
  const handleSelectType = (type) => {
    setSelectedType(type);
    setIsAccordionOpen(false); // 선택 후 아코디언 닫기
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <h2 className="text-2xl font-bold mb-4">문의 등록</h2>
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white p-6 rounded-md shadow-lg"
          >
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">유형</label>
              <div className="border border-gray-300 rounded-md">
                <div
                  className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                >
                  {selectedType ? selectedType : "유형을 선택하세요"}
                </div>
                {isAccordionOpen && (
                  <div className="border-t border-sky-200">
                    <p
                      className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                      onClick={() => handleSelectType("건의 및 제안")}
                    >
                      건의 및 제안
                    </p>
                    <hr className="border-t border-sky-200 mb-1 mt-1" />
                    <p
                      className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                      onClick={() => handleSelectType("불편")}
                    >
                      불편
                    </p>
                    <hr className="border-t border-sky-200 mb-1 mt-1" />
                    <p
                      className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                      onClick={() => handleSelectType("예약")}
                    >
                      예약
                    </p>
                    <hr className="border-t border-sky-200 mb-1 mt-1" />
                    <p
                      className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                      onClick={() => handleSelectType("진료")}
                    >
                      진료
                    </p>
                    <hr className="border-t border-sky-200 mb-1 mt-1" />
                    <p
                      className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                      onClick={() => handleSelectType("수납")}
                    >
                      수납
                    </p>
                    <hr className="border-t border-sky-200 mb-1 mt-1" />
                    <p
                      className="p-2 cursor-pointer hover:bg-sky-100 hover:font-bold"
                      onClick={() => handleSelectType("기타")}
                    >
                      기타
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows="5"
                className="w-full border border-gray-300 p-2 rounded-md h-[400px]"
              />
            </div>
            <div className="flex justify-end items-center">
              <Link
                to={`/inquiry`} // 목록 페이지로 돌아가기
                state={{ selectCategory, selectSubCategory }}
                className="text-sky-600 hover:underline mr-4"
              >
                목록으로 돌아가기
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 hover:bg-sky-200 hover:font-bold border rounded-md bg-white text-blue-500 disabled:text-gray-300"
              >
                {loading ? "등록 중..." : "문의 등록"}
              </button>
            </div>
          </form>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
      <AlertModal
        isOpen={modalOpen}
        onClose={()=>setModalOpen(false)}
        message={modalMessage}
        buttonText={modalButtonText}
        isSuccess={isSuccess}
        redirectPath={modalRedirectPath}
        state={{ selectCategory, selectSubCategory }}
      />
    </div>
  );
};

export default InquiriesRegist;
