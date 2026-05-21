import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../style/Materi.css";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://178.128.209.29:5000"
).replace(/\/$/, "");

export default function MateriList() {
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const res = await fetch(`${API_URL}/api/materi`);
        const data = await res.json();

        setMateri(data);
        setLoading(false);
      } catch (err) {
        console.error("Gagal ambil materi:", err);
        setLoading(false);
      }
    };

    fetchMateri();
  }, []);

  if (loading) {
    return <p className="materi-loading">Memuat materi...</p>;
  }

  return (
    <div className="materi-list-page">
      <div className="materi-list-container">
        <div className="materi-list-header">
          <span>Materi</span>
          <h1>Materi Pembelajaran</h1>
          <p>Pilih materi pembelajaran yang ingin kamu pelajari.</p>
        </div>

        <div className="materi-list-grid">
          {materi.length === 0 && (
            <p className="materi-empty">Belum ada materi</p>
          )}

          {materi.map((item) => (
            <Link
              key={item.id}
              to={`/materi/${item.id}`}
              className="materi-list-card"
            >
              <div className="materi-list-badge">
                Pertemuan {item.pertemuan}
              </div>

              <h3>{item.judul}</h3>

              <div className="materi-list-action">
                Buka Materi →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}