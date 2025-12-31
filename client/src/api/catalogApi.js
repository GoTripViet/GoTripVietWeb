// src/api/catalogApi.js
import axios from 'axios';

// 1. Cấu hình Client trỏ vào Catalog Service (Cổng 3002)
const catalogClient = axios.create({
  baseURL: 'http://localhost:3002', 
  headers: {
    'Content-Type': 'application/json',
  },
});

const catalogApi = {
  // --- SẢN PHẨM ---
  getAll: (params) => {
    return catalogClient.get('/products', { params });
  },

  getById: (id) => {
    return catalogClient.get(`/products/${id}`);
  },
  
  // --- ĐỊA ĐIỂM ---
  getAllLocations: () => {
    return catalogClient.get('/locations');
  },

  // --- DANH MỤC (SỬA LỖI TẠI ĐÂY) ---
  // Dùng catalogClient (3002) thay vì axiosClient (3001)
  getAllCategories(params) {
    // params có thể là { parent: 'null' } hoặc {}
    return catalogClient.get('/categories', { params });
  },
  
  getCategoryById(idOrSlug) {
    return catalogClient.get(`/categories/${idOrSlug}`);
  }
};

export default catalogApi;