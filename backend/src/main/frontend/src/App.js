import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./utils/UserContext";
import { CategoryProvider } from "./utils/CategoryContext";

function App() {
  return (
    <UserProvider>  {/* UserProvider로 전체 앱 감싸기 */}
      <CategoryProvider> {/* 카테고리 변경 시 업데이트 여부 */}
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CategoryProvider>
    </UserProvider>
  );
}

export default App;
