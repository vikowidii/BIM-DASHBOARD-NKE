# PANDUAN PENGGUNAAN & SERVER LAN — NKE BIM DASHBOARD
**PT Nusa Konstruksi Enjiniring Tbk**

---

## 1. Menjalankan Server (Sangat Mudah & Praktis)

Ada 2 cara mudah untuk menjalankan dashboard ini di komputer Anda:

### Cara 1: Menggunakan File Batch (1-Klik untuk Windows)
Cukup **klik dua kali** (double-click) file:
```text
jalankan-server-lan.bat
```
File ini akan otomatis mendeteksi lingkungan komputer Anda dan langsung menyalakan server lokal yang siap diakses melalui kabel LAN.

### Cara 2: Menggunakan Terminal / Command Prompt
Buka terminal pada folder proyek ini, lalu ketik:
```bash
npm install
npm run dev
```
Server akan aktif pada alamat:
- **Lokal:** `http://localhost:3000/`
- **Jaringan LAN:** `http://192.168.x.x:3000/`

---

## 2. Cara Rekan Kerja Mengakses via Kabel LAN

1. **Hubungkan Kabel LAN**: Colokkan kabel LAN antara komputer Anda dan komputer rekan kerja (atau sambungkan kedua komputer ke router / switch yang sama).
2. **Cek Alamat IP**: Lihat alamat IP yang ditampilkan di jendela terminal atau `jalankan-server-lan.bat` (contoh: `http://192.168.1.15:3000/`).
3. **Buka Browser**: Rekan kerja cukup membuka Google Chrome atau Microsoft Edge di komputernya dan mengetikkan alamat tersebut.

---

## 3. Ketentuan Hak Akses & Peran (Role Matrix)

Sistem ini memiliki 3 tingkatan hak akses yang terisolasi dengan aman:

### A. Viewer (Tamu / Peninjau Publik)
- **Tampilan Khusus**: Begitu memilih proyek di peta atau daftar, peninjau **langsung masuk ke Visualisasi 3D BIM Interaktif beserta Informasi Resmi Proyek**.
- **Tanpa Dashboard**: Akun viewer tidak dapat membuka dashboard manajemen.
- **Tanpa Dokumen & Clash**: Tab Dokumen resmi dan Issue/Clash disembunyikan sepenuhnya dari akses peninjau untuk menjaga kerahasiaan operasional internal.
- **Tanpa Angka Progres**: Di peta dan katalog, tidak menampilkan persentase deviasi/progres bagi peninjau umum.

### B. User (Staff / Engineering Proyek)
- Dapat melihat dashboard proyek lengkap dan Kurva S.
- Dapat mengunggah berkas BIM, dokumen teknis, dan laporan lapangan (*Upload Data*).
- Menunggu persetujuan Admin untuk penerbitan dokumen resmi.

### C. Admin (BIM Manager / Manajemen Pusat)
- Kontrol penuh atas seluruh proyek dan portofolio nasional.
- Menyetujui pendaftaran akun baru melalui ikon lonceng notifikasi di topbar.
- Menyetujui atau menolak berkas teknis yang diajukan oleh user.
- Menambah proyek baru ke peta beserta titik koordinat GPS.

---

## 4. Keamanan Pendaftaran Akun
- Pendaftaran akun baru wajib menggunakan email valid berdomain **`@gmail.com`**.
- Akun baru yang mendaftar akan berstatus *Menunggu* sampai disetujui oleh Administrator pada lonceng notifikasi.

---

*Hak Cipta © 2026 PT Nusa Konstruksi Enjiniring Tbk. Seluruh hak cipta dilindungi undang-undang.*
