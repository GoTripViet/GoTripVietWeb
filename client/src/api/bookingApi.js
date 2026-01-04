// src/api/bookingApi.js
import axios from 'axios';

// 1. Tạo instance Axios riêng cho Booking Service
// (Vì Booking Service chạy ở port 3004, khác với các service khác)
const bookingClient = axios.create({
  baseURL: 'http://localhost:3004', // Port của Booking Service
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor Request: Tự động gắn Token vào header
// Giúp xác thực người dùng khi gọi API
bookingClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Interceptor Response (Tùy chọn): Xử lý dữ liệu trả về
bookingClient.interceptors.response.use((response) => {
    // Trả về data trực tiếp nếu có, giúp code gọn hơn
    // Tuy nhiên để tương thích với logic cũ "res.data || res" của bạn, 
    // ta cứ trả về response gốc hoặc xử lý nhẹ.
    return response.data; 
}, (error) => {
    // Ném lỗi ra để component catch được
    return Promise.reject(error);
});

const bookingApi = {
  // 1. Tạo đơn hàng mới
  createBooking: (data) => {
    return bookingClient.post('/bookings', data);
  },

  // 2. Lấy danh sách đơn hàng của tôi
  getMyBookings: () => {
    return bookingClient.get('/bookings/my-bookings'); 
    // Lưu ý: Endpoint này ở backend phải là /my-bookings hoặc lọc theo userId
    // Nếu backend bạn dùng /bookings và tự lọc theo token thì giữ nguyên /bookings
  },

  // 3. [QUAN TRỌNG] Lấy chi tiết đơn hàng
  getBookingDetails: (id) => {
    return bookingClient.get(`/bookings/${id}`);
  },

  // 4. Cập nhật trạng thái đơn hàng (Dùng khi thanh toán xong)
  updateStatus: (id, status) => {
      return bookingClient.patch(`/bookings/${id}/status`, { status });
  },

  cancelBooking: (id) => {
    return bookingClient.post(`/bookings/${id}/cancel`);
  },
};

export default bookingApi;