const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/auth");

/* ==============================
   MULTER CONFIG
================================ */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/* ==============================
   UPLOAD GAMBAR
================================ */

router.post("/upload", upload.single("file"), (req, res) => {

  try {

    res.json({
      message: "Upload berhasil",
      url: `http://localhost:5000/uploads/${req.file.filename}`
    });

  } catch (err) {

    res.status(500).json({
      message: "Upload gagal"
    });

  }

});

/* ==============================
   GET SEMUA MATERI
================================ */
router.get("/", async (req, res) => {

  try {

    const [materi] = await db.query(
      "SELECT * FROM materi ORDER BY pertemuan ASC"
    );

    for (let m of materi) {

      const [konten] = await db.query(
        "SELECT * FROM materi_konten WHERE materi_id = ? ORDER BY urutan ASC",
        [m.id]
      );

      m.konten = konten;
    }

    res.json(materi);

  } catch (err) {

    console.error("GET MATERI ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil materi",
      error: err.message
    });

  }

});


/* ==============================
   GET MATERI BY ID
================================ */
router.get("/:id", async (req, res) => {

  const id = req.params.id;

  try {

    const [materi] = await db.query(
      "SELECT * FROM materi WHERE id = ?",
      [id]
    );

    if (materi.length === 0) {

      return res.status(404).json({
        message: "Materi tidak ditemukan"
      });

    }

    const [konten] = await db.query(
      "SELECT * FROM materi_konten WHERE materi_id = ? ORDER BY urutan ASC",
      [id]
    );

    materi[0].konten = konten;

    res.json(materi[0]);

  } catch (err) {

    console.error("GET DETAIL ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil detail materi",
      error: err.message
    });

  }

});


/* ==============================
   CREATE MATERI
================================ */
router.post("/create", authMiddleware, async (req, res) => {

  const { judul, pertemuan, konten } = req.body;

  const created_by = req.user.id;

  try {

    if (!judul || !pertemuan) {
      return res.status(400).json({
        message: "Judul dan pertemuan wajib diisi"
      });
    }

    const [materiResult] = await db.query(
      "INSERT INTO materi (judul, pertemuan, created_by) VALUES (?,?,?)",
      [
        judul,
        pertemuan,
        created_by
      ]
    );

    const materiId = materiResult.insertId;

    if (Array.isArray(konten)) {

      for (let item of konten) {

        await db.query(
          `INSERT INTO materi_konten
          (materi_id,type,title,body,url,urutan)
          VALUES (?,?,?,?,?,?)`,
          [
            materiId,
            item.type || "text",
            item.title || null,
            item.body || null,
            item.url || null,
            item.urutan || 1
          ]
        );

      }

    }

    res.json({
      message:"Materi berhasil ditambahkan"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message:"Gagal menambahkan materi"
    });

  }

});

/* ==============================
   UPDATE MATERI
================================ */
router.put("/update/:id", async (req, res) => {

  const id = req.params.id;
  const { judul, pertemuan } = req.body;

  try {

    await db.query(
      "UPDATE materi SET judul = ?, pertemuan = ? WHERE id = ?",
      [judul, pertemuan, id]
    );

    res.json({
      message: "Materi berhasil diperbarui"
    });

  } catch (err) {

    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      message: "Gagal update materi",
      error: err.message
    });

  }

});


/* ==============================
   DELETE MATERI
================================ */
router.delete("/delete/:id", async (req, res) => {

  const id = req.params.id;

  try {

    await db.query(
      "DELETE FROM materi_konten WHERE materi_id = ?",
      [id]
    );

    await db.query(
      "DELETE FROM materi WHERE id = ?",
      [id]
    );

    res.json({
      message: "Materi berhasil dihapus"
    });

  } catch (err) {

    console.error("DELETE ERROR:", err);

    res.status(500).json({
      message: "Gagal menghapus materi",
      error: err.message
    });

  }

});


module.exports = router;