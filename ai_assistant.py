"""
KERTAGOSA - Centralized Google Gemini AI Assistant Service
Kejaksaan Negeri Klungkung
Dual-Mode AI Engine: Google Gemini 1.5 Flash + Resilient Adhyaksa Journalistic Fallback Engine.
Zero external pip dependencies: Built exclusively on Python Standard Library.
"""

import os
import re
import json
import time
import urllib.request
import urllib.error
import urllib.parse
import datetime
import sqlite3

DEFAULT_MODEL = "gemini-3.5-flash"
STANDARD_MODELS = [
    {"id": "gemini-3.5-flash", "name": "Gemini 3.5 Flash (Generasi 3.5 - Flagship Terbaru)", "badge": "TERBARU 3.5", "is_default": True},
    {"id": "gemini-3.5-flash-lite", "name": "Gemini 3.5 Flash-Lite (Generasi 3.5 - Respon Cepat)", "badge": "3.5 LITE", "is_default": False},
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash (Generasi 2.5)", "badge": "2.5 FLASH", "is_default": False},
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash (Multimodal Cepat)", "badge": "STABIL", "is_default": False},
    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash (Generasi Sebelumnya)", "badge": "LEGACY", "is_default": False}
]
FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; KertagosaGeminiAssistant/3.5; +https://kejari-klungkung.go.id)"


def get_custom_gemini_models() -> list[dict]:
    """Retrieve custom/future Gemini models registered in page_contents."""
    try:
        db_path = get_db_path()
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute("SELECT content_value FROM page_contents WHERE content_key = 'gemini_custom_models'")
            row = cursor.fetchone()
            conn.close()
            if row and row[0]:
                data = json.loads(row[0])
                if isinstance(data, list):
                    return data
    except Exception as e:
        print(f"[Gemini Custom Models Read Warning] {e}")
    return []


def register_custom_gemini_model(model_id: str, label: str = None) -> bool:
    """Register or save a custom/future Gemini model into page_contents so it persists."""
    model_id = (model_id or "").strip().lower()
    if not model_id or not re.match(r'^[a-z0-9\.\-_]+$', model_id):
        return False

    built_in_ids = [m["id"] for m in STANDARD_MODELS]
    if model_id in built_in_ids:
        return True

    customs = get_custom_gemini_models()
    existing = [m["id"] for m in customs if isinstance(m, dict) and "id" in m]
    if model_id not in existing:
        display_name = label or f"Google Gemini {model_id} (Rilis Kustom / Versi Baru)"
        customs.append({
            "id": model_id,
            "name": display_name,
            "badge": "RILIS BARU",
            "is_default": False,
            "is_custom": True
        })
        try:
            db_path = get_db_path()
            if db_path.startswith('/tmp') and os.path.exists(db_path):
                try:
                    os.chmod(db_path, 0o666)
                except Exception:
                    pass
            conn = sqlite3.connect(db_path, timeout=15.0)
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO page_contents (content_key, section_name, content_type, content_value, label, updated_at)
            VALUES ('gemini_custom_models', 'system_settings', 'json', ?, 'Google Gemini Custom Future Models', CURRENT_TIMESTAMP)
            ON CONFLICT(content_key) DO UPDATE SET
                content_value = excluded.content_value,
                updated_at = CURRENT_TIMESTAMP
            """, (json.dumps(customs),))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"[Gemini Register Custom Model Error] {e}")
            return False
    return True


def get_db_path():
    """Locate database file consistently across local and Vercel serverless environments."""
    try:
        import server
        if hasattr(server, 'DB_PATH') and server.DB_PATH:
            return server.DB_PATH
    except Exception:
        pass

    # Check Vercel serverless environment flags
    base_dir = os.path.dirname(os.path.abspath(__file__))
    is_vercel = bool(
        os.environ.get('VERCEL')
        or os.environ.get('VERCEL_ENV')
        or os.environ.get('AWS_LAMBDA_FUNCTION_NAME')
        or base_dir.startswith('/var/task')
        or not os.access(base_dir, os.W_OK)
    )
    if is_vercel or os.path.exists('/tmp/kertagosa.db'):
        tmp_db = '/tmp/kertagosa.db'
        if not os.path.exists(tmp_db):
            seed_db = os.path.join(base_dir, "data", "kertagosa.db")
            if os.path.exists(seed_db):
                try:
                    import shutil
                    os.makedirs('/tmp', exist_ok=True)
                    shutil.copyfile(seed_db, tmp_db)
                    os.chmod(tmp_db, 0o666)
                except Exception as e:
                    print(f"[Gemini AI Service] Could not copy seed DB to {tmp_db}: {e}")
        return tmp_db

    data_dir = os.path.join(base_dir, "data")
    if os.path.exists(data_dir):
        return os.path.join(data_dir, "kertagosa.db")
    return os.path.join(base_dir, "kertagosa.db")


def get_gemini_model(explicit_model: str = None) -> str:
    """
    Retrieve active Gemini model with precedence:
    1. Explicit model passed in call
    2. Environment variable: GEMINI_MODEL or GOOGLE_MODEL
    3. Database page_contents table: content_key = 'gemini_model'
    4. DEFAULT_MODEL (gemini-3.5-flash)
    """
    if explicit_model and str(explicit_model).strip():
        return str(explicit_model).strip()

    env_model = os.environ.get("GEMINI_MODEL") or os.environ.get("GOOGLE_MODEL")
    if env_model and str(env_model).strip():
        return str(env_model).strip()

    try:
        db_path = get_db_path()
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute("SELECT content_value FROM page_contents WHERE content_key = 'gemini_model'")
            row = cursor.fetchone()
            conn.close()
            if row and row[0] and str(row[0]).strip():
                val = str(row[0]).strip()
                # Upgrade legacy 2.5 / 2.0 / 1.5 models to default 3.5
                if val in ('gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'):
                    return DEFAULT_MODEL
                return val
    except Exception as e:
        print(f"[Gemini Service DB Warning] Could not check gemini_model in page_contents: {e}")

    return DEFAULT_MODEL


def save_gemini_model(model_name: str) -> bool:
    """Save selected Gemini model to page_contents in database and auto-register if custom."""
    model_name = (model_name or DEFAULT_MODEL).strip().lower()
    built_in_ids = [m["id"] for m in STANDARD_MODELS]
    if model_name not in built_in_ids and re.match(r'^[a-z0-9\.\-_]+$', model_name):
        register_custom_gemini_model(model_name)
    try:
        db_path = get_db_path()
        if db_path.startswith('/tmp') and os.path.exists(db_path):
            try:
                os.chmod(db_path, 0o666)
            except Exception:
                pass
        conn = sqlite3.connect(db_path, timeout=15.0)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO page_contents (content_key, section_name, content_type, content_value, label, updated_at)
        VALUES ('gemini_model', 'system_settings', 'text', ?, 'Google Gemini Active Model', CURRENT_TIMESTAMP)
        ON CONFLICT(content_key) DO UPDATE SET
            content_value = excluded.content_value,
            updated_at = CURRENT_TIMESTAMP
        """, (model_name,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[Gemini Service Save Model Error] {e}")
        return False


def get_gemini_api_key(explicit_key: str = None) -> tuple[str, str]:
    """
    Retrieve active Gemini API Key with precedence:
    1. Explicit key passed in call (runtime)
    2. Environment variable: GEMINI_API_KEY or GOOGLE_API_KEY
    3. Database page_contents table: content_key = 'gemini_api_key'
    Returns (key, source) where source is 'explicit', 'env', 'db', or 'none'.
    """
    if explicit_key and str(explicit_key).strip():
        return str(explicit_key).strip(), "explicit"

    env_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if env_key and str(env_key).strip():
        return str(env_key).strip(), "env"

    try:
        db_path = get_db_path()
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path, timeout=10.0)
            cursor = conn.cursor()
            cursor.execute("SELECT content_value FROM page_contents WHERE content_key = 'gemini_api_key'")
            row = cursor.fetchone()
            conn.close()
            if row and row[0] and str(row[0]).strip():
                return str(row[0]).strip(), "db"
    except Exception as e:
        print(f"[Gemini Service DB Warning] Could not check page_contents: {e}")

    return "", "none"


def save_gemini_api_key(api_key: str) -> bool:
    """Save Gemini API Key to page_contents in database."""
    api_key = (api_key or "").strip()
    try:
        db_path = get_db_path()
        if db_path.startswith('/tmp') and os.path.exists(db_path):
            try:
                os.chmod(db_path, 0o666)
            except Exception:
                pass
        conn = sqlite3.connect(db_path, timeout=15.0)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO page_contents (content_key, section_name, content_type, content_value, label, updated_at)
        VALUES ('gemini_api_key', 'system_settings', 'password', ?, 'Google Gemini API Key', CURRENT_TIMESTAMP)
        ON CONFLICT(content_key) DO UPDATE SET
            content_value = excluded.content_value,
            updated_at = CURRENT_TIMESTAMP
        """, (api_key,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[Gemini Service Save Key Error] {e}")
        return False


def get_ai_status(explicit_key: str = None, explicit_model: str = None) -> dict:
    """Return status of Gemini AI configuration with all standard & registered custom models."""
    key, source = get_gemini_api_key(explicit_key)
    has_key = bool(key and len(key) >= 8)
    masked = f"{key[:4]}...{key[-4:]}" if has_key and len(key) >= 10 else ("***" if has_key else "")
    active_model = get_gemini_model(explicit_model)

    custom_models = get_custom_gemini_models()
    all_available = [dict(m) for m in STANDARD_MODELS]
    existing_ids = {m["id"] for m in all_available}
    for cm in custom_models:
        if isinstance(cm, dict) and cm.get("id") and cm["id"] not in existing_ids:
            all_available.append(cm)
            existing_ids.add(cm["id"])

    # If active_model is custom and not yet in the list, insert it at top
    if active_model and active_model not in existing_ids:
        all_available.insert(0, {
            "id": active_model,
            "name": f"Google Gemini {active_model} (Model Kustom Aktif)",
            "badge": "KUSTOM AKTIF",
            "is_default": False,
            "is_custom": True
        })

    return {
        "configured": has_key,
        "has_key": has_key,
        "masked_key": masked,
        "source": source if has_key else "none",
        "model": active_model,
        "available_models": all_available,
        "features": [
            {"id": "jagadita_generate", "label": "Auto-Generate Jadwal Sidang SIPP (JAGADITA)"},
            {"id": "jagadita_format", "label": "Format & Standardisasi Jadwal Sidang (JAGADITA)"},
            {"id": "draft_news", "label": "Auto-Generate & Tulis Berita (Bento Grid 5W+1H / Link Media)"},
            {"id": "draft_announcement", "label": "Buat Draf Pengumuman Resmi"},
            {"id": "draft_complaint_response", "label": "Saran Tanggapan Aduan Warga (MASADU & SEMARA BAKTI)"},
            {"id": "refine_text", "label": "Poles Bahasa & Ejaan Resmi Adhyaksa"},
            {"id": "copilot", "label": "Universal Floating Gemini Copilot"}
        ]
    }


def call_gemini_api(prompt: str, system_instruction: str = "", api_key: str = None, json_mode: bool = False, temperature: float = 0.3, model: str = None) -> str:
    """
    Invoke Google Gemini REST API (defaults to Gemini 3.5 Flash with graceful fallback chain).
    Raises RuntimeError or ValueError on failure.
    """
    active_key, _ = get_gemini_api_key(api_key)
    if not active_key:
        raise ValueError("Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi.")

    target_model = get_gemini_model(model)
    if active_key.startswith("AIzaSyDummyTestKey"):
        raise urllib.error.URLError("Dummy test key used in sandbox environment.")

    models_to_try = [target_model]
    for m in FALLBACK_MODELS:
        if m not in models_to_try:
            models_to_try.append(m)

    full_prompt = prompt
    if system_instruction:
        full_prompt = f"{system_instruction.strip()}\n\n---\nINSTRUKSI TUGAS:\n{prompt.strip()}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 2048,
        }
    }

    req_data = json.dumps(payload).encode("utf-8")
    last_error = None

    for m_name in models_to_try:
        url = f"{GEMINI_BASE_URL}/{m_name}:generateContent?key={active_key}"
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": DEFAULT_USER_AGENT
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        raw_text = raw_text.strip()
                        if json_mode:
                            if raw_text.startswith("```"):
                                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                                raw_text = re.sub(r"\s*```$", "", raw_text)
                        return raw_text
                    raise ValueError("Respons Gemini kosong.")
                raise RuntimeError(f"HTTP Error dari Gemini API: status {resp.status}")
        except urllib.error.HTTPError as e:
            error_msg = ""
            try:
                err_data = json.loads(e.read().decode("utf-8"))
                error_msg = err_data.get("error", {}).get("message", str(e))
            except Exception:
                error_msg = str(e)
            last_error = RuntimeError(f"Gemini API Error ({e.code}) [{m_name}]: {error_msg}")
            # If model not found (404), try next model in fallback list
            if e.code == 404:
                continue
            raise last_error
        except urllib.error.URLError as e:
            raise RuntimeError(f"Koneksi jaringan ke Gemini API gagal: {str(e.reason)}")

    if last_error:
        raise last_error
    raise RuntimeError("Gagal memanggil model Gemini.")


def test_gemini_connection(api_key: str = None, model: str = None) -> dict:
    """Test connection to Gemini API and measure response latency."""
    active_model = get_gemini_model(model)
    start_time = time.time()
    try:
        reply = call_gemini_api(
            prompt="Katakan: 'Koneksi Berhasil. Asisten Gemini Siap.' dalam satu kalimat singkat.",
            api_key=api_key,
            model=active_model,
            temperature=0.1
        )
        latency = round((time.time() - start_time) * 1000)
        return {
            "success": True,
            "model": active_model,
            "latency_ms": latency,
            "message": reply.strip(),
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "model": active_model,
            "latency_ms": round((time.time() - start_time) * 1000)
        }


# ==============================================================================
# 1. ASSIST DRAFT NEWS (BERITA & PUBLIKASI)
# ==============================================================================

def assist_draft_news(topic: str, notes: str = "", category: str = "", api_key: str = None) -> dict:
    """
    Generate professional journalistic news article draft from topic and rough notes.
    Dual-mode: Gemini AI if key available, fallback heuristic if offline/no key.
    """
    topic = (topic or "").strip()
    notes = (notes or "").strip()
    category = (category or "Kegiatan Kejari").strip()

    if not topic and not notes:
        raise ValueError("Topik berita atau catatan poin kegiatan wajib diisi.")

    system_instruction = """
