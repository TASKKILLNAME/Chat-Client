import React, { useState, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (responseData) => {
    try {
      console.log('Full login response:', responseData);
      
      // 로그인과 회원가입 모두 처리할 수 있도록 수정
      const userData = responseData.data || responseData;
      
      console.log('Processed user data:', userData);
      
      // 필수 데이터 존재 확인
      if (!userData.token || !userData.user) {
        console.error('Invalid user data');
        return;
      }
      
      // 토큰과 사용자 정보 저장
      setUser(userData.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', userData.token);
    } catch (error) {
      console.error('Login error:', error);
      // 필요하다면 추가 에러 처리 로직
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;