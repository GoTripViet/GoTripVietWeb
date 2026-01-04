// controllers/user.controller.js
const userService = require("../services/user.service"); // Tầng 2 (Service)

class UserController {
  // Controller cho việc Đăng ký
  async register(req, res) {
    try {
      // 1. Lấy dữ liệu từ request
      const { email, password, fullName } = req.body;

      // 2. Validate (Đơn giản - Bạn nên dùng thư viện như Joi, Zod sau này)
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // 3. Gọi Service để xử lý nghiệp vụ
      const user = await userService.registerUser({
        email,
        password,
        fullName,
      });

      // 4. Trả về response thành công
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      // 5. Xử lý lỗi (ví dụ: email trùng)
      res.status(400).json({ message: error.message });
    }
  }

  // Controller cho việc Đăng nhập
  async login(req, res) {
    try {
      // 1. Lấy dữ liệu
      const { email, password } = req.body;

      // 2. Validate
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // 3. Gọi Service
      const result = await userService.loginUser(email, password);

      // 4. Trả về token
      res.status(200).json(result);
    } catch (error) {
      // 5. Xử lý lỗi (sai pass, sai email)
      res.status(401).json({ message: error.message });
    }
  }

  // GET /users/me
  async getMyProfile(req, res) {
    try {
      // Lấy ID user từ middleware (auth.middleware.js)
      const userId = req.user.id;

      const user = await userService.getUserProfile(userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // PUT /users/me
  async updateMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const { fullName, phone } = req.body;

      const updatedUser = await userService.updateUserProfile(userId, {
        fullName,
        phone,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // PUT /users/me/preferences
  async updateMyPreferences(req, res) {
    try {
      const userId = req.user.id;
      // Lấy toàn bộ body (chứa các trường sở thích)
      const preferencesData = req.body;

      const updatedUser = await userService.updateUserPreferences(
        userId,
        preferencesData
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // POST /auth/forgot-password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await userService.forgotPassword(email);

      // Luôn trả về 200 (vì lý do bảo mật)
      res
        .status(200)
        .json({ message: "If user exists, a reset link has been sent" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /auth/reset-password
  async resetPassword(req, res) {
    try {
      // Token lấy từ URL query (ví dụ: /reset-password?token=...)
      const { token } = req.query;
      const { password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }

      const result = await userService.resetPassword(token, password);
      res.status(200).json(result); // Trả về token login mới
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /users
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await userService.getAllUsers(page, limit);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /users/:id/role
  async updateUserRole(req, res) {
    try {
      const { id } = req.params; // ID của user cần sửa
      const { roles } = req.body; // Mảng roles mới

      if (!roles || !Array.isArray(roles)) {
        return res.status(400).json({ message: "Roles (array) are required" });
      }

      const updatedUser = await userService.updateUserRole(id, roles);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /users/:id
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      // Nếu ID không đúng định dạng Mongo hoặc không tìm thấy
      res.status(404).json({ message: error.message });
    }
  }

  // PUT /users/:id
  async updateUserById(req, res) {
    try {
      const { id } = req.params;
      // Lấy fullName và phone từ body
      const updateData = {
        fullName: req.body.fullName,
        phone: req.body.phone,
      };

      const updatedUser = await userService.updateUserById(id, updateData);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE /users/:id
  async deleteUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUserById(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // controllers/user.controller.js
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status)
        return res.status(400).json({ message: "status is required" });

      const updatedUser = await userService.updateUserStatus(id, status);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
