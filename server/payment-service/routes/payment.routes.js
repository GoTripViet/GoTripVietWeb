// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const apiKeyAuth = require('../middleware/apiKey.middleware'); // [MỚI]
const checkRole = require('../middleware/checkRole.middleware'); // [MỚI]

// --- API Cho Frontend (User gọi) ---
router.post(
  '/create-payment-intent',
  authMiddleware, 
  paymentController.createPaymentIntent
);

// --- API Cho Stripe (Webhook) ---
router.post(
  '/webhook/stripe',
  paymentController.handleStripeWebhook
);

// --- [MỚI] API NỘI BỘ (CHO BOOKING SERVICE GỌI) ---
router.post(
  '/refund',
  apiKeyAuth, // Bảo vệ bằng API Key
  paymentController.refundPayment
);

// --- [MỚI] API ADMIN ---
router.get(
  '/admin/all',
  authMiddleware,
  checkRole(['admin']), // Chỉ Admin
  paymentController.adminGetAllPayments
);

router.get(
  '/booking/:bookingId',
  authMiddleware,
  checkRole(['admin']), // Chỉ Admin
  paymentController.adminGetPaymentsForBooking
);

router.post(
  '/create-vnpay-url',
  // authMiddleware, // (Bật cái này nếu muốn bắt buộc đăng nhập mới được tạo link)
  paymentController.createVNPayUrl
);

router.get('/vnpay-return', paymentController.vnpayReturn);

module.exports = router;