-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 14, 2026 at 04:07 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `web_dkv`
--

-- --------------------------------------------------------

--
-- Table structure for table `karya`
--

CREATE TABLE `karya` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `karya`
--

INSERT INTO `karya` (`id`, `project_id`, `user_id`, `image_path`, `created_at`) VALUES
(4, 2, 1, 'http://localhost:5000/uploads/1776656220919-mind map menanam pohon (1).jpg', '2026-04-20 03:37:00');

-- --------------------------------------------------------

--
-- Table structure for table `komentar_karya`
--

CREATE TABLE `komentar_karya` (
  `id` int(11) NOT NULL,
  `karya_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `komentar` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `komentar_karya`
--

INSERT INTO `komentar_karya` (`id`, `karya_id`, `user_id`, `komentar`, `created_at`) VALUES
(1, 4, 3, 'Mind mappingnya bagus, sesuai, dan rapi.', '2026-04-20 03:59:41');

-- --------------------------------------------------------

--
-- Table structure for table `materi`
--

CREATE TABLE `materi` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `pertemuan` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materi`
--

INSERT INTO `materi` (`id`, `judul`, `pertemuan`, `created_by`, `created_at`) VALUES
(10, 'Pengantar Desain Digital dan Elemen Dasar Desain', 1, 2, '2026-05-01 17:53:28'),
(11, 'Proses Kreatif: Ideasi & Eksplorasi Desain', 2, 2, '2026-05-11 03:20:22'),
(12, 'Eksplorasi Layout dan Strategi Komunikasi Visual Digital', 3, 2, '2026-05-12 06:21:21'),
(13, 'Justifikasi Profesional dan Evaluasi Desain Digital', 4, 2, '2026-05-12 13:41:19');

-- --------------------------------------------------------

--
-- Table structure for table `materi_konten`
--

CREATE TABLE `materi_konten` (
  `id` int(11) NOT NULL,
  `materi_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `urutan` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materi_konten`
--

INSERT INTO `materi_konten` (`id`, `materi_id`, `type`, `title`, `body`, `url`, `urutan`) VALUES
(18, 10, 'genially', 'Mengenal Desain Digital & Komputer Grafis', NULL, 'https://view.genially.com/69ca2286253cb2dd5173d192', 1),
(19, 11, 'genially', 'Proses Ideasi Desain Digital', NULL, 'https://view.genially.com/69f0af2b436c245a60068110', 1),
(20, 12, 'genially', 'Eksplorasi Layout & Strategi Visual', NULL, 'https://view.genially.com/6a01b94982f02a71daeb3359', 1),
(21, 13, 'genially', 'Finishing & Final Quality Control', NULL, 'https://view.genially.com/6a02e5f074bbebf9347bc1b7', 1);

-- --------------------------------------------------------

--
-- Table structure for table `proyek`
--

CREATE TABLE `proyek` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `pertemuan` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proyek`
--

INSERT INTO `proyek` (`id`, `judul`, `pertemuan`, `created_by`, `created_at`) VALUES
(2, 'Mind Mapping', 2, 2, '2026-04-20 03:05:59'),
(3, 'Sketsa Kasar Sesuai Mind Mapping', 2, 2, '2026-04-20 03:06:55'),
(5, 'Digital Trace', 2, 2, '2026-05-20 11:59:48'),
(6, 'Eksplorasi Variasi Digital', 3, 2, '2026-05-20 12:00:19'),
(7, 'Finishing', 4, 2, '2026-05-20 12:00:51');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `question` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `pertemuan` int(11) DEFAULT NULL,
  `stage_order` int(11) DEFAULT 1,
  `is_required` tinyint(1) DEFAULT 1,
  `max_score` int(11) DEFAULT 4,
  `passing_score` int(11) DEFAULT 3,
  `answer_type` enum('text','image','text_image') DEFAULT 'text',
  `pendahuluan_lkpd` text DEFAULT NULL,
  `judul_lkpd` varchar(255) DEFAULT NULL,
  `answer_fields` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `question`, `image_url`, `created_at`, `pertemuan`, `stage_order`, `is_required`, `max_score`, `passing_score`, `answer_type`, `pendahuluan_lkpd`, `judul_lkpd`, `answer_fields`) VALUES
(31, 'Tugas 1:\r\nPetunjuk Pengerjaan:\r\n1. Bacalah situasi/studi kasus di bawah ini dengan saksama.\r\n2. Analisis kebutuhan klien berdasarkan narasi yang diberikan.\r\n3. Isilah kolom komponen Design Brief yang tersedia di bagian bawah berdasarkan hasil analisismu!\r\n\r\nSituasi / Studi Kasus:\r\n\"Pihak manajemen sekolah ingin mengadakan sebuah kampanye hemat air di lingkungan SMK. Masalah utama yang sering terjadi adalah banyaknya siswa yang sering lupa dan membiarkan keran air tetap terbuka di kamar mandi setelah digunakan.\r\n\r\nUntuk mengatasi hal ini, sekolah berencana menempelkan sebuah poster cetak di setiap pintu toilet. Pihak sekolah memberikan tantangan bahwa poster tersebut harus bisa menyampaikan pesan secara instan (langsung dipahami dalam waktu kurang dari 5 detik) karena posisi audiens hanya melintas. Selain itu, gaya bahasa dan visual desain tidak boleh menggunakan kata-kata yang menggurui, galak, atau bernada ancaman agar para siswa tidak merasa terbebani dan mau berubah atas kesadaran sendiri.\r\n\r\nCatatan Waktu: Proyek ini adalah latihan di kelas, jadi tentukan sendiri berapa jam atau berapa hari kamu butuh waktu untuk coret-coret ide sampai desain gambarmu selesai di komputer/HP.\"', NULL, '2026-04-29 06:50:05', 1, 1, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Project Overview. Apa nama proyek ini dan masalah utama apa yang ingin diselesaikan?\",\"2. Category/Industry. Di bidang apa proyek ini berjalan? (Pendidikan, Komersial, atau Sosial?).\",\"3. Goals/Objectives. Perubahan perilaku apa yang diinginkan sekolah setelah siswa melihat poster ini?\",\"4. Target Audience. Siapa sasaran utamanya? Bagaimana karakteristik/usia mereka?\",\"5. The Message. Apa pesan kunci atau slogan utama yang harus menonjol?\",\"6. Deliverables. Apa output fisik desainnya dan di mana lokasi penempatannya?\",\"7. Timeline. Kapan desain ini harus selesai?\",\"8. Constraints. Apa saja batasan atau tantangan teknis yang harus diperhatikan dalam desain ini?\"]'),
(33, 'Tugas 2: Analisis Kritis\r\nAmatilah gambar poster dibawah (Poster yang memiliki masalah visual clutter atau pesan yang tidak jelas).\r\nLangkah 1: Memahami Konteks Desain.\r\nLangkah 2: Observasi Visual (Elemen & Prinsip).\r\nLangkah 3: Evaluasi Hierarki Visual.\r\nLangkah 4: Identifikasi Masalah.', 'http://localhost:5000/uploads/quiz/1777457736929-733642266.jpg', '2026-04-29 10:15:38', 1, 2, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Apa tujuan desain tersebut?\",\"2. Siapa target audiensnya?\",\"3. Apa elemen yang dominan (warna, tipografi, layout, dll):\",\"4. Bagian yang paling pertama menarik perhatian:\",\"5. Apakah pesan utama yang langsung terlihat? Jelaskan.\",\"6. Bagian mana yang membingungkan?\",\"7. Sebutkan 3 masalah pada elemen desainnya:\",\"8. Sebutkan 3 masalah pada prinsip desainnya (kontras, keseimbangan, dll):\",\"9. Sebutkan 3 masalah menurut hierarki visual:\"]'),
(34, 'Tugas 3: Rekomendasi Perbaikan\r\nSebagai seorang desainer yang bertugas melakukan \'Redesign\', berikan solusi teknis untuk memperbaiki kegagalan komunikasi pada poster di Tugas 2. Jelaskan apa yang diubah dan mengapa perubahan itu penting secara fungsi desain.', NULL, '2026-04-29 10:17:52', 1, 3, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Perbaikan dan Alasan mengenai Aspek Tata Letak (Layout):\",\"2. Perbaikan dan Alasan mengenai Aspek Tipografi:\",\"3. Perbaikan dan Alasan mengenai Aspek Warna:\"]'),
(35, 'Tugas 4: Ide Awal Desain\r\nBerdasarkan hasil analisis, buatlah ide singkat desain baru untuk tema yang sama seperti poster pada Tugas 2:', NULL, '2026-04-29 10:19:45', 1, 4, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Konsep Desain:\",\"2. Pesan Utama:\",\"3. Gaya Visual (misal: minimalis, formal, ceria):\"]'),
(36, 'E. Instrumen Penilaian (Self-Reflection)\nJawablah pertanyaan berikut:', NULL, '2026-04-29 10:48:05', 1, 5, 0, 0, 0, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Apa hal terpenting yang harus diketahui sebelum mendesain?\",\"2. Mengapa sebuah desain yang \\\"indah\\\" belum tentu disebut desain yang \\\"berhasil\\\"?\",\"3. Apa kesulitan yang kamu alami saat menganalisis desain?\"]'),
(37, 'Tugas 1: Design Brief \r\nInstruksi: Sebagai desainer, Anda diminta merancang poster kampanye \"Kebersihan Kantin Sekolah\" berdasarkan batasan proyek berikut:\r\n\r\nPoster ini nantinya akan dicetak fisik (ukuran A3) dan ditempel langsung di dinding area makan kantin sekolah. Target utamanya adalah sesama siswa yang sedang makan, sehingga bahasanya harus menggunakan nada ajakan yang ramah, santai, dan ceria (tidak boleh kaku atau menggurui). Karena ditempatkan di area makan, visualnya harus menggunakan warna-warna terang yang berkesan bersih, segar, dan tidak mematikan selera makan (hindari warna gelap/kotor). Poster juga wajib menyertakan logo sekolah dan ilustrasi ajakan membuang sampah.\r\n\r\nBerdasarkan batasan proyek di atas, lengkapilah elemen Design Brief di bawah ini!', NULL, '2026-05-12 14:40:13', 2, 1, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\r\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\r\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\r\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\r\n\r\nB. Media/Alat, Bahan, dan Sumber Belajar\r\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\r\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\r\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\r\n\r\nC. Landasan Teori\r\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\r\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\r\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\r\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).\r\n• Elaboration: Kemampuan mengembangkan ide menjadi rancangan yang lebih rinci melalui penambahan detail visual, susunan komposisi, ikon, teks, warna, dan elemen pendukung lainnya.', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '[\"1. Project Overview:\",\"2. Tujuan:\",\"3. Target Audiens:\",\"4. Pesan Utama:\",\"5. Tone & Mood (Nuansa, Warna)\",\"6. Elemen Wajib (Visual, Identitas):\",\"7. Spesifikasi Teknis (Output Media, Ukuran, Software):\"]'),
(38, '2. Mind Mapping Area \n(Gambarkan lingkaran di tengah dengan tulisan \"Kebersihan Kantin\", lalu tarik garis cabang untuk menuliskan kata kunci sebanyak mungkin).', NULL, '2026-05-12 14:41:07', 2, 2, 1, 4, 3, 'image', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\n\nB. Media/Alat, Bahan, dan Sumber Belajar\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\n\nC. Landasan Teori\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '1. Mind Mapping:'),
(39, '3. Thumbnail Sketches \nBuatlah 3 sketsa secara kasar pada kotak di bawah ini!', NULL, '2026-05-12 14:42:17', 2, 3, 1, 4, 3, 'image', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\n\nB. Media/Alat, Bahan, dan Sumber Belajar\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\n\nC. Landasan Teori\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '1. Thumbnail Sketches'),
(40, 'E. Instrumen Penilaian (Self-Reflection)\r\nJawablah dengan jujur sesuai dengan apa yang Anda rasakan setelah proses ideasi:', NULL, '2026-05-12 14:43:26', 2, 4, 0, 0, 0, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\n\nB. Media/Alat, Bahan, dan Sumber Belajar\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\n\nC. Landasan Teori\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '[\"1. Berapa banyak kata kunci yang berhasil Anda temukan di Mind Mapping?\",\"2. Dari 3 sketsa yang dibuat, manakah yang menurut Anda paling unik dan tidak terpikirkan oleh teman lain? Jelaskan singkat alasannya!\",\"3. Apa kendala utama Anda saat mencoba mencari ide yang berbeda-beda (Flexibility)?\"]'),
(41, 'Tugas 1: Eksplorasi Variasi Digital (Indikator: Flexibility)\r\nBuka file CorelDRAW hasil Digital Trace pertemuan kemarin (Nama_Kelas_Pertemuan2_DigitalTrace.cdr). Buatlah 2 halaman (Page) yang berbeda di dalam file tersebut dengan ketentuan kontras secara ekstrem:\r\n\r\n1. Halaman 1 - Variasi 1 (Image Dominant): Fokuskan komposisi pada gambar/ilustrasi utama dengan ukuran yang sangat besar. Teks/tipografi diletakkan dengan ukuran lebih kecil sebagai pendukung visual.\r\n2. Halaman 2 - Variasi 2 (Text Dominant): Fokuskan komposisi pada tipografi judul (headline) yang sangat besar, tebal, dan berani. Gambar ilustrasi hanya digunakan sebagai aksen kecil, pemanis, atau latar belakang.', NULL, '2026-05-12 17:09:27', 3, 1, 1, 4, 3, 'image', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi minimal dua variasi tata letak digital yang berbeda secara ekstrem dari satu sketsa terbaik.\n2. Peserta didik mampu menerapkan prinsip hierarki visual agar pesan utama tetap tersampaikan dalam berbagai variasi komposisi. \n3. Peserta didik mampu memberikan alasan logis (justifikasi) atas pemilihan elemen visual yang digunakan.\n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: Hasil sketsa terbaik dari Pertemuan 2.\n• Sumber Belajar: Modul \"Eksplorasi Layout & Justifikasi Profesional\".\n\nC. Landasan Teori (Ringkasan)\n• Eksplorasi Layout: Proses mengembangkan satu ide menjadi beberapa alternatif tata letak tanpa mengubah pesan utamanya.\n• Hierarki Visual: Pengaturan urutan elemen desain agar audiens tahu mana yang harus dilihat pertama, kedua, dan seterusnya.\n• Justifikasi Desain: Penjelasan rasional mengapa sebuah elemen (warna, font, posisi) dipilih. Desain yang baik bukan soal \"suka/tidak suka\", tapi \"efektif/tidak efektif\".', 'LKPD 3: EKSPLORASI LAYOUT & JUSTIFIKASI PROFESIONAL', '[\"1. Variasi 1 (Image Dominant):\",\"2. Variasi 2 (Text Dominant):\"]'),
(42, 'Tugas 2: Justifikasi Profesional (Indikator: Elaboration)\r\nSetelah selesai membuat dua variasi di CorelDRAW, pilihlah satu variasi terbaik menurut Anda. Berikan penjelasan logis dan argumen desain Anda sendiri secara mandiri pada kolom di bawah ini:\r\nRumus Justifikasi: > \"Saya menggunakan [Elemen Visual] karena ingin menyampaikan kesan [Identitas Pesan] agar audiens merasa [Efek Psikologis].\"', NULL, '2026-05-12 17:10:30', 3, 2, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi minimal dua variasi tata letak digital yang berbeda secara ekstrem dari satu sketsa terbaik.\n2. Peserta didik mampu menerapkan prinsip hierarki visual agar pesan utama tetap tersampaikan dalam berbagai variasi komposisi. \n3. Peserta didik mampu memberikan alasan logis (justifikasi) atas pemilihan elemen visual yang digunakan.\n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: Hasil sketsa terbaik dari Pertemuan 2.\n• Sumber Belajar: Modul \"Eksplorasi Layout & Justifikasi Profesional\".\n\nC. Landasan Teori (Ringkasan)\n• Eksplorasi Layout: Proses mengembangkan satu ide menjadi beberapa alternatif tata letak tanpa mengubah pesan utamanya.\n• Hierarki Visual: Pengaturan urutan elemen desain agar audiens tahu mana yang harus dilihat pertama, kedua, dan seterusnya.\n• Justifikasi Desain: Penjelasan rasional mengapa sebuah elemen (warna, font, posisi) dipilih. Desain yang baik bukan soal \"suka/tidak suka\", tapi \"efektif/tidak efektif\".', 'LKPD 3: EKSPLORASI LAYOUT & JUSTIFIKASI PROFESIONAL', '[\"1. Justifikasi Warna:\",\"2. Justifikasi Tipografi (Font):\",\"3. Justifikasi Komposisi:\"]'),
(43, 'Tugas 1: Professional Finishing \r\nBuka kembali file CorelDRAW dari Pertemuan 3. Pilihlah satu variasi layout terbaik (apakah yang dominan ilustrasi atau dominan teks) untuk masuk ke tahap penyempurnaan (finishing). Lalu jawab dengan Ya atau Tidak untuk setiap pertanyaannya.', NULL, '2026-05-12 17:19:57', 4, 1, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu menyempurnakan (finishing) desain poster dengan ketelitian pada detail teknis (kerning, spasi, dan margin). \n2. Peserta didik mampu melakukan ekspor file ke dalam format yang tepat (JPG/PDF) sesuai kebutuhan. \n3. Peserta didik mampu memberikan kritik membangun dan apresiasi terhadap karya teman berdasarkan prinsip komunikasi visual. \n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: File desain variasi terbaik dari Pertemuan 3.\n• Sumber Belajar: Website pembelajaran di Modul \"Finishing & Design Critique\".\n\nC. Landasan Teori (Ringkasan)\n• Finishing: Tahap memastikan desain siap dikonsumsi publik. Fokus pada hal kecil seperti Kerning (jarak antar huruf) dan Leading (jarak antar baris).\n• Final Quality Control: Pengecekan akhir untuk menghindari kesalahan ketik (typo) atau elemen yang terpotong.\n• Design Critique: Proses diskusi profesional untuk meningkatkan kualitas karya, bukan untuk menjatuhkan desainer.', 'LKPD 4: FINISHING & DESIGN CRITIQUE', '[\"1. Kerning: Jarak antar huruf pada judul sudah nyaman dibaca (tidak terlalu rapat/renggang).\",\"2. Margin/Safe Zone: Tidak ada teks atau logo yang terlalu mepet ke pinggir kanvas.\",\"3. Kontras Warna: Teks terbaca jelas di atas latar belakang.\",\"4. Format File: Ekspor karya final dengan format JPG (Resolusi 300 DPI) dan berikan nama file: NamaSiswa_PosterKebersihanKantin_Final.jpg.\"]'),
(44, 'Tugas 2: Design Critique (Indikator: Evaluation)\nSilakan buka website pembelajaran dan unggah file poster finalmu (JPG) pada galeri yang tersedia. Pilih karya salah satu temanmu, sebelum menuliskan komentar di website, susunlah draf kritikmu di bawah ini agar masukan yang kamu berikan lebih profesional dan terstruktur. Setelah draf di atas selesai, salin (ketik ulang) draf tersebut ke kolom komentar di bawah karya temanmu pada website.', NULL, '2026-05-12 17:25:35', 4, 2, 1, 4, 3, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu menyempurnakan (finishing) desain poster dengan ketelitian pada detail teknis (kerning, spasi, dan margin). \n2. Peserta didik mampu melakukan ekspor file ke dalam format yang tepat (JPG/PDF) sesuai kebutuhan. \n3. Peserta didik mampu memberikan kritik membangun dan apresiasi terhadap karya teman berdasarkan prinsip komunikasi visual. \n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: File desain variasi terbaik dari Pertemuan 3.\n• Sumber Belajar: Website pembelajaran di Modul \"Finishing & Design Critique\".\n\nC. Landasan Teori (Ringkasan)\n• Finishing: Tahap memastikan desain siap dikonsumsi publik. Fokus pada hal kecil seperti Kerning (jarak antar huruf) dan Leading (jarak antar baris).\n• Final Quality Control: Pengecekan akhir untuk menghindari kesalahan ketik (typo) atau elemen yang terpotong.\n• Design Critique: Proses diskusi profesional untuk meningkatkan kualitas karya, bukan untuk menjatuhkan desainer.', 'LKPD 4: FINISHING & DESIGN CRITIQUE', '[\"1. Apresiasi (Apa yang menarik?):\",\"2. Analisis Masalah (Apa yang kurang efektif?):\",\"3. Saran Perbaikan (Solusi konkret):\"]'),
(45, 'E. Self-Reflection\nJawablah dengan jujur setelah mengerjakan tugas pada pertemuan 3 ini.', NULL, '2026-05-20 04:28:33', 3, 3, 0, 0, 0, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi minimal dua variasi tata letak digital yang berbeda secara ekstrem dari satu sketsa terbaik.\n2. Peserta didik mampu menerapkan prinsip hierarki visual agar pesan utama tetap tersampaikan dalam berbagai variasi komposisi. \n3. Peserta didik mampu memberikan alasan logis (justifikasi) atas pemilihan elemen visual yang digunakan.\n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: Hasil sketsa terbaik dari Pertemuan 2.\n• Sumber Belajar: Modul \"Eksplorasi Layout & Justifikasi Profesional\".\n\nC. Landasan Teori (Ringkasan)\n• Eksplorasi Layout: Proses mengembangkan satu ide menjadi beberapa alternatif tata letak tanpa mengubah pesan utamanya.\n• Hierarki Visual: Pengaturan urutan elemen desain agar audiens tahu mana yang harus dilihat pertama, kedua, dan seterusnya.\n• Justifikasi Desain: Penjelasan rasional mengapa sebuah elemen (warna, font, posisi) dipilih. Desain yang baik bukan soal \"suka/tidak suka\", tapi \"efektif/tidak efektif\".', 'LKPD 3: EKSPLORASI LAYOUT & JUSTIFIKASI PROFESIONAL', '[\"1. Manakah yang lebih sulit: Mencari ide di atas kertas (Pertemuan 2) atau mengembangkan variasi tata letak di komputer (Pertemuan 3)? Jelaskan alasannya!\",\"2. Apakah pesan utama kampanye tetap dapat terbaca dan tersampaikan dengan jelas meskipun tata letak elemennya diubah secara ekstrem?\"]'),
(46, 'E. Refleksi Akhir Proses Kreatif\nJawab dengan jujur apa yang dirasakan setelah belajar selama 4 pertemuan ini.', NULL, '2026-05-20 04:34:36', 4, 3, 0, 0, 0, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu menyempurnakan (finishing) desain poster dengan ketelitian pada detail teknis (kerning, spasi, dan margin). \n2. Peserta didik mampu melakukan ekspor file ke dalam format yang tepat (JPG/PDF) sesuai kebutuhan. \n3. Peserta didik mampu memberikan kritik membangun dan apresiasi terhadap karya teman berdasarkan prinsip komunikasi visual. \n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: File desain variasi terbaik dari Pertemuan 3.\n• Sumber Belajar: Website pembelajaran di Modul \"Finishing & Design Critique\".\n\nC. Landasan Teori (Ringkasan)\n• Finishing: Tahap memastikan desain siap dikonsumsi publik. Fokus pada hal kecil seperti Kerning (jarak antar huruf) dan Leading (jarak antar baris).\n• Final Quality Control: Pengecekan akhir untuk menghindari kesalahan ketik (typo) atau elemen yang terpotong.\n• Design Critique: Proses diskusi profesional untuk meningkatkan kualitas karya, bukan untuk menjatuhkan desainer.', 'LKPD 4: FINISHING & DESIGN CRITIQUE', '[\"1. Setelah melewati 4 pertemuan (dari memahami Brief hingga Finishing), ceritakan satu hal paling berharga yang kamu pelajari tentang proses menjadi seorang desainer! Jawaban:\"]');

-- --------------------------------------------------------

--
-- Table structure for table `question_rubrics`
--

CREATE TABLE `question_rubrics` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `field_key` varchar(255) DEFAULT NULL,
  `score` int(11) NOT NULL,
  `keywords` text NOT NULL,
  `min_match` int(11) DEFAULT 1,
  `feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_rubrics`
--

INSERT INTO `question_rubrics` (`id`, `question_id`, `field_key`, `score`, `keywords`, `min_match`, `feedback`, `created_at`) VALUES
(1, 31, 'project_overview_apa_nama_proyek_ini_dan_masalah_utama_apa_yang_ingin_diselesaikan', 4, '[\"hemat air\",\"keran terbuka\",\"lupa tutup keran\",\"boros air\",\"toilet\",\"kamar mandi\",\"sekolah\",\"hemat\",\"siswa\"]', 3, 'Analisis masalah sangat tepat dan lengkap.', '2026-07-08 04:09:40'),
(2, 31, 'project_overview_apa_nama_proyek_ini_dan_masalah_utama_apa_yang_ingin_diselesaikan', 3, '[\"hemat air\",\"keran\",\"toilet\",\"sekolah\"]', 2, 'Masalah sudah benar tetapi masih kurang lengkap.', '2026-07-08 04:09:40'),
(3, 31, 'project_overview_apa_nama_proyek_ini_dan_masalah_utama_apa_yang_ingin_diselesaikan', 2, '[\"hemat air\",\"keran\"]', 1, 'Jawaban masih terlalu umum.', '2026-07-08 04:09:40'),
(4, 31, 'project_overview_apa_nama_proyek_ini_dan_masalah_utama_apa_yang_ingin_diselesaikan', 1, '[\"tidak sesuai\",\"salah\",\"kosong\",\"tidak menjawab\",\"tidak relevan\"]', 1, 'Jawaban tidak sesuai dengan studi kasus.', '2026-07-08 04:09:40'),
(5, 31, 'category_industry_di_bidang_apa_proyek_ini_berjalan_pendidikan_komersial_atau_sosial', 4, '[\"pendidikan\",\"sekolah\",\"smk\",\"kampanye hemat air\",\"lingkungan sekolah\",\"masyarakat\"]', 3, 'Kategori proyek sangat tepat dan sesuai konteks sekolah.', '2026-07-08 09:56:06'),
(6, 31, 'category_industry_di_bidang_apa_proyek_ini_berjalan_pendidikan_komersial_atau_sosial', 3, '[\"pendidikan\",\"sekolah\",\"poster sekolah\"]', 2, 'Kategori sudah benar, tetapi masih bisa dibuat lebih spesifik.', '2026-07-08 09:56:37'),
(7, 31, 'category_industry_di_bidang_apa_proyek_ini_berjalan_pendidikan_komersial_atau_sosial', 2, '[\"sosial\",\"kampanye\",\"lingkungan\"]', 1, 'Jawaban masih umum, tetapi masih berkaitan dengan kampanye.', '2026-07-08 09:57:01'),
(8, 31, 'category_industry_di_bidang_apa_proyek_ini_berjalan_pendidikan_komersial_atau_sosial', 1, '[\"komersial\",\"bisnis\",\"iklan produk\",\"jualan\",\"kosong\",\"tidak sesuai\"]', 1, 'Jawaban kurang sesuai dengan bidang proyek.', '2026-07-08 09:57:34'),
(9, 31, 'goals_objectives_perubahan_perilaku_apa_yang_diinginkan_sekolah_setelah_siswa_melihat_poster_ini', 4, '[\"siswa menutup keran\",\"hemat air\",\"mengurangi pemborosan air\",\"membangun kesadaran\",\"tidak lupa menutup keran\"]', 1, 'Tujuan perubahan perilaku sangat jelas dan sesuai masalah.', '2026-07-08 09:58:02'),
(10, 31, 'goals_objectives_perubahan_perilaku_apa_yang_diinginkan_sekolah_setelah_siswa_melihat_poster_ini', 4, '[\"siswa menutup keran\",\"hemat air\",\"mengurangi pemborosan air\",\"membangun kesadaran\",\"tidak lupa menutup keran\",\"menjaga\"]', 1, 'Tujuan perubahan perilaku sangat jelas dan sesuai masalah.', '2026-07-08 10:31:36'),
(11, 31, 'goals_objectives_perubahan_perilaku_apa_yang_diinginkan_sekolah_setelah_siswa_melihat_poster_ini', 3, '[\"menutup keran\",\"hemat air\",\"sadar menggunakan air\"]', 1, 'Tujuan sudah tepat, tetapi masih kurang lengkap.', '2026-07-08 10:32:03'),
(12, 31, 'goals_objectives_perubahan_perilaku_apa_yang_diinginkan_sekolah_setelah_siswa_melihat_poster_ini', 2, '[\"menjaga air\",\"menghemat\",\"mengurangi boros\"]', 1, 'Tujuan masih terlalu umum.', '2026-07-08 10:32:24'),
(13, 31, 'goals_objectives_perubahan_perilaku_apa_yang_diinginkan_sekolah_setelah_siswa_melihat_poster_ini', 1, '[\"membeli produk\",\"menambah uang\",\"menaikkan penjualan\",\"kosong\",\"tidak menjawab\"]', 1, 'Tujuan tidak sesuai dengan studi kasus.', '2026-07-08 10:32:49'),
(14, 31, 'target_audience_siapa_sasaran_utamanya_bagaimana_karakteristik_usia_mereka', 4, '[\"siswa smk\",\"remaja\",\"pelajar sekolah\",\"pengguna toilet\",\"siswa yang melintas\"]', 1, 'Sasaran audiens sangat tepat dan jelas.', '2026-07-08 10:33:38'),
(15, 31, 'target_audience_siapa_sasaran_utamanya_bagaimana_karakteristik_usia_mereka', 3, '[\"siswa\",\"pelajar\",\"remaja\"]', 2, 'Sasaran sudah benar, tetapi karakteristiknya belum lengkap.', '2026-07-08 10:33:53'),
(16, 31, 'target_audience_siapa_sasaran_utamanya_bagaimana_karakteristik_usia_mereka', 2, '[\"warga sekolah\",\"anak sekolah\",\"orang sekolah\"]', 2, 'Sasaran masih terlalu umum.', '2026-07-08 10:35:32'),
(17, 31, 'target_audience_siapa_sasaran_utamanya_bagaimana_karakteristik_usia_mereka', 1, '[\"orang tua\",\"guru saja\",\"masyarakat umum\",\"pembeli\",\"kosong\",\"tidak sesuai\"]', 1, 'Sasaran audiens tidak sesuai dengan kasus.', '2026-07-08 10:35:56'),
(18, 31, 'the_message_apa_pesan_kunci_atau_slogan_utama_yang_harus_menonjol', 4, '[\"tutup keran\",\"hemat air\",\"jangan biarkan air terbuang\",\"pakai air secukupnya\",\"air berharga\"]', 1, 'Pesan utama jelas, singkat, dan sesuai tujuan poster.', '2026-07-08 10:36:42'),
(19, 31, 'the_message_apa_pesan_kunci_atau_slogan_utama_yang_harus_menonjol', 3, '[\"tutup keran\",\"hemat air\",\"air jangan terbuang\"]', 1, 'Pesan sudah sesuai, tetapi masih bisa dibuat lebih kuat.', '2026-07-08 10:37:31'),
(20, 31, 'the_message_apa_pesan_kunci_atau_slogan_utama_yang_harus_menonjol', 2, '[\"hemat\",\"air\",\"keran\"]', 1, 'Pesan masih terlalu umum.', '2026-07-08 10:37:57'),
(21, 31, 'the_message_apa_pesan_kunci_atau_slogan_utama_yang_harus_menonjol', 1, '[\"dilarang keras\",\"awas dihukum\",\"ancaman\",\"marah\",\"kosong\",\"tidak menjawab\"]', 1, 'Pesan tidak sesuai karena bernada menggurui atau mengancam.', '2026-07-08 10:38:31'),
(22, 31, 'deliverables_apa_output_fisik_desainnya_dan_di_mana_lokasi_penempatannya', 4, '[\"poster cetak\",\"pintu toilet\",\"kamar mandi sekolah\",\"setiap pintu toilet\",\"media cetak\"]', 2, 'Output desain dan lokasi penempatan sangat jelas.', '2026-07-08 10:38:59'),
(23, 31, 'deliverables_apa_output_fisik_desainnya_dan_di_mana_lokasi_penempatannya', 3, '[\"poster\",\"pintu toilet\",\"kamar mandi\"]', 2, 'Output sudah benar, tetapi masih kurang detail.', '2026-07-08 10:39:24'),
(24, 31, 'deliverables_apa_output_fisik_desainnya_dan_di_mana_lokasi_penempatannya', 2, '[\"poster\",\"sekolah\",\"toilet\"]', 1, 'Jawaban masih umum.', '2026-07-08 10:39:50'),
(25, 31, 'deliverables_apa_output_fisik_desainnya_dan_di_mana_lokasi_penempatannya', 1, '[\"video\",\"spanduk besar\",\"iklan tv\",\"website\",\"kosong\",\"tidak sesuai\"]', 1, 'Output desain tidak sesuai dengan permintaan kasus.', '2026-07-08 10:40:07'),
(26, 31, 'timeline_kapan_desain_ini_harus_selesai', 4, '[\"1 hari\",\"2 hari\",\"3 hari\",\"beberapa jam\",\"sketsa\",\"desain selesai\"]', 1, 'Timeline realistis dan sesuai proyek latihan kelas.', '2026-07-08 10:40:44'),
(27, 31, 'timeline_kapan_desain_ini_harus_selesai', 3, '[\"hari\",\"jam\",\"selesai\"]', 1, 'Timeline sudah ada, tetapi masih kurang rinci.', '2026-07-08 10:41:04'),
(28, 31, 'timeline_kapan_desain_ini_harus_selesai', 2, '[\"cepat\",\"segera\",\"nanti\"]', 1, 'Timeline masih terlalu umum.', '2026-07-08 10:41:21'),
(29, 31, 'timeline_kapan_desain_ini_harus_selesai', 1, '[\"tidak tahu\",\"tidak ditentukan\",\"kosong\",\"tidak menjawab\"]', 1, 'Timeline belum jelas.', '2026-07-08 10:41:39'),
(30, 31, 'constraints_apa_saja_batasan_atau_tantangan_teknis_yang_harus_diperhatikan_dalam_desain_ini', 4, '[\"kurang dari 5 detik\",\"mudah dipahami\",\"tidak menggurui\",\"tidak galak\",\"tidak mengancam\",\"audiens melintas\",\"visual sederhana\"]', 1, 'Batasan desain sangat lengkap dan sesuai kasus.', '2026-07-08 10:42:30'),
(31, 31, 'constraints_apa_saja_batasan_atau_tantangan_teknis_yang_harus_diperhatikan_dalam_desain_ini', 3, '[\"5 detik\",\"tidak menggurui\",\"tidak mengancam\",\"mudah dipahami\"]', 1, 'Batasan sudah tepat, tetapi masih bisa lebih lengkap.', '2026-07-08 10:42:48'),
(32, 31, 'constraints_apa_saja_batasan_atau_tantangan_teknis_yang_harus_diperhatikan_dalam_desain_ini', 2, '[\"singkat\",\"jelas\",\"menarik\",\"sederhana\"]', 1, 'Batasan masih umum.', '2026-07-08 10:43:21'),
(33, 31, 'constraints_apa_saja_batasan_atau_tantangan_teknis_yang_harus_diperhatikan_dalam_desain_ini', 1, '[\"banyak teks\",\"galak\",\"ancaman\",\"rumit\",\"kosong\",\"tidak sesuai\"]', 1, 'Batasan tidak sesuai dengan arahan desain.', '2026-07-08 10:43:41'),
(34, 33, 'apa_tujuan_desain_tersebut', 4, '[\"promosi wisata\",\"mempromosikan wisata\",\"iklan tempat wisata\",\"mengenalkan tempat wisata\",\"taman hiburan\",\"kebun binatang\",\"kebun binatang arbuckle\",\"taman safari\",\"menarik pengunjung\",\"mengajak orang datang\",\"menarik wisatawan\",\"liburan ke arbuckle\",\"berkunjung ke arbuckle\",\"arbuckle\"]', 1, 'Tujuan desain sangat tepat dan sesuai isi poster.', '2026-07-11 06:43:59'),
(35, 33, 'apa_tujuan_desain_tersebut', 3, '[\"promosi\",\"mengiklankan\",\"wisata\",\"tempat wisata\",\"jalan-jalan\",\"liburan\",\"rekreasi\",\"pengunjung\",\"mendatangkan orang\",\"taman\",\"kebun\",\"hewan\",\"binatang\"]', 1, 'Tujuan desain sudah tepat, tetapi masih kurang spesifik.', '2026-07-11 06:44:22'),
(36, 33, 'apa_tujuan_desain_tersebut', 2, '[\"iklan\",\"jualan\",\"informasi\",\"kasih tahu\",\"pemberitahuan\",\"pengumuman\",\"acara\",\"event\",\"pameran\",\"poster biasa\"]', 1, 'Jawaban masih umum.', '2026-07-11 06:44:38'),
(37, 33, 'apa_tujuan_desain_tersebut', 1, '[\"pendidikan\",\"belajar\",\"sekolah\",\"tugas sekolah\",\"kampanye sosial\",\"ajakan kebaikan\",\"kebersihan\",\"kesehatan\",\"kosong\",\"tidak tahu\",\"gatau\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Tujuan desain tidak sesuai dengan poster.', '2026-07-11 06:44:57'),
(38, 33, 'siapa_target_audiensnya', 4, '[\"keluarga\",\"keluarga muda\",\"anak-anak\",\"anak kecil\",\"anak sekolah\",\"wisatawan\",\"turis\",\"pelancong\",\"pengunjung\",\"orang tua\",\"bapak ibu\",\"rombongan keluarga\",\"masyarakat umum\",\"semua umur\",\"liburan keluarga\"]', 2, 'Target audiens sangat jelas dan sesuai poster wisata.', '2026-07-11 06:45:18'),
(39, 33, 'siapa_target_audiensnya', 3, '[\"keluarga\",\"anak-anak\",\"anak kecil\",\"pengunjung\",\"orang yang mau liburan\",\"tempat bermain\",\"taman\"]', 1, 'Target audiens sudah benar, tetapi masih kurang lengkap.', '2026-07-11 06:45:35'),
(40, 33, 'siapa_target_audiensnya', 2, '[\"orang umum\",\"semua orang\",\"masyarakat\",\"orang dewasa\",\"wisatawan\",\"turis\",\"publik\",\"khalayak\",\"siapa saja\"]', 1, 'Target audiens masih terlalu umum.', '2026-07-11 06:46:15'),
(41, 33, 'siapa_target_audiensnya', 1, '[\"siswa\",\"pelajar\",\"guru\",\"desainer\",\"orang kantor\",\"pekerja kantor\",\"karyawan\",\"mahasiswa\",\"kosong\",\"tidak tahu\",\"gatau\",\"tidak sesuai\",\"ngasal\",\"salah\"]', 1, 'Target audiens kurang sesuai dengan poster.', '2026-07-11 06:46:43'),
(42, 33, 'apa_elemen_yang_dominan_warna_tipografi_layout_dll', 4, '[\"warna mencolok\",\"warna terang\",\"warna cerah\",\"warna merah\",\"warna biru\",\"warna kuning\",\"ngejreng\",\"kontras\",\"gambar hewan\",\"gambar binatang\",\"ada singa\",\"foto hewan\",\"banyak ilustrasi\",\"banyak gambar\",\"tipografi banyak\",\"tulisan banyak\",\"font banyak\",\"teks penuh\",\"layout padat\",\"layout penuh\",\"tata letak sesak\",\"ramai sekali\",\"penuh komponen\"]', 2, 'Elemen dominan dijelaskan dengan lengkap.', '2026-07-11 06:47:20'),
(43, 33, 'apa_elemen_yang_dominan_warna_tipografi_layout_dll', 3, '[\"warna\",\"warnanya\",\"gambar hewan\",\"gambar binatang\",\"ilustrasi\",\"foto\",\"tulisan banyak\",\"teks banyak\",\"font banyak\",\"layout\",\"tata letak\",\"tampilannya\",\"posisinya\",\"komposisi\"]', 1, 'Elemen dominan sudah terlihat, tetapi masih bisa lebih rinci.', '2026-07-11 06:47:40'),
(44, 33, 'apa_elemen_yang_dominan_warna_tipografi_layout_dll', 2, '[\"warna\",\"gambar\",\"tulisan\",\"teks\",\"font\",\"huruf\",\"desain\",\"background\",\"latar belakang\",\"poster\",\"objek\"]', 1, 'Jawaban masih umum.', '2026-07-11 06:48:00'),
(45, 33, 'apa_elemen_yang_dominan_warna_tipografi_layout_dll', 1, '[\"kosong\",\"tidak tahu\",\"gatau\",\"skip\",\"tidak ada elemen\",\"tidak ada\",\"rapi\",\"bagus\",\"jelek\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban belum menjelaskan elemen visual poster.', '2026-07-11 06:48:20'),
(46, 33, 'bagian_yang_paling_pertama_menarik_perhatian', 4, '[\"headline\",\"judul besar\",\"tulisan besar\",\"teks utama\",\"kata rediscover\",\"rediscover\",\"gambar harimau\",\"foto macan\",\"harimau besar\",\"singa\",\"gambar hewan\",\"gambar binatang\",\"foto hewan besar\",\"warna mencolok\",\"warna terang\",\"warna cerah\",\"background kontras\",\"ngejreng\",\"latar belakang cerah\"]', 1, 'Bagian yang menarik perhatian dijelaskan dengan tepat.', '2026-07-11 06:48:43'),
(47, 33, 'bagian_yang_paling_pertama_menarik_perhatian', 3, '[\"gambar hewan\",\"gambar binatang\",\"foto macan\",\"ilustrasi hewan\",\"judul\",\"judulnya\",\"tulisan besar\",\"kalimat utama\",\"teks paling atas\",\"warna mencolok\",\"warna-warni\",\"warnanya\"]', 1, 'Jawaban sudah benar, tetapi masih kurang rinci.', '2026-07-11 06:49:08'),
(48, 33, 'bagian_yang_paling_pertama_menarik_perhatian', 2, '[\"gambar\",\"foto\",\"ilustrasi\",\"objek\",\"warna\",\"tulisan\",\"teks\",\"font\",\"huruf\",\"atas\",\"tengah\",\"desain\"]', 1, 'Jawaban masih umum.', '2026-07-11 06:49:36'),
(49, 33, 'bagian_yang_paling_pertama_menarik_perhatian', 1, '[\"harga\",\"tiket masuk\",\"diskon\",\"alamat\",\"lokasi\",\"nomor telepon\",\"website\",\"medsos\",\"kosong\",\"tidak tahu\",\"gatau\",\"tidak ada\",\"tidak sesuai\",\"ngasal\",\"salah\"]', 1, 'Jawaban kurang sesuai dengan bagian visual yang paling menonjol.', '2026-07-11 06:49:56'),
(50, 33, 'apakah_pesan_utama_yang_langsung_terlihat_jelaskan', 4, '[\"promosi tempat wisata\",\"mempromosikan wisata\",\"arbuckle\",\"taman hewan arbuckle\",\"kebun binatang arbuckle\",\"wisata keluarga\",\"liburan keluarga\",\"rekreasi keluarga\",\"taman hewan\",\"taman safari\",\"animal theme park\",\"mengajak berkunjung\",\"mengajak liburan\",\"mengundang wisatawan\",\"berkunjung ke arbuckle\"]', 1, 'Pesan utama poster sudah dipahami dengan baik.', '2026-07-11 06:50:25'),
(51, 33, 'apakah_pesan_utama_yang_langsung_terlihat_jelaskan', 3, '[\"promosi\",\"mengiklankan\",\"wisata\",\"tempat wisata\",\"jalan-jalan\",\"liburan\",\"rekreasi\",\"berkunjung\",\"datang ke sini\",\"main ke taman\",\"taman hewan\",\"kebun binatang\",\"kebun hewan\"]', 1, 'Pesan utama sudah benar, tetapi belum terlalu lengkap.', '2026-07-11 06:50:44'),
(52, 33, 'apakah_pesan_utama_yang_langsung_terlihat_jelaskan', 2, '[\"iklan\",\"informasi\",\"pengumuman\",\"pemberitahuan\",\"kasih tahu\",\"tempat\",\"lokasi\",\"acara\",\"event\",\"pameran\",\"poster\"]', 1, 'Pesan utama masih terlalu umum.', '2026-07-11 17:03:32'),
(53, 33, 'apakah_pesan_utama_yang_langsung_terlihat_jelaskan', 1, '[\"kampanye sekolah\",\"belajar kelompok\",\"hemat air\",\"jaga lingkungan\",\"buang sampah\",\"produk makanan\",\"jualan baju\",\"lowongan kerja\",\"kosong\",\"tidak tahu\",\"gatau\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Pesan utama tidak sesuai dengan isi poster.', '2026-07-11 17:04:05'),
(54, 33, 'bagian_mana_yang_membingungkan', 4, '[\"terlalu banyak teks\",\"kebanyakan tulisan\",\"informasi berlebihan\",\"font kecil\",\"tulisan kekecilan\",\"teks terlalu kecil\",\"informasi bertumpuk\",\"tulisan menumpuk\",\"data campur aduk\",\"layout penuh\",\"tata letak sesak\",\"posisi mepet\",\"ramai banget\",\"penuh komponen\",\"pesan tidak jelas\",\"maksudnya tidak tahu\",\"alurnya membingungkan\",\"sulit dibaca\",\"pusing membacanya\",\"susah dipahami\",\"tidak kelihatan\"]', 2, 'Bagian yang membingungkan dijelaskan dengan tepat.', '2026-07-11 17:04:47'),
(55, 33, 'bagian_mana_yang_membingungkan', 3, '[\"banyak teks\",\"tulisan banyak\",\"teks padat\",\"font kecil\",\"tulisan kecil\",\"kekecilan\",\"tidak jelas\",\"sulit dibaca\",\"susah dibaca\",\"pusing bacanya\",\"membingungkan\",\"alurnya acak\",\"informasi penuh\"]', 1, 'Jawaban sudah benar, tetapi masih kurang lengkap.', '2026-07-11 17:05:11'),
(56, 33, 'bagian_mana_yang_membingungkan', 2, '[\"ramai\",\"penuh\",\"padat\",\"sesak\",\"bingung\",\"pusing\",\"berantakan\",\"acak-acakan\",\"jelek\",\"tidak rapi\",\"tidak tahu\",\"semuanya\",\"gambarnya\",\"warnanya\",\"tulisannya\"]', 1, 'Jawaban masih terlalu umum.', '2026-07-11 17:05:31'),
(57, 33, 'bagian_mana_yang_membingungkan', 1, '[\"jelas semua\",\"mudah dibaca\",\"tidak membingungkan\",\"sudah bagus\",\"sudah rapi\",\"aman\",\"tidak ada masalah\",\"oke\",\"keren\",\"menarik\",\"kosong\",\"gatau\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\"]', 1, 'Jawaban belum menunjukkan masalah pada poster.', '2026-07-11 17:05:49'),
(58, 33, 'sebutkan_3_masalah_pada_elemen_desainnya', 4, '[\"warna terlalu banyak\",\"warna ramai\",\"warna pusing\",\"warna tabrakan\",\"warna mencolok\",\"warna norak\",\"warna ngejreng\",\"warna-warni\",\"tidak nyambung\",\"tipografi tidak konsisten\",\"font beda\",\"font ganti\",\"font acak\",\"font banyak\",\"tulisan berubah\",\"jenis tulisan campur aduk\",\"tidak rapi\",\"kurang serasi\",\"font kecil\",\"tulisan kecil\",\"teks kecil\",\"kekecilan\",\"kurang besar\",\"tidak kelihatan\",\"susah dibaca\",\"samar\",\"tidak jelas\",\"gambar terlalu ramai\",\"gambar banyak\",\"gambar numpuk\",\"gambar berantakan\",\"kebanyakan gambar\",\"visual ramai\",\"penuh gambar\",\"objek padat\",\"layout padat\",\"tata letak penuh\",\"layout sesak\",\"tampilan penuh\",\"posisi mepet\",\"komponen dekat\",\"menumpuk\",\"berantakan\",\"tidak teratur\",\"ruang kosong kurang\",\"ruang sempit\",\"ruang dikit\",\"kurang space\",\"tidak ada sela\",\"kurang jarak\",\"kemepetan\",\"tidak ada tempat bernapas\"]', 2, 'Masalah elemen desain dijelaskan lengkap.', '2026-07-11 17:12:28'),
(59, 33, 'sebutkan_3_masalah_pada_elemen_desainnya', 3, '[\"desain kurang bagus\",\"desain jelek\",\"kurang rapi\",\"kurang menarik\",\"desain biasa saja\",\"ada yang kurang\",\"kurang estetik\",\"kurang pas\",\"penataan kurang\",\"warnanya aneh\",\"warnanya kurang cocok\",\"tulisan kurang jelas\",\"gambarnya kurang pas\",\"layout biasa saja\",\"kelihatan berantakan\",\"masih acak-acakan\",\"kurang profesional\",\"membingungkan\",\"sulit dipahami\",\"butuh perbaikan\",\"perlu diubah\",\"kurang maksimal\"]', 2, 'Masalah elemen desain sudah benar, tetapi belum lengkap.', '2026-07-11 17:13:12'),
(60, 33, 'sebutkan_3_masalah_pada_elemen_desainnya', 2, '[\"desain bagus\",\"sudah oke\",\"keren\",\"menarik\",\"lumayan\",\"jelek\",\"tidak suka\",\"biasa saja\",\"tidak tahu\",\"bingung\",\"malas mikir\",\"tidak rapi\",\"acak-acakan\",\"hancur\",\"kurang\",\"tidak menarik\",\"tidak tahu bagian mana\",\"asal-asalan\",\"tidak paham desain\",\"pusing melihatnya\"]', 1, 'Jawaban masih umum.', '2026-07-11 17:14:31'),
(61, 33, 'sebutkan_3_masalah_pada_elemen_desainnya', 1, '[\"tidak tahu\",\"tidak mengisi\",\"kosong\",\"gatau\",\"skip\",\"pas\",\"tes\",\"pencet\",\"ngasal\",\"typo\",\"tidak ada\",\"bukan\",\"salah\",\"tidak nyambung\",\"blablabla\",\"tanda tanya\",\"titik\",\"strip\",\"ya\",\"tidak\",\"oke\",\"aman\"]', 1, 'Jawaban belum menyebutkan masalah elemen desain.', '2026-07-11 17:15:28'),
(62, 33, 'sebutkan_3_masalah_pada_prinsip_desainnya_kontras_keseimbangan_dll', 4, '[\"kontras berlebihan\",\"kontras kurang\",\"warna tabrakan\",\"tidak kelihatan\",\"terlalu mencolok\",\"keseimbangan buruk\",\"tidak seimbang\",\"berat sebelah\",\"miring\",\"tidak simetris\",\"alignment tidak rapi\",\"tidak lurus\",\"tidak rata\",\"berantakan\",\"menumpuk\",\"proximity buruk\",\"terlalu mepet\",\"terlalu jauh\",\"berjauhan\",\"tidak berkelompok\",\"emphasis tidak jelas\",\"penekanan kurang\",\"tidak ada fokus\",\"mana yang penting\",\"kesatuan kurang\",\"tidak menyatu\",\"tidak serasi\",\"acak-acakan\",\"campur aduk\"]', 2, 'Masalah prinsip desain dijelaskan dengan sangat baik.', '2026-07-12 03:36:57'),
(63, 33, 'sebutkan_3_masalah_pada_prinsip_desainnya_kontras_keseimbangan_dll', 3, '[\"kontras\",\"keseimbangan\",\"seimbang\",\"alignment\",\"perataan\",\"rata kanan kiri\",\"emphasis\",\"penekanan\",\"fokus\",\"proximity\",\"kedekatan\",\"jarak\",\"kesatuan\",\"unity\",\"keserasian\",\"proporsi\",\"skala\"]', 1, 'Masalah prinsip desain sudah tepat, tetapi masih kurang rinci.', '2026-07-12 03:37:26'),
(64, 33, 'sebutkan_3_masalah_pada_prinsip_desainnya_kontras_keseimbangan_dll', 2, '[\"kontras\",\"seimbang\",\"rapi\",\"lurus\",\"penekanan\",\"menonjol\",\"jarak\",\"dekat\",\"menyatu\",\"cocok\",\"ukuran\",\"letak\",\"posisi\",\"kurang pas\",\"kurang bagus\"]', 1, 'Jawaban masih umum.', '2026-07-12 03:37:44'),
(65, 33, 'sebutkan_3_masalah_pada_prinsip_desainnya_kontras_keseimbangan_dll', 1, '[\"bagus\",\"rapi\",\"keren\",\"menarik\",\"tidak ada masalah\",\"oke\",\"aman\",\"tidak tahu\",\"gatau\",\"kosong\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban belum menunjukkan masalah prinsip desain.', '2026-07-12 03:38:04'),
(66, 33, 'sebutkan_3_masalah_menurut_hierarki_visual', 4, '[\"pesan utama tidak menonjol\",\"tidak ada yang menonjol\",\"judul tidak kelihatan\",\"fokusnya hilang\",\"urutan baca membingungkan\",\"alur baca bingung\",\"membacanya acak\",\"tidak tahu mulai membaca dari mana\",\"semua terlihat penting\",\"semuanya mencolok\",\"ramai semua\",\"rebutan perhatian\",\"headline kalah\",\"judulnya kekecilan\",\"judul tertutup gambar\",\"call to action tidak jelas\",\"tombol tidak kelihatan\",\"perintah tidak jelas\",\"informasi bertumpuk\",\"tulisan menumpuk\",\"teks berantakan\"]', 1, 'Masalah hierarki visual dijelaskan dengan lengkap.', '2026-07-12 03:39:39'),
(67, 33, 'sebutkan_3_masalah_menurut_hierarki_visual', 3, '[\"pesan utama tidak jelas\",\"fokus tidak jelas\",\"tidak tahu intinya\",\"urutan baca membingungkan\",\"alur membaca membingungkan\",\"tulisan acak\",\"semua terlihat penting\",\"tulisan ramai semua\",\"judul kurang besar\",\"tombol kurang kelihatan\",\"teks bertumpuk\",\"informasi padat\"]', 1, 'Masalah hierarki sudah tepat, tetapi masih bisa lebih lengkap.', '2026-07-12 03:40:00'),
(68, 33, 'sebutkan_3_masalah_menurut_hierarki_visual', 2, '[\"tidak jelas\",\"bingung\",\"ramai\",\"pusing\",\"berantakan\",\"penuh\",\"padat\",\"acak-acakan\",\"teks banyak\",\"font kecil\",\"kurang rapi\",\"kurang pas\",\"susunan aneh\"]', 1, 'Jawaban masih terlalu umum.', '2026-07-12 03:40:22'),
(69, 33, 'sebutkan_3_masalah_menurut_hierarki_visual', 1, '[\"mudah dibaca\",\"jelas semua\",\"sudah bagus\",\"sudah rapi\",\"tidak ada masalah\",\"oke\",\"aman\",\"keren\",\"menarik\",\"tidak tahu\",\"gatau\",\"kosong\",\"tidak sesuai\",\"ngasal\",\"salah\"]', 1, 'Jawaban belum menjelaskan masalah hierarki visual.', '2026-07-12 03:40:41'),
(70, 34, 'perbaikan_dan_alasan_mengenai_aspek_tata_letak_layout', 4, '[\"memberi jarak\",\"menambah ruang kosong\",\"atur space\",\"buat lebih renggang\",\"kurangi gambar\",\"rapikan susunan\",\"pakai grid\",\"rapikan perataan\",\"buat seimbang\",\"kelompokkan informasi\",\"sejajarkan objek\",\"agar rapi\",\"biar tidak padat\",\"supaya tidak sesak\",\"lebih enak dilihat\",\"alur baca jelas\",\"fokus terjaga\"]', 1, 'Rekomendasi perbaikan dan alasan aspek layout dijelaskan dengan sangat baik.', '2026-07-12 04:07:04'),
(71, 34, 'perbaikan_dan_alasan_mengenai_aspek_tata_letak_layout', 3, '[\"rapikan layout\",\"tata ulang gambar\",\"beri jarak\",\"jangan mepet\",\"kurangi konten\",\"rapikan posisi\",\"ubah letak\",\"tata letak baru\",\"biar rapi\",\"biar bagus\",\"gampang dibaca\"]', 1, 'Solusi aspek layout sudah tepat, tetapi alasan masih kurang mendalam.', '2026-07-12 04:07:43'),
(72, 34, 'perbaikan_dan_alasan_mengenai_aspek_tata_letak_layout', 2, '[\"atur lagi\",\"rapikan\",\"pindahkan\",\"kurangi\",\"susun ulang\",\"buat baru\",\"digeser\",\"jangan berantakan\"]', 1, 'Jawaban masih terlalu umum atau tanpa alasan fungsional.', '2026-07-12 04:08:26'),
(73, 34, 'perbaikan_dan_alasan_mengenai_aspek_tata_letak_layout', 1, '[\"sudah bagus\",\"tidak usah diubah\",\"aman\",\"oke\",\"tidak tahu\",\"gatau\",\"kosong\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban belum memberikan rekomendasi perbaikan aspek layout.', '2026-07-12 04:08:42'),
(74, 34, 'perbaikan_dan_alasan_mengenai_aspek_tipografi', 4, '[\"perbesar font\",\"besarkan headline\",\"judul dibuat mencolok\",\"kurangi jenis font\",\"batasi jenis tulisan\",\"pakai maksimal tiga font\",\"ganti jenis font\",\"font dibuat konsisten\",\"ubah warna teks agar kontras\",\"buat hirarki visual\",\"biar terbaca\",\"supaya jelas\",\"tahu mana judul\",\"alur baca teratur\",\"pembaca tidak bingung\"]', 2, 'Rekomendasi perbaikan dan alasan aspek tipografi dijelaskan dengan sangat baik.', '2026-07-12 04:09:17'),
(75, 34, 'perbaikan_dan_alasan_mengenai_aspek_tipografi', 3, '[\"ganti font\",\"besarkan tulisan\",\"tulisan diperjelas\",\"kurangi gaya tulisan\",\"buat font sama\",\"ganti teks\",\"ubah font\",\"buat judul besar\",\"biar kelihatan\",\"biar bisa dibaca\",\"tidak pusing\"]', 1, 'Solusi aspek tipografi sudah tepat, tetapi alasan masih kurang mendalam.', '2026-07-12 04:11:31'),
(76, 34, 'perbaikan_dan_alasan_mengenai_aspek_tipografi', 2, '[\"ubah tulisan\",\"ganti teks\",\"rapikan teks\",\"perbaiki font\",\"ketik ulang\",\"perbesar\",\"diperjelas\"]', 1, 'Jawaban masih terlalu umum atau tanpa alasan fungsional.', '2026-07-12 04:11:52'),
(77, 34, 'perbaikan_dan_alasan_mengenai_aspek_tipografi', 1, '[\"sudah bagus\",\"teks aman\",\"tidak ada masalah\",\"oke\",\"tidak tahu\",\"gatau\",\"kosong\",\"skip\",\"tidak sesuai\",\"salah\"]', 1, 'Jawaban belum memberikan rekomendasi perbaikan aspek tipografi.', '2026-07-12 04:12:12'),
(78, 34, 'perbaikan_dan_alasan_mengenai_aspek_warna', 4, '[\"kurangi jumlah warna\",\"batasi warna\",\"pakai palet warna\",\"ganti warna tabrakan\",\"ganti warna latar belakang\",\"buat lebih kontras\",\"pakai warna netral\",\"sesuaikan tema wisata\",\"ganti warna cerah\",\"agar tidak pusing\",\"nyaman dilihat\",\"tulisan menonjol\",\"fokus pada pesan\",\"kelihatan profesional\",\"tidak norak\"]', 1, 'Rekomendasi perbaikan dan alasan aspek warna dijelaskan dengan sangat baik.', '2026-07-12 04:12:33'),
(79, 34, 'perbaikan_dan_alasan_mengenai_aspek_warna', 3, '[\"ganti warna\",\"kurangi warna\",\"ubah background\",\"pilih warna lain\",\"jangan warna-warni\",\"buat kontras\",\"samakan warna\",\"ganti warna teks\",\"biar tidak pusing\",\"biar cerah\",\"biar bagus\"]', 1, 'Solusi aspek warna sudah tepat, tetapi alasan masih kurang mendalam.', '2026-07-12 04:13:10'),
(80, 34, 'perbaikan_dan_alasan_mengenai_aspek_warna', 2, '[\"ubah warna\",\"ganti warna\",\"warnai lagi\",\"perbaiki warna\",\"pilih warna\",\"ganti semua\"]', 1, 'Jawaban masih terlalu umum atau tanpa alasan fungsional.', '2026-07-12 04:13:35'),
(81, 34, 'perbaikan_dan_alasan_mengenai_aspek_warna', 1, '[\"sudah oke\",\"warnanya bagus\",\"cocok saja\",\"tidak ada masalah\",\"tidak tahu\",\"gatau\",\"kosong\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\"]', 1, 'Jawaban belum memberikan rekomendasi perbaikan aspek warna.', '2026-07-12 04:13:53'),
(82, 35, 'konsep_desain', 4, '[\"membuat poster baru\",\"tata letak sederhana\",\"mengutamakan foto hewan\",\"fokus pada satu objek\",\"layout bersih\",\"membagi area teks dan gambar\",\"susunan minimalis\",\"struktur poster rapi\",\"menyisakan ruang kosong\",\"menonjolkan judul utama\",\"konsep modern\",\"menata ulang komponen\"]', 1, 'Konsep desain baru dijelaskan dengan sangat baik dan logis.', '2026-07-12 04:18:51'),
(83, 35, 'konsep_desain', 3, '[\"bikin poster baru\",\"konsep minimalis\",\"fokus gambar hewan\",\"ganti tata letak\",\"rapikan posisi tulisan\",\"susun ulang gambar\",\"layout diubah\",\"buat lebih simpel\",\"biar rapi\",\"biar menarik\"]', 1, 'Konsep desain sudah tepat, tetapi penjelasan kurang rinci.', '2026-07-12 04:19:12'),
(84, 35, 'konsep_desain', 2, '[\"ubah desain\",\"buat baru\",\"ganti layout\",\"konsep sederhana\",\"tata ulang\",\"perbaiki poster\"]', 1, 'Jawaban masih terlalu umum atau belum berupa konsep nyata.', '2026-07-12 04:19:30'),
(85, 35, 'konsep_desain', 1, '[\"sudah bagus\",\"tidak usah diubah\",\"aman\",\"oke\",\"tidak tahu\",\"gatau\",\"kosong\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\"]', 1, 'Jawaban belum memberikan ide konsep desain baru.', '2026-07-12 04:19:46'),
(86, 35, 'pesan_utama', 4, '[\"promosi wisata arbuckle\",\"mengajak liburan keluarga\",\"kebun binatang arbuckle\",\"mengunjungi taman hiburan\",\"mengenalkan tempat wisata baru\",\"keseruan bersama hewan\",\"taman safari keluarga\",\"bermain sambil belajar\",\"petualangan di kebun binatang\",\"liburan seru di arbuckle\"]', 1, 'Pesan utama poster dirumuskan dengan sangat jelas dan sesuai tema.', '2026-07-12 04:20:15'),
(87, 35, 'pesan_utama', 3, '[\"promosi wisata\",\"kebun binatang\",\"taman hewan\",\"mengajak liburan\",\"tempat bermain\",\"jalan-jalan keluarga\",\"arbuckle\",\"ayo datang\",\"jangan lupa berkunjung\"]', 1, 'Pesan utama sudah benar, tetapi rumusan masih kurang spesifik.', '2026-07-12 04:20:36'),
(88, 35, 'pesan_utama', 2, '[\"iklan\",\"informasi\",\"pengumuman\",\"pemberitahuan\",\"acara\",\"jualan\",\"poster\"]', 1, 'Jawaban masih terlalu umum atau sekadar menyebut jenis media.', '2026-07-12 04:20:58'),
(89, 35, 'pesan_utama', 1, '[\"kampanye sekolah\",\"hemat air\",\"kebersihan\",\"kesehatan\",\"produk makanan\",\"lowongan kerja\",\"kosong\",\"tidak tahu\",\"gatau\",\"salah\"]', 1, 'Pesan utama tidak sesuai dengan tema poster wisata.', '2026-07-12 04:21:17'),
(90, 35, 'gaya_visual_misal_minimalis_formal_ceria', 4, '[\"minimalis\",\"formal\",\"ceria\",\"playful\",\"modern\",\"clean design\",\"retro\",\"vintage\",\"colorful\",\"estetik\",\"anak-anak\",\"petualangan\",\"natural\",\"ramah anak\",\"penuh warna\",\"cerah\",\"menyenangkan\",\"interaktif\"]', 1, 'Gaya visual yang dipilih sangat tepat dan dijelaskan relevansinya dengan tema.', '2026-07-12 04:21:32'),
(91, 35, 'gaya_visual_misal_minimalis_formal_ceria', 3, '[\"minimalis\",\"formal\",\"ceria\",\"kasual\",\"modern\",\"simpel\",\"banyak warna\",\"warna cerah\",\"bertema hewan\",\"gaya anak kecil\",\"lucu\",\"keren\",\"bagus\"]', 1, 'Gaya visual sudah ditentukan, tetapi belum ada penjelasan pendukung.', '2026-07-12 04:21:48'),
(92, 35, 'gaya_visual_misal_minimalis_formal_ceria', 2, '[\"desain biasa\",\"seperti kemarin\",\"bebas\",\"yang penting bagus\",\"gambar hewan\",\"warna-warni\",\"tulisan\"]', 1, 'Jawaban masih terlalu umum atau belum merujuk pada gaya visual tertentu.', '2026-07-12 04:22:08'),
(93, 35, 'gaya_visual_misal_minimalis_formal_ceria', 1, '[\"kosong\",\"tidak tahu\",\"gatau\",\"skip\",\"tidak ada\",\"terserah\",\"asal\",\"tidak sesuai\",\"salah\"]', 1, 'Jawaban tidak menunjukkan pilihan gaya visual.', '2026-07-12 04:22:26'),
(97, 37, 'project_overview', 4, '[\"poster kampanye\",\"poster kebersihan\",\"kantin sekolah\",\"kebersihan kantin\",\"membuat poster\",\"mendesain poster\",\"merancang poster\",\"sketsa poster\",\"mind mapping\",\"tugas poster\",\"projek poster\",\"bikin poster\",\"rencana desain\",\"konsep poster\",\"gambaran umum\",\"deskripsi tugas\"]', 1, 'Project overview dijelaskan dengan sangat lengkap dan sesuai instruksi brief.', '2026-07-12 04:43:32'),
(98, 37, 'project_overview', 3, '[\"bikin poster\",\"tugas poster\",\"kampanye sekolah\",\"poster lingkungan\",\"desain poster\",\"tugas desain\",\"poster kantin\",\"projek sekolah\",\"buat gambar\"]', 1, 'Project overview sudah tepat tetapi kurang detail.', '2026-07-12 04:44:48'),
(99, 37, 'project_overview', 2, '[\"poster\",\"kampanye\",\"kantin\",\"kebersihan\",\"mendesain\",\"menggambar\",\"layout\",\"sketsa\",\"gambar\",\"tugas\"]', 1, 'Jawaban terlalu singkat atau berupa potongan kata dasar.', '2026-07-12 04:45:06'),
(100, 37, 'project_overview', 1, '[\"kosong\",\"tidak tahu\",\"gatau\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\",\"pas\",\"belum\"]', 1, 'Jawaban tidak menunjukkan deskripsi project overview.', '2026-07-12 04:45:24'),
(101, 37, 'tujuan', 4, '[\"buang sampah\",\"membuang sampah\",\"kantin bersih\",\"kantin sehat\",\"mengedukasi siswa\",\"menyadarkan siswa\",\"rapikan meja\",\"membersihkan meja\",\"kenyamanan kantin\",\"mengurangi sampah\",\"sadar lingkungan\",\"kantin rapi\",\"dilarang nyampah\",\"tempat sampah\",\"higienitas kantin\",\"lalat hilang\"]', 1, 'Tujuan poster dirumuskan dengan sangat jelas, solutif, dan berdampak nyata.', '2026-07-12 04:45:53'),
(102, 37, 'tujuan', 3, '[\"jaga kebersihan\",\"tidak kotor\",\"mengedukasi\",\"menyadarkan\",\"biar bersih\",\"biar rapi\",\"mengajak siswa\",\"kantin bagus\",\"bebas sampah\",\"tidak bau\"]', 1, 'Tujuan poster sudah benar tetapi rumusannya masih umum.', '2026-07-12 04:46:16'),
(103, 37, 'tujuan', 2, '[\"bersih\",\"rapi\",\"sehat\",\"nyaman\",\"bagus\",\"menarik\",\"sukses\",\"lancar\",\"indah\",\"aman\"]', 1, 'Jawaban masih sangat umum atau hanya berupa kata sifat tunggal.', '2026-07-12 04:46:44'),
(104, 37, 'tujuan', 1, '[\"kosong\",\"tidak tahu\",\"gatau\",\"skip\",\"tidak sesuai\",\"salah\",\"ngasal\",\"blablabla\"]', 1, 'Jawaban belum menunjukkan tujuan dari pembuatan poster.', '2026-07-12 04:47:08'),
(105, 37, 'target_audiens', 4, '[\"seluruh siswa\",\"warga sekolah\",\"semua murid\",\"siswa guru\",\"pengunjung kantin\",\"pedagang kantin\",\"penjual kantin\",\"staf sekolah\",\"siswa siswi\",\"anak SMK\",\"warga kantin\",\"pembeli kantin\",\"semua warga\",\"remaja sekolah\",\"guru karyawan\"]', 1, 'Target audiens ditentukan dengan sangat spesifik dan relevan dengan lokasi kantin sekolah.', '2026-07-12 04:47:35'),
(106, 37, 'pesan_utama', 3, '[\"siswa\",\"murid\",\"anak sekolah\",\"guru\",\"pedagang\",\"penjual\",\"semua orang\",\"orang sekolah\",\"anak-anak\",\"pembeli\"]', 1, 'Target audiens sudah benar tetapi masih bisa lebih diperinci.', '2026-07-12 04:47:57'),
(107, 37, 'target_audiens', 2, '[\"masyarakat\",\"umum\",\"publik\",\"orang tua\",\"kita semua\",\"orang dewasa\",\"masyarakat umum\",\"khalayak\",\"semua\"]', 1, 'Target audiens terlalu luas dan kurang sesuai dengan lingkup sekolah.', '2026-07-12 04:48:16'),
(108, 37, 'target_audiens', 1, '[\"anak bayi\",\"anak tk\",\"kantin luar\",\"kosong\",\"tidak tahu\",\"gatau\",\"salah\",\"ngasal\"]', 1, 'Target audiens salah atau di luar lingkungan sekolah.', '2026-07-12 04:48:44'),
(109, 37, 'pesan_utama', 4, '[\"buang sampah\",\"jagalah kebersihan\",\"rapikan meja\",\"kantin bersih\",\"perut sehat\",\"bersihkan mejamu\",\"budayakan antre\",\"jangan sembarangan\",\"tanggung jawab\",\"taruh piring\",\"bersihkan meja\",\"jaga kantin\",\"dilarang nyampah\",\"buanglah sampah\"]', 1, 'Pesan utama dirumuskan dalam bentuk kalimat ajakan yang sangat kuat, jelas, dan solutif.', '2026-07-12 04:49:04'),
(110, 37, 'pesan_utama', 3, '[\"jaga kebersihan\",\"membuang sampah\",\"kantin bersih\",\"jangan kotor\",\"rapikan meja\",\"taruh piring\",\"dilarang kotor\",\"ingatkan teman\",\"buang sampah\"]', 1, 'Pesan utama sudah benar tetapi masih berupa kalimat perintah yang standar.', '2026-07-12 04:49:20'),
(111, 37, 'pesan_utama', 2, '[\"kebersihan\",\"sampah\",\"kantin\",\"sehat\",\"rapi\",\"bersih\",\"higienis\",\"poster\",\"ajakan\",\"perintah\"]', 1, 'Jawaban hanya berupa kata kunci tunggal dan belum membentuk sebuah pesan.', '2026-07-12 04:49:51'),
(112, 37, 'pesan_utama', 1, '[\"hemat air\",\"belajar giat\",\"dilarang merokok\",\"kosong\",\"tidak tahu\",\"gatau\",\"salah\",\"ngasal\"]', 1, 'Pesan utama tidak menyambung dengan tema kebersihan kantin.', '2026-07-12 04:50:07'),
(113, 37, 'tone_mood_nuansa_warna', 4, '[\"ceria\",\"bersahabat\",\"playful\",\"segar\",\"bersih\",\"ramah\",\"warna hijau\",\"warna biru\",\"warna cerah\",\"warna pastel\",\"kontras\",\"higienis\",\"terang\",\"nuansa alam\",\"hijau daun\",\"kuning cerah\",\"simpel segar\",\"eye catching\"]', 1, 'Tone dan pemilihan warna dijelaskan dengan sangat serasi serta mendukung psikologi kebersihan.', '2026-07-12 04:50:23'),
(114, 37, 'tone_mood_nuansa_warna', 3, '[\"ceria\",\"bersih\",\"segar\",\"ramah\",\"warna hijau\",\"warna biru\",\"warna terang\",\"warna-warni\",\"bagus\",\"menarik\",\"estetik\",\"minimalis\",\"modern\"]', 1, 'Nuansa dan warna sudah ditentukan tetapi belum dijelaskan alasannya.', '2026-07-12 04:50:40'),
(115, 37, 'tone_mood_nuansa_warna', 2, '[\"warna bebas\",\"hijau\",\"biru\",\"putih\",\"cerah\",\"biasa saja\",\"modern\",\"simpel\",\"bebas\",\"pastel\"]', 1, 'Jawaban terlalu singkat atau hanya menyebutkan satu warna dasar saja.', '2026-07-12 04:50:59'),
(116, 37, 'tone_mood_nuansa_warna', 1, '[\"gelap\",\"seram\",\"hitam\",\"sedih\",\"kotor\",\"mendung\",\"kosong\",\"tidak tahu\",\"gatau\",\"salah\"]', 1, 'Pilihan nuansa dan warna tidak sesuai untuk poster kebersihan.', '2026-07-12 04:51:19'),
(117, 37, 'elemen_wajib_visual_identitas', 4, '[\"logo sekolah\",\"tempat sampah\",\"buang sampah\",\"ilustrasi anak\",\"gambar kantin\",\"meja makan\",\"maskot\",\"slogan\",\"jargon\",\"logo osis\",\"gambar makanan\",\"tulisan ajakan\",\"gambar piring\",\"ikon kebersihan\",\"teks utama\"]', 1, 'Elemen wajib diidentifikasi dengan sangat lengkap baik secara visual maupun identitas sekolah.', '2026-07-12 04:51:45'),
(118, 37, 'elemen_wajib_visual_identitas', 3, '[\"logo sekolah\",\"tempat sampah\",\"gambar orang\",\"gambar kantin\",\"tulisan slogan\",\"logo\",\"ikon\",\"gambar makanan\",\"gambar sampah\",\"tulisan teks\"]', 1, 'Elemen wajib sudah disebutkan tetapi komponennya masih minimal.', '2026-07-12 04:52:01'),
(119, 37, 'elemen_wajib_visual_identitas', 2, '[\"gambar\",\"tulisan\",\"foto\",\"logo\",\"teks\",\"huruf\",\"ilustrasi\",\"objek\",\"font\",\"warna\"]', 1, 'Jawaban masih terlalu umum atau sekadar menyebutkan elemen desain dasar.', '2026-07-12 04:52:20'),
(120, 37, 'elemen_wajib_visual_identitas', 1, '[\"tidak ada\",\"kosong\",\"tidak tahu\",\"gatau\",\"skip\",\"tidak sesuai\",\"salah\",\"ngasal\"]', 1, 'Jawaban tidak menyebutkan elemen wajib yang harus ada di dalam poster.', '2026-07-12 04:52:41'),
(121, 37, 'spesifikasi_teknis_output_media_ukuran_software', 4, '[\"ukuran A3\",\"poster cetak\",\"poster digital\",\"instagram\",\"feed\",\"adobe illustrator\",\"coreldraw\",\"canva\",\"photoshop\",\"resolusi 300\",\"cmyk\",\"png\",\"jpeg\",\"cetak A3\",\"cetakan fisik\",\"media sosial\",\"format png\"]', 3, 'Spesifikasi teknis dijelaskan dengan sangat detail mencakup media, dimensi fisik, dan perangkat lunak yang digunakan.', '2026-07-12 04:54:40'),
(122, 37, 'spesifikasi_teknis_output_media_ukuran_software', 3, '[\"cetak poster\",\"poster digital\",\"media sosial\",\"ukuran A3\",\"kanvas besar\",\"canva\",\"coreldraw\",\"photoshop\",\"aplikasi desain\",\"laptop\",\"komputer\",\"software\",\"handphone\"]', 3, 'Spesifikasi teknis sudah ada tetapi datanya belum lengkap atau kurang detail.', '2026-07-12 04:55:11'),
(123, 37, 'spesifikasi_teknis_output_media_ukuran_software', 2, '[\"poster\",\"kertas\",\"komputer\",\"HP\",\"aplikasi\",\"digambar\",\"software\",\"link\",\"cetak\",\"digital\"]', 3, 'Jawaban masih terlalu umum atau hanya berupa alat kerja mendasar.', '2026-07-12 04:56:13'),
(124, 37, 'spesifikasi_teknis_output_media_ukuran_software', 1, '[\"kosong\",\"tidak tahu\",\"gatau\",\"skip\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban belum memberikan informasi spesifikasi teknis desain.', '2026-07-12 04:56:34'),
(125, 42, 'justifikasi_warna', 4, '[\"warna\",\"karena\",\"kesan\",\"menyampaikan\",\"agar\",\"audiens\",\"merasa\",\"emosi\",\"psikologi\",\"efek\",\"suasana\"]', 1, 'Justifikasi pilihan warna memenuhi semua komponen rumus (elemen, kesan pesan, dan efek psikologis) dengan sangat baik.', '2026-07-12 11:04:00'),
(126, 42, 'justifikasi_warna', 3, '[\"warna\",\"karena\",\"kesan\",\"biar\",\"supaya\",\"merasa\",\"bagus\",\"menarik\",\"cocok\",\"sesuai\"]', 1, 'Justifikasi warna sudah mengandung alasan, tetapi komponen rumus kurang lengkap atau bahasanya terlalu sederhana.', '2026-07-12 11:04:22'),
(127, 42, 'justifikasi_warna', 2, '[\"warna\",\"pakai\",\"gunakan\",\"pilih\",\"suka\",\"bagus\",\"keren\",\"mantap\",\"estetik\"]', 1, 'Jawaban masih terlalu umum atau hanya menyebutkan pilihan warna tanpa alasan logis.', '2026-07-12 11:05:21'),
(128, 42, 'justifikasi_warna', 1, '[\"gatau\",\"kosong\",\"skip\",\"tidak tahu\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban tidak memberikan argumen justifikasi warna sama sekali.', '2026-07-12 11:05:44'),
(129, 42, 'justifikasi_tipografi_font', 4, '[\"font\",\"huruf\",\"tulisan\",\"karena\",\"kesan\",\"menyampaikan\",\"agar\",\"audiens\",\"merasa\",\"keterbacaan\",\"dibaca\",\"jelas\"]', 1, 'Justifikasi pilihan font memenuhi semua komponen rumus (elemen, kesan pesan, dan efek psikologis) dengan sangat baik.', '2026-07-12 11:06:30'),
(130, 42, 'justifikasi_tipografi_font', 3, '[\"font\",\"huruf\",\"tulisan\",\"karena\",\"kesan\",\"biar\",\"supaya\",\"jelas\",\"terbaca\",\"tidak pusing\",\"bagus\"]', 1, 'Justifikasi tipografi sudah mengandung alasan, tetapi komponen rumus kurang lengkap atau terlalu sederhana.', '2026-07-12 11:07:04'),
(131, 42, 'justifikasi_tipografi_font', 2, '[\"font\",\"huruf\",\"tulisan\",\"bentuk\",\"pilih\",\"ganti\",\"bagus\",\"menarik\",\"estetik\",\"simpel\"]', 1, 'Jawaban masih terlalu umum atau hanya menyebut jenis tulisan tanpa menghubungkannya dengan respons audiens.', '2026-07-12 11:07:31'),
(132, 42, 'justifikasi_tipografi_font', 1, '[\"gatau\",\"kosong\",\"skip\",\"tidak tahu\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban tidak memberikan argumen justifikasi tipografi sama sekali.', '2026-07-12 11:08:33'),
(133, 42, 'justifikasi_komposisi', 4, '[\"layout\",\"susunan\",\"komposisi\",\"letak\",\"posisi\",\"karena\",\"kesan\",\"menyampaikan\",\"agar\",\"audiens\",\"merasa\",\"seimbang\",\"rapi\"]', 1, 'Justifikasi pilihan komposisi layout memenuhi semua komponen rumus (elemen, kesan pesan, dan efek psikologis) dengan sangat baik.', '2026-07-12 11:09:02'),
(134, 42, 'justifikasi_komposisi', 3, '[\"layout\",\"susunan\",\"tata letak\",\"posisi\",\"karena\",\"kesan\",\"biar\",\"supaya\",\"rapi\",\"seimbang\",\"tidak penuh\"]', 1, 'Justifikasi komposisi sudah mengandung alasan, tetapi komponen rumus kurang lengkap atau terlalu sederhana.', '2026-07-12 11:09:36'),
(135, 42, 'justifikasi_komposisi', 2, '[\"tata letak\",\"susunan\",\"posisi\",\"gambar\",\"tulisan\",\"rapi\",\"bersih\",\"bagus\",\"pas\",\"cocok\"]', 1, 'Jawaban masih terlalu umum atau sekadar menyatakan tata letak sudah diatur agar bagus.', '2026-07-12 11:10:29'),
(136, 42, 'justifikasi_komposisi', 1, '[\"gatau\",\"kosong\",\"skip\",\"tidak tahu\",\"tidak sesuai\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban tidak memberikan argumen justifikasi komposisi sama sekali.', '2026-07-12 11:10:50'),
(137, 43, 'kerning_jarak_antar_huruf_pada_judul_sudah_nyaman_dibaca_tidak_terlalu_rapat_renggang', 4, '[\"ya\",\"sudah\",\"nyaman\",\"pas\",\"aman\",\"rapi\",\"cukup\",\"sesuai\",\"tidak rapat\",\"tidak renggang\"]', 1, 'Evaluasi kerning dijawab dengan tegas dan jelas sesuai instruksi.', '2026-07-12 11:14:19'),
(138, 43, 'kerning_jarak_antar_huruf_pada_judul_sudah_nyaman_dibaca_tidak_terlalu_rapat_renggang', 3, '[\"ya sudah\",\"lumayan\",\"sepertinya\",\"agak\",\"kurang\",\"sedikit\"]', 1, 'Jawaban mengarah ke konfirmasi tetapi ragu-ragu atau kurang tegas.', '2026-07-12 11:14:40'),
(139, 43, 'kerning_jarak_antar_huruf_pada_judul_sudah_nyaman_dibaca_tidak_terlalu_rapat_renggang', 2, '[\"huruf\",\"jarak\",\"judul\",\"baca\",\"teks\",\"tulisan\"]', 1, 'Siswa hanya menuliskan elemen teks tanpa menjawab esensi Ya/Tidak.', '2026-07-12 11:14:55'),
(140, 43, 'kerning_jarak_antar_huruf_pada_judul_sudah_nyaman_dibaca_tidak_terlalu_rapat_renggang', 1, '[\"tidak\",\"belum\",\"gatau\",\"kosong\",\"skip\",\"salah\",\"ngasal\"]', 1, 'Siswa mengonfirmasi kerning belum selesai atau jawaban tidak sesuai.', '2026-07-12 11:15:12'),
(141, 43, 'margin_safe_zone_tidak_ada_teks_atau_logo_yang_terlalu_mepet_ke_pinggir_kanvas', 4, '[\"ya\",\"tidak\",\"aman\",\"pas\",\"sesuai\",\"rapi\",\"tidak mepet\",\"ada jarak\",\"safe zone\"]', 1, 'Evaluasi margin dijawab dengan tegas sesuai instruksi penataan sisi kanvas.', '2026-07-12 11:15:37'),
(142, 43, 'margin_safe_zone_tidak_ada_teks_atau_logo_yang_terlalu_mepet_ke_pinggir_kanvas', 3, '[\"ya aman\",\"lumayan\",\"sepertinya\",\"agak mepet\",\"kurang tengah\"]', 1, 'Jawaban mengarah ke konfirmasi tetapi masih ragu-ragu atau terdapat catatan minor.', '2026-07-12 11:16:01'),
(143, 43, 'margin_safe_zone_tidak_ada_teks_atau_logo_yang_terlalu_mepet_ke_pinggir_kanvas', 2, '[\"margin\",\"pinggir\",\"logo\",\"kanvas\",\"kotak\",\"garis\"]', 1, 'Siswa hanya mengulang kata kunci soal tanpa menjawab konfirmasi Ya/Tidak.', '2026-07-12 11:16:24'),
(144, 43, 'margin_safe_zone_tidak_ada_teks_atau_logo_yang_terlalu_mepet_ke_pinggir_kanvas', 1, '[\"belum\",\"gatau\",\"kosong\",\"skip\",\"salah\",\"ngasal\",\"blablabla\"]', 1, 'Jawaban kosong atau tidak sesuai instruksi.', '2026-07-12 11:16:43'),
(145, 43, 'kontras_warna_teks_terbaca_jelas_di_atas_latar_belakang', 4, '[\"ya\",\"jelas\",\"terbaca\",\"kontras\",\"pas\",\"aman\",\"kelihatan\",\"terang\",\"sangat jelas\"]', 1, 'Evaluasi kontras warna dijawab dengan tegas bahwa teks sudah bisa dibaca dengan baik.', '2026-07-12 11:17:04'),
(146, 43, 'kontras_warna_teks_terbaca_jelas_di_atas_latar_belakang', 3, '[\"ya jelas\",\"lumayan\",\"agak\",\"kurang kontras\",\"samar\",\"sedikit\"]', 1, 'Jawaban mengarah ke konfirmasi tetapi memberikan catatan keraguan pada tingkat keterbacaan.', '2026-07-12 11:17:25'),
(147, 43, 'kontras_warna_teks_terbaca_jelas_di_atas_latar_belakang', 2, '[\"warna\",\"teks\",\"latar\",\"background\",\"tulisan\",\"kontras\"]', 1, 'Siswa hanya menyebutkan komponen warna atau latar saja.', '2026-07-12 11:17:49'),
(148, 43, 'kontras_warna_teks_terbaca_jelas_di_atas_latar_belakang', 1, '[\"tidak\",\"gatau\",\"kosong\",\"skip\",\"salah\",\"ngasal\",\"buram\"]', 1, 'Jawaban mengonfirmasi tidak kontras atau tidak mengisi sama sekali.', '2026-07-12 11:18:12'),
(149, 44, 'apresiasi_apa_yang_menarik', 4, '[\"menarik\",\"bagus\",\"suka\",\"keren\",\"rapi\",\"estetik\",\"menyukai\",\"pemilihan warna\",\"pemilihan font\",\"tata letak\",\"idenya\",\"konsepnya\",\"ilustrasinya\",\"gambarnya\",\"komposisinya\",\"pesannya\"]', 1, 'Apresiasi terhadap kelebihan karya teman dijelaskan dengan sangat objektif dan jelas.', '2026-07-12 11:24:14'),
(150, 44, 'apresiasi_apa_yang_menarik', 3, '[\"bagus\",\"keren\",\"suka\",\"menarik\",\"rapi\",\"warnanya\",\"tulisannya\",\"gambarnya\",\"posternya\",\"cocok\",\"pas\"]', 1, 'Apresiasi sudah ada tetapi masih menggunakan kalimat pujian yang sangat sederhana.', '2026-07-12 11:24:32'),
(151, 44, 'apresiasi_apa_yang_menarik', 2, '[\"bagus\",\"keren\",\"lumayan\",\"oke\",\"pas\",\"mantap\",\"ya\"]', 1, 'Jawaban terlalu singkat atau hanya berupa kata pujian satu kata tanpa penjelasan elemen apa yang dipuji.', '2026-07-12 11:24:49'),
(152, 44, 'apresiasi_apa_yang_menarik', 1, '[\"jelek\",\"buruk\",\"biasa saja\",\"kosong\",\"gatau\",\"skip\",\"tidak tahu\",\"ngasal\",\"salah\",\"blablabla\"]', 1, 'Jawaban tidak memberikan apresiasi atau malah langsung mencela tanpa dasar.', '2026-07-12 11:25:13'),
(153, 44, 'analisis_masalah_apa_yang_kurang_efektif', 4, '[\"kurang\",\"masalah\",\"salah\",\"karena\",\"menumpuk\",\"berantakan\",\"tabrakan\",\"tidak kontras\",\"kekecilan\",\"terlalu ramai\",\"membingungkan\",\"sulit dibaca\",\"mepet\",\"kosong\",\"sepi\",\"visual clutter\"]', 1, 'Masalah atau kekurangan efektifan pada karya dijelaskan dengan alasan teknis yang logis.', '2026-07-12 11:25:34'),
(154, 44, 'analisis_masalah_apa_yang_kurang_efektif', 3, '[\"kurang\",\"tulisan\",\"warna\",\"gambar\",\"kecil\",\"ramai\",\"pusing\",\"bingung\",\"tidak kontras\",\"bertumpuk\",\"jelek\"]', 1, 'Masalah pada karya sudah disebutkan tetapi penjelasannya masih menggunakan bahasa awam atau kurang detail.', '2026-07-12 11:25:52'),
(155, 44, 'analisis_masalah_apa_yang_kurang_efektif', 2, '[\"jelek\",\"berantakan\",\"membingungkan\",\"pusing\",\"ramai\",\"penuh\",\"salah\",\"warnanya\",\"gambarnya\",\"tulisannya\"]', 1, 'Jawaban masih berupa keluhan subjektif atau potongan kata yang sangat pendek.', '2026-07-12 11:26:15'),
(156, 44, 'analisis_masalah_apa_yang_kurang_efektif', 1, '[\"tidak ada\",\"rapi semua\",\"bagus semua\",\"sempurna\",\"kosong\",\"gatau\",\"skip\",\"tidak tahu\",\"ngasal\",\"salah\"]', 1, 'Siswa gagal mengidentifikasi kekurangan atau masalah pada karya temannya.', '2026-07-12 11:26:34'),
(157, 44, 'saran_perbaikan_solusi_konkret', 4, '[\"sebaiknya\",\"saran\",\"harusnya\",\"coba\",\"kurangi\",\"ganti\",\"perbesar\",\"kecilkan\",\"atur kembali\",\"beri jarak\",\"ganti warna\",\"gunakan font\",\"rapikan layout\",\"buat kontras\",\"tambahkan space\"]', 1, 'Saran perbaikan yang diberikan bersifat konkret, solutif, dan membangun untuk desain ke depan.', '2026-07-12 11:26:59'),
(158, 44, 'saran_perbaikan_solusi_konkret', 3, '[\"sebaiknya\",\"saran\",\"diganti\",\"diubah\",\"dirapikan\",\"diperbaiki\",\"latihan lagi\",\"belajar lagi\",\"ubah warna\",\"ubah tulisan\"]', 1, 'Sudah ada saran perbaikan, tetapi solusinya masih bersifat umum atau kurang spesifik langkahnya.', '2026-07-12 11:27:16'),
(159, 44, 'saran_perbaikan_solusi_konkret', 2, '[\"perbaiki\",\"ubah\",\"ganti\",\"rapiin\",\"betulin\",\"diganti\",\"dibuat baru\"]', 1, 'Jawaban terlalu singkat atau hanya berupa kata perintah dasar tanpa arah solusi yang jelas.', '2026-07-12 11:27:38'),
(160, 44, 'saran_perbaikan_solusi_konkret', 1, '[\"tidak ada\",\"tidak usah\",\"pas\",\"kosong\",\"gatau\",\"skip\",\"tidak tahu\",\"ngasal\",\"salah\"]', 1, 'Jawaban belum memberikan solusi atau saran perbaikan sama sekali.', '2026-07-12 11:27:56');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL,
  `result_id` int(11) DEFAULT NULL,
  `question_id` int(11) DEFAULT NULL,
  `attempt_number` int(11) DEFAULT 1,
  `answer_text` text DEFAULT NULL,
  `answer_image` varchar(255) DEFAULT NULL,
  `auto_score` int(11) DEFAULT 0,
  `final_score` int(11) DEFAULT 0,
  `auto_note` text DEFAULT NULL,
  `matched_keywords` text DEFAULT NULL,
  `grading_type` varchar(30) DEFAULT 'auto',
  `review_status` varchar(30) DEFAULT 'auto_graded',
  `is_latest` tinyint(1) DEFAULT 1,
  `score` int(11) DEFAULT 0,
  `teacher_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_answers`
--

INSERT INTO `quiz_answers` (`id`, `result_id`, `question_id`, `attempt_number`, `answer_text`, `answer_image`, `auto_score`, `final_score`, `auto_note`, `matched_keywords`, `grading_type`, `review_status`, `is_latest`, `score`, `teacher_note`, `created_at`) VALUES
(5, 2, 31, 1, '{\"1. Tujuan Desain:\":\"Meningkatkan kesadaran warga sekolah untuk menghemat penggunaan air dan memastikan tidak ada sumber air yang terbuang sia-sia.\",\"2. Pesan Utama:\":\"\\\"Matikan keran setelah digunakan\\\" atau \\\"Hemat air untuk masa depan sekolah kita\\\".\",\"3. Target Audiens:\":\"Seluruh warga SMK Negeri 3 Kuningan.\",\"4. Konteks Penggunaan:\":\"Ditempel di area strategis seperti pintu masuk atau dinding bagian dalam setiap toilet sekolah.\"}', NULL, 0, 0, NULL, NULL, 'auto', 'auto_graded', 1, 0, NULL, '2026-07-02 05:52:37'),
(6, 2, 33, 1, '{\"1. Apa tujuan desain tersebut?\":\"Mempromosikan taman wisata hewan (taman safari) Arbuckle Wilderness serta fasilitas penginapan yang tersedia.\",\"2. Siapa target audiensnya?\":\"Wisatawan, keluarga yang sedang berlibur, atau pecinta hewan.\",\"3. Apa elemen yang dominan (warna, tipografi, layout, dll):\":\"Warna merah dan biru yang sangat kontras, penggunaan banyak foto hewan yang tumpang tindih, serta berbagai jenis tipografi (font) yang berbeda-beda.\",\"4. Bagian yang paling pertama menarik perhatian:\":\"Foto wajah harimau di sisi kiri atau teks kuning \\\"Rediscover the All-New\\\" yang memiliki efek outline tebal.\",\"5. Apakah pesan utama yang langsung terlihat? Jelaskan.\":\"Tidak secara efektif. Meskipun teks \\\"Rediscover the All-New\\\" besar, audiens terdistraksi oleh terlalu banyak elemen visual (foto dan teks kecil) yang berebut perhatian secara bersamaan.\",\"6. Bagian mana yang membingungkan?\":\"Area di tengah yang berisi daftar teks kecil (nama-nama hewan) di atas latar belakang foto, serta tumpukan logo dan alamat di bagian bawah yang sangat rapat.\",\"7. Sebutkan 3 masalah pada elemen desainnya:\":\"Penggunaan foto yang terlalu banyak dengan pemotongan (cropping) yang tidak rapi, menciptakan visual clutter.\",\"8. Sebutkan 3 masalah pada prinsip desainnya (kontras, keseimbangan, dll):\":\"Kurangnya white space (ruang kosong) sehingga desain terasa sesak dan tidak seimbang.\",\"9. Sebutkan 3 masalah menurut hierarki visual:\":\"Tidak ada alur baca yang jelas; mata audiens tidak diarahkan ke satu titik fokus utama sebelum membaca informasi detail.\"}', NULL, 0, 0, NULL, NULL, 'auto', 'auto_graded', 1, 0, NULL, '2026-07-02 05:52:37'),
(7, 2, 34, 1, '{\"1. Perbaikan dan Alasan mengenai Aspek Tata Letak (Layout):\":\"Mengurangi jumlah foto dan menggunakan satu foto utama yang paling ikonik sebagai hero image. Alasannya untuk mengurangi jumlah foto dan menggunakan satu foto utama yang paling ikonik sebagai hero image.\",\"2. Perbaikan dan Alasan mengenai Aspek Tipografi:\":\"Membatasi penggunaan jenis huruf (maksimal 2-3 jenis font) dan mengatur ukuran teks berdasarkan tingkat kepentingannya. Sehingga meningkatkan keterbacaan (readability) informasi penting seperti lokasi dan nomor telepon.\",\"3. Perbaikan dan Alasan mengenai Aspek Warna:\":\"Menggunakan palet warna yang lebih harmonis dan menghindari tabrakan warna yang terlalu mencolok pada latar belakang teks. Untuk menghindari kelelahan mata audiens dan memperkuat identitas branding yang profesional\"}', NULL, 0, 0, NULL, NULL, 'auto', 'auto_graded', 1, 0, NULL, '2026-07-02 05:52:37'),
(8, 2, 35, 1, '{\"1. Konsep Desain:\":\"\\\"Gerbang Petualangan Alam\\\".\",\"2. Pesan Utama:\":\"Kemudahan akses menuju petualangan liar yang tak terlupakan.\",\"3. Gaya Visual (misal: minimalis, formal, ceria):\":\"Modern-Minimalis dengan penekanan pada fotografi alam berkualitas tinggi.\"}', NULL, 0, 0, NULL, NULL, 'auto', 'auto_graded', 1, 0, NULL, '2026-07-02 05:52:37'),
(9, 2, 36, 1, '{\"1. Apa hal terpenting yang harus diketahui sebelum mendesain?\":\"Memahami Design Brief, terutama mengenai siapa audiensnya dan apa masalah yang ingin diselesaikan melalui desain tersebut.\",\"2. Mengapa sebuah desain yang \\\"indah\\\" belum tentu disebut desain yang \\\"berhasil\\\"?\":\"Karena desain bukan sekadar estetika. Jika desain indah tetapi gagal menyampaikan pesan atau tidak dipahami oleh audiens, maka desain tersebut gagal berfungsi sebagai alat problem solving.\",\"3. Apa kesulitan yang kamu alami saat menganalisis desain?\":\"Menentukan elemen mana yang paling krusial untuk diperbaiki terlebih dahulu karena banyaknya kesalahan visual yang saling berkaitan pada objek poster.\"}', NULL, 0, 0, NULL, NULL, 'auto', 'auto_graded', 1, 0, NULL, '2026-07-02 05:52:37'),
(10, 3, 31, 1, '{\"Project Overview\": \"Pihak sekolah ingin membuat poster kampanye hemat air yang ditempel di pintu toilet. Poster ini dibuat agar siswa langsung sadar untuk menutup keran setelah digunakan.\", \"Category Industry\": \"Proyek ini termasuk desain kampanye edukasi sekolah atau desain komunikasi visual untuk perubahan perilaku.\", \"Target Audience\": \"Target audiensnya adalah siswa SMK yang menggunakan toilet sekolah dan biasanya hanya melihat poster secara cepat saat melintas.\", \"Problem\": \"Masalah utamanya adalah masih banyak siswa yang lupa menutup keran air sehingga air terbuang sia-sia.\", \"Objective\": \"Tujuan desain adalah mengingatkan siswa agar menutup keran air dengan pesan yang singkat, jelas, dan mudah dipahami dalam waktu kurang dari 5 detik.\", \"Key Message\": \"Pesan utama poster adalah ajakan untuk hemat air dengan cara menutup keran setelah digunakan.\", \"Tone and Style\": \"Gaya bahasa sebaiknya ramah, singkat, tidak menggurui, tidak galak, dan tidak bernada ancaman.\", \"Constraints\": \"Poster harus langsung dipahami, cocok ditempel di pintu toilet, tidak terlalu banyak teks, dan visualnya harus sederhana tetapi menarik perhatian.\"}', NULL, 4, 4, 'category industry di bidang apa proyek ini berjalan pendidikan komersial atau sosial: nilai 4. Kategori proyek sangat tepat dan sesuai konteks sekolah.\nconstraints apa saja batasan atau tantangan teknis yang harus diperhatikan dalam desain ini: nilai 4. Batasan desain sangat lengkap dan sesuai kasus.\ndeliverables apa output fisik desainnya dan di mana lokasi penempatannya: nilai 4. Output desain dan lokasi penempatan sangat jelas.\ngoals objectives perubahan perilaku apa yang diinginkan sekolah setelah siswa melihat poster ini: nilai 4. Tujuan perubahan perilaku sangat jelas dan sesuai masalah.\nproject overview apa nama proyek ini dan masalah utama apa yang ingin diselesaikan: nilai 4. Analisis masalah sangat tepat dan lengkap.\ntarget audience siapa sasaran utamanya bagaimana karakteristik usia mereka: nilai 4. Sasaran audiens sangat tepat dan jelas.\nthe message apa pesan kunci atau slogan utama yang harus menonjol: nilai 4. Pesan utama jelas, singkat, dan sesuai tujuan poster.\ntimeline kapan desain ini harus selesai: nilai 4. Timeline realistis dan sesuai proyek latihan kelas.', '[]', 'auto', 'completed', 1, 4, NULL, '2026-07-12 12:06:36'),
(11, 3, 33, 1, '{\"Bagian yang paling pertama menarik perhatian\": \"Bagian yang paling menarik perhatian adalah gambar utama dan judul poster karena ukurannya cukup besar dan langsung terlihat.\", \"Pesan utama poster\": \"Pesan utama poster sudah mengarah pada ajakan menjaga kebersihan dan memperhatikan lingkungan, tetapi masih bisa dibuat lebih singkat agar lebih cepat dipahami.\", \"Target audiens\": \"Target audiens poster kemungkinan adalah siswa atau warga sekolah karena isi pesannya berkaitan dengan kebiasaan sehari-hari di lingkungan sekolah.\", \"Bagian yang membingungkan\": \"Bagian yang masih membingungkan adalah susunan teks yang cukup ramai sehingga pembaca perlu waktu lebih lama untuk memahami pesan utama.\", \"Kelebihan desain\": \"Kelebihannya adalah poster sudah memiliki visual yang cukup menarik dan warna yang bisa menarik perhatian pembaca.\", \"Kekurangan desain\": \"Kekurangannya adalah beberapa teks masih terlalu panjang, ukuran huruf kurang seimbang, dan fokus pesan belum sepenuhnya terlihat dalam sekali pandang.\", \"Saran perbaikan\": \"Poster sebaiknya menggunakan headline yang lebih singkat, memperbesar pesan utama, mengurangi teks tambahan, dan membuat tata letak lebih rapi agar mudah dibaca dalam waktu singkat.\"}', NULL, 3, 3, 'apakah pesan utama yang langsung terlihat jelaskan: nilai 3. Pesan utama sudah benar, tetapi belum terlalu lengkap.\napa elemen yang dominan warna tipografi layout dll: nilai 4. Elemen dominan dijelaskan dengan lengkap.\napa tujuan desain tersebut: nilai 4. Tujuan desain sangat tepat dan sesuai isi poster.\nbagian mana yang membingungkan: nilai 3. Jawaban sudah benar, tetapi masih kurang lengkap.\nbagian yang paling pertama menarik perhatian: nilai 4. Bagian yang menarik perhatian dijelaskan dengan tepat.\nsebutkan 3 masalah menurut hierarki visual: nilai 3. Masalah hierarki sudah tepat, tetapi masih bisa lebih lengkap.\nsebutkan 3 masalah pada elemen desainnya: nilai 4. Masalah elemen desain dijelaskan lengkap.\nsebutkan 3 masalah pada prinsip desainnya kontras keseimbangan dll: nilai 4. Masalah prinsip desain dijelaskan dengan sangat baik.\nsiapa target audiensnya: nilai 4. Target audiens sangat jelas dan sesuai poster wisata.', '[]', 'auto', 'completed', 1, 3, NULL, '2026-07-12 12:06:36'),
(12, 3, 34, 1, '{\"1. Perbaikan dan Alasan mengenai Aspek Tata Letak (Layout):\":\"Harus dirapikan lagi susunan fotonya dan dikurangi gambarnya biar poster tidak terlalu ramai, jadinya orang yang melihat bisa langsung tahu tempat wisatanya.\",\"2. Perbaikan dan Alasan mengenai Aspek Tipografi:\":\"Ganti font dan tulisannya harus dirapikan.\",\"3. Perbaikan dan Alasan mengenai Aspek Warna:\":\"Saya akan mengganti warna teks di bagian bawah menggunakan kombinasi warna yang memiliki kontras tinggi dengan background, tujuannya agar elemen teks menonjol dan memiliki kesatuan yang harmonis dengan keseluruhan warna poster.\"}', NULL, 3, 3, 'perbaikan dan alasan mengenai aspek tata letak layout: nilai 4. Rekomendasi perbaikan dan alasan aspek layout dijelaskan dengan sangat baik.\nperbaikan dan alasan mengenai aspek tipografi: nilai 3. Solusi aspek tipografi sudah tepat, tetapi alasan masih kurang mendalam.\nperbaikan dan alasan mengenai aspek warna: nilai 3. Solusi aspek warna sudah tepat, tetapi alasan masih kurang mendalam.', '[]', 'auto', 'completed', 1, 3, NULL, '2026-07-12 12:06:36'),
(13, 3, 35, 1, '{\"1. Konsep Desain\": \"Membuat poster kampanye hemat air dengan visual keran air yang hampir menetes dan tulisan utama yang singkat. Poster ini dibuat agar siswa langsung sadar untuk menutup keran setelah digunakan.\", \"2. Pesan Utama\": \"Pesan utama poster adalah mengajak siswa menghemat air dengan cara sederhana, yaitu menutup keran setelah selesai digunakan. Pesan dibuat singkat agar mudah dipahami saat siswa hanya melintas di depan toilet.\", \"3. Gaya Visual (Misal: Minimalis, Formal, Ceria)\": \"Gaya visual yang digunakan adalah minimalis dan ceria. Warna yang dipakai tetap terang agar menarik perhatian, tetapi tata letaknya dibuat sederhana supaya pesan utama langsung terlihat.\"}', NULL, 4, 4, 'Bagian ini tidak masuk penilaian.', '[]', 'auto', 'completed', 1, 4, NULL, '2026-07-12 12:06:36'),
(14, 3, 36, 1, '{\"1. Apa hal terpenting yang harus diketahui sebelum mendesain?\":\"Ide konsepnya adalah membuat poster wisata yang simpel dan bersih, gambarnya dikurangi biar tidak ramai dan penonton langsung paham tempatnya.\",\"2. Mengapa sebuah desain yang \\\"indah\\\" belum tentu disebut desain yang \\\"berhasil\\\"?\":\"Pesan utamanya adalah mengajak berkunjung ke taman safari bersama keluarga lewat kalimat ajakan \'Rasakan Petualangan Seru di Alam Liar\'.\",\"3. Apa kesulitan yang kamu alami saat menganalisis desain?\":\"Saya memilih gaya visual minimalis ceria dengan warna terang, karena ingin menyampaikan kesan tempat rekreasi yang segar dan menyenangkan untuk anak-anak.\"}', NULL, 0, 0, 'Bagian ini tidak masuk penilaian.', '[]', 'auto', 'completed', 1, 0, NULL, '2026-07-12 12:06:36'),
(15, 4, 37, 1, '{\"1. Project Overview:\":\"Saya akan merancang sebuah poster kampanye kebersihan di area kantin sekolah yang nantinya akan dicetak fisik menggunakan kertas ukuran A3 untuk ditempel pada dinding kantin.\",\"2. Tujuan:\":\"Biar kantinnya bersih dan supaya anak-anak tidak membuang bungkus makanan sembarangan di meja kantin.\",\"3. Target Audiens:\":\"Target utamanya adalah siswa-siswi atau teman sebaya di sekolah yang sering nongkrong dan makan di kantin.\",\"4. Pesan Utama:\":\"Kantin Bersih, Makan pun Nyaman! Yuk, Budayakan Buang Sampah pada Tempatnya!\",\"5. Tone & Mood (Nuansa, Warna)\":\"Nuansanya ceria, ramah, dan bersih. Pilihan warnanya menggunakan warna-warna terang dan segar seperti hijau muda, putih, dan kuning pastel.\",\"6. Elemen Wajib (Visual, Identitas):\":\"Di dalam poster wajib ada logo sekolah, ilustrasi tempat sampah, gambar karakter siswa, dan ilustrasi piring makanan.\",\"7. Spesifikasi Teknis (Output Media, Ukuran, Software):\":\"Ukuran kertas A3 / Media Cetak Fisik / Menggunakan software Adobe Illustrator atau Canva.\"}', NULL, 4, 4, 'elemen wajib visual identitas: nilai 4. Elemen wajib diidentifikasi dengan sangat lengkap baik secara visual maupun identitas sekolah.\npesan utama: nilai 4. Pesan utama dirumuskan dalam bentuk kalimat ajakan yang sangat kuat, jelas, dan solutif.\nproject overview: nilai 4. Project overview dijelaskan dengan sangat lengkap dan sesuai instruksi brief.\nspesifikasi teknis output media ukuran software: nilai 4. Spesifikasi teknis dijelaskan dengan sangat detail mencakup media, dimensi fisik, dan perangkat lunak yang digunakan.\ntarget audiens: nilai 4. Target audiens ditentukan dengan sangat spesifik dan relevan dengan lokasi kantin sekolah.\ntone mood nuansa warna: nilai 4. Tone dan pemilihan warna dijelaskan dengan sangat serasi serta mendukung psikologi kebersihan.\ntujuan: nilai 4. Tujuan poster dirumuskan dengan sangat jelas, solutif, dan berdampak nyata.', '[]', 'auto', 'completed', 1, 4, NULL, '2026-07-12 15:45:06'),
(16, 4, 38, 1, '{\"1. Mind Mapping:\":{\"image_url\":\"http://localhost:5000/uploads/quiz/1783870991475-843740382.png\",\"image_name\":\"Your awesome idea goes here..png\"}}', NULL, 4, 4, 'Gambar jawaban sudah diupload. Siswa dinyatakan tuntas.', '[]', 'auto', 'completed', 1, 4, NULL, '2026-07-12 15:45:06'),
(17, 4, 39, 1, '{\"1. Thumbnail Sketches\":{\"image_url\":\"http://localhost:5000/uploads/quiz/1783871025040-311913534.jpeg\",\"image_name\":\"sketsa 2.jpeg\"}}', NULL, 4, 4, 'Gambar jawaban sudah diupload. Siswa dinyatakan tuntas.', '[]', 'auto', 'completed', 1, 4, NULL, '2026-07-12 15:45:06'),
(18, 4, 40, 1, '{\"1. Berapa banyak kata kunci yang berhasil Anda temukan di Mind Mapping?\":\"Saya berhasil menemukan 10 kata kunci di dalam mind mapping saya.\\\" atau \\\"Ada sekitar 8 sampai 12 kata yang saling terhubung.\",\"2. Dari 3 sketsa yang dibuat, manakah yang menurut Anda paling unik dan tidak terpikirkan oleh teman lain? Jelaskan singkat alasannya!\":\"Sketsa nomor 3 adalah yang paling unik, karena saya tidak memakai gambar tempat sampah biasa, melainkan menggunakan ilustrasi karakter maskot sekolah yang sedang melompat ceria membawa piring bersih.\",\"3. Apa kendala utama Anda saat mencoba mencari ide yang berbeda-beda (Flexibility)?\":\"Kendala terbesar saya adalah stuck pada satu ide awal saja, sehingga sulit untuk mencari sudut pandang alternatif atau variasi tata letak visual yang benar-benar berbeda dari sketsa pertama.\"}', NULL, 0, 0, 'Bagian ini tidak masuk penilaian.', '[]', 'auto', 'completed', 1, 0, NULL, '2026-07-12 15:45:06');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_meeting_access`
--

CREATE TABLE `quiz_meeting_access` (
  `id` int(11) NOT NULL,
  `pertemuan` int(11) NOT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 0,
  `opened_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_meeting_access`
--

INSERT INTO `quiz_meeting_access` (`id`, `pertemuan`, `is_open`, `opened_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-07-08 21:52:49', '2026-07-08 14:49:57', '2026-07-08 14:52:49'),
(2, 2, 0, NULL, '2026-07-08 14:50:30', '2026-07-08 14:50:30'),
(3, 3, 0, NULL, '2026-07-08 14:52:49', '2026-07-08 14:52:49'),
(4, 4, 0, NULL, '2026-07-08 14:52:49', '2026-07-08 14:52:49');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_results`
--

CREATE TABLE `quiz_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `pertemuan` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `auto_total_score` int(11) DEFAULT 0,
  `final_total_score` int(11) DEFAULT 0,
  `total_questions` int(11) DEFAULT 0,
  `completed_questions` int(11) DEFAULT 0,
  `revision_questions` int(11) DEFAULT 0,
  `status` varchar(30) DEFAULT 'in_progress',
  `grading_type` varchar(30) DEFAULT 'auto',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_results`
--

INSERT INTO `quiz_results` (`id`, `user_id`, `pertemuan`, `score`, `auto_total_score`, `final_total_score`, `total_questions`, `completed_questions`, `revision_questions`, `status`, `grading_type`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 0, 0, 0, 0, 0, 0, 'pending', 'auto', NULL, NULL, '2026-04-29 11:13:40', NULL),
(3, 3, 1, 10, 10, 10, 4, 4, 0, 'completed', 'auto', NULL, NULL, '2026-07-12 12:06:36', '2026-07-12 12:06:36'),
(4, 3, 2, 12, 12, 12, 3, 3, 0, 'completed', 'auto', NULL, NULL, '2026-07-12 15:45:06', '2026-07-12 15:45:06');

-- --------------------------------------------------------

--
-- Table structure for table `student_question_progress`
--

CREATE TABLE `student_question_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pertemuan` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `stage_order` int(11) NOT NULL,
  `status` varchar(30) DEFAULT 'locked',
  `latest_answer_id` int(11) DEFAULT NULL,
  `latest_score` int(11) DEFAULT 0,
  `attempt_count` int(11) DEFAULT 0,
  `unlocked_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `feedback` longtext DEFAULT NULL,
  `field_results` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_question_progress`
--

INSERT INTO `student_question_progress` (`id`, `user_id`, `pertemuan`, `question_id`, `stage_order`, `status`, `latest_answer_id`, `latest_score`, `attempt_count`, `unlocked_at`, `submitted_at`, `completed_at`, `created_at`, `feedback`, `field_results`) VALUES
(1, 1, 1, 31, 1, 'unlocked', NULL, 0, 0, '2026-07-02 07:17:00', NULL, NULL, '2026-07-02 07:17:00', NULL, NULL),
(2, 1, 1, 33, 2, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-02 07:17:00', NULL, NULL),
(3, 1, 1, 34, 3, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-02 07:17:00', NULL, NULL),
(4, 1, 1, 35, 4, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-02 07:17:00', NULL, NULL),
(5, 1, 1, 36, 5, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-02 07:17:00', NULL, NULL),
(6, 3, 1, 31, 1, 'unlocked', 10, 4, 6, '2026-07-11 01:28:22', '2026-07-12 12:06:36', '2026-07-12 12:06:36', '2026-07-11 01:28:22', 'category industry di bidang apa proyek ini berjalan pendidikan komersial atau sosial: nilai 4. Kategori proyek sangat tepat dan sesuai konteks sekolah.\nconstraints apa saja batasan atau tantangan teknis yang harus diperhatikan dalam desain ini: nilai 4. Batasan desain sangat lengkap dan sesuai kasus.\ndeliverables apa output fisik desainnya dan di mana lokasi penempatannya: nilai 4. Output desain dan lokasi penempatan sangat jelas.\ngoals objectives perubahan perilaku apa yang diinginkan sekolah setelah siswa melihat poster ini: nilai 4. Tujuan perubahan perilaku sangat jelas dan sesuai masalah.\nproject overview apa nama proyek ini dan masalah utama apa yang ingin diselesaikan: nilai 4. Analisis masalah sangat tepat dan lengkap.\ntarget audience siapa sasaran utamanya bagaimana karakteristik usia mereka: nilai 4. Sasaran audiens sangat tepat dan jelas.\nthe message apa pesan kunci atau slogan utama yang harus menonjol: nilai 4. Pesan utama jelas, singkat, dan sesuai tujuan poster.\ntimeline kapan desain ini harus selesai: nilai 4. Timeline realistis dan sesuai proyek latihan kelas.', '[{\"fieldKey\":\"category_industry_di_bidang_apa_proyek_ini_berjalan_pendidikan_komersial_atau_sosial\",\"score\":4,\"matchedKeywords\":[\"pendidikan\",\"sekolah\",\"smk\",\"kampanye hemat air\",\"lingkungan sekolah\"],\"note\":\"Kategori proyek sangat tepat dan sesuai konteks sekolah.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"constraints_apa_saja_batasan_atau_tantangan_teknis_yang_harus_diperhatikan_dalam_desain_ini\",\"score\":4,\"matchedKeywords\":[\"kurang dari 5 detik\",\"mudah dipahami\",\"tidak menggurui\",\"tidak galak\",\"tidak mengancam\",\"audiens melintas\",\"visual sederhana\"],\"note\":\"Batasan desain sangat lengkap dan sesuai kasus.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"deliverables_apa_output_fisik_desainnya_dan_di_mana_lokasi_penempatannya\",\"score\":4,\"matchedKeywords\":[\"poster cetak\",\"pintu toilet\",\"kamar mandi sekolah\",\"setiap pintu toilet\"],\"note\":\"Output desain dan lokasi penempatan sangat jelas.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"goals_objectives_perubahan_perilaku_apa_yang_diinginkan_sekolah_setelah_siswa_melihat_poster_ini\",\"score\":4,\"matchedKeywords\":[\"siswa menutup keran\",\"hemat air\",\"mengurangi pemborosan air\",\"tidak lupa menutup keran\"],\"note\":\"Tujuan perubahan perilaku sangat jelas dan sesuai masalah.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"project_overview_apa_nama_proyek_ini_dan_masalah_utama_apa_yang_ingin_diselesaikan\",\"score\":4,\"matchedKeywords\":[\"hemat air\",\"boros air\",\"toilet\",\"sekolah\",\"hemat\",\"siswa\"],\"note\":\"Analisis masalah sangat tepat dan lengkap.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"target_audience_siapa_sasaran_utamanya_bagaimana_karakteristik_usia_mereka\",\"score\":4,\"matchedKeywords\":[\"siswa smk\",\"siswa yang melintas\"],\"note\":\"Sasaran audiens sangat tepat dan jelas.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"the_message_apa_pesan_kunci_atau_slogan_utama_yang_harus_menonjol\",\"score\":4,\"matchedKeywords\":[\"tutup keran\",\"hemat air\"],\"note\":\"Pesan utama jelas, singkat, dan sesuai tujuan poster.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"timeline_kapan_desain_ini_harus_selesai\",\"score\":4,\"matchedKeywords\":[\"2 hari\",\"sketsa\",\"desain selesai\"],\"note\":\"Timeline realistis dan sesuai proyek latihan kelas.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(7, 3, 1, 33, 2, 'unlocked', 11, 3, 4, '2026-07-11 01:38:33', '2026-07-12 12:06:36', '2026-07-12 12:06:36', '2026-07-11 01:28:22', 'apakah pesan utama yang langsung terlihat jelaskan: nilai 3. Pesan utama sudah benar, tetapi belum terlalu lengkap.\napa elemen yang dominan warna tipografi layout dll: nilai 4. Elemen dominan dijelaskan dengan lengkap.\napa tujuan desain tersebut: nilai 4. Tujuan desain sangat tepat dan sesuai isi poster.\nbagian mana yang membingungkan: nilai 3. Jawaban sudah benar, tetapi masih kurang lengkap.\nbagian yang paling pertama menarik perhatian: nilai 4. Bagian yang menarik perhatian dijelaskan dengan tepat.\nsebutkan 3 masalah menurut hierarki visual: nilai 3. Masalah hierarki sudah tepat, tetapi masih bisa lebih lengkap.\nsebutkan 3 masalah pada elemen desainnya: nilai 4. Masalah elemen desain dijelaskan lengkap.\nsebutkan 3 masalah pada prinsip desainnya kontras keseimbangan dll: nilai 4. Masalah prinsip desain dijelaskan dengan sangat baik.\nsiapa target audiensnya: nilai 4. Target audiens sangat jelas dan sesuai poster wisata.', '[{\"fieldKey\":\"apakah_pesan_utama_yang_langsung_terlihat_jelaskan\",\"score\":3,\"matchedKeywords\":[\"promosi\"],\"note\":\"Pesan utama sudah benar, tetapi belum terlalu lengkap.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"apa_elemen_yang_dominan_warna_tipografi_layout_dll\",\"score\":4,\"matchedKeywords\":[\"warna mencolok\",\"warna biru\",\"foto hewan\"],\"note\":\"Elemen dominan dijelaskan dengan lengkap.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"apa_tujuan_desain_tersebut\",\"score\":4,\"matchedKeywords\":[\"promosi wisata\",\"iklan tempat wisata\",\"kebun binatang\"],\"note\":\"Tujuan desain sangat tepat dan sesuai isi poster.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"bagian_mana_yang_membingungkan\",\"score\":3,\"matchedKeywords\":[\"membingungkan\"],\"note\":\"Jawaban sudah benar, tetapi masih kurang lengkap.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"bagian_yang_paling_pertama_menarik_perhatian\",\"score\":4,\"matchedKeywords\":[\"gambar harimau\",\"harimau besar\"],\"note\":\"Bagian yang menarik perhatian dijelaskan dengan tepat.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"sebutkan_3_masalah_menurut_hierarki_visual\",\"score\":3,\"matchedKeywords\":[\"pesan utama tidak jelas\",\"fokus tidak jelas\"],\"note\":\"Masalah hierarki sudah tepat, tetapi masih bisa lebih lengkap.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"sebutkan_3_masalah_pada_elemen_desainnya\",\"score\":4,\"matchedKeywords\":[\"warna terlalu banyak\",\"font banyak\",\"gambar banyak\"],\"note\":\"Masalah elemen desain dijelaskan lengkap.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"sebutkan_3_masalah_pada_prinsip_desainnya_kontras_keseimbangan_dll\",\"score\":4,\"matchedKeywords\":[\"tidak seimbang\",\"berantakan\",\"kesatuan kurang\"],\"note\":\"Masalah prinsip desain dijelaskan dengan sangat baik.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"siapa_target_audiensnya\",\"score\":4,\"matchedKeywords\":[\"keluarga\",\"anak-anak\",\"anak sekolah\",\"wisatawan\",\"masyarakat umum\",\"liburan keluarga\"],\"note\":\"Target audiens sangat jelas dan sesuai poster wisata.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(8, 3, 1, 34, 3, 'unlocked', 12, 3, 1, '2026-07-12 07:31:12', '2026-07-12 12:06:36', '2026-07-12 12:06:36', '2026-07-11 01:28:22', 'perbaikan dan alasan mengenai aspek tata letak layout: nilai 4. Rekomendasi perbaikan dan alasan aspek layout dijelaskan dengan sangat baik.\nperbaikan dan alasan mengenai aspek tipografi: nilai 3. Solusi aspek tipografi sudah tepat, tetapi alasan masih kurang mendalam.\nperbaikan dan alasan mengenai aspek warna: nilai 3. Solusi aspek warna sudah tepat, tetapi alasan masih kurang mendalam.', '[{\"fieldKey\":\"perbaikan_dan_alasan_mengenai_aspek_tata_letak_layout\",\"score\":4,\"matchedKeywords\":[\"kurangi gambar\",\"rapikan susunan\"],\"note\":\"Rekomendasi perbaikan dan alasan aspek layout dijelaskan dengan sangat baik.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"perbaikan_dan_alasan_mengenai_aspek_tipografi\",\"score\":3,\"matchedKeywords\":[\"ganti font\"],\"note\":\"Solusi aspek tipografi sudah tepat, tetapi alasan masih kurang mendalam.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"perbaikan_dan_alasan_mengenai_aspek_warna\",\"score\":3,\"matchedKeywords\":[\"ganti warna\",\"ganti warna teks\"],\"note\":\"Solusi aspek warna sudah tepat, tetapi alasan masih kurang mendalam.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(9, 3, 1, 35, 4, 'unlocked', 13, 0, 1, '2026-07-12 11:33:43', '2026-07-12 12:06:36', '2026-07-12 12:06:36', '2026-07-11 01:28:22', 'gaya visual misal minimalis formal ceria: nilai 4. Gaya visual yang dipilih sangat tepat dan dijelaskan relevansinya dengan tema.\nkonsep desain: nilai 4. Konsep desain baru dijelaskan dengan sangat baik dan logis.\npesan utama: nilai 3. Pesan utama sudah benar, tetapi rumusan masih kurang spesifik.', '[{\"fieldKey\":\"gaya_visual_misal_minimalis_formal_ceria\",\"score\":4,\"matchedKeywords\":[\"minimalis\",\"ceria\",\"anak-anak\",\"menyenangkan\"],\"note\":\"Gaya visual yang dipilih sangat tepat dan dijelaskan relevansinya dengan tema.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"konsep_desain\",\"score\":4,\"matchedKeywords\":[\"membuat poster baru\"],\"note\":\"Konsep desain baru dijelaskan dengan sangat baik dan logis.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"pesan_utama\",\"score\":3,\"matchedKeywords\":[\"promosi wisata\",\"kebun binatang\",\"taman hewan\"],\"note\":\"Pesan utama sudah benar, tetapi rumusan masih kurang spesifik.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(10, 3, 1, 36, 5, 'unlocked', 14, 0, 2, '2026-07-12 11:35:09', '2026-07-12 12:06:36', '2026-07-12 12:06:36', '2026-07-11 01:28:22', 'Refleksi berhasil disimpan. Bagian ini tidak masuk penilaian.', '[{\"fieldKey\":\"self_reflection\",\"score\":0,\"matchedKeywords\":[],\"note\":\"Refleksi sudah diisi dan tersimpan.\",\"reviewStatus\":\"not_graded\",\"isPassed\":true}]'),
(255, 3, 2, 37, 1, 'unlocked', 15, 4, 1, '2026-07-12 12:09:18', '2026-07-12 15:45:06', '2026-07-12 15:45:06', '2026-07-12 12:09:18', 'elemen wajib visual identitas: nilai 4. Elemen wajib diidentifikasi dengan sangat lengkap baik secara visual maupun identitas sekolah.\npesan utama: nilai 4. Pesan utama dirumuskan dalam bentuk kalimat ajakan yang sangat kuat, jelas, dan solutif.\nproject overview: nilai 4. Project overview dijelaskan dengan sangat lengkap dan sesuai instruksi brief.\nspesifikasi teknis output media ukuran software: nilai 4. Spesifikasi teknis dijelaskan dengan sangat detail mencakup media, dimensi fisik, dan perangkat lunak yang digunakan.\ntarget audiens: nilai 4. Target audiens ditentukan dengan sangat spesifik dan relevan dengan lokasi kantin sekolah.\ntone mood nuansa warna: nilai 4. Tone dan pemilihan warna dijelaskan dengan sangat serasi serta mendukung psikologi kebersihan.\ntujuan: nilai 4. Tujuan poster dirumuskan dengan sangat jelas, solutif, dan berdampak nyata.', '[{\"fieldKey\":\"elemen_wajib_visual_identitas\",\"score\":4,\"matchedKeywords\":[\"logo sekolah\",\"tempat sampah\",\"gambar makanan\",\"gambar piring\"],\"note\":\"Elemen wajib diidentifikasi dengan sangat lengkap baik secara visual maupun identitas sekolah.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"pesan_utama\",\"score\":4,\"matchedKeywords\":[\"buang sampah\",\"kantin bersih\"],\"note\":\"Pesan utama dirumuskan dalam bentuk kalimat ajakan yang sangat kuat, jelas, dan solutif.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"project_overview\",\"score\":4,\"matchedKeywords\":[\"poster kampanye\",\"poster kebersihan\",\"kantin sekolah\",\"kebersihan kantin\",\"merancang poster\"],\"note\":\"Project overview dijelaskan dengan sangat lengkap dan sesuai instruksi brief.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"spesifikasi_teknis_output_media_ukuran_software\",\"score\":4,\"matchedKeywords\":[\"ukuran A3\",\"adobe illustrator\",\"canva\",\"cetak A3\"],\"note\":\"Spesifikasi teknis dijelaskan dengan sangat detail mencakup media, dimensi fisik, dan perangkat lunak yang digunakan.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"target_audiens\",\"score\":4,\"matchedKeywords\":[\"siswa siswi\"],\"note\":\"Target audiens ditentukan dengan sangat spesifik dan relevan dengan lokasi kantin sekolah.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"tone_mood_nuansa_warna\",\"score\":4,\"matchedKeywords\":[\"ceria\",\"segar\",\"bersih\",\"ramah\",\"warna hijau\",\"warna pastel\",\"terang\"],\"note\":\"Tone dan pemilihan warna dijelaskan dengan sangat serasi serta mendukung psikologi kebersihan.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true},{\"fieldKey\":\"tujuan\",\"score\":4,\"matchedKeywords\":[\"kantin bersih\"],\"note\":\"Tujuan poster dirumuskan dengan sangat jelas, solutif, dan berdampak nyata.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(257, 3, 2, 38, 2, 'unlocked', 16, 4, 1, '2026-07-12 15:42:46', '2026-07-12 15:45:06', '2026-07-12 15:45:06', '2026-07-12 12:09:18', 'Gambar jawaban sudah diupload. Siswa dinyatakan tuntas.', '[{\"fieldKey\":\"gambar_jawaban\",\"score\":4,\"matchedKeywords\":[],\"note\":\"Gambar jawaban sudah diupload.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(259, 3, 2, 39, 3, 'unlocked', 17, 4, 1, '2026-07-12 15:43:14', '2026-07-12 15:45:06', '2026-07-12 15:45:06', '2026-07-12 12:09:18', 'Gambar jawaban sudah diupload. Siswa dinyatakan tuntas.', '[{\"fieldKey\":\"gambar_jawaban\",\"score\":4,\"matchedKeywords\":[],\"note\":\"Gambar jawaban sudah diupload.\",\"reviewStatus\":\"auto_graded_passed\",\"isPassed\":true}]'),
(261, 3, 2, 40, 4, 'unlocked', 18, 0, 1, '2026-07-12 15:43:48', '2026-07-12 15:45:06', '2026-07-12 15:45:06', '2026-07-12 12:09:18', 'Refleksi berhasil disimpan. Bagian ini tidak masuk penilaian.', '[{\"fieldKey\":\"self_reflection\",\"score\":0,\"matchedKeywords\":[],\"note\":\"Refleksi sudah diisi dan tersimpan.\",\"reviewStatus\":\"not_graded\",\"isPassed\":true}]'),
(271, 3, 3, 41, 1, 'unlocked', NULL, 0, 0, '2026-07-12 12:09:25', NULL, NULL, '2026-07-12 12:09:25', NULL, NULL),
(273, 3, 3, 42, 2, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-12 12:09:25', NULL, NULL),
(275, 3, 3, 45, 3, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-12 12:09:25', NULL, NULL),
(315, 3, 4, 43, 1, 'unlocked', NULL, 0, 0, '2026-07-12 12:09:54', NULL, NULL, '2026-07-12 12:09:54', NULL, NULL),
(317, 3, 4, 44, 2, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-12 12:09:54', NULL, NULL),
(319, 3, 4, 46, 3, 'locked', NULL, 0, 0, NULL, NULL, NULL, '2026-07-12 12:09:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `uploads`
--

CREATE TABLE `uploads` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('siswa','guru') DEFAULT 'siswa',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Davina Nazwa', 'davinaaulia852@gmail.com', '$2b$10$HZsiTGUqKJxsmgTajjE24uVuVQHY65vPLS1faT0UOv69/.Lnnmx..', 'siswa', '2026-02-19 06:02:30'),
(2, 'Davina Nazwa', 'davinanau03@gmail.com', '$2b$10$xx9mlxbdaT.xl9e25YM4tuWxp0uRQfvflZex61Y/BiT0liCZ8B7MG', 'guru', '2026-02-19 06:14:36'),
(3, 'Dimas Akmal Fauzan', 'fauzandimasakmal9@gmail.com', '$2b$10$oUreMEDwTpPLKD1BRnvDCuFrGY.LEy1Szdj7UsyuqwSe2Zavyc73y', 'siswa', '2026-04-20 03:40:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `karya`
--
ALTER TABLE `karya`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_karya_project` (`project_id`),
  ADD KEY `fk_karya_user` (`user_id`);

--
-- Indexes for table `komentar_karya`
--
ALTER TABLE `komentar_karya`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_komentar_karya` (`karya_id`),
  ADD KEY `fk_komentar_user` (`user_id`);

--
-- Indexes for table `materi`
--
ALTER TABLE `materi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_materi_created_by` (`created_by`);

--
-- Indexes for table `materi_konten`
--
ALTER TABLE `materi_konten`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materi_id` (`materi_id`);

--
-- Indexes for table `proyek`
--
ALTER TABLE `proyek`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `question_rubrics`
--
ALTER TABLE `question_rubrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `question_id_2` (`question_id`,`score`);

--
-- Indexes for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_result_question_latest` (`result_id`,`question_id`,`is_latest`),
  ADD KEY `idx_question_attempt` (`question_id`,`attempt_number`),
  ADD KEY `idx_review_status` (`review_status`);

--
-- Indexes for table `quiz_meeting_access`
--
ALTER TABLE `quiz_meeting_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pertemuan` (`pertemuan`);

--
-- Indexes for table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_pertemuan` (`user_id`,`pertemuan`),
  ADD KEY `idx_user_pertemuan` (`user_id`,`pertemuan`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `student_question_progress`
--
ALTER TABLE `student_question_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_question` (`user_id`,`question_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `pertemuan` (`pertemuan`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `user_id_2` (`user_id`,`pertemuan`,`stage_order`);

--
-- Indexes for table `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `karya`
--
ALTER TABLE `karya`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `komentar_karya`
--
ALTER TABLE `komentar_karya`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `materi`
--
ALTER TABLE `materi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `materi_konten`
--
ALTER TABLE `materi_konten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `proyek`
--
ALTER TABLE `proyek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `question_rubrics`
--
ALTER TABLE `question_rubrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `quiz_meeting_access`
--
ALTER TABLE `quiz_meeting_access`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quiz_results`
--
ALTER TABLE `quiz_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_question_progress`
--
ALTER TABLE `student_question_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=502;

--
-- AUTO_INCREMENT for table `uploads`
--
ALTER TABLE `uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `karya`
--
ALTER TABLE `karya`
  ADD CONSTRAINT `fk_karya_project` FOREIGN KEY (`project_id`) REFERENCES `proyek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_karya_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `karya_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `proyek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `karya_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `komentar_karya`
--
ALTER TABLE `komentar_karya`
  ADD CONSTRAINT `fk_komentar_karya` FOREIGN KEY (`karya_id`) REFERENCES `karya` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_komentar_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `komentar_karya_ibfk_1` FOREIGN KEY (`karya_id`) REFERENCES `karya` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `komentar_karya_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materi`
--
ALTER TABLE `materi`
  ADD CONSTRAINT `fk_materi_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `materi_konten`
--
ALTER TABLE `materi_konten`
  ADD CONSTRAINT `materi_konten_ibfk_1` FOREIGN KEY (`materi_id`) REFERENCES `materi` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_rubrics`
--
ALTER TABLE `question_rubrics`
  ADD CONSTRAINT `fk_question_rubrics_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD CONSTRAINT `quiz_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `student_question_progress`
--
ALTER TABLE `student_question_progress`
  ADD CONSTRAINT `fk_question_progress_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_question_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
