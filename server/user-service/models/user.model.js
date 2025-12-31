// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Đây là Schema từ ERD (NoSQL) chúng ta đã thiết kế
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    roles: {
      type: [String],
      enum: ['user', 'admin', 'partner', 'support_staff'],
      default: ['user'],
    },
    preferences: {
      travel_style: String,
      interests: [String],
      companions: [String],
      budget_per_trip_usd: Number,
      pace: String,
      sustainability_priority: Boolean,
    },
    partner_details: {
      company_name: String,
      business_license: String,
      is_verified: {
        type: Boolean,
        default: false,
      },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

userSchema.methods.createPasswordResetToken = function () {
  // 1. Tạo một token ngẫu nhiên
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Băm (hash) token này trước khi lưu vào DB (để bảo mật)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Đặt thời gian hết hạn (ví dụ: 10 phút)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút

  // 4. Trả về token GỐC (chưa băm) để gửi email
  return resetToken;
};

// --- Middleware QUAN TRỌNG ---
// Tự động hash mật khẩu TRƯỚC KHI lưu vào DB
userSchema.pre('save', async function (next) {
  // Chỉ hash nếu mật khẩu được thay đổi (hoặc là user mới)
  if (!this.isModified('password_hash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Thêm một method (phương thức) vào model để so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Tạo và export Model
const User = mongoose.model('User', userSchema);
module.exports = User;