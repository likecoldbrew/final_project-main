import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Close, Visibility, VisibilityOff } from "@mui/icons-material";
import { Loader } from "lucide-react";

export default function Banner() {
  const [banners, setBanners] = useState([]); // 배너 목록
  const [newFiles, setNewFiles] = useState([]); // 새 배너 추가
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [isOrderChanged, setIsOrderChanged] = useState(false); // 순서 변경 상태 추가
  const fileInputRef = useRef(null); // input 요소에 접근하기 위한 ref
  const [imageLoading, setimageLoading] = useState(true);

  const handleImageLoad = () => {
    setimageLoading(false); // 이미지 로드 완료 후 로딩 상태 false로 변경
  };

  // 배너 목록 조회
  const fetchBannerList = async () => {
    try {
      setLoading(true);  // 로딩 시작
      const response = await fetch("/api/banner/adminAll");
      const data = await response.json();

      if (data && data.length > 0) {
        setBanners(data);
      }
      setLoading(false); // 로딩 완료
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  useEffect(() => {
    fetchBannerList();
  }, []);

  // 배너 이미지 추가
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setNewFiles((prev) => [...prev, ...selectedFiles]); // 새 파일 추가

    // 기존 파일 URL 해제 (메모리 누수 방지)
    return () => {
      fileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  };

  // 배너 이미지 삭제 (업로드 전)
  const handleFileRemove = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));  // 인덱스로 새로운 파일 배열에서 삭제
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 파일 선택 상태 초기화
    }
  };

  // 배너 등록 함수
  const handleSubmit = async () => {
    if (newFiles.length === 0) {
      alert("업로드할 파일을 선택해 주세요.");
      return; // 파일이 없을 경우 함수 종료
    }

    const formData = new FormData();

    newFiles.forEach((file) => {
      formData.append("banners", file); // 'banners'는 서버에서 받아줄 파라미터 이름
    });

    try {
      const response = await fetch("/api/banner/upload", {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        alert("배너가 등록되었습니다.");
        fetchBannerList();
      } else {
        const errorText = await response.text(); // 에러 메시지 받아오기
        console.log(`등록에 실패했습니다. ${errorText}`);
        alert("등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("등록 중 오류가 발생했습니다:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  // 배너 숨김
  const handleChangeNBanner = async (bannerId) => {
    try {
      const response = await fetch(`/api/banner/change/N?bannerId=${bannerId}`, {
        method: "PUT"
      });
      if (response.ok) {
        fetchBannerList();
      } else {
        alert("배너 숨김에 실패했습니다.");
      }
    } catch (error) {
      console.error("배너 숨김 중 오류가 발생했습니다:", error);
      alert("배너 숨김 중 오류가 발생했습니다.");
    }
  };

  // 배너 표시
  const handleChangeYBanner = async (bannerId) => {
    try {
      const response = await fetch(`/api/banner/change/Y?bannerId=${bannerId}`, {
        method: "PUT"
      });
      if (response.ok) {
        fetchBannerList(); // 배너 목록 새로고침
      } else {
        alert("배너 표시에 실패했습니다.");
      }
    } catch (error) {
      console.error("배너 표시 중 오류가 발생했습니다:", error);
      alert("배너 표시 중 오류가 발생했습니다.");
    }
  };

  // 배너 삭제
  const handleDeleteBanner = async (bannerId) => {
    const confirmed = window.confirm("해당 배너를 삭제하시겠습니까?");

    if (!confirmed) return; // 사용자가 '취소'를 누르면 함수 종료

    try {
      const response = await fetch(`/api/banner/remove/${bannerId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setBanners(banners.filter((item) => item.bannerId !== bannerId)); // 삭제된 배너 제거
      } else {
        alert("배너 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("배너 삭제 중 오류가 발생했습니다:", error);
      alert("배너 삭제 중 오류가 발생했습니다.");
    }
  };

  // 드래그 후 순서 변경
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return; // 드래그 후 놓을 곳이 없으면 리턴

    const items = banners.filter(d => d.status === "Y");
    const [reorderedItem] = items.splice(source.index, 1); // 원래 위치에서 배너 제거
    items.splice(destination.index, 0, reorderedItem); // 새로운 위치에 배너 삽입

    setBanners([
      ...items.map((d, i) => ({ ...d, bannerOrder: i })),
      ...banners.filter(d => d.status === "N").map((d, i) => ({ ...d, bannerOrder: items.length + i }))
    ]); // 배너 순서 업데이트
    setIsOrderChanged(true); // 순서가 변경되면 버튼 활성화
  };

  // 순서 저장
  const handleSaveOrder = async () => {
    try {
      const newBanner = banners.map((item) => ({
        bannerId: item.bannerId,
        bannerOrder: item.bannerOrder
      }));

      const response = await fetch("/api/banner/change/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newBanner) // 변경된 순서를 서버에 전송
      });

      if (response.ok) {
        alert("배너 순서가 저장되었습니다.");
        setIsOrderChanged(false); // 저장 후 버튼 비활성화
      } else {
        alert("순서 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("순서 저장 중 오류가 발생했습니다:", error);
      alert("순서 저장 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center text-gray-400">
          <Loader className="animate-spin" size={50} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mb-8 border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="w-full sm:w-auto flex-1">
            <label htmlFor="file-upload"
                   className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd" />
              </svg>
              파일 선택
            </label>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
            >
              업로드
            </button>
            <button
              onClick={() => isOrderChanged && handleSaveOrder()} // 변경 사항이 있을 때만 handleSaveOrder 호출
              className={`py-2 px-4 rounded-lg transition duration-300 ${
                isOrderChanged
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              순서 저장
            </button>
          </div>
        </div>

        {newFiles.length > 0 ? (
          <ul className="flex flex-wrap gap-4 items-center">
            {newFiles.map((file, index) => (
              <li key={index} className="bg-gray-200 text-gray-700 rounded-full py-1 px-3 flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd" />
                </svg>
                {file.name}
                <button
                  type="button"
                  onClick={() => handleFileRemove(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">첨부 파일이 없습니다.</div>
        )}
      </div>

      {/* 배너 목록 */}
      <div className="flex justify-center">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex justify-center w-full gap-10">
            {/* Active Banners */}
            <div className="w-full">
              <h2
                className={`text-lg w-full mb-4 text-gray-800 border-b-2 border-green-500 pb-1 inline-block`}>
                활성 배너
                <span
                  className={`${isOrderChanged ? "font-semibold" : ""} ml-2 text-sm font-normal text-gray-500 align-middle`}>(드래그하여 순서 변경)</span>
              </h2>
              <Droppable droppableId="activeBanners">
                {(provided) => (
                  <ul
                    role="list"
                    className="flex flex-col gap-5 w-full"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {banners
                      .filter((item) => item.status === "Y")
                      .map((item, index) => (
                        <Draggable key={item.bannerId} draggableId={item.bannerId.toString()} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="col-span-1 w-full h-full divide-y divide-gray-200 border rounded-lg bg-white shadow"
                            >
                              <div className="flex items-center w-full h-full">
                                {imageLoading &&
                                  <div className="w-full flex justify-center items-center">로딩
                                    중...</div>} {/* 로딩 중 표시 */}
                                <img
                                  src={`/api/banner/view/${item.bannerId}`}
                                  alt={item.bannerOriginalName}
                                  onLoad={handleImageLoad}
                                  style={{ display: imageLoading ? "none" : "block" }} // 이미지가 로딩 중이면 숨기고 로딩이 끝난 후에 표시
                                  className="w-[85%] h-auto object-cover rounded-tl-lg rounded-bl-lg border-r"
                                />
                                <div className="flex flex-col justify-center w-[15%]">
                                  <button
                                    onClick={() => handleDeleteBanner(item.bannerId)}
                                    className="w-full flex items-center justify-center rounded-br-lg border-transparent pb-4 px-4 text-sm font-semibold text-gray-900 hover:text-red-500 text-nowrap"
                                  >
                                    <Close style={{ fontSize: "20px" }}
                                           className="flex justify-center items-center h-5 w-5 mr-2" />
                                    삭제
                                  </button>
                                  <div className="border-b"></div>
                                  <button
                                    onClick={() => handleChangeNBanner(item.bannerId)}
                                    className="w-full flex items-center justify-center rounded-br-lg border-transparent pt-4 px-4 text-sm font-semibold text-gray-900 hover:text-blue-500 text-nowrap"
                                  >
                                    <VisibilityOff style={{ fontSize: "20px" }}
                                                   className="flex justify-center items-center h-5 w-5 mr-2" />
                                    숨김
                                  </button>
                                </div>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder} {/* Placeholder for drag item */}
                  </ul>
                )}
              </Droppable>
            </div>

            {/* Inactive Banners */}
            <div className="w-full">
              <h2 className="text-lg w-full mb-4 text-gray-800 border-b-2 border-red-500 pb-1 inline-block">
                숨긴 배너
              </h2>
              <ul role="list" className="flex flex-col gap-5 w-full">
                {banners
                  .filter((item) => item.status === "N")
                  .map((item) => (
                    <li
                      key={item.bannerId}
                      className="col-span-1 w-full h-full divide-y divide-gray-200 border rounded-lg bg-white shadow"
                    >
                      <div className="flex items-center w-full h-full">
                        {imageLoading &&
                          <div className="w-full flex justify-center items-center">로딩
                            중...</div>} {/* 로딩 중 표시 */}
                        <img
                          src={`/api/banner/view/${item.bannerId}`}
                          alt={item.bannerOriginalName}
                          onLoad={handleImageLoad}
                          style={{ display: imageLoading ? "none" : "block" }} // 이미지가 로딩 중이면 숨기고 로딩이 끝난 후에 표시
                          className="w-[85%] h-auto object-cover rounded-tl-lg rounded-bl-lg border-r"
                        />
                        <div className="flex flex-col justify-between w-[15%] h-full">
                          <button
                            onClick={() => handleDeleteBanner(item.bannerId)}
                            className="flex items-center justify-center rounded-br-lg border-transparent pb-4 px-4 text-sm font-semibold text-gray-900 hover:text-red-500 text-nowrap"
                          >
                            <Close style={{ fontSize: "20px" }}
                                   className="flex justify-center items-center h-5 w-5 mr-2" />
                            삭제
                          </button>
                          <div className="border-b"></div>
                          <button
                            onClick={() => handleChangeYBanner(item.bannerId)}
                            className="flex items-center justify-center rounded-br-lg border-transparent pt-4 px-4 text-sm font-semibold text-gray-900 hover:text-green-500 text-nowrap"
                          >
                            <Visibility style={{ fontSize: "20px" }}
                                        className="flex justify-center items-center h-5 w-5 mr-2" />
                            표시
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </DragDropContext>
      </div>
    </>
  );
}
