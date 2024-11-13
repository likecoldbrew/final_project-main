import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";
import AlertModal from "../components/AlertModal";
import Post from "../components/Post";


const UserMyPage = () => {
    const location = useLocation();
    const { selectCategory, selectSubCategory } = location.state || {};
    // const { userInfo, isLoading } = useUser(); //유저 정보
    const [formData, setFormData] = useState({
      userId: "",
      userPass: "",
      userName: "",
      userRrn: "",
      userAdd: "",
      userAdd2: "",
      phone: "",
      email: ""
    });
    //유효성 검사시 에러 메시지
    const [errorMessages, setErrorMessages] = useState({
      password: "",
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
    const [postModalOpen, setPostModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonText, setModalButtonText] = useState("확인");
    const [modalRedirectPath, setRedirectPath] = useState("/");
    const [isSuccess, setIsSuccess] = useState(false);

    /* 시작점 */
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token"); // JWT를 로컬 스토리지에서 가져옴
      if (token) {
        try {
          const response = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}` // JWT 포함
            }
          });

          console.log(response.ok)
          if (response.ok) {
            const data = await response.json(); // 서버에서 반환하는 사용자 정보
            setIsLoading(true); //로그인 상태 확인용
            setUserInfo(data); // 사용자 정보 상태 업데이트

            fetchUsers(data); //사용자정보조회
          } else {
            console.error("사용자 정보를 가져오는 데 실패했습니다.");
          }
        } catch (error) {
          console.error("사용자 정보를 가져오는 중 오류 발생:", error);
        }
      }else{
        setModalMessage("로그인 후 이용가능합니다.");
        setModalButtonText("로그인 하기");
        setAlertModalOpen(true);
        setIsSuccess(false); // isSuccess 상태 업데이트
        setRedirectPath("/main/login"); // 로그인페이지로 보내기
      }
    };

    useEffect(()=>{
      fetchUserInfo()
    },[])
    /* 종료점 */

    //로그인 한 유저 정보 가져오기
    const fetchUsers = async (param) => {
      console.log(param)
      try {
        const response = await fetch(`/api/users/patients`);
        const data = await response.json();
        // 로그인한 유저의 ID와 일치하는 환자 정보 필터링
        const loginUser = data.find(patient => patient.userId === param.userId);
        if (loginUser) {
          setFormData({
              userId: loginUser.userId,
              userPass: "",
              userPwCheck: "",
              userName: loginUser.userName,
              userRrn: loginUser.userRrn,
              userAdd: loginUser.userAdd,
              userAdd2: loginUser.userAdd2,
              phone: loginUser.phone,
              email: loginUser.email
            }
          );
        } else {
          console.error("해당 유저의 정보를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    //입력값 다루기
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

    // 비밀번호 변경 실시간으로 확인하기
    useEffect(() => {
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (formData.userPass && !passwordRegex.test(formData.userPass)) {
        setErrorMessages((prev) => ({
          ...prev,
          password: "비밀번호는 최소 8자 이상이며, 영문자와 숫자를 포함해야 합니다."
        }));
      } else {
        setErrorMessages((prev) => ({
          ...prev,
          password: ""
        }));
      }
    }, [formData.userPass]);


    // Post 컴포넌트에서 받은 주소를 처리하는 함수
    const handleAddressComplete = (data) => {
      const fullAddress = data.address;
      //상세주소가 괄호로 들어옴. -> 괄호 지우기
      const userAddress = fullAddress.replace(/[()]/g, "").trim();
      setFormData(prevFormData => ({
        ...prevFormData,  // 기존 formData 유지
        userAdd: userAddress,  // 메인 주소 업데이트
        userAdd2: ""
      }));
      setPostModalOpen(false);  // 주소 선택 후 모달 닫기
    };

    const validateForm = () => {
      const newErrors = {};
      // Validate Password (비밀번호)
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (formData.userPass && !passwordRegex.test(formData.userPass)) {
        newErrors.password =
          "비밀번호는 최소 8자리 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.";
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

    //제출시
    const handleSubmit = async (e) => {
      e.preventDefault();
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0 || !isChanged) {
        setErrorMessages(validationErrors);
        if (!isChanged) {
          setModalMessage("변경사항이 없습니다.");
          setModalButtonText("마이페이지 가기");
          setAlertModalOpen(true);
          setRedirectPath("/mypage");
        }
        return;
      }
      try {
        const updatedUser = {
          userId: formData.userId,
          userName: formData.userName,
          userRrn: formData.userRrn,
          userAdd: formData.userAdd,
          userAdd2: formData.userAdd2,
          phone: formData.phone,
          email: formData.email,
          status: "N",
          newPassword: newPassword,
          ...(formData.userPass && { userPass: formData.userPass })
        };
        const response = await fetch(`/api/users/update/${userInfo.userNo}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedUser)
        });
        if (response.ok) {
          setErrorMessages({}); // Clear error messages on success
          setModalMessage("변경이 완료되었습니다.");
          setModalButtonText("마이페이지 가기");
          setAlertModalOpen(true);
          setIsSuccess(true);
          setRedirectPath("/mypage"); // Redirect after success
        } else {
          const errorData = await response.json();
          setModalMessage(errorData.message || "변경 중 오류가 발생했습니다.");
          setModalButtonText("다시 시도");
          setAlertModalOpen(true);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error("Error updating user:", error);
        setModalMessage("서버와 연결할 수 없습니다.");
        setModalButtonText("다시 시도");
        setAlertModalOpen(true);
        setIsSuccess(false);
      }
    };

    return (
      <div className="flex flex-col min-h-screen">
        <SubCategories />
        <div className="container mx-auto px-4 py-8 flex flex-grow">
          <main className="flex-grow flex-col pr-8">
            <div className="flex-col min-h-full space-y-4 items-center justify-center">
              <div className="w-full mx-auto bg-white p-8 rounded-lg shadow-md">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="flex-grow space-y-4">
                      <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                          아이디
                        </label>
                        <input
                          type="text"
                          id="userId"
                          name="userId"
                          value={formData.userId}
                          className="w-full mt-1 text-sky-500 block px-2 py-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-gray-800 focus:border-indigo-500 sm:text-sm"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="userPass" className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호
                        </label>
                        <input
                          type="password"
                          id="userPass"
                          name="userPass"
                          value={formData.userPass}
                          placeholder="비밀번호 변경 희망시 새 비밀번호를 입력하세요."
                          className="w-full mt-1 text-sky-500 block px-3 py-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                          onChange={handleChange}
                        />
                        {errorMessages.password && (
                          <p className="text-red-500 text-sm mt-1">
                            {errorMessages.password}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="userPwCheck" className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호 확인
                        </label>
                        <input
                          type="password"
                          id="userPwCheck"
                          name="userPwCheck"
                          value={formData.userPwCheck}
                          placeholder="비밀번호 변경 희망시 새 비밀번호를 입력하세요."
                          className={`w-full mt-1 block px-3 py-2 text-sky-500 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm ${!passwordMatch ? "border-2 border-red-500" : ""}`}
                          onChange={handleChange}
                        />
                        {!passwordMatch && (
                          <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                          이름
                        </label>
                        <input
                          type="text"
                          id="userName"
                          name="userName"
                          value={formData.userName}
                          className="w-full mt-1 block px-3 py-2 text-sky-500 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                          onChange={handleChange}
                        />
                        {errorMessages.name && (
                          <p className="text-red-500 text-sm mt-1">{errorMessages.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="userBirth" className="block text-sm font-medium text-gray-700 mb-2">
                          생년월일
                        </label>
                        <input
                          type="text"
                          id="userBirth"
                          name="userBirth"
                          value={formData.userRrn}
                          className="w-full mt-1 block px-3 py-2 text-sky-500 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          전화번호
                        </label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          className="w-full mt-1 block px-3 text-sky-500 py-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                          onChange={handleChange}
                        />
                      </div>
                      {errorMessages.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorMessages.phone}
                        </p>
                      )}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          이메일
                        </label>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          value={formData.email}
                          className="w-full mt-1 block px-3 py-2  text-sky-500 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                          onChange={handleChange}
                        />
                        {errorMessages.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errorMessages.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="userAdd" className="block text-sm font-medium text-gray-700 mb-2">
                          주소
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            id="userAdd"
                            name="userAdd"
                            value={formData.userAdd}
                            className=" mt-1 block w-5/6 px-3 py-2 mr-3 text-sky-500 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() => setPostModalOpen(true)}
                            className="inline-flex justify-center w-1/6 py-2 px-4 text-sky-500 border border-transparent shadow-sm text-sm font-medium rounded-md bg-sky-100 hover:bg-sky-400 hover:text-white hover:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            주소 찾기
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="userAdd2" className="block text-sm font-medium text-gray-700 mb-2">
                          상세주소
                        </label>
                        <input
                          type="text"
                          id="userAdd2"
                          name="userAdd2"
                          value={formData.userAdd2}
                          className="w-full mt-1 block px-3 py-2  text-sky-500 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500 sm:text-sm"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-5">
                    <button

                      className="inline-flex justify-center py-2 px-4 text-red-500 border border-transparent shadow-sm text-sm font-medium rounded-md bg-rose-100 hover:bg-rose-400 hover:text-white hover:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      탈퇴하기
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 text-sky-500 border border-transparent shadow-sm text-sm font-medium rounded-md bg-sky-100 hover:bg-sky-400 hover:text-white hover:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      변경하기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
          <div className="flex flex-col space-y-4">
            <QuickMenu />
            <ChatBot />
          </div>
        </div>
        <Post
          isOpen={postModalOpen}  // 모달창 열기 상태
          onClose={() => setPostModalOpen(false)}  // 닫기 동작
          handleComplete={handleAddressComplete} />

        <AlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          message={modalMessage}
          buttonText={modalButtonText}
          isSuccess={isSuccess}
          redirectPath={modalRedirectPath}
          state={{ selectCategory, selectSubCategory }}
        />

      </div>
    );
  }
;

export default UserMyPage;
