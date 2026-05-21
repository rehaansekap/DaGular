const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/quiz";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    return res.json({
      message: "Upload gambar berhasil",
      url: `${process.env.BASE_URL || "http://localhost:5000"}/uploads/quiz/${req.file.filename}`,
    });
  } catch (err) {
    console.error("UPLOAD QUIZ ERROR:", err);
    return res.status(500).json({ message: "Upload gambar gagal" });
  }
});

router.get("/questions", async (req, res) => {
  try {
    const { pertemuan } = req.query;

    let sql = "SELECT * FROM questions";
    const params = [];

    if (pertemuan) {
      sql += " WHERE pertemuan = ?";
      params.push(pertemuan);
    }

    sql += " ORDER BY id ASC";

    const [results] = await db.query(sql, params);

    return res.json({
      message: "Data soal berhasil diambil",
      data: results,
    });
  } catch (err) {
    console.error("GET /questions error:", err);
    return res.status(500).json({ message: "Gagal mengambil data soal" });
  }
});

router.post("/questions", async (req, res) => {
  try {
    const {
      question,
      pertemuan,
      image_url,
      judul_lkpd,
      pendahuluan_lkpd,
      answer_type,
      answer_fields,
    } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi",
      });
    }

    const [existingRows] = await db.query(
      `SELECT judul_lkpd, pendahuluan_lkpd 
       FROM questions 
       WHERE pertemuan = ? 
       LIMIT 1`,
      [pertemuan]
    );

    const existingIntro = existingRows[0] || {};

    const finalJudul =
      judul_lkpd && judul_lkpd.trim() !== ""
        ? judul_lkpd.trim()
        : existingIntro.judul_lkpd || null;

    const finalPendahuluan =
      pendahuluan_lkpd && pendahuluan_lkpd.trim() !== ""
        ? pendahuluan_lkpd.trim()
        : existingIntro.pendahuluan_lkpd || null;

    const finalAnswerType = ["text", "image", "text_image"].includes(answer_type)
      ? answer_type
      : "text";

    const finalAnswerFields =
      answer_fields && answer_fields.trim() !== "" ? answer_fields : null;

    const [result] = await db.query(
      `INSERT INTO questions 
       (question, pertemuan, image_url, judul_lkpd, pendahuluan_lkpd, answer_type, answer_fields) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        question,
        pertemuan,
        image_url || null,
        finalJudul,
        finalPendahuluan,
        finalAnswerType,
        finalAnswerFields,
      ]
    );

    return res.status(201).json({
      message: "Soal berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST /questions error:", err);
    return res.status(500).json({ message: "Gagal menambahkan soal" });
  }
});

router.put("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      pertemuan,
      image_url,
      judul_lkpd,
      pendahuluan_lkpd,
      answer_type,
      answer_fields,
    } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi",
      });
    }

    const finalAnswerType = ["text", "image", "text_image"].includes(answer_type)
      ? answer_type
      : "text";

    const [result] = await db.query(
      `UPDATE questions 
       SET question = ?, 
           pertemuan = ?, 
           image_url = ?, 
           judul_lkpd = ?, 
           pendahuluan_lkpd = ?, 
           answer_type = ?,
           answer_fields = ?
       WHERE id = ?`,
      [
        question,
        pertemuan,
        image_url || null,
        judul_lkpd || null,
        pendahuluan_lkpd || null,
        finalAnswerType,
        answer_fields || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    return res.json({ message: "Soal berhasil diupdate" });
  } catch (err) {
    console.error("PUT /questions/:id error:", err);
    return res.status(500).json({ message: "Gagal mengupdate soal" });
  }
});

router.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM questions WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    return res.json({ message: "Soal berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /questions/:id error:", err);
    return res.status(500).json({ message: "Gagal menghapus soal" });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const { user_id, pertemuan, answers } = req.body;

    if (
      !user_id ||
      !pertemuan ||
      !answers ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        message: "user_id, pertemuan, dan answers wajib diisi",
      });
    }

    const [checkResults] = await db.query(
      "SELECT id FROM quiz_results WHERE user_id = ? AND pertemuan = ?",
      [user_id, pertemuan]
    );

    if (checkResults.length > 0) {
      return res.status(400).json({
        message: "Anda sudah mengerjakan quiz pada pertemuan ini",
      });
    }

    const [result] = await db.query(
      "INSERT INTO quiz_results (user_id, pertemuan, score, status) VALUES (?, ?, ?, ?)",
      [user_id, pertemuan, 0, "pending"]
    );

    const resultId = result.insertId;

    const values = answers.map((a) => [
      resultId,
      a.question_id,
      a.answer_text || "",
      0,
    ]);

    await db.query(
      `INSERT INTO quiz_answers (result_id, question_id, answer_text, score)
       VALUES ?`,
      [values]
    );

    return res.status(201).json({
      message: "Jawaban berhasil disimpan",
      result_id: resultId,
    });
  } catch (err) {
    console.error("SUBMIT QUIZ ERROR:", err);
    return res.status(500).json({ message: "Gagal menyimpan jawaban siswa" });
  }
});

router.get("/results", async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT 
        qr.id,
        qr.user_id,
        qr.pertemuan,
        qr.score,
        qr.status,
        qr.created_at,
        u.name AS student_name
       FROM quiz_results qr
       LEFT JOIN users u ON qr.user_id = u.id
       ORDER BY qr.created_at DESC`
    );

    return res.json({
      message: "Data hasil quiz berhasil diambil",
      data: results,
    });
  } catch (err) {
    console.error("GET /results error:", err);
    return res.status(500).json({ message: "Gagal mengambil data hasil quiz" });
  }
});

