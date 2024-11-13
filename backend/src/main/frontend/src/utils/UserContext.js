import React, { createContext, useContext, useEffect, useState } from "react";

// UserContext 생성
const UserContext = createContext();

// UserProvider 컴포넌트 생성
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 정보를 가져오는 함수
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token'); // JWT를 로컬 스토리지에서 가져옴
      if (token) {
        try {
          const response = await fetch('/api/users/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // JWT 포함
            },
          });
          if (response.ok) {
            const data = await response.json(); // 서버에서 반환하는 사용자 정보
            setIsLoading(true); //로그인 상태 확인용
            setUserInfo(data); // 사용자 정보 상태 업데이트
          } else {
            console.error('사용자 정보를 가져오는 데 실패했습니다.');
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는 중 오류 발생:', error);
        }
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

// useUser 훅 생성
export const useUser = () => useContext(UserContext);