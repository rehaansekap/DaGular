import { useNavigate } from "react-router-dom";
import "../style/DashboardGuru.css";

export default function DashboardGuru() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Guru";

  const menus = [
    {
      title: "Kelola Materi",
      desc: "Tambah, ubah, dan atur materi pembelajaran dengan mudah.",
      action: () => navigate("/guru/materi"),
    },
    {
      title: "Kelola LKPD",
      desc: "Buat LKPD, edit pertanyaan, dan susun evaluasi siswa.",
      action: () => navigate("/guru/quiz"),
    },
    {
      title: "Kelola Proyek",
      desc: "Atur tugas proyek, jumlah pertemuan, dan progres pembelajaran.",
      action: () => navigate("/guru/proyek"),
    },

    // ✅ TAMBAHAN BARU
    {
      title: "Nilai LKPD",
      desc: "Lihat jawaban siswa dan berikan nilai serta feedback.",
      action: () => navigate("/guru/nilai-quiz"),
    },
  ];

  return (
    <div className="guru-page">
      <div className="guru-overlay">
        <div className="guru-container">
          <div className="guru-header">
            <p className="guru-badge">Panel Guru</p>
            <h1 className="guru-title">Dashboard Guru</h1>
            <p className="guru-subtitle">
              Selamat datang, <span>{name}</span>. Pilih menu di bawah untuk
              mengelola pembelajaran dengan lebih mudah.
            </p>
          </div>

          <div className="guru-menu">
            {menus.map((menu, index) => (
              <div className="guru-card" key={index}>
                <h3>{menu.title}</h3>
                <p>{menu.desc}</p>
                <button className="guru-btn" onClick={menu.action}>
                  Buka Menu
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}