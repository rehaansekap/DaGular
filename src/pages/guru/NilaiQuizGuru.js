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
    let cleanPath = String(path).trim();
    if (cleanPath.startsWith("http://localhost:5000")) {
      cleanPath = cleanPath.replace("http://localhost:5000", API_URL);
    }
    if (typeof window !== "undefined" && window.location.protocol === "https:" && cleanPath.startsWith("http://")) {
      cleanPath = cleanPath.replace(/^http:/, "https:");
    }
    if (cleanPath.startsWith("http")) return cleanPath;
    return `${API_URL}/${cleanPath.replace(/^\//, "")}`;
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

  const formatDate = (value) => {
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

  const formatKeyLabel = (key) => {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getAnswerStatusText = (score) => {
    const numericScore = Number(score) || 0;

    if (numericScore >= PASSING_SCORE) return "Tuntas";
    if (numericScore > 0) return "Perlu Revisi";
    return "Belum Sesuai";
  };

  const getAnswerStatusClass = (score) => {
    const numericScore = Number(score) || 0;

    if (numericScore >= PASSING_SCORE) return "nqg-passed";
    if (numericScore > 0) return "nqg-revision";
    return "nqg-failed";
  };

  const getResultStatusText = (status) => {
    if (status === "graded") return "Sudah Dinilai";
    return "Belum Dinilai";
  };

  const getResultStatusClass = (status) => {
    if (status === "graded") return "nqg-graded";
    return "nqg-pending";
  };

  const renderAnswerValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <i>Belum ada jawaban</i>;
    }

    if (typeof value === "string") {
      return value.trim() ? <span>{value}</span> : <i>Belum ada jawaban</i>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <i>Belum ada jawaban</i>;

      return (
        <div className="nqg-structured-answer inner">
          {value.map((item, index) => (
            <div className="nqg-answer-item" key={index}>
              <div className="nqg-answer-label">Jawaban {index + 1}</div>
              <div className="nqg-answer-value">{renderAnswerValue(item)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="nqg-structured-answer inner">
          {Object.entries(value).map(([key, entryValue]) => (
            <div className="nqg-answer-item" key={key}>
              <div className="nqg-answer-label">{formatKeyLabel(key)}</div>
              <div className="nqg-answer-value">
                {renderAnswerValue(entryValue)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  const renderStudentAnswer = (answerText) => {
    if (!answerText) return <i>Belum ada jawaban teks</i>;

    const parsed = safeJsonParse(answerText);

    if (parsed && typeof parsed === "object") {
      return renderAnswerValue(parsed);
    }

    return <div className="nqg-normal-answer">{answerText}</div>;
  };

  const renderRubricDetail = (item) => {
    const detail =
      safeJsonParse(item.rubric_detail) ||
      safeJsonParse(item.teacher_note)?.rubric_detail ||
      null;

    if (!detail || !Array.isArray(detail.fields)) return null;

    return (
      <div className="nqg-rubric-detail-box">
        <div className="nqg-rubric-head">
          <h4>Hasil Penilaian Rubrik</h4>
          <span>{detail.fields.length} aspek</span>
        </div>

        <div className="nqg-rubric-detail-list">
          {detail.fields.map((field, index) => {
            const fieldScore = Number(field.score) || 0;
            const fieldPassed = fieldScore >= PASSING_SCORE;

            return (
              <div
                className={
                  fieldPassed
                    ? "nqg-rubric-detail-row nqg-passed"
                    : "nqg-rubric-detail-row nqg-failed"
                }
                key={index}
              >
                <div>
                  <span className="nqg-rubric-number">Jawaban {index + 1}</span>

                  <strong>{formatKeyLabel(field.field_key)}</strong>

                  <p>{field.feedback || "Belum ada feedback."}</p>
                </div>

                <span
                  className={
                    fieldPassed
                      ? "nqg-rubric-score-pill nqg-passed"
                      : "nqg-rubric-score-pill nqg-failed"
                  }
                >
                  {fieldScore}
                </span>
              </div>
            );
          })}
        </div>
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

  const averageScore = useMemo(() => {
    if (gradedResults.length === 0) return 0;

    const total = gradedResults.reduce((sum, item) => {
      return sum + Number(item.score || 0);
    }, 0);

    return (total / gradedResults.length).toFixed(2);
  }, [gradedResults]);

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
        <section className="nqg-hero">
          <div>
            <span className="nqg-badge">Panel Guru</span>

            <h1 className="nqg-title">Penilaian LKPD Siswa</h1>

            <p className="nqg-desc">
              Periksa jawaban siswa, jalankan penilaian otomatis dari rubrik,
              berikan catatan revisi, dan pastikan siswa tuntas sebelum
              melanjutkan aktivitas berikutnya.
            </p>
          </div>

          <button type="button" className="nqg-refresh-btn" onClick={loadResults}>
            Refresh Data
          </button>
        </section>

        <section className="nqg-filter-card">
          <strong>Filter Submission</strong>

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
              Belum Dinilai
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
              Sudah Dinilai
            </button>
          </div>
        </section>

        <section className="nqg-summary">
          <div className="nqg-summary-card">
            <span>Total Submission</span>
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

          <div className="nqg-summary-card">
            <span>Rata-rata Nilai</span>
            <strong>{averageScore}</strong>
          </div>
        </section>

        <div className="nqg-layout">
          <aside className="nqg-sidebar">
            <div className="nqg-sidebar-head">
              <div>
                <h2>Daftar Submission</h2>
                <p>Pilih siswa untuk melihat detail jawaban.</p>
              </div>
            </div>

            {loadingList ? (
              <p className="nqg-empty-text">Memuat data...</p>
            ) : filteredResults.length === 0 ? (
              <p className="nqg-empty-text">Tidak ada submission.</p>
            ) : (
              <div className="nqg-submission-list">
                {filteredResults.map((item) => {
                  const statusClass = getResultStatusClass(item.status);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`nqg-submission-card ${selectedResult?.id === item.id ? "nqg-active" : ""
                        }`}
                      onClick={() => loadDetail(item.id)}
                    >
                      <div className="nqg-submission-top">
                        <div>
                          <h3>{item.student_name || `User #${item.user_id}`}</h3>

                          <span className={`nqg-status-badge ${statusClass}`}>
                            {getResultStatusText(item.status)}
                          </span>
                        </div>

                        <div className={`nqg-score-bubble ${statusClass}`}>
                          <strong>{item.status === "graded" ? item.score ?? 0 : "-"}</strong>
                          <small>Nilai</small>
                        </div>
                      </div>

                      <div className="nqg-submission-meta">
                        <p>
                          <span>Pertemuan</span>
                          <strong>{item.pertemuan}</strong>
                        </p>

                        <p>
                          <span>Status</span>
                          <strong>{getResultStatusText(item.status)}</strong>
                        </p>
                      </div>

                      <div className="nqg-submission-date">
                        {formatDate(item.created_at)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="nqg-content">
            {!selectedResult ? (
              <div className="nqg-empty-box">
                <div className="nqg-empty-illustration">📄</div>

                <h3>Pilih submission siswa</h3>

                <p>
                  Jawaban siswa akan tampil di sini untuk diperiksa, dinilai,
                  dan diberi catatan revisi.
                </p>
              </div>
            ) : loadingDetail ? (
              <div className="nqg-empty-box">
                <p>Memuat detail jawaban...</p>
              </div>
            ) : (
              <>
                <section className="nqg-result-summary-card">
                  <div
                    className={
                      allQuestionsPassed
                        ? "nqg-result-score-block nqg-passed"
                        : "nqg-result-score-block nqg-revision"
                    }
                  >
                    <span>Total Nilai</span>
                    <strong>{totalScoreDraft}</strong>
                    <small>{allQuestionsPassed ? "Tuntas" : "Perlu Revisi"}</small>
                  </div>

                  <div className="nqg-result-summary-content">
                    <div className="nqg-result-summary-top">
                      <div>
                        <span className="nqg-detail-label">Detail LKPD</span>

                        <h2>
                          {selectedResult.student_name ||
                            `User #${selectedResult.user_id}`}
                        </h2>

                        <p>
                          Pertemuan {selectedResult.pertemuan} •{" "}
                          {getResultStatusText(selectedResult.status)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="nqg-btn-secondary compact"
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
                        <strong>
                          {allQuestionsPassed ? "Tuntas" : "Belum Tuntas"}
                        </strong>
                      </div>

                      <div className="nqg-info-card">
                        <span>Tanggal Submit</span>
                        <strong>{formatDate(selectedResult.created_at)}</strong>
                      </div>
                    </div>
                  </div>
                </section>

                <div
                  className={
                    allQuestionsPassed
                      ? "nqg-rule-box nqg-passed"
                      : "nqg-rule-box nqg-revision"
                  }
                >
                  <strong>
                    {allQuestionsPassed
                      ? "LKPD sudah memenuhi batas tuntas."
                      : "LKPD masih perlu diperbaiki."}
                  </strong>

                  <p>
                    Siswa boleh lanjut jika setiap soal atau bagian jawaban
                    mendapatkan nilai minimal <b>{PASSING_SCORE}</b>. Nilai{" "}
                    <b>3</b> dan <b>4</b> dianggap tuntas, sedangkan nilai{" "}
                    <b>0</b>, <b>1</b>, dan <b>2</b> perlu revisi.
                  </p>
                </div>

                <div className="nqg-answer-list">
                  {answers.map((item, index) => {
                    const answerStatusClass = getAnswerStatusClass(item.score);

                    return (
                      <article className="nqg-answer-card" key={item.answer_id}>
                        <div className="nqg-answer-card-head">
                          <div>
                            <span className="nqg-question-count">
                              Soal {index + 1}
                            </span>

                            <h3>Pemeriksaan Jawaban</h3>

                            <span
                              className={`nqg-answer-status ${answerStatusClass}`}
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

                          <div className="nqg-readonly-box nqg-question-box">
                            {item.question || "-"}
                          </div>
                        </div>

                        <div className="nqg-answer-group">
                          <label>Jawaban Siswa</label>

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
                      </article>
                    );
                  })}
                </div>

                <div className="nqg-action-area">
                  <div className="nqg-action-summary">
                    <span>Status PjBL</span>

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