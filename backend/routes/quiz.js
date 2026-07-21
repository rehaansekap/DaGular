const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================================
   UPLOAD GAMBAR QUIZ
================================ */

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
      url: `http://localhost:5000/uploads/quiz/${req.file.filename}`,
    });
  } catch (err) {
    console.error("UPLOAD QUIZ ERROR:", err);
    return res.status(500).json({ message: "Upload gambar gagal" });
  }
});

/* ================================
   HELPER UMUM
================================ */

function normalizeText(text = "") {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(key = "") {
  return normalizeText(key).replace(/\s+/g, "_");
}

function normalizeFieldLabelKey(key = "") {
  return normalizeKey(String(key || "").replace(/^\s*\d+[).:-]\s*/, ""));
}

function safeJsonParse(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toNumberOrDefault(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? defaultValue : numberValue;
}

function valueToPlainText(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map(valueToPlainText).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(valueToPlainText).join(" ");
  }

  return String(value);
}

function parseAnswerText(answerText) {
  if (!answerText) return "";

  const parsed = safeJsonParse(answerText);

  if (!parsed) return String(answerText || "");

  return valueToPlainText(parsed);
}

function getFieldAnswer(answerText, fieldKey) {
  if (!answerText) return "";

  const parsed = safeJsonParse(answerText);

  if (!fieldKey) {
    return parseAnswerText(answerText);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parseAnswerText(answerText);
  }

  if (parsed[fieldKey] !== undefined) {
    return valueToPlainText(parsed[fieldKey]);
  }

  const targetKey = normalizeFieldLabelKey(fieldKey);

  const foundKey = Object.keys(parsed).find((key) => {
    return normalizeFieldLabelKey(key) === targetKey;
  });

  if (!foundKey) return "";

  return valueToPlainText(parsed[foundKey]);
}

function parseKeywords(keywords) {
  if (!keywords) return [];

  const parsed = safeJsonParse(keywords);

  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(keywords)
    .split(/[,;\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeKeywordsForStorage(keywords) {
  return parseKeywords(keywords);
}

function keywordMatches(answerText, keyword) {
  const answer = normalizeText(answerText);
  const key = normalizeText(keyword);

  if (!answer || !key) return false;

  if (answer.includes(key)) return true;

  const keywordWords = key
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);

  if (keywordWords.length <= 1) return false;

  return keywordWords.every((word) => answer.includes(word));
}

function groupRubricsByField(rubrics = []) {
  const grouped = {};

  rubrics.forEach((rubric) => {
    const fieldKey = normalizeFieldLabelKey(rubric.field_key || "jawaban");

    if (!grouped[fieldKey]) grouped[fieldKey] = [];

    grouped[fieldKey].push({
      ...rubric,
      field_key: fieldKey,
    });
  });

  return grouped;
}

/* ================================
   HELPER FEEDBACK DETAIL
================================ */

function formatReadableFieldName(value = "jawaban") {
  return String(value || "jawaban")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function uniqueKeywordList(keywords = []) {
  const seen = new Set();
  const result = [];

  keywords.forEach((keyword) => {
    const cleanKeyword = String(keyword || "").trim();
    const key = normalizeText(cleanKeyword);

    if (!cleanKeyword || !key || seen.has(key)) return;

    seen.add(key);
    result.push(cleanKeyword);
  });

  return result;
}

function limitKeywords(keywords = [], limit = 6) {
  return uniqueKeywordList(keywords).slice(0, limit);
}

function getExpectedKeywordsFromRubrics(fieldRubrics = []) {
  const rubricsWithKeywords = fieldRubrics.filter((rubric) => {
    return parseKeywords(rubric.keywords).length > 0;
  });

  if (rubricsWithKeywords.length === 0) return [];

  const highestScore = Math.max(
    ...rubricsWithKeywords.map((rubric) => Number(rubric.score) || 0)
  );

  const topKeywords = rubricsWithKeywords
    .filter((rubric) => Number(rubric.score) === highestScore)
    .flatMap((rubric) => parseKeywords(rubric.keywords));

  const allKeywords = rubricsWithKeywords.flatMap((rubric) =>
    parseKeywords(rubric.keywords)
  );

  return uniqueKeywordList(topKeywords.length > 0 ? topKeywords : allKeywords);
}

function getMissingKeywords(answerText, expectedKeywords = []) {
  return uniqueKeywordList(expectedKeywords).filter((keyword) => {
    return !keywordMatches(answerText, keyword);
  });
}

function buildRevisionSuggestion({
  fieldKey,
  missingKeywords = [],
  score = 0,
  passingScore = 3,
}) {
  const fieldName = formatReadableFieldName(fieldKey);
  const limitedMissing = limitKeywords(missingKeywords, 5);

  if (limitedMissing.length > 0) {
    return `Perbaiki bagian ${fieldName} dengan menambahkan unsur: ${limitedMissing.join(
      ", "
    )}. Jelaskan menggunakan kalimat sendiri, jangan hanya menulis kata kunci.`;
  }

  if (Number(score) < Number(passingScore)) {
    return `Perjelas bagian ${fieldName}. Tambahkan alasan, contoh, atau hubungan jawaban dengan tugas desain yang sedang dikerjakan.`;
  }

  return `Bagian ${fieldName} sudah cukup. Jawaban dapat dibuat lebih kuat dengan penjelasan yang lebih rinci.`;
}

function buildDetailedFieldNote({
  fieldKey,
  score,
  passingScore,
  matchedKeywords = [],
  missingKeywords = [],
  rubricFeedback = "",
}) {
  const fieldName = formatReadableFieldName(fieldKey);
  const matched = limitKeywords(matchedKeywords, 5);
  const missing = limitKeywords(missingKeywords, 6);

  if (Number(score) >= Number(passingScore)) {
    if (missing.length > 0) {
      return `${fieldName} sudah memenuhi nilai minimal. Jawaban sudah memuat unsur ${matched.join(
        ", "
      )}. Agar lebih lengkap, kamu masih bisa menambahkan unsur ${missing.join(
        ", "
      )}.`;
    }

    return (
      rubricFeedback ||
      `${fieldName} sudah sesuai dengan kriteria penilaian.`
    );
  }

  if (matched.length === 0) {
    if (missing.length > 0) {
      return `${fieldName} masih perlu revisi. Sistem belum menemukan unsur utama yang diminta. Tambahkan unsur ${missing.join(
        ", "
      )}.`;
    }

    return `${fieldName} masih perlu revisi. Jawaban belum menunjukkan unsur yang sesuai dengan rubrik.`;
  }

  if (missing.length > 0) {
    return `${fieldName} sudah memuat unsur ${matched.join(
      ", "
    )}, tetapi masih kurang pada unsur ${missing.join(", ")}.`;
  }

  return (
    rubricFeedback ||
    `${fieldName} sudah memiliki sebagian unsur yang sesuai, tetapi penjelasannya masih perlu diperjelas.`
  );
}

/* ================================
   HELPER GAMBAR
================================ */

function extractFirstImageUrl(answerText) {
  const parsed = safeJsonParse(answerText);

  if (!parsed) return null;

  const findImage = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      const cleanValue = value.trim();

      if (
        cleanValue.startsWith("http") ||
        cleanValue.includes("/uploads/") ||
        cleanValue.includes("uploads/")
      ) {
        return cleanValue;
      }

      return null;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findImage(item);
        if (found) return found;
      }
    }

    if (typeof value === "object") {
      if (value.image_url) return value.image_url;
      if (value.answer_image) return value.answer_image;
      if (value.url) return value.url;

      for (const item of Object.values(value)) {
        const found = findImage(item);
        if (found) return found;
      }
    }

    return null;
  };

  return findImage(parsed);
}

