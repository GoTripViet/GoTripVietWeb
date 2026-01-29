import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || "http://localhost:3010",
});

export const aiChat = (payload) => http.post("/ai/chat", payload);
