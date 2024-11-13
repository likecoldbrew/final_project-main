import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/tailwind.css";
import Footer from "../components/Footer";
import { useUser } from "../../utils/UserContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    id: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setUserInfo } = useUser(); // useUser를 통해 setUserInfo 가져오기
  // 병원정보
  const [hospital, setHospital] = useState("");//병원 정보
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

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
  // 회사명 대문자로 구분
  const splitHospitalName = (name) => {
    return name.match(/([A-Z][a-z]+)/g) || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로그인 요청을 위한 API 호출
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: formData.id,
          userPass: formData.password
        })
      });
      if (!response.ok) {
        const errorText = await response.text(); // 응답을 텍스트로 읽기
        setErrorMessage(errorText); // 텍스트를 직접 에러 메시지로 설정
        return;
      }
      const token = await response.text();
      // JWT 토큰을 로컬 스토리지에 저장
      localStorage.setItem("token", token);
      //추가한 부분 //
      // 사용자 정보 요청
      const userInfoResponse = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}` // 토큰을 헤더에 포함
        }
      });
      if (!userInfoResponse.ok) {
        throw new Error("사용자 정보를 가져오는 데 실패했습니다.");
      }
      const userData = await userInfoResponse.json();
      setUserInfo(userData); // 사용자 정보 업데이트
      console.log(userData)
      //추가한 부분 끝//

      switch (userData.admin) {
        case 0:
          navigate("/main"); // 일반 사용자 페이지
          break;
        case 1:
          navigate("/doctor"); // 의사 페이지
          break;
        case 2:
          navigate("/admin"); // 관리자 페이지
          break;
        default:
          navigate("/main"); // 기본 페이지
          break;
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      setErrorMessage("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="w-full bg-sky-100 py-2 border-y border-sky-200">
        <div className="container mx-auto px-4 flex items-center">
          <Link to="/main" className="h-24 flex items-center"> {/* 이미지와 텍스트를 중앙 정렬하기 위해 flex 추가 */}
            <img
              src="/images/mediGom_Logo.png"
              className="h-16 mr-2"
              alt="logo"
            />
          </Link>
          <span
            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center"> {/* 텍스트를 중앙 정렬하기 위해 flex 추가 */}
            {hospital ? (
              splitHospitalName(hospital.hospitalNameEn).map((part, index) => (
                <span
                  key={index}
                  className={index === 0 ? "text-lg sm:text-xl md:text-2xl font-bold text-gray-800" : "text-lg sm:text-xl md:text-2xl font-bold text-yellow-500"}>
            {part}
          </span>
              ))
            ) : null}
         </span>
        </div>
      </header>
      <div className="flex-grow flex flex-col lg:flex-row justify-center items-center py-12 sm:px-6 lg:px-8">
        <div className="lg:w-1/4 mb-8 lg:mb-0 lg:pr-8">
          <div className="bg-green-100 rounded-full p-8 max-w-md mx-auto relative">
            <Link to="main/" className="h-24">
              <img
                src="/images/mediGom_Logo.png"
                alt="logo"
                className="w-full h-auto opacity-65"
              />
            </Link>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-sky-100 bg-opacity-75 px-4 py-2 rounded-lg">
                {hospital? (
                  <>
                    <p className="text-xl font-bold text-blue-900 text-center whitespace-pre-line">
                      {hospital.greetings}
                    </p>
                  </>
                ) : null}

              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/4 w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              로그인
            </h2>
            {errorMessage && (
              <div className="text-red-600 text-center mb-4">{errorMessage}</div>
            )}
            <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="id"
                  className="block text-sm font-medium text-gray-700"
                >
                  아이디
                </label>
                <div className="mt-1">
                  <input
                    id="id"
                    name="id"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  비밀번호
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm flex justify-end w-full">
                  <a
                    href="#"
                    className="font-medium text-sky-600 hover:text-sky-500"
                  >
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                  로그인
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="text-center text-sm text-gray-500 mb-2">
                계정이 없으신가요?
              </div>
              <Link
                to="/main/SignUp"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-sky-600 bg-white hover:bg-gray-50"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
