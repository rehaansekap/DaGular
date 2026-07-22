import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Proyek.css";

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

function Proyek() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [activePertemuan, setActivePertemuan] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [commentsMap, setCommentsMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [sendingComment, setSendingComment] = useState({});

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [openReviewId, setOpenReviewId] = useState(null);

  const token = localStorage.getItem("token");
  const currentUserName = localStorage.getItem("name");

  const projectsByPertemuan = useMemo(() => {
    return projects.reduce((acc, project) => {
      const key = Number(project.pertemuan);
      if (!acc[key]) acc[key] = [];
      acc[key].push(project);
      return acc;
    }, {});
  }, [projects]);

  const pertemuanList = useMemo(() => {
    return Object.keys(projectsByPertemuan)
      .map(Number)
      .sort((a, b) => a - b);
  }, [projectsByPertemuan]);

  const activeProjects = useMemo(() => {
    if (!activePertemuan) return [];
    return projectsByPertemuan[activePertemuan] || [];
  }, [projectsByPertemuan, activePertemuan]);

  const selectedProject = useMemo(() => {
    return (
      activeProjects.find(
        (project) => Number(project.id) === Number(selectedProjectId)
      ) || null
    );
  }, [activeProjects, selectedProjectId]);

  const handleInvalidToken = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");

    alert(
      "Sesi login kamu sudah habis atau token tidak valid. Silakan login ulang."
    );

    navigate("/login", { replace: true });
  }, [navigate]);

  const isTokenError = (message = "") => {
    const cleanMessage = String(message || "").toLowerCase();

    return (
      cleanMessage.includes("token") ||
      cleanMessage.includes("jwt") ||
      cleanMessage.includes("unauthorized") ||
      cleanMessage.includes("forbidden") ||
      cleanMessage.includes("tidak valid")
    );
  };

  const loadProjects = async () => {
    setLoadingProjects(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/proyek`);
      const result = await res.json();
      const data = result.data || [];

      const sortedData = [...data].sort((a, b) => {
        const pertemuanA = Number(a.pertemuan) || 0;
        const pertemuanB = Number(b.pertemuan) || 0;

        if (pertemuanA !== pertemuanB) {
          return pertemuanA - pertemuanB;
        }

        return Number(a.id) - Number(b.id);
      });

      setProjects(sortedData);

      if (sortedData.length > 0) {
        const firstProject = sortedData[0];
        setActivePertemuan(Number(firstProject.pertemuan));
        setSelectedProjectId(Number(firstProject.id));
      } else {
        setActivePertemuan(null);
        setSelectedProjectId(null);
      }
    } catch (err) {
      console.error("Gagal mengambil proyek:", err);
      setProjects([]);
      setActivePertemuan(null);
      setSelectedProjectId(null);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadComments = useCallback(async (karyaId) => {
    if (!karyaId) return;

    setLoadingComments((prev) => ({
      ...prev,
      [karyaId]: true,
    }));

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/karya/${karyaId}/comments`
      );

      const text = await res.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error("Response komentar bukan JSON:", text);
        throw new Error("Response komentar tidak valid");
      }

      setCommentsMap((prev) => ({
        ...prev,
        [karyaId]: result.data || [],
      }));
    } catch (err) {
      console.error("Gagal mengambil komentar:", err);

      setCommentsMap((prev) => ({
        ...prev,
        [karyaId]: [],
      }));
    } finally {
      setLoadingComments((prev) => ({
        ...prev,
        [karyaId]: false,
      }));
    }
  }, []);

  const loadGallery = useCallback(async () => {
    if (!selectedProjectId) {
      setGallery([]);
      return;
    }

    setLoadingGallery(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/karya/project/${selectedProjectId}`
      );

      const result = await res.json();
      const data = result.data || [];

      setGallery(data);

      data.forEach((item) => {
        loadComments(item.id);
      });
    } catch (err) {
      console.error("Gagal mengambil galeri:", err);
      setGallery([]);
    } finally {
      setLoadingGallery(false);
    }
  }, [selectedProjectId, loadComments]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    if (activeProjects.length > 0) {
      setSelectedProjectId(Number(activeProjects[0].id));
    } else {
      setSelectedProjectId(null);
    }

    setSelectedFile(null);
    setOpenReviewId(null);
  }, [activePertemuan, activeProjects]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran gambar maksimal 5 MB");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!token) {
      handleInvalidToken();
      return;
    }

    if (!selectedFile) {
      alert("Pilih gambar terlebih dahulu");
      return;
    }

    if (!selectedProjectId) {
      alert("Pilih proyek terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("project_id", Number(selectedProjectId));

    setUploading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/karya/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();

      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response upload bukan JSON:", text);
        alert("Upload gagal. Response server tidak valid.");
        return;
      }

      if (res.status === 401 || res.status === 403) {
        handleInvalidToken();
        return;
      }

      if (!res.ok || result.success === false) {
        if (isTokenError(result.message)) {
          handleInvalidToken();
          return;
        }

        alert(result.message || "Upload gagal");
        return;
      }

      alert("Karya berhasil diunggah");

      setSelectedFile(null);
      setShowUploadForm(false);
      await loadGallery();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const handleChangeComment = (karyaId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [karyaId]: value,
    }));
  };

  const handleSubmitComment = async (karyaId) => {
    if (!token) {
      handleInvalidToken();
      return;
    }

    const komentar = commentInputs[karyaId]?.trim();

    if (!komentar) {
      alert("Komentar tidak boleh kosong");
      return;
    }

    setSendingComment((prev) => ({
      ...prev,
      [karyaId]: true,
    }));

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/karya/${karyaId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ komentar }),
        }
      );

      const text = await res.text();

      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response komentar bukan JSON:", text);
        alert("Komentar gagal dikirim. Response server tidak valid.");
        return;
      }

      if (res.status === 401 || res.status === 403) {
        handleInvalidToken();
        return;
      }

      if (!res.ok || result.success === false) {
        if (isTokenError(result.message)) {
          handleInvalidToken();
          return;
        }

        throw new Error(result.message || "Gagal mengirim komentar");
      }

      setCommentInputs((prev) => ({
        ...prev,
        [karyaId]: "",
      }));

      setOpenReviewId(karyaId);

      if (result.data) {
        setCommentsMap((prev) => ({
          ...prev,
          [karyaId]: [...(prev[karyaId] || []), result.data],
        }));
      } else {
        await loadComments(karyaId);
      }
    } catch (err) {
      console.error("Komentar gagal dikirim:", err);
      alert(err.message || "Gagal mengirim komentar");
    } finally {
      setSendingComment((prev) => ({
        ...prev,
        [karyaId]: false,
      }));
    }
  };

  const handleToggleReview = (karyaId) => {
    setOpenReviewId((prev) =>
      Number(prev) === Number(karyaId) ? null : karyaId
    );

    if (!commentsMap[karyaId]) {
      loadComments(karyaId);
    }
  };

  const isOwner = (item) => {
    const uploaderName = String(item.uploader || "").trim().toLowerCase();
    const userName = String(currentUserName || "").trim().toLowerCase();

    return uploaderName && userName && uploaderName === userName;
  };

  const getCommentCount = (item) => {
    return (commentsMap[item.id] || []).length;
  };

  return (
    <div className="proyek-container">
      <section className="proyek-hero">
        <div className="proyek-hero-text">
          <h1 className="proyek-title">Galeri Proyek Siswa</h1>

          <p className="proyek-subtitle">
            Unggah hasil karya sesuai proyek, lalu berikan peer review untuk
            karya siswa lainnya.
          </p>
        </div>

        <button
          type="button"
          className="btn-open-upload"
          onClick={() => setShowUploadForm((prev) => !prev)}
          disabled={loadingProjects || pertemuanList.length === 0}
        >
          {showUploadForm ? "Tutup Form" : "+ Unggah Karyamu"}
        </button>
      </section>

      <div className="project-tabs">
        {loadingProjects ? (
          <button type="button" disabled>
            Memuat proyek...
          </button>
        ) : pertemuanList.length === 0 ? (
          <button type="button" disabled>
            Belum ada proyek
          </button>
        ) : (
          pertemuanList.map((pertemuan) => (
            <button
              key={pertemuan}
              type="button"
              className={
                Number(activePertemuan) === Number(pertemuan)
                  ? "active-tab"
                  : ""
              }
              onClick={() => {
                setActivePertemuan(Number(pertemuan));
                setShowUploadForm(false);
              }}
            >
              Pertemuan {pertemuan}
            </button>
          ))
        )}
      </div>

      {activeProjects.length > 0 && (
        <section className="project-info-card">
          <div className="project-info-head clean-project-head">
            <div>
              <h2>
                {activeProjects.length > 1
                  ? `${activeProjects.length} Proyek Tersedia`
                  : activeProjects[0].judul}
              </h2>
            </div>

            <div className="project-mini-stat">
              {loadingGallery
                ? "Memuat karya..."
                : `${gallery.length} karya terkumpul`}
            </div>
          </div>

          <div className="project-theme-list">
            {activeProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={
                  Number(selectedProjectId) === Number(project.id)
                    ? "project-theme-box active"
                    : "project-theme-box"
                }
                onClick={() => {
                  setSelectedProjectId(Number(project.id));
                  setSelectedFile(null);
                  setOpenReviewId(null);
                  setShowUploadForm(false);
                }}
              >
                <label>Proyek</label>
                <p>{project.judul}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {showUploadForm && (
        <section className="upload-section upload-section-open">
          <div className="upload-head">
            <div>
              <h3>Unggah Karya</h3>

              <p className="upload-note">
                {selectedProject
                  ? `Proyek dipilih: ${selectedProject.judul}`
                  : "Pilih proyek terlebih dahulu."}
              </p>
            </div>
          </div>

          {activeProjects.length > 1 && (
            <div className="upload-project-select">
              <label>Pilih Proyek</label>

              <select
                value={selectedProjectId || ""}
                onChange={(e) => {
                  setSelectedProjectId(Number(e.target.value));
                  setSelectedFile(null);
                  setOpenReviewId(null);
                }}
              >
                {activeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.judul}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <label className="file-label">
              {selectedFile ? "Ganti Gambar" : "Pilih Gambar"}

              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {selectedFile && (
              <div className="preview">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview karya"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-upload"
              disabled={uploading || !selectedProjectId || !selectedFile}
            >
              {uploading ? "Mengunggah..." : "Kirim Karya"}
            </button>
          </form>
        </section>
      )}

      <div className="gallery-header">
        <div className="gallery-title-group">
          <h3>Galeri Karya Siswa</h3>

          <p>
            {loadingGallery
              ? "Sedang memuat karya siswa..."
              : selectedProject
              ? (
                <>
                  Menampilkan <b>{gallery.length} karya</b> untuk proyek{" "}
                  <b>{selectedProject.judul}</b>. Berikan komentar peer review
                  yang membangun.
                </>
              )
              : "Pilih proyek terlebih dahulu untuk melihat karya siswa."}
          </p>
        </div>
      </div>

      <div className="gallery-grid">
        {loadingGallery ? (
          <p className="empty-text">Sedang memuat galeri...</p>
        ) : gallery.length === 0 ? (
          <p className="empty-text">Belum ada karya di proyek ini</p>
        ) : (
          gallery.map((item) => {
            const comments = commentsMap[item.id] || [];
            const reviewIsOpen = Number(openReviewId) === Number(item.id);

            return (
              <article className="gallery-card" key={item.id}>
                <div className="gallery-image-wrap">
                  <img
                    src={formatImageUrl(item.image_path)}
                    alt={`Karya oleh ${item.uploader}`}
                    onClick={() => setPreviewImg(formatImageUrl(item.image_path))}
                  />
                </div>

                <div className="gallery-card-body">
                  <span className="work-title">
                    {selectedProject?.judul || "Karya Siswa"}
                  </span>

                  <span className="uploader-label">Diunggah oleh</span>

                  <p className="uploader">
                    <b>{item.uploader || "Siswa"}</b>
                  </p>

                  <div className="peer-review-compact">
                    <button
                      type="button"
                      className={
                        reviewIsOpen
                          ? "comment-toggle-btn active"
                          : "comment-toggle-btn"
                      }
                      onClick={() => handleToggleReview(item.id)}
                    >
                      💬 {getCommentCount(item)} Peer Review
                    </button>

                    {reviewIsOpen && (
                      <div className="peer-review-box is-open">
                        <div className="comment-list">
                          {loadingComments[item.id] ? (
                            <p className="comment-empty">Memuat komentar...</p>
                          ) : comments.length === 0 ? (
                            <p className="comment-empty">
                              Belum ada komentar. Jadilah yang pertama memberi
                              masukan.
                            </p>
                          ) : (
                            comments.map((comment) => (
                              <div className="comment-item" key={comment.id}>
                                <div className="comment-top">
                                  <strong>
                                    {comment.nama_pengguna || "Siswa"}
                                  </strong>

                                  <span>
                                    {comment.created_at
                                      ? new Date(
                                          comment.created_at
                                        ).toLocaleString("id-ID")
                                      : "Baru saja"}
                                  </span>
                                </div>

                                <p>{comment.komentar}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {!isOwner(item) ? (
                          <div className="comment-form">
                            <textarea
                              placeholder="Tulis komentar, saran, atau apresiasi untuk karya ini..."
                              value={commentInputs[item.id] || ""}
                              onChange={(e) =>
                                handleChangeComment(item.id, e.target.value)
                              }
                            />

                            <button
                              type="button"
                              className="btn-comment"
                              onClick={() => handleSubmitComment(item.id)}
                              disabled={sendingComment[item.id]}
                            >
                              {sendingComment[item.id]
                                ? "Mengirim..."
                                : "Kirim Komentar"}
                            </button>
                          </div>
                        ) : (
                          <p className="comment-owner-note">
                            Ini karya milik Anda. Komentar peer review diisi
                            oleh siswa lain.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {previewImg && (
        <div className="image-modal" onClick={() => setPreviewImg(null)}>
          <img src={formatImageUrl(previewImg)} alt="Preview karya besar" />
        </div>
      )}
    </div>
  );
}

export default Proyek;