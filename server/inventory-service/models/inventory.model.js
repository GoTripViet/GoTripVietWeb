// models/inventory.model.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // --- THÔNG TIN CHUNG ---
  product_id: { // Nối với Product trong Catalog
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // (Ref này chỉ mang tính logic, không join)
    required: true,
  },
  product_type: {
    type: String,
    required: true,
    enum: ['tour', 'hotel', 'flight'],
  },
  price: { // Giá cơ bản
    type: Number,
    required: true,
    min: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },

  // --- TOUR (Ngày khởi hành) ---
  tour_details: {
    date: { type: Date }, // Ngày khởi hành
    total_slots: { type: Number },
    booked_slots: { type: Number, default: 0 },
  },

  // --- HOTEL (Sửa lại) ---
  hotel_details: {
    room_type_id: {
      type: String,
      // Chỉ bắt buộc NẾU là 'hotel'
      required: function() { return this.product_type === 'hotel'; }
    },
    room_name: {
      type: String,
      // Chỉ bắt buộc NẾU là 'hotel'
      required: function() { return this.product_type === 'hotel'; }
    },
    date: { type: Date },
    total_allotment: { type: Number },
    booked_allotment: { type: Number, default: 0 },
  },

  

  // --- FLIGHT (Sửa lại tương tự) ---
  flight_details: {
    flight_code: { 
      type: String,
      required: function() { return this.product_type === 'flight'; }
    },
    departure_time_utc: { type: Date },
    arrival_time_utc: { type: Date },
    seat_class: { 
      type: String, 
      enum: ['economy', 'business', 'first'],
      required: function() { return this.product_type === 'flight'; }
    },
    total_seats: { type: Number },
    booked_seats: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
  minimize: true,
});

// --- Tạo chỉ mục (Index) để query nhanh ---

// 1. Chỉ mục chính để tìm kiếm kho theo sản phẩm (Catalog)
inventorySchema.index({ product_id: 1 });

// 2. Chỉ mục đa hình
inventorySchema.index({ "tour_details.date": 1 }, { sparse: true });
inventorySchema.index({ "hotel_details.date": 1 }, { sparse: true });
inventorySchema.index({ "flight_details.departure_time_utc": 1 }, { sparse: true });

module.exports = mongoose.model('InventoryItem', inventorySchema);