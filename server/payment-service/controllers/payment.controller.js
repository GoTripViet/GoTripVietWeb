// controllers/payment.controller.js
const paymentService = require('../services/payment.service');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

class PaymentController {

  // POST /payment/create-payment-intent
  async createPaymentIntent(req, res) {
    try {
      const userId = req.user.id;
      const { bookingId, amount } = req.body;

      if (!bookingId || !amount) {
        return res.status(400).json({ message: 'bookingId and amount are required' });
      }

      const result = await paymentService.createPaymentIntent(userId, bookingId, amount);
      res.status(200).json(result);

    } catch (error) {
      res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
    }
  }

  // POST /payment/webhook/stripe
  // [SỬA LẠI HÀM NÀY]
  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    // 1. KIỂM TRA: CÓ CHỮ KÝ (sig) KHÔNG?
    if (!sig) {
      // --- TRƯỜNG HỢP TEST (POSTMAN) ---
      // Nếu không có chữ ký, chúng ta bỏ qua xác thực và tin tưởng body.
      console.warn('⚠️ WARNING: Stripe signature not found. Bypassing validation for testing.');
      try {
        // req.rawBody là một Buffer, chúng ta cần parse nó
        event = JSON.parse(req.rawBody.toString('utf8'));
      } catch (jsonErr) {
        return res.status(400).send(`Webhook Test Error: Invalid JSON format. ${jsonErr.message}`);
      }
    } else {
      // --- TRƯỜNG HỢP CHẠY THẬT (PRODUCTION/NGROK) ---
      // Nếu có chữ ký, chúng ta phải xác thực
      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
      } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    // 2. GIAO CHO SERVICE XỬ LÝ
    // (Bây giờ 'event' đã là 1 object JSON hợp lệ)
    try {
      await paymentService.handleStripeWebhook(event);
    } catch (error) {
      console.error(`Webhook processing error: ${error.message}`);
      return res.status(500).json({ message: 'Webhook processing error' });
    }

    // 3. Phản hồi 200 cho Stripe/Postman
    res.status(200).json({ received: true });
  }

  // POST /payment/refund
  async refundPayment(req, res) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: 'bookingId is required' });
      }

      const payment = await paymentService.refundPayment(bookingId);
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Refund failed', error: error.message });
    }
  }

  // --- [MỚI] API ADMIN ---

  // GET /payment/admin/all
  async adminGetAllPayments(req, res) {
    try {
      const result = await paymentService.getAllPayments(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /payment/booking/:bookingId
  async adminGetPaymentsForBooking(req, res) {
    try {
      const payments = await paymentService.getPaymentsForBooking(req.params.bookingId);
      res.status(200).json(payments);
    } catch (error) {
      res.status(404).json({ message: 'Payments not found', error: error.message });
    }
  }

  createVNPayUrl(req, res) {
    try {
      // Lấy dữ liệu từ Frontend gửi lên
      const { amount, bookingId, bankCode, language } = req.body;

      if (!bookingId || !amount) {
        return res.status(400).json({ message: 'Thiếu bookingId hoặc amount' });
      }

      // Gọi Service tạo URL
      const paymentUrl = paymentService.createVNPayUrl(req, bookingId, amount, bankCode, language);

      // --- KHÁC BIỆT SO VỚI CODE MẪU ---
      // Code mẫu dùng: res.redirect(paymentUrl) -> Backend tự chuyển hướng
      // Code mới dùng: res.status(200).json({ paymentUrl }) -> Trả link về cho React tự chuyển hướng
      // Lý do: Để React kiểm soát được loading spinner và xử lý lỗi tốt hơn.

      res.status(200).json({ paymentUrl });

    } catch (error) {
      console.error("Lỗi Controller VNPAY:", error);
      res.status(500).json({ message: 'Lỗi tạo link VNPAY', error: error.message });
    }
  }

  async vnpayReturn(req, res) {
    try {
      // req.query chứa toàn bộ tham số VNPAY trả về trên URL
      const result = await paymentService.verifyVNPayReturn(req.query);

      // [SỬA ĐỔI] Trả về trực tiếp result, KHÔNG bọc trong object khác
      if (result.status === 'success') {
        // Frontend sẽ nhận được: { status: 'success', data: { ...booking } }
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Lỗi server', error: error.message });
    }
  }

  // POST /payment/refund
  async refundPayment(req, res) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: 'bookingId is required' });
      }

      const payment = await paymentService.refundPayment(bookingId);
      res.status(200).json(payment);
    } catch (error) {
      // [THÊM DÒNG NÀY ĐỂ SOI LỖI]
      console.error("❌ CHI TIẾT LỖI REFUND:", error);

      res.status(500).json({ message: 'Refund failed', error: error.message });
    }
  }

  // --- API ADMIN ---

  // GET /payment/admin/all
  async adminGetAllPayments(req, res) {
    try {
      const result = await paymentService.getAllPayments(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PaymentController();