import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../style/QuizList.css";

function normalizeTitleCase(text) {
  if (!text) return "";

  const keepUppercase = ["LKPD", "DKV", "PJBL"];

  return String(text)
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const cleanWord = word.replace(/[^a-z0-9]/gi, "").toUpperCase();

      if (keepUppercase.includes(cleanWord)) {
        return word.toUpperCase();
      }

      if (word.includes(":")) {
        const [beforeColon, afterColon] = word.split(":");

        return `${beforeColon.toUpperCase()}:${
          afterColon
            ? afterColon.charAt(0).toUpperCase() + afterColon.slice(1)
            : ""
        }`;
      }

      if (word === "&") return "&";

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default function QuizList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/quiz/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.data || []))
      .catch((err) => console.error("Gagal mengambil data:", err));
  }, []);

  const groupedQuiz = useMemo(() => {
    return questions.reduce((acc, item) => {
      const key = Number(item.pertemuan);

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);

      return acc;
    }, {});
  }, [questions]);

  const pertemuanList = useMemo(() => {
    return Object.keys(groupedQuiz).sort((a, b) => Number(a) - Number(b));
  }, [groupedQuiz]);

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <h2 className="quiz-title">Daftar LKPD</h2>
          <p className="quiz-subtitle">
            Pilih LKPD sesuai pertemuan untuk mulai mengerjakan aktivitas
            pembelajaran.
          </p>
        </div>

        {pertemuanList.length === 0 ? (
          <div className="quiz-empty">
            <p>Belum ada LKPD tersedia</p>
          </div>
        ) : (
          <div className="quiz-grid">
            {pertemuanList.map((pertemuan) => {
              const items = groupedQuiz[pertemuan];

              const judul =
                items.find((q) => q.judul_lkpd)?.judul_lkpd ||
                `LKPD Pertemuan ${pertemuan}`;

              const normalizedTitle = normalizeTitleCase(judul);

              return (
                <Link
                  key={pertemuan}
                  to={`/quiz/${pertemuan}`}
                  className="quiz-card"
                >
                  <div className="quiz-number-wrap">
                    <div className="quiz-number">{pertemuan}</div>
                    <span>Pertemuan {pertemuan}</span>
                  </div>

                  <div className="quiz-card-body">
                    <h3>{normalizedTitle}</h3>

                    <p>
                      {items.length} {items.length > 1 ? "Soal" : "Soal"} Essay
                    </p>
                  </div>

                  <div className="quiz-action">
                    <span>Mulai Kerjakan</span>
                    <b>→</b>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}