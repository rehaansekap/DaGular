import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../style/QuizPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const fetchJsonSafely = async (url, options = {}) => {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = safeJsonParse(text, {});

  return { res, data };
};

const sortQuestions = (questionList) => {
  return [...questionList].sort((a, b) => {
    const orderA = Number(a.stage_order) || Number(a.id);
    const orderB = Number(b.stage_order) || Number(b.id);

    if (orderA !== orderB) return orderA - orderB;
    return Number(a.id) - Number(b.id);
  });
};

const normalizeText = (value = "") => {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

const isNonGradedQuestion = (item = {}) => {
  const maxScore = Number(item.max_score);
  const passingScore = Number(item.passing_score);
  const questionText = normalizeText(item.question || "");

  return (
    Number(item.is_non_graded) === 1 ||
    maxScore === 0 ||
    passingScore === 0 ||
    questionText.includes("self reflection") ||
    questionText.includes("refleksi")
  );
};

const buildProgressMap = (progressRows = []) => {
  const nextProgressMap = {};

  progressRows.forEach((item) => {
    nextProgressMap[Number(item.question_id)] = {
      question_id: Number(item.question_id),
      stage_order: Number(item.stage_order) || 0,
      status: item.status || "locked",
      latest_score: Number(item.latest_score) || 0,
      attempt_count: Number(item.attempt_count) || 0,
      feedback: item.feedback || "",
      field_results: safeJsonParse(item.field_results, []),
      unlocked_at: item.unlocked_at || null,
      submitted_at: item.submitted_at || null,
      completed_at: item.completed_at || null,
    };
  });

  return nextProgressMap;
};

function QuizPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [loadingPage, setLoadingPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingQuestionId, setCheckingQuestionId] = useState(null);
  const [uploading, setUploading] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [answersReady, setAnswersReady] = useState(false);

  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedbackOpenMap, setFeedbackOpenMap] = useState({});

  const user_id = localStorage.getItem("user_id");
  const name = localStorage.getItem("name") || "Siswa";

  const savedAnswersKey = useMemo(() => {
    return `lkpd_answers_${user_id || "guest"}_${id}`;
  }, [user_id, id]);

  useEffect(() => {
    const loadQuestionsAndProgress = async () => {
      setLoadingPage(true);
      setAnswersReady(false);

      try {
        const { res: questionRes, data: questionData } = await fetchJsonSafely(
          `${API_URL}/api/quiz/questions?pertemuan=${id}`
        );

        if (!questionRes.ok) {
          console.error(questionData.message || "Gagal mengambil soal LKPD.");
          setQuestions([]);
          setProgressMap({});
          return;
        }

        const sortedQuestions = sortQuestions(questionData.data || []);
        setQuestions(sortedQuestions);

        const savedAnswers = safeJsonParse(
          localStorage.getItem(savedAnswersKey),
          {}
        );

        setAnswers(savedAnswers || {});
        setAnswersReady(true);

        if (!user_id) {
          setProgressMap({});
          return;
        }

        try {
          await fetchJsonSafely(`${API_URL}/api/quiz/init-progress`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: Number(user_id),
              pertemuan: Number(id),
            }),
          });
        } catch (err) {
          console.warn("Init progress gagal:", err);
        }

        try {
          const { res: progressRes, data: progressData } =
            await fetchJsonSafely(
              `${API_URL}/api/quiz/question-progress/${user_id}/${id}`
            );

          if (!progressRes.ok) {
            console.warn(
              progressData.message || "Progress soal belum bisa diambil."
            );
            setProgressMap({});
            return;
          }

          setProgressMap(buildProgressMap(progressData.data || []));
        } catch (err) {
          console.warn("Gagal mengambil progress soal:", err);
          setProgressMap({});
        }
      } catch (err) {
        console.error("Gagal mengambil LKPD:", err);
        setQuestions([]);
        setProgressMap({});
      } finally {
        setLoadingPage(false);
      }
    };

    loadQuestionsAndProgress();
  }, [id, user_id, savedAnswersKey]);

  useEffect(() => {
    if (!answersReady) return;
    localStorage.setItem(savedAnswersKey, JSON.stringify(answers));
  }, [answers, answersReady, savedAnswersKey]);

  const lkpdInfo = questions[0] || {};

  const getAnswerFields = (answerFields) => {
    if (!answerFields) return ["Jawaban"];

    const parsed = safeJsonParse(answerFields);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(answerFields)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getAnswerType = (answerType) => {
    const validTypes = ["text", "image", "text_image"];
    return validTypes.includes(answerType) ? answerType : "text";
  };

  const getQuestionProgress = (item, index) => {
    return (
      progressMap[Number(item.id)] || {
        question_id: Number(item.id),
        stage_order: Number(item.stage_order) || index + 1,
        status: index === 0 ? "unlocked" : "locked",
        latest_score: 0,
        attempt_count: 0,
        feedback: "",
        field_results: [],
        unlocked_at: null,
        submitted_at: null,
        completed_at: null,
      }
    );
  };

  const getPassingScore = (item) => {
    if (isNonGradedQuestion(item)) return 0;
    return Number(item.passing_score) || 3;
  };

  const getMaxScore = (item) => {
    if (isNonGradedQuestion(item)) return 0;
    return Number(item.max_score) || 4;
  };

  const isQuestionPassed = (item, index) => {
    const progress = getQuestionProgress(item, index);
    const nonGraded = isNonGradedQuestion(item);

    if (nonGraded) {
      return (
        progress.status === "completed" ||
        Boolean(progress.completed_at) ||
        Number(progress.attempt_count) > 0
      );
    }

    const passingScore = getPassingScore(item);

    return (
      progress.status === "completed" ||
      Boolean(progress.completed_at) ||
      Number(progress.latest_score) >= passingScore
    );
  };

  const isQuestionLocked = (item, index) => {
    const progress = getQuestionProgress(item, index);

    if (index === 0 && progress.status !== "completed") {
      return false;
    }

    return progress.status === "locked";
  };

  const handleChange = (questionId, field, value, answerType = "text") => {
    setAnswers((prev) => {
      const currentQuestionAnswer = prev[questionId] || {};
      const currentFieldAnswer = currentQuestionAnswer[field];

      if (answerType === "text_image") {
        return {
          ...prev,
          [questionId]: {
            ...currentQuestionAnswer,
            [field]: {
              ...(typeof currentFieldAnswer === "object"
                ? currentFieldAnswer
                : {}),
              text: value,
            },
          },
        };
      }

      return {
        ...prev,
        [questionId]: {
          ...currentQuestionAnswer,
          [field]: value,
        },
      };
    });
  };

  const handleImageUpload = async (questionId, field, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran gambar maksimal 5 MB");
      return;
    }

    const uploadKey = `${questionId}-${field}`;
    const formData = new FormData();

    formData.append("file", file);

    setUploading((prev) => ({
      ...prev,
      [uploadKey]: true,
    }));

    try {
      const { res, data } = await fetchJsonSafely(`${API_URL}/api/quiz/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert(data.message || "Upload gambar gagal");
        return;
      }

      setAnswers((prev) => {
        const currentQuestionAnswer = prev[questionId] || {};
        const currentFieldAnswer = currentQuestionAnswer[field];

        return {
          ...prev,
          [questionId]: {
            ...currentQuestionAnswer,
            [field]: {
              ...(typeof currentFieldAnswer === "object"
                ? currentFieldAnswer
                : {}),
              image_url: data.url,
              image_name: file.name,
            },
          },
        };
      });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setUploading((prev) => ({
        ...prev,
        [uploadKey]: false,
      }));
    }
  };

  const handleRemoveImage = (questionId, field) => {
    setAnswers((prev) => {
      const currentQuestionAnswer = prev[questionId] || {};
      const currentFieldAnswer = currentQuestionAnswer[field];

      return {
        ...prev,
        [questionId]: {
          ...currentQuestionAnswer,
          [field]: {
            ...(typeof currentFieldAnswer === "object"
              ? currentFieldAnswer
              : {}),
            image_url: "",
            image_name: "",
          },
        },
      };
    });
  };

  const isAnswered = (item) => {
    const answerType = getAnswerType(item.answer_type);
    const fields = getAnswerFields(item.answer_fields);
    const answer = answers[item.id];

    if (!answer || typeof answer !== "object") return false;

    const isTextFilled = (field) => {
      const value = answer[field];

      if (answerType === "text_image") {
        return (
          value &&
          typeof value === "object" &&
          typeof value.text === "string" &&
          value.text.trim() !== ""
        );
      }

      return typeof value === "string" && value.trim() !== "";
    };

    const isImageFilled = (field) => {
      const value = answer[field];

      return (
        value &&
        typeof value === "object" &&
        typeof value.image_url === "string" &&
        value.image_url.trim() !== ""
      );
    };

    if (answerType === "text") {
      return fields.every((field) => isTextFilled(field));
    }

    if (answerType === "image") {
      return fields.every((field) => isImageFilled(field));
    }

    if (answerType === "text_image") {
      return fields.every(
        (field) => isTextFilled(field) && isImageFilled(field)
      );
    }

    return false;
  };

  const completedCount = questions.filter((item, index) =>
    isQuestionPassed(item, index)
  ).length;

  const progressPercent =
    questions.length > 0
      ? Math.round((completedCount / questions.length) * 100)
      : 0;

  const isAnyUploading = Object.values(uploading).some(Boolean);

  const allRequiredQuestionsPassed =
    questions.length > 0 &&
    questions
      .filter((item) => Number(item.is_required) !== 0)
      .every((item, index) => isQuestionPassed(item, index));

  const totalScore = questions.reduce((sum, item, index) => {
    if (isNonGradedQuestion(item)) return sum;

    const progress = getQuestionProgress(item, index);
    return sum + (Number(progress.latest_score) || 0);
  }, 0);

  const refreshProgressAfterCheck = async () => {
    if (!user_id || !id) return;

    try {
      const { res, data } = await fetchJsonSafely(
        `${API_URL}/api/quiz/question-progress/${user_id}/${id}`
      );

      if (res.ok) {
        setProgressMap(buildProgressMap(data.data || []));
      }
    } catch (err) {
      console.warn("Gagal refresh progress setelah cek jawaban:", err);
    }
  };

  const handleCheckQuestion = async (item, index) => {
    const nonGraded = isNonGradedQuestion(item);

    if (!user_id) {
      alert("User belum login");
      return;
    }

    if (isAnyUploading) {
      alert("Tunggu sampai proses upload gambar selesai");
      return;
    }

    if (isQuestionLocked(item, index)) {
      alert("Soal ini masih terkunci.");
      return;
    }

    if (isQuestionPassed(item, index)) {
      alert(nonGraded ? "Refleksi sudah tersimpan." : "Soal ini sudah tuntas.");
      return;
    }

    if (!isAnswered(item)) {
      alert(
        nonGraded
          ? "Isi refleksi terlebih dahulu sebelum lanjut."
          : "Lengkapi jawaban pada soal ini terlebih dahulu."
      );
      return;
    }

    try {
      setCheckingQuestionId(item.id);

      const answerText = JSON.stringify(answers[item.id] || {});

      const { res, data } = await fetchJsonSafely(
        `${API_URL}/api/quiz/check-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(user_id),
            pertemuan: Number(id),
            question_id: Number(item.id),
            answer_text: answerText,
          }),
        }
      );

      if (!res.ok) {
        alert(data.message || "Gagal mengecek jawaban.");
        return;
      }

      const responseData = data.data || {};
      const score = Number(responseData.score) || 0;
      const responseNonGraded =
        nonGraded || Number(responseData.is_non_graded) === 1;

      const passingScore = responseNonGraded
        ? 0
        : Number(responseData.passing_score) || getPassingScore(item);

      const passed = responseNonGraded
        ? responseData.canContinue === true ||
        Number(responseData.is_passed) === 1
        : responseData.canContinue === true ||
        Number(responseData.is_passed) === 1 ||
        score >= passingScore;

      setProgressMap((prev) => {
        const nextProgress = {
          ...prev,
          [Number(item.id)]: {
            ...(prev[Number(item.id)] || {}),
            question_id: Number(item.id),
            stage_order: Number(item.stage_order) || index + 1,
            status: passed ? "completed" : "unlocked",
            latest_score: responseNonGraded ? 0 : score,
            attempt_count:
              Number(prev[Number(item.id)]?.attempt_count || 0) + 1,
            feedback: responseData.note || data.message || "",
            field_results: responseData.fieldResults || [],
            submitted_at: new Date().toISOString(),
            completed_at: passed ? new Date().toISOString() : null,
          },
        };

        const nextQuestion = questions[index + 1];

        if (passed && nextQuestion) {
          nextProgress[Number(nextQuestion.id)] = {
            ...(nextProgress[Number(nextQuestion.id)] || {}),
            question_id: Number(nextQuestion.id),
            stage_order: Number(nextQuestion.stage_order) || index + 2,
            status:
              nextProgress[Number(nextQuestion.id)]?.status === "completed"
                ? "completed"
                : "unlocked",
            latest_score:
              Number(nextProgress[Number(nextQuestion.id)]?.latest_score) || 0,
            attempt_count:
              Number(nextProgress[Number(nextQuestion.id)]?.attempt_count) || 0,
            feedback: nextProgress[Number(nextQuestion.id)]?.feedback || "",
            field_results:
              nextProgress[Number(nextQuestion.id)]?.field_results || [],
            unlocked_at:
              nextProgress[Number(nextQuestion.id)]?.unlocked_at ||
              new Date().toISOString(),
          };
        }

        return nextProgress;
      });

      await refreshProgressAfterCheck();

      setFeedbackOpenMap((prev) => ({
        ...prev,
        [Number(item.id)]: true,
      }));

      if (passed) {
        alert(
          responseNonGraded
            ? "Refleksi berhasil disimpan. Kamu bisa lanjut."
            : "Jawaban tuntas. Soal berikutnya terbuka."
        );
      } else {
        alert(
          responseNonGraded
            ? "Refleksi belum tersimpan. Lengkapi dulu sebelum lanjut."
            : "Jawaban belum tuntas. Perbaiki dulu sebelum lanjut."
        );
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengecek jawaban.");
    } finally {
      setCheckingQuestionId(null);
    }
  };

  const handleSubmit = async () => {
    if (!user_id) return alert("User belum login");

    if (!allRequiredQuestionsPassed) {
      alert("Semua bagian wajib harus selesai sebelum dikirim.");
      return;
    }

    if (isAnyUploading) {
      alert("Tunggu sampai proses upload gambar selesai");
      return;
    }

    const formattedAnswers = questions.map((item, index) => {
      const progress = getQuestionProgress(item, index);
      const nonGraded = isNonGradedQuestion(item);

      return {
        question_id: item.id,
        answer_text: JSON.stringify(answers[item.id] || {}),
        score: nonGraded ? 0 : Number(progress.latest_score) || 0,
        teacher_note: nonGraded
          ? "Bagian ini tidak masuk penilaian."
          : progress.feedback || "",
      };
    });

    setLoading(true);

    try {
      const { res, data } = await fetchJsonSafely(`${API_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(user_id),
          pertemuan: Number(id),
          answers: formattedAnswers,
          status: "graded",
          is_passed: 1,
          can_continue: 1,
        }),
      });

      if (!res.ok) {
        alert(data.message || "Gagal mengirim jawaban.");
        return;
      }

      localStorage.removeItem(savedAnswersKey);

      navigate("/quiz/result", {
        state: {
          pertemuan: id,
          result_id: data.result_id,
          status: "graded",
          score: totalScore,
          is_passed: 1,
          can_continue: 1,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedback = (questionId) => {
    setFeedbackOpenMap((prev) => ({
      ...prev,
      [Number(questionId)]: !prev[Number(questionId)],
    }));
  };

  const renderFeedback = (item, index) => {
    const progress = getQuestionProgress(item, index);
    const nonGraded = isNonGradedQuestion(item);

    const latestScore = Number(progress.latest_score) || 0;
    const passed = isQuestionPassed(item, index);
    const passingScore = getPassingScore(item);

    const fieldResults = Array.isArray(progress.field_results)
      ? progress.field_results
      : [];

    const hasFieldResults = fieldResults.length > 0;
    const hasScore = latestScore > 0;

    if (!hasScore && !hasFieldResults && !progress.feedback) {
      return null;
    }

    const feedbackIsOpen = Boolean(feedbackOpenMap[Number(item.id)]);

    const formatFieldName = (value) => {
      return String(value || "jawaban")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getShortNote = (note) => {
      if (!note) return "";

      const cleanNote = String(note).trim();

      if (cleanNote.length <= 420) {
        return cleanNote;
      }

      return `${cleanNote.slice(0, 420)}...`;
    };

    const getSuggestion = (field) => {
      return (
        field.suggestion ||
        field.revisionSuggestion ||
        field.revision_suggestion ||
        ""
      );
    };

    if (nonGraded) {
      return (
        <div className="question-feedback-box passed compact-feedback">
          <button
            type="button"
            className="feedback-summary-toggle"
            onClick={() => toggleFeedback(item.id)}
          >
            <div>
              <span className="feedback-eyebrow">Refleksi Siswa</span>

              <h4>
                {passed ? "Refleksi Sudah Tersimpan" : "Refleksi Belum Diisi"}
              </h4>

              <p>
                {passed
                  ? "Bagian ini tidak masuk penilaian. Refleksi kamu sudah tersimpan."
                  : "Bagian ini wajib diisi, tetapi tidak masuk penilaian."}
              </p>
            </div>

            <div className="feedback-summary-right">
              <span className="feedback-score-circle passed">✓</span>
              <small>{feedbackIsOpen ? "Tutup Detail" : "Buka Detail"}</small>
            </div>
          </button>

          {feedbackIsOpen && (
            <div className="feedback-detail-body">
              <div className="feedback-simple-card">
                <p>
                  {getShortNote(progress.feedback) ||
                    "Refleksi berhasil disimpan."}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={
          passed
            ? "question-feedback-box passed compact-feedback"
            : "question-feedback-box failed compact-feedback"
        }
      >
        <button
          type="button"
          className="feedback-summary-toggle"
          onClick={() => toggleFeedback(item.id)}
        >
          <div>
            <span className="feedback-eyebrow">Hasil Review Otomatis</span>

            <h4>
              Nilai {latestScore} — {passed ? "Tuntas" : "Perlu Revisi"}
            </h4>

            <p>
              {passed
                ? "Jawaban sudah memenuhi nilai minimal. Kamu bisa lanjut ke soal berikutnya."
                : `Jawaban belum memenuhi nilai minimal ${passingScore}. Buka detail untuk melihat catatan revisi.`}
            </p>
          </div>

          <div className="feedback-summary-right">
            <span
              className={
                passed
                  ? "feedback-score-circle passed"
                  : "feedback-score-circle failed"
              }
            >
              {latestScore}
            </span>

            <small>{feedbackIsOpen ? "Tutup Detail" : "Buka Detail"}</small>
          </div>
        </button>

        {feedbackIsOpen && (
          <div className="feedback-detail-body">
            {hasFieldResults ? (
              <div className="field-result-list">
                {fieldResults.map((field, fieldIndex) => {
                  const fieldScore = Number(field.score) || 0;

                  const fieldPassed =
                    field.isPassed === true ||
                    field.is_passed === true ||
                    Number(field.isPassed) === 1 ||
                    Number(field.is_passed) === 1 ||
                    fieldScore >= passingScore;

                  const fieldName = formatFieldName(
                    field.fieldKey ||
                      field.field_key ||
                      `Bagian ${fieldIndex + 1}`
                  );

                  const suggestion = getSuggestion(field);

                  return (
                    <div
                      key={fieldIndex}
                      className={
                        fieldPassed
                          ? "field-result-card passed"
                          : "field-result-card failed"
                      }
                    >
                      <div className="field-result-top">
                        <div className="field-result-content">
                          <div className="field-title-row">
                            <span className="field-result-title">
                              {fieldName}
                            </span>

                            <span
                              className={
                                fieldPassed
                                  ? "field-status-chip passed"
                                  : "field-status-chip failed"
                              }
                            >
                              {fieldPassed ? "Tuntas" : "Revisi"}
                            </span>
                          </div>

                          {field.note && (
                            <p className="field-result-note">
                              {getShortNote(field.note)}
                            </p>
                          )}
                        </div>

                        <span
                          className={
                            fieldPassed
                              ? "field-score-pill passed"
                              : "field-score-pill failed"
                          }
                        >
                          {fieldScore}
                        </span>
                      </div>

                      {suggestion && (
                        <div className="feedback-suggestion-box clean">
                          <strong>Saran revisi</strong>
                          <p>{getShortNote(suggestion)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="feedback-simple-card">
                <p>
                  {getShortNote(progress.feedback) ||
                    "Jawaban sudah diperiksa."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loadingPage) {
    return (
      <div className="quiz-page">
        <div className="quiz-wrapper">
          <div className="quiz-card quiz-loading-card">
            <p>Memuat LKPD...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-wrapper">
          <div className="quiz-card quiz-empty">
            <p>Belum ada soal LKPD pada pertemuan ini.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = questions[currentQuestionIndex] || questions[0];

  const currentIndex = questions.findIndex(
    (question) => Number(question.id) === Number(currentItem.id)
  );

  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  const currentFields = getAnswerFields(currentItem.answer_fields);
  const currentAnswerType = getAnswerType(currentItem.answer_type);
  const currentNonGraded = isNonGradedQuestion(currentItem);
  const currentLocked = isQuestionLocked(currentItem, safeCurrentIndex);
  const currentPassed = isQuestionPassed(currentItem, safeCurrentIndex);
  const currentPassingScore = getPassingScore(currentItem);
  const currentMaxScore = getMaxScore(currentItem);
  const currentProgress = getQuestionProgress(currentItem, safeCurrentIndex);

  const goToQuestion = (targetIndex) => {
    const targetQuestion = questions[targetIndex];

    if (!targetQuestion) return;

    if (isQuestionLocked(targetQuestion, targetIndex)) {
      alert("Selesaikan soal sebelumnya terlebih dahulu.");
      return;
    }

    setCurrentQuestionIndex(targetIndex);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToPreviousQuestion = () => {
    const prevIndex = Math.max(safeCurrentIndex - 1, 0);
    goToQuestion(prevIndex);
  };

  const goToNextQuestion = () => {
    if (!currentPassed) {
      alert("Cek jawaban dan tuntaskan soal ini terlebih dahulu.");
      return;
    }

    const nextIndex = Math.min(safeCurrentIndex + 1, questions.length - 1);
    goToQuestion(nextIndex);
  };

  const renderQuestionNavigation = () => {
    return (
      <div className="quiz-question-nav">
        {questions.map((item, index) => {
          const locked = isQuestionLocked(item, index);
          const passed = isQuestionPassed(item, index);
          const active = index === safeCurrentIndex;

          return (
            <button
              key={item.id}
              type="button"
              className={`${active ? "active" : ""} ${
                passed ? "passed" : ""
              } ${locked ? "locked" : ""}`}
              onClick={() => goToQuestion(index)}
              disabled={locked}
            >
              {passed ? "✓" : index + 1}
            </button>
          );
        })}
      </div>
    );
  };

  const renderCurrentQuestion = () => {
    return (
      <>
        <div className="quiz-header compact wizard-heading">
          <div className="quiz-badge">
            Soal {safeCurrentIndex + 1} dari {questions.length}
          </div>

          <p>
            Fokus selesaikan satu soal terlebih dahulu. Soal berikutnya akan
            dibuka setelah jawaban dinyatakan tuntas.
          </p>
        </div>

        {renderQuestionNavigation()}

        <div
          className={`quiz-card question-step-card quiz-question-panel ${
            currentLocked ? "question-locked" : ""
          } ${currentPassed ? "question-passed" : ""}`}
        >
          {currentLocked && (
            <div className="question-lock-layer">
              <div className="question-lock-content">
                <div className="lock-icon">🔒</div>
                <strong>Soal terkunci</strong>
                <p>
                  {currentNonGraded
                    ? "Isi bagian sebelumnya terlebih dahulu."
                    : `Selesaikan soal sebelumnya dengan nilai minimal ${currentPassingScore}.`}
                </p>
              </div>
            </div>
          )}

          <div className="quiz-card-top">
            <div className="quiz-number">{safeCurrentIndex + 1}</div>

            <div className="quiz-soal-area">
              <div className="quiz-question-text">{currentItem.question}</div>
            </div>
          </div>

          <div className="question-meta-top">
            <div className="question-meta-group">
              <span className="question-meta-label">Status</span>

              <span
                className={
                  currentPassed
                    ? "question-status-pill passed"
                    : currentLocked
                    ? "question-status-pill locked"
                    : "question-status-pill active"
                }
              >
                {currentPassed
                  ? currentNonGraded
                    ? "Refleksi Tersimpan"
                    : "Tuntas"
                  : currentLocked
                  ? "Terkunci"
                  : currentNonGraded
                  ? "Perlu Diisi"
                  : "Sedang Dikerjakan"}
              </span>
            </div>

            <div className="question-meta-group">
              <span className="question-meta-label">
                {currentNonGraded ? "Penilaian" : "Nilai Saat Ini"}
              </span>

              <span className="question-score-pill">
                {currentNonGraded
                  ? "Tidak Dinilai"
                  : `${Number(currentProgress.latest_score) || 0}/${currentMaxScore}`}
              </span>
            </div>
          </div>

          {currentItem.image_url && (
            <div className="quiz-image-wrapper">
              <img
                src={currentItem.image_url}
                alt={`Gambar soal ${safeCurrentIndex + 1}`}
                className="quiz-image clickable"
                onClick={() =>
                  !currentLocked && setPreviewImage(currentItem.image_url)
                }
              />
            </div>
          )}

          <div className="quiz-answer-area">
            <label className="quiz-answer-label">Jawaban</label>

            {currentAnswerType === "text" &&
              currentFields.map((field) => (
                <div key={field} className="quiz-answer-field">
                  <label className="quiz-answer-sub-label">{field}</label>

                  <textarea
                    className="quiz-textarea quiz-textarea-small"
                    value={answers[currentItem.id]?.[field] || ""}
                    disabled={currentLocked || currentPassed}
                    onChange={(e) =>
                      handleChange(
                        currentItem.id,
                        field,
                        e.target.value,
                        currentAnswerType
                      )
                    }
                    placeholder={
                      currentNonGraded
                        ? "Tulis refleksi di sini..."
                        : "Tulis jawaban di sini..."
                    }
                  />
                </div>
              ))}

            {currentAnswerType === "image" &&
              currentFields.map((field) => {
                const uploadKey = `${currentItem.id}-${field}`;
                const uploadedImage = answers[currentItem.id]?.[field];

                return (
                  <div key={field} className="quiz-answer-field">
                    <label className="quiz-answer-sub-label">{field}</label>

                    <input
                      type="file"
                      accept="image/*"
                      className="quiz-file-input"
                      disabled={currentLocked || currentPassed}
                      onChange={(e) =>
                        handleImageUpload(
                          currentItem.id,
                          field,
                          e.target.files[0]
                        )
                      }
                    />

                    {uploading[uploadKey] && (
                      <p className="quiz-upload-status">
                        Sedang mengupload gambar...
                      </p>
                    )}

                    {uploadedImage?.image_url && (
                      <div className="quiz-upload-preview">
                        <p>
                          Gambar berhasil diupload
                          {uploadedImage?.image_name
                            ? `: ${uploadedImage.image_name}`
                            : ""}
                        </p>

                        <img
                          src={uploadedImage.image_url}
                          alt={`Preview ${field}`}
                          className="quiz-image clickable"
                          onClick={() =>
                            setPreviewImage(uploadedImage.image_url)
                          }
                        />

                        {!currentPassed && !currentLocked && (
                          <button
                            type="button"
                            className="quiz-remove-image-btn"
                            onClick={() =>
                              handleRemoveImage(currentItem.id, field)
                            }
                          >
                            Hapus Gambar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {currentAnswerType === "text_image" &&
              currentFields.map((field) => {
                const uploadKey = `${currentItem.id}-${field}`;
                const fieldAnswer = answers[currentItem.id]?.[field] || {};
                const textValue =
                  typeof fieldAnswer === "object" ? fieldAnswer.text || "" : "";
                const uploadedImage =
                  typeof fieldAnswer === "object" ? fieldAnswer : null;

                return (
                  <div key={field} className="quiz-answer-field">
                    <label className="quiz-answer-sub-label">{field}</label>

                    <textarea
                      className="quiz-textarea quiz-textarea-small"
                      value={textValue}
                      disabled={currentLocked || currentPassed}
                      onChange={(e) =>
                        handleChange(
                          currentItem.id,
                          field,
                          e.target.value,
                          currentAnswerType
                        )
                      }
                      placeholder="Tulis jawaban di sini..."
                    />

                    <label className="quiz-answer-sub-label">
                      Upload Gambar Jawaban
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      className="quiz-file-input"
                      disabled={currentLocked || currentPassed}
                      onChange={(e) =>
                        handleImageUpload(
                          currentItem.id,
                          field,
                          e.target.files[0]
                        )
                      }
                    />

                    {uploading[uploadKey] && (
                      <p className="quiz-upload-status">
                        Sedang mengupload gambar...
                      </p>
                    )}

                    {uploadedImage?.image_url && (
                      <div className="quiz-upload-preview">
                        <p>
                          Gambar berhasil diupload
                          {uploadedImage?.image_name
                            ? `: ${uploadedImage.image_name}`
                            : ""}
                        </p>

                        <img
                          src={uploadedImage.image_url}
                          alt={`Preview ${field}`}
                          className="quiz-image clickable"
                          onClick={() =>
                            setPreviewImage(uploadedImage.image_url)
                          }
                        />

                        {!currentPassed && !currentLocked && (
                          <button
                            type="button"
                            className="quiz-remove-image-btn"
                            onClick={() =>
                              handleRemoveImage(currentItem.id, field)
                            }
                          >
                            Hapus Gambar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {renderFeedback(currentItem, safeCurrentIndex)}

          {!currentLocked && (
            <div className="question-check-area">
              <button
                type="button"
                className={currentPassed ? "btn-secondary" : "btn-primary"}
                disabled={
                  currentPassed ||
                  checkingQuestionId === currentItem.id ||
                  loading ||
                  isAnyUploading
                }
                onClick={() =>
                  handleCheckQuestion(currentItem, safeCurrentIndex)
                }
              >
                {currentPassed
                  ? currentNonGraded
                    ? "Refleksi Tersimpan"
                    : "Sudah Tuntas"
                  : checkingQuestionId === currentItem.id
                  ? currentNonGraded
                    ? "Menyimpan..."
                    : "Mengecek..."
                  : currentNonGraded
                  ? "Simpan Refleksi"
                  : "Cek Jawaban"}
              </button>
            </div>
          )}
        </div>

        <div className="quiz-wizard-bottom-nav">
          <button
            type="button"
            className="btn-light-quiz"
            onClick={goToPreviousQuestion}
            disabled={safeCurrentIndex === 0}
          >
            ← Soal Sebelumnya
          </button>

          {safeCurrentIndex < questions.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={goToNextQuestion}
              disabled={!currentPassed}
            >
              Lanjut ke Soal {safeCurrentIndex + 2} →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || isAnyUploading || !allRequiredQuestionsPassed}
            >
              {loading
                ? "Mengirim..."
                : isAnyUploading
                  ? "Menunggu Upload..."
                  : allRequiredQuestionsPassed
                    ? "Kirim Semua Jawaban"
                    : "Selesaikan Semua Bagian Dulu"}
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="quiz-page">
      <div className="quiz-wrapper quiz-wizard-wrapper">
        <div className="quiz-greeting-card quiz-sticky-progress">
          <div>
            <span className="quiz-greeting-label">Halo, {name}</span>

            <h2>
              {started
                ? `Soal ${safeCurrentIndex + 1} dari ${questions.length}`
                : "Siap mengerjakan LKPD hari ini?"}
            </h2>

            <p>
              {started
                ? "Kerjakan LKPD secara bertahap. Setelah jawaban dicek dan tuntas, kamu bisa melanjutkan ke soal berikutnya."
                : `LKPD pertemuan ${id} dikerjakan secara berurutan. Bacalah pendahuluan terlebih dahulu sebelum mulai menjawab soal.`}
            </p>
          </div>

          <div className="quiz-progress-box">
            <div className="quiz-progress-text">
              <span>Progres Kamu</span>

              <strong>
                {completedCount}/{questions.length}
              </strong>
            </div>

            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <small>{progressPercent}% selesai</small>
          </div>
        </div>

        {!started ? (
          <div className="quiz-card quiz-intro-card quiz-intro-start-card">
            <h4 className="quiz-intro-heading">Pendahuluan</h4>

            <p className="quiz-question-text quiz-intro-text">
              {lkpdInfo.pendahuluan_lkpd || "-"}
            </p>

            <div className="quiz-start-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setStarted(true);
                  setCurrentQuestionIndex(0);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Mulai Mengerjakan
              </button>
            </div>
          </div>
        ) : (
          renderCurrentQuestion()
        )}
      </div>

      {previewImage && (
        <div className="image-modal" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" />
        </div>
      )}
    </div>
  );
}

export default QuizPage;