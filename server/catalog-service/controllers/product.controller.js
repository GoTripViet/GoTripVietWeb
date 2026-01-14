// controllers/product.controller.js
const productService = require("../services/product.service");
const axios = require('axios');

class ProductController {

  // 1. TẠO SẢN PHẨM
  async createProduct(req, res) {
    try {
      // Gọi sang User Service để lấy thông tin mới nhất của user (role, status...)
      const partnerRes = await axios.get(
        `${process.env.USER_SERVICE_URL}/users/${req.user.id}`,
        { headers: { Authorization: req.headers.authorization } }
      );
      const currentUser = partnerRes.data;

      // [LOGIC MỚI] Chỉ check duyệt nếu role là 'partner'
      // Nếu là Admin thì cho qua luôn
      if (currentUser.roles.includes('partner')) {
        if (!currentUser.partner_details?.is_approved) {
          return res.status(403).json({
            message: "Tài khoản đối tác của bạn chưa được duyệt. Vui lòng chờ Admin phê duyệt."
          });
        }
      }

      // Tiến hành tạo sản phẩm
      const partnerId = req.user.id;
      const product = await productService.createProduct(req.body, partnerId);

      res.status(201).json(product);

    } catch (error) {
      console.error("❌ LỖI TẠO SẢN PHẨM:", error);
      // Xử lý lỗi từ axios (nếu User Service chết hoặc lỗi)
      const msg = error.response?.data?.message || error.message;
      res.status(400).json({ message: msg });
    }
  }

  // 2. LẤY SẢN PHẨM CỦA TÔI (PARTNER)
  async getMyProducts(req, res) {
    try {
      const partnerId = req.user.id;
      console.log("🔍 Đang tìm tour cho User ID:", partnerId);

      // Hàm này trả về { products: [], totalProducts: ... }
      const result = await productService.getProducts({ ...req.query, partner_id: partnerId });

      // Lấy mảng products ra để trả về
      const tourList = result.products || [];

      console.log(`✅ Tìm thấy: ${tourList.length} kết quả.`);
      res.status(200).json(tourList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 3. LẤY DANH SÁCH PUBLIC (SEARCH/FILTER)
  async getProducts(req, res) {
    try {
      const result = await productService.getProducts(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 4. LẤY CHI TIẾT PUBLIC
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

  // 5. CẬP NHẬT SẢN PHẨM
  async updateProduct(req, res) {
    try {
      const partnerId = req.user.id;
      const productId = req.params.id;

      const updatedProduct = await productService.updateProduct(
        productId,
        req.body,
        partnerId
      );
      res.status(200).json(updatedProduct);
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

  // 6. XÓA SẢN PHẨM
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

  // 7. LẤY CHI TIẾT CHO ADMIN (FULL FIELD)
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

  // ==================================================
  // 👇 CÁC HÀM MỚI BỔ SUNG ĐỂ FIX LỖI ROUTE 👇
  // ==================================================

  // 8. THÊM LỊCH KHỞI HÀNH (Schedule)
  async addSchedule(req, res) {
    try {
      const partnerId = req.user.id;
      const productId = req.params.id;
      const scheduleData = req.body; // { start_date, inventory, price... }

      const updatedProduct = await productService.addSchedule(productId, scheduleData, partnerId);
      res.status(200).json(updatedProduct);
    } catch (error) {
      if (error.message.includes("Forbidden")) return res.status(403).json({ message: error.message });
      if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
      res.status(400).json({ message: error.message });
    }
  }

  // 9. XÓA LỊCH KHỞI HÀNH
  async removeSchedule(req, res) {
    try {
      const partnerId = req.user.id;
      const productId = req.params.id;
      const scheduleId = req.params.scheduleId;

      const updatedProduct = await productService.removeSchedule(productId, scheduleId, partnerId);
      res.status(200).json(updatedProduct);
    } catch (error) {
      if (error.message.includes("Forbidden")) return res.status(403).json({ message: error.message });
      if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();