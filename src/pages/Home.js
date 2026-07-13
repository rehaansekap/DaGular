import { Link } from "react-router-dom";
import "../style/Home.css";

export default function Home() {
  return (
    <section className="home">

      <div className="hero">

        {/* ================= LEFT ================= */}
        <div className="hero-left">

          <p className="hero-badge">
            Platform Pembelajaran Interaktif
          </p>

          <h1 className="hero-title">
            Pembelajaran <span>Komputer Grafis</span>
          </h1>

          <p className="hero-subtitle">
            Project Based Learning untuk kelas X DKV
          </p>

          <p className="hero-desc">
            Eksplorasi ide, warna, tipografi, dan komposisi visual
            melalui proyek desain kreatif menggunakan CorelDRAW.
          </p>

          <div className="hero-buttons">
            {/* ✅ SESUAI ROUTE APP.JS */}
            <Link to="/materi" className="btn-primary">
              Mulai Belajar
            </Link>

            <Link to="/proyek" className="btn-outline">
              Lihat Proyek
            </Link>
          </div>

        </div>


        {/* ================= RIGHT ================= */}
        <div className="hero-right">

          <div className="mockup-wrapper">

            <div className="mockup-card main">
              <h3>Fitur Website</h3>
              <ul>
                <li>📚 Materi Interaktif</li>
                <li>🧠 Auto Grading</li>
                <li>🎨 Upload Karya</li>
                <li>📊 Review Nilai</li>
              </ul>
            </div>

            {/* Floating mini cards */}
            <div className="mini-card one">🎨 Design</div>
            <div className="mini-card two">🧠 Kreatif</div>
            <div className="mini-card three">💻 Digital</div>

          </div>

        </div>

      </div>
    </section>
  );
}
