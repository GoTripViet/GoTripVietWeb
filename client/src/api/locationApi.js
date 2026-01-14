import axiosClient from "./axiosClient";

const locationApi = {
  // Get all locations (supports params like query_mode='partner')
  getAll(params) {
    return axiosClient.get("/locations", { params });
  },

  // Get single location
  getById(id) {
    return axiosClient.get(`/locations/${id}`);
  },

  // [NEW] Request a new location (For Partners)
  requestNew(payload) {
    return axiosClient.post("/locations/request", payload);
  },

  // Create location (For Admin - direct create)
  create(payload) {
    return axiosClient.post("/locations", payload);
  },

  // Update location
  update(id, payload) {
    return axiosClient.put(`/locations/${id}`, payload);
  },

  // Delete location
  remove(id) {
    return axiosClient.delete(`/locations/${id}`);
  },

  // Upload image for location
  uploadLocationImage(formData) {
    return axiosClient.post("/uploads/location-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default locationApi;
