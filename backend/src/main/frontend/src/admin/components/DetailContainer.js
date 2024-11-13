import { useParams } from "react-router-dom";
import DoctorDetail from "../pages/detail/DoctorDetail";
import UserDetail from "../pages/detail/UserDetail";

const DetailContainer = () => {
  const { userNo, admin } = useParams();

  // 컴포넌트를 변수로 할당
  const Component = admin === "1" ? DoctorDetail : UserDetail;

  // 선택한 컴포넌트 렌더링
  return <Component userNo={userNo} />;
};

export default DetailContainer;
