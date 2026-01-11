// controllers/product.controller.js
const productService = require("../services/product.service");

class ProductController {
  async createProduct(req, res) {
    try {

      const partnerRes = await axios.get(
        `${process.env.USER_SERVICE_URL}/users/${req.user.id}`,
        { headers: { Authorization: req.headers.authorization } }
      );
      const partner = partnerRes.data;

      if (!partner.partner_details?.is_approved) {
        return res.status(403).json({
          message: "Tài khoản đối tác của bạn chưa được duyệt. Vui lòng chờ Admin phê duyệt."
        });
      }

      const partnerId = req.user.id; // Lấy ID của người đang đăng nhập
      const product = await productService.createProduct(req.body, partnerId);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getMyProducts(req, res) {
    try {
      const partnerId = req.user.id; // Lấy ID từ token
      // Gọi service tìm product có partner_id trùng khớp
      const products = await productService.getProducts({ ...req.query, partner_id: partnerId });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
