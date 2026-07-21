import React, { useEffect, useMemo, useState } from "react";
import "../../style/MonitoringProyek.css";

const API_URL = "http://localhost:5000";

const meetingOptions = [1, 2, 3, 4];

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

function formatStatus(status) {
  if (status === "submitted") return "Sudah Dikirim";
  if (status === "draft") return "Draft";
  return status || "-";
}

function statusClass(status) {
  if (status === "submitted") return "submitted";
  if (status === "draft") return "draft";
  return "empty";
}

export default function MonitoringProyek() {
  const [projectPlans, setProjectPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState("1");
  const [loading, setLoading] = useState(false);

  const filteredProjectPlans = useMemo(() => {
    if (selectedPertemuan === "all") return projectPlans;

    return projectPlans.filter(
      (item) => String(item.pertemuan) === String(selectedPertemuan)
    );
  }, [projectPlans, selectedPertemuan]);

  const totalSubmitted = useMemo(() => {
    return filteredProjectPlans.filter((item) => item.status === "submitted")
      .length;
  }, [filteredProjectPlans]);

  const totalDraft = useMemo(() => {
    return filteredProjectPlans.filter((item) => item.status === "draft").length;
  }, [filteredProjectPlans]);

  const totalSchedules = useMemo(() => {
    return filteredProjectPlans.reduce((total, item) => {
      return total + (Array.isArray(item.schedules) ? item.schedules.length : 0);
    }, 0);
  }, [filteredProjectPlans]);

  const loadProjectPlans = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/project-plans/guru/all/list`);
      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Response monitoring proyek bukan JSON:", text);
        setProjectPlans([]);
        setSelectedPlan(null);
        return;
      }

      if (!res.ok) {
        console.error(data.message || "Gagal mengambil data monitoring proyek.");
        setProjectPlans([]);
        setSelectedPlan(null);
        return;
      }

      const rows = Array.isArray(data.data) ? data.data : [];
      setProjectPlans(rows);
    } catch (err) {
      console.error("LOAD MONITORING PROYEK ERROR:", err);
      setProjectPlans([]);
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectPlans();
  }, []);

  useEffect(() => {
    setSelectedPlan((prev) => {
      if (prev && filteredProjectPlans.some((item) => item.id === prev.id)) {
        return prev;
      }

      return filteredProjectPlans[0] || null;
    });
  }, [filteredProjectPlans]);

  return (
    <div className="monitor-proyek-page">
      <div className="monitor-proyek-container">
        <div className="monitor-proyek-header">
          <div>
            <span className="monitor-proyek-badge">Panel Guru</span>
            <h1>Monitoring Proyek Siswa</h1>
            <p>
              Guru dapat melihat rencana desain proyek dan jadwal kerja yang
              diajukan siswa berdasarkan pertemuan.
            </p>
          </div>

          <button type="button" onClick={loadProjectPlans}>
            Refresh Data
          </button>
        </div>

        <div className="monitor-meeting-filter">
          <span>Filter Pertemuan</span>

          <div>
            <button
              type="button"
              className={selectedPertemuan === "all" ? "active" : ""}
              onClick={() => setSelectedPertemuan("all")}
            >
              Semua
            </button>

            {meetingOptions.map((meeting) => (
              <button
                type="button"
                key={meeting}
                className={
                  String(selectedPertemuan) === String(meeting) ? "active" : ""
                }
                onClick={() => setSelectedPertemuan(String(meeting))}
              >
                Pertemuan {meeting}
              </button>
            ))}
          </div>
        </div>

        <div className="monitor-proyek-summary">
          <div>
            <span>Total Rencana</span>
            <strong>{filteredProjectPlans.length}</strong>
          </div>

          <div>
            <span>Sudah Dikirim</span>
            <strong>{totalSubmitted}</strong>
          </div>

          <div>
            <span>Draft</span>
            <strong>{totalDraft}</strong>
          </div>

          <div>
            <span>Total Jadwal</span>
            <strong>{totalSchedules}</strong>
          </div>
        </div>

        <div className="monitor-proyek-layout">
          <aside className="monitor-proyek-sidebar">
            <h2>
              Daftar Rencana{" "}
              {selectedPertemuan === "all"
                ? "Semua Pertemuan"
                : `Pertemuan ${selectedPertemuan}`}
            </h2>

            {loading ? (
              <p className="monitor-proyek-empty">Memuat data proyek...</p>
            ) : filteredProjectPlans.length === 0 ? (
              <p className="monitor-proyek-empty">
                Belum ada rencana proyek pada pertemuan ini.
              </p>
            ) : (
              <div className="monitor-proyek-list">
                {filteredProjectPlans.map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    className={`monitor-proyek-item ${
                      selectedPlan?.id === plan.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="monitor-proyek-item-top">
                      <h3>{plan.student_name || `User #${plan.user_id}`}</h3>

                      <span
                        className={`monitor-status ${statusClass(plan.status)}`}
                      >
                        {formatStatus(plan.status)}
                      </span>
                    </div>

                    <p>
                      <b>Pertemuan:</b> {plan.pertemuan || "-"}
                    </p>

                    <p>
                      <b>Kelompok:</b> {plan.group_name || "-"}
                    </p>

                    <p>
                      <b>Update:</b> {formatDate(plan.updated_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="monitor-proyek-content">
            {!selectedPlan ? (
              <div className="monitor-proyek-empty-box">
                Pilih salah satu rencana proyek untuk melihat detail.
              </div>
            ) : (
              <>
                <div className="monitor-proyek-detail-header">
                  <div>
                    <h2>{selectedPlan.group_name || "Rencana Proyek"}</h2>
                    <p>
                      {selectedPlan.student_name ||
                        `User #${selectedPlan.user_id}`}{" "}
                      · Pertemuan {selectedPlan.pertemuan || "-"}
                    </p>
                  </div>

                  <span
                    className={`monitor-status ${statusClass(
                      selectedPlan.status
                    )}`}
                  >
                    {formatStatus(selectedPlan.status)}
                  </span>
                </div>

                <div className="monitor-proyek-meta">
                  <div>
                    <span>Siswa</span>
                    <strong>
                      {selectedPlan.student_name ||
                        `User #${selectedPlan.user_id}`}
                    </strong>
                  </div>

                  <div>
                    <span>Kelompok</span>
                    <strong>{selectedPlan.group_name || "-"}</strong>
                  </div>

                  <div>
                    <span>Pertemuan</span>
                    <strong>{selectedPlan.pertemuan || "-"}</strong>
                  </div>

                  <div>
                    <span>Diperbarui</span>
                    <strong>{formatDate(selectedPlan.updated_at)}</strong>
                  </div>
                </div>

                <div className="monitor-proyek-detail-list">
                  <div className="monitor-proyek-card">
                    <label>Anggota Kelompok</label>
                    <p>{selectedPlan.members_text || "-"}</p>
                  </div>

                  <div className="monitor-proyek-card">
                    <label>Rencana Proyek</label>
                    <p>{selectedPlan.project_plan || "-"}</p>
                  </div>

                  <div className="monitor-proyek-card">
                    <label>Aturan Proyek</label>
                    <p>{selectedPlan.project_rules || "-"}</p>
                  </div>

                  <div className="monitor-proyek-card">
                    <label>Aktivitas yang Dipilih</label>
                    <p>{selectedPlan.selected_activities || "-"}</p>
                  </div>

                  <div className="monitor-proyek-card">
                    <label>Alat dan Bahan</label>
                    <p>{selectedPlan.tools_materials || "-"}</p>
                  </div>

                  <div className="monitor-proyek-card full">
                    <div className="monitor-card-title">
                      <label>Jadwal Proyek</label>
                      <span>
                        {Array.isArray(selectedPlan.schedules)
                          ? selectedPlan.schedules.length
                          : 0}{" "}
                        jadwal
                      </span>
                    </div>

                    {!Array.isArray(selectedPlan.schedules) ||
                    selectedPlan.schedules.length === 0 ? (
                      <div className="monitor-proyek-empty-small">
                        Jadwal proyek belum diisi siswa.
                      </div>
                    ) : (
                      <div className="monitor-proyek-table-wrap">
                        <table className="monitor-proyek-table">
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>Tanggal</th>
                              <th>Aktivitas</th>
                              <th>PIC</th>
                              <th>Target Output</th>
                              <th>Catatan</th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedPlan.schedules.map((schedule, index) => (
                              <tr key={schedule.id || index}>
                                <td>{index + 1}</td>
                                <td>{formatDateOnly(schedule.schedule_date)}</td>
                                <td>{schedule.schedule_activity || "-"}</td>
                                <td>{schedule.pic_name || "-"}</td>
                                <td>{schedule.target_output || "-"}</td>
                                <td>{schedule.note || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}