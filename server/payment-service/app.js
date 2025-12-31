// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const paymentRoutes = require('./routes/payment.routes');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));

// --- XỬ LÝ RAW BODY CHO WEBHOOK ---
// Phải chạy TRƯỚC express.json()
// Chỉ áp dụng cho route /webhook/stripe
app.use(
  '/payment/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body; // Lưu rawBody
    next();
  }
);
// --- KẾT THÚC XỬ LÝ RAW BODY ---

// Các route khác dùng JSON bình thường
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Định tuyến
app.use('/payment', paymentRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 PaymentService is running on http://localhost:${PORT}`);
});