import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../style/KelolaQuiz.css";

export default function KelolaQuizGuru() {
  const [questions, setQuestions] = useState([]);

  const [inputSoal, setInputSoal] = useState("");
  const [answerFields, setAnswerFields] = useState("");
  const [pertemuan, setPertemuan] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [answerType, setAnswerType] = useState("text");

  const [judulLkpd, setJudulLkpd] = useState("");
  const [pendahuluanLkpd, setPendahuluanLkpd] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openPertemuan, setOpenPertemuan] = useState({});

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/quiz/questions`);
      const data = res.data.data || [];
      setQuestions(data);

      const daftarPertemuan = [
        ...new Set(data.map((q) => Number(q.pertemuan))),
      ].sort((a, b) => a - b);

      setOpenPertemuan((prev) => {
        const next = { ...prev };
        daftarPertemuan.forEach((item, index) => {
          if (next[item] === undefined) next[item] = index === 0;
        });
        return next;
      });
    } catch (err) {
      console.error("Gagal mengambil soal:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const groupedQuestions = useMemo(() => {
    const grouped = {};

    questions.forEach((q) => {
      const key = Number(q.pertemuan);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(q);
    });

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((key) => ({
        pertemuan: key,
        items: grouped[key],
        intro: grouped[key][0],
      }));
  }, [questions]);

  const totalPertemuan = groupedQuestions.length;
  const totalSoal = questions.length;
  const totalBergambar = questions.filter((q) => q.image_url).length;

  const togglePertemuan = (nomor) => {
    setOpenPertemuan((prev) => ({
      ...prev,
      [nomor]: !prev[nomor],
    }));
  };

  const getCurrentIntroByPertemuan = () => {
    const selectedPertemuan = Number(pertemuan);
    if (!selectedPertemuan) return null;

    return questions.find(
      (q) =>
        Number(q.pertemuan) === selectedPertemuan &&
        (q.judul_lkpd || q.pendahuluan_lkpd)
    );
  };

  const handlePertemuanChange = (value) => {
    setPertemuan(value);

    const selectedPertemuan = Number(value);
    const existingIntro = questions.find(
      (q) =>
        Number(q.pertemuan) === selectedPertemuan &&
        (q.judul_lkpd || q.pendahuluan_lkpd)
    );

    if (existingIntro) {
      setJudulLkpd(existingIntro.judul_lkpd || "");
      setPendahuluanLkpd(existingIntro.pendahuluan_lkpd || "");
    } else {
      setJudulLkpd("");
      setPendahuluanLkpd("");
    }
  };

  const handleUploadGambar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/quiz/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImageUrl(res.data.url);
    } catch (err) {
      console.error("Upload gagal:", err);
      alert(err.response?.data?.message || "Upload gambar gagal");
    } finally {
      setUploading(false);
    }
  };

  const parseAnswerFields = () => {
    return answerFields
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleTambah = async () => {
    if (!pertemuan) {
      alert("Pertemuan wajib diisi");
      return;
    }

    if (!inputSoal.trim()) {
      alert("Soal tidak boleh kosong");
      return;
    }

    if (uploading) {
      alert("Tunggu upload gambar selesai terlebih dahulu");
      return;
    }

    const existingIntro = getCurrentIntroByPertemuan();

    if (!existingIntro && !judulLkpd.trim()) {
      alert("Judul LKPD wajib diisi untuk soal pertama pada pertemuan ini");
      return;
    }

    if (!existingIntro && !pendahuluanLkpd.trim()) {
      alert("Pendahuluan LKPD wajib diisi untuk soal pertama pada pertemuan ini");
      return;
    }

    setLoading(true);

    try {
      const fieldsArray = parseAnswerFields();

      const payload = {
        question: inputSoal.trim(),
        pertemuan: Number(pertemuan),
        image_url: imageUrl || null,
        judul_lkpd: judulLkpd.trim() || null,
        pendahuluan_lkpd: pendahuluanLkpd.trim() || null,
        answer_type: answerType,
        answer_fields: fieldsArray.length > 0 ? JSON.stringify(fieldsArray) : null,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/quiz/questions`,
        payload
      );

      const newPertemuan = Number(pertemuan);

      setQuestions((prev) => [
        {
          id: res.data.id,
          ...payload,
          pertemuan: newPertemuan,
        },
        ...prev,
      ]);

      setOpenPertemuan((prev) => ({
        ...prev,
        [newPertemuan]: true,
      }));

      setInputSoal("");
      setAnswerFields("");
      setImageUrl("");
      setAnswerType("text");

      alert(res.data.message || "Soal berhasil ditambahkan");
      fetchQuestions();
    } catch (err) {
      console.error("Tambah soal gagal:", err);
      alert(err.response?.data?.message || "Gagal menambahkan soal");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setInputSoal("");
    setAnswerFields("");
    setPertemuan("");
    setImageUrl("");
    setAnswerType("text");
    setJudulLkpd("");
    setPendahuluanLkpd("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus soal ini?")) return;

    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/quiz/questions/${id}`
      );

      setQuestions((prev) => prev.filter((q) => q.id !== id));
      alert(res.data.message || "Soal berhasil dihapus");
    } catch (err) {
      console.error("Hapus soal gagal:", err);
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  };

  const getAnswerTypeText = (type) => {
    if (type === "image") return "Gambar";
    if (type === "text_image") return "Teks dan Gambar";
    return "Teks";
  };

  const getAnswerFieldsText = (value) => {
    if (!value) return "-";

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.join(", ");
      return value;
    } catch {
      return value;
    }
  };

  return (
    <div className="kelolaquiz-page">
      <div className="kelolaquiz-container">
        <section className="kelolaquiz-hero">
          <div>
            <span className="kelolaquiz-badge">Kelola Quiz</span>
            <h1 className="kelolaquiz-title">Kelola LKPD</h1>
            <p className="kelolaquiz-desc">
              Atur judul, pendahuluan LKPD, soal, kolom jawaban siswa, gambar
              soal, dan tipe jawaban siswa.
            </p>
          </div>

          <div className="kelolaquiz-summary">
            <div className="summary-card">
              <span>Total Pertemuan</span>
              <strong>{totalPertemuan}</strong>
            </div>
            <div className="summary-card">
              <span>Total Soal</span>
              <strong>{totalSoal}</strong>
            </div>
            <div className="summary-card">
              <span>Soal Bergambar</span>
              <strong>{totalBergambar}</strong>
            </div>
          </div>
        </section>

        <div className="kelolaquiz-layout">
          <aside className="kelolaquiz-sidebar">
            <div className="sidebar-scroll-area">
              <div className="sidebar-head">
                <h2>Tambah Soal</h2>
                <p className="sidebar-subtext">
                  Isi soal dan kolom jawaban secara terpisah agar tampilan siswa
                  lebih rapi.
                </p>
              </div>

              <div className="quiz-form-modern">
                <label>Pertemuan</label>
                <input
                  type="number"
                  placeholder="Masukkan nomor pertemuan"
                  value={pertemuan}
                  onChange={(e) => handlePertemuanChange(e.target.value)}
                />

                <label>Judul LKPD</label>
                <input
                  type="text"
                  placeholder="Masukkan judul LKPD"
                  value={judulLkpd}
                  onChange={(e) => setJudulLkpd(e.target.value)}
                />

                <label>Pendahuluan LKPD</label>
                <textarea
                  className="textarea-large"
                  placeholder="Tuliskan pendahuluan LKPD"
                  value={pendahuluanLkpd}
                  onChange={(e) => setPendahuluanLkpd(e.target.value)}
                />

                <hr />

                <label>Tulis Soal</label>
                <textarea
                  placeholder="Tulis instruksi/kasus soal saja. Jangan tulis kolom jawaban di sini."
                  value={inputSoal}
                  onChange={(e) => setInputSoal(e.target.value)}
                />

                <label>Kolom Jawaban Siswa</label>
                <textarea
                  placeholder={`Tulis satu kolom jawaban per baris.
