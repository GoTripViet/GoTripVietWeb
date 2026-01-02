// src/api/paymentApi.js
import axios from 'axios';

const paymentClient = axios.create({
  baseURL: 'http://localhost:3005', // Port của Payment Service
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn Token (nếu có yêu cầu đăng nhập để thanh toán)
paymentClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const paymentApi = {
  // Hàm này giả lập việc gọi cổng thanh toán
  // Trong thực tế, nó sẽ trả về URL của VNPay/MoMo hoặc ClientSecret của Stripe
  createPayment: (bookingId, amount, gateway = 'credit_card') => {
    return paymentClient.post('/payment/create', { bookingId, amount, gateway });
  },

  /**
     * Tạo URL thanh toán VNPAY
     * @param {object} data - { amount, bookingId, bankCode, language }
     */
    createVNPayUrl: (data) => {
        return paymentClient.post("/payment/create-vnpay-url", data);
    },

  // Hàm xác nhận thanh toán (nếu dùng thẻ test nội bộ)
  processMockPayment: (bookingId) => {
    // Giả sử ta gọi endpoint này để báo Payment Service là "Đã trả tiền xong"
    return paymentClient.post('/payment/mock-success', { bookingId });
  }

  

  

};

export default paymentApi;