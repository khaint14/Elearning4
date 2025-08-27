import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import initApi from "./api.js";

const app = express();
const PORT = 3000;

// Lấy đường dẫn thư mục gốc
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dẫn tới thư mục frontend
const frontendPath = path.join(__dirname, "../frontend");

// Middleware
app.use(bodyParser.json());
app.use(express.static(frontendPath));

// Gọi API (nạp các route từ api.js)
initApi(app, __dirname);

// ====== Trang mặc định (landing) ======
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "landing.html"));
});

// ====== Chạy server ======
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
