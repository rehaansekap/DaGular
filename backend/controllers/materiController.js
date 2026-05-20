const materiData = require("../data/materi.json");

// LIST MATERI
exports.getAllMateri = (req, res) => {
  const list = materiData.map(m => ({
    pertemuan: m.pertemuan,
    judul: m.judul
  }));

  res.json(list);
};

// DETAIL MATERI
exports.getMateriById = (req, res) => {
  const id = parseInt(req.params.id);
  const materi = materiData.find(m => m.pertemuan === id);

  if (!materi) {
    return res.status(404).json({
      message: "Materi tidak ditemukan"
    });
  }

  res.json(materi);
};
