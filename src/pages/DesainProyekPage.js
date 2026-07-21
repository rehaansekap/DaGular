import React, { useCallback, useEffect, useState } from "react";
import "../style/DesainProyekPage.css";

const API_URL = "http://localhost:5000";

const emptyForm = {
  group_name: "",
  project_plan: "",
};

const emptySchedule = {
  schedule_date: "",
  schedule_activity: "",
  pic_name: "",
  target_output: "",
  note: "",
};

const steps = [
  {
    id: 1,
    title: "Perencanaan Proyek",
    desc: "Data kelompok dan rencana kerja",
  },
  {
    id: 2,
    title: "Jadwal Proyek",
    desc: "Tanggal, aktivitas, dan target",
  },
  {
    id: 3,
    title: "Ringkasan & Status",
    desc: "Review hasil rencana proyek",
  },
];

function makeEmptySchedule() {
  return { ...emptySchedule };
}

function textToList(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // lanjut parsing teks biasa
  }

  return String(value)
    .split(/\n+/)
    .map((item) => item.replace(/^\s*\d+[).:-]\s*/, "").trim())
    .filter(Boolean);
}

function listToText(list) {
  return Array.isArray(list)
    ? list.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "";
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return "-";
  }
}

function formatDateOnly(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID");
  } catch {
    return "-";
  }
}

function toInputDate(value) {
  if (!value) return "";

  try {
    return String(value).slice(0, 10);
  } catch {
    return "";
  }
}

function formatStatus(status) {
  if (status === "submitted") return "Sudah Dikirim";
  if (status === "draft") return "Draft";
  return "Belum Dibuat";
}

function statusClass(status) {
  if (status === "submitted") return "submitted";
  if (status === "draft") return "draft";
  return "empty";
}

