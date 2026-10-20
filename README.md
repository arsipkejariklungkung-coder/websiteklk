# KERTAGOSA — Portal Pelayanan Terpadu Kejaksaan Negeri Klungkung

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zona Integritas](https://img.shields.io/badge/WBK%20%2F%20WBBM-Kejari%20Klungkung-gold.svg)](#)

Portal Resmi Pelayanan Terpadu Satu Pintu (PTSP) Digital **KERTAGOSA** Kejaksaan Negeri Klungkung. Sistem ini dirancang untuk mewujudkan pelayanan hukum yang berkeadilan, transparan, akuntabel, dan humanis menuju birokrasi berpredikat WBK / WBBM.

---

## 🌟 Fitur Utama

### 1. 4 Pilar Layanan Unggulan
- **JAGADITA (Jadwal Sidang Digital)**: Transparansi jadwal sidang perkara pidana umum dan khusus secara real-time.
- **MASADU (Masyarakat Sampaikan Aduan)**: Sistem pengaduan publik terenkripsi dengan pelacakan kode tiket (*tracking code*).
- **SEMARA BAKTI (Pengantaran Barang Bukti)**: Layanan permohonan pengantaran barang bukti inkracht langsung ke rumah warga (gratis).
- **Pos Bantuan Hukum DATUN (YANHAL)**: Layanan konsultasi hukum perdata dan tata usaha negara bersama Jaksa Pengacara Negara.

### 2. Integrasi Layanan Digital Nasional & Kejaksaan RI
- **HaloJPN**: Konsultasi hukum Datun online ([halojpn.kejaksaan.go.id](https://halojpn.kejaksaan.go.id/))
- **E-Tilang**: Pembayaran denda tilang & pengambilan barang bukti ([tilang.kejaksaan.go.id](https://tilang.kejaksaan.go.id/home))
- **E-PPID**: Keterbukaan informasi publik Kejari Klungkung ([ppid.kejaksaan.go.id](https://ppid.kejaksaan.go.id/satker/kn-klungkung))
- **SP4N-LAPOR!**: Layanan aspirasi dan pengaduan online rakyat ([lapor.go.id](https://www.lapor.go.id/))

### 3. Profil & Struktur Organisasi Interaktif
- **Bagan Struktur Organisasi**: Visualisasi hierarki 4 level pejabat & pegawai lengkap dengan foto dan jabatan.
- **Unduh Bagan (.jpg)**: Kanvas resolusi tinggi 2400 × 1680 piksel untuk cetak / unduhan format JPG.
- **Profil Lengkap**: Visi & Misi, Sejarah Balai Kerta Gosa, Logo dan Maknanya, serta Tugas & Wewenang.

### 4. Akuntabilitas Kinerja (SAKIP)
- Publikasi dokumen RENSTRA, RENJA, LKj, dan Laporan Kinerja Triwulan terintegrasi dengan Google Drive viewer.

### 5. Keamanan & Multi-Factor Authentication (MFA)
- Proteksi login administrator berbasis **RFC 6238 TOTP**.
- Mendukung **Google Authenticator** dan **Microsoft Authenticator** dengan pemindaian QR Code standar `otpauth://totp/`.

### 6. Ekspor & Impor Data (Excel .xlsx / CSV)
- Ekspor & Impor berkas Microsoft Excel (.xlsx) murni untuk Kotak Masuk Aduan MASADU, Antar BB SEMARA BAKTI, dan Jadwal Sidang JAGADITA.

---

## 🚀 Panduan Menjalankan Portal

Aplikasi ini dibangun menggunakan arsitektur **Pure Python** tanpa dependensi pihak ketiga (`zero external pip packages`), sehingga dapat langsung dijalankan di sistem operasi mana pun yang memiliki Python 3.8+.

### 1. Kloning Repositori
```bash
git clone https://github.com/arsipkejariklungkung-coder/DEMOWEBSITEKLK.git
cd DEMOWEBSITEKLK
```

### 2. Inisialisasi Database (Opsional jika db sudah ada)
```bash
python3 init_db.py
```

### 3. Jalankan Server
```bash
python3 server.py
```

Server akan aktif pada:
- **Portal Publik**: [http://localhost:8000](http://localhost:8000)
- **Portal Admin**: [http://localhost:8000/admin](http://localhost:8000/admin)

### 4. Menjalankan Rangkaian Pengujian
```bash
python3 test_portal.py
```

---

## 🔒 Akun Administrator Bawaan (Demo)

| Username | Password | Tipe MFA |
| :--- | :--- | :--- |
| `admin` atau `admin@kejariklungkung.go.id` | `admin123` | Google / Microsoft Authenticator (RFC 6238 TOTP) |

*Pindai QR Code di layar login atau masukkan Kunci Setup Base32 pada aplikasi Google Authenticator / Microsoft Authenticator di smartphone Anda.*

---

## 📁 Struktur Berkas

```
.
├── admin.html                    # Dashboard Backoffice CMS Admin
├── akuntabilitas-kinerja.html    # Halaman Publik SAKIP
├── index.html                    # Landing Page Beranda Utama
├── informasi-berita.html         # Halaman Publik Pusat Berita
├── informasi-jadwal-sidang.html  # Halaman Publik Jadwal Sidang JAGADITA
├── informasi-pengumuman.html     # Halaman Publik Pengumuman Resmi
├── informasi-skm.html            # Halaman Publik Indeks Kepuasan SKM
├── profil-logo-makna.html        # Halaman Profil Logo dan Maknanya
├── profil-sejarah.html           # Halaman Profil Sejarah Kerta Gosa
├── profil-struktur-organisasi.html # Halaman Profil Struktur Organisasi
├── profil-tugas-wewenang.html    # Halaman Profil Tugas & Wewenang
├── profil-visi-misi.html         # Halaman Profil Visi & Misi
├── server.py                     # HTTP Server REST API Backend
├── init_db.py                    # Skrip Inisialisasi Database SQLite
├── seed_organization.py          # Skrip Seed Struktur Organisasi
├── excel_io.py                   # Pure Python Excel OpenXML (.xlsx) & CSV Engine
├── totp_mfa.py                   # Pure Python RFC 6238 TOTP & QR Code Generator
├── test_portal.py                # Unit Test Suite (20 Tests)
├── data/
│   └── kertagosa.db              # Database SQLite
└── static/
    ├── css/styles.css            # Stylesheet Custom & Responsive
    ├── js/app.js                 # Frontend Interactive Engine Publik
    ├── js/admin.js               # Frontend Engine Dashboard Admin
    └── images/                   # Aset Foto & Logo Resmi
```

---

## 🏛️ Hak Cipta & Lisensi
© 2026 Kejaksaan Negeri Klungkung. Hak Cipta Dilindungi Undang-Undang.  
Sistem Informasi Manajemen Pelayanan Terpadu Satu Pintu Digital (KERTAGOSA).
