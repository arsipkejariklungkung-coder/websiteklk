"""
KERTAGOSA - Vercel Blob Cloud Storage Integration
Kejaksaan Negeri Klungkung

Enables zero-dependency synchronization and direct uploads to Vercel Blob
(https://vercel.com/docs/storage/vercel-blob). Works seamlessly in both:
1. Vercel Serverless environment (@vercel/python runtime)
2. Local development & on-premise deployments
"""

import os
import sys
import json
import time
import uuid
import re
import urllib.parse
import mimetypes
import urllib.request
import urllib.error

# Automatically load .env or .env.local if present
def load_env_file():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    for env_name in ['.env.local', '.env']:
        env_path = os.path.join(root_dir, env_name)
        if os.path.isfile(env_path):
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k not in os.environ and v:
                                os.environ[k] = v
            except Exception:
                pass

load_env_file()


def get_blob_token(conn=None):
    """
    Retrieves the Vercel Blob Read/Write token with precedence:
    1. System environment variable BLOB_READ_WRITE_TOKEN (auto-set by Vercel)
    2. Database page_contents setting 'vercel_blob_token' (CMS UI configured)
    """
    token = os.environ.get('BLOB_READ_WRITE_TOKEN', '').strip()
    if token:
        return token

    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT content_value FROM page_contents WHERE content_key = 'vercel_blob_token'")
            row = cursor.fetchone()
            if row and row[0] and str(row[0]).strip():
                return str(row[0]).strip()
        except Exception:
            pass

    return ''


def is_blob_configured(conn=None):
    token = get_blob_token(conn)
    return bool(token and token.startswith('vercel_blob_rw_'))


def mask_token(token):
    if not token:
        return ''
    if len(token) <= 12:
        return '••••••••'
    return f"{token[:15]}••••••••{token[-4:]}"


def upload_to_blob(binary_data, filename, content_type=None, token=None, add_random_suffix=True):
    """
    Uploads raw binary data to Vercel Blob via direct REST API.
    Does not require third-party packages (uses standard urllib.request).
    """
    token = (token or get_blob_token()).strip()
    if not token:
        return {
            'success': False,
            'error': 'Token BLOB_READ_WRITE_TOKEN tidak ditemukan. Silakan konfigurasi di Vercel atau Pengaturan Admin.'
        }

    # Determine Content-Type
    if not content_type:
        guessed, _ = mimetypes.guess_type(filename)
        content_type = guessed or 'application/octet-stream'

    base_name = os.path.basename(filename).strip()
    name_part, ext_part = os.path.splitext(base_name)
    # Sanitize name part: keep alphanumeric, underscore, hyphen
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name_part)
    safe_ext = re.sub(r'[^a-zA-Z0-9]', '', ext_part.lower())
    if safe_ext:
        clean_filename = f"{safe_name}.{safe_ext}"
    else:
        clean_filename = safe_name or 'upload_file'

    encoded_filename = urllib.parse.quote(clean_filename)
    url = f"https://blob.vercel-storage.com/{encoded_filename}"

    headers = {
        'Authorization': f'Bearer {token}',
        'x-api-version': '7',
        'x-vercel-blob-access': 'public',
        'Content-Type': content_type,
    }
    if add_random_suffix:
        headers['x-add-random-suffix'] = '1'
    else:
        headers['x-add-random-suffix'] = '0'

    req = urllib.request.Request(url, data=binary_data, headers=headers, method='PUT')

    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            res_body = response.read().decode('utf-8')
            data = json.loads(res_body)
            return {
                'success': True,
                'url': data.get('url'),
                'downloadUrl': data.get('downloadUrl'),
                'pathname': data.get('pathname'),
                'contentType': data.get('contentType'),
                'size': len(binary_data)
            }
    except urllib.error.HTTPError as e:
        err_body = ''
        try:
            err_body = e.read().decode('utf-8')
        except Exception:
            pass
        return {
            'success': False,
            'error': f'Vercel Blob HTTP Error {e.code}: {e.reason}. {err_body}'.strip()
        }
    except urllib.error.URLError as e:
        return {
            'success': False,
            'error': f'Gagal menghubungi server Vercel Blob: {e.reason}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Terjadi kesalahan saat upload ke Vercel Blob: {str(e)}'
        }


