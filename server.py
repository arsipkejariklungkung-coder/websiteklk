#!/usr/bin/env python3
"""
KERTAGOSA - Portal Web & Layanan Terpadu Kejaksaan Negeri Klungkung
High-Performance Standard Library HTTP Server with SQLite Backend.
Zero external dependencies required.
"""
import os
import sys
import json
import sqlite3
import hashlib
import hmac
import stat
import mimetypes
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler, BaseHTTPRequestHandler
import base64
import time
import random
import uuid
import io
import csv
import totp_mfa
import excel_io
import ai_news_generator
try:
    import vercel_blob
except ImportError:
    vercel_blob = None

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IS_VERCEL = bool(
    os.environ.get('VERCEL')
    or os.environ.get('VERCEL_ENV')
    or os.environ.get('AWS_LAMBDA_FUNCTION_NAME')
    or BASE_DIR.startswith('/var/task')
    or not os.access(BASE_DIR, os.W_OK)
)

def _copy_seed_db_writable(seed_db: str, dst_db: str):
    """Copy seed SQLite database to /tmp and ensure read-write (0666) permissions."""
    import shutil
    try:
        os.makedirs(os.path.dirname(os.path.abspath(dst_db)), exist_ok=True)
        shutil.copyfile(seed_db, dst_db)
        os.chmod(dst_db, 0o666)
    except Exception as e:
        print(f"Error copying seed DB to {dst_db}: {e}")

if IS_VERCEL:
    TMP_DIR = '/tmp'
    DB_PATH = os.path.join(TMP_DIR, 'kertagosa.db')
    UPLOADS_DIR = os.path.join(TMP_DIR, 'uploads')
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)
    except Exception:
        pass
    seed_db = os.path.join(BASE_DIR, 'data', 'kertagosa.db')
    if not os.path.exists(DB_PATH) and os.path.exists(seed_db):
        _copy_seed_db_writable(seed_db, DB_PATH)
    elif os.path.exists(DB_PATH):
        try:
            os.chmod(DB_PATH, 0o666)
        except Exception:
            pass
else:
    DB_PATH = os.path.join(BASE_DIR, 'data', 'kertagosa.db')
    UPLOADS_DIR = os.path.join(BASE_DIR, 'static', 'uploads')
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)
    except Exception:
        pass

# In-memory session store (token -> user_dict) + Stateless HMAC Signed Tokens for Serverless
SESSIONS = {}
# In-memory MFA challenges store (mfa_token -> challenge_dict)
MFA_CHALLENGES = {}
# In-memory IP-based high-security rate limiter store ((ip, category) -> [timestamps])
IP_RATE_LIMIT_STORE = {}
TOKEN_SECRET = b"k3rTaG0s4_s3rV3rL3sS_hMaC_2026_kLuNgKuNg"

