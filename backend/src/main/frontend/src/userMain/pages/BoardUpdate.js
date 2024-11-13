import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import SubCategories from "../components/SubCategory";
import QuickMenu from "../components/QuickMenu";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import AlertModal from "../components/AlertModal";
import { format } from "date-fns"

const BoardUpdate = ({ boardId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState([]); // 기존에 등록된 파일 확인용
  const [newFiles, setNewFiles] = useState([]); // 새 파일 상태
  const [loading, setLoading] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  // AlertModal 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState(`/board/detail/${boardId}`);
  const [isSuccess, setIsSuccess] = useState(false);
  const { userInfo, isLoading } = useUser(); //유저 정보

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
    fetchBoardDetail();
  }, [isLoading, userInfo]);


  const fetchBoardDetail = async () => {
    try {
      const response = await fetch(`/api/board/detail?boardId=${boardId}`);
      const data = await response.json();
      if (!data.isEmpty) {
        const formattedData = {
          ...data,
          createAt: format(data.createAt, "yyyy-MM-dd"),
          updateAt: data.updateAt ? format(data.updateAt, "yyyy-MM-dd") : null
        };
        setBoard(formattedData);
        setUserId(formattedData.userId);
        setTitle(formattedData.title); // 제목 초기화
        setContent(formattedData.content); // 내용 초기화\
        setFiles(formattedData.files || []); // 기존 파일 초기화
      } else {
        console.log("No data found for this board.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching board detail:", error);
      setLoading(false);
    }
  };

  //첨부파일 수정
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).map((file) => ({
      fileOriginalName: file.name, // 파일의 원래 이름을 저장
      fileObject: file // 파일 객체도 함께 저장
    }));
    // 파일 미리보기 URL 생성
    const previews = selectedFiles.map(file => URL.createObjectURL(file.fileObject));
    setFilePreviews(previews);
    // 새 파일만 상태에 저장
    setNewFiles(selectedFiles);
  };

  //파일제거
  const handleFileRemove = async (fileId, index) => {
    setFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if(title.trim() === "" || content.trim() === "") {
      setModalMessage("제목과 내용은 꼭 입력해야 합니다..");
      setModalButtonText("확인");
      setModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath(`/board/update/${boardId}`)
      setLoading(false);
      return
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userId", userId);

    // 새 파일만 API에 전달
    newFiles.forEach((file) => {
      formData.append("files", file.fileObject);
    });
    // 삭제할 파일 ID 수집
    const deletedFileIds = files.filter(file => file.isDeleted).map(file => file.fileId);
    try {
      const response = await fetch(`/api/board/update/${boardId}`, {
        method: "PUT",
        body: formData
      });
      if (response.ok) {
        // 게시글 수정 성공 후 삭제 API 호출
        for (const fileId of deletedFileIds) {
          await fetch(`/api/file/delete/${fileId}`, {
            method: "DELETE"
          });
        }
        setModalMessage("게시글이 수정되었습니다.");
        setModalButtonText("해당 게시글로 이동");
        setModalOpen(true);
        setIsSuccess(true);
      } else {
        const errorText = await response.text(); // 에러 메시지 받아오기
        console.log(`게시글 등록에 실패했습니다.  ${errorText}`);
        alert("게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating board:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모달이 닫힐 때 navigate 실행
  const handleModalClose = () => {
    setModalOpen(false);
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
          <h2 className="text-2xl font-bold mb-4">게시글 수정</h2>
          {board ? (
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
                <label className="block mb-2 text-gray-600">작성자</label>
                <input
                  type="text"
                  value={board.userId} // 작성자 정보 표시
                  readOnly
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
                />
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
              <div className="mb-4">
                <label className="block mb-2 text-gray-600">첨부파일</label>
                {files.length > 0 || newFiles.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {files.map((file, index) => (
                      <li key={index} className="text-gray-600 flex justify-between items-center">
                        {file.fileOriginalName}
                        <button
                          type="button"
                          onClick={() => handleFileRemove(file.fileId, index)} // 기존 파일 삭제
                          className="ml-2 text-red-600 hover:underline"
                        >
                          x
                        </button>
                      </li>
                    ))}
                    {newFiles.map((file, index) => (
                      <li key={index + files.length} className="text-gray-600 flex justify-between items-center">
                        {file.fileOriginalName} {/* 새 파일 이름 표시 */}
                        <button
                          type="button"
                          onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))} // 선택된 새 파일 삭제
                          className="ml-2 text-red-600 hover:underline"
                        >
                          x
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">첨부파일이 없습니다.</p>
                )}
                <input
                  type="file"
                  name="files"
                  multiple
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-md mt-2"
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
                  to={`/community`} // 목록 페이지로 돌아가기
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
                  {loading ? "수정 중..." : "게시글 수정"}
                </button>
              </div>
            </form>
          ) : (
            <p>게시글 정보를 불러오는 중...</p>
          )}
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
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

export default BoardUpdate;
