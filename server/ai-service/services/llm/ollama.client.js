const axios = require("axios");
const {
  OLLAMA_URL,
  OLLAMA_CHAT_MODEL,
  OLLAMA_EMBED_MODEL,
} = require("../../config/env");

const http = axios.create({ baseURL: OLLAMA_URL, timeout: 60000 });

async function embedText(text) {
  const { data } = await http.post("/api/embeddings", {
    model: OLLAMA_EMBED_MODEL,
    prompt: text,
  });
  return data.embedding; // float[]
}

async function generateAnswer({ system, user, contextText }) {
  const prompt =
    `${system}\n\n` + `NGỮ CẢNH:\n${contextText}\n\n` + `CÂU HỎI:\n${user}\n`;

  const { data } = await http.post("/api/generate", {
    model: OLLAMA_CHAT_MODEL,
    prompt,
    stream: false,
  });

  return data.response || "";
}

module.exports = { embedText, generateAnswer };
