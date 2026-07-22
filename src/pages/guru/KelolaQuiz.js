import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../style/KelolaQuiz.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const formatImageUrl = (url) => {
  if (!url) return "";
  let cleanUrl = String(url).trim();
  if (cleanUrl.startsWith("http://localhost:5000")) {
    cleanUrl = cleanUrl.replace("http://localhost:5000", API_BASE_URL);
  }
  if (typeof window !== "undefined" && window.location.protocol === "https:" && cleanUrl.startsWith("http://")) {
    cleanUrl = cleanUrl.replace(/^http:/, "https:");
  }
  return cleanUrl;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

const DEFAULT_FIELD = { value: "jawaban", label: "Jawaban" };

const emptyRubricForm = (fieldKey = DEFAULT_FIELD.value) => ({
  field_key: fieldKey,
  score: 4,
  min_match: 1,
  keywords: "",
  feedback: "",
});

const getErrorMessage = (err, fallback = "Terjadi kesalahan") => {
  const message = err?.response?.data?.message || err?.message || fallback;
  const detail = err?.response?.data?.error;
  return detail ? `${message}\nDetail: ${detail}` : message;
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeAnswerFields = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    const parsed = safeJsonParse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof parsed === "string") {
      return parsed
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toFieldKey = (label, index) => {
  const key = String(label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\s*\d+[).:-]\s*/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return key || `field_${index + 1}`;
};

const normalizeFieldOrderKey = (value = "") => {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\s*\d+[).:-]\s*/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const parseAvailableFields = (answerFieldsValue) => {
  const fields = normalizeAnswerFields(answerFieldsValue);

  if (fields.length === 0) return [DEFAULT_FIELD];

  const usedKeys = new Set();

  return fields.map((fieldText, index) => {
    const label =
      String(fieldText)
        .replace(/^\s*\d+[).:-]\s*/, "")
        .trim() || `Jawaban ${index + 1}`;

    const baseKey = toFieldKey(label, index);
    let value = baseKey;
    let duplicateIndex = 2;

    while (usedKeys.has(value)) {
      value = `${baseKey}_${duplicateIndex}`;
      duplicateIndex += 1;
    }

    usedKeys.add(value);

    return { value, label };
  });
};

const ensureFieldExists = (fields, fieldKey) => {
  const normalizedFields = fields?.length ? fields : [DEFAULT_FIELD];
  const cleanFieldKey = String(fieldKey || "").trim();

  if (!cleanFieldKey) return normalizedFields;

  const exists = normalizedFields.some((field) => field.value === cleanFieldKey);
  if (exists) return normalizedFields;

  return [
    ...normalizedFields,
    {
      value: cleanFieldKey,
      label: cleanFieldKey.replace(/_/g, " "),
    },
  ];
};

const normalizeKeywordsArray = (value) => {
  let rawItems = [];

  if (Array.isArray(value)) {
    rawItems = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    const parsed = safeJsonParse(trimmed);

    if (Array.isArray(parsed)) {
      rawItems = parsed;
    } else {
      rawItems = trimmed.split(/[,;\n\r]+/);
    }
  }

  const seen = new Set();

  return rawItems
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const keywordsToInputText = (value) => normalizeKeywordsArray(value).join(", ");
const keywordsToStorageText = (value) => normalizeKeywordsArray(value).join(",");

const normalizeRubric = (rubric) => ({
  ...rubric,
  score: Number(rubric?.score) || 0,
  min_match: Math.max(1, Number(rubric?.min_match) || 1),
  keywords: keywordsToInputText(rubric?.keywords),
});

const sortRubricsByFieldOrder = (rubrics = [], answerFieldsValue = "") => {
  const fields = parseAvailableFields(answerFieldsValue);
  const fieldOrderMap = new Map();

  fields.forEach((field, index) => {
    fieldOrderMap.set(normalizeFieldOrderKey(field.value), index);
    fieldOrderMap.set(normalizeFieldOrderKey(field.label), index);
  });

  return [...rubrics]
    .map(normalizeRubric)
    .sort((a, b) => {
      const orderA =
        fieldOrderMap.get(normalizeFieldOrderKey(a.field_key)) ?? 9999;
      const orderB =
        fieldOrderMap.get(normalizeFieldOrderKey(b.field_key)) ?? 9999;

      if (orderA !== orderB) return orderA - orderB;

      const scoreA = Number(a.score) || 0;
      const scoreB = Number(b.score) || 0;

      if (scoreA !== scoreB) return scoreB - scoreA;

      const minA = Number(a.min_match) || 0;
      const minB = Number(b.min_match) || 0;

      if (minA !== minB) return minB - minA;

      return Number(a.id || 0) - Number(b.id || 0);
    });
};

const formatRubrikFieldLabel = (fieldKey, fields = []) => {
  const matchedField = fields.find((field) => {
    return (
      normalizeFieldOrderKey(field.value) === normalizeFieldOrderKey(fieldKey) ||
      normalizeFieldOrderKey(field.label) === normalizeFieldOrderKey(fieldKey)
    );
  });

  const label = matchedField?.label || fieldKey || "Jawaban";

  return String(label)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function KelolaQuizGuru() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [openPertemuan, setOpenPertemuan] = useState({});

  const [inputSoal, setInputSoal] = useState("");
  const [answerFields, setAnswerFields] = useState("");
  const [pertemuan, setPertemuan] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [answerType, setAnswerType] = useState("text");
  const [judulLkpd, setJudulLkpd] = useState("");
  const [pendahuluanLkpd, setPendahuluanLkpd] = useState("");

  const [rubriksPerSoal, setRubriksPerSoal] = useState({});
  const [fieldsPerSoal, setFieldsPerSoal] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [rubricForm, setRubricForm] = useState(emptyRubricForm());
  const [editingRubricId, setEditingRubricId] = useState(null);
  const [loadingRubriks, setLoadingRubriks] = useState({});
  const [rubricSubmitting, setRubricSubmitting] = useState(false);
  const [openRubrikList, setOpenRubrikList] = useState({});

  const currentKeywordCount = useMemo(
    () => normalizeKeywordsArray(rubricForm.keywords).length,
    [rubricForm.keywords]
  );

  const getQuestionById = (id) =>
    questions.find((q) => String(q.id) === String(id));

  const getFieldsForQuestion = (question) => {
    if (!question) return [DEFAULT_FIELD];

    return fieldsPerSoal[question.id]?.length
      ? fieldsPerSoal[question.id]
      : parseAvailableFields(question.answer_fields);
  };

  const fetchRubriksForQuestion = async (questionId, answerFieldsValue = null) => {
    if (!questionId) return;

    setLoadingRubriks((prev) => ({
      ...prev,
      [questionId]: true,
    }));

    try {
      const question = getQuestionById(questionId);

      const res = await api.get(`/api/quiz/rubrics/${questionId}`);

      setRubriksPerSoal((prev) => ({
        ...prev,
        [questionId]: sortRubricsByFieldOrder(
          res.data?.data || [],
          answerFieldsValue ?? question?.answer_fields ?? ""
        ),
      }));
    } catch (err) {
      console.error(`Gagal fetch rubrik untuk soal ${questionId}:`, err);
      setRubriksPerSoal((prev) => ({
        ...prev,
        [questionId]: [],
      }));
    } finally {
      setLoadingRubriks((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    }
  };

  const fetchQuestions = async () => {
    setPageLoading(true);

    try {
      const res = await api.get("/api/quiz/questions");
      const data = res.data?.data || [];

      setQuestions(data);

      const fieldsMap = {};
      data.forEach((q) => {
        fieldsMap[q.id] = parseAvailableFields(q.answer_fields);
      });
      setFieldsPerSoal(fieldsMap);

      const daftarPertemuan = [
        ...new Set(data.map((q) => Number(q.pertemuan)).filter(Boolean)),
      ].sort((a, b) => a - b);

      setOpenPertemuan((prev) => {
        const next = { ...prev };
        daftarPertemuan.forEach((item, index) => {
          if (next[item] === undefined) next[item] = index === 0;
        });
        return next;
      });

      const rubrikResults = await Promise.all(
        data.map(async (q) => {
          try {
            const rubrikRes = await api.get(`/api/quiz/rubrics/${q.id}`);

            return {
              questionId: q.id,
              rubriks: sortRubricsByFieldOrder(
                rubrikRes.data?.data || [],
                q.answer_fields
              ),
            };
          } catch (err) {
            console.error(`Gagal fetch rubrik untuk soal ${q.id}:`, err);
            return { questionId: q.id, rubriks: [] };
          }
        })
      );

      const rubrikMap = {};
      rubrikResults.forEach(({ questionId, rubriks }) => {
        rubrikMap[questionId] = rubriks;
      });
      setRubriksPerSoal(rubrikMap);
    } catch (err) {
      console.error("Gagal mengambil soal:", err);
      alert(getErrorMessage(err, "Gagal mengambil data soal"));
    } finally {
      setPageLoading(false);
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
        intro:
          grouped[key].find((q) => q.judul_lkpd || q.pendahuluan_lkpd) ||
          grouped[key][0],
      }));
  }, [questions]);

  const totalPertemuan = groupedQuestions.length;
  const totalSoal = questions.length;
  const totalBergambar = questions.filter((q) => q.image_url).length;

  const setFieldsForQuestion = (questionId, fields) => {
    setFieldsPerSoal((prev) => ({
      ...prev,
      [questionId]: fields?.length ? fields : [DEFAULT_FIELD],
    }));
  };

  const resetRubricForm = (questionId = selectedQuestionId) => {
    const question = getQuestionById(questionId);
    const fields = getFieldsForQuestion(question);

    setRubricForm(emptyRubricForm(fields[0]?.value || DEFAULT_FIELD.value));
    setEditingRubricId(null);
  };

  const updateRubricForm = (changes) => {
    setRubricForm((prev) => {
      const next = { ...prev, ...changes };

      if ("min_match" in changes || "keywords" in changes) {
        const keywordCount = normalizeKeywordsArray(next.keywords).length;
        let minMatch = Number(next.min_match) || 1;

        minMatch = Math.max(1, minMatch);
        if (keywordCount > 0) minMatch = Math.min(minMatch, keywordCount);

        next.min_match = minMatch;
      }

      return next;
    });
  };

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

  const parseAnswerFields = () => normalizeAnswerFields(answerFields);

  const getAnswerTypeText = (type) => {
    if (type === "image") return "Gambar";
    if (type === "text_image") return "Teks dan Gambar";
    return "Teks";
  };

  const getAnswerFieldsText = (value) => {
    const fields = normalizeAnswerFields(value);
    return fields.length > 0 ? fields.join(", ") : "-";
  };

  const handleUploadGambar = async (e) => {
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

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await api.post("/api/quiz/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl = res.data?.url || res.data?.data?.url;

      if (!uploadedUrl) {
        throw new Error("URL gambar tidak dikirim oleh server");
      }

      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error("Upload gambar gagal:", err);
      alert(getErrorMessage(err, "Upload gambar gagal"));
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleTambah = async () => {
    const nomorPertemuan = Number(pertemuan);

    if (!nomorPertemuan || nomorPertemuan < 1) {
      alert("Pertemuan wajib diisi dengan angka lebih dari 0");
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
        pertemuan: nomorPertemuan,
        image_url: imageUrl || null,
        judul_lkpd: judulLkpd.trim() || existingIntro?.judul_lkpd || null,
        pendahuluan_lkpd:
          pendahuluanLkpd.trim() || existingIntro?.pendahuluan_lkpd || null,
        answer_type: answerType,
        answer_fields: fieldsArray.length > 0 ? JSON.stringify(fieldsArray) : null,
      };

      const res = await api.post("/api/quiz/questions", payload);

      setOpenPertemuan((prev) => ({
        ...prev,
        [nomorPertemuan]: true,
      }));

      setInputSoal("");
      setAnswerFields("");
      setImageUrl("");
      setAnswerType("text");

      await fetchQuestions();
      alert(res.data?.message || "Soal berhasil ditambahkan");
    } catch (err) {
      console.error("Tambah soal gagal:", err);
      alert(getErrorMessage(err, "Gagal menambahkan soal"));
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
    setSelectedQuestionId(null);
    setRubricForm(emptyRubricForm());
    setEditingRubricId(null);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Yakin hapus soal ini? Rubrik pada soal ini juga akan ikut hilang jika backend memakai relasi cascade."
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/api/quiz/questions/${id}`);

      setQuestions((prev) => prev.filter((q) => String(q.id) !== String(id)));

      setRubriksPerSoal((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      setFieldsPerSoal((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      setOpenRubrikList((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      if (String(selectedQuestionId) === String(id)) {
        setSelectedQuestionId(null);
        setEditingRubricId(null);
        setRubricForm(emptyRubricForm());
      }

      alert(res.data?.message || "Soal berhasil dihapus");
    } catch (err) {
      console.error("Hapus soal gagal:", err);
      alert(getErrorMessage(err, "Gagal menghapus soal"));
    }
  };

  const toggleRubrikList = (questionId) => {
    setOpenRubrikList((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleOpenRubrikForm = async (question) => {
    const fields = parseAvailableFields(question.answer_fields);

    setFieldsForQuestion(question.id, fields);
    setSelectedQuestionId(question.id);
    setEditingRubricId(null);
    setRubricForm(emptyRubricForm(fields[0]?.value || DEFAULT_FIELD.value));

    await fetchRubriksForQuestion(question.id, question.answer_fields);
  };

  const handleTambahRubrik = async () => {
    if (!selectedQuestionId) {
      alert("Pilih soal terlebih dahulu");
      return;
    }

    const question = getQuestionById(selectedQuestionId);
    const fields = getFieldsForQuestion(question);
    const allowedFieldKeys = fields.map((field) => field.value);
    const fieldKey = String(rubricForm.field_key || "").trim();
    const score = Math.min(4, Math.max(1, Number(rubricForm.score) || 1));
    const keywordsArray = normalizeKeywordsArray(rubricForm.keywords);

    if (!fieldKey) {
      alert("Field Key wajib dipilih");
      return;
    }

    if (!allowedFieldKeys.includes(fieldKey)) {
      alert("Field Key tidak sesuai dengan kolom jawaban pada soal ini");
      return;
    }

    if (keywordsArray.length === 0) {
      alert(
        "Keywords wajib diisi minimal 1 kata kunci. Rubrik tanpa keyword bisa membuat penilaian otomatis selalu cocok."
      );
      return;
    }

    const minMatch = Math.min(
      keywordsArray.length,
      Math.max(1, Number(rubricForm.min_match) || 1)
    );

    const payload = {
      question_id: selectedQuestionId,
      field_key: fieldKey,
      score,
      min_match: minMatch,
      keywords: keywordsToStorageText(keywordsArray),
      feedback: rubricForm.feedback.trim() || null,
    };

    setRubricSubmitting(true);

    try {
      if (editingRubricId) {
        await api.put(`/api/quiz/rubrics/${editingRubricId}`, payload);
        alert("Rubrik berhasil diupdate");
      } else {
        await api.post("/api/quiz/rubrics", payload);
        alert("Rubrik berhasil ditambahkan");
      }

      await fetchRubriksForQuestion(selectedQuestionId, question?.answer_fields);
      setRubricForm(emptyRubricForm(fields[0]?.value || DEFAULT_FIELD.value));
      setEditingRubricId(null);
    } catch (err) {
      console.error("Gagal simpan rubrik:", err);
      alert(getErrorMessage(err, "Gagal menyimpan rubrik"));
    } finally {
      setRubricSubmitting(false);
    }
  };

  const handleEditRubrik = (question, rubric) => {
    const fields = ensureFieldExists(
      parseAvailableFields(question.answer_fields),
      rubric.field_key
    );

    setFieldsForQuestion(question.id, fields);
    setSelectedQuestionId(question.id);
    setEditingRubricId(rubric.id);
    setRubricForm({
      field_key: String(
        rubric.field_key || fields[0]?.value || DEFAULT_FIELD.value
      ),
      score: Math.min(4, Math.max(1, Number(rubric.score) || 1)),
      min_match: Math.max(1, Number(rubric.min_match) || 1),
      keywords: keywordsToInputText(rubric.keywords),
      feedback: rubric.feedback || "",
    });
  };

  const handleHapusRubrik = async (questionId, rubricId) => {
    if (!window.confirm("Yakin hapus rubrik ini?")) return;

    try {
      await api.delete(`/api/quiz/rubrics/${rubricId}`);

      if (String(editingRubricId) === String(rubricId)) {
        setEditingRubricId(null);
        const question = getQuestionById(questionId);
        const fields = getFieldsForQuestion(question);
        setRubricForm(emptyRubricForm(fields[0]?.value || DEFAULT_FIELD.value));
      }

      const question = getQuestionById(questionId);
      await fetchRubriksForQuestion(questionId, question?.answer_fields);
      alert("Rubrik berhasil dihapus");
    } catch (err) {
      console.error("Gagal hapus rubrik:", err);
      alert(getErrorMessage(err, "Gagal menghapus rubrik"));
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
              soal, rubrik penilaian, dan tipe jawaban siswa.
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
                  min="1"
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
                  disabled={uploading}
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
            {pageLoading ? (
              <div className="empty-box">
                <div className="empty-illustration">⏳</div>
                <h3>Memuat data...</h3>
                <p>Sedang mengambil soal dan rubrik.</p>
              </div>
            ) : groupedQuestions.length === 0 ? (
              <div className="empty-box">
                <div className="empty-illustration">📝</div>
                <h3>Belum ada soal</h3>
                <p>Tambahkan konten untuk mulai mengelola LKPD per pertemuan.</p>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <div>
                    <h2>Daftar Konten per Pertemuan</h2>
                    <p className="detail-subtitle">
                      Klik setiap pertemuan untuk membuka pendahuluan, soal, dan
                      rubrik.
                    </p>
                  </div>
                </div>

                <div className="question-accordion-list">
                  {groupedQuestions.map((group) => (
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
                            {group.intro?.judul_lkpd ||
                              `${group.items.length} soal tersedia`}
                          </p>
                        </div>

                        <div className="accordion-header-right">
                          <span className="meeting-badge">
                            {group.items.length} soal
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
                            {group.items.map((q, index) => {
                              const fieldsForThisQuestion = getFieldsForQuestion(q);
                              const rubriksForThisQuestion =
                                sortRubricsByFieldOrder(
                                  rubriksPerSoal[q.id] || [],
                                  q.answer_fields
                                );
                              const isLoadingRubriks =
                                loadingRubriks[q.id] || false;
                              const isRubrikListOpen = Boolean(
                                openRubrikList[q.id]
                              );

                              return (
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
                                        Jawaban: {getAnswerTypeText(q.answer_type)}
                                      </span>
                                    </div>
                                  </div>

                                  {q.image_url && (
                                    <div className="question-group">
                                      <label>Gambar Soal</label>
                                      <img
                                        src={formatImageUrl(q.image_url)}
                                        alt={`Soal ${index + 1}`}
                                        className="quiz-preview-img"
                                      />
                                    </div>
                                  )}

                                  <div className="rubrik-section">
                                    <div className="rubrik-header">
                                      <h4>📋 Rubrik Penilaian</h4>
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                          type="button"
                                          className="btn-rubrik-add"
                                          onClick={() => handleOpenRubrikForm(q)}
                                          disabled={rubricSubmitting}
                                        >
                                          + Tambah Rubrik
                                        </button>

                                        <button
                                          type="button"
                                          className="btn-rubrik-add"
                                          onClick={() => toggleRubrikList(q.id)}
                                          style={{ background: "#eef2f7" }}
                                        >
                                          {isRubrikListOpen
                                            ? "🙈 Sembunyikan"
                                            : `👁️ Lihat (${rubriksForThisQuestion.length})`}
                                        </button>

                                        <button
                                          type="button"
                                          className="btn-rubrik-add"
                                          onClick={() =>
                                            fetchRubriksForQuestion(
                                              q.id,
                                              q.answer_fields
                                            )
                                          }
                                          style={{ background: "#eef2f7" }}
                                          disabled={isLoadingRubriks}
                                        >
                                          {isLoadingRubriks
                                            ? "⏳ Memuat"
                                            : "🔄 Refresh"}
                                        </button>
                                      </div>
                                    </div>

                                    {selectedQuestionId === q.id && (
                                      <div className="rubrik-form">
                                        <div className="rubrik-form-grid">
                                          <div className="form-group">
                                            <label>Field Key</label>
                                            <select
                                              value={rubricForm.field_key}
                                              onChange={(e) =>
                                                updateRubricForm({
                                                  field_key: e.target.value,
                                                })
                                              }
                                              disabled={rubricSubmitting}
                                            >
                                              {fieldsForThisQuestion.map((field) => (
                                                <option
                                                  key={field.value}
                                                  value={field.value}
                                                >
                                                  {field.label}
                                                </option>
                                              ))}
                                            </select>
                                            <small>
                                              Pilih kolom jawaban yang akan dinilai
                                              dari soal ini.
                                            </small>
                                          </div>

                                          <div className="form-group">
                                            <label>Skor</label>
                                            <select
                                              value={String(rubricForm.score)}
                                              onChange={(e) =>
                                                updateRubricForm({
                                                  score: Number(e.target.value),
                                                })
                                              }
                                              disabled={rubricSubmitting}
                                            >
                                              <option value="4">
                                                4 (Sangat Baik)
                                              </option>
                                              <option value="3">3 (Baik)</option>
                                              <option value="2">2 (Cukup)</option>
                                              <option value="1">
                                                1 (Perlu Perbaikan)
                                              </option>
                                            </select>
                                          </div>

                                          <div className="form-group">
                                            <label>Minimal Keyword Cocok</label>
                                            <input
                                              type="number"
                                              min="1"
                                              max={currentKeywordCount || undefined}
                                              value={rubricForm.min_match}
                                              onChange={(e) =>
                                                updateRubricForm({
                                                  min_match: Number(e.target.value),
                                                })
                                              }
                                              disabled={rubricSubmitting}
                                            />
                                            <small>
                                              Jumlah keyword saat ini:{" "}
                                              {currentKeywordCount}.
                                            </small>
                                          </div>

                                          <div className="form-group full-width">
                                            <label>
                                              Keywords (pisahkan dengan koma)
                                            </label>
                                            <textarea
                                              placeholder="hemat air, keran terbuka, pemborosan"
                                              value={rubricForm.keywords}
                                              onChange={(e) =>
                                                updateRubricForm({
                                                  keywords: e.target.value,
                                                })
                                              }
                                              disabled={rubricSubmitting}
                                            />
                                            <small>
                                              Wajib diisi agar penilaian otomatis
                                              tidak salah.
                                            </small>
                                          </div>

                                          <div className="form-group full-width">
                                            <label>Feedback Otomatis</label>
                                            <textarea
                                              placeholder="Feedback yang akan muncul jika rubrik ini terpenuhi"
                                              value={rubricForm.feedback}
                                              onChange={(e) =>
                                                updateRubricForm({
                                                  feedback: e.target.value,
                                                })
                                              }
                                              disabled={rubricSubmitting}
                                            />
                                          </div>
                                        </div>

                                        <div className="rubrik-form-actions">
                                          <button
                                            type="button"
                                            className="btn-rubrik-save"
                                            onClick={handleTambahRubrik}
                                            disabled={rubricSubmitting}
                                          >
                                            {rubricSubmitting
                                              ? "Menyimpan..."
                                              : editingRubricId
                                                ? "Update Rubrik"
                                                : "Tambah Rubrik"}
                                          </button>

                                          <button
                                            type="button"
                                            className="btn-rubrik-cancel"
                                            onClick={() => resetRubricForm(q.id)}
                                            disabled={rubricSubmitting}
                                          >
                                            Batal
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {!isRubrikListOpen ? (
                                      <p
                                        style={{
                                          fontSize: "12px",
                                          color: "#6b7280",
                                          padding: "10px 0 0",
                                          margin: 0,
                                        }}
                                      >
                                        Daftar rubrik disembunyikan. Total rubrik:{" "}
                                        {rubriksForThisQuestion.length}. Klik
                                        "Lihat" jika ingin mengedit atau
                                        menghapus.
                                      </p>
                                    ) : (
                                      <div className="rubrik-list">
                                        <h5>Daftar Rubrik</h5>

                                        {isLoadingRubriks ? (
                                          <p
                                            style={{
                                              fontSize: "12px",
                                              color: "#6b7280",
                                              padding: "8px 0",
                                            }}
                                          >
                                            ⏳ Memuat rubrik...
                                          </p>
                                        ) : rubriksForThisQuestion.length === 0 ? (
                                          <p
                                            style={{
                                              fontSize: "12px",
                                              color: "#6b7280",
                                              padding: "8px 0",
                                            }}
                                          >
                                            Belum ada rubrik untuk soal ini. Klik
                                            "+ Tambah Rubrik" untuk menambahkan.
                                          </p>
                                        ) : (
                                          rubriksForThisQuestion.map(
                                            (rubric, rubricIndex) => (
                                              <div
                                                key={rubric.id}
                                                className="rubrik-item"
                                              >
                                                <div className="rubrik-item-info">
                                                  <span className="rubrik-order">
                                                    {rubricIndex + 1}
                                                  </span>

                                                  <span className="rubrik-field">
                                                    {formatRubrikFieldLabel(
                                                      rubric.field_key,
                                                      fieldsForThisQuestion
                                                    )}
                                                  </span>

                                                  <span className="rubrik-score">
                                                    Skor: {rubric.score}
                                                  </span>

                                                  <span className="rubrik-minmatch">
                                                    Min: {rubric.min_match}
                                                  </span>

                                                  <span className="rubrik-keywords">
                                                    Keywords:{" "}
                                                    {keywordsToInputText(
                                                      rubric.keywords
                                                    ) || "-"}
                                                  </span>

                                                  {rubric.feedback && (
                                                    <span className="rubrik-feedback">
                                                      💬 {rubric.feedback}
                                                    </span>
                                                  )}
                                                </div>

                                                <div className="rubrik-item-actions">
                                                  <button
                                                    type="button"
                                                    className="btn-rubrik-edit"
                                                    onClick={() =>
                                                      handleEditRubrik(q, rubric)
                                                    }
                                                    disabled={rubricSubmitting}
                                                  >
                                                    Edit
                                                  </button>

                                                  <button
                                                    type="button"
                                                    className="btn-rubrik-delete"
                                                    onClick={() =>
                                                      handleHapusRubrik(
                                                        q.id,
                                                        rubric.id
                                                      )
                                                    }
                                                    disabled={rubricSubmitting}
                                                  >
                                                    Hapus
                                                  </button>
                                                </div>
                                              </div>
                                            )
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>

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
                              );
                            })}
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