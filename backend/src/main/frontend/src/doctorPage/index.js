import React, { useState } from "react";
import SidebarAndNavbar from "./components/Doctors";


const Doctors = () => {

  return (
    <>
      {/* SidebarAndNavbar에 setActivePage, renderPage를 props로 전달 */}
      <SidebarAndNavbar />
    </>
  );
};

export default Doctors;
