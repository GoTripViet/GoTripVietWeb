// models/location.model.js
const mongoose = require('mongoose');
const slugify = require('slugify');


const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true // Thêm index cho slug
    },
    country: {
      type: String,
      trim: true,
    },
    description: String,
    images: [{ type: String }], // Mảng các URL hình ảnh
    tags: [{ type: String }], // ['beach', 'family-friendly']
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);
// Tự động tạo/cập nhật slug trước khi lưu
locationSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    // Sửa chữ "Đ" thành "D" và "đ" thành "d" TRƯỚC KHI tạo slug
    const name = this.name.replace(/Đ/g, 'D').replace(/đ/g, 'd');
    this.slug = slugify(name, { lower: true, strict: true });
  }
  next();
});
// Tạo chỉ mục (index) để tìm kiếm địa lý
locationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);