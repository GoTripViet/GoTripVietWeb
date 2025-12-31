// services/booking.service.js
const Booking = require('../models/booking.model');
const axios = require('axios'); // Dùng để gọi API

// Lấy URL từ .env
const CATALOG_URL = process.env.CATALOG_SERVICE_URL;
const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL;
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL;
const API_KEY = process.env.INTERNAL_API_KEY;
class BookingService {

  /**
   * SỬA LẠI: Tạo đơn hàng, có xử lý Khuyến mãi
   * @param {string} userId
   * @param {Array} items - Các mục hàng
   * @param {string} promotionCode - Mã giảm giá (tùy chọn)
   * @param {string} userAuthToken - Token (để gọi service khác)
   */
  async createBooking(userId, items, promotionCode, userAuthToken) {
    
    // --- 1. Tính toán giá & Chuẩn bị Snapshot (Như cũ) ---
    let totalPrice = 0;
    let formattedItems = [];
    
    for (const item of items) {
      totalPrice += item.unitPrice * item.quantity;
      formattedItems.push({
        product_id: item.productId,
        inventory_id: item.inventoryId,
        product_type: item.productType,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        snapshot: {
          title: item.productTitle,
          details_text: item.detailsText,
          image: item.image
        }
      });
    }

    // --- 2. GỌI INVENTORY: Kiểm tra tồn kho (Như cũ) ---
    const checkStockRequest = {
      items: items.map(item => ({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
    };
    try {
      await axios.post(
        `${INVENTORY_URL}/inventory/check`,
        checkStockRequest,
        { headers: { 'Authorization': userAuthToken } }
      );
    } catch (error) {
      throw new Error(`Inventory check failed: ${error.response?.data?.message || error.message}`);
    }

    // --- 3. [MỚI] GỌI INVENTORY: Xử lý Khuyến mãi ---
    let discountAmount = 0;
    let finalPrice = totalPrice;
    let promotionId = null;

    if (promotionCode) {
      try {
        // Gọi API công khai của InventoryService
        const promoRes = await axios.get(`${INVENTORY_URL}/promotions/code/${promotionCode}`);
        const promotion = promoRes.data;

        // (Logic kiểm tra rules đơn giản)
        if (promotion.rules && promotion.rules.min_spend > totalPrice) {
          throw new Error(`Min spend for code ${promotionCode} is ${promotion.rules.min_spend}`);
        }

        // Tính toán giảm giá
        if (promotion.type === 'percentage') {
          discountAmount = totalPrice * (promotion.value / 100);
        } else if (promotion.type === 'fixed_amount') {
          discountAmount = promotion.value;
        }

        // Đảm bảo không giảm giá nhiều hơn tổng tiền
        if (discountAmount > totalPrice) {
          discountAmount = totalPrice;
        }

        finalPrice = totalPrice - discountAmount;
        promotionId = promotion._id;

      } catch (error) {
        throw new Error(`Invalid promotion code: ${error.response?.data?.message || error.message}`);
      }
    }

    // --- 4. TẠO BOOKING (Trạng thái: 'pending') ---
    const booking = new Booking({
      user_id: userId,
      status: 'pending',
      items: formattedItems,
      pricing: {
        total_price_before_discount: totalPrice,
        discount_amount: discountAmount, // [MỚI]
        final_price: finalPrice,         // [MỚI]
      },
      promotion_id: promotionId, // [MỚI]
    });
    
    await booking.save();

    // --- 5. TẠO THANH TOÁN (Giả lập) ---
    // (Sau này sẽ gọi PaymentService với finalPrice)
    
    return {
      bookingId: booking._id,
      status: booking.status,
      finalPrice: booking.pricing.final_price,
      paymentUrl: `http://payment-gateway.com/pay?bookingId=${booking._id}`,
    };
  }

  /**
   * Lấy lịch sử đặt hàng của 1 user
   * @param {string} userId 
   */
  async getBookingsByUserId(userId) { // <-- HÃY ĐẢM BẢO HÀM NÀY NẰM Ở ĐÂY
    return await Booking.find({ user_id: userId }).sort({ createdAt: -1 });
  }

  /**
   * Lấy chi tiết 1 đơn hàng (có kiểm tra chủ sở hữu)
   * @param {string} bookingId
   * @param {string} userId
   */
  async getBookingDetails(bookingId, userId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }
    // Đảm bảo user chỉ xem được đơn hàng của mình
    if (booking.user_id.toString() !== userId) {
      throw new Error('Forbidden: You do not own this booking');
    }
    
    return booking;
  }

  /**
   * [SỬA LẠI] Xác nhận đơn hàng (Dùng cho Webhook)
   * @param {string} bookingId - ID đơn hàng
   * @param {object} paymentInfo - Thông tin thanh toán
   */
  async confirmBooking(bookingId, paymentInfo) {
    // 1. Tìm đơn hàng
    // (Bỏ check user_id vì đây là Webhook)
    const booking = await Booking.findById(bookingId); 

    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // 2. Kiểm tra trạng thái
    if (booking.status !== 'pending') {
      throw new Error(`Booking is already ${booking.status}`);
    }

    // 3. Chuẩn bị dữ liệu để gọi Inventory
    const reserveRequest = {
      items: booking.items.map(item => ({
        inventoryId: item.inventory_id.toString(),
        quantity: item.quantity,
      })),
    };

    // 4. GỌI INVENTORY: Giữ chỗ (Dùng Internal API Key)
    try {
      await axios.post(
        `${INVENTORY_URL}/inventory/reserve`,
        reserveRequest,
        // [MỚI] Gửi API Key nội bộ thay vì token user
        { headers: { 'x-api-key': process.env.INTERNAL_API_KEY } }
      );
    } catch (error) {
      booking.status = 'failed';
      await booking.save();
      throw new Error(`Inventory reservation failed: ${error.response?.data?.message || error.message}`);
    }
    
    // 5. Cập nhật đơn hàng
    booking.status = 'confirmed';
    booking.payments.push({
      gateway: paymentInfo.gateway,
      gateway_transaction_id: paymentInfo.transaction_id,
      amount: booking.pricing.final_price,
      status: 'succeeded',
    });

    await booking.save();
    
    // 6. GỌI NOTIFICATION SERVICE
    console.log(`--- (Giả lập) Gửi email xác nhận cho đơn hàng ${booking._id} ---`);

    return booking;
  }

  /**
   * [SỬA LẠI] Hủy một đơn hàng (User tự hủy)
   */
  async cancelBooking(bookingId, userId, userAuthToken) {
    const booking = await Booking.findOne({ _id: bookingId, user_id: userId });
    if (!booking) throw new Error('Booking not found or access denied');
    
    const originalStatus = booking.status;
    if (originalStatus === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // 1. Nếu là 'pending', chỉ cần hủy
    if (originalStatus === 'pending') {
      booking.status = 'cancelled';
      await booking.save();
      return booking;
    }

    // 2. Nếu là 'confirmed', phải NHẢ KHO và HOÀN TIỀN
    if (originalStatus === 'confirmed') {
      
      // --- (Giữ nguyên) Gọi Inventory Service để Nhả Kho ---
      // --- SỬA LẠI CHỖ NÀY ---
      const releaseRequest = {
        items: booking.items.map(item => ({
          inventoryId: item.inventory_id.toString(),
          quantity: item.quantity,
        })),
      };
      try {
        await axios.post(
          `${INVENTORY_URL}/inventory/release`, 
          releaseRequest,
          { headers: { 'Authorization': userAuthToken } }
        );
      } catch (error) {
        throw new Error(`Stock release failed: ${error.message}`);
      }
      
      // --- [MỚI] GỌI PAYMENT SERVICE ĐỂ HOÀN TIỀN ---
      try {
        await axios.post(
          `${PAYMENT_URL}/payment/refund`,
          { bookingId: booking._id }, // Gửi bookingId
          { headers: { 'x-api-key': API_KEY } } // Dùng API Key
        );
      } catch (error) {
        console.error(`FATAL ERROR: Refund failed for booking ${bookingId}`);
        throw new Error(`Refund failed: ${error.message}`);
      }
      // --- KẾT THÚC PHẦN MỚI ---
      
      booking.status = 'cancelled';
      await booking.save();
      return booking;
    }
  }

  /**
   * [SSỬA LẠI] Admin Hủy đơn
   */
  async adminCancelBooking(bookingId, adminAuthToken) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const originalStatus = booking.status;
    if (originalStatus === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }
    
    // 1. Hủy đơn 'pending'
    if (originalStatus === 'pending') {
      booking.status = 'cancelled';
      await booking.save();
      return booking;
    }

    // 2. Hủy đơn 'confirmed' (Nhả kho + Hoàn tiền)
    if (originalStatus === 'confirmed') {
      
      // --- Nhả Kho (Dùng token Admin) ---
      // --- SỬA LẠI CHỖ NÀY ---
      const releaseRequest = {
        items: booking.items.map(item => ({
          inventoryId: item.inventory_id.toString(),
          quantity: item.quantity,
        })),
      };
      try {
        await axios.post(
          `${INVENTORY_URL}/inventory/release`, 
          releaseRequest,
          { headers: { 'Authorization': adminAuthToken } }
        );
      } catch (error) {
        throw new Error(`Stock release failed: ${error.message}`);
      }
      
      // --- [MỚI] Hoàn Tiền (Dùng API Key) ---
      try {
        await axios.post(
          `${PAYMENT_URL}/payment/refund`,
          { bookingId: booking._id },
          { headers: { 'x-api-key': API_KEY } }
        );
      } catch (error) {
        console.error(`FATAL ERROR (Admin): Refund failed for booking ${bookingId}`);
        throw new Error(`Refund failed: ${error.message}`);
      }
      
      booking.status = 'cancelled';
      await booking.save();
      return booking;
    }
  }

  /**
   * [Admin] Lấy tất cả đơn hàng (có phân trang, filter)
   */
  async getAllBookings(queryParams) {
    const { page = 1, limit = 10, status, userId } = queryParams;
    let filter = {};

    if (status) filter.status = status;
    if (userId) filter.user_id = userId;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate('user_id', 'fullName email') // Nối thông tin user
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const totalBookings = await Booking.countDocuments(filter);
    
    return {
      bookings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings
    };
  }


}

module.exports = new BookingService();