function hasUploadedImage(answerText) {
  return Boolean(extractFirstImageUrl(answerText));
}

function hasMeaningfulAnswer(answerText, answerType = "text") {
  if (!answerText || !String(answerText).trim()) return false;

  if (answerType === "image") {
    return hasUploadedImage(answerText);
  }

  if (answerType === "text_image") {
    return (
      normalizeText(parseAnswerText(answerText)) !== "" &&
      hasUploadedImage(answerText)
    );
  }

  return normalizeText(parseAnswerText(answerText)) !== "";
}

/* ================================
   HELPER NON NILAI / SELF REFLECTION
================================ */

function isNonGradedQuestion(question = {}) {
  const rawMaxScore = question.max_score;
  const rawPassingScore = question.passing_score;

  const hasMaxScore =
    rawMaxScore !== undefined && rawMaxScore !== null && rawMaxScore !== "";
  const hasPassingScore =
    rawPassingScore !== undefined &&
    rawPassingScore !== null &&
    rawPassingScore !== "";

  const maxScore = Number(rawMaxScore);
  const passingScore = Number(rawPassingScore);
  const questionText = normalizeText(question.question || "");

  return (
    (hasMaxScore && maxScore === 0) ||
    (hasPassingScore && passingScore === 0) ||
    questionText.includes("self reflection") ||
    questionText.includes("self-reflection") ||
    questionText.includes("refleksi")
  );
}

function getPassingScore(question = {}) {
  if (isNonGradedQuestion(question)) return 0;
  return toNumberOrDefault(question.passing_score, 3);
}

function getMaxScore(question = {}) {
  if (isNonGradedQuestion(question)) return 0;
  return toNumberOrDefault(question.max_score, 4);
}

/* ================================
   HELPER AUTO NILAI
================================ */

function gradeImageAnswer(answerText, maxScore = 4) {
  const imageUploaded = hasUploadedImage(answerText);

  if (!imageUploaded) {
    return {
      score: 0,
      matchedKeywords: [],
      note: "Gambar jawaban belum diupload.",
      reviewStatus: "revision",
      isPassed: false,
      canContinue: false,
      fieldResults: [
        {
          fieldKey: "gambar_jawaban",
          score: 0,
          matchedKeywords: [],
          missingKeywords: ["upload gambar jawaban"],
          note: "Siswa belum mengupload gambar jawaban.",
          suggestion: "Upload gambar jawaban terlebih dahulu agar sistem dapat menyimpan jawaban.",
          reviewStatus: "revision",
          isPassed: false,
        },
      ],
    };
  }

  return {
    score: maxScore,
    matchedKeywords: [],
    note: "Gambar jawaban sudah diupload.",
    reviewStatus: "auto_graded_passed",
    isPassed: true,
    canContinue: true,
    fieldResults: [
      {
        fieldKey: "gambar_jawaban",
        score: maxScore,
        matchedKeywords: ["gambar sudah diupload"],
        missingKeywords: [],
        note: "Gambar jawaban sudah diupload.",
        suggestion: "Jawaban gambar sudah tersimpan.",
        reviewStatus: "auto_graded_passed",
        isPassed: true,
      },
    ],
  };
}

function gradeSingleField(
  answerText,
  fieldKey,
  fieldRubrics = [],
  passingScore = 3
) {
  const answerSource = getFieldAnswer(answerText, fieldKey);
  const normalizedAnswer = normalizeText(answerSource);
  const expectedKeywords = getExpectedKeywordsFromRubrics(fieldRubrics);
  const missingKeywordsFromExpected = getMissingKeywords(
    answerSource,
    expectedKeywords
  );

  if (!normalizedAnswer) {
    return {
      fieldKey,
      score: 0,
      matchedKeywords: [],
      missingKeywords: limitKeywords(expectedKeywords, 8),
      note: "Jawaban pada bagian ini masih kosong.",
      suggestion: buildRevisionSuggestion({
        fieldKey,
        missingKeywords: expectedKeywords,
        score: 0,
        passingScore,
      }),
      reviewStatus: "revision",
      isPassed: false,
    };
  }

  if (!fieldRubrics || fieldRubrics.length === 0) {
    return {
      fieldKey,
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      note: "Rubrik untuk bagian ini belum tersedia.",
      suggestion:
        "Guru perlu melengkapi rubrik agar sistem dapat memberi feedback otomatis yang lebih jelas.",
      reviewStatus: "needs_review",
      isPassed: false,
    };
  }

  const sortedRubrics = [...fieldRubrics].sort((a, b) => {
    const scoreDiff = Number(b.score) - Number(a.score);
    if (scoreDiff !== 0) return scoreDiff;

    return Number(b.min_match || 1) - Number(a.min_match || 1);
  });

  let bestPartialMatch = {
    fieldKey,
    score: 0,
    matchedKeywords: [],
    missingKeywords: missingKeywordsFromExpected,
    note: buildDetailedFieldNote({
      fieldKey,
      score: 0,
      passingScore,
      matchedKeywords: [],
      missingKeywords: missingKeywordsFromExpected,
    }),
    suggestion: buildRevisionSuggestion({
      fieldKey,
      missingKeywords: missingKeywordsFromExpected,
      score: 0,
      passingScore,
    }),
    reviewStatus: "revision",
    isPassed: false,
  };

  for (const rubric of sortedRubrics) {
    const keywords = parseKeywords(rubric.keywords);

    if (keywords.length === 0) continue;

    const matchedKeywords = keywords.filter((keyword) => {
      return keywordMatches(answerSource, keyword);
    });

    const minMatch = Math.max(1, Number(rubric.min_match) || 1);
    const score = Number(rubric.score) || 0;
    const rubricMatched = matchedKeywords.length >= minMatch;

    const missingKeywords =
      expectedKeywords.length > 0
        ? getMissingKeywords(answerSource, expectedKeywords)
        : getMissingKeywords(answerSource, keywords);

    const candidateScore = rubricMatched ? score : 0;
    const candidatePassed = rubricMatched && candidateScore >= passingScore;

    const candidate = {
      fieldKey,
      score: candidateScore,
      matchedKeywords,
      missingKeywords,
      note: buildDetailedFieldNote({
        fieldKey,
        score: candidateScore,
        passingScore,
        matchedKeywords,
        missingKeywords,
        rubricFeedback: rubric.feedback || "",
      }),
      suggestion: buildRevisionSuggestion({
        fieldKey,
        missingKeywords,
        score: candidateScore,
        passingScore,
      }),
      reviewStatus: candidatePassed ? "auto_graded_passed" : "revision",
      isPassed: candidatePassed,
    };

    const currentBestMatchCount = bestPartialMatch.matchedKeywords.length;
    const candidateMatchCount = candidate.matchedKeywords.length;

    if (
      candidateMatchCount > currentBestMatchCount ||
      (candidateMatchCount === currentBestMatchCount &&
        Number(candidate.score) > Number(bestPartialMatch.score))
    ) {
      bestPartialMatch = candidate;
    }

    if (rubricMatched) {
      return candidate;
    }
  }

  return bestPartialMatch;
}

