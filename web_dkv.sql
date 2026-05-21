-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2026 at 04:53 AM
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
  `answer_type` enum('text','image','text_image') DEFAULT 'text',
  `pendahuluan_lkpd` text DEFAULT NULL,
  `judul_lkpd` varchar(255) DEFAULT NULL,
  `answer_fields` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `question`, `image_url`, `created_at`, `pertemuan`, `answer_type`, `pendahuluan_lkpd`, `judul_lkpd`, `answer_fields`) VALUES
(31, 'Tugas 1:\r\nBacalah situasi di bawah ini dan isi kolom komponen Design Brief-nya!\r\n“Sekolah ingin mengadakan kampanye hemat air di lingkungan SMK. Targetnya adalah seluruh siswa agar tidak membiarkan keran terbuka di kamar mandi. Poster akan ditempel di pintu setiap toilet. Tantangannya, pesan harus langsung dipahami dalam waktu kurang dari 5 detik karena audiens hanya melintas, dan desain tidak boleh menggunakan bahasa yang menggurui/galak agar siswa tidak merasa terbebani.”\r\n\"Catatan untuk Timeline: Tuliskan target waktu pengerjaanmu mulai dari tahap mencari ide hingga desain digitalmu siap, agar kamu belajar mengelola waktu layaknya seorang desainer profesional.\"', NULL, '2026-04-29 06:50:05', 1, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Project Overview. Apa nama proyek ini dan masalah utama apa yang ingin diselesaikan?\",\"2. Category/Industry. Di bidang apa proyek ini berjalan? (Pendidikan, Komersial, atau Sosial?).\",\"3. Goals/Objectives. Perubahan perilaku apa yang diinginkan sekolah setelah siswa melihat poster ini?\",\"4. Target Audience. Siapa sasaran utamanya? Bagaimana karakteristik/usia mereka?\",\"5. The Message. Apa pesan kunci atau slogan utama yang harus menonjol?\",\"6. Deliverables. Apa output fisik desainnya dan di mana lokasi penempatannya?\",\"7. Timeline. Kapan desain ini harus selesai dan siap cetak?\",\"8. Constraints. Apa saja batasan atau tantangan teknis yang harus diperhatikan dalam desain ini?\"]'),
(33, 'Tugas 2: Analisis Kritis\r\nAmatilah gambar poster dibawah (Poster yang memiliki masalah visual clutter atau pesan yang tidak jelas).\r\nLangkah 1: Memahami Konteks Desain.\r\nLangkah 2: Observasi Visual (Elemen & Prinsip).\r\nLangkah 3: Evaluasi Hierarki Visual.\r\nLangkah 4: Identifikasi Masalah.', 'http://localhost:5000/uploads/quiz/1777457736929-733642266.jpg', '2026-04-29 10:15:38', 1, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Apa tujuan desain tersebut?\",\"2. Siapa target audiensnya?\",\"3. Apa elemen yang dominan (warna, tipografi, layout, dll):\",\"4. Bagian yang paling pertama menarik perhatian:\",\"5. Apakah pesan utama yang langsung terlihat? Jelaskan.\",\"6. Bagian mana yang membingungkan?\",\"7. Sebutkan 3 masalah pada elemen desainnya:\",\"8. Sebutkan 3 masalah pada prinsip desainnya (kontras, keseimbangan, dll):\",\"9. Sebutkan 3 masalah menurut hierarki visual:\"]'),
(34, 'Tugas 3: Rekomendasi Perbaikan\r\nSebagai seorang desainer yang bertugas melakukan \'Redesign\', berikan solusi teknis untuk memperbaiki kegagalan komunikasi pada poster di Tugas 2. Jelaskan apa yang diubah dan mengapa perubahan itu penting secara fungsi desain.', NULL, '2026-04-29 10:17:52', 1, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Perbaikan dan Alasan mengenai Aspek Tata Letak (Layout):\",\"2. Perbaikan dan Alasan mengenai Aspek Tipografi:\",\"3. Perbaikan dan Alasan mengenai Aspek Warna:\"]'),
(35, 'Tugas 4: Ide Awal Desain\r\nBerdasarkan hasil analisis, buatlah ide singkat desain baru untuk tema yang sama seperti poster pada Tugas 2:', NULL, '2026-04-29 10:19:45', 1, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Konsep Desain:\",\"2. Pesan Utama:\",\"3. Gaya Visual (misal: minimalis, formal, ceria):\"]'),
(36, 'E. Instrumen Penilaian (Self-Reflection)\nJawablah pertanyaan berikut:', NULL, '2026-04-29 10:48:05', 1, 'text', 'A. Tujuan Pembelajaran\r\nPeserta didik mampu:\r\n1. Menjelaskan desain digital sebagai aktivitas problem solving. \r\n2. Mengidentifikasi komponen dalam design brief. \r\n3. Menganalisis kesalahan komunikasi visual berdasarkan konsep desain. \r\n4. Memberikan rekomendasi perbaikan desain secara detail dan logis (elaboration). \r\n5. Menyusun ide awal desain berdasarkan hasil analisis.\r\n\r\nB. Media & Sumber Belajar\r\n• Alat: PC/Laptop, Proyektor, Alat Tulis.\r\n• Bahan: Contoh gambar poster yang gagal/buruk (terlampir di modul).\r\n• Sumber Belajar: Modul Materi \"Desain Digital & Problem Solving\".\r\n\r\nC. Landasan Teori (Ringkasan)\r\n• Desain adalah Problem Solving: Desain tidak dimulai dari estetika, tapi dari kebutuhan untuk menyelesaikan masalah komunikasi.\r\n• Design Brief: Kompas desainer yang berisi tujuan, pesan, target audiens, dan konteks.\r\n• Kegagalan Visual: Terjadi karena Visual Clutter (terlalu ramai), Ambiguitas Simbol (makna ganda), atau Konflik Konteks (warna/font tidak sesuai tema).', 'LKPD 1: Bedah Masalah dan Solusi Komunikasi Visual', '[\"1. Apa hal terpenting yang harus diketahui sebelum mendesain?\",\"2. Mengapa sebuah desain yang \\\"indah\\\" belum tentu disebut desain yang \\\"berhasil\\\"?\",\"3. Apa kesulitan yang kamu alami saat menganalisis desain?\"]'),
(37, 'Tugas 1: Design Brief \r\nInstruksi: Sebagai desainer, Anda diminta membuat poster kampanye “Kebersihan Kantin Sekolah”. Bacalah dan lengkapi elemen Design Brief berikut sebelum membuat mind mapping dan sketsa. Design Brief ini menjadi dasar agar desain tidak hanya menarik, tetapi juga sesuai dengan masalah, audiens, pesan, dan kebutuhan media.', NULL, '2026-05-12 14:40:13', 2, 'text', 'A. Tujuan Pembelajaran\r\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\r\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\r\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\r\n\r\nB. Media/Alat, Bahan, dan Sumber Belajar\r\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\r\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\r\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\r\n\r\nC. Landasan Teori\r\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\r\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\r\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\r\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).\r\n• Elaboration: Kemampuan mengembangkan ide menjadi rancangan yang lebih rinci melalui penambahan detail visual, susunan komposisi, ikon, teks, warna, dan elemen pendukung lainnya.', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '[\"1. Project Overview:\",\"2. Tujuan:\",\"3. Target Audiens:\",\"4. Pesan Utama:\",\"5. Tone & Mood (Nuansa, Warna)\",\"6. Elemen Wajib (Visual, Identitas):\",\"7. Spesifikasi Teknis (Output Media, Ukuran, Software):\"]'),
(38, '2. Mind Mapping Area \n(Gambarkan lingkaran di tengah dengan tulisan \"Kebersihan Kantin\", lalu tarik garis cabang untuk menuliskan kata kunci sebanyak mungkin).', NULL, '2026-05-12 14:41:07', 2, 'image', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\n\nB. Media/Alat, Bahan, dan Sumber Belajar\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\n\nC. Landasan Teori\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '1. Mind Mapping:'),
(39, '3. Thumbnail Sketches \nBuatlah 3 sketsa secara kasar pada kotak di bawah ini!', NULL, '2026-05-12 14:42:17', 2, 'image', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\n\nB. Media/Alat, Bahan, dan Sumber Belajar\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\n\nC. Landasan Teori\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '1. Thumbnail Sketches'),
(40, 'E. Instrumen Penilaian (Self-Reflection)\r\nJawablah dengan jujur sesuai dengan apa yang Anda rasakan setelah proses ideasi:', NULL, '2026-05-12 14:43:26', 2, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi banyak gagasan kata kunci melalui Mind Mapping berdasarkan Design Brief kampanye sosial.\n2. Peserta didik mampu merancang sketsa kasar (thumbnail sketches) berdasarkan kata kunci yang ditemukan.\n3. Peserta didik mampu menerapkan kemampuan berpikir kreatif (Fluency & Flexibility) dalam proses ideasi desain.\n\nB. Media/Alat, Bahan, dan Sumber Belajar\n• Media/Alat: PC/Laptop, Software CorelDRAW, LCD Proyektor.\n• Bahan: Buku sketsa/Kertas A4, pensil, penghapus.\n• Sumber Belajar: Modul Materi \"Brainstorming & Fluency dalam Desain Digital\".\n\nC. Landasan Teori\n• Brainstorming: Proses menghasilkan sebanyak mungkin ide tanpa menilai benar/salah di awal.\n• Mind Mapping: Teknik memetakan ide secara visual mulai dari tema utama di tengah menuju cabang-cabang kata kunci yang lebih spesifik.\n• Fluency (Kelancaran): Kemampuan menghasilkan banyak ide/kata kunci dalam waktu singkat.\n• Flexibility (Keluwesan): Kemampuan menghasilkan ide yang bervariasi (tidak monoton pada satu bentuk).', 'LKPD 2: Brainstorming dan Ideasi Visual dalam Komputer Grafis', '[\"1. Berapa banyak kata kunci yang berhasil Anda temukan di Mind Mapping?\",\"2. Dari 3 sketsa yang dibuat, manakah yang menurut Anda paling unik dan tidak terpikirkan oleh teman lain? Jelaskan singkat alasannya!\",\"3. Apa kendala utama Anda saat mencoba mencari ide yang berbeda-beda (Flexibility)?\"]'),
(41, 'Tugas 1: Eksplorasi Variasi Digital (Indikator: Flexibility)\r\nBuka file CorelDRAW hasil Digital Trace pertemuan kemarin (Nama_Kelas_Pertemuan2_DigitalTrace.cdr). Buatlah 2 halaman (Page) yang berbeda di dalam file tersebut dengan ketentuan kontras secara ekstrem:\r\n\r\n1. Halaman 1 - Variasi 1 (Image Dominant): Fokuskan komposisi pada gambar/ilustrasi utama dengan ukuran yang sangat besar. Teks/tipografi diletakkan dengan ukuran lebih kecil sebagai pendukung visual.\r\n2. Halaman 2 - Variasi 2 (Text Dominant): Fokuskan komposisi pada tipografi judul (headline) yang sangat besar, tebal, dan berani. Gambar ilustrasi hanya digunakan sebagai aksen kecil, pemanis, atau latar belakang.', NULL, '2026-05-12 17:09:27', 3, 'image', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi minimal dua variasi tata letak digital yang berbeda secara ekstrem dari satu sketsa terbaik.\n2. Peserta didik mampu menerapkan prinsip hierarki visual agar pesan utama tetap tersampaikan dalam berbagai variasi komposisi. \n3. Peserta didik mampu memberikan alasan logis (justifikasi) atas pemilihan elemen visual yang digunakan.\n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: Hasil sketsa terbaik dari Pertemuan 2.\n• Sumber Belajar: Modul \"Eksplorasi Layout & Justifikasi Profesional\".\n\nC. Landasan Teori (Ringkasan)\n• Eksplorasi Layout: Proses mengembangkan satu ide menjadi beberapa alternatif tata letak tanpa mengubah pesan utamanya.\n• Hierarki Visual: Pengaturan urutan elemen desain agar audiens tahu mana yang harus dilihat pertama, kedua, dan seterusnya.\n• Justifikasi Desain: Penjelasan rasional mengapa sebuah elemen (warna, font, posisi) dipilih. Desain yang baik bukan soal \"suka/tidak suka\", tapi \"efektif/tidak efektif\".', 'LKPD 3: EKSPLORASI LAYOUT & JUSTIFIKASI PROFESIONAL', '[\"1. Variasi 1 (Image Dominant):\",\"2. Variasi 2 (Text Dominant):\"]'),
(42, 'Tugas 2: Justifikasi Profesional (Indikator: Elaboration)\r\nSetelah selesai membuat dua variasi di CorelDRAW, pilihlah satu variasi terbaik menurut Anda. Berikan penjelasan logis dan argumen desain Anda sendiri secara mandiri pada kolom di bawah ini:\r\nRumus Justifikasi: > \"Saya menggunakan [Elemen Visual] karena ingin menyampaikan kesan [Identitas Pesan] agar audiens merasa [Efek Psikologis].\"', NULL, '2026-05-12 17:10:30', 3, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi minimal dua variasi tata letak digital yang berbeda secara ekstrem dari satu sketsa terbaik.\n2. Peserta didik mampu menerapkan prinsip hierarki visual agar pesan utama tetap tersampaikan dalam berbagai variasi komposisi. \n3. Peserta didik mampu memberikan alasan logis (justifikasi) atas pemilihan elemen visual yang digunakan.\n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: Hasil sketsa terbaik dari Pertemuan 2.\n• Sumber Belajar: Modul \"Eksplorasi Layout & Justifikasi Profesional\".\n\nC. Landasan Teori (Ringkasan)\n• Eksplorasi Layout: Proses mengembangkan satu ide menjadi beberapa alternatif tata letak tanpa mengubah pesan utamanya.\n• Hierarki Visual: Pengaturan urutan elemen desain agar audiens tahu mana yang harus dilihat pertama, kedua, dan seterusnya.\n• Justifikasi Desain: Penjelasan rasional mengapa sebuah elemen (warna, font, posisi) dipilih. Desain yang baik bukan soal \"suka/tidak suka\", tapi \"efektif/tidak efektif\".', 'LKPD 3: EKSPLORASI LAYOUT & JUSTIFIKASI PROFESIONAL', '[\"1. Justifikasi Warna:\",\"2. Justifikasi Tipografi (Font):\",\"3. Justifikasi Komposisi:\"]'),
(43, 'Tugas 1: Professional Finishing \r\nBuka kembali file CorelDRAW dari Pertemuan 3. Pilihlah satu variasi layout terbaik (apakah yang dominan ilustrasi atau dominan teks) untuk masuk ke tahap penyempurnaan (finishing). Lalu jawab dengan Ya atau Tidak untuk setiap pertanyaannya.', NULL, '2026-05-12 17:19:57', 4, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu menyempurnakan (finishing) desain poster dengan ketelitian pada detail teknis (kerning, spasi, dan margin). \n2. Peserta didik mampu melakukan ekspor file ke dalam format yang tepat (JPG/PDF) sesuai kebutuhan. \n3. Peserta didik mampu memberikan kritik membangun dan apresiasi terhadap karya teman berdasarkan prinsip komunikasi visual. \n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: File desain variasi terbaik dari Pertemuan 3.\n• Sumber Belajar: Website pembelajaran di Modul \"Finishing & Design Critique\".\n\nC. Landasan Teori (Ringkasan)\n• Finishing: Tahap memastikan desain siap dikonsumsi publik. Fokus pada hal kecil seperti Kerning (jarak antar huruf) dan Leading (jarak antar baris).\n• Final Quality Control: Pengecekan akhir untuk menghindari kesalahan ketik (typo) atau elemen yang terpotong.\n• Design Critique: Proses diskusi profesional untuk meningkatkan kualitas karya, bukan untuk menjatuhkan desainer.', 'LKPD 4: FINISHING & DESIGN CRITIQUE', '[\"1. Kerning: Jarak antar huruf pada judul sudah nyaman dibaca (tidak terlalu rapat/renggang).\",\"2. Margin/Safe Zone: Tidak ada teks atau logo yang terlalu mepet ke pinggir kanvas.\",\"3. Kontras Warna: Teks terbaca jelas di atas latar belakang.\",\"4. Format File: Ekspor karya final dengan format JPG (Resolusi 300 DPI) dan berikan nama file: NamaSiswa_PosterKebersihanKantin_Final.jpg.\"]'),
(44, 'Tugas 2: Design Critique (Indikator: Evaluation)\nSilakan buka website pembelajaran dan unggah file poster finalmu (JPG) pada galeri yang tersedia. Pilih karya salah satu temanmu, sebelum menuliskan komentar di website, susunlah draf kritikmu di bawah ini agar masukan yang kamu berikan lebih profesional dan terstruktur. Setelah draf di atas selesai, salin (ketik ulang) draf tersebut ke kolom komentar di bawah karya temanmu pada website.', NULL, '2026-05-12 17:25:35', 4, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu menyempurnakan (finishing) desain poster dengan ketelitian pada detail teknis (kerning, spasi, dan margin). \n2. Peserta didik mampu melakukan ekspor file ke dalam format yang tepat (JPG/PDF) sesuai kebutuhan. \n3. Peserta didik mampu memberikan kritik membangun dan apresiasi terhadap karya teman berdasarkan prinsip komunikasi visual. \n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: File desain variasi terbaik dari Pertemuan 3.\n• Sumber Belajar: Website pembelajaran di Modul \"Finishing & Design Critique\".\n\nC. Landasan Teori (Ringkasan)\n• Finishing: Tahap memastikan desain siap dikonsumsi publik. Fokus pada hal kecil seperti Kerning (jarak antar huruf) dan Leading (jarak antar baris).\n• Final Quality Control: Pengecekan akhir untuk menghindari kesalahan ketik (typo) atau elemen yang terpotong.\n• Design Critique: Proses diskusi profesional untuk meningkatkan kualitas karya, bukan untuk menjatuhkan desainer.', 'LKPD 4: FINISHING & DESIGN CRITIQUE', '[\"1. Apresiasi (Apa yang menarik?):\",\"2. Analisis Masalah (Apa yang kurang efektif?):\",\"3. Saran Perbaikan (Solusi konkret):\"]'),
(45, 'E. Self-Reflection\nJawablah dengan jujur setelah mengerjakan tugas pada pertemuan 3 ini.', NULL, '2026-05-20 04:28:33', 3, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu memproduksi minimal dua variasi tata letak digital yang berbeda secara ekstrem dari satu sketsa terbaik.\n2. Peserta didik mampu menerapkan prinsip hierarki visual agar pesan utama tetap tersampaikan dalam berbagai variasi komposisi. \n3. Peserta didik mampu memberikan alasan logis (justifikasi) atas pemilihan elemen visual yang digunakan.\n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: Hasil sketsa terbaik dari Pertemuan 2.\n• Sumber Belajar: Modul \"Eksplorasi Layout & Justifikasi Profesional\".\n\nC. Landasan Teori (Ringkasan)\n• Eksplorasi Layout: Proses mengembangkan satu ide menjadi beberapa alternatif tata letak tanpa mengubah pesan utamanya.\n• Hierarki Visual: Pengaturan urutan elemen desain agar audiens tahu mana yang harus dilihat pertama, kedua, dan seterusnya.\n• Justifikasi Desain: Penjelasan rasional mengapa sebuah elemen (warna, font, posisi) dipilih. Desain yang baik bukan soal \"suka/tidak suka\", tapi \"efektif/tidak efektif\".', 'LKPD 3: EKSPLORASI LAYOUT & JUSTIFIKASI PROFESIONAL', '[\"1. Manakah yang lebih sulit: Mencari ide di atas kertas (Pertemuan 2) atau mengembangkan variasi tata letak di komputer (Pertemuan 3)? Jelaskan alasannya!\",\"2. Apakah pesan utama kampanye tetap dapat terbaca dan tersampaikan dengan jelas meskipun tata letak elemennya diubah secara ekstrem?\"]'),
(46, 'E. Refleksi Akhir Proses Kreatif\nJawab dengan jujur apa yang dirasakan setelah belajar selama 4 pertemuan ini.', NULL, '2026-05-20 04:34:36', 4, 'text', 'A. Tujuan Pembelajaran\n1. Peserta didik mampu menyempurnakan (finishing) desain poster dengan ketelitian pada detail teknis (kerning, spasi, dan margin). \n2. Peserta didik mampu melakukan ekspor file ke dalam format yang tepat (JPG/PDF) sesuai kebutuhan. \n3. Peserta didik mampu memberikan kritik membangun dan apresiasi terhadap karya teman berdasarkan prinsip komunikasi visual. \n\nB. Media & Sumber Belajar\n• Alat: PC/Laptop, Software CorelDRAW.\n• Bahan: File desain variasi terbaik dari Pertemuan 3.\n• Sumber Belajar: Website pembelajaran di Modul \"Finishing & Design Critique\".\n\nC. Landasan Teori (Ringkasan)\n• Finishing: Tahap memastikan desain siap dikonsumsi publik. Fokus pada hal kecil seperti Kerning (jarak antar huruf) dan Leading (jarak antar baris).\n• Final Quality Control: Pengecekan akhir untuk menghindari kesalahan ketik (typo) atau elemen yang terpotong.\n• Design Critique: Proses diskusi profesional untuk meningkatkan kualitas karya, bukan untuk menjatuhkan desainer.', 'LKPD 4: FINISHING & DESIGN CRITIQUE', '[\"1. Setelah melewati 4 pertemuan (dari memahami Brief hingga Finishing), ceritakan satu hal paling berharga yang kamu pelajari tentang proses menjadi seorang desainer! Jawaban:\"]');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL,
  `result_id` int(11) DEFAULT NULL,
  `question_id` int(11) DEFAULT NULL,
  `answer_text` text DEFAULT NULL,
  `answer_image` varchar(255) DEFAULT NULL,
  `score` int(11) DEFAULT 0,
  `teacher_note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_answers`
--

INSERT INTO `quiz_answers` (`id`, `result_id`, `question_id`, `answer_text`, `answer_image`, `score`, `teacher_note`) VALUES
(5, 2, 31, '{\"1. Tujuan Desain:\":\"Meningkatkan kesadaran warga sekolah untuk menghemat penggunaan air dan memastikan tidak ada sumber air yang terbuang sia-sia.\",\"2. Pesan Utama:\":\"\\\"Matikan keran setelah digunakan\\\" atau \\\"Hemat air untuk masa depan sekolah kita\\\".\",\"3. Target Audiens:\":\"Seluruh warga SMK Negeri 3 Kuningan.\",\"4. Konteks Penggunaan:\":\"Ditempel di area strategis seperti pintu masuk atau dinding bagian dalam setiap toilet sekolah.\"}', NULL, 0, NULL),
(6, 2, 33, '{\"1. Apa tujuan desain tersebut?\":\"Mempromosikan taman wisata hewan (taman safari) Arbuckle Wilderness serta fasilitas penginapan yang tersedia.\",\"2. Siapa target audiensnya?\":\"Wisatawan, keluarga yang sedang berlibur, atau pecinta hewan.\",\"3. Apa elemen yang dominan (warna, tipografi, layout, dll):\":\"Warna merah dan biru yang sangat kontras, penggunaan banyak foto hewan yang tumpang tindih, serta berbagai jenis tipografi (font) yang berbeda-beda.\",\"4. Bagian yang paling pertama menarik perhatian:\":\"Foto wajah harimau di sisi kiri atau teks kuning \\\"Rediscover the All-New\\\" yang memiliki efek outline tebal.\",\"5. Apakah pesan utama yang langsung terlihat? Jelaskan.\":\"Tidak secara efektif. Meskipun teks \\\"Rediscover the All-New\\\" besar, audiens terdistraksi oleh terlalu banyak elemen visual (foto dan teks kecil) yang berebut perhatian secara bersamaan.\",\"6. Bagian mana yang membingungkan?\":\"Area di tengah yang berisi daftar teks kecil (nama-nama hewan) di atas latar belakang foto, serta tumpukan logo dan alamat di bagian bawah yang sangat rapat.\",\"7. Sebutkan 3 masalah pada elemen desainnya:\":\"Penggunaan foto yang terlalu banyak dengan pemotongan (cropping) yang tidak rapi, menciptakan visual clutter.\",\"8. Sebutkan 3 masalah pada prinsip desainnya (kontras, keseimbangan, dll):\":\"Kurangnya white space (ruang kosong) sehingga desain terasa sesak dan tidak seimbang.\",\"9. Sebutkan 3 masalah menurut hierarki visual:\":\"Tidak ada alur baca yang jelas; mata audiens tidak diarahkan ke satu titik fokus utama sebelum membaca informasi detail.\"}', NULL, 0, NULL),
(7, 2, 34, '{\"1. Perbaikan dan Alasan mengenai Aspek Tata Letak (Layout):\":\"Mengurangi jumlah foto dan menggunakan satu foto utama yang paling ikonik sebagai hero image. Alasannya untuk mengurangi jumlah foto dan menggunakan satu foto utama yang paling ikonik sebagai hero image.\",\"2. Perbaikan dan Alasan mengenai Aspek Tipografi:\":\"Membatasi penggunaan jenis huruf (maksimal 2-3 jenis font) dan mengatur ukuran teks berdasarkan tingkat kepentingannya. Sehingga meningkatkan keterbacaan (readability) informasi penting seperti lokasi dan nomor telepon.\",\"3. Perbaikan dan Alasan mengenai Aspek Warna:\":\"Menggunakan palet warna yang lebih harmonis dan menghindari tabrakan warna yang terlalu mencolok pada latar belakang teks. Untuk menghindari kelelahan mata audiens dan memperkuat identitas branding yang profesional\"}', NULL, 0, NULL),
(8, 2, 35, '{\"1. Konsep Desain:\":\"\\\"Gerbang Petualangan Alam\\\".\",\"2. Pesan Utama:\":\"Kemudahan akses menuju petualangan liar yang tak terlupakan.\",\"3. Gaya Visual (misal: minimalis, formal, ceria):\":\"Modern-Minimalis dengan penekanan pada fotografi alam berkualitas tinggi.\"}', NULL, 0, NULL),
(9, 2, 36, '{\"1. Apa hal terpenting yang harus diketahui sebelum mendesain?\":\"Memahami Design Brief, terutama mengenai siapa audiensnya dan apa masalah yang ingin diselesaikan melalui desain tersebut.\",\"2. Mengapa sebuah desain yang \\\"indah\\\" belum tentu disebut desain yang \\\"berhasil\\\"?\":\"Karena desain bukan sekadar estetika. Jika desain indah tetapi gagal menyampaikan pesan atau tidak dipahami oleh audiens, maka desain tersebut gagal berfungsi sebagai alat problem solving.\",\"3. Apa kesulitan yang kamu alami saat menganalisis desain?\":\"Menentukan elemen mana yang paling krusial untuk diperbaiki terlebih dahulu karena banyaknya kesalahan visual yang saling berkaitan pada objek poster.\"}', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_results`
--

CREATE TABLE `quiz_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `pertemuan` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `status` enum('pending','graded') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_results`
--

INSERT INTO `quiz_results` (`id`, `user_id`, `pertemuan`, `score`, `status`, `created_at`) VALUES
(2, 1, 1, 0, 'pending', '2026-04-29 11:13:40');

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
-- Indexes for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quiz_results`
--
ALTER TABLE `quiz_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- Constraints for table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD CONSTRAINT `quiz_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