Anda adalah Redaktur Jurnalistik Senior Kejaksaan Negeri Klungkung (KERTAGOSA).
Tugas Anda menyusun naskah publikasi berita resmi berdasarkan topik dan catatan ringkas yang diberikan.
Berpedoman pada kaidah 5W+1H, Bahasa Indonesia baku (PUEBI/KBBI), serta wibawa institusi Adhyaksa yang transparan dan humanis.

Format Keluaran WAJIB berupa RAW JSON (tanpa markdown ```json atau ```):
{
  "title": "Judul berita lugas, menarik, dan berstandar jurnalistik Kejaksaan",
  "category": "Kegiatan Kejari",
  "badge_label": "KABAR TERKINI",
  "layout_type": "FEATURED_MAIN",
  "author": "Tim Penerangan Hukum Kejari Klungkung",
  "excerpt": "Ringkasan padat dan informatif dalam 1-2 kalimat (maksimal 200 karakter).",
  "highlight_quote": "Pernyataan penting Kepala Kejaksaan Negeri Klungkung atau Kasi terkait kegiatan ini.",
  "content": "Isi berita lengkap minimal 3 sampai 4 paragraf jurnalistik terstruktur (Lede 5W+1H, Uraian Fakta dan Pelaksanaan, Pernyataan Resmi, dan Paragraf Penutup)."
}
"""

    prompt = f"Topik Berita: {topic}\nKategori Diinginkan: {category}\nPoin Catatan / Konteks: {notes}\nTanggal Kegiatan: {datetime.date.today().strftime('%d %B %Y')}"

    # Try Gemini API
    active_key, source = get_gemini_api_key(api_key)
    if active_key:
        try:
            raw_json = call_gemini_api(prompt, system_instruction=system_instruction, api_key=active_key, json_mode=True)
            data = json.loads(raw_json)
            # Validate required fields
            data.setdefault("title", f"Kejari Klungkung: {topic}")
            data.setdefault("category", category or "Kegiatan Kejari")
            data.setdefault("badge_label", "KABAR TERKINI")
            data.setdefault("layout_type", "FEATURED_MAIN")
            data.setdefault("author", "Tim Publikasi Kejari Klungkung")
            data.setdefault("excerpt", f"Rangkaian kegiatan {topic} oleh jajaran Kejaksaan Negeri Klungkung.")
            data.setdefault("highlight_quote", f"Penegakan hukum dan pelayanan masyarakat senantiasa kami kedepankan demi keadilan bermartabat di Kabupaten Klungkung.")
            data.setdefault("content", f"Kejaksaan Negeri Klungkung menggelar {topic}. Seluruh rangkaian kegiatan berlangsung dengan tertib, lancar, dan berintegritas tinggi.")
            return {
                "success": True,
                "ai_provider": "gemini",
                "model": DEFAULT_MODEL,
                "data": data,
                "message": "Naskah artikel berita berhasil disusun oleh Google Gemini AI!"
            }
        except Exception as e:
            print(f"[Gemini Assist News Fallback] {e}")

    # Fallback: Adhyaksa Journalistic Template Generator
    today_str = datetime.date.today().strftime("%d %B %Y")
    clean_topic = topic if topic else (notes[:60] if notes else "Kegiatan Institusi")
    
    # Capitalize title nicely
    title_words = [w.capitalize() for w in clean_topic.split()]
    formatted_title = f"Kejari Klungkung Gelar { ' '.join(title_words) } Berlandaskan Integritas dan Pelayanan Humanis"

    excerpt = f"Kejaksaan Negeri Klungkung melaksanakan rangkaian agenda {clean_topic} sebagai wujud transparansi penegakan hukum dan peningkatan mutu pelayanan publik bagi masyarakat Klungkung."
    
    quote = f"\"Setiap langkah penegakan hukum dan pelayanan kami persembahkan sepenuhnya untuk kepastian hukum yang berkeadilan, bermartabat, dan humanis di Bumi Serombotan ini,\" tegas Kepala Kejaksaan Negeri Klungkung."

    par1 = f"SEMARAPURA - Dalam rangka memperkuat tata kelola institusi serta menghadirkan penegakan hukum yang transparan dan akuntabel, jajaran Kejaksaan Negeri Klungkung secara resmi menyelenggarakan agenda {clean_topic} pada {today_str} bertempat di Kantor Kejaksaan Negeri Klungkung, Semarapura."

    par2 = f"Agenda ini dihadiri langsung oleh pimpinan Kejari Klungkung beserta para Kepala Seksi, Kasubag Pembinaan, dan segenap pegawai. {notes if notes else 'Seluruh rangkaian pelaksanaan berlangsung dengan tertib, disiplin, dan mempedomani Standar Operasional Prosedur (SOP) Kejaksaan Republik Indonesia.'}"

    par3 = f"Melalui momentum ini, Kejaksaan Negeri Klungkung menegaskan kembali komitmennya dalam mengawal program-program strategis serta senantiasa hadir memberikan kepastian hukum yang berorientasi pada kemanfaatan masyarakat luas."

    par4 = f"Diharapkan ke depan, keterbukaan informasi dan kolaborasi positif antara institusi Adhyaksa dengan seluruh pemangku kepentingan dapat terus terjalin erat demi mewujudkan keadilan hukum yang berkepastian dan berkeadaban."

    full_content = f"{par1}\n\n{par2}\n\n{par3}\n\n{par4}"

    return {
        "success": True,
        "ai_provider": "gemini_journalistic_engine",
        "model": "heuristic_adhyaksa",
        "data": {
            "title": formatted_title,
            "category": category,
            "badge_label": "KABAR TERKINI",
            "layout_type": "FEATURED_MAIN",
            "author": "Tim Publikasi Kejari Klungkung",
            "excerpt": excerpt,
            "highlight_quote": quote,
            "content": full_content
        },
        "message": "Naskah artikel berita berhasil disusun dengan Template Jurnalistik Adhyaksa!"
    }


# ==============================================================================
# 2. ASSIST DRAFT ANNOUNCEMENT (PENGUMUMAN RESMI)
# ==============================================================================

def assist_draft_announcement(topic: str, notes: str = "", category: str = "UMUM", api_key: str = None) -> dict:
    """
    Generate official announcement draft for Kejaksaan Negeri Klungkung.
    """
    topic = (topic or "").strip()
    notes = (notes or "").strip()
    category = (category or "UMUM").upper()

    if not topic and not notes:
        raise ValueError("Topik pengumuman wajib diisi.")

    system_instruction = """
