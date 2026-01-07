// routes/location.routes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole.middleware');

// --- Partner Routes (THÊM MỚI) ---
// POST /locations/request
// Route này cho phép Partner (hoặc Admin) gửi yêu cầu tạo địa điểm mới
// Lưu ý: Đặt route này trước các route có tham số (/:id...) để tránh xung đột
router.post(
  '/request',
  authMiddleware,
  checkRole(['partner', 'admin']), // Cho phép Partner và Admin
  locationController.requestLocation
);

// --- Public Routes ---
// GET /locations
router.get('/', locationController.getAllLocations);

// GET /locations/da-nang (slug) HOẶC /locations/672f... (id)
router.get('/:idOrSlug', locationController.getLocationByIdOrSlug);

// --- Admin Routes ---
// POST /locations (Admin tạo trực tiếp - status active luôn)
router.post(
  '/',
  authMiddleware,
  checkRole(['admin']),
  locationController.createLocation
);

// PUT /locations/:id
router.put(
  '/:id',
  authMiddleware,
  checkRole(['admin']),
  locationController.updateLocation
);

// DELETE /locations/:id
router.delete(
  '/:id',
  authMiddleware,
  checkRole(['admin']),
  locationController.deleteLocation
);

module.exports = router;