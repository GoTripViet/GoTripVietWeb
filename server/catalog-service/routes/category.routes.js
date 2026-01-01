// routes/category.routes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

// --- Public Routes ---
// GET /categories (Lấy tất cả, hoặc lọc, ví dụ: /categories?parent=null)
router.get("/", categoryController.getAllCategories);
// GET /categories/tour-bien (slug)
router.get("/:idOrSlug", categoryController.getCategoryByIdOrSlug);

// --- Admin Routes ---
// POST /categories
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
