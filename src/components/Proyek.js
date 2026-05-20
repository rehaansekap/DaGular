import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../style/Proyek.css";

function Proyek() {
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

  const loadProjects = async () => {
    setLoadingProjects(true);

    try {
      const res = await fetch("http://localhost:5000/api/proyek");
      const result = await res.json();
      const data = result.data || [];

      setProjects(data);

      if (data.length > 0) {
        const firstPertemuan = Number(data[0].pertemuan);
        setActivePertemuan(firstPertemuan);
        setSelectedProjectId(Number(data[0].id));
      }
    } catch (err) {
      console.error("Gagal mengambil proyek:", err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadComments = useCallback(async (karyaId) => {
    setLoadingComments((prev) => ({ ...prev, [karyaId]: true }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/karya/${karyaId}/comments`
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
      setLoadingComments((prev) => ({ ...prev, [karyaId]: false }));
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
        `http://localhost:5000/api/karya/project/${selectedProjectId}`
      );

      const result = await res.json();
      const data = result.data || [];

      setGallery(data);

      for (const item of data) {
        loadComments(item.id);
      }
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
  }, [activePertemuan, activeProjects]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

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
      const res = await fetch("http://localhost:5000/api/karya/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Upload gagal");
        return;
      }

      alert("Karya berhasil diunggah");
      setSelectedFile(null);
      loadGallery();
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
    const komentar = commentInputs[karyaId]?.trim();

    if (!komentar) {
      alert("Komentar tidak boleh kosong");
      return;
    }

    setSendingComment((prev) => ({ ...prev, [karyaId]: true }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/karya/${karyaId}/comments`,
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
      let result;

      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Response bukan JSON:", text);
        throw new Error(
          "Response server bukan JSON. Cek backend komentar dan restart server."
        );
      }

      if (!res.ok || result.success === false) {
        throw new Error(result.message || "Gagal mengirim komentar");
      }

      setCommentInputs((prev) => ({
        ...prev,
        [karyaId]: "",
      }));

      if (result.data) {
        setCommentsMap((prev) => ({
          ...prev,
          [karyaId]: [...(prev[karyaId] || []), result.data],
        }));
      } else {
        loadComments(karyaId);
      }
    } catch (err) {
      console.error("Komentar gagal dikirim:", err);
      alert(err.message || "Gagal mengirim komentar");
    } finally {
      setSendingComment((prev) => ({ ...prev, [karyaId]: false }));
    }
  };

  return (
    <div className="proyek-container">
      <div className="proyek-hero">
        <h1 className="proyek-title">Proyek Desain Grafis</h1>
        <p className="proyek-subtitle">
          Unggah hasil karya sesuai proyek, lalu berikan peer review untuk karya
          siswa lainnya.
        </p>
      </div>

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
              onClick={() => setActivePertemuan(Number(pertemuan))}
            >
              Pertemuan {pertemuan}
            </button>
          ))
        )}
      </div>

      {activeProjects.length > 0 && (
        <section className="project-info-card">
          <div className="project-info-head">
            <div>
              <span className="project-badge">
                Pertemuan {activePertemuan}
              </span>

              <h2>
                {activeProjects.length > 1
                  ? `${activeProjects.length} Proyek Tersedia`
                  : activeProjects[0].judul}
              </h2>
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
                }}
              >
                <label>Proyek</label>
                <p>{project.judul}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="upload-section">
        <h3>Unggah Karya</h3>

        <p className="upload-note">
          {selectedProject
            ? `Proyek dipilih: ${selectedProject.judul}`
            : "Pilih proyek terlebih dahulu."}
        </p>

        {activeProjects.length > 1 && (
          <div className="upload-project-select">
            <label>Pilih Proyek</label>

            <select
              value={selectedProjectId || ""}
              onChange={(e) => {
                setSelectedProjectId(Number(e.target.value));
                setSelectedFile(null);
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

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
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
            disabled={uploading || !selectedProjectId}
          >
            {uploading ? "Mengunggah..." : "Kirim Karya"}
          </button>
        </form>
      </div>

      <div className="gallery-header">
        <div className="gallery-title-group">
          <h3>Galeri Karya Siswa</h3>
          <p>
            Kumpulan hasil karya berdasarkan proyek yang sedang dipilih,
            lengkap dengan kolom komentar peer review.
          </p>
        </div>

        <div className="gallery-badge">
          {loadingGallery ? "Memuat..." : `${gallery.length} karya`}
        </div>
      </div>

      <div className="gallery-grid">
        {loadingGallery ? (
          <p className="empty-text">Sedang memuat galeri...</p>
        ) : gallery.length === 0 ? (
          <p className="empty-text">Belum ada karya di proyek ini</p>
        ) : (
          gallery.map((item) => (
            <div className="gallery-card" key={item.id}>
              <img
                src={item.image_path}
                alt={`Karya oleh ${item.uploader}`}
                onClick={() => setPreviewImg(item.image_path)}
              />

              <div className="gallery-card-body">
                <span className="uploader-label">Diunggah oleh</span>

                <p className="uploader">
                  <b>{item.uploader}</b>
                </p>

                <div className="peer-review-box">
                  <div className="peer-review-head">
                    <h4>Komentar Peer Review</h4>

                    <span className="comment-count">
                      {(commentsMap[item.id] || []).length} komentar
                    </span>
                  </div>

                  <div className="comment-list">
                    {loadingComments[item.id] ? (
                      <p className="comment-empty">Memuat komentar...</p>
                    ) : (commentsMap[item.id] || []).length === 0 ? (
                      <p className="comment-empty">
                        Belum ada komentar. Jadilah yang pertama memberi
                        masukan.
                      </p>
                    ) : (
                      commentsMap[item.id].map((comment) => (
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

                  {item.uploader !== currentUserName ? (
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
                      Ini karya milik Anda. Komentar peer review diisi oleh
                      siswa lain.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {previewImg && (
        <div className="image-modal" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="Preview karya besar" />
        </div>
      )}
    </div>
  );
}

export default Proyek;