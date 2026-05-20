import React, { useEffect, useMemo, useState } from "react";
import "../../style/NilaiQuizGuru.css";

function NilaiQuizGuru() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);

  const API_URL = "http://localhost:5000";

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`;
  };

  const renderStudentAnswer = (answerText) => {
    if (!answerText) return <i>Belum ada jawaban teks</i>;

    try {
      const parsed = JSON.parse(answerText);

      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return (
          <div className="structured-answer">
            {Object.entries(parsed).map(([key, value], index) => (
              <div className="answer-item" key={index}>
                <div className="answer-label">{key}</div>
                <div className="answer-value">{value || "-"}</div>
              </div>
            ))}
          </div>
        );
      }

      if (Array.isArray(parsed)) {
        return (
          <div className="structured-answer">
            {parsed.map((value, index) => (
              <div className="answer-item" key={index}>
                <div className="answer-label">Jawaban {index + 1}</div>
                <div className="answer-value">{value || "-"}</div>
              </div>
            ))}
          </div>
        );
      }
    } catch (err) {
      return answerText;
    }

    return answerText;
  };

  const loadResults = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${API_URL}/api/quiz/results`);
      const data = await res.json();
      setResults(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil hasil quiz:", error);
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (resultId) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`${API_URL}/api/quiz/results/${resultId}`);
      const data = await res.json();

      setSelectedResult(data.data.result);
      setAnswers(
        (data.data.answers || []).map((item) => ({
          answer_id: item.id,
          question_id: item.question_id,
          question: item.question,
          answer_text: item.answer_text,
          answer_image: item.answer_image,
          score: item.score || 0,
          teacher_note: item.teacher_note || "",
        }))
      );
    } catch (error) {
      console.error("Gagal mengambil detail hasil quiz:", error);
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
    updated[index].score = value;
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

  const handleSave = async () => {
    if (!selectedResult) return;

    try {
      setSaving(true);

      const payload = {
        answers: answers.map((item) => ({
          answer_id: item.answer_id,
          score: Number(item.score) || 0,
          teacher_note: item.teacher_note || "",
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
      alert(data.message || "Nilai berhasil disimpan");

      await loadResults();
      setSelectedResult(null);
      setAnswers([]);
      setActiveFilter("pending");
    } catch (error) {
      console.error("Gagal menyimpan nilai:", error);
      alert("Terjadi kesalahan saat menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  return (
    <div className="nilaiquiz-page">
      <div className="nilaiquiz-container">
        <div className="nilaiquiz-hero">
          <div>
            <span className="nilaiquiz-badge">Panel Guru</span>
            <h1 className="nilaiquiz-title">Penilaian LKPD Siswa</h1>
            <p className="nilaiquiz-desc">
              Periksa jawaban teks maupun gambar siswa, beri nilai, lalu simpan penilaian.
            </p>
          </div>

          <div className="nilaiquiz-summary">
            <div className="summary-card">
              <span>Total</span>
              <strong>{results.length}</strong>
            </div>
            <div className="summary-card">
              <span>Belum Dinilai</span>
              <strong>{pendingResults.length}</strong>
            </div>
            <div className="summary-card">
              <span>Sudah Dinilai</span>
              <strong>{gradedResults.length}</strong>
            </div>
          </div>
        </div>

        <div className="nilaiquiz-layout">
          <aside className="nilaiquiz-sidebar">
            <div className="sidebar-head">
              <h2>Submission</h2>

              <div className="filter-group">
                <button
                  className={activeFilter === "all" ? "filter-btn active" : "filter-btn"}
                  onClick={() => setActiveFilter("all")}
                >
                  Semua
                </button>
                <button
                  className={activeFilter === "pending" ? "filter-btn active" : "filter-btn"}
                  onClick={() => setActiveFilter("pending")}
                >
                  Belum
                </button>
                <button
                  className={activeFilter === "graded" ? "filter-btn active" : "filter-btn"}
                  onClick={() => setActiveFilter("graded")}
                >
                  Selesai
                </button>
              </div>
            </div>

            {loadingList ? (
              <p className="empty-text">Memuat data...</p>
            ) : filteredResults.length === 0 ? (
              <p className="empty-text">Tidak ada submission.</p>
            ) : (
              <div className="submission-list">
                {filteredResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`submission-card ${
                      selectedResult?.id === item.id ? "active" : ""
                    }`}
                    onClick={() => loadDetail(item.id)}
                  >
                    <div className="submission-top">
                      <h3>{item.student_name || `User #${item.user_id}`}</h3>
                      <span
                        className={
                          item.status === "graded"
                            ? "status-badge graded"
                            : "status-badge pending"
                        }
                      >
                        {item.status === "graded" ? "Dinilai" : "Pending"}
                      </span>
                    </div>

                    <div className="submission-meta">
                      <p>
                        <span>Pertemuan</span>
                        <strong>{item.pertemuan}</strong>
                      </p>
                      <p>
                        <span>Nilai</span>
                        <strong>{item.score ?? 0}</strong>
                      </p>
                    </div>

                    <div className="submission-date">
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="nilaiquiz-content">
            {!selectedResult ? (
              <div className="empty-box">
                <div className="empty-illustration">📄</div>
                <h3>Pilih submission siswa</h3>
                <p>Jawaban siswa akan tampil di sini untuk diperiksa dan dinilai.</p>
              </div>
            ) : loadingDetail ? (
              <div className="empty-box">
                <p>Memuat detail jawaban...</p>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <div>
                    <span className="detail-label">Detail LKPD</span>
                    <h2>{selectedResult.student_name || `User #${selectedResult.user_id}`}</h2>
                    <p className="detail-subtitle">
                      Pertemuan {selectedResult.pertemuan} •{" "}
                      {selectedResult.status === "graded"
                        ? "Sudah dinilai"
                        : "Belum dinilai"}
                    </p>
                  </div>

                  <button className="btn-secondary" onClick={handleCloseDetail}>
                    Tutup
                  </button>
                </div>

                <div className="student-info-grid">
                  <div className="info-card">
                    <span>Nama Siswa</span>
                    <strong>
                      {selectedResult.student_name || `User #${selectedResult.user_id}`}
                    </strong>
                  </div>
                  <div className="info-card">
                    <span>Pertemuan</span>
                    <strong>{selectedResult.pertemuan}</strong>
                  </div>
                  <div className="info-card">
                    <span>Status</span>
                    <strong>
                      {selectedResult.status === "graded" ? "Sudah dinilai" : "Belum dinilai"}
                    </strong>
                  </div>
                  <div className="info-card highlight">
                    <span>Total Nilai</span>
                    <strong>{totalScoreDraft}</strong>
                  </div>
                </div>

                <div className="jawaban-list">
                  {answers.map((item, index) => (
                    <div className="jawaban-card" key={item.answer_id}>
                      <div className="jawaban-card-head">
                        <div>
                          <span className="question-count">Soal {index + 1}</span>
                          <h3>Pemeriksaan Jawaban</h3>
                        </div>

                        <div className="score-inline">
                          <label>Nilai</label>
                          <input
                            type="number"
                            min="0"
                            value={item.score}
                            onChange={(e) => handleScoreChange(index, e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="jawaban-group">
                        <label>Pertanyaan</label>
                        <div className="readonly-box">{item.question || "-"}</div>
                      </div>

                      <div className="jawaban-group">
                        <label>Jawaban Teks Siswa</label>
                        <div className="readonly-box answer-box">
                          {renderStudentAnswer(item.answer_text)}
                        </div>
                      </div>

                      {item.answer_image && (
                        <div className="jawaban-group">
                          <label>Jawaban Gambar Siswa</label>
                          <button
                            type="button"
                            className="answer-image-btn"
                            onClick={() => setPreviewImage(getImageUrl(item.answer_image))}
                          >
                            <img
                              src={getImageUrl(item.answer_image)}
                              alt={`Jawaban gambar soal ${index + 1}`}
                            />
                            <span>Klik untuk memperbesar</span>
                          </button>
                        </div>
                      )}

                      <div className="jawaban-group">
                        <label>Catatan Guru</label>
                        <textarea
                          placeholder="Tulis feedback untuk siswa..."
                          value={item.teacher_note}
                          onChange={(e) => handleNoteChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="action-area">
                  <div className="action-summary">
                    <span>Total skor sementara</span>
                    <strong>{totalScoreDraft}</strong>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={handleCloseDetail}>
                      Tutup
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
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
        <div className="image-modal" onClick={() => setPreviewImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setPreviewImage(null)}>
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