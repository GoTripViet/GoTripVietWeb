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
   * Tạo đơn hàng mới (Cập nhật: Nhận passengers và contactInfo)
   * @param {object} params - { userId, items, promotionCode, userAuthToken, passengers, contactInfo }
   */
  async createBooking({ userId, items, promotionCode, userAuthToken, passengers, contactInfo }) {
    
    // --- 1. Tính toán giá & Chuẩn bị Snapshot ---
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

    // --- 2. GỌI INVENTORY: Kiểm tra tồn kho ---
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

    // --- 3. GỌI INVENTORY: Xử lý Khuyến mãi (nếu có) ---
    let discountAmount = 0;
    let finalPrice = totalPrice;
    let promotionId = null;

    if (promotionCode) {
      try {
        // Gọi API công khai của InventoryService để check mã
        const promoRes = await axios.get(`${INVENTORY_URL}/promotions/code/${promotionCode}`);
        const promotion = promoRes.data;

        // Kiểm tra điều kiện tối thiểu
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

    // --- 4. TẠO BOOKING (Lưu vào DB) ---
    const booking = new Booking({
      user_id: userId,
      status: 'pending',
      items: formattedItems,
      pricing: {
        total_price_before_discount: totalPrice,
        discount_amount: discountAmount,
        final_price: finalPrice,
      },
      promotion_id: promotionId,

      // [MỚI] Lưu danh sách hành khách
      passengers: passengers || [], 

      // [MỚI] Lưu thông tin người liên hệ đầy đủ
      customer_details: contactInfo ? {
          fullName: contactInfo.fullName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
          note: contactInfo.note
      } : {}
    });
    
    await booking.save();

    // --- 5. TRẢ VỀ KẾT QUẢ (Để Frontend chuyển hướng thanh toán) ---
    return {
      bookingId: booking._id,
      status: booking.status,
      finalPrice: booking.pricing.final_price,
      // Trong thực tế, tại đây có thể trả về link thanh toán Payment Gateway
      paymentUrl: `http://payment-gateway.com/pay?bookingId=${booking._id}`,
    };
  }

  /**
   * Lấy lịch sử đặt hàng của 1 user
   * @param {string} userId 
   */
  async getBookingsByUserId(userId) {
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
   * Xác nhận đơn hàng (Dùng cho Webhook thanh toán gọi vào)
   * @param {string} bookingId - ID đơn hàng
   * @param {object} paymentInfo - Thông tin thanh toán
   */
  async confirmBooking(bookingId, paymentInfo) {
    // 1. Tìm đơn hàng
    const booking = await Booking.findById(bookingId); 

    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // 2. Kiểm tra trạng thái
    if (booking.status !== 'pending') {
      // Nếu đã confirm rồi thì bỏ qua (tránh duplicate webhook)
      if (booking.status === 'confirmed') return booking;
      throw new Error(`Booking is already ${booking.status}`);
    }

    // 3. Chuẩn bị dữ liệu để gọi Inventory
    const reserveRequest = {
      items: booking.items.map(item => ({
        inventoryId: item.inventory_id.toString(),
        quantity: item.quantity,
      })),
    };

    // 4. GỌI INVENTORY: Giữ chỗ (Dùng Internal API Key để xác thực Service-to-Service)
    try {
      await axios.post(
        `${INVENTORY_URL}/inventory/reserve`,
        reserveRequest,
        { headers: { 'x-api-key': API_KEY } }
      );
    } catch (error) {
      // Nếu giữ chỗ thất bại (hết hàng phút chót), đánh dấu đơn hàng lỗi
      booking.status = 'failed';
      await booking.save();
      throw new Error(`Inventory reservation failed: ${error.response?.data?.message || error.message}`);
    }
    
    // 5. Cập nhật đơn hàng thành công
    booking.status = 'confirmed';
    booking.payments.push({
      gateway: paymentInfo.gateway,
      gateway_transaction_id: paymentInfo.gateway_transaction_id, // Sửa lại key cho khớp controller
      amount: booking.pricing.final_price,
      status: 'succeeded',
    });

    await booking.save();
    
    console.log(`✅ Booking ${booking._id} confirmed successfully.`);
    return booking;
  }

  /**
   * Hủy một đơn hàng (User tự hủy)
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
      
      // --- Gọi Inventory Service để Nhả Kho (Release Stock) ---
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
          { headers: { 'Authorization': userAuthToken } } // Dùng token user
        );
      } catch (error) {
        // Log lỗi nhưng không chặn luồng (để vẫn hoàn tiền nếu cần)
        console.error(`Stock release failed: ${error.message}`);
      }
      
      // --- Gọi Payment Service để Hoàn Tiền (Refund) ---
      try {
        await axios.post(
          `${PAYMENT_URL}/payment/refund`,
          { bookingId: booking._id }, 
          { headers: { 'x-api-key': API_KEY } } // Dùng API Key nội bộ
        );
      } catch (error) {
        console.error(`Refund failed for booking ${bookingId}: ${error.message}`);
        throw new Error(`Refund failed: ${error.message}`);
      }
      
      booking.status = 'cancelled';
      await booking.save();
      return booking;
    }
  }

  /**
   * Admin Hủy đơn (Logic tương tự User hủy nhưng dùng quyền Admin)
   */
  async adminCancelBooking(bookingId, adminAuthToken) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const originalStatus = booking.status;
    if (originalStatus === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }
    
    if (originalStatus === 'pending') {
      booking.status = 'cancelled';
      await booking.save();
      return booking;
    }

    if (originalStatus === 'confirmed') {
      // Nhả Kho
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
        console.error(`Stock release failed: ${error.message}`);
      }
      
      // Hoàn Tiền
      try {
        await axios.post(
          `${PAYMENT_URL}/payment/refund`,
          { bookingId: booking._id },
          { headers: { 'x-api-key': API_KEY } }
        );
      } catch (error) {
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
      // Populate thông tin user (chỉ lấy tên và email)
      // Lưu ý: User ID là ObjectId nên populate được nếu cấu hình User Service chung DB 
      // (Trong Microservices thực thụ, không populate được qua service khác, nhưng ở đây ta giả định)
      // .populate('user_id', 'fullName email') 
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