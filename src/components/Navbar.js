import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
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
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/materi">Materi</NavLink>
          <NavLink to="/quiz">LKPD</NavLink>
          <NavLink to="/proyek">Proyek</NavLink>
          <NavLink to="/quiz/nilai-saya">Nilai Saya</NavLink>
        </>
      );
    }

    if (role === "guru") {
      return (
        <>
          <NavLink to="/dashboard-guru">Dashboard</NavLink>
          <NavLink to="/guru/materi">Kelola Materi</NavLink>
          <NavLink to="/guru/quiz">Kelola LKPD</NavLink>
          <NavLink to="/guru/nilai-quiz">Nilai LKPD</NavLink>
          <NavLink to="/guru/proyek">Kelola Proyek</NavLink>
        </>
      );
    }

    return null;
  };

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        title={open ? "Tutup menu" : "Buka menu"}
      >
        {open ? "‹" : "›"}
      </button>

      <div className="sidebar-top">
        <img src="/images/photo/icon.png" alt="logo" />
        {open && (
          <div className="sidebar-title">
            <h3>DaGular</h3>
            <p>Learning Space</p>
          </div>
        )}
      </div>

      <nav className="sidebar-menu">
        {renderMenu()}
      </nav>

      <div className="sidebar-user">
        {open && (
          <div className="sidebar-user-info">
            <p>{name}</p>
            <span>{role}</span>
          </div>
        )}

        <button onClick={handleLogout} className="logout-btn">
          {open ? "Logout" : "⏻"}
        </button>
      </div>
    </aside>
  );
}