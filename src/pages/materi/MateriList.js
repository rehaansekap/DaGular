import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../style/Materi.css";

const materiIcons = {
  1: "✏️",
  2: "💡",
  3: "▦",
  4: "✅",
};

const materiSubtitles = {
  1: "Pengantar konsep, elemen visual, dan dasar desain komunikasi visual.",
  2: "Eksplorasi ide, proses kreatif, dan penyusunan konsep awal proyek.",
  3: "Penerapan layout, komposisi, tipografi, warna, dan komunikasi visual.",
  4: "Penguatan alasan desain, evaluasi karya, dan refleksi hasil proyek.",
};

export default function MateriList() {
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/materi");
        const data = await res.json();

        setMateri(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal ambil materi:", err);
        setMateri([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMateri();
  }, []);

  const sortedMateri = useMemo(() => {
    return [...materi].sort((a, b) => {
      const pertemuanA = Number(a.pertemuan) || 0;
      const pertemuanB = Number(b.pertemuan) || 0;

      if (pertemuanA !== pertemuanB) {
        return pertemuanA - pertemuanB;
      }

      return Number(a.id) - Number(b.id);
    });
  }, [materi]);

  if (loading) {
    return (
      <div className="materi-list-page">
        <div className="materi-list-container">
          <p className="materi-loading">Memuat materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="materi-list-page">
      <div className="materi-list-container">
        <div className="materi-list-header">
          <h1>Materi Pembelajaran</h1>
          <p>
            Pilih materi sesuai pertemuan untuk memahami konsep sebelum
            menyusun proyek desain.
          </p>
        </div>

        <div className="materi-list-grid">
          {sortedMateri.length === 0 && (
            <p className="materi-empty">Belum ada materi</p>
          )}

          {sortedMateri.map((item) => {
            const pertemuan = Number(item.pertemuan);

            return (
              <Link
                key={item.id}
                to={`/materi/${item.id}`}
                className="materi-list-card"
              >
                <div className="materi-card-top">
                  <div className="materi-list-badge">
                    Pertemuan {item.pertemuan}
                  </div>
                </div>

                <div className="materi-card-main">
                  <div className="materi-icon">
                    {materiIcons[pertemuan] || "🎨"}
                  </div>

                  <div>
                    <h3>{item.judul}</h3>

                    <p className="materi-card-desc">
                      {materiSubtitles[pertemuan] ||
                        "Pelajari materi ini sebelum melanjutkan ke aktivitas proyek."}
                    </p>
                  </div>
                </div>

                <div className="materi-list-action">
                  <span>Pelajari Materi</span>
                  <b>→</b>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}