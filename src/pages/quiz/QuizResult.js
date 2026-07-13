import React from "react";
import "../../style/QuizResult.css";
import { useLocation, Link } from "react-router-dom";

function QuizResult() {
  const { state } = useLocation();
  const PASSING_SCORE = 3;

  if (!state) {
    return (
      <div className="quiz-result">
        <h1>Hasil LKPD</h1>
        <p>Data hasil LKPD tidak tersedia.</p>

        <div className="quiz-buttons">
          <Link to="/quiz">
            <button className="quiz-btn secondary">
              Kembali ke Daftar LKPD
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isGraded = state.status === "graded" || state.score !== undefined;
  const isPassed =
    state.is_passed !== undefined
      ? Number(state.is_passed) === 1
      : isGraded && Number(state.score) >= PASSING_SCORE;

  return (
    <div className="quiz-result">
      <h1>LKPD Berhasil Dikumpulkan</h1>

      <div
        className={
          isGraded && isPassed
            ? "quiz-score-box result-passed"
            : isGraded
            ? "quiz-score-box result-failed"
            : "quiz-score-box"
        }
      >
        <p className="quiz-score-main">
          {!isGraded ? "✓" : isPassed ? "✓" : "!"}
        </p>

        {!isGraded ? (
          <p className="quiz-score-sub">
            Jawaban untuk LKPD Pertemuan {state.pertemuan} sudah berhasil
            dikirim dan sedang menunggu penilaian.
          </p>
        ) : isPassed ? (
          <p className="quiz-score-sub">
            Jawabanmu sudah tuntas. Nilai minimal sudah memenuhi batas PJBL,
            yaitu 3 atau 4. Kamu boleh lanjut ke soal atau tahap berikutnya.
          </p>
        ) : (
          <p className="quiz-score-sub">
            Jawabanmu belum tuntas. Kamu perlu memperbaiki jawaban sampai
            mendapat nilai minimal 3 sebelum lanjut ke soal berikutnya.
          </p>
        )}

        {isGraded && (
          <div className="result-score-detail">
            <span>Nilai</span>
            <strong>{state.score ?? 0}</strong>
          </div>
        )}
      </div>

      <div className="quiz-buttons">
        <Link to="/quiz">
          <button className="quiz-btn secondary">
            Kembali ke Daftar LKPD
          </button>
        </Link>

        <Link to="/quiz/nilai-saya">
          <button className="quiz-btn primary">
            Lihat Nilai dan Feedback
          </button>
        </Link>

        {isGraded && isPassed && (
          <Link to="/proyek">
            <button className="quiz-btn primary">
              Lanjut ke Proyek
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default QuizResult;