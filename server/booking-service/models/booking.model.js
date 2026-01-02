// models/booking.model.js
const mongoose = require('mongoose');

// Đây là schema cho MỘT MỤC HÀNG (được nhúng)
const bookingItemSchema = new mongoose.Schema({
  product_id: { // ID từ Catalog
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // (Ref logic)
    required: true,
  },
  inventory_id: { // ID từ Inventory
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem', // (Ref logic)
    required: true,
  },
  product_type: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit_price: { // Giá tại thời điểm đặt
    type: Number,
    required: true,
  },
  
  // --- "ẢNH CHỤP NHANH" (SNAPSHOT) ---
  // Lưu lại thông tin sản phẩm TẠI THỜI ĐIỂM ĐẶT
  snapshot: {
    title: { type: String, required: true },
    description_short: String,
    image: String, // (Lấy ảnh đầu tiên)
    
    // Lưu lại chi tiết (ví dụ: ngày tour, tên phòng)
    // Tùy chỉnh dựa trên product_type
    details_text: String, 
  }
}, { _id: false }); // Không cần _id cho sub-document này

// Đây là schema cho THANH TOÁN (được nhúng)
const paymentSchema = new mongoose.Schema({
  gateway: { type: String, required: true }, // 'MoMo', 'Stripe'
  gateway_transaction_id: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: true }); // Cần _id để tham chiếu

// --- SCHEMA CHÍNH: ĐƠN HÀNG ---
const bookingSchema = new mongoose.Schema(
  {
    user_id: { // ID của User (từ UserService)
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'failed'],
      default: 'pending',
      index: true,
    },
    
    // Thông tin giá
    pricing: {
      total_price_before_discount: { type: Number, required: true },
      discount_amount: { type: Number, default: 0 },
      final_price: { type: Number, required: true },
    },
    promotion_id: { // REF (nếu có dùng mã)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
    },

    // [MỚI] Danh sách hành khách chi tiết
    passengers: [
      {
        type: { type: String, enum: ['adult', 'child', 'toddler', 'infant'], required: true }, // Người lớn, Trẻ em...
        fullName: { type: String, required: true },
        gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
        dateOfBirth: { type: Date }, // Có thể null nếu không nhập
      }
    ],

    // --- NHÚNG (EMBED) ---
    items: [bookingItemSchema],
    payments: [paymentSchema],
    
    // Thông tin người liên hệ (Người đặt) - Đã cập nhật đầy đủ
    customer_details: {
      fullName: String,
      email: String,
      phone: String,
      address: String, // [MỚI] Thêm địa chỉ
      note: String     // [MỚI] Thêm ghi chú
    }
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model('Booking', bookingSchema);