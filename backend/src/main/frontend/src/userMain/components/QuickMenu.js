import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const QuickMenu = () => {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [sidebarItems, setSidebarItems] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category/main");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const categories = await response.json();
        // 필요한 카테고리 ID 목록
        const selectedCategoryIds = [110, 100, 121, 103];
        // 아이콘 매핑
        const icons = {
          110: "🗓️", // 간편예약
          100: "🔍", // 진료과/의료진 검색
          121: "📄", // 증명서 발급
          103: "ℹ️", // 이용안내
        };
        // 카테고리 이름 매핑
        const categoryNames = {
          110: "간편예약",
          100: "진료과/의료진 검색",
          121: "증명서 발급",
          103: "이용안내",
        };
        // selectedCategoryIds 순서대로 아이템 생성
        const items = selectedCategoryIds
          .map((id) => {
            const category = categories.find((category) => category.categoryId === id);
            if (category) {
              const subCategory = category.subcategories && category.subcategories[0];

              return {
                name: categoryNames[category.categoryId],
                icon: icons[category.categoryId],
                path: `/main/${category.urlName}`,
                categoryName: category.name, // 카테고리 이름
                subCategoryName: subCategory ? subCategory.name : "", // 첫 번째 서브카테고리 이름
              };
            } else {
              const subCategoryParent = categories.find((category) =>
                category.subcategories.some((sub) => sub.categoryId === id)
              );
              if (subCategoryParent) {
                const foundSub = subCategoryParent.subcategories.find((sub) => sub.categoryId === id);
                return {
                  name: foundSub ? foundSub.name : null,
                  icon: icons[id],
                  path: `/main/${foundSub ? foundSub.urlName : ""}`,
                  categoryName: subCategoryParent.name, // 부모 카테고리 이름
                  subCategoryName: foundSub ? foundSub.name : "", // 서브카테고리 이름
                };
              }
            }
            return null;
          })
          .filter((item) => item && item.name);

        setSidebarItems(items);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleNavigation = (path) => {
    navigate(path); // path로 이동
  };
  return (
    <div className="sticky top-10 right-4 bg-sky-100 rounded-lg p-4 shadow-md h-60 w-64">
      <div className="space-y-4 h-full  overflow-y-auto">
        {sidebarItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            state={{
              selectCategory: item.categoryName,
              selectSubCategory: item.subCategoryName,
            }}
            className="w-full bg-white hover:bg-sky-200 text-sky-800 font-bold py-2 px-4 rounded flex items-center justify-center transition-colors"
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
export default QuickMenu;
