const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ================================
   DATA PERNYATAAN LIKERT
================================ */

const EVALUATION_ITEMS = [
  {
    indicator_key: "pemahaman_materi",
    indicator_label: "Pemahaman Materi",
    items: [
      {
        item_key: "pemahaman_1",
        statement_text:
          "Saya memahami materi desain setelah mengikuti pembelajaran ini.",
      },
      {
        item_key: "pemahaman_2",
        statement_text:
          "Proyek yang dikerjakan membantu saya memahami materi dengan lebih mudah.",
      },
      {
        item_key: "pemahaman_3",
        statement_text:
          "Saya dapat menghubungkan materi pembelajaran dengan tugas proyek yang dibuat.",
      },
    ],
  },
  {
    indicator_key: "keaktifan",
    indicator_label: "Keaktifan dan Keterlibatan",
    items: [
      {
        item_key: "keaktifan_1",
        statement_text: "Saya aktif mengikuti diskusi selama kegiatan proyek.",
      },
      {
        item_key: "keaktifan_2",
        statement_text:
          "Saya ikut berkontribusi dalam mengerjakan tugas kelompok.",
      },
      {
        item_key: "keaktifan_3",
        statement_text:
          "Saya berusaha menyelesaikan tugas sesuai tanggung jawab saya.",
      },
    ],
  },
  {
    indicator_key: "kerja_sama",
    indicator_label: "Kerja Sama Kelompok",
    items: [
      {
        item_key: "kerja_sama_1",
        statement_text: "Saya dapat bekerja sama dengan anggota kelompok.",
      },
      {
        item_key: "kerja_sama_2",
        statement_text: "Kelompok saya membagi tugas dengan cukup jelas.",
      },
      {
        item_key: "kerja_sama_3",
        statement_text:
          "Anggota kelompok saling membantu saat mengalami kesulitan.",
      },
    ],
  },
  {
    indicator_key: "proses_pjbl",
    indicator_label: "Proses Project Based Learning",
    items: [
      {
        item_key: "pjbl_1",
        statement_text:
          "Kegiatan proyek membuat pembelajaran terasa lebih menarik.",
      },
      {
        item_key: "pjbl_2",
        statement_text:
          "Tahapan membuat rencana proyek membantu kelompok bekerja lebih terarah.",
      },
      {
        item_key: "pjbl_3",
        statement_text:
          "Jadwal proyek membantu kelompok mengatur waktu pengerjaan.",
      },
    ],
  },
  {
    indicator_key: "platform",
    indicator_label: "Penggunaan Media atau Platform",
    items: [
      {
        item_key: "platform_1",
        statement_text:
          "Fitur LKPD membantu saya memahami tugas yang harus dikerjakan.",
      },
      {
        item_key: "platform_2",
        statement_text:
          "Fitur Desain Proyek membantu kelompok menyusun rencana kerja.",
      },
      {
        item_key: "platform_3",
        statement_text:
          "Tampilan platform cukup mudah digunakan dalam proses pembelajaran.",
      },
    ],
  },
  {
    indicator_key: "pengalaman_belajar",
    indicator_label: "Pengalaman Belajar",
    items: [
      {
        item_key: "pengalaman_1",
        statement_text:
          "Saya merasa lebih percaya diri setelah menyelesaikan proyek.",
      },
      {
        item_key: "pengalaman_2",
        statement_text:
          "Saya merasa pembelajaran berbasis proyek membantu saya belajar secara aktif.",
      },
      {
        item_key: "pengalaman_3",
        statement_text:
          "Saya puas dengan pengalaman belajar melalui kegiatan proyek ini.",
      },
    ],
  },
];

const FLAT_ITEMS = EVALUATION_ITEMS.flatMap((group) =>
  group.items.map((item) => ({
    indicator_key: group.indicator_key,
    indicator_label: group.indicator_label,
    item_key: item.item_key,
    statement_text: item.statement_text,
  }))
);

/* ================================
   HELPER
================================ */

