// src/api/catalogApi.js
import axiosClient from "./axiosClient";

const catalogApi = {
  // --- SẢN PHẨM ---
  getAll: (params) => axiosClient.get("/products", { params }),
  getById: (id) => axiosClient.get(`/products/${id}`),

  // --- ĐỊA ĐIỂM ---
  getAllLocations: () => axiosClient.get("/locations"),

  // --- DANH MỤC ---
  getAllCategories: (params) => axiosClient.get("/categories", { params }),
  getCategoryById: (idOrSlug) => axiosClient.get(`/categories/${idOrSlug}`),
};

export default catalogApi;
