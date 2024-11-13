import React, { useRef, useState } from "react";
import { Image } from "lucide-react";
import { useUser } from "../../../utils/UserContext";

const BoardRegister = ({ isOpen, onClose, category }) => {
  const { userInfo } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("건의 및 제안");
  const [newFiles, setNewFiles] = useState([]); // 새 파일 상태
  const fileInputRef = useRef(null); // input 요소에 접근하기 위한 ref

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setNewFiles((prev) => [...prev, ...selectedFiles]); // 새 파일 추가

    // 기존 파일 URL 해제 (메모리 누수 방지)
    return () => {
      fileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  };

  const handleFileRemove = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));  // 인덱스로 새로운 파일 배열에서 삭제
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 파일 선택 상태 초기화
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요");
      return; // Prevent further execution
    }

    const formData = new FormData();
    formData.append("title", title || null);
    formData.append("content", content || null);
    formData.append("userNo", userInfo.userNo || null);
    formData.append("type", type || null);

    // 파일이 존재할 경우에만 formData에 추가
    if (newFiles.length > 0) {
      newFiles.forEach((file) => {
        // console.log(`Uploading file: ${file.name}`); // 디버깅용 로그
        formData.append("file", file);
      });
    }

    let url;

    switch (category) {
      case "review":
        url = "/api/board/register";
        break;
      case "notice":
        url = "/api/board/register";
        break;
      case "faq":
        url = "/api/faq/register";
        break;
      case "inquiry":
        url = "/api/inquiries/register";
        break;
      default:
        url = "/api/board/register";
        break;
    }

    try {
      const response = await fetch(url, {
        method: "POST", // HTTP 메서드 PUT으로 변경
        body: formData
      });
      if (response.ok) {
        alert("해당 글이 등록되었습니다.");
        onClose(true); // 모달 닫기
      } else {
        const errorText = await response.text(); // 에러 메시지 받아오기
        console.log(`등록에 실패했습니다.  ${errorText}`);
        alert("등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating board:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  // 카테고리에 따른 버튼 표시
  const renderActionButtons = () => {
    switch (category) {
      case "notice":
        return (
          <div className="flex justify-between">
            <div className="flex flex-col">
              {newFiles.length > 0 ? (
                <ul className="flex flex-wrap gap-4">
                  {newFiles.map((file, index) => (
                    <li key={index + newFiles.length} className="text-gray-600 flex items-center">
                      <Image className="h-4 w-4 mr-1" />
                      {file.name} {/* 새 파일 이름 표시 */}
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="ml-2 text-red-600 hover:underline"
                      >
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">첨부 파일이 없습니다.</p>
              )}
              <div className="flex items-center mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  name="files"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            </div>
            <div className="flex items-center">
              <div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="float-right mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        );
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
      {/* 모달 크기 조정 */}
      <div className="relative bg-white rounded-lg p-8 w-1/2 h-2/3">
        {/* 닫기 버튼 */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {/* 모달 내용 */}
        <form onSubmit={handleSubmit}>
          <div>
            <input type="hidden" name="userNo" value={userInfo.userNo} />
            <input
              type="text"
              className="border rounded w-full p-3 mb-2"
              placeholder="제목"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className="border rounded w-full p-3 mb-2"
              placeholder="작성자"
              value={userInfo.userName}
              readOnly={true}
            />
            <textarea
              className="border rounded w-full p-3"
              placeholder="내용"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              required
            />
            {/* 카테고리에 따라 버튼 달라짐 */}
            {renderActionButtons()}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardRegister;