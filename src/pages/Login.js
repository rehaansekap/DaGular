import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../style/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/auth/login`,
        { email, password }
      );

      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "guru") {
        navigate("/dashboard-guru");
      } else {
        navigate("/");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <form className="login-card" onSubmit={handleLogin}>

        <h2>Login E-Learning</h2>
        <p className="subtitle">Masuk untuk melanjutkan belajar</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Login"}
        </button>

        <p className="register-text">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>

      </form>

    </div>
  );
}