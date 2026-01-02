// controllers/product.controller.js
const productService = require("../services/product.service");

class ProductController {
  async createProduct(req, res) {
    try {
      // Lấy partnerId từ token (do authMiddleware + checkRole gán vào)
      // Giả định role 'partner' hoặc 'admin' mới được tạo
      const partnerId = req.user.id; // Lấy ID của người đang đăng nhập

      const product = await productService.createProduct(req.body, partnerId);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProducts(req, res) {
    try {
      // Lấy filter từ query string (ví dụ: /products?page=1&product_type=tour)
      const result = await productService.getProducts(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProductByIdOrSlug(req, res) {
    try {
      const product = await productService.getProductByIdOrSlug(
        req.params.idOrSlug
      );
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const partnerId = req.user.id; // ID người đang yêu cầu sửa
      const productId = req.params.id; // ID sản phẩm

      const updatedProduct = await productService.updateProduct(
        productId,
        req.body,
        partnerId
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      // Phân biệt lỗi 403 (Không có quyền) và 404 (Không tìm thấy)
      if (error.message.startsWith("Forbidden")) {
        return res.status(403).json({ message: error.message });
      }
      if (error.message.startsWith("Product not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const partnerId = req.user.id;
      const productId = req.params.id;

      const result = await productService.deleteProduct(productId, partnerId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message.startsWith("Forbidden")) {
        return res.status(403).json({ message: error.message });
      }
      if (error.message.startsWith("Product not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async getProductByIdOrSlugAdmin(req, res) {
    try {
      const product = await productService.getProductByIdOrSlugAdmin(
        req.params.idOrSlug
      );
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
