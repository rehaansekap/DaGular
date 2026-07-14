import React, { useEffect, useState } from "react";
import "../../style/QuizNilaiSaya.css";

function QuizNilaiSaya() {
  const user_id = localStorage.getItem("user_id");
  const API_URL = process.env.REACT_APP_API_URL || "";
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

  const isProcessedStatus = (status) => {
    return ["graded", "completed", "revision", "needs_review"].includes(
      String(status || "").toLowerCase()
    );
  };

  const getResultStatusText = (status) => {
    const cleanStatus = String(status || "").toLowerCase();

    if (cleanStatus === "completed" || cleanStatus === "graded") {
      return "Sudah dinilai";
    }

    if (cleanStatus === "revision") {
      return "Perlu revisi";
    }

    if (cleanStatus === "needs_review") {
      return "Perlu ditinjau guru";
    }

    return "Belum dinilai";
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

  return (
    <div className="nilai-saya-page">
      <div className="nilai-saya-container">
        <div className="nilai-saya-header">
          <h1 className="nilai-saya-title">Nilai LKPD Saya</h1>
          <p className="nilai-saya-desc">
            Lihat jawaban yang sudah kamu kirim dan hasil penilaian LKPD.
          </p>
        </div>

        <div className="nilai-saya-layout">
          <div className="nilai-saya-sidebar">
            <h2>Daftar LKPD</h2>

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
                    (item.status === "completed" ||
                      Number(item.completed_questions || 0) >=
                      Number(item.total_questions || 0));

                  return (
                    <div
                      key={item.id}
                      className={`submission-card ${selectedResult?.id === item.id ? "active" : ""
                        }`}
                      onClick={() => loadResultDetail(item.id)}
                    >
                      <h3>LKPD Pertemuan {item.pertemuan}</h3>

                      <p>
                        <span>Status:</span>{" "}
                        <span
                          className={
                            processed ? "status graded" : "status pending"
                          }
                        >
                          {getResultStatusText(item.status)}
                        </span>
                      </p>

                      <p>
                        <span>Ketuntasan:</span>{" "}
                        {processed ? (passed ? "Tuntas" : "Revisi") : "-"}
                      </p>

                      <p>
                        <span>Nilai:</span>{" "}
                        {processed ? item.score ?? 0 : "-"}
                      </p>

                      <p>
                        <span>Tanggal:</span>{" "}
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("id-ID")
                          : "-"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="nilai-saya-content">
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
                <div className="detail-header">
                  <h2>Detail Hasil LKPD</h2>

                  <div
                    className={
                      selectedProcessed && selectedPassed
                        ? "pjbl-student-banner passed"
                        : "pjbl-student-banner failed"
                    }
                  >
                    {!selectedProcessed ? (
                      <>
                        <strong>Menunggu penilaian</strong>
                        <p>Jawabanmu sudah masuk dan sedang diproses.</p>
                      </>
                    ) : selectedPassed ? (
                      <>
                        <strong>LKPD sudah tuntas.</strong>
                        <p>Semua bagian yang dinilai sudah memenuhi batas minimal.</p>
                      </>
                    ) : (
                      <>
                        <strong>LKPD perlu diperbaiki.</strong>
                        <p>Masih ada bagian yang belum memenuhi batas minimal.</p>
                      </>
                    )}
                  </div>

                  <div className="detail-meta">
                    <p>
                      <span>Pertemuan:</span> {selectedResult.pertemuan}
                    </p>

                    <p>
                      <span>Status:</span>{" "}
                      {getResultStatusText(selectedResult.status)}
                    </p>

                    <p>
                      <span>Total Nilai:</span>{" "}
                      {selectedProcessed
                        ? selectedResult.score ?? 0
                        : "Menunggu penilaian"}
                    </p>

                    <p>
                      <span>Tanggal Submit:</span>{" "}
                      {selectedResult.created_at
                        ? new Date(selectedResult.created_at).toLocaleString(
                          "id-ID"
                        )
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="jawaban-list">
                  {detailAnswers.map((item, index) => {
                    const processed = selectedProcessed;
                    const nonGraded = isNonGradedAnswer(item);
                    const status = getScoreStatus(item);
                    const score = getAnswerScore(item);
                    const maxScore = getMaxScore(item);

                    return (
                      <div className="jawaban-card" key={item.id || index}>
                        <div className="student-question-head">
                          <h3>
                            {nonGraded
                              ? "Self Reflection"
                              : `Soal ${index + 1}`}
                          </h3>

                          {processed && (
                            <span className={status.className}>
                              {status.text}
                            </span>
                          )}
                        </div>

                        <div className="jawaban-group">
                          <label>Pertanyaan</label>
                          <div className="readonly-box">{item.question}</div>
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

                        <div className="jawaban-group">
                          <label>{nonGraded ? "Penilaian" : "Nilai"}</label>

                          <div className="readonly-box">
                            {nonGraded
                              ? "Tidak Dinilai"
                              : processed
                                ? `${score} / ${maxScore}`
                                : "Belum dinilai"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizNilaiSaya;