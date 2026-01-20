const Booking = require("../models/booking.model");
const { sendPaymentSuccessEmail } = require("../utils/mailer");
const axios = require("axios");

// Get URLs from .env
const CATALOG_URL = process.env.CATALOG_SERVICE_URL;
const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL;
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL;
const API_KEY = process.env.INTERNAL_API_KEY;

class BookingService {
  /**
   * Create a new booking
   * Calculates start_date and end_date for Auto-Complete logic
   */
  async createBooking({
    userId,
    items,
    promotionCode,
    userAuthToken,
    passengers,
    contactInfo,
  }) {
    // --- 1. Calculate Price & Prepare Snapshot ---
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
          image: item.image,
        },
      });
    }

    // --- 2. Check Stock ---
    const checkStockRequest = {
      items: items.map((item) => ({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
    };
    try {
      await axios.post(`${INVENTORY_URL}/inventory/check`, checkStockRequest, {
        headers: { Authorization: userAuthToken },
      });
    } catch (error) {
      throw new Error(
        `Inventory check failed: ${
          error.response?.data?.message || error.message
        }`
      );
    }

    // --- 3. Handle Promotion ---
    let discountAmount = 0;
    let finalPrice = totalPrice;
    let promotionId = null;

    if (promotionCode) {
      try {
        const promoRes = await axios.get(
          `${INVENTORY_URL}/promotions/code/${promotionCode}`
        );
        const promotion = promoRes.data;

        if (promotion.rules && promotion.rules.min_spend > totalPrice) {
          throw new Error(
            `Min spend for code ${promotionCode} is ${promotion.rules.min_spend}`
          );
        }

        if (promotion.type === "percentage") {
          discountAmount = totalPrice * (promotion.value / 100);
        } else if (promotion.type === "fixed_amount") {
          discountAmount = promotion.value;
        }

        if (discountAmount > totalPrice) {
          discountAmount = totalPrice;
        }

        finalPrice = totalPrice - discountAmount;
        promotionId = promotion._id;
      } catch (error) {
        throw new Error(
          `Invalid promotion code: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }

    // --- [LOGIC] CALCULATE START & END DATES ---
    const mainItem = items[0];
    const startDate = new Date(mainItem.startDate || Date.now());
    const durationDays = parseInt(
      mainItem.duration || mainItem.snapshot?.duration_days || 1
    );

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    // --- 4. CREATE BOOKING ---
    const booking = new Booking({
      user_id: userId,
      status: "pending",
      start_date: startDate,
      end_date: endDate,
      items: formattedItems.map((fi, index) => ({
        ...fi,
        snapshot: {
          ...fi.snapshot,
          duration_days: items[index].duration || 1,
        },
      })),
      pricing: {
        total_price_before_discount: totalPrice,
        discount_amount: discountAmount,
        final_price: finalPrice,
      },
      promotion_id: promotionId,
      passengers: passengers || [],
      customer_details: contactInfo
        ? {
            fullName: contactInfo.fullName,
            email: contactInfo.email,
            phone: contactInfo.phone,
            address: contactInfo.address,
            note: contactInfo.note,
          }
        : {},
    });

    await booking.save();

    return {
      bookingId: booking._id,
      status: booking.status,
      finalPrice: booking.pricing.final_price,
      paymentUrl: `http://payment-gateway.com/pay?bookingId=${booking._id}`,
    };
  }

  async getBookingsByUserId(userId) {
    return await Booking.find({ user_id: userId }).sort({ createdAt: -1 });
  }

  async getBookingDetails(bookingId, userId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.user_id.toString() !== userId) {
      throw new Error("Forbidden: You do not own this booking");
    }
    return booking;
  }

  /**
   * Confirm booking (Webhook)
   * Note: This ONLY confirms the booking. Revenue distribution happens later via Cron Job.
   */
  async confirmBooking(bookingId, paymentInfo) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "pending") {
      if (booking.status === "confirmed") return booking;
      throw new Error(`Booking is already ${booking.status}`);
    }

    // Reserve Stock
    const reserveRequest = {
      items: booking.items.map((item) => ({
        inventoryId: item.inventory_id.toString(),
        quantity: item.quantity,
      })),
    };

    try {
      await axios.post(`${INVENTORY_URL}/inventory/reserve`, reserveRequest, {
        headers: { "x-api-key": API_KEY },
      });
    } catch (error) {
      booking.status = "failed";
      await booking.save();
      throw new Error(
        `Inventory reservation failed: ${
          error.response?.data?.message || error.message
        }`
      );
    }

    // Update status
    booking.status = "confirmed";
    booking.payment_status = "paid";

    booking.payments.push({
      gateway: paymentInfo.gateway,
      gateway_transaction_id: paymentInfo.gateway_transaction_id,
      amount: booking.pricing.final_price,
      status: "succeeded",
    });

    await booking.save();
    console.log(
      `✅ Booking ${booking._id} confirmed & paid. Revenue held in escrow.`
    );
    // Gửi email sau khi đã confirmed
    const toEmail = booking.customer_details?.email;
    if (toEmail) {
      // không block webhook: gửi async
      setImmediate(() => {
        sendPaymentSuccessEmail({
          to: toEmail,
          booking,
          paymentInfo,
        }).catch((err) =>
          console.error("Send payment email failed:", err.message)
        );
      });
    }

    return booking;
  }

  async cancelBooking(bookingId, userId, userAuthToken) {
    const booking = await Booking.findOne({ _id: bookingId, user_id: userId });
    if (!booking) throw new Error("Booking not found or access denied");
    return this._processCancellation(booking, userAuthToken);
  }

  async adminCancelBooking(bookingId, adminAuthToken) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    return this._processCancellation(booking, adminAuthToken);
  }

  // Helper for cancellation logic
  async _processCancellation(booking, authToken) {
    const originalStatus = booking.status;
    if (originalStatus === "cancelled")
      throw new Error("Booking is already cancelled");

    if (originalStatus === "pending") {
      booking.status = "cancelled";
      await booking.save();
      return booking;
    }

    if (originalStatus === "confirmed") {
      // Release Stock
      const releaseRequest = {
        items: booking.items.map((item) => ({
          inventoryId: item.inventory_id.toString(),
          quantity: item.quantity,
        })),
      };
      try {
        await axios.post(`${INVENTORY_URL}/inventory/release`, releaseRequest, {
          headers: { Authorization: authToken },
        });
      } catch (error) {
        console.error(`Stock release failed: ${error.message}`);
      }

      // Refund Money
      try {
        await axios.post(
          `${PAYMENT_URL}/payment/refund`,
          { bookingId: booking._id },
          { headers: { "x-api-key": API_KEY } }
        );
      } catch (error) {
        throw new Error(`Refund failed: ${error.message}`);
      }

      booking.status = "cancelled";
      await booking.save();
      return booking;
    }
  }

  async getAllBookings(queryParams) {
    const { page = 1, limit = 10, status, userId } = queryParams;
    let filter = {};
    if (status) filter.status = status;
    if (userId) filter.user_id = userId;
    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const totalBookings = await Booking.countDocuments(filter);
    return {
      bookings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings,
    };
  }

  async getPartnerBookings(partnerId, userToken, queryParams) {
    try {
      const catalogRes = await axios.get(
        `${CATALOG_URL}/products/partner/me?limit=200`,
        {
          headers: { Authorization: userToken },
        }
      );
      const data = catalogRes.data;
      const myProducts = Array.isArray(data) ? data : data.data || [];

      if (myProducts.length === 0) return { bookings: [], total: 0 };

      const myProductIds = myProducts.map((p) => p._id);
      const { page = 1, limit = 10, status } = queryParams;
      const filter = { "items.product_id": { $in: myProductIds } };

      if (status && status !== "ALL") filter.status = status.toLowerCase();

      const skip = (page - 1) * limit;
      const bookings = await Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      const total = await Booking.countDocuments(filter);

      return {
        bookings,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching partner bookings:", error.message);
      return { bookings: [], total: 0 };
    }
  }

  async getPartnerBookingDetail(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    return booking;
  }
}

module.exports = new BookingService();
