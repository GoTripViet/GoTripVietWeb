import axiosClient from "./axiosClient";

const locationApi = {
  getAll(params) {
    return axiosClient.get("/locations", { params });
  },
  getById(id) {
    return axiosClient.get(`/locations/${id}`);
  },
  create(payload) {
    return axiosClient.post("/locations", payload);
  },
  update(id, payload) {
    return axiosClient.put(`/locations/${id}`, payload);
  },
  remove(id) {
    return axiosClient.delete(`/locations/${id}`);
  },
  uploadLocationImage(formData) {
    return axiosClient.post("/uploads/location-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default locationApi;
