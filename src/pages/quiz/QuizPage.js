import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../style/QuizPage.css";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://178.128.209.29:5000"
).replace(/\/$/, "");

function QuizPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const user_id = localStorage.getItem("user_id");
  const name = localStorage.getItem("name") || "Siswa";

  const getImageSrc = (url) => {
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
    fetch(`${API_URL}/api/quiz/questions?pertemuan=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const sortedQuestions = (data.data || []).sort((a, b) => a.id - b.id);
        setQuestions(sortedQuestions);
        setAnswers({});
      })
      .catch((err) => console.error(err));
  }, [id]);

  const lkpdInfo = questions[0] || {};

  const getAnswerFields = (answerFields) => {
    if (!answerFields) return ["Jawaban"];

    try {
      const parsed = JSON.parse(answerFields);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }

      return ["Jawaban"];
    } catch {
      return answerFields
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  };

  const getAnswerType = (answerType) => {
    const validTypes = ["text", "image", "text_image"];

    if (validTypes.includes(answerType)) {
      return answerType;
    }

    return "text";
  };

  const handleChange = (questionId, field, value, answerType = "text") => {
    setAnswers((prev) => {
      const currentQuestionAnswer = prev[questionId] || {};
      const currentFieldAnswer = currentQuestionAnswer[field];

      if (answerType === "text_image") {
        return {
          ...prev,
          [questionId]: {
            ...currentQuestionAnswer,
            [field]: {
              ...(typeof currentFieldAnswer === "object"
                ? currentFieldAnswer
                : {}),
              text: value,
            },
          },
        };
      }

      return {
        ...prev,
        [questionId]: {
          ...currentQuestionAnswer,
          [field]: value,
        },
      };
    });
  };

  const handleImageUpload = async (questionId, field, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran gambar maksimal 5 MB");
      return;
    }

    const uploadKey = `${questionId}-${field}`;

    const formData = new FormData();
    formData.append("file", file);

    setUploading((prev) => ({
      ...prev,
      [uploadKey]: true,
    }));

    try {
      const res = await fetch(`${API_URL}/api/quiz/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload gambar gagal");
        return;
      }

      setAnswers((prev) => {
        const currentQuestionAnswer = prev[questionId] || {};
        const currentFieldAnswer = currentQuestionAnswer[field];

        return {
          ...prev,
          [questionId]: {
            ...currentQuestionAnswer,
            [field]: {
              ...(typeof currentFieldAnswer === "object"
                ? currentFieldAnswer
                : {}),
              image_url: data.url,
              image_name: file.name,
            },
          },
        };
      });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setUploading((prev) => ({
        ...prev,
        [uploadKey]: false,
      }));
    }
  };

  const handleRemoveImage = (questionId, field) => {
    setAnswers((prev) => {
      const currentQuestionAnswer = prev[questionId] || {};
      const currentFieldAnswer = currentQuestionAnswer[field];

      return {
        ...prev,
        [questionId]: {
          ...currentQuestionAnswer,
          [field]: {
            ...(typeof currentFieldAnswer === "object"
              ? currentFieldAnswer
              : {}),
            image_url: "",
            image_name: "",
          },
        },
      };
    });
  };

  const isAnswered = (item) => {
    const answerType = getAnswerType(item.answer_type);
    const fields = getAnswerFields(item.answer_fields);
    const answer = answers[item.id];

    if (!answer || typeof answer !== "object") return false;

    const isTextFilled = (field) => {
      const value = answer[field];

      if (answerType === "text_image") {
        return (
          value &&
          typeof value === "object" &&
          typeof value.text === "string" &&
          value.text.trim() !== ""
        );
      }

      return typeof value === "string" && value.trim() !== "";
    };

    const isImageFilled = (field) => {
      const value = answer[field];

      return (
        value &&
        typeof value === "object" &&
        typeof value.image_url === "string" &&
        value.image_url.trim() !== ""
      );
    };

    if (answerType === "text") {
      return fields.every((field) => isTextFilled(field));
    }

    if (answerType === "image") {
      return fields.every((field) => isImageFilled(field));
    }

    if (answerType === "text_image") {
      return fields.every(
        (field) => isTextFilled(field) && isImageFilled(field)
      );
    }

    return false;
  };

  const answeredCount = questions.filter((item) => isAnswered(item)).length;

  const progressPercent =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  const isAnyUploading = Object.values(uploading).some(Boolean);

  const handleSubmit = async () => {
    if (!user_id) return alert("User belum login");

    if (isAnyUploading) {
      alert("Tunggu sampai proses upload gambar selesai");
      return;
    }

    const formattedAnswers = questions.map((item) => ({
      question_id: item.id,
      answer_text: JSON.stringify(answers[item.id] || {}),
    }));

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(user_id),
          pertemuan: Number(id),
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengirim jawaban");
        return;
      }

      navigate("/quiz/result", {
        state: {
          pertemuan: id,
          result_id: data.result_id,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-page">
      <div className="quiz-wrapper">
        <div className="quiz-greeting-card">
          <div>
            <span className="quiz-greeting-label">Halo, {name}</span>
            <h2>Siap mengerjakan LKPD hari ini?</h2>
            <p>
              Kerjakan LKPD pertemuan {id} dengan teliti. Progress jawabanmu
              akan terisi otomatis.
            </p>
          </div>

          <div className="quiz-progress-box">
            <div className="quiz-progress-text">
              <span>Progress</span>
              <strong>
                {answeredCount}/{questions.length}
              </strong>
            </div>

            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <small>{progressPercent}% selesai</small>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="quiz-card quiz-intro-card">
            <h4 className="quiz-intro-heading">Pendahuluan</h4>

            <p className="quiz-question-text quiz-intro-text">
              {lkpdInfo.pendahuluan_lkpd || "-"}
            </p>
          </div>
        )}

        <div className="quiz-header compact">
          <div className="quiz-badge">Daftar Soal</div>
        </div>

        <div className="quiz-list">
          {questions.map((item, index) => {
            const fields = getAnswerFields(item.answer_fields);
            const answerType = getAnswerType(item.answer_type);

            return (
              <div key={item.id} className="quiz-card">
                <p className="quiz-question-count">
                  Soal {index + 1} dari {questions.length}
                </p>

                <div className="quiz-card-top">
                  <div className="quiz-number">{index + 1}</div>

                  <div className="quiz-soal-area">
                    <div className="quiz-question-text">{item.question}</div>
                  </div>
                </div>

                {item.image_url && (
                  <div className="quiz-image-wrapper">
                    <img
                      src={getImageSrc(item.image_url)}
                      alt={`Gambar soal ${index + 1}`}
                      className="quiz-image clickable"
                      onClick={() => setPreviewImage(getImageSrc(item.image_url))}
                    />
                  </div>
                )}

                <div className="quiz-answer-area">
                  <label className="quiz-answer-label">Jawaban</label>

                  {answerType === "text" &&
                    fields.map((field) => (
                      <div key={field} className="quiz-answer-field">
                        <label className="quiz-answer-sub-label">
                          {field}
                        </label>

                        <textarea
                          className="quiz-textarea quiz-textarea-small"
                          value={answers[item.id]?.[field] || ""}
                          onChange={(e) =>
                            handleChange(
                              item.id,
                              field,
                              e.target.value,
                              answerType
                            )
                          }
                          placeholder="Tulis jawaban di sini..."
                        />
                      </div>
                    ))}

                  {answerType === "image" &&
                    fields.map((field) => {
                      const uploadKey = `${item.id}-${field}`;
                      const uploadedImage = answers[item.id]?.[field];

                      return (
                        <div key={field} className="quiz-answer-field">
                          <label className="quiz-answer-sub-label">
                            {field}
                          </label>

                          <input
                            type="file"
                            accept="image/*"
                            className="quiz-file-input"
                            onChange={(e) =>
                              handleImageUpload(
                                item.id,
                                field,
                                e.target.files[0]
                              )
                            }
                          />

                          {uploading[uploadKey] && (
                            <p className="quiz-upload-status">
                              Sedang mengupload gambar...
                            </p>
                          )}

                          {uploadedImage?.image_url && (
                            <div className="quiz-upload-preview">
                              <p>
                                Gambar berhasil diupload
                                {uploadedImage?.image_name
                                  ? `: ${uploadedImage.image_name}`
                                  : ""}
                              </p>

                              <img
                                src={getImageSrc(uploadedImage.image_url)}
                                alt={`Preview ${field}`}
                                className="quiz-image clickable"
                                onClick={() =>
                                  setPreviewImage(
                                    getImageSrc(uploadedImage.image_url)
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="quiz-remove-image-btn"
                                onClick={() =>
                                  handleRemoveImage(item.id, field)
                                }
                              >
                                Hapus Gambar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {answerType === "text_image" &&
                    fields.map((field) => {
                      const uploadKey = `${item.id}-${field}`;
                      const fieldAnswer = answers[item.id]?.[field] || {};
                      const textValue =
                        typeof fieldAnswer === "object"
                          ? fieldAnswer.text || ""
                          : "";
                      const uploadedImage =
                        typeof fieldAnswer === "object" ? fieldAnswer : null;

                      return (
                        <div key={field} className="quiz-answer-field">
                          <label className="quiz-answer-sub-label">
                            {field}
                          </label>

                          <textarea
                            className="quiz-textarea quiz-textarea-small"
                            value={textValue}
                            onChange={(e) =>
                              handleChange(
                                item.id,
                                field,
                                e.target.value,
                                answerType
                              )
                            }
                            placeholder="Tulis jawaban di sini..."
                          />

                          <label className="quiz-answer-sub-label">
                            Upload Gambar Jawaban
                          </label>

                          <input
                            type="file"
                            accept="image/*"
                            className="quiz-file-input"
                            onChange={(e) =>
                              handleImageUpload(
                                item.id,
                                field,
                                e.target.files[0]
                              )
                            }
                          />

                          {uploading[uploadKey] && (
                            <p className="quiz-upload-status">
                              Sedang mengupload gambar...
                            </p>
                          )}

                          {uploadedImage?.image_url && (
                            <div className="quiz-upload-preview">
                              <p>
                                Gambar berhasil diupload
                                {uploadedImage?.image_name
                                  ? `: ${uploadedImage.image_name}`
                                  : ""}
                              </p>

                              <img
                                src={getImageSrc(uploadedImage.image_url)}
                                alt={`Preview ${field}`}
                                className="quiz-image clickable"
                                onClick={() =>
                                  setPreviewImage(
                                    getImageSrc(uploadedImage.image_url)
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="quiz-remove-image-btn"
                                onClick={() =>
                                  handleRemoveImage(item.id, field)
                                }
                              >
                                Hapus Gambar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {questions.length > 0 && (
          <div className="quiz-submit-area">
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || isAnyUploading}
            >
              {loading
                ? "Mengirim..."
                : isAnyUploading
                ? "Menunggu Upload..."
                : "Kirim Jawaban"}
            </button>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="image-modal" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" />
        </div>
      )}
    </div>
  );
}

export default QuizPage;