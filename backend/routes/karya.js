const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

/* ================= STORAGE ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ================= UPLOAD KARYA ================= */

router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.body.project_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File harus diupload"
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project harus dipilih"
      });
    }

    const imagePath = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;

    await db.query(
      "INSERT INTO karya (project_id, user_id, image_path) VALUES (?, ?, ?)",
      [projectId, userId, imagePath]
    );

    res.json({
      success: true,
      message: "Upload berhasil"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Upload gagal"
    });
  }
});

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

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil galeri"
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

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil komentar"
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
        message: "Komentar tidak boleh kosong"
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

    res.json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan komentar"
    });
  }
});

module.exports = router;