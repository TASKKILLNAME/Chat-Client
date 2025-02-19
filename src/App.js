import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // 추가
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage'; // 추가

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/auth" />} 
      />
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/chat" /> : <AuthPage />} 
      />
      <Route 
        path="/chat" 
        element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" />} 
      />
      <Route 
        path="/chat/:roomId" 
        element={<ProtectedRoute element={<ChatRoomPage />} />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;