// controllers/payment.controller.js
const paymentService = require('../services/payment.service');
const Transaction = require('../models/transaction.model');

class PaymentController {

  // ==========================================
  // 1. VNPAY PAYMENT
  // ==========================================

  // POST /payment/create-vnpay-url
  async createVNPayUrl(req, res) {
    try {
      const { amount, bookingId, bankCode, language } = req.body;

      if (!bookingId || !amount) {
        return res.status(400).json({ message: 'Missing bookingId or amount' });
      }

      // Call Service to generate URL
      const paymentUrl = paymentService.createVNPayUrl(req, bookingId, amount, bankCode, language);

      // Return URL to Frontend
      res.status(200).json({ paymentUrl });

    } catch (error) {
      console.error("VNPAY URL Error:", error);
      res.status(500).json({ message: 'Error creating VNPAY link', error: error.message });
    }
  }

  // GET /payment/vnpay-return
  async vnpayReturn(req, res) {
    try {
      // req.query contains all VNPAY parameters
      const result = await paymentService.verifyVNPayReturn(req.query);

      if (result.status === 'success') {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
  }

  // ==========================================
  // 2. PARTNER WALLET (NEW)
  // ==========================================

  // GET /payment/wallet/me
  async getMyWallet(req, res) {
    try {
      const partnerId = req.user.id;
      // Get Token to authenticate with User Service
      const userToken = req.headers['authorization'];

      const data = await paymentService.getWalletInfo(partnerId, userToken);
      res.status(200).json(data);
    } catch (error) {
      console.error("Get Wallet Error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }

  // POST /payment/payout-request
  async requestPayout(req, res) {
    try {
      const partnerId = req.user.id;
      const { amount, bankInfo } = req.body;
      const userToken = req.headers['authorization'];

      const result = await paymentService.requestPayout(partnerId, amount, bankInfo, userToken);
      res.status(200).json(result);
    } catch (error) {
      console.error("Payout Request Error:", error.message);
      res.status(400).json({ message: error.message });
    }
  }

  // ==========================================
  // 3. INTERNAL (SERVICE-TO-SERVICE)
  // ==========================================

  // POST /payment/internal/distribute-revenue
  // Called by Booking Service (Cron Job)
  async distributeRevenue(req, res) {
    try {
      const { bookingId, partnerId, amount, description } = req.body;

      const result = await paymentService.distributeRevenue(bookingId, partnerId, amount, description);
      res.status(200).json(result);
    } catch (error) {
      console.error("Distribute Revenue Error:", error.message);
      res.status(500).json({ message: error.message });
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
      console.error("Refund Error:", error.message);
      res.status(500).json({ message: 'Refund failed', error: error.message });
    }
  }

  // ==========================================
  // 4. ADMIN API
  // ==========================================

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

  async getSystemStats(req, res) {
    try {
      const transactions = await Transaction.find().sort({ createdAt: -1 });

      let totalVolume = 0;   // GMV (Total Sales)
      let adminProfit = 0;   // 15%
      let partnerPayout = 0; // 85%

      transactions.forEach(t => {
        const amount = t.amount || 0;

        // Logic based on your DB: 
        // INCOME = 100,000 (Full Price)
        // COMMISSION = -15,000 (Deduction)

        if (t.type === 'INCOME') {
          // Since INCOME is the full price, this IS the Total Volume
          totalVolume += amount;
        }

        if (t.type === 'COMMISSION') {
          // Commission is negative (-15000), so we use Math.abs to get positive 15000
          adminProfit += Math.abs(amount);
        }
      });

      // Calculate Partner Payout
      // Payout = Total Sales - Admin Profit
      partnerPayout = totalVolume - adminProfit;

      res.status(200).json({
        stats: {
          totalVolume,     // Should be 100,000
          adminProfit,     // Should be 15,000
          partnerPayout,   // Should be 85,000
          transactionCount: transactions.length
        },
        transactions
      });

    } catch (error) {
      console.error("Stats Error:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PaymentController();