Contoh:
Tujuan Desain
Pesan Utama
Target Audiens
Konteks Penggunaan`}
                  value={answerFields}
                  onChange={(e) => setAnswerFields(e.target.value)}
                />

                <label>Tipe Jawaban Siswa</label>
                <select
                  value={answerType}
                  onChange={(e) => setAnswerType(e.target.value)}
                >
                  <option value="text">Jawaban Teks</option>
                  <option value="image">Jawaban Gambar</option>
                  <option value="text_image">Teks dan Gambar</option>
                </select>

                <label>Upload Gambar Soal (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGambar}
                />

                {uploading && (
                  <p className="upload-text">Sedang upload gambar...</p>
                )}

                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview soal"
                    className="quiz-preview-img"
                  />
                )}

                <button
                  type="button"
                  className="btn-primary btn-full"
                  onClick={handleTambah}
                  disabled={loading || uploading}
                >
                  {loading ? "Menyimpan..." : "Tambah Soal"}
                </button>

                <button
                  type="button"
                  className="btn-primary btn-full"
                  onClick={handleResetForm}
                  disabled={loading || uploading}
                >
                  Reset Form
                </button>
              </div>
            </div>
          </aside>

          <main className="kelolaquiz-content">
            {groupedQuestions.length === 0 ? (
              <div className="empty-box">
                <div className="empty-illustration">📝</div>
                <h3>Belum ada soal</h3>
                <p>
                  Tambahkan konten untuk mulai mengelola LKPD per pertemuan.
                </p>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <div>
                    <h2>Daftar Konten per Pertemuan</h2>
                    <p className="detail-subtitle">
                      Klik setiap pertemuan untuk membuka pendahuluan dan soal.
                    </p>
                  </div>
                </div>

                <div className="question-accordion-list">
                  {groupedQuestions.map((group) => (
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
                          <p>
                            {group.intro?.judul_lkpd ||
                              `${group.items.length} soal tersedia`}
                          </p>
                        </div>

                        <div className="accordion-header-right">
                          <span className="meeting-badge">
                            {group.items.length} soal
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
                          <div className="student-info-grid">
                            <div className="info-card">
                              <span>Pertemuan</span>
                              <strong>{group.pertemuan}</strong>
                            </div>
                            <div className="info-card">
                              <span>Total Soal</span>
                              <strong>{group.items.length}</strong>
                            </div>
                            <div className="info-card">
                              <span>Dengan Gambar</span>
                              <strong>
                                {
                                  group.items.filter((item) => item.image_url)
                                    .length
                                }
                              </strong>
                            </div>
                            <div className="info-card highlight">
                              <span>Status</span>
                              <strong>Aktif</strong>
                            </div>
                          </div>

                          <div className="question-card">
                            <div className="question-card-head">
                              <h3>Pendahuluan</h3>
                              <span className="question-number">LKPD</span>
                            </div>

                            <div className="question-group">
                              <label>Judul</label>
                              <div className="readonly-box">
                                {group.intro?.judul_lkpd || "-"}
                              </div>
                            </div>

                            <div className="question-group">
                              <label>Pendahuluan LKPD</label>
                              <div className="readonly-box pre-line">
                                {group.intro?.pendahuluan_lkpd || "-"}
                              </div>
                            </div>
                          </div>

                          <div className="question-list">
                            {group.items.map((q, index) => (
                              <div key={q.id} className="question-card">
                                <div className="question-card-head">
                                  <h3>Soal {index + 1}</h3>
                                  <span className="question-number">
                                    #{index + 1}
                                  </span>
                                </div>

                                <div className="question-group">
                                  <label>Pertanyaan</label>
                                  <div className="readonly-box pre-line">
                                    {q.question}
                                  </div>
                                </div>

                                <div className="question-group">
                                  <label>Kolom Jawaban Siswa</label>
                                  <div className="readonly-box">
                                    {getAnswerFieldsText(q.answer_fields)}
                                  </div>
                                </div>

                                <div className="question-group">
                                  <label>Informasi Soal</label>
                                  <div className="meta-inline">
                                    <span>Pertemuan {q.pertemuan}</span>
                                    <span>
                                      {q.image_url
                                        ? "Ada gambar"
                                        : "Tanpa gambar"}
                                    </span>
                                    <span>
                                      Jawaban:{" "}
                                      {getAnswerTypeText(q.answer_type)}
                                    </span>
                                  </div>
                                </div>

                                {q.image_url && (
                                  <div className="question-group">
                                    <label>Gambar Soal</label>
                                    <img
                                      src={q.image_url}
                                      alt={`Soal ${index + 1}`}
                                      className="quiz-preview-img"
                                    />
                                  </div>
                                )}

                                <div className="question-action">
                                  <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={() => handleDelete(q.id)}
                                  >
                                    Hapus Soal
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