function cleanText(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function getCategory(finalScore) {
  const score = Number(finalScore);

  if (score >= 85) return "Sangat Baik";
  if (score >= 70) return "Baik";
  if (score >= 55) return "Cukup";
  if (score >= 40) return "Kurang";
  return "Sangat Kurang";
}

function normalizeScores(scores) {
  const scoreMap = {};

  if (Array.isArray(scores)) {
    scores.forEach((item) => {
      if (!item || !item.item_key) return;

      const score = Number(item.score);
      scoreMap[item.item_key] =
        score >= 1 && score <= 5 && Number.isInteger(score) ? score : null;
    });

    return scoreMap;
  }

  if (scores && typeof scores === "object") {
    Object.entries(scores).forEach(([key, value]) => {
      const score = Number(value);
      scoreMap[key] =
        score >= 1 && score <= 5 && Number.isInteger(score) ? score : null;
    });
  }

  return scoreMap;
}

async function getEvaluationDetail(evaluationId) {
  const [evaluationRows] = await db.query(
    `SELECT 
       pe.*,
       u.name AS student_name
     FROM pjbl_learning_evaluations pe
     LEFT JOIN users u ON pe.user_id = u.id
     WHERE pe.id = ?
     LIMIT 1`,
    [Number(evaluationId)]
  );

  if (evaluationRows.length === 0) return null;

  const [scoreRows] = await db.query(
    `SELECT
       id,
       evaluation_id,
       indicator_key,
       indicator_label,
       item_key,
       statement_text,
       score
     FROM pjbl_learning_evaluation_scores
     WHERE evaluation_id = ?
     ORDER BY id ASC`,
    [Number(evaluationId)]
  );

  return {
    ...evaluationRows[0],
    scores: scoreRows,
  };
}

async function attachScoresToEvaluations(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return [];

  const evaluationIds = evaluations.map((item) => Number(item.id));
  const placeholders = evaluationIds.map(() => "?").join(",");

  const [scoreRows] = await db.query(
    `SELECT
       id,
       evaluation_id,
       indicator_key,
       indicator_label,
       item_key,
       statement_text,
       score
     FROM pjbl_learning_evaluation_scores
     WHERE evaluation_id IN (${placeholders})
     ORDER BY id ASC`,
    evaluationIds
  );

  return evaluations.map((evaluation) => ({
    ...evaluation,
    scores: scoreRows.filter(
      (score) => Number(score.evaluation_id) === Number(evaluation.id)
    ),
  }));
}

/* ================================
   TEST ROUTE
================================ */

router.get("/test/ping", (req, res) => {
  return res.json({
    message: "Learning evaluation route aktif.",
  });
});

/* ================================
   AMBIL DAFTAR PERTANYAAN
================================ */

router.get("/questions", (req, res) => {
  return res.json({
    message: "Daftar pernyataan evaluasi berhasil diambil.",
    data: {
      scale: [
        { value: 1, label: "Sangat Tidak Setuju" },
        { value: 2, label: "Tidak Setuju" },
        { value: 3, label: "Cukup Setuju" },
        { value: 4, label: "Setuju" },
        { value: 5, label: "Sangat Setuju" },
      ],
      max_score: FLAT_ITEMS.length * 5,
      total_items: FLAT_ITEMS.length,
      indicators: EVALUATION_ITEMS,
    },
  });
});

/* ================================
   SIMPAN / UPDATE EVALUASI
================================ */

router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      pertemuan,
      group_name,
      scores,
      memorable_experience,
      learning_difficulty,
      improvement_suggestion,
      status,
    } = req.body;

    if (!user_id || !pertemuan) {
      return res.status(400).json({
        message: "user_id dan pertemuan wajib diisi.",
      });
    }

    const finalStatus = "submitted";
    const scoreMap = normalizeScores(scores);

    const scoreValues = FLAT_ITEMS.map((item) => scoreMap[item.item_key]);
    const answeredScores = scoreValues.filter(
      (score) => typeof score === "number"
    );

    if (finalStatus === "submitted") {
      if (!cleanText(group_name)) {
        return res.status(400).json({
          message: "Nama kelompok wajib diisi.",
        });
      }

      if (answeredScores.length !== FLAT_ITEMS.length) {
        return res.status(400).json({
          message: "Semua pernyataan skala Likert wajib diisi.",
        });
      }

      if (!cleanText(memorable_experience)) {
        return res.status(400).json({
          message: "Pengalaman paling berkesan wajib diisi.",
        });
      }

      if (!cleanText(learning_difficulty)) {
        return res.status(400).json({
          message: "Kesulitan belajar wajib diisi.",
        });
      }

      if (!cleanText(improvement_suggestion)) {
        return res.status(400).json({
          message: "Saran perbaikan wajib diisi.",
        });
      }
    }

    const totalScore = answeredScores.reduce(
      (sum, score) => sum + Number(score),
      0
    );

    const maxScore = FLAT_ITEMS.length * 5;
    const finalScore =
      answeredScores.length === 0 ? 0 : Number(((totalScore / maxScore) * 100).toFixed(2));

    const category =
      answeredScores.length === FLAT_ITEMS.length ? getCategory(finalScore) : "Belum Lengkap";

    const [existingRows] = await db.query(
        `SELECT id, status
        FROM pjbl_learning_evaluations
        WHERE user_id = ?
            AND pertemuan = ?
        LIMIT 1`,
        [Number(user_id), Number(pertemuan)]
        );

        if (existingRows.length > 0 && existingRows[0].status === "submitted") {
        return res.status(409).json({
            message:
            "Evaluasi untuk pertemuan ini sudah dikirim dan tidak dapat diedit kembali.",
        });
    }

    let evaluationId = null;

    if (existingRows.length > 0) {
      evaluationId = existingRows[0].id;

      await db.query(
        `UPDATE pjbl_learning_evaluations
         SET group_name = ?,
             memorable_experience = ?,
             learning_difficulty = ?,
             improvement_suggestion = ?,
             total_score = ?,
             max_score = ?,
             final_score = ?,
             category = ?,
             answered_count = ?,
             status = ?,
             submitted_at = CASE
               WHEN ? = 'submitted' THEN NOW()
               ELSE submitted_at
             END,
             updated_at = NOW()
         WHERE id = ?`,
        [
          cleanText(group_name),
          cleanText(memorable_experience),
          cleanText(learning_difficulty),
          cleanText(improvement_suggestion),
          totalScore,
          maxScore,
          finalScore,
          category,
          answeredScores.length,
          finalStatus,
          finalStatus,
          Number(evaluationId),
        ]
      );
    } else {
      const [insertResult] = await db.query(
        `INSERT INTO pjbl_learning_evaluations
          (
            user_id,
            pertemuan,
            group_name,
            memorable_experience,
            learning_difficulty,
            improvement_suggestion,
            total_score,
            max_score,
            final_score,
            category,
            answered_count,
            status,
            submitted_at
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(user_id),
          Number(pertemuan),
          cleanText(group_name),
          cleanText(memorable_experience),
          cleanText(learning_difficulty),
          cleanText(improvement_suggestion),
          totalScore,
          maxScore,
          finalScore,
          category,
          answeredScores.length,
          finalStatus,
          finalStatus === "submitted" ? new Date() : null,
        ]
      );

      evaluationId = insertResult.insertId;
    }

    await db.query(
      `DELETE FROM pjbl_learning_evaluation_scores
       WHERE evaluation_id = ?`,
      [Number(evaluationId)]
    );

    for (const item of FLAT_ITEMS) {
      await db.query(
        `INSERT INTO pjbl_learning_evaluation_scores
          (
            evaluation_id,
            indicator_key,
            indicator_label,
            item_key,
            statement_text,
            score
          )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Number(evaluationId),
          item.indicator_key,
          item.indicator_label,
          item.item_key,
          item.statement_text,
          scoreMap[item.item_key] || null,
        ]
      );
    }

    const detail = await getEvaluationDetail(evaluationId);

    return res.json({
      message:
        finalStatus === "submitted"
          ? "Evaluasi pengalaman belajar berhasil dikirim."
          : "Draft evaluasi pengalaman belajar berhasil disimpan.",
      data: detail,
    });
  } catch (err) {
    console.error("SAVE LEARNING EVALUATION ERROR:", err);

    return res.status(500).json({
      message: "Gagal menyimpan evaluasi pengalaman belajar.",
      error: err.message,
    });
  }
});

