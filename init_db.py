#!/usr/bin/env python3
"""
Database initialization and seeder for KERTAGOSA Portal.
Kejaksaan Negeri Klungkung.
Strictly adheres to the PRD specifications.
"""
import os
import sqlite3
import hashlib
import json

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'kertagosa.db')

def hash_password(password: str) -> str:
    # SHA-256 with salt
    salt = "k3rTaG0s4_kLunkUnG_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db(target_path=None):
    if target_path is None:
        target_path = DB_PATH
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    conn = sqlite3.connect(target_path)
    cursor = conn.cursor()

    # 1. Page Contents (Single Source of Truth for Dynamic Content)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS page_contents (
        content_key TEXT PRIMARY KEY,
        section_name TEXT NOT NULL,
        content_type TEXT NOT NULL,
        content_value TEXT NOT NULL,
        label TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Users (Admin Auth)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'ADMIN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Posts (News & Announcements - Bento Grid Layout)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        badge_label TEXT,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        highlight_quote TEXT,
        thumbnail_url TEXT NOT NULL,
        author TEXT DEFAULT 'Tim Publikasi Kejari',
        layout_type TEXT NOT NULL, -- 'FEATURED_MAIN', 'FEATURED_SIDE', 'COMPACT_BOTTOM'
        published_at DATE DEFAULT CURRENT_DATE,
        views INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1
    );
    """)

    # 4. Service Cards (4 Pillars of KERTAGOSA)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS service_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        badge_text TEXT NOT NULL,
        theme_color TEXT NOT NULL, -- 'green', 'red', 'amber', 'emerald'
        icon_name TEXT NOT NULL,
        description TEXT NOT NULL,
        info_box_text TEXT NOT NULL,
        btn_text TEXT NOT NULL,
        btn_action TEXT NOT NULL,
        link_text TEXT NOT NULL,
        link_action TEXT NOT NULL,
        order_num INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 5. Court Schedules (JAGADITA Live Sessions)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS court_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_time TEXT NOT NULL,
        court_room TEXT NOT NULL,
        case_number TEXT NOT NULL,
        defendant_name TEXT NOT NULL,
        case_type TEXT NOT NULL, -- 'PIDUM', 'TIPIKOR', 'PIDSUS'
        agenda TEXT NOT NULL,
        prosecutor TEXT NOT NULL,
        status TEXT NOT NULL, -- 'SEDANG BERLANGSUNG', 'TERJADWAL', 'SELESAI'
        schedule_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. SKM Indicators & Survey Submissions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skm_indicators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        score REAL NOT NULL,
        order_num INTEGER DEFAULT 0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        respondent_name TEXT,
        respondent_phone TEXT,
        service_used TEXT,
        score_persyaratan INTEGER,
        score_waktu INTEGER,
        score_biaya INTEGER,
        score_petugas INTEGER,
        average_score REAL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Citizen Complaints (MASADU)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_code TEXT UNIQUE NOT NULL,
        reporter_name TEXT,
        reporter_phone TEXT,
        is_anonymous INTEGER DEFAULT 0,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        chronology TEXT NOT NULL,
        attachment_url TEXT,
        status TEXT DEFAULT 'TERKIRIM', -- 'TERKIRIM', 'DIVERIFIKASI', 'DALAM_PROSES', 'SELESAI', 'DITOLAK'
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 8. Evidence Delivery Requests (SEMARA BAKTI)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bb_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_code TEXT UNIQUE NOT NULL,
        case_number TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        id_card_number TEXT,
        item_description TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        district TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        preferred_date TEXT,
        status TEXT DEFAULT 'TERKIRIM', -- 'TERKIRIM', 'DIVERIFIKASI', 'DIJADWALKAN', 'DIANTAR', 'SELESAI'
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    print("Database tables created successfully.")

    # Seed Default Admin
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        pwd_hash = hash_password("admin123")
        cursor.execute("""
        INSERT INTO users (username, email, password_hash, full_name, role)
        VALUES ('admin', 'admin@kejariklungkung.go.id', ?, 'R. Indra Senjaya, S.H., M.H.', 'ADMIN')
        """, (pwd_hash,))
        print("Admin user seeded (admin@kejariklungkung.go.id / admin123).")

    # Seed Page Contents (Section 5 of PRD)
    page_contents_seed = [
        # HEADER
        ('header_logo_url', 'HEADER', 'IMAGE', '/static/images/logo-kejari.svg', 'Logo Kejari Klungkung'),
        ('header_title', 'HEADER', 'TEXT', 'KEJAKSAAN REPUBLIK INDONESIA - KEJAKSAAN NEGERI KLUNGKUNG', 'Nama Instansi Header'),
        ('header_wbk_badge', 'HEADER', 'TEXT', 'ZONA INTEGRITAS WBK / WBBM', 'Badge Zona Integritas'),
        ('header_hours', 'HEADER', 'TEXT', 'Senin - Jumat: 08.00 - 16.00 WITA', 'Jam Operasional Header'),
        ('header_cta_text', 'HEADER', 'TEXT', 'Lacak Tiket Layanan', 'Teks Tombol Header Kanan'),
        ('header_hotline_badge', 'HEADER', 'TEXT', 'Hotline PTSP: 0811-3800-4444', 'Badge Hotline Kanan'),

        # HERO SECTION & KAJARI
        ('hero_badge_1', 'HERO', 'TEXT', 'KEJAKSAAN NEGERI KLUNGKUNG', 'Badge Hero Kiri'),
        ('hero_badge_2', 'HERO', 'TEXT', 'PELAYANAN PUBLIK TERPADU', 'Badge Hero Kanan'),
        ('hero_main_title', 'HERO', 'TEXT', 'KERTAGOSA', 'Judul Utama Hero'),
        ('hero_description', 'HERO', 'TEXT', 'Melalui "KERTAGOSA", KEJARI Klungkung berkomitmen untuk memberikan kerja yang menekankan pelayanan dan penegakan hukum yang cepat, tepat, dan profesional kepada seluruh masyarakat.', 'Deskripsi Hero'),
        ('hero_btn_primary_text', 'HERO', 'TEXT', 'Pelayanan Hukum', 'Tombol Utama Hero'),
        ('hero_btn_primary_link', 'HERO', 'URL', '#layanan', 'Link Tombol Utama Hero'),
        ('hero_btn_secondary_text', 'HERO', 'TEXT', 'Laporkan Pengaduan (MASADU)', 'Tombol Kedua Hero'),
        ('hero_btn_secondary_link', 'HERO', 'URL', '#masadu', 'Link Tombol Kedua Hero'),
        ('hero_stat_1_value', 'HERO', 'TEXT', '88.31', 'Angka Statistik 1'),
        ('hero_stat_1_label', 'HERO', 'TEXT', 'Indeks Kepuasan (Sangat Baik)', 'Label Statistik 1'),
        ('hero_stat_2_value', 'HERO', 'TEXT', '100%', 'Angka Statistik 2'),
        ('hero_stat_2_label', 'HERO', 'TEXT', 'Transparansi Sidang & Perkara', 'Label Statistik 2'),
        ('hero_stat_3_value', 'HERO', 'TEXT', 'Rp 0,-', 'Angka Statistik 3'),
        ('hero_stat_3_label', 'HERO', 'TEXT', 'Biaya Pengantaran BB (Gratis)', 'Label Statistik 3'),
        ('kajari_photo_url', 'HERO', 'IMAGE', '/static/images/kajari-portrait.jpg', 'Foto Kepala Kejaksaan Negeri'),
        ('kajari_position_badge', 'HERO', 'TEXT', 'KEPALA KEJAKSAAN NEGERI KLUNGKUNG', 'Jabatan pada Bingkai Foto'),
        ('kajari_full_name', 'HERO', 'TEXT', 'R. Indra Senjaya, S.H., M.H.', 'Nama Lengkap Kajari'),

        # TICKER PENGUMUMAN
        ('ticker_badge_label', 'TICKER', 'TEXT', 'PENGUMUMAN PENTING', 'Label Ticker'),
        ('ticker_text', 'TICKER', 'TEXT', 'Jadwal Pelayanan Terpadu Satu Pintu (PTSP) beroperasi penuh Senin - Jumat (08.00 - 16.00 WITA). Pengantaran Barang Bukti (SEMARA BAKTI) 100% GRATIS ke seluruh daratan Klungkung & Nusa Penida. Aduan dugaan korupsi dapat disampaikan melalui MASADU dengan kerahasiaan 100% terjamin.', 'Isi Teks Pengumuman Berjalan'),

        # NEWS HEADER
        ('news_section_badge', 'NEWS_HEADER', 'TEXT', 'KABAR TERKINI & AGENDA KEJAKSAAN', 'Badge Seksi Berita'),
        ('news_section_title', 'NEWS_HEADER', 'TEXT', 'Pusat Berita & Publikasi Hukum', 'Judul Seksi Berita'),
        ('news_section_desc', 'NEWS_HEADER', 'TEXT', 'Informasi transparan mengenai penegakan hukum, kegiatan sosial, pemulihan keuangan negara, dan pelayanan hukum Kejari Klungkung.', 'Deskripsi Seksi Berita'),

        # SERVICES HEADER
        ('services_section_title', 'SERVICES_HEADER', 'TEXT', '4 Pilar Layanan Unggulan KERTAGOSA', 'Judul Seksi 4 Pilar'),
        ('services_section_desc', 'SERVICES_HEADER', 'TEXT', 'Inovasi pelayanan digital terintegrasi untuk masyarakat Kabupaten Klungkung yang transparan, mudah, dan bebas biaya.', 'Deskripsi Seksi 4 Pilar'),

        # CONTROL BOARD & SKM CARD
        ('control_board_title', 'CONTROL_BOARD', 'TEXT', 'Papan Kendali Operasional Pengadilan & Mutu', 'Judul Papan Kendali'),
        ('control_board_source_note', 'CONTROL_BOARD', 'TEXT', 'Terakhir diperbarui: Hari ini, Pukul 10:15 WITA • Sumber: CMS Pengadilan Negeri & Kejari Klungkung', 'Catatan Kaki Tabel Jagadita'),
        ('skm_period_badge', 'SKM_CARD', 'TEXT', 'TRIWULAN III', 'Badge Periode SKM'),
        ('skm_main_score', 'SKM_CARD', 'TEXT', '88.31', 'Skor Utama IKM'),
        ('skm_predicate_text', 'SKM_CARD', 'TEXT', 'Mutu Pelayanan: A (Sangat Baik)', 'Predikat Mutu SKM'),
        ('skm_respondents_count', 'SKM_CARD', 'TEXT', '412', 'Jumlah Responden SKM'),
        ('skm_mode', 'SKM_CARD', 'TEXT', 'MANUAL', 'Mode Kalkulasi SKM (AUTO / MANUAL)'),
        ('skm_metrics_json', 'SKM_CARD', 'JSON', json.dumps([
            {"label": "Prosedur & Persyaratan", "score": 91.20},
            {"label": "Kecepatan Waktu Pelayanan", "score": 87.50},
            {"label": "Bebas Biaya / Tarif (Gratis)", "score": 100.0},
            {"label": "Kompetensi & Perilaku Petugas", "score": 89.40}
        ]), '4 Indikator Progress Bar SKM'),

        # OFFICE & MAP SECTION
        ('office_section_title', 'OFFICE_MAP', 'TEXT', 'Kantor Kejaksaan Negeri Klungkung', 'Judul Seksi Kantor'),
        ('office_description', 'OFFICE_MAP', 'TEXT', 'Wilayah hukum Kejaksaan Negeri Klungkung mencakup daratan Klungkung hingga kepulauan Nusa Penida, siap melayani dengan integritas tinggi dan keterbukaan informasi publik.', 'Deskripsi Kantor'),
        ('office_address_text', 'OFFICE_MAP', 'TEXT', 'Jl. Gajah Mada No. 32, Semarapura, Kab. Klungkung, Bali 80711', 'Alamat Lengkap Kantor'),
        ('office_hours_text', 'OFFICE_MAP', 'TEXT', 'Senin - Kamis: 08.00 - 16.00 WITA | Jumat: 08.00 - 16.30 WITA', 'Jam Operasional PTSP'),
        ('office_map_image_url', 'OFFICE_MAP', 'IMAGE', '/static/images/peta-klungkung.png', 'Gambar Visual Peta Klungkung'),
        ('office_gmaps_url', 'OFFICE_MAP', 'URL', 'https://maps.google.com/?q=Kejaksaan+Negeri+Klungkung', 'Link Buka Google Maps'),
        ('office_whatsapp_number', 'OFFICE_MAP', 'TEXT', '6281138004444', 'Nomor WhatsApp PTSP'),
        ('office_phone_number', 'OFFICE_MAP', 'TEXT', '(0366) 21151', 'Nomor Telepon Kantor'),
        ('office_email', 'OFFICE_MAP', 'TEXT', 'kejari.klungkung@kejaksaan.go.id', 'Email Resmi'),
        ('footer_copyright', 'FOOTER', 'TEXT', '© 2026 Kejaksaan Negeri Klungkung - Hak Cipta Dilindungi Undang-Undang. Portal KERTAGOSA v2.4', 'Teks Copyright Footer')
    ]

    for item in page_contents_seed:
        cursor.execute("""
        INSERT OR REPLACE INTO page_contents (content_key, section_name, content_type, content_value, label)
        VALUES (?, ?, ?, ?, ?)
        """, item)

    print("Page contents seeded.")

    # Seed 4 Pillars Services
    services_seed = [
        (
            'JAGADITA',
            'JAGADITA (Jadwal Giat Sidang Digital)',
            'LAYANAN PUBLIK',
            'green',
            'gavel',
            'Sistem transparansi jadwal persidangan perkara pidana umum dan khusus yang disidangkan di Pengadilan Negeri secara real-time.',
            '🔍 Temukan jam sidang, nomor perkara, nama Jaksa Penuntut Umum (JPU), agenda sidang, dan ruang sidang tanpa harus datang ke pengadilan.',
            'Cari Sidang',
            'SEARCH_JAGADITA',
            'Lihat Jadwal Hari Ini →',
            'GOTO_JAGADITA_TABLE',
            1
        ),
        (
            'MASADU',
            'MASADU (Masyarakat Sampaikan Aduan)',
            'RESPON CEPAT 1X24 JAM',
            'red',
            'shield-alert',
            'Saluran pengaduan masyarakat atas dugaan tindak pidana korupsi, penyalahgunaan wewenang, atau pelanggaran hukum lainnya di Kabupaten Klungkung.',
            '🔒 Identitas pelapor dijamin kerahasiaannya dengan enkripsi end-to-end sesuai SOP Kejaksaan RI. Bebas intervensi dan terlindungi.',
            'Buat Laporan Pengaduan',
            'OPEN_COMPLAINT_MODAL',
            'Lacak Tiket Aduan →',
            'OPEN_TRACKER_MODAL',
            2
        ),
        (
            'SEMARA_BAKTI',
            'SEMARA BAKTI (Pengantaran Barang Bukti)',
            '100% GRATIS',
            'amber',
            'truck',
            'Layanan antar barang bukti perkara yang telah berkekuatan hukum tetap (inkracht) langsung ke kediaman pemilik yang sah tanpa dipungut biaya apapun.',
            '📦 Menjangkau 4 kecamatan: Klungkung, Banjarangkan, Dawan, hingga Kepulauan Nusa Penida diantar dengan armada dinas Kejari.',
            'Ajukan Pengantaran BB',
            'OPEN_BB_DELIVERY_MODAL',
            'Syarat & Ketentuan →',
            'OPEN_BB_TERMS',
            3
        ),
        (
            'DATUN',
            'POS PELAYANAN HUKUM & DATUN',
            'KONSULTASI GRATIS',
            'emerald',
            'scale',
            'Pemberian konsultasi hukum gratis di bidang Perdata dan Tata Usaha Negara bagi masyarakat pencari keadilan dan instansi daerah.',
            '⚖️ Jaksa Pengacara Negara (JPN) siap memberikan pertimbangan hukum objektif, mediasi sengketa, dan konsultasi hukum tanpa biaya.',
            'Konsultasi Hukum Gratis',
            'OPEN_DATUN_MODAL',
            'Pelajari Bidang Datun →',
            'OPEN_DATUN_INFO',
            4
        )
    ]

    for s in services_seed:
        cursor.execute("""
        INSERT OR REPLACE INTO service_cards (code, title, badge_text, theme_color, icon_name, description, info_box_text, btn_text, btn_action, link_text, link_action, order_num)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, s)

    print("4 Service cards seeded.")

    # Seed Posts (News Bento Grid)
    posts_seed = [
        (
            'Kejari Klungkung Berhasil Pulihkan Keuangan Negara Sebesar Rp 1,2 Miliar Melalui Jalur Datun',
            'kejari-klungkung-berhasil-pulihkan-keuangan-negara-rp-1-2-miliar',
            'Perdata & Tata Usaha Negara',
            'BERITA UTAMA',
            'Kejaksaan Negeri Klungkung melalui Seksi Perdata dan Tata Usaha Negara (Datun) berhasil memulihkan keuangan negara sebesar Rp 1.250.000.000,- melalui penagihan bantuan hukum dan penyelesaian tunggakan kewajiban pihak ketiga.',
            '''<p>Kejaksaan Negeri Klungkung kembali mencatatkan prestasi gemilang dalam penyelamatan keuangan negara. Melalui Seksi Perdata dan Tata Usaha Negara (Datun), Kejari Klungkung berhasil memulihkan kas negara sebesar Rp 1.250.000.000,- (Satu Miliar Dua Ratus Lima Puluh Juta Rupiah).</p>
            <p>Kepala Kejaksaan Negeri Klungkung, <strong>R. Indra Senjaya, S.H., M.H.</strong>, menyampaikan bahwa pemulihan aset ini diperoleh dari hasil bantuan hukum non-litigasi terhadap sejumlah kewajiban dan piutang daerah yang tertunggak.</p>
            <p>"Keberhasilan ini adalah bentuk sinergi nyata antara Kejari Klungkung dengan Pemerintah Daerah dalam rangka mewujudkan tata kelola keuangan yang transparan, akuntabel, dan bebas penyimpangan," tegas Kajari dalam konferensi pers.</p>''',
            'Keberhasilan pemulihan aset negara sebesar Rp 1,2 Miliar ini membuktikan komitmen Bidang Datun Kejari Klungkung dalam menjaga keuangan daerah serta melindungi kepentingan publik tanpa kompromi.',
            '/static/images/news-featured.jpg',
            'Tim Publikasi Kejari',
            'FEATURED_MAIN',
            '2026-10-20'
        ),
        (
            'Jaksa Masuk Sekolah (JMS) Sambangi SMA Negeri 1 Semarapura: Edukasi Bahaya Narkoba & Bullying Digital',
            'jms-sambangi-sman-1-semarapura',
            'Intelijen & JMS',
            'INTELIJEN',
            'Seksi Intelijen Kejaksaan Negeri Klungkung menggelar program penyuluhan hukum JMS guna membekali ratusan pelajar kesadaran hukum sejak dini.',
            '''<p>Bertempat di Aula SMA Negeri 1 Semarapura, Seksi Intelijen Kejari Klungkung menyelenggarakan program Jaksa Masuk Sekolah (JMS). Acara ini dihadiri oleh lebih dari 300 siswa dan dewan guru.</p>
            <p>Materi yang disampaikan menitikberatkan pada pencegahan penyalahgunaan narkotika, bahaya judi online di kalangan remaja, serta etika bermedia sosial guna menghindari jeratan UU ITE dan bullying siber.</p>''',
            None,
            '/static/images/news-jms.jpg',
            'Seksi Intelijen Kejari',
            'FEATURED_SIDE',
            '2026-10-19'
        ),
        (
            'Pemusnahan Barang Bukti Inkracht Triwulan III: Narkotika, Senjata Tajam, dan Obat Ilegal Dimusnahkan',
            'pemusnahan-barang-bukti-inkracht-triwulan-iii',
            'Tindak Pidana Umum',
            'PIDUM',
            'Kepala Kejaksaan Negeri Klungkung memimpin langsung kegiatan pemusnahan barang bukti yang telah berkekuatan hukum tetap di halaman kantor Kejari.',
            '''<p>Kejaksaan Negeri Klungkung melaksanakan pemusnahan barang bukti dari 24 perkara tindak pidana umum yang telah berkekuatan hukum tetap (inkracht) untuk periode Triwulan III 2026.</p>
            <p>Barang bukti yang dimusnahkan meliputi narkotika jenis sabu seberat 45,8 gram, ganja kering, senjata tajam, telepon genggam, serta kosmetik dan obat-obatan tanpa izin edar resmi.</p>''',
            None,
            '/static/images/news-bb.jpg',
            'Seksi Pengelolaan BB',
            'FEATURED_SIDE',
            '2026-10-18'
        ),
        (
            'Pengumuman Lelang Terbuka Barang Rampasan Negara Kendaraan Roda Dua dan Roda Empat',
            'pengumuman-lelang-terbuka-barang-rampasan',
            'Pengumuman',
            'PENGUMUMAN',
            'Kejari Klungkung bekerjasama dengan KPKNL Denpasar menyelenggarakan lelang terbuka secara online untuk sejumlah unit kendaraan bermotor hasil rampasan negara.',
            '''<p>Kejaksaan Negeri Klungkung melalui perantaraan Kantor Pelayanan Kekayaan Negara dan Lelang (KPKNL) Denpasar akan melaksanakan penjualan lelang Barang Rampasan Negara.</p>
            <p>Masyarakat yang berminat dapat mengakses portal lelang resmi www.lelang.go.id dengan menyetorkan uang jaminan sesuai syarat yang ditentukan.</p>''',
            None,
            '/static/images/news-lelang.jpg',
            'Panitia Lelang Kejari',
            'COMPACT_BOTTOM',
            '2026-10-17'
        ),
        (
            'Pelaksanaan Restorative Justice Kasus Penganiayaan Ringan di Wilayah Dawan Berakhir Damai',
            'pelaksanaan-restorative-justice-penganiayaan-dawan',
            'Tindak Pidana Umum',
            'PIDANA UMUM',
            'Seksi Tindak Pidana Umum Kejari Klungkung kembali menyelesaikan perkara tindak pidana dengan pendekatan keadilan restoratif yang menjunjung nilai kearifan lokal.',
            '''<p>Pendekatan Restorative Justice (RJ) kembali diterapkan oleh Jaksa Fasilitator Kejari Klungkung dalam perkara penganiayaan ringan di Kecamatan Dawan.</p>
            <p>Kedua belah pihak sepakat berdamai tanpa syarat ganti rugi yang memberatkan, dengan disaksikan tokoh adat dan keluarga.</p>''',
            None,
            '/static/images/news-rj.jpg',
            'Seksi Pidum Kejari',
            'COMPACT_BOTTOM',
            '2026-10-16'
        ),
        (
            'Penguatan Integritas dan Tata Kelola Birokrasi Menuju Wilayah Bebas dari Korupsi (WBK)',
            'penguatan-integritas-tata-kelola-wbk',
            'Kegiatan Kejari',
            'PEMBINAAN',
            'Seluruh jajaran pegawai Kejari Klungkung menandatangani pakta integritas dan komitmen bersama pembangunan Zona Integritas WBK/WBBM.',
            '''<p>Dalam rangka mempertahankan predikat Zona Integritas Menuju WBK/WBBM, Kejari Klungkung menggelar apel penandatanganan komitmen bersama seluruh pegawai dan staf honorer.</p>
            <p>Langkah ini merupakan perwujudan birokrasi yang bersih, melayani, dan bebas dari segala bentuk gratifikasi maupun pungli.</p>''',
            None,
            '/static/images/news-wbk.jpg',
            'Subbag Pembinaan Kejari',
            'COMPACT_BOTTOM',
            '2026-10-15'
        )
    ]

    cursor.execute("DELETE FROM posts")
    for p in posts_seed:
        cursor.execute("""
        INSERT INTO posts (title, slug, category, badge_label, excerpt, content, highlight_quote, thumbnail_url, author, layout_type, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

    print("Posts seeded.")

    # Seed JAGADITA Court Schedules (Section 5)
    schedules_seed = [
        ('09:30 WITA', 'R. Sidang Cakra', '124/Pid.B/2026/PN Kp', 'I Made Suartika alias Dek Su', 'PIDUM', 'Pemeriksaan Saksi & Ahli', 'I Kadek Darmawan, S.H.', 'SEDANG BERLANGSUNG'),
        ('10:15 WITA', 'R. Sidang Kartika', '08/Pid.Sus-TPK/2026/PN Dps', 'Ni Luh Putu Wardani, S.E.', 'TIPIKOR', 'Pembacaan Tuntutan (Requisitoir)', 'A.A. Gede Putra, S.H., M.H.', 'SEDANG BERLANGSUNG'),
        ('11:00 WITA', 'R. Sidang Cakra', '132/Pid.Sus/2026/PN Kp', 'I Wayan Budiarta', 'PIDUM', 'Pembacaan Surat Dakwaan', 'Ni Wayan Sriastuti, S.H.', 'TERJADWAL'),
        ('13:00 WITA', 'R. Sidang Cakra', '98/Pid.B/2026/PN Kp', 'I Ketut Kariasa', 'PIDUM', 'Pembacaan Putusan (Vonis)', 'I Made Artawan, S.H.', 'TERJADWAL'),
        ('13:30 WITA', 'R. Sidang Kartika', '15/Pid.Sus-TPK/2026/PN Dps', 'Ir. I Nyoman Sujana', 'TIPIKOR', 'Eksepsi Penasihat Hukum', 'Putu Eka Wardana, S.H.', 'TERJADWAL'),
        ('09:00 WITA', 'R. Sidang Cakra', '110/Pid.B/2026/PN Kp', 'I Gusti Ngurah Rai', 'PIDUM', 'Pemeriksaan Terdakwa & Bukti', 'I Made Darmawan, S.H.', 'SELESAI')
    ]

    cursor.execute("DELETE FROM court_schedules")
    for s in schedules_seed:
        cursor.execute("""
        INSERT INTO court_schedules (session_time, court_room, case_number, defendant_name, case_type, agenda, prosecutor, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, s)

    print("JAGADITA schedules seeded.")

    # Seed Sample Complaints & Deliveries for Ticket Tracking Demonstration
    sample_complaints = [
        ('TRK-MASADU-8821', 'I Wayan Sastrawan', '081234567890', 0, 'Dugaan Pungli / Gratifikasi', 'Laporan Pungutan Liar Pengurusan Surat Rekomendasi di Desa X', 'Pada tanggal 12 Oktober 2026 ditemukan indikasi pungutan biaya di luar retribusi resmi...', None, 'DIVERIFIKASI', 'Laporan telah diverifikasi oleh Seksi Intelijen dan sedang dalam telaah dokumen.'),
        ('TRK-MASADU-9904', 'Anonim', None, 1, 'Dugaan Korupsi Dana Desa', 'Dugaan Penyimpangan Anggaran Fisik Proyek Saluran Air', 'Terdapat ketidaksesuaian spesifikasi volume semen dan batu kali...', None, 'DALAM_PROSES', 'Tim Pidsus sedang melakukan pengumpulan bahan dan keterangan (Pulbaket).')
    ]
    cursor.execute("DELETE FROM complaints")
    for c in sample_complaints:
        cursor.execute("""
        INSERT INTO complaints (ticket_code, reporter_name, reporter_phone, is_anonymous, category, title, chronology, attachment_url, status, admin_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, c)

    sample_deliveries = [
        ('TRK-BB-4102', '124/Pid.B/2026/PN Kp', 'I Made Sudira', '5105011204850001', '1 Unit Sepeda Motor Honda Vario DK-4821-FX beserta STNK Asli', 'Jl. Flamboyan No. 14, Semarapura Klod', 'Klungkung', '081338123456', '2026-10-22', 'DIJADWALKAN', 'Armada SEMARA BAKTI dijadwalkan mengantar barang bukti pada Kamis pukul 10:00 WITA.')
    ]
    cursor.execute("DELETE FROM bb_deliveries")
    for d in sample_deliveries:
        cursor.execute("""
        INSERT INTO bb_deliveries (ticket_code, case_number, owner_name, id_card_number, item_description, delivery_address, district, phone_number, preferred_date, status, admin_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, d)

    conn.commit()
    conn.close()
    print("Database initialization complete!")

if __name__ == '__main__':
    init_db()
