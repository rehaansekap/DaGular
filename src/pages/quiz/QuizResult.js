import React from "react";
import "../../style/QuizResult.css";
import { useLocation, Link } from "react-router-dom";

function QuizResult() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="quiz-result">
        <h1>Hasil Quiz</h1>
        <p>Data hasil quiz tidak tersedia.</p>

        <div className="quiz-buttons">
          <Link to="/quiz">
            <button className="quiz-btn secondary">
              Kembali ke Daftar Quiz
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-result">
      <h1>Quiz Berhasil Dikumpulkan</h1>

      <div className="quiz-score-box">
        <p className="quiz-score-main">✓</p>
        <p className="quiz-score-sub">
          Jawaban untuk Quiz Pertemuan {state.pertemuan} sudah berhasil dikirim
          dan sedang menunggu penilaian guru.
        </p>
      </div>

      <div className="quiz-buttons">
        <Link to="/quiz">
          <button className="quiz-btn secondary">
            Kembali ke Daftar Quiz
          </button>
        </Link>

        <Link to="/quiz/nilai-saya">
          <button className="quiz-btn primary">
            Lihat Status Quiz
          </button>
        </Link>

        <Link to="/proyek">
          <button className="quiz-btn primary">
            Lanjut ke Proyek
          </button>
        </Link>
      </div>
    </div>
  );
}

export default QuizResult;