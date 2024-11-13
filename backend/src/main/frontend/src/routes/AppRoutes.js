import React from "react";
import { Routes, Route } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import DoctorRoutes from "./DoctorRoutes";
import ErrorPage from "../components/ErrorPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/main/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/doctor/*" element={<DoctorRoutes />} />
      <Route path="/error/*" element={<ErrorPage/>} />
    </Routes>
  );
}

export default AppRoutes;
