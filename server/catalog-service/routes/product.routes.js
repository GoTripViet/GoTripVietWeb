// routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole.middleware');

// --- Public Routes (Cho khách hàng và các service khác) ---

// GET /products (Lấy danh sách, có filter, ví dụ: /products?product_type=tour&location_id=...)
router.get('/', productController.getProducts);

// GET /products/:idOrSlug (Lấy chi tiết 1 sản phẩm)
router.get('/:idOrSlug', productController.getProductByIdOrSlug);

// --- Protected Routes (Cho Admin và Partner) ---

// POST /products (Tạo sản phẩm mới)
// Chỉ Admin hoặc Partner mới được tạo
router.post(
  '/',
  authMiddleware,
  checkRole(['admin', 'partner']), // Bảo vệ
  productController.createProduct
);

// PUT /products/:id (Cập nhật sản phẩm)
router.put(
  '/:id',
  authMiddleware,
  checkRole(['admin', 'partner']), // Bảo vệ
  productController.updateProduct
);

// DELETE /products/:id (Xóa mềm sản phẩm)
router.delete(
  '/:id',
  authMiddleware,
  checkRole(['admin', 'partner']), // Bảo vệ
  productController.deleteProduct
);

module.exports = router;