import React, { useCallback, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Calendar, Coffee, Edit, Layers, LogOut, Meh, Settings, Smile, Users } from "react-feather";
import { Menu, MessageSquare } from "lucide-react";
import { Home, KeyboardArrowDown } from "@mui/icons-material";
import { useUser } from "../../utils/UserContext";
import { useCategoryContext } from "../../utils/CategoryContext";
import Chatting from "../../components/Chatting";

const icons = {
  "list": <Users size={20} />, // 회원 관리
  "dayoff": <Calendar size={20} />, // 휴무 관리
  "approval": <Edit size={20} />, // 입원 승인
  "meal": <Coffee size={20} />, // 식단 등록
  "category": <Layers size={20} />, // 카테고리 관리
  "site": <Settings size={20} /> // 사이트 관리
  // 필요한 만큼 아이콘 추가
};

const SidebarAndNavbar = () => {
  const { isCategoryUpdate, setIsCategoryUpdate } = useCategoryContext(); // 카테고리 변경 시 재렌더링
  const { userInfo } = useUser(); // useUser로 userInfo 가져오기
  const [isOpen, setIsOpen] = useState(true); // 사이드바 열림/닫힘 상태
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]); // 필터링된 메뉴 항목 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [activeDropdowns, setActiveDropdowns] = useState([]); // 배열로 변경
  const [activeMenuItem, setActiveMenuItem] = useState(null); // 현재 선택된 메뉴 항목 상태
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0); // 안 읽은 채팅 총 계수
  const [isChattingModalOpen, setIsChattingModalOpen] = useState(false);

  // API 호출
  const fetchCategory = useCallback(async () => {
    try {
      const response = await fetch("/api/category/admin");
      const data = await response.json();

      if (data && data.length > 0) {
        const mappedItems = data.map((item) => ({
          categoryId: item.categoryId,
          icon: icons[item.urlName] || <Box size={20} />,
          dropdown: item.subcategories.map((sub) => {
            let url = `${item.urlName}/${sub.urlName}`;
            if (sub.urlName === "board") {
              url = `${url}?category=notice`;
            }
            return { ...sub, urlName: url };
          }),
          name: item.name,
          urlName: item.urlName,
          categoryOrder: item.categoryOrder,
          status: item.status
        }));
        setMenuItems(mappedItems);
        setFilteredMenuItems(mappedItems);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategory();
    setIsCategoryUpdate(false);
  }, [isCategoryUpdate, fetchCategory]);

  useEffect(() => {
    // 컴포넌트가 처음 마운트될 때 세션 저장소에서 상태를 불러오기
    const storedDropdowns = sessionStorage.getItem("activeDropdowns");
    if (storedDropdowns) {
      setActiveDropdowns(JSON.parse(storedDropdowns));
    }

    const storedActiveMenuItem = sessionStorage.getItem("activeMenuItem");
    if (storedActiveMenuItem) {
      setActiveMenuItem(storedActiveMenuItem);
    }

    // 여기에 페이지 새로 고침 시 하위 카테고리가 클릭된 상태로 유지하도록 설정
    const pathname = window.location.pathname; // 현재 경로 가져오기
    const matchedMenuItem = menuItems.find(item => item.dropdown.some(sub => sub.urlName === pathname));

    if (matchedMenuItem) {
      setActiveDropdowns(prev => [...prev, matchedMenuItem.categoryId]); // 해당 하위 카테고리의 드롭다운 열기
      // setActiveMenuItem(pathname); // 활성화된 메뉴 항목 설정
    }

    const handleResize = () => {
      setIsOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // 초기 호출

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // 검색어 변경 시 필터링 로직
  useEffect(() => {
    const filteredItems = menuItems.map((menuItem) => {
      // 상위 카테고리가 검색어와 일치하는지 확인
      const isMainMatch = menuItem.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 하위 카테고리 중 검색어와 일치하는 항목 필터링
      const filteredSubcategories = menuItem.dropdown.filter((subItem) =>
        subItem.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // 상위 카테고리나 하위 카테고리가 검색어와 일치하면 필터링된 항목으로 유지
      if (isMainMatch || filteredSubcategories.length > 0) {
        return {
          ...menuItem,
          dropdown: isMainMatch ? menuItem.dropdown : filteredSubcategories // 상위 카테고리와 일치하면 전체 하위 카테고리 포함
        };
      }

      // 일치하지 않으면 null로 반환
      return null;
    }).filter(Boolean); // null 제거

    setFilteredMenuItems(filteredItems);
  }, [searchTerm, menuItems]);

  // 사이드바 열림/닫힘 토글
  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // 하나의 드롭다운이 열려 있을 때 다른 드롭다운도 동시에 열기 (드롭다운 토글 함수)
  const toggleDropdown = useCallback((key) => {
    setActiveDropdowns((prev) => {
      const newDropdowns = prev.includes(key)
        ? prev.filter((dropdownKey) => dropdownKey !== key)
        : [...prev, key];
      sessionStorage.setItem("activeDropdowns", JSON.stringify(newDropdowns));
      return newDropdowns;
    });
  }, []);

  const handleMenuClick = useCallback((menuItemUrl) => {
    setActiveMenuItem(menuItemUrl);
    sessionStorage.setItem("activeMenuItem", menuItemUrl);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");

    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

    alert("로그아웃되었습니다.");
  }, []);

  const toggleChattingModal = () => {
    setIsChattingModalOpen(prevState => !prevState);
  };

  const fetchUnreadMessages = useCallback(async () => {
    if (!userInfo.userNo) return; // 사용자 번호가 없으면 API 호출을 하지 않음

    try {
      const response = await fetch(`/api/chatting/totalUnReadMessage/${userInfo.userNo}`);
      if (response.ok) {
        const data = await response.json();
        setTotalUnreadMessages(data.totalUnreadMessages); // 안 읽은 메시지 수 상태 업데이트
      } else {
        console.error("Failed to fetch unread messages");
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  }, [userInfo.userNo]);

  useEffect(() => {
    if (userInfo.userNo) {
      fetchUnreadMessages();
    }
  }, [userInfo.userNo, fetchUnreadMessages]);


  return (
    <div className="flex min-h-screen">
      {/* 사이드 바 */}
      <aside
        className={`bg-white text-black w-64 min-h-screen p-4 h-full
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                 transition-transform duration-300 ease-in-out fixed left-0 top-0 z-50`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="group">
              <Smile
                size={24}
                className="w-10 h-10 rounded-full mr-3 group-hover:hidden" // 마우스 오버 시 숨겨짐
              />
              <Meh
                size={24}
                className="w-10 h-10 rounded-full mr-3 hidden group-hover:block" // 마우스 오버 시 보이게 됨
              />
            </div>
            <div>
              {userInfo.userNo ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">{userInfo.userName}</h2>
                  {userInfo.role === "ADMIN" && (
                    <p className="text-xs text-gray-500">관리자</p>
                  )}
                </>
              ) : (
                <Link to="/main/empSite" className="text-lg font-semibold text-gray-800">Login</Link>
              )}
            </div>
          </div>
          {/* 유저 정보가 있을 때만 로그아웃 버튼 표시 */}
          {userInfo.userNo && (
            <button className="relative hover:text-blue-400 transition-colors" onClick={handleLogout}>
              <Link to="/main/empSite">
                <LogOut className="w-6 h-6" />
              </Link>
            </button>
          )}
        </div>

        {/* 카테고리 검색 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm} // 검색어 상태 반영
            onChange={(e) => setSearchTerm(e.target.value)} // 검색어 상태 업데이트
            className="w-full px-3 py-2 text-sm text-black bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <ul>
            {filteredMenuItems.map((menuItem) => (
              <li key={menuItem.categoryId} className="mb-2">
                {menuItem.dropdown.length > 0 ? (
                  // 드롭다운이 있는 경우 버튼으로 토글
                  <button
                    onClick={() => toggleDropdown(menuItem.categoryId)}
                    className="flex items-center w-full px-4 py-2 text-blue-900 rounded-md
                      hover:bg-blue-500 hover:text-white transition-colors duration-200"
                  >
                    {menuItem.icon}
                    <span className="ml-3">{menuItem.name}</span>
                    <KeyboardArrowDown className={`ml-auto h-5 w-5 transform
                      ${activeDropdowns.includes(menuItem.categoryId) ? "rotate-180" : ""}
                      transition-transform duration-200`}
                    />
                  </button>
                ) : (
                  // 드롭다운이 없는 경우 바로 링크
                  <Link
                    to={menuItem.urlName}
                    onClick={() => handleMenuClick(menuItem.urlName)}
                    className={`flex items-center w-full px-4 py-2 text-blue-900 rounded-md 
                      ${activeMenuItem === menuItem.urlName ? "bg-blue-500 text-white" : ""} 
                      hover:bg-blue-500 hover:text-white transition-colors duration-200`}
                  >
                    {menuItem.icon}
                    <span className="ml-3">{menuItem.name}</span>
                  </Link>
                )}

                {/* 하위 카테고리 */}
                {menuItem.dropdown.length > 0 &&
                  activeDropdowns.includes(menuItem.categoryId) && (
                    <ul className="pl-4 mt-2 space-y-1">
                      {menuItem.dropdown.map((subItem, index) => (
                        <li key={index}>
                          <Link
                            to={subItem.urlName}
                            onClick={() => handleMenuClick(subItem.urlName)}
                            className={`block w-full text-left px-4 py-2 text-sm rounded-md 
                              ${activeMenuItem === subItem.urlName ? "bg-blue-400 text-white" : "text-blue-800"} 
                              hover:bg-blue-400 hover:text-white transition-colors duration-200`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      {/* 네비게이션 바 */}
      <main className={`flex-1  ${isOpen ? "md:ml-64" : ""}`}>
        <nav className="bg-blue-300 text-white p-4 w-full">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center text-2xl font-bold w-1/4">
              <Link to="/admin/" className="flex items-center">
                <img className="mr-3 w-1/12" src="/images/mediGom_Logo.png" />
                Medi<span className="text-yellow-300">Gom</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <button className="relative hover:text-yellow-300 transition-colors">
                <Link to={"/main"}>
                  <Home className="w-6 h-6" />
                </Link>
              </button>
              <button className="relative hover:text-yellow-300 transition-colors" onClick={toggleChattingModal}>
                <MessageSquare className="w-6 h-6" />
                {/* 안읽은 메시지 배지 */}
                {totalUnreadMessages > 0 && (
                  <span
                    className="absolute bottom-3 left-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalUnreadMessages}
                </span>
                )}
              </button>
              <button onClick={toggleSidebar}>
                <Menu className=" relative hover:text-yellow-300 w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* 동적으로 변경되는 콘텐츠 영역 */}
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
      {isChattingModalOpen && (
        <div className="inset-0 bg-opacity-50 w-2/5 h-40">
          <Chatting />
        </div>
      )}
    </div>
  );
};

export default SidebarAndNavbar;
