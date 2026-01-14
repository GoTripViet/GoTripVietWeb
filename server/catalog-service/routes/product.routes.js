// routes/product.routes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

// --- Public Routes (Cho khách hàng và các service khác) ---

// GET /products (Lấy danh sách, có filter, ví dụ: /products?product_type=tour&location_id=...)
router.get("/", productController.getProducts);


router.get('/internal/:id', async (req, res) => {
    try {
        // Import Model trực tiếp ở đây để đảm bảo chạy được ngay
        const Product = require('../models/product.model'); 
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).json({ message: 'Not found' });
        
        // Trả về product (quan trọng nhất là field partner_id)
        res.json({ product }); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /products/admin/:idOrSlug (Lấy chi tiết sản phẩm cho Admin/Partner, bao gồm các trường nhạy cảm)
router.get(
  "/admin/:idOrSlug",
  authMiddleware,
  checkRole(["admin", "partner"]),
  productController.getProductByIdOrSlugAdmin
);

router.get(
  "/partner/me",
  authMiddleware,
  checkRole(["partner", "admin"]),
  productController.getMyProducts
);

router.post(
  "/:id/schedules",
  authMiddleware,
  checkRole(["partner", "admin"]),
  productController.addSchedule
);

router.delete(
  "/:id/schedules/:scheduleId",
  authMiddleware,
  checkRole(["partner", "admin"]),
  productController.removeSchedule
);

// GET /products/:idOrSlug (Lấy chi tiết 1 sản phẩm)
router.get("/:idOrSlug", productController.getProductByIdOrSlug);

// --- Protected Routes (Cho Admin và Partner) ---

// POST /products (Tạo sản phẩm mới)
// Chỉ Admin hoặc Partner mới được tạo
router.post(
  "/",
  authMiddleware,
  checkRole(["admin", "partner"]), // Bảo vệ
  productController.createProduct
);

// PUT /products/:id (Cập nhật sản phẩm)
router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin", "partner"]), // Bảo vệ
  productController.updateProduct
);

// DELETE /products/:id (Xóa mềm sản phẩm)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin", "partner"]), // Bảo vệ
  productController.deleteProduct
);

module.exports = router;
