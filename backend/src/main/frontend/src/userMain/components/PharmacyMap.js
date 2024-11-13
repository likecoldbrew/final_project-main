import React, { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

const PharmacyMap = () => {
  const { kakao } = window;
  const [info, setInfo] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);
  const [hospitalCoords, setHospitalCoords] = useState(null);



  // 병원 데이터 가져오기
  const fetchHospitalData = async () => {
    try {
      const response = await fetch("/api/hospital/all");
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      const data = await response.json();
      console.log("Hospital Data:", data); // 응답 데이터 확인
      if (data) {
        const address = data.hospitalAdd; // 주소 가져오기
        await geocodeAddress(address); // 주소를 좌표로 변환
      } else {
        console.error("No hospital data found.");
      }
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    }
  };

  // 주소를 좌표로 변환
  const geocodeAddress = (address) => {
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = {
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        };
        console.log("Hospital Coordinates:", coords); // 좌표 확인
        setHospitalCoords(coords);
        if (map) {
          map.setCenter(coords); // 병원 좌표로 지도 중심 설정
          searchNearbyPharmacies(coords); // 근처 약국 검색
        }
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  };

  // 근처 약국 검색
  const searchNearbyPharmacies = (coords) => {
    if (!map) return;

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch("대전 오류동 약국", (data, status) => {
      console.log("Pharmacy Search Result:", data, "Status:", status); // 검색 결과 확인
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();
        let pharmacyMarkers = [];

        for (let i = 0; i < data.length; i++) {
          pharmacyMarkers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          });
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        console.log("Pharmacy Markers:", pharmacyMarkers); // 마커 배열 확인
        setMarkers(pharmacyMarkers); // 마커 상태 설정
        map.setBounds(bounds); // 마커를 포함하도록 지도 경계 조정
      } else {
        console.error("Places search failed:", status);
      }
    });
  };

  // 컴포넌트가 마운트될 때 병원 데이터 가져오기
  useEffect(() => {
    fetchHospitalData();
  }, []);

  // map이 생성된 후에 근처 약국 검색
  useEffect(() => {
    if (!map || !hospitalCoords) return;

    searchNearbyPharmacies(hospitalCoords);
  }, [map, hospitalCoords]);

  return (
    <Map
      center={hospitalCoords || { lat: 37.566826, lng: 126.9786567 }} // 병원 좌표가 없으면 기본값 사용
      style={{
        width: "100%",
        height: "450px",
        zIndex: 0,
      }}
      level={3}
      onCreate={setMap}
    >
      {markers.map((marker) => (
        <MapMarker
          key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
          position={marker.position}
          onClick={() => setInfo(marker)}
        >
          {info && info.content === marker.content && (
            <div style={{ color: "#000" }}>{marker.content}</div>
          )}
        </MapMarker>
      ))}
    </Map>
  );
};

export default PharmacyMap;
