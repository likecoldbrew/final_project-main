import React from "react";
import { Route, Routes } from "react-router-dom";
import Admin from "../admin";
import Home from "../admin/pages/Home";
import ListContainer from "../admin/components/ListContainer";
import DetailContainer from "../admin/components/DetailContainer";
import SiteContainer from "../admin/components/SiteContainer";
import CategoryContainer from "../admin/components/CategoryContainer";
import DayOff from "../admin/pages/schedule/DayOff";
import Hospitalization from "../admin/pages/approval/Hospitalization";
import Meal from "../admin/pages/meal/Meal";

function AdminRoutes() {

  return (
    <Routes>
      <Route path="/" element={<Admin />}>
        <Route index element={<Home />} />
        <Route path="list/:type" element={<ListContainer />} />
        <Route path="users/:userNo/:admin" element={<DetailContainer />} />
        <Route path="site/:type" element={<SiteContainer />} />
        <Route path="category/:type" element={<CategoryContainer />} />
        <Route path="dayoff" element={<DayOff />} />
        <Route path="approval" element={<Hospitalization />} />
        <Route path="meal" element={<Meal />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
