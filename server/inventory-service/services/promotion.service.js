// services/promotion.service.js
const Promotion = require('../models/promotion.model');

class PromotionService {
  async createPromotion(data) {
    const promotion = new Promotion(data);
    return await promotion.save();
  }

  async getAllPromotions() {
    return await Promotion.find({ is_active: true });
  }

  async getPromotionByCode(code) {
    const promotion = await Promotion.findOne({ code: code.toUpperCase(), is_active: true });
    if (!promotion) {
      throw new Error('Promotion code not found or has expired');
    }
    return promotion;
  }

  async updatePromotion(id, updateData) {
    const promotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  }

  async deletePromotion(id) {
    // Soft delete: Tắt kích hoạt thay vì xóa
    const promotion = await Promotion.findByIdAndUpdate(id, { is_active: false }, { new: true });
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return { message: 'Promotion deactivated' };
  }
}

module.exports = new PromotionService();