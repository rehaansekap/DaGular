import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/QuizNilaiSaya.css";

function QuizNilaiSaya() {
  const navigate = useNavigate();

  const user_id = localStorage.getItem("user_id");
  const API_URL = "http://localhost:5000";
  const PASSING_SCORE = 3;

  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailAnswers, setDetailAnswers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const safeJsonParse = (value, fallback = null) => {
    if (!value) return fallback;
    if (typeof value === "object") return value;

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const normalizeText = (value = "") => {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  };

  const formatKeyLabel = (key) => {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const isProcessedStatus = (status) => {
    return ["graded", "completed", "revision", "needs_review"].includes(
      String(status || "").toLowerCase()
    );
  };

  const getResultStatusText = (status) => {
    const cleanStatus = String(status || "").toLowerCase();

    if (cleanStatus === "completed" || cleanStatus === "graded") {
      return "Sudah Dinilai";
    }

    if (cleanStatus === "revision") {
      return "Perlu Revisi";
    }

    if (cleanStatus === "needs_review") {
      return "Perlu Ditinjau Guru";
    }

    return "Belum Dinilai";
  };

  const getResultStatusClass = (status, passed = false) => {
    const cleanStatus = String(status || "").toLowerCase();

    if (!isProcessedStatus(cleanStatus)) return "pending";
    if (cleanStatus === "revision") return "revision";
    if (cleanStatus === "needs_review") return "pending";
    if (passed) return "passed";

    return "revision";
  };

  const isNonGradedAnswer = (item = {}) => {
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

  const getPassingScore = (item = {}) => {
    if (isNonGradedAnswer(item)) return 0;
    return Number(item.passing_score) || PASSING_SCORE;
  };

  const getMaxScore = (item = {}) => {
    if (isNonGradedAnswer(item)) return 0;
    return Number(item.max_score) || 4;
  };

  const getAnswerScore = (item = {}) => {
    return Number(item.score ?? item.final_score ?? item.auto_score ?? 0);
  };

  const getScoreStatus = (item = {}) => {
    if (isNonGradedAnswer(item)) {
      return {
        text: "Tidak Dinilai",
        className: "student-score-status neutral",
      };
    }

    const score = getAnswerScore(item);
    const passingScore = getPassingScore(item);

    if (score >= passingScore) {
      return {
        text: "Tuntas",
        className: "student-score-status passed",
      };
    }

    if (score > 0) {
      return {
        text: "Perlu Revisi",
        className: "student-score-status revision",
      };
    }

    return {
      text: "Belum Sesuai",
      className: "student-score-status failed",
    };
  };

  const getReadableText = (value) => {
    if (value === null || value === undefined || value === "") return "";

    if (typeof value === "string") {
      return value.replace(/\\"/g, '"');
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    return "";
  };

  const getRevisionNote = (item = {}, passed = false) => {
    const possibleNotes = [
      item.teacher_note,
      item.feedback,
      item.note,
      item.revision_note,
      item.revisionSuggestion,
      item.revision_suggestion,
      item.auto_feedback,
      item.comment,
    ];

    const note = possibleNotes.find(
      (value) => typeof value === "string" && value.trim()
    );

    if (note) return note.trim();

    if (passed) {
      return "Jawaban sudah memenuhi kriteria penilaian. Pertahankan kualitas jawaban pada LKPD berikutnya.";
    }

    return "Jawaban belum memenuhi kriteria minimal. Perbaiki dengan menambahkan penjelasan yang lebih lengkap, alasan yang jelas, dan contoh yang sesuai dengan pertanyaan.";
  };

  const renderImagePreview = (imageUrl, imageName = "") => {
    if (!imageUrl) return null;

    return (
      <div className="answer-image-preview">
        <img src={imageUrl} alt={imageName || "Jawaban gambar"} />
        {imageName && <p>{imageName}</p>}
      </div>
    );
  };

  const renderAnswerValue = (value) => {
    if (!value) {
      return <i>Tidak ada jawaban</i>;
    }

    if (typeof value === "string") {
      const cleanText = value.trim();

      return cleanText ? (
        <div className="normal-answer">{cleanText.replace(/\\"/g, '"')}</div>
      ) : (
        <i>Tidak ada jawaban</i>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <i>Tidak ada jawaban</i>;

      return (
        <div className="formatted-answer">
          {value.map((item, index) => (
            <div className="answer-row" key={index}>
              <div className="answer-label">Jawaban {index + 1}</div>
              <div className="answer-value">{renderAnswerValue(item)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      const imageUrl = value.image_url || value.answer_image || value.url || "";
      const imageName = value.image_name || value.filename || "";
      const textValue = getReadableText(value.text || value.answer || value.value);

      const ignoredKeys = new Set([
        "image_url",
        "answer_image",
        "url",
        "image_name",
        "filename",
        "text",
        "answer",
        "value",
      ]);

      const otherEntries = Object.entries(value).filter(([key, entryValue]) => {
        if (ignoredKeys.has(key)) return false;
        if (entryValue === null || entryValue === undefined || entryValue === "") {
          return false;
        }
        return true;
      });

      return (
        <div className="formatted-answer inner">
          {textValue && <div className="normal-answer">{textValue}</div>}

          {renderImagePreview(imageUrl, imageName)}

          {otherEntries.map(([key, entryValue]) => (
            <div className="answer-row" key={key}>
              <div className="answer-label">{formatKeyLabel(key)}</div>
              <div className="answer-value">{renderAnswerValue(entryValue)}</div>
            </div>
          ))}

          {!textValue && !imageUrl && otherEntries.length === 0 && (
            <i>Tidak ada jawaban</i>
          )}
        </div>
      );
    }

    return <div className="normal-answer">{String(value)}</div>;
  };

  const formatAnswer = (answerText, answerImage = null) => {
    const parsed = safeJsonParse(answerText, null);
    const hasAnswerImage =
      typeof answerImage === "string" && answerImage.trim() !== "";

    if (!parsed && !hasAnswerImage) {
      return <i>Tidak ada jawaban</i>;
    }

    return (
      <div className="formatted-answer">
        {parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (
          Object.entries(parsed).length > 0 ? (
            Object.entries(parsed).map(([key, value]) => (
              <div className="answer-row" key={key}>
                <div className="answer-label">{formatKeyLabel(key)}</div>
                <div className="answer-value">{renderAnswerValue(value)}</div>
              </div>
            ))
          ) : (
            <i>Tidak ada jawaban</i>
          )
        ) : parsed ? (
          renderAnswerValue(parsed)
        ) : (
          <div className="normal-answer">{answerText}</div>
        )}

        {hasAnswerImage && renderImagePreview(answerImage)}
      </div>
    );
  };

  const loadResultDetail = async (resultId) => {
    if (!user_id) return;

    try {
      setLoadingDetail(true);

      const res = await fetch(
        `${API_URL}/api/quiz/my-results/${user_id}/${resultId}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengambil detail nilai.");
        return;
      }

      setSelectedResult(data.data.result);
      setDetailAnswers(data.data.answers || []);
    } catch (error) {
      console.error("Gagal mengambil detail hasil quiz:", error);
      alert("Gagal mengambil detail nilai.");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const loadMyResults = async () => {
      if (!user_id) return;

      try {
        setLoadingList(true);

        const res = await fetch(`${API_URL}/api/quiz/my-results/${user_id}`);
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Gagal mengambil daftar nilai.");
          return;
        }

        setResults(data.data || []);
      } catch (error) {
        console.error("Gagal mengambil hasil quiz:", error);
        alert("Gagal mengambil daftar nilai.");
      } finally {
        setLoadingList(false);
      }
    };

    loadMyResults();
  }, [user_id]);

  const selectedProcessed = isProcessedStatus(selectedResult?.status);

  const gradedAnswers = detailAnswers.filter(
    (item) => !isNonGradedAnswer(item)
  );

  const selectedPassed =
    gradedAnswers.length > 0 &&
    gradedAnswers.every((item) => {
      return getAnswerScore(item) >= getPassingScore(item);
    });

  const selectedMaxScore = gradedAnswers.reduce((sum, item) => {
    return sum + getMaxScore(item);
  }, 0);

  const selectedScoreFromAnswers = gradedAnswers.reduce((sum, item) => {
    return sum + getAnswerScore(item);
  }, 0);

  const selectedScore = selectedProcessed
    ? Number(selectedResult?.score ?? selectedScoreFromAnswers ?? 0)
    : 0;

  const selectedStatusClass = getResultStatusClass(
    selectedResult?.status,
    selectedPassed
  );

  const handleReviseClick = () => {
    if (!selectedResult?.pertemuan) return;
    navigate(`/quiz/${selectedResult.pertemuan}`);
  };

  return (
    <div className="nilai-saya-page">
      <div className="nilai-saya-container">
        <div className="nilai-saya-header">
          <h1 className="nilai-saya-title">Nilai LKPD Saya</h1>

          <p className="nilai-saya-desc">
            Lihat jawaban yang sudah kamu kirim, status penilaian, dan catatan
            revisi dari LKPD yang telah dikerjakan.
          </p>
        </div>

        <div className="nilai-saya-layout">
          <aside className="nilai-saya-sidebar">
            <div className="sidebar-title-row">
              <div>
                <h2>Daftar LKPD</h2>
                <p>Pilih salah satu hasil untuk melihat detailnya.</p>
              </div>
            </div>

            {loadingList ? (
              <p className="empty-text">Memuat data...</p>
            ) : results.length === 0 ? (
              <p className="empty-text">Belum ada hasil LKPD.</p>
            ) : (
              <div className="submission-list">
                {results.map((item) => {
                  const processed = isProcessedStatus(item.status);
                  const passed =
                    processed &&
                    item.status !== "revision" &&
                    Number(item.total_questions || 0) > 0 &&
                    Number(item.completed_questions || 0) >=
                      Number(item.total_questions || 0);

                  const statusClass = getResultStatusClass(item.status, passed);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`submission-card ${
                        selectedResult?.id === item.id ? "active" : ""
                      }`}
                      onClick={() => loadResultDetail(item.id)}
                    >
                      <div className="submission-card-top">
                        <div>
                          <h3>LKPD Pertemuan {item.pertemuan}</h3>

                          <span className={`nilai-status-badge ${statusClass}`}>
                            {getResultStatusText(item.status)}
                          </span>
                        </div>

                        <div className={`submission-score-bubble ${statusClass}`}>
                          <strong>{processed ? item.score ?? 0 : "-"}</strong>
                          <small>Nilai</small>
                        </div>
                      </div>

                      <p className="submission-date">
                        {formatDateTime(item.created_at)}
                      </p>

                      {processed && !passed && (
                        <p className="submission-hint revision">
                          Perlu diperbaiki
                        </p>
                      )}

                      {processed && passed && (
                        <p className="submission-hint passed">Sudah tuntas</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <main className="nilai-saya-content">
            {!selectedResult ? (
              <div className="empty-box">
                <p>Pilih LKPD di sebelah kiri untuk melihat detail hasilnya.</p>
              </div>
            ) : loadingDetail ? (
              <div className="empty-box">
                <p>Memuat detail LKPD...</p>
              </div>
            ) : (
              <>
                <section className="result-summary-card">
                  <div className={`result-score-block ${selectedStatusClass}`}>
                    <span>Total Nilai</span>

                    <strong>{selectedProcessed ? selectedScore : "-"}</strong>

                    <small>
                      {selectedProcessed && selectedMaxScore > 0
                        ? `dari ${selectedMaxScore}`
                        : "Skor akhir"}
                    </small>
                  </div>

                  <div className="result-summary-content">
                    <div className="result-summary-top">
                      <div>
                        <h2>Detail Hasil LKPD</h2>
                        <p>LKPD Pertemuan {selectedResult.pertemuan}</p>
                      </div>

                      <span className={`nilai-status-badge ${selectedStatusClass}`}>
                        {getResultStatusText(selectedResult.status)}
                      </span>
                    </div>

                    <div className="result-meta-grid">
                      <div>
                        <span>Pertemuan</span>
                        <strong>{selectedResult.pertemuan}</strong>
                      </div>

                      <div>
                        <span>Tanggal Submit</span>
                        <strong>{formatDateTime(selectedResult.created_at)}</strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>{getResultStatusText(selectedResult.status)}</strong>
                      </div>
                    </div>
                  </div>
                </section>

                <div
                  className={
                    selectedProcessed && selectedPassed
                      ? "pjbl-student-banner passed"
                      : "pjbl-student-banner failed"
                  }
                >
                  <div className="banner-icon">
                    {selectedProcessed && selectedPassed ? "✓" : "⚠️"}
                  </div>

                  <div>
                    {!selectedProcessed ? (
                      <>
                        <strong>Menunggu penilaian</strong>
                        <p>Jawabanmu sudah masuk dan sedang diproses.</p>
                      </>
                    ) : selectedPassed ? (
                      <>
                        <strong>LKPD sudah tuntas.</strong>
                        <p>
                          Semua bagian yang dinilai sudah memenuhi batas
                          minimal.
                        </p>
                      </>
                    ) : (
                      <>
                        <strong>LKPD perlu diperbaiki.</strong>
                        <p>
                          Masih ada bagian yang belum memenuhi batas minimal.
                          Baca catatan revisi di bawah, lalu perbaiki jawabanmu.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="jawaban-list">
                  {detailAnswers.map((item, index) => {
                    const processed = selectedProcessed;
                    const nonGraded = isNonGradedAnswer(item);
                    const status = getScoreStatus(item);
                    const score = getAnswerScore(item);
                    const maxScore = getMaxScore(item);
                    const passed =
                      nonGraded || score >= getPassingScore(item);

                    return (
                      <article className="jawaban-card" key={item.id || index}>
                        <div className="student-question-head">
                          <div>
                            <span className="question-mini-label">
                              {nonGraded ? "Refleksi" : `Soal ${index + 1}`}
                            </span>

                            <h3>
                              {nonGraded
                                ? "Self Reflection"
                                : `Soal ${index + 1}`}
                            </h3>
                          </div>

                          {processed && (
                            <span className={status.className}>
                              {status.text}
                            </span>
                          )}
                        </div>

                        <div className="jawaban-group">
                          <label>Pertanyaan</label>
                          <div className="readonly-box question-box">
                            {item.question}
                          </div>
                        </div>

                        {item.image_url && (
                          <div className="jawaban-group">
                            <label>Gambar Soal</label>

                            <img
                              src={item.image_url}
                              alt={`Soal ${index + 1}`}
                              className="quiz-image"
                            />
                          </div>
                        )}

                        <div className="jawaban-group">
                          <label>
                            {nonGraded ? "Jawaban Refleksi" : "Jawaban Saya"}
                          </label>

                          <div className="readonly-box answer-box">
                            {formatAnswer(item.answer_text, item.answer_image)}
                          </div>
                        </div>

                        <div className="jawaban-footer-row">
                          <div className="jawaban-score-box">
                            <span>{nonGraded ? "Penilaian" : "Nilai"}</span>

                            <strong>
                              {nonGraded
                                ? "Tidak Dinilai"
                                : processed
                                ? `${score} / ${maxScore}`
                                : "Belum dinilai"}
                            </strong>
                          </div>

                          {processed && !nonGraded && (
                            <div
                              className={
                                passed
                                  ? "revision-note passed"
                                  : "revision-note failed"
                              }
                            >
                              <strong>
                                {passed ? "Catatan" : "Catatan Revisi"}
                              </strong>

                              <p>{getRevisionNote(item, passed)}</p>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {selectedProcessed && !selectedPassed && (
                  <div className="revision-cta-bar">
                    <div>
                      <strong>Siap memperbaiki jawaban?</strong>
                      <p>
                        Kamu bisa kembali ke halaman pengerjaan LKPD untuk
                        memperbaiki jawaban yang belum sesuai.
                      </p>
                    </div>

                    <button type="button" onClick={handleReviseClick}>
                      ✏️ Perbaiki & Kirim Ulang LKPD →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default QuizNilaiSaya;