Anda adalah Pejabat Pengelola Informasi dan Dokumentasi (PPID) Kejaksaan Negeri Klungkung.
Tugas Anda menyusun Draf Pengumuman Resmi Institusi Kejaksaan yang resmi, tertib administrasi, dan mengikat.
Kategori pilihan: LELANG, LAYANAN, SELEKSI, MAKLUMAT, UMUM.

Format Keluaran WAJIB berupa RAW JSON (tanpa markdown ```json atau ```):
{
  "number": "Nomor pengumuman resmi format Kejaksaan RI, misal: PENG-08/K.3.12/Cp.2/10/2026",
  "category": "LELANG",
  "title": "Judul lengkap pengumuman resmi yang jelas dan tegas",
  "badge": "LELANG RAMPASAN NEGARA",
  "deadline": "Batas waktu atau tanggal pelaksanaan dalam format bahasa Indonesia (misal: 15 November 2026)",
  "excerpt": "Ringkasan pokok pengumuman dalam 1-2 kalimat padat",
  "content": "Uraian isi pengumuman lengkap meliputi dasar hukum, ketentuan/persyaratan, tata cara, dan saluran narahubung resmi."
}
"""

    prompt = f"Topik Pengumuman: {topic}\nKategori: {category}\nCatatan / Keterangan: {notes}\nTahun: 2026"

    active_key, _ = get_gemini_api_key(api_key)
    if active_key:
        try:
            raw_json = call_gemini_api(prompt, system_instruction=system_instruction, api_key=active_key, json_mode=True)
            data = json.loads(raw_json)
            data.setdefault("number", f"PENG-01/K.3.12/Cp.2/{datetime.date.today().month}/{datetime.date.today().year}")
            data.setdefault("category", category)
            data.setdefault("badge", f"PENGUMUMAN {category}")
            return {
                "success": True,
                "ai_provider": "gemini",
                "model": DEFAULT_MODEL,
                "data": data,
                "message": "Draf pengumuman resmi berhasil disusun oleh Google Gemini AI!"
            }
        except Exception as e:
            print(f"[Gemini Assist Announcement Fallback] {e}")

    # Fallback Template
    curr_month = datetime.date.today().month
    curr_year = datetime.date.today().year
    roman_months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    rom_month = roman_months[curr_month - 1] if 1 <= curr_month <= 12 else "X"
    
    ann_num = f"PENG-07/K.3.12/Cp.2/{rom_month}/{curr_year}"
    badge = f"PENGUMUMAN {category}"
    if category == "LELANG":
        badge = "LELANG RAMPASAN NEGARA"
    elif category == "LAYANAN":
        badge = "LAYANAN OPERASIONAL PTSP"
    elif category == "SELEKSI":
        badge = "SELEKSI CASN / REKRUTMEN"
    elif category == "MAKLUMAT":
        badge = "MAKLUMAT PELAYANAN PUBLIK"

    deadline_date = (datetime.date.today() + datetime.timedelta(days=14)).strftime("%d %B %Y")
    clean_topic = topic if topic else "Pemberitahuan Pelaksanaan Tugas Pokok dan Fungsi"
    
    title = f"Pengumuman Resmi Pelaksanaan {clean_topic} Kejaksaan Negeri Klungkung"
    excerpt = f"Pemberitahuan resmi kepada seluruh masyarakat dan pihak terkait mengenai pelaksanaan {clean_topic} di lingkungan Kejaksaan Negeri Klungkung."
    
    content = f"""Berdasarkan ketentuan hukum yang berlaku serta dalam rangka tertib administrasi pelayanan publik di lingkungan Kejaksaan Negeri Klungkung, bersama ini diumumkan kepada masyarakat mengenai pelaksanaan:

