const catalog = require("./catalog.client");
const { embedText } = require("./llm/ollama.client");
const { ensureCollection, upsertPoints } = require("./vector/qdrant.client");

// Text chuẩn hóa để embedding
function buildTourText(t) {
  const title = t.title || t.name || "";
  const loc = t.location?.name || t.locationName || "";
  const cat = t.category?.name || "";
  const desc = t.short_description || t.description || "";
  const highlights = t.trip_highlights ? JSON.stringify(t.trip_highlights) : "";

  return [
    `Tên tour: ${title}`,
    `Điểm đến: ${loc}`,
    `Danh mục: ${cat}`,
    `Mô tả: ${desc}`,
    `Nổi bật: ${highlights}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function reindexTours() {
  // Bạn có thể tăng limit / phân trang nếu backend hỗ trợ
  const tours = await catalog.searchTours({ q: "" }); // hoặc viết thêm listTours() riêng
  if (!Array.isArray(tours) || tours.length === 0) return { indexed: 0 };

  // Lấy vector size bằng 1 embedding mẫu (để khỏi đoán dimension)
  const sampleVec = await embedText(buildTourText(tours[0]));
  await ensureCollection(sampleVec.length);

  const points = [];
  for (const t of tours) {
    const text = buildTourText(t);
    const vec = await embedText(text);

    points.push({
      id: String(t._id || t.id),
      vector: vec,
      payload: {
        id: String(t._id || t.id),
        title: t.title || t.name,
        location: t.location?.name || t.locationName || "",
        priceFrom: t.priceFrom || t.basePrice || null,
        image: t.image || t.thumbnail || null,
        text, // optional debug
      },
    });
  }

  // Upsert theo batch để đỡ nặng
  const batchSize = 50;
  for (let i = 0; i < points.length; i += batchSize) {
    await upsertPoints(points.slice(i, i + batchSize));
  }

  return { indexed: points.length };
}

module.exports = { reindexTours };
