import React from "react";
import DaumPostcode from "react-daum-postcode";
import "../style/post.css";

const Post = (props) => {
  if (!props.isOpen) return null;
// props가 변경될 때마다 콘솔에 찍히도록 설정
  const complete = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    props.handleComplete({ address: fullAddress });
  };

  const style = {
    width: "400px",
    height: "600px",
    border: "1.4px solid #333333",
    zIndex: 1000
  };
  return (
    <div className="modal-overlay">
      <button
        onClick={props.onClose}
        className="close-button text-sky-600 font-bold hover:text-rose-700"
        style={{
          position: "absolute",
          top: "150px",
          left: "58%",
          width: "3%",
          transform: "translateX(-10%)",
          backgroundColor: "white",
          zIndex: 1000,
          display: "block"
        }}
      >
        닫기
      </button>
      <div className="modal-content">
        <DaumPostcode
          autoClose
          onComplete={complete}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default Post;
