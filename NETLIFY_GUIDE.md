# 🚀 E-KMS NETLIFY DEPLOYMENT GUIDE

Aplikasi ini sekarang sudah mendukung hosting statis di **Netlify** dengan database **Google Spreadsheet**.

### 📦 Cara Deploy ke Netlify:

1.  **Siapkan Repository**: Hubungkan folder ini ke GitHub/GitLab Anda.
2.  **Login ke Netlify**: Buat site baru dari Git repository tersebut.
3.  **Build Settings**:
    - **Build Command**: (Kosongkan)
    - **Publish Directory**: `.` (atau root folder)
4.  **Konfigurasi Database**:
    - Buka `assets/js/config.js`.
    - Ubah `GOOGLE_SCRIPT_URL` dengan URL Web App dari Google Apps Script Anda (seperti yang dilakukan pada langkah sebelumnya).

### ⚙️ Keunggulan Versi Static:

- **Gratis Selamanya**: Menggunakan Netlify (Static Hosting) + Google Spreadsheet (DB).
- **Tanpa Server**: Tidak perlu PHP atau MySQL server.
- **Cepat**: Konten dilayani lewat CDN Netlify.

### ⚠️ Catatan Fitur:

- Fitur utama (Dashboard, Data Anak, Input Data) sudah diporting ke JavaScript.
- Fitur PDF Printing menggunakan `window.print()` browser.
- Data disimpan real-time ke Google Sheet.
