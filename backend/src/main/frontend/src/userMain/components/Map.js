import React, { useEffect, useState } from "react";

const { kakao } = window;

const Map = ({width , height}) => {
  const [hospital, setHospital] = useState("");

  // 병원 정보 API 호출
  useEffect(() => {
    fetchHospital();
  }, []);

  const fetchHospital = async () => {
    try {
      const response = await fetch("/api/hospital/all");
      const data = await response.json();
      setHospital(data);
    } catch (error) {
      console.error("Error fetching hospital info:", error);
    }
  };

  useEffect(() => {
    if (hospital) {
      const address = hospital.hospitalAdd; // 병원 주소 할당

      const container = document.getElementById("map"); // DOM element for the map
      const options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // Coordinates for the center of the map
        level: 3,
      };
      const map = new kakao.maps.Map(container, options); // Create and display the map

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          map.setCenter(coords);

          // 마커 표시
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords,
          });

          const infowindow = new kakao.maps.InfoWindow({
            content:
              '<div style="width:150px; text-align:center;padding:6px 0;">메디곰</div>',
          });
          infowindow.open(map, marker);
          map.setCenter(coords);
        }
      });
    }
  }, [hospital]);

  return (
    <div
      id="map"
      style={{
        width: width ? width : "100%",
        height: height ? height : "500px",
        zIndex: 0,
      }}
    ></div>
  );
};
export default Map;