router.get("/results/:id", async (req, res) => {
  try {
    const resultId = req.params.id;

    const [resultRows] = await db.query(
      `SELECT 
        qr.id,
        qr.user_id,
        qr.pertemuan,
        qr.score,
        qr.status,
        qr.created_at,
        u.name AS student_name
       FROM quiz_results qr
       LEFT JOIN users u ON qr.user_id = u.id
       WHERE qr.id = ?`,
      [resultId]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({ message: "Hasil quiz tidak ditemukan" });
    }

    const [answerRows] = await db.query(
      `SELECT 
        qa.id,
        qa.question_id,
        q.question,
        q.image_url,
        q.answer_type,
        q.answer_fields,
        qa.answer_text,
        qa.score,
        qa.teacher_note
       FROM quiz_answers qa
       JOIN questions q ON qa.question_id = q.id
       WHERE qa.result_id = ?
       ORDER BY qa.id ASC`,
      [resultId]
    );

    return res.json({
      message: "Detail hasil quiz berhasil diambil",
      data: {
        result: resultRows[0],
        answers: answerRows,
      },
    });
  } catch (err) {
    console.error("GET /results/:id error:", err);
    return res.status(500).json({ message: "Gagal mengambil detail hasil quiz" });
  }
});

router.put("/results/:result_id/grade", async (req, res) => {
  try {
    const resultId = req.params.result_id;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Data penilaian tidak valid" });
    }

    for (const item of answers) {
      const score = Number(item.score) || 0;
      const teacherNote = item.teacher_note || null;

      await db.query(
        "UPDATE quiz_answers SET score = ?, teacher_note = ? WHERE id = ? AND result_id = ?",
        [score, teacherNote, item.answer_id, resultId]
      );
    }

    const [sumResults] = await db.query(
      "SELECT SUM(score) AS total FROM quiz_answers WHERE result_id = ?",
      [resultId]
    );

    const total = sumResults[0].total || 0;

    await db.query(
      "UPDATE quiz_results SET score = ?, status = 'graded' WHERE id = ?",
      [total, resultId]
    );

    return res.json({
      message: "Penilaian berhasil disimpan",
      total_score: total,
    });
  } catch (err) {
    console.error("GRADE QUIZ ERROR:", err);
    return res.status(500).json({ message: "Gagal menyimpan penilaian" });
  }
});

router.get("/my-results/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(
      `SELECT 
        id,
        user_id,
        pertemuan,
        score,
        status,
        created_at
       FROM quiz_results
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );

    return res.json({
      message: "Data hasil quiz siswa berhasil diambil",
      data: results,
    });
  } catch (err) {
    console.error("GET my-results error:", err);
    return res.status(500).json({ message: "Gagal mengambil hasil quiz siswa" });
  }
});

router.get("/my-results/:user_id/:result_id", async (req, res) => {
  try {
    const { user_id, result_id } = req.params;

    const [resultRows] = await db.query(
      `SELECT 
        qr.id,
        qr.user_id,
        qr.pertemuan,
        qr.score,
        qr.status,
        qr.created_at
       FROM quiz_results qr
       WHERE qr.id = ? AND qr.user_id = ?`,
      [result_id, user_id]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({ message: "Hasil quiz tidak ditemukan" });
    }

    const [answerRows] = await db.query(
      `SELECT 
        qa.id,
        qa.question_id,
        q.question,
        q.image_url,
        q.answer_type,
        q.answer_fields,
        qa.answer_text,
        qa.score,
        qa.teacher_note
       FROM quiz_answers qa
       JOIN questions q ON qa.question_id = q.id
       WHERE qa.result_id = ?
       ORDER BY qa.id ASC`,
      [result_id]
    );

    return res.json({
      message: "Detail hasil quiz siswa berhasil diambil",
      data: {
        result: resultRows[0],
        answers: answerRows,
      },
    });
  } catch (err) {
    console.error("GET my-results detail error:", err);
    return res.status(500).json({ message: "Gagal mengambil detail hasil quiz" });
  }
});

module.exports = router;