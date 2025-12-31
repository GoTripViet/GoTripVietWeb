// controllers/category.controller.js
const categoryService = require('../services/category.service');

class CategoryController {
  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllCategories(req, res) {
    try {
      // Chuyển req.query vào service để lọc (ví dụ: /categories?parent=null)
      const categories = await categoryService.getAllCategories(req.query);
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
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