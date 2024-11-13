import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import SubCategories from "../components/SubCategory";
import QuickMenu from "../components/QuickMenu";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import AlertModal from "../components/AlertModal";

const BoardRegist = () => {
  const { boardId } = useParams(); // URL에서 boardId 가져오기 (선택적)
  const navigate = useNavigate();
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]); // 미리보기 상태 추가
  // AlertModal 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);
  const {userInfo, isLoading}=useUser() //유저 정보

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);

    // 파일 미리보기 URL 생성
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  useEffect(() => {
    // 화면 로딩시 로그인 체크
    if (!isLoading && !userInfo.userId) {
      setModalMessage("로그인 후 이용 가능합니다.");
      setModalButtonText("로그인 하기");
      setModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/login"); // 로그인 페이지로 보내기
    } else {
      window.scrollTo(0, 0);
    }
  }, [isLoading, userInfo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if(content.trim() === "" || title.trim() === "") {
      setModalMessage("제목과 내용은 꼭 입력해야 합니다..");
      setModalButtonText("확인");
      setModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/board/register");
      setLoading(false);
      return
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userNo", userInfo.userNo);

    // 파일이 존재할 경우에만 formData에 추가
    if (files.length > 0) {
      files.forEach((file) => {
        console.log(`Uploading file: ${file.name}`); // 디버깅용 로그
        formData.append("file", file);
      });
    }

    try {
      const response = await fetch("/api/board/register", {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        // 게시글 등록 성공 시
        setModalMessage("게시글이 등록되었습니다.");
        setModalButtonText("게시판으로 이동");
        setModalOpen(true);
        setIsSuccess(true); // isSuccess 상태 업데이트
        setRedirectPath("/community");
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


  // 모달이 닫힐 때 navigate 실행
  const handleModalClose = () => {
    setModalOpen(false);
    // isSuccess가 true일 경우에만 navigate 실행
    if (isSuccess) {
      navigate("/community", {
        state: {
          selectCategory,
          selectSubCategory
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <h2 className="text-2xl font-bold mb-4">게시글 등록</h2>
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
              {userInfo ? (
                <>
                  <label className="block mb-2 text-gray-600">작성자</label>
                  <input
                    type="text"
                    value={userInfo.userId} // 임의의 값
                    readOnly
                    className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
                  />
                </>
              ) : (
                <>
                  <label className="block mb-2 text-gray-600">작성자</label>
                  <input
                    type="text"
                    value="로그인한 유저가 없습니다." // 임의의 값
                    readOnly
                    className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
                  />
                </>)}
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows="5"
                className="w-full border border-gray-300 p-2 rounded-md h-[400px] whitespace-pre-wrap"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">파일 첨부</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            {filePreviews.length > 0 && (
              <div className="mb-4">
                <h3 className="text-gray-600">미리보기</h3>
                <div className="flex flex-wrap">
                  {filePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`preview-${index}`}
                      className="w-20 h-20 object-cover mr-2 mb-2"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end items-center">
              <Link
                to={`/community/1`} // 목록 페이지로 돌아가기
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
                {loading ? "등록 중..." : "게시글 등록"}
              </button>
            </div>
          </form>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
      {/* AlertModal 추가 */}
      <AlertModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        message={modalMessage}
        buttonText={modalButtonText}
        isSuccess={isSuccess}
        redirectPath={modalRedirectPath}
        state={{ selectCategory, selectSubCategory }}
      />
    </div>
  );
};

export default BoardRegist;
