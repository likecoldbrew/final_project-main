import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const SubCategories = () => {
  const { urlName } = useParams(); // URL에서 urlName 가져오기
  const [category, setCategory] = useState(null);
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/category/${urlName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategory(data); // 가져온 데이터로 상태 업데이트
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();
  }, [urlName]);

  return (
    <div className="flex flex-col bg-white">
      <div className="w-full bg-sky-100 py-2 border-y border-sky-200">
        <div className="container mx-auto px-4">
          <p className="text-sky-800 font-semibold">
            {/* 선택된 카테고리 정보 표시 */}
            {selectCategory && selectSubCategory ? (
              <>
                {selectCategory} | {selectSubCategory}
              </>
            ) : category ? (
              <>
                {category.parentCategory} | {category.subCategory}
              </>
            ) : (
              `카테고리 정보를 불러오는 중...`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubCategories;
