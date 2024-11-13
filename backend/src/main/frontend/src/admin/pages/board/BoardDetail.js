import React, { useEffect, useRef, useState } from "react";
import { Image, Paperclip } from "lucide-react";

const BoardDetail = ({ isOpen, onClose, currentItem }) => {
  const [title, setTitle] = useState(""); // 제목
  const [content, setContent] = useState(""); // 내용
  const [userId, setUserId] = useState(""); // 아이디
  const [type, setType] = useState(""); // 유형
  const [answer, setAnswer] = useState(""); // 답변
  const [files, setFiles] = useState([]); // 기존에 등록된 파일 확인용
  const [newFiles, setNewFiles] = useState([]); // 새 파일 상태
  const [deletedFiles, setDeletedFiles] = useState([]); // 삭제할 파일 목록
  const fileInputRef = useRef(null); // input 요소에 접근하기 위한 ref

  if (!isOpen) return null;

  // currentItem이 변경될 때마다 title과 content를 업데이트
  useEffect(() => {
    if (currentItem.boardId) {
      const fetchBoardDetail = async () => {
        try {
          const response = await fetch(`/api/board/detail?boardId=${currentItem.boardId}`);
          const data = await response.json();
          if (data.files.length > 0) {
            setFiles(data.files);
          }
        } catch (error) {
          console.error("Error fetching board detail:", error);
        }
      };

      fetchBoardDetail();
    }

    setTitle(currentItem.title);
    setContent(currentItem.content);
    setUserId(currentItem.userId);
    setType(currentItem.type || "");
    setAnswer(currentItem.answer || "");
  }, [currentItem]);

  // 파일 추가
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).map((file) => ({
      fileOriginalName: file.name, // 파일의 원래 이름을 저장
      fileObject: file // 파일 객체도 함께 저장
    }));
    // 새 파일만 상태에 저장
    setNewFiles(selectedFiles);
  };

  // 파일 삭제
  const handleFileRemove = (fileId, index, isNewFile = false) => {
    if (isNewFile) {
      // 새 파일 삭제 시 newFiles 배열에서 제거
      setNewFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // 파일 선택 상태 초기화
      }
    } else {
      // 기존 파일 삭제 시 삭제할 파일 리스트에 추가
      if (fileId) {
        setDeletedFiles((prev) => [...prev, fileId]);
      }
      // 기존 files 배열에서 해당 파일을 제거
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }
  };

  // 글 수정
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요");
      return;
    }

    // title, content, type, userId가 빈 값일 때 기존 값을 사용하도록 설정
    const formData = new FormData();
    formData.append("title", title || currentItem.title);
    formData.append("content", content || currentItem.content);
    formData.append("userId", userId || currentItem.userId);
    formData.append("type", type || currentItem.type); // type 추가
    // answer 필드가 빈 문자열일 때 null로 보내지 않고 그대로 빈 문자열로 유지
    formData.append("answer", answer === "" ? "" : answer);

    // 새 파일만 API에 전달
    newFiles.forEach((file) => {
      formData.append("files", file.fileObject);
    });

    // 파일 삭제한 경우
    if (deletedFiles.length > 0) {
      try {
        await Promise.all(
          deletedFiles.map(fileId =>
            fetch(`/api/file/delete/${fileId}`, {
              method: "DELETE"
            })
          )
        );
      } catch (error) {
        console.error(error);
      }
    }

    try {
      const url = currentItem.boardId
        ? `/api/board/update/${currentItem.boardId}`
        : currentItem.faqId
          ? `/api/faq/update/${currentItem.faqId}`
          : currentItem.inquirieId
            ? `/api/inquiries/update/${currentItem.inquirieId}`
            : `/api/board/update/${currentItem.boardId}`; // 기본 URL

      const response = await fetch(url, {
        method: "PUT", // HTTP 메서드 PUT으로 변경
        body: formData
      });

      if (response.ok) {
        alert("해당 글이 수정되었습니다.");
        onClose(true); // 모달 닫기
      } else {
        const errorText = await response.text(); // 에러 메시지 받아오기
        console.log(`수정에 실패했습니다.  ${errorText}`);
        alert("수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating board:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // 글 삭제
  const handleDelete = async () => {
    try {
      const url = currentItem.boardId
        ? `/api/board/delete/${currentItem.boardId}`
        : currentItem.faqId
          ? `/api/faq/delete/${currentItem.faqId}`
          : currentItem.inquirieId
            ? `/api/inquiries/delete/admin/${currentItem.inquirieId}`
            : `/api/board/delete/${currentItem.boardId}`; // 기본 URL

      const response = await fetch(url, {
        method: "PUT"
      });
      if (response.ok) {
        if (currentItem.inquirieId) {
          alert("답변이 삭제되었습니다.");
        } else {
          alert("해당 글이 숨김되었습니다.");
        }
        onClose(true); // 숨김 후 모달 닫기
      } else {
        alert("해당 글 숨김에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("숨김 중 오류가 발생했습니다.");
    }
  };

  // 글 표시
  const handleShow = async () => {
    try {
      const url = currentItem.boardId
        ? `/api/board/show/${currentItem.boardId}`
        : currentItem.faqId
          ? `/api/faq/show/${currentItem.faqId}`
          : currentItem.inquirieId
            ? `/api/inquiries/show/${currentItem.inquirieId}`
            : `/api/board/show/${currentItem.boardId}`; // 기본 URL

      const response = await fetch(url, {
        method: "PUT"
      });
      if (response.ok) {
        alert("해당 글이 표시되었습니다.");
        onClose(true); // 표시 후 모달 닫기
      } else {
        alert("해당 글 표시에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("표시 중 오류가 발생했습니다.");
    }
  };

  // 카테고리에 따른 버튼 표시
  const renderActionButtons = () => {
    if (currentItem.category === "review" || currentItem.category === "notice") {
      return (
        <div className="flex justify-between">
          <div className="flex flex-col">
            {files.length > 0 || newFiles.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {files.map((file, index) => (
                  <li key={index} className="text-gray-600 flex items-center">
                    <Paperclip className="h-4 w-4 mr-1" />
                    {file.fileOriginalName}
                    <button
                      type="button"
                      onClick={() => handleFileRemove(file.fileId, index)}
                      className="ml-2 text-red-600 hover:underline"
                    >
                      x
                    </button>
                  </li>
                ))}
                {newFiles.map((file, index) => (
                  <li key={index + files.length} className="text-gray-600 flex items-center">
                    <Image className="h-4 w-4 mr-1" />
                    {file.fileOriginalName} {/* 파일 이름 가져오기 */}
                    <button
                      type="button"
                      onClick={() => handleFileRemove(null, index, true)} // 새로운 파일인 경우 fileId는 null
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
                className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                저장
              </button>
            </div>
            <div>
              {currentItem.status === "Y" ? (
                <button
                  type="button" // type을 button으로 변경
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  숨김
                </button>
              ) : (
                <button
                  type="button" // type을 button으로 변경
                  onClick={handleShow}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  표시
                </button>
              )}
            </div>
          </div>
        </div>
      );
    } else if (currentItem.category === "inquiry") {
      return (
        <div className="flex justify-between mt-2">
          <div>
            <select
              value={type} // 선택된 값 상태를 type으로 설정
              onChange={(e) => setType(e.target.value)} // 선택된 값으로 상태 업데이트
              className="border rounded px-2 py-1 mr-1 h-10"
            >
              <option value="건의 및 제안">건의 및 제안</option>
              <option value="불편">불편</option>
              <option value="예약">예약</option>
              <option value="진료">진료</option>
              <option value="수납">수납</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
            <button
              type="button" // type을 button으로 변경
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              삭제
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="float-right mt-2">
          <button
            type="submit"
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            저장
          </button>
          {currentItem.status === "Y" ? (
            <button
              type="button" // type을 button으로 변경
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              숨김
            </button>
          ) : (
            <button
              type="button" // type을 button으로 변경
              onClick={handleShow}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              표시
            </button>
          )}
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
        {currentItem && (
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                className="border rounded w-full p-3 mb-2"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="border rounded w-full p-3 mb-2"
                placeholder="작성자"
                value={currentItem.userId || "관리자"}
                readOnly={true}
              />
              {currentItem.category === "inquiry" ? (
                <>
                    <textarea
                      className="border rounded w-full p-3"
                      placeholder="내용"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={7}
                    />
                  <textarea
                    className="border rounded w-full p-3"
                    placeholder="답변"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={7}
                    required
                  />
                </>
              ) : (
                <textarea
                  className="border rounded w-full p-3"
                  placeholder="내용"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  required
                />
              )}
              {/* 카테고리에 따라 첨부파일과 버튼 유무 달라짐 */}
              {renderActionButtons()}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;