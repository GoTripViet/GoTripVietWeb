// Dòng 1: Phải gọi 'dotenv' đầu tiên để load file .env
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

// -------------------------------------------------------------------
// 1. ĐỊNH NGHĨA CÁC SERVICE ĐÍCH
// -------------------------------------------------------------------
// SỬA LỖI CHẬM: Đã đổi 'localhost' thành '127.0.0.1'
const SERVICES = {
  users: 'http://127.0.0.1:3001',   // User Service
  catalog: 'http://127.0.0.1:3002', // Catalog Service
  inventory: 'http://127.0.0.1:3003', // Inventory Service
  booking: 'http://127.0.0.1:3004', // Booking Service
  ai: 'http://127.0.0.1:3005', // AI Service
  interaction: 'http://127.0.0.1:3006', // Interaction Service
  payment: 'http://127.0.0.1:3007', // Payment Service
  notification: 'http://127.0.0.1:3008', // Notification Service
};

// Lấy khóa bí mật từ file .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const app = express();
app.use(cors()); // Cho phép CORS
app.use(morgan('dev')); // Log request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------------
// 2. MIDDLEWARE XÁC THỰC (TƯỜNG LỬA)
// -------------------------------------------------------------------
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy 'Bearer <token>'

    if (token == null) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Xác thực token
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }

      // Gắn thông tin user (payload) vào request
      req.user = user;
      next(); // Cho phép đi tiếp
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error in Auth Middleware' });
  }
};

// -------------------------------------------------------------------
// 3. ĐỊNH NGHĨA CÁC QUY TẮC ĐIỀU HƯỚNG (ROUTING)
// -------------------------------------------------------------------

// SỬA LỖI TIMEOUT: Thêm proxyTimeout để xử lý "cold start" của DB
const proxyOptions = {
  changeOrigin: true,
  onProxyReq: fixRequestBody, // Cần thiết cho các request POST/PUT/PATCH
  proxyTimeout: 120000, // Cho phép chờ 2 phút (120,000 ms)
};

// --- A. Các route CÔNG KHAI (Không cần đăng nhập) ---

// User Service (Đăng nhập, Đăng ký)
// Gửi /auth/* -> http://127.0.0.1:3001/auth/*
app.use('/auth', createProxyMiddleware({ ...proxyOptions, target: SERVICES.users }));

// Catalog Service (Xem sản phẩm, tìm kiếm công khai)
// Gửi /products/* -> http://127.0.0.1:3002/products/*
app.use('/products', createProxyMiddleware({ ...proxyOptions, target: SERVICES.catalog }));

// AI Service (Tìm kiếm ngữ nghĩa công khai)
// Gửi /ai/search -> http://127.0.0.1:3005/ai/search
app.use('/ai/search', createProxyMiddleware({ ...proxyOptions, target: SERVICES.ai }));


// --- B. Các route BẢO VỆ (Phải có token hợp lệ) ---

// Kích hoạt "tường lửa" (authMiddleware) cho TẤT CẢ các route bên dưới
app.use(authMiddleware);

// User Service (Lấy thông tin profile, cập nhật sở thích)
// Gửi /users/* -> http://127.0.0.1:3001/users/*
app.use('/users', createProxyMiddleware({ ...proxyOptions, target: SERVICES.users }));

// Booking Service (Tạo đơn hàng, xem lịch sử)
// Gửi /booking/* -> http://127.0.0.1:3004/booking/*
app.use('/booking', createProxyMiddleware({ ...proxyOptions, target: SERVICES.booking }));

// Interaction Service (Viết review, chat)
// Gửi /interaction/* -> http://127.0.0.1:3006/interaction/*
app.use('/interaction', createProxyMiddleware({ ...proxyOptions, target: SERVICES.interaction }));

// Payment Service (Tạo phiên thanh toán)
app.use('/payment', createProxyMiddleware({ ...proxyOptions, target: SERVICES.payment }));

// -------------------------------------------------------------------
// 4. XỬ LÝ LỖI CHUNG
// -------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found: Endpoint does not exist on Gateway' });
});

// -------------------------------------------------------------------
// 5. KHỞI CHẠY GATEWAY
// -------------------------------------------------------------------
// Lấy port từ file .env, nếu không có thì mặc định là 3000
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
});