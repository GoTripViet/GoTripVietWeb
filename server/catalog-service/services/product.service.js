// services/product.service.js
const Product = require('../models/product.model');
const mongoose = require('mongoose');
const slugify = require('slugify'); // Cần import thêm nếu dùng trong update

class ProductService {

  /**
   * Tạo một sản phẩm mới (Mặc định là Tour)
   * @param {object} productData - Dữ liệu từ controller
   * @param {string} partnerId - ID của đối tác (từ token)
   */
  async createProduct(productData, partnerId) {
    // Gắn partner_id (người sở hữu) từ token vào
    productData.partner_id = partnerId;

    // Xử lý dữ liệu đa hình (Dù tập trung vào tour, vẫn giữ logic này để mở rộng)
    const { product_type, tour_details, hotel_details, flight_details } = productData;

    if (!product_type || product_type === 'tour') {
      productData.hotel_details = undefined;
      productData.flight_details = undefined;
      // tour_details sẽ chứa cả thông tin vận chuyển/lưu trú như Model mới quy định
      productData.tour_details = tour_details; 
    } else if (product_type === 'hotel') {
      productData.tour_details = undefined;
      productData.flight_details = undefined;
      productData.hotel_details = hotel_details;
    } else if (product_type === 'flight') {
      productData.tour_details = undefined;
      productData.hotel_details = undefined;
      productData.flight_details = flight_details;
    } else {
      // product_type = 'car' hoặc khác
    }

    const product = new Product(productData);
    await product.save();
    return product;
  }

  /**
   * Lấy danh sách sản phẩm (Filter Tour, Khách sạn, Phương tiện, Ngày đi...)
   */
  async getProducts(queryParams) {
    const { 
        page = 1, 
        limit = 10, 
        product_type, 
        location_id, 
        category_id, 
        tags, 
        keyword,      
        min_price,    
        max_price,    
        
        // --- CÁC PARAM MỚI ---
        start_point, // Điểm đi
        date,        // Ngày đi (YYYY-MM-DD)
        transport,   // Phương tiện (Máy bay, Xe...)
        star_rating  // Hạng sao khách sạn (3, 4, 5)
    } = queryParams;

    // Mặc định lọc sản phẩm đang active
    let filter = { is_active: true };

    // --- CÁC BỘ LỌC CƠ BẢN ---
    if (product_type) filter.product_type = product_type;
    
    // Nếu location_id gửi lên
    if (location_id) filter.location_ids = { $in: [location_id] };
    
    // Nếu category_id gửi lên
    if (category_id) filter.category_ids = { $in: [category_id] };
    
    if (tags) filter.tags = { $in: tags.split(',') };

    // --- CÁC BỘ LỌC NÂNG CAO ---

    // 1. Lọc theo từ khóa (Tìm trong Title, Slug, hoặc StartPoint của tour)
    if (keyword) {
      const regex = new RegExp(keyword, 'i'); 
      filter.$or = [
        { title: { $regex: regex } },
        { slug: { $regex: regex } },
        { description_short: { $regex: regex } },
        // Tìm cả trong điểm khởi hành nếu khách gõ tên tỉnh vào ô tìm kiếm
        { 'tour_details.start_point': { $regex: regex } }
      ];
    }

    // 2. Lọc theo khoảng giá
    if (min_price || max_price) {
      filter.base_price = {};
      if (min_price) filter.base_price.$gte = parseInt(min_price);
      if (max_price) filter.base_price.$lte = parseInt(max_price);
    }

    // 3. Lọc theo Điểm đón (Start Point)
    if (start_point && start_point !== 'Tất cả') {
        filter['tour_details.start_point'] = { $regex: new RegExp(start_point, 'i') };
    }

    // 4. Lọc theo Ngày xuất phát (Tìm trong mảng departure_times)
    // Logic: Tour có ít nhất 1 ngày khởi hành nằm trong ngày khách chọn
    if (date) {
        const searchDate = new Date(date);
        
        if (!isNaN(searchDate.getTime())) {
            const startOfDay = new Date(searchDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(searchDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter['tour_details.departure_times'] = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }
    }

    // 5. [MỚI] Lọc theo Phương tiện (Transport)
    // VD: Khách chọn "Máy bay" -> Lọc tour_details.transport_type
    if (transport && transport !== 'Tất cả') {
        filter['tour_details.transport_type'] = transport;
    }

    // 6. [MỚI] Lọc theo Hạng sao Khách sạn (Hotel Rating)
    // VD: Khách chọn 4 sao -> Tìm tour có hotel_rating >= 4
    if (star_rating) {
        filter['tour_details.hotel_rating'] = { $gte: parseInt(star_rating) };
    }

    // --- PHÂN TRANG & QUERY ---
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('location_ids', 'name slug')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    const totalProducts = await Product.countDocuments(filter);

    return {
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    };
  }

  /**
   * Lấy chi tiết 1 sản phẩm (bằng ID hoặc Slug)
   */
  async getProductByIdOrSlug(idOrSlug) {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    let product;
    if (isObjectId) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product || !product.is_active) {
      throw new Error('Product not found or is inactive');
    }

    // Nối thêm thông tin địa điểm và danh mục
    await product.populate('location_ids', 'name slug country');
    await product.populate('category_ids', 'name slug');
    
    return product;
  }

  /**
   * Cập nhật 1 sản phẩm
   */
  async updateProduct(productId, updateData, partnerId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Check quyền sở hữu
    if (product.partner_id && product.partner_id.toString() !== partnerId) {
      // Lưu ý: Nếu admin sửa thì logic check này cần bỏ qua hoặc check role admin
      // throw new Error('Forbidden: You do not own this product');
    }

    // Bảo vệ các trường quan trọng
    delete updateData.product_type; 
    delete updateData.partner_id; 
    delete updateData.slug; 

    // Cập nhật dữ liệu
    Object.assign(product, updateData);

    // [QUAN TRỌNG] Nếu updateData có gửi title mới, ta cần cập nhật slug thủ công hoặc để pre-save hook lo.
    // Tuy nhiên pre-save hook của Mongoose chỉ chạy khi gọi .save().
    // Ở đây ta gọi .save() ở dưới nên OK.
    // Nếu muốn chắc chắn xử lý tiếng Việt Đ -> D ở đây:
    if (updateData.title) {
         const title = updateData.title.replace(/Đ/g, 'D').replace(/đ/g, 'd');
         product.slug = slugify(title, { lower: true, strict: true });
    }

    await product.save();
    return product;
  }

  /**
   * Xóa 1 sản phẩm (Soft delete)
   */
  async deleteProduct(productId, partnerId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.partner_id && product.partner_id.toString() !== partnerId) {
       // throw new Error('Forbidden');
    }

    product.is_active = false;
    await product.save();

    return { message: 'Product deactivated successfully' };
  }
}

module.exports = new ProductService();