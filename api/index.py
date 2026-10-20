"""
KERTAGOSA - Vercel Serverless Function Handler
Entrypoint for @vercel/python runtime.
Zero external dependencies required.
"""
import os
import sys
from http.server import BaseHTTPRequestHandler

# Ensure root directory is in sys.path so modules like server, totp_mfa, and excel_io are importable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Ensure VERCEL environment flag is set
os.environ.setdefault('VERCEL', '1')

# Import KertagosaHandler and database initializer from server
from server import KertagosaHandler, init_db_schema, ensure_database_ready

# Initialize SQLite database schema on cold start
try:
    ensure_database_ready()
    init_db_schema()
except Exception as e:
    print(f"[Vercel Cold Start] Note during DB schema init: {e}")


class handler(KertagosaHandler, BaseHTTPRequestHandler):
    """
    Serverless Request Handler for Vercel (@vercel/python).
    Inherits all route handlers (do_GET, do_POST, do_PUT, do_DELETE, do_OPTIONS)
    from KertagosaHandler and BaseHTTPRequestHandler.
    """

    def do_OPTIONS(self):
        super().do_OPTIONS()

    def do_GET(self):
        self._normalize_request_path()
        super().do_GET()

    def do_POST(self):
        self._normalize_request_path()
        super().do_POST()

    def do_PUT(self):
        self._normalize_request_path()
        super().do_PUT()

    def do_DELETE(self):
        self._normalize_request_path()
        super().do_DELETE()
