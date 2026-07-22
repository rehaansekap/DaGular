import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../style/EvaluasiBelajarPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const emptyForm = {
  pertemuan: 1,
  group_name: "",
  memorable_experience: "",
  learning_difficulty: "",
  improvement_suggestion: "",
};

const defaultScale = [
  { value: 1, label: "Sangat Tidak Setuju" },
  { value: 2, label: "Tidak Setuju" },
  { value: 3, label: "Cukup Setuju" },
  { value: 4, label: "Setuju" },
  { value: 5, label: "Sangat Setuju" },
];

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return "-";
  }
}

function formatStatus(status) {
  if (status === "submitted") return "Sudah Dikirim";
  if (status === "draft") return "Draft";
  return "Belum Dibuat";
}

function statusClass(status) {
  if (status === "submitted") return "submitted";
  if (status === "draft") return "draft";
  return "empty";
}

function getScaleLabel(score, scale) {
  const found = scale.find((item) => Number(item.value) === Number(score));
  return found ? found.label : "-";
}

function getScaleBadgeClass(score) {
  const value = Number(score);

  if (value === 5) return "scale-5";
  if (value === 4) return "scale-4";
  if (value === 3) return "scale-3";
  if (value === 2) return "scale-2";
  if (value === 1) return "scale-1";

  return "scale-empty";
}

