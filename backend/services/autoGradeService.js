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

function safeJsonParse(value, fallback = null) {
  if (!value) return fallback;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
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

function valueToPlainText(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

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

  if (!parsed) {
    return String(answerText || "");
  }

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

  const targetKey = normalizeKey(fieldKey);

  const foundKey = Object.keys(parsed).find((key) => {
    return normalizeKey(key) === targetKey;
  });

  if (!foundKey) return "";

  return valueToPlainText(parsed[foundKey]);
}

function keywordMatches(answerText, keyword) {
  const answer = normalizeText(answerText);
  const key = normalizeText(keyword);

  if (!answer || !key) return false;

  if (answer.includes(key)) {
    return true;
  }

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
    const fieldKey = normalizeKey(rubric.field_key || "jawaban");

    if (!grouped[fieldKey]) {
      grouped[fieldKey] = [];
    }

    grouped[fieldKey].push({
      ...rubric,
      field_key: fieldKey,
    });
  });

  return grouped;
}

/* ======================================================
   KHUSUS CEK GAMBAR
   Untuk answer_type = image:
   siswa lolos kalau sudah upload gambar.
====================================================== */

function hasUploadedImage(answerText) {
  const parsed = safeJsonParse(answerText);

  if (!parsed) return false;

  const checkValue = (value) => {
    if (!value) return false;

    if (typeof value === "string") {
      const cleanValue = value.trim();

      return (
        cleanValue.startsWith("http") ||
        cleanValue.includes("/uploads/") ||
        cleanValue.includes("uploads/")
      );
    }

    if (Array.isArray(value)) {
      return value.some(checkValue);
    }

    if (typeof value === "object") {
      if (
        typeof value.image_url === "string" &&
        value.image_url.trim() !== ""
      ) {
        return true;
      }

      if (
        typeof value.answer_image === "string" &&
        value.answer_image.trim() !== ""
      ) {
        return true;
      }

      if (
        typeof value.url === "string" &&
        value.url.trim() !== ""
      ) {
        return true;
      }

      return Object.values(value).some(checkValue);
    }

    return false;
  };

  return checkValue(parsed);
}

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
          note: "Siswa belum mengupload gambar jawaban.",
          reviewStatus: "revision",
          isPassed: false,
        },
      ],
    };
  }

  return {
    score: maxScore,
    matchedKeywords: [],
    note: "Gambar jawaban sudah diupload. Siswa dinyatakan tuntas.",
    reviewStatus: "auto_graded_passed",
    isPassed: true,
    canContinue: true,
    fieldResults: [
      {
        fieldKey: "gambar_jawaban",
        score: maxScore,
        matchedKeywords: [],
        note: "Gambar jawaban sudah diupload.",
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

  if (!normalizedAnswer) {
    return {
      fieldKey,
      score: 0,
      matchedKeywords: [],
      note: "Jawaban pada bagian ini masih kosong.",
      reviewStatus: "revision",
      isPassed: false,
    };
  }

  if (!fieldRubrics || fieldRubrics.length === 0) {
    return {
      fieldKey,
      score: 0,
      matchedKeywords: [],
      note: "Rubrik untuk bagian ini belum tersedia.",
      reviewStatus: "needs_review",
      isPassed: false,
    };
  }

  const sortedRubrics = [...fieldRubrics].sort((a, b) => {
    return Number(b.score) - Number(a.score);
  });

  let bestPartialMatch = {
    fieldKey,
    score: 0,
    matchedKeywords: [],
    note: "Jawaban ada, tetapi belum sesuai dengan keyword rubrik.",
    reviewStatus: "revision",
    isPassed: false,
  };

  for (const rubric of sortedRubrics) {
    const keywords = parseKeywords(rubric.keywords);

    if (keywords.length === 0) {
      continue;
    }

    const matchedKeywords = keywords.filter((keyword) => {
      return keywordMatches(normalizedAnswer, keyword);
    });

    const minMatch = Math.max(1, Number(rubric.min_match) || 1);

    if (matchedKeywords.length > bestPartialMatch.matchedKeywords.length) {
      bestPartialMatch = {
        fieldKey,
        score: 0,
        matchedKeywords,
        note:
          rubric.feedback ||
          `Baru cocok ${matchedKeywords.length} keyword, belum memenuhi minimal ${minMatch} keyword.`,
        reviewStatus: "revision",
        isPassed: false,
      };
    }

    if (matchedKeywords.length >= minMatch) {
      const score = Number(rubric.score) || 0;
      const isPassed = score >= passingScore;

      return {
        fieldKey,
        score,
        matchedKeywords,
        note:
          rubric.feedback ||
          `Kata kunci cocok: ${matchedKeywords.join(", ")}.`,
        reviewStatus: isPassed ? "auto_graded_passed" : "revision",
        isPassed,
      };
    }
  }

  return bestPartialMatch;
}

function autoGradeAnswer(answerText, rubrics = [], options = {}) {
  const passingScore = Number(options.passingScore) || 3;
  const maxScore = Number(options.maxScore) || 4;
  const answerType = options.answerType || "text";

  /*
    UNTUK SOAL GAMBAR:
    Tidak perlu rubrik keyword.
    Yang penting siswa sudah upload gambar.
  */
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

  /*
    UNTUK SOAL TEXT_IMAGE:
    Sistem tetap menilai teks dengan rubrik,
    tapi gambar juga dicek sebagai syarat tambahan.
  */
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
          note: "Siswa belum mengupload gambar jawaban.",
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
      return gradeSingleField(
        answerText,
        fieldKey,
        fieldRubrics,
        passingScore
      );
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

  const note = fieldResults
    .map((item) => {
      const fieldName = String(item.fieldKey || "jawaban").replace(/_/g, " ");
      return `${fieldName}: nilai ${item.score}. ${item.note}`;
    })
    .join("\n");

  return {
    score: finalScore,
    matchedKeywords: allMatchedKeywords,
    note,
    reviewStatus: allFieldsPassed ? "auto_graded_passed" : "revision",
    isPassed: allFieldsPassed,
    canContinue: allFieldsPassed,
    fieldResults,
  };
}

module.exports = {
  autoGradeAnswer,
};