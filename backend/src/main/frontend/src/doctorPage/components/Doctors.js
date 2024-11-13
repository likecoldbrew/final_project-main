import React, { useEffect, useState } from "react";
import { FileText, Folder, FolderPlus, LogOut, Send, Settings as FeatherSettings, Smile, User } from "react-feather";
import { Menu, MessageSquare } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../../utils/UserContext";
import { Home } from "@mui/icons-material";

// 아이콘 배열 (카테고리와 순서를 맞춰서 배치)
const icons = {
  "patient": <User size={20} />,         // 환자 관리
  "certificate": <FileText size={20} />,     // 증명서 요청
  "hostipal": <FolderPlus size={20} />,   // 입원 신청
  "schedule": <Send size={20} />,     // 휴무 신청
  "setting": <FeatherSettings size={20} /> // 마이페이지
  // 필요한 만큼 아이콘 추가
};

const SidebarAndNavbar = () => {
  const { userInfo, setUserInfo } = useUser(); // 현재 로그인한 사용자 정보 가져오기
  const [isOpen, setIsOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  //nav 이동
  const navigate = useNavigate();
  const toggleSidebar = () => setIsOpen(!isOpen);  // 사이드바 토글
  const toggleDropdown = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);  // 드롭다운 메뉴 토글
  };
  // 이제 userInfo를 직접 사용 가능
  // console.log(userInfo);
  // 카테고리를 기반으로 동적 메뉴 생성
  // const menuItems = category.map((item, index) => ({
  //     key: String(index + 1),
  //     icon: icons[index] || <Folder size={20} />,
  //     label: item.name,
  //     dropdown: item.subcategories || [], // subcategories가 배열인지 확인
  //     url: item.urlName
  // }));

  // API 호출
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch("/api/category/doctor");
        const data = await response.json();

        // MenuItems
        if (data && data.length > 0) {
          setMenuItems(data.map((item, index) => ({
            key: String(index + 1), // 고유 키 값 (index를 문자열로 변환)
            icon: icons[item.urlName] || <Folder size={20} />, // 아이콘 배열에서 가져오고, 없으면 기본 아이콘 사용
            label: item.name, // 카테고리 이름 사용
            dropdown: item.subcategories.map(sub => {
              let url = `${item.urlName}/${sub.urlName}`;
              // sub.urlName이 'board'일 경우 URL에 '?category=notice' 추가
              if (sub.urlName === "board") {
                url = url + "?category=notice";
              }
              return {
                ...sub,
                url: url // 수정된 URL 할당
              };
            }),
            url: item.urlName
          })));
        }
      } catch (error) {
        console.error("사용자 가져오기 오류:", error);
      }
    };
    fetchCategory();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token"); // 토큰 제거
    setUserInfo({});
    navigate("/main/empSite"); // 메인 페이지로 리다이렉트
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white text-black w-64 min-h-screen p-4 
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                transition-transform duration-300 ease-in-out fixed left-0 top-0`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Smile size={24} className="w-10 h-10 rounded-full mr-3 " />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{userInfo.userName}</h2>
              <p className="text-xs text-gray-500">{userInfo.role}</p>
            </div>
          </div>
          <button className="relative hover:text-blue-400 transition-colors">
            <LogOut className="w-6 h-6" onClick={handleLogout} />
          </button>
          <button onClick={toggleSidebar} className="md:hidden">
            <FileText size={24} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-3 py-2 text-sm text-black bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <nav>
          <ul>
            {menuItems.map((menuItem) => (
              <li key={menuItem.key} className="mb-2">
                {menuItem.dropdown.length > 0 ? (
                  // 드롭다운이 있는 경우 버튼으로 토글
                  <button
                    onClick={() => toggleDropdown(menuItem.key)}
                    className="flex items-center w-full px-4 py-2 text-blue-900 hover:bg-blue-500 hover:text-white rounded-md transition-colors duration-200"
                  >
                    {menuItem.icon}
                    <span className="ml-3">{menuItem.label}</span>
                    <svg
                      className={`ml-auto h-5 w-5 transform ${
                        activeDropdown === menuItem.key ? "rotate-180" : ""
                      } transition-transform duration-200`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                    </svg>
                  </button>
                ) : (
                  // 드롭다운이 없는 경우 바로 링크
                  <Link
                    to={menuItem.urlName}
                    className="flex items-center w-full px-4 py-2 text-blue-900 hover:bg-blue-500 hover:text-white rounded-md transition-colors duration-200"
                  >
                    {menuItem.icon}
                    <span className="ml-3">{menuItem.label}</span>
                  </Link>
                )}

                {menuItem.dropdown.length > 0 && activeDropdown === menuItem.key && (
                  <ul className="pl-4 mt-2 space-y-1">
                    {menuItem.dropdown.map((subItem, index) => {
                      return (
                        <li key={index}>
                          <Link
                            to={`${subItem.urlName}/${userInfo.userNo}`}
                            className="block w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-400 hover:text-white rounded-md transition-colors duration-200"
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>

        </nav>
      </aside>

      {/* Main content */}
      {/* Navbar */}
      <main className={`flex-1 z-0 ${isOpen ? "md:ml-64" : ""}`}>
        <nav className="bg-blue-300 text-white p-4  w-full">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center text-2xl font-bold w-1/4">
              <Link to="/doctor/" className="flex items-center">
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
              <button className="relative hover:text-yellow-300 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </button>
              <button onClick={toggleSidebar}>
                <Menu className=" relative hover:text-yellow-300 w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
        {/* 동적으로 변경되는 콘텐츠 영역 */}
        <div className="p-4">
          <Outlet /> {/* URL에 따라 렌더링될 콘텐츠 */}
        </div>
      </main>
    </div>
  );
};

export default SidebarAndNavbar;
