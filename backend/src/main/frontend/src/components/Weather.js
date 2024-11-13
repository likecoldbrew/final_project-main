import React, { useEffect, useState } from "react";
import { useUser } from "../utils/UserContext";
import { format } from "date-fns";

// 요일을 한글로 변환하는 함수
const getDayInKorean = (day) => {
  const daysInKorean = ["일", "월", "화", "수", "목", "금", "토"];
  return daysInKorean[day];
};

const Weather = () => {
  //위도
  const [userLat, setUserLat] = useState(null);
  //경도
  const [userLon, setUserLon] = useState(null);
  //날씨 정보
  const [weathers, setWeathers] = useState("");
  //날씨 로딩 여부
  const [isLoading, setIsLoading] = useState(true);
  //현재 날씨 인덱스번호
  const [todayIndex, setTodayIndex] = useState(0);
  //오늘 날짜
  const [today, setToday] = useState(null);
  //한 주
  const [weekDays, setWeekDays] = useState([]);
  //유저있는지
  const { userInfo } = useUser(); //유저정보

  //처음에 유저의 위치 정보 얻기
  useEffect(() => {
    // 위치 권한 요청 및 위치 정보 가져오기
    requestLocationPermission();
    getCurrentLocation();
    //오늘 날짜 구하기
    const todayDate = new Date();
    //오늘 날짜 설정
    setToday(todayDate);
    // 오늘 요일을 기준으로 5일 간의 요일 계산하기
    const newWeekDays = [];
    for (let i = 0; i < 6; i++) {
      // 오늘을 포함해서 5일 후까지
      const nextDay = new Date(todayDate);
      nextDay.setDate(todayDate.getDate() + i); // i일 후의 날짜 계산
      newWeekDays.push(getDayInKorean(nextDay.getDay())); // 요일을 한글로 변환해서 배열에 추가
    }
    setWeekDays(newWeekDays); // 배열을 상태에 저장
  }, []);

  //위도 경도가 있을 때 날씨 정보 가져오기
  useEffect(() => {
    if (userLat && userLon) {
      getWeather();
    }
  }, [userLat, userLon]);

  // //오늘이랑 가장 가까운 시간의 index 가져오기
  // useEffect(() => {
  //   if (!weathers) return;
  //   const now = new Date(); //오늘 날짜 구하기
  //   const nowTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); //utc 시간에서 +9시간 해서 현재 시간 구하기
  //   const nowUnix = Math.floor(nowTime.getTime() / 1000); // 현재시간을
  //
  //   const futureWeatherIndex = weathers.list.findIndex((weather) => {
  //     return weather.dt > nowUnix;
  //   });
  //   if (futureWeatherIndex !== -1) {
  //     setTodayIndex(Number(futureWeatherIndex));
  //   }
  // }, [weathers]);

  //로그인 유저 정보 바뀔 경우 위치 다시 허용받기
  const requestLocationPermission = () => {
    // 위치 권한 재요청
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (permission.state === "denied") {
        alert(
          "위치 권한이 필요합니다. 브라우저 설정에서 위치 권한을 허용해 주세요."
        );
      } else {
        getCurrentLocation();
      }
    });
  };

  //사이트에 접속한 위치 가져오기
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        setUserLat(parseFloat(lat));
        setUserLon(parseFloat(lon));
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          // 위치 권한이 거부된 경우 서울의 위도, 경도 설정
          const defaultLat = 37.5665; // 서울의 위도
          const defaultLon = 126.978; // 서울의 경도
          setUserLat(defaultLat);
          setUserLon(defaultLon);
        } else {
          alert("위치 정보를 가져오는 데 실패했습니다.");
        }
      }
    );
  };

  //날씨가져오기
  const getWeather = async () => {
    const apiKey = process.env.REACT_APP_WEATHER_KEY;
    console.log("키", apiKey);
    const response = await fetch(
      `https:/api.openweathermap.org/data/2.5/forecast?lat=${userLat}&lon=${userLon}&appid=${apiKey}&units=metric&lang=kr`
    );
    const data = await response.json();
    setWeathers(data);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "35vh",
        width: "100%",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* 흐린 배경 이미지 레이어 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("/images/weather.png")`,
          backgroundSize: "cover",
          backgroundPosition: "left bottom",
          borderRadius: "0.5rem",
          zIndex: 0,
        }}
      ></div>
      {/* 콘텐츠 레이어 */}
      <div
        style={{
          position: "relative",
          zIndex: 1, // 콘텐츠가 위에 오도록 설정
          width: "100%",
          color: "black",
        }}
      >
        {isLoading ? (
          <div>로딩중....</div>
        ) : (
          todayIndex > -1 && (
            <>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                {format(today, "MM월 dd일")}
                <span className="text-white"> {weathers.city.name}</span>의 날씨
              </h1>
              {/*오늘 날씨 정보*/}
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {Math.round(weathers.list[todayIndex].main.temp)}°C
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {weathers.list[todayIndex].weather[0].description}
                  <img
                    src={`https://openweathermap.org/img/w/${weathers.list[todayIndex].weather[0].icon}.png`}
                    alt="weather icon"
                  />
                  <div className="ml-3 mr-1">
                    💧 {weathers.list[todayIndex].main.humidity}%
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "1rem",
                  }}
                >
                  <div>
                    <span className="font-bold text-rose-600">최고 : </span>
                    {Math.round(weathers.list[todayIndex].main.temp_max)}°C
                    <span className="font-bold text-sky-700 ml-4">최저 : </span>
                    {Math.round(weathers.list[todayIndex].main.temp_min)}°C
                    <span className="font-bold text-teal-600 ml-4">
                      체감온도 :{" "}
                    </span>
                    {Math.round(weathers.list[todayIndex].main.feels_like)}°C
                  </div>
                </div>
              </div>
              {/* 앞으로 5일간의 날씨*/}
              <div className="grid grid-cols-5  gap-2 w-full max-w-[90%] mx-auto justify-items-center">
                {Array.from({ length: 5 }).map((_, index) => {
                  const adjustedIndex = (index + 1) * 8;
                  const weather =
                    weathers.list[
                      todayIndex + adjustedIndex > 39
                        ? 39
                        : todayIndex + adjustedIndex
                      ];
                  const day = weekDays[index + 1];
                  return (
                    <div
                      key={index}
                      className="text-center bg-white bg-opacity-15 shadow-md p-2 rounded-md flex flex-col items-center w-[90px]"
                    >
                      <div className="font-bold mb-2">{day}</div>
                      {/* 요일 */}
                      <img
                        src={`https://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                        alt="weather icon"
                        className="w-8 h-8 mb-2"
                      />
                      <div className="text-sm">
                        {Math.round(weather.main.temp_max)}°C /{" "}
                        {Math.round(weather.main.feels_like)}°C
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};
export default Weather;
