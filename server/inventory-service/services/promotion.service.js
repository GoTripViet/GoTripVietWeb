// services/promotion.service.js
const Promotion = require("../models/promotion.model");

class PromotionService {
  async createPromotion(data) {
    const promotion = new Promotion(data);
    return await promotion.save();
  }

  async getAllPromotions() {
    return Promotion.find({}).sort({ createdAt: -1 });
  }

  async getPromotionByCode(code) {
    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      is_active: true,
    });
    if (!promotion) {
      throw new Error("Promotion code not found or has expired");
    }
    return promotion;
  }

  async updatePromotion(id, updateData) {
    const promotion = await Promotion.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    return promotion;
  }

  async deletePromotion(id) {
    const deleted = await Promotion.findByIdAndDelete(id);
    if (!deleted) throw new Error("Không tìm thấy promotion");
    return deleted;
  }

  async toggleStatus(id) {
    const promo = await Promotion.findById(id);
    if (!promo) throw new Error("Không tìm thấy promotion");
    promo.is_active = !promo.is_active;
    await promo.save();
    return promo;
  }
}

module.exports = new PromotionService();
