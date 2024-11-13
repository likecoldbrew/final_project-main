import "../style/empLogin.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post";
import AlertModal from "../components/AlertModal";
import { useUser } from "../../utils/UserContext";
import { Camera } from "lucide-react";


const SignInSignUp = () => {
  // 상태를 사용하여 패널(로그인, 회원가입)의 활성화 여부를 관리합니다.
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  // 병원정보
  const [hospital, setHospital] = useState("");
  // 진료과 정보
  const [departments, setDepartments] = useState([]);
  // 진료부서 정보
  const [treatments, setTreatments] = useState([]);
  // 주소찾기 모달창 관리
  const [postModalOpen, setPostModalOpen] = useState(false);
  //아이디 중복체크용
  const [isUsedId, setIsUsedId] = useState(null);
  //아이디 체크 완료 여부
  const [idCheck, setIdCheck] = useState(false);
  //프로필
  const [profileImage, setProfileImage] = useState(null);
  //프로필 미리보기
  const [previewProfile, setPreviewProfile] = useState(null);
  //useUser를 통해 setUserInfo 가져오기
  const { setUserInfo } = useUser();
  //AlertModal창
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);

  //회원가입 폼
  const [signUpForm, setSignUpForm] = useState({
    id: "",
    password: "",
    confirmPassword: "",
    userName: "",
    rrn1: "",
    rrn2: "",
    add: "",
    add2: "",
    userPhone: "",
    email: "",
    department: "",
    treatment: "",
    rank: "",
    loginId: "",
    loginPw: ""
  });

  const [errorMessages, setErrorMessages] = useState({
    id: "",
    password: "",
    confirmPassword: "",
    userName: "",
    rrn: "",
    userPhone: "",
    email: "",
    add: "",
    department: "",
    treatment: "",
    rank: "",
    login: ""
  });

  // API 호출
  useEffect(() => {
    fetchHospital();
    fetchDepartment();
    fetchTreatments();
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

  //진료과 정보
  const fetchDepartment = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/departmentAll");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //진료과 정보
  const fetchTreatments = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/allTreatment");
      const data = await response.json();
      setTreatments(data.map(d => ({ ...d, checked: false })));
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  //프로필
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file); // 상태를 파일 객체로 설정
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfile(reader.result); //미리보기용 url
      };
      reader.readAsDataURL(file); // base64로 변환
    }
  };
  //입력값들 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    //iunput 태그에 있는 name의 값을 signUpForm에 저장 (전화번호는 입력시 - 생기게 했음)
    if (name === "userPhone") {
      // 숫자만 남기기
      const onlyNums = value.replace(/\D/g, "");
      const formattedPhone = onlyNums
        .slice(0, 11)
        .replace(/(\d{3})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`);
      setSignUpForm(prevFormData => ({
        ...prevFormData,
        [name]: formattedPhone
      }));
    } else {
      setSignUpForm(prevFormData => ({
        ...prevFormData,
        [name]: value  // name에 해당하는 필드 업데이트
      }));
    }
    //주민번호 앞자리 입력하면 바로 다음칸으로 이동하게 설정
    if (name === "rrn1" && value.length === 6) {
      document.getElementById("rrn2").focus();
    }
    setErrorMessages((prevState) => ({
      ...prevState,
      [name]: ""
    }));
  };

  // 아이디 중복 확인 함수
  const checkId = async () => {
    // "변경" 버튼 클릭 시
    if (idCheck) {
      setIdCheck(false);
      return;
    }
    //아이디 입력여부 확인
    if (!signUpForm.id || !signUpForm.id.trim()) {
      setErrorMessages((prev) => ({
        ...prev,
        id: "아이디를 입력해주세요."
      }));
      return;
    }
    //아이디 형식 체크
    const idRegex = /^[A-Za-z0-9]+$/;
    if (!idRegex.test(signUpForm.id)) {
      setErrorMessages((prev) => ({
        ...prev,
        id: "이름은 한글과 영문만 사용할 수 있습니다(공백 불가)."
      }));
      return;
    }
    try {
      const response = await axios.get(
        `/api/users/check-id/${signUpForm.id}`
      );
      setIsUsedId(response.data); // 응답이 true/false로 온다고 가정
      if (!response.data) {
        setIdCheck(true);
      }
    } catch (error) {
      console.error("Error checking ID availability:", error);
      setIsUsedId(false);
      setErrorMessages((prev) => ({
        ...prev,
        id: "아이디 중복확인을 다시해주세요."
      }));
    }
  };

  //주소찾기 버튼 클릭스
  const findAdd = (e) => {
    e.preventDefault();
    setPostModalOpen(true);
  };

  // Post 컴포넌트에서 받은 주소를 처리하는 함수
  const handleAddressComplete = (data) => {
    const fullAddress = data.address;
    //상세주소가 괄호로 들어옴. -> 괄호 지우기
    const userAddress = fullAddress.replace(/[()]/g, "").trim();
    setSignUpForm(prevFormData => ({
      //주소외 다른 입력값들 유지
      ...prevFormData,
      // 주소찾기에서 넘어온 메인주소만 설정. 상세주소는 input 태그에서 받음
      add: userAddress
    }));
    setPostModalOpen(false);  // 주소 선택 후 모달 닫기
  };

  //정규식 및 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    // 1. Validate ID (아이디)
    if (!signUpForm.id) {
      newErrors.id = "아이디는 필수 입력입니다.";
    }
    // 2. Validate Password (비밀번호)
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!signUpForm.password) {
      newErrors.password = "비밀번호는 필수 입력입니다.";
    } else if (!passwordRegex.test(signUpForm.password)) {
      newErrors.password =
        "비밀번호는 최소 8자리 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.";
    } else if (signUpForm.password !== signUpForm.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    // 3. Validate Name (이름)
    const nameRegex = /^[가-힣A-Za-z]+$/;
    if (!signUpForm.userName) {
      newErrors.userName = "이름 입력은 필수입니다.";
    } else if (!nameRegex.test(signUpForm.userName)) {
      newErrors.userName = "이름은 한글과 영문만 사용할 수 있습니다.";
    }
    // 4. Validate Resident Registration Number (주민등록번호)
    const rrnRegex = /^(?!0{6})[0-9]{6}-[0-9]{7}$/; // Format validation
    if (!signUpForm.rrn1 || !signUpForm.rrn2) {
      newErrors.rrn = "주민등록번호 입력은 필수 입니다.";
    } else if (
      !/^[0-9]{6}$/.test(signUpForm.rrn1) ||
      !/^[0-9]{7}$/.test(signUpForm.rrn2)
    ) {
      newErrors.rrn = "주민등록번호는 올바른 형식이어야 합니다.";
    } else {
      const year = parseInt(signUpForm.rrn1.substring(0, 2));
      const month = parseInt(signUpForm.rrn1.substring(2, 4));
      const day = parseInt(signUpForm.rrn1.substring(4, 6));
      const gender = signUpForm.rrn2[0];
      const yearPrefix = gender === "1" || gender === "2" ? 1900 : 2000;
      // Validate the birth date
      const birthDate = new Date(yearPrefix + year, month - 1, day);
      if (
        birthDate.getFullYear() !== yearPrefix + year ||
        birthDate.getMonth() + 1 !== month ||
        birthDate.getDate() !== day
      ) {
        newErrors.rrn = "올바른 주민등록번호가 아닙니다.";
      }
    }
    //5. Validate Phone Number (전화번호)
    const phoneRegex = /^010\d{8}$/; // Must start with 010 and have 11 digits total
    if (!signUpForm.userPhone) {
      newErrors.userPhone = "전화번호 입력은 필수입니다.";
    }
    // 6. Validate Email (이메일)
    if (!signUpForm.email) {
      newErrors.email = "이메일 입력은 필수입니다.";
    } else if (!/\S+@\S+\.\S+/.test(signUpForm.email)) {
      newErrors.email = "이메일 형식이 올바르지 않습니다.";
    }
    if (!signUpForm.add) {
      newErrors.add = "주소 입력은 필수입니다.";
    }
    if (!signUpForm.department) {
      newErrors.department = "진료과 선택은 필수입니다.";
    }
    if (!treatments) {
      newErrors.treatment = "진료부서 선택은 필수입니다.";
    }
    if (!signUpForm.rank) {
      newErrors.rank = "직급 선택은 필수입니다.";
    }
    return newErrors;
  };

  //회원 가입 버튼 누를경우
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (!idCheck) {
      setErrorMessages((prev) => ({
        ...prev,
        id: "아이디 중복체크를 해야합니다."
      }));
      return;
    }

    if (treatments?.length > 0) {
      if (Object.keys(validationErrors).length > 0) {
        setErrorMessages(validationErrors);
      } else {
        const userData = {
          userId: signUpForm.id,
          userPass: signUpForm.password,
          userName: signUpForm.userName,
          userRrn: signUpForm.rrn1 + "-" + signUpForm.rrn2,
          email: signUpForm.email,
          phone: signUpForm.userPhone,
          userAdd: signUpForm.add,
          userAdd2: signUpForm.add2,
          admin: 3,
          department: signUpForm.department,
          treatment: treatments.filter(d => d.checked).map(d => d.treatmentNo).join(","),
          rank: signUpForm.rank
        };

        // JWT를 로컬 스토리지에서 가져오기
        const token = localStorage.getItem("jwt");
        // FormData 생성 (파일과 사용자 데이터 포함)
        const formData = new FormData();
        const userBlob = new Blob([JSON.stringify(userData)], { type: "application/json" });
        formData.append("user", userBlob); // Blob으로 JSON 데이터 추가
        if (profileImage) {
          formData.append("profileImage", profileImage); // 프로필 이미지를 FormData에 추가
        }
        try {
          // 사용자 등록 요청
          await axios.post("/api/users/registerDoctor", formData, {
            headers: {
              "Authorization": `Bearer ${token}`, // JWT 추가
              "Content-Type": "multipart/form-data" // 파일 전송을 위한 헤더 설정
            }
          });
          setAlertModalOpen(true);
          setModalMessage("회원가입 완료되었습니다. 관리자의 승인 이후 이용가능합니다.");
          setModalButtonText("로그인 페이지로 이동");
          setIsSuccess(true);
          setRedirectPath("/empSite");
        } catch (error) {
          setAlertModalOpen(true);
          setModalMessage("회원가입이 실패했습니다.");
          setModalButtonText("다시하기");
          setIsSuccess(false); // isSuccess 상태 업데이트
          setRedirectPath("/empSite");
        }
      }
    }
  };

  //로그인 버튼 클릭시
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // 로그인 요청을 위한 API 호출
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: signUpForm.loginId,
          userPass: signUpForm.loginPw
        })
      });
      if (!response.ok) {
        setErrorMessages(prevMessages => ({
          ...prevMessages,      // 기존 상태를 복사
          login: "아이디 또는 비밀번호가 틀렸습니다. 다시 시도해주세요."      // login 필드만 업데이트
        }));
        return;
      }
      const token = await response.text();
      // JWT 토큰을 로컬 스토리지에 저장
      localStorage.setItem("token", token);

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

      //로그인 성공시//
      setAlertModalOpen(true);
      setModalMessage("로그인 완료");
      setModalButtonText("직원 페이지로 이동");
      setIsSuccess(true);
      setRedirectPath(userData.admin === 2 ? "/admin/" : userData.admin === 1 ? "/doctor/" : "/");
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      setErrorMessages("로그인 중 오류가 발생했습니다.");
    }
  };

  // 회원가입 버튼 클릭시 회원가입 화면 보이게
  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
  };

  // 로그인 버튼 클릭시 로그인 화면 보이게
  const handleSignInClick = () => {
    setIsRightPanelActive(false);
  };

  //진료부서 체크표시
  const handleTreatmentChange = (e, dept) => {
    setTreatments(treatments.map(d => ({
      ...d,
      checked: d.treatmentNo === dept.treatmentNo ? !d.checked : d.checked
    })));
  };

  //모달창 닫혔을때
  const handleModalClose = () => {
    setAlertModalOpen(false); // 모달 닫기
    if (signUpForm.rank) {
      window.location.reload();  // 새로고침
    }
  };

  return (
    <div className=" flex justify-center items-center flex-col font-montserrat w-screen m-[-20px_0_50px]">
      <h2 className="my-14"><span
        className="font-bold text-yellow-700">{hospital ? hospital.hospitalNameKr : ""}</span> 직원분들 환영합니다.</h2>
      <div
        className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}
        id="container"
        style={{
          width: "1200px", // 너비 설정
          minHeight: "480px", // 최소 높이 설정
          height: isRightPanelActive ? "170vh" : ""
        }}
      >
        {/* 회원가입 폼 */}
        <div className="form-container sign-up-container">
          <form autoComplete="off"
                className="bg-white flex items-center justify-center flex-col px-[50px] text-center">
            <h1 className="font-bold mt-6 mb-5">{hospital ? hospital.hospitalNameKr : ""} 회원가입</h1>


            <div className="flex w-full items-start space-x-4">
              {/* 프로필 사진 및 파일 선택 */}
              <div className="flex flex-col mt-5 items-center w-1/3">
                {/* 프로필 사진 박스 */}
                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-full">
                  {previewProfile ? (
                    <img src={previewProfile} alt="프로필 미리보기" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* 숨겨진 파일 입력 */}
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileChange} // 파일 변경 시 이벤트 핸들러
                />
                {/* 파일 입력을 트리거하는 커스텀 버튼 */}
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer mt-2 inline-block px-4 py-2 bg-rose-200 text-rose-900 text-sm font-bold hover:bg-rose-300 hover:text-white rounded"
                >
                  파일 선택
                </label>
              </div>

              {/* 이름 및 아이디 입력 */}
              <div className="flex flex-col w-full space-y-4">
                {/* 이름 입력 */}
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <input
                    className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 w-full"
                    type="text"
                    id="userName"
                    name="userName"
                    placeholder="한글/영문"
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  {errorMessages.userName && (
                    <p className="text-red-600 text-sm text-left mb-2">{errorMessages.userName}</p>
                  )}
                </div>

                {/* 아이디 및 확인 버튼 */}
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700">아이디</label>
                  <div className="flex w-full items-center">
                    <input
                      id="id"
                      name="id"
                      className="w-3/4 bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2"
                      type="text"
                      placeholder="영문/숫자"
                      onChange={handleChange}
                      disabled={idCheck}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="rounded-[8px] w-1/4 bg-rose-200 text-rose-900 text-sm font-bold hover:bg-rose-300 hover:text-white px-4 py-3 tracking-[1px] uppercase transition-transform duration-80 ease-in cursor-pointer focus:outline-none active:scale-95 ml-2"
                      onClick={checkId}
                    >
                      {idCheck ? "변경" : "확인"}
                    </button>
                  </div>
                  {errorMessages.id && (
                    <p className="text-red-600 text-sm text-left w-full mb-2">{errorMessages.id}</p>
                  )}
                  {isUsedId !== null && (
                    <p
                      className={`text-sm w-full text-left mb-2 ${isUsedId ? "text-red-600" : "text-green-600"}`}
                    >
                      {isUsedId ? "사용 중인 아이디입니다." : "사용 가능한 아이디입니다."}
                    </p>
                  )}
                </div>
              </div>
            </div>


            {/*비밀번호*/}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="flex w-full items-center">
                <input
                  className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 w-full"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="8자리 이상의 영문, 숫자, 특수문자"
                  onChange={handleChange}
                />
              </div>
              {errorMessages.password && (
                <p className="text-red-600 text-sm text-left mb-2">
                  {errorMessages.password}
                </p>
              )}
            </div>
            {/*비밀번호 확인*/}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 w-full"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="비밀번호를 한 번 더 입력해주세요."
                onChange={handleChange}
              />
              {errorMessages.confirmPassword && (
                <p className="text-red-600 text-sm text-left mb-2">
                  {errorMessages.confirmPassword}
                </p>
              )}
            </div>

            {/*주민번호*/}
            <div className="flex mt-3 items-start w-full">
              <div className="mr-2 w-1/2">
                <label htmlFor="rrn1" className="block text-sm font-medium text-left text-gray-700">
                  주민등록번호 앞자리
                </label>
                <input
                  id="rrn1"
                  name="rrn1"
                  type="text"
                  placeholder="6자리"
                  required
                  maxLength="6" // 최대 길이 설정
                  className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 w-full"
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="rrn2" className="block text-sm font-medium text-left text-gray-700">
                  주민등록번호 뒷자리
                </label>
                <input
                  id="rrn2"
                  name="rrn2"
                  type="password"
                  placeholder="7자리"
                  required
                  maxLength="7" // 최대 길이 설정
                  className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 w-full"
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>
            {errorMessages.rrn && (
              <p className="text-red-600 text-sm text-left mb-2 w-full">{errorMessages.rrn}</p>
            )}
            {/* 전화번호 */}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700">전화번호</label>
              <input
                className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 w-full"
                type="text"
                id="userPhone"
                name="userPhone"
                value={signUpForm.userPhone}
                placeholder="숫자 11자리를 입력해주세요"
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errorMessages.userPhone && (
                <p className="text-red-600 text-sm text-left mb-2 w-full">
                  {errorMessages.userPhone}
                </p>
              )}
            </div>
            {/*이메일*/}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                className="w-full bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2"
                id="email"
                name="email"
                type="email"
                placeholder="example@domain.com 형식으로 입력해주세요."
                onChange={handleChange}
                autoComplete="off"
              />
              {errorMessages.email && (
                <p className="text-red-600 text-sm">{errorMessages.email}</p>
              )}
            </div>
            {/* 주소 */}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="add" className="block text-sm font-medium text-gray-700">주소</label>
              <div className="flex w-full items-center">
                <input
                  id="add"
                  name="add"
                  className="w-3/4 bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2"
                  type="text"
                  value={signUpForm.add}
                  placeholder="찾기 버튼을 눌러 위치를 검색해주세요"
                  onChange={handleChange}
                  disabled={true}
                />
                <button
                  className="rounded-[8px] w-1/4 bg-rose-200 text-rose-900 text-sm font-bold hover:bg-rose-300 hover:text-white px-4 py-3 tracking-[1px] uppercase transition-transform duration-80 ease-in cursor-pointer focus:outline-none active:scale-95 ghost ghost:bg-transparent ghost:border-white ml-2"
                  onClick={findAdd}
                >
                  찾기
                </button>
              </div>
              {errorMessages.add && (
                <p className="text-red-600 text-sm">{errorMessages.add}</p>
              )}
            </div>
            {/*상세주소*/}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="add2" className="block text-sm font-medium text-gray-700">상세주소</label>
              <input
                className="w-full bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2"
                id="add2"
                name="add2"
                type="email"
                placeholder="상세주소를 입력하세요."
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            {/* 진료과*/}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">진료과</label>
              <select
                name="department"
                onChange={handleChange}
                className="w-full bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2"
              >
                <option value="" className="bg-sky-100 ">진료과를 선택하세요.</option>
                {departments.length > 0 ?
                  (departments.map((dept, index) => (
                    <option key={index} value={dept.departmentNo} className="bg-white">
                      {dept.departmentName}
                    </option>
                  ))) : "진료과없음"}
              </select>
              {errorMessages.department && (
                <p className="text-red-600 text-sm">{errorMessages.department}</p>
              )}
            </div>
            {/* 진료분야*/}
            <div className="flex flex-col mt-3 items-start w-full">
              <p className="block text-sm font-medium text-gray-700">진료분야(중복 선택 가능)</p>
              <div className=" w-full bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2 border p-4 ">
                <div className="grid grid-cols-3 gap-2">
                  {treatments.map((dept, index) => (
                    <label key={index} className="block  text-left text-sm">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="treatment"
                        onChange={(e) => handleTreatmentChange(e, dept)}
                        defaultChecked={dept.checked}
                        value={dept.treatmentNo}
                      />
                      {dept.treatmentName}
                    </label>
                  ))}
                </div>
              </div>
              {errorMessages.treatment && (
                <p className="text-red-600 text-sm">{errorMessages.treatment}</p>
              )}
            </div>
            {/* 랭크 */}
            <div className="flex flex-col mt-3 items-start w-full">
              <label htmlFor="rank" className="block text-sm font-medium text-gray-700">직급</label>
              <select
                name="rank"
                onChange={handleChange}
                className="w-full bg-sky-100 bg-opacity-80 rounded-[5px] border-none px-3 py-2 my-2"
              >
                <option value="" className="bg-sky-100 ">직급을 선택하세요.</option>
                {["인턴", "펠로우", "전문의", "교수", "레지던트"].map((role, index) => (
                  <option key={index} value={role} className="bg-white">
                    {role}
                  </option>
                ))}
              </select>
              {errorMessages.rank && (
                <p className="text-red-600 text-sm">{errorMessages.rank}</p>
              )}
            </div>
            <button type="button" onClick={handleSignupSubmit}
                    className="rounded-[10px] border bg-sky-200 hover:bg-sky-500 text-sky-700 hover:text-white text-[14px] font-bold py-[12px] px-[45px] tracking-[1px] uppercase transition-transform duration-80 ease-in cursor-pointer focus:outline-none active:scale-95 ghost ghost:bg-transparent ghost:border-white mt-8">
              회원가입
            </button>
          </form>
        </div>

        {/* 로그인 폼 */}
        <div className="form-container sign-in-container">
          <form
            className="bg-white flex items-center justify-center flex-col px-[50px] h-full text-center"
          >
            <h1 className="font-bold m-0">로그인</h1>
            {errorMessages.login && (
              <div className="text-red-600 text-center mb-4">{errorMessages.login}</div>
            )}
            <input
              className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none py-[12px] px-[15px] my-2 w-full"
              type="text"
              placeholder="아이디"
              name="loginId"
              onChange={handleChange}
            />
            <input
              className="bg-sky-100 bg-opacity-80 rounded-[5px] border-none py-[12px] px-[15px] my-2 w-full"
              type="password"
              placeholder="비밀번호"
              name="loginPw"
              onChange={handleChange}
              onKeyDown={(e) => {
                // 엔터키가 눌렸을 때 로그인 버튼 클릭 동작 트리거
                if (e.key === "Enter") {
                  handleLoginSubmit(e); // 엔터키를 눌렀을 때 로그인
                }
              }}
            />
            <a
              className="text-[14px] mb-1 no-underline text-sky-600 hover:text-sky-500"
              href="#"
            >
              아이디를 잊어버렸나요?
            </a>
            <a
              className="text-[14px] no-underline my-4 text-sky-600 hover:text-sky-500"
              href="#"
            >
              비밀번호를 잊어버렸나요?
            </a>
            <button type="button" onClick={handleLoginSubmit}
                    className="rounded-[10px] border bg-sky-300 text-sky-900 hover:text-white hover:bg-sky-600  text-[12px] font-bold py-[12px] px-[45px] tracking-[1px] uppercase transition-transform duration-80 ease-in cursor-pointer focus:outline-none active:scale-95 ghost:bg-transparent ghost:border-white">
              로그인
            </button>
          </form>
        </div>

        {/* 오버레이 컨테이너 */}
        <div className="overlay-container">
          <div className="overlay">
            {/* 오버레이 왼쪽 패널 */}
            <div className="overlay-panel overlay-left mt-[-330px]">
              <h1 className="font-bold text-black  m-0">Welcome Back!</h1>
              <p className="text-[14px] text-black font-[100] leading-[20px] tracking-[0.5px] my-5 mb-7.5">
                반갑습니다. <br /> 이미 아이디가 있으신가요?
              </p>
              <button
                className="rounded-[20px] border bg-sky-300 text-sky-900 hover:text-white hover:bg-sky-600 text-[12px] font-bold py-[12px] px-[45px] tracking-[1px] uppercase transition-transform duration-80 ease-in cursor-pointer focus:outline-none ghost active:scale-95 ghost:bg-transparent ghost:border-white"
                id="signIn"
                onClick={handleSignInClick}
              >
                로그인하기
              </button>
            </div>
            {/* 오버레이 오른쪽 패널 */}
            <div className="overlay-panel overlay-right">
              <h1 className="font-bold text-black  m-0">환영합니다!</h1>
              <p className="text-[14px] text-black font-[100] leading-[20px] tracking-[0.5px] my-5 mb-7.5">
                아직 회원이 아니라면 <br /> 회원 가입 후 사이트를 이용해주세요.
              </p>
              <button
                className="rounded-[20px] border bg-sky-300 hover:bg-sky-600 text-sky-900 hover:text-white text-[12px] font-bold py-[12px] px-[45px] tracking-[1px] uppercase transition-transform duration-80 ease-in cursor-pointer focus:outline-none active:scale-95 ghost ghost:bg-transparent ghost:border-white"
                id="signUp"
                onClick={handleSignUpClick}
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
        <Post
          isOpen={postModalOpen}  // 모달창 열기 상태
          onClose={() => setPostModalOpen(false)}  // 닫기 동작
          handleComplete={handleAddressComplete} />

        <AlertModal
          isOpen={alertModalOpen}
          onClose={handleModalClose}
          message={modalMessage}
          buttonText={modalButtonText}
          isSuccess={isSuccess}
          redirectPath={modalRedirectPath}
        />
      </div>

      {/* 푸터 (필요에 따라 수정하세요) */}
      <footer className="bg-[#222] text-white text-sm fixed bottom-0 left-0 right-0 text-center z-[999]">
        <p className="my-2.5">{hospital ? (<p>{hospital.copyright}</p>) : null}</p>
      </footer>

    </div>
  );
};

export default SignInSignUp;