function autoGradeAnswer(answerText, rubrics = [], options = {}) {
  const passingScore = Number(options.passingScore) || 3;
  const maxScore = Number(options.maxScore) || 4;
  const answerType = options.answerType || "text";

  if (answerType === "image") {
    return gradeImageAnswer(answerText, maxScore);
  }

  if (!answerText || !String(answerText).trim()) {
    return {
      score: 0,
      matchedKeywords: [],
      note: "Jawaban kosong.",
      reviewStatus: "revision",
      isPassed: false,
      canContinue: false,
      fieldResults: [],
    };
  }

  if (answerType === "text_image" && !hasUploadedImage(answerText)) {
    return {
      score: 0,
      matchedKeywords: [],
      note: "Jawaban teks dan gambar diperlukan. Gambar jawaban belum diupload.",
      reviewStatus: "revision",
      isPassed: false,
      canContinue: false,
      fieldResults: [
        {
          fieldKey: "gambar_jawaban",
          score: 0,
          matchedKeywords: [],
          missingKeywords: ["upload gambar jawaban"],
          note: "Siswa belum mengupload gambar jawaban.",
          suggestion:
            "Upload gambar jawaban terlebih dahulu, lalu pastikan teks jawaban juga sudah diisi.",
          reviewStatus: "revision",
          isPassed: false,
        },
      ],
    };
  }

  if (!rubrics || rubrics.length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      note: "Rubrik belum tersedia untuk soal ini.",
      reviewStatus: "needs_review",
      isPassed: false,
      canContinue: false,
      fieldResults: [],
    };
  }

  const rubricsByField = groupRubricsByField(rubrics);

  const fieldResults = Object.entries(rubricsByField).map(
    ([fieldKey, fieldRubrics]) => {
      return gradeSingleField(answerText, fieldKey, fieldRubrics, passingScore);
    }
  );

  const finalScore =
    fieldResults.length > 0
      ? Math.min(...fieldResults.map((item) => Number(item.score) || 0))
      : 0;

  const allFieldsPassed =
    fieldResults.length > 0 &&
    fieldResults.every((item) => Number(item.score) >= passingScore);

  const allMatchedKeywords = fieldResults.flatMap((item) => {
    return item.matchedKeywords || [];
  });

  const allMissingKeywords = fieldResults.flatMap((item) => {
    return item.missingKeywords || [];
  });

  const note = fieldResults
    .map((item) => {
      const fieldName = formatReadableFieldName(item.fieldKey || "jawaban");
      return `${fieldName}: nilai ${item.score}. ${item.note}`;
    })
    .join("\n");

  return {
    score: finalScore,
    matchedKeywords: allMatchedKeywords,
    missingKeywords: allMissingKeywords,
    note,
    reviewStatus: allFieldsPassed ? "auto_graded_passed" : "revision",
    isPassed: allFieldsPassed,
    canContinue: allFieldsPassed,
    fieldResults,
  };
}

async function gradeQuestionAnswer(question, answerText) {
  const passingScore = getPassingScore(question);
  const maxScore = getMaxScore(question);
  const answerType = question.answer_type || "text";
  const nonGraded = isNonGradedQuestion(question);
  const isRequired = Number(question.is_required) !== 0;
  const answered = hasMeaningfulAnswer(answerText, answerType);

  if (nonGraded) {
    if (isRequired && !answered) {
      return {
        score: 0,
        matchedKeywords: [],
        missingKeywords: [],
        note: "Bagian refleksi wajib diisi, tetapi tidak masuk penilaian.",
        reviewStatus: "revision",
        isPassed: false,
        canContinue: false,
        fieldResults: [
          {
            fieldKey: "self_reflection",
            score: 0,
            matchedKeywords: [],
            missingKeywords: ["isi refleksi"],
            note: "Refleksi belum diisi.",
            suggestion: "Isi refleksi berdasarkan pengalaman belajar yang kamu rasakan.",
            reviewStatus: "not_graded",
            isPassed: false,
          },
        ],
      };
    }

    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      note: answered
        ? "Refleksi berhasil disimpan. Bagian ini tidak masuk penilaian."
        : "Refleksi dilewati. Bagian ini tidak masuk penilaian.",
      reviewStatus: "not_graded",
      isPassed: true,
      canContinue: true,
      fieldResults: [
        {
          fieldKey: "self_reflection",
          score: 0,
          matchedKeywords: answered ? ["refleksi sudah diisi"] : [],
          missingKeywords: [],
          note: answered
            ? "Refleksi sudah diisi dan tersimpan."
            : "Refleksi tidak diisi karena bagian ini opsional.",
          suggestion: "Bagian ini tidak masuk penilaian.",
          reviewStatus: "not_graded",
          isPassed: true,
        },
      ],
    };
  }

  const [rubrics] = await db.query(
    `SELECT id, question_id, field_key, score, min_match, keywords, feedback
     FROM question_rubrics
     WHERE question_id = ?
     ORDER BY field_key ASC, score DESC, min_match DESC`,
    [Number(question.id)]
  );

  return autoGradeAnswer(answerText || "", rubrics || [], {
    passingScore,
    maxScore,
    answerType,
  });
}

/* ================================
   HELPER PROGRESS LKPD
================================ */

async function initializeQuestionProgress(userId, pertemuan) {
  const [questions] = await db.query(
    `SELECT id, pertemuan, stage_order
     FROM questions
     WHERE pertemuan = ?
     ORDER BY stage_order ASC, id ASC`,
    [Number(pertemuan)]
  );

  for (const question of questions) {
    const status = Number(question.stage_order) === 1 ? "unlocked" : "locked";
    const unlockedAt = status === "unlocked" ? new Date() : null;

    await db.query(
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
        Number(userId),
        Number(question.pertemuan),
        Number(question.id),
        Number(question.stage_order),
        status,
        unlockedAt,
      ]
    );
  }
}

