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

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// akses folder upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ROUTES ================= */

const materiRoutes = require("./routes/materi");
const quizRoutes = require("./routes/quiz");
const authRoutes = require("./routes/auth");
const karyaRoutes = require("./routes/karya");
const proyekRoutes = require("./routes/proyek");
const projectPlanRoutes = require("./routes/projectPlan");
const learningEvaluationRoutes = require("./routes/learningEvaluation");

console.log("MATERI ROUTES DIPAKAI DARI:", require.resolve("./routes/materi"));
console.log("QUIZ ROUTES DIPAKAI DARI:", require.resolve("./routes/quiz"));
console.log("AUTH ROUTES DIPAKAI DARI:", require.resolve("./routes/auth"));
console.log("KARYA ROUTES DIPAKAI DARI:", require.resolve("./routes/karya"));
console.log("PROYEK ROUTES DIPAKAI DARI:", require.resolve("./routes/proyek"));
console.log("PROJECT PLAN ROUTES DIPAKAI DARI:", require.resolve("./routes/projectPlan")
);

/* ================= USE ROUTES ================= */

app.use("/api/materi", materiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/auth", authRoutes);
app.use("/api/karya", karyaRoutes);
app.use("/api/proyek", proyekRoutes);
app.use("/api/project-plans", projectPlanRoutes);
app.use("/api/learning-evaluations", learningEvaluationRoutes);

/* ================= ROOT TEST ================= */

app.get("/", (req, res) => {
  return res.json({
    message: "API E-Learning berjalan",
    status: "OK",
  });
});

app.get("/api/test", (req, res) => {
  return res.json({
    message: "Backend API aktif.",
    port: 5000,
  });
});

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  return res.status(404).json({
    message: "Endpoint tidak ditemukan.",
    method: req.method,
    path: req.originalUrl,
  });
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  return res.status(500).json({
    message: "Terjadi kesalahan pada server.",
    error: err.message,
  });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Cek backend: http://localhost:${PORT}/api/test`);
  console.log(
    `Cek project plan: http://localhost:${PORT}/api/project-plans/test/ping`
  );
});