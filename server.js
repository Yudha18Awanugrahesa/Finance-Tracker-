const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cloudtrack_db",
});

db.connect((err) => {
  if (err) {
    console.error("Koneksi ke XAMPP MySQL gagal:", err);
    return;
  }
  console.log("Berhasil terhubung ke database MySQL XAMPP!");
});

app.post("/api/transactions", (req, res) => {
  const {
    tanggal,
    deskripsi,
    jenis_transaksi,
    kategori,
    nominal,
    metode_pembayaran,
    keterangan,
  } = req.body;

  // Cukup masukkan 7 kolom data saja, ID biarkan kosong agar terisi otomatis
  const query =
    "INSERT INTO transactions (Tanggal, Deskripsi, Jenis_Transaksi, Kategori, Nominal, Metode_Pembayaran, Keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      tanggal,
      deskripsi,
      jenis_transaksi,
      kategori,
      nominal,
      metode_pembayaran,
      keterangan,
    ],
    (err, result) => {
      if (err) {
        console.error("Gagal menyimpan data:", err);
        return res.status(500).json({ error: err.message });
      }
      res
        .status(201)
        .json({ message: "Transaksi berhasil disimpan!", id: result.insertId });
    },
  );
});

// === TAMBAHKAN ENDPOINT GET INI DI SINI ===
app.get("/api/transactions", (req, res) => {
  const query = "SELECT * FROM transactions ORDER BY ID DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Gagal mengambil data:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
// ==========================================

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});