def test_blob_connection(token=None):
    """
    Tests connection to Vercel Blob by uploading a tiny probe file.
    """
    token = (token or get_blob_token()).strip()
    if not token:
        return {
            'success': False,
            'error': 'Token BLOB_READ_WRITE_TOKEN belum dikonfigurasi.'
        }

    probe_content = f"KERTAGOSA_PROBE_{int(time.time())}_{uuid.uuid4().hex[:6]}\nKejaksaan Negeri Klungkung Vercel Blob Connection Test OK".encode('utf-8')
    res = upload_to_blob(probe_content, 'probe_connection_test.txt', content_type='text/plain', token=token, add_random_suffix=True)
    if res.get('success'):
        return {
            'success': True,
            'url': res.get('url'),
            'message': 'Koneksi ke Vercel Blob Berhasil! Penyimpanan cloud aktif dan siap digunakan.'
        }
    return res


def sync_all_media_to_blob(uploads_dir, get_db_fn, token=None, limit=100):
    """
    Iterates through local files in static/uploads/, uploads any that are not yet
    on Vercel Blob, and updates database records referencing them.
    """
    token = (token or get_blob_token()).strip()
    if not token:
        return {
            'success': False,
            'error': 'Token BLOB_READ_WRITE_TOKEN diperlukan untuk proses sinkronisasi.'
        }

    if not os.path.isdir(uploads_dir):
        return {
            'success': False,
            'error': f'Folder upload lokal tidak ditemukan: {uploads_dir}'
        }

    valid_extensions = ('.jpg', '.jpeg', '.png', '.svg', '.webp', '.pdf', '.docx', '.xlsx')
    synced = []
    skipped = []
    errors = []

    files = [f for f in os.listdir(uploads_dir) if f.lower().endswith(valid_extensions)]
    files.sort(reverse=True) # newest first
    files = files[:limit]

    conn = get_db_fn()
    cursor = conn.cursor()

    for fname in files:
        fpath = os.path.join(uploads_dir, fname)
        if not os.path.isfile(fpath):
            continue

        local_ref = f"/static/uploads/{fname}"

        # Read file bytes
        try:
            with open(fpath, 'rb') as f:
                bdata = f.read()
        except Exception as e:
            errors.append(f"{fname}: {str(e)}")
            continue

        # Upload to Vercel Blob
        res = upload_to_blob(bdata, fname, token=token, add_random_suffix=True)
        if not res.get('success'):
            errors.append(f"{fname}: {res.get('error')}")
            continue

        blob_url = res.get('url')
        synced.append({
            'local_filename': fname,
            'local_url': local_ref,
            'blob_url': blob_url,
            'size': len(bdata)
        })

        # Update all database references
        try:
            cursor.execute("UPDATE page_contents SET content_value = ? WHERE content_value = ?", (blob_url, local_ref))
            cursor.execute("UPDATE organization_members SET photo_url = ? WHERE photo_url = ?", (blob_url, local_ref))
            cursor.execute("UPDATE posts SET thumbnail_url = ? WHERE thumbnail_url = ?", (blob_url, local_ref))
            cursor.execute("UPDATE announcements SET image_url = ? WHERE image_url = ?", (blob_url, local_ref))
            cursor.execute("UPDATE accountability_docs SET file_url = ? WHERE file_url = ?", (blob_url, local_ref))
            cursor.execute("UPDATE complaints SET attachment_url = ? WHERE attachment_url = ?", (blob_url, local_ref))
        except Exception as e:
            print(f"[Blob Sync DB Warning] {e}")

    conn.commit()
    conn.close()

    return {
        'success': True,
        'synced_count': len(synced),
        'files': synced,
        'errors': errors,
        'message': f'Berhasil mengunggah & menyinkronkan {len(synced)} berkas media ke Vercel Blob Cloud CDN!'
    }