def create_signed_token(payload: dict) -> str:
    """Create a stateless HMAC-SHA256 signed token that survives serverless cold starts."""
    raw = json.dumps(payload, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    b64 = base64.urlsafe_b64encode(raw).decode('ascii').rstrip('=')
    sig = hmac.new(TOKEN_SECRET, b64.encode('ascii'), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"

def verify_signed_token(token_str: str):
    """Verify and decode a stateless HMAC-SHA256 signed token."""
    if not token_str or '.' not in token_str:
        return None
    try:
        b64, sig = token_str.rsplit('.', 1)
        expected_sig = hmac.new(TOKEN_SECRET, b64.encode('ascii'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        pad = '=' * ((4 - len(b64) % 4) % 4)
        raw = base64.urlsafe_b64decode((b64 + pad).encode('ascii'))
        payload = json.loads(raw.decode('utf-8'))
        if payload.get('expires_at') and time.time() > payload['expires_at']:
            return None
        return payload
    except Exception:
        return None

def ensure_database_ready():
    """Ensure database exists, is writable, and is populated with all tables and seed data."""
    try:
        if IS_VERCEL and os.path.exists(DB_PATH):
            try:
                os.chmod(DB_PATH, 0o666)
            except Exception:
                pass
        conn = sqlite3.connect(DB_PATH, timeout=30.0)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='page_contents'")
        has_page_contents = bool(cursor.fetchone())
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='organization_members'")
        has_org_members = bool(cursor.fetchone())
        conn.close()

        if not has_page_contents:
            print(f"[Auto-Healing] Initializing database at {DB_PATH}...")
            import init_db
            init_db.init_db(DB_PATH)

        if not has_org_members:
            print(f"[Auto-Healing] Seeding organization members at {DB_PATH}...")
            import seed_organization
            seed_organization.seed_organization(DB_PATH)
    except Exception as e:
        print(f"[Auto-Healing Warning] {e}")

def get_db():
    if IS_VERCEL and not os.path.exists(DB_PATH):
        seed_db = os.path.join(BASE_DIR, 'data', 'kertagosa.db')
        if os.path.exists(seed_db):
            _copy_seed_db_writable(seed_db, DB_PATH)
        else:
            ensure_database_ready()
    elif IS_VERCEL and os.path.exists(DB_PATH):
        try:
            os.chmod(DB_PATH, 0o666)
        except Exception:
            pass

    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
    except Exception:
        pass
    return conn

def hash_password(password: str) -> str:
    salt = "k3rTaG0s4_kLunkUnG_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db_schema():
    ensure_database_ready()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users)")
    cols = [c[1] for c in cursor.fetchall()]
    if cols and 'mfa_enabled' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN mfa_enabled INTEGER DEFAULT 1")
        conn.commit()
    if cols and 'mfa_secret' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN mfa_secret TEXT")
        conn.commit()
    if cols and 'mfa_provider' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN mfa_provider TEXT DEFAULT 'GOOGLE_MICROSOFT'")
        conn.commit()
    if cols and 'mfa_enrolled' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN mfa_enrolled INTEGER DEFAULT 1")
        conn.commit()

    # Ensure posts table has youtube_url column
    cursor.execute("PRAGMA table_info(posts)")
    post_cols = [c[1] for c in cursor.fetchall()]
    if post_cols and 'youtube_url' not in post_cols:
        cursor.execute("ALTER TABLE posts ADD COLUMN youtube_url TEXT")
        conn.commit()

    # Ensure bb_deliveries table has all BA-20 (Berita Acara Pengembalian Barang Bukti) fields
    cursor.execute("PRAGMA table_info(bb_deliveries)")
    bb_cols = [c[1] for c in cursor.fetchall()]
    new_bb_fields = [
        ('owner_job', "TEXT DEFAULT 'Wiraswasta'"),
        ('defendant_name', "TEXT"),
        ('violation_clause', "TEXT"),
        ('sprint_number', "TEXT"),
        ('sprint_date', "TEXT"),
        ('court_verdict_number', "TEXT"),
        ('court_verdict_date', "TEXT"),
        ('officer_name', "TEXT"),
        ('officer_nip', "TEXT"),
        ('officer_rank', "TEXT"),
        ('officer_position', "TEXT"),
        ('kasi_name', "TEXT"),
        ('kasi_nip', "TEXT"),
        ('kasi_rank', "TEXT"),
        ('witness_1', "TEXT"),
        ('witness_2', "TEXT"),
        ('ba_date', "TEXT"),
        ('ba_day', "TEXT"),
        ('ba_date_spelled', "TEXT"),
        ('ba_notes', "TEXT")
    ]
    for col_name, col_def in new_bb_fields:
        if bb_cols and col_name not in bb_cols:
            cursor.execute(f"ALTER TABLE bb_deliveries ADD COLUMN {col_name} {col_def}")
            conn.commit()

    # Ensure every user has a valid RFC 6238 Base32 secret for Google / Microsoft Authenticator
    try:
        cursor.execute("SELECT id, username, email, mfa_secret, mfa_provider FROM users")
        for u in cursor.fetchall():
            sec = u['mfa_secret']
            prov = u['mfa_provider'] or 'GOOGLE_MICROSOFT'
            if not sec or len(sec.strip()) < 12:
                sec = totp_mfa.deterministic_secret_for_user(u['username'], u['email'] or '')
                cursor.execute("UPDATE users SET mfa_secret = ?, mfa_provider = ? WHERE id = ?", (sec, prov, u['id']))
        conn.commit()
    except Exception:
        pass

    # Accountability Documents (SAKIP: RENSTRA, RENJA, LKj, Triwulan)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS accountability_docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,         -- 'RENSTRA', 'RENJA', 'LKJ', 'TRIWULAN'
        title TEXT NOT NULL,
        period_year TEXT NOT NULL,
        doc_url TEXT NOT NULL,
        file_size TEXT DEFAULT 'PDF (3.2 MB)',
        description TEXT,
        views_count INTEGER DEFAULT 0,
        order_num INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()

    # Profile Items (Visi-Misi, Sejarah, Logo-Makna, Tugas-Wewenang)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profile_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_type TEXT NOT NULL,       -- 'VISI_MISI', 'SEJARAH', 'LOGO_MAKNA', 'TUGAS_WEWENANG'
        item_type TEXT NOT NULL,       -- 'MISI', 'TIMELINE', 'LOGO_ELEM', 'TUGAS_BIDANG'
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT NOT NULL,
        icon_name TEXT,
        order_num INTEGER DEFAULT 1,
        image_url TEXT,
        extra_data TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()

    # Announcements Table (Pengumuman Resmi)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        announcement_number TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,         -- 'LELANG', 'LAYANAN', 'REKRUTMEN', 'MAKLUMAT', 'UMUM'
        badge_label TEXT,
        excerpt TEXT,
        content TEXT NOT NULL,
        deadline_date TEXT,
        external_url TEXT,
        external_label TEXT,
        image_url TEXT,
        order_num INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()

    # Seed accountability docs if empty
    seed_accountability_docs(cursor)
    # Seed profile items & contents if empty
    seed_profile_data(cursor)
    seed_profile_page_contents(cursor)
    # Seed announcements & information contents if empty
    seed_announcements(cursor)
    seed_information_page_contents(cursor)
    conn.commit()
    conn.close()

def seed_profile_data(cursor):
    cursor.execute("SELECT COUNT(*) as cnt FROM profile_items")
    if cursor.fetchone()['cnt'] == 0:
        items = [
            # 1. VISI_MISI (7 Misi Strategis)
            ('VISI_MISI', 'MISI', 'Penegakan Hukum Berkeadilan & Berkepastian', '1', 'Menegakkan supremasi hukum yang objektif, transparan, dan tidak diskriminatif guna memberikan kepastian hukum dan kemanfaatan bagi seluruh warga Kabupaten Klungkung.', 'scale', 1, None),
            ('VISI_MISI', 'MISI', 'Penegakan Hukum Humanis (Restorative Justice)', '2', 'Mewujudkan penegakan hukum berhati nurani dengan mengedepankan keadilan restoratif yang menjunjung tinggi kearifan lokal Bali dan perdamaian di masyarakat.', 'heart-handshake', 2, None),
            ('VISI_MISI', 'MISI', 'Penyelamatan & Pemulihan Keuangan Negara', '3', 'Mengoptimalkan pemulihan aset negara dan penagihan piutang daerah melalui fungsi Jaksa Pengacara Negara (JPN) Datun serta penindakan tindak pidana korupsi secara tegas.', 'coins', 3, None),
            ('VISI_MISI', 'MISI', 'Tata Kelola Birokrasi Bersih Menuju WBK/WBBM', '4', 'Membangun zona integritas yang bebas dari korupsi, kolusi, dan nepotisme serta menerapkan tata kelola birokrasi pemerintahan daerah yang akuntabel.', 'shield-check', 4, None),
            ('VISI_MISI', 'MISI', 'Peningkatan Integritas & Profesionalisme Aparatur', '5', 'Meningkatkan kapasitas keilmuan, kepatuhan kode etik, dan dedikasi moral segenap jaksa dan pegawai kejaksaan dalam menjalankan amanah konstitusi.', 'award', 5, None),
            ('VISI_MISI', 'MISI', 'Pelayanan Publik Terpadu Berbasis Digital (KERTAGOSA)', '6', 'Menyediakan akses layanan terpadu satu pintu (PTSP) yang mudah, ramah, dan cepat melalui inovasi digital JAGADITA, MASADU, dan SEMARA BAKTI bebas pungli.', 'smartphone', 6, None),
            ('VISI_MISI', 'MISI', 'Penerangan Hukum & Kesadaran Hukum Masyarakat', '7', 'Meningkatkan partisipasi aktif warga dalam pencegahan kejahatan melalui sosialisasi hukum, program Jaksa Masuk Sekolah (JMS), dan forum kemitraan masyarakat.', 'megaphone', 7, None),

            # 2. SEJARAH (Linimasa Tonggak Sejarah)
            ('SEJARAH', 'TIMELINE', 'Akar Mahkamah Tradisional Kerta Gosa', 'Abad XVII (1686 M)', 'Ida I Dewa Agung Jambe mendirikan Balai Kerta Gosa di Semarapura sebagai paviliun peradilan adat tertua di Bali dengan lukisan wayang Kamasan Swarga-Neraka.', 'landmark', 1, None),
            ('SEJARAH', 'TIMELINE', 'Kelahiran Kejaksaan Republik Indonesia', '2 September 1945', 'Dua minggu pasca proklamasi kemerdekaan, Kabinet Presidensial pertama mengesahkan pembentukan kejaksaan nasional di bawah naungan Kementerian Kehakiman.', 'flag', 2, None),
            ('SEJARAH', 'TIMELINE', 'Penetapan Hari Bhakti Adhyaksa', '22 Juli 1960', 'Kejaksaan resmi menjadi departemen mandiri yang terpisah dari kehakiman melalui Keputusan Presiden RI No. 204/1960.', 'calendar', 3, None),
            ('SEJARAH', 'TIMELINE', 'Pembangunan Kantor Kejari Klungkung', 'Tahun 1970 - 1980', 'Pembangunan gedung kantor utama Kejaksaan Negeri Klungkung di Jalan Gajah Mada No. 32 Semarapura untuk melayani daratan Klungkung.', 'building-2', 4, None),
            ('SEJARAH', 'TIMELINE', 'Peresmian Cabjari Nusa Penida', 'Tahun 2002', 'Pembentukan Cabang Kejaksaan Negeri Klungkung di Nusa Penida (Cabjari Nusa Penida) untuk mendekatkan akses keadilan bagi masyarakat kepulauan.', 'anchor', 5, None),
            ('SEJARAH', 'TIMELINE', 'Era Inovasi Layanan Terpadu KERTAGOSA', 'Tahun 2024 - Sekarang', 'Peluncuran transformasi digital menyeluruh Portal Terpadu KERTAGOSA menuju predikat Wilayah Bebas dari Korupsi (WBK / WBBM).', 'sparkles', 6, None),

            # 3. LOGO_MAKNA (6 Bedah Elemen Lambang)
            ('LOGO_MAKNA', 'LOGO_ELEM', 'Bintang Emas Bersudut Delapan', 'Keagungan Ketuhanan', 'Melambangkan keagungan hukum ketuhanan, penerang hati nurani aparatur hukum, dan pancaran kebenaran sejati yang harus dipedomani oleh setiap insan Adhyaksa.', 'star', 1, None),
            ('LOGO_MAKNA', 'LOGO_ELEM', 'Pedang Keadilan Tegak Lurus', 'Ketegasan Hukum', 'Melambangkan kekuasaan hukum yang tegas, lurus, dan tidak pandang bulu dalam menumpas kejahatan serta menegakkan kebenaran.', 'sword', 2, None),
            ('LOGO_MAKNA', 'LOGO_ELEM', 'Neraca Penimbang Perkara', 'Keadilan Seimbang', 'Melambangkan keadilan yang seimbang, objektif, dan tidak berat sebelah, menimbang hak dan kewajiban sesuai norma hukum yang berlaku.', 'scale', 3, None),
            ('LOGO_MAKNA', 'LOGO_ELEM', 'Padi dan Kapas Kemakmuran', 'Kesejahteraan Rakyat', 'Melambangkan tujuan akhir dari penegakan hukum berkeadilan, yaitu terwujudnya masyarakat adil, makmur, dan sejahtera yang dilindungi hukum.', 'flower-2', 4, None),
            ('LOGO_MAKNA', 'LOGO_ELEM', 'Lingkaran Perisai Hijau Tua', 'Benteng Integritas', 'Melambangkan benteng pertahanan hukum yang kokoh, keteguhan hati insan kejaksaan, serta ketulusan dalam mengabdi pada kebenaran.', 'shield', 5, None),
            ('LOGO_MAKNA', 'LOGO_ELEM', 'Pita Semboyan Satya Adhi Wicaksana', 'Doktrin Utama', 'Melambangkan tiga pedoman utama pengabdian korps Adhyaksa: Kesetiaan (Satya), Kesempurnaan Tugas (Adhi), dan Kebijaksanaan Nurani (Wicaksana).', 'ribbon', 6, None),

            # 4. TUGAS_WEWENANG (5 Bidang Wewenang)
            ('TUGAS_WEWENANG', 'TUGAS_BIDANG', 'Bidang Tindak Pidana (Pidum & Pidsus)', 'Pasal 30 Ayat (1)', 'Melakukan penuntutan perkara pidana umum & khusus, melaksanakan putusan inkracht hakim, penyidikan tipikor & TPPU, serta fasilitasi perdamaian restorative justice.', 'gavel', 1, None),
            ('TUGAS_WEWENANG', 'TUGAS_BIDANG', 'Bidang Perdata dan Tata Usaha Negara (Datun)', 'Pasal 30 Ayat (2)', 'Bertindak sebagai Jaksa Pengacara Negara (JPN) dalam penegakan hukum, bantuan hukum, pertimbangan hukum, dan pendampingan proyek strategis pemerintah daerah.', 'scale', 2, None),
            ('TUGAS_WEWENANG', 'TUGAS_BIDANG', 'Bidang Intelijen Penegakan Hukum', 'Pasal 30B', 'Menyelenggarakan penyelidikan dan pengamanan intelijen, pengawasan aliran kepercayaan (Pakem), serta edukasi hukum Jaksa Masuk Sekolah & Desa.', 'shield-alert', 3, None),
            ('TUGAS_WEWENANG', 'TUGAS_BIDANG', 'Bidang Pemulihan Aset & Pengelolaan Barang Bukti (PB3R)', 'Pasal 30A', 'Menyimpan dan mengamankan barang bukti sitaan, pengantaran barang bukti gratis SEMARA BAKTI langsung ke rumah warga, serta pelelangan barang rampasan negara.', 'truck', 4, None),
            ('TUGAS_WEWENANG', 'TUGAS_BIDANG', 'Bidang Pembinaan & Pengawasan Internal', 'Pasal 30C', 'Mengelola manajemen SDM kejaksaan, sarana dan prasarana terpadu, penegakan kode etik, dan kepatuhan zona integritas birokrasi WBK / WBBM.', 'settings', 5, None),
        ]
        cursor.executemany("""
        INSERT INTO profile_items (page_type, item_type, title, subtitle, description, icon_name, order_num, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, items)

def seed_profile_page_contents(cursor):
    contents = [
        # VISI MISI
        ('profil_visi_title', 'PROFIL_VISI', 'TEXT', 'Visi dan Misi Kejaksaan Negeri Klungkung', 'Judul Visi Misi'),
        ('profil_visi_text', 'PROFIL_VISI', 'TEXT', 'Kejaksaan Republik Indonesia yang andal, profesional, inovatif, dan berintegritas dalam pelayanan hukum kepada masyarakat untuk mewujudkan Indonesia Maju yang berdaulat, mandiri, dan berkepribadian berlandaskan gotong royong.', 'Teks Kutipan Visi Utama'),
        ('profil_visi_sub', 'PROFIL_VISI', 'TEXT', 'Visi Layanan KERTAGOSA: Pelayanan Cepat, Tepat, dan Bebas Pungli Menuju WBK / WBBM', 'Komitmen Visi Layanan'),
        ('profil_doktrin_satya', 'PROFIL_VISI', 'TEXT', 'Kesetiaan yang bersumber pada rasa jujur, baik terhadap Tuhan Yang Maha Esa, terhadap diri pribadi dan keluarga, maupun terhadap sesama manusia dan negara.', 'Uraian Doktrin Satya'),
        ('profil_doktrin_adhi', 'PROFIL_VISI', 'TEXT', 'Kesempurnaan dalam bertugas dan berunsur utama pemilikan rasa tanggung jawab, baik terhadap Tuhan Yang Maha Esa, terhadap keluarga, maupun terhadap sesama.', 'Uraian Doktrin Adhi'),
        ('profil_doktrin_wicaksana', 'PROFIL_VISI', 'TEXT', 'Bijaksana dalam tutur kata dan perbuatan, khususnya dalam penerapan tugas dan kewenangan, serta peka terhadap keadilan masyarakat.', 'Uraian Doktrin Wicaksana'),
        ('profil_visi_banner_img', 'PROFIL_VISI', 'IMAGE', '/static/images/news-featured.jpg', 'Foto Banner Visi Misi'),

        # SEJARAH
        ('profil_sejarah_card1_title', 'PROFIL_SEJARAH', 'TEXT', 'Kerta Gosa: Warisan Luhur Mahkamah Pengadilan Klungkung', 'Judul Sejarah Kerta Gosa'),
        ('profil_sejarah_card1_content', 'PROFIL_SEJARAH', 'TEXT', 'Kabupaten Klungkung memiliki akar sejarah penegakan hukum yang paling tua dan masyhur di Pulau Dewata. Sekitar akhir abad ke-17 (1686 Masehi), Raja pertama Kerajaan Klungkung, Ida I Dewa Agung Jambe, mendirikan kompleks istana Semarapura lengkap dengan sebuah paviliun peradilan adat terbuka yang dikenal dengan nama Balai Kerta Gosa.\n\nKata Kerta bermakna ketenteraman atau peradilan yang adil, sedangkan Gosa berarti pengumuman atau musyawarah. Di tempat inilah raja bersama para pemuka adat (Kerta/Hakim Adhyaksa masa kerajaan) menyidangkan berbagai sengketa hukum serta memberikan putusan dengan menimbang hukum adat, norma kesusilaan, dan hukum karma phala.\n\nLangit-langit Balai Kerta Gosa dihiasi lukisan wayang Kamasan bergaya klasik yang menggambarkan ganjaran kebaikan (Swarga) dan balasan atas pelanggaran hukum (Neraka). Filosofi inilah yang menjadi jiwa penegakan hukum Kejaksaan Negeri Klungkung: "Keadilan yang memulihkan dan menenteramkan masyarakat".', 'Uraian Sejarah Kerta Gosa'),
        ('profil_sejarah_card1_img', 'PROFIL_SEJARAH', 'IMAGE', '/static/images/peta-klungkung.png', 'Foto Kerta Gosa'),
        ('profil_sejarah_card2_title', 'PROFIL_SEJARAH', 'TEXT', 'Perjalanan Kejaksaan Negeri Klungkung Pasca Kemerdekaan', 'Judul Sejarah Pasca Kemerdekaan'),
        ('profil_sejarah_card2_content', 'PROFIL_SEJARAH', 'TEXT', 'Seiring berdirinya Negara Kesatuan Republik Indonesia, fungsi kejaksaan disahkan secara nasional pada tanggal 2 September 1945 (Hari Lahir Kejaksaan) dan dikukuhkan dengan Hari Bhakti Adhyaksa pada 22 Juli 1960.\n\nKejaksaan Negeri Klungkung didirikan guna melayani kebutuhan hukum masyarakat di wilayah Kabupaten Klungkung, bertempat di Jalan Gajah Mada No. 32, Semarapura. Wilayah yurisdiksi Kejari Klungkung memiliki karakteristik unik karena terdiri dari daratan Klungkung (Kecamatan Klungkung, Banjarangkan, Dawan) dan wilayah kepulauan Nusa Penida.\n\nGuna memastikan seluruh masyarakat kepulauan memperoleh keadilan yang sama tanpa hambatan geografis lautan, dibentuklah Cabang Kejaksaan Negeri Klungkung di Nusa Penida (Cabjari Nusa Penida).', 'Uraian Sejarah Pasca Kemerdekaan'),
        ('profil_sejarah_card2_img', 'PROFIL_SEJARAH', 'IMAGE', '/static/images/kajari-portrait.jpg', 'Foto Kantor Kejari'),

        # LOGO DAN MAKNA
        ('profil_logo_title', 'PROFIL_LOGO', 'TEXT', 'Satya Adhi Wicaksana', 'Judul Semboyan Logo'),
        ('profil_logo_desc', 'PROFIL_LOGO', 'TEXT', 'Lambang Kejaksaan Republik Indonesia berbentuk lingkaran berbingkai emas dengan lingkaran perisai hijau di dalamnya, memuat simbol bintang segi delapan, pedang keadilan, neraca penimbang perkara, serta karangan padi dan kapas kemakmuran.', 'Uraian Lambang Resmi'),
        ('profil_logo_legal', 'PROFIL_LOGO', 'TEXT', 'Ditetapkan berdasarkan Peraturan Jaksa Agung Republik Indonesia', 'Dasar Penetapan Logo'),
        ('profil_logo_emblem_url', 'PROFIL_LOGO', 'IMAGE', '/static/images/logo-kejari.svg', 'Foto Lambang Resmi Besar'),

        # TUGAS DAN WEWENANG
        ('profil_tugas_legal_title', 'PROFIL_TUGAS', 'TEXT', 'Dasar Hukum Utama: UU RI No. 11 Tahun 2021', 'Judul Dasar Hukum Tugas'),
        ('profil_tugas_legal_desc', 'PROFIL_TUGAS', 'TEXT', 'Pasal 30, 30A, 30B, dan 30C UU Kejaksaan menegaskan peran Kejaksaan sebagai pengendali perkara (Dominus Litis), satu-satunya instansi penuntut umum yang sah di Indonesia, serta lembaga penegak hukum yang berorientasi pada pemulihan keadilan dan penyelamatan aset negara.', 'Uraian Dasar Hukum Tugas'),
        ('profil_tugas_banner_img', 'PROFIL_TUGAS', 'IMAGE', '/static/images/news-jms.jpg', 'Foto Ilustrasi Wewenang')
    ]
    for key, sec, ctype, val, lbl in contents:
        cursor.execute("SELECT content_key FROM page_contents WHERE content_key = ?", (key,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO page_contents (content_key, section_name, content_type, content_value, label)
            VALUES (?, ?, ?, ?, ?)
            """, (key, sec, ctype, val, lbl))

def seed_information_page_contents(cursor):
    contents = [
        ('info_berita_hero_title', 'INFO_BERITA', 'TEXT', 'Pusat Berita & Publikasi Hukum', 'Judul Hero Berita'),
        ('info_berita_hero_subtitle', 'INFO_BERITA', 'TEXT', 'Kumpulan berita resmi, siaran pers, pemulihan keuangan negara, penyuluhan hukum, serta kegiatan kemasyarakatan Kejaksaan Negeri Klungkung yang transparan dan akuntabel.', 'Subjudul Hero Berita'),
        ('info_pengumuman_hero_title', 'INFO_PENGUMUMAN', 'TEXT', 'Pengumuman & Maklumat Resmi', 'Judul Hero Pengumuman'),
        ('info_pengumuman_hero_subtitle', 'INFO_PENGUMUMAN', 'TEXT', 'Pemberitahuan resmi mengenai lelang barang rampasan negara, jadwal operasional pelayanan terpadu, pemulihan barang bukti inkracht, seleksi CASN, dan maklumat pelayanan publik Kejaksaan Negeri Klungkung.', 'Subjudul Hero Pengumuman'),
        ('info_sidang_hero_title', 'INFO_SIDANG', 'TEXT', 'JAGADITA — Jadwal Giat Sidang Digital', 'Judul Hero Jadwal Sidang'),
        ('info_sidang_hero_subtitle', 'INFO_SIDANG', 'TEXT', 'Pusat pemantauan jadwal persidangan perkara Tindak Pidana Umum (PIDUM) dan Tindak Pidana Khusus (TIPIKOR/PIDSUS) Kejaksaan Negeri Klungkung secara real-time dan terbuka bagi masyarakat luas.', 'Subjudul Hero Jadwal Sidang'),
        ('info_skm_hero_title', 'INFO_SKM', 'TEXT', 'Survei Kepuasan Masyarakat (SKM)', 'Judul Hero SKM'),
        ('info_skm_hero_subtitle', 'INFO_SKM', 'TEXT', 'Pengukuran komprehensif tingkat kepuasan masyarakat terhadap mutu layanan Kejaksaan Negeri Klungkung berlandaskan Peraturan Menteri PAN-RB Nomor 14 Tahun 2017 untuk mewujudkan pelayanan yang humanis, akuntabel, dan bebas pungli.', 'Subjudul Hero SKM'),
        ('info_skm_infographic_url', 'INFO_SKM', 'IMAGE', '/static/images/hero-bg.jpg', 'Foto/Infografis Piagam SKM'),
        ('digital_services_badge', 'DIGITAL_SERVICES', 'TEXT', 'PORTAL LAYANAN PUBLIK DIGITAL TERPADU', 'Badge Layanan Digital'),
        ('digital_services_title', 'DIGITAL_SERVICES', 'TEXT', 'Layanan Digital Kejaksaan RI & Nasional', 'Judul Layanan Digital'),
        ('digital_services_desc', 'DIGITAL_SERVICES', 'TEXT', 'Akses langsung ke portal resmi Kejaksaan Republik Indonesia dan saluran aspirasi nasional untuk mempermudah konsultasi hukum perdata, penyelesaian tilang, keterbukaan informasi publik, serta aduan pelayanan secara terpadu.', 'Deskripsi Layanan Digital')
    ]
    for key, sec, ctype, val, lbl in contents:
        cursor.execute("SELECT content_key FROM page_contents WHERE content_key = ?", (key,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO page_contents (content_key, section_name, content_type, content_value, label)
            VALUES (?, ?, ?, ?, ?)
            """, (key, sec, ctype, val, lbl))

def seed_announcements(cursor):
    cursor.execute("SELECT COUNT(*) as cnt FROM announcements")
    if cursor.fetchone()['cnt'] == 0:
        announcements = [
            (
                'PENG-04/KPKNL-KLK/X/2026',
                'Pengumuman Lelang Terbuka Barang Rampasan Negara Kendaraan Roda Dua dan Roda Empat',
                'LELANG',
                'LELANG RAMPASAN NEGARA',
                'Kejaksaan Negeri Klungkung bekerjasama dengan KPKNL Denpasar menyelenggarakan lelang terbuka secara online untuk sejumlah unit kendaraan bermotor hasil rampasan perkara pidana inkracht.',
                '<p class="mb-3 text-slate-700">Kejaksaan Negeri Klungkung melalui perantaraan Kantor Pelayanan Kekayaan Negara dan Lelang (KPKNL) Denpasar akan melaksanakan penjualan di muka umum (Lelang Terbuka) terhadap barang rampasan negara yang telah berkekuatan hukum tetap (inkracht van gewijsde).</p><h4 class="font-bold text-slate-900 mb-2">Objek Lelang Meliputi:</h4><ul class="list-disc list-inside space-y-1.5 text-slate-600 mb-4"><li>5 Unit Sepeda Motor Berbagai Merk (Honda Vario, Yamaha NMAX, Suzuki Satria FU)</li><li>1 Unit Mobil Toyota Avanza 1.3 G M/T Tahun 2019</li><li>1 Paket Besi Tua / Scrap Logam Bongkaran</li></ul><h4 class="font-bold text-slate-900 mb-2">Syarat dan Ketentuan:</h4><ol class="list-decimal list-inside space-y-1 text-slate-600 mb-4"><li>Pendaftaran akun terverifikasi di portal resmi lelang: www.lelang.go.id</li><li>Menyetorkan uang jaminan lelang melalui Virtual Account paling lambat 1 hari sebelum penutupan.</li><li>Pemenang lelang wajib melunasi pokok lelang ditambah bea lelang pembeli sebesar 2% dalam waktu 5 hari kerja.</li></ol>',
                '28 Oktober 2026',
                'https://lelang.go.id',
                'Portal Lelang.go.id',
                '/static/images/news-bb.jpg',
                1
            ),
            (
                'PENG-03/PTSP-KLK/X/2026',
                'Penyesuaian Jadwal PTSP Selama Hari Raya Suci Galungan & Kuningan',
                'LAYANAN',
                'JADWAL OPERASIONAL PTSP',
                'Pemberitahuan penyesuaian jam operasional loket tatap muka PTSP Kejari Klungkung selama libur fakultatif rangkaian Hari Raya Suci Galungan dan Kuningan.',
                '<p class="mb-3 text-slate-700">Sehubungan dengan perayaan Hari Suci Galungan dan Kuningan Tahun 2026 di Provinsi Bali, jam operasional loket tatap muka PTSP Kejaksaan Negeri Klungkung disesuaikan sebagai berikut:</p><ul class="list-disc list-inside space-y-2 text-slate-600 mb-4"><li><strong>Hari Penampahan & Galungan:</strong> Loket fisik ditutup sementara (Libur Fakultatif).</li><li><strong>Hari Umanis Galungan:</strong> Pelayanan tatap muka dibuka terbatas pukul 09.00 - 13.00 WITA.</li><li><strong>Layanan Digital Online:</strong> Layanan website KERTAGOSA, pengaduan MASADU, dan jadwal sidang JAGADITA tetap aktif 24 jam nonstop.</li></ul><p class="text-slate-600">Untuk koordinasi permohonan mendesak, silakan menghubungi WhatsApp PTSP: <strong>0811-3800-4444</strong>.</p>',
                '14 Oktober 2026',
                'https://wa.me/6281138004444',
                'WhatsApp PTSP',
                '/static/images/ptsp.jpg',
                2
            ),
            (
                'PENG-02/PB3R-KLK/IX/2026',
                'Pengambilan & Pengantaran Barang Bukti Inkracht Gratis (SEMARA BAKTI)',
                'LAYANAN',
                'SEMARA BAKTI (ANTAR BB)',
                'Layanan pengantaran barang bukti perkara pidana yang telah inkracht langsung ke alamat pemilik secara gratis tanpa dipungut biaya apapun.',
                '<p class="mb-3 text-slate-700">Diberitahukan kepada seluruh pihak yang berhak atas barang bukti perkara pidana umum dan khusus yang perkaranya telah diputus inkracht oleh Pengadilan:</p><div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 mb-4">Program <strong>SEMARA BAKTI</strong> adalah wujud nyata pelayanan prima Kejari Klungkung. Kami mengantarkan barang bukti (sepeda motor, sertifikat tanah, BPKB, handphone, dll) langsung ke depan pintu rumah Anda tanpa biaya, pungutan liar, atau uang bensin.</div><h4 class="font-bold text-slate-900 mb-1">Persyaratan Pengambilan / Antar:</h4><p class="text-slate-600">Cukup menyertakan KTP asli pemilik yang sah, bukti kepemilikan (STNK/BPKB/Surat Kuasa jika diwakilkan), dan nomor amar putusan pengadilan.</p>',
                '28 September 2026',
                '/#pilar-layanan',
                'Ajukan Antar BB',
                '/static/images/news-bb.jpg',
                3
            ),
            (
                'PENG-01/BINKAR-KLK/IX/2026',
                'Seleksi Calon Pegawai Negeri Sipil (CPNS) Kejaksaan RI Tahun Anggaran 2026',
                'REKRUTMEN',
                'SELEKSI CASN KEJAKSAAN',
                'Penerimaan CPNS Kejaksaan RI untuk berbagai kualifikasi pendidikan mulai dari SLTA hingga Sarjana Hukum penempatan seluruh Indonesia.',
                '<p class="mb-3 text-slate-700">Kejaksaan Republik Indonesia memberikan kesempatan kepada Warga Negara Indonesia pria dan wanita yang memiliki integritas dan komitmen tinggi untuk bergabung menjadi insan Adhyaksa.</p><h4 class="font-bold text-slate-900 mb-2">Formasi Kebutuhan Wilayah Kejari Klungkung:</h4><ul class="list-disc list-inside space-y-1.5 text-slate-600 mb-4"><li><strong>Ahli Pertama Jaksa:</strong> S1 Ilmu Hukum (Akreditasi minimal B)</li><li><strong>Analis Perkara Peradilan:</strong> S1 Hukum / Syariah</li><li><strong>Pengelola Barang Bukti:</strong> D3 Administrasi / Komputer</li><li><strong>Petugas Penjaga Tahanan:</strong> SLTA / Sederajat</li></ul><p class="text-slate-600">Pendaftaran resmi dan unggah dokumen hanya melalui: <strong>https://sscasn.bkn.go.id</strong>. Waspadalah terhadap penipuan yang menjanjikan kelulusan!</p>',
                '15 September 2026',
                'https://sscasn.bkn.go.id',
                'Portal SSCASN BKN',
                '/static/images/hero-bg.jpg',
                4
            ),
            (
                'MAKLUMAT-01/KEJARI-KLK/2026',
                'Maklumat Pelayanan Publik dan Pakta Komitmen Bebas Korupsi & Pungli',
                'MAKLUMAT',
                'MAKLUMAT RESMI',
                'Pernyataan kesanggupan jajaran Kejaksaan Negeri Klungkung dalam menyelenggarakan pelayanan publik berkualitas prima tanpa korupsi dan pungutan liar.',
                '<div class="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl text-center space-y-3"><h3 class="font-heading font-black text-base text-amber-950 uppercase tracking-wider">MAKLUMAT PELAYANAN</h3><blockquote class="italic text-slate-800 text-sm leading-relaxed">"Dengan ini kami seluruh jajaran pimpinan dan staf Kejaksaan Negeri Klungkung menyatakan sanggup menyelenggarakan pelayanan publik sesuai standar pelayanan yang telah ditetapkan dan siap menerima sanksi sesuai perundang-undangan apabila tidak menepati janji."</blockquote><p class="text-xs text-emerald-950 font-bold">R. Indra Senjaya, S.H., M.H. — Kepala Kejaksaan Negeri Klungkung</p></div>',
                '10 September 2026',
                '',
                '',
                '/static/images/kajari-portrait.jpg',
                5
            )
        ]
        for num, title, cat, badge, exc, content, deadline, ext_url, ext_lbl, img_url, order_num in announcements:
            cursor.execute("""
            INSERT INTO announcements (announcement_number, title, category, badge_label, excerpt, content, deadline_date, external_url, external_label, image_url, order_num)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (num, title, cat, badge, exc, content, deadline, ext_url, ext_lbl, img_url, order_num))

def seed_accountability_docs(cursor):
    cursor.execute("SELECT COUNT(*) as cnt FROM accountability_docs")
    if cursor.fetchone()['cnt'] == 0:
        docs = [
            # 1. RENCANA STRATEGIS (RENSTRA)
            (
                'RENSTRA',
                'Rencana Strategis (RENSTRA) Kejaksaan Negeri Klungkung Tahun 2020 - 2024',
                '2020-2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (4.8 MB)',
                'Dokumen perencanaan strategis jangka menengah 5 tahunan Kejaksaan Negeri Klungkung yang memuat visi, misi, sasaran strategis, arah kebijakan, dan target indikator kinerja utama.',
                142, 1, 1
            ),
            (
                'RENSTRA',
                'Reviu Rencana Strategis (RENSTRA) Perubahan Tahun 2020 - 2024',
                '2022-2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (3.2 MB)',
                'Penyesuaian target dan indikator kinerja utama (IKU) berdasarkan hasil evaluasi akuntabilitas kinerja berkala dan arahan Kejaksaan Agung RI.',
                89, 2, 1
            ),
            (
                'RENSTRA',
                'Rancangan Awal Rencana Strategis (RENSTRA) Tahun 2025 - 2029',
                '2025-2029',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (3.9 MB)',
                'Draft teknokratis rencana strategis Kejaksaan Negeri Klungkung 5 tahun ke depan selaras dengan RPJMN dan Roadmap Reformasi Birokrasi Nasional.',
                65, 3, 1
            ),

            # 2. RENCANA KERJA (RENJA)
            (
                'RENJA',
                'Rencana Kerja (RENJA) Kejaksaan Negeri Klungkung Tahun 2025',
                '2025',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (3.4 MB)',
                'Rencana operasional tahunan yang memuat prioritas penegakan hukum, 4 pilar inovasi KERTAGOSA, target output perkara, dan alokasi anggaran tahun 2025.',
                118, 1, 1
            ),
            (
                'RENJA',
                'Rencana Kerja (RENJA) Kejaksaan Negeri Klungkung Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (2.9 MB)',
                'Dokumen perencanaan operasional tahunan Kejaksaan Negeri Klungkung tahun anggaran 2024.',
                230, 2, 1
            ),
            (
                'RENJA',
                'Rencana Aksi Kinerja Kejaksaan Negeri Klungkung Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (1.8 MB)',
                'Matriks rincian rencana aksi per triwulan untuk setiap seksi/subbagian di lingkungan Kejari Klungkung.',
                175, 3, 1
            ),
            (
                'RENJA',
                'Perjanjian Kinerja (PK) Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (2.1 MB)',
                'Lembar komitmen perjanjian kinerja antara Kepala Kejaksaan Negeri Klungkung dengan Kepala Kejaksaan Tinggi Bali serta para Kepala Seksi.',
                144, 4, 1
            ),

            # 3. LAPORAN KINERJA (LKj)
            (
                'LKJ',
                'Laporan Kinerja Instansi Pemerintah (LKjIP) Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (5.8 MB)',
                'Laporan pertanggungjawaban komprehensif atas realisasi pencapaian sasaran strategis, efektivitas kegiatan penegakan hukum, dan efisiensi anggaran 2024.',
                260, 1, 1
            ),
            (
                'LKJ',
                'Ringkasan Eksekutif (Executive Summary) LKjIP Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (1.5 MB)',
                'Ringkasan padat dan infografis capaian kinerja utama SAKIP Kejaksaan Negeri Klungkung tahun anggaran 2024.',
                195, 2, 1
            ),
            (
                'LKJ',
                'Laporan Kinerja Instansi Pemerintah (LKjIP) Tahun 2023',
                '2023',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (5.2 MB)',
                'Laporan akuntabilitas kinerja instansi pemerintah Kejari Klungkung periode tahun anggaran 2023 dengan predikat Sangat Baik.',
                310, 3, 1
            ),
            (
                'LKJ',
                'Laporan Kinerja Instansi Pemerintah (LKjIP) Tahun 2022',
                '2022',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (4.7 MB)',
                'Laporan pertanggungjawaban capaian kinerja Kejari Klungkung tahun anggaran 2022.',
                180, 4, 1
            ),

            # 4. LAPORAN KINERJA TRIWULAN
            (
                'TRIWULAN',
                'Laporan Kinerja Triwulan IV Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (2.8 MB)',
                'Evaluasi pemantauan realisasi kinerja Triwulan IV (Oktober - Desember 2024) beserta capaian sasaran program.',
                98, 1, 1
            ),
            (
                'TRIWULAN',
                'Laporan Kinerja Triwulan III Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (2.6 MB)',
                'Evaluasi pemantauan realisasi kinerja Triwulan III (Juli - September 2024).',
                112, 2, 1
            ),
            (
                'TRIWULAN',
                'Laporan Kinerja Triwulan II Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (2.4 MB)',
                'Evaluasi pemantauan realisasi kinerja Triwulan II (April - Juni 2024).',
                105, 3, 1
            ),
            (
                'TRIWULAN',
                'Laporan Kinerja Triwulan I Tahun 2024',
                '2024',
                'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
                'PDF (2.2 MB)',
                'Evaluasi pemantauan realisasi kinerja Triwulan I (Januari - Maret 2024).',
                134, 4, 1
            ),
        ]
        cursor.executemany("""
        INSERT INTO accountability_docs (category, title, period_year, doc_url, file_size, description, views_count, order_num, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, docs)

try:
    init_db_schema()
except Exception as _init_err:
    print(f"[Startup Schema Init Warning] {_init_err}")

def get_current_user(handler):
    # Check Authorization header: Bearer <token>
    auth_header = handler.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
    
    # Or check cookie
    if not token:
        cookie_header = handler.headers.get('Cookie', '')
        for c in cookie_header.split(';'):
            c = c.strip()
            if c.startswith('kertagosa_token='):
                token = c.split('=', 1)[1]
                break

    if token:
        if token in SESSIONS:
            return SESSIONS[token]
        verified = verify_signed_token(token)
        if verified and verified.get('type') == 'session' and verified.get('user'):
            SESSIONS[token] = verified['user']
            return verified['user']
    return None

def number_to_words_id(n):
    """Converts an integer to Indonesian spoken words (terbilang)."""
    units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']
    try:
        n = int(n)
    except (ValueError, TypeError):
        return ''
    if n < 0:
        return 'Minus ' + number_to_words_id(abs(n))
    if n == 0:
        return 'Nol'
    if n < 12:
        return units[n]
    if n < 20:
        return units[n - 10] + ' Belas'
    if n < 100:
        rem = n % 10
        return units[n // 10] + ' Puluh' + ('' if rem == 0 else ' ' + units[rem])
    if n < 200:
        rem = n % 100
        return 'Seratus' + ('' if rem == 0 else ' ' + number_to_words_id(rem))
    if n < 1000:
        rem = n % 100
        return units[n // 100] + ' Ratus' + ('' if rem == 0 else ' ' + number_to_words_id(rem))
    if n < 2000:
        rem = n % 1000
        return 'Seribu' + ('' if rem == 0 else ' ' + number_to_words_id(rem))
    if n < 1000000:
        rem = n % 1000
        return number_to_words_id(n // 1000) + ' Ribu' + ('' if rem == 0 else ' ' + number_to_words_id(rem))
    return str(n)

def format_ba_date_indonesian(date_str):
    """
    Converts 'YYYY-MM-DD' into (day_name, date_spelled)
    e.g. '2026-10-21' -> ('Rabu', 'Dua Puluh Satu bulan Oktober tahun Dua Ribu Dua Puluh Enam')
    """
    if not date_str:
        return '', ''
    import datetime
    try:
        clean_date = str(date_str).strip().split(' ')[0]
        dt = datetime.datetime.strptime(clean_date, '%Y-%m-%d')
    except Exception:
        return '', str(date_str)

    days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

    day_name = days[dt.weekday()]
    day_spelled = number_to_words_id(dt.day)
    month_name = months[dt.month]
    year_spelled = number_to_words_id(dt.year)

    date_spelled = f"{day_spelled} bulan {month_name} tahun {year_spelled}"
    return day_name, date_spelled

def get_active_kasi_pb3r(conn):
    """
    Dynamically fetches the currently serving Kepala Seksi Pemulihan Aset
    dan Pengelolaan Barang Bukti (PB3R) from organization_members table
    to ensure synchronization with CMS organizational structure.
    """
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, name, position, nip, rank
    FROM organization_members
    WHERE (position LIKE '%PB3R%' OR position LIKE '%Barang Bukti%' OR position LIKE '%Pemulihan Aset%')
      AND is_active = 1
    ORDER BY level ASC, order_num ASC, id ASC
    LIMIT 1
    """)
    row = cursor.fetchone()
    if row:
        return dict(row)
    return {
        'id': 0,
        'name': 'I Dewa Gede Raka, S.H.',
        'position': 'Kepala Seksi PB3R (Barang Bukti & Rampasan)',
        'nip': '19811105 200501 1 007',
        'rank': 'Jaksa Muda / III-d'
    }

def safe_b64decode(data_str):
    """
    Safely decode base64 strings even if they contain data-URI prefixes,
    spaces, newlines, or missing padding.
    """
    if not data_str:
        return b''
    if isinstance(data_str, bytes):
        data_str = data_str.decode('utf-8', errors='ignore')
    if ',' in data_str:
        data_str = data_str.split(',', 1)[1]
    # Strip whitespace/newlines first, then replace internal spaces with pluses (common URL/form artifact)
    cleaned = data_str.strip().replace('\n', '').replace('\r', '').replace(' ', '+')
    rem = len(cleaned) % 4
    if rem == 1:
        # A single stray character cannot form a byte in base64, trim it
        cleaned = cleaned[:-1]
        rem = len(cleaned) % 4
    if rem > 0:
        cleaned += '=' * (4 - rem)
    try:
        return base64.b64decode(cleaned)
    except Exception:
        try:
            return base64.b64decode(cleaned + '===')
        except Exception:
            return b''

def save_media_binary(binary_data, filename='upload.jpg', content_key=None, conn=None):
    """
    Saves raw binary data to Vercel Blob (if configured) or local UPLOADS_DIR fallback.
    Returns (public_url, storage_type).
    """
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = '.jpg'
    
    clean_name = f"{int(time.time())}_{uuid.uuid4().hex[:8]}{ext}"
    public_url = None
    storage_type = "LOCAL"

    should_close_conn = False
    if conn is None:
        conn = get_db()
        should_close_conn = True

    try:
        blob_token = vercel_blob.get_blob_token(conn) if vercel_blob else None
        if blob_token:
            blob_res = vercel_blob.upload_to_blob(binary_data, clean_name, token=blob_token, add_random_suffix=True)
            if blob_res.get('success') and blob_res.get('url'):
                public_url = blob_res['url']
                storage_type = "VERCEL_BLOB"
    except Exception as e:
        print(f"[Blob Upload Error] {e}")

    # Local fallback / backup copy
    save_path = os.path.join(UPLOADS_DIR, clean_name)
    try:
        with open(save_path, 'wb') as f:
            f.write(binary_data)
    except Exception as e:
        print(f"[Upload Local Fallback Notice] {e}")

    if not public_url:
        public_url = f"/static/uploads/{clean_name}"

    if content_key:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE page_contents
        SET content_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE content_key = ?
        """, (public_url, content_key))
        if cursor.rowcount == 0:
            cursor.execute("""
            INSERT INTO page_contents (content_key, section_name, content_type, content_value, label)
            VALUES (?, 'HEADER', 'IMAGE', ?, 'Logo Resmi Instansi')
            """, (content_key, public_url))
        conn.commit()

    if should_close_conn:
        conn.close()

    return public_url, storage_type

def save_media_data_uri_if_needed(val, default_name_prefix='media'):
    """
    If val is a base64 data URI (e.g. 'data:image/...;base64,...'), safely decode
    and save it to storage, returning the clean storage URL.
    If val is already a URL or path, returns val unchanged.
    Prevents megabytes of raw base64 data from bloating SQLite tables.
    """
    if not val or not isinstance(val, str):
        return val
    val_strip = val.strip()
    if not val_strip.startswith('data:'):
        return val_strip

    # Extract extension from data-uri header if possible
    ext = '.jpg'
    if ';' in val_strip:
        header = val_strip.split(';')[0]
        if 'image/png' in header:
            ext = '.png'
        elif 'image/webp' in header:
            ext = '.webp'
        elif 'image/svg' in header:
            ext = '.svg'
        elif 'image/gif' in header:
            ext = '.gif'
        elif 'image/jpeg' in header or 'image/jpg' in header:
            ext = '.jpg'

    try:
        binary_data = safe_b64decode(val_strip)
        if not binary_data:
            return val_strip
        filename = f"{default_name_prefix}_{int(time.time())}{ext}"
        public_url, _ = save_media_binary(binary_data, filename=filename)
        return public_url
    except Exception as e:
        print(f"[save_media_data_uri_if_needed Error] {e}")
        return val_strip

class KertagosaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        if 'directory' not in kwargs:
            kwargs['directory'] = BASE_DIR
        super().__init__(*args, **kwargs)

    def _normalize_request_path(self):
        """Normalize path and query string when routed via Vercel rewrites."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        vc_path = qs.pop('__vc_path', None)
        if path in ('/api/index', '/api/index.py', '/api', '/api/') and vc_path:
            sub = vc_path[0].lstrip('/')
            path = f"/api/{sub}" if sub else "/api"
        if path in ('/api/index', '/api/index.py') and hasattr(self, 'headers') and self.headers:
            for hdr in ('x-matched-path', 'x-original-url', 'x-rewrite-url', 'x-vercel-forwarded-url'):
                val = self.headers.get(hdr)
                if val and '/api/' in val:
                    p_val = urllib.parse.urlparse(val).path
                    if p_val not in ('/api/index', '/api/index.py'):
                        path = p_val
                        break
        clean_query = urllib.parse.urlencode(qs, doseq=True)
        self.path = f"{path}?{clean_query}" if clean_query else path

    def end_headers(self):
        # Enterprise-Grade Security Headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
        super().end_headers()

    def get_client_ip(self):
        """Extract reliable client IP from headers or connection address."""
        if hasattr(self, 'headers') and self.headers:
            for hdr in ('x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'fastly-client-ip'):
                val = self.headers.get(hdr)
                if val:
                    return val.split(',')[0].strip()
        if hasattr(self, 'client_address') and self.client_address:
            return self.client_address[0]
        return '127.0.0.1'

    def check_rate_limit(self, category='default', limit=30, window_secs=60):
        """In-memory rate limiting per IP and action category."""
        client_ip = self.get_client_ip()
        now = time.time()
        key = (client_ip, category)
        history = IP_RATE_LIMIT_STORE.get(key, [])
        history = [ts for ts in history if now - ts < window_secs]
        if len(history) >= limit:
            IP_RATE_LIMIT_STORE[key] = history
            return False
        history.append(now)
        IP_RATE_LIMIT_STORE[key] = history
        return True

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.serve_404()
            return
        super().send_error(code, message, explain)

    def serve_404(self):
        not_found_path = os.path.join(BASE_DIR, '404.html')
        if os.path.exists(not_found_path):
            with open(not_found_path, 'rb') as f:
                content = f.read()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            msg = b"404 Halaman Tidak Ditemukan - Kejaksaan Negeri Klungkung"
            self.send_header('Content-Length', str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

    def send_json(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        self._normalize_request_path()
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # High-Security Check: Disallow directory traversal or null byte injection
        if '../' in self.path or '..\\' in self.path or '%2e%2e' in self.path.lower() or '\0' in self.path:
            self.send_error(400, "Bad Request")
            return

        # 1. Route HTML entry points
        if path == '/' or path == '/index.html':
            self.serve_file(os.path.join(BASE_DIR, 'index.html'), 'text/html; charset=utf-8')
            return
        elif path == '/admin' or path == '/admin/' or path == '/admin/dashboard':
            self.serve_file(os.path.join(BASE_DIR, 'admin.html'), 'text/html; charset=utf-8')
            return
        elif path == '/admin/login':
            self.serve_file(os.path.join(BASE_DIR, 'index.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/profil/struktur-organisasi', '/profil-struktur-organisasi.html', '/profil/struktur']:
            self.serve_file(os.path.join(BASE_DIR, 'profil-struktur-organisasi.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/profil/visi-misi', '/profil-visi-misi.html', '/profil/visi-dan-misi']:
            self.serve_file(os.path.join(BASE_DIR, 'profil-visi-misi.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/profil/sejarah', '/profil-sejarah.html']:
            self.serve_file(os.path.join(BASE_DIR, 'profil-sejarah.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/profil/logo-makna', '/profil-logo-makna.html', '/profil/logo-dan-maknanya']:
            self.serve_file(os.path.join(BASE_DIR, 'profil-logo-makna.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/profil/tugas-wewenang', '/profil-tugas-wewenang.html', '/profil/tugas-dan-wewenang']:
            self.serve_file(os.path.join(BASE_DIR, 'profil-tugas-wewenang.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/informasi/berita', '/informasi-berita.html', '/informasi/berita-publikasi']:
            self.serve_file(os.path.join(BASE_DIR, 'informasi-berita.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/informasi/pengumuman', '/informasi-pengumuman.html']:
            self.serve_file(os.path.join(BASE_DIR, 'informasi-pengumuman.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/informasi/jadwal-sidang', '/informasi-jadwal-sidang.html', '/informasi/jagadita']:
            self.serve_file(os.path.join(BASE_DIR, 'informasi-jadwal-sidang.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/informasi/skm', '/informasi-skm.html', '/informasi/ikm', '/informasi/kepuasan']:
            self.serve_file(os.path.join(BASE_DIR, 'informasi-skm.html'), 'text/html; charset=utf-8')
            return
        elif path in ['/akuntabilitas-kinerja', '/akuntabilitas-kinerja.html', '/sakip', '/akuntabilitas']:
            self.serve_file(os.path.join(BASE_DIR, 'akuntabilitas-kinerja.html'), 'text/html; charset=utf-8')
            return

        # 2. Public APIs
        if path == '/api/public/homepage-data':
            self.handle_get_homepage_data(query)
            return
        elif path == '/api/public/accountability':
            self.handle_get_public_accountability(query)
            return
        elif path == '/api/public/organization':
            self.handle_get_organization()
            return
        elif path.startswith('/api/public/news/'):
            slug = path[len('/api/public/news/'):]
            self.handle_get_news_detail(slug)
            return
        elif path.startswith('/api/public/ticket/'):
            ticket_code = path[len('/api/public/ticket/'):]
            self.handle_get_ticket(ticket_code)
            return
        elif path.startswith('/api/public/deliveries/') and path.endswith('/ba'):
            ticket_code = path[len('/api/public/deliveries/'):-3]
            self.handle_get_delivery_ba(ticket_code, is_admin=False)
            return
        elif path == '/api/public/profile-data':
            self.handle_get_profile_data()
            return
        elif path == '/api/public/announcements':
            self.handle_get_public_announcements()
            return
        elif path == '/api/auth/me':
            user = get_current_user(self)
            if user:
                self.send_json({'authenticated': True, 'user': user})
            else:
                self.send_json({'authenticated': False, 'user': None})
            return
        elif path == '/api/auth/mfa-status':
            query = urllib.parse.parse_qs(parsed.query)
            self.handle_get_mfa_status(query)
            return

        # 3. Admin APIs (Protected)
        if path == '/api/admin/submissions':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_get_submissions()
            return
        elif path.startswith('/api/admin/deliveries/') and path.endswith('/ba'):
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            ticket_code = path[len('/api/admin/deliveries/'):-3]
            self.handle_get_delivery_ba(ticket_code, is_admin=True)
            return
        elif path == '/api/admin/submissions/export':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            query = urllib.parse.parse_qs(parsed.query)
            self.handle_export_submissions(query)
            return
        elif path == '/api/admin/jagadita/export':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            query = urllib.parse.parse_qs(parsed.query)
            self.handle_export_jagadita(query)
            return
        elif path == '/api/admin/news/export' or path == '/api/admin/news/template':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            query = urllib.parse.parse_qs(parsed.query)
            is_tpl = (path == '/api/admin/news/template') or bool(query.get('template', [False])[0])
            self.handle_export_news(query, is_template=is_tpl)
            return
        elif path == '/api/admin/organization/template' or path == '/api/admin/organization/export':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            query = urllib.parse.parse_qs(parsed.query)
            is_tpl = (path == '/api/admin/organization/template') or bool(query.get('template', [False])[0])
            self.handle_export_organization(query, is_template=is_tpl)
            return
        elif path == '/api/admin/profile-items':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_get_admin_profile_items()
            return
        elif path == '/api/admin/surveys':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_get_surveys()
            return
        elif path == '/api/admin/users':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_get_admin_users()
            return
        elif path.startswith('/api/admin/users/') and path.endswith('/mfa-setup'):
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            user_id = path.split('/')[4]
            self.handle_get_admin_user_mfa(user_id)
            return
        elif path == '/api/admin/accountability':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_get_admin_accountability()
            return
        elif path == '/api/admin/announcements':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_get_admin_announcements()
            return
        elif path == '/api/admin/blob/status':
            user = get_current_user(self)
            if not user:
                self.send_json({'error': 'Unauthorized'}, 401)
                return
            self.handle_blob_status()
            return

        # 4. Serve uploaded files from UPLOADS_DIR (/tmp/uploads on Vercel or static/uploads locally)
        if path.startswith('/static/uploads/'):
            fname = os.path.basename(path)
            cand_tmp = os.path.join(UPLOADS_DIR, fname)
            cand_static = os.path.join(BASE_DIR, 'static', 'uploads', fname)
            target_file = cand_tmp if os.path.exists(cand_tmp) else cand_static
            if os.path.exists(target_file):
                ctype, _ = mimetypes.guess_type(target_file)
                self.serve_file(target_file, ctype or 'application/octet-stream')
                return

        # 4b. Explicit static assets handler (/static/css/*, /static/js/*, /static/images/*)
        if path.startswith('/static/'):
            clean_rel = path.lstrip('/')
            cand_file = os.path.join(BASE_DIR, clean_rel)
            if os.path.exists(cand_file) and os.path.isfile(cand_file):
                ctype, _ = mimetypes.guess_type(cand_file)
                self.serve_file(cand_file, ctype or 'application/octet-stream')
                return

        # 5. Secure Fallback for Static Files with High-Security Traversal Protection
        clean_rel = path.lstrip('/')
        cand_file = os.path.join(BASE_DIR, clean_rel)
        real_base = os.path.realpath(BASE_DIR)
        real_cand = os.path.realpath(cand_file)

        # Disallow directory traversal outside BASE_DIR
        if not real_cand.startswith(real_base):
            self.send_error(403, "Akses Ditolak: Path traversal terdeteksi.")
            return

        # Disallow direct download of backend source code, SQLite databases, and hidden files
        cand_ext = os.path.splitext(real_cand)[1].lower()
        cand_name = os.path.basename(real_cand)
        if cand_ext in ['.db', '.sqlite', '.sqlite3', '.py', '.env', '.log', '.git'] or (cand_name.startswith('.') and cand_name not in ['.well-known']):
            self.send_error(403, "Akses Ditolak: Berkas internal dilindungi.")
            return

        if os.path.exists(real_cand) and os.path.isfile(real_cand):
            ctype, _ = mimetypes.guess_type(real_cand)
            self.serve_file(real_cand, ctype or 'application/octet-stream')
            return

        # 6. Fallback to custom 404 page (Page Not Found)
        self.serve_404()

    def do_POST(self):
        self._normalize_request_path()
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Public Submissions & Auth with High-Security Rate Limiting
        if path == '/api/auth/login':
            if not self.check_rate_limit('auth_login', limit=5, window_secs=60):
                self.send_json({'error': 'Terlalu banyak percobaan login demi keamanan sistem. Silakan tunggu 1 menit.'}, 429)
                return
            self.handle_login()
            return
        elif path == '/api/auth/verify-mfa':
            if not self.check_rate_limit('auth_mfa', limit=5, window_secs=60):
                self.send_json({'error': 'Terlalu banyak percobaan kode verifikasi. Silakan tunggu 1 menit.'}, 429)
                return
            self.handle_verify_mfa()
            return
        elif path == '/api/auth/logout':
            self.handle_logout()
            return
        elif path == '/api/public/complaints':
            if not self.check_rate_limit('complaints', limit=15, window_secs=60):
                self.send_json({'error': 'Terlalu banyak pengiriman aduan. Silakan tunggu beberapa saat.'}, 429)
                return
            self.handle_submit_complaint()
            return
        elif path == '/api/public/bb-deliveries':
            if not self.check_rate_limit('deliveries', limit=15, window_secs=60):
                self.send_json({'error': 'Terlalu banyak pengiriman permohonan. Silakan tunggu beberapa saat.'}, 429)
                return
            self.handle_submit_delivery()
            return
        elif path == '/api/public/surveys':
            if not self.check_rate_limit('surveys', limit=15, window_secs=60):
                self.send_json({'error': 'Terlalu banyak pengiriman survei. Silakan tunggu beberapa saat.'}, 429)
                return
            self.handle_submit_survey()
            return
        elif path.startswith('/api/public/accountability/') and path.endswith('/view'):
            doc_id = path.split('/')[4]
            self.handle_increment_doc_view(doc_id)
            return

        # 2. Admin APIs
        user = get_current_user(self)
        if not user:
            self.send_json({'error': 'Unauthorized. Silakan login sebagai Admin.'}, 401)
            return

        if path == '/api/admin/page-contents/batch':
            self.handle_batch_update_contents()
            return
        elif path == '/api/admin/blob/status':
            self.handle_blob_status()
            return
        elif path == '/api/admin/blob/test':
            self.handle_blob_test()
            return
        elif path == '/api/admin/blob/settings':
            self.handle_blob_settings()
            return
        elif path == '/api/admin/blob/sync-all':
            self.handle_blob_sync_all()
            return
        elif path == '/api/admin/upload-media':
            self.handle_upload_media()
            return
        elif path == '/api/admin/news':
            self.handle_create_news()
            return
        elif path == '/api/admin/news/import':
            self.handle_import_news()
            return
        elif path == '/api/admin/news/ai-generate':
            self.handle_ai_generate_news()
            return
        elif path == '/api/admin/jagadita':
            self.handle_create_jagadita()
            return
        elif path == '/api/admin/jagadita/import':
            self.handle_import_jagadita()
            return
        elif path == '/api/admin/submissions/import':
            self.handle_import_submissions()
            return
        elif path == '/api/admin/organization/members':
            self.handle_create_organization_member()
            return
        elif path == '/api/admin/organization/import':
            self.handle_import_organization()
            return
        elif path == '/api/admin/organization/settings':
            self.handle_update_organization_settings()
            return
        elif path == '/api/admin/organization/reset':
            self.handle_reset_organization()
            return
        elif path == '/api/admin/users':
            self.handle_create_admin_user()
            return
        elif path.startswith('/api/admin/users/') and path.endswith('/mfa-reset'):
            user_id = path.split('/')[4]
            self.handle_reset_admin_user_mfa(user_id)
            return
        elif path == '/api/admin/accountability':
            self.handle_create_accountability_doc()
            return
        elif path == '/api/admin/profile-items':
            self.handle_create_profile_item()
            return
        elif path == '/api/admin/announcements':
            self.handle_create_announcement()
            return
        elif path.startswith('/api/admin/deliveries/') and path.endswith('/ba'):
            ticket_code = path[len('/api/admin/deliveries/'):-3]
            self.handle_save_delivery_ba(ticket_code)
            return
        else:
            self.send_json({'error': 'Endpoint not found'}, 404)

    def do_PUT(self):
        self._normalize_request_path()
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        user = get_current_user(self)
        if not user:
            self.send_json({'error': 'Unauthorized. Silakan login sebagai Admin.'}, 401)
            return

        if path == '/api/admin/page-contents':
            self.handle_update_page_content()
            return
        elif path.startswith('/api/admin/news/'):
            news_id = path[len('/api/admin/news/'):]
            self.handle_update_news(news_id)
            return
        elif path.startswith('/api/admin/services/'):
            service_id = path[len('/api/admin/services/'):]
            self.handle_update_service(service_id)
            return
        elif path.startswith('/api/admin/jagadita/'):
            schedule_id = path[len('/api/admin/jagadita/'):]
            self.handle_update_jagadita(schedule_id)
            return
        elif path == '/api/admin/skm':
            self.handle_update_skm()
            return
        elif path.startswith('/api/admin/submissions/'):
            parts = path.split('/')
            # /api/admin/submissions/<type>/<id>
            if len(parts) >= 6:
                sub_type = parts[4]
                sub_id = parts[5]
                self.handle_update_submission(sub_type, sub_id)
                return
        elif path.startswith('/api/admin/deliveries/') and path.endswith('/ba'):
            ticket_code = path[len('/api/admin/deliveries/'):-3]
            self.handle_save_delivery_ba(ticket_code)
            return
        elif path.startswith('/api/admin/organization/members/'):
            member_id = path[len('/api/admin/organization/members/'):]
            self.handle_update_organization_member(member_id)
            return
        elif path.startswith('/api/admin/users/'):
            user_id = path[len('/api/admin/users/'):]
            self.handle_update_admin_user(user_id)
            return
        elif path.startswith('/api/admin/accountability/'):
            doc_id = path[len('/api/admin/accountability/'):]
            self.handle_update_accountability_doc(doc_id)
            return
        elif path.startswith('/api/admin/profile-items/'):
            item_id = path[len('/api/admin/profile-items/'):]
            self.handle_update_profile_item(item_id)
            return
        elif path.startswith('/api/admin/announcements/'):
            ann_id = path[len('/api/admin/announcements/'):]
            self.handle_update_announcement(ann_id)
            return
        
        self.send_json({'error': 'Endpoint not found'}, 404)

    def do_DELETE(self):
        self._normalize_request_path()
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        user = get_current_user(self)
        if not user:
            self.send_json({'error': 'Unauthorized. Silakan login sebagai Admin.'}, 401)
            return

        if path.startswith('/api/admin/news/'):
            news_id = path[len('/api/admin/news/'):]
            self.handle_delete_news(news_id)
            return
        elif path.startswith('/api/admin/jagadita/'):
            schedule_id = path[len('/api/admin/jagadita/'):]
            self.handle_delete_jagadita(schedule_id)
            return
        elif path.startswith('/api/admin/organization/members/'):
            member_id = path[len('/api/admin/organization/members/'):]
            self.handle_delete_organization_member(member_id)
            return
        elif path.startswith('/api/admin/users/'):
            user_id = path[len('/api/admin/users/'):]
            self.handle_delete_admin_user(user_id)
            return
        elif path.startswith('/api/admin/accountability/'):
            doc_id = path[len('/api/admin/accountability/'):]
            self.handle_delete_accountability_doc(doc_id)
            return
        elif path.startswith('/api/admin/profile-items/'):
            item_id = path[len('/api/admin/profile-items/'):]
            self.handle_delete_profile_item(item_id)
            return
        elif path.startswith('/api/admin/announcements/'):
            ann_id = path[len('/api/admin/announcements/'):]
            self.handle_delete_announcement(ann_id)
            return
        else:
            self.send_json({'error': 'Endpoint not found'}, 404)

    # ==============================================================
    # HELPER METHODS & API IMPLEMENTATIONS
    # ==============================================================

    def read_json_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                raw_data = self.rfile.read(content_length).decode('utf-8')
                return json.loads(raw_data)
        except Exception as e:
            print("Error reading JSON body:", e)
        return {}

    def serve_file(self, file_path, content_type):
        if not os.path.exists(file_path):
            self.send_error(404, "File not found")
            return
        with open(file_path, 'rb') as f:
            content = f.read()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        self.end_headers()
        self.wfile.write(content)

    def handle_get_homepage_data(self, query):
        try:
            ensure_database_ready()
            conn = get_db()
            cursor = conn.cursor()

            # 1. Page Contents
            cursor.execute("SELECT content_key, section_name, content_type, content_value, label FROM page_contents")
            contents = {row['content_key']: {
                'value': row['content_value'],
                'section': row['section_name'],
                'type': row['content_type'],
                'label': row['label']
            } for row in cursor.fetchall()}

            # 2. News Posts (with category filter if requested)
            category = query.get('category', [None])[0]
            if category and category != 'Semua Berita':
                cursor.execute("""
                SELECT id, title, slug, category, badge_label, excerpt, content, highlight_quote, thumbnail_url, youtube_url, author, layout_type, published_at, views
                FROM posts
                WHERE is_published = 1 AND category = ?
                ORDER BY id ASC
                """, (category,))
            else:
                cursor.execute("""
                SELECT id, title, slug, category, badge_label, excerpt, content, highlight_quote, thumbnail_url, youtube_url, author, layout_type, published_at, views
                FROM posts
                WHERE is_published = 1
                ORDER BY id ASC
                """)
            news = [dict(row) for row in cursor.fetchall()]

            # 3. 4 Pillars Service Cards
            cursor.execute("""
            SELECT id, code, title, badge_text, theme_color, icon_name, description, info_box_text, btn_text, btn_action, link_text, link_action, order_num
            FROM service_cards
            WHERE is_active = 1
            ORDER BY order_num ASC
            """)
            services = [dict(row) for row in cursor.fetchall()]

            # 4. JAGADITA Court Schedules
            q_type = query.get('type', [None])[0]
            q_search = query.get('search', [None])[0]
            sql = "SELECT id, session_time, court_room, case_number, defendant_name, case_type, agenda, prosecutor, status, schedule_date FROM court_schedules WHERE 1=1"
            params = []
            if q_type and q_type != 'Semua':
                sql += " AND case_type = ?"
                params.append(q_type)
            if q_search:
                sql += " AND (case_number LIKE ? OR defendant_name LIKE ? OR prosecutor LIKE ?)"
                params.extend([f"%{q_search}%", f"%{q_search}%", f"%{q_search}%"])
            sql += " ORDER BY id ASC"
            cursor.execute(sql, params)
            schedules = [dict(row) for row in cursor.fetchall()]

            # Count total schedules for filter tabs
            cursor.execute("SELECT COUNT(*) as total FROM court_schedules")
            count_all = cursor.fetchone()['total']
            cursor.execute("SELECT COUNT(*) as total FROM court_schedules WHERE case_type = 'PIDUM'")
            count_pidum = cursor.fetchone()['total']
            cursor.execute("SELECT COUNT(*) as total FROM court_schedules WHERE case_type = 'TIPIKOR' OR case_type = 'PIDSUS'")
            count_pidsus = cursor.fetchone()['total']

            # 5. SKM Metrics
            skm_mode = contents.get('skm_mode', {}).get('value', 'MANUAL')
            skm_metrics = []
            try:
                skm_metrics = json.loads(contents.get('skm_metrics_json', {}).get('value', '[]'))
            except:
                skm_metrics = []

            conn.close()

            self.send_json({
                'success': True,
                'contents': contents,
                'news': news,
                'services': services,
                'schedules': schedules,
                'schedule_counts': {
                    'all': count_all,
                    'pidum': count_pidum,
                    'pidsus': count_pidsus
                },
                'skm': {
                    'main_score': contents.get('skm_main_score', {}).get('value', '88.31'),
                    'period_badge': contents.get('skm_period_badge', {}).get('value', 'TRIWULAN III'),
                    'predicate': contents.get('skm_predicate_text', {}).get('value', 'Mutu Pelayanan: A (Sangat Baik)'),
                    'respondents_count': contents.get('skm_respondents_count', {}).get('value', '412'),
                    'metrics': skm_metrics,
                    'mode': skm_mode
                }
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.send_json({
                'success': True,
                'contents': {
                    'header_title': {'value': 'KEJAKSAAN REPUBLIK INDONESIA - KEJAKSAAN NEGERI KLUNGKUNG'},
                    'hero_main_title': {'value': 'KERTAGOSA'},
                    'hero_description': {'value': 'Melalui "KERTAGOSA", KEJARI Klungkung berkomitmen untuk memberikan kerja yang menekankan pelayanan dan penegakan hukum yang cepat, tepat, dan profesional kepada seluruh masyarakat.'},
                    'hero_stat_1_value': {'value': '88.31'},
                    'hero_stat_1_label': {'value': 'Indeks Kepuasan (Sangat Baik)'},
                    'hero_stat_2_value': {'value': '100%'},
                    'hero_stat_2_label': {'value': 'Transparansi Sidang & Perkara'},
                    'hero_stat_3_value': {'value': 'Rp 0,-'},
                    'hero_stat_3_label': {'value': 'Biaya Pengantaran BB (Gratis)'},
                    'digital_services_badge': {'value': 'PORTAL INTEGRASI RESMI'},
                    'digital_services_title': {'value': 'Layanan Digital Terpadu Kejaksaan RI'},
                    'digital_services_desc': {'value': 'Akses cepat ke portal dan aplikasi resmi nasional Kejaksaan RI dan SP4N LAPOR!'}
                },
                'news': [],
                'services': [],
                'schedules': [],
                'schedule_counts': {'all': 0, 'pidum': 0, 'pidsus': 0},
                'skm': {'main_score': '88.31', 'period_badge': 'TRIWULAN III'},
                'fallback': True,
                'warning': str(e)
            })

    def handle_get_news_detail(self, slug):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM posts WHERE slug = ? OR id = ?", (slug, slug))
        post = cursor.fetchone()
        if not post:
            conn.close()
            self.send_json({'error': 'Artikel tidak ditemukan'}, 404)
            return
        
        # Increment view count
        cursor.execute("UPDATE posts SET views = views + 1 WHERE id = ?", (post['id'],))
        conn.commit()

        post_data = dict(post)
        conn.close()
        self.send_json({'success': True, 'post': post_data})

    def handle_get_ticket(self, ticket_code):
        conn = get_db()
        cursor = conn.cursor()

        # Check in complaints (MASADU)
        cursor.execute("SELECT * FROM complaints WHERE ticket_code = ?", (ticket_code,))
        complaint = cursor.fetchone()
        if complaint:
            res = dict(complaint)
            res['ticket_type'] = 'MASADU (Aduan Masyarakat)'
            conn.close()
            self.send_json({'success': True, 'ticket': res})
            return

        # Check in bb_deliveries (SEMARA BAKTI)
        cursor.execute("SELECT * FROM bb_deliveries WHERE ticket_code = ?", (ticket_code,))
        delivery = cursor.fetchone()
        if delivery:
            res = dict(delivery)
            res['ticket_type'] = 'SEMARA BAKTI (Pengantaran Barang Bukti)'
            conn.close()
            self.send_json({'success': True, 'ticket': res})
            return

        conn.close()
        self.send_json({'error': f'Nomor tiket "{ticket_code}" tidak ditemukan dalam sistem.'}, 404)

    def handle_login(self):
        data = self.read_json_body()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            self.send_json({'error': 'Email/Username dan Password wajib diisi!'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        pwd_hash = hash_password(password)

        cursor.execute("""
        SELECT id, username, email, full_name, role, mfa_enabled, mfa_secret, mfa_provider, mfa_enrolled
        FROM users
        WHERE (username = ? OR email = ?) AND password_hash = ?
        """, (username, username, pwd_hash))
        user = cursor.fetchone()

        if not user:
            conn.close()
            self.send_json({'error': 'Email/Username atau Password salah!'}, 401)
            return

        user_dict = dict(user)
        secret = user_dict.get('mfa_secret')
        if not secret or len(secret.strip()) < 12:
            secret = totp_mfa.deterministic_secret_for_user(user_dict['username'], user_dict.get('email') or '')
            cursor.execute("UPDATE users SET mfa_secret = ? WHERE id = ?", (secret, user_dict['id']))
            conn.commit()
            user_dict['mfa_secret'] = secret
        conn.close()

        # Remove raw secret from session user object
        safe_user = {k: v for k, v in user_dict.items() if k != 'mfa_secret'}

        # Multi-Factor Authentication (Strictly Google Authenticator & Microsoft Authenticator RFC 6238 TOTP)
        account_name = user_dict.get('email') or user_dict.get('username')
        otpauth_uri = totp_mfa.build_otpauth_uri(secret, account_name, issuer="KERTAGOSA Kejari Klungkung")
        qr_svg = totp_mfa.generate_qr_svg(otpauth_uri)
        provider_val = 'MICROSOFT' if (user_dict.get('mfa_provider') or '').upper() == 'MICROSOFT' else 'GOOGLE'
        challenge_obj = {
            'type': 'mfa',
            'user': safe_user,
            'secret': secret,
            'account_name': account_name,
            'expires_at': time.time() + 600  # 10 minutes challenge session
        }
        mfa_token = create_signed_token(challenge_obj)
        MFA_CHALLENGES[mfa_token] = challenge_obj

        # Mask email for privacy
        email = user_dict.get('email', '')
        if '@' in email:
            u_part, d_part = email.split('@', 1)
            masked_email = (u_part[:2] + '***' if len(u_part) > 2 else u_part + '***') + '@' + d_part
        else:
            masked_email = 'email terdaftar'

        is_enrolled = bool(user_dict.get('mfa_enrolled'))

        self.send_json({
            'require_mfa': True,
            'mfa_token': mfa_token,
            'mfa_enrolled': is_enrolled,
            'mfa_type': 'TOTP_AUTHENTICATOR',
            'mfa_provider': provider_val,
            'supported_apps': ['Google Authenticator', 'Microsoft Authenticator'],
            'issuer': 'KERTAGOSA Kejari Klungkung',
            'account_name': account_name,
            'masked_email': masked_email,
            'totp_secret': secret,
            'totp_secret_formatted': totp_mfa.format_secret_display(secret),
            'otpauth_uri': otpauth_uri,
            'qr_svg': qr_svg,
            'totp_period': 30,
            'totp_remaining': totp_mfa.get_totp_remaining_seconds(30),
            'message': 'Kredensial valid. Masukkan 6-digit kode OTP dari aplikasi Google / Microsoft Authenticator.' if is_enrolled else 'Kredensial valid. Silakan scan QR Code dan masukkan 6-digit kode OTP untuk mengaktifkan MFA.'
        })

    def handle_get_mfa_status(self, query):
        mfa_token = (query.get('mfa_token', [''])[0] or '').strip()
        challenge = MFA_CHALLENGES.get(mfa_token)
        if not challenge:
            verified = verify_signed_token(mfa_token)
            if verified and verified.get('type') == 'mfa':
                challenge = verified
        if not challenge or time.time() > challenge['expires_at']:
            self.send_json({'error': 'Sesi MFA tidak valid atau kedaluwarsa'}, 401)
            return

        self.send_json({
            'success': True,
            'supported_apps': ['Google Authenticator', 'Microsoft Authenticator'],
            'totp_remaining': totp_mfa.get_totp_remaining_seconds(30),
            'totp_period': 30
        })

    def handle_verify_mfa(self):
        data = self.read_json_body()
        mfa_token = data.get('mfa_token', '').strip()
        otp_code = str(data.get('otp_code', '')).replace(' ', '').replace('-', '').strip()

        if not mfa_token or not otp_code:
            self.send_json({'error': 'Kode verifikasi MFA (Google / Microsoft Authenticator) dan token wajib disertakan.'}, 400)
            return

        challenge = MFA_CHALLENGES.get(mfa_token)
        if not challenge:
            verified = verify_signed_token(mfa_token)
            if verified and verified.get('type') == 'mfa':
                challenge = verified
        if not challenge:
            self.send_json({'error': 'Sesi verifikasi MFA tidak ditemukan atau telah kedaluwarsa. Silakan login kembali.'}, 401)
            return

        if time.time() > challenge['expires_at']:
            MFA_CHALLENGES.pop(mfa_token, None)
            self.send_json({'error': 'Sesi verifikasi MFA telah kedaluwarsa. Silakan ulangi proses login.'}, 401)
            return

        secret = challenge.get('secret', '')
        is_valid_totp = totp_mfa.verify_totp(secret, otp_code, window=1) if secret else False

        if not is_valid_totp:
            self.send_json({'error': 'Kode 6-digit Authenticator salah atau sudah berganti! Periksa kode terbaru di aplikasi Google / Microsoft Authenticator Anda.'}, 400)
            return

        # Verification successful! Issue full stateless & in-memory session token
        user_dict = challenge['user']
        user_id = user_dict.get('id')
        if user_id:
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("UPDATE users SET mfa_enrolled = 1 WHERE id = ?", (user_id,))
                conn.commit()
                conn.close()
                user_dict['mfa_enrolled'] = 1
            except Exception as e:
                logger.error(f"Failed to update mfa_enrolled for user {user_id}: {e}")

        MFA_CHALLENGES.pop(mfa_token, None)
        token = create_signed_token({
            'type': 'session',
            'user': user_dict,
            'expires_at': time.time() + 86400 * 7
        })
        SESSIONS[token] = user_dict

        body = json.dumps({
            'success': True,
            'token': token,
            'user': user_dict,
            'message': f'Verifikasi Authenticator berhasil! Selamat datang kembali, {user_dict["full_name"]}.'
        }, ensure_ascii=False).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Set-Cookie', f'kertagosa_token={token}; Path=/; HttpOnly; SameSite=Lax')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def handle_logout(self):
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:].strip()
            SESSIONS.pop(token, None)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Set-Cookie', 'kertagosa_token=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
        self.end_headers()
        self.wfile.write(b'{"success": true, "message": "Berhasil logout"}')

    def handle_submit_complaint(self):
        data = self.read_json_body()
        title = data.get('title', '').strip()
        chronology = data.get('chronology', '').strip()
        category = data.get('category', 'Pengaduan Umum').strip()
        is_anonymous = 1 if data.get('is_anonymous') else 0
        reporter_name = 'Anonim' if is_anonymous else data.get('reporter_name', '').strip()
        reporter_phone = None if is_anonymous else data.get('reporter_phone', '').strip()
        attachment_url = data.get('attachment_url', None)

        if not title or not chronology:
            self.send_json({'error': 'Judul dan Kronologi aduan wajib diisi.'}, 400)
            return

        # Generate ticket code: TRK-MASADU-XXXX
        ticket_code = f"TRK-MASADU-{random.randint(1000, 9999)}"

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO complaints (ticket_code, reporter_name, reporter_phone, is_anonymous, category, title, chronology, attachment_url, status, admin_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TERKIRIM', 'Laporan berhasil didaftarkan ke sistem PTSP Kejari Klungkung.')
        """, (ticket_code, reporter_name, reporter_phone, is_anonymous, category, title, chronology, attachment_url))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'ticket_code': ticket_code,
            'message': 'Laporan pengaduan Anda berhasil dikirimkan dengan aman. Simpan nomor tiket untuk melacak status penanganan.'
        })

    def handle_submit_delivery(self):
        data = self.read_json_body()
        case_number = data.get('case_number', '').strip()
        owner_name = data.get('owner_name', '').strip()
        owner_job = data.get('owner_job', '').strip() or 'Wiraswasta'
        defendant_name = data.get('defendant_name', '').strip() or owner_name
        id_card_number = data.get('id_card_number', '').strip()
        item_description = data.get('item_description', '').strip()
        delivery_address = data.get('delivery_address', '').strip()
        district = data.get('district', 'Klungkung').strip()
        phone_number = data.get('phone_number', '').strip()
        preferred_date = data.get('preferred_date', '').strip()

        if not case_number or not owner_name or not item_description or not delivery_address or not phone_number:
            self.send_json({'error': 'Mohon lengkapi seluruh field permohonan pengantaran.'}, 400)
            return

        ticket_code = f"TRK-BB-{random.randint(1000, 9999)}"

        conn = get_db()
        cursor = conn.cursor()
        kasi = get_active_kasi_pb3r(conn)
        cursor.execute("""
        INSERT INTO bb_deliveries (
            ticket_code, case_number, owner_name, owner_job, defendant_name,
            id_card_number, item_description, delivery_address, district, phone_number,
            preferred_date, status, admin_notes,
            kasi_name, kasi_nip, kasi_rank
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'TERKIRIM', 'Permohonan pengantaran barang bukti gratis (SEMARA BAKTI) telah diterima.', ?, ?, ?)
        """, (
            ticket_code, case_number, owner_name, owner_job, defendant_name,
            id_card_number, item_description, delivery_address, district, phone_number,
            preferred_date, kasi.get('name'), kasi.get('nip'), kasi.get('rank')
        ))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'ticket_code': ticket_code,
            'message': 'Permohonan pengantaran barang bukti SEMARA BAKTI berhasil didaftarkan. Petugas kami akan memverifikasi dalam 1x24 jam.'
        })

    def handle_submit_survey(self):
        data = self.read_json_body()
        try:
            s_persyaratan = int(data.get('score_persyaratan', 5))
            s_waktu = int(data.get('score_waktu', 5))
            s_biaya = int(data.get('score_biaya', 5))
            s_petugas = int(data.get('score_petugas', 5))
        except:
            s_persyaratan, s_waktu, s_biaya, s_petugas = 5, 5, 5, 5

        # Normalize 1-5 scale to 100 base
        avg_score = ((s_persyaratan + s_waktu + s_biaya + s_petugas) / 20.0) * 100.0
        respondent_name = data.get('respondent_name', 'Masyarakat Klungkung').strip()
        respondent_phone = data.get('respondent_phone', '').strip()
        service_used = data.get('service_used', 'PTSP / Umum').strip()
        comments = data.get('comments', '').strip()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO surveys (respondent_name, respondent_phone, service_used, score_persyaratan, score_waktu, score_biaya, score_petugas, average_score, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (respondent_name, respondent_phone, service_used, s_persyaratan, s_waktu, s_biaya, s_petugas, avg_score, comments))

        # Check SKM mode
        cursor.execute("SELECT content_value FROM page_contents WHERE content_key = 'skm_mode'")
        mode_row = cursor.fetchone()
        skm_mode = mode_row['content_value'] if mode_row else 'MANUAL'

        if skm_mode == 'AUTO':
            # Recalculate SKM score based on all surveys
            cursor.execute("""
            SELECT 
                AVG(score_persyaratan * 20.0) as p1,
                AVG(score_waktu * 20.0) as p2,
                AVG(score_biaya * 20.0) as p3,
                AVG(score_petugas * 20.0) as p4,
                AVG(average_score) as total_avg,
                COUNT(*) as total_count
            FROM surveys
            """)
            stats = cursor.fetchone()
            if stats and stats['total_count'] > 0:
                new_main_score = f"{stats['total_avg']:.2f}"
                predicate = "Mutu Pelayanan: A (Sangat Baik)" if stats['total_avg'] >= 85 else ("Mutu Pelayanan: B (Baik)" if stats['total_avg'] >= 75 else "Mutu Pelayanan: C (Cukup)")
                new_metrics = json.dumps([
                    {"label": "Prosedur & Persyaratan", "score": round(stats['p1'], 2)},
                    {"label": "Kecepatan Waktu Pelayanan", "score": round(stats['p2'], 2)},
                    {"label": "Bebas Biaya / Tarif (Gratis)", "score": round(stats['p3'], 2)},
                    {"label": "Kompetensi & Perilaku Petugas", "score": round(stats['p4'], 2)}
                ])
                cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_main_score'", (new_main_score,))
                cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_predicate_text'", (predicate,))
                cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_metrics_json'", (new_metrics,))
                cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_respondents_count'", (str(stats['total_count'] + 400),))

        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': 'Terima kasih atas partisipasi Anda dalam Survei Kepuasan Masyarakat (SKM) Kejaksaan Negeri Klungkung!'
        })

    # ==================== ADMIN EDIT CONTROLLERS ====================

    def handle_update_page_content(self):
        data = self.read_json_body()
        content_key = data.get('content_key') or data.get('key')
        content_value = data.get('content_value') if data.get('content_value') is not None else data.get('value')

        if not content_key or content_value is None:
            self.send_json({'error': 'content_key dan content_value wajib diisi'}, 400)
            return

        final_value = str(content_value).strip()
        if final_value.startswith('data:'):
            final_value = save_media_data_uri_if_needed(final_value, content_key)
        if content_key == 'header_logo_url' and not final_value:
            final_value = '/static/images/logo-kejari.svg'

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE page_contents
        SET content_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE content_key = ?
        """, (final_value, content_key))
        
        if cursor.rowcount == 0:
            # Insert if not exists
            section = data.get('section_name', 'HEADER' if 'logo' in content_key else 'GENERAL')
            c_type = data.get('content_type', 'IMAGE' if 'logo' in content_key or 'url' in content_key else 'TEXT')
            label = data.get('label', content_key)
            cursor.execute("""
            INSERT INTO page_contents (content_key, section_name, content_type, content_value, label)
            VALUES (?, ?, ?, ?, ?)
            """, (content_key, section, c_type, final_value, label))

        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'content_key': content_key,
            'content_value': final_value,
            'message': f'"{content_key}" berhasil diperbarui!'
        })

    def handle_batch_update_contents(self):
        data = self.read_json_body()
        items = data.get('items', {})
        if not items:
            self.send_json({'error': 'Tidak ada data yang dikirim'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        for key, val in items.items():
            final_val = str(val).strip()
            if final_val.startswith('data:'):
                final_val = save_media_data_uri_if_needed(final_val, key)
            if key == 'header_logo_url' and not final_val:
                final_val = '/static/images/logo-kejari.svg'
            cursor.execute("""
            UPDATE page_contents
            SET content_value = ?, updated_at = CURRENT_TIMESTAMP
            WHERE content_key = ?
            """, (final_val, key))
            if cursor.rowcount == 0:
                cursor.execute("""
                INSERT INTO page_contents (content_key, section_name, content_type, content_value, label)
                VALUES (?, 'GENERAL', 'TEXT', ?, ?)
                """, (key, final_val, key))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': f'{len(items)} konfigurasi halaman depan berhasil disimpan!'
        })

    def handle_upload_media(self):
        data = self.read_json_body()
        file_data = data.get('file_data') or data.get('data') # base64 string
        filename = data.get('filename') or 'upload.png'
        content_key = data.get('content_key') or data.get('key') # optional: if provided, auto-updates the page_contents key!

        if not file_data:
            self.send_json({'error': 'Tidak ada data file yang diterima'}, 400)
            return

        try:
            binary_data = safe_b64decode(file_data)
            if not binary_data:
                self.send_json({'error': 'Format file base64 tidak valid atau kosong'}, 400)
                return
        except Exception as e:
            self.send_json({'error': f'Format file base64 tidak valid: {str(e)}'}, 400)
            return

        # Determine extension if missing
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            if isinstance(file_data, str) and ';' in file_data:
                header = file_data.split(';')[0]
                if 'image/png' in header:
                    ext = '.png'
                elif 'image/webp' in header:
                    ext = '.webp'
                elif 'image/svg' in header:
                    ext = '.svg'
                elif 'image/gif' in header:
                    ext = '.gif'
                elif 'image/jpeg' in header or 'image/jpg' in header:
                    ext = '.jpg'
            if not ext:
                if 'svg' in filename.lower():
                    ext = '.svg'
                elif 'png' in filename.lower():
                    ext = '.png'
                elif 'webp' in filename.lower():
                    ext = '.webp'
                else:
                    ext = '.jpg'
            filename = f"{os.path.splitext(filename)[0]}{ext}"

        conn = get_db()
        public_url, storage_type = save_media_binary(binary_data, filename=filename, content_key=content_key, conn=conn)
        conn.close()

        msg = 'Gambar berhasil diunggah ke Vercel Blob Cloud CDN!' if storage_type == 'VERCEL_BLOB' else 'Gambar berhasil diunggah ke penyimpanan lokal!'
        self.send_json({
            'success': True,
            'url': public_url,
            'storage': storage_type,
            'content_key': content_key,
            'message': msg
        })

    def handle_blob_status(self):
        conn = get_db()
        token = vercel_blob.get_blob_token(conn) if vercel_blob else ''
        configured = bool(token and token.startswith('vercel_blob_rw_'))
        source = 'ENV' if os.environ.get('BLOB_READ_WRITE_TOKEN') else ('DATABASE' if token else 'NONE')
        masked = vercel_blob.mask_token(token) if vercel_blob else ''
        conn.close()
        self.send_json({
            'success': True,
            'configured': configured,
            'source': source,
            'token_masked': masked,
            'blob_store_endpoint': 'https://blob.vercel-storage.com',
            'message': 'Vercel Blob Cloud Storage aktif & terhubung' if configured else 'Vercel Blob belum terhubung (Mode penyimpanan lokal)'
        })

    def handle_blob_settings(self):
        data = self.read_json_body()
        token = data.get('token', '').strip()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO page_contents (content_key, section_name, content_type, content_value, label, updated_at)
        VALUES ('vercel_blob_token', 'SYSTEM', 'SECRET', ?, 'Vercel Blob Read/Write Token', CURRENT_TIMESTAMP)
        """, (token,))
        conn.commit()
        conn.close()
        self.send_json({
            'success': True,
            'message': 'Token Vercel Blob berhasil disimpan!' if token else 'Token Vercel Blob dihapus (kembali ke penyimpanan lokal).'
        })

    def handle_blob_test(self):
        data = self.read_json_body() if (self.headers.get('Content-Length') and int(self.headers.get('Content-Length', 0)) > 0) else {}
        custom_token = data.get('token', '').strip() or None
        conn = get_db()
        token = custom_token or (vercel_blob.get_blob_token(conn) if vercel_blob else None)
        conn.close()
        if not token:
            self.send_json({'error': 'Token BLOB_READ_WRITE_TOKEN belum diisi atau dikonfigurasi.'}, 400)
            return
        res = vercel_blob.test_blob_connection(token=token)
        if res.get('success'):
            self.send_json(res)
        else:
            self.send_json({'error': res.get('error', 'Gagal tes koneksi ke Vercel Blob')}, 400)

    def handle_blob_sync_all(self):
        conn = get_db()
        token = vercel_blob.get_blob_token(conn) if vercel_blob else None
        conn.close()
        if not token:
            self.send_json({'error': 'Token BLOB_READ_WRITE_TOKEN diperlukan untuk sinkronisasi. Masukkan token terlebih dahulu.'}, 400)
            return
        res = vercel_blob.sync_all_media_to_blob(UPLOADS_DIR, get_db, token=token)
        self.send_json(res)

    def handle_create_news(self):
        data = self.read_json_body()
        title = data.get('title', '').strip()
        category = data.get('category', 'Kegiatan Kejari').strip()
        badge_label = data.get('badge_label', 'BERITA')
        excerpt = data.get('excerpt', '').strip()
        content = data.get('content', '').strip()
        highlight_quote = data.get('highlight_quote', None)
        raw_thumb = (data.get('thumbnail_url') or '').strip()
        thumbnail_url = save_media_data_uri_if_needed(raw_thumb, 'news_thumb') or '/static/images/news-featured.jpg'
        youtube_url = (data.get('youtube_url') or '').strip() or None
        layout_type = data.get('layout_type', 'COMPACT_BOTTOM')
        author = data.get('author', 'Tim Publikasi Kejari')
        published_at = data.get('published_at', time.strftime('%Y-%m-%d'))

        if not title or not excerpt:
            self.send_json({'error': 'Judul dan Ringkasan berita wajib diisi.'}, 400)
            return

        slug = f"{title.lower()[:40].replace(' ', '-')}-{random.randint(100, 999)}"
        # Clean slug
        slug = "".join([c for c in slug if c.isalnum() or c == '-'])

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO posts (title, slug, category, badge_label, excerpt, content, highlight_quote, thumbnail_url, youtube_url, author, layout_type, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, slug, category, badge_label, excerpt, content, highlight_quote, thumbnail_url, youtube_url, author, layout_type, published_at))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'message': 'Artikel berita berhasil dipublikasikan!'
        })

    def handle_update_news(self, news_id):
        data = self.read_json_body()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM posts WHERE id = ?", (news_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_json({'error': 'Artikel tidak ditemukan'}, 404)
            return

        fields = []
        params = []
        for col in ['title', 'category', 'badge_label', 'excerpt', 'content', 'highlight_quote', 'thumbnail_url', 'youtube_url', 'author', 'layout_type', 'published_at', 'is_published']:
            if col in data:
                val = data[col]
                if col == 'thumbnail_url' and val:
                    val = save_media_data_uri_if_needed(str(val).strip(), 'news_thumb')
                fields.append(f"{col} = ?")
                params.append(val)

        if fields:
            params.append(news_id)
            cursor.execute(f"UPDATE posts SET {', '.join(fields)} WHERE id = ?", params)
            conn.commit()

        conn.close()
        self.send_json({'success': True, 'message': 'Artikel berita berhasil diperbarui!'})

    def handle_delete_news(self, news_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM posts WHERE id = ?", (news_id,))
        conn.commit()
        conn.close()
        self.send_json({'success': True, 'message': 'Artikel berita berhasil dihapus!'})

    def handle_export_news(self, query=None, is_template=False):
        """Export news list or download template with exact user-specified columns."""
        query = query or {}
        fmt = (query.get('format', ['xlsx'])[0]).lower()

        headers = [
            "No",
            "Judul Artikel (Wajib)",
            "Kategori (Wajib)",
            "Teks Badge Label",
            "Tata Letak (Layout)",
            "Penulis",
            "Ringkasan Singkat (Wajib)",
            "Kutipan Highlight",
            "Nama File / URL Gambar",
            "Tautan Video YouTube",
            "Isi Berita Lengkap"
        ]

        if is_template:
            rows = [
                [
                    "1",
                    "Kejaksaan Negeri Klungkung Musnahkan Barang Bukti Narkotika dan Tindak Pidana Umum",
                    "Tindak Pidana Umum",
                    "EKSEKUSI PUTUSAN",
                    "FEATURED_MAIN",
                    "Tim Publikasi Kejari",
                    "Kejaksaan Negeri Klungkung melaksanakan eksekusi pemusnahan barang bukti berkekuatan hukum tetap (inkracht) sebagai wujud akuntabilitas publik.",
                    "Pemusnahan ini wujud kepatuhan terhadap putusan pengadilan yang berkekuatan hukum tetap.",
                    "/static/images/news-bb.jpg",
                    "",
                    "SEMARAPURA — Bertempat di halaman kantor Kejaksaan Negeri Klungkung, seksi Pengelolaan Barang Bukti dan Barang Rampasan melaksanakan kegiatan pemusnahan barang bukti perkara tindak pidana umum yang telah memiliki kekuatan hukum tetap (inkracht).\n\nPemusnahan dipimpin langsung oleh jajaran pejabat struktural dan disaksikan oleh perwakilan Pengadilan Negeri, Kepolisian Resor Klungkung, serta Dinas Kesehatan.\n\nBarang bukti yang dimusnahkan mencakup paket narkotika golongan I jenis sabu dan obat-obatan terlarang yang dimusnahkan dengan cara dibakar dan dilarutkan, serta barang bukti tindak pidana lainnya yang dihancurkan sehingga tidak dapat dipergunakan kembali."
                ],
                [
                    "2",
                    "Penyuluhan Hukum Program Jaksa Masuk Sekolah (JMS) Tingkatkan Kesadaran Hukum Pelajar",
                    "Intelijen & JMS",
                    "JAKSA MASUK SEKOLAH",
                    "FEATURED_SIDE",
                    "Seksi Intelijen",
                    "Seksi Intelijen Kejari Klungkung menggelar penyuluhan hukum bertema 'Kenali Hukum, Jauhi Hukuman' di hadapan ratusan siswa SMA.",
                    "Kenali hukum sejak dini agar generasi muda Kabupaten Klungkung terhindar dari perbuatan melawan hukum.",
                    "/static/images/news-jms.jpg",
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "SEMARAPURA — Kejaksaan Negeri Klungkung melalui Seksi Intelijen kembali menggelar kegiatan Jaksa Masuk Sekolah (JMS) yang menyasar ratusan pelajar di Kabupaten Klungkung.\n\nMateri yang disosialisasikan berfokus pada pencegahan kenakalan remaja, bahaya penyalahgunaan narkotika, perundungan (bullying), serta edukasi bermedia sosial secara bijak berlandaskan Undang-Undang ITE.\n\nAntusiasme para siswa terlihat tinggi dalam sesi tanya jawab interaktif bersama tim jaksa penyuluh. Program ini diharapkan dapat mencetak generasi muda Klungkung yang sadar hukum dan berintegritas tinggi."
                ]
            ]
            filename = "Template-Import-Berita-Kejari-Klungkung"
        else:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, title, category, badge_label, layout_type, author, excerpt, highlight_quote, thumbnail_url, youtube_url, content
            FROM posts
            ORDER BY id DESC
            """)
            db_posts = cursor.fetchall()
            conn.close()

            rows = []
            for idx, p in enumerate(db_posts, start=1):
                rows.append([
                    str(idx),
                    p['title'] or "",
                    p['category'] or "Kegiatan Kejari",
                    p['badge_label'] or "",
                    p['layout_type'] or "COMPACT_BOTTOM",
                    p['author'] or "Tim Publikasi Kejari",
                    p['excerpt'] or "",
                    p['highlight_quote'] or "",
                    p['thumbnail_url'] or "",
                    p['youtube_url'] or "",
                    p['content'] or ""
                ])
            filename = f"Data-Berita-Kejari-Klungkung-{time.strftime('%Y%m%d')}"

        if fmt == 'csv':
            buf = io.StringIO()
            writer = csv.writer(buf)
            writer.writerow(headers)
            for r in rows:
                writer.writerow(r)
            payload = buf.getvalue().encode('utf-8-sig')
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv; charset=utf-8')
            self.send_header('Content-Disposition', f'attachment; filename="{filename}.csv"')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # Default: Excel .xlsx
        sheets = [{"name": "Berita KERTAGOSA", "headers": headers, "rows": rows}]
        payload = excel_io.build_xlsx_bytes(sheets)
        self.send_response(200)
        self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.send_header('Content-Disposition', f'attachment; filename="{filename}.xlsx"')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_import_news(self):
        """Bulk import news items from parsed JSON rows or raw Excel/CSV file."""
        data = self.read_json_body()
        items = data.get('items', [])
        file_data = data.get('file_data', '')
        filename = data.get('filename', 'berita.xlsx')
        replace_all = bool(data.get('replace_all', False))

        if file_data and not items:
            try:
                file_bytes = safe_b64decode(file_data)
                parsed_rows = excel_io.parse_excel_or_csv_bytes(file_bytes, filename)
            except Exception as e:
                self.send_json({'error': f'Gagal membaca file Excel/CSV: {str(e)}'}, 400)
                return

            for r in parsed_rows:
                title = r.get('judul_artikel_wajib') or r.get('judul_artikel') or r.get('judul') or r.get('title') or r.get('_col_1') or ''
                category = r.get('kategori_wajib') or r.get('kategori') or r.get('category') or r.get('_col_2') or 'Kegiatan Kejari'
                badge_label = r.get('teks_badge_label') or r.get('badge_label') or r.get('badge') or r.get('_col_3') or 'BERITA TERBARU'
                layout_type = r.get('tata_letak_layout') or r.get('tata_letak') or r.get('layout_type') or r.get('layout') or r.get('_col_4') or 'COMPACT_BOTTOM'
                author = r.get('penulis') or r.get('author') or r.get('_col_5') or 'Tim Publikasi Kejari'
                excerpt = r.get('ringkasan_singkat_wajib') or r.get('ringkasan_singkat') or r.get('ringkasan') or r.get('excerpt') or r.get('_col_6') or ''
                highlight_quote = r.get('kutipan_highlight') or r.get('kutipan') or r.get('highlight_quote') or r.get('_col_7') or None
                thumbnail_url = r.get('nama_file_url_gambar') or r.get('url_gambar') or r.get('gambar') or r.get('thumbnail_url') or r.get('_col_8') or '/static/images/news-featured.jpg'
                youtube_url = r.get('tautan_video_youtube') or r.get('video_youtube') or r.get('youtube_url') or r.get('_col_9') or None
                content = r.get('isi_berita_lengkap') or r.get('isi_berita') or r.get('content') or r.get('_col_10') or ''

                if title:
                    items.append({
                        'title': title,
                        'category': category,
                        'badge_label': badge_label,
                        'layout_type': layout_type,
                        'author': author,
                        'excerpt': excerpt or (content[:160] + '...') if content else 'Publikasi resmi Kejaksaan Negeri Klungkung.',
                        'highlight_quote': highlight_quote,
                        'thumbnail_url': thumbnail_url or '/static/images/news-featured.jpg',
                        'youtube_url': youtube_url,
                        'content': content or excerpt
                    })

        if not items:
            self.send_json({'error': 'File Excel/CSV tidak memiliki baris artikel berita yang valid.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()

        if replace_all:
            cursor.execute("DELETE FROM posts")

        imported = 0
        for it in items:
            t = (it.get('title') or '').strip()
            if not t:
                continue
            slug = f"{t.lower()[:40].replace(' ', '-')}-{random.randint(100, 999)}"
            slug = "".join([c for c in slug if c.isalnum() or c == '-'])
            cat = (it.get('category') or 'Kegiatan Kejari').strip()
            badge = (it.get('badge_label') or 'BERITA TERBARU').strip()
            layout = (it.get('layout_type') or 'COMPACT_BOTTOM').strip()
            author = (it.get('author') or 'Tim Publikasi Kejari').strip()
            exc = (it.get('excerpt') or '').strip()
            if not exc:
                exc = (it.get('content') or '')[:160]
            hq = it.get('highlight_quote')
            thumb = (it.get('thumbnail_url') or '/static/images/news-featured.jpg').strip()
            yt = (it.get('youtube_url') or '').strip() or None
            cnt = (it.get('content') or '').strip()

            cursor.execute("""
            INSERT INTO posts (title, slug, category, badge_label, excerpt, content, highlight_quote, thumbnail_url, youtube_url, author, layout_type, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
            """, (t, slug, cat, badge, exc, cnt, hq, thumb, yt, author, layout))
            imported += 1

        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'count': imported,
            'message': f'Berhasil mengimpor {imported} artikel berita ke dalam database portal!'
        })

    def handle_ai_generate_news(self):
        """Auto-generate news article context from Instagram/YouTube link using Gemini AI."""
        data = self.read_json_body()
        url = (data.get('url') or '').strip()
        if not url:
            self.send_json({'error': 'Tautan / Link Instagram atau YouTube wajib dimasukkan.'}, 400)
            return

        try:
            res = ai_news_generator.auto_generate_news_from_url(url)
            self.send_json(res)
        except Exception as e:
            self.send_json({'error': f'Gagal menghasilkan berita dari tautan: {str(e)}'}, 500)

    def handle_update_service(self, service_id):
        data = self.read_json_body()
        conn = get_db()
        cursor = conn.cursor()

        fields = []
        params = []
        for col in ['title', 'badge_text', 'theme_color', 'icon_name', 'description', 'info_box_text', 'btn_text', 'btn_action', 'link_text', 'link_action']:
            if col in data:
                fields.append(f"{col} = ?")
                params.append(data[col])

        if fields:
            params.append(service_id)
            cursor.execute(f"UPDATE service_cards SET {', '.join(fields)} WHERE id = ? OR code = ?", (*params, service_id))
            conn.commit()

        conn.close()
        self.send_json({'success': True, 'message': 'Kartu pilar layanan berhasil diperbarui!'})

    def handle_create_jagadita(self):
        data = self.read_json_body()
        session_time = data.get('session_time', '09:00 WITA')
        court_room = data.get('court_room', 'R. Sidang Cakra')
        case_number = data.get('case_number', '').strip()
        defendant_name = data.get('defendant_name', '').strip()
        case_type = data.get('case_type', 'PIDUM')
        agenda = data.get('agenda', '').strip()
        prosecutor = data.get('prosecutor', '').strip()
        status = data.get('status', 'TERJADWAL')

        if not case_number or not defendant_name:
            self.send_json({'error': 'Nomor Perkara dan Nama Terdakwa wajib diisi.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO court_schedules (session_time, court_room, case_number, defendant_name, case_type, agenda, prosecutor, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (session_time, court_room, case_number, defendant_name, case_type, agenda, prosecutor, status))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'message': 'Jadwal sidang baru berhasil ditambahkan ke JAGADITA!'
        })

    def handle_update_jagadita(self, schedule_id):
        data = self.read_json_body()
        conn = get_db()
        cursor = conn.cursor()

        fields = []
        params = []
        for col in ['session_time', 'court_room', 'case_number', 'defendant_name', 'case_type', 'agenda', 'prosecutor', 'status']:
            if col in data:
                fields.append(f"{col} = ?")
                params.append(data[col])

        if fields:
            params.append(schedule_id)
            cursor.execute(f"UPDATE court_schedules SET {', '.join(fields)} WHERE id = ?", params)
            conn.commit()

        conn.close()
        self.send_json({'success': True, 'message': 'Jadwal sidang JAGADITA berhasil diperbarui!'})

    def handle_delete_jagadita(self, schedule_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM court_schedules WHERE id = ?", (schedule_id,))
        conn.commit()
        conn.close()
        self.send_json({'success': True, 'message': 'Jadwal sidang JAGADITA berhasil dihapus!'})

    def handle_export_jagadita(self, query):
        fmt = (query.get('format', ['xlsx'])[0] or 'xlsx').lower()
        is_template = (query.get('template', ['0'])[0] == '1')

        headers = ['Waktu Sidang', 'Ruang Sidang', 'Nomor Perkara', 'Nama Terdakwa', 'Jenis Perkara', 'Agenda Sidang', 'Jaksa Penuntut Umum (JPU)', 'Status']
        if is_template:
            rows = [
                ['09:00 WITA', 'R. Sidang Cakra', '91/Pid.B/2026/PN Srp', 'I Wayan Sudarma', 'PIDUM', 'Pembacaan Surat Dakwaan', 'I Kadek Adi, S.H.', 'TERJADWAL'],
                ['10:30 WITA', 'PN Tipikor Denpasar', '14/Pid.Sus-TPK/2026/PN Dps', 'I Made Wirawan', 'TIPIKOR', 'Pemeriksaan Saksi Ahli', 'Ida Bagus Putra, S.H., M.H.', 'TERJADWAL']
            ]
            fname_base = 'Template-Import-Jadwal-Sidang-JAGADITA'
        else:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM court_schedules ORDER BY id ASC")
            rows = [
                [
                    r['session_time'],
                    r['court_room'],
                    r['case_number'],
                    r['defendant_name'],
                    r['case_type'],
                    r['agenda'],
                    r['prosecutor'],
                    r['status']
                ]
                for r in cursor.fetchall()
            ]
            conn.close()
            fname_base = 'Data-Jadwal-Sidang-JAGADITA'

        if fmt == 'csv':
            payload = excel_io.build_csv_bytes(headers, rows)
            ctype = 'text/csv; charset=utf-8'
            ext = 'csv'
        else:
            payload = excel_io.build_xlsx_bytes([{'name': 'Jadwal Sidang JAGADITA', 'headers': headers, 'rows': rows}])
            ctype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ext = 'xlsx'

        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Content-Disposition', f'attachment; filename="{fname_base}.{ext}"')
        self.end_headers()
        self.wfile.write(payload)

    def handle_import_jagadita(self):
        data = self.read_json_body()
        items = data.get('items', [])
        file_data = data.get('file_data', '')
        filename = data.get('filename', 'import.xlsx')

        if file_data and not items:
            try:
                file_bytes = safe_b64decode(file_data)
                parsed_rows = excel_io.parse_excel_or_csv_bytes(file_bytes, filename)
            except Exception as e:
                self.send_json({'error': f'Gagal membaca file Excel/CSV: {str(e)}'}, 400)
                return

            for r in parsed_rows:
                items.append({
                    'session_time': r.get('waktu_sidang') or r.get('waktu') or r.get('session_time') or r.get('_col_0') or '09:00 WITA',
                    'court_room': r.get('ruang_sidang') or r.get('ruang') or r.get('court_room') or r.get('_col_1') or 'R. Sidang Cakra',
                    'case_number': r.get('nomor_perkara') or r.get('no_perkara') or r.get('case_number') or r.get('_col_2') or '-',
                    'defendant_name': r.get('nama_terdakwa') or r.get('terdakwa') or r.get('defendant_name') or r.get('_col_3') or '-',
                    'case_type': (r.get('jenis_perkara') or r.get('jenis') or r.get('case_type') or r.get('_col_4') or 'PIDUM').upper(),
                    'agenda': r.get('agenda_sidang') or r.get('agenda') or r.get('_col_5') or '-',
                    'prosecutor': r.get('jaksa_penuntut_umum_jpu') or r.get('jpu') or r.get('prosecutor') or r.get('_col_6') or '-',
                    'status': (r.get('status') or r.get('_col_7') or 'TERJADWAL').upper()
                })

        if not items:
            self.send_json({'error': 'Daftar jadwal sidang kosong atau file Excel tidak memiliki baris data.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        imported = 0
        for item in items:
            cursor.execute("""
            INSERT INTO court_schedules (session_time, court_room, case_number, defendant_name, case_type, agenda, prosecutor, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item.get('session_time', '09:00 WITA'),
                item.get('court_room', 'R. Sidang Cakra'),
                item.get('case_number', '-'),
                item.get('defendant_name', '-'),
                item.get('case_type', 'PIDUM'),
                item.get('agenda', '-'),
                item.get('prosecutor', '-'),
                item.get('status', 'TERJADWAL')
            ))
            imported += 1
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'count': imported,
            'message': f'{imported} jadwal sidang JAGADITA berhasil diimpor dari Excel ke sistem!'
        })

    def handle_update_skm(self):
        data = self.read_json_body()
        main_score = data.get('main_score')
        period_badge = data.get('period_badge')
        predicate = data.get('predicate')
        mode = data.get('mode')
        metrics = data.get('metrics') # list of {label, score}

        conn = get_db()
        cursor = conn.cursor()

        if main_score is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_main_score'", (str(main_score),))
        if period_badge is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_period_badge'", (str(period_badge),))
        if predicate is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_predicate_text'", (str(predicate),))
        if mode is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_mode'", (str(mode),))
        if metrics is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_metrics_json'", (json.dumps(metrics),))
        respondents_count = data.get('respondents_count')
        if respondents_count is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'skm_respondents_count'", (str(respondents_count),))
        infographic_url = data.get('infographic_url')
        if infographic_url is not None:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_key = 'info_skm_infographic_url'", (str(infographic_url),))

        conn.commit()
        conn.close()

        self.send_json({'success': True, 'message': 'Pengaturan Indeks Kepuasan Masyarakat (SKM) berhasil diperbarui!'})

    def handle_get_submissions(self):
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
        complaints = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM bb_deliveries ORDER BY id DESC")
        deliveries = [dict(r) for r in cursor.fetchall()]

        conn.close()
        self.send_json({
            'success': True,
            'complaints': complaints,
            'deliveries': deliveries
        })

    def handle_get_surveys(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM surveys ORDER BY id DESC")
        surveys = [dict(r) for r in cursor.fetchall()]
        conn.close()
        self.send_json({'success': True, 'surveys': surveys})

    def handle_update_submission(self, sub_type, sub_id):
        data = self.read_json_body()
        new_status = data.get('status')
        admin_notes = data.get('admin_notes')

        conn = get_db()
        cursor = conn.cursor()

        table = 'complaints' if sub_type == 'complaint' else 'bb_deliveries'
        fields = []
        params = []
        if new_status:
            fields.append("status = ?")
            params.append(new_status)
        if admin_notes is not None:
            fields.append("admin_notes = ?")
            params.append(admin_notes)

        if fields:
            params.append(sub_id)
            cursor.execute(f"UPDATE {table} SET {', '.join(fields)} WHERE id = ? OR ticket_code = ?", (*params, sub_id))
            conn.commit()

        conn.close()
        self.send_json({'success': True, 'message': f'Status tiket {sub_id} berhasil diperbarui!'})

    def handle_get_delivery_ba(self, ticket_code, is_admin=False):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bb_deliveries WHERE ticket_code = ?", (ticket_code,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            self.send_json({'error': f'Permohonan barang bukti "{ticket_code}" tidak ditemukan.'}, 404)
            return

        delivery = dict(row)
        active_kasi = get_active_kasi_pb3r(conn)
        conn.close()

        # Dynamic synchronization with organization structure:
        # Default kasi_name, nip, and rank to current active Kasi PB3R if not explicitly locked
        if not delivery.get('kasi_name'):
            delivery['kasi_name'] = active_kasi.get('name') or 'I Dewa Gede Raka, S.H.'
        if not delivery.get('kasi_nip'):
            delivery['kasi_nip'] = active_kasi.get('nip') or '19811105 200501 1 007'
        if not delivery.get('kasi_rank'):
            delivery['kasi_rank'] = active_kasi.get('rank') or 'Jaksa Muda / III-d'

        import datetime
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        ba_date = delivery.get('ba_date') or delivery.get('preferred_date') or today_str
        delivery['ba_date'] = ba_date

        day_name, date_spelled = format_ba_date_indonesian(ba_date)
        if not delivery.get('ba_day'):
            delivery['ba_day'] = day_name
        if not delivery.get('ba_date_spelled'):
            delivery['ba_date_spelled'] = date_spelled

        # Jaksa Yang Mengembalikan defaults
        if not delivery.get('officer_name'):
            delivery['officer_name'] = 'I Komang Arimbawa, S.H.'
        if not delivery.get('officer_nip'):
            delivery['officer_nip'] = '19940315 201701 1 022'
        if not delivery.get('officer_rank'):
            delivery['officer_rank'] = 'Ajun Jaksa / III-b'
        if not delivery.get('officer_position'):
            delivery['officer_position'] = 'Jaksa Penuntut Umum / Petugas Pengembalian BB'

        # Legal Grounds (Dasar Hukum) defaults
        if not delivery.get('defendant_name'):
            delivery['defendant_name'] = delivery.get('owner_name') or 'Terdakwa'
        if not delivery.get('violation_clause'):
            delivery['violation_clause'] = 'Pasal 378 KUHP'
        if not delivery.get('sprint_number'):
            delivery['sprint_number'] = f"PRINT-{delivery.get('id', 101)}/N.1.12/Eoh.3/{datetime.date.today().strftime('%m/%Y')}"
        if not delivery.get('sprint_date'):
            delivery['sprint_date'] = ba_date
        if not delivery.get('court_verdict_number'):
            delivery['court_verdict_number'] = delivery.get('case_number') or '45/Pid.B/2026/PN Srp'
        if not delivery.get('court_verdict_date'):
            delivery['court_verdict_date'] = ba_date

        # Recipient job defaults
        if not delivery.get('owner_job'):
            delivery['owner_job'] = 'Wiraswasta'

        # Witnesses defaults
        if not delivery.get('witness_1'):
            delivery['witness_1'] = 'I Wayan Gede Sunarta, A.Md.'
        if not delivery.get('witness_2'):
            delivery['witness_2'] = 'I Made Sujana, S.Kom.'

        self.send_json({
            'success': True,
            'delivery': delivery,
            'active_kasi_pb3r': active_kasi
        })

    def handle_save_delivery_ba(self, ticket_code):
        data = self.read_json_body()

        ba_date = data.get('ba_date', '').strip()
        if ba_date:
            ba_day, ba_date_spelled = format_ba_date_indonesian(ba_date)
        else:
            ba_day = data.get('ba_day', '').strip()
            ba_date_spelled = data.get('ba_date_spelled', '').strip()

        officer_name = data.get('officer_name', '').strip()
        officer_nip = data.get('officer_nip', '').strip()
        officer_rank = data.get('officer_rank', '').strip()
        officer_position = data.get('officer_position', '').strip()

        defendant_name = data.get('defendant_name', '').strip()
        violation_clause = data.get('violation_clause', '').strip()
        sprint_number = data.get('sprint_number', '').strip()
        sprint_date = data.get('sprint_date', '').strip()
        court_verdict_number = data.get('court_verdict_number', '').strip()
        court_verdict_date = data.get('court_verdict_date', '').strip()

        item_description = data.get('item_description', '').strip()
        owner_name = data.get('owner_name', '').strip()
        owner_job = data.get('owner_job', '').strip() or 'Wiraswasta'
        delivery_address = data.get('delivery_address', '').strip()

        kasi_name = data.get('kasi_name', '').strip()
        kasi_nip = data.get('kasi_nip', '').strip()
        kasi_rank = data.get('kasi_rank', '').strip()

        witness_1 = data.get('witness_1', '').strip()
        witness_2 = data.get('witness_2', '').strip()
        ba_notes = data.get('ba_notes', '').strip()
        status = data.get('status', '').strip()

        conn = get_db()
        cursor = conn.cursor()

        # If sync requested or empty, synchronize from organization_members table
        if not kasi_name or data.get('sync_kasi_with_org'):
            active_kasi = get_active_kasi_pb3r(conn)
            kasi_name = active_kasi.get('name')
            kasi_nip = active_kasi.get('nip')
            kasi_rank = active_kasi.get('rank')

        cursor.execute("""
        UPDATE bb_deliveries
        SET ba_date = ?,
            ba_day = ?,
            ba_date_spelled = ?,
            officer_name = ?,
            officer_nip = ?,
            officer_rank = ?,
            officer_position = ?,
            defendant_name = ?,
            violation_clause = ?,
            sprint_number = ?,
            sprint_date = ?,
            court_verdict_number = ?,
            court_verdict_date = ?,
            item_description = CASE WHEN ? != '' THEN ? ELSE item_description END,
            owner_name = CASE WHEN ? != '' THEN ? ELSE owner_name END,
            owner_job = ?,
            delivery_address = CASE WHEN ? != '' THEN ? ELSE delivery_address END,
            kasi_name = ?,
            kasi_nip = ?,
            kasi_rank = ?,
            witness_1 = ?,
            witness_2 = ?,
            ba_notes = ?,
            status = CASE WHEN ? != '' THEN ? ELSE status END
        WHERE ticket_code = ?
        """, (
            ba_date, ba_day, ba_date_spelled,
            officer_name, officer_nip, officer_rank, officer_position,
            defendant_name, violation_clause, sprint_number, sprint_date,
            court_verdict_number, court_verdict_date,
            item_description, item_description,
            owner_name, owner_name,
            owner_job,
            delivery_address, delivery_address,
            kasi_name, kasi_nip, kasi_rank,
            witness_1, witness_2, ba_notes,
            status, status,
            ticket_code
        ))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': f'Data Berita Acara BA-20 ({ticket_code}) berhasil disimpan dan disinkronkan!'
        })

    def handle_export_submissions(self, query):
        sub_type = (query.get('type', ['all'])[0] or 'all').lower()
        fmt = (query.get('format', ['xlsx'])[0] or 'xlsx').lower()
        is_template = (query.get('template', ['0'])[0] == '1')

        masadu_headers = [
            'No. Tiket', 'Nama Pelapor', 'No. HP / WhatsApp', 'Anonim (Ya/Tidak)',
            'Kategori Aduan', 'Judul Aduan', 'Kronologi Lengkap', 'Status Penanganan',
            'Catatan Tindak Lanjut Admin', 'Tanggal Masuk'
        ]
        semara_headers = [
            'No. Tiket', 'Nomor Perkara Inkracht', 'Nama Pemilik Sah', 'No. KTP / NIK',
            'Deskripsi Barang Bukti', 'Alamat Lengkap Pengantaran', 'Kecamatan Tujuan',
            'No. HP / WhatsApp', 'Tanggal Pengantaran Pilihan', 'Status Pengantaran',
            'Catatan Petugas PB3R', 'Tanggal Permohonan'
        ]

        if is_template:
            if sub_type == 'deliveries':
                sheets = [{
                    'name': 'Template SEMARA BAKTI',
                    'headers': semara_headers,
                    'rows': [
                        [
                            'TRK-BB-8801', '45/Pid.B/2026/PN Srp', 'I Nengah Suputra', '5105031209880001',
                            '1 Unit Sepeda Motor Honda Vario Hitam DK 4412 KL', 'Br. Dinas Kawan, Desa Kusamba',
                            'Dawan', '081239998877', '2026-10-25', 'DIJADWALKAN',
                            'Siap diantar oleh tim PB3R Kejari Klungkung', '2026-10-20'
                        ]
                    ]
                }]
                fname_base = 'Template-Import-SEMARA-BAKTI'
            else:
                sheets = [{
                    'name': 'Template Aduan MASADU',
                    'headers': masadu_headers,
                    'rows': [
                        [
                            'TRK-MASADU-7701', 'I Ketut Sudiana', '081338776655', 'Tidak',
                            'Pelayanan Publik & PTSP', 'Permohonan Informasi Penanganan Perkara',
                            'Mohon informasi perkembangan penanganan laporan pengaduan masyarakat di wilayah Banjarangkan.',
                            'DIVERIFIKASI', 'Telah diteruskan ke Seksi Intelijen', '2026-10-20'
                        ]
                    ]
                }]
                fname_base = 'Template-Import-Aduan-MASADU'
        else:
            conn = get_db()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
            complaints_rows = [
                [
                    r['ticket_code'],
                    r['reporter_name'] or 'Anonim',
                    r['reporter_phone'] or '-',
                    'Ya' if r['is_anonymous'] else 'Tidak',
                    r['category'] or 'Pengaduan Umum',
                    r['title'] or '-',
                    r['chronology'] or '-',
                    r['status'] or 'TERKIRIM',
                    r['admin_notes'] or '-',
                    r['created_at'] or '-'
                ]
                for r in cursor.fetchall()
            ]

            cursor.execute("SELECT * FROM bb_deliveries ORDER BY id DESC")
            deliveries_rows = [
                [
                    r['ticket_code'],
                    r['case_number'] or '-',
                    r['owner_name'] or '-',
                    r['id_card_number'] or '-',
                    r['item_description'] or '-',
                    r['delivery_address'] or '-',
                    r['district'] or 'Klungkung',
                    r['phone_number'] or '-',
                    r['preferred_date'] or '-',
                    r['status'] or 'TERKIRIM',
                    r['admin_notes'] or '-',
                    r['created_at'] or '-'
                ]
                for r in cursor.fetchall()
            ]
            conn.close()

            if sub_type == 'complaints':
                sheets = [{'name': 'Aduan MASADU', 'headers': masadu_headers, 'rows': complaints_rows}]
                fname_base = 'Laporan-Kotak-Masuk-Aduan-MASADU'
            elif sub_type == 'deliveries':
                sheets = [{'name': 'Antar BB SEMARA BAKTI', 'headers': semara_headers, 'rows': deliveries_rows}]
                fname_base = 'Laporan-Kotak-Masuk-SEMARA-BAKTI'
            else:
                sheets = [
                    {'name': 'Aduan MASADU', 'headers': masadu_headers, 'rows': complaints_rows},
                    {'name': 'Antar BB SEMARA BAKTI', 'headers': semara_headers, 'rows': deliveries_rows}
                ]
                fname_base = 'Laporan-Kotak-Masuk-MASADU-dan-SEMARA-BAKTI'

        if fmt == 'csv':
            first_sheet = sheets[0]
            payload = excel_io.build_csv_bytes(first_sheet['headers'], first_sheet['rows'])
            ctype = 'text/csv; charset=utf-8'
            ext = 'csv'
        else:
            payload = excel_io.build_xlsx_bytes(sheets)
            ctype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ext = 'xlsx'

        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Content-Disposition', f'attachment; filename="{fname_base}.{ext}"')
        self.end_headers()
        self.wfile.write(payload)

    def handle_import_submissions(self):
        data = self.read_json_body()
        target = (data.get('target') or 'complaints').strip().lower()
        file_data = data.get('file_data') or ''
        filename = data.get('filename') or 'import.xlsx'
        items = data.get('items') or []

        if file_data and not items:
            try:
                file_bytes = safe_b64decode(file_data)
                items = excel_io.parse_excel_or_csv_bytes(file_bytes, filename)
            except Exception as e:
                self.send_json({'error': f'Gagal memproses file Excel ({filename}): {str(e)}'}, 400)
                return

        if not items:
            self.send_json({'error': 'File Excel tidak berisi baris data yang dapat diimpor.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        imported = 0

        if target in ('deliveries', 'semara_bakti', 'delivery'):
            for r in items:
                ticket_code = (
                    r.get('no_tiket') or r.get('ticket_code') or r.get('_col_0') or ''
                ).strip()
                if not ticket_code or not ticket_code.startswith('TRK-'):
                    ticket_code = f"TRK-BB-{random.randint(1000, 9999)}"
                case_number = (
                    r.get('nomor_perkara_inkracht') or r.get('nomor_perkara') or r.get('no_perkara')
                    or r.get('case_number') or r.get('_col_1') or '-'
                ).strip()
                owner_name = (
                    r.get('nama_pemilik_sah') or r.get('nama_pemilik') or r.get('pemilik')
                    or r.get('owner_name') or r.get('_col_2') or 'Warga Klungkung'
                ).strip()
                id_card = (
                    r.get('no_ktp_nik') or r.get('nik') or r.get('id_card_number') or r.get('_col_3') or '-'
                ).strip()
                item_desc = (
                    r.get('deskripsi_barang_bukti') or r.get('barang_bukti')
                    or r.get('item_description') or r.get('_col_4') or '-'
                ).strip()
                address = (
                    r.get('alamat_lengkap_pengantaran') or r.get('alamat')
                    or r.get('delivery_address') or r.get('_col_5') or '-'
                ).strip()
                district = (
                    r.get('kecamatan_tujuan') or r.get('kecamatan') or r.get('district') or r.get('_col_6') or 'Klungkung'
                ).strip()
                phone = (
                    r.get('no_hp_whatsapp') or r.get('no_hp') or r.get('phone_number') or r.get('_col_7') or '-'
                ).strip()
                pref_date = (
                    r.get('tanggal_pengantaran_pilihan') or r.get('tanggal_pengantaran')
                    or r.get('preferred_date') or r.get('_col_8') or time.strftime('%Y-%m-%d')
                ).strip()
                status = (
                    r.get('status_pengantaran') or r.get('status') or r.get('_col_9') or 'TERKIRIM'
                ).strip().upper()
                notes = (
                    r.get('catatan_petugas_pb3r') or r.get('catatan_admin') or r.get('admin_notes')
                    or r.get('_col_10') or 'Diimpor melalui Excel oleh Admin.'
                ).strip()

                cursor.execute("SELECT id FROM bb_deliveries WHERE ticket_code = ?", (ticket_code,))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                    UPDATE bb_deliveries
                    SET case_number=?, owner_name=?, id_card_number=?, item_description=?,
                        delivery_address=?, district=?, phone_number=?, preferred_date=?, status=?, admin_notes=?
                    WHERE id=?
                    """, (case_number, owner_name, id_card, item_desc, address, district, phone, pref_date, status, notes, existing['id']))
                else:
                    cursor.execute("""
                    INSERT INTO bb_deliveries (ticket_code, case_number, owner_name, id_card_number, item_description, delivery_address, district, phone_number, preferred_date, status, admin_notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (ticket_code, case_number, owner_name, id_card, item_desc, address, district, phone, pref_date, status, notes))
                imported += 1
            label_target = 'Antar Barang Bukti (SEMARA BAKTI)'
        else:
            for r in items:
                ticket_code = (
                    r.get('no_tiket') or r.get('ticket_code') or r.get('_col_0') or ''
                ).strip()
                if not ticket_code or not ticket_code.startswith('TRK-'):
                    ticket_code = f"TRK-MASADU-{random.randint(1000, 9999)}"
                reporter_name = (
                    r.get('nama_pelapor') or r.get('pelapor') or r.get('reporter_name') or r.get('_col_1') or 'Anonim'
                ).strip()
                reporter_phone = (
                    r.get('no_hp_whatsapp') or r.get('no_hp') or r.get('reporter_phone') or r.get('_col_2') or '-'
                ).strip()
                anon_str = (r.get('anonim_ya_tidak') or r.get('is_anonymous') or r.get('_col_3') or 'Tidak').strip().lower()
                is_anon = 1 if anon_str in ('ya', 'yes', '1', 'true') or reporter_name.lower() == 'anonim' else 0
                category = (
                    r.get('kategori_aduan') or r.get('kategori') or r.get('category') or r.get('_col_4') or 'Pengaduan Umum'
                ).strip()
                title = (
                    r.get('judul_aduan') or r.get('judul') or r.get('title') or r.get('_col_5') or 'Laporan Masyarakat'
                ).strip()
                chronology = (
                    r.get('kronologi_lengkap') or r.get('kronologi') or r.get('chronology') or r.get('_col_6') or title
                ).strip()
                status = (
                    r.get('status_penanganan') or r.get('status') or r.get('_col_7') or 'TERKIRIM'
                ).strip().upper()
                notes = (
                    r.get('catatan_tindak_lanjut_admin') or r.get('catatan_admin') or r.get('admin_notes')
                    or r.get('_col_8') or 'Data aduan berhasil diimpor melalui Excel.'
                ).strip()

                cursor.execute("SELECT id FROM complaints WHERE ticket_code = ?", (ticket_code,))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                    UPDATE complaints
                    SET reporter_name=?, reporter_phone=?, is_anonymous=?, category=?, title=?, chronology=?, status=?, admin_notes=?
                    WHERE id=?
                    """, (reporter_name, reporter_phone, is_anon, category, title, chronology, status, notes, existing['id']))
                else:
                    cursor.execute("""
                    INSERT INTO complaints (ticket_code, reporter_name, reporter_phone, is_anonymous, category, title, chronology, status, admin_notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (ticket_code, reporter_name, reporter_phone, is_anon, category, title, chronology, status, notes))
                imported += 1
            label_target = 'Aduan Masyarakat (MASADU)'

        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'count': imported,
            'target': target,
            'message': f'{imported} data tiket {label_target} berhasil diimpor dari file Excel!'
        })

    # ==============================================================
    # ORGANIZATIONAL CHART (STRUKTUR ORGANISASI) CRUD & SETTINGS
    # ==============================================================

    def handle_get_organization(self):
        conn = get_db()
        cursor = conn.cursor()

        # Check if caller is authenticated admin
        user = get_current_user(self)
        is_admin = bool(user and user.get('role') == 'ADMIN')

        # 1. Fetch settings from page_contents
        cursor.execute("SELECT content_key, content_value FROM page_contents WHERE section_name = 'organization'")
        org_settings = {row['content_key']: row['content_value'] for row in cursor.fetchall()}
        
        settings = {
            'logo_left': org_settings.get('org_logo_left', '/static/images/logo-kejari.svg'),
            'logo_right': org_settings.get('org_logo_right', '/static/images/logo-wbk.svg'),
            'watermark_bg': org_settings.get('org_watermark_bg', '/static/images/logo-kejari.svg'),
            'watermark_opacity': int(org_settings.get('org_watermark_opacity', '12')),
            'title': org_settings.get('org_title', 'STRUKTUR ORGANISASI'),
            'subtitle': org_settings.get('org_subtitle', 'KEJAKSAAN NEGERI KLUNGKUNG'),
            'legal_basis': org_settings.get('org_legal_basis', 'Berdasarkan Peraturan Kejaksaan RI Nomor PER-006/A/JA/07/2017 tentang Organisasi dan Tata Kerja Kejaksaan Republik Indonesia'),
            'level_1_title': org_settings.get('org_level_1_title', 'LEVEL 1: PIMPINAN TERTINGGI'),
            'level_2_title': org_settings.get('org_level_2_title', 'LEVEL 2: KEPALA SUB BAGIAN & KEPALA SEKSI'),
            'level_3_title': org_settings.get('org_level_3_title', 'LEVEL 3: KEPALA SUB SEKSI & KEPALA URUSAN'),
            'level_4_title': org_settings.get('org_level_4_title', 'LEVEL 4: KELOMPOK JABATAN FUNGSIONAL & AHLI YUSTISIAL'),
            'level_5_title': org_settings.get('org_level_5_title', 'LEVEL 5: PELAKSANA & STAF TEKNIS ADMINISTRASI')
        }

        # 2. Fetch members
        cursor.execute("""
        SELECT id, name, position, level, parent_id, photo_url, nip, rank, order_num, is_active, created_at
        FROM organization_members
        WHERE is_active = 1
        ORDER BY level ASC, order_num ASC, id ASC
        """)
        raw_members = [dict(r) for r in cursor.fetchall()]
        conn.close()

        # Build parent map and hierarchy
        id_map = {m['id']: m for m in raw_members}
        members = []
        for m in raw_members:
            m['parent_name'] = id_map.get(m['parent_id'], {}).get('name') if m.get('parent_id') else None
            # Privacy Protection: If caller is not an authenticated Admin, redact NIP and Rank
            if not is_admin:
                m['nip'] = None
                m['rank'] = None
            members.append(m)

        level_1 = [m for m in members if m['level'] == 1]
        level_2 = [m for m in members if m['level'] == 2]
        level_3 = [m for m in members if m['level'] == 3]
        level_4 = [m for m in members if m['level'] == 4]
        level_5 = [m for m in members if m['level'] == 5]

        for k in level_2:
            k['children'] = [s for s in level_3 if s.get('parent_id') == k['id']]

        self.send_json({
            'success': True,
            'is_admin': is_admin,
            'settings': settings,
            'members': members,
            'hierarchy': {
                'level_1': level_1,
                'level_2': level_2,
                'level_3': level_3,
                'level_4': level_4,
                'level_5': level_5
            }
        })

    def handle_create_organization_member(self):
        data = self.read_json_body()
        name = data.get('name', '').strip()
        position = data.get('position', '').strip()
        try:
            level = int(data.get('level', 4))
        except:
            level = 4
        parent_id = data.get('parent_id')
        if parent_id in ['', None, 'null', 0, '0']:
            parent_id = None
        else:
            try:
                parent_id = int(parent_id)
            except:
                parent_id = None

        raw_photo = (data.get('photo_url') or '').strip()
        photo_url = save_media_data_uri_if_needed(raw_photo, 'org_member') or '/static/images/avatar-officer-male.svg'
        nip = data.get('nip', '').strip()
        rank = data.get('rank', '').strip()
        try:
            order_num = int(data.get('order_num', 0))
        except:
            order_num = 0

        if not name or not position:
            self.send_json({'error': 'Nama dan Jabatan wajib diisi.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO organization_members (name, position, level, parent_id, photo_url, nip, rank, order_num, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (name, position, level, parent_id, photo_url, nip, rank, order_num))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'message': f'Pegawai "{name}" berhasil ditambahkan ke dalam struktur organisasi!'
        })

    def handle_update_organization_member(self, member_id):
        data = self.read_json_body()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM organization_members WHERE id = ?", (member_id,))
        existing = cursor.fetchone()
        if not existing:
            conn.close()
            self.send_json({'error': 'Pegawai tidak ditemukan.'}, 404)
            return

        name = data.get('name', existing['name']).strip() if ('name' in data and data['name']) else existing['name']
        position = data.get('position', existing['position']).strip() if ('position' in data and data['position']) else existing['position']

        if 'level' in data and data['level'] not in ('', None):
            try:
                level = int(data['level'])
            except:
                level = existing['level']
        else:
            level = existing['level']

        if 'parent_id' in data:
            pid_raw = data['parent_id']
            if pid_raw in ['', None, 'null', 0, '0']:
                parent_id = None
            else:
                try:
                    parent_id = int(pid_raw)
                except:
                    parent_id = None
        else:
            parent_id = existing['parent_id']

        photo_url = data.get('photo_url', existing['photo_url'])
        if photo_url:
            photo_url = save_media_data_uri_if_needed(str(photo_url).strip(), 'org_member')
        nip = data.get('nip', existing['nip'])
        rank = data.get('rank', existing['rank'])

        if 'order_num' in data and data['order_num'] not in ('', None):
            try:
                order_num = int(data['order_num'])
            except:
                order_num = existing['order_num']
        else:
            order_num = existing['order_num']

        cursor.execute("""
        UPDATE organization_members
        SET name = ?, position = ?, level = ?, parent_id = ?, photo_url = ?, nip = ?, rank = ?, order_num = ?
        WHERE id = ?
        """, (name, position, level, parent_id, photo_url, nip, rank, order_num, member_id))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': int(member_id),
            'name': name,
            'parent_id': parent_id,
            'level': level,
            'message': f'Hierarki & data pegawai "{name}" berhasil diperbarui!'
        })

    def handle_delete_organization_member(self, member_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM organization_members WHERE id = ?", (member_id,))
        row = cursor.fetchone()
        name = row['name'] if row else f'ID {member_id}'

        cursor.execute("DELETE FROM organization_members WHERE id = ?", (member_id,))
        cursor.execute("UPDATE organization_members SET parent_id = NULL WHERE parent_id = ?", (member_id,))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': f'Pegawai "{name}" berhasil dihapus dari struktur organisasi.'
        })

    def handle_update_organization_settings(self):
        data = self.read_json_body()
        mapping = {
            'org_logo_left': data.get('logo_left'),
            'org_logo_right': data.get('logo_right'),
            'org_watermark_bg': data.get('watermark_bg'),
            'org_watermark_opacity': str(data.get('watermark_opacity', '12')) if data.get('watermark_opacity') is not None else None,
            'org_title': data.get('title'),
            'org_subtitle': data.get('subtitle'),
            'org_legal_basis': data.get('legal_basis'),
            'org_level_1_title': data.get('level_1_title'),
            'org_level_2_title': data.get('level_2_title'),
            'org_level_3_title': data.get('level_3_title'),
            'org_level_4_title': data.get('level_4_title'),
            'org_level_5_title': data.get('level_5_title')
        }

        conn = get_db()
        cursor = conn.cursor()
        for k, v in mapping.items():
            if v is not None:
                cursor.execute("""
                INSERT INTO page_contents (content_key, section_name, content_type, content_value, label)
                VALUES (?, 'organization', 'TEXT', ?, ?)
                ON CONFLICT(content_key) DO UPDATE SET content_value = ?, updated_at = CURRENT_TIMESTAMP
                """, (k, str(v), k, str(v)))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': 'Pengaturan tampilan & penamaan level bagan organisasi berhasil diperbarui!'
        })

    def handle_reset_organization(self):
        import seed_organization
        seed_organization.seed_organization()
        self.send_json({
            'success': True,
            'message': 'Struktur organisasi berhasil di-reset ke susunan resmi Kejaksaan Negeri Klungkung!'
        })

    def handle_export_organization(self, query, is_template=False):
        """Export organization personnel data to Excel or generate official Excel template."""
        headers = [
            "No",
            "Nama Lengkap & Gelar (Wajib)",
            "Jabatan dalam Organisasi (Wajib)",
            "Level Hierarki (1-5)",
            "NIP (Opsional)",
            "Pangkat / Golongan (Opsional)",
            "Nama Atasan Langsung (Opsional)",
            "Nomor Urutan Tampilan"
        ]

        if is_template:
            rows = [
                ["1", "I Wayan Sujana, S.H.", "Pelaksana Tata Usaha & Kepegawaian", "5", "19940512 201902 1 002", "Pengatur (II/c)", "Kepala Sub Bagian Pembinaan", "1"],
                ["2", "Ni Kadek Aryani, A.Md.", "Petugas PTSP (Pelayanan Terpadu Satu Pintu)", "5", "19960824 202001 2 005", "Pengatur Muda (II/a)", "Kepala Sub Bagian Pembinaan", "2"],
                ["3", "I Komang Darmawan", "Pengawal Tahanan / Pengemudi", "5", "19951110 202103 1 004", "Pengatur Muda (II/a)", "Kepala Seksi Tindak Pidana Umum", "3"],
                ["4", "I Gede Putra Pratama", "Pengelola Barang Bukti", "5", "19930704 201801 1 001", "Pengatur (II/c)", "Kepala Seksi Pengelolaan Barang Bukti & Pemulihan Aset", "4"],
                ["5", "Ni Putu Dewi Lestari, S.Kom.", "Operator Komputer & IT", "5", "19970218 202202 2 003", "Pengatur (II/c)", "Kepala Sub Bagian Pembinaan", "5"]
            ]
            sheet_title = "Template Pegawai Kejari"
            filename = "template_data_pegawai_kejari_klungkung.xlsx"
        else:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            SELECT m.id, m.name, m.position, m.level, m.nip, m.rank, m.order_num, p.name as parent_name
            FROM organization_members m
            LEFT JOIN organization_members p ON m.parent_id = p.id
            WHERE m.is_active = 1
            ORDER BY m.level ASC, m.order_num ASC, m.id ASC
            """)
            db_rows = cursor.fetchall()
            conn.close()
            rows = []
            for idx, r in enumerate(db_rows, start=1):
                rows.append([
                    str(idx),
                    r['name'] or '',
                    r['position'] or '',
                    str(r['level'] or 4),
                    r['nip'] or '',
                    r['rank'] or '',
                    r['parent_name'] or '',
                    str(r['order_num'] or 1)
                ])
            sheet_title = "Data Pegawai"
            filename = "data_pegawai_kejari_klungkung.xlsx"

        sheet = {
            "name": sheet_title,
            "headers": headers,
            "rows": rows
        }

        guide_sheet = {
            "name": "Petunjuk Pengisian",
            "headers": ["Kolom", "Keterangan", "Contoh Nilai"],
            "rows": [
                ["Nama Lengkap & Gelar", "Wajib diisi lengkap beserta gelar kehormatan / akademik", "R. Indra Senjaya, S.H., M.H."],
                ["Jabatan dalam Organisasi", "Wajib diisi sesuai nama jabatan resmi atau seksi", "Pelaksana Tata Usaha & Kepegawaian"],
                ["Level Hierarki", "1: Pimpinan (Kajari), 2: Kasi/Kabag, 3: Kasubsi/Kaur, 4: Fungsional, 5: Pelaksana / Staf Teknis", "5"],
                ["NIP", "Opsional, format nomor induk pegawai resmi", "19750512 199903 1 002"],
                ["Pangkat / Golongan", "Opsional, pangkat dan ruang dinas", "Pengatur / II-c"],
                ["Nama Atasan Langsung", "Opsional, nama atasan atau nama jabatan atasan", "Kepala Sub Bagian Pembinaan"],
                ["Nomor Urutan Tampilan", "Nomor urut posisi tampilan pada struktur (1, 2, 3...)", "1"]
            ]
        }

        xlsx_payload = excel_io.build_xlsx_bytes([sheet, guide_sheet])
        self.send_response(200)
        self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
        self.send_header('Content-Length', str(len(xlsx_payload)))
        self.end_headers()
        self.wfile.write(xlsx_payload)

    def handle_import_organization(self):
        """Bulk import organization personnel from parsed JSON rows or raw Excel/CSV file."""
        data = self.read_json_body()
        items = data.get('items', [])
        file_data = data.get('file_data', '')
        filename = data.get('filename', 'pegawai.xlsx')
        replace_all = bool(data.get('replace_all', False))

        if file_data and not items:
            try:
                file_bytes = safe_b64decode(file_data)
                parsed_rows = excel_io.parse_excel_or_csv_bytes(file_bytes, filename)
            except Exception as e:
                self.send_json({'error': f'Gagal membaca file Excel/CSV: {str(e)}'}, 400)
                return

            for r in parsed_rows:
                name = r.get('nama_lengkap_gelar_wajib') or r.get('nama_lengkap_gelar') or r.get('nama_lengkap') or r.get('nama') or r.get('name') or r.get('_col_1') or ''
                position = r.get('jabatan_dalam_organisasi_wajib') or r.get('jabatan_dalam_organisasi') or r.get('jabatan') or r.get('position') or r.get('_col_2') or ''
                level_str = r.get('level_hierarki_1_5') or r.get('level_hierarki') or r.get('level') or r.get('_col_3') or '5'
                nip = r.get('nip_opsional') or r.get('nip') or r.get('_col_4') or ''
                rank = r.get('pangkat_golongan_opsional') or r.get('pangkat_golongan') or r.get('pangkat') or r.get('rank') or r.get('_col_5') or ''
                parent_name = r.get('nama_atasan_langsung_opsional') or r.get('nama_atasan_langsung') or r.get('atasan_langsung') or r.get('atasan') or r.get('_col_6') or ''
                order_str = r.get('nomor_urutan_tampilan') or r.get('nomor_urutan') or r.get('urutan') or r.get('order_num') or r.get('_col_7') or '1'
                photo_url = r.get('url_foto') or r.get('foto') or r.get('_col_8') or '/static/images/avatar-officer-male.svg'

                if name and position:
                    try:
                        lvl = int(level_str)
                    except:
                        lvl = 5
                    try:
                        ord_num = int(order_str)
                    except:
                        ord_num = 1
                    items.append({
                        'name': name.strip(),
                        'position': position.strip(),
                        'level': lvl,
                        'nip': nip.strip(),
                        'rank': rank.strip(),
                        'parent_name': parent_name.strip(),
                        'order_num': ord_num,
                        'photo_url': photo_url.strip() or '/static/images/avatar-officer-male.svg'
                    })

        if not items:
            self.send_json({'error': 'File Excel/CSV tidak memiliki data pegawai yang valid (Kolom Nama dan Jabatan wajib diisi).'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()

        # Build name and position map of existing members for parent lookup
        cursor.execute("SELECT id, name, position FROM organization_members WHERE is_active = 1")
        existing = cursor.fetchall()
        name_to_id = {row['name'].lower().strip(): row['id'] for row in existing}
        pos_to_id = {row['position'].lower().strip(): row['id'] for row in existing}

        if replace_all:
            cursor.execute("DELETE FROM organization_members")
            name_to_id = {}
            pos_to_id = {}

        imported_count = 0
        for it in items:
            name = (it.get('name') or '').strip()
            position = (it.get('position') or '').strip()
            if not name or not position:
                continue

            level = int(it.get('level', 5))
            nip = (it.get('nip') or '').strip()
            rank = (it.get('rank') or '').strip()
            order_num = int(it.get('order_num', 1))
            photo_url = (it.get('photo_url') or '').strip() or '/static/images/avatar-officer-male.svg'

            parent_id = it.get('parent_id')
            if not parent_id and it.get('parent_name'):
                p_query = it['parent_name'].lower().strip()
                parent_id = name_to_id.get(p_query) or pos_to_id.get(p_query)

            cursor.execute("""
            INSERT INTO organization_members (name, position, level, parent_id, photo_url, nip, rank, order_num, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (name, position, level, parent_id, photo_url, nip, rank, order_num))
            new_id = cursor.lastrowid
            name_to_id[name.lower()] = new_id
            pos_to_id[position.lower()] = new_id
            imported_count += 1

        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'imported_count': imported_count,
            'message': f'Berhasil mengimpor {imported_count} data pegawai ke dalam struktur organisasi!'
        })

    # ==============================================================
    # USER & ADMIN MANAGEMENT (CRUD)
    # ==============================================================

    def handle_get_admin_users(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, username, email, full_name, role, mfa_enabled, mfa_secret, mfa_provider, mfa_enrolled, created_at
        FROM users
        ORDER BY id ASC
        """)
        users = []
        for r in cursor.fetchall():
            u = dict(r)
            sec = u.get('mfa_secret') or totp_mfa.deterministic_secret_for_user(u['username'], u.get('email') or '')
            u['mfa_provider'] = 'MICROSOFT' if (u.get('mfa_provider') or '').upper() == 'MICROSOFT' else 'GOOGLE'
            u['totp_secret_formatted'] = totp_mfa.format_secret_display(sec)
            u.pop('mfa_secret', None)
            users.append(u)
        conn.close()
        self.send_json({'success': True, 'users': users})

    def handle_get_admin_user_mfa(self, user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, username, email, full_name, role, mfa_enabled, mfa_secret, mfa_provider
        FROM users WHERE id = ?
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            self.send_json({'error': 'Pengguna admin tidak ditemukan.'}, 404)
            return

        u = dict(row)
        secret = u.get('mfa_secret')
        if not secret or len(secret.strip()) < 12:
            secret = totp_mfa.deterministic_secret_for_user(u['username'], u.get('email') or '')
            cursor.execute("UPDATE users SET mfa_secret = ? WHERE id = ?", (secret, u['id']))
            conn.commit()
        conn.close()

        account_name = u.get('email') or u.get('username')
        otpauth_uri = totp_mfa.build_otpauth_uri(secret, account_name, issuer="KERTAGOSA Kejari Klungkung")
        qr_svg = totp_mfa.generate_qr_svg(otpauth_uri)
        provider_val = 'MICROSOFT' if (u.get('mfa_provider') or '').upper() == 'MICROSOFT' else 'GOOGLE'

        self.send_json({
            'success': True,
            'user_id': u['id'],
            'username': u['username'],
            'email': u['email'],
            'full_name': u['full_name'],
            'mfa_enabled': True,
            'mfa_provider': provider_val,
            'supported_apps': ['Google Authenticator', 'Microsoft Authenticator'],
            'issuer': 'KERTAGOSA Kejari Klungkung',
            'account_name': account_name,
            'totp_secret': secret,
            'totp_secret_formatted': totp_mfa.format_secret_display(secret),
            'otpauth_uri': otpauth_uri,
            'qr_svg': qr_svg,
            'totp_remaining': totp_mfa.get_totp_remaining_seconds(30),
            'totp_period': 30
        })

    def handle_reset_admin_user_mfa(self, user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, full_name, mfa_provider FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            self.send_json({'error': 'Pengguna admin tidak ditemukan.'}, 404)
            return

        u = dict(row)
        new_secret = totp_mfa.generate_base32_secret(16)
        cursor.execute("UPDATE users SET mfa_secret = ?, mfa_enabled = 1, mfa_enrolled = 0 WHERE id = ?", (new_secret, user_id))
        conn.commit()
        conn.close()

        account_name = u.get('email') or u.get('username')
        otpauth_uri = totp_mfa.build_otpauth_uri(new_secret, account_name, issuer="KERTAGOSA Kejari Klungkung")
        qr_svg = totp_mfa.generate_qr_svg(otpauth_uri)

        self.send_json({
            'success': True,
            'user_id': u['id'],
            'username': u['username'],
            'email': u['email'],
            'mfa_enrolled': False,
            'totp_secret': new_secret,
            'totp_secret_formatted': totp_mfa.format_secret_display(new_secret),
            'otpauth_uri': otpauth_uri,
            'qr_svg': qr_svg,
            'totp_remaining': totp_mfa.get_totp_remaining_seconds(30),
            'message': f'Kunci Rahasia Authenticator untuk "{u["full_name"]}" berhasil diperbarui! Silakan pindai ulang QR Code di Google / Microsoft Authenticator.'
        })

    def handle_create_admin_user(self):
        data = self.read_json_body()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        full_name = data.get('full_name', '').strip()
        password = data.get('password', '').strip()
        role = data.get('role', 'ADMIN').strip()
        mfa_enabled = 1
        raw_prov = (data.get('mfa_provider') or 'GOOGLE').strip().upper()
        mfa_provider = 'MICROSOFT' if raw_prov == 'MICROSOFT' else 'GOOGLE'

        if not username or not email or not full_name or not password:
            self.send_json({'error': 'Mohon lengkapi username, email, nama lengkap, dan password.'}, 400)
            return

        if len(password) < 6:
            self.send_json({'error': 'Password minimal terdiri dari 6 karakter.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()

        # Check existing username or email
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
        if cursor.fetchone():
            conn.close()
            self.send_json({'error': f'Username "{username}" atau Email "{email}" sudah terdaftar.'}, 400)
            return

        pwd_hash = hash_password(password)
        mfa_secret = totp_mfa.generate_base32_secret(16)
        cursor.execute("""
        INSERT INTO users (username, email, password_hash, full_name, role, mfa_enabled, mfa_secret, mfa_provider, mfa_enrolled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (username, email, pwd_hash, full_name, role, mfa_enabled, mfa_secret, mfa_provider))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'totp_secret': mfa_secret,
            'totp_secret_formatted': totp_mfa.format_secret_display(mfa_secret),
            'message': f'Administrator baru "{full_name}" berhasil didaftarkan dengan proteksi Google / Microsoft Authenticator!'
        })

    def handle_update_admin_user(self, user_id):
        data = self.read_json_body()
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip()
        role = data.get('role', 'ADMIN').strip()
        password = data.get('password', '').strip()
        mfa_enabled = 1 if data.get('mfa_enabled', True) else 0
        mfa_provider = data.get('mfa_provider', 'GOOGLE_MICROSOFT').strip() or 'GOOGLE_MICROSOFT'

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id, username FROM users WHERE id = ?", (user_id,))
        existing = cursor.fetchone()
        if not existing:
            conn.close()
            self.send_json({'error': 'Pengguna admin tidak ditemukan.'}, 404)
            return

        # Check email uniqueness if changed
        if email:
            cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", (email, user_id))
            if cursor.fetchone():
                conn.close()
                self.send_json({'error': f'Email "{email}" telah digunakan oleh admin lain.'}, 400)
                return

        fields = ["full_name = ?", "email = ?", "role = ?", "mfa_enabled = ?", "mfa_provider = ?"]
        params = [full_name, email, role, mfa_enabled, mfa_provider]

        if password:
            if len(password) < 6:
                conn.close()
                self.send_json({'error': 'Password baru minimal 6 karakter.'}, 400)
                return
            fields.append("password_hash = ?")
            params.append(hash_password(password))

        params.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", params)
        conn.commit()
        conn.close()

        self.send_json({'success': True, 'message': 'Data administrator berhasil diperbarui!'})

    def handle_delete_admin_user(self, user_id):
        conn = get_db()
        cursor = conn.cursor()

        # Check total count
        cursor.execute("SELECT COUNT(*) as cnt FROM users")
        total = cursor.fetchone()['cnt']
        if total <= 1:
            conn.close()
            self.send_json({'error': 'Tidak dapat menghapus admin terakhir pada sistem! Minimal harus tersisa 1 admin.'}, 400)
            return

        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()

        self.send_json({'success': True, 'message': 'Administrator berhasil dihapus dari sistem.'})

    # ==============================================================
    # AKUNTABILITAS KINERJA (SAKIP) HANDLERS
    # ==============================================================

    def handle_get_public_accountability(self, query):
        conn = get_db()
        cursor = conn.cursor()

        category = query.get('category', [None])[0]
        year = query.get('year', [None])[0]
        search = query.get('search', [None])[0]

        sql = "SELECT * FROM accountability_docs WHERE is_active = 1"
        params = []

        if category and category.upper() != 'ALL':
            sql += " AND UPPER(category) = ?"
            params.append(category.upper())

        if year and year.upper() != 'ALL':
            sql += " AND period_year LIKE ?"
            params.append(f"%{year}%")

        if search:
            sql += " AND (title LIKE ? OR description LIKE ? OR period_year LIKE ?)"
            s_term = f"%{search}%"
            params.extend([s_term, s_term, s_term])

        sql += """ ORDER BY 
            CASE category 
                WHEN 'RENSTRA' THEN 1 
                WHEN 'RENJA' THEN 2 
                WHEN 'LKJ' THEN 3 
                WHEN 'TRIWULAN' THEN 4 
                ELSE 5 
            END, 
            order_num ASC, 
            id DESC"""

        cursor.execute(sql, params)
        docs = [dict(row) for row in cursor.fetchall()]

        # Compute summary statistics
        cursor.execute("SELECT category, COUNT(*) as count FROM accountability_docs WHERE is_active = 1 GROUP BY category")
        counts_by_cat = {row['category']: row['count'] for row in cursor.fetchall()}

        cursor.execute("SELECT DISTINCT period_year FROM accountability_docs WHERE is_active = 1 ORDER BY period_year DESC")
        years = [row['period_year'] for row in cursor.fetchall()]

        categories_def = [
            {
                'key': 'RENSTRA',
                'title': 'RENCANA STRATEGIS (RENSTRA)',
                'subtitle': 'Dokumen Perencanaan Jangka Menengah 5 Tahunan',
                'icon': 'target',
                'count': counts_by_cat.get('RENSTRA', 0)
            },
            {
                'key': 'RENJA',
                'title': 'RENCANA KERJA (RENJA)',
                'subtitle': 'Rencana Operasional Tahunan & Alokasi Kinerja',
                'icon': 'calendar-check',
                'count': counts_by_cat.get('RENJA', 0)
            },
            {
                'key': 'LKJ',
                'title': 'LAPORAN KINERJA (LKj)',
                'subtitle': 'Akuntabilitas Realisasi Capaian Kinerja Tahunan (LKjIP)',
                'icon': 'file-check',
                'count': counts_by_cat.get('LKJ', 0)
            },
            {
                'key': 'TRIWULAN',
                'title': 'LAPORAN KINERJA TRIWULAN',
                'subtitle': 'Evaluasi Pemantauan Capaian Kinerja Berkala Per Triwulan',
                'icon': 'bar-chart-3',
                'count': counts_by_cat.get('TRIWULAN', 0)
            }
        ]

        total_active = sum(counts_by_cat.values())
        conn.close()

        self.send_json({
            'success': True,
            'categories': categories_def,
            'documents': docs,
            'years': years,
            'stats': {
                'total_docs': total_active,
                'renstra_count': counts_by_cat.get('RENSTRA', 0),
                'renja_count': counts_by_cat.get('RENJA', 0),
                'lkj_count': counts_by_cat.get('LKJ', 0),
                'triwulan_count': counts_by_cat.get('TRIWULAN', 0)
            }
        })

    def handle_get_admin_accountability(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM accountability_docs 
            ORDER BY 
                CASE category 
                    WHEN 'RENSTRA' THEN 1 
                    WHEN 'RENJA' THEN 2 
                    WHEN 'LKJ' THEN 3 
                    WHEN 'TRIWULAN' THEN 4 
                    ELSE 5 
                END, 
                order_num ASC, 
                id DESC
        """)
        docs = [dict(row) for row in cursor.fetchall()]

        cursor.execute("SELECT category, COUNT(*) as count FROM accountability_docs GROUP BY category")
        counts = {row['category']: row['count'] for row in cursor.fetchall()}
        conn.close()

        self.send_json({
            'success': True,
            'documents': docs,
            'stats': {
                'total': len(docs),
                'renstra': counts.get('RENSTRA', 0),
                'renja': counts.get('RENJA', 0),
                'lkj': counts.get('LKJ', 0),
                'triwulan': counts.get('TRIWULAN', 0)
            }
        })

    def handle_create_accountability_doc(self):
        data = self.read_json_body()
        category = data.get('category', 'RENSTRA').strip().upper()
        title = data.get('title', '').strip()
        period_year = data.get('period_year', '').strip()
        doc_url = data.get('doc_url', '').strip()
        file_size = data.get('file_size', 'PDF (3.0 MB)').strip()
        description = data.get('description', '').strip()
        order_num = int(data.get('order_num', 1))
        is_active = 1 if data.get('is_active', True) else 0

        if not title:
            self.send_json({'error': 'Nama / Judul dokumen wajib diisi.'}, 400)
            return
        if not doc_url:
            self.send_json({'error': 'Tautan / Link Google Drive dokumen wajib diisi.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO accountability_docs (category, title, period_year, doc_url, file_size, description, order_num, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (category, title, period_year, doc_url, file_size, description, order_num, is_active))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'message': f'Dokumen "{title}" berhasil ditambahkan ke kategori {category}!'
        })

    def handle_update_accountability_doc(self, doc_id):
        data = self.read_json_body()
        category = data.get('category', '').strip().upper()
        title = data.get('title', '').strip()
        period_year = data.get('period_year', '').strip()
        doc_url = data.get('doc_url', '').strip()
        file_size = data.get('file_size', '').strip()
        description = data.get('description', '').strip()
        order_num = int(data.get('order_num', 1))
        is_active = 1 if data.get('is_active', True) else 0

        if not title:
            self.send_json({'error': 'Nama / Judul dokumen wajib diisi.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM accountability_docs WHERE id = ?", (doc_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_json({'error': 'Dokumen tidak ditemukan.'}, 404)
            return

        cursor.execute("""
        UPDATE accountability_docs
        SET category = ?, title = ?, period_year = ?, doc_url = ?, file_size = ?, description = ?, order_num = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (category, title, period_year, doc_url, file_size, description, order_num, is_active, doc_id))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': f'Dokumen "{title}" berhasil diperbarui!'
        })

    def handle_delete_accountability_doc(self, doc_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT title FROM accountability_docs WHERE id = ?", (doc_id,))
        doc = cursor.fetchone()
        if not doc:
            conn.close()
            self.send_json({'error': 'Dokumen tidak ditemukan.'}, 404)
            return

        title = doc['title']
        cursor.execute("DELETE FROM accountability_docs WHERE id = ?", (doc_id,))
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'message': f'Dokumen "{title}" berhasil dihapus.'
        })

    def handle_increment_doc_view(self, doc_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE accountability_docs SET views_count = views_count + 1 WHERE id = ?", (doc_id,))
        conn.commit()
        conn.close()
        self.send_json({'success': True})

    # ==================== PROFIL CMS CONTROLLERS ====================

    def handle_get_profile_data(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        page_type = query.get('page_type', [None])[0]

        user = get_current_user(self)
        is_admin = bool(user and user.get('role') == 'ADMIN')

        conn = get_db()
        cursor = conn.cursor()

        if page_type:
            cursor.execute("""
            SELECT * FROM profile_items 
            WHERE page_type = ? AND is_active = 1 
            ORDER BY order_num ASC, id ASC
            """, (page_type,))
        else:
            cursor.execute("""
            SELECT * FROM profile_items 
            WHERE is_active = 1 
            ORDER BY page_type ASC, order_num ASC, id ASC
            """)
        items = [dict(row) for row in cursor.fetchall()]

        cursor.execute("SELECT * FROM page_contents WHERE content_key LIKE 'profil_%' OR content_key = 'header_logo_url'")
        contents = {row['content_key']: dict(row) for row in cursor.fetchall()}
        conn.close()

        self.send_json({
            'success': True,
            'is_admin': is_admin,
            'page_type': page_type,
            'items': items,
            'contents': contents
        })

    def handle_get_admin_profile_items(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profile_items ORDER BY page_type ASC, order_num ASC, id ASC")
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
        self.send_json({'success': True, 'items': items})

    def handle_create_profile_item(self):
        data = self.read_json_body()
        page_type = data.get('page_type', 'VISI_MISI').strip().upper()
        item_type = data.get('item_type', 'MISI').strip().upper()
        title = data.get('title', '').strip()
        subtitle = data.get('subtitle', '').strip()
        description = data.get('description', '').strip()
        icon_name = data.get('icon_name', 'check-circle').strip()
        order_num = int(data.get('order_num', 1))
        image_url = data.get('image_url', '').strip()

        if not title or not description:
            self.send_json({'error': 'Judul dan uraian/deskripsi wajib diisi.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO profile_items (page_type, item_type, title, subtitle, description, icon_name, order_num, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (page_type, item_type, title, subtitle, description, icon_name, order_num, image_url))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'item': {
                'id': new_id,
                'page_type': page_type,
                'item_type': item_type,
                'title': title,
                'subtitle': subtitle,
                'description': description,
                'order_num': order_num,
                'icon_name': icon_name
            },
            'message': f'Item profil "{title}" berhasil ditambahkan!'
        }, 201)

    def handle_update_profile_item(self, item_id):
        data = self.read_json_body()
        conn = get_db()
        cursor = conn.cursor()

        fields = []
        params = []
        for col in ['title', 'subtitle', 'description', 'icon_name', 'order_num', 'image_url', 'is_active']:
            if col in data:
                fields.append(f"{col} = ?")
                params.append(data[col])

        if fields:
            fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(item_id)
            cursor.execute(f"UPDATE profile_items SET {', '.join(fields)} WHERE id = ?", params)
            conn.commit()

        conn.close()
        self.send_json({'success': True, 'message': 'Item profil berhasil diperbarui!'})

    def handle_delete_profile_item(self, item_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM profile_items WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        self.send_json({'success': True, 'message': 'Item profil berhasil dihapus!'})

    # ==============================================================
    # ANNOUNCEMENTS HANDLERS (Pengumuman Resmi)
    # ==============================================================

    def handle_get_public_announcements(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM announcements WHERE is_active = 1 ORDER BY order_num ASC, id DESC")
        items = [dict(r) for r in cursor.fetchall()]
        conn.close()
        self.send_json({'success': True, 'announcements': items})

    def handle_get_admin_announcements(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM announcements ORDER BY order_num ASC, id DESC")
        items = [dict(r) for r in cursor.fetchall()]
        conn.close()
        self.send_json({'success': True, 'announcements': items})

    def handle_create_announcement(self):
        data = self.read_json_body()
        title = data.get('title', '').strip()
        announcement_number = data.get('announcement_number', '').strip() or f"B-{int(time.time())}/K.3.16/01/{time.strftime('%Y')}"
        category = data.get('category', 'LELANG').strip().upper()
        badge_label = data.get('badge_label', 'LELANG TERBUKA').strip()
        excerpt = data.get('excerpt', '').strip()
        content = data.get('content', '').strip()
        deadline_date = data.get('deadline_date', '').strip()
        external_url = data.get('external_url', '').strip()
        external_label = data.get('external_label', '').strip()
        raw_img = (data.get('image_url') or '').strip()
        image_url = save_media_data_uri_if_needed(raw_img, 'announcement') or '/static/images/news-bb.jpg'
        order_num = int(data.get('order_num', 1))

        if not title or not excerpt:
            self.send_json({'error': 'Judul dan Ringkasan pengumuman wajib diisi.'}, 400)
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO announcements (announcement_number, title, category, badge_label, excerpt, content, deadline_date, external_url, external_label, image_url, order_num)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (announcement_number, title, category, badge_label, excerpt, content, deadline_date, external_url, external_label, image_url, order_num))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({
            'success': True,
            'id': new_id,
            'announcement': {
                'id': new_id,
                'announcement_number': announcement_number,
                'title': title,
                'category': category,
                'badge_label': badge_label,
                'excerpt': excerpt,
                'content': content,
                'deadline_date': deadline_date,
                'external_url': external_url,
                'external_label': external_label,
                'image_url': image_url,
                'order_num': order_num
            },
            'message': f'Pengumuman "{title}" berhasil diterbitkan!'
        }, 201)

    def handle_update_announcement(self, ann_id):
        data = self.read_json_body()
        conn = get_db()
        cursor = conn.cursor()

        fields = []
        params = []
        for col in ['announcement_number', 'title', 'category', 'badge_label', 'excerpt', 'content', 'deadline_date', 'external_url', 'external_label', 'image_url', 'order_num', 'is_active']:
            if col in data:
                val = data[col]
                if col == 'image_url' and val:
                    val = save_media_data_uri_if_needed(str(val).strip(), 'announcement')
                fields.append(f"{col} = ?")
                params.append(val)

        if fields:
            fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(ann_id)
            cursor.execute(f"UPDATE announcements SET {', '.join(fields)} WHERE id = ?", params)
            conn.commit()

        conn.close()
        self.send_json({'success': True, 'message': 'Pengumuman berhasil diperbarui!'})

    def handle_delete_announcement(self, ann_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM announcements WHERE id = ?", (ann_id,))
        conn.commit()
        conn.close()
        self.send_json({'success': True, 'message': 'Pengumuman berhasil dihapus!'})


def run_server(port=PORT):
    server_address = ('', port)
    httpd = HTTPServer(server_address, KertagosaHandler)
    print(f"============================================================")
    print(f"  KERTAGOSA - Portal Kejaksaan Negeri Klungkung")
    print(f"  Status: Active & Serving on http://localhost:{port}")
    print(f"  Public Portal: http://localhost:{port}/")
    print(f"  Admin Dashboard: http://localhost:{port}/admin")
    print(f"  Default Login: admin@kejariklungkung.go.id / admin123")
    print(f"============================================================")
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port)