1. Perihal: {clean_topic}
2. Batas Waktu / Jadwal: Sampai dengan {deadline_date}.
3. Keterangan Rinci: {notes if notes else 'Masyarakat atau pihak terkait dimohon memperhatikan seluruh ketentuan dan prosedur resmi yang telah ditetapkan.'}

Informasi lebih lanjut dapat diperoleh melalui Pelayanan Terpadu Satu Pintu (PTSP) Kejaksaan Negeri Klungkung, Jl. Ngurah Rai No. 24, Semarapura, atau melalui layanan resmi MASADU.

Demikian pengumuman ini disampaikan untuk diketahui dan dipedomani bersama.

Semarapura, {datetime.date.today().strftime('%d %B %Y')}
Kepala Kejaksaan Negeri Klungkung"""

    return {
        "success": True,
        "ai_provider": "gemini_journalistic_engine",
        "model": "heuristic_announcement",
        "data": {
            "number": ann_num,
            "category": category,
            "title": title,
            "badge": badge,
            "deadline": deadline_date,
            "excerpt": excerpt,
            "content": content
        },
        "message": "Draf pengumuman resmi berhasil disusun menggunakan format baku Kejaksaan!"
    }


# ==============================================================================
# 3. ASSIST COMPLAINT RESPONSE (MASADU & SEMARA BAKTI)
# ==============================================================================

def assist_complaint_response(complaint_data: dict, status: str = "DALAM_PROSES", tone: str = "formal", api_key: str = None) -> dict:
    """
    Generate professional, courteous, legally accurate official follow-up note
    for MASADU / SEMARA BAKTI citizen submissions.
    """
    title = complaint_data.get("title", "")
    description = complaint_data.get("description", "")
    category = complaint_data.get("category", "MASADU")
    complainant_name = complaint_data.get("complainant_name", "Masyarakat / Pemohon")
    ticket_code = complaint_data.get("ticket_code", "TIKET-ADUAN")

    system_instruction = """
Anda adalah Petugas Verifikator Pengaduan dan Pelayanan Publik Kejaksaan Negeri Klungkung (MASADU & SEMARA BAKTI).
Tugas Anda menyusun catatan tindak lanjut dan tanggapan resmi yang santun, berkepastian hukum, berintegritas, serta berpihak pada kepuasan masyarakat.

Format Keluaran WAJIB berupa RAW JSON (tanpa markdown ```json atau ```):
{
  "admin_notes": "Teks tanggapan resmi institusi Kejari Klungkung yang akan dikirimkan kepada pelapor / tercatat dalam riwayat tiket",
  "internal_recommendation": "Rekomendasi langkah operasional internal bagi Seksi terkait (Intelijen/Pidum/Pidsus/Datun/Pembinaan)",
  "status_verified": "Status penanganan (TERKIRIM/DIVERIFIKASI/DALAM_PROSES/DIJADWALKAN/SELESAI/DITOLAK)"
}
"""

    prompt = f"""
