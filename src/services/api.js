import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Interceptor - Token:', token);
  console.log('Interceptor - Request Config:', config);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Added Authorization header');
  }
  return config;
}, (error) => {
  console.error('Interceptor Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  console.log('Interceptor - Response:', response);
  return response;
}, (error) => {
  console.error('Interceptor Response Error:', error);
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => {
    console.log('Login API Call - Credentials:', credentials);
    return api.post('/auth/login', credentials);
  },
  register: (userData) => {
    console.log('Register API Call - User Data:', userData);
    return api.post('/auth/register', userData);
  },
  logout: () => api.post('/auth/logout'),
};

// api.js
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  createRoom: (roomData) => api.post('/chat/rooms', roomData),
  getMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages`),
  getInvitableUsers: (roomId) => api.get(`/chat/rooms/${roomId}/invitable-users`),
  inviteToRoom: (roomId, userIds) => api.post(`/chat/rooms/${roomId}/invite`, { userIds }),
  getRoomParticipants: (roomId) => api.get(`/chat/rooms/${roomId}/participants`),
};

export default api;