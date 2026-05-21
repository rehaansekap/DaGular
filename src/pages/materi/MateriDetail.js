import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../style/MateriDetail.css";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://178.128.209.29:5000"
).replace(/\/$/, "");

export default function MateriDetail() {
  const { id } = useParams();

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const res = await fetch(`${API_URL}/api/materi/${id}`);

        if (!res.ok) throw new Error("Materi tidak ditemukan");

        const data = await res.json();

        setMateri(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMateri();
  }, [id]);

  if (loading) return <p className="materi-detail-loading">Memuat materi...</p>;
  if (error) return <p className="materi-detail-loading">{error}</p>;

  const renderImageGroup = (imageGroup, key) => {
    return (
      <div className="materi-detail-section" key={key}>
        <div className="detail-image-grid">
          {imageGroup.map((img, i) => {
            const imageUrl = getFileUrl(img.url);

            return (
              <div className="detail-image-card" key={i}>
                <img
                  src={imageUrl}
                  alt={img.title || `Gambar materi ${i + 1}`}
                  onClick={() => setSelectedImage(imageUrl)}
                />

                {img.title && (
                  <span className="detail-image-caption">{img.title}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderKonten = () => {
    const result = [];
    let imageGroup = [];

    materi.konten.forEach((item, index) => {
      if (item.type === "image") {
        imageGroup.push(item);
        return;
      }

      if (imageGroup.length > 0) {
        result.push(renderImageGroup(imageGroup, "img-" + index));
        imageGroup = [];
      }

      if (item.type === "text") {
        const paragraphs = item.body ? item.body.split("\n") : [];

        result.push(
          <div className="materi-detail-section" key={index}>
            {item.title && <h3>{item.title}</h3>}

            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        );
      }

      if (item.type === "video") {
        result.push(
          <div className="materi-detail-section" key={index}>
            {item.title && <h3>{item.title}</h3>}

            <video
              src={getFileUrl(item.url)}
              controls
              className="detail-video"
            />
          </div>
        );
      }

      if (item.type === "genially") {
        result.push(
          <div className="materi-detail-section" key={index}>
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
          </div>
        );
      }
    });

    if (imageGroup.length > 0) {
      result.push(renderImageGroup(imageGroup, "img-last"));
    }

    return result;
  };

  return (
    <div className="materi-detail-page">
      <div className="materi-detail-container">
        <div className="materi-detail-header">
          <span>Pertemuan {materi.pertemuan}</span>
          <h1>{materi.judul}</h1>
        </div>

        <div className="materi-detail-content">{renderKonten()}</div>

        <div className="materi-detail-footer">
          <Link to="/materi" className="detail-back-btn">
            ← Kembali
          </Link>

          <Link to="/quiz" className="detail-next-btn">
            Lanjut ke LKPD →
          </Link>
        </div>
      </div>

      {selectedImage && (
        <div
          className="detail-image-modal"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="preview"
            className="detail-modal-image"
          />
        </div>
      )}
    </div>
  );
}