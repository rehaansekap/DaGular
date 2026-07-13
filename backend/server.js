require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// akses folder upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ROUTES ================= */

const materiRoutes = require("./routes/materi");
const quizRoutes = require("./routes/quiz");
console.log("QUIZ ROUTES DIPAKAI DARI:", require.resolve("./routes/quiz"));
const authRoutes = require("./routes/auth");
const karyaRoutes = require("./routes/karya");
const proyekRoutes = require("./routes/proyek");

/* ================= USE ROUTES ================= */

app.use("/api/materi", materiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/auth", authRoutes);
app.use("/api/karya", karyaRoutes);
app.use("/api/proyek", proyekRoutes);

/* ================= ROOT TEST ================= */

app.get("/", (req, res) => {
  res.send("API E-Learning berjalan");
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Terjadi kesalahan pada server"
  });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});