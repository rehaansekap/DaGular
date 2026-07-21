import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const name = localStorage.getItem("name") || "Pengguna";
  const role = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (!token) return null;

  const renderMenu = () => {
    if (role === "siswa") {
      return (
        <>
          <NavLink to="/" end>
            <span>Home</span>
          </NavLink>

          <NavLink to="/materi">
            <span>Materi</span>
          </NavLink>

          <NavLink to="/proyek/desain">
            <span>Desain Proyek</span>
          </NavLink>

          <NavLink to="/quiz">
            <span>LKPD</span>
          </NavLink>

          <NavLink to="/proyek" end>
            <span>Galeri Siswa</span>
          </NavLink>

          <NavLink to="/evaluasi-belajar">
            <span>Evaluasi Belajar</span>
          </NavLink>

          <NavLink to="/quiz/nilai-saya">
            <span>Nilai Saya</span>
          </NavLink>
        </>
      );
    }

    if (role === "guru") {
      return (
        <>
          <NavLink to="/dashboard-guru">
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/guru/monitoring-proyek">
            <span>Monitoring Proyek</span>
          </NavLink>

          <NavLink to="/guru/evaluasi-belajar">
            <span>Hasil Evaluasi Belajar</span>
          </NavLink>

          <NavLink to="/guru/materi">
            <span>Kelola Materi</span>
          </NavLink>

          <NavLink to="/guru/quiz">
            <span>Kelola LKPD</span>
          </NavLink>

          <NavLink to="/guru/nilai-quiz">
            <span>Nilai LKPD</span>
          </NavLink>

          <NavLink to="/guru/proyek">
            <span>Kelola Galeri</span>
          </NavLink>
        </>
      );
    }

    return null;
  };

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        title={open ? "Tutup menu" : "Buka menu"}
      >
        {open ? "‹" : "›"}
      </button>

      <div className="sidebar-brand">
        <div className="sidebar-logo-wrap">
          <img src="/images/photo/icon.png" alt="DaGular Logo" />
        </div>

        {open && (
          <div className="sidebar-title">
            <h3>DaGular</h3>
            <p>Learning Space</p>
          </div>
        )}
      </div>

      <nav className="sidebar-menu">{renderMenu()}</nav>

      <div className="sidebar-bottom">
        {open && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <p>{name}</p>
              <span>{role}</span>
            </div>
          </div>
        )}

        <button type="button" onClick={handleLogout} className="logout-btn">
          {open ? "Logout" : "⏻"}
        </button>
      </div>
    </aside>
  );
}