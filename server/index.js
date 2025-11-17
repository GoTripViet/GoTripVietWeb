const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Cho phép React (chạy ở 5173) gọi API
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// Route test
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello từ Node + Express!" });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});
