import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../style/KelolaMateri.css";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://178.128.209.29:5000"
).replace(/\/$/, "");

export default function KelolaMateri() {
  const [materiList, setMateriList] = useState([]);
  const [judul, setJudul] = useState("");
  const [pertemuan, setPertemuan] = useState("");
  const [loading, setLoading] = useState(false);
  const [konten, setKonten] = useState([]);
  const [openPertemuan, setOpenPertemuan] = useState({});

  const token = localStorage.getItem("token");

  const getFileUrl = (url) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      return url;
    }

    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const fetchMateri = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/materi`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

      setMateriList(data);

      const daftarPertemuan = [
        ...new Set(data.map((item) => Number(item.pertemuan))),
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
    } catch (err) {
      console.error("Error fetch materi:", err);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, []);

  const groupedMateri = useMemo(() => {
    const grouped = {};

    materiList.forEach((item) => {
      const key = Number(item.pertemuan);

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((key) => ({
        pertemuan: key,
        items: grouped[key],
      }));
  }, [materiList]);

  const totalPertemuan = groupedMateri.length;
  const totalMateri = materiList.length;

  const togglePertemuan = (nomor) => {
    setOpenPertemuan((prev) => ({
      ...prev,
      [nomor]: !prev[nomor],
    }));
  };

  const tambahKonten = (type) => {
    setKonten((prev) => [
      ...prev,
      {
        type,
        title: "",
        body: "",
        url: "",
        urutan: prev.length + 1,
      },
    ]);
  };

  const hapusKonten = (index) => {
    const updated = konten
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        urutan: i + 1,
      }));

    setKonten(updated);
  };

  const handleKontenChange = (index, field, value) => {
    const updated = [...konten];
    updated[index][field] = value;
    setKonten(updated);
  };

  const handleUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!token) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/api/materi/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = [...konten];
      updated[index].url = res.data.url;
      setKonten(updated);
    } catch (err) {
      console.error("Upload gagal:", err);
      alert(err.response?.data?.message || "Upload gagal");
    }
  };

  const getGeniallyEmbedUrl = (value) => {
    if (!value) return "";

    const srcMatch = value.match(/src=["']([^"']+)["']/);

    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }

    return value;
  };

  const handleGeniallyChange = (index, value) => {
    const embedUrl = getGeniallyEmbedUrl(value);
    handleKontenChange(index, "url", embedUrl);
  };

  const handleDeleteMateri = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus materi ini? Semua konten di dalamnya juga akan terhapus."
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/materi/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Materi berhasil dihapus");
      fetchMateri();
    } catch (err) {
      console.error("Gagal menghapus materi:", err);
      alert(err.response?.data?.message || "Gagal menghapus materi");
    }
  };

  const resetForm = () => {
    setJudul("");
    setPertemuan("");
    setKonten([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    if (!judul.trim() || !pertemuan) {
      alert("Judul dan pertemuan wajib diisi");
      return;
    }

    if (konten.length === 0) {
      alert("Minimal tambahkan satu konten materi");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/materi/create`,
        {
          judul: judul.trim(),
          pertemuan: Number(pertemuan),
          konten,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Materi berhasil ditambahkan");

      resetForm();
      fetchMateri();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menambahkan materi");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    if (type === "text") return "Teks";
    if (type === "image") return "Gambar";
    if (type === "video") return "Video";
    if (type === "genially") return "Genially";
    return "Konten";
  };

  return (
    <div className="kelola-page">
      <div className="kelola-container">
        <div className="kelola-header">
          <div>
            <span className="kelola-label">Dashboard Admin</span>
            <h1 className="kelola-title">Kelola Materi</h1>
            <p className="kelola-desc">
              Tambahkan, susun, dan kelola materi pembelajaran siswa.
            </p>
          </div>

          <div className="kelola-summary">
            <div className="summary-card">
              <span>Total Pertemuan</span>
              <strong>{totalPertemuan}</strong>
            </div>

            <div className="summary-card">
              <span>Total Materi</span>
              <strong>{totalMateri}</strong>
            </div>
          </div>
        </div>

        <div className="kelola-layout">
          <form onSubmit={handleSubmit} className="kelola-form">
            <div className="form-section-title">
              <h2>Tambah Materi Baru</h2>
              <p>Isi informasi dasar materi dan tambahkan konten pendukung.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Judul Materi</label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Transformasi 2D"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pertemuan</label>
                <input
                  type="number"
                  value={pertemuan}
                  onChange={(e) => setPertemuan(e.target.value)}
                  placeholder="Contoh: 1"
                  required
                />
              </div>
            </div>

            <div className="content-header">
              <div>
                <h3>Konten Materi</h3>
                <p>Pilih jenis konten yang ingin ditambahkan.</p>
              </div>
            </div>

            {konten.length === 0 && (
              <div className="empty-content">
                Belum ada konten. Tambahkan teks, gambar, video, atau Genially.
              </div>
            )}

            {konten.map((item, index) => (
              <div className="content-card" key={index}>
                <div className="content-card-header">
                  <div>
                    <span className="content-type">
                      {getTypeLabel(item.type)}
                    </span>
                    <h4>Konten {index + 1}</h4>
                  </div>

                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => hapusKonten(index)}
                  >
                    Hapus
                  </button>
                </div>

                <div className="form-group">
                  <label>Judul Konten</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleKontenChange(index, "title", e.target.value)
                    }
                    placeholder="Masukkan judul konten"
                  />
                </div>

                {item.type === "text" && (
                  <div className="form-group">
                    <label>Isi Teks</label>
                    <textarea
                      value={item.body}
                      onChange={(e) =>
                        handleKontenChange(index, "body", e.target.value)
                      }
                      placeholder="Tulis isi materi di sini"
                    />
                  </div>
                )}

                {item.type === "image" && (
                  <div className="form-group">
                    <label>Upload Gambar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, index)}
                    />

                    {item.url && (
                      <img
                        src={getFileUrl(item.url)}
                        alt={item.title || "Preview gambar"}
                        className="content-preview-img"
                      />
                    )}
                  </div>
                )}

                {item.type === "video" && (
                  <div className="form-group">
                    <label>Upload Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleUpload(e, index)}
                    />

                    {item.url && (
                      <video
                        src={getFileUrl(item.url)}
                        controls
                        className="content-preview-video"
                      />
                    )}
                  </div>
                )}

                {item.type === "genially" && (
                  <div className="form-group">
                    <label>Link / Embed Genially</label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) =>
                        handleGeniallyChange(index, e.target.value)
                      }
                      placeholder="Tempel link atau kode embed Genially"
                    />

                    {item.url && (
                      <div className="genially-preview-wrapper">
                        <iframe
                          src={item.url}
                          title={item.title || "Genially Preview"}
                          className="genially-preview"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="content-button-group">
              <button type="button" onClick={() => tambahKonten("text")}>
                + Teks
              </button>

              <button type="button" onClick={() => tambahKonten("image")}>
                + Gambar
              </button>

              <button type="button" onClick={() => tambahKonten("video")}>
                + Video
              </button>

              <button type="button" onClick={() => tambahKonten("genially")}>
                + Genially
              </button>
            </div>

            <div className="form-action">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Materi"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="kelola-list">
            <div className="list-header">
              <h2>Daftar Materi</h2>
              <p>Materi yang sudah tersimpan berdasarkan pertemuan.</p>
            </div>

            {groupedMateri.length === 0 ? (
              <div className="empty-content">Belum ada materi.</div>
            ) : (
              <div className="materi-accordion-list">
                {groupedMateri.map((group) => (
                  <div className="materi-accordion-group" key={group.pertemuan}>
                    <button
                      type="button"
                      className={`accordion-header ${
                        openPertemuan[group.pertemuan] ? "active" : ""
                      }`}
                      onClick={() => togglePertemuan(group.pertemuan)}
                    >
                      <div>
                        <h3>Pertemuan {group.pertemuan}</h3>
                        <p>{group.items.length} materi tersedia</p>
                      </div>

                      <span>
                        {openPertemuan[group.pertemuan] ? "▲" : "▼"}
                      </span>
                    </button>

                    {openPertemuan[group.pertemuan] && (
                      <div className="accordion-body">
                        {group.items.map((item, index) => (
                          <div className="materi-card" key={item.id}>
                            <div className="materi-card-head">
                              <div>
                                <span>Materi {index + 1}</span>
                                <h3>{item.judul}</h3>
                              </div>

                              <button
                                type="button"
                                className="btn-delete"
                                onClick={() => handleDeleteMateri(item.id)}
                              >
                                Hapus
                              </button>
                            </div>

                            <div className="materi-card-meta">
                              <span>Pertemuan {item.pertemuan}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}