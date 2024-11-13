import { useParams } from "react-router-dom";
import AllUsersList from "../pages/list/AllUsersList";
import PatientList from "../pages/list/PatientList";
import DoctorList from "../pages/list/DoctorList";
import AdminList from "../pages/list/AdminList";
import Authority from "../pages/authority/Authority";

const ListContainer = () => {
  const { type } = useParams();

  switch (type) {
    case "authority":
      return <Authority />
    case "all":
      return <AllUsersList />;
    case "patients":
      return <PatientList />;
    case "doctors":
      return <DoctorList />;
    case "admins":
      return <AdminList />;
    default:
      return <AllUsersList />;
  }
};

export default ListContainer;
