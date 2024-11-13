import Header from "./components/Header";
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";

function userMain() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="z-50">
        <Header />
      </div>
      <main  className="bg-sky-50 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default userMain;
