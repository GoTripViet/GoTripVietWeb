// services/payment.service.js
const Payment = require('../models/payment.model');
const Transaction = require('../models/transaction.model');
const axios = require('axios');
const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');

// Environment Variables
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const API_KEY = process.env.INTERNAL_API_KEY;

class PaymentService {

  // ==========================================
  // 1. REVENUE & WALLET LOGIC
  // ==========================================

  /**
   * [INTERNAL] Distribute Revenue (Called by Cron Job when Tour Completed)
   * Splits money: 15% Commission (System), 85% Income (Partner)
   */
  async distributeRevenue(bookingId, partnerId, amount, description) {
    const COMMISSION_RATE = 0.15; // 15%

    // Calculate amounts
    const commissionAmount = amount * COMMISSION_RATE;
    const partnerReceived = amount - commissionAmount;

    // A. Record Transactions (Keep in Payment DB)
    await Transaction.create({
      partner_id: partnerId,
      booking_id: bookingId,
      type: 'INCOME',
      amount: amount,
      description: description || 'Revenue for completed tour',
      status: 'COMPLETED'
    });

    await Transaction.create({
      partner_id: partnerId,
      booking_id: bookingId,
      type: 'COMMISSION',
      amount: -commissionAmount, // Negative amount
      description: `Platform fee 15% for booking ${bookingId}`,
      status: 'COMPLETED'
    });

    // B. Call User Service to Update Balance (API Call instead of DB)
    try {
      await axios.post(
        `${USER_URL}/users/internal/wallet/update`,
        { userId: partnerId, amount: partnerReceived },
        { headers: { 'x-api-key': API_KEY } }
      );
    } catch (error) {
      console.error("Failed to update User Wallet via API:", error.message);
      // In a real app, you might want to add a retry mechanism here
      throw new Error(`Wallet update failed: ${error.message}`);
    }

    console.log(`💰 Revenue Distributed: Partner +${partnerReceived}`);
    return { message: 'Success', partnerReceived, commissionAmount };
  }

  /**
   * Get Wallet Info for Frontend
   */
  async getWalletInfo(partnerId, userToken) {
    let balance = 0;

    // 1. Gọi User Service để lấy số dư
    try {
      // [FIX] Sửa '/users/profile' thành '/users/' + partnerId
      const userRes = await axios.get(`${USER_URL}/users/${partnerId}`, {
        headers: { Authorization: userToken }
      });

      // Lấy field wallet_balance từ kết quả trả về
      balance = userRes.data.wallet_balance || 0;

    } catch (error) {
      console.warn("Could not fetch balance from User Service:", error.message);
      // Nếu lỗi, balance mặc định là 0 để không chết trang web
    }

    // 2. Lấy lịch sử giao dịch từ Database local
    const transactions = await Transaction.find({ partner_id: partnerId })
      .sort({ createdAt: -1 })
      .limit(50);

    return { balance, transactions };
  }

  /**
   * Handle Payout Request
   */
  async requestPayout(partnerId, amount, bankInfo, userToken) {
    // 1. Check Balance via User Service
    let currentBalance = 0;
    try {
      const userRes = await axios.get(`${USER_URL}/users/profile`, {
        headers: { Authorization: userToken }
      });
      currentBalance = userRes.data.wallet_balance || 0;
    } catch (error) {
      throw new Error("Could not verify balance with User Service");
    }

    if (currentBalance < amount) {
      throw new Error("Insufficient balance.");
    }

    // 2. Create Transaction
    const tx = new Transaction({
      partner_id: partnerId,
      type: 'WITHDRAWAL',
      amount: -amount,
      description: `Withdrawal to ${bankInfo.bankName} - ${bankInfo.accountNumber}`,
      status: 'PENDING'
    });
    await tx.save();

    // 3. Deduct Balance via User Service
    await axios.post(
      `${USER_URL}/users/internal/wallet/update`,
      { userId: partnerId, amount: -amount }, // Negative amount to deduct
      { headers: { 'x-api-key': API_KEY } }
    );

    return { message: "Withdrawal request submitted!", transaction: tx };
  }


  // ==========================================
  // 2. VNPAY LOGIC
  // ==========================================

  createVNPayUrl(req, bookingId, amount, bankCode) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    if (ipAddr === '::1') ipAddr = '127.0.0.1';

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
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnp_Params['vnp_SecureHash'] = signed;
    const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

    return finalUrl;
  }

  async verifyVNPayReturn(vnp_Params) {
    console.log("⚠️ DEV MODE: Bypassing signature check");

    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const rawTxnRef = vnp_Params['vnp_TxnRef'];
    const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

    if (vnp_ResponseCode === '00') {
      const bookingId = rawTxnRef.includes('_') ? rawTxnRef.split('_')[0] : rawTxnRef;

      try {
        await Payment.findOneAndUpdate(
          { booking_id: bookingId },
          {
            booking_id: bookingId,
            amount: amount,
            currency: 'vnd',
            status: 'succeeded',
            gateway: 'vnpay',
            transaction_date: new Date(),
            gateway_transaction_id: vnp_Params['vnp_TransactionNo']
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.error("DB Error:", dbError.message);
      }

      // Call Booking Service to CONFIRM
      try {
        const internalApiUrl = `${BOOKING_URL}/bookings/internal/confirm-payment`;
        const response = await axios.post(
          internalApiUrl,
          {
            bookingId: bookingId,
            paymentInfo: {
              gateway: 'vnpay',
              gateway_transaction_id: vnp_Params['vnp_TransactionNo'] || 'Unknown',
              amount: amount,
              status: 'succeeded'
            }
          },
          { headers: { 'x-api-key': API_KEY } }
        );

        return {
          status: 'success',
          message: 'Payment Successful',
          data: response.data
        };

      } catch (error) {
        console.error("Booking Service Sync Error:", error.message);
        return {
          status: 'success',
          message: 'Payment Successful (Sync Warning)',
          data: { _id: bookingId }
        };
      }
    } else {
      return { status: 'failed', message: 'Payment Failed', code: vnp_ResponseCode };
    }
  }

  // ==========================================
  // 3. ADMIN & UTILS
  // ==========================================

  async refundPayment(bookingId) {
    // 1. Find Payment
    const payment = await Payment.findOne({ booking_id: bookingId, status: 'succeeded' });
    if (!payment) throw new Error('No successful payment found.');

    // 2. Handle VNPAY (Mock)
    if (payment.gateway === 'vnpay') {
      console.log(`♻️ Processing VNPAY Refund (Mock) for ${bookingId}`);
      const updatedPayment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          $set: {
            status: 'refunded',
            amount_refunded: payment.amount,
            refunded_at: new Date()
          }
        },
        { new: true, runValidators: false } // Avoids 'user_id' required error
      );
      return updatedPayment;
    }
    throw new Error(`Refund not supported for gateway: ${payment.gateway}`);
  }

  async getAllPayments(queryParams) {
    const { page = 1, limit = 10, status } = queryParams;
    let filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const totalPayments = await Payment.countDocuments(filter);
    return { payments, currentPage: parseInt(page), totalPages: Math.ceil(totalPayments / limit), totalPayments };
  }

  async getPaymentsForBooking(bookingId) {
    return await Payment.find({ booking_id: bookingId });
  }

  sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
}

module.exports = new PaymentService();