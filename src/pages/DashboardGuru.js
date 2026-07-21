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
      title: "Monitoring Proyek",
      desc: "Pantau rencana desain proyek dan jadwal proyek yang diajukan siswa.",
      action: () => navigate("/guru/monitoring-proyek"),
    },
    {
      title: "Hasil Evaluasi Belajar",
      desc: "Lihat hasil evaluasi pengalaman belajar, rata-rata pemahaman siswa, dan dampak penggunaan website.",
      action: () => navigate("/guru/evaluasi-belajar"),
    },
    {
      title: "Kelola LKPD",
      desc: "Buat LKPD, edit pertanyaan, rubrik, dan sistem penilaian otomatis siswa.",
      action: () => navigate("/guru/quiz"),
    },
    {
      title: "Nilai LKPD",
      desc: "Lihat jawaban siswa, hasil penilaian otomatis, revisi, dan feedback LKPD.",
      action: () => navigate("/guru/nilai-quiz"),
    },
    {
      title: "Kelola Galeri",
      desc: "Kelola karya atau proyek akhir yang diunggah siswa pada galeri.",
      action: () => navigate("/guru/proyek"),
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
              mengelola pembelajaran, memantau proyek siswa, dan melihat hasil
              evaluasi belajar.
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