const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "web_dkv",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// test koneksi database
async function testConnection() {
  try {

    const connection = await db.getConnection();

    console.log("Database terkoneksi");

    connection.release();

  } catch (err) {

    console.error("Database gagal konek:", err.message);

  }
}

testConnection();

module.exports = db;