const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

/* ================= AMBIL SEMUA PROYEK ================= */

router.get("/", async (req, res) => {

  try {

    const [rows] = await db.query(
      "SELECT * FROM proyek ORDER BY pertemuan ASC"
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil proyek"
    });

  }

});


/* ================= TAMBAH PROYEK ================= */

router.post("/create", auth, async (req, res) => {

  const { judul, pertemuan } = req.body;
  const userId = req.user.id;

  try {

    await db.query(
      "INSERT INTO proyek (judul, pertemuan, created_by) VALUES (?,?,?)",
      [judul, pertemuan, userId]
    );

    res.json({
      success: true,
      message: "Proyek berhasil ditambahkan"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Gagal menambah proyek"
    });

  }

});


/* ================= HAPUS PROYEK ================= */

router.delete("/:id", auth, async (req, res) => {

  const id = req.params.id;

  try {

    await db.query(
      "DELETE FROM proyek WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Proyek dihapus"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus proyek"
    });

  }

});

module.exports = router;