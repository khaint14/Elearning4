import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

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

// ====== Kết nối SQLite ======
const db = new sqlite3.Database(
  path.join(__dirname, "database.sqlite"),
  (err) => {
    if (err) {
      console.error("❌ Lỗi khi mở database:", err.message);
    } else {
      console.log("✅ Kết nối SQLite thành công.");
    }
  }
);

// Tạo bảng users nếu chưa có
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    age INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// ====== API Đăng ký ======
app.post("/api/register", (req, res) => {
  const { fullname, age, username, password } = req.body;

  if (!fullname || !age || !username || !password) {
    return res.status(400).json({ message: "⚠️ Thiếu thông tin!" });
  }

  const sql = `INSERT INTO users (fullname, age, username, password) VALUES (?, ?, ?, ?)`;

  db.run(sql, [fullname, age, username, password], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res
          .status(400)
          .json({ message: "⚠️ Tên đăng nhập đã tồn tại!" });
      }
      return res.status(500).json({ message: "❌ Lỗi server." });
    }
    res.json({ message: "✅ Đăng ký thành công!" });
  });
});

// ====== API Đăng nhập ======
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "⚠️ Thiếu tài khoản hoặc mật khẩu!" });
  }

  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "❌ Lỗi server." });
    }
    if (!row) {
      return res
        .status(401)
        .json({ message: "⚠️ Sai tài khoản hoặc mật khẩu!" });
    }
    res.json({
      message: "✅ Đăng nhập thành công!",
      user: { id: row.id, username: row.username, fullname: row.fullname },
    });
  });
});
// ====== API Cập nhật thông tin cá nhân ======
app.put("/api/updateUser/:id", (req, res) => {
  const { id } = req.params;
  const { fullname, age, password } = req.body;

  if (!fullname || !age || !password) {
    return res.status(400).json({ message: "⚠️ Thiếu thông tin!" });
  }

  const sql = `UPDATE users SET fullname = ?, age = ?, password = ? WHERE id = ?`;
  db.run(sql, [fullname, age, password, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "❌ Lỗi server." });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "⚠️ Người dùng không tồn tại!" });
    }
    res.json({ message: "✅ Cập nhật thành công!" });
  });
});

// ====== Trang mặc định (landing) ======
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "landing.html"));
});

// ====== Chạy server ======
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
