// services/event.service.js
const Event = require("../models/event.model");

function slugify(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function validateDiscount(type, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) throw new Error("Giá trị giảm không hợp lệ.");

  if (type === "percentage") {
    if (!(v > 0 && v < 100))
      throw new Error("Giảm theo % phải lớn hơn 0 và nhỏ hơn 100.");
  } else if (type === "fixed_amount") {
    if (!(v > 0)) throw new Error("Giảm số tiền phải lớn hơn 0.");
    if (v % 1000 !== 0)
      throw new Error("Giảm số tiền phải chia hết cho 1.000.");
  } else {
    throw new Error("Loại giảm giá không hợp lệ.");
  }
}

function validateYearlyRange(payload) {
  const sm = Number(payload.start_month);
  const sd = Number(payload.start_day);
  const em = Number(payload.end_month);
  const ed = Number(payload.end_day);

  if (![sm, sd, em, ed].every(Number.isFinite)) {
    throw new Error("Ngày bắt đầu/kết thúc không hợp lệ.");
  }
  if (sm < 1 || sm > 12 || em < 1 || em > 12) {
    throw new Error("Tháng phải nằm trong khoảng 1-12.");
  }
  if (sd < 1 || sd > 31 || ed < 1 || ed > 31) {
    throw new Error("Ngày phải nằm trong khoảng 1-31.");
  }
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let s = baseSlug || "event";
  let i = 0;

  while (true) {
    const q = { slug: s };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Event.findOne(q).lean();
    if (!exists) return s;
    i += 1;
    s = `${baseSlug}-${i}`;
  }
}

module.exports = {
  async getAll() {
    // Admin thấy hết (kể cả ngưng)
    return Event.find({}).sort({ createdAt: -1 });
  },

  async getById(id) {
    const ev = await Event.findById(id);
    if (!ev) throw new Error("Không tìm thấy event.");
    return ev;
  },

  async create(payload) {
    validateYearlyRange(payload);
    validateDiscount(payload.discount_type, payload.discount_value);

    const baseSlug = slugify(payload.name);
    const slug = await ensureUniqueSlug(baseSlug);

    const ev = await Event.create({
      ...payload,
      slug,
      // normalize
      apply_to_all_tours: payload.apply_to_all_tours !== false,
      tour_ids: Array.isArray(payload.tour_ids) ? payload.tour_ids : [],
    });
    return ev;
  },

  async update(id, payload) {
    const ev = await Event.findById(id);
    if (!ev) throw new Error("Không tìm thấy event.");

    // validate nếu có field liên quan
    const nextDiscountType = payload.discount_type ?? ev.discount_type;
    const nextDiscountValue = payload.discount_value ?? ev.discount_value;
    validateDiscount(nextDiscountType, nextDiscountValue);

    const nextRange = {
      start_month: payload.start_month ?? ev.start_month,
      start_day: payload.start_day ?? ev.start_day,
      end_month: payload.end_month ?? ev.end_month,
      end_day: payload.end_day ?? ev.end_day,
    };
    validateYearlyRange(nextRange);

    if (payload.name && payload.name !== ev.name) {
      const baseSlug = slugify(payload.name);
      ev.slug = await ensureUniqueSlug(baseSlug, ev._id);
      ev.name = payload.name;
    }

    if (payload.description !== undefined) ev.description = payload.description;

    if (payload.image) ev.image = payload.image;

    ev.discount_type = nextDiscountType;
    ev.discount_value = Number(nextDiscountValue);

    ev.is_yearly = payload.is_yearly ?? ev.is_yearly;
    ev.start_month = Number(nextRange.start_month);
    ev.start_day = Number(nextRange.start_day);
    ev.end_month = Number(nextRange.end_month);
    ev.end_day = Number(nextRange.end_day);

    ev.applies_to_product_type =
      payload.applies_to_product_type ?? ev.applies_to_product_type;
    ev.apply_to_all_tours = payload.apply_to_all_tours ?? ev.apply_to_all_tours;
    ev.tour_ids = Array.isArray(payload.tour_ids)
      ? payload.tour_ids
      : ev.tour_ids;

    ev.priority = payload.priority ?? ev.priority;
    ev.is_active = payload.is_active ?? ev.is_active;

    await ev.save();
    return ev;
  },

  async deleteHard(id) {
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) throw new Error("Không tìm thấy event.");
    return deleted;
  },

  async toggleStatus(id) {
    const ev = await Event.findById(id);
    if (!ev) throw new Error("Không tìm thấy event.");
    ev.is_active = !ev.is_active;
    await ev.save();
    return ev;
  },
};
