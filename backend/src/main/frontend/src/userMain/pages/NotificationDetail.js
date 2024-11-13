import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import { format } from "date-fns";

const NotificationDetail = ({ boardId }) => {
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchBoardDetail();
  }, [boardId]);

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
      } else {
        console.log("No data found for this board.");
      }
    } catch (error) {
      console.error("Error fetching board detail:", error);
    }
  };

  if (!board) {
    return (
      <div className="flex justify-center items-center h-screen">
        공지사항을 찾을 수 없습니다.
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
            <hr className="border-t border-sky-200  mb-6" />
            <div className="mt-4 h-[450px]">
              <p>{board.content}</p>
              {board.files && board.files.length > 0 ? (
                <div className="flex justify-center items-center"> {/* 이미지 정렬을 위한 클래스 추가 */}
                  {board.files.map((file) =>
                    file.fileType.startsWith("image/") ? (
                      <img
                        key={file.fileId}
                        src={`/api/file/view/${file.fileId}`}
                        alt={file.fileId}
                        className="max-h-full object-cover mx-2" // 이미지 정렬 및 여백 조정
                      />
                    ) : null
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end items-center">
            <Link
              to={`/notice`} // 목록 페이지로 돌아가기
              state={{ selectCategory, selectSubCategory }}
              className="text-sky-600 hover:underline mr-4"
            >
              목록으로 돌아가기
            </Link>
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

export default NotificationDetail;
