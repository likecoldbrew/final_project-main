import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { useUser } from "../../utils/UserContext";
import { format } from "date-fns";

const BoardDetail = ({ boardId }) => {
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [board, setBoard] = useState(null);
  //이미지 blob URL으로 관리하려고 하는거
  const [imageUrls, setImageUrls] = useState({});
  const navigate = useNavigate();
  const { userInfo } = useUser();
  // 유저 정보
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  useEffect(() => {
    fetchBoardDetail();
  }, [boardId]);
  console.log("파일정보 들어오는지 확인", board);

  const fetchBoardDetail = async () => {
    try {
      const response = await fetch(`/api/board/detail?boardId=${boardId}`);
      const data = await response.json();
      if (!data.isEmpty) {
        const formattedData = {
          ...data,
          createAt: format(data.createAt, "yyyy-MM-dd"),
          updateAt: data.updateAt ? format(data.updateAt, "yyyy-MM-dd") : null,
          files: data.files || []
        };
        setBoard(formattedData);
        data.files.forEach((file) => {
          if (file.fileType.startsWith("image/")) {
            checkImageReady(file.fileId);
          }
        });
      } else {
        console.log("No data found for this board.");
      }
    } catch (error) {
      console.error("Error fetching board detail:", error);
    }
  };

  // 이미지 준비 상태를 주기적으로 확인하는 함수
  const checkImageReady = (fileId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/file/view/${fileId}`);
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImageUrls((prev) => ({ ...prev, [fileId]: imageUrl }));
          clearInterval(interval); // 이미지가 준비되면 interval 중지
        }
      } catch (error) {
        console.log(`Image not ready for fileId: ${fileId}, retrying...`);
      }
    }, 3000); // 5초마다 이미지 준비 상태 확인
  };

  //게시글 삭제시 게시판 리스트 화면으로 이동
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch(`/api/board/delete/${boardId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        navigate(`/main/community`, { state: { selectCategory, selectSubCategory } });
      } else {
        console.error("게시글 삭제에 실패했습니다.");
      }
    }
  };

  //파일 다운로드
  const downloadFile = async (fileId) => {
    try {
      const response = await fetch(`/api/file/download/${fileId}`, {
        method: "GET",
        headers: {
          // 필요 시 헤더 설정
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // 응답 헤더에서 파일 이름 추출
        const contentDisposition = response.headers.get("Content-Disposition");
        let fileName = "downloaded_file"; // 기본 파일 이름 설정

        if (contentDisposition && contentDisposition.indexOf("attachment") !== -1) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|([^;\n]*))/i.exec(contentDisposition);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, ""); // 파일 이름에서 따옴표 제거
          }
        }
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName; // 파일 이름 설정
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("파일 다운로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("파일 다운로드 중 오류가 발생했습니다.");
    }
  };


  if (!board) {
    return (
      <div className="flex justify-center items-center h-screen">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <div className="w-full rounded-[10px] bg-white p-6 shadow-blue-700 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl">
                <span className="font-bold">{board.title}</span>
              </div>
              <div className="text-gray-600">작성일: {board.createAt}</div>
            </div>
            <hr className="border-t border-sky-200 mb-4" />
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600">작성자: {board.userId}</div>
              <div className="text-gray-600">조회수: {board.views}</div>
            </div>
            <hr className="border-t border-sky-200  mb-6" />
            <div className="mt-4">
              <p className="mb-5 whitespace-pre-wrap">{board.content}</p>
              {board.files && board.files.length > 0 ? (
                board.files.map((file) =>
                  file.fileType.startsWith("image/") ? (
                    <div key={file.fileId}>
                      {imageUrls[file.fileId] ? (
                        <img
                          src={imageUrls[file.fileId]}
                          alt={file.fileId}
                          className="h-full object-cover mr-2"
                        />
                      ) : (
                        <p>Loading image...</p>
                      )}
                    </div>
                  ) : (
                    <a key={file.fileId} href={`/file/download/${file.fileId}`}
                       className="text-blue-500 hover:underline mr-2">
                      {file.fileId}
                    </a>
                  )
                )
              ) : null}
            </div>
            <div className="flex items-center mb-4">
              <span className="mr-2">첨부파일:</span>
              {board.files && board.files.length > 0 ? (
                board.files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => downloadFile(file.fileId)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    {file.fileOriginalName}
                  </button>
                ))
              ) : (
                <span>첨부파일이 없습니다.</span> // 파일이 없을 때 표시할 내용
              )}
            </div>
          </div>
          <div className="flex justify-end items-center">
            <Link
              to={`/main/community/1`} // 목록 페이지로 돌아가기
              state={{ selectCategory, selectSubCategory }}
              className="text-sky-600 hover:underline mr-4"
            >
              목록으로 돌아가기
            </Link>
            {userInfo.userId === board.userId ? (
              <>
                <button onClick={handleDelete}
                        className="px-4 py-2  hover:bg-sky-200 hover:font-bold border rounded-md bg-white mr-3 text-blue-500 disabled:text-gray-300">
                  삭제하기
                </button>

                <Link
                  to={`/main/board/update/${boardId}`}
                  state={{ selectCategory, selectSubCategory }}
                  className="text-sky-600 hover:underline mr-4"
                >
                  <button
                    className="px-4 py-2  hover:bg-sky-200 hover:font-bold border rounded-md bg-white  text-blue-500 disabled:text-gray-300">
                    수정하기
                  </button>
                </Link>
              </>
            ) : null}
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
