const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ================================
   HELPER
================================ */

function cleanText(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function normalizeActivitiesText(value) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function normalizeSchedules(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => ({
      schedule_order: Number(item.schedule_order || index + 1),
      schedule_date: cleanText(item.schedule_date),
      schedule_activity: cleanText(item.schedule_activity),
      pic_name: cleanText(item.pic_name),
      target_output: cleanText(item.target_output),
      note: cleanText(item.note),
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
}

async function getTableColumns() {
  const [columns] = await db.query(`SHOW COLUMNS FROM pjbl_project_plans`);
  return columns.map((column) => column.Field);
}

async function ensureProjectPlanTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS pjbl_project_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pertemuan INT NOT NULL,
      group_name VARCHAR(150) NOT NULL,
      members_text TEXT NULL,
      project_plan TEXT NULL,
      project_rules TEXT NULL,
      selected_activities TEXT NULL,
      tools_materials TEXT NULL,
      status ENUM('draft', 'submitted') DEFAULT 'draft',
      submitted_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_project_plan (user_id, pertemuan)
    )
  `);

  let columns = await getTableColumns();

  const addColumnIfMissing = async (columnName, columnSql) => {
    if (!columns.includes(columnName)) {
      await db.query(`
        ALTER TABLE pjbl_project_plans
        ADD COLUMN ${columnName} ${columnSql}
      `);

      columns = await getTableColumns();
    }
  };

  await addColumnIfMissing("members_text", "TEXT NULL");
  await addColumnIfMissing("project_plan", "TEXT NULL");
  await addColumnIfMissing("project_rules", "TEXT NULL");
  await addColumnIfMissing("selected_activities", "TEXT NULL");
  await addColumnIfMissing("tools_materials", "TEXT NULL");
  await addColumnIfMissing(
    "status",
    "ENUM('draft', 'submitted') DEFAULT 'draft'"
  );
  await addColumnIfMissing("submitted_at", "DATETIME NULL");

  columns = await getTableColumns();

  if (columns.includes("project_title")) {
    try {
      await db.query(`
        ALTER TABLE pjbl_project_plans
        MODIFY COLUMN project_title VARCHAR(255) NULL
      `);
    } catch (err) {
      console.warn(
        "Kolom project_title tidak bisa diubah, akan tetap diisi saat insert."
      );
    }
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS pjbl_project_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plan_id INT NOT NULL,
      schedule_order INT NOT NULL,
      schedule_date DATE NULL,
      schedule_activity TEXT NULL,
      pic_name VARCHAR(150) NULL,
      target_output TEXT NULL,
      note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_project_schedule_plan (plan_id),
      CONSTRAINT fk_project_schedule_plan
        FOREIGN KEY (plan_id) REFERENCES pjbl_project_plans(id)
        ON DELETE CASCADE
    )
  `);
}

async function getSchedulesByPlanId(planId) {
  const [rows] = await db.query(
    `SELECT
       id,
       plan_id,
       schedule_order,
       schedule_date,
       schedule_activity,
       pic_name,
       target_output,
       note,
       created_at,
       updated_at
     FROM pjbl_project_schedules
     WHERE plan_id = ?
     ORDER BY schedule_order ASC, id ASC`,
    [Number(planId)]
  );

  return rows;
}

async function getPlanById(planId) {
  const [rows] = await db.query(
    `SELECT *
     FROM pjbl_project_plans
     WHERE id = ?
     LIMIT 1`,
    [Number(planId)]
  );

  if (rows.length === 0) return null;

  const schedules = await getSchedulesByPlanId(planId);

  return {
    ...rows[0],
    schedules,
  };
}

async function attachSchedulesToPlans(plans) {
  if (!Array.isArray(plans) || plans.length === 0) return [];

  const planIds = plans.map((item) => Number(item.id));
  const placeholders = planIds.map(() => "?").join(",");

  const [scheduleRows] = await db.query(
    `SELECT
       id,
       plan_id,
       schedule_order,
       schedule_date,
       schedule_activity,
       pic_name,
       target_output,
       note,
       created_at,
       updated_at
     FROM pjbl_project_schedules
     WHERE plan_id IN (${placeholders})
     ORDER BY schedule_order ASC, id ASC`,
    planIds
  );

  return plans.map((plan) => ({
    ...plan,
    schedules: scheduleRows.filter(
      (schedule) => Number(schedule.plan_id) === Number(plan.id)
    ),
  }));
}

