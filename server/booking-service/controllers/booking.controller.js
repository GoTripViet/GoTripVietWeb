// controllers/booking.controller.js
const bookingService = require('../services/booking.service');

class BookingController {

  // POST /bookings
  async createBooking(req, res) {
    try {
      const userId = req.user.id;

      // Lấy đầy đủ dữ liệu từ Frontend gửi lên
      const { items, promotionCode, passengers, contactInfo } = req.body;

      const userAuthToken = req.headers['authorization'];

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: '"items" array is required' });
      }

      // Truyền tất cả vào Service dưới dạng MỘT OBJECT
      const result = await bookingService.createBooking({
        userId,
        items,
        promotionCode,
        userAuthToken,
        passengers,
        contactInfo
      });

      res.status(201).json(result);

    } catch (error) {
      console.error("Create Booking Error:", error.message);
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

  // [HÀM MỚI] POST /bookings/internal/confirm-payment
  // Thay thế cho webhookHandlePayment cũ
  async confirmPaymentInternal(req, res) {
    try {
      // Nhận dữ liệu từ Payment Service gửi sang
      const { bookingId, paymentInfo } = req.body;

      if (!bookingId) {
        return res.status(400).json({ message: 'Missing bookingId' });
      }

      console.log(`⚡ Booking Service nhận lệnh confirm cho đơn: ${bookingId}`);

      // Gọi Service để update DB
      const updatedBooking = await bookingService.confirmBooking(bookingId, paymentInfo);
      
      // Trả về kết quả ngay lập tức (để Payment Service lấy data trả về cho FE)
      res.status(200).json(updatedBooking);

    } catch (error) {
      console.error('Lỗi Confirm Payment:', error.message);
      res.status(500).json({ message: error.message });
    }
  }

  // POST /bookings/:id/cancel
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
}

module.exports = new BookingController();