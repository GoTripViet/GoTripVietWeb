// models/category.model.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    // --- TRƯỜNG QUAN TRỌNG NHẤT ---
    // Đây là trường tạo ra cây thư mục (cha-con)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Tự tham chiếu đến chính nó
      default: null // Nếu là 'null', đây là mục cha (cấp 1)
    },
    description: String,
    image: String // (Tùy chọn) URL ảnh cho hạng mục
  },
  { timestamps: true }
);

// Tự động tạo slug từ 'name'
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    const name = this.name.replace(/Đ/g, 'D').replace(/đ/g, 'd');
    this.slug = slugify(name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);