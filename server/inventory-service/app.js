// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// --- Import Routes ---
const promotionRoutes = require('./routes/promotion.routes');
const inventoryRoutes = require('./routes/inventory.routes'); // Sẽ làm tiếp

// --- Khởi tạo App ---
const app = express();

// --- Kết nối Database ---
connectDB();

// --- Middlewares ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Định tuyến (Routing) ---
app.use('/promotions', promotionRoutes);
app.use('/inventory', inventoryRoutes);

// --- Khởi chạy Server ---
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 InventoryService is running on http://localhost:${PORT}`);
});