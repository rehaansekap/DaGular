import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import MateriList from "./pages/materi/MateriList";
import MateriDetail from "./pages/materi/MateriDetail";
import Proyek from "./components/Proyek";
import QuizList from "./pages/quiz/QuizList";
import QuizPage from "./pages/quiz/QuizPage";
import QuizResult from "./pages/quiz/QuizResult";
import QuizNilaiSaya from "./pages/quiz/QuizNilaiSaya";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardGuru from "./pages/DashboardGuru";
import KelolaMateri from "./pages/guru/KelolaMateri";
import KelolaProyek from "./pages/guru/KelolaProyek";
import KelolaQuizGuru from "./pages/guru/KelolaQuiz";
import NilaiQuizGuru from "./pages/guru/NilaiQuizGuru";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function GuruRoute({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "guru") return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />

          <Route path="/dashboard-guru" element={<ProtectedRoute><GuruRoute><DashboardGuru /></GuruRoute></ProtectedRoute>} />
          <Route path="/guru/materi" element={<ProtectedRoute><GuruRoute><KelolaMateri /></GuruRoute></ProtectedRoute>} />
          <Route path="/guru/proyek" element={<ProtectedRoute><GuruRoute><KelolaProyek /></GuruRoute></ProtectedRoute>} />
          <Route path="/guru/quiz" element={<ProtectedRoute><GuruRoute><KelolaQuizGuru /></GuruRoute></ProtectedRoute>} />
          <Route path="/guru/nilai-quiz" element={<ProtectedRoute><GuruRoute><NilaiQuizGuru /></GuruRoute></ProtectedRoute>} />

          <Route path="/materi" element={<ProtectedRoute><MateriList /></ProtectedRoute>} />
          <Route path="/materi/:id" element={<ProtectedRoute><MateriDetail /></ProtectedRoute>} />

          <Route path="/quiz" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/quiz/result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
          <Route path="/quiz/nilai-saya" element={<ProtectedRoute><QuizNilaiSaya /></ProtectedRoute>} />

          <Route path="/proyek" element={<ProtectedRoute><Proyek /></ProtectedRoute>} />

          <Route
            path="*"
            element={
              <div className="not-found-page">
                <h2>Halaman tidak ditemukan</h2>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;