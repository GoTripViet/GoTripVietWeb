// routes/category.routes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

// --- Partner Routes (THÊM MỚI) ---
// POST /categories/request
// Route này cho phép Partner gửi yêu cầu tạo danh mục mới
router.post(
  "/request",
  authMiddleware,
  checkRole(["partner", "admin"]),
  categoryController.requestCategory
);

// --- Public Routes ---
router.get("/", categoryController.getAllCategories);
router.get("/:idOrSlug", categoryController.getCategoryByIdOrSlug);

// --- Admin Routes ---
// POST /categories (Admin tạo trực tiếp)
router.post(
  "/",
  authMiddleware,
  checkRole(["admin"]),
  categoryController.createCategory
);

// PUT /categories/:id
router.put(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  categoryController.updateCategory
);

// DELETE /categories/:id
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;