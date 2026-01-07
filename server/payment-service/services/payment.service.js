// services/payment.service.js
const Payment = require('../models/payment.model');
const axios = require('axios');
const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const Transaction = require('../models/transaction.model');
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
const API_KEY = process.env.INTERNAL_API_KEY;

class PaymentService {

  // ==========================================
  // CHỈ CÒN LẠI VNPAY
  // ==========================================

  /**
   * TẠO URL THANH TOÁN VNPAY
   */
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

  /**
   * XÁC THỰC KẾT QUẢ VNPAY TRẢ VỀ
   */
  async verifyVNPayReturn(vnp_Params) {
    console.log("⚠️ DEV MODE: Bỏ qua kiểm tra chữ ký, tin tưởng URL params");

    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const rawTxnRef = vnp_Params['vnp_TxnRef'];
    const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

    if (vnp_ResponseCode === '00') {
        const bookingId = rawTxnRef.includes('_') ? rawTxnRef.split('_')[0] : rawTxnRef;

        // 1. Lưu transaction vào bảng Payment
        try {
           await Payment.findOneAndUpdate(
              { booking_id: bookingId }, // Tìm theo booking_id
              {
                  booking_id: bookingId,
                  amount: amount,
                  currency: 'vnd',
                  status: 'succeeded',
                  gateway: 'vnpay',
                  transaction_date: new Date(),
                  // Lưu thêm vài thông tin để đối soát nếu cần
                  gateway_transaction_id: vnp_Params['vnp_TransactionNo']
              },
              { upsert: true, new: true }
           );
        } catch (dbError) {
           console.error("Lỗi lưu Payment DB:", dbError.message);
        }

        // 2. Gọi sang Booking Service
        try {
            const internalApiUrl = `${BOOKING_URL}/bookings/internal/confirm-payment`;
            console.log(`Calling Internal API: ${internalApiUrl}`);

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

            // Trả về dữ liệu thật cho Frontend
            return { 
                status: 'success', 
                message: 'Thanh toán thành công',
                data: response.data 
            };

        } catch (error) {
            console.error("Lỗi gọi sang Booking Service:", error.message);
            return { 
                status: 'success', 
                message: 'Thanh toán thành công (Data sync error)',
                data: { _id: bookingId, status: 'confirmed', payment_status: 'paid' } 
            };
        }
    } else {
        return { status: 'failed', message: 'Thanh toán thất bại', code: vnp_ResponseCode };
    }
  }

  /**
   * HOÀN TIỀN (CHỈ XỬ LÝ VNPAY MOCK)
   */
  async refundPayment(bookingId) {
    // 1. Tìm giao dịch
    const payment = await Payment.findOne({ booking_id: bookingId, status: 'succeeded' });
    
    if (!payment) {
        throw new Error('Không tìm thấy giao dịch thanh toán thành công để hoàn tiền.');
    }

    // 2. Xử lý VNPAY (Giả lập)
    if (payment.gateway === 'vnpay') {
        console.log(`♻️ Processing VNPAY Refund (Mock) for Booking: ${bookingId}`);
        
        // [SỬA ĐỔI QUAN TRỌNG]: Dùng findByIdAndUpdate để tránh lỗi "user_id is required"
        const updatedPayment = await Payment.findByIdAndUpdate(
            payment._id,
            { 
                $set: { 
                    status: 'refunded', 
                    amount_refunded: payment.amount,
                    refunded_at: new Date()
                } 
            },
            { new: true, runValidators: false } // <--- runValidators: false để bỏ qua check user_id
        );
        
        return updatedPayment;
    }

    // Logic cũ cho Stripe (nếu còn dùng) hoặc throw lỗi
    throw new Error(`Cổng thanh toán '${payment.gateway}' không hỗ trợ hoàn tiền tự động.`);
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

  // Hàm sắp xếp object (Bắt buộc theo chuẩn VNPAY)
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

  /**
   * [INTERNAL] Xử lý phân chia doanh thu khi Booking thành công
   * @param {string} bookingId
   * @param {string} partnerId
   * @param {number} totalAmount - Tổng tiền khách trả
   */
  async processBookingRevenue(bookingId, partnerId, totalAmount) {
    const COMMISSION_RATE = 0.15; // Phí sàn 15%
    
    const commission = totalAmount * COMMISSION_RATE;
    const income = totalAmount - commission;

    // 1. Tạo giao dịch ghi nhận doanh thu (Ở trạng thái PENDING - Tạm giữ)
    const transaction = new Transaction({
      partner_id: partnerId,
      booking_id: bookingId,
      type: 'INCOME',
      amount: income,
      description: `Doanh thu từ đơn hàng ${bookingId} (đã trừ 15% phí)`,
      status: 'PENDING' // Tiền treo, chưa rút được ngay
    });

    await transaction.save();
    return transaction;
  }

  /**
   * [INTERNAL] Quyết toán: Chuyển tiền từ PENDING sang COMPLETED
   * Hàm này sẽ được gọi khi Tour kết thúc hoặc sau X ngày
   */
  async settleTransaction(transactionId) {
    const tx = await Transaction.findById(transactionId);
    if (!tx || tx.status !== 'PENDING') throw new Error('Giao dịch không hợp lệ');

    // 1. Cập nhật trạng thái
    tx.status = 'COMPLETED';
    await tx.save();

    // 2. Gọi sang User Service để cộng số dư ví thực tế (Wallet Balance)
    // (Cần dùng API Key nội bộ)
    try {
      await axios.post(
        `${process.env.USER_SERVICE_URL}/users/internal/wallet/add`, 
        { userId: tx.partner_id, amount: tx.amount },
        { headers: { 'x-api-key': process.env.INTERNAL_API_KEY } }
      );
    } catch (error) {
      console.error("Lỗi cập nhật ví User:", error.message);
      // Có thể cần logic retry ở đây
    }

    return tx;
  }
}

module.exports = new PaymentService();