async function updateStudentProgress({
  userId,
  pertemuan,
  questionId,
  stageOrder,
  score,
  passed,
  feedback,
  fieldResults,
}) {
  const finalStatus = passed ? "completed" : "unlocked";
  const completedAt = passed ? new Date() : null;

  const [existing] = await db.query(
    `SELECT id
     FROM student_question_progress
     WHERE user_id = ?
       AND pertemuan = ?
       AND question_id = ?
     LIMIT 1`,
    [Number(userId), Number(pertemuan), Number(questionId)]
  );

  if (existing.length > 0) {
    await db.query(
      `UPDATE student_question_progress
       SET status = ?,
           latest_score = ?,
           attempt_count = attempt_count + 1,
           submitted_at = NOW(),
           completed_at = ?,
           feedback = ?,
           field_results = ?
       WHERE user_id = ?
         AND pertemuan = ?
         AND question_id = ?`,
      [
        finalStatus,
        Number(score) || 0,
        completedAt,
        feedback || "",
        JSON.stringify(fieldResults || []),
        Number(userId),
        Number(pertemuan),
        Number(questionId),
      ]
    );
  } else {
    await db.query(
      `INSERT INTO student_question_progress
        (
          user_id,
          pertemuan,
          question_id,
          stage_order,
          status,
          latest_score,
          attempt_count,
          unlocked_at,
          submitted_at,
          completed_at,
          feedback,
          field_results
        )
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW(), ?, ?, ?)`,
      [
        Number(userId),
        Number(pertemuan),
        Number(questionId),
        Number(stageOrder),
        finalStatus,
        Number(score) || 0,
        completedAt,
        feedback || "",
        JSON.stringify(fieldResults || []),
      ]
    );
  }
}

async function unlockNextQuestion(userId, pertemuan, currentStageOrder) {
  const [nextRows] = await db.query(
    `SELECT id, stage_order, question
     FROM questions
     WHERE pertemuan = ?
       AND stage_order > ?
     ORDER BY stage_order ASC, id ASC
     LIMIT 1`,
    [Number(pertemuan), Number(currentStageOrder)]
  );

  if (nextRows.length === 0) return null;

  const nextQuestion = nextRows[0];

  await db.query(
    `INSERT INTO student_question_progress
      (user_id, pertemuan, question_id, stage_order, status, unlocked_at)
     VALUES (?, ?, ?, ?, 'unlocked', NOW())
     ON DUPLICATE KEY UPDATE
       status = CASE
         WHEN status = 'locked' THEN 'unlocked'
         ELSE status
       END,
       unlocked_at = COALESCE(unlocked_at, NOW())`,
    [
      Number(userId),
      Number(pertemuan),
      Number(nextQuestion.id),
      Number(nextQuestion.stage_order),
    ]
  );

  return nextQuestion;
}

