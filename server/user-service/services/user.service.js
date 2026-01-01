// services/user.service.js
const User = require("../models/user.model"); // Tầng 3 (Model)
const jwt = require("jsonwebtoken");

class UserService {
  /**
   * Nghiệp vụ: Đăng ký User
   * @param {object} userData - Dữ liệu từ controller (email, password, fullName)
   */
  async registerUser(userData) {
    const { email, password, fullName } = userData;

    // 1. Kiểm tra logic: Email đã tồn tại chưa?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // 2. Tạo user mới
    // Lưu ý: Chúng ta chỉ cần truyền "password" vào trường "password_hash"
    // Model sẽ tự động băm nó (nhờ 'pre-save' hook)
    const user = new User({
      email,
      password_hash: password, // Model sẽ hash cái này
      fullName,
    });

    // 3. Lưu vào DB
    await user.save();

    // 4. Trả về user (không trả về mật khẩu)
    user.password_hash = undefined; // Xóa mật khẩu trước khi trả về
    return user;
  }

  /**
   * Nghiệp vụ: Đăng nhập User
   * @param {string} email
   * @param {string} password
   */
  async loginUser(email, password) {
    // 1. Tìm user
    const user = await User.findOne({ email }).select("+password_hash"); // Phải +password_hash vì mặc định nó bị ẩn
    if (!user) {
      throw new Error("Invalid credentials"); // Lỗi chung (bảo mật)
    }

    // 2. So sánh mật khẩu (dùng method ta đã tạo trong model)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // 3. Tạo JWT
    const payload = {
      id: user._id,
      email: user.email,
      roles: user.roles,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Secret key từ .env
      { expiresIn: "1h" } // Token hết hạn sau 1 giờ
    );
    const safeUser = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles, // mảng
    };

    // 4. Trả về token
    return { token, user: safeUser };
  }

  /**
   * Nghiệp vụ: Lấy hồ sơ người dùng
   * @param {string} userId - ID từ token
   */
  async getUserProfile(userId) {
    // Tìm user bằng ID và loại bỏ password_hash
    const user = await User.findById(userId).select("-password_hash");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * [Admin] Lấy danh sách user (có phân trang)
   * @param {number} page
   * @param {number} limit
   */
  async getAllUsers(page = 1, limit = 10) {
    // <-- HÃY ĐẢM BẢO HÀM NÀY CÓ Ở ĐÂY
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select("-password_hash")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    return {
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    };
  }

  /**
   * [Admin] Cập nhật vai trò (role) của user
   * @param {string} userId
   * @param {Array<string>} roles
   */
  async updateUserRole(userId, roles) {
    // <-- HÃY ĐẢM BẢO HÀM NÀY NẰM Ở ĐÂY
    // Validate roles
    const validRoles = ["user", "admin", "partner", "support_staff"];
    const isValid = roles.every((role) => validRoles.includes(role));
    if (!isValid) {
      throw new Error("Invalid role specified");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { roles: roles } },
      { new: true }
    ).select("-password_hash");

    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }

  /**
   * Nghiệp vụ: Cập nhật thông tin cơ bản
   * @param {string} userId
   * @param {object} basicInfo - { fullName, phone }
   */
  async updateUserProfile(userId, basicInfo) {
    const { fullName, phone } = basicInfo;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { fullName, phone } }, // Chỉ cập nhật các trường này
      { new: true, runValidators: true } // Trả về tài liệu mới
    ).select("-password_hash");

    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }

  /**
   * Nghiệp vụ: Cập nhật sở thích (cho AI)
   * @param {string} userId
   * @param {object} preferencesData - { travel_style, interests, ... }
   */
  async updateUserPreferences(userId, preferencesData) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences: preferencesData } }, // Cập nhật toàn bộ object 'preferences'
      { new: true, runValidators: true }
    ).select("-password_hash");

    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }

  /**
   * Nghiệp vụ: Quên mật khẩu
   * @param {string} email
   */
  async forgotPassword(email) {
    // 1. Tìm user bằng email
    const user = await User.findOne({ email });
    if (!user) {
      // Quan trọng: Vì lý do bảo mật, KHÔNG báo lỗi "User not found".
      // Chỉ trả về thành công (để kẻ tấn công không biết email nào tồn tại).
      return;
    }

    // 2. Tạo token reset (dùng method trong model)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Lưu token đã băm vào DB

    // 3. Gửi email (GỌI NOTIFICATION SERVICE)
    const resetURL = `http://your-frontend.com/reset-password?token=${resetToken}`;

    console.log("--- ĐANG GỬI EMAIL (Giả lập) ---");
    console.log("Đến:", user.email);
    console.log("Link reset:", resetURL);
    // await notificationService.sendEmail({
    //   to: user.email,
    //   subject: 'Yêu cầu reset mật khẩu',
    //   text: `Nhấp vào link sau để reset mật khẩu (có hiệu lực 10 phút): ${resetURL}`
    // });

    return;
  }

  /**
   * Nghiệp vụ: Reset mật khẩu
   * @param {string} token - Token gốc từ URL
   * @param {string} newPassword
   */
  async resetPassword(token, newPassword) {
    // 1. Băm token nhận được để so sánh với token trong DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Tìm user bằng token đã băm VÀ token chưa hết hạn
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // $gt = greater than (lớn hơn)
    });

    if (!user) {
      throw new Error("Token is invalid or has expired");
    }

    // 3. Nếu user hợp lệ, đặt lại mật khẩu
    user.password_hash = newPassword; // Model 'pre-save' hook sẽ tự động băm
    user.passwordResetToken = undefined; // Xóa token sau khi dùng
    user.passwordResetExpires = undefined;

    await user.save();

    // 4. (Tùy chọn) Đăng nhập user ngay lập tức = tạo JWT mới
    const payload = { id: user._id, email: user.email, roles: user.roles };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token: jwtToken };
  }

  /**
   * [Admin] Lấy chi tiết 1 user bằng ID
   * @param {string} userId
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select("-password_hash");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * [Admin] Cập nhật thông tin (fullName, phone) cho 1 user
   * @param {string} userId
   * @param {object} updateData - { fullName, phone }
   */
  async updateUserById(userId, updateData) {
    // Chỉ cho phép cập nhật các trường an toàn
    const allowedUpdates = {
      fullName: updateData.fullName,
      phone: updateData.phone,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true } // Trả về tài liệu mới
    ).select("-password_hash");

    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }

  /**
   * [Admin] Xóa 1 user
   * @param {string} userId
   */
  async deleteUserById(userId) {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    // Trả về thông tin user đã xóa (hoặc chỉ một tin nhắn)
    return { message: "User deleted successfully" };
  }
}

// Export một instance (thể hiện) của class
module.exports = new UserService();
