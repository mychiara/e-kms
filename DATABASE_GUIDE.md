# Panduan Update Database E-KMS (Full Feature Upgrade)

Untuk mendukung fitur lengkap KMS (Pengukuran Lengkap, Obat Cacing, SDIDTK, dan ASI/PMT), mohon lakukan penambahan kolom dan sheet berikut pada Database (Google Sheet atau SQL) Anda.

## 1. Update Sheet: `penimbangan`

Tambahkan kolom-kolom berikut di sebelah kanan kolom terakhir (header baris 1):

- `tinggi_badan` (Angka, cm)
- `lingkar_kepala` (Angka, cm)
- `asi_eksklusif` (Teks/Boolean: "Ya"/"Tidak")
- `tindakan` (Teks: Catatan tindakan/nasihat)

**Urutan Kolom Penimbangan yang Disarankan:**
`id | anak_id | tgl_ukur | berat_badan | tinggi_badan | lingkar_kepala | status_gizi | asi_eksklusif | tindakan | created_at`

## 2. Buat Sheet Baru: `obat_cacing`

Untuk mencatat pemberian obat cacing berkala.
**Header Kolom:**
`id | anak_id | tgl_diberikan | jenis_obat | keterangan | created_at`

## 3. Buat Sheet Baru: `perkembangan_anak`

Untuk mencatat hasil Deteksi Dini Tumbuh Kembang (SDIDTK).
**Header Kolom:**
`id | anak_id | tgl_catat | usia_bulan | hasil_sdidtk | motorik_kasar | motorik_halus | bicara_bahasa | sosialisasi | tindakan | created_at`

_Catatan: `hasil_sdidtk` diisi "Sesuai", "Meragukan", atau "Penyimpangan"._

## 4. Reset/Reload Aplikasi

Setelah menambahkan kolom dan sheet di atas, silakan refresh aplikasi E-KMS Anda.

---

**PENTING**: Pastikan nama kolom ditulis dengan huruf kecil dan menggunakan underscore (\_) sebagai pemisah spasi.

## 5. Sheet/Tabel: `users` (Wajib untuk Login)

Pastikan tabel `users` tersedia dengan kolom berikut untuk fitur Login & Role:
`id | username | password | nama_lengkap | role | created_at`

- **role** harus diisi salah satu dari: `admin`, `kader`, atau `orangtua`.
- Contoh data admin default:
  - username: `admin`
  - password: `admin123`
  - role: `admin`

## 6. Sheet/Tabel: `jadwal_posyandu` (Wajib untuk Jadwal)

Untuk menyimpan agenda kegiatan Posyandu:
`id | nama_kegiatan | tgl_kegiatan | tempat | keterangan | created_at`

- **tgl_kegiatan**: Format Tanggal (YYYY-MM-DD).
- **nama_kegiatan**: Teks (Contoh: "Posyandu Mawar Bulan Februari").

## 7. Sheet/Tabel: `alerts` (Otomatis)

Untuk notifikasi sistem (Gizi Buruk, dll):
`id | anak_id | message | is_read | created_at`

- **is_read**: Angka (0 = Belum dibaca, 1 = Sudah dibaca).

## 8. HEADER SHEET `anak` (WAJIB SAMA PERSIS)

Agar data bisa masuk, **Baris 1 (Header)** di sheet `anak` **HARUS** berisi kolom-kolom berikut secara berurutan (atau setidaknya memiliki nama kolom ini).

**Silakan Copy-Paste baris berikut ke Baris 1 di Sheet `anak`:**

`id | nama | nik | tgl_lahir | jenis_kelamin | nama_ibu | alamat | berat_lahir | status_aktif | panjang_lahir | anak_ke | status_bpjs | nik_ibu | usia_ibu | pendidikan_ibu | pekerjaan_ibu | status_gizi_ibu | riwayat_kehamilan | created_at`

**Urutan Sel Spreadsheet (A1 s/d S1):**

1. **A1**: `id`
2. **B1**: `nama`
3. **C1**: `nik`
4. **D1**: `tgl_lahir`
5. **E1**: `jenis_kelamin`
6. **F1**: `nama_ibu`
7. **G1**: `alamat`
8. **H1**: `berat_lahir`
9. **I1**: `status_aktif`
10. **J1**: `panjang_lahir`
11. **K1**: `anak_ke`
12. **L1**: `status_bpjs`
13. **M1**: `nik_ibu`
14. **N1**: `usia_ibu`
15. **O1**: `pendidikan_ibu`
16. **P1**: `pekerjaan_ibu`
17. **Q1**: `status_gizi_ibu`
18. **R1**: `riwayat_kehamilan`
19. **S1**: `created_at`

Jika ada kolom yang namanya salah (misal: `anak ke` pakai spasi, seharusnya `anak_ke`), sistem Google Sheet **tidak akan bisa** mencocokkan data, sehingga data tidak tersimpan.
