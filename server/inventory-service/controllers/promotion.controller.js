// controllers/promotion.controller.js
const promotionService = require('../services/promotion.service');

class PromotionController {
  async createPromotion(req, res) {
    try {
      const promotion = await promotionService.createPromotion(req.body);
      res.status(201).json(promotion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllPromotions(req, res) {
    try {
      const promotions = await promotionService.getAllPromotions();
      res.status(200).json(promotions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPromotionByCode(req, res) {
    try {
      const promotion = await promotionService.getPromotionByCode(req.params.code);
      res.status(200).json(promotion);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
  
  async updatePromotion(req, res) {
    try {
      const promotion = await promotionService.updatePromotion(req.params.id, req.body);
      res.status(200).json(promotion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deletePromotion(req, res) {
    try {
      const result = await promotionService.deletePromotion(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new PromotionController();