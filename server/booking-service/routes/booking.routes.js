// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole.middleware');
const apiKeyAuth = require('../middleware/apiKey.middleware'); // [MỚI]

// --- [MỚI] API WEBHOOK (Công khai, nhưng bảo vệ bằng API Key) ---
router.post(
  '/webhook/payment',
  apiKeyAuth, // Dùng middleware mới
  bookingController.webhookHandlePayment
);

// Mọi API booking đều yêu cầu đăng nhập
router.use(authMiddleware);

// POST /bookings (Tạo đơn hàng mới)
router.post('/', bookingController.createBooking);

// GET /bookings (Lấy lịch sử đơn hàng)
router.get('/', bookingController.getMyBookings);

// GET /bookings/:id (Xem chi tiết 1 đơn)
router.get('/:id', bookingController.getBookingDetails);


// POST /bookings/:id/cancel
// Hủy đơn hàng
router.post(
  '/:id/cancel',
  bookingController.cancelBooking
);


// --- [MỚI] API Admin ---

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