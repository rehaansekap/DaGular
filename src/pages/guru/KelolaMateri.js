import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../style/KelolaMateri.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const formatImageUrl = (url) => {
  if (!url) return "";
  let cleanUrl = String(url).trim();
  if (cleanUrl.startsWith("http://localhost:5000")) {
    cleanUrl = cleanUrl.replace("http://localhost:5000", API_URL);
  }
  if (typeof window !== "undefined" && window.location.protocol === "https:" && cleanUrl.startsWith("http://")) {
    cleanUrl = cleanUrl.replace(/^http:/, "https:");
  }
  return cleanUrl;
};

export default function KelolaMateri() {
  const [materiList, setMateriList] = useState([]);
  const [judul, setJudul] = useState("");
  const [pertemuan, setPertemuan] = useState("");
  const [loading, setLoading] = useState(false);
  const [konten, setKonten] = useState([]);

  const fetchMateri = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/materi`);

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setMateriList(data);
    } catch (err) {
      console.error("Error fetch materi:", err);
      alert("Gagal mengambil data materi");
    }
  };

  useEffect(() => {
    fetchMateri();
  }, []);

  const groupedMateri = useMemo(() => {
    return materiList.reduce((acc, item) => {
      const key = Number(item.pertemuan);

      if (!acc[key]) acc[key] = [];

      acc[key].push(item);
      return acc;
    }, {});
  }, [materiList]);

  const totalPertemuan = Object.keys(groupedMateri).length;
  const totalMateri = materiList.length;

  const totalKonten = useMemo(() => {
    return materiList.reduce((total, materi) => {
      try {
        const parsedKonten =
          typeof materi.konten === "string"
            ? JSON.parse(materi.konten)
            : materi.konten;

        return total + (Array.isArray(parsedKonten) ? parsedKonten.length : 0);
      } catch {
        return total;
      }
    }, 0);
  }, [materiList]);

  const tambahKonten = (type) => {
    setKonten([
      ...konten,
      {
        type,
        title: "",
        body: "",
        url: "",
        urutan: konten.length + 1,
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
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/materi/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updated = [...konten];
      updated[index].url = res.data.url;
      setKonten(updated);
    } catch (err) {
      console.error("Upload gagal:", err);
      alert("Upload gagal");
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
      await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/materi/delete/${id}`);

      alert("Materi berhasil dihapus");
      fetchMateri();
    } catch (err) {
      console.error("Gagal menghapus materi:", err);
      alert("Gagal menghapus materi");
    }
  };

  const resetForm = () => {
    setJudul("");
    setPertemuan("");
    setKonten([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    if (!judul || !pertemuan) {
      alert("Judul dan pertemuan wajib diisi");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/materi/create`,
        {
          judul,
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
    }

    setLoading(false);
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
        <section className="kelola-header">
          <div>
            <span className="kelola-label">Panel Guru</span>

            <h1 className="kelola-title">Kelola Materi</h1>

            <p className="kelola-desc">
              Tambahkan, susun, dan kelola materi pembelajaran siswa berdasarkan
              pertemuan. Materi dapat berisi teks, gambar, video, dan embed
              Genially.
            </p>
          </div>

          <button type="button" className="kelola-refresh-btn" onClick={fetchMateri}>
            Refresh Data
          </button>
        </section>

        <section className="kelola-summary">
          <div className="kelola-summary-card">
            <span>Total Pertemuan</span>
            <strong>{totalPertemuan}</strong>
          </div>

          <div className="kelola-summary-card">
            <span>Total Materi</span>
            <strong>{totalMateri}</strong>
          </div>

          <div className="kelola-summary-card">
            <span>Total Konten</span>
            <strong>{totalKonten}</strong>
          </div>

          <div className="kelola-summary-card">
            <span>Jenis Konten</span>
            <strong>4</strong>
          </div>
        </section>

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
              <div key={index} className="konten-block">
                <div className="konten-block-header">
                  <div>
                    <span className="content-type">{getTypeLabel(item.type)}</span>
                    <h4>Konten {index + 1}</h4>
                  </div>

                  <button
                    type="button"
                    className="delete-content"
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
                    placeholder="Judul konten opsional"
                  />
                </div>

                {item.type === "text" && (
                  <div className="form-group">
                    <label>Isi Materi</label>
                    <textarea
                      value={item.body}
                      onChange={(e) =>
                        handleKontenChange(index, "body", e.target.value)
                      }
                      placeholder="Tulis isi materi di sini..."
                    />
                  </div>
                )}

                {(item.type === "image" || item.type === "video") && (
                  <div className="form-group">
                    <label>
                      {item.type === "image" ? "Upload Gambar" : "Upload Video"}
                    </label>

                    <input
                      type="file"
                      accept={item.type === "image" ? "image/*" : "video/*"}
                      onChange={(e) => handleUpload(e, index)}
                    />

                    {item.url && item.type === "image" && (
                      <img
                        src={formatImageUrl(item.url)}
                        alt="preview"
                        className="preview-img"
                      />
                    )}

                    {item.url && item.type === "video" && (
                      <video
                        src={formatImageUrl(item.url)}
                        controls
                        className="preview-video"
                      />
                    )}
                  </div>
                )}

                {item.type === "genially" && (
                  <div className="form-group">
                    <label>Embed Genially</label>

                    <input
                      type="text"
                      placeholder="Tempel link Genially atau kode iframe"
                      value={item.url}
                      onChange={(e) => handleGeniallyChange(index, e.target.value)}
                    />

                    {item.url && (
                      <div className="genially-preview">
                        <iframe
                          src={item.url}
                          title={item.title || "Genially Preview"}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="button-row">
              <button
                type="button"
                className="add-content"
                onClick={() => tambahKonten("text")}
              >
                + Teks
              </button>

              <button
                type="button"
                className="add-content"
                onClick={() => tambahKonten("image")}
              >
                + Gambar
              </button>

              <button
                type="button"
                className="add-content"
                onClick={() => tambahKonten("video")}
              >
                + Video
              </button>

              <button
                type="button"
                className="add-content"
                onClick={() => tambahKonten("genially")}
              >
                + Genially
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Materi"}
            </button>
          </form>

          <div className="materi-list">
            <div className="list-header">
              <div>
                <h2>Daftar Materi</h2>
                <p>{materiList.length} materi tersedia</p>
              </div>
            </div>

            {Object.keys(groupedMateri).length === 0 && (
              <div className="empty-list">Belum ada materi tersimpan.</div>
            )}

            {Object.keys(groupedMateri)
              .sort((a, b) => Number(a) - Number(b))
              .map((pertemuanKey) => (
                <div key={pertemuanKey} className="pertemuan-group">
                  <h3>Pertemuan {pertemuanKey}</h3>

                  <div className="materi-grid">
                    {groupedMateri[pertemuanKey].map((m) => (
                      <div key={m.id} className="materi-card">
                        <div>
                          <span className="materi-number">
                            Pertemuan {m.pertemuan}
                          </span>
                          <h4>{m.judul}</h4>
                        </div>

                        <button
                          type="button"
                          className="delete-materi-btn"
                          onClick={() => handleDeleteMateri(m.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}