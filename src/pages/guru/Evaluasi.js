import React, { useEffect, useMemo, useState } from "react";
import "../../style/Evaluasi.css";

const API_URL = "http://localhost:5000";

const meetingOptions = [1, 2, 3, 4];

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
  return status || "-";
}

function statusClass(status) {
  if (status === "submitted") return "submitted";
  if (status === "draft") return "draft";
  return "empty";
}

function getScaleLabel(score) {
  const value = Number(score);

  if (value === 5) return "Sangat Setuju";
  if (value === 4) return "Setuju";
  if (value === 3) return "Cukup Setuju";
  if (value === 2) return "Tidak Setuju";
  if (value === 1) return "Sangat Tidak Setuju";

  return "-";
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

function safeNumber(value) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function average(values) {
  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + safeNumber(value), 0);
  return Number((total / values.length).toFixed(2));
}

export default function Evaluasi() {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState("1");
  const [loading, setLoading] = useState(false);

  const filteredEvaluations = useMemo(() => {
    if (selectedPertemuan === "all") return evaluations;

    return evaluations.filter(
      (item) => String(item.pertemuan) === String(selectedPertemuan)
    );
  }, [evaluations, selectedPertemuan]);

  const allScores = useMemo(() => {
    return filteredEvaluations.flatMap((evaluation) =>
      Array.isArray(evaluation.scores) ? evaluation.scores : []
    );
  }, [filteredEvaluations]);

  const averageFinalScore = useMemo(() => {
    return average(filteredEvaluations.map((item) => item.final_score));
  }, [filteredEvaluations]);

  const averageUnderstanding = useMemo(() => {
    const values = allScores
      .filter(
        (item) =>
          item.indicator_key === "pemahaman_materi" ||
          String(item.indicator_label || "")
            .toLowerCase()
            .includes("pemahaman")
      )
      .map((item) => item.score);

    return average(values);
  }, [allScores]);

  const averagePlatform = useMemo(() => {
    const values = allScores
      .filter(
        (item) =>
          item.indicator_key === "platform" ||
          String(item.indicator_label || "").toLowerCase().includes("platform")
      )
      .map((item) => item.score);

    return average(values);
  }, [allScores]);

  const indicatorAverages = useMemo(() => {
    const groups = {};

    allScores.forEach((item) => {
      const key = item.indicator_label || item.indicator_key || "Lainnya";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(Number(item.score) || 0);
    });

    return Object.entries(groups).map(([label, values]) => ({
      label,
      average_score: average(values),
      percentage: Number(((average(values) / 5) * 100).toFixed(2)),
    }));
  }, [allScores]);

  const categoryCounts = useMemo(() => {
    const result = {
      "Sangat Baik": 0,
      Baik: 0,
      Cukup: 0,
      Kurang: 0,
      "Sangat Kurang": 0,
    };

    filteredEvaluations.forEach((item) => {
      if (result[item.category] !== undefined) {
        result[item.category] += 1;
      }
    });

    return result;
  }, [filteredEvaluations]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/learning-evaluations/guru/all/list`
      );
      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response evaluasi bukan JSON:", text);
        setEvaluations([]);
        setSelectedEvaluation(null);
        return;
      }

      if (!res.ok) {
        console.error(data.message || "Gagal mengambil data evaluasi.");
        setEvaluations([]);
        setSelectedEvaluation(null);
        return;
      }

      const rows = Array.isArray(data.data) ? data.data : [];
      setEvaluations(rows);
    } catch (err) {
      console.error("LOAD EVALUASI GURU ERROR:", err);
      setEvaluations([]);
      setSelectedEvaluation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  useEffect(() => {
    setSelectedEvaluation((prev) => {
      if (
        prev &&
        filteredEvaluations.some((evaluation) => evaluation.id === prev.id)
      ) {
        return prev;
      }

      return filteredEvaluations[0] || null;
    });
  }, [filteredEvaluations]);

  return (
    <div className="guru-evaluasi-page">
      <div className="guru-evaluasi-container">
        <div className="guru-evaluasi-header">
          <div>
            <span className="guru-evaluasi-badge">Panel Guru</span>
            <h1>Hasil Evaluasi Pengalaman Belajar</h1>
            <p>
              Guru dapat melihat dampak penggunaan website terhadap pengalaman
              belajar, pemahaman materi, dan penggunaan platform berdasarkan
              pertemuan.
            </p>
          </div>

          <button type="button" onClick={loadEvaluations}>
            Refresh Data
          </button>
        </div>

        <div className="guru-evaluasi-meeting-filter">
          <span>Filter Pertemuan</span>

          <div>
            <button
              type="button"
              className={selectedPertemuan === "all" ? "active" : ""}
              onClick={() => setSelectedPertemuan("all")}
            >
              Semua
            </button>

            {meetingOptions.map((meeting) => (
              <button
                type="button"
                key={meeting}
                className={
                  String(selectedPertemuan) === String(meeting) ? "active" : ""
                }
                onClick={() => setSelectedPertemuan(String(meeting))}
              >
                Pertemuan {meeting}
              </button>
            ))}
          </div>
        </div>

        <div className="guru-evaluasi-summary">
          <div>
            <span>Total Evaluasi</span>
            <strong>{filteredEvaluations.length}</strong>
          </div>

          <div>
            <span>Rata-rata Nilai</span>
            <strong>{averageFinalScore}</strong>
          </div>

          <div>
            <span>Rata-rata Pemahaman</span>
            <strong>{averageUnderstanding}/5</strong>
          </div>

          <div>
            <span>Rata-rata Platform</span>
            <strong>{averagePlatform}/5</strong>
          </div>
        </div>

        <div className="guru-evaluasi-grid">
          <div className="guru-evaluasi-card">
            <div className="guru-evaluasi-card-title">
              <h2>
                Rata-rata per Indikator{" "}
                {selectedPertemuan === "all"
                  ? ""
                  : `Pertemuan ${selectedPertemuan}`}
              </h2>
              <span>{indicatorAverages.length} indikator</span>
            </div>

            {indicatorAverages.length === 0 ? (
              <p className="guru-evaluasi-empty">Belum ada data indikator.</p>
            ) : (
              <div className="indicator-average-list">
                {indicatorAverages.map((item) => (
                  <div className="indicator-average-item" key={item.label}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>
                        Rata-rata {item.average_score}/5 · {item.percentage}%
                      </p>
                    </div>

                    <div className="indicator-bar">
                      <span style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="guru-evaluasi-card">
            <div className="guru-evaluasi-card-title">
              <h2>Kategori Hasil</h2>
              <span>Rekap</span>
            </div>

            <div className="category-list">
              {Object.entries(categoryCounts).map(([label, count]) => (
                <div className="category-item" key={label}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="guru-evaluasi-layout">
          <aside className="guru-evaluasi-sidebar">
            <h2>
              Daftar Evaluasi{" "}
              {selectedPertemuan === "all"
                ? "Semua Pertemuan"
                : `Pertemuan ${selectedPertemuan}`}
            </h2>

            {loading ? (
              <p className="guru-evaluasi-empty">Memuat data evaluasi...</p>
            ) : filteredEvaluations.length === 0 ? (
              <p className="guru-evaluasi-empty">
                Belum ada evaluasi pada pertemuan ini.
              </p>
            ) : (
              <div className="guru-evaluasi-list">
                {filteredEvaluations.map((evaluation) => (
                  <button
                    type="button"
                    key={evaluation.id}
                    className={`guru-evaluasi-item ${
                      selectedEvaluation?.id === evaluation.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedEvaluation(evaluation)}
                  >
                    <div className="guru-evaluasi-item-top">
                      <h3>
                        {evaluation.student_name ||
                          `User #${evaluation.user_id}`}
                      </h3>

                      <span
                        className={`guru-evaluasi-status ${statusClass(
                          evaluation.status
                        )}`}
                      >
                        {formatStatus(evaluation.status)}
                      </span>
                    </div>

                    <p>
                      <b>Kelompok:</b> {evaluation.group_name || "-"}
                    </p>

                    <p>
                      <b>Pertemuan:</b> {evaluation.pertemuan || "-"}
                    </p>

                    <p>
                      <b>Nilai:</b> {evaluation.final_score || "0.00"} ·{" "}
                      {evaluation.category || "-"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="guru-evaluasi-content">
            {!selectedEvaluation ? (
              <div className="guru-evaluasi-empty-box">
                Pilih evaluasi siswa untuk melihat detail.
              </div>
            ) : (
              <>
                <div className="guru-evaluasi-detail-header">
                  <div>
                    <h2>
                      {selectedEvaluation.student_name ||
                        `User #${selectedEvaluation.user_id}`}
                    </h2>

                    <p>
                      {selectedEvaluation.group_name || "-"} · Pertemuan{" "}
                      {selectedEvaluation.pertemuan || "-"}
                    </p>
                  </div>

                  <span
                    className={`guru-evaluasi-status ${statusClass(
                      selectedEvaluation.status
                    )}`}
                  >
                    {formatStatus(selectedEvaluation.status)}
                  </span>
                </div>

                <div className="guru-evaluasi-meta">
                  <div>
                    <span>Total Skor</span>
                    <strong>
                      {selectedEvaluation.total_score || 0}/
                      {selectedEvaluation.max_score || 90}
                    </strong>
                  </div>

                  <div>
                    <span>Nilai</span>
                    <strong>{selectedEvaluation.final_score || "0.00"}</strong>
                  </div>

                  <div>
                    <span>Kategori</span>
                    <strong>{selectedEvaluation.category || "-"}</strong>
                  </div>

                  <div>
                    <span>Dikirim</span>
                    <strong>
                      {formatDate(
                        selectedEvaluation.submitted_at ||
                          selectedEvaluation.updated_at
                      )}
                    </strong>
                  </div>
                </div>

                <div className="guru-evaluasi-detail-list">
                  <div className="guru-evaluasi-detail-card">
                    <label>Pengalaman Paling Berkesan</label>
                    <p>{selectedEvaluation.memorable_experience || "-"}</p>
                  </div>

                  <div className="guru-evaluasi-detail-card">
                    <label>Kesulitan Belajar</label>
                    <p>{selectedEvaluation.learning_difficulty || "-"}</p>
                  </div>

                  <div className="guru-evaluasi-detail-card">
                    <label>Saran Perbaikan</label>
                    <p>{selectedEvaluation.improvement_suggestion || "-"}</p>
                  </div>

                  <div className="guru-evaluasi-detail-card full">
                    <div className="guru-evaluasi-card-title">
                      <h2>Jawaban Skala Likert</h2>
                      <span>
                        {selectedEvaluation.scores?.length || 0} pernyataan
                      </span>
                    </div>

                    <div className="guru-evaluasi-table-wrap">
                      <table className="guru-evaluasi-table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>Indikator</th>
                            <th>Pernyataan</th>
                            <th>Jawaban</th>
                            <th>Skor</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(selectedEvaluation.scores || []).map(
                            (item, index) => (
                              <tr key={item.item_key || index}>
                                <td>{index + 1}</td>
                                <td>{item.indicator_label || "-"}</td>
                                <td>{item.statement_text || "-"}</td>
                                <td>
                                  <span
                                    className={`scale-badge ${getScaleBadgeClass(
                                      item.score
                                    )}`}
                                  >
                                    {getScaleLabel(item.score)}
                                  </span>
                                </td>
                                <td>{item.score || "-"}</td>
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
  );
}