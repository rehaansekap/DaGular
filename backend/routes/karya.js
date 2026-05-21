const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");
const path = require("path");
const fs = require("fs");

/* ================= STORAGE ================= */

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ================= UPLOAD KARYA ================= */

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.body.project_id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "File harus diupload",
        });
      }

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project harus dipilih",
        });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      await db.query(
        "INSERT INTO karya (project_id, user_id, image_path) VALUES (?, ?, ?)",
        [projectId, userId, imagePath]
      );

      return res.json({
        success: true,
        message: "Upload berhasil",
        image_path: imagePath,
      });
    } catch (err) {
      console.error("UPLOAD KARYA ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Upload gagal",
      });
    }
  }
);

/* ================= GALERI PER PROJECT ================= */

router.get("/project/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        karya.id,
        karya.project_id,
        karya.user_id,
        karya.image_path,
        karya.created_at,
        users.name AS uploader
      FROM karya
      JOIN users ON karya.user_id = users.id
      WHERE karya.project_id = ?
      ORDER BY karya.created_at DESC
      `,
      [req.params.id]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET GALERI PROJECT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil galeri",
    });
  }
});

/* ================= AMBIL KOMENTAR PER KARYA ================= */

router.get("/:karyaId/comments", async (req, res) => {
  try {
    const { karyaId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        komentar_karya.id,
        komentar_karya.karya_id,
        komentar_karya.user_id,
        komentar_karya.komentar,
        komentar_karya.created_at,
        users.name AS nama_pengguna
      FROM komentar_karya
      JOIN users ON komentar_karya.user_id = users.id
      WHERE komentar_karya.karya_id = ?
      ORDER BY komentar_karya.created_at ASC
      `,
      [karyaId]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET KOMENTAR KARYA ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil komentar",
    });
  }
});

/* ================= TAMBAH KOMENTAR ================= */

router.post("/:karyaId/comments", authMiddleware, async (req, res) => {
  try {
    const { karyaId } = req.params;
    const { komentar } = req.body;
    const userId = req.user.id;

    if (!komentar || !komentar.trim()) {
      return res.status(400).json({
        success: false,
        message: "Komentar tidak boleh kosong",
      });
    }

    await db.query(
      `
      INSERT INTO komentar_karya (karya_id, user_id, komentar)
      VALUES (?, ?, ?)
      `,
      [karyaId, userId, komentar.trim()]
    );

    const [rows] = await db.query(
      `
      SELECT
        komentar_karya.id,
        komentar_karya.karya_id,
        komentar_karya.user_id,
        komentar_karya.komentar,
        komentar_karya.created_at,
        users.name AS nama_pengguna
      FROM komentar_karya
      JOIN users ON komentar_karya.user_id = users.id
      WHERE komentar_karya.id = LAST_INSERT_ID()
      LIMIT 1
      `
    );

    return res.json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: rows[0],
    });
  } catch (err) {
    console.error("TAMBAH KOMENTAR KARYA ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan komentar",
    });
  }
});

module.exports = router;