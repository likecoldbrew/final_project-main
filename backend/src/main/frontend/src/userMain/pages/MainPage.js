import React, { useEffect, useState } from "react";
import "../style/tailwind.css";
import { Link } from "react-router-dom";
import Map from "../components/Map";
import ChatBot from "../components/ChatBot";

const MainPage = () => {
  //이미지 번호
  const [currentIndex, setCurrentIndex] = useState(0);
  //바로가기 값들
  const [contentItems, setContentItems] = useState([]);
  //병원 후기 글 정보
  const [boards, setBoards] = useState([]);
  //공지사항 글
  const [notices, setNotices] = useState([]);
  //병원 정보
  const [hospital, setHospital] = useState("");
  //FAQ 정보
  const [faqs, setFaqs] = useState([]);
  //FAQ 답
  const [expandedIndex, setExpandedIndex] = useState(null);
  //배너
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchBoards();
    fetchNotices();
    fetchHospital();
    fetchFaqs();
  }, []);

  //바로가기 값 불러오기
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category/main");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const contents = await response.json();
      // 필요한 카테고리 ID 목록
      const contentsIds = [110, 100, 121, 103];
      // 카테고리 이름 매핑
      const contentsNames = {
        110: "간편예약",
        100: "진료과/의료진 검색",
        121: "증명서 발급",
        103: "이용안내"
      };
      const contentsInfo = {
        110: "쉽고 편하게 진료 예약을 할 수 있습니다.",
        100: "원하는 진료과 또는 의료진을 \n 검색하실 수 있습니다.",
        121: "필요한 증명서를 신청 후 \n 편하게 다운받아 볼 수 있습니다",
        103: "병원 위치 및 예약 가능 시간을 \n 확인 할 수 있습니다"
      };
      const btnName = {
        110: "예약하기",
        100: "검색하기",
        121: "발급하기",
        103: "이동하기"
      };
      // selectedCategoryIds 순서대로 아이템 생성
      const items = contentsIds.map((id) => {
        const content = contents.find((category) => category.categoryId === id);
        if (content) {
          const subCategory = content.subcategories && content.subcategories[0];
          console.log("username", content.urlName)
          return {
            contentName: contentsNames[content.categoryId],
            contentsInfo: contentsInfo[content.categoryId],
            path: `/main/${content.urlName}`,
            categoryName: content.name,
            subCategoryName: subCategory ? subCategory.name : "",
            btnName: btnName[content.categoryId] || ""
          };
        } else {
          const subCategoryParent = contents.find((content) =>
            content.subcategories.some((sub) => sub.categoryId === id)
          );
          if (subCategoryParent) {
            const foundSub = subCategoryParent.subcategories.find((sub) => sub.categoryId === id);
            return {
              contentName: foundSub ? foundSub.name : contentsNames[id],
              contentsInfo: contentsInfo[id],
              path: `/main/${foundSub ? foundSub.urlName : ""}`,
              categoryName: subCategoryParent.name,
              subCategoryName: foundSub ? foundSub.name : "",
              btnName: btnName[id] || ""
            };
          }
        }
        return null;
      }).filter((item) => item !== null);
      setContentItems(items); // 잘 필터링된 아이템을 상태에 설정
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  //배너 정보 가져오기
  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banner/list");
      const data = await response.json();

      if (data && data.length > 0) {
        setBanners(data);
      }
    } catch (error) {
      console.error("Error fetching day off data:", error);
    }
  };

  // 이미지 슬라이드 효과
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 3500); // 3초마다 이미지 변경
      return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 클리어
    }
  }, [banners.length]);


  const goToImage = (index) => {
    setCurrentIndex(index);
  };


  //후기글 정보
  // 게시글(병원후기) 정보 가져오기
  const fetchBoards = async () => {
    const response = await fetch("/api/board/all");
    const data = await response.json();
    //게시글 5개만 가져오기
    const limitedData = data.length > 5 ? data.slice(0, 5) : data;
    // 날짜 포맷 변환
    const formattedData = limitedData.map((board) => ({
      ...board,
      createAt: board.updateAt ? formatDate(board.updateAt) : formatDate(board.createAt)// 날짜 포맷 변경
    }));
    setBoards(formattedData); // 변환된 데이터로 상태 업데이트
  };

  // 게시글 정보 가져오기
  const fetchNotices = async () => {
    const response = await fetch("/api/board/allNotice");
    const data = await response.json();
    //공지사항 5개만 가져오기
    const limitedData = data.length > 5 ? data.slice(0, 5) : data;
    // 날짜 포맷 변환
    const formattedData = limitedData.map((board) => ({
      ...board,
      createAt: board.updateAt ? formatDate(board.updateAt) : formatDate(board.createAt) // 날짜 포맷 변경
    }));
    setNotices(formattedData); // 변환된 데이터로 상태 업데이트
  };

  //병원 정보
  const fetchHospital = async () => {
    try {
      const response = await fetch("/api/hospital/all");
      const data = await response.json();
      setHospital(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };
  // FAQ 정보 호출
  const fetchFaqs = async () => {
    const response = await fetch("/api/faq/all");
    const data = await response.json();
    const limitedData = data.length > 5 ? data.slice(0, 9) : data;
    setFaqs(limitedData);
  };

  //FAQ질문 답 토글
  const toggleAnswer = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index); // Toggle the answer
  };

  // 날짜 포맷 변환 함수
  const formatDate = (timestamp) => {
    const date = new Date(timestamp); // timestamp를 Date 객체로 변환
    const year = date.getFullYear(); // 연도
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월 (0부터 시작하므로 1 추가)
    const day = String(date.getDate()).padStart(2, "0"); // 일
    return `${year}-${month}-${day}`; // 형식: YYYY-MM-DD
  };


  return (
    <div className="flex flex-col min-h-screen bg-sky-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/*배너*/}
        <div className="relative overflow-hidden h-80"> {/* 높이를 설정 */}
          {/* banner 배열을 이용해 동적으로 이미지 렌더링 */}
          {banners.length > 0 ? (
            banners.map((item, index) => (
              <div key={item.bannerId} className="absolute inset-0">
                <img
                  src={`/api/banner/view/${item.bannerId}`} // 동적으로 이미지 경로 생성
                  className={`w-full object-cover transition-opacity duration-1000 ease-in-out rounded-[10px] ${
                    currentIndex === index
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full" // 왼쪽으로 이동
                  }`}
                  alt={item.bannerOriginalName}
                />
                {/* 배너 이미지 클릭 버튼 */}
                <div className="absolute mt-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, btnIndex) => (
                    <button
                      key={btnIndex}
                      className={`w-3 h-3 rounded-full ${
                        currentIndex === btnIndex ? "bg-blue-600" : "bg-gray-400"
                      }`}
                      onClick={() => goToImage(btnIndex)} // 클릭 이벤트 작동
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>배너가 없습니다.</p>
          )}
        </div>
        {/* 바로가기 메뉴? */}
        <div className="grid grid-cols-4 gap-4 ">
          {contentItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center rounded-lg bg-white shadow-md p-4">
              <div className="text-center mt-8 text-sky-700 font-bold text-lg mb-2"
                   style={{ flex: "0 0 20%" }}>{item.contentName} </div>
              <div className="text-center text-gray-600 mb-4" style={{ flex: "0 0 40%" }} dangerouslySetInnerHTML={{
                __html: `● ${item.contentsInfo.replace(/\n/g, "<br />")}`
              }}></div>
              <Link
                key={index}
                to={item.path}
                className="px-4 hover:bg-sky-200 hover:font-bold py-2 mb-4 border rounded-md bg-white text-blue-500 disabled:text-gray-300"
              >
                {item.btnName}
              </Link>
            </div>
          ))}
        </div>
        <hr className="border-[3px] border-dashed border-sky-200 mb-4 mt-10" />
        {/* 컨텐츠[공지사항/커뮤니티 등] */}
        <div className="grid grid-cols-2 grid-rows-[auto,1fr] gap-4 mt-10">
          {/* 커뮤니티(병원후기) */}
          <div className="flex flex-col justify-center rounded-lg bg-white shadow-md p-4">
            <div
              className="text-center mt-3 text-sky-700 font-bold text-lg pb-3 border-b-2 border-blue-700 w-full">커뮤니티
            </div>
            <div className="text-gray-600 mb-4 mt-2 w-full">
              {boards.length > 0 ? (
                <>
                  {boards.map((board) => (
                    <div key={board.id} className="border-b border-blue-200 w-full px-1 py-2 h-12 flex items-center">
                      <div className="w-4/5 overflow-hidden text-ellipsis whitespace-nowrap">제목:
                        <Link
                          to={`/main/community/detail/${board.boardId}`} // 제목 클릭 시 이동할 경로
                          className="text-blue-500 hover:underline"
                        >
                          <span className="ml-2">{board.title}</span>
                        </Link>
                      </div>
                      <div className="w-2/5 text-center overflow-hidden text-ellipsis whitespace-nowrap">작성자: <span
                        className="ml-2 text-sky-400">{board.userId}</span>
                      </div>
                      <div className="w-2/5 text-right">작성일: <span
                        className="ml-2 text-sky-400"> {board.updateAt ? formatDate(board.updateAt) : formatDate(board.createAt)}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : "게시글 불러오는 중"}
            </div>
            <Link
              to="/main/community"
              className="px-4 text-right hover:font-bold py-2 text-blue-500"
            >
              더보기
            </Link>
          </div>
          {/* 공지사항*/}
          <div className="flex flex-col justify-center rounded-lg bg-white shadow-md p-4">
            <div
              className="text-center mt-3 text-sky-700 font-bold text-lg pb-3 border-b-2 border-blue-700 w-full overflow-hidden text-ellipsis whitespace-nowrap">공지사항
            </div>
            <div className="text-gray-600 mb-4 mt-2 w-full">
              {notices.length > 0 ? (
                <>
                  {notices.map((notice) => (
                    <div key={notice.id} className="border-b border-blue-200 w-full px-1 py-2 h-12 flex items-center">
                      <div className="w-3/5 overflow-hidden text-ellipsis whitespace-nowrap">제목:
                        <Link
                          to={`/main/notice/detail/${notice.boardId}`} // 제목 클릭 시 이동할 경로
                          className="text-blue-500 hover:underline">
                          <span className="ml-2">{notice.title}</span>
                        </Link>
                      </div>
                      <div className="w-2/5 text-right">작성일: <span
                        className="ml-2 text-sky-400"> {notice.createAt}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : "공지사항 불러오는 중"}
            </div>
            <Link
              to="/main/notice"
              className="px-4 text-right hover:font-bold py-2 text-blue-500"
            >
              더보기
            </Link>
          </div>
          {/* 병원정보*/}
          <div className="flex flex-col justify-center rounded-lg bg-white shadow-md p-4">
            <div
              className="text-center mt-3 text-sky-700 font-bold text-lg pb-3 border-b-2 border-blue-700 w-full">병원 정보
            </div>
            <div className="text-gray-600 mb-4 mt-2 w-full">
              {hospital ? (
                <div className="flex flex-row mt-3">
                  <div className="text-lg w-[48%]"><span className="font-bold"> 진료 시간</span>
                    <div className="mt-3">{hospital.clinicTime}</div>
                  </div>
                  <div className="text-lg w-[48%] border-l border-dashed border-l-blue-200 pl-2"><span
                    className="font-bold">예약 가능 시간</span>
                    <div className="mt-3">{hospital.reserveTime}</div>
                  </div>
                </div>
              ) : "병원 정보 불러오는 중"}
              <div className="rounded-[5px] mt-6 border-2 border-t border-blue-300 w-full px-2">
                <div className="text-lg font-bold my-2">
                  병원 위치
                </div>
                <Map width="100%" height="270px" />
              </div>
            </div>
            <Link
              to="/main/hospitalInfo"
              className="px-4 text-right hover:font-bold py-2 text-blue-500"
            >
              더보기
            </Link>
          </div>
          {/* FAQ*/}
          <div className="flex flex-col rounded-lg bg-white shadow-md p-4">
            <div
              className="text-center mt-3 text-sky-700 font-bold text-lg pb-3 border-b-2 border-blue-700 w-full">FAQ
              자주하는 질문
            </div>
            <div className="text-gray-600 mb-4 mt-2 w-full">
              {faqs.length > 0 ? (
                <>
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="border-b border-blue-200 w-full">
                      <div className="px-1 py-2 h-12 flex items-center cursor-pointer"
                           onClick={() => toggleAnswer(index)}>
                        <p className=" text-blue-500 cursor-pointer">
                          {faq.title}</p>
                      </div>
                      {expandedIndex === index && ( // Conditionally render answer
                        <div className="px-4 pb-2">
                          <hr className="border-t border-sky-200 mb-2" />
                          <p className="text-gray-600 " style={{ whiteSpace: "pre-line" }}>{faq.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : "FAQ 불러오는 중"}
            </div>
            <Link
              to="/main/faq"
              className="px-4 text-right hover:font-bold py-2 text-blue-500"
            >
              더보기
            </Link>
          </div>
        </div>
      </main>
      <div className="fixed right-2 bottom-4 rounded-lg p-4">
        <ChatBot />
      </div>
    </div>
  );
};

export default MainPage;