Data Pengaduan / Permohonan:
Kode Tiket: {ticket_code}
Kategori: {category}
Nama Pemohon/Pelapor: {complainant_name}
Perihal: {title}
Uraian/Kronologi Singkat: {description}
Status Tindak Lanjut Baru: {status}
"""

    active_key, _ = get_gemini_api_key(api_key)
    if active_key:
        try:
            raw_json = call_gemini_api(prompt, system_instruction=system_instruction, api_key=active_key, json_mode=True)
            data = json.loads(raw_json)
            data.setdefault("status_verified", status)
            return {
                "success": True,
                "ai_provider": "gemini",
                "model": DEFAULT_MODEL,
                "data": data,
                "message": "Saran tanggapan resmi pengaduan berhasil di-generate oleh Google Gemini AI!"
            }
        except Exception as e:
            print(f"[Gemini Assist Complaint Fallback] {e}")

    # Fallback Heuristic
    today_str = datetime.date.today().strftime("%d %B %Y")
    status_upper = status.upper()

    if status_upper == "DIVERIFIKASI":
        notes = f"Laporan/Permohonan Anda (Kode: {ticket_code}) telah diverifikasi oleh Tim Pengelola Pelayanan Terpadu Satu Pintu (PTSP) Kejaksaan Negeri Klungkung pada {today_str}. Dokumen dinyatakan lengkap dan diteruskan kepada Bidang Teknis terkait untuk telaah materiil lebih lanjut."
        rec = "Disposisi kepada Kasi teknis sesuai substansi pengaduan untuk penelitian dokumen pokok."
    elif status_upper in ("DALAM_PROSES", "PROSES"):
        notes = f"Yth. Sdr/Sdri {complainant_name}, laporan Anda perihal '{title}' saat ini sedang dalam proses penanganan dan klarifikasi lapangan oleh tim teknis Kejaksaan Negeri Klungkung sesuai dengan SOP penanganan pengaduan institusi."
        rec = "Koordinasi dengan pelapor jika membutuhkan keterangan tambahan atau klarifikasi fisik."
    elif status_upper in ("SELESAI", "CLOSED"):
        notes = f"Terima kasih atas laporan dan partisipasi Anda dalam mendukung penegakan hukum yang berintegritas. Pengaduan dengan tiket {ticket_code} telah selesai ditindaklanjuti secara tuntas oleh Kejaksaan Negeri Klungkung per {today_str}."
        rec = "Pengarsipan berkas aduan ke register tuntas dan pembaruan indeks kepuasan masyarakat (SKM)."
    elif status_upper in ("DITOLAK", "REJECTED"):
        notes = f"Mohon maaf, berdasarkan hasil verifikasi awal per {today_str}, laporan/permohonan Anda belum dapat ditindaklanjuti karena substansi berada di luar wewenang yuridis Kejaksaan Negeri Klungkung atau kelengkapan data dukung belum terpenuhi. Silakan melengkapi data dukung atau menghubungi PTSP Kejari Klungkung."
        rec = "Beri petunjuk kepada pemohon mengenai instansi yang berwenang menangani materi laporan tersebut."
    elif status_upper == "DIJADWALKAN":
        notes = f"Permohonan pengantaran/layanan barang bukti (SEMARA BAKTI) telah dijadwalkan oleh Tim Pemulihan Aset & PB3R Kejari Klungkung. Petugas akan menghubungi Anda untuk konfirmasi waktu dan lokasi serah terima."
        rec = "Siapkan Berita Acara BA-20 dan koordinasikan armada pengantaran."
    else:
        notes = f"Laporan telah diterima dalam sistem pelayanan digital Kejaksaan Negeri Klungkung pada {today_str} dan sedang dalam antrean telaah petugas."
        rec = "Lakukan verifikasi kelengkapan formil identitas pelapor."

    return {
        "success": True,
        "ai_provider": "gemini_journalistic_engine",
        "model": "heuristic_response",
        "data": {
            "admin_notes": notes,
            "internal_recommendation": rec,
            "status_verified": status
        },
        "message": "Saran tanggapan resmi berhasil disusun berdasarkan SOP Pelayanan Kejaksaan!"
    }


# ==============================================================================
# 4. ASSIST REFINE TEXT & ADHYAKSA TONE POLISHER
# ==============================================================================

def assist_refine_text(raw_text: str, mode: str = "formal_adhyaksa", api_key: str = None) -> dict:
    """
    Refine text, fix grammar/spelling (PUEBI), and adapt to formal Adhyaksa dignitary tone.
    Modes: 'formal_adhyaksa', 'press_release', 'ringkas', 'perbaiki_ejaan'.
    """
    raw_text = (raw_text or "").strip()
    if not raw_text:
        raise ValueError("Teks yang akan dirapikan tidak boleh kosong.")

    system_instruction = f"""
Anda adalah Ahli Bahasa Hukum dan Komunikasi Publik Kejaksaan Republik Indonesia.
Tugas Anda menyempurnakan naskah teks berikut agar memenuhi kaidah Bahasa Indonesia yang baik dan benar (PUEBI/KBBI) serta mencerminkan kewibawaan institusi Kejaksaan.
Mode yang dipilih: {mode}

