import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://178.128.209.29:5000").replace(/\/$/, "");

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("siswa");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Semua field wajib diisi");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      alert("Konfirmasi password tidak sama");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registrasi berhasil! Silakan login.");
        navigate("/login");
      } else {
        alert(data.message || "Registrasi gagal");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Daftar Akun</h2>

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
        </select>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>

        <p style={{ marginTop: "15px" }}>
          Sudah punya akun?{" "}
          <span
            style={{ color: "#f4c27a", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}