// src/api/catalogApi.js
import axiosClient from "./axiosClient";

const catalogApi = {
  // --- SẢN PHẨM ---
  getAll: (params) => axiosClient.get("/products", { params }),
  getById: (id) => axiosClient.get(`/products/${id}`),

  // --- ĐỊA ĐIỂM ---
  getAllLocations: () => axiosClient.get("/locations"),
  createLocation: (payload) => axiosClient.post("/locations", payload),
  updateLocation: (id, payload) =>
    axiosClient.patch(`/locations/${id}`, payload),
  deleteLocation: (id) => axiosClient.delete(`/locations/${id}`),

  // --- DANH MỤC ---
  getAllCategories: (params) => axiosClient.get("/categories", { params }),
  getCategoryById: (idOrSlug) => axiosClient.get(`/categories/${idOrSlug}`),
  createCategory: (payload) => axiosClient.post("/categories", payload),
  updateCategory: (id, payload) =>
    axiosClient.put(`/categories/${id}`, payload),
  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),
};

export default catalogApi;