function EvaluasiBelajarPage() {
  const user_id = localStorage.getItem("user_id");
  const name = localStorage.getItem("name") || "Siswa";

  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [scores, setScores] = useState({});

  const [scale, setScale] = useState(defaultScale);
  const [indicators, setIndicators] = useState([]);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const flatItems = useMemo(() => {
    return indicators.flatMap((indicator) =>
      (indicator.items || []).map((item) => ({
        indicator_key: indicator.indicator_key,
        indicator_label: indicator.indicator_label,
        item_key: item.item_key,
        statement_text: item.statement_text,
      }))
    );
  }, [indicators]);

  const totalItems = flatItems.length;

  const progressSummary = useMemo(() => {
    const answeredValues = flatItems
      .map((item) => Number(scores[item.item_key]))
      .filter((value) => value >= 1 && value <= 5);

    return {
      answeredCount: answeredValues.length,
      totalItems,
    };
  }, [scores, flatItems, totalItems]);

  const submittedPertemuan = useMemo(() => {
    return myEvaluations
      .filter((item) => item.status === "submitted")
      .map((item) => Number(item.pertemuan));
  }, [myEvaluations]);

  const selectedPertemuanAlreadySubmitted = submittedPertemuan.includes(
    Number(form.pertemuan)
  );

  const resetFormToEmpty = useCallback(() => {
    setForm(emptyForm);
    setScores({});
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      setQuestionsLoading(true);

      const res = await fetch(`${API_URL}/api/learning-evaluations/questions`);
      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response questions bukan JSON:", text);
        return;
      }

      if (!res.ok) {
        console.error("Gagal mengambil pertanyaan evaluasi:", data);
        return;
      }

      setScale(data.data?.scale || defaultScale);
      setIndicators(data.data?.indicators || []);
    } catch (err) {
      console.error("LOAD EVALUATION QUESTIONS ERROR:", err);
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  const loadMyEvaluations = useCallback(async () => {
    if (!user_id) return;

    try {
      const res = await fetch(
        `${API_URL}/api/learning-evaluations/siswa/${user_id}`
      );

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response evaluasi siswa bukan JSON:", text);
        setMyEvaluations([]);
        setSelectedEvaluation(null);
        return;
      }

      if (!res.ok) {
        console.error("Gagal mengambil evaluasi siswa:", data);
        setMyEvaluations([]);
        setSelectedEvaluation(null);
        return;
      }

      const rows = Array.isArray(data.data) ? data.data : [];
      setMyEvaluations(rows);

      setSelectedEvaluation((prev) => {
        if (!prev) return null;

        const stillExists = rows.find((item) => item.id === prev.id);
        return stillExists || null;
      });
    } catch (err) {
      console.error("LOAD MY EVALUATIONS ERROR:", err);
      setMyEvaluations([]);
      setSelectedEvaluation(null);
    }
  }, [user_id]);

  useEffect(() => {
    resetFormToEmpty();
    loadQuestions();
    loadMyEvaluations();
  }, [resetFormToEmpty, loadQuestions, loadMyEvaluations]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateScore = (itemKey, value) => {
    setScores((prev) => ({
      ...prev,
      [itemKey]: Number(value),
    }));
  };

  const validateForm = () => {
    if (!user_id) {
      alert("User belum login.");
      return false;
    }

    if (!form.pertemuan) {
      alert("Pertemuan wajib dipilih.");
      return false;
    }

    if (totalItems === 0) {
      alert("Pernyataan evaluasi belum termuat. Tunggu sebentar lalu coba lagi.");
      return false;
    }

    if (selectedPertemuanAlreadySubmitted) {
      alert(
        "Evaluasi untuk pertemuan ini sudah pernah dikirim dan tidak bisa diedit kembali."
      );
      return false;
    }

    if (!form.group_name.trim()) {
      alert("Nama kelompok wajib diisi.");
      return false;
    }

    if (progressSummary.answeredCount !== totalItems) {
      alert("Semua pernyataan skala Likert wajib diisi.");
      return false;
    }

    if (!form.memorable_experience.trim()) {
      alert("Pengalaman paling berkesan wajib diisi.");
      return false;
    }

    if (!form.learning_difficulty.trim()) {
      alert("Kesulitan belajar wajib diisi.");
      return false;
    }

    if (!form.improvement_suggestion.trim()) {
      alert("Saran perbaikan wajib diisi.");
      return false;
    }

    return true;
  };

  const handleSubmitEvaluation = async () => {
    if (!validateForm()) return;

    const confirmSubmit = window.confirm(
      "Evaluasi hanya bisa dikirim satu kali dan tidak dapat diedit kembali. Kirim evaluasi sekarang?"
    );

    if (!confirmSubmit) return;

    try {
      setLoading(true);

      const payload = {
        user_id: Number(user_id),
        pertemuan: Number(form.pertemuan),
        group_name: form.group_name,
        scores,
        memorable_experience: form.memorable_experience,
        learning_difficulty: form.learning_difficulty,
        improvement_suggestion: form.improvement_suggestion,
        status: "submitted",
      };

      const res = await fetch(`${API_URL}/api/learning-evaluations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response simpan evaluasi bukan JSON:", text);
        alert("Gagal mengirim evaluasi. Response server tidak valid.");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Gagal mengirim evaluasi.");
        return;
      }

      resetFormToEmpty();
      setSelectedEvaluation(null);
      await loadMyEvaluations();

      alert(data.message || "Evaluasi berhasil dikirim.");
    } catch (err) {
      console.error("SUBMIT EVALUATION ERROR:", err);
      alert("Terjadi kesalahan saat mengirim evaluasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
  };

  const handleCloseEvaluation = () => {
    setSelectedEvaluation(null);
  };

  return (
    <div className="evaluasi-page">
      <div className="evaluasi-container">
      <div className="evaluasi-header">
         <h1 className="evaluasi-title">Evaluasi Pengalaman Belajar</h1>
          <p className="evaluasi-desc">
            Halo, {name}. Isi evaluasi ini berdasarkan pengalamanmu selama
            mengikuti pembelajaran berbasis proyek.
          </p>
      </div>

        <div className="evaluasi-card">
          <div className="evaluasi-section-title">
            <div>
              <h2>Form Evaluasi Belajar</h2>
              <p>
                Jawablah sesuai pengalaman belajar yang benar-benar kamu
                rasakan. Evaluasi hanya dapat dikirim satu kali.
              </p>
            </div>

            <span className="eval-status empty">Belum Dikirim</span>
          </div>

          {selectedPertemuanAlreadySubmitted && (
            <div className="eval-locked-note">
              Evaluasi untuk pertemuan {form.pertemuan} sudah pernah dikirim.
              Pilih pertemuan lain atau lihat hasilnya pada riwayat evaluasi.
            </div>
          )}

          <div className="eval-info-grid">
            <div className="form-group">
              <label>Pertemuan</label>
              <select
                value={form.pertemuan}
                onChange={(e) =>
                  updateForm("pertemuan", Number(e.target.value))
                }
              >
                <option value={1}>Pertemuan 1</option>
                <option value={2}>Pertemuan 2</option>
                <option value={3}>Pertemuan 3</option>
                <option value={4}>Pertemuan 4</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nama Kelompok</label>
              <input
                type="text"
                placeholder="Contoh: Kelompok 1"
                value={form.group_name}
                onChange={(e) => updateForm("group_name", e.target.value)}
                disabled={selectedPertemuanAlreadySubmitted}
              />
            </div>
          </div>

          <div className="eval-scale-note">
            <strong>Skala Penilaian</strong>
            <div>
              {scale.map((item) => (
                <span key={item.value}>
                  {item.value} = {item.label}
                </span>
              ))}
            </div>
          </div>

          {questionsLoading ? (
            <div className="eval-empty-box">Memuat pernyataan evaluasi...</div>
          ) : (
            <div className="likert-section">
              {indicators.map((indicator, indicatorIndex) => (
                <div className="indicator-card" key={indicator.indicator_key}>
                  <div className="indicator-title">
                    <span>{indicatorIndex + 1}</span>
                    <h3>{indicator.indicator_label}</h3>
                  </div>

                  <div className="likert-list">
                    {(indicator.items || []).map((item, itemIndex) => (
                      <div className="likert-item" key={item.item_key}>
                        <div className="likert-question">
                          <strong>{itemIndex + 1}</strong>
                          <p>{item.statement_text}</p>
                        </div>

                        <div className="likert-options">
                          {scale.map((scaleItem) => (
                            <label
                              key={scaleItem.value}
                              className={
                                Number(scores[item.item_key]) ===
                                Number(scaleItem.value)
                                  ? "active"
                                  : ""
                              }
                            >
                              <input
                                type="radio"
                                name={item.item_key}
                                value={scaleItem.value}
                                checked={
                                  Number(scores[item.item_key]) ===
                                  Number(scaleItem.value)
                                }
                                disabled={selectedPertemuanAlreadySubmitted}
                                onChange={(e) =>
                                  updateScore(item.item_key, e.target.value)
                                }
                              />
                              <span>{scaleItem.value}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="eval-progress-card">
            <div>
              <span>Progress Pengisian</span>
              <strong>
                {progressSummary.answeredCount} dari {totalItems} pernyataan
                sudah diisi
              </strong>
            </div>

            <p>
              Tidak ada jawaban benar atau salah. Pilih sesuai pengalaman
              belajar yang benar-benar kamu alami.
            </p>
          </div>

          <div className="reflection-section">
            <div className="evaluasi-section-title small">
              <div>
                <h2>Refleksi Singkat</h2>
                <p>
                  Tuliskan pengalamanmu secara singkat setelah mengikuti
                  pembelajaran.
                </p>
              </div>
            </div>

            <div className="reflection-grid">
              <div className="form-group full">
                <label>Apa hal paling berkesan selama pembelajaran?</label>
                <textarea
                  placeholder="Tulis pengalaman yang paling kamu ingat..."
                  value={form.memorable_experience}
                  disabled={selectedPertemuanAlreadySubmitted}
                  onChange={(e) =>
                    updateForm("memorable_experience", e.target.value)
                  }
                />
              </div>

              <div className="form-group full">
                <label>Kesulitan apa yang kamu alami?</label>
                <textarea
                  placeholder="Tulis kesulitan yang kamu alami selama belajar atau mengerjakan proyek..."
                  value={form.learning_difficulty}
                  disabled={selectedPertemuanAlreadySubmitted}
                  onChange={(e) =>
                    updateForm("learning_difficulty", e.target.value)
                  }
                />
              </div>

              <div className="form-group full">
                <label>Apa saranmu agar pembelajaran berikutnya lebih baik?</label>
                <textarea
                  placeholder="Tulis saran atau masukanmu..."
                  value={form.improvement_suggestion}
                  disabled={selectedPertemuanAlreadySubmitted}
                  onChange={(e) =>
                    updateForm("improvement_suggestion", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="evaluasi-actions">
            <button
              type="button"
              className="btn-light-eval"
              onClick={resetFormToEmpty}
              disabled={loading}
            >
              + Form Baru
            </button>

            <button
              type="button"
              className="btn-primary-eval"
              onClick={handleSubmitEvaluation}
              disabled={loading || selectedPertemuanAlreadySubmitted}
            >
              {loading ? "Mengirim..." : "✈ Kirim Evaluasi"}
            </button>
          </div>
        </div>

        <div className="eval-history-block">
          <div className="evaluasi-section-title history-title">
            <div>
              <h2>Evaluasi yang Sudah Dikirim</h2>
              <p>
                Evaluasi yang sudah dikirim hanya dapat dilihat kembali dan tidak
                dapat diedit.
              </p>
            </div>
          </div>

          <div className="eval-history-layout">
            <aside className="eval-history-sidebar">
              <h3>Daftar Evaluasi</h3>

              {myEvaluations.length === 0 ? (
                <p className="eval-empty-text">
                  Belum ada evaluasi yang dikirim.
                </p>
              ) : (
                <div className="eval-submission-list">
                  {myEvaluations.map((evaluation) => (
                    <button
                      type="button"
                      key={evaluation.id}
                      className={`eval-submission-card ${
                        selectedEvaluation?.id === evaluation.id ? "active" : ""
                      }`}
                      onClick={() => handleOpenEvaluation(evaluation)}
                    >
                      <h4>Pertemuan {evaluation.pertemuan}</h4>

                      <p>
                        <span>Kelompok:</span> {evaluation.group_name || "-"}
                      </p>

                      <p>
                        <span>Status:</span>{" "}
                        <strong
                          className={`mini-status ${statusClass(
                            evaluation.status
                          )}`}
                        >
                          {formatStatus(evaluation.status)}
                        </strong>
                      </p>

                      <p>
                        <span>Diperbarui:</span>{" "}
                        {formatDate(evaluation.updated_at)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="eval-history-content">
              {!selectedEvaluation ? (
                <div className="eval-empty-box">
                  Pilih evaluasi di sebelah kiri untuk melihat detailnya.
                </div>
              ) : (
                <>
                  <div className="eval-detail-header">
                    <div>
                      <h3>Pertemuan {selectedEvaluation.pertemuan}</h3>
                      <p>{selectedEvaluation.group_name || "-"}</p>
                    </div>

                    <div className="eval-detail-header-actions">
                      <span
                        className={`eval-status ${statusClass(
                          selectedEvaluation.status
                        )}`}
                      >
                        {formatStatus(selectedEvaluation.status)}
                      </span>

                      <button
                        type="button"
                        className="eval-close-detail-btn"
                        onClick={handleCloseEvaluation}
                        aria-label="Tutup detail evaluasi"
                        title="Tutup detail"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="eval-detail-meta">
                    <p>
                      <span>Status:</span>{" "}
                      {formatStatus(selectedEvaluation.status)}
                    </p>

                    <p>
                      <span>Dikirim/Diperbarui:</span>{" "}
                      {formatDate(
                        selectedEvaluation.submitted_at ||
                          selectedEvaluation.updated_at
                      )}
                    </p>
                  </div>

                  <div className="eval-detail-list">
                    <div className="eval-detail-card">
                      <label>Pengalaman Paling Berkesan</label>
                      <p>{selectedEvaluation.memorable_experience || "-"}</p>
                    </div>

                    <div className="eval-detail-card">
                      <label>Kesulitan Belajar</label>
                      <p>{selectedEvaluation.learning_difficulty || "-"}</p>
                    </div>

                    <div className="eval-detail-card">
                      <label>Saran Perbaikan</label>
                      <p>{selectedEvaluation.improvement_suggestion || "-"}</p>
                    </div>

                    <div className="eval-detail-card clean-likert-card">
                      <div className="eval-detail-card-title">
                        <label>Jawaban Skala Likert</label>
                        <span>
                          {selectedEvaluation.scores?.length || 0} pernyataan
                        </span>
                      </div>

                      <div className="eval-likert-table-wrap">
                        <table className="eval-likert-table">
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>Pernyataan</th>
                              <th>Jawaban</th>
                            </tr>
                          </thead>

                          <tbody>
                            {(selectedEvaluation.scores || []).map(
                              (item, index) => (
                                <tr key={item.item_key}>
                                  <td>{index + 1}</td>

                                  <td>{item.statement_text}</td>

                                  <td>
                                    <span
                                      className={`eval-answer-badge ${getScaleBadgeClass(
                                        item.score
                                      )}`}
                                    >
                                      {getScaleLabel(item.score, scale)}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluasiBelajarPage;