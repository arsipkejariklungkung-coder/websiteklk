"""
KERTAGOSA - Vercel Serverless Function Handler
Entrypoint for @vercel/python runtime.
Zero external dependencies required.
"""
import os
import sys

# Ensure root directory is in sys.path so modules like server, totp_mfa, and excel_io are importable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Ensure VERCEL environment flag is set
os.environ.setdefault('VERCEL', '1')

# Import KertagosaHandler and database initializer from server
from server import KertagosaHandler, init_db_schema

# Initialize SQLite database schema on cold start
try:
    init_db_schema()
except Exception as e:
    print(f"[Vercel Cold Start] Note during DB schema init: {e}")

# Vercel's @vercel/python runtime inspects for a class named `handler`
# that inherits from BaseHTTPRequestHandler.
class handler(KertagosaHandler):
    """
    Serverless Request Handler for Vercel.
    Inherits all route handlers (do_GET, do_POST, do_PUT, do_DELETE, do_OPTIONS)
    from KertagosaHandler.
    """
    pass