async function getGradedQuestionCount(pertemuan) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM questions
     WHERE pertemuan = ?
       AND COALESCE(max_score, 4) > 0
       AND COALESCE(passing_score, 3) > 0`,
    [Number(pertemuan)]
  );

  return Number(rows[0]?.total || 0);
}

async function getOrCreateQuizResult(userId, pertemuan) {
  const [existing] = await db.query(
    `SELECT id
     FROM quiz_results
     WHERE user_id = ?
       AND pertemuan = ?
     LIMIT 1`,
    [Number(userId), Number(pertemuan)]
  );

  if (existing.length > 0) return existing[0].id;

  const totalQuestions = await getGradedQuestionCount(pertemuan);

  const [insertResult] = await db.query(
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
    [Number(userId), Number(pertemuan), totalQuestions]
  );

  return insertResult.insertId;
}

async function updateQuizResultSummary(resultId, pertemuan) {
  const totalQuestions = await getGradedQuestionCount(pertemuan);

  const [summaryRows] = await db.query(
    `SELECT
       COALESCE(SUM(CASE
         WHEN COALESCE(q.max_score, 4) > 0
          AND COALESCE(q.passing_score, 3) > 0
         THEN COALESCE(qa.auto_score, 0) ELSE 0 END), 0) AS auto_raw_total_score,

       COALESCE(SUM(CASE
         WHEN COALESCE(q.max_score, 4) > 0
          AND COALESCE(q.passing_score, 3) > 0
         THEN COALESCE(qa.final_score, 0) ELSE 0 END), 0) AS final_raw_total_score,

       COUNT(CASE
         WHEN COALESCE(q.max_score, 4) > 0
          AND COALESCE(q.passing_score, 3) > 0
         THEN 1 END) AS graded_answer_count,

       SUM(CASE
         WHEN COALESCE(q.max_score, 4) > 0
          AND COALESCE(q.passing_score, 3) > 0
          AND qa.review_status = 'completed'
         THEN 1 ELSE 0 END) AS completed_questions,

       SUM(CASE
         WHEN COALESCE(q.max_score, 4) > 0
          AND COALESCE(q.passing_score, 3) > 0
          AND qa.review_status = 'revision'
         THEN 1 ELSE 0 END) AS revision_questions,

       SUM(CASE
         WHEN COALESCE(q.max_score, 4) > 0
          AND COALESCE(q.passing_score, 3) > 0
          AND qa.review_status = 'needs_review'
         THEN 1 ELSE 0 END) AS needs_review_questions
     FROM quiz_answers qa
     JOIN questions q ON qa.question_id = q.id
     WHERE qa.result_id = ?
       AND qa.is_latest = 1`,
    [Number(resultId)]
  );

  const summary = summaryRows[0] || {};

  const autoRawTotalScore = Number(summary.auto_raw_total_score || 0);
  const finalRawTotalScore = Number(summary.final_raw_total_score || 0);

  const completedQuestions = Number(summary.completed_questions || 0);
  const revisionQuestions = Number(summary.revision_questions || 0);
  const needsReviewQuestions = Number(summary.needs_review_questions || 0);
  const gradedAnswerCount = Number(summary.graded_answer_count || 0);

  const denominator = totalQuestions > 0 ? totalQuestions : gradedAnswerCount;

  const autoAverageScore =
    denominator > 0 ? Number((autoRawTotalScore / denominator).toFixed(2)) : 0;

  const finalAverageScore =
    denominator > 0
      ? Number((finalRawTotalScore / denominator).toFixed(2))
      : 0;

  let resultStatus = "in_progress";

  if (totalQuestions > 0 && completedQuestions >= totalQuestions) {
    resultStatus = "completed";
  } else if (needsReviewQuestions > 0) {
    resultStatus = "needs_review";
  } else if (revisionQuestions > 0) {
    resultStatus = "revision";
  }

  await db.query(
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
      finalAverageScore,
      autoAverageScore,
      finalAverageScore,
      totalQuestions,
      completedQuestions,
      revisionQuestions,
      resultStatus,
      Number(resultId),
    ]
  );

  return {
    raw_total_score: finalRawTotalScore,
    auto_raw_total_score: autoRawTotalScore,
    score: finalAverageScore,
    auto_total_score: autoAverageScore,
    final_total_score: finalAverageScore,
    total_questions: totalQuestions,
    graded_answer_count: gradedAnswerCount,
    completed_questions: completedQuestions,
    revision_questions: revisionQuestions,
    needs_review_questions: needsReviewQuestions,
    status: resultStatus,
  };
}

async function saveLatestQuizAnswer({
  userId,
  pertemuan,
  question,
  answerText,
  score,
  feedbackText,
  matchedKeywords = [],
  reviewStatus = "completed",
}) {
  const resultId = await getOrCreateQuizResult(
    Number(userId),
    Number(pertemuan)
  );

  const [attemptRows] = await db.query(
    `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt
     FROM quiz_answers
     WHERE result_id = ?
       AND question_id = ?`,
    [Number(resultId), Number(question.id)]
  );

  const attemptNumber = Number(attemptRows[0]?.next_attempt || 1);
  const answerImage = extractFirstImageUrl(answerText);

  await db.query(
    `UPDATE quiz_answers
     SET is_latest = 0
     WHERE result_id = ?
       AND question_id = ?`,
    [Number(resultId), Number(question.id)]
  );

  const [answerInsert] = await db.query(
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
      Number(resultId),
      Number(question.id),
      attemptNumber,
      answerText || "",
      answerImage || null,
      Number(score) || 0,
      Number(score) || 0,
      feedbackText || "",
      JSON.stringify(matchedKeywords || []),
      reviewStatus,
      Number(score) || 0,
    ]
  );

  await db.query(
    `UPDATE student_question_progress
     SET latest_answer_id = ?
     WHERE user_id = ?
       AND pertemuan = ?
       AND question_id = ?`,
    [
      Number(answerInsert.insertId),
      Number(userId),
      Number(pertemuan),
      Number(question.id),
    ]
  );

  await updateQuizResultSummary(Number(resultId), Number(pertemuan));

  return {
    resultId,
    answerId: answerInsert.insertId,
  };
}

/* ================================
   INIT PROGRESS SISWA
================================ */

router.post("/init-progress", async (req, res) => {
  try {
    const { user_id, pertemuan } = req.body;

    if (!user_id || !pertemuan) {
      return res.status(400).json({
        message: "user_id dan pertemuan wajib diisi",
      });
    }

    await initializeQuestionProgress(Number(user_id), Number(pertemuan));

    return res.json({
      message: "Progress siswa berhasil disiapkan",
    });
  } catch (err) {
    console.error("INIT PROGRESS ERROR:", err);
    return res.status(500).json({
      message: "Gagal menyiapkan progress siswa",
      error: err.message,
    });
  }
});

/* ================================
   GET PROGRESS SOAL SISWA
================================ */

router.get("/question-progress/:user_id/:pertemuan", async (req, res) => {
  try {
    const { user_id, pertemuan } = req.params;

    await initializeQuestionProgress(Number(user_id), Number(pertemuan));

    const [rows] = await db.query(
      `SELECT
         question_id,
         stage_order,
         status,
         latest_answer_id,
         latest_score,
         attempt_count,
         unlocked_at,
         submitted_at,
         completed_at,
         feedback,
         field_results
       FROM student_question_progress
       WHERE user_id = ?
         AND pertemuan = ?
       ORDER BY stage_order ASC, id ASC`,
      [Number(user_id), Number(pertemuan)]
    );

    return res.json({
      message: "Progress soal berhasil diambil",
      data: rows,
    });
  } catch (err) {
    console.error("GET QUESTION PROGRESS ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengambil progress soal",
      error: err.message,
    });
  }
});

/* ================================
   CEK JAWABAN PER SOAL
================================ */

router.post("/check-question", async (req, res) => {
  try {
    const { user_id, pertemuan, question_id, answer_text } = req.body;

    if (!user_id || !pertemuan || !question_id) {
      return res.status(400).json({
        message: "user_id, pertemuan, dan question_id wajib dikirim.",
      });
    }

    await initializeQuestionProgress(Number(user_id), Number(pertemuan));

    const [questionRows] = await db.query(
      `SELECT
         id,
         pertemuan,
         stage_order,
         is_required,
         passing_score,
         max_score,
         answer_type,
         question
       FROM questions
       WHERE id = ?
         AND pertemuan = ?
       LIMIT 1`,
      [Number(question_id), Number(pertemuan)]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({
        message: "Soal tidak ditemukan pada pertemuan ini.",
      });
    }

    const question = questionRows[0];
    const passingScore = getPassingScore(question);
    const stageOrder = Number(question.stage_order) || 1;
    const nonGraded = isNonGradedQuestion(question);

    const [progressRows] = await db.query(
      `SELECT *
       FROM student_question_progress
       WHERE user_id = ?
         AND pertemuan = ?
         AND question_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [Number(user_id), Number(pertemuan), Number(question_id)]
    );

    if (progressRows.length > 0 && progressRows[0].status === "locked") {
      return res.status(403).json({
        message:
          "Soal ini masih terkunci. Selesaikan soal sebelumnya terlebih dahulu.",
      });
    }

    const grade = await gradeQuestionAnswer(question, answer_text || "");

    const finalScore = nonGraded ? 0 : Number(grade.score) || 0;

    const isPassed = nonGraded
      ? grade.canContinue === true
      : finalScore >= passingScore && grade.canContinue === true;

    const feedbackText =
      grade.note ||
      (isPassed
        ? "Jawaban sudah memenuhi syarat."
        : "Jawaban belum memenuhi syarat.");

    await updateStudentProgress({
      userId: Number(user_id),
      pertemuan: Number(pertemuan),
      questionId: Number(question_id),
      stageOrder,
      score: finalScore,
      passed: isPassed,
      feedback: feedbackText,
      fieldResults: grade.fieldResults || [],
    });

    const reviewStatus = isPassed ? "completed" : "revision";

    await saveLatestQuizAnswer({
      userId: Number(user_id),
      pertemuan: Number(pertemuan),
      question,
      answerText: answer_text || "",
      score: finalScore,
      feedbackText,
      matchedKeywords: grade.matchedKeywords || [],
      reviewStatus,
    });

    let nextQuestion = null;

    if (isPassed) {
      nextQuestion = await unlockNextQuestion(
        Number(user_id),
        Number(pertemuan),
        stageOrder
      );
    }

    return res.json({
      message: isPassed
        ? nonGraded
          ? "Refleksi berhasil disimpan. Bagian ini tidak masuk penilaian."
          : "Jawaban tuntas. Soal berikutnya terbuka."
        : nonGraded
        ? "Refleksi wajib diisi sebelum lanjut."
        : "Jawaban belum tuntas. Perbaiki bagian yang masih kurang sebelum lanjut.",
      data: {
        score: finalScore,
        passing_score: passingScore,
        max_score: getMaxScore(question),
        is_required: Number(question.is_required) !== 0 ? 1 : 0,
        is_non_graded: nonGraded ? 1 : 0,
        is_passed: isPassed ? 1 : 0,
        canContinue: isPassed,
        note: feedbackText,
        matchedKeywords: grade.matchedKeywords || [],
        missingKeywords: grade.missingKeywords || [],
        fieldResults: grade.fieldResults || [],
        next_question: nextQuestion,
      },
    });
  } catch (err) {
    console.error("CHECK QUESTION ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengecek jawaban.",
      error: err.message,
    });
  }
});

/* ================================
   GET SOAL
================================ */

