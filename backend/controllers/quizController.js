const db = require("../config/db");

/* ================================
   1. GET SEMUA SOAL / FILTER PERTEMUAN
================================ */
exports.getQuestions = async (req, res) => {
  try {
    const { pertemuan } = req.query;

    let sql = "SELECT * FROM questions";
    let params = [];

    if (pertemuan) {
      sql += " WHERE pertemuan = ?";
      params.push(pertemuan);
    }

    sql += " ORDER BY id ASC";

    const [results] = await db.promise().query(sql, params);

    res.json({
      message: "Data soal berhasil diambil",
      data: results
    });
  } catch (error) {
    console.error("getQuestions error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   2. TAMBAH SOAL (GURU)
================================ */
exports.createQuestion = async (req, res) => {
  try {
    const { question, pertemuan } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi"
      });
    }

    const [result] = await db.promise().query(
      "INSERT INTO questions (question, pertemuan) VALUES (?, ?)",
      [question, pertemuan]
    );

    res.status(201).json({
      message: "Soal berhasil ditambahkan",
      id: result.insertId
    });
  } catch (error) {
    console.error("createQuestion error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   3. UPDATE SOAL
================================ */
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, pertemuan } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi"
      });
    }

    const [result] = await db.promise().query(
      "UPDATE questions SET question = ?, pertemuan = ? WHERE id = ?",
      [question, pertemuan, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Soal tidak ditemukan"
      });
    }

    res.json({
      message: "Soal berhasil diupdate"
    });
  } catch (error) {
    console.error("updateQuestion error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   4. HAPUS SOAL
================================ */
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.promise().query(
      "DELETE FROM questions WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Soal tidak ditemukan"
      });
    }

    res.json({
      message: "Soal berhasil dihapus"
    });
  } catch (error) {
    console.error("deleteQuestion error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   5. SUBMIT JAWABAN SISWA
================================ */
exports.submitQuiz = async (req, res) => {
  try {
    const { user_id, pertemuan, answers } = req.body;

    if (!user_id || !pertemuan || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "user_id, pertemuan, dan answers wajib diisi"
      });
    }

    // cek apakah siswa sudah pernah submit di pertemuan ini
    const [existing] = await db.promise().query(
      "SELECT id FROM quiz_results WHERE user_id = ? AND pertemuan = ?",
      [user_id, pertemuan]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Anda sudah mengerjakan quiz untuk pertemuan ini"
      });
    }

    // simpan header result
    const [resultInsert] = await db.promise().query(
      "INSERT INTO quiz_results (user_id, pertemuan, score, status) VALUES (?, ?, ?, ?)",
      [user_id, pertemuan, 0, "pending"]
    );

    const resultId = resultInsert.insertId;

    // siapkan insert jawaban
    const values = answers.map((a) => [
      resultId,
      a.question_id,
      a.answer_text || "",
      0
    ]);

    await db.promise().query(
      `INSERT INTO quiz_answers (result_id, question_id, answer_text, score)
       VALUES ?`,
      [values]
    );

    res.status(201).json({
      message: "Jawaban berhasil disimpan",
      result_id: resultId
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   6. GET SEMUA HASIL QUIZ (UNTUK GURU)
================================ */
exports.getAllResults = async (req, res) => {
  try {
    const [results] = await db.promise().query(
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

    res.json({
      message: "Data hasil quiz berhasil diambil",
      data: results
    });
  } catch (error) {
    console.error("getAllResults error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   7. GET DETAIL HASIL QUIZ
================================ */
exports.getResultDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultRows] = await db.promise().query(
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
      [id]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({
        message: "Hasil quiz tidak ditemukan"
      });
    }

    const [answers] = await db.promise().query(
      `SELECT 
          qa.id,
          qa.question_id,
          q.question,
          qa.answer_text,
          qa.score,
          qa.teacher_note
       FROM quiz_answers qa
       JOIN questions q ON qa.question_id = q.id
       WHERE qa.result_id = ?
       ORDER BY qa.id ASC`,
      [id]
    );

    res.json({
      message: "Detail hasil quiz berhasil diambil",
      data: {
        result: resultRows[0],
        answers
      }
    });
  } catch (error) {
    console.error("getResultDetail error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   8. GURU MEMBERI NILAI SEMUA JAWABAN
================================ */
exports.gradeQuiz = async (req, res) => {
  try {
    const { result_id } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Data penilaian tidak valid"
      });
    }

    for (const item of answers) {
      const score = Number(item.score) || 0;
      const teacher_note = item.teacher_note || null;

      await db.promise().query(
        `UPDATE quiz_answers 
         SET score = ?, teacher_note = ?
         WHERE id = ? AND result_id = ?`,
        [score, teacher_note, item.answer_id, result_id]
      );
    }

    const [sumRows] = await db.promise().query(
      "SELECT COALESCE(SUM(score), 0) AS total FROM quiz_answers WHERE result_id = ?",
      [result_id]
    );

    const total = sumRows[0].total || 0;

    await db.promise().query(
      "UPDATE quiz_results SET score = ?, status = 'graded' WHERE id = ?",
      [total, result_id]
    );

    res.json({
      message: "Penilaian berhasil disimpan",
      total_score: total
    });
  } catch (error) {
    console.error("gradeQuiz error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

/* ================================
   9. GET HASIL QUIZ SISWA SENDIRI
================================ */
exports.getMyResults = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.promise().query(
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

    res.json({
      message: "Data hasil quiz siswa berhasil diambil",
      data: results
    });
  } catch (error) {
    console.error("getMyResults error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};