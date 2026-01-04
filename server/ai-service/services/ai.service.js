const ChatSession = require("../models/ChatSession.model");
const inventory = require("./inventory.client");

// ✅ bạn phải tạo 2 file này theo bước trước:
// services/llm/openai.client.js  -> embedText(), generateAnswer()
// services/vector/qdrant.client.js -> search()
const { embedText, generateAnswer } = require("./llm/ollama.client");
const { search } = require("./vector/qdrant.client");

function buildContext({ hits, events, sessionMessages }) {
  const topTours = (hits || []).map((h) => h?.payload).filter(Boolean);

  const memory = (sessionMessages || [])
    .slice(-8)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const toursText = topTours
    .slice(0, 5)
    .map((t, i) => {
      return `#${i + 1}
- id: ${t.id}
- title: ${t.title}
- location: ${t.location || "N/A"}
- priceFrom: ${t.priceFrom || "N/A"}
`;
    })
    .join("\n");

  const eventsText = Array.isArray(events)
    ? events
        .slice(0, 5)
        .map((e, i) => `E${i + 1}: ${e.title || e.name || e._id || e.id}`)
        .join("\n")
    : "";

  return {
    topTours,
    contextText: `LỊCH SỬ (MEMORY):
${memory || "(trống)"}

DANH SÁCH TOUR (TOP):
${toursText || "(không có tour phù hợp)"}

EVENT ĐANG CHẠY:
${eventsText || "(không có hoặc không lấy được)"}`,
  };
}

async function chat({ sessionId, message }) {
  // 1) load/create session (Memory)
  let session = await ChatSession.findOne({ sessionId });
  if (!session) session = await ChatSession.create({ sessionId, messages: [] });

  // 2) lưu user msg
  session.messages.push({ role: "user", content: message });
  await session.save();

  // 3) RAG: embed + vector search
  let hits = [];
  try {
    const queryVec = await embedText(message);
    hits = await search(queryVec, 5); // topK=5
  } catch (err) {
    // nếu embedding/qdrant lỗi thì vẫn không làm chết chat
    hits = [];
  }

  // 4) events realtime (đừng để fail làm chết chat)
  const eventsSettled = await Promise.allSettled([inventory.getActiveEvents()]);
  const events =
    eventsSettled[0].status === "fulfilled" ? eventsSettled[0].value : [];

  // 5) build context cho LLM
  const { topTours, contextText } = buildContext({
    hits,
    events,
    sessionMessages: session.messages,
  });

  // 6) gọi OpenAI để viết câu trả lời
  const system =
    "Bạn là GoTripViet Assistant. Nhiệm vụ: tư vấn tour phù hợp dựa trên danh sách TOUR trong ngữ cảnh. " +
    "Nếu thiếu thông tin (điểm đến/số ngày/ngân sách/số người), hãy hỏi tối đa 2 câu để làm rõ. " +
    "Nếu có tour phù hợp, gợi ý 3 tour tốt nhất, nêu lý do ngắn gọn. " +
    "Trả lời tiếng Việt, thân thiện, không bịa giá nếu không có.";

  let answer = "";
  try {
    answer = await generateAnswer({ system, user: message, contextText });
  } catch (err) {
    answer =
      "Mình đang gặp lỗi khi tạo câu trả lời. Bạn cho mình biết điểm đến + số ngày + ngân sách dự kiến để mình gợi ý nhanh nhé.";
  }

  // 7) suggestedTours cho UI
  const suggestedTours = topTours.slice(0, 3).map((t) => ({
    id: t.id,
    title: t.title,
    location: t.location,
    priceFrom: t.priceFrom,
    image: t.image,
  }));

  const result = {
    answer:
      answer ||
      "Bạn cho mình thêm điểm đến / số ngày / ngân sách để mình gợi ý chính xác nhé.",
    suggestedTours,
    followUpQuestions: [
      "Bạn muốn đi mấy ngày?",
      "Ngân sách dự kiến?",
      "Bạn đi mấy người?",
    ],
  };

  // 8) lưu assistant msg (Memory)
  session.messages.push({ role: "assistant", content: result.answer });
  await session.save();

  return result;
}

module.exports = { chat };
