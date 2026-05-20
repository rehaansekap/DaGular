import React, { useEffect, useState } from "react";
import "../../style/QuizNilaiSaya.css";

function QuizNilaiSaya() {
  const user_id = localStorage.getItem("user_id");

  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailAnswers, setDetailAnswers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const formatAnswer = (answer) => {
    if (!answer) return <i>Tidak ada jawaban</i>;

    try {
      const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;

      if (typeof parsed === "object" && parsed !== null) {
        return (
          <div className="formatted-answer">
            {Object.entries(parsed).map(([key, value]) => (
              <div className="answer-row" key={key}>
                <div className="answer-label">{key}</div>
                <div className="answer-value">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value).replace(/\\"/g, '"')}
                </div>
              </div>
            ))}
          </div>
        );
      }
    } catch {
      return <div className="normal-answer">{answer}</div>;
    }

    return <div className="normal-answer">{answer}</div>;
  };

  const loadResultDetail = async (resultId) => {
    if (!user_id) return;

    try {
      setLoadingDetail(true);
      const res = await fetch(
        `http://localhost:5000/api/quiz/my-results/${user_id}/${resultId}`
      );
      const data = await res.json();

      setSelectedResult(data.data.result);
      setDetailAnswers(data.data.answers || []);
    } catch (error) {
      console.error("Gagal mengambil detail hasil quiz:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const loadMyResults = async () => {
      if (!user_id) return;

      try {
        setLoadingList(true);
        const res = await fetch(
          `http://localhost:5000/api/quiz/my-results/${user_id}`
        );
        const data = await res.json();
        setResults(data.data || []);
      } catch (error) {
        console.error("Gagal mengambil hasil quiz:", error);
      } finally {
        setLoadingList(false);
      }
    };

    loadMyResults();
  }, [user_id]);

  return (
    <div className="nilai-saya-page">
      <div className="nilai-saya-container">
        <div className="nilai-saya-header">
          <h1 className="nilai-saya-title">Nilai Quiz Saya</h1>
          <p className="nilai-saya-desc">
            Lihat status penilaian, total nilai, dan catatan guru untuk setiap quiz.
          </p>
        </div>

        <div className="nilai-saya-layout">
          <div className="nilai-saya-sidebar">
            <h2>Daftar Quiz</h2>

            {loadingList ? (
              <p className="empty-text">Memuat data...</p>
            ) : results.length === 0 ? (
              <p className="empty-text">Belum ada hasil quiz.</p>
            ) : (
              <div className="submission-list">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className={`submission-card ${
                      selectedResult?.id === item.id ? "active" : ""
                    }`}
                    onClick={() => loadResultDetail(item.id)}
                  >
                    <h3>Quiz Pertemuan {item.pertemuan}</h3>

                    <p>
                      <span>Status:</span>{" "}
                      <span
                        className={
                          item.status === "graded"
                            ? "status graded"
                            : "status pending"
                        }
                      >
                        {item.status === "graded"
                          ? "Sudah dinilai"
                          : "Belum dinilai"}
                      </span>
                    </p>

                    <p>
                      <span>Nilai:</span>{" "}
                      {item.status === "graded" ? item.score ?? 0 : "-"}
                    </p>

                    <p>
                      <span>Tanggal:</span>{" "}
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nilai-saya-content">
            {!selectedResult ? (
              <div className="empty-box">
                <p>Pilih quiz di sebelah kiri untuk melihat detail hasilnya.</p>
              </div>
            ) : loadingDetail ? (
              <div className="empty-box">
                <p>Memuat detail quiz...</p>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <h2>Detail Hasil Quiz</h2>

                  <div className="detail-meta">
                    <p>
                      <span>Pertemuan:</span> {selectedResult.pertemuan}
                    </p>
                    <p>
                      <span>Status:</span>{" "}
                      {selectedResult.status === "graded"
                        ? "Sudah dinilai"
                        : "Belum dinilai"}
                    </p>
                    <p>
                      <span>Total Nilai:</span>{" "}
                      {selectedResult.status === "graded"
                        ? selectedResult.score ?? 0
                        : "Menunggu penilaian"}
                    </p>
                    <p>
                      <span>Tanggal Submit:</span>{" "}
                      {new Date(selectedResult.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="jawaban-list">
                  {detailAnswers.map((item, index) => (
                    <div className="jawaban-card" key={item.id}>
                      <h3>Soal {index + 1}</h3>

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
                        <label>Jawaban Saya</label>
                        <div className="readonly-box answer-box">
                          {formatAnswer(item.answer_text)}
                        </div>
                      </div>

                      <div className="jawaban-group">
                        <label>Nilai</label>
                        <div className="readonly-box">
                          {selectedResult.status === "graded"
                            ? item.score ?? 0
                            : "Belum dinilai"}
                        </div>
                      </div>

                      <div className="jawaban-group">
                        <label>Catatan Guru</label>
                        <div className="readonly-box">
                          {selectedResult.status === "graded"
                            ? item.teacher_note || "Tidak ada catatan"
                            : "Menunggu penilaian guru"}
                        </div>
                      </div>
                    </div>
                  ))}
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