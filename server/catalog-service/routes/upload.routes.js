import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js"; // bạn đổi theo project

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  "/category-image",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Thiếu file" });
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Chỉ nhận file ảnh" });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "gotripviet/categories",
            resource_type: "image",
          },
          (err, out) => (err ? reject(err) : resolve(out))
        );
        stream.end(req.file.buffer);
      });

      return res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Upload thất bại" });
    }
  }
);

export default router;