function DynamicListInput({ label, placeholder, addLabel, items, setItems }) {
  const [input, setInput] = useState("");

  const addItem = () => {
    const cleanInput = input.trim();
    if (!cleanInput) return;

    setItems((prev) => [...prev, cleanInput]);
    setInput("");
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateItem = (index, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item))
    );
  };

  return (
    <div className="form-group full">
      <label>{label}</label>

      <div className="dynamic-input-box">
        <div className="dynamic-input-row">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />

          <button type="button" onClick={addItem}>
            + {addLabel}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="dynamic-empty">Belum ada data yang ditambahkan.</div>
        ) : (
          <div className="dynamic-list">
            {items.map((item, index) => (
              <div className="dynamic-item" key={`${item}-${index}`}>
                <span>{index + 1}</span>

                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                />

                <button type="button" onClick={() => removeItem(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChipInput({ label, placeholder, items, setItems }) {
  const [input, setInput] = useState("");

  const addChip = () => {
    const cleanInput = input.trim();
    if (!cleanInput) return;

    setItems((prev) => {
      if (prev.includes(cleanInput)) return prev;
      return [...prev, cleanInput];
    });

    setInput("");
  };

  const removeChip = (index) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="form-group full">
      <label>{label}</label>

      <div className="chip-input-box">
        <div className="chip-list">
          {items.map((item, index) => (
            <span className="chip-item" key={`${item}-${index}`}>
              {item}
              <button type="button" onClick={() => removeChip(index)}>
                ×
              </button>
            </span>
          ))}

          <input
            type="text"
            placeholder={items.length === 0 ? placeholder : "Tambah lagi..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={addChip}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addChip();
              }
            }}
          />
        </div>
      </div>

      <p className="input-hint">
        Tekan Enter setelah mengetik satu alat atau bahan.
      </p>
    </div>
  );
}

function DesainProyekPage() {
  const user_id = localStorage.getItem("user_id");
  const name = localStorage.getItem("name") || "Siswa";

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pertemuan, setPertemuan] = useState(1);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [members, setMembers] = useState([]);
  const [rules, setRules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tools, setTools] = useState([]);
  const [schedules, setSchedules] = useState([makeEmptySchedule()]);

  const [myPlans, setMyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const resetFormToEmpty = useCallback(() => {
    setActiveStep(1);
    setPertemuan(1);
    setStatus("");
    setForm(emptyForm);
    setMembers([]);
    setRules([]);
    setActivities([]);
    setTools([]);
    setSchedules([makeEmptySchedule()]);
    setSelectedPlan(null);
  }, []);

  const loadMyProjectPlans = useCallback(async () => {
    if (!user_id) return;

    try {
      const res = await fetch(`${API_URL}/api/project-plans/siswa/${user_id}`);
      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response daftar project plan bukan JSON:", text);
        setMyPlans([]);
        setSelectedPlan(null);
        setActiveStep(1);
        return;
      }

      if (!res.ok) {
        console.error("Gagal mengambil daftar rencana proyek:", data);
        setMyPlans([]);
        setSelectedPlan(null);
        setActiveStep(1);
        return;
      }

      const rows = Array.isArray(data.data) ? data.data : [];

      const sortedRows = [...rows].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setMyPlans(sortedRows);

      if (sortedRows.length > 0) {
        setSelectedPlan((prev) => {
          if (prev && sortedRows.some((item) => item.id === prev.id)) {
            return sortedRows.find((item) => item.id === prev.id) || prev;
          }

          return sortedRows[0];
        });

        setActiveStep(3);
      } else {
        setSelectedPlan(null);
        setActiveStep(1);
      }
    } catch (err) {
      console.error("LOAD MY PROJECT PLANS ERROR:", err);
      setMyPlans([]);
      setSelectedPlan(null);
      setActiveStep(1);
    }
  }, [user_id]);

  useEffect(() => {
    resetFormToEmpty();
    loadMyProjectPlans();
  }, [resetFormToEmpty, loadMyProjectPlans]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addScheduleRow = () => {
    setSchedules((prev) => [...prev, makeEmptySchedule()]);
  };

  const removeScheduleRow = (index) => {
    setSchedules((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const updateScheduleRow = (index, field, value) => {
    setSchedules((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const getCleanSchedules = () => {
    return schedules
      .map((item, index) => ({
        schedule_order: index + 1,
        schedule_date: item.schedule_date || "",
        schedule_activity: item.schedule_activity || "",
        pic_name: item.pic_name || "",
        target_output: item.target_output || "",
        note: item.note || "",
      }))
      .filter((item) => {
        return (
          item.schedule_date ||
          item.schedule_activity ||
          item.pic_name ||
          item.target_output ||
          item.note
        );
      });
  };

  const validatePlanningStep = () => {
    if (!user_id) {
      alert("User belum login.");
      return false;
    }

    if (!form.group_name.trim()) {
      alert("Nama kelompok wajib diisi.");
      return false;
    }

    if (members.length === 0) {
      alert("Nama anggota wajib diisi.");
      return false;
    }

    if (!form.project_plan.trim()) {
      alert("Rencana proyek wajib diisi.");
      return false;
    }

    if (rules.length === 0) {
      alert("Aturan proyek wajib diisi.");
      return false;
    }

    if (activities.length === 0) {
      alert("Aktivitas proyek wajib diisi.");
      return false;
    }

    if (tools.length === 0) {
      alert("Alat dan bahan wajib diisi.");
      return false;
    }

    return true;
  };

  const validateScheduleStep = () => {
    const cleanSchedules = getCleanSchedules();

    if (cleanSchedules.length === 0) {
      alert("Minimal satu jadwal proyek wajib diisi.");
      return false;
    }

    const invalidSchedule = cleanSchedules.some(
      (item) => !item.schedule_date || !item.schedule_activity
    );

    if (invalidSchedule) {
      alert("Setiap jadwal minimal wajib memiliki tanggal dan aktivitas.");
      return false;
    }

    return true;
  };

  const validateForm = () => {
    return validatePlanningStep() && validateScheduleStep();
  };

  const handleStepClick = (nextStep) => {
    if (nextStep === 1) {
      setActiveStep(1);
      return;
    }

    if (nextStep === 2) {
      if (!validatePlanningStep()) return;
      setActiveStep(2);
      return;
    }

    if (nextStep === 3) {
      if (selectedPlan) {
        setActiveStep(3);
        return;
      }

      if (!validatePlanningStep()) return;
      if (!validateScheduleStep()) return;

      setActiveStep(3);
    }
  };

  const handleSave = async (submitStatus = "draft") => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        user_id: Number(user_id),
        pertemuan: Number(pertemuan),
        group_name: form.group_name,
        members_text: listToText(members),
        project_plan: form.project_plan,
        project_rules: listToText(rules),
        selected_activities: listToText(activities),
        tools_materials: listToText(tools),
        schedules: getCleanSchedules(),
        status: submitStatus,
      };

      const res = await fetch(`${API_URL}/api/project-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response simpan project plan bukan JSON:", text);
        alert("Gagal menyimpan rencana proyek. Response server tidak valid.");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Gagal menyimpan rencana proyek.");
        return;
      }

      setStatus(submitStatus);

      if (data.data) {
        setSelectedPlan(data.data);
      }

      await loadMyProjectPlans();

      setActiveStep(3);
      alert(data.message || "Rencana proyek berhasil disimpan.");
    } catch (err) {
      console.error("SAVE PROJECT PLAN ERROR:", err);
      alert("Terjadi kesalahan saat menyimpan rencana proyek.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setActiveStep(3);
  };

  const handleEditPlan = (plan) => {
    if (!plan) return;

    setSelectedPlan(plan);
    setPertemuan(Number(plan.pertemuan));

    setForm({
      group_name: plan.group_name || "",
      project_plan: plan.project_plan || "",
    });

    setMembers(textToList(plan.members_text));
    setRules(textToList(plan.project_rules));
    setActivities(textToList(plan.selected_activities));
    setTools(textToList(plan.tools_materials));

    setSchedules(
      Array.isArray(plan.schedules) && plan.schedules.length > 0
        ? plan.schedules.map((item) => ({
            schedule_date: toInputDate(item.schedule_date),
            schedule_activity: item.schedule_activity || "",
            pic_name: item.pic_name || "",
            target_output: item.target_output || "",
            note: item.note || "",
          }))
        : [makeEmptySchedule()]
    );

    setStatus(plan.status || "");
    setActiveStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStepper = () => {
    return (
      <div className="desainproyek-stepper">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            className={
              activeStep === step.id
                ? "stepper-item active"
                : activeStep > step.id
                ? "stepper-item done"
                : "stepper-item"
            }
            onClick={() => handleStepClick(step.id)}
          >
            <span>{step.id}</span>

            <div>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderPlanningStep = () => {
    return (
      <div className="desainproyek-card step-panel">
        <div className="desainproyek-section-title">
          <div>
            <h2>1. Mendesain Perencanaan Proyek</h2>
            <p>
              Isi data kelompok, rencana kerja, aturan, aktivitas, serta alat
              dan bahan yang akan digunakan.
            </p>
          </div>

          <span className={`project-status ${statusClass(status)}`}>
            {formatStatus(status)}
          </span>
        </div>

        <div className="desainproyek-form">
          <div className="form-row-top">
            <div className="form-group pertemuan-field">
              <label>Pertemuan</label>
              <select
                value={pertemuan}
                onChange={(e) => setPertemuan(Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nama Kelompok</label>
              <input
                type="text"
                placeholder="Contoh: Kelompok 1"
                value={form.group_name}
                onChange={(e) => updateForm("group_name", e.target.value)}
              />
            </div>
          </div>

          <DynamicListInput
            label="Nama Anggota Kelompok"
            placeholder="Tulis nama anggota, lalu klik tambah"
            addLabel="Tambah Anggota"
            items={members}
            setItems={setMembers}
          />

          <div className="form-group full">
            <label>Rencana Proyek yang Akan Dilakukan</label>
            <textarea
              placeholder={`Jelaskan rencana proyek desain kelompok.
Contoh:
Kelompok kami akan membuat poster kampanye kebersihan kantin sekolah. Poster dibuat untuk mengajak siswa membuang sampah pada tempatnya dan menjaga area makan tetap bersih.`}
              value={form.project_plan}
              onChange={(e) => updateForm("project_plan", e.target.value)}
            />
          </div>

          <DynamicListInput
            label="Aturan yang Harus Dilaksanakan"
            placeholder="Contoh: Setiap anggota mengerjakan tugas sesuai pembagian"
            addLabel="Tambah Aturan"
            items={rules}
            setItems={setRules}
          />

          <DynamicListInput
            label="Aktivitas yang Akan Dilakukan"
            placeholder="Contoh: Davina membuat sketsa konsep 1"
            addLabel="Tambah Aktivitas"
            items={activities}
            setItems={setActivities}
          />

          <ChipInput
            label="Alat dan Bahan yang Perlu Dipersiapkan"
            placeholder="Contoh: Laptop"
            items={tools}
            setItems={setTools}
          />
        </div>

        <div className="step-navigation">
          <button
            type="button"
            className="btn-light-project"
            onClick={resetFormToEmpty}
            disabled={loading}
          >
            + Form Baru
          </button>

          <button
            type="button"
            className="btn-primary-project"
            onClick={() => {
              if (!validatePlanningStep()) return;
              setActiveStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={loading}
          >
            Lanjut ke Jadwal →
          </button>
        </div>
      </div>
    );
  };

  const renderScheduleStep = () => {
    return (
      <div className="desainproyek-card schedule-card step-panel wide-panel">
        <div className="desainproyek-section-title">
          <div>
            <h2>2. Menyusun Jadwal Proyek</h2>
            <p>
              Susun tanggal pelaksanaan, aktivitas, penanggung jawab, dan target
              output setiap kegiatan proyek.
            </p>
          </div>

          <button
            type="button"
            className="btn-add-schedule"
            onClick={addScheduleRow}
          >
            + Tambah Jadwal
          </button>
        </div>

        <div className="schedule-table-wrap">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Aktivitas</th>
                <th>Penanggung Jawab</th>
                <th>Target Output</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {schedules.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>

                  <td>
                    <input
                      type="date"
                      value={item.schedule_date}
                      onChange={(e) =>
                        updateScheduleRow(
                          index,
                          "schedule_date",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      placeholder="Contoh: Membuat sketsa konsep 1"
                      value={item.schedule_activity}
                      onChange={(e) =>
                        updateScheduleRow(
                          index,
                          "schedule_activity",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Nama anggota"
                      value={item.pic_name}
                      onChange={(e) =>
                        updateScheduleRow(index, "pic_name", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      placeholder="Contoh: Sketsa kasar"
                      value={item.target_output}
                      onChange={(e) =>
                        updateScheduleRow(
                          index,
                          "target_output",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      placeholder="Opsional"
                      value={item.note}
                      onChange={(e) =>
                        updateScheduleRow(index, "note", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn-remove-schedule"
                      onClick={() => removeScheduleRow(index)}
                      disabled={schedules.length === 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="step-navigation">
          <button
            type="button"
            className="btn-light-project"
            onClick={() => setActiveStep(1)}
            disabled={loading}
          >
            ← Kembali
          </button>

          <div className="step-navigation-right">
            <button
              type="button"
              className="btn-secondary-project"
              onClick={() => handleSave("draft")}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "💾 Simpan Draft"}
            </button>

            <button
              type="button"
              className="btn-primary-project"
              onClick={() => handleSave("submitted")}
              disabled={loading}
            >
              {loading ? "Mengirim..." : "✈ Kirim Rencana Proyek"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryStep = () => {
    return (
      <div className="project-history-block step-panel">
        <div className="desainproyek-section-title history-title">
          <div>
            <h2>3. Ringkasan & Status Rencana Proyek</h2>
            <p>
              Lihat kembali rencana proyek dan jadwal yang pernah kamu simpan
              atau kirim.
            </p>
          </div>

          <button
            type="button"
            className="btn-light-project"
            onClick={resetFormToEmpty}
          >
            + Buat Rencana Baru
          </button>
        </div>

        <div className="project-history-layout">
          <aside className="project-history-sidebar">
            <h3>Daftar Rencana</h3>

            {myPlans.length === 0 ? (
              <p className="project-empty-text">
                Belum ada rencana proyek yang disimpan.
              </p>
            ) : (
              <div className="project-submission-list">
                {myPlans.map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    className={`project-submission-card ${
                      selectedPlan?.id === plan.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <h4>Pertemuan {plan.pertemuan}</h4>

                    <p>
                      <span>Kelompok:</span> {plan.group_name || "-"}
                    </p>

                    <p>
                      <span>Status:</span>{" "}
                      <strong className={`mini-status ${statusClass(plan.status)}`}>
                        {formatStatus(plan.status)}
                      </strong>
                    </p>

                    <p>
                      <span>Update:</span> {formatDate(plan.updated_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="project-history-content">
            {!selectedPlan ? (
              <div className="project-empty-box">
                <p>Pilih rencana proyek di sebelah kiri untuk melihat detailnya.</p>

                <button
                  type="button"
                  className="btn-primary-project"
                  onClick={resetFormToEmpty}
                >
                  Buat Rencana Proyek
                </button>
              </div>
            ) : (
              <>
                <div className="project-detail-header">
                  <div>
                    <h3>{selectedPlan.group_name || "Rencana Proyek"}</h3>
                    <p>Pertemuan {selectedPlan.pertemuan}</p>
                  </div>

                  <div className="project-detail-actions">
                    <span
                      className={`project-status ${statusClass(
                        selectedPlan.status
                      )}`}
                    >
                      {formatStatus(selectedPlan.status)}
                    </span>

                    <button
                      type="button"
                      className="btn-light-project compact-btn"
                      onClick={() => handleEditPlan(selectedPlan)}
                    >
                      Edit Rencana
                    </button>
                  </div>
                </div>

                <div className="project-detail-meta">
                  <p>
                    <span>Terakhir Diperbarui:</span>{" "}
                    {formatDate(selectedPlan.updated_at)}
                  </p>

                  <p>
                    <span>Status:</span> {formatStatus(selectedPlan.status)}
                  </p>
                </div>

                <div className="project-detail-list">
                  <div className="project-detail-card">
                    <label>Nama Anggota</label>
                    <p>{selectedPlan.members_text || "-"}</p>
                  </div>

                  <div className="project-detail-card">
                    <label>Rencana Proyek</label>
                    <p>{selectedPlan.project_plan || "-"}</p>
                  </div>

                  <div className="project-detail-card">
                    <label>Aturan yang Harus Dilaksanakan</label>
                    <p>{selectedPlan.project_rules || "-"}</p>
                  </div>

                  <div className="project-detail-card">
                    <label>Aktivitas yang Akan Dilakukan</label>
                    <p>{selectedPlan.selected_activities || "-"}</p>
                  </div>

                  <div className="project-detail-card">
                    <label>Alat dan Bahan</label>
                    <p>{selectedPlan.tools_materials || "-"}</p>
                  </div>

                  <div className="project-detail-card">
                    <label>Jadwal Proyek</label>

                    {!selectedPlan.schedules ||
                    selectedPlan.schedules.length === 0 ? (
                      <p>-</p>
                    ) : (
                      <div className="readonly-schedule-list">
                        {selectedPlan.schedules.map((schedule, index) => (
                          <div className="readonly-schedule-item" key={index}>
                            <strong>
                              {index + 1}.{" "}
                              {formatDateOnly(schedule.schedule_date)}
                            </strong>

                            <p>
                              <b>Aktivitas:</b>{" "}
                              {schedule.schedule_activity || "-"}
                            </p>

                            <p>
                              <b>Penanggung jawab:</b>{" "}
                              {schedule.pic_name || "-"}
                            </p>

                            <p>
                              <b>Target output:</b>{" "}
                              {schedule.target_output || "-"}
                            </p>

                            {schedule.note && (
                              <p>
                                <b>Keterangan:</b> {schedule.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="desainproyek-page">
      <div className="desainproyek-container">
        <div className="desainproyek-header">
          <h1 className="desainproyek-title">Mendesain Perencanaan Proyek</h1>
          <p className="desainproyek-desc">
            Halo, {name}. Lengkapi rencana proyek kelompok dan susun jadwal
            pelaksanaannya sebelum mulai membuat karya desain.
          </p>
        </div>

        {renderStepper()}

        {activeStep === 1 && renderPlanningStep()}
        {activeStep === 2 && renderScheduleStep()}
        {activeStep === 3 && renderSummaryStep()}
      </div>
    </div>
  );
}

export default DesainProyekPage;