async function saveSchedules(planId, schedules) {
  const cleanSchedules = normalizeSchedules(schedules);

  await db.query(`DELETE FROM pjbl_project_schedules WHERE plan_id = ?`, [
    Number(planId),
  ]);

  for (let i = 0; i < cleanSchedules.length; i++) {
    const item = cleanSchedules[i];

    await db.query(
      `INSERT INTO pjbl_project_schedules
        (
          plan_id,
          schedule_order,
          schedule_date,
          schedule_activity,
          pic_name,
          target_output,
          note
        )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(planId),
        Number(item.schedule_order || i + 1),
        item.schedule_date || null,
        item.schedule_activity || null,
        item.pic_name || null,
        item.target_output || null,
        item.note || null,
      ]
    );
  }
}

/* ================================
   TEST ROUTE
================================ */

router.get("/test/ping", (req, res) => {
  return res.json({
    message: "Project plan route aktif.",
  });
});

/* ================================
   SIMPAN / UPDATE RENCANA PROYEK
================================ */

router.post("/", async (req, res) => {
  try {
    await ensureProjectPlanTable();

    const {
      user_id,
      pertemuan,
      group_name,
      members_text,
      project_plan,
      project_rules,
      selected_activities,
      tools_materials,
      schedules,
      status,
    } = req.body;

    const activitiesText = normalizeActivitiesText(selected_activities);
    const cleanSchedules = normalizeSchedules(schedules);

    if (!user_id || !pertemuan) {
      return res.status(400).json({
        message: "user_id dan pertemuan wajib diisi.",
      });
    }

    if (!cleanText(group_name)) {
      return res.status(400).json({
        message: "Nama kelompok wajib diisi.",
      });
    }

    if (!cleanText(members_text)) {
      return res.status(400).json({
        message: "Nama anggota wajib diisi.",
      });
    }

    if (!cleanText(project_plan)) {
      return res.status(400).json({
        message: "Rencana proyek wajib diisi.",
      });
    }

    if (!cleanText(project_rules)) {
      return res.status(400).json({
        message: "Aturan proyek wajib diisi.",
      });
    }

    if (!cleanText(activitiesText)) {
      return res.status(400).json({
        message: "Aktivitas proyek wajib diisi.",
      });
    }

    if (!cleanText(tools_materials)) {
      return res.status(400).json({
        message: "Alat dan bahan wajib diisi.",
      });
    }

    if (cleanSchedules.length === 0) {
      return res.status(400).json({
        message: "Minimal satu jadwal proyek wajib diisi.",
      });
    }

    const hasInvalidSchedule = cleanSchedules.some((item) => {
      return !item.schedule_date || !item.schedule_activity;
    });

    if (hasInvalidSchedule) {
      return res.status(400).json({
        message: "Setiap jadwal minimal wajib memiliki tanggal dan aktivitas.",
      });
    }

    const finalStatus = status === "submitted" ? "submitted" : "draft";

    const [existingRows] = await db.query(
      `SELECT id
       FROM pjbl_project_plans
       WHERE user_id = ?
         AND pertemuan = ?
       LIMIT 1`,
      [Number(user_id), Number(pertemuan)]
    );

    let planId = null;
    const columns = await getTableColumns();

    if (existingRows.length > 0) {
      planId = existingRows[0].id;

      if (columns.includes("project_title")) {
        await db.query(
          `UPDATE pjbl_project_plans
           SET group_name = ?,
               project_title = ?,
               members_text = ?,
               project_plan = ?,
               project_rules = ?,
               selected_activities = ?,
               tools_materials = ?,
               status = ?,
               submitted_at = CASE
                 WHEN ? = 'submitted' THEN NOW()
                 ELSE submitted_at
               END,
               updated_at = NOW()
           WHERE id = ?`,
          [
            cleanText(group_name),
            cleanText(group_name),
            cleanText(members_text),
            cleanText(project_plan),
            cleanText(project_rules),
            cleanText(activitiesText),
            cleanText(tools_materials),
            finalStatus,
            finalStatus,
            Number(planId),
          ]
        );
      } else {
        await db.query(
          `UPDATE pjbl_project_plans
           SET group_name = ?,
               members_text = ?,
               project_plan = ?,
               project_rules = ?,
               selected_activities = ?,
               tools_materials = ?,
               status = ?,
               submitted_at = CASE
                 WHEN ? = 'submitted' THEN NOW()
                 ELSE submitted_at
               END,
               updated_at = NOW()
           WHERE id = ?`,
          [
            cleanText(group_name),
            cleanText(members_text),
            cleanText(project_plan),
            cleanText(project_rules),
            cleanText(activitiesText),
            cleanText(tools_materials),
            finalStatus,
            finalStatus,
            Number(planId),
          ]
        );
      }
    } else {
      if (columns.includes("project_title")) {
        const [insertResult] = await db.query(
          `INSERT INTO pjbl_project_plans
            (
              user_id,
              pertemuan,
              group_name,
              project_title,
              members_text,
              project_plan,
              project_rules,
              selected_activities,
              tools_materials,
              status,
              submitted_at
            )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(user_id),
            Number(pertemuan),
            cleanText(group_name),
            cleanText(group_name),
            cleanText(members_text),
            cleanText(project_plan),
            cleanText(project_rules),
            cleanText(activitiesText),
            cleanText(tools_materials),
            finalStatus,
            finalStatus === "submitted" ? new Date() : null,
          ]
        );

        planId = insertResult.insertId;
      } else {
        const [insertResult] = await db.query(
          `INSERT INTO pjbl_project_plans
            (
              user_id,
              pertemuan,
              group_name,
              members_text,
              project_plan,
              project_rules,
              selected_activities,
              tools_materials,
              status,
              submitted_at
            )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(user_id),
            Number(pertemuan),
            cleanText(group_name),
            cleanText(members_text),
            cleanText(project_plan),
            cleanText(project_rules),
            cleanText(activitiesText),
            cleanText(tools_materials),
            finalStatus,
            finalStatus === "submitted" ? new Date() : null,
          ]
        );

        planId = insertResult.insertId;
      }
    }

    await saveSchedules(planId, cleanSchedules);

    const savedData = await getPlanById(planId);

    return res.json({
      message:
        finalStatus === "submitted"
          ? "Rencana dan jadwal proyek berhasil dikirim."
          : "Draft rencana dan jadwal proyek berhasil disimpan.",
      data: savedData,
    });
  } catch (err) {
    console.error("SAVE PROJECT PLAN ERROR:", err);
    return res.status(500).json({
      message: "Gagal menyimpan rencana proyek.",
      error: err.message,
    });
  }
});

/* ================================
   SISWA: LIHAT SEMUA RENCANA
================================ */

router.get("/siswa/:user_id", async (req, res) => {
  try {
    await ensureProjectPlanTable();

    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id wajib dikirim.",
      });
    }

    const [rows] = await db.query(
      `SELECT *
       FROM pjbl_project_plans
       WHERE user_id = ?
       ORDER BY pertemuan ASC, updated_at DESC`,
      [Number(user_id)]
    );

    const plansWithSchedules = await attachSchedulesToPlans(rows);

    return res.json({
      message: "Daftar rencana proyek siswa berhasil diambil.",
      data: plansWithSchedules,
    });
  } catch (err) {
    console.error("GET STUDENT PROJECT PLANS ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar rencana proyek siswa.",
      error: err.message,
    });
  }
});

/* ================================
   GURU: LIHAT SEMUA RENCANA PROYEK
================================ */

router.get("/guru/all/list", async (req, res) => {
  try {
    await ensureProjectPlanTable();

    const [rows] = await db.query(
      `SELECT
         pp.*,
         u.name AS student_name
       FROM pjbl_project_plans pp
       LEFT JOIN users u ON pp.user_id = u.id
       ORDER BY pp.updated_at DESC`
    );

    const plansWithSchedules = await attachSchedulesToPlans(rows);

    return res.json({
      message: "Daftar rencana proyek berhasil diambil.",
      data: plansWithSchedules,
    });
  } catch (err) {
    console.error("GET ALL PROJECT PLANS ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar rencana proyek.",
      error: err.message,
    });
  }
});

/* ================================
   AMBIL RENCANA PROYEK SISWA PER PERTEMUAN
================================ */

router.get("/:user_id/:pertemuan", async (req, res) => {
  try {
    await ensureProjectPlanTable();

    const { user_id, pertemuan } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM pjbl_project_plans
       WHERE user_id = ?
         AND pertemuan = ?
       LIMIT 1`,
      [Number(user_id), Number(pertemuan)]
    );

    if (rows.length === 0) {
      return res.json({
        message: "Data rencana proyek berhasil diambil.",
        data: null,
      });
    }

    const detail = await getPlanById(rows[0].id);

    return res.json({
      message: "Data rencana proyek berhasil diambil.",
      data: detail,
    });
  } catch (err) {
    console.error("GET PROJECT PLAN ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengambil rencana proyek.",
      error: err.message,
    });
  }
});

module.exports = router;