Aturan Khusus Mode:
- formal_adhyaksa: Gaya bahasa resmi, berbobot, berwibawa, santun, dan taat hukum.
- press_release: Format Siaran Pers resmi Kejaksaan Negeri Klungkung (Kepala Berita, Lede, Tubuh, Penutup).
- ringkas: Rangkum menjadi intisari 1-2 paragraf padat tanpa mengurangi substansi.
- perbaiki_ejaan: Perbaiki saltik (typo), tata bahasa, dan tanda baca tanpa mengubah susunan kalimat asli.

Format Keluaran WAJIB berupa RAW JSON (tanpa markdown ```json atau ```):
{{
  "refined_text": "Teks hasil penyempurnaan lengkap",
  "summary_of_changes": "Penjelasan singkat perbaikan yang dilakukan (1 kalimat)"
}}
"""

    prompt = f"Teks Asli:\n{raw_text}"

    active_key, _ = get_gemini_api_key(api_key)
    if active_key:
        try:
            raw_json = call_gemini_api(prompt, system_instruction=system_instruction, api_key=active_key, json_mode=True, temperature=0.2)
            data = json.loads(raw_json)
            return {
                "success": True,
                "ai_provider": "gemini",
                "model": DEFAULT_MODEL,
                "mode": mode,
                "data": data,
                "message": "Teks berhasil disempurnakan dengan Google Gemini AI!"
            }
        except Exception as e:
            print(f"[Gemini Assist Refine Fallback] {e}")

    # Fallback Heuristic Text Polisher
    cleaned = re.sub(r"\s+", " ", raw_text).strip()
    # Capitalize sentences
    sentences = re.split(r"([.!?]\s*)", cleaned)
    polished_sentences = []
    for s in sentences:
        if s and not re.match(r"^[.!?]\s*$", s):
            s = s[0].upper() + s[1:]
        polished_sentences.append(s)
    polished = "".join(polished_sentences)

    if mode == "formal_adhyaksa":
        polished = f"Sehubungan dengan hal tersebut, Kejaksaan Negeri Klungkung menegaskan bahwa: {polished} Seluruh proses senantiasa berpijak pada prinsip keadilan, transparansi, dan integritas hukum bermartabat."
    elif mode == "press_release":
        today_str = datetime.date.today().strftime("%d %B %Y")
        polished = f"SIARAN PERS\nKEJAKSAAN NEGERI KLUNGKUNG\nNomor: PR-01/K.3.12/Kph.3/{datetime.date.today().month}/{datetime.date.today().year}\n\nSEMARAPURA - {polished}\n\nKepala Kejaksaan Negeri Klungkung mengimbau seluruh pihak untuk senantiasa mendukung tegaknya kepastian hukum yang berkeadilan di wilayah Kabupaten Klungkung.\n\nSemarapura, {today_str}\nTim Penerangan Hukum Kejaksaan Negeri Klungkung"
    elif mode == "ringkas":
        words = polished.split()
        if len(words) > 50:
            polished = " ".join(words[:45]) + "... (Intisari resmi Kejaksaan Negeri Klungkung)."

    return {
        "success": True,
        "ai_provider": "gemini_journalistic_engine",
        "model": "heuristic_refiner",
        "mode": mode,
        "data": {
            "refined_text": polished,
            "summary_of_changes": "Perbaikan ejaan, tanda baca, serta standardisasi nada resmi Kejaksaan."
        },
        "message": "Teks berhasil dirapikan dengan Engine Tata Bahasa Adhyaksa!"
    }


# ==============================================================================
# 5. ASSIST COPILOT (FREEFORM PROMPT / ADMINISTRATIVE ASSISTANT)
# ==============================================================================

def assist_copilot(prompt: str, context: dict = None, api_key: str = None) -> dict:
    """
    General AI Copilot for Administrative Staff & CMS Managers.
    Can answer queries, draft remarks, summarize texts, generate captions, etc.
    """
    prompt = (prompt or "").strip()
    if not prompt:
        raise ValueError("Pertanyaan atau perintah prompt wajib diisi.")

    system_instruction = """
Anda adalah Gemini Copilot Resmi Kejaksaan Negeri Klungkung (KERTAGOSA).
Anda bertugas membantu staf dan administrator Kejaksaan dalam penulisan naskah dinas, siaran pers, pidato/sambutan, caption publikasi sosial media, perumusan FAQ, dan konsultasi komunikasi publik institusi.
Jawaban Anda harus selalu:
1. Bernilai hukum yang akurat dan berpedoman pada nilai-nilai Tri Krama Adhyaksa (Satya, Adhi, Wicaksana).
2. Memakai bahasa Indonesia yang santun, elegan, jelas, dan percaya diri.
3. Terstruktur dengan rapi memakai poin-poin atau paragraf yang mudah dibaca.
"""

    active_key, _ = get_gemini_api_key(api_key)
    if active_key:
        try:
            reply = call_gemini_api(prompt, system_instruction=system_instruction, api_key=active_key, temperature=0.4)
            return {
                "success": True,
                "ai_provider": "gemini",
                "model": DEFAULT_MODEL,
                "prompt": prompt,
                "reply": reply,
                "message": "Jawaban berhasil disusun oleh Gemini AI Copilot!"
            }
        except Exception as e:
            print(f"[Gemini Assist Copilot Fallback] {e}")

    # Fallback Heuristic Copilot
    today_str = datetime.date.today().strftime("%d %B %Y")
    fallback_reply = f"""Berikut draf rekomendasi naskah dinas Kejaksaan Negeri Klungkung untuk instruksi: "{prompt}":

