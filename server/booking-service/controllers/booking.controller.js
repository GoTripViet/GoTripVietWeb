// controllers/booking.controller.js
const bookingService = require('../services/booking.service');

class BookingController {
  
  // POST /bookings
  async createBooking(req, res) {
    try {
      const userId = req.user.id;
      // [MỚI] Lấy thêm promotionCode
      const { items, promotionCode } = req.body; 
      const userAuthToken = req.headers['authorization'];

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: '"items" array is required' });
      }

      // [MỚI] Truyền promotionCode vào service
      const result = await bookingService.createBooking(userId, items, promotionCode, userAuthToken);
      res.status(201).json(result);
      
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /bookings/me
  async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getBookingsByUserId(userId);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /bookings/:id
  async getBookingDetails(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      
      const booking = await bookingService.getBookingDetails(bookingId, userId);
      res.status(200).json(booking);
    } catch (error) {
      if (error.message.startsWith('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      if (error.message.startsWith('Booking not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  // POST /bookings/webhook/payment
  async webhookHandlePayment(req, res) {
    try {
      // PaymentService sẽ gửi bookingId và thông tin thanh toán
      const { bookingId, paymentInfo } = req.body;
      
      if (!bookingId || !paymentInfo) {
        return res.status(400).json({ message: 'bookingId and paymentInfo are required' });
      }

      // Gọi service (đã được sửa)
      await bookingService.confirmBooking(bookingId, paymentInfo);
      
      // Trả lời 200 OK ngay lập tức cho Webhook
      res.status(200).json({ received: true });
      
    } catch (error) {
      // (Trong hệ thống thật, log lỗi này cẩn thận)
      console.error('--- WEBHOOK FAILED ---', error.message);
      res.status(500).json({ received: false, message: error.message });
    }
  }

  /**
   * [MỚI] POST /bookings/:id/cancel
   * Hủy một đơn hàng
   */
  async cancelBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      const userAuthToken = req.headers['authorization'];

      const booking = await bookingService.cancelBooking(
        bookingId,
        userId,
        userAuthToken
      );
      
      res.status(200).json(booking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }  


  // GET /bookings/admin/all
  async adminGetAllBookings(req, res) {
    try {
      const result = await bookingService.getAllBookings(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /bookings/admin/user/:userId
  async adminGetBookingsForUser(req, res) {
    try {
      const bookings = await bookingService.getBookingsByUserId(req.params.userId);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /bookings/:id/admin/cancel
  async adminCancelBooking(req, res) {
    try {
      const adminAuthToken = req.headers['authorization'];
      const bookingId = req.params.id;
      
      const booking = await bookingService.adminCancelBooking(bookingId, adminAuthToken);
      res.status(200).json(booking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // --- (Chúng ta sẽ thêm API Webhook thanh toán sau) ---
}

module.exports = new BookingController();