router.get("/questions", async (req, res) => {
  try {
    const { pertemuan, user_id } = req.query;

    if (user_id && pertemuan) {
      await initializeQuestionProgress(Number(user_id), Number(pertemuan));
    }

    const params = [];
    let sql = "";

    if (user_id) {
      sql = `
        SELECT
          q.*,
          COALESCE(p.status, 'locked') AS progress_status,
          COALESCE(p.latest_score, 0) AS latest_score,
          COALESCE(p.attempt_count, 0) AS attempt_count,
          p.latest_answer_id,
          p.completed_at AS progress_completed_at,
          CASE
            WHEN COALESCE(q.max_score, 4) = 0
              OR COALESCE(q.passing_score, 3) = 0
            THEN 1 ELSE 0
          END AS is_non_graded
        FROM questions q
        LEFT JOIN student_question_progress p
          ON p.question_id = q.id
          AND p.user_id = ?
      `;
      params.push(Number(user_id));
    } else {
      sql = `
        SELECT
          q.*,
          NULL AS progress_status,
          0 AS latest_score,
          0 AS attempt_count,
          NULL AS latest_answer_id,
          NULL AS progress_completed_at,
          CASE
            WHEN COALESCE(q.max_score, 4) = 0
              OR COALESCE(q.passing_score, 3) = 0
            THEN 1 ELSE 0
          END AS is_non_graded
        FROM questions q
      `;
    }

    if (pertemuan) {
      sql += " WHERE q.pertemuan = ?";
      params.push(Number(pertemuan));
    }

    sql += " ORDER BY q.pertemuan ASC, q.stage_order ASC, q.id ASC";

    const [results] = await db.query(sql, params);

    return res.json({
      message: "Data soal berhasil diambil",
      data: results,
    });
  } catch (err) {
    console.error("GET /questions error:", err);
    return res.status(500).json({
      message: "Gagal mengambil data soal",
      error: err.message,
    });
  }
});

/* ================================
   TAMBAH SOAL GURU
================================ */

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
      stage_order,
      is_required,
      max_score,
      passing_score,
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
      [Number(pertemuan)]
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

    const finalAnswerType = ["text", "image", "text_image"].includes(
      answer_type
    )
      ? answer_type
      : "text";

    const finalAnswerFields =
      answer_fields && String(answer_fields).trim() !== ""
        ? answer_fields
        : null;

    let finalStageOrder = Number(stage_order || 0);

    if (!finalStageOrder) {
      const [orderRows] = await db.query(
        `SELECT COALESCE(MAX(stage_order), 0) + 1 AS next_order
         FROM questions
         WHERE pertemuan = ?`,
        [Number(pertemuan)]
      );

      finalStageOrder = Number(orderRows[0]?.next_order || 1);
    }

    const finalIsRequired =
      is_required === undefined || is_required === null || is_required === ""
        ? 1
        : Number(is_required) === 0
        ? 0
        : 1;

    const finalMaxScore = toNumberOrDefault(max_score, 4);
    const finalPassingScore = toNumberOrDefault(passing_score, 3);

    const [result] = await db.query(
      `INSERT INTO questions
       (
         question,
         pertemuan,
         stage_order,
         is_required,
         max_score,
         passing_score,
         image_url,
         judul_lkpd,
         pendahuluan_lkpd,
         answer_type,
         answer_fields
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question,
        Number(pertemuan),
        finalStageOrder,
        finalIsRequired,
        finalMaxScore,
        finalPassingScore,
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
      stage_order: finalStageOrder,
    });
  } catch (err) {
    console.error("POST /questions error:", err);
    return res.status(500).json({
      message: "Gagal menambahkan soal",
      error: err.message,
    });
  }
});

/* ================================
   UPDATE SOAL GURU
================================ */

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
      stage_order,
      is_required,
      max_score,
      passing_score,
    } = req.body;

    if (!question || !pertemuan) {
      return res.status(400).json({
        message: "Pertanyaan dan pertemuan wajib diisi",
      });
    }

    const finalAnswerType = ["text", "image", "text_image"].includes(
      answer_type
    )
      ? answer_type
      : "text";

    const finalIsRequired =
      is_required === undefined || is_required === null || is_required === ""
        ? 1
        : Number(is_required) === 0
        ? 0
        : 1;

    const finalMaxScore = toNumberOrDefault(max_score, 4);
    const finalPassingScore = toNumberOrDefault(passing_score, 3);

    const [result] = await db.query(
      `UPDATE questions
       SET question = ?,
           pertemuan = ?,
           stage_order = ?,
           is_required = ?,
           max_score = ?,
           passing_score = ?,
           image_url = ?,
           judul_lkpd = ?,
           pendahuluan_lkpd = ?,
           answer_type = ?,
           answer_fields = ?
       WHERE id = ?`,
      [
        question,
        Number(pertemuan),
        Number(stage_order) || 1,
        finalIsRequired,
        finalMaxScore,
        finalPassingScore,
        image_url || null,
        judul_lkpd || null,
        pendahuluan_lkpd || null,
        finalAnswerType,
        answer_fields || null,
        Number(id),
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    return res.json({ message: "Soal berhasil diupdate" });
  } catch (err) {
    console.error("PUT /questions/:id error:", err);
    return res.status(500).json({
      message: "Gagal mengupdate soal",
      error: err.message,
    });
  }
});

/* ================================
   HAPUS SOAL
================================ */

router.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM questions WHERE id = ?", [
      Number(id),
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    return res.json({ message: "Soal berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /questions/:id error:", err);
    return res.status(500).json({
      message: "Gagal menghapus soal",
      error: err.message,
    });
  }
});

/* ================================
   SUBMIT JAWABAN SISWA
================================ */

router.post("/submit", async (req, res) => {
  try {
    const { user_id, pertemuan, answers } = req.body;

    if (!user_id || !pertemuan) {
      return res.status(400).json({
        message: "user_id dan pertemuan wajib diisi",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Data jawaban wajib dikirim dalam bentuk array.",
      });
    }

    await initializeQuestionProgress(Number(user_id), Number(pertemuan));

    const resultId = await getOrCreateQuizResult(
      Number(user_id),
      Number(pertemuan)
    );

    for (const item of answers) {
      if (!item.question_id) continue;

      const [questionRows] = await db.query(
        `SELECT
           id,
           question,
           stage_order,
           is_required,
           passing_score,
           max_score,
           answer_type
         FROM questions
         WHERE id = ?
           AND pertemuan = ?
         LIMIT 1`,
        [Number(item.question_id), Number(pertemuan)]
      );

      if (questionRows.length === 0) continue;

      const question = questionRows[0];
      const nonGraded = isNonGradedQuestion(question);
      const passingScore = getPassingScore(question);

      const [progressRows] = await db.query(
        `SELECT latest_score, feedback, field_results
         FROM student_question_progress
         WHERE user_id = ?
           AND pertemuan = ?
           AND question_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [Number(user_id), Number(pertemuan), Number(item.question_id)]
      );

      const progress = progressRows[0] || {};
      const answerText = item.answer_text || "";
      const answerImage = item.answer_image || extractFirstImageUrl(answerText);

      const score = nonGraded
        ? 0
        : Number(item.score ?? progress.latest_score ?? 0);

      const teacherNote = nonGraded
        ? "Bagian ini tidak masuk penilaian."
        : item.teacher_note || progress.feedback || "";

      const reviewStatus = nonGraded
        ? "completed"
        : score >= passingScore
        ? "completed"
        : "revision";

      const [attemptRows] = await db.query(
        `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt
         FROM quiz_answers
         WHERE result_id = ?
           AND question_id = ?`,
        [Number(resultId), Number(item.question_id)]
      );

      const attemptNumber = Number(attemptRows[0]?.next_attempt || 1);

      await db.query(
        `UPDATE quiz_answers
         SET is_latest = 0
         WHERE result_id = ?
           AND question_id = ?`,
        [Number(resultId), Number(item.question_id)]
      );

      const [answerInsert] = await db.query(
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
          Number(resultId),
          Number(item.question_id),
          attemptNumber,
          answerText,
          answerImage || null,
          score,
          score,
          teacherNote,
          JSON.stringify([]),
          reviewStatus,
          score,
        ]
      );

      await db.query(
        `UPDATE student_question_progress
         SET latest_answer_id = ?,
             latest_score = ?,
             submitted_at = NOW(),
             completed_at = CASE
               WHEN ? = 'completed' THEN NOW()
               ELSE completed_at
             END
         WHERE user_id = ?
           AND pertemuan = ?
           AND question_id = ?`,
        [
          Number(answerInsert.insertId),
          score,
          reviewStatus,
          Number(user_id),
          Number(pertemuan),
          Number(item.question_id),
        ]
      );
    }

    const summary = await updateQuizResultSummary(resultId, Number(pertemuan));

    return res.status(201).json({
      message: "Semua jawaban berhasil dikirim.",
      result_id: resultId,
      data: {
        result_id: resultId,
        summary,
      },
    });
  } catch (err) {
    console.error("SUBMIT QUIZ ERROR:", err);
    return res.status(500).json({
      message: "Gagal menyimpan jawaban siswa",
      error: err.message,
    });
  }
});

