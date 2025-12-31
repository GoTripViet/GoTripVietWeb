// services/category.service.js
const Category = require('../models/category.model');
const mongoose = require('mongoose');

class CategoryService {
  async createCategory(data) {
    const category = new Category(data);
    return await category.save();
  }

  /**
   * Lấy danh sách hạng mục, có thể lọc theo cha
   * @param {object} query - Ví dụ: { parent: null } (lấy mục cha)
   * hoặc { parent: 'ID_CHA' } (lấy mục con)
   */
  async getAllCategories(query) {
    let filter = {};
    if (query.parent === 'null') {
      filter.parent = null; // Lấy các hạng mục gốc
    } else if (query.parent) {
      filter.parent = query.parent; // Lấy con của 1 hạng mục
    }
    // Nếu không có query, lấy tất cả
    return await Category.find(filter).populate('parent', 'name slug'); // Nối thông tin cha
  }

  async getCategoryByIdOrSlug(identifier) {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    let category;

    if (isObjectId) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier });
    }

    if (!category) {
      throw new Error('Category not found');
    }
    return await category.populate('parent', 'name slug');
  }

  async updateCategory(id, updateData) {
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new Error('Category not found');
    }
    // (Logic nâng cao: Bạn có thể cần xử lý xóa/di chuyển các hạng mục con)
    return { message: 'Category deleted' };
  }
}

module.exports = new CategoryService();