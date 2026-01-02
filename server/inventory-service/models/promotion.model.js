// models/promotion.model.js
const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['percentage', 'fixed_amount'], 
    required: true 
  },
  value: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  description: String,
  is_active: { type: Boolean, default: true },
  
  // --- QUẢN LÝ SỐ LƯỢNG ---
  usage_limit: { type: Number, default: 0 }, // 0 là không giới hạn
  used_count: { type: Number, default: 0 },  // Tăng lên mỗi khi có người dùng thành công

  rules: {
    valid_from: { type: Date },
    valid_to: { type: Date },
    applies_to_product_type: { type: String, enum: ['tour', 'hotel', 'flight'] },
    min_spend: { type: Number, default: 0 },
    
    // [QUAN TRỌNG] Giảm tối đa bao nhiêu tiền (Dùng cho loại percentage)
    max_discount_amount: { type: Number }, 
    
    // [MỞ RỘNG] Chỉ áp dụng cho các danh mục này (VD: Chỉ tour Châu Á)
    applicable_category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
  },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);