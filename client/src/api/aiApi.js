import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:3005",
});

export const aiChat = (payload) => http.post("/ai/chat", payload);
