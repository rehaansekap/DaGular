import React, { useEffect, useMemo, useState } from "react";
import "../../style/KelolaProyek.css";

function KelolaProyek() {
  const [projects, setProjects] = useState([]);
  const [judul, setJudul] = useState("");
  const [pertemuan, setPertemuan] = useState("");
  const [openPertemuan, setOpenPertemuan] = useState({});

  const token = localStorage.getItem("token");

  const loadProjects = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/proyek`);
      const result = await res.json();
      const data = result.data || [];
      setProjects(data);

      const daftarPertemuan = [...new Set(data.map((p) => Number(p.pertemuan)))].sort(
        (a, b) => a - b
      );

      setOpenPertemuan((prev) => {
        const next = { ...prev };
        daftarPertemuan.forEach((item, index) => {
          if (next[item] === undefined) {
            next[item] = index === 0;
          }
        });
        return next;
      });
    } catch (error) {
      console.error("Gagal load proyek:", error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const groupedProjects = useMemo(() => {
    const grouped = {};

    projects.forEach((p) => {
      const key = Number(p.pertemuan);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((key) => ({
        pertemuan: key,
        items: grouped[key]
      }));
  }, [projects]);

  const totalPertemuan = groupedProjects.length;
  const totalProyek = projects.length;

  const togglePertemuan = (nomor) => {
    setOpenPertemuan((prev) => ({
      ...prev,
      [nomor]: !prev[nomor]
    }));
  };

  const tambahProyek = async (e) => {
    e.preventDefault();

    if (!judul.trim()) {
      alert("Judul proyek wajib diisi");
      return;
    }

    if (!pertemuan) {
      alert("Pertemuan wajib diisi");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/proyek/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          judul: judul.trim(),
          pertemuan: Number(pertemuan)
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal menambah proyek");
      }

      const pertemuanBaru = Number(pertemuan);

      setJudul("");
      setPertemuan("");
      setOpenPertemuan((prev) => ({
        ...prev,
        [pertemuanBaru]: true
      }));

      alert(result.message || "Proyek berhasil ditambahkan");
      loadProjects();
    } catch (error) {
      console.error("Gagal tambah proyek:", error);
      alert(error.message || "Gagal tambah proyek");
    }
  };

  const hapusProyek = async (id) => {
    if (!window.confirm("Yakin ingin menghapus proyek ini?")) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/proyek/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || "Gagal menghapus proyek");
      }

      alert(result.message || "Proyek berhasil dihapus");
      loadProjects();
    } catch (error) {
      console.error("Gagal hapus proyek:", error);
      alert(error.message || "Gagal hapus proyek");
    }
  };

  return (
    <div className="kelolaproyek-page">
      <div className="kelolaproyek-container">
        <section className="kelolaproyek-hero">
          <div>
            <span className="kelolaproyek-badge">Kelola Proyek</span>
            <h1 className="kelolaproyek-title">Kelola Daftar Proyek</h1>
            <p className="kelolaproyek-desc">
              Tambahkan proyek baru dan atur daftar proyek berdasarkan pertemuan
              dengan tampilan yang lebih rapi, modern, dan mudah dikelola.
            </p>
          </div>

          <div className="kelolaproyek-summary kelolaproyek-summary-2">
            <div className="summary-card">
              <span>Total Pertemuan</span>
              <strong>{totalPertemuan}</strong>
            </div>
            <div className="summary-card">
              <span>Total Proyek</span>
              <strong>{totalProyek}</strong>
            </div>
          </div>
        </section>

        <div className="kelolaproyek-layout">
          <aside className="kelolaproyek-sidebar">
            <div className="sidebar-scroll-area">
              <div className="sidebar-head">
                <h2>Tambah Proyek</h2>
                <p className="sidebar-subtext">
                  Masukkan proyek baru dan kelompokkan sesuai nomor pertemuan.
                </p>
              </div>

              <form className="proyek-form-modern" onSubmit={tambahProyek}>
                <label>Judul Proyek</label>
                <input
                  type="text"
                  placeholder="Masukkan judul proyek"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                />

                <label>Pertemuan</label>
                <input
                  type="number"
                  placeholder="Masukkan nomor pertemuan"
                  value={pertemuan}
                  onChange={(e) => setPertemuan(e.target.value)}
                />

                <button type="submit" className="btn-primary btn-full">
                  Tambah Proyek
                </button>
              </form>
            </div>
          </aside>

          <main className="kelolaproyek-content">
            {groupedProjects.length === 0 ? (
              <div className="empty-box">
                <div className="empty-illustration">📁</div>
                <h3>Belum ada proyek</h3>
                <p>
                  Tambahkan proyek baru untuk mulai mengelola proyek per
                  pertemuan.
                </p>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <div>
                    <h2>Daftar Proyek per Pertemuan</h2>
                    <p className="detail-subtitle">
                      Klik setiap pertemuan untuk membuka atau menutup daftar
                      proyek.
                    </p>
                  </div>
                </div>

                <div className="project-accordion-list">
                  {groupedProjects.map((group) => (
                    <div key={group.pertemuan} className="accordion-group">
                      <button
                        type="button"
                        className={`accordion-header ${
                          openPertemuan[group.pertemuan] ? "active" : ""
                        }`}
                        onClick={() => togglePertemuan(group.pertemuan)}
                      >
                        <div className="accordion-header-left">
                          <h3>Pertemuan {group.pertemuan}</h3>
                          <p>{group.items.length} proyek tersedia</p>
                        </div>

                        <div className="accordion-header-right">
                          <span className="meeting-badge">
                            {group.items.length} proyek
                          </span>
                          <span
                            className={`accordion-arrow ${
                              openPertemuan[group.pertemuan] ? "open" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </div>
                      </button>

                      {openPertemuan[group.pertemuan] && (
                        <div className="accordion-body">
                          <div className="student-info-grid student-info-grid-3">
                            <div className="info-card">
                              <span>Pertemuan</span>
                              <strong>{group.pertemuan}</strong>
                            </div>
                            <div className="info-card">
                              <span>Total Proyek</span>
                              <strong>{group.items.length}</strong>
                            </div>
                            <div className="info-card highlight">
                              <span>Status</span>
                              <strong>Aktif</strong>
                            </div>
                          </div>

                          <div className="project-list">
                            {group.items.map((p, index) => (
                              <div className="project-card" key={p.id}>
                                <div className="project-card-head">
                                  <h3>Proyek {index + 1}</h3>
                                  <span className="project-number">
                                    #{index + 1}
                                  </span>
                                </div>

                                <div className="project-group">
                                  <label>Judul Proyek</label>
                                  <div className="readonly-box">{p.judul}</div>
                                </div>

                                <div className="project-group">
                                  <label>Informasi Proyek</label>
                                  <div className="meta-inline">
                                    <span>Pertemuan {p.pertemuan}</span>
                                  </div>
                                </div>

                                <div className="project-action">
                                  <button
                                    className="btn-delete"
                                    onClick={() => hapusProyek(p.id)}
                                  >
                                    Hapus Proyek
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default KelolaProyek;