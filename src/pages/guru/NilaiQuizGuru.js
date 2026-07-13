import React, { useEffect, useMemo, useState } from "react";
import "../../style/NilaiQuizGuru.css";

function NilaiQuizGuru() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoGrading, setAutoGrading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const PASSING_SCORE = 3;

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`;
  };

  const safeJsonParse = (value, fallback = null) => {
    if (!value) return fallback;
    if (typeof value === "object") return value;

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const formatKeyLabel = (key) => {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getAnswerStatusText = (score) => {
    const numericScore = Number(score) || 0;

    if (numericScore >= PASSING_SCORE) return "Tuntas";
    if (numericScore > 0) return "Perlu revisi";
    return "Belum sesuai";
  };

  const renderStudentAnswer = (answerText) => {
    if (!answerText) return <i>Belum ada jawaban teks</i>;

    const parsed = safeJsonParse(answerText);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return (
        <div className="nqg-structured-answer">
          {Object.entries(parsed).map(([key, value], index) => (
            <div className="nqg-answer-item" key={index}>
              <div className="nqg-answer-label">{formatKeyLabel(key)}</div>
              <div className="nqg-answer-value">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value || "-"}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(parsed)) {
      return (
        <div className="nqg-structured-answer">
          {parsed.map((value, index) => (
            <div className="nqg-answer-item" key={index}>
              <div className="nqg-answer-label">Jawaban {index + 1}</div>
              <div className="nqg-answer-value">{value || "-"}</div>
            </div>
          ))}
        </div>
      );
    }

    return <div>{answerText}</div>;
  };

  const renderRubricDetail = (item) => {
    const detail =
      safeJsonParse(item.rubric_detail) ||
      safeJsonParse(item.teacher_note)?.rubric_detail ||
      null;

    if (!detail || !Array.isArray(detail.fields)) return null;

    return (
      <div className="nqg-rubric-detail-box">
        <h4>Hasil Penilaian Rubrik</h4>

        {detail.fields.map((field, index) => (
          <div className="nqg-rubric-detail-row" key={index}>
            <div>
              <strong>{formatKeyLabel(field.field_key)}</strong>
              <p>
                Keyword cocok:{" "}
                {field.matched_keywords?.length > 0
                  ? field.matched_keywords.join(", ")
                  : "Tidak ada"}
              </p>
              <p>{field.feedback || "Belum ada feedback."}</p>
            </div>

            <span
              className={
                Number(field.score) >= PASSING_SCORE
                  ? "nqg-rubric-score-pill nqg-passed"
                  : "nqg-rubric-score-pill nqg-failed"
              }
            >
              {field.score}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const loadResults = async () => {
    try {
      setLoadingList(true);

      const res = await fetch(`${API_URL}/api/quiz/results`);
      const data = await res.json();

      setResults(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil hasil quiz:", error);
      alert("Gagal mengambil daftar submission.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (resultId) => {
    try {
      setLoadingDetail(true);

      const res = await fetch(`${API_URL}/api/quiz/results/${resultId}`);
      const data = await res.json();

      const result = data.data?.result || null;
      const answerList = data.data?.answers || [];

      setSelectedResult(result);

      setAnswers(
        answerList.map((item) => ({
          answer_id: item.id,
          question_id: item.question_id,
          question: item.question,
          answer_text: item.answer_text,
          answer_image: item.answer_image,
          score: Number(item.score) || 0,
          teacher_note: item.teacher_note || "",
          rubric_detail: item.rubric_detail || null,
          is_passed:
            item.is_passed !== undefined
              ? Number(item.is_passed) === 1
              : Number(item.score) >= PASSING_SCORE,
        }))
      );
    } catch (error) {
      console.error("Gagal mengambil detail hasil quiz:", error);
      alert("Gagal mengambil detail submission.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedResult(null);
    setAnswers([]);
  };

  const handleScoreChange = (index, value) => {
    const updated = [...answers];
    const numericValue = Math.max(0, Math.min(4, Number(value) || 0));

    updated[index].score = numericValue;
    updated[index].is_passed = numericValue >= PASSING_SCORE;

    setAnswers(updated);
  };

  const handleNoteChange = (index, value) => {
    const updated = [...answers];
    updated[index].teacher_note = value;
    setAnswers(updated);
  };

  const totalScoreDraft = useMemo(() => {
    return answers.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
  }, [answers]);

  const allQuestionsPassed = useMemo(() => {
    if (answers.length === 0) return false;
    return answers.every((item) => Number(item.score) >= PASSING_SCORE);
  }, [answers]);

  const pendingResults = useMemo(
    () => results.filter((item) => item.status !== "graded"),
    [results]
  );

  const gradedResults = useMemo(
    () => results.filter((item) => item.status === "graded"),
    [results]
  );

  const filteredResults = useMemo(() => {
    if (activeFilter === "pending") return pendingResults;
    if (activeFilter === "graded") return gradedResults;
    return results;
  }, [results, pendingResults, gradedResults, activeFilter]);

  const handleAutoGrade = async () => {
    if (!selectedResult) return;

    const confirmAutoGrade = window.confirm(
      "Nilai otomatis akan dihitung dari rubrik. Lanjutkan?"
    );

    if (!confirmAutoGrade) return;

    try {
      setAutoGrading(true);

      const res = await fetch(
        `${API_URL}/api/quiz/results/${selectedResult.id}/auto-grade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menilai otomatis.");
      }

      alert(data.message || "Penilaian otomatis berhasil.");

      await loadResults();
      await loadDetail(selectedResult.id);
    } catch (error) {
      console.error("Gagal menilai otomatis:", error);
      alert(error.message || "Terjadi kesalahan saat menilai otomatis.");
    } finally {
      setAutoGrading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedResult) return;

    try {
      setSaving(true);

      const payload = {
        passing_score: PASSING_SCORE,
        answers: answers.map((item) => ({
          answer_id: item.answer_id,
          score: Number(item.score) || 0,
          teacher_note: item.teacher_note || "",
          is_passed: Number(item.score) >= PASSING_SCORE ? 1 : 0,
        })),
      };

      const res = await fetch(
        `${API_URL}/api/quiz/results/${selectedResult.id}/grade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan nilai.");
      }

      alert(data.message || "Nilai berhasil disimpan.");

      await loadResults();
      await loadDetail(selectedResult.id);
    } catch (error) {
      console.error("Gagal menyimpan nilai:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan nilai.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="nqg-page">
      <div className="nqg-container">
        <div className="nqg-hero">
          <div>
            <span className="nqg-badge">Panel Guru</span>
            <h1 className="nqg-title">Penilaian LKPD Siswa</h1>
            <p className="nqg-desc">
              Periksa jawaban siswa, jalankan penilaian otomatis dari rubrik,
              lalu pastikan siswa tuntas sebelum lanjut ke soal berikutnya.
            </p>
          </div>

          <div className="nqg-summary">
            <div className="nqg-summary-card">
              <span>Total</span>
              <strong>{results.length}</strong>
            </div>
            <div className="nqg-summary-card">
              <span>Belum Dinilai</span>
              <strong>{pendingResults.length}</strong>
            </div>
            <div className="nqg-summary-card">
              <span>Sudah Dinilai</span>
              <strong>{gradedResults.length}</strong>
            </div>
          </div>
        </div>

        <div className="nqg-layout">
          <aside className="nqg-sidebar">
            <div className="nqg-sidebar-head">
              <h2>Submission</h2>

              <div className="nqg-filter-group">
                <button
                  type="button"
                  className={
                    activeFilter === "all"
                      ? "nqg-filter-btn nqg-active"
                      : "nqg-filter-btn"
                  }
                  onClick={() => setActiveFilter("all")}
                >
                  Semua
                </button>

                <button
                  type="button"
                  className={
                    activeFilter === "pending"
                      ? "nqg-filter-btn nqg-active"
                      : "nqg-filter-btn"
                  }
                  onClick={() => setActiveFilter("pending")}
                >
                  Belum
                </button>

                <button
                  type="button"
                  className={
                    activeFilter === "graded"
                      ? "nqg-filter-btn nqg-active"
                      : "nqg-filter-btn"
                  }
                  onClick={() => setActiveFilter("graded")}
                >
                  Selesai
                </button>
              </div>
            </div>

            {loadingList ? (
              <p className="nqg-empty-text">Memuat data...</p>
            ) : filteredResults.length === 0 ? (
              <p className="nqg-empty-text">Tidak ada submission.</p>
            ) : (
              <div className="nqg-submission-list">
                {filteredResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nqg-submission-card ${selectedResult?.id === item.id ? "nqg-active" : ""
                      }`}
                    onClick={() => loadDetail(item.id)}
                  >
                    <div className="nqg-submission-top">
                      <h3>{item.student_name || `User #${item.user_id}`}</h3>

                      <span
                        className={
                          item.status === "graded"
                            ? "nqg-status-badge nqg-graded"
                            : "nqg-status-badge nqg-pending"
                        }
                      >
                        {item.status === "graded" ? "Dinilai" : "Pending"}
                      </span>
                    </div>

                    <div className="nqg-submission-meta">
                      <p>
                        <span>Pertemuan</span>
                        <strong>{item.pertemuan}</strong>
                      </p>

                      <p>
                        <span>Nilai</span>
                        <strong>{item.score ?? 0}</strong>
                      </p>
                    </div>

                    <div className="nqg-submission-date">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("id-ID")
                        : "-"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="nqg-content">
            {!selectedResult ? (
              <div className="nqg-empty-box">
                <div className="nqg-empty-illustration">📄</div>
                <h3>Pilih submission siswa</h3>
                <p>
                  Jawaban siswa akan tampil di sini untuk diperiksa dan dinilai.
                </p>
              </div>
            ) : loadingDetail ? (
              <div className="nqg-empty-box">
                <p>Memuat detail jawaban...</p>
              </div>
            ) : (
              <>
                <div className="nqg-detail-header">
                  <div>
                    <span className="nqg-detail-label">Detail LKPD</span>
                    <h2>
                      {selectedResult.student_name ||
                        `User #${selectedResult.user_id}`}
                    </h2>
                    <p className="nqg-detail-subtitle">
                      Pertemuan {selectedResult.pertemuan} •{" "}
                      {selectedResult.status === "graded"
                        ? "Sudah dinilai"
                        : "Belum dinilai"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="nqg-btn-secondary"
                    onClick={handleCloseDetail}
                  >
                    Tutup
                  </button>
                </div>

                <div className="nqg-info-grid">
                  <div className="nqg-info-card">
                    <span>Nama Siswa</span>
                    <strong>
                      {selectedResult.student_name ||
                        `User #${selectedResult.user_id}`}
                    </strong>
                  </div>

                  <div className="nqg-info-card">
                    <span>Pertemuan</span>
                    <strong>{selectedResult.pertemuan}</strong>
                  </div>

                  <div className="nqg-info-card">
                    <span>Ketuntasan</span>
                    <strong>{allQuestionsPassed ? "Tuntas" : "Belum Tuntas"}</strong>
                  </div>

                  <div className="nqg-info-card nqg-highlight">
                    <span>Total Nilai</span>
                    <strong>{totalScoreDraft}</strong>
                  </div>
                </div>

                <div className="nqg-rule-box">
                  <strong>Aturan PJBL:</strong> siswa boleh lanjut jika setiap
                  soal atau bagian jawaban mendapatkan nilai minimal{" "}
                  <b>{PASSING_SCORE}</b>. Nilai <b>3</b> dan <b>4</b> dianggap
                  tuntas. Nilai <b>0</b>, <b>1</b>, dan <b>2</b> harus revisi.
                </div>

                <div className="nqg-answer-list">
                  {answers.map((item, index) => (
                    <div className="nqg-answer-card" key={item.answer_id}>
                      <div className="nqg-answer-card-head">
                        <div>
                          <span className="nqg-question-count">
                            Soal {index + 1}
                          </span>
                          <h3>Pemeriksaan Jawaban</h3>

                          <span
                            className={
                              Number(item.score) >= PASSING_SCORE
                                ? "nqg-answer-status nqg-passed"
                                : "nqg-answer-status nqg-failed"
                            }
                          >
                            {getAnswerStatusText(item.score)}
                          </span>
                        </div>

                        <div className="nqg-score-inline">
                          <label>Nilai</label>
                          <input
                            type="number"
                            min="0"
                            max="4"
                            value={item.score}
                            onChange={(e) =>
                              handleScoreChange(index, e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="nqg-answer-group">
                        <label>Pertanyaan</label>
                        <div className="nqg-readonly-box">
                          {item.question || "-"}
                        </div>
                      </div>

                      <div className="nqg-answer-group">
                        <label>Jawaban Teks Siswa</label>
                        <div className="nqg-readonly-box nqg-answer-box">
                          {renderStudentAnswer(item.answer_text)}
                        </div>
                      </div>

                      {item.answer_image && (
                        <div className="nqg-answer-group">
                          <label>Jawaban Gambar Siswa</label>
                          <button
                            type="button"
                            className="nqg-answer-image-btn"
                            onClick={() =>
                              setPreviewImage(getImageUrl(item.answer_image))
                            }
                          >
                            <img
                              src={getImageUrl(item.answer_image)}
                              alt={`Jawaban gambar soal ${index + 1}`}
                            />
                            <span>Klik untuk memperbesar</span>
                          </button>
                        </div>
                      )}

                      {renderRubricDetail(item)}

                      <div className="nqg-answer-group">
                        <label>Catatan Guru / Feedback</label>
                        <textarea
                          placeholder="Tulis feedback untuk siswa..."
                          value={item.teacher_note}
                          onChange={(e) =>
                            handleNoteChange(index, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="nqg-action-area">
                  <div className="nqg-action-summary">
                    <span>Status PJBL</span>
                    <strong>
                      {allQuestionsPassed
                        ? "Boleh Lanjut"
                        : "Belum Boleh Lanjut"}
                    </strong>
                  </div>

                  <div className="nqg-action-summary">
                    <span>Total skor sementara</span>
                    <strong>{totalScoreDraft}</strong>
                  </div>

                  <div className="nqg-action-buttons">
                    <button
                      type="button"
                      className="nqg-btn-secondary"
                      onClick={handleCloseDetail}
                    >
                      Tutup
                    </button>

                    <button
                      type="button"
                      className="nqg-btn-secondary"
                      onClick={handleAutoGrade}
                      disabled={autoGrading || saving}
                    >
                      {autoGrading ? "Menilai..." : "Nilai Otomatis Rubrik"}
                    </button>

                    <button
                      type="button"
                      className="nqg-btn-primary"
                      onClick={handleSave}
                      disabled={saving || autoGrading}
                    >
                      {saving ? "Menyimpan..." : "Simpan Penilaian"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {previewImage && (
        <div className="nqg-image-modal" onClick={() => setPreviewImage(null)}>
          <div
            className="nqg-image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="nqg-image-modal-close"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>
            <img src={previewImage} alt="Preview jawaban siswa" />
          </div>
        </div>
      )}
    </div>
  );
}

export default NilaiQuizGuru;