/* ================================
   HASIL QUIZ GURU
================================ */

router.get("/results", async (req, res) => {
  try {
    const [results] = await db.query(
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

    return res.json({
      message: "Data hasil quiz berhasil diambil",
      data: results,
    });
  } catch (err) {
    console.error("GET /results error:", err);
    return res.status(500).json({
      message: "Gagal mengambil data hasil quiz",
      error: err.message,
    });
  }
});

router.get("/results/:id", async (req, res) => {
  try {
    const resultId = Number(req.params.id);

    const [resultRows] = await db.query(
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
        q.stage_order,
        q.is_required,
        q.passing_score,
        q.max_score,
        CASE
          WHEN COALESCE(q.max_score, 4) = 0
            OR COALESCE(q.passing_score, 3) = 0
          THEN 1 ELSE 0
        END AS is_non_graded,
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
    return res.status(500).json({
      message: "Gagal mengambil detail hasil quiz",
      error: err.message,
    });
  }
});

/* ================================
   AUTO GRADE GURU
================================ */

router.put("/results/:result_id/auto-grade", async (req, res) => {
  try {
    const resultId = Number(req.params.result_id);

    const [resultRows] = await db.query(
      `SELECT id, user_id, pertemuan
       FROM quiz_results
       WHERE id = ?
       LIMIT 1`,
      [resultId]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({ message: "Hasil quiz tidak ditemukan" });
    }

    const quizResult = resultRows[0];

    const [answerRows] = await db.query(
      `SELECT
         qa.id AS answer_id,
         qa.question_id,
         qa.answer_text,
         qa.answer_image,
         q.question,
         q.stage_order,
         q.is_required,
         q.passing_score,
         q.max_score,
         q.answer_type
       FROM quiz_answers qa
       JOIN questions q ON qa.question_id = q.id
       WHERE qa.result_id = ?
         AND qa.is_latest = 1
       ORDER BY q.stage_order ASC, qa.id ASC`,
      [resultId]
    );

    for (const row of answerRows) {
      const question = {
        id: row.question_id,
        question: row.question,
        stage_order: row.stage_order,
        is_required: row.is_required,
        passing_score: row.passing_score,
        max_score: row.max_score,
        answer_type: row.answer_type,
      };

      const nonGraded = isNonGradedQuestion(question);
      const passingScore = getPassingScore(question);

      const answerPayload =
        row.answer_text ||
        (row.answer_image
          ? JSON.stringify({ answer_image: row.answer_image })
          : "");

      const grade = await gradeQuestionAnswer(question, answerPayload);

      const score = nonGraded ? 0 : Number(grade.score) || 0;

      const reviewStatus = nonGraded
        ? "completed"
        : score >= passingScore && grade.canContinue
        ? "completed"
        : "revision";

      await db.query(
        `UPDATE quiz_answers
         SET score = ?,
             auto_score = ?,
             final_score = ?,
             auto_note = ?,
             matched_keywords = ?,
             grading_type = 'auto',
             review_status = ?,
             teacher_note = ?
         WHERE id = ?`,
        [
          score,
          score,
          score,
          grade.note || "",
          JSON.stringify(grade.matchedKeywords || []),
          reviewStatus,
          grade.note || "",
          Number(row.answer_id),
        ]
      );

      await updateStudentProgress({
        userId: Number(quizResult.user_id),
        pertemuan: Number(quizResult.pertemuan),
        questionId: Number(row.question_id),
        stageOrder: Number(row.stage_order),
        score,
        passed: reviewStatus === "completed",
        feedback: grade.note || "",
        fieldResults: grade.fieldResults || [],
      });

      if (reviewStatus === "completed") {
        await unlockNextQuestion(
          Number(quizResult.user_id),
          Number(quizResult.pertemuan),
          Number(row.stage_order)
        );
      }
    }

    const summary = await updateQuizResultSummary(
      resultId,
      quizResult.pertemuan
    );

    return res.json({
      message: "Penilaian otomatis berhasil dijalankan.",
      data: summary,
    });
  } catch (err) {
    console.error("AUTO GRADE ERROR:", err);
    return res.status(500).json({
      message: "Gagal menjalankan penilaian otomatis",
      error: err.message,
    });
  }
});

/* ================================
   KOREKSI NILAI GURU
================================ */

router.put("/results/:result_id/grade", async (req, res) => {
  try {
    const resultId = Number(req.params.result_id);
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Data penilaian tidak valid" });
    }

    const [resultRows] = await db.query(
      `SELECT id, user_id, pertemuan
       FROM quiz_results
       WHERE id = ?
       LIMIT 1`,
      [resultId]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({ message: "Hasil quiz tidak ditemukan" });
    }

    const quizResult = resultRows[0];

    for (const item of answers) {
      const [answerRows] = await db.query(
        `SELECT
           qa.id,
           qa.question_id,
           q.question,
           q.stage_order,
           q.is_required,
           q.passing_score,
           q.max_score,
           q.answer_type
         FROM quiz_answers qa
         JOIN questions q ON qa.question_id = q.id
         WHERE qa.id = ?
           AND qa.result_id = ?
         LIMIT 1`,
        [Number(item.answer_id), resultId]
      );

      if (answerRows.length === 0) continue;

      const answer = answerRows[0];
      const nonGraded = isNonGradedQuestion(answer);
      const passingScore = getPassingScore(answer);

      const score = nonGraded ? 0 : Number(item.score ?? item.final_score) || 0;

      const teacherNote = nonGraded
        ? "Bagian ini tidak masuk penilaian."
        : item.teacher_note || null;

      const reviewStatus = nonGraded
        ? "completed"
        : score >= passingScore
        ? "completed"
        : "revision";

      await db.query(
        `UPDATE quiz_answers
         SET score = ?,
             final_score = ?,
             teacher_note = ?,
             grading_type = 'teacher',
             review_status = ?
         WHERE id = ?
           AND result_id = ?`,
        [
          score,
          score,
          teacherNote,
          reviewStatus,
          Number(item.answer_id),
          resultId,
        ]
      );

      await db.query(
        `UPDATE student_question_progress
         SET status = ?,
             latest_score = ?,
             completed_at = CASE
               WHEN ? = 'completed' THEN NOW()
               ELSE completed_at
             END,
             feedback = ?
         WHERE user_id = ?
           AND pertemuan = ?
           AND question_id = ?`,
        [
          reviewStatus === "completed" ? "completed" : "unlocked",
          score,
          reviewStatus,
          teacherNote || "",
          Number(quizResult.user_id),
          Number(quizResult.pertemuan),
          Number(answer.question_id),
        ]
      );

      if (reviewStatus === "completed") {
        await unlockNextQuestion(
          Number(quizResult.user_id),
          Number(quizResult.pertemuan),
          Number(answer.stage_order)
        );
      }
    }

    const summary = await updateQuizResultSummary(
      resultId,
      quizResult.pertemuan
    );

    await db.query(
      `UPDATE quiz_results
       SET grading_type = 'teacher',
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [resultId]
    );

    return res.json({
      message: "Koreksi guru berhasil disimpan",
      total_score: summary.final_total_score,
      data: summary,
    });
  } catch (err) {
    console.error("GRADE QUIZ ERROR:", err);
    return res.status(500).json({
      message: "Gagal menyimpan penilaian",
      error: err.message,
    });
  }
});

/* ================================
   HASIL SISWA SENDIRI
================================ */

router.get("/my-results/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(
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
      [Number(user_id)]
    );

    return res.json({
      message: "Data hasil quiz siswa berhasil diambil",
      data: results,
    });
  } catch (err) {
    console.error("GET my-results error:", err);
    return res.status(500).json({
      message: "Gagal mengambil hasil quiz siswa",
      error: err.message,
    });
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
        qr.auto_total_score,
        qr.final_total_score,
        qr.total_questions,
        qr.completed_questions,
        qr.revision_questions,
        qr.status,
        qr.grading_type,
        qr.created_at,
        qr.updated_at
       FROM quiz_results qr
       WHERE qr.id = ?
         AND qr.user_id = ?`,
      [Number(result_id), Number(user_id)]
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
        q.stage_order,
        q.is_required,
        q.passing_score,
        q.max_score,
        CASE
          WHEN COALESCE(q.max_score, 4) = 0
            OR COALESCE(q.passing_score, 3) = 0
          THEN 1 ELSE 0
        END AS is_non_graded,
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
      [Number(result_id)]
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
    return res.status(500).json({
      message: "Gagal mengambil detail hasil quiz",
      error: err.message,
    });
  }
});

/* ================================
   RUBRIK CRUD
================================ */

router.get("/rubrics/:question_id", async (req, res) => {
  try {
    const { question_id } = req.params;

    const [rubrics] = await db.query(
      `SELECT *
       FROM question_rubrics
       WHERE question_id = ?
       ORDER BY field_key ASC, score DESC, min_match DESC, id ASC`,
      [Number(question_id)]
    );

    return res.json({
      message: "Rubrik berhasil diambil",
      data: rubrics,
    });
  } catch (err) {
    console.error("GET rubrics error:", err);
    return res.status(500).json({
      message: "Gagal mengambil rubrik",
      error: err.message,
    });
  }
});

router.post("/rubrics", async (req, res) => {
  try {
    const { question_id, field_key, score, min_match, keywords, feedback } =
      req.body;

    if (!question_id) {
      return res.status(400).json({ message: "question_id wajib diisi" });
    }

    if (!field_key) {
      return res.status(400).json({ message: "field_key wajib diisi" });
    }

    if (score === undefined || score === null || score === "") {
      return res.status(400).json({ message: "score wajib diisi" });
    }

    const [check] = await db.query(`SELECT id FROM questions WHERE id = ?`, [
      Number(question_id),
    ]);

    if (check.length === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    const keywordArray = normalizeKeywordsForStorage(keywords);

    const [result] = await db.query(
      `INSERT INTO question_rubrics
        (question_id, field_key, score, min_match, keywords, feedback)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(question_id),
        String(field_key).trim(),
        Number(score),
        Number(min_match) || 1,
        JSON.stringify(keywordArray),
        feedback || null,
      ]
    );

    return res.status(201).json({
      message: "Rubrik berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST rubrics error:", err);
    return res.status(500).json({
      message: "Gagal menambahkan rubrik",
      error: err.message,
    });
  }
});

router.put("/rubrics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { field_key, score, min_match, keywords, feedback } = req.body;

    if (!field_key) {
      return res.status(400).json({ message: "field_key wajib diisi" });
    }

    const keywordArray = normalizeKeywordsForStorage(keywords);

    const [result] = await db.query(
      `UPDATE question_rubrics
       SET field_key = ?,
           score = ?,
           min_match = ?,
           keywords = ?,
           feedback = ?
       WHERE id = ?`,
      [
        String(field_key).trim(),
        Number(score),
        Number(min_match) || 1,
        JSON.stringify(keywordArray),
        feedback || null,
        Number(id),
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }

    return res.json({ message: "Rubrik berhasil diupdate" });
  } catch (err) {
    console.error("PUT rubrics error:", err);
    return res.status(500).json({
      message: "Gagal mengupdate rubrik",
      error: err.message,
    });
  }
});

router.delete("/rubrics/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM question_rubrics WHERE id = ?`,
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }

    return res.json({ message: "Rubrik berhasil dihapus" });
  } catch (err) {
    console.error("DELETE rubrics error:", err);
    return res.status(500).json({
      message: "Gagal menghapus rubrik",
      error: err.message,
    });
  }
});

router.get("/rubrics/by-field/:question_id/:field_key", async (req, res) => {
  try {
    const { question_id, field_key } = req.params;

    const [rubrics] = await db.query(
      `SELECT *
       FROM question_rubrics
       WHERE question_id = ?
         AND field_key = ?
       ORDER BY score DESC, min_match DESC, id ASC`,
      [Number(question_id), field_key]
    );

    return res.json({
      message: "Rubrik berhasil diambil",
      data: rubrics,
    });
  } catch (err) {
    console.error("GET rubrics by field error:", err);
    return res.status(500).json({
      message: "Gagal mengambil rubrik",
      error: err.message,
    });
  }
});

module.exports = router;