/* ================================
   SISWA: LIHAT RIWAYAT EVALUASI
================================ */

router.get("/siswa/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.query(
      `SELECT 
         pe.*,
         u.name AS student_name
       FROM pjbl_learning_evaluations pe
       LEFT JOIN users u ON pe.user_id = u.id
       WHERE pe.user_id = ?
       ORDER BY pe.pertemuan ASC, pe.updated_at DESC`,
      [Number(user_id)]
    );

    const data = await attachScoresToEvaluations(rows);

    return res.json({
      message: "Daftar evaluasi belajar siswa berhasil diambil.",
      data,
    });
  } catch (err) {
    console.error("GET STUDENT LEARNING EVALUATIONS ERROR:", err);

    return res.status(500).json({
      message: "Gagal mengambil evaluasi belajar siswa.",
      error: err.message,
    });
  }
});

/* ================================
   GURU: LIHAT SEMUA EVALUASI
================================ */

router.get("/guru/all/list", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         pe.*,
         u.name AS student_name
       FROM pjbl_learning_evaluations pe
       LEFT JOIN users u ON pe.user_id = u.id
       ORDER BY pe.updated_at DESC`
    );

    const data = await attachScoresToEvaluations(rows);

    return res.json({
      message: "Daftar evaluasi belajar berhasil diambil.",
      data,
    });
  } catch (err) {
    console.error("GET ALL LEARNING EVALUATIONS ERROR:", err);

    return res.status(500).json({
      message: "Gagal mengambil daftar evaluasi belajar.",
      error: err.message,
    });
  }
});

/* ================================
   SISWA: DETAIL PER PERTEMUAN
================================ */

router.get("/:user_id/:pertemuan", async (req, res) => {
  try {
    const { user_id, pertemuan } = req.params;

    const [rows] = await db.query(
      `SELECT id
       FROM pjbl_learning_evaluations
       WHERE user_id = ?
         AND pertemuan = ?
       LIMIT 1`,
      [Number(user_id), Number(pertemuan)]
    );

    if (rows.length === 0) {
      return res.json({
        message: "Evaluasi belajar belum dibuat.",
        data: null,
      });
    }

    const detail = await getEvaluationDetail(rows[0].id);

    return res.json({
      message: "Detail evaluasi belajar berhasil diambil.",
      data: detail,
    });
  } catch (err) {
    console.error("GET LEARNING EVALUATION DETAIL ERROR:", err);

    return res.status(500).json({
      message: "Gagal mengambil detail evaluasi belajar.",
      error: err.message,
    });
  }
});

module.exports = router;