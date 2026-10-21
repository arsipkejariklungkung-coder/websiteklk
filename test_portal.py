#!/usr/bin/env python3
"""
Comprehensive automated test suite for KERTAGOSA portal.
Simulates HTTP server handler without needing loopback network socket.
"""
import os
import sys
import io
import json
import base64
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from server import KertagosaHandler, get_db, hash_password, SESSIONS

class MockRequest:
    def __init__(self, data=b""):
        self._data = io.BytesIO(data)
    def makefile(self, mode, *args, **kwargs):
        if 'b' in mode:
            return self._data
        return io.TextIOWrapper(self._data)
    def sendall(self, data):
        pass

class MockHandler(KertagosaHandler):
    def __init__(self, method, path, headers=None, body=b""):
        self.command = method
        self.path = path
        self.request_version = "HTTP/1.1"
        self.headers = headers or {}
        self.client_address = ('127.0.0.1', 8000)
        self.rfile = io.BytesIO(body)
        self.wfile = io.BytesIO()
        self.response_code = None
        self.response_headers = {}

    def send_response(self, code, message=None):
        self.response_code = code

    def send_header(self, keyword, value):
        self.response_headers[keyword] = value

    def end_headers(self):
        pass

    def get_response_json(self):
        self.wfile.seek(0)
        content = self.wfile.read().decode('utf-8')
        try:
            return json.loads(content)
        except Exception:
            return content

