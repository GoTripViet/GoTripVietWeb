// models/product.model.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    // --- 1. THÔNG TIN CHUNG ---
    product_code: {
      type: String,
      unique: true, // Không trùng nhau
      uppercase: true, // Tự viết hoa (ví dụ: tour-01 -> TOUR-01)
      trim: true,
      index: true, // Đánh index để tìm kiếm nhanh theo mã
      required: true, // Tạm thời chưa để required để tránh lỗi dữ liệu cũ
    },
    product_type: {
      type: String,
      default: "tour", // Mặc định là tour
      enum: ["tour", "hotel", "flight", "car"], // Giữ enum để mở rộng sau này nếu cần
    },
    partner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true, // Có thể bỏ comment nếu bắt buộc phải có người tạo
    },
    location_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description_short: String,
    description_long: String,
    images: [
      {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
    ],
    tags: [{ type: String }],

    category_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    sustainability_score: {
      type: Number,
      min: 0,
      max: 5,
      default: 3,
    },
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },

    // --- 2. CHI TIẾT TOUR (TRÁI TIM CỦA PRODUCT) ---
    // Bây giờ chứa cả thông tin vận chuyển, lưu trú và các chính sách
    tour_details: {
      // a. Thông tin khởi hành
      start_point: { type: String, trim: true, default: "Hồ Chí Minh" },
      departure_times: [{ type: Date }], // Mảng các ngày/giờ khởi hành
      duration_days: { type: Number }, // VD: 3 (3 ngày 2 đêm)

      // b. Thuộc tính PHƯƠNG TIỆN (Di chuyển bằng gì?)
      transport_type: {
        type: String,
        enum: ["Máy bay", "Xe du lịch", "Tàu hỏa", "Du thuyền", "Tự túc"],
        default: "Xe du lịch",
      },

      // c. Thuộc tính KHÁCH SẠN (Ở đâu?)
      hotel_rating: { type: Number, default: 0 }, // 3, 4, 5 sao
      hotel_name: { type: String }, // VD: Mường Thanh Luxury

      // d. Lịch trình chi tiết
      itinerary: [
        {
          day: Number,
          title: String,
          details: String,
          meals: [String], // VD: ['Sáng', 'Trưa', 'Tối']
          accommodation: String,
        },
      ],

      // e. [MỚI] THÔNG TIN THÊM VỀ CHUYẾN ĐI (Grid Icon)
      // Tương ứng với ảnh: Điểm tham quan, Ẩm thực, Đối tượng...
      trip_highlights: {
        attractions: String, // Điểm tham quan
        cuisine: String, // Ẩm thực
        suitable_for: String, // Đối tượng thích hợp
        ideal_time: String, // Thời gian lý tưởng
        transport: String, // Phương tiện (chi tiết text)
        promotion: String, // Khuyến mãi
      },

      // f. [MỚI] NHỮNG THÔNG TIN CẦN LƯU Ý (Accordion)
      // Tương ứng với ảnh: Giá bao gồm, Điều kiện hủy tour, Visa...
      policy_notes: [
        {
          title: String, // VD: "Giá tour bao gồm"
          content: String, // Nội dung chi tiết
        },
      ],

      // // g. Điều khoản (Giữ lại để tương thích ngược nếu cần,
      // // nhưng nên ưu tiên dùng policy_notes cho chi tiết hơn)
      // includes: [String],
      // excludes: [String],

      // // h. Thông tin thêm về chuyến bay (nếu là tour bay)
      // is_flight_included: { type: Boolean, default: false },
      // flight_info: {
      //     airline: String,
      //     airline_logo: String,
      //     depart_code: String,
      //     return_code: String
      // }
    },

    // --- CÁC FIELD CŨ (Giữ lại để tương thích hoặc mở rộng sau này, optional) ---
    // hotel_details: {
    //   star_rating: Number,
    //   address: String,
    //   amenities: [String],
    //   coordinates: {
    //     type: { type: String, enum: ['Point'], default: 'Point' },
    //     coordinates: { type: [Number], default: [0, 0] },
    //   },
    // },

    // flight_details: {
    //   airline: String,
    //   flight_code_template: String,
    //   origin_code: String,
    //   destination_code: String,
    // },
  },
  {
    timestamps: true,
    minimize: true,
  }
);

// Middleware xử lý Slug
productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    const title = this.title.replace(/Đ/g, "D").replace(/đ/g, "d");
    this.slug = slugify(title, { lower: true, strict: true });
  }
  next();
});

// Tạo chỉ mục (Index)
productSchema.index({ product_type: 1 });
productSchema.index({ base_price: 1 });
productSchema.index({ location_ids: 1 });
productSchema.index({ category_ids: 1 });
productSchema.index({ "tour_details.start_point": 1 }); // Index cho tìm kiếm điểm đi
productSchema.index({ "tour_details.departure_times": 1 }); // Index cho tìm kiếm ngày

module.exports = mongoose.model("Product", productSchema);
