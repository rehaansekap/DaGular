import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../style/QuizList.css";

export default function QuizList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/quiz/questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data.data || []))
      .catch((err) => console.error("Gagal mengambil data:", err));
  }, []);

  const groupedQuiz = questions.reduce((acc, item) => {
    const key = Number(item.pertemuan);

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);

    return acc;
  }, {});

  const pertemuanList = Object.keys(groupedQuiz).sort((a, b) => a - b);

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <h2 className="quiz-title">Daftar LKPD</h2>
        <p className="quiz-subtitle">
          Pilih LKPD sesuai pertemuan untuk mulai mengerjakan
        </p>

        {pertemuanList.length === 0 ? (
          <div className="quiz-empty">
            <p>Belum ada LKPD tersedia</p>
          </div>
        ) : (
          <div className="quiz-grid">
            {pertemuanList.map((pertemuan) => {
              const items = groupedQuiz[pertemuan];

              // ambil judul dari soal pertama
              const judul =
                items.find((q) => q.judul_lkpd)?.judul_lkpd ||
                `LKPD Pertemuan ${pertemuan}`;

              return (
                <Link
                  key={pertemuan}
                  to={`/quiz/${pertemuan}`}
                  className="quiz-card"
                >
                  <div className="quiz-number">{pertemuan}</div>

                  <h3>{judul}</h3>

                  <p>{items.length} soal</p>

                  <span className="quiz-action">Kerjakan →</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}