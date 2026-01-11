import axiosClient from "./axiosClient";

const categoryApi = {
  // Lấy danh sách (có thể truyền params { query_mode: 'partner' })
  getAll(params) {
    return axiosClient.get("/categories", { params });
  },

  // Lấy chi tiết
  getById(id) {
    return axiosClient.get(`/categories/${id}`);
  },

  // [MỚI] Hàm gửi yêu cầu tạo danh mục (Dành cho Partner)
  // Gọi vào route: POST /categories/request
  requestNew(payload) {
    return axiosClient.post("/categories/request", payload);
  },

  // Tạo mới trực tiếp (Dành cho Admin - Status mặc định Active)
  create(payload) {
    return axiosClient.post("/categories", payload);
  },

  // Cập nhật
  update(id, payload) {
    return axiosClient.put(`/categories/${id}`, payload);
  },

  // Xóa
  remove(id) {
    return axiosClient.delete(`/categories/${id}`);
  },

  // Upload ảnh danh mục
  uploadCategoryImage(formData) {
    return axiosClient.post("/uploads/category-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default categoryApi;