import axios from 'axios';

// Cấu hình axios riêng cho Inventory Service (Port 3003)
const inventoryClient = axios.create({
  baseURL: 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào Header để qua được Auth Middleware
inventoryClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const inventoryApi = {
  // GET: Lấy danh sách lịch theo ProductID
  getByProductId: (productId) => {
    return inventoryClient.get(`/inventory/product/${productId}`);
  },

  // POST: Tạo lịch mới
  create: (data) => {
    // data payload phải khớp với cấu trúc Backend yêu cầu
    return inventoryClient.post("/inventory", data);
  },

  // PATCH: Cập nhật (ví dụ sửa giá, số chỗ)
  update: (id, data) => {
    return inventoryClient.patch(`/inventory/${id}`, data);
  },

  // DELETE: Xóa lịch
  remove: (id) => {
    return inventoryClient.delete(`/inventory/${id}`);
  }
};

export default inventoryApi;