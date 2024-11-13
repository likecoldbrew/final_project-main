import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import { Calendar, Coffee, Edit, FolderPlus, Layers, Loader, Settings, Users } from "react-feather";
import { ManageAccounts } from "@mui/icons-material";
import { useCategoryContext } from "../../../utils/CategoryContext";

const icons = {
  "list": <Users size={20} />, // 회원 관리
  "dayoff": <Calendar size={20} />, // 휴무 관리
  "approval": <Edit size={20} />, // 입원 승인
  "meal": <Coffee size={20} />, // 식단 등록
  "category": <Layers size={20} />, // 카테고리 관리
  "site": <Settings size={20} /> // 사이트 관리
  // 필요한 만큼 아이콘 추가
};

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { setIsCategoryUpdate } = useCategoryContext();
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/category/admin");
        const data = await response.json();

        if (data && data.length > 0) {
          setCategories(data.map((item, index) => ({
            key: String(index + 1),
            icon: icons[item.urlName] || <FolderPlus size={20} />,
            dropdown: item.subcategories,
            categoryId: item.categoryId,
            name: item.name,
            urlName: item.urlName,
            categoryOrder: item.categoryOrder,
            status: item.status
          })));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategory();
  }, []);

  const handleOnDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "CATEGORY") {
      const items = Array.from(categories);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setCategories(items.map((d, i) => ({ ...d, categoryOrder: i })));
    }

    if (type === "SUBCATEGORY") {
      const categoryIndex = source.droppableId.split("-")[1];
      const updatedCategories = [...categories];
      const subcategories = Array.from(updatedCategories[categoryIndex].dropdown);
      const [reorderedSubcategory] = subcategories.splice(source.index, 1);
      subcategories.splice(destination.index, 0, reorderedSubcategory);
      updatedCategories[categoryIndex].dropdown = subcategories.map((d, i) => ({ ...d, categoryOrder: i }));
      setCategories([...updatedCategories]);
    }
  };

  const saveOrder = async () => {
    const newCategories = categories.map(category => ({
      categoryId: category.categoryId,
      categoryOrder: category.categoryOrder,
      subcategories: category.dropdown.map(subcategory => ({
        categoryId: subcategory.categoryId,
        categoryOrder: subcategory.categoryOrder
      }))
    }));

    try {
      const response = await fetch("/api/category/admin/update/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategories)
      });

      if (response.ok) {
        alert("카테고리 순서가 저장되었습니다.");
        setIsCategoryUpdate(true);
      } else {
        alert("순서 저장 실패");
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const toggleEditMode = () => setIsEditing((prev) => !prev);

  const saveName = async () => {
    const newCategories = categories.map(category => ({
      categoryId: category.categoryId,
      name: category.name,
      subcategories: category.dropdown.map(subcategory => ({
        categoryId: subcategory.categoryId,
        name: subcategory.name
      }))
    }));

    try {
      const response = await fetch(`/api/category/admin/update/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategories)
      });

      if (response.ok) {
        alert("카테고리 이름이 저장되었습니다.");
        setIsCategoryUpdate(true);
        toggleEditMode();
      } else {
        alert("이름 저장 실패");
      }
    } catch (error) {
      console.error("Error saving names:", error);
    }
  };

  const handleNameChange = (index, newName) => {
    const updatedCategories = categories.map((category, i) =>
      i === index ? { ...category, name: newName } : category
    );
    setCategories(updatedCategories);
  };

  const handleSubcategoryNameChange = (categoryIndex, subIndex, newName) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].dropdown = updatedCategories[categoryIndex].dropdown.map((sub, i) =>
      i === subIndex ? { ...sub, name: newName } : sub
    );
    setCategories(updatedCategories);
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
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <div className="flex items-center text-xl font-bold mb-5">
          <ManageAccounts />&nbsp;&nbsp;관리자 카테고리
        </div>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="categories" type="CATEGORY">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {categories.map((category, index) => (
                  <Draggable key={category.key} draggableId={String(category.key)} index={index}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                          className={`p-0 bg-blue-50 rounded-md shadow-md items-center`}>
                        <div className="flex items-center justify-between p-2">
                          <div
                            className={`p-2 flex items-center space-x-3 rounded-md ${isEditing ? "bg-rose-100" : "bg-blue-50"}`}>
                            {category.icon}
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) => handleNameChange(index, e.target.value)}
                              readOnly={!isEditing}
                              className={`py-1 focus:outline-none
                                ${isEditing ? "bg-rose-100 border-gray-300 focus:border-gray-500 border-b" : "bg-blue-50"}`}
                            />
                          </div>
                        </div>

                        {/* 서브카테고리 드래그앤드롭 */}
                        <Droppable droppableId={`subcategory-${index}`} type="SUBCATEGORY">
                          {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef}
                                className={`pl-8 space-y-2 ${category.dropdown.length > 0 ? "mr-1 mb-1 pb-4 pr-2" : ""}`}>
                              {category.dropdown.map((sub, subIndex) => (
                                <Draggable key={`sub-${category.key}-${subIndex}`}
                                           draggableId={`sub-${category.key}-${subIndex}`} index={subIndex}>
                                  {(provided) => (
                                    <li
                                      ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                      className={`px-3 py-2 shadow rounded-md items-center ${isEditing ? "bg-rose-50" : "bg-blue-100"}`}>
                                      <input
                                        type="text"
                                        value={sub.name}
                                        onChange={(e) => handleSubcategoryNameChange(index, subIndex, e.target.value)}
                                        readOnly={!isEditing}
                                        className={`py-1 focus:outline-none ${isEditing ? "bg-rose-50 border-gray-300 focus:border-gray-500 border-b" : "bg-blue-100"}`}
                                      />
                                    </li>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </ul>
                          )}
                        </Droppable>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={saveOrder}
            className="px-4 py-2 bg-blue-500 bg-opacity-40 text-white rounded-md hover:bg-blue-600 hover:bg-opacity-50 transition"
          >
            순서 저장
          </button>
          <button
            onClick={isEditing ? saveName : toggleEditMode}
            className="px-4 py-2 bg-rose-600 bg-opacity-40 text-white rounded-md hover:bg-rose-600 hover:bg-opacity-50 transition"
          >
            {isEditing ? "이름 저장" : "이름 수정"}
          </button>
        </div>
      </div>
    </div>
  );
}
