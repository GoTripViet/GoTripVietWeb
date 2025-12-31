// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const bookingRoutes = require('./routes/booking.routes');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Định tuyến
app.use('/bookings', bookingRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 BookingService is running on http://localhost:${PORT}`);
});