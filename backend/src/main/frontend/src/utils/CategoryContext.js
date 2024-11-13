import { createContext, useContext, useState } from "react";

const CategoryContext = createContext();

export const useCategoryContext = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [isCategoryUpdate, setIsCategoryUpdate] = useState(false);

  return (
    <CategoryContext.Provider value={{ isCategoryUpdate, setIsCategoryUpdate }}>
      {children}
    </CategoryContext.Provider>
  );
};