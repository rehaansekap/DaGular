import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../style/MateriDetail.css";

const pertemuanLabels = {
  1: "Pengantar Desain Digital",
  2: "Proses Kreatif Desain",
  3: "Layout dan Komunikasi Visual",
  4: "Justifikasi dan Evaluasi Karya",
};

const keyPoints = {
  1: "Komputer grafis bukan hanya tentang software, tetapi tentang bagaimana pesan visual disampaikan secara jelas, menarik, dan sesuai tujuan komunikasi.",
  2: "Proses kreatif membantu siswa mengubah ide awal menjadi konsep visual yang lebih terarah melalui eksplorasi, pemilihan, dan pengembangan gagasan.",
  3: "Layout, warna, tipografi, dan komposisi harus dipilih untuk memperkuat pesan visual, bukan sekadar memperindah tampilan.",
  4: "Karya desain yang baik perlu disertai alasan pemilihan konsep, elemen visual, dan strategi komunikasi yang digunakan.",
};

function safeParseKonten(konten) {
  if (!konten) return [];

  if (Array.isArray(konten)) {
    return konten;
  }

  try {
    const parsed = JSON.parse(konten);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function MateriDetail() {
  const { id } = useParams();

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`http://localhost:5000/api/materi/${id}`);

        if (!res.ok) {
          throw new Error("Materi tidak ditemukan");
        }

        const data = await res.json();
        setMateri(data);
      } catch (err) {
        setError(err.message || "Gagal memuat materi");
      } finally {
        setLoading(false);
      }
    };

    fetchMateri();
  }, [id]);

  const kontenMateri = useMemo(() => {
    return safeParseKonten(materi?.konten);
  }, [materi]);

  const pertemuan = Number(materi?.pertemuan) || 0;

  const poinKunci =
    keyPoints[pertemuan] ||
    "Pelajari materi secara runtut agar kamu lebih siap mengerjakan proyek desain pada tahap berikutnya.";

  const renderImageGroup = (imageGroup, key) => {
    return (
      <div className="materi-detail-section image-section" key={key}>
        <div className="detail-image-grid">
          {imageGroup.map((img, index) => (
            <div
              className={
                imageGroup.length === 1
                  ? "detail-image-card detail-image-card-large"
                  : "detail-image-card"
              }
              key={`${img.url}-${index}`}
            >
              <button
                type="button"
                className="detail-image-button"
                onClick={() => setSelectedImage(img.url)}
              >
                <img src={img.url} alt={img.title || "Gambar materi"} />

                <span className="detail-zoom-badge">
                  Klik untuk memperbesar
                </span>
              </button>

              {img.title && (
                <span className="detail-image-caption">{img.title}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKonten = () => {
    const result = [];
    let imageGroup = [];

    kontenMateri.forEach((item, index) => {
      if (item.type === "image") {
        imageGroup.push(item);
        return;
      }

      if (imageGroup.length > 0) {
        result.push(renderImageGroup(imageGroup, `img-${index}`));
        imageGroup = [];
      }

      if (item.type === "text") {
        const paragraphs = item.body
          ? item.body.split("\n").filter((text) => text.trim())
          : [];

        result.push(
          <section className="materi-detail-section" key={`text-${index}`}>
            {item.title && <h3>{item.title}</h3>}

            {paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
          </section>
        );
      }

      if (item.type === "video") {
        result.push(
          <section className="materi-detail-section" key={`video-${index}`}>
            {item.title && <h3>{item.title}</h3>}

            <video src={item.url} controls className="detail-video" />
          </section>
        );
      }

      if (item.type === "genially") {
        result.push(
          <section className="materi-detail-section" key={`genially-${index}`}>
            {item.title && <h3>{item.title}</h3>}

            <div className="detail-genially-wrapper">
              <iframe
                src={item.url}
                title={item.title || "Genially Embed"}
                className="detail-genially-iframe"
                allowFullScreen
                scrolling="yes"
              />
            </div>
          </section>
        );
      }
    });

    if (imageGroup.length > 0) {
      result.push(renderImageGroup(imageGroup, "img-last"));
    }

    if (result.length === 0) {
      return (
        <div className="materi-detail-section">
          <p>Konten materi belum tersedia.</p>
        </div>
      );
    }

    return result;
  };

  if (loading) {
    return (
      <div className="materi-detail-page">
        <div className="materi-detail-container">
          <p className="materi-detail-loading">Memuat materi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="materi-detail-page">
        <div className="materi-detail-container">
          <div className="materi-error-card">
            <h2>Materi tidak dapat dimuat</h2>
            <p>{error}</p>

            <Link to="/materi" className="detail-back-btn">
              ← Kembali ke Daftar Materi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="materi-detail-page">
      <div className="materi-detail-container">
        <div className="materi-breadcrumb">
          <Link to="/materi">Materi</Link>
          <span>›</span>
          <span>Pertemuan {materi.pertemuan}</span>
          <span>›</span>
          <b>{materi.judul}</b>
        </div>

        <div className="materi-detail-header">
          <span className="materi-detail-badge">
            Pertemuan {materi.pertemuan}
          </span>

          <h1>{materi.judul}</h1>

          <p>
            {pertemuanLabels[pertemuan] ||
              "Pelajari materi ini secara runtut sebelum melanjutkan ke tahap proyek."}
          </p>
        </div>

        <main className="materi-detail-content">
          <div className="materi-callout">
            <div className="materi-callout-icon">💡</div>

            <div>
              <strong>Poin Kunci</strong>
              <p>{poinKunci}</p>
            </div>
          </div>

          {renderKonten()}
        </main>

        <div className="materi-detail-footer">
          <Link to="/materi" className="detail-back-btn">
            ← Kembali ke Daftar Materi
          </Link>

          <Link to="/proyek/desain" className="detail-next-btn">
            Lanjut ke Desain Proyek →
          </Link>
        </div>
      </div>

      {selectedImage && (
        <div
          className="detail-image-modal"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="detail-modal-close"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Preview materi"
            className="detail-modal-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}