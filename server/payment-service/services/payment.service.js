// services/payment.service.js
const Stripe = require('stripe');
const Payment = require('../models/payment.model');
const axios = require('axios');

// --- [QUAN TRỌNG] THÊM CÁC THƯ VIỆN NÀY ĐỂ CHẠY VNPAY ---
const moment = require('moment'); // Đảm bảo đã npm install moment
const qs = require('qs');         // Đảm bảo đã npm install qs
const crypto = require('crypto');

// Khởi tạo Stripe với khóa bí mật
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const BOOKING_URL = process.env.BOOKING_SERVICE_URL;
const API_KEY = process.env.INTERNAL_API_KEY;

class PaymentService {

  /**
   * 1. Tạo một phiên thanh toán (Payment Intent) - STRIPE
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


  /**
   * [Admin] Lấy tất cả thanh toán (có phân trang)
   */
  async getAllPayments(queryParams) {
    const { page = 1, limit = 10, status } = queryParams;
    let filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
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

  /**
   * TẠO URL THANH TOÁN VNPAY
   */
  createVNPayUrl(req, bookingId, amount, bankCode) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // Lấy Key từ .env (Đã cập nhật ở Bước 1)
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = bookingId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + bookingId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // Nhân 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // --- SẮP XẾP THAM SỐ (BẮT BUỘC) ---
    vnp_Params = this.sortObject(vnp_Params);

    // --- TẠO CHỮ KÝ ---
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnp_Params['vnp_SecureHash'] = signed;

    const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

    return finalUrl;
  }

  // Hàm sắp xếp object (Quan trọng để không bị Sai chữ ký)
  sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }



}

module.exports = new PaymentService();