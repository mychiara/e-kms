# Panduan Migrasi Firebase Firestore - E-KMS

Sistem E-KMS sekarang mendukung **Firebase Firestore** sebagai database utama. Berikut adalah langkah-langkah untuk menyiapkan Firebase Anda.

## 1. Menyiapkan Proyek Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat proyek baru (misal: `E-KMS-Online`).
3. Di menu samping, klik **Build > Firestore Database**.
4. Klik **Create database**.
5. Pilih **Start in test mode** (untuk pengembangan) atau **Production mode** (dengan aturan keamanan yang benar).
6. Pilih lokasi server terdekat (misal: `asia-southeast2` untuk Jakarta).

## 2. Mengambil Konfigurasi Firebase

1. Buka **Project Settings** (ikon gerigi).
2. Di bagian **Your apps**, klik ikon `</>` (Web App).
3. Daftarkan aplikasi (misal: `ekms-web`).
4. Copy objek `firebaseConfig` yang muncul.
5. Buka file `assets/js/config.js` di folder proyek ini.
6. Tempelkan nilai-nilai tersebut ke dalam bagian `FIREBASE_CONFIG`.

## 3. Struktur Koleksi (Otomatis)

Sistem akan otomatis membuat koleksi saat data pertama kali disimpan. Namun, untuk login awal, Anda perlu membuat dokumen pertama di koleksi `users`.

### Koleksi: `users`

Buat dokumen dengan ID bebas, lalu tambahkan field:

- `username`: `admin`
- `password`: `admin123`
- `nama_lengkap`: `Administrator`
- `role`: `admin`

## 4. Keamanan Firestore (Security Rules)

Jika Anda menggunakan Production Mode, pastikan aturan Firestore mengizinkan baca/tulis bagi user yang terautentikasi atau publik (tergantung kebutuhan Anda).

Contoh aturan publik (Sangat Terbuka - Gunakan hanya untuk testing):

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 5. Pembersihan Cache

Setelah mengubah `config.js`, pastikan untuk melakukan **Hard Refresh** (Ctrl + F5) pada browser untuk memastikan file konfigurasi terbaru dimuat.
