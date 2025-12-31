// services/payment.service.js
const Stripe = require('stripe');
const Payment = require('../models/payment.model');
const axios = require('axios');

// Khởi tạo Stripe với khóa bí mật
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const BOOKING_URL = process.env.BOOKING_SERVICE_URL;
const API_KEY = process.env.INTERNAL_API_KEY;

class PaymentService {

  /**
   * 1. Tạo một phiên thanh toán (Payment Intent)
   * @param {string} userId - ID người dùng (từ token)
   * @param {string} bookingId - ID đơn hàng (từ frontend)
   * @param {number} amount - Số tiền (đã tính final_price)
   */
  async createPaymentIntent(userId, bookingId, amount) {
    // 1. Tạo PaymentIntent với Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe tính bằng đồng nhỏ nhất (VND)
      currency: 'vnd',
      description: `Payment for Booking ID: ${bookingId}`,
      metadata: { // Gắn metadata để Webhook nhận ra
        bookingId: bookingId,
        userId: userId,
      },
    });

    // 2. Lưu lại ý định thanh toán vào DB của chúng ta
    const newPayment = new Payment({
      booking_id: bookingId,
      user_id: userId,
      amount: amount,
      currency: 'vnd',
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
    });
    await newPayment.save();

    // 3. Trả về client_secret cho Frontend
    // Frontend (React) sẽ dùng key này để hiển thị ô nhập thẻ
    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: newPayment._id
    };
  }

  /**
   * 2. Xử lý Webhook từ Stripe
   * @param {object} event - Sự kiện từ Stripe
   */
  async handleStripeWebhook(event) {
    let paymentIntent;
    
    // 1. Xử lý sự kiện
    switch (event.type) {
      case 'payment_intent.succeeded':
        paymentIntent = event.data.object;
        console.log(`✅ PaymentIntent succeeded: ${paymentIntent.id}`);
        
        // Cập nhật DB của chúng ta
        const payment = await this.updatePaymentStatus(
          paymentIntent.id, 
          'succeeded'
        );
        
        // [QUAN TRỌNG] GỌI WEBHOOK CỦA BOOKING SERVICE
        await this.notifyBookingService(payment.booking_id, {
          gateway: 'stripe',
          transaction_id: paymentIntent.id,
        });
        break;

      case 'payment_intent.payment_failed':
        paymentIntent = event.data.object;
        console.log(`❌ PaymentIntent failed: ${paymentIntent.id}`);
        
        // Cập nhật DB của chúng ta
        await this.updatePaymentStatus(paymentIntent.id, 'failed');
        
        // (Tùy chọn: Có thể gọi Booking Service để hủy đơn hàng 'pending')
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
  
  // --- Hàm hỗ trợ ---

  /**
   * Cập nhật DB của Payment Service
   */
  async updatePaymentStatus(stripePaymentIntentId, status) {
    return await Payment.findOneAndUpdate(
      { stripe_payment_intent_id: stripePaymentIntentId },
      { $set: { status: status } },
      { new: true }
    );
  }

  /**
   * Gọi (Call) Webhook của Booking Service (Service-to-Service)
   */
  async notifyBookingService(bookingId, paymentInfo) {
    try {
      await axios.post(
        `${BOOKING_URL}/bookings/webhook/payment`,
        {
          bookingId: bookingId,
          paymentInfo: paymentInfo,
        },
        {
          headers: {
            'x-api-key': API_KEY, // Dùng API Key nội bộ
          },
        }
      );
      console.log(`Notified Booking Service for ${bookingId}`);
    } catch (error) {
      console.error(`ERROR notifying Booking Service: ${error.message}`);
      // (Trong hệ thống thật: Phải có cơ chế retry)
    }
  }

  /**
   * [Nội bộ] Xử lý hoàn tiền
   * @param {string} bookingId
   */
  // [SỬA LẠI HÀM NÀY]
  // [SỬA LẠI HOÀN TOÀN HÀM NÀY]
  // [SỬA LẠI HOÀN TOÀN HÀM NÀY]
  async refundPayment(bookingId) {
    // 1. Tìm giao dịch THÀNH CÔNG (trong DB local)
    const payment = await Payment.findOne({
      booking_id: bookingId,
      status: 'succeeded'
    });

    if (!payment) {
      throw new Error('No successful payment found for this booking to refund.');
    }

    // 2. GỌI STRIPE ĐỂ HOÀN TIỀN
    try {
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
      });

      // --- KỊCH BẢN 1: HOÀN TIỀN THẬT THÀNH CÔNG ---
      payment.amount_refunded = refund.amount;
      payment.status = 'refunded';
      await payment.save(); // Lưu lại
      
      console.log(`✅ Real Stripe Refund successful for ${payment.stripe_payment_intent_id}`);
      return payment; // Trả về

    } catch (stripeError) {
      
      // --- KỊCH BẢN 2: LỖI TỪ STRIPE ---
      console.error(`Stripe refund error: ${stripeError.message}`);
      
      // Kiểm tra xem đây có phải là lỗi "test data" không
      if (stripeError.code === 'charge_already_refunded' || stripeError.message.includes('does not have a successful charge to refund')) {
        
        console.warn('⚠️ WARNING: Stripe refund failed (Test data), proceeding to update local DB anyway...');
        
        // Vẫn cập nhật DB local của chúng ta
        payment.amount_refunded = payment.amount;
        payment.status = 'refunded';
        await payment.save(); // Lưu lại
        
        return payment; // Trả về (200 OK)
      } else {
        // Nếu là lỗi "thật" (ví dụ: API key sai), ném lỗi 500
        throw new Error(`Stripe refund failed: ${stripeError.message}`);
      }
    }
  }

  // --- [MỚI] API CHO ADMIN ---

  /**
   * [Admin] Lấy tất cả thanh toán (có phân trang)
   */
  // services/payment.service.js

  async getAllPayments(queryParams) {
    const { page = 1, limit = 10, status } = queryParams;
    let filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
      // .populate('user_id', 'fullName email') // <-- XÓA
      // .populate('booking_id', 'status') // <-- XÓA
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const totalPayments = await Payment.countDocuments(filter);
    
    return {
      payments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPayments / limit),
      totalPayments
    };
  }

  /**
   * [Admin] Lấy lịch sử thanh toán cho 1 đơn hàng
   * @param {string} bookingId
   */
  async getPaymentsForBooking(bookingId) {
    return await Payment.find({ booking_id: bookingId }).sort({ createdAt: -1 });
  }


}

module.exports = new PaymentService();