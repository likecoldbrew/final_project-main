import { useParams } from "react-router-dom";
import MainCategory from "../pages/category/MainCategory";
import DoctorCategory from "../pages/category/DoctorCategory";
import AdminCategory from "../pages/category/AdminCategory";

const CategoryContainer = () => {
  const { type } = useParams();

  switch (type) {
    case "main":
      return <MainCategory />;
    case "doctor":
      return <DoctorCategory />;
    case "admin":
      return <AdminCategory />;
    default:
      return <AdminCategory />;
  }
};

export default CategoryContainer;
