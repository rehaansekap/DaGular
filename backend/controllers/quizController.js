const db = require("../config/db");

/* ================================
   HELPER AUTO NILAI
================================ */

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAnswerText(answerText) {
  if (!answerText) return "";

  try {
    const parsed = JSON.parse(answerText);

    if (Array.isArray(parsed)) {
      return parsed.join(" ");
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.values(parsed)
        .map((value) => {
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
          }
          return String(value || "");
        })
        .join(" ");
    }

    return String(parsed);
  } catch (error) {
    return String(answerText);
  }
}

function getFieldAnswer(answerText, fieldKey) {
  if (!fieldKey) {
    return parseAnswerText(answerText);
  }

  try {
    const parsed = JSON.parse(answerText);

    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed[fieldKey] || "";
    }

    return String(answerText || "");
  } catch (error) {
    return String(answerText || "");
  }
}

function parseKeywords(keywords) {
  if (!keywords) return [];

  try {
    const parsed = JSON.parse(keywords);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return String(keywords)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function autoGradeAnswer(answerText, rubrics = []) {
  if (!answerText) {
    return {
      score: 0,
      matchedKeywords: [],
      note: "Jawaban kosong.",
      reviewStatus: "revision",
    };
  }

  if (!rubrics || rubrics.length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      note: "Rubrik belum tersedia untuk soal ini.",
      reviewStatus: "needs_review",
    };
  }

  const sortedRubrics = [...rubrics].sort(
    (a, b) => Number(b.score) - Number(a.score)
  );

  for (const rubric of sortedRubrics) {
    const answerSource = getFieldAnswer(answerText, rubric.field_key);
    const answer = normalizeText(answerSource);
    const keywords = parseKeywords(rubric.keywords);

    const matchedKeywords = keywords.filter((keyword) =>
      answer.includes(normalizeText(keyword))
    );

    const minMatch = Number(rubric.min_match || 1);

    if (matchedKeywords.length >= minMatch) {
      return {
        score: Number(rubric.score),
        matchedKeywords,
        note:
          rubric.feedback ||
          `Kata kunci cocok: ${matchedKeywords.join(", ")}.`,
        reviewStatus: "auto_graded",
      };
    }
  }

  return {
    score: 1,
    matchedKeywords: [],
    note: "Jawaban ada, tetapi belum memenuhi kata kunci utama rubrik.",
    reviewStatus: "revision",
  };
}

/* ================================
   HELPER PROGRESS LKPD
================================ */

async function initializeQuestionProgress(userId, pertemuan) {
  const [questions] = await db.promise().query(
    `SELECT id, pertemuan, stage_order
     FROM questions
     WHERE pertemuan = ?
     ORDER BY stage_order ASC`,
    [pertemuan]
  );

  for (const question of questions) {
    const status = Number(question.stage_order) === 1 ? "unlocked" : "locked";

    await db.promise().query(
      `INSERT INTO student_question_progress
        (user_id, pertemuan, question_id, stage_order, status, unlocked_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         stage_order = VALUES(stage_order),
         status = CASE
           WHEN VALUES(stage_order) = 1 AND status = 'locked' THEN 'unlocked'
           ELSE status
         END,
         unlocked_at = CASE
           WHEN VALUES(stage_order) = 1 AND status = 'locked' THEN COALESCE(unlocked_at, NOW())
           ELSE unlocked_at
         END`,
      [
        userId,
        question.pertemuan,
        question.id,
        question.stage_order,
        status,
        status === "unlocked" ? new Date() : null,
      ]
    );
  }
}

async function getOrCreateQuizResult(userId, pertemuan) {
  const [existing] = await db.promise().query(
    `SELECT id
     FROM quiz_results
     WHERE user_id = ? AND pertemuan = ?
     LIMIT 1`,
    [userId, pertemuan]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [questionCountRows] = await db.promise().query(
    `SELECT COUNT(*) AS total
     FROM questions
     WHERE pertemuan = ?`,
    [pertemuan]
  );

  const totalQuestions = questionCountRows[0]?.total || 0;

  const [insertResult] = await db.promise().query(
    `INSERT INTO quiz_results
      (
        user_id,
        pertemuan,
        score,
        auto_total_score,
        final_total_score,
        total_questions,
        completed_questions,
        revision_questions,
        status,
        grading_type
      )
     VALUES (?, ?, 0, 0, 0, ?, 0, 0, 'in_progress', 'auto')`,
    [userId, pertemuan, totalQuestions]
  );

  return insertResult.insertId;
}

async function unlockNextQuestion(userId, pertemuan, currentStageOrder) {
  const [nextRows] = await db.promise().query(
    `SELECT id, stage_order
     FROM questions
     WHERE pertemuan = ?
       AND stage_order > ?
     ORDER BY stage_order ASC
     LIMIT 1`,
    [pertemuan, currentStageOrder]
  );

  if (nextRows.length === 0) {
    return null;
  }

  const nextQuestion = nextRows[0];

  await db.promise().query(
    `INSERT INTO student_question_progress
      (user_id, pertemuan, question_id, stage_order, status, unlocked_at)
     VALUES (?, ?, ?, ?, 'unlocked', NOW())
     ON DUPLICATE KEY UPDATE
       status = CASE
         WHEN status = 'locked' THEN 'unlocked'
         ELSE status
       END,
       unlocked_at = COALESCE(unlocked_at, NOW())`,
    [userId, pertemuan, nextQuestion.id, nextQuestion.stage_order]
  );

  return nextQuestion;
}

async function updateQuizResultSummary(resultId, pertemuan) {
  const [summaryRows] = await db.promise().query(
    `SELECT
       COALESCE(SUM(auto_score), 0) AS auto_total_score,
       COALESCE(SUM(final_score), 0) AS final_total_score,
       SUM(CASE WHEN review_status = 'completed' THEN 1 ELSE 0 END) AS completed_questions,
       SUM(CASE WHEN review_status = 'revision' THEN 1 ELSE 0 END) AS revision_questions,
       SUM(CASE WHEN review_status = 'needs_review' THEN 1 ELSE 0 END) AS needs_review_questions
     FROM quiz_answers
     WHERE result_id = ?
       AND is_latest = 1`,
    [resultId]
  );

  const summary = summaryRows[0];

  const [questionCountRows] = await db.promise().query(
    `SELECT COUNT(*) AS total
     FROM questions
     WHERE pertemuan = ?`,
    [pertemuan]
  );

  const totalQuestions = Number(questionCountRows[0]?.total || 0);
  const completedQuestions = Number(summary.completed_questions || 0);
  const revisionQuestions = Number(summary.revision_questions || 0);
  const needsReviewQuestions = Number(summary.needs_review_questions || 0);

  let resultStatus = "in_progress";

  if (completedQuestions >= totalQuestions && totalQuestions > 0) {
    resultStatus = "completed";
  } else if (needsReviewQuestions > 0) {
    resultStatus = "needs_review";
  } else if (revisionQuestions > 0) {
    resultStatus = "revision";
  }

  await db.promise().query(
    `UPDATE quiz_results
     SET score = ?,
         auto_total_score = ?,
         final_total_score = ?,
         total_questions = ?,
         completed_questions = ?,
         revision_questions = ?,
         status = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [
      summary.final_total_score || 0,
      summary.auto_total_score || 0,
      summary.final_total_score || 0,
      totalQuestions,
      completedQuestions,
      revisionQuestions,
      resultStatus,
      resultId,
    ]
  );

  return {
    auto_total_score: summary.auto_total_score || 0,
    final_total_score: summary.final_total_score || 0,
    total_questions: totalQuestions,
    completed_questions: completedQuestions,
    revision_questions: revisionQuestions,
    needs_review_questions: needsReviewQuestions,
    status: resultStatus,
  };
}

/* ================================
   1. GET SEMUA SOAL / FILTER PERTEMUAN
================================ */

exports.getQuestions = async (req, res) => {
  try {
    const { pertemuan, user_id } = req.query;

    let sql = "";
    const params = [];

    if (user_id) {
      sql = `
        SELECT
          q.*,
          p.status AS progress_status,
          p.latest_score,
          p.attempt_count,
          p.latest_answer_id
        FROM questions q
        LEFT JOIN student_question_progress p
          ON p.question_id = q.id
          AND p.user_id = ?
      `;
      params.push(user_id);
    } else {
      sql = "SELECT q.* FROM questions q";
    }

    if (pertemuan) {
      sql += " WHERE q.pertemuan = ?";
      params.push(pertemuan);
    }

    sql += " ORDER BY q.pertemuan ASC, q.stage_order ASC, q.id ASC";

    const [results] = await db.promise().query(sql, params);

    if (user_id && pertemuan) {
      await initializeQuestionProgress(user_id, pertemuan);

      const [updatedResults] = await db.promise().query(
        `SELECT
          q.*,
          p.status AS progress_status,
          p.latest_score,
          p.attempt_count,
          p.latest_answer_id
        FROM questions q
        LEFT JOIN student_question_progress p
          ON p.question_id = q.id
          AND p.user_id = ?
        WHERE q.pertemuan = ?
        ORDER BY q.pertemuan ASC, q.stage_order ASC, q.id ASC`,
        [user_id, pertemuan]
      );

      return res.json({
        message: "Data soal berhasil diambil",
        data: updatedResults,
      });
    }

    res.json({
      message: "Data soal berhasil diambil",
      data: results,
    });
  } catch (error) {
    console.error("getQuestions error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

/* ================================
   2. TAMBAH SOAL (GURU)
================================ */

exports.createQuestion = async (req, res) => {
  try {
    const {
      question,
      pertemuan,
      stage_order,
      max_score,
      passing_score,
      answer_type,
      pendahuluan_lkpd,
      judul_lkpd,
      answer_fields,
      image_url,
    } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi",
      });
    }

    const [result] = await db.promise().query(
      `INSERT INTO questions
        (
          question,
          pertemuan,
          stage_order,
          max_score,
          passing_score,
          answer_type,
          pendahuluan_lkpd,
          judul_lkpd,
          answer_fields,
          image_url
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question,
        pertemuan,
        stage_order || 1,
        max_score || 4,
        passing_score || 3,
        answer_type || "text",
        pendahuluan_lkpd || null,
        judul_lkpd || null,
        answer_fields || null,
        image_url || null,
      ]
    );

    res.status(201).json({
      message: "Soal berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error("createQuestion error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

/* ================================
   3. UPDATE SOAL
================================ */

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      question,
      pertemuan,
      stage_order,
      max_score,
      passing_score,
      answer_type,
      pendahuluan_lkpd,
      judul_lkpd,
      answer_fields,
      image_url,
    } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE questions
       SET question = ?,
           pertemuan = ?,
           stage_order = COALESCE(?, stage_order),
           max_score = COALESCE(?, max_score),
           passing_score = COALESCE(?, passing_score),
           answer_type = COALESCE(?, answer_type),
           pendahuluan_lkpd = COALESCE(?, pendahuluan_lkpd),
           judul_lkpd = COALESCE(?, judul_lkpd),
           answer_fields = COALESCE(?, answer_fields),
           image_url = COALESCE(?, image_url)
       WHERE id = ?`,
      [
        question,
        pertemuan,
        stage_order ?? null,
        max_score ?? null,
        passing_score ?? null,
        answer_type ?? null,
        pendahuluan_lkpd ?? null,
        judul_lkpd ?? null,
        answer_fields ?? null,
        image_url ?? null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Soal tidak ditemukan",
      });
    }

    res.json({
      message: "Soal berhasil diupdate",
    });
  } catch (error) {
    console.error("updateQuestion error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
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
        message: "Soal tidak ditemukan",
      });
    }

    res.json({
      message: "Soal berhasil dihapus",
    });
  } catch (error) {
    console.error("deleteQuestion error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

/* ================================
   5. SUBMIT JAWABAN SISWA
   Sekarang submit per 1 soal, bukan semua soal.
================================ */

exports.submitQuiz = async (req, res) => {
  try {
    let { user_id, pertemuan, question_id, answer_text, answer_image, answers } = req.body;

    if (!question_id && Array.isArray(answers) && answers.length === 1) {
      question_id = answers[0].question_id;
      answer_text = answers[0].answer_text;
      answer_image = answers[0].answer_image;
    }

    if (Array.isArray(answers) && answers.length > 1) {
      return res.status(400).json({
        message:
          "Submit sekarang dilakukan per satu soal. Kirim hanya satu question_id dan satu answer_text.",
      });
    }

    if (!user_id || !pertemuan || !question_id) {
      return res.status(400).json({
        message: "user_id, pertemuan, dan question_id wajib diisi",
      });
    }

    await initializeQuestionProgress(user_id, pertemuan);

    const [questionRows] = await db.promise().query(
      `SELECT
         id,
         pertemuan,
         stage_order,
         passing_score,
         max_score,
         question
       FROM questions
       WHERE id = ?
         AND pertemuan = ?
       LIMIT 1`,
      [question_id, pertemuan]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({
        message: "Soal tidak ditemukan pada pertemuan ini",
      });
    }

    const question = questionRows[0];

    const [progressRows] = await db.promise().query(
      `SELECT *
       FROM student_question_progress
       WHERE user_id = ?
         AND question_id = ?
       LIMIT 1`,
      [user_id, question_id]
    );

    if (progressRows.length === 0) {
      return res.status(400).json({
        message: "Progress soal belum tersedia",
      });
    }

    const progress = progressRows[0];

    if (progress.status === "locked") {
      return res.status(403).json({
        message: "Soal ini masih terkunci. Selesaikan soal sebelumnya terlebih dahulu.",
      });
    }

    if (progress.status === "completed") {
      return res.status(400).json({
        message: "Soal ini sudah selesai dan tidak perlu dikirim ulang.",
      });
    }

    const resultId = await getOrCreateQuizResult(user_id, pertemuan);

    const [rubrics] = await db.promise().query(
      `SELECT *
       FROM question_rubrics
       WHERE question_id = ?
       ORDER BY score DESC`,
      [question_id]
    );

    const grade = autoGradeAnswer(answer_text || "", rubrics);

    const passingScore = Number(question.passing_score || 3);
    const finalScore = Number(grade.score || 0);

    let answerStatus = "revision";

    if (grade.reviewStatus === "needs_review") {
      answerStatus = "needs_review";
    } else if (finalScore >= passingScore) {
      answerStatus = "completed";
    } else {
      answerStatus = "revision";
    }

    const [attemptRows] = await db.promise().query(
      `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt
       FROM quiz_answers
       WHERE result_id = ?
         AND question_id = ?`,
      [resultId, question_id]
    );

    const attemptNumber = attemptRows[0]?.next_attempt || 1;

    await db.promise().query(
      `UPDATE quiz_answers
       SET is_latest = 0
       WHERE result_id = ?
         AND question_id = ?`,
      [resultId, question_id]
    );

    const [answerInsert] = await db.promise().query(
      `INSERT INTO quiz_answers
        (
          result_id,
          question_id,
          attempt_number,
          answer_text,
          answer_image,
          auto_score,
          final_score,
          auto_note,
          matched_keywords,
          grading_type,
          review_status,
          is_latest,
          score
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'auto', ?, 1, ?)`,
      [
        resultId,
        question_id,
        attemptNumber,
        answer_text || "",
        answer_image || null,
        finalScore,
        finalScore,
        grade.note,
        JSON.stringify(grade.matchedKeywords || []),
        answerStatus,
        finalScore,
      ]
    );

    const answerId = answerInsert.insertId;

    await db.promise().query(
      `UPDATE student_question_progress
       SET status = ?,
           latest_answer_id = ?,
           latest_score = ?,
           attempt_count = ?,
           submitted_at = NOW(),
           completed_at = CASE
             WHEN ? = 'completed' THEN NOW()
             ELSE completed_at
           END
       WHERE user_id = ?
         AND question_id = ?`,
      [
        answerStatus,
        answerId,
        finalScore,
        attemptNumber,
        answerStatus,
        user_id,
        question_id,
      ]
    );

    let nextQuestion = null;

    if (answerStatus === "completed") {
      nextQuestion = await unlockNextQuestion(
        user_id,
        pertemuan,
        question.stage_order
      );
    }

    const resultSummary = await updateQuizResultSummary(resultId, pertemuan);

    res.status(201).json({
      message:
        answerStatus === "completed"
          ? "Jawaban berhasil. Skor minimal tercapai, soal berikutnya terbuka."
          : answerStatus === "needs_review"
          ? "Jawaban tersimpan, tetapi perlu dicek guru karena rubrik belum tersedia."
          : "Jawaban tersimpan, tetapi perlu revisi. Perbaiki jawaban agar mendapat skor minimal 3.",
      data: {
        result_id: resultId,
        answer_id: answerId,
        question_id,
        score: finalScore,
        passing_score: passingScore,
        status: answerStatus,
        auto_note: grade.note,
        matched_keywords: grade.matchedKeywords || [],
        attempt_number: attemptNumber,
        next_question: nextQuestion,
        result_summary: resultSummary,
      },
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

/* ================================
   6. GET SEMUA HASIL QUIZ UNTUK GURU
================================ */

exports.getAllResults = async (req, res) => {
  try {
    const [results] = await db.promise().query(
      `SELECT
          qr.id,
          qr.user_id,
          qr.pertemuan,
          qr.score,
          qr.auto_total_score,
          qr.final_total_score,
          qr.total_questions,
          qr.completed_questions,
          qr.revision_questions,
          qr.status,
          qr.grading_type,
          qr.created_at,
          qr.updated_at,
          u.name AS student_name
       FROM quiz_results qr
       LEFT JOIN users u ON qr.user_id = u.id
       ORDER BY qr.created_at DESC`
    );

    res.json({
      message: "Data hasil quiz berhasil diambil",
      data: results,
    });
  } catch (error) {
    console.error("getAllResults error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
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
          qr.auto_total_score,
          qr.final_total_score,
          qr.total_questions,
          qr.completed_questions,
          qr.revision_questions,
          qr.status,
          qr.grading_type,
          qr.created_at,
          qr.updated_at,
          u.name AS student_name
       FROM quiz_results qr
       LEFT JOIN users u ON qr.user_id = u.id
       WHERE qr.id = ?`,
      [id]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({
        message: "Hasil quiz tidak ditemukan",
      });
    }

    const [answers] = await db.promise().query(
      `SELECT
          qa.id,
          qa.question_id,
          q.question,
          q.stage_order,
          q.passing_score,
          q.max_score,
          qa.attempt_number,
          qa.answer_text,
          qa.answer_image,
          qa.score,
          qa.auto_score,
          qa.final_score,
          qa.auto_note,
          qa.matched_keywords,
          qa.grading_type,
          qa.review_status,
          qa.teacher_note,
          qa.is_latest,
          qa.created_at
       FROM quiz_answers qa
       JOIN questions q ON qa.question_id = q.id
       WHERE qa.result_id = ?
         AND qa.is_latest = 1
       ORDER BY q.stage_order ASC, qa.id ASC`,
      [id]
    );

    res.json({
      message: "Detail hasil quiz berhasil diambil",
      data: {
        result: resultRows[0],
        answers,
      },
    });
  } catch (error) {
    console.error("getResultDetail error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

/* ================================
   8. GURU KOREKSI NILAI JAWABAN
================================ */

exports.gradeQuiz = async (req, res) => {
  try {
    const resultId = req.params.result_id || req.params.id;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Data penilaian tidak valid",
      });
    }

    const [resultRows] = await db.promise().query(
      `SELECT id, user_id, pertemuan
       FROM quiz_results
       WHERE id = ?
       LIMIT 1`,
      [resultId]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({
        message: "Hasil quiz tidak ditemukan",
      });
    }

    const quizResult = resultRows[0];

    for (const item of answers) {
      const score = Number(item.score ?? item.final_score) || 0;
      const teacherNote = item.teacher_note || null;

      const [answerRows] = await db.promise().query(
        `SELECT
           qa.id,
           qa.question_id,
           q.stage_order,
           q.passing_score
         FROM quiz_answers qa
         JOIN questions q ON qa.question_id = q.id
         WHERE qa.id = ?
           AND qa.result_id = ?
         LIMIT 1`,
        [item.answer_id, resultId]
      );

      if (answerRows.length === 0) {
        continue;
      }

      const answer = answerRows[0];
      const passingScore = Number(answer.passing_score || 3);
      const reviewStatus = score >= passingScore ? "completed" : "revision";

      await db.promise().query(
        `UPDATE quiz_answers
         SET score = ?,
             final_score = ?,
             teacher_note = ?,
             grading_type = 'teacher',
             review_status = ?
         WHERE id = ?
           AND result_id = ?`,
        [score, score, teacherNote, reviewStatus, item.answer_id, resultId]
      );

      await db.promise().query(
        `UPDATE student_question_progress
         SET status = ?,
             latest_score = ?,
             completed_at = CASE
               WHEN ? = 'completed' THEN NOW()
               ELSE completed_at
             END
         WHERE user_id = ?
           AND question_id = ?`,
        [
          reviewStatus,
          score,
          reviewStatus,
          quizResult.user_id,
          answer.question_id,
        ]
      );

      if (reviewStatus === "completed") {
        await unlockNextQuestion(
          quizResult.user_id,
          quizResult.pertemuan,
          answer.stage_order
        );
      }
    }

    const summary = await updateQuizResultSummary(resultId, quizResult.pertemuan);

    await db.promise().query(
      `UPDATE quiz_results
       SET grading_type = 'teacher',
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [resultId]
    );

    res.json({
      message: "Koreksi guru berhasil disimpan",
      total_score: summary.final_total_score,
      data: summary,
    });
  } catch (error) {
    console.error("gradeQuiz error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
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
          auto_total_score,
          final_total_score,
          total_questions,
          completed_questions,
          revision_questions,
          status,
          grading_type,
          created_at,
          updated_at
       FROM quiz_results
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({
      message: "Data hasil quiz siswa berhasil diambil",
      data: results,
    });
  } catch (error) {
    console.error("getMyResults error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};