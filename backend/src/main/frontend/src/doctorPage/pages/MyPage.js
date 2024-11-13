import React, { Fragment, useEffect, useState } from "react";
import Modal from "react-modal";
import { useUser } from "../../utils/UserContext";
import { Camera } from "lucide-react";

Modal.setAppElement("#root");

export default function MyPage() {
  // const { doctorNo } = useParams();
  // const id = parseInt(doctorNo);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditing2, setIsEditing2] = useState(false);
  //프로필 사진
  const [profileImg, setProfileImg] = useState(null);
  //새로운 프로필 사진
  const [newProfile, setNewProfile] = useState(null);
  //프로필 미리보기
  const [previewProfile, setPreviewProfile] = useState(null);
  const { userInfo, isLoading } = useUser(); //유저 정보
  // 상태 추가
  const [formData, setFormData] = useState({
    userNo: "",
    userId: "",
    userPass: "",
    userName: "",
    departmentName: "",
    userRrn: "",
    userAdd: "",
    userAdd2: "",
    phone: "",
    email: ""
  });

  //유효성 검사시 에러 메시지
  const [errorMessages, setErrorMessages] = useState({
    password: "",
    userPwCheck: "",
    name: "",
    phone: "",
    email: ""
  });

  //비밀번호 일치 여부 확인
  const [passwordMatch, setPasswordMatch] = useState(true);
  //변경값 유무 확인
  const [isChanged, setIsChanged] = useState(false);
  //비밀번호 입력 값
  const [newPassword, setNewPassword] = useState(false);
  //토큰 값
  const token = localStorage.getItem("token");

  // AlertModal 상태 관리
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("확인");
  const [modalRedirectPath, setRedirectPath] = useState("/");
  const [isSuccess, setIsSuccess] = useState(false);
  const [doctorData, setDoctorData] = useState(null); // 상태 생성

  //로그인 안하면 접근 못하게 막기
  useEffect(() => {
    if (!isLoading && !userInfo.userId) {
      setModalMessage("로그인 후 이용가능합니다.");
      setModalButtonText("로그인 하기");
      setAlertModalOpen(true);
      setIsSuccess(false); // isSuccess 상태 업데이트
      setRedirectPath("/empSite"); // 로그인페이지로 보내기
    } else if (userInfo.userNo) {
      window.scrollTo(0, 0);
      fetchUsers();
      fetchDoctorDetail();
      fetchProfile();
    }
  }, [isLoading, userInfo]); // navigate 추가

  //마이페이지 로그인 한 유저 정보 가져오기

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/users/doctorDetail/${userInfo.userNo}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setDoctorData(data); // 상태 업데이트
      if (data) {
        setFormData(
          {
            userNo: data.userNo,
            userId: data.userId,
            departmentName: data.departmentName,
            userPass: "",
            userPwCheck: "",
            userName: data.userName,
            userRrn: data.userRrn,
            userAdd: data.userAdd,
            userAdd2: data.userAdd2,
            phone: data.phone,
            email: data.email,
            admin: data.admin
          }
        ); // formData에 데이터 설정
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  //마이페이지 입력값 다루기
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // 숫자만 남기기
      const onlyNums = value.replace(/\D/g, "");
      const formattedPhone = onlyNums
        .slice(0, 11)
        .replace(/(\d{3})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`);
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: formattedPhone
      }));
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value  // name에 해당하는 필드 업데이트
      }));
    }
    // 비밀번호 확인 값이 변경되면 확인
    if (name === "userPwCheck" || name === "userPass") {
      setPasswordMatch(formData.userPass === value || formData.userPwCheck === value);
      if (passwordMatch) {
        setNewPassword(true);
      }
    }
    setIsChanged(true);
  };

  const validateForm = () => {
    const newErrors = {};
    // Validate Password (비밀번호)
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    if (formData.userPass && !passwordRegex.test(formData.userPass)) {
      newErrors.password =
        "비밀번호는 최소 8자리 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.";
    }
    if (formData.userPass !== formData.userPwCheck) {
      newErrors.userPwCheck =
        "비밀번호가 일치하지 않습니다.";
    }
    // Validate Name (이름)
    const nameRegex = /^[가-힣A-Za-z]+$/;
    if (!formData.userName) {
      newErrors.name = "이름은 필수 입력입니다.";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "이름은 한글과 영문만 사용할 수 있습니다.";
    }
    // Validate Phone Number (전화번호)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!formData.phone) {
      newErrors.phone = "전화번호는 필수 입력입니다.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "전화번호는 010으로 시작하며, 총 11자리여야 합니다.";
    }
    // Validate Email (이메일)
    if (!formData.email) {
      newErrors.email = "이메일은 필수 입력입니다.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "이메일 형식이 올바르지 않습니다. 이메일은 example@naver.com 형식이어야 합니다.";
    }
    return newErrors;
  };

  //마이페이지 제출시
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0 || !isChanged) {
      setErrorMessages(validationErrors);
      return;
    }
    // 에러가 없을 경우 에러 메시지 초기화
    setErrorMessages({});
    try {
      const updatedUser = {
        userNo: formData.userNo,
        userId: formData.userId,
        userName: formData.userName,
        departmentName: formData.departmentName,
        userRrn: formData.userRrn,
        userAdd: formData.userAdd,
        userAdd2: formData.userAdd2,
        phone: formData.phone,
        email: formData.email,
        admin: formData.admin,
        status: "N",
        userPass: formData.userPass,
        ...(formData.userPass && { userPass: formData.userPass })
      };
      const finalFormData = new FormData();
      finalFormData.append("user", new Blob([JSON.stringify(updatedUser)], { type: "application/json" }));
      finalFormData.append("doctorNo", userInfo.userNo);
      // 새로 등록한 프로필 사진이 있으면 추가
      if (newProfile) {
        finalFormData.append("profileImage", newProfile); // 새로운 프로필 이미지
        console.log("새로운 사진", newProfile);
      } else if (profileImg) {
        console("기존사진 바뀌", profileImg);
        finalFormData.append("profileImage", profileImg); // 기존 프로필 이미지
      }
      console.log("최종 폼 파일", finalFormData);
      // 사용자 정보 업데이트 (프로필 이미지도 함께 보내기)
      const userInfoResponse = await fetch(`/api/users/update/${userInfo.userNo}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: finalFormData
      });
      console.log("Response:", userInfoResponse); // 응답 상태 로그

      // 응답이 정상적인지 확인
      if (!userInfoResponse.ok) {
        const errorResponse = await userInfoResponse.json();
        console.error("서버 오류 응답:", errorResponse); // 오류 메시지 출력
        throw new Error(`응답이 올바르지 않습니다: ${errorResponse.message}`);
      }

      // 서버 응답이 정상적인 경우 성공 메시지 출력
      console.log("업데이트 성공:", updatedUser);
      setIsEditing(false); // 성공적으로 업데이트 후에 상태 변경
    } catch (error) {
      console.error("Error updating user:", error);
      setIsEditing(false); // 에러 발생 시에도 편집 상태 종료
    }
  };


  //의사 경력 & 학력 조회
  const [educations, setEducations] = useState([]); // 학력
  const [careers, setCareers] = useState([]); // 경력

  const fetchDoctorDetail = async () => {
    try {
      const response = await fetch(`/api/doctorsInfo/${userInfo.userNo}`); // Spring Boot 서버에서 데이터 가져오기
      const data = await response.json();
      setEducations(data.education); // 의사학력
      setCareers(data.career); // 의사경력

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  //의사 경력 & 학력 추가
  const [doctorRegisterInfo, setDoctorRegisterInfo] = useState({});
  const handleSubmit2 = async () => {

    const body = {
      doctorNo: formData.userNo,
      careerDate: doctorRegisterInfo.careerDate,
      careerInfo: doctorRegisterInfo.careerInfo,
      educationDate: doctorRegisterInfo.educationDate,
      educationBackground: doctorRegisterInfo.educationBackground
    };

    try {
      const response = await fetch("/api/doctorsInfo/educationAndCareer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const data = await response.json();
      console.log("Registration successful:", data.message);

      //성공적으로 등록된 후 showForm 닫힘
      setShowForm(false);

      return data;
    } catch (error) {
      console.error("Error registering doctor info:", error);
      throw error; // Optional: You can re-throw the error to handle it further up the call stack.
    }
  };

  // const updateDoctorSubmit = useCallback(async () => {
  //   const response = await fetch("/api/doctorsInfo/educationAndCareer/update", {
  //     method: "PUT",  // PUT 메서드를 사용하여 업데이트 요청
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       doctorNo,
  //       educations,
  //       careers
  //     })
  //   });
  // }, [doctorNo, educations, careers]);


  const updateDoctorSubmit = async () => {
    try {
      const response = await fetch("/api/doctorsInfo/educationAndCareer/update", {
        method: "PUT",  // PUT 메서드를 사용하여 업데이트 요청
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctorNo,
          educations,
          careers
        })
      });

      if (response.ok) {
        setIsEditing2(false);
      }

    } catch (error) {
      console.log(error);
      // 여기서 에러 발생 시 처리 로직 예: 사용자에게 오류 메시지 표시
    }
  };

  const handleChangeCareer = (e, item, isEducation) => {
    const value = e.target.value;
    const key = e.target.id;
    if (isEducation) {
      setEducations(educations.map(d => ({ ...d, [key]: item.educationId === d.educationId ? value : d[key] })));
    } else {
      setCareers(careers.map(d => ({ ...d, [key]: item.careerId === d.careerId ? value : d[key] })));
    }
  };

  // '변경' 버튼 클릭 시 호출되는 함수
  const handleChangeClick = () => {
    setIsEditing(true);
  };
  const handleChangeClick2 = () => {
    setIsEditing2(true);
  };
  // '등록' 버튼 클릭 시 호출되는 함수
  const handleRegisterClick = async () => {
    // 등록 로직을 추가하세요.
    await handleSubmit();
  };


  // '취소' 버튼 클릭 시 호출되는 함수
  const handleCancelClick = () => {
    setIsEditing(false);
  };
  const handleCancelClick2 = () => {
    setIsEditing2(false);
  };

  //등록 폼 나타나는 상태
  const [showForm, setShowForm] = useState(false);
  const handleBoxShow = () => {
    setShowForm(true);
  };

  //기존 프로필 수정
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file); // 상태를 파일 객체로 설정
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfile(reader.result); //미리보기용 url
        setIsChanged(true);
      };
      reader.readAsDataURL(file); // base64로 변환
    }
  };


  //프로필 사진 등록
  const uploadProfileImage = async (event) => {
    const file = event.target.files[0]; // 업로드할 파일
    if (file) {
      setNewProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfile(reader.result);
        setIsChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 사진 가져오기
  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${userInfo.userNo}`);
      if (response.ok) {
        const profileData = await response.json();
        console.log("프로필정보", profileData);
        setProfileImg(profileData.filePath); // 가져온 경로로 상태 업데이트
      } else {
        console.error("Failed to fetch profile image");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center px-2">
          {/*// <!-- Form 1 -->*/}
          <div className="w-full md:w-1/2 px-2 mb-8 md:mb-0">
            <div className="bg-gray-50 rounded-lg shadow-md">
              <h2
                className="text-lg p-3 bg-gradient-to-r rounded-lg from-purple-300 to-sky-300 text-white text-center">
                마이페이지
              </h2>
            </div>
            <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg shadow-lg mt-3">
              <form className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-grow md:space-y-0 md:flex md:items-center">
                    {/* 프로필 사진 및 파일 선택 */}
                    <div className="flex flex-col items-center md:items-start w-2/5">
                      {/* 프로필 사진 박스 */}
                      <div className="w-40 h-40 bg-gray-200 flex items-center justify-center rounded-[10px]">
                        {previewProfile ? (
                          <img
                            src={previewProfile} // 첨부된 이미지 미리보기
                            alt="첨부된 프로필 이미지"
                            className="w-full h-full object-cover"
                          />
                        ) : profileImg ? (
                          <img
                            src={profileImg} // 서버에서 가져온 기존 프로필 이미지
                            alt="프로필 이미지"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-12 h-12 text-gray-400" /> // 기본 카메라 아이콘
                        )}
                      </div>

                      {/* 숨겨진 파일 입력 */}
                      <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={profileImg ? handleProfileChange : uploadProfileImage}  // 파일 변경 시 이벤트 핸들러
                      />
                      {/* 파일 입력을 트리거하는 커스텀 버튼 */}
                      {isEditing ? <label
                        htmlFor="fileInput"
                        className="cursor-pointer mt-2 block w-40 px-4 py-2 bg-rose-200 text-rose-900 text-sm font-bold hover:bg-rose-300 hover:text-white rounded text-center"
                      >
                        파일 선택
                      </label> : null}

                    </div>
                  </div>

                  {/* 이름과 아이디 입력 */}
                  <div className="flex-grow mt-4 md:mt-0 w-4/5 ml-4 space-y-3">
                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                        이름
                      </label>
                      <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        disabled={!isEditing}
                        readOnly
                      />
                    </div>
                    <div className="pt-5">
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                        아이디
                      </label>
                      <input
                        type="text"
                        id="userId"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        disabled={!isEditing}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    근무과
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2  rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={!isEditing}
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={!isEditing}
                  />
                  {errorMessages?.email && (
                    <p className="text-rose-500 text-sm mt-1">{errorMessages.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="userPass" className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    id="userPass"
                    name="userPass"
                    value={formData.userPass}
                    placeholder="비밀번호 변경 희망시 새 비밀번호를 입력하세요."
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={!isEditing}
                  />
                  {errorMessages.password && (
                    <p className="text-rose-500 text-sm mt-1">
                      {errorMessages.password}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="userPwCheck" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="userPwCheck"
                    name="userPwCheck"
                    value={formData.userPwCheck}
                    placeholder="비밀번호 변경 희망시 새 비밀번호를 입력하세요."
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-opacity-50 ${
                      errorMessages?.password ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : "border-gray-300 focus:border-blue-300 focus:ring-blue-200"
                    }`}
                    disabled={!isEditing}
                  />
                  {errorMessages?.userPwCheck && (
                    <p className="text-rose-500 text-sm mt-1">{errorMessages.userPwCheck}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={!isEditing}
                  />
                  {errorMessages?.phone && (
                    <p className="text-rose-500 text-sm mt-1">{errorMessages.phone}</p>
                  )}
                </div>
              </form>
              <div className="flex justify-center space-x-4 pt-6">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleRegisterClick}
                      className="mr-2 px-4 py-2 text-white bg-sky-300 rounded-md hover:bg-sky-400">
                      등록
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-white bg-rose-400 rounded-md hover:bg-rose-500"
                      onClick={handleCancelClick}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 text-white bg-purple-300 rounded-md hover:bg-purple-400"
                    onClick={handleChangeClick}
                  >
                    변경
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 경력사항 폼 */}
          <div className="w-full md:w-1/2 px-2 mb-8 flex flex-col">
            <div className="bg-gray-50 rounded-lg shadow-md">
              <h2 className="text-lg p-3 bg-gradient-to-r rounded-lg from-sky-200 to-blue-300 text-white text-center">
                경력사항
              </h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg mt-3">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  {careers.map((item, index) => (
                    <Fragment key={item.careerId}>
                      <div className="">
                        <label htmlFor="careerDate" className="block text-sm font-medium text-gray-700">
                          경력기간
                        </label>
                        <input type="text" id="careerDate"
                               className=" mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                               defaultValue={item.careerDate}
                               onBlur={(e) => handleChangeCareer(e, item, false)}
                               disabled={!isEditing2}
                        />
                      </div>
                      <div className="">
                        <label htmlFor="careerInfo" className="block text-sm font-medium text-gray-700">
                          경력정보
                        </label>
                        <input type="text" id="careerInfo"
                               className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                               defaultValue={item.careerInfo}
                               onBlur={(e) => handleChangeCareer(e, item, false)}
                               disabled={!isEditing2}
                        />
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {educations.map((item, index) => (
                    <Fragment key={item.educationId}>
                      <div>
                        <label htmlFor="educationDate" className="block text-sm font-medium text-gray-700 ">
                          졸업연도
                        </label>
                        <input type="text" id="educationDate"
                               className=" mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                               defaultValue={item.educationDate}
                               onBlur={(e) => handleChangeCareer(e, item, true)}
                               disabled={!isEditing2}
                        />
                      </div>
                      <div>
                        <label htmlFor="educationBackground" className="block text-sm font-medium text-gray-700">
                          최종학력
                        </label>
                        <input type="text" id="educationBackground"
                               className=" mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                               defaultValue={item.educationBackground}
                               onBlur={(e) => handleChangeCareer(e, item, true)}
                               disabled={!isEditing2}
                        />
                      </div>
                    </Fragment>
                  ))}
                </div>
              </form>
              <div className="flex justify-center space-x-4 pt-6">
                {isEditing2 ? (
                  <>
                    <button
                      type="button"
                      onClick={updateDoctorSubmit}
                      className="mr-2 px-4 py-2 text-white bg-sky-300 rounded-md hover:bg-sky-400">
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelClick2}
                      className="px-4 py-2 text-white bg-rose-400 rounded-md hover:bg-rose-500"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBoxShow}
                      className="mr-2 px-4 py-2 text-white bg-sky-300 rounded-md hover:bg-sky-400">
                      등록
                    </button>
                    <button
                      type="button"
                      onClick={handleChangeClick2}
                      className="px-4 py-2 text-white bg-blue-300 rounded-md hover:bg-blue-400"
                    >
                      변경
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3.5">
              {showForm && (
                <>
                  <div className="mb-0 rounded-t-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-200 to-emerald-300 p-3">
                      <h2 className="text-white text-center">경력 등록</h2>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-b-lg shadow-lg mt-0">
                    <div className="p-3 grid grid-cols-2 gap-4">
                      {/* Career Date */}
                      <div className="">
                        <label htmlFor="careerDate" className="block text-sm font-medium text-gray-700">
                          경력기간
                        </label>
                        <input
                          type="text"
                          id="careerDate"
                          name="careerDate"
                          value={doctorRegisterInfo.careerDate}
                          onChange={(e) => setDoctorRegisterInfo({
                            ...doctorRegisterInfo,
                            careerDate: e.target.value
                          })}
                          className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Career Info */}
                      <div className="">
                        <label htmlFor="careerInfo" className="block text-sm font-medium text-gray-700">
                          경력정보
                        </label>
                        <input
                          type="text"
                          id="careerInfo"
                          name="careerInfo"
                          value={doctorRegisterInfo.careerInfo}
                          onChange={(e) => setDoctorRegisterInfo({
                            ...doctorRegisterInfo,
                            careerInfo: e.target.value
                          })}
                          className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Education Date */}
                      <div>
                        <label htmlFor="educationDate" className="block text-sm font-medium text-gray-700 mb-1">
                          졸업연도
                        </label>
                        <input
                          type="text"
                          id="educationDate"
                          value={doctorRegisterInfo.educationDate}
                          onChange={(e) => setDoctorRegisterInfo({
                            ...doctorRegisterInfo,
                            educationDate: e.target.value
                          })}
                          className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Education Background */}
                      <div>
                        <label htmlFor="educationBackground" className="block text-sm font-medium text-gray-700 mb-1">
                          최종학력
                        </label>
                        <input
                          type="text"
                          id="educationBackground"
                          value={doctorRegisterInfo.educationBackground}
                          onChange={(e) => setDoctorRegisterInfo({
                            ...doctorRegisterInfo,
                            educationBackground: e.target.value
                          })}
                          className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4 pb-2">
                      <button
                        type="button"
                        onClick={handleSubmit2}
                        className="mr-2 px-4 py-2 text-white bg-green-300 rounded-md hover:bg-green-400">
                        등록
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};