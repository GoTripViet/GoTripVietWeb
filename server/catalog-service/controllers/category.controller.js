// controllers/category.controller.js
const categoryService = require('../services/category.service');
const Category = require('../models/category.model'); // [QUAN TRỌNG] Import Model

class CategoryController {

  // [MỚI] Hàm xử lý yêu cầu tạo danh mục (Partner)
  async requestCategory(req, res) {
    try {
      const { name, parent } = req.body; // Có thể partner muốn request sub-category
      const userId = req.user?._id || req.user?.id;

      // 1. Kiểm tra trùng tên (Case insensitive)
      const existing = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
      });

      if (existing) {
        return res.status(400).json({ message: "Danh mục này đã tồn tại." });
      }

      // 2. Tạo mới với status 'pending'
      const newCategory = await Category.create({
        name: name.trim(),
        parent: parent || null,
        status: 'pending',
        created_by: userId
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  // [CẬP NHẬT] Hàm lấy danh sách (Hỗ trợ lọc cho Partner)
  async getAllCategories(req, res) {
    try {
      const { query_mode } = req.query;
      const userId = req.user?._id || req.user?.id;

      // Nếu là Partner đang lấy danh sách để chọn
      if (query_mode === 'partner' && userId) {
        const categories = await Category.find({
          $or: [
            { status: 'active' }, // Lấy cái chung
            { status: 'pending', created_by: userId } // Lấy cái mình đang request
          ]
        }).sort({ name: 1 });
        
        return res.status(200).json(categories);
      }

      // Mặc định: Giữ nguyên logic cũ (gọi qua service hoặc lấy active)
      // Nếu service của bạn chưa lọc status='active', bạn có thể lọc ở đây hoặc trong service
      const categories = await categoryService.getAllCategories(req.query);
      
      // Tùy chọn: Nếu muốn public API chỉ trả về active (để khách không thấy rác)
      // const activeCats = categories.filter(c => c.status === 'active');
      // res.status(200).json(activeCats);
      
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCategoryByIdOrSlug(req, res) {
    try {
      const category = await categoryService.getCategoryByIdOrSlug(req.params.idOrSlug);
      res.status(200).json(category);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.status(200).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new CategoryController();