class TestKertagosaPortal(unittest.TestCase):
    def setUp(self):
        # Seed test admin session
        self.token = "test-token-superadmin"
        SESSIONS[self.token] = {
            'id': 1,
            'username': 'admin',
            'full_name': 'R. Indra Senjaya, S.H., M.H.',
            'role': 'ADMIN'
        }

    def test_01_static_assets_exist(self):
        """Verify all HTML, CSS, JS and Image files exist."""
        required_files = [
            'index.html',
            'admin.html',
            'static/css/styles.css',
            'static/js/app.js',
            'static/js/admin.js',
            'static/images/logo-kejari.svg',
            'static/images/kajari-portrait.jpg',
            'static/images/peta-klungkung.png',
            'static/images/news-featured.jpg',
            'static/images/news-jms.jpg',
            'static/images/news-bb.jpg',
            'static/images/news-lelang.jpg',
            'static/images/news-rj.jpg',
            'static/images/news-wbk.jpg',
            'profil-struktur-organisasi.html',
            'profil-visi-misi.html',
            'profil-sejarah.html',
            'profil-logo-makna.html',
            'profil-tugas-wewenang.html',
            'informasi-berita.html',
            'informasi-pengumuman.html',
            'informasi-jadwal-sidang.html',
            'informasi-skm.html',
            'akuntabilitas-kinerja.html'
        ]
        for f in required_files:
            p = os.path.join(BASE_DIR, f)
            self.assertTrue(os.path.exists(p), f"Missing required file: {f}")

    def test_07_profile_pages_routes(self):
        """Verify each of the 5 separate profile pages returns HTTP 200."""
        routes = [
            '/profil/struktur-organisasi',
            '/profil/visi-misi',
            '/profil/sejarah',
            '/profil/logo-makna',
            '/profil/tugas-wewenang'
        ]
        for route in routes:
            handler = MockHandler('GET', route)
            handler.do_GET()
            self.assertEqual(handler.response_code, 200, f"Route {route} failed with {handler.response_code}")

    def test_08_informasi_pages_routes(self):
        """Verify each of the 4 separate Informasi pages returns HTTP 200."""
        routes = [
            '/informasi/berita',
            '/informasi/pengumuman',
            '/informasi/jadwal-sidang',
            '/informasi/skm'
        ]
        for route in routes:
            handler = MockHandler('GET', route)
            handler.do_GET()
            self.assertEqual(handler.response_code, 200, f"Route {route} failed with {handler.response_code}")

    def test_02_get_homepage_data(self):
        """Verify /api/public/homepage-data returns complete contents, news, services, schedules, skm."""
        handler = MockHandler('GET', '/api/public/homepage-data')
        handler.do_GET()
        self.assertEqual(handler.response_code, 200)
        data = handler.get_response_json()
        self.assertTrue(data['success'])
        
        # Check Zero Hardcoded Contents
        contents = data['contents']
        self.assertIn('hero_main_title', contents)
        self.assertEqual(contents['hero_main_title']['value'], 'KERTAGOSA')
        self.assertIn('hero_stat_1_value', contents)
        self.assertEqual(contents['hero_stat_1_value']['value'], '88.31')
        self.assertIn('kajari_full_name', contents)
        self.assertEqual(contents['kajari_full_name']['value'], 'R. Indra Senjaya, S.H., M.H.')

        # Check Bento News
        news = data['news']
        self.assertGreaterEqual(len(news), 6)
        featured = [n for n in news if n['layout_type'] == 'FEATURED_MAIN']
        self.assertEqual(len(featured), 1)
        self.assertIn('Rp 1,2 Miliar', featured[0]['title'])

        # Check 4 Pillars Services
        services = data['services']
        self.assertEqual(len(services), 4)
        codes = [s['code'] for s in services]
        self.assertIn('JAGADITA', codes)
        self.assertIn('MASADU', codes)
        self.assertIn('SEMARA_BAKTI', codes)
        self.assertIn('DATUN', codes)

        # Check JAGADITA Schedules
        schedules = data['schedules']
        self.assertGreaterEqual(len(schedules), 6)

        # Check SKM
        skm = data['skm']
        self.assertEqual(skm['main_score'], '88.31')
        self.assertEqual(len(skm['metrics']), 4)

    def test_03_auth_login(self):
        """Verify login succeeds with Multi-Factor Authentication (MFA) challenge flow."""
        import totp_mfa
        # 1. Step 1: Submit correct credentials -> triggers MFA challenge
        body = json.dumps({'username': 'admin@kejariklungkung.go.id', 'password': 'admin123'}).encode('utf-8')
        headers = {'Content-Length': str(len(body))}
        handler = MockHandler('POST', '/api/auth/login', headers, body)
        handler.do_POST()
        self.assertEqual(handler.response_code, 200)
        data = handler.get_response_json()
        self.assertTrue(data.get('require_mfa'))
        self.assertIn('mfa_token', data)
        self.assertIn('totp_secret', data)
        self.assertNotIn('otp_preview', data)
        mfa_token = data['mfa_token']
        otp_code = totp_mfa.generate_totp(data['totp_secret'])

        # 1b. Step 2 (Negative): Wrong MFA OTP code -> fails with HTTP 400
        bad_mfa_body = json.dumps({'mfa_token': mfa_token, 'otp_code': '000000'}).encode('utf-8')
        bad_mfa_handler = MockHandler('POST', '/api/auth/verify-mfa', {'Content-Length': str(len(bad_mfa_body))}, bad_mfa_body)
        bad_mfa_handler.do_POST()
        self.assertEqual(bad_mfa_handler.response_code, 400)

        # 1c. Step 2 (Positive): Correct MFA OTP code -> issues authenticated session
        mfa_body = json.dumps({'mfa_token': mfa_token, 'otp_code': otp_code}).encode('utf-8')
        mfa_handler = MockHandler('POST', '/api/auth/verify-mfa', {'Content-Length': str(len(mfa_body))}, mfa_body)
        mfa_handler.do_POST()
        self.assertEqual(mfa_handler.response_code, 200)
        mfa_data = mfa_handler.get_response_json()
        self.assertTrue(mfa_data['success'])
        self.assertIn('token', mfa_data)
        self.assertEqual(mfa_data['user']['role'], 'ADMIN')

        # 2. Wrong credentials -> fails with HTTP 401
        body_bad = json.dumps({'username': 'admin@kejariklungkung.go.id', 'password': 'wrong'}).encode('utf-8')
        headers_bad = {'Content-Length': str(len(body_bad))}
        handler_bad = MockHandler('POST', '/api/auth/login', headers_bad, body_bad)
        handler_bad.do_POST()
        self.assertEqual(handler_bad.response_code, 401)

    def test_04_admin_put_page_content_live_inline(self):
        """Verify Admin can dynamically update any page_content in real-time."""
        new_title = "KERTAGOSA DIGITAL 2026"
        body = json.dumps({'content_key': 'hero_main_title', 'content_value': new_title}).encode('utf-8')
        headers = {
            'Content-Length': str(len(body)),
            'Authorization': f'Bearer {self.token}'
        }
        handler = MockHandler('PUT', '/api/admin/page-contents', headers, body)
        handler.do_PUT()
        self.assertEqual(handler.response_code, 200)
        data = handler.get_response_json()
        self.assertTrue(data['success'])

        # Check updated value in DB
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT content_value FROM page_contents WHERE content_key = 'hero_main_title'")
        val = cursor.fetchone()['content_value']
        conn.close()
        self.assertEqual(val, new_title)

        # Revert back to KERTAGOSA
        conn = get_db()
        conn.execute("UPDATE page_contents SET content_value = 'KERTAGOSA' WHERE content_key = 'hero_main_title'")
        conn.commit()
        conn.close()

    def test_05_complaint_and_ticket_tracking(self):
        """Verify citizen can submit a MASADU complaint and track it by ticket code."""
        payload = {
            'title': 'Dugaan Pungli di Desa Sampalan',
            'chronology': 'Ditemukan indikasi penarikan biaya tidak resmi sebesar Rp 50.000.',
            'category': 'Pungutan Liar / Gratifikasi',
            'is_anonymous': False,
            'reporter_name': 'I Nyoman Suardana',
            'reporter_phone': '08123456789'
        }
        body = json.dumps(payload).encode('utf-8')
        headers = {'Content-Length': str(len(body))}
        handler = MockHandler('POST', '/api/public/complaints', headers, body)
        handler.do_POST()
        self.assertEqual(handler.response_code, 200)
        data = handler.get_response_json()
        self.assertTrue(data['success'])
        ticket_code = data['ticket_code']
        self.assertTrue(ticket_code.startswith('TRK-MASADU-'))

        # Now track the ticket
        track_handler = MockHandler('GET', f'/api/public/ticket/{ticket_code}')
        track_handler.do_GET()
        self.assertEqual(track_handler.response_code, 200)
        track_data = track_handler.get_response_json()
        self.assertTrue(track_data['success'])
        self.assertEqual(track_data['ticket']['ticket_code'], ticket_code)
        self.assertEqual(track_data['ticket']['reporter_name'], 'I Nyoman Suardana')

    def test_06_jagadita_crud(self):
        """Verify Admin can add, update and delete court schedules."""
        new_schedule = {
            'session_time': '14:00 WITA',
            'court_room': 'R. Sidang Cakra',
            'case_number': '199/Pid.B/2026/PN Kp',
            'defendant_name': 'I Ketut Artawan',
            'case_type': 'PIDUM',
            'agenda': 'Pemeriksaan Saksi Ahli',
            'prosecutor': 'I Made Darmawan, S.H.',
            'status': 'TERJADWAL'
        }
        body = json.dumps(new_schedule).encode('utf-8')
        headers = {
            'Content-Length': str(len(body)),
            'Authorization': f'Bearer {self.token}'
        }
        # Create
        create_handler = MockHandler('POST', '/api/admin/jagadita', headers, body)
        create_handler.do_POST()
        self.assertEqual(create_handler.response_code, 200)
        new_id = create_handler.get_response_json()['id']

        # Update status to SEDANG BERLANGSUNG
        upd_body = json.dumps({'status': 'SEDANG BERLANGSUNG'}).encode('utf-8')
        upd_headers = {
            'Content-Length': str(len(upd_body)),
            'Authorization': f'Bearer {self.token}'
        }
        upd_handler = MockHandler('PUT', f'/api/admin/jagadita/{new_id}', upd_headers, upd_body)
        upd_handler.do_PUT()
        self.assertEqual(upd_handler.response_code, 200)

        # Delete
        del_handler = MockHandler('DELETE', f'/api/admin/jagadita/{new_id}', {'Authorization': f'Bearer {self.token}'})
        del_handler.do_DELETE()
        self.assertEqual(del_handler.response_code, 200)

    def test_09_organization_chart_api_and_crud(self):
        """Verify Organization Chart public API (with NIP privacy protection) and Admin CRUD/Settings."""
        # 1. GET /api/public/organization as Public (Unauthenticated Visitor)
        handler = MockHandler('GET', '/api/public/organization')
        handler.do_GET()
        self.assertEqual(handler.response_code, 200)
        data = handler.get_response_json()
        self.assertTrue(data['success'])
        self.assertFalse(data.get('is_admin', False), "Public requester should have is_admin False")
        self.assertIn('settings', data)
        self.assertEqual(data['settings']['title'], 'STRUKTUR ORGANISASI')
        self.assertIn('hierarchy', data)
        self.assertEqual(len(data['hierarchy']['level_1']), 1)
        self.assertEqual(len(data['hierarchy']['level_2']), 6)
        self.assertGreaterEqual(len(data['members']), 24)

        # Verify NIP and Rank are completely hidden/redacted from public visitors
        for member in data['members']:
            self.assertIsNone(member.get('nip'), f"NIP of {member.get('name')} must be redacted for public")
            self.assertIsNone(member.get('rank'), f"Rank of {member.get('name')} must be redacted for public")

        # 1b. GET /api/public/organization as Admin (Authenticated)
        admin_handler = MockHandler('GET', '/api/public/organization', headers={'Authorization': f'Bearer {self.token}'})
        admin_handler.do_GET()
        self.assertEqual(admin_handler.response_code, 200)
        admin_data = admin_handler.get_response_json()
        self.assertTrue(admin_data['success'])
        self.assertTrue(admin_data.get('is_admin', False), "Admin requester should have is_admin True")
        l1_kajari = admin_data['hierarchy']['level_1'][0]
        self.assertIsNotNone(l1_kajari.get('nip'), "Admin must be able to view NIP of Kajari")
        self.assertIsNotNone(l1_kajari.get('rank'), "Admin must be able to view Rank of Kajari")

        # 2. POST /api/admin/organization/members
        new_member = {
            'name': 'I Made Wira Pratama, S.H.',
            'position': 'Staf Khusus Tata Kelola Yustisial',
            'level': 4,
            'parent_id': 1,
            'photo_url': '/static/images/avatar-officer-male.svg',
            'nip': '19980101 202201 1 001',
            'rank': 'Penata Muda / III-a',
            'order_num': 10
        }
        body = json.dumps(new_member).encode('utf-8')
        headers = {
            'Content-Length': str(len(body)),
            'Authorization': f'Bearer {self.token}'
        }
        create_h = MockHandler('POST', '/api/admin/organization/members', headers, body)
        create_h.do_POST()
        self.assertEqual(create_h.response_code, 200)
        member_id = create_h.get_response_json()['id']

        # 3. PUT /api/admin/organization/members/<id>
        upd_data = {
            'name': 'I Made Wira Pratama, S.H., M.H.',
            'position': 'Staf Ahli Pidana Khusus',
            'level': 4,
            'parent_id': 1,
            'photo_url': '/static/images/avatar-officer-male.svg',
            'nip': '19980101 202201 1 001',
            'rank': 'Penata Muda Tingkat I / III-b',
            'order_num': 10
        }
        upd_body = json.dumps(upd_data).encode('utf-8')
        upd_h = MockHandler('PUT', f'/api/admin/organization/members/{member_id}', {'Content-Length': str(len(upd_body)), 'Authorization': f'Bearer {self.token}'}, upd_body)
        upd_h.do_PUT()
        self.assertEqual(upd_h.response_code, 200)

        # 4. DELETE /api/admin/organization/members/<id>
        del_h = MockHandler('DELETE', f'/api/admin/organization/members/{member_id}', {'Authorization': f'Bearer {self.token}'})
        del_h.do_DELETE()
        self.assertEqual(del_h.response_code, 200)

        # 5. POST /api/admin/organization/settings
        sett_data = {
            'logo_left': '/static/images/logo-kejari.svg',
            'logo_right': '/static/images/logo-wbk.svg',
            'watermark_bg': '/static/images/logo-kejari.svg',
            'watermark_opacity': 15,
            'title': 'STRUKTUR ORGANISASI',
            'subtitle': 'KEJAKSAAN NEGERI KLUNGKUNG',
            'legal_basis': 'Peraturan Kejaksaan RI Nomor PER-006/A/JA/07/2017'
        }
        sett_body = json.dumps(sett_data).encode('utf-8')
        sett_h = MockHandler('POST', '/api/admin/organization/settings', {'Content-Length': str(len(sett_body)), 'Authorization': f'Bearer {self.token}'}, sett_body)
        sett_h.do_POST()
        self.assertEqual(sett_h.response_code, 200)

    def test_10_admin_users_crud_and_mfa(self):
        """Verify Admin Management (CRUD) and newly created Admin MFA login."""
        # 1. GET /api/admin/users
        get_h = MockHandler('GET', '/api/admin/users', headers={'Authorization': f'Bearer {self.token}'})
        get_h.do_GET()
        self.assertEqual(get_h.response_code, 200)
        data = get_h.get_response_json()
        self.assertTrue(data['success'])
        initial_count = len(data['users'])
        self.assertGreaterEqual(initial_count, 1)

        # 2. POST /api/admin/users (Create new Admin)
        new_admin = {
            'username': 'putugede',
            'email': 'putugede@kejariklungkung.go.id',
            'full_name': 'I Putu Gede, S.H.',
            'password': 'passwordBaru2026',
            'role': 'ADMIN',
            'mfa_enabled': True
        }
        create_body = json.dumps(new_admin).encode('utf-8')
        create_h = MockHandler('POST', '/api/admin/users', {'Content-Length': str(len(create_body)), 'Authorization': f'Bearer {self.token}'}, create_body)
        create_h.do_POST()
        self.assertEqual(create_h.response_code, 200)
        new_id = create_h.get_response_json()['id']

        # 3. Test newly created admin login via MFA
        import totp_mfa
        login_body = json.dumps({'username': 'putugede', 'password': 'passwordBaru2026'}).encode('utf-8')
        login_h = MockHandler('POST', '/api/auth/login', {'Content-Length': str(len(login_body))}, login_body)
        login_h.do_POST()
        self.assertEqual(login_h.response_code, 200)
        login_res = login_h.get_response_json()
        self.assertTrue(login_res.get('require_mfa'))
        mfa_token = login_res['mfa_token']
        otp_code = totp_mfa.generate_totp(login_res['totp_secret'])

        # Verify MFA OTP for new admin
        verify_body = json.dumps({'mfa_token': mfa_token, 'otp_code': otp_code}).encode('utf-8')
        verify_h = MockHandler('POST', '/api/auth/verify-mfa', {'Content-Length': str(len(verify_body))}, verify_body)
        verify_h.do_POST()
        self.assertEqual(verify_h.response_code, 200)
        verify_res = verify_h.get_response_json()
        self.assertTrue(verify_res['success'])
        self.assertEqual(verify_res['user']['username'], 'putugede')

        # 4. PUT /api/admin/users/<id> (Update new Admin)
        upd_data = {
            'full_name': 'I Putu Gede, S.H., M.H.',
            'email': 'putugede@kejariklungkung.go.id',
            'role': 'SUPERADMIN',
            'mfa_enabled': True
        }
        upd_body = json.dumps(upd_data).encode('utf-8')
        upd_h = MockHandler('PUT', f'/api/admin/users/{new_id}', {'Content-Length': str(len(upd_body)), 'Authorization': f'Bearer {self.token}'}, upd_body)
        upd_h.do_PUT()
        self.assertEqual(upd_h.response_code, 200)

        # 5. DELETE /api/admin/users/<id>
        del_h = MockHandler('DELETE', f'/api/admin/users/{new_id}', {'Authorization': f'Bearer {self.token}'})
        del_h.do_DELETE()
        self.assertEqual(del_h.response_code, 200)

        # 6. Negative test: Attempt to delete last remaining admin (should fail)
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users LIMIT 1")
        only_admin = cur.fetchone()
        conn.close()
        del_last_h = MockHandler('DELETE', f'/api/admin/users/{only_admin["id"]}', {'Authorization': f'Bearer {self.token}'})
        del_last_h.do_DELETE()
        self.assertEqual(del_last_h.response_code, 400)

    def test_11_accountability_public_page_and_api(self):
        """Verify Akuntabilitas Kinerja public page routing, category grouping, and filter APIs."""
        # 1. Page route
        for p in ['/akuntabilitas-kinerja', '/akuntabilitas-kinerja.html', '/sakip']:
            h = MockHandler('GET', p)
            h.do_GET()
            self.assertEqual(h.response_code, 200, f"Route {p} failed")

        # 2. Public API GET /api/public/accountability
        api_h = MockHandler('GET', '/api/public/accountability')
        api_h.do_GET()
        self.assertEqual(api_h.response_code, 200)
        data = api_h.get_response_json()
        self.assertTrue(data['success'])

        # Verify 4 Core Categories
        cat_keys = [c['key'] for c in data['categories']]
        for required_cat in ['RENSTRA', 'RENJA', 'LKJ', 'TRIWULAN']:
            self.assertIn(required_cat, cat_keys)

        docs = data['documents']
        self.assertGreaterEqual(len(docs), 10)

        # 3. Filter by category
        renstra_h = MockHandler('GET', '/api/public/accountability?category=RENSTRA')
        renstra_h.do_GET()
        renstra_data = renstra_h.get_response_json()
        self.assertTrue(all(d['category'] == 'RENSTRA' for d in renstra_data['documents']))

        # 4. Search filter
        search_h = MockHandler('GET', '/api/public/accountability?search=Strategis')
        search_h.do_GET()
        search_data = search_h.get_response_json()
        self.assertGreaterEqual(len(search_data['documents']), 1)

        # 5. View count increment
        doc_id = docs[0]['id']
        views_before = docs[0]['views_count']
        view_h = MockHandler('POST', f'/api/public/accountability/{doc_id}/view')
        view_h.do_POST()
        self.assertEqual(view_h.response_code, 200)

        # Check DB updated
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT views_count FROM accountability_docs WHERE id = ?", (doc_id,))
        views_after = cur.fetchone()['views_count']
        conn.close()
        self.assertEqual(views_after, views_before + 1)

    def test_12_accountability_admin_crud(self):
        """Verify Akuntabilitas Kinerja CMS backoffice CRUD operations."""
        # 1. GET /api/admin/accountability (Unauthorized check)
        unauth_h = MockHandler('GET', '/api/admin/accountability')
        unauth_h.do_GET()
        self.assertEqual(unauth_h.response_code, 401)

        # 2. GET /api/admin/accountability (Authorized)
        auth_h = MockHandler('GET', '/api/admin/accountability', {'Authorization': f'Bearer {self.token}'})
        auth_h.do_GET()
        self.assertEqual(auth_h.response_code, 200)
        data = auth_h.get_response_json()
        self.assertTrue(data['success'])
        initial_count = data['stats']['total']

        # 3. POST /api/admin/accountability (Create new Document)
        new_doc = {
            'category': 'RENJA',
            'title': 'Rencana Kerja Tahunan Perubahan 2024',
            'period_year': '2024',
            'doc_url': 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
            'file_size': 'PDF (4.1 MB)',
            'description': 'Revisi rencana kerja penyerapan anggaran per seksi.',
            'order_num': 15,
            'is_active': True
        }
        create_body = json.dumps(new_doc).encode('utf-8')
        create_h = MockHandler('POST', '/api/admin/accountability', {'Content-Length': str(len(create_body)), 'Authorization': f'Bearer {self.token}'}, create_body)
        create_h.do_POST()
        self.assertEqual(create_h.response_code, 200)
        new_id = create_h.get_response_json()['id']

        # 4. PUT /api/admin/accountability/<id> (Update Document)
        upd_doc = {
            'category': 'RENJA',
            'title': 'Rencana Kerja Tahunan Perubahan 2024 (Revisi Final)',
            'period_year': '2024',
            'doc_url': 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
            'file_size': 'PDF (4.5 MB)',
            'description': 'Revisi final rencana kerja penyerapan anggaran per seksi.',
            'order_num': 15,
            'is_active': True
        }
        upd_body = json.dumps(upd_doc).encode('utf-8')
        upd_h = MockHandler('PUT', f'/api/admin/accountability/{new_id}', {'Content-Length': str(len(upd_body)), 'Authorization': f'Bearer {self.token}'}, upd_body)
        upd_h.do_PUT()
        self.assertEqual(upd_h.response_code, 200)

        # 5. DELETE /api/admin/accountability/<id> (Delete Document)
        del_h = MockHandler('DELETE', f'/api/admin/accountability/{new_id}', {'Authorization': f'Bearer {self.token}'})
        del_h.do_DELETE()
        self.assertEqual(del_h.response_code, 200)

    def test_13_interactive_homepage_elements(self):
        """Verify index.html and static/js/app.js include all interactive homepage sections & modals."""
        h = MockHandler('GET', '/')
        h.do_GET()
        self.assertEqual(h.response_code, 200)
        html = h.wfile.getvalue().decode('utf-8')

        required_elements = [
            'id="live-wita-clock"',
            'id="ptsp-live-status-badge"',
            'id="mobile-nav-drawer"',
            'id="home-news-search"',
            'id="sakip-beranda"',
            'id="home-sakip-grid"',
            'id="kecamatan-coverage-box"',
            'id="modal-kajari-welcome"',
            'id="modal-datun-consult"',
            'id="modal-schedule-detail"',
            'id="modal-home-doc-viewer"',
            'id="quick-assist-menu"',
            'id="btn-back-to-top"',
            'id="layanan-digital"',
            'https://halojpn.kejaksaan.go.id/',
            'https://tilang.kejaksaan.go.id/home',
            'https://ppid.kejaksaan.go.id/satker/kn-klungkung',
            'https://www.lapor.go.id/',
        ]
        for elem in required_elements:
            self.assertIn(elem, html, f"Missing interactive homepage element: {elem}")

    def test_14_official_logo_upload_and_sync(self):
        """Verify uploading official site logo (Header, Navbar & Footer) via Admin CMS."""
        # 1. Verify admin.html contains required logo upload and dual-preview elements
        admin_h = MockHandler('GET', '/admin', {'Authorization': f'Bearer {self.token}'})
        admin_h.do_GET()
        self.assertEqual(admin_h.response_code, 200)
        admin_html = admin_h.wfile.getvalue().decode('utf-8')
        for expected in ['id="preview-header-logo"', 'id="preview-footer-logo"', 'id="header-logo-url-input"', 'id="admin-top-logo"', 'id="logo-upload-status"']:
            self.assertIn(expected, admin_html)

        # 2. Upload test logo SVG via POST /api/admin/upload-media with content_key
        dummy_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="green"/></svg>'
        b64_data = base64.b64encode(dummy_svg.encode('utf-8')).decode('utf-8')
        payload = {
            'filename': 'logo-test-kejari.svg',
            'file_data': f'data:image/svg+xml;base64,{b64_data}',
            'content_key': 'header_logo_url'
        }
        body = json.dumps(payload).encode('utf-8')
        headers = {'Content-Length': str(len(body)), 'Authorization': f'Bearer {self.token}'}
        upload_h = MockHandler('POST', '/api/admin/upload-media', headers, body)
        upload_h.do_POST()
        self.assertEqual(upload_h.response_code, 200)
        upload_res = upload_h.get_response_json()
        self.assertTrue(upload_res['success'])
        new_logo_url = upload_res['url']
        self.assertTrue(new_logo_url.startswith('/static/uploads/'))

        # 3. Verify public homepage-data reflects the new uploaded logo
        home_h = MockHandler('GET', '/api/public/homepage-data')
        home_h.do_GET()
        self.assertEqual(home_h.response_code, 200)
        home_data = home_h.get_response_json()
        self.assertTrue(home_data['success'])
        self.assertEqual(home_data['contents']['header_logo_url']['value'], new_logo_url)

        # 4. Reset back to official default logo via PUT /api/admin/page-contents
        reset_payload = {
            'content_key': 'header_logo_url',
            'content_value': '/static/images/logo-kejari.svg'
        }
        reset_body = json.dumps(reset_payload).encode('utf-8')
        reset_h = MockHandler('PUT', '/api/admin/page-contents', {'Content-Length': str(len(reset_body)), 'Authorization': f'Bearer {self.token}'}, reset_body)
        reset_h.do_PUT()
        self.assertEqual(reset_h.response_code, 200)

        # Verify DB is reset
        home_h2 = MockHandler('GET', '/api/public/homepage-data')
        home_h2.do_GET()
        self.assertEqual(home_h2.get_response_json()['contents']['header_logo_url']['value'], '/static/images/logo-kejari.svg')

    def test_15_profile_cms_and_live_editing(self):
        """Verify comprehensive profile CMS, live editing, image upload hooks, and admin CRUD."""
        # 1. Public Profile API for all 4 profile pages
        for p_type, min_items in [('VISI_MISI', 7), ('SEJARAH', 6), ('LOGO_MAKNA', 6), ('TUGAS_WEWENANG', 5)]:
            h = MockHandler('GET', f'/api/public/profile-data?page_type={p_type}')
            h.do_GET()
            self.assertEqual(h.response_code, 200)
            res = h.get_response_json()
            self.assertTrue(res['success'])
            self.assertGreaterEqual(len(res['items']), min_items, f"Insufficient items for {p_type}")
            self.assertIn('contents', res)

        # 2. Check HTML pages have required CMS markers & dynamic containers
        pages_and_markers = [
            ('/profil/visi-misi', ['id="container-misi-list"', 'id="profile-admin-toolbar"', 'data-cms-key="profil_visi_text"']),
            ('/profil/sejarah', ['id="container-timeline-milestones"', 'id="profil-sejarah-img-1"', 'id="profil-sejarah-img-2"', 'id="profile-admin-toolbar"']),
            ('/profil/logo-makna', ['id="container-logo-elements"', 'id="profil-logo-official-img"', 'data-cms-key="profil_logo_satya_desc"', 'id="profile-admin-toolbar"']),
            ('/profil/tugas-wewenang', ['id="container-tugas-bidang"', 'data-cms-key="profil_tugas_dasar_hukum"', 'id="profile-admin-toolbar"'])
        ]
        for route, markers in pages_and_markers:
            h = MockHandler('GET', route)
            h.do_GET()
            self.assertEqual(h.response_code, 200, f"Route {route} failed")
            html = h.wfile.getvalue().decode('utf-8')
            for marker in markers:
                self.assertIn(marker, html, f"Missing marker '{marker}' on page {route}")

        # 3. Check Admin Dashboard backoffice includes Kelola Profil Instansi tab and subtabs
        admin_h = MockHandler('GET', '/admin', {'Authorization': f'Bearer {self.token}'})
        admin_h.do_GET()
        self.assertEqual(admin_h.response_code, 200)
        admin_html = admin_h.wfile.getvalue().decode('utf-8')
        for expected in [
            'id="nav-profile-cms"',
            'id="tab-profile-cms"',
            'id="subnav-visi-misi"',
            'id="subnav-sejarah"',
            'id="subnav-logo-makna"',
            'id="subnav-tugas-wewenang"',
            'id="modal-admin-profile-item-form"'
        ]:
            self.assertIn(expected, admin_html, f"Missing {expected} in admin.html")

        # 4. Admin CRUD Operations for profile items
        # CREATE: Add a new Misi item
        new_item_payload = {
            'page_type': 'VISI_MISI',
            'item_type': 'MISI',
            'title': 'Misi Uji Coba Integrasi CMS Otomatis',
            'subtitle': 'Agenda Uji Coba',
            'description': 'Deskripsi misi uji coba yang dibuat melalui unit test portal.',
            'order_num': 99,
            'icon_name': 'target'
        }
        create_body = json.dumps(new_item_payload).encode('utf-8')
        create_h = MockHandler('POST', '/api/admin/profile-items', {'Content-Length': str(len(create_body)), 'Authorization': f'Bearer {self.token}'}, create_body)
        create_h.do_POST()
        self.assertEqual(create_h.response_code, 201)
        create_res = create_h.get_response_json()
        self.assertTrue(create_res['success'])
        item_id = create_res['item']['id']
        self.assertTrue(item_id > 0)

        # UPDATE: Update the created item
        update_payload = {
            'title': 'Misi Uji Coba Integrasi CMS Diperbarui',
            'subtitle': 'Agenda Terverifikasi',
            'description': 'Deskripsi misi yang telah diperbarui secara aman.',
            'order_num': 100
        }
        update_body = json.dumps(update_payload).encode('utf-8')
        update_h = MockHandler('PUT', f'/api/admin/profile-items/{item_id}', {'Content-Length': str(len(update_body)), 'Authorization': f'Bearer {self.token}'}, update_body)
        update_h.do_PUT()
        self.assertEqual(update_h.response_code, 200)
        self.assertTrue(update_h.get_response_json()['success'])

        # VERIFY IN PUBLIC DATA
        verify_h = MockHandler('GET', '/api/public/profile-data?page_type=VISI_MISI')
        verify_h.do_GET()
        self.assertEqual(verify_h.response_code, 200)
        verify_items = verify_h.get_response_json()['items']
        matching = [i for i in verify_items if i['id'] == item_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]['title'], 'Misi Uji Coba Integrasi CMS Diperbarui')

        # DELETE: Remove the created item
        del_h = MockHandler('DELETE', f'/api/admin/profile-items/{item_id}', {'Authorization': f'Bearer {self.token}'})
        del_h.do_DELETE()
        self.assertEqual(del_h.response_code, 200)
        self.assertTrue(del_h.get_response_json()['success'])

        # VERIFY DELETED
        verify_h2 = MockHandler('GET', '/api/public/profile-data?page_type=VISI_MISI')
        verify_h2.do_GET()
        verify_items2 = verify_h2.get_response_json()['items']
        matching2 = [i for i in verify_items2 if i['id'] == item_id]
        self.assertEqual(len(matching2), 0)

    def test_16_information_cms_and_announcements(self):
        """Test full CMS capabilities for Information pages (Announcements CRUD, SKM settings & Infographic update)"""
        # 1. PUBLIC GET ANNOUNCEMENTS
        pub_h = MockHandler('GET', '/api/public/announcements')
        pub_h.do_GET()
        self.assertEqual(pub_h.response_code, 200)
        pub_data = pub_h.get_response_json()
        self.assertTrue(pub_data['success'])
        self.assertGreaterEqual(len(pub_data['announcements']), 5)

        # 2. ADMIN AUTH PROTECTION
        unauth_h = MockHandler('GET', '/api/admin/announcements')
        unauth_h.do_GET()
        self.assertEqual(unauth_h.response_code, 401)

        auth_h = MockHandler('GET', '/api/admin/announcements', {'Authorization': f'Bearer {self.token}'})
        auth_h.do_GET()
        self.assertEqual(auth_h.response_code, 200)
        self.assertTrue(auth_h.get_response_json()['success'])

        # 3. CREATE NEW ANNOUNCEMENT (POST)
        new_payload = {
            'announcement_number': 'PENG-99/TEST-INFO/X/2026',
            'category': 'LELANG',
            'badge_label': 'LELANG TEST CEPAT',
            'title': 'Pengumuman Uji Coba CMS Informasi Publik',
            'excerpt': 'Ringkasan pengumuman uji coba untuk verifikasi sistem.',
            'content': 'Rincian lengkap pengumuman pengujian integrasi dual-mode CMS.',
            'deadline_date': '31 Oktober 2026',
            'external_url': 'https://lelang.go.id',
            'external_label': 'Buka Portal',
            'image_url': '/static/images/news-bb.jpg',
            'order_num': 99
        }
        body = json.dumps(new_payload).encode('utf-8')
        create_h = MockHandler('POST', '/api/admin/announcements', {'Content-Length': str(len(body)), 'Authorization': f'Bearer {self.token}'}, body)
        create_h.do_POST()
        self.assertEqual(create_h.response_code, 201)
        res_create = create_h.get_response_json()
        self.assertTrue(res_create['success'])
        ann_id = res_create['id']

        # 4. UPDATE ANNOUNCEMENT (PUT)
        update_payload = {
            'title': 'Pengumuman Uji Coba CMS Diperbarui',
            'badge_label': 'LELANG TERVERIFIKASI',
            'image_url': '/static/uploads/test-flyer.png'
        }
        up_body = json.dumps(update_payload).encode('utf-8')
        up_h = MockHandler('PUT', f'/api/admin/announcements/{ann_id}', {'Content-Length': str(len(up_body)), 'Authorization': f'Bearer {self.token}'}, up_body)
        up_h.do_PUT()
        self.assertEqual(up_h.response_code, 200)
        self.assertTrue(up_h.get_response_json()['success'])

        # 5. VERIFY IN PUBLIC DATA
        verify_h = MockHandler('GET', '/api/public/announcements')
        verify_h.do_GET()
        self.assertEqual(verify_h.response_code, 200)
        matching = [a for a in verify_h.get_response_json()['announcements'] if a['id'] == ann_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]['title'], 'Pengumuman Uji Coba CMS Diperbarui')
        self.assertEqual(matching[0]['image_url'], '/static/uploads/test-flyer.png')

        # 6. SKM SETTINGS & INFOGRAPHIC UPDATE (PUT)
        skm_payload = {
            'main_score': '99.15',
            'predicate': 'A (SANGAT MEMUASKAN)',
            'period_badge': 'Triwulan IV - 2026',
            'respondents_count': '1.580 Responden',
            'infographic_url': '/static/uploads/piagam-skm-2026.png',
            'metrics': [
                {'label': '1. Persyaratan Pelayanan', 'score': 99.5},
                {'label': '2. Prosedur Pelayanan', 'score': 99.2}
            ]
        }
        skm_body = json.dumps(skm_payload).encode('utf-8')
        skm_h = MockHandler('PUT', '/api/admin/skm', {'Content-Length': str(len(skm_body)), 'Authorization': f'Bearer {self.token}'}, skm_body)
        skm_h.do_PUT()
        self.assertEqual(skm_h.response_code, 200)
        self.assertTrue(skm_h.get_response_json()['success'])

        # Verify SKM via homepage data
        hp_h = MockHandler('GET', '/api/public/homepage-data')
        hp_h.do_GET()
        hp_data = hp_h.get_response_json()
        self.assertEqual(hp_data['contents']['skm_main_score']['value'], '99.15')
        self.assertEqual(hp_data['contents']['skm_respondents_count']['value'], '1.580 Responden')
        self.assertEqual(hp_data['contents']['info_skm_infographic_url']['value'], '/static/uploads/piagam-skm-2026.png')

        # 7. DELETE ANNOUNCEMENT (DELETE)
        del_h = MockHandler('DELETE', f'/api/admin/announcements/{ann_id}', {'Authorization': f'Bearer {self.token}'})
        del_h.do_DELETE()
        self.assertEqual(del_h.response_code, 200)
        self.assertTrue(del_h.get_response_json()['success'])

        # Verify Deleted
        verify_h2 = MockHandler('GET', '/api/public/announcements')
        verify_h2.do_GET()
        matching2 = [a for a in verify_h2.get_response_json()['announcements'] if a['id'] == ann_id]
        self.assertEqual(len(matching2), 0)

        # 8. RESET SKM SETTINGS (CLEANUP FOR SUBSEQUENT TEST RUNS)
        skm_reset = {
            'main_score': '88.31',
            'predicate': 'Mutu Pelayanan: A (Sangat Baik)',
            'period_badge': 'TRIWULAN III',
            'respondents_count': '412',
            'infographic_url': '/static/images/hero-bg.jpg',
            'metrics': [
                {'label': '1. Persyaratan Pelayanan', 'score': 88.5},
                {'label': '2. Prosedur Pelayanan', 'score': 88.2},
                {'label': '3. Waktu Pelayanan', 'score': 87.9},
                {'label': '4. Biaya / Tarif', 'score': 88.6}
            ]
        }
        skm_reset_body = json.dumps(skm_reset).encode('utf-8')
        skm_reset_h = MockHandler('PUT', '/api/admin/skm', {'Content-Length': str(len(skm_reset_body)), 'Authorization': f'Bearer {self.token}'}, skm_reset_body)
        skm_reset_h.do_PUT()
        self.assertEqual(skm_reset_h.response_code, 200)

    def test_17_digital_services_section(self):
        """Verify the Layanan Digital section on landing page and homepage API."""
        # 1. Landing Page HTML check
        home_h = MockHandler('GET', '/')
        home_h.do_GET()
        self.assertEqual(home_h.response_code, 200)
        html_content = home_h.wfile.getvalue().decode('utf-8')

        # Check section container and anchors
        self.assertIn('id="layanan-digital"', html_content)
        self.assertIn('href="#layanan-digital"', html_content)

        # Check 4 Required Digital Services Links
        services_links = [
            'https://halojpn.kejaksaan.go.id/',
            'https://tilang.kejaksaan.go.id/home',
            'https://ppid.kejaksaan.go.id/satker/kn-klungkung',
            'https://www.lapor.go.id/'
        ]
        for link in services_links:
            self.assertIn(link, html_content, f"Missing digital service URL: {link}")

        # Check titles & badges
        self.assertIn('HaloJPN', html_content)
        self.assertIn('E-Tilang', html_content)
        self.assertIn('E-PPID KN KLUNGKUNG', html_content)
        self.assertIn('SP4N-LAPOR!', html_content)

        # 2. Homepage Data API returns digital services CMS keys
        api_h = MockHandler('GET', '/api/public/homepage-data')
        api_h.do_GET()
        self.assertEqual(api_h.response_code, 200)
        api_data = api_h.get_response_json()
        self.assertTrue(api_data['success'])
        contents = api_data['contents']

        self.assertIn('digital_services_badge', contents)
        self.assertIn('digital_services_title', contents)
        self.assertIn('digital_services_desc', contents)

        # 3. Test CMS Update for Digital Services Title & Reset
        orig_title = contents['digital_services_title']['value']
        new_title = 'Layanan Digital Terintegrasi Kejaksaan & Nasional'
        
        upd_body = json.dumps({
            'content_key': 'digital_services_title',
            'content_value': new_title
        }).encode('utf-8')
        upd_h = MockHandler('PUT', '/api/admin/page-contents', {'Content-Length': str(len(upd_body)), 'Authorization': f'Bearer {self.token}'}, upd_body)
        upd_h.do_PUT()
        self.assertEqual(upd_h.response_code, 200)

        # Verify updated
        verify_api = MockHandler('GET', '/api/public/homepage-data')
        verify_api.do_GET()
        self.assertEqual(verify_api.get_response_json()['contents']['digital_services_title']['value'], new_title)

        # Restore original title
        reset_body = json.dumps({
            'content_key': 'digital_services_title',
            'content_value': orig_title
        }).encode('utf-8')
        reset_h = MockHandler('PUT', '/api/admin/page-contents', {'Content-Length': str(len(reset_body)), 'Authorization': f'Bearer {self.token}'}, reset_body)
        reset_h.do_PUT()
        self.assertEqual(reset_h.response_code, 200)

    def test_18_mobile_responsiveness_all_pages(self):
        """Verify mobile-first responsive UI/UX components across all 12 pages."""
        public_routes = [
            '/',
            '/profil/struktur-organisasi',
            '/profil/visi-misi',
            '/profil/sejarah',
            '/profil/logo-makna',
            '/profil/tugas-wewenang',
            '/informasi/berita',
            '/informasi/pengumuman',
            '/informasi/jadwal-sidang',
            '/informasi/skm',
            '/akuntabilitas-kinerja'
        ]
        for route in public_routes:
            h = MockHandler('GET', route)
            h.do_GET()
            self.assertEqual(h.response_code, 200, f"Route {route} failed")
            html = h.wfile.getvalue().decode('utf-8')
            self.assertIn('id="mobile-nav-drawer"', html, f"Missing #mobile-nav-drawer on {route}")
            self.assertIn('id="mobile-bottom-dock"', html, f"Missing #mobile-bottom-dock on {route}")
            self.assertIn('toggleMobileMenu()', html, f"Missing toggleMobileMenu() trigger on {route}")

        # Verify Org Chart mobile zoom controls
        org_h = MockHandler('GET', '/profil/struktur-organisasi')
        org_h.do_GET()
        org_html = org_h.wfile.getvalue().decode('utf-8')
        self.assertIn('id="btn-org-zoom-fit"', org_html)
        self.assertIn('setOrgTreeZoom', org_html)

        # Verify Admin mobile off-canvas sidebar drawer
        adm_h = MockHandler('GET', '/admin')
        adm_h.do_GET()
        adm_html = adm_h.wfile.getvalue().decode('utf-8')
        self.assertIn('id="admin-sidebar"', adm_html)
        self.assertIn('id="admin-sidebar-backdrop"', adm_html)
        self.assertIn('toggleAdminMobileSidebar()', adm_html)

    def test_19_google_microsoft_authenticator_totp_mfa(self):
        """Verify Google Authenticator & Microsoft Authenticator RFC 6238 TOTP MFA, QR SVG, and Admin MFA Reset."""
        import totp_mfa

        # 1. Step 1 Login returns RFC 6238 TOTP metadata + QR SVG + otpauth://totp/ URI
        login_body = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
        login_h = MockHandler('POST', '/api/auth/login', {'Content-Length': str(len(login_body))}, login_body)
        login_h.do_POST()
        self.assertEqual(login_h.response_code, 200)
        step1 = login_h.get_response_json()

        self.assertTrue(step1.get('require_mfa'))
        self.assertEqual(step1.get('mfa_type'), 'TOTP_AUTHENTICATOR')
        self.assertIn('Google Authenticator', step1.get('supported_apps', []))
        self.assertIn('Microsoft Authenticator', step1.get('supported_apps', []))
        self.assertTrue(step1.get('otpauth_uri', '').startswith('otpauth://totp/'))
        self.assertIn('<svg', step1.get('qr_svg', ''))
        secret = step1.get('totp_secret')
        self.assertTrue(secret and len(secret) >= 12)

        # Verify TOTP code computed independently via RFC 6238 (Google / Microsoft Authenticator)
        computed_totp = totp_mfa.generate_totp(secret)
        self.assertNotIn('otp_preview', step1)
        self.assertIn(step1.get('mfa_provider'), ('GOOGLE', 'MICROSOFT'))
        self.assertEqual(step1.get('supported_apps'), ['Google Authenticator', 'Microsoft Authenticator'])

        # 2. Check /api/auth/mfa-status
        mfa_token = step1['mfa_token']
        stat_h = MockHandler('GET', f'/api/auth/mfa-status?mfa_token={mfa_token}')
        stat_h.do_GET()
        self.assertEqual(stat_h.response_code, 200)
        stat_data = stat_h.get_response_json()
        self.assertTrue(stat_data['success'])
        self.assertNotIn('otp_preview', stat_data)
        self.assertEqual(stat_data['supported_apps'], ['Google Authenticator', 'Microsoft Authenticator'])

        # 3. Verify MFA using RFC 6238 TOTP code
        ver_body = json.dumps({'mfa_token': mfa_token, 'otp_code': computed_totp}).encode('utf-8')
        ver_h = MockHandler('POST', '/api/auth/verify-mfa', {'Content-Length': str(len(ver_body))}, ver_body)
        ver_h.do_POST()
        self.assertEqual(ver_h.response_code, 200)
        self.assertTrue(ver_h.get_response_json().get('success'))

        # 4. Admin MFA Setup QR Endpoint (/api/admin/users/1/mfa-setup)
        setup_h = MockHandler('GET', '/api/admin/users/1/mfa-setup', headers={'Authorization': f'Bearer {self.token}'})
        setup_h.do_GET()
        self.assertEqual(setup_h.response_code, 200)
        setup_data = setup_h.get_response_json()
        self.assertTrue(setup_data['success'])
        self.assertIn('otpauth://totp/', setup_data['otpauth_uri'])
        self.assertIn('<svg', setup_data['qr_svg'])

    def test_20_inbox_excel_export_import_and_org_jpg(self):
        """Verify Excel (.xlsx / .csv) export & import for MASADU, SEMARA BAKTI, JAGADITA, and Org Chart JPG download UI."""
        import excel_io

        # 1. Export All Submissions as 2-Sheet Excel (.xlsx)
        exp_all = MockHandler('GET', '/api/admin/submissions/export?type=all&format=xlsx', headers={'Authorization': f'Bearer {self.token}'})
        exp_all.do_GET()
        self.assertEqual(exp_all.response_code, 200)
        xlsx_bytes = exp_all.wfile.getvalue()
        self.assertTrue(xlsx_bytes.startswith(b'PK\x03\x04'), "Expected valid ZIP/OpenXML .xlsx header")
        parsed_rows = excel_io.parse_excel_or_csv_bytes(xlsx_bytes, 'export.xlsx')
        self.assertGreaterEqual(len(parsed_rows), 1)

        # 2. Export MASADU as CSV
        exp_csv = MockHandler('GET', '/api/admin/submissions/export?type=complaints&format=csv', headers={'Authorization': f'Bearer {self.token}'})
        exp_csv.do_GET()
        self.assertEqual(exp_csv.response_code, 200)
        csv_bytes = exp_csv.wfile.getvalue()
        self.assertIn(b'No. Tiket', csv_bytes)

        # 3. Import new MASADU Complaint via Excel (.xlsx)
        masadu_xlsx = excel_io.build_xlsx_bytes([
            {
                'name': 'Aduan MASADU',
                'headers': ['No. Tiket', 'Kategori', 'Judul Laporan', 'Uraian Laporan', 'Nama Pelapor', 'No. HP / WhatsApp', 'Rahasiakan Identitas', 'Status', 'Catatan Admin'],
                'rows': [
                    ['MSD-2026-XLSX99', 'PELAYANAN PUBLIK', 'Uji Import Excel MASADU', 'Laporan hasil import file Excel .xlsx', 'I Kadek Excel', '081234567890', 'TIDAK', 'DIVERIFIKASI', 'Diterima via Import Excel']
                ]
            }
        ])
        masadu_b64 = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64.b64encode(masadu_xlsx).decode('ascii')
        imp_body = json.dumps({
            'target': 'complaints',
            'filename': 'import-masadu.xlsx',
            'file_data': masadu_b64
        }).encode('utf-8')
        imp_h = MockHandler('POST', '/api/admin/submissions/import', {'Content-Length': str(len(imp_body)), 'Authorization': f'Bearer {self.token}'}, imp_body)
        imp_h.do_POST()
        self.assertEqual(imp_h.response_code, 200)
        imp_res = imp_h.get_response_json()
        self.assertTrue(imp_res['success'])
        self.assertEqual(imp_res['count'], 1)

        # 4. Import new SEMARA BAKTI Delivery via Excel (.xlsx)
        semara_xlsx = excel_io.build_xlsx_bytes([
            {
                'name': 'Antar BB SEMARA BAKTI',
                'headers': ['No. Tiket', 'No. Perkara / Putusan', 'Nama Pemilik BB', 'No. HP / WhatsApp', 'Kecamatan Tujuan', 'Alamat Lengkap Pengantaran', 'Deskripsi Barang Bukti', 'Tanggal Pengantaran', 'Status', 'Catatan Admin'],
                'rows': [
                    ['SMB-2026-XLSX88', '99/Pid.B/2026/PN Klk', 'Ni Luh Excel', '081999888777', 'Nusa Penida', 'Desa Ped, Nusa Penida', '1 Unit Sepeda Motor Honda Scoopy', '2026-10-25', 'DIJADWALKAN', 'Siap diantar tim PB3R']
                ]
            }
        ])
        semara_b64 = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64.b64encode(semara_xlsx).decode('ascii')
        imp_sem_body = json.dumps({
            'target': 'deliveries',
            'filename': 'import-semara.xlsx',
            'file_data': semara_b64
        }).encode('utf-8')
        imp_sem_h = MockHandler('POST', '/api/admin/submissions/import', {'Content-Length': str(len(imp_sem_body)), 'Authorization': f'Bearer {self.token}'}, imp_sem_body)
        imp_sem_h.do_POST()
        self.assertEqual(imp_sem_h.response_code, 200)
        self.assertTrue(imp_sem_h.get_response_json()['success'])

        # 5. Export & Import JAGADITA via Excel (.xlsx)
        jag_exp = MockHandler('GET', '/api/admin/jagadita/export?format=xlsx', headers={'Authorization': f'Bearer {self.token}'})
        jag_exp.do_GET()
        self.assertEqual(jag_exp.response_code, 200)
        self.assertTrue(jag_exp.wfile.getvalue().startswith(b'PK\x03\x04'))

        # 6. Verify Org Chart JPG Download UI on Public Page & Admin Dashboard
        org_page = MockHandler('GET', '/profil/struktur-organisasi')
        org_page.do_GET()
        org_html = org_page.wfile.getvalue().decode('utf-8')
        self.assertIn('downloadOrgChartJpg()', org_html)
        self.assertIn('Unduh Bagan (JPG)', org_html)

        adm_page = MockHandler('GET', '/admin')
        adm_page.do_GET()
        adm_html = adm_page.wfile.getvalue().decode('utf-8')
        self.assertIn('downloadAdminOrgChartJpg()', adm_html)
        self.assertIn('exportInboxData(', adm_html)
        self.assertIn('openInboxExcelImportModal()', adm_html)

    def test_21_vercel_serverless_rewrites_and_stateless_auth(self):
        """Verify Vercel path rewrites (__vc_path), read-only DB copy permissions, and stateless auth across cold starts."""
        import stat
        import server
        import totp_mfa

        # 1. Test _copy_seed_db_writable from a read-only (0o444) source file
        ro_src = '/tmp/test_ro_seed.db'
        ro_dst = '/tmp/test_rw_target.db'
        for p in (ro_src, ro_dst):
            if os.path.exists(p):
                os.chmod(p, 0o666)
                os.remove(p)
        import shutil
        shutil.copyfile(server.DB_PATH, ro_src)
        os.chmod(ro_src, 0o444)
        server._copy_seed_db_writable(ro_src, ro_dst)
        self.assertTrue(os.access(ro_dst, os.W_OK))
        self.assertEqual(stat.S_IMODE(os.stat(ro_dst).st_mode), 0o666)
        for p in (ro_src, ro_dst):
            if os.path.exists(p):
                os.chmod(p, 0o666)
                os.remove(p)

        # 2. Test Vercel rewrite path: /api/index?__vc_path=public/homepage-data
        vc_home = MockHandler('GET', '/api/index?__vc_path=public/homepage-data')
        vc_home.do_GET()
        self.assertEqual(vc_home.response_code, 200)
        self.assertTrue(vc_home.get_response_json()['success'])

        # 3. Test Stateless Auth & MFA across cold starts (wiping SESSIONS and MFA_CHALLENGES)
        login_body = json.dumps({'username': 'admin@kejariklungkung.go.id', 'password': 'admin123'}).encode('utf-8')
        vc_login = MockHandler('POST', '/api/index?__vc_path=auth/login', {'Content-Length': str(len(login_body))}, login_body)
        vc_login.do_POST()
        self.assertEqual(vc_login.response_code, 200)
        login_res = vc_login.get_response_json()
        self.assertTrue(login_res['require_mfa'])
        mfa_token = login_res['mfa_token']
        totp_code = totp_mfa.generate_totp(login_res['totp_secret'])

        # Wipe in-memory challenges to simulate a new Vercel serverless instance
        server.MFA_CHALLENGES.clear()

        verify_body = json.dumps({'mfa_token': mfa_token, 'otp_code': totp_code}).encode('utf-8')
        vc_verify = MockHandler('POST', '/api/index?__vc_path=auth/verify-mfa', {'Content-Length': str(len(verify_body))}, verify_body)
        vc_verify.do_POST()
        self.assertEqual(vc_verify.response_code, 200)
        verify_res = vc_verify.get_response_json()
        self.assertTrue(verify_res['success'])
        stateless_token = verify_res['token']

        # Wipe in-memory sessions to simulate another Vercel serverless instance
        server.SESSIONS.clear()

        vc_admin = MockHandler('GET', '/api/index?__vc_path=admin/submissions', {'Authorization': f'Bearer {stateless_token}'})
        vc_admin.do_GET()
        self.assertEqual(vc_admin.response_code, 200)
        self.assertTrue(vc_admin.get_response_json()['success'])

    def test_22_news_modal_thumbnail_upload_and_youtube_url(self):
        """Verify 'Tambah Artikel Berita Baru' modal UI fields and backend persistence for thumbnail_url and youtube_url."""
        # 1. Verify Admin HTML modal structure & field ordering above 'Isi Berita Lengkap'
        adm_page = MockHandler('GET', '/admin')
        adm_page.do_GET()
        adm_html = adm_page.wfile.getvalue().decode('utf-8')
        self.assertIn('id="news-thumbnail-dropzone"', adm_html)
        self.assertIn('accept=".jpg,.jpeg,.png,image/jpeg,image/png"', adm_html)
        self.assertIn('id="news-thumbnail-preview-img"', adm_html)
        self.assertIn('Tautan Video YouTube (Opsional)', adm_html)
        self.assertIn('id="news-form-youtube"', adm_html)
        self.assertIn('overflow-y-auto', adm_html)

        pos_thumb = adm_html.index('id="news-thumbnail-dropzone"')
        pos_yt = adm_html.index('id="news-form-youtube"')
        pos_content = adm_html.index('id="news-form-content"')
        self.assertLess(pos_thumb, pos_content, "Thumbnail upload must be placed above 'Isi Berita Lengkap'")
        self.assertLess(pos_yt, pos_content, "YouTube URL input must be placed above 'Isi Berita Lengkap'")

        # 2. Verify POST /api/admin/news saves thumbnail_url and youtube_url
        news_payload = {
            'title': 'Uji Berita Dengan Thumbnail & Video YouTube',
            'category': 'Kegiatan Kejari',
            'badge_label': 'LIPUTAN KHUSUS',
            'layout_type': 'COMPACT_BOTTOM',
            'author': 'Tim Publikasi Kejari',
            'excerpt': 'Ringkasan berita uji coba upload gambar dan tautan YouTube.',
            'highlight_quote': 'Transparansi publikasi digital.',
            'thumbnail_url': '/static/images/news-jms.jpg',
            'youtube_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'content': 'Isi berita lengkap dengan dokumentasi video YouTube.'
        }
        body = json.dumps(news_payload).encode('utf-8')
        create_h = MockHandler('POST', '/api/admin/news', {
            'Content-Length': str(len(body)),
            'Authorization': f'Bearer {self.token}'
        }, body)
        create_h.do_POST()
        self.assertEqual(create_h.response_code, 200)
        new_id = create_h.get_response_json()['id']

        # 3. Verify GET /api/public/news/<id> returns thumbnail_url and youtube_url
        detail_h = MockHandler('GET', f'/api/public/news/{new_id}')
        detail_h.do_GET()
        self.assertEqual(detail_h.response_code, 200)
        post = detail_h.get_response_json()['post']
        self.assertEqual(post['thumbnail_url'], '/static/images/news-jms.jpg')
        self.assertEqual(post['youtube_url'], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

        # 4. Clean up test news article
        del_h = MockHandler('DELETE', f'/api/admin/news/{new_id}', {'Authorization': f'Bearer {self.token}'})
        del_h.do_DELETE()
        self.assertEqual(del_h.response_code, 200)

    def test_23_news_excel_bulk_import_and_gemini_ai_generator(self):
        """Verify Advance Features: Excel bulk import (.xlsx & .csv) and Gemini AI URL generator."""
        import excel_io
        # 1. Verify Admin Dashboard UI buttons and modals
        adm_h = MockHandler('GET', '/admin')
        adm_h.do_GET()
        adm_html = adm_h.wfile.getvalue().decode('utf-8')
        self.assertIn('Import via Excel', adm_html)
        self.assertIn('openNewsExcelImportModal()', adm_html)
        self.assertIn('id="modal-news-excel-import"', adm_html)
        self.assertIn('Generate via AI (Gemini)', adm_html)
        self.assertIn('id="admin-news-ai-url"', adm_html)
        self.assertIn('btn-admin-news-ai-generate', adm_html)
        self.assertIn('xlsx.full.min.js', adm_html)

        # 2. Verify News Excel & CSV Template Endpoints
        tpl_xlsx = MockHandler('GET', '/api/admin/news/template?format=xlsx', headers={'Authorization': f'Bearer {self.token}'})
        tpl_xlsx.do_GET()
        self.assertEqual(tpl_xlsx.response_code, 200)
        self.assertTrue(tpl_xlsx.wfile.getvalue().startswith(b'PK\x03\x04'), "Excel template must be valid OpenXML zip archive")

        tpl_csv = MockHandler('GET', '/api/admin/news/template?format=csv', headers={'Authorization': f'Bearer {self.token}'})
        tpl_csv.do_GET()
        self.assertEqual(tpl_csv.response_code, 200)
        csv_text = tpl_csv.wfile.getvalue().decode('utf-8-sig')
        self.assertIn('Judul Artikel (Wajib)', csv_text)
        self.assertIn('Kategori (Wajib)', csv_text)
        self.assertIn('Ringkasan Singkat (Wajib)', csv_text)
        self.assertIn('Isi Berita Lengkap', csv_text)

        # 3. Test Bulk Import via JSON items
        import_payload = {
            'items': [
                {
                    'title': 'Uji Berita Bulk Import Excel 1',
                    'category': 'Kegiatan Kejari',
                    'badge_label': 'IMPORT EXCEL',
                    'layout_type': 'COMPACT_BOTTOM',
                    'author': 'Redaksi Excel',
                    'excerpt': 'Ringkasan berita bulk import 1.',
                    'highlight_quote': 'Kutipan uji coba excel 1.',
                    'thumbnail_url': '/static/images/news-featured.jpg',
                    'youtube_url': '',
                    'content': 'Isi berita lengkap hasil import Excel baris 1.'
                },
                {
                    'title': 'Uji Berita Bulk Import Excel 2',
                    'category': 'Intelijen & JMS',
                    'badge_label': 'JMS KLUNGKUNG',
                    'layout_type': 'FEATURED_SIDE',
                    'author': 'Seksi Intelijen',
                    'excerpt': 'Ringkasan berita bulk import 2.',
                    'highlight_quote': 'Kutipan uji coba excel 2.',
                    'thumbnail_url': '/static/images/news-jms.jpg',
                    'youtube_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'content': 'Isi berita lengkap hasil import Excel baris 2 dengan tautan video YouTube.'
                }
            ]
        }
        imp_body = json.dumps(import_payload).encode('utf-8')
        imp_h = MockHandler('POST', '/api/admin/news/import', {
            'Content-Length': str(len(imp_body)),
            'Authorization': f'Bearer {self.token}'
        }, imp_body)
        imp_h.do_POST()
        self.assertEqual(imp_h.response_code, 200)
        imp_res = imp_h.get_response_json()
        self.assertTrue(imp_res['success'])
        self.assertEqual(imp_res['count'], 2)

        # 4. Test Bulk Import via genuine .xlsx file_data (Base64)
        xlsx_bytes = excel_io.build_xlsx_bytes([
            {
                'name': 'Berita',
                'headers': [
                    'No', 'Judul Artikel (Wajib)', 'Kategori (Wajib)', 'Teks Badge Label',
                    'Tata Letak (Layout)', 'Penulis', 'Ringkasan Singkat (Wajib)',
                    'Kutipan Highlight', 'Nama File / URL Gambar', 'Tautan Video YouTube', 'Isi Berita Lengkap'
                ],
                'rows': [
                    [
                        '1',
                        'Berita dari File Asli XLSX',
                        'Tindak Pidana Khusus',
                        'PIDSUS',
                        'FEATURED_MAIN',
                        'Penyidik Pidsus',
                        'Ringkasan berita dari file XLSX murni.',
                        'Transparansi penegakan tipikor.',
                        '/static/images/news-bb.jpg',
                        '',
                        'Isi lengkap berita yang di-parse oleh engine excel_io.'
                    ]
                ]
            }
        ])
        b64_xlsx = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64.b64encode(xlsx_bytes).decode('ascii')
        file_imp_payload = {
            'filename': 'import-berita-test.xlsx',
            'file_data': b64_xlsx
        }
        f_body = json.dumps(file_imp_payload).encode('utf-8')
        f_imp_h = MockHandler('POST', '/api/admin/news/import', {
            'Content-Length': str(len(f_body)),
            'Authorization': f'Bearer {self.token}'
        }, f_body)
        f_imp_h.do_POST()
        self.assertEqual(f_imp_h.response_code, 200)
        self.assertTrue(f_imp_h.get_response_json()['success'])

        # 5. Test Auto-Generate Berita via Gemini AI endpoint
        ai_payload = {'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
        ai_body = json.dumps(ai_payload).encode('utf-8')
        ai_h = MockHandler('POST', '/api/admin/news/ai-generate', {
            'Content-Length': str(len(ai_body)),
            'Authorization': f'Bearer {self.token}'
        }, ai_body)
        ai_h.do_POST()
        self.assertEqual(ai_h.response_code, 200)
        ai_res = ai_h.get_response_json()
        self.assertTrue(ai_res['success'])
        self.assertIn('data', ai_res)
        data = ai_res['data']
        self.assertTrue(len(data['title']) > 5, "AI generated title should be descriptive")
        self.assertTrue(len(data['excerpt']) > 10, "AI generated excerpt should be descriptive")
        self.assertTrue(len(data['content']) > 50, "AI generated content should be multiple journalistic paragraphs")
        self.assertIn('youtube.com', data['youtube_url'])

        # Clean up imported test news
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM posts WHERE title LIKE 'Uji Berita Bulk Import%' OR title = 'Berita dari File Asli XLSX'")
        conn.commit()
        conn.close()

    def test_24_semara_bakti_ba20_and_kasi_pb3r_sync(self):
        """Verify SEMARA BAKTI BA-20 (Berita Acara Pengembalian Barang Bukti) template fields, date terbilang, dynamic Kasi PB3R sync, and API endpoints."""
        from server import number_to_words_id, format_ba_date_indonesian, get_active_kasi_pb3r

        # 1. Test helper number_to_words_id & format_ba_date_indonesian
        self.assertEqual(number_to_words_id(21), 'Dua Puluh Satu')
        self.assertEqual(number_to_words_id(2026), 'Dua Ribu Dua Puluh Enam')
        day_name, date_spelled = format_ba_date_indonesian('2026-10-21')
        self.assertEqual(day_name, 'Rabu')
        self.assertEqual(date_spelled, 'Dua Puluh Satu bulan Oktober tahun Dua Ribu Dua Puluh Enam')

        # 2. Test get_active_kasi_pb3r dynamic sync from organization_members
        conn = get_db()
        kasi = get_active_kasi_pb3r(conn)
        conn.close()
        self.assertIsNotNone(kasi)
        self.assertIn('name', kasi)
        self.assertIn('I Dewa Gede Raka', kasi['name'])
        self.assertIn('PB3R', kasi['position'])

        # 3. Test public submission of SEMARA BAKTI with owner_job & defendant_name
        bb_payload = {
            'case_number': '124/Pid.B/2026/PN Semarapura',
            'defendant_name': 'I Wayan Semara',
            'owner_name': 'Ni Wayan Sari',
            'owner_job': 'Wiraswasta Kuliner',
            'id_card_number': '5105012345678901',
            'item_description': '1 Unit Sepeda Motor Yamaha NMAX DK-5566-KLK & STNK Asli',
            'delivery_address': 'Jl. Diponegoro No. 8, Semarapura Kangin',
            'district': 'Klungkung',
            'phone_number': '081234567890',
            'preferred_date': '2026-10-25'
        }
        body = json.dumps(bb_payload).encode('utf-8')
        sub_h = MockHandler('POST', '/api/public/bb-deliveries', {'Content-Length': str(len(body))}, body)
        sub_h.do_POST()
        self.assertEqual(sub_h.response_code, 200)
        sub_res = sub_h.get_response_json()
        self.assertTrue(sub_res['success'])
        ticket_code = sub_res['ticket_code']
        self.assertTrue(ticket_code.startswith('TRK-BB-'))

        # 4. Test public GET /api/public/deliveries/<ticket_code>/ba
        pub_ba_h = MockHandler('GET', f'/api/public/deliveries/{ticket_code}/ba')
        pub_ba_h.do_GET()
        self.assertEqual(pub_ba_h.response_code, 200)
        pub_ba_res = pub_ba_h.get_response_json()
        self.assertTrue(pub_ba_res['success'])
        deliv = pub_ba_res['delivery']
        self.assertEqual(deliv['ticket_code'], ticket_code)
        self.assertEqual(deliv['owner_name'], 'Ni Wayan Sari')
        self.assertEqual(deliv['owner_job'], 'Wiraswasta Kuliner')
        self.assertEqual(deliv['defendant_name'], 'I Wayan Semara')
        self.assertEqual(deliv['kasi_name'], kasi['name'])
        self.assertTrue(len(deliv['ba_day']) > 0)
        self.assertTrue(len(deliv['ba_date_spelled']) > 0)

        # 5. Test admin GET /api/admin/deliveries/<ticket_code>/ba
        adm_ba_h = MockHandler('GET', f'/api/admin/deliveries/{ticket_code}/ba', {'Authorization': f'Bearer {self.token}'})
        adm_ba_h.do_GET()
        self.assertEqual(adm_ba_h.response_code, 200)
        adm_ba_res = adm_ba_h.get_response_json()
        self.assertTrue(adm_ba_res['success'])
        self.assertIn('active_kasi_pb3r', adm_ba_res)

        # 6. Test admin POST /api/admin/deliveries/<ticket_code>/ba
        save_payload = {
            'ba_date': '2026-10-21',
            'officer_name': 'I Komang Arimbawa, S.H.',
            'officer_nip': '19940315 201701 1 022',
            'officer_rank': 'Ajun Jaksa / III-b',
            'officer_position': 'Jaksa Penuntut Umum',
            'defendant_name': 'I Wayan Semara',
            'violation_clause': 'Pasal 372 KUHP (Penggelapan)',
            'sprint_number': 'PRINT-512/N.1.12/Eoh.3/10/2026',
            'sprint_date': '21 Oktober 2026',
            'court_verdict_number': '45/Pid.B/2026/PN Srp',
            'court_verdict_date': '15 Oktober 2026',
            'item_description': '1 Unit Sepeda Motor Yamaha NMAX DK-5566-KLK & STNK Asli',
            'owner_name': 'Ni Wayan Sari',
            'owner_job': 'Pedagang',
            'delivery_address': 'Jl. Diponegoro No. 8, Semarapura Kangin',
            'kasi_name': kasi['name'],
            'kasi_nip': kasi['nip'],
            'kasi_rank': kasi['rank'],
            'witness_1': 'I Wayan Gede Sunarta, A.Md.',
            'witness_2': 'I Made Sujana, S.Kom.',
            'status': 'SELESAI',
            'ba_notes': 'Telah diserahkan langsung kepada pemilik sah.'
        }
        save_body = json.dumps(save_payload).encode('utf-8')
        save_h = MockHandler('POST', f'/api/admin/deliveries/{ticket_code}/ba', {
            'Content-Length': str(len(save_body)),
            'Authorization': f'Bearer {self.token}'
        }, save_body)
        save_h.do_POST()
        self.assertEqual(save_h.response_code, 200)
        save_res = save_h.get_response_json()
        self.assertTrue(save_res['success'])

        # 7. Verify updated delivery record in database
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bb_deliveries WHERE ticket_code = ?", (ticket_code,))
        row = dict(cursor.fetchone())
        conn.close()

        self.assertEqual(row['status'], 'SELESAI')
        self.assertEqual(row['owner_job'], 'Pedagang')
        self.assertEqual(row['violation_clause'], 'Pasal 372 KUHP (Penggelapan)')
        self.assertEqual(row['ba_day'], 'Rabu')
        self.assertEqual(row['ba_date_spelled'], 'Dua Puluh Satu bulan Oktober tahun Dua Ribu Dua Puluh Enam')
        self.assertEqual(row['officer_name'], 'I Komang Arimbawa, S.H.')

        # Clean up test delivery
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM bb_deliveries WHERE ticket_code = ?", (ticket_code,))
        conn.commit()
        conn.close()

    def test_25_floating_accessibility_widget(self):
        """Verify floating accessibility widget assets, CSS styling, Web Speech API integration, and bottom-left placement."""
        # 1. Test static serving of accessibility.css
        css_h = MockHandler('GET', '/static/css/accessibility.css')
        css_h.do_GET()
        self.assertEqual(css_h.response_code, 200)
        css_text = css_h.wfile.getvalue().decode('utf-8', errors='ignore')
        self.assertIn('.a11y-contrast-dark', css_text)
        self.assertIn('.a11y-contrast-light', css_text)
        self.assertIn('.a11y-contrast-invert', css_text)
        self.assertIn('.a11y-sat-mono', css_text)
        self.assertIn('.a11y-highlight-links', css_text)
        self.assertIn('.a11y-dyslexic', css_text)
        self.assertIn('#a11y-reading-guide-line', css_text)
        self.assertIn('#a11y-reading-mask-top', css_text)
        self.assertIn('#a11y-widget-trigger', css_text)
        self.assertIn('#a11y-restore-pill', css_text)
        self.assertIn('left: 24px', css_text)
        self.assertIn('bottom: 24px', css_text)

        # 2. Test static serving of accessibility.js
        js_h = MockHandler('GET', '/static/js/accessibility.js')
        js_h.do_GET()
        self.assertEqual(js_h.response_code, 200)
        js_text = js_h.wfile.getvalue().decode('utf-8', errors='ignore')
        self.assertIn('SpeechSynthesisUtterance', js_text)
        self.assertIn('id-ID', js_text)
        self.assertIn('speakText', js_text)
        self.assertIn('stopSpeech', js_text)
        self.assertIn('handleUserSelection', js_text)
        self.assertIn('a11y-tts-indicator', js_text)
        self.assertIn('setupDragAndDrop', js_text)
        self.assertIn('resetAll', js_text)
        self.assertIn('hideWidget', js_text)
        self.assertIn('showWidget', js_text)
        self.assertIn('toggleHideWidget', js_text)
        self.assertIn('a11y-restore-pill', js_text)
        self.assertIn('a11y-toast', js_text)
        self.assertIn('window.A11Y', js_text)

        # 3. Test HTML inclusion of accessibility in index.html
        with open(os.path.join(BASE_DIR, 'index.html'), 'r', encoding='utf-8') as f:
            index_html = f.read()
        self.assertIn('accessibility.css', index_html)
        self.assertIn('accessibility.js', index_html)

        # 4. Verify styles.css imports accessibility.css
        with open(os.path.join(BASE_DIR, 'static', 'css', 'styles.css'), 'r', encoding='utf-8') as f:
            styles_css = f.read()
        self.assertIn('@import url(\'accessibility.css\');', styles_css)

    def test_26_comprehensive_six_user_features(self):
        """Verify the 6 user requested features:
        1. Auto Translate IND/ENG toggle in header top-right.
        2. TTS silenced and hidden when 'Hilangkan' is clicked.
        3. High security headers, rate limiting, traversal & sensitive file protection.
        4. Custom 404 page with 5-second countdown auto-redirect.
        5. Pelaksana position & 330x450 photo cropper modal.
        6. Organization Excel template export & bulk import.
        """
        # Feature 1: i18n & Top-Right Language Switcher Toggle
        with open(os.path.join(BASE_DIR, 'index.html'), 'r', encoding='utf-8') as f:
            index_content = f.read()
        self.assertIn('id="lang-switch-toggle"', index_content)
        self.assertIn('setLanguage(\'id\')', index_content)
        self.assertIn('setLanguage(\'en\')', index_content)
        self.assertIn('static/js/i18n.js', index_content)

        with open(os.path.join(BASE_DIR, 'static', 'js', 'i18n.js'), 'r', encoding='utf-8') as f:
            i18n_content = f.read()
        self.assertIn('I18N_TRANSLATIONS', i18n_content)
        self.assertIn('nav_home', i18n_content)
        self.assertIn('service_semara_title', i18n_content)
        self.assertIn('service_masadu_title', i18n_content)
        self.assertIn('PHRASE_DICTIONARY', i18n_content)
        self.assertIn('translateDom', i18n_content)
        self.assertIn('translateString', i18n_content)
        self.assertIn('SUBSTRING_RULES', i18n_content)

        # Feature 2: Accessibility Silencing & TTS Reset on Hide
        with open(os.path.join(BASE_DIR, 'static', 'js', 'accessibility.js'), 'r', encoding='utf-8') as f:
            a11y_content = f.read()
        self.assertIn('stopSpeech()', a11y_content)
        self.assertIn('state.tts_active = false', a11y_content)
        self.assertIn('state.widget_hidden', a11y_content)

        # Feature 3: High Security Protections & Headers
        # 3a. Traversal attack blocked
        trav_h = MockHandler('GET', '/../../etc/passwd')
        trav_h.do_GET()
        self.assertIn(trav_h.response_code, [400, 403, 404])

        # 3b. Direct sensitive DB file blocked
        db_h = MockHandler('GET', '/data/kertagosa.db')
        db_h.do_GET()
        self.assertEqual(db_h.response_code, 403)

        # 3c. Direct backend source file blocked
        py_h = MockHandler('GET', '/server.py')
        py_h.do_GET()
        self.assertEqual(py_h.response_code, 403)

        # 3d. Rate Limiting protection on auth
        test_ip = "198.51.100.99"
        for _ in range(5):
            h_login = MockHandler('POST', '/api/auth/login', headers={'x-forwarded-for': test_ip}, body=b'{"username":"wrong","password":"bad"}')
            h_login.do_POST()
        # 6th attempt must be throttled with HTTP 429
        h_blocked = MockHandler('POST', '/api/auth/login', headers={'x-forwarded-for': test_ip}, body=b'{"username":"wrong","password":"bad"}')
        h_blocked.do_POST()
        self.assertEqual(h_blocked.response_code, 429)

        # 3e. vercel.json security headers
        with open(os.path.join(BASE_DIR, 'vercel.json'), 'r', encoding='utf-8') as f:
            v_json = json.load(f)
        self.assertIn('headers', v_json)
        hdr_keys = [h['key'] for h in v_json['headers'][0]['headers']]
        self.assertIn('X-Content-Type-Options', hdr_keys)
        self.assertIn('X-Frame-Options', hdr_keys)
        self.assertIn('Strict-Transport-Security', hdr_keys)

        # Feature 4: Custom 404 with 5s Redirect
        with open(os.path.join(BASE_DIR, '404.html'), 'r', encoding='utf-8') as f:
            html_404 = f.read()
        self.assertIn('404', html_404)
        self.assertIn('countdown-timer', html_404)
        self.assertIn('window.location.href = \'/\'', html_404)

        not_found_h = MockHandler('GET', '/halaman-random-pasti-tidak-ada-12345')
        not_found_h.do_GET()
        self.assertEqual(not_found_h.response_code, 404)
        self.assertIn(b'404', not_found_h.wfile.getvalue())

        # Feature 5: Pelaksana Positions & 330x450 Photo Cropper
        with open(os.path.join(BASE_DIR, 'admin.html'), 'r', encoding='utf-8') as f:
            admin_content = f.read()
        self.assertIn('Level 5: Pelaksana', admin_content)
        self.assertIn('id="modal-crop-photo"', admin_content)
        self.assertIn('330', admin_content)
        self.assertIn('450', admin_content)
        self.assertIn('id="modal-org-excel-import"', admin_content)

        with open(os.path.join(BASE_DIR, 'static', 'js', 'admin.js'), 'r', encoding='utf-8') as f:
            admin_js = f.read()
        self.assertIn('startPhotoCropper', admin_js)
        self.assertIn('applyCroppedPhoto', admin_js)
        self.assertIn('TARGET_WIDTH = 330', admin_js)
        self.assertIn('TARGET_HEIGHT = 450', admin_js)
        self.assertIn('setPresetPosition', admin_js)
        self.assertIn('openOrgExcelModal', admin_js)
        self.assertIn('submitOrgExcelImport', admin_js)

        # Feature 6: Org Excel Template Download & Import API
        # 6a. Template Download
        tpl_h = MockHandler('GET', '/api/admin/organization/template', headers={'Authorization': f'Bearer {self.token}'})
        tpl_h.do_GET()
        self.assertEqual(tpl_h.response_code, 200)
        self.assertEqual(tpl_h.response_headers.get('Content-Type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        tpl_bytes = tpl_h.wfile.getvalue()
        # Verify it is a valid Zip/OpenXML Excel
        self.assertEqual(tpl_bytes[:4], b'PK\x03\x04')

        # 6b. Bulk Import API
        import_body = json.dumps({
            'items': [
                {
                    'name': 'Test Pelaksana Unit',
                    'position': 'Pelaksana Tata Usaha & IT',
                    'level': 5,
                    'nip': '19991231 202401 1 001',
                    'rank': 'Pengatur Muda (II/a)',
                    'order_num': 99
                }
            ],
            'replace_all': False
        }).encode('utf-8')
        imp_h = MockHandler(
            'POST',
            '/api/admin/organization/import',
            headers={
                'Content-Type': 'application/json',
                'Content-Length': str(len(import_body)),
                'Authorization': f'Bearer {self.token}'
            },
            body=import_body
        )
        imp_h.do_POST()
        self.assertEqual(imp_h.response_code, 200)
        resp_data = imp_h.get_response_json()
        self.assertTrue(resp_data.get('success'))
        self.assertEqual(resp_data.get('imported_count'), 1)

        # Cleanup test member
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM organization_members WHERE name = 'Test Pelaksana Unit'")
        conn.commit()
        conn.close()

    def test_27_organization_drag_drop_and_custom_level_titles(self):
        """Verify Drag-and-Drop Reparenting partial update, Custom Level Titles CMS, and Adhyaksa Design System tokens."""
        # 1. Test Custom Level Titles via Admin Settings API
        custom_titles = {
            'title': 'STRUKTUR ORGANISASI RESMI',
            'level_1_title': 'LEVEL 1: UNSUR PIMPINAN UTAMA KEJARI',
            'level_2_title': 'LEVEL 2: UNSUR OPERASIONAL & PENINDAKAN',
            'level_3_title': 'LEVEL 3: UNSUR PELAKSANA SUB-BAGIAN & SUB-SEKSI',
            'level_4_title': 'LEVEL 4: KELOMPOK JABATAN FUNGSIONAL YUSTISIAL',
            'level_5_title': 'LEVEL 5: STAF PELAKSANA & OPERATOR TEKNIS'
        }
        body = json.dumps(custom_titles).encode('utf-8')
        sett_h = MockHandler(
            'POST',
            '/api/admin/organization/settings',
            {'Content-Type': 'application/json', 'Content-Length': str(len(body)), 'Authorization': f'Bearer {self.token}'},
            body
        )
        sett_h.do_POST()
        self.assertEqual(sett_h.response_code, 200)
        self.assertTrue(sett_h.get_response_json().get('success'))

        # 2. Verify that Public API returns the customized level titles in real-time
        pub_h = MockHandler('GET', '/api/public/organization')
        pub_h.do_GET()
        self.assertEqual(pub_h.response_code, 200)
        pub_data = pub_h.get_response_json()
        self.assertTrue(pub_data['success'])
        settings = pub_data.get('settings', {})
        self.assertEqual(settings.get('level_1_title'), 'LEVEL 1: UNSUR PIMPINAN UTAMA KEJARI')
        self.assertEqual(settings.get('level_2_title'), 'LEVEL 2: UNSUR OPERASIONAL & PENINDAKAN')
        self.assertEqual(settings.get('level_3_title'), 'LEVEL 3: UNSUR PELAKSANA SUB-BAGIAN & SUB-SEKSI')
        self.assertEqual(settings.get('level_4_title'), 'LEVEL 4: KELOMPOK JABATAN FUNGSIONAL YUSTISIAL')
        self.assertEqual(settings.get('level_5_title'), 'LEVEL 5: STAF PELAKSANA & OPERATOR TEKNIS')

        # 3. Test Drag-and-Drop Reparenting (Partial PUT without name/position)
        # 3a. Create test member
        create_payload = json.dumps({
            'name': 'Bawahan Uji Drag Drop',
            'position': 'Staf Khusus Operasional',
            'level': 4,
            'parent_id': 1
        }).encode('utf-8')
        c_h = MockHandler('POST', '/api/admin/organization/members', {'Content-Type': 'application/json', 'Content-Length': str(len(create_payload)), 'Authorization': f'Bearer {self.token}'}, create_payload)
        c_h.do_POST()
        self.assertEqual(c_h.response_code, 200)
        new_id = c_h.get_response_json()['id']

        # 3b. Drag & drop to Level 2 unit (e.g. parent_id = 3, level = 3) via partial update
        drag_drop_payload = json.dumps({
            'parent_id': 3,
            'level': 3
        }).encode('utf-8')
        dd_h = MockHandler('PUT', f'/api/admin/organization/members/{new_id}', {'Content-Type': 'application/json', 'Content-Length': str(len(drag_drop_payload)), 'Authorization': f'Bearer {self.token}'}, drag_drop_payload)
        dd_h.do_PUT()
        self.assertEqual(dd_h.response_code, 200)
        self.assertTrue(dd_h.get_response_json().get('success'))

        # Verify DB updated parent_id and level while preserving name and position
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name, position, parent_id, level FROM organization_members WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row['name'], 'Bawahan Uji Drag Drop')
        self.assertEqual(row['position'], 'Staf Khusus Operasional')
        self.assertEqual(row['parent_id'], 3)
        self.assertEqual(row['level'], 3)

        # Cleanup test member and restore default settings
        cursor.execute("DELETE FROM organization_members WHERE id = ?", (new_id,))
        cursor.execute("UPDATE page_contents SET content_value='STRUKTUR ORGANISASI' WHERE section_name='organization' AND content_key='org_title'")
        cursor.execute("UPDATE page_contents SET content_value='LEVEL 1: UNSUR PIMPINAN (KEPALA KEJAKSAAN NEGERI)' WHERE section_name='organization' AND content_key='org_level_1_title'")
        cursor.execute("UPDATE page_contents SET content_value='LEVEL 2: UNSUR PEMBANTU PIMPINAN & OPERASIONAL (KASUBBAG / KASI)' WHERE section_name='organization' AND content_key='org_level_2_title'")
        cursor.execute("UPDATE page_contents SET content_value='LEVEL 3: UNSUR PELAKSANA SUB-BAGIAN / SUB-SEKSI / URUSAN' WHERE section_name='organization' AND content_key='org_level_3_title'")
        cursor.execute("UPDATE page_contents SET content_value='LEVEL 4: KELOMPOK JABATAN FUNGSIONAL & AHLI YUSTISIAL' WHERE section_name='organization' AND content_key='org_level_4_title'")
        cursor.execute("UPDATE page_contents SET content_value='LEVEL 5: PELAKSANA & STAF TEKNIS ADMINISTRASI' WHERE section_name='organization' AND content_key='org_level_5_title'")
        conn.commit()
        conn.close()

        # 4. Verify Static Assets (CSS and JS tokens for Adhyaksa Design System & Drag-and-Drop)
        with open('static/css/styles.css', 'r', encoding='utf-8') as f:
            css_content = f.read()
        self.assertIn('--color-adhyaksa-navy-900', css_content)
        self.assertIn('.adhyaksa-badge', css_content)
        self.assertIn('.adhyaksa-card', css_content)
        self.assertIn('.org-node-draggable', css_content)
        self.assertIn('.org-drop-target-active', css_content)

        with open('static/js/admin.js', 'r', encoding='utf-8') as f:
            admin_js = f.read()
        self.assertIn('renderAdminInteractiveTree', admin_js)
        self.assertIn('handleAdminDrop', admin_js)
        self.assertIn('setStandardLevelTitles', admin_js)

        with open('profil-struktur-organisasi.html', 'r', encoding='utf-8') as f:
            org_html = f.read()
        self.assertIn('heading-level-4', org_html)
        self.assertIn('heading-level-5', org_html)
        self.assertIn('handlePublicDrop', org_html)

    def test_28_mobile_floating_widgets_and_edit_mode(self):
        """Verify non-blocking mobile floating accessibility widget and collapsible mobile edit bar."""
        # 1. Verify CSS styles for non-blocking mobile widgets
        with open(os.path.join(BASE_DIR, 'static', 'css', 'styles.css'), 'r', encoding='utf-8') as f:
            css = f.read()
        self.assertIn('z-index: 100010 !important', css)
        self.assertIn('padding-bottom: 96px !important', css)
        self.assertIn('#admin-floating-bar.is-expanded', css)

        # 2. Verify accessibility CSS on mobile
        with open(os.path.join(BASE_DIR, 'static', 'css', 'accessibility.css'), 'r', encoding='utf-8') as f:
            a11y_css = f.read()
        self.assertIn('bottom: 74px', a11y_css)
        self.assertIn('max-width: 440px', a11y_css)

        # 3. Verify JavaScript collapsible admin bar
        with open(os.path.join(BASE_DIR, 'static', 'js', 'app.js'), 'r', encoding='utf-8') as f:
            app_js = f.read()
        self.assertIn('toggleAdminBarMobileExpanded', app_js)
        self.assertIn('adminBarMobileExpanded', app_js)
        self.assertIn('COLLAPSED COMPACT PILL ON MOBILE', app_js)

        # 4. Verify accessibility mobile repositioning and backdrop
        with open(os.path.join(BASE_DIR, 'static', 'js', 'accessibility.js'), 'r', encoding='utf-8') as f:
            a11y_js = f.read()
        self.assertIn('window.innerWidth < 768', a11y_js)
        self.assertIn('a11y-backdrop', a11y_js)

        # 5. Functional check for public submissions and ticket tracking
        complaint_body = json.dumps({
            'title': 'Uji Sistem Terpadu',
            'category': 'Pelayanan Publik Kejari',
            'chronology': 'Pengecekan otomatis fitur MASADU berjalan normal.',
            'is_anonymous': False,
            'reporter_name': 'Warga Klungkung',
            'reporter_phone': '081138004444'
        }).encode('utf-8')
        h_comp = MockHandler('POST', '/api/public/complaints', headers={'Content-Type': 'application/json', 'Content-Length': str(len(complaint_body))}, body=complaint_body)
        h_comp.do_POST()
        self.assertEqual(h_comp.response_code, 200)
        c_res = h_comp.get_response_json()
        self.assertTrue(c_res.get('success'))
        ticket_code = c_res.get('ticket_code')
        self.assertTrue(ticket_code.startswith('TRK-MASADU-'))

        # Track complaint ticket
        h_track = MockHandler('GET', f'/api/public/ticket/{ticket_code}')
        h_track.do_GET()
        self.assertEqual(h_track.response_code, 200)
        t_res = h_track.get_response_json()
        self.assertTrue(t_res.get('success'))
        self.assertEqual(t_res.get('ticket', {}).get('ticket_code'), ticket_code)

    def test_29_organization_member_photo_upload_and_display_fallbacks(self):
        """Verify organization member photo upload endpoint, serving, and onerror fallbacks."""
        import base64
        # 1. Test uploading a member photo (1x1 PNG or sample photo base64)
        sample_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        upload_payload = json.dumps({
            'filename': 'pasfoto_pegawai_330x450.png',
            'data': sample_png_b64
        }).encode('utf-8')
        h_upload = MockHandler('POST', '/api/admin/upload-media', headers={
            'Content-Type': 'application/json',
            'Content-Length': str(len(upload_payload)),
            'Authorization': f'Bearer {self.token}'
        }, body=upload_payload)
        h_upload.do_POST()
        self.assertEqual(h_upload.response_code, 200)
        up_res = h_upload.get_response_json()
        self.assertTrue(up_res.get('success'))
        photo_url = up_res.get('url')
        self.assertTrue(photo_url.startswith('/static/uploads/'))

        # 2. Verify uploaded photo is accessible via HTTP GET
        h_file = MockHandler('GET', photo_url)
        h_file.do_GET()
        self.assertEqual(h_file.response_code, 200)
        self.assertIn('image', h_file.response_headers.get('Content-Type', ''))

        # 3. Update Member 2 (Kasubbag Pembinaan) with the new uploaded photo_url
        member_update_payload = json.dumps({
            'photo_url': photo_url
        }).encode('utf-8')
        h_mem_upd = MockHandler('PUT', '/api/admin/organization/members/2', headers={
            'Content-Type': 'application/json',
            'Content-Length': str(len(member_update_payload)),
            'Authorization': f'Bearer {self.token}'
        }, body=member_update_payload)
        h_mem_upd.do_PUT()
        self.assertEqual(h_mem_upd.response_code, 200)

        # 4. Fetch public organization hierarchy and verify photo_url is updated
        h_org = MockHandler('GET', '/api/public/organization')
        h_org.do_GET()
        self.assertEqual(h_org.response_code, 200)
        org_data = h_org.get_response_json()
        self.assertTrue(org_data.get('success'))
        mem2 = next(m for m in org_data['members'] if m['id'] == 2)
        self.assertEqual(mem2['photo_url'], photo_url)

        # 5. Verify onerror fallback and cropper modal layering in HTML & JS files
        with open(os.path.join(BASE_DIR, 'profil-struktur-organisasi.html'), 'r', encoding='utf-8') as f:
            profil_html = f.read()
        self.assertIn('onerror="this.onerror=null; this.src=\'/static/images/avatar-officer-male.svg\';"', profil_html)
        self.assertIn('loadOrgCanvasImage', profil_html)

        with open(os.path.join(BASE_DIR, 'admin.html'), 'r', encoding='utf-8') as f:
            adm_html = f.read()
        self.assertIn('id="modal-crop-photo"', adm_html)
        self.assertIn('style="z-index: 100030 !important;"', adm_html)
        self.assertIn('id="input-direct-file-member"', adm_html)

        with open(os.path.join(BASE_DIR, 'static', 'js', 'admin.js'), 'r', encoding='utf-8') as f:
            adm_js = f.read()
        self.assertIn('onerror="this.onerror=null; this.src=\'/static/images/avatar-officer-male.svg\';"', adm_js)
        self.assertIn('resizeImageIfLarge', adm_js)

    def test_30_admin_functions_enhanced(self):
        """Verify enhanced admin dashboard functions: Hero Kajari photo upload & preset,
        table live search & filters for News & Jagadita, dynamic organization level count spans,
        and submission status update with toast feedback."""
        # 1. Update kajari_photo_url via batch page-contents API
        new_kajari_photo = '/static/images/kajari-portrait-updated.jpg'
        batch_payload = json.dumps({
            'items': {
                'kajari_photo_url': new_kajari_photo
            }
        }).encode('utf-8')
        h_batch = MockHandler('POST', '/api/admin/page-contents/batch', headers={
            'Content-Type': 'application/json',
            'Content-Length': str(len(batch_payload)),
            'Authorization': f'Bearer {self.token}'
        }, body=batch_payload)
        h_batch.do_POST()
        self.assertEqual(h_batch.response_code, 200)
        res_batch = h_batch.get_response_json()
        self.assertTrue(res_batch.get('success'))

        # Verify through public homepage-data API
        h_home = MockHandler('GET', '/api/public/homepage-data')
        h_home.do_GET()
        self.assertEqual(h_home.response_code, 200)
        home_data = h_home.get_response_json()
        self.assertTrue(home_data.get('success'))
        self.assertEqual(home_data.get('contents', {}).get('kajari_photo_url', {}).get('value'), new_kajari_photo)

        # 2. Reset kajari_photo_url back to default
        default_kajari_photo = '/static/images/kajari-portrait.jpg'
        batch_reset_payload = json.dumps({
            'items': {
                'kajari_photo_url': default_kajari_photo
            }
        }).encode('utf-8')
        h_reset = MockHandler('POST', '/api/admin/page-contents/batch', headers={
            'Content-Type': 'application/json',
            'Content-Length': str(len(batch_reset_payload)),
            'Authorization': f'Bearer {self.token}'
        }, body=batch_reset_payload)
        h_reset.do_POST()
        self.assertEqual(h_reset.response_code, 200)

        # 3. Check admin.html for new elements
        with open(os.path.join(BASE_DIR, 'admin.html'), 'r', encoding='utf-8') as f:
            admin_html = f.read()

        # Hero Kajari photo upload & preview elements
        self.assertIn('id="preview-hero-kajari-photo"', admin_html)
        self.assertIn('id="hero-kajari-photo-url-input"', admin_html)
        self.assertIn('id="input-hero-kajari-file"', admin_html)
        self.assertIn('uploadHeroKajariPhoto(event)', admin_html)
        self.assertIn('setPresetHeroKajariPhoto', admin_html)

        # News & Jagadita search and filters
        self.assertIn('id="admin-news-search"', admin_html)
        self.assertIn('id="admin-news-category-filter"', admin_html)
        self.assertIn('id="admin-jagadita-search"', admin_html)
        self.assertIn('id="admin-jagadita-type-filter"', admin_html)

        # Dynamic organization count badge spans
        self.assertIn('id="count-level-1"', admin_html)
        self.assertIn('id="count-level-2"', admin_html)
        self.assertIn('id="count-level-3"', admin_html)
        self.assertIn('id="count-level-4"', admin_html)
        self.assertIn('id="count-level-5"', admin_html)

        # 4. Check static/js/admin.js for helper functions and enhancements
        with open(os.path.join(BASE_DIR, 'static', 'js', 'admin.js'), 'r', encoding='utf-8') as f:
            admin_js = f.read()

        self.assertIn('uploadHeroKajariPhoto', admin_js)
        self.assertIn('setPresetHeroKajariPhoto', admin_js)
        self.assertIn('filterAdminNewsTable', admin_js)
        self.assertIn('filterAdminJagaditaTable', admin_js)
        self.assertIn('updateOverviewStats()', admin_js)
        self.assertIn('showAdminToast', admin_js)


if __name__ == '__main__':
    unittest.main()
