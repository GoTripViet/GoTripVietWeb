// controllers/event.controller.js
const eventService = require("../services/event.service");
const cloudinary = require("../config/cloudinary"); // bạn nói đã có sẵn
const streamifier = require("streamifier");

function uploadToCloudinary(buffer, folder = "events") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = {
  async getAll(req, res) {
    try {
      const rows = await eventService.getAll();
      res.json(rows);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async getById(req, res) {
    try {
      const row = await eventService.getById(req.params.id);
      res.json(row);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  },

  async create(req, res) {
    try {
      const ev = await eventService.create(req.body);
      res.status(201).json(ev);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async update(req, res) {
    try {
      const ev = await eventService.update(req.params.id, req.body);
      res.json(ev);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req, res) {
    try {
      const ev = await eventService.deleteHard(req.params.id);
      res.json({ message: "Đã xóa event", id: ev._id });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async toggleStatus(req, res) {
    try {
      const ev = await eventService.toggleStatus(req.params.id);
      res.json(ev);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  // Lấy danh sách sự kiện active cho public
  async getActivePublic(req, res) {
    try {
      const rows = await eventService.getActivePublic();
      res.json(rows);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  // Upload ảnh giống ManageLocation: nhận multipart field "file" và trả {url, public_id}
  async uploadImage(req, res) {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ message: "Thiếu file ảnh." });
      }
      const out = await uploadToCloudinary(req.file.buffer, "events");
      res.json(out);
    } catch (e) {
      res.status(400).json({ message: e.message || "Upload ảnh thất bại" });
    }
  },
};
