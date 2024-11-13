import React from "react";
import { Routes, Route } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import DoctorRoutes from "./DoctorRoutes";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/main/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/doctor/*" element={<DoctorRoutes />} />
    </Routes>
  );
}

export default AppRoutes;
