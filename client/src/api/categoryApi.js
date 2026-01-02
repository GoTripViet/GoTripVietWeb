import axiosClient from "./axiosClient";

const categoryApi = {
  getAll(params) {
    return axiosClient.get("/categories", { params });
  },
  getById(id) {
    return axiosClient.get(`/categories/${id}`);
  },
  create(payload) {
    return axiosClient.post("/categories", payload);
  },
  update(id, payload) {
    return axiosClient.put(`/categories/${id}`, payload);
  },
  remove(id) {
    return axiosClient.delete(`/categories/${id}`);
  },
  uploadCategoryImage(formData) {
    return axiosClient.post("/uploads/category-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default categoryApi;
