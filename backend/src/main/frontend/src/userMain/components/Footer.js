import React, { useEffect, useState } from "react";
import "../style/tailwind.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const [hospital, setHospital] = useState([]);

  // API 호출
  useEffect(() => {
    fetchHospital();
  }, []);

  //병원 정보
  const fetchHospital = async () => {
    try {
      const response = await fetch("/api/hospital/all");
      const data = await response.json();
      setHospital(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  return (
    <footer className=" bg-sky-100 text-sky-800 py-4">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <Link
          to="/" className="h-24">
        <img src="/images/mediGom_Logo.png" className="h-24 mr-4" alt="logo" />

        </Link>
        <div className="text-center">
          {hospital ? (
            <p className="inline-block mr-3">
              주소 :
              <span className="font-bold inline">
                {hospital.hospitalAdd}
              </span>
            </p>
          ) : (
            <p>병원 정보가 없습니다.</p>
          )}
          {hospital  ? (
            <p className="inline-block">
              대표 전화번호 :
              <span className="font-bold">{hospital.huntingLine}</span>
            </p>
          ) : (
            <p>병원 정보가 없습니다.</p>
          )}
          {hospital ? (<p>{hospital.copyright}</p>):null}

        </div>
      </div>
    </footer>
  );
};

export default Footer;
