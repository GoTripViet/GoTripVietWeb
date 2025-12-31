// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  // LƯU Ý QUAN TRỌNG:
  // - Nếu chạy qua Gateway: dùng port 3000
  // - Nếu chạy thẳng User Service (để test nhanh): dùng port 3001
  baseURL: 'http://localhost:3001', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào mọi request nếu có
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Xử lý lỗi chung
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Nếu token hết hạn (401), có thể tự động logout ở đây
    throw error;
  }
);

export default axiosClient;