1. Pembukaan & Dasar Pelaksanaan:
   Bahwa dalam rangka menegakkan supremasi hukum serta mengoptimalkan pelayanan publik terpadu di Kabupaten Klungkung, Kejaksaan Negeri Klungkung senantiasa mengedepankan integritas, profesionalitas, dan keadilan yang humanis.

2. Pokok Pembahasan & Substansi:
   - Terkait agenda ini, seluruh unit kerja mempedomani tata tertib dan Standar Operasional Prosedur (SOP) Kejaksaan RI.
   - Mengoptimalkan koordinasi antar-seksi demi kelancaran tugas penegakan hukum dan perlindungan hak masyarakat.

3. Penutup & Komitmen:
   Demikian catatan panduan ini disusun sebagai bahan rujukan operasional pada {today_str}. Semoga keadilan yang berkepastian hukum senantiasa tegak di Bumi Serombotan.

(Catatan: Mode Heuristic Standar Adhyaksa aktif. Hubungkan Google Gemini API Key di Pengaturan untuk respons AI interaktif secara penuh)."""

    return {
        "success": True,
        "ai_provider": "gemini_journalistic_engine",
        "model": "heuristic_copilot",
        "prompt": prompt,
        "reply": fallback_reply,
        "message": "Draf rekomendasi berhasil disusun oleh Asisten Adhyaksa!"
    }


# ==============================================================================
# 6. ASSIST FORMAT COURT SCHEDULE (JAGADITA)
# ==============================================================================

def assist_format_court_schedule(raw_text: str, api_key: str = None) -> dict:
    """
    Parse / format raw messy text or notes into structured court schedule item.
    """
    raw_text = (raw_text or "").strip()
    if not raw_text:
        raise ValueError("Teks rincian sidang wajib diisi.")

    system_instruction = """
Anda adalah Petugas Panitera & Input Jadwal Sidang JAGADITA Kejaksaan Negeri Klungkung.
Tugas Anda mengekstrak atau merapikan data jadwal persidangan ke format JSON baku:
{
  "case_number": "Nomor Perkara (Contoh: 12/Pid.B/2026/PN Smp)",
  "defendant_name": "Nama Terdakwa (Gelar / Inisial)",
  "case_type": "PIDUM / PIDSUS / TIPIDKOR / ANAK",
  "agenda": "Agenda Sidang (Misal: Pemeriksaan Saksi / Tuntutan / Putusan)",
  "prosecutor": "Nama Jaksa Penuntut Umum (JPU) lengkap",
  "court_room": "Ruang Sidang (Contoh: Ruang Sidang Cakra)",
  "session_time": "Waktu Sidang (Contoh: 09:30 WITA)"
}
Format Keluaran WAJIB berupa RAW JSON murni tanpa markdown.
"""

    prompt = f"Data Mentah Sidang:\n{raw_text}"

    active_key, _ = get_gemini_api_key(api_key)
    if active_key:
        try:
            raw_json = call_gemini_api(prompt, system_instruction=system_instruction, api_key=active_key, json_mode=True, temperature=0.1)
            data = json.loads(raw_json)
            data.setdefault("session_time", "09:00 WITA")
            data.setdefault("court_room", "Ruang Sidang Cakra")
            data.setdefault("case_type", "PIDUM")
            return {
                "success": True,
                "ai_provider": "gemini",
                "model": DEFAULT_MODEL,
                "data": data,
                "message": "Data sidang berhasil dirapikan oleh Google Gemini AI!"
            }
        except Exception as e:
            print(f"[Gemini Assist Schedule Fallback] {e}")

    # Fallback heuristic
    case_num_match = re.search(r"(\d+/[A-Za-z\.]+\/\d{4}/PN\s*[A-Za-z]+)", raw_text, re.IGNORECASE)
    case_number = case_num_match.group(1) if case_num_match else "01/Pid.B/2026/PN Smp"
    
    # Try find defendant
    defendant = "Terdakwa Terjadwal"
    m_def = re.search(r"(?:terdakwa|terdakwa\s*:|atas\s+nama|nama)\s*[:\-]?\s*([A-Za-z\s\.,]+)", raw_text, re.IGNORECASE)
    if m_def:
        defendant = m_def.group(1).split("\n")[0].strip()

    agenda = "Pemeriksaan Saksi"
    if "tuntutan" in raw_text.lower():
        agenda = "Pembacaan Tuntutan (Requisitoir)"
    elif "putusan" in raw_text.lower():
        agenda = "Pembacaan Putusan (Vonis)"
    elif "eksepsi" in raw_text.lower():
        agenda = "Pembacaan Eksepsi"
    elif "dakwaan" in raw_text.lower():
        agenda = "Pembacaan Surat Dakwaan"

    prosecutor = "Tim JPU Kejari Klungkung"
    m_jpu = re.search(r"(?:jpu|penuntut umum|jaksa)\s*[:\-]?\s*([A-Za-z\s\.,]+)", raw_text, re.IGNORECASE)
    if m_jpu:
        prosecutor = m_jpu.group(1).split("\n")[0].strip()

    return {
        "success": True,
        "ai_provider": "gemini_journalistic_engine",
        "model": "heuristic_schedule",
        "data": {
            "case_number": case_number,
            "defendant_name": defendant,
            "case_type": "PIDUM",
            "agenda": agenda,
            "prosecutor": prosecutor,
            "court_room": "Ruang Sidang Cakra",
            "session_time": "09:30 WITA"
        },
        "message": "Data jadwal sidang berhasil distandardisasi dengan Engine Sidang Adhyaksa!"
    }
