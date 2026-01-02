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

    // 🔥 [MỚI] Thêm lịch vận chuyển cụ thể cho ngày này
    transport_schedule: {
      // Dùng chung cho cả Máy bay & Xe
      departure_time: { type: String },     // Giờ đi (VD: "09:00")
      arrival_time: { type: String },       // Giờ đến nơi (VD: "10:30")

      // Chiều về (nếu có)
      return_time: { type: String },        // Giờ về (VD: "15:00")
      return_arrival_time: { type: String },// Giờ về đến nơi (VD: "17:00")

      // Dành riêng cho MÁY BAY
      airline: { type: String },            // VD: "Vietnam Airlines"
      depart_code: { type: String },        // Mã chuyến đi: "VN123"
      return_code: { type: String },        // Mã chuyến về: "VN124"

      // Dành riêng cho XE / TÀU
      pickup_location: { type: String }     // Điểm đón cụ thể: "Nhà hát lớn"
    }
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
// inventorySchema.index({ "hotel_details.date": 1 }, { sparse: true });
// inventorySchema.index({ "flight_details.departure_time_utc": 1 }, { sparse: true });

module.exports = mongoose.model('InventoryItem', inventorySchema);