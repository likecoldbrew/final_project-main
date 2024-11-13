import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import SubCategories from "../components/SubCategory";
import QuickMenu from "../components/QuickMenu";
import ChatBot from "../components/ChatBot";

const FaqUpdate = () => {
  const { boardId } = useParams(); // URL에서 boardId 가져오기 (선택적)
  const navigate = useNavigate();
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaqDetail();
  }, [boardId]);

  const fetchFaqDetail = async () => {
    try {
      const response = await fetch(`/api/board/detail?boardId=${boardId}`);
      const data = await response.json();
      if (data.length > 0) {
        const formattedData = {
          ...data[0],
          createAt: formatDate(data[0].createAt),
          updateAt: data[0].updateAt ? formatDate(data[0].updateAt) : null,
        };
        setBoard(formattedData);
        setUserId(formattedData.userId);
        setTitle(formattedData.title); // 제목 초기화
        setContent(formattedData.content); // 내용 초기화
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userId", userId);
    files.forEach((file) => {
      formData.append("files", file); // 'files'로 추가해야 합니다.
    });

    try {
      const response = await fetch(`/api/board/update/${boardId}`, {
        method: "PUT", // HTTP 메서드 PUT으로 변경
        body: formData,
      });

      if (response.ok) {
        alert("게시글이 수정되었습니다.");
        navigate("/community", {
          state: { selectCategory, selectSubCategory },
        });
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
                {files.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {files.map((file, index) => (
                      <li key={index} className="text-gray-600">
                        {file.name}
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
    </div>
  );
};

export default FaqUpdate;
