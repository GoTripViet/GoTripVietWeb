// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole.middleware');
const apiKeyAuth = require('../middleware/apiKey.middleware');

// --- [MỚI] API NỘI BỘ (Service-to-Service) ---
// Thay thế cho Webhook cũ. Payment Service sẽ gọi vào đây.
// Bảo vệ bằng API Key, KHÔNG yêu cầu User Token.
router.post(
  '/internal/confirm-payment',
  apiKeyAuth, // Chỉ cho phép service có key gọi
  bookingController.confirmPaymentInternal
);

// -----------------------------------------------------
// CÁC API DƯỚI ĐÂY DÀNH CHO USER (YÊU CẦU ĐĂNG NHẬP)
// -----------------------------------------------------
router.use(authMiddleware);

// POST /bookings (Tạo đơn hàng mới)
router.post('/', bookingController.createBooking);

// GET /bookings (Lấy lịch sử đơn hàng)
router.get('/my-bookings', bookingController.getMyBookings); // Lưu ý: Nên dùng /my-bookings hoặc / để đồng bộ với API Client

// GET /bookings (Lấy lịch sử đơn hàng - Route gốc)
router.get('/', bookingController.getMyBookings);

// GET /bookings/:id (Xem chi tiết 1 đơn)
router.get('/:id', bookingController.getBookingDetails);

// POST /bookings/:id/cancel (Hủy đơn hàng)
router.post(
  '/:id/cancel',
  bookingController.cancelBooking
);


// -----------------------------------------------------
// CÁC API DÀNH CHO ADMIN
// -----------------------------------------------------

// GET /bookings/admin/all
router.get(
  '/admin/all',
  checkRole(['admin']), // Chỉ Admin
  bookingController.adminGetAllBookings
);

// GET /bookings/admin/user/:userId
router.get(
  '/admin/user/:userId',
  checkRole(['admin']),
  bookingController.adminGetBookingsForUser
);

// POST /bookings/:id/admin/cancel
router.post(
  '/:id/admin/cancel',
  checkRole(['admin']),
  bookingController.adminCancelBooking
);

module.exports = router;