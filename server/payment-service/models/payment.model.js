// models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking_id: { // ID từ Booking Service
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Booking', // Ref logic
    },
    user_id: { // ID của người trả tiền
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Ref logic
    },
    amount: { // Số tiền (tính bằng đồng nhỏ nhất, ví dụ: VND)
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'vnd',
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    amount_refunded: { // <-- THÊM TRƯỜNG MỚI
      type: Number,
      default: 0
    },
    gateway: {
      type: String,
      default: 'stripe',
    },
    // ID giao dịch của Stripe
    stripe_payment_intent_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);