import { useParams } from "react-router-dom";
import Home from "../pages/Home";
import BoardList from "../pages/board/BoardList";
import Hospital from "../pages/site/Hospital";
import Banner from "../pages/site/Banner";

const SiteContainer = () => {
  const { type } = useParams();

  switch (type) {
    case "board":
      return <BoardList />;
    case "inform":
      return <Hospital />;
    case "banner":
      return (
        <Banner />
      );
    default:
      return <Home />;
  }
};

export default SiteContainer;
