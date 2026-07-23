import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../style/KelolaProyek.css";

const API_URL = "http://localhost:5000";
const GALLERY_PAGE_SIZE = 8;

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

async function readJsonSafely(res) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function KelolaProyek() {
  const [projects, setProjects] = useState([]);
  const [judul, setJudul] = useState("");
  const [pertemuan, setPertemuan] = useState("");
  const [openPertemuan, setOpenPertemuan] = useState({});
  const [filterPertemuan, setFilterPertemuan] = useState("all");

  const [galleryMap, setGalleryMap] = useState({});
  const [loadingGalleryMap, setLoadingGalleryMap] = useState({});

  const [activeGalleryProject, setActiveGalleryProject] = useState(null);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryPage, setGalleryPage] = useState(1);
  const [openCommentWorkId, setOpenCommentWorkId] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  const token = localStorage.getItem("token");

  const fetchCommentsByKarya = useCallback(async (karyaId) => {
    if (!karyaId) return [];

    try {
      const res = await fetch(`${API_URL}/api/karya/${karyaId}/comments`);
      const result = await readJsonSafely(res);

      if (!res.ok || result.success === false) {
        return [];
      }

      return result.data || [];
    } catch (error) {
      console.error("Gagal mengambil komentar karya:", error);
      return [];
    }
  }, []);

  const loadGallerySummaryByProject = useCallback(async (projectId) => {
    if (!projectId) return;

    setLoadingGalleryMap((prev) => ({
      ...prev,
      [projectId]: true,
    }));

    try {
      const res = await fetch(`${API_URL}/api/karya/project/${projectId}`);
      const result = await readJsonSafely(res);

      if (!res.ok || result.success === false) {
        setGalleryMap((prev) => ({
          ...prev,
          [projectId]: {
            works: [],
            totalComments: 0,
            commentsLoaded: false,
          },
        }));
        return;
      }

      const works = Array.isArray(result.data) ? result.data : [];

      const quickTotalComments = works.reduce((sum, work) => {
        return sum + Number(work.comment_count || 0);
      }, 0);

      setGalleryMap((prev) => ({
        ...prev,
        [projectId]: {
          works: works.map((work) => ({
            ...work,
            comments: [],
            comment_count: Number(work.comment_count || 0),
          })),
          totalComments: quickTotalComments,
          commentsLoaded: false,
        },
      }));
    } catch (error) {
      console.error("Gagal mengambil ringkasan galeri proyek:", error);

      setGalleryMap((prev) => ({
        ...prev,
        [projectId]: {
          works: [],
          totalComments: 0,
          commentsLoaded: false,
        },
      }));
    } finally {
      setLoadingGalleryMap((prev) => ({
        ...prev,
        [projectId]: false,
      }));
    }
  }, []);

  const loadGalleryDetailByProject = useCallback(
    async (projectId) => {
      if (!projectId) return;

      setLoadingGalleryMap((prev) => ({
        ...prev,
        [projectId]: true,
      }));

      try {
        const res = await fetch(`${API_URL}/api/karya/project/${projectId}`);
        const result = await readJsonSafely(res);

        if (!res.ok || result.success === false) {
          setGalleryMap((prev) => ({
            ...prev,
            [projectId]: {
              works: [],
              totalComments: 0,
              commentsLoaded: true,
            },
          }));
          return;
        }

        const works = Array.isArray(result.data) ? result.data : [];

        const worksWithComments = await Promise.all(
          works.map(async (work) => {
            const comments = await fetchCommentsByKarya(work.id);

            return {
              ...work,
              comments,
              comment_count: comments.length,
            };
          })
        );

        const totalComments = worksWithComments.reduce((sum, work) => {
          return sum + Number(work.comment_count || 0);
        }, 0);

        setGalleryMap((prev) => ({
          ...prev,
          [projectId]: {
            works: worksWithComments,
            totalComments,
            commentsLoaded: true,
          },
        }));
      } catch (error) {
        console.error("Gagal mengambil detail galeri proyek:", error);

        setGalleryMap((prev) => ({
          ...prev,
          [projectId]: {
            works: [],
            totalComments: 0,
            commentsLoaded: true,
          },
        }));
      } finally {
        setLoadingGalleryMap((prev) => ({
          ...prev,
          [projectId]: false,
        }));
      }
    },
    [fetchCommentsByKarya]
  );

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/proyek`);
      const result = await res.json();
      const data = result.data || [];

      const sortedData = [...data].sort((a, b) => {
        const pertemuanA = Number(a.pertemuan) || 0;
        const pertemuanB = Number(b.pertemuan) || 0;

        if (pertemuanA !== pertemuanB) return pertemuanA - pertemuanB;

        return Number(a.id) - Number(b.id);
      });

      setProjects(sortedData);

      const daftarPertemuan = [
        ...new Set(sortedData.map((p) => Number(p.pertemuan))),
      ].sort((a, b) => a - b);

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
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (projects.length === 0) return;

    projects.forEach((project) => {
      loadGallerySummaryByProject(project.id);
    });
  }, [projects, loadGallerySummaryByProject]);

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
        items: grouped[key],
      }));
  }, [projects]);

  const filteredGroupedProjects = useMemo(() => {
    if (filterPertemuan === "all") return groupedProjects;

    return groupedProjects.filter(
      (group) => Number(group.pertemuan) === Number(filterPertemuan)
    );
  }, [groupedProjects, filterPertemuan]);

  const pertemuanOptions = useMemo(() => {
    return groupedProjects.map((group) => group.pertemuan);
  }, [groupedProjects]);

  const totalPertemuan = groupedProjects.length;
  const totalProyek = projects.length;

  const totalKarya = useMemo(() => {
    return projects.reduce((sum, project) => {
      return sum + Number(galleryMap[project.id]?.works?.length || 0);
    }, 0);
  }, [projects, galleryMap]);

  const proyekSudahAdaKarya = useMemo(() => {
    return projects.filter((project) => {
      return Number(galleryMap[project.id]?.works?.length || 0) > 0;
    }).length;
  }, [projects, galleryMap]);

  const togglePertemuan = (nomor) => {
    setOpenPertemuan((prev) => ({
      ...prev,
      [nomor]: !prev[nomor],
    }));
  };

  const openGalleryModal = async (project) => {
    setActiveGalleryProject(project);
    setGallerySearch("");
    setGalleryPage(1);
    setOpenCommentWorkId(null);

    await loadGalleryDetailByProject(project.id);
  };

  const closeGalleryModal = () => {
    setActiveGalleryProject(null);
    setGallerySearch("");
    setGalleryPage(1);
    setOpenCommentWorkId(null);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          judul: judul.trim(),
          pertemuan: Number(pertemuan),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal menambah proyek");
      }

      const pertemuanBaru = Number(pertemuan);

      setJudul("");
      setPertemuan("");
      setFilterPertemuan(pertemuanBaru);
      setOpenPertemuan((prev) => ({
        ...prev,
        [pertemuanBaru]: true,
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
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || "Gagal menghapus proyek");
      }

      setGalleryMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      if (Number(activeGalleryProject?.id) === Number(id)) {
        closeGalleryModal();
      }

      alert(result.message || "Proyek berhasil dihapus");
      loadProjects();
    } catch (error) {
      console.error("Gagal hapus proyek:", error);
      alert(error.message || "Gagal hapus proyek");
    }
  };

  const renderGalleryModal = () => {
    if (!activeGalleryProject) return null;

    const galleryData = galleryMap[activeGalleryProject.id] || {
      works: [],
      totalComments: 0,
      commentsLoaded: false,
    };

    const works = galleryData.works || [];
    const isLoading = Boolean(loadingGalleryMap[activeGalleryProject.id]);

    const filteredWorks = works.filter((work) => {
      const keyword = gallerySearch.toLowerCase().trim();

      if (!keyword) return true;

      return String(work.uploader || "").toLowerCase().includes(keyword);
    });

    const totalPages = Math.max(
      1,
      Math.ceil(filteredWorks.length / GALLERY_PAGE_SIZE)
    );

    const safePage = Math.min(galleryPage, totalPages);
    const startIndex = (safePage - 1) * GALLERY_PAGE_SIZE;
    const paginatedWorks = filteredWorks.slice(
      startIndex,
      startIndex + GALLERY_PAGE_SIZE
    );

    return (
      <div className="guru-gallery-modal" onClick={closeGalleryModal}>
        <section
          className="guru-gallery-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-gallery-header">
            <div>
              <span className="modal-gallery-badge">
                Pertemuan {activeGalleryProject.pertemuan}
              </span>

              <h2>Galeri Karya Siswa</h2>

              <p>{activeGalleryProject.judul}</p>
            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={closeGalleryModal}
            >
              ×
            </button>
          </div>

          <div className="modal-gallery-summary">
            <div>
              <span>Total Karya</span>
              <strong>{works.length}</strong>
            </div>

            <div>
              <span>Peer Review</span>
              <strong>
                {isLoading
                  ? "..."
                  : galleryData.commentsLoaded
                    ? galleryData.totalComments || 0
                    : galleryData.totalComments || "-"}
              </strong>
            </div>

            <div>
              <span>Ditampilkan</span>
              <strong>{paginatedWorks.length}</strong>
            </div>

            <div>
              <span>Halaman</span>
              <strong>
                {safePage}/{totalPages}
              </strong>
            </div>
          </div>

          <div className="modal-gallery-toolbar">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={gallerySearch}
              onChange={(e) => {
                setGallerySearch(e.target.value);
                setGalleryPage(1);
                setOpenCommentWorkId(null);
              }}
            />

            <button
              type="button"
              className="modal-refresh-btn"
              onClick={() => loadGalleryDetailByProject(activeGalleryProject.id)}
              disabled={isLoading}
            >
              {isLoading ? "Memuat..." : "Refresh"}
            </button>
          </div>

          <div className="modal-gallery-body">
            {isLoading ? (
              <p className="modal-gallery-empty">
                Sedang memuat karya siswa...
              </p>
            ) : works.length === 0 ? (
              <p className="modal-gallery-empty">
                Belum ada karya yang diunggah siswa pada proyek ini.
              </p>
            ) : filteredWorks.length === 0 ? (
              <p className="modal-gallery-empty">
                Tidak ada karya yang sesuai dengan pencarian.
              </p>
            ) : (
              <div className="modal-gallery-grid">
                {paginatedWorks.map((work) => {
                  const comments = work.comments || [];
                  const commentIsOpen =
                    Number(openCommentWorkId) === Number(work.id);

                  return (
                    <article className="modal-gallery-card" key={work.id}>
                      <button
                        type="button"
                        className="modal-gallery-image"
                        onClick={() => setPreviewImg(work.image_path)}
                      >
                        <img
                          src={work.image_path}
                          alt={`Karya oleh ${work.uploader || "Siswa"}`}
                        />
                      </button>

                      <div className="modal-gallery-card-body">
                        <span className="modal-gallery-label">
                          Diunggah oleh
                        </span>

                        <h3>{work.uploader || "Siswa"}</h3>

                        <p className="modal-gallery-date">
                          {formatDate(work.created_at || work.uploaded_at)}
                        </p>

                        <button
                          type="button"
                          className={
                            commentIsOpen
                              ? "modal-comment-toggle active"
                              : "modal-comment-toggle"
                          }
                          onClick={() =>
                            setOpenCommentWorkId((prev) =>
                              Number(prev) === Number(work.id) ? null : work.id
                            )
                          }
                        >
                          💬 {work.comment_count || 0} Peer Review
                        </button>

                        {commentIsOpen && (
                          <div className="modal-comment-box">
                            {comments.length === 0 ? (
                              <p className="modal-comment-empty">
                                Belum ada komentar peer review.
                              </p>
                            ) : (
                              <div className="modal-comment-list">
                                {comments.map((comment) => (
                                  <div
                                    className="modal-comment-item"
                                    key={comment.id}
                                  >
                                    <div>
                                      <b>{comment.nama_pengguna || "Siswa"}</b>

                                      <span>
                                        {formatDate(comment.created_at)}
                                      </span>
                                    </div>

                                    <p>{comment.komentar}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {filteredWorks.length > GALLERY_PAGE_SIZE && (
            <div className="modal-pagination">
              <button
                type="button"
                onClick={() => {
                  setGalleryPage((prev) => Math.max(prev - 1, 1));
                  setOpenCommentWorkId(null);
                }}
                disabled={safePage === 1}
              >
                ← Sebelumnya
              </button>

              <span>
                Halaman {safePage} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() => {
                  setGalleryPage((prev) => Math.min(prev + 1, totalPages));
                  setOpenCommentWorkId(null);
                }}
                disabled={safePage === totalPages}
              >
                Berikutnya →
              </button>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="kelolaproyek-page">
      <div className="kelolaproyek-container">
        <section className="kelolaproyek-hero">
          <div>
            <span className="kelolaproyek-badge">Panel Guru</span>

            <h1 className="kelolaproyek-title">Kelola Daftar Proyek</h1>

            <p className="kelolaproyek-desc">
              Tambahkan proyek baru, atur daftar proyek berdasarkan pertemuan,
              dan pantau karya siswa melalui galeri khusus guru.
            </p>
          </div>

          <button
            type="button"
            className="hero-refresh-btn"
            onClick={() => {
              loadProjects();
              projects.forEach((project) => {
                loadGallerySummaryByProject(project.id);
              });
            }}
          >
            Refresh Data
          </button>
        </section>

        <section className="filter-card">
          <strong>Filter Pertemuan</strong>

          <div className="filter-tabs">
            <button
              type="button"
              className={filterPertemuan === "all" ? "active" : ""}
              onClick={() => setFilterPertemuan("all")}
            >
              Semua
            </button>

            {pertemuanOptions.map((item) => (
              <button
                type="button"
                key={item}
                className={
                  Number(filterPertemuan) === Number(item) ? "active" : ""
                }
                onClick={() => {
                  setFilterPertemuan(item);
                  setOpenPertemuan((prev) => ({
                    ...prev,
                    [item]: true,
                  }));
                }}
              >
                Pertemuan {item}
              </button>
            ))}
          </div>
        </section>

        <section className="kelolaproyek-summary kelolaproyek-summary-4">
          <div className="summary-card">
            <span>Total Pertemuan</span>
            <strong>{totalPertemuan}</strong>
          </div>

          <div className="summary-card">
            <span>Total Proyek</span>
            <strong>{totalProyek}</strong>
          </div>

          <div className="summary-card">
            <span>Karya Terkumpul</span>
            <strong>{totalKarya}</strong>
          </div>

          <div className="summary-card">
            <span>Proyek Ada Karya</span>
            <strong>{proyekSudahAdaKarya}</strong>
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

              <div className="sidebar-monitor-note">
                <strong>Monitoring Galeri</strong>

                <p>
                  Klik <b>Lihat Galeri</b> pada kartu proyek. Galeri akan
                  terbuka dalam popup sehingga halaman tetap pendek dan rapi.
                </p>
              </div>
            </div>
          </aside>

          <main className="kelolaproyek-content">
            {filteredGroupedProjects.length === 0 ? (
              <div className="empty-box">
                <div className="empty-illustration">📁</div>

                <h3>Belum ada proyek</h3>

                <p>
                  Tambahkan proyek baru atau ubah filter pertemuan untuk melihat
                  daftar proyek.
                </p>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <div>
                    <h2>Daftar Proyek per Pertemuan</h2>

                    <p className="detail-subtitle">
                      Kelola proyek tetap ringkas. Detail karya siswa dibuka
                      melalui modal galeri agar tidak membuat halaman terlalu
                      panjang.
                    </p>
                  </div>
                </div>

                <div className="project-accordion-list">
                  {filteredGroupedProjects.map((group) => {
                    const groupWorkCount = group.items.reduce(
                      (sum, project) => {
                        return (
                          sum +
                          Number(galleryMap[project.id]?.works?.length || 0)
                        );
                      },
                      0
                    );

                    return (
                      <div key={group.pertemuan} className="accordion-group">
                        <button
                          type="button"
                          className={`accordion-header ${openPertemuan[group.pertemuan] ? "active" : ""
                            }`}
                          onClick={() => togglePertemuan(group.pertemuan)}
                        >
                          <div className="accordion-header-left">
                            <h3>Pertemuan {group.pertemuan}</h3>

                            <p>
                              {group.items.length} proyek tersedia •{" "}
                              {groupWorkCount} karya terkumpul
                            </p>
                          </div>

                          <div className="accordion-header-right">
                            <span className="meeting-badge">
                              {group.items.length} proyek
                            </span>

                            <span
                              className={`accordion-arrow ${openPertemuan[group.pertemuan] ? "open" : ""
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
                                <span>Karya Terkumpul</span>
                                <strong>{groupWorkCount}</strong>
                              </div>
                            </div>

                            <div className="project-list">
                              {group.items.map((p, index) => {
                                const galleryData = galleryMap[p.id] || {
                                  works: [],
                                  totalComments: 0,
                                  commentsLoaded: false,
                                };

                                const workCount =
                                  galleryData.works?.length || 0;

                                return (
                                  <div className="project-card" key={p.id}>
                                    <div className="project-card-head">
                                      <div>
                                        <span className="project-small-label">
                                          Proyek {index + 1}
                                        </span>

                                        <h3>{p.judul}</h3>
                                      </div>

                                      <span className="project-number">
                                        #{index + 1}
                                      </span>
                                    </div>

                                    <div className="project-group">
                                      <label>Informasi Proyek</label>

                                      <div className="meta-inline">
                                        <span>Pertemuan {p.pertemuan}</span>
                                        <span>{workCount} karya siswa</span>
                                        <span>
                                          {galleryData.commentsLoaded
                                            ? `${galleryData.totalComments} peer review`
                                            : "Peer review lihat di galeri"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="project-action">
                                      <button
                                        type="button"
                                        className="btn-monitor-gallery"
                                        onClick={() => openGalleryModal(p)}
                                      >
                                        Lihat Galeri
                                      </button>

                                      <button
                                        type="button"
                                        className="btn-delete"
                                        onClick={() => hapusProyek(p.id)}
                                      >
                                        Hapus Proyek
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {renderGalleryModal()}

      {previewImg && (
        <div className="guru-image-modal" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="Preview karya siswa" />
        </div>
      )}
    </div>
  );
}

export default KelolaProyek;