#!/usr/bin/env python3
"""
RFC 6238 TOTP (Google Authenticator & Microsoft Authenticator) +
Pure-Python ISO/IEC 18004 QR Code SVG Generator.
Zero external dependencies (100% Python Standard Library).
"""
import base64
import hashlib
import hmac
import os
import struct
import time
import urllib.parse

BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"


def generate_base32_secret(length: int = 16) -> str:
    """Generate a cryptographically random Base32 secret compatible with Google & Microsoft Authenticator."""
    random_bytes = os.urandom(length)
    return "".join(BASE32_ALPHABET[b & 31] for b in random_bytes)


def deterministic_secret_for_user(username: str, email: str = "") -> str:
    """Generate a consistent default Base32 secret for seeded accounts."""
    seed = f"KERTAGOSA_TOTP_2026_{username}_{email}".encode("utf-8")
    digest = hashlib.sha256(seed).digest()
    return base64.b32encode(digest[:10]).decode("utf-8").rstrip("=")


def format_secret_display(secret: str) -> str:
    """Format Base32 secret into 4-character blocks for easy manual entry in Authenticator apps."""
    clean = "".join(c for c in (secret or "").upper() if c in BASE32_ALPHABET)
    return " ".join(clean[i:i + 4] for i in range(0, len(clean), 4))


def decode_base32_secret(secret: str) -> bytes:
    """Decode a Base32 secret string into raw bytes, handling missing padding and spaces."""
    clean = "".join(c for c in (secret or "").upper() if c in BASE32_ALPHABET)
    if not clean:
        clean = "JBSWY3DPEHPK3PXP"
    padding = (8 - (len(clean) % 8)) % 8
    clean_padded = clean + ("=" * padding)
    return base64.b32decode(clean_padded, casefold=True)


def generate_totp(secret: str, timestamp: float = None, period: int = 30, digits: int = 6) -> str:
    """
    Generate a 6-digit RFC 6238 TOTP code (SHA-1, 30s period)
    identical to Google Authenticator and Microsoft Authenticator.
    """
    if timestamp is None:
        timestamp = time.time()
    counter = int(timestamp // period)
    key = decode_base32_secret(secret)
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    binary = (
        ((digest[offset] & 0x7F) << 24)
        | ((digest[offset + 1] & 0xFF) << 16)
        | ((digest[offset + 2] & 0xFF) << 8)
        | (digest[offset + 3] & 0xFF)
    )
    otp = binary % (10 ** digits)
    return str(otp).zfill(digits)


def verify_totp(secret: str, code: str, timestamp: float = None, period: int = 30, window: int = 1) -> bool:
    """
    Verify a 6-digit TOTP code from Google Authenticator or Microsoft Authenticator.
    Allows +/- `window` time steps (default +/- 30s) to handle slight phone/server clock skew.
    """
    clean_code = "".join(c for c in str(code or "") if c.isdigit())
    if len(clean_code) != 6:
        return False
    if timestamp is None:
        timestamp = time.time()
    for offset in range(-window, window + 1):
        check_time = timestamp + (offset * period)
        expected = generate_totp(secret, timestamp=check_time, period=period, digits=6)
        if hmac.compare_digest(clean_code, expected):
            return True
    return False


def get_totp_remaining_seconds(period: int = 30, timestamp: float = None) -> int:
    """Return how many seconds remain in the current 30-second TOTP window."""
    if timestamp is None:
        timestamp = time.time()
    return period - (int(timestamp) % period)


def build_otpauth_uri(secret: str, account_name: str, issuer: str = "KERTAGOSA Kejari Klungkung") -> str:
    """
    Build standard Key Uri Format:
    otpauth://totp/Issuer:AccountName?secret=SECRET&issuer=Issuer&algorithm=SHA1&digits=6&period=30
    Supported universally by Google Authenticator & Microsoft Authenticator.
    """
    clean_secret = "".join(c for c in (secret or "").upper() if c in BASE32_ALPHABET)
    clean_account = (account_name or "admin@kejariklungkung.go.id").strip()
    label = f"{issuer}:{clean_account}"
    encoded_label = urllib.parse.quote(label, safe=":@")
    params = urllib.parse.urlencode({
        "secret": clean_secret,
        "issuer": issuer,
        "algorithm": "SHA1",
        "digits": "6",
        "period": "30"
    })
    return f"otpauth://totp/{encoded_label}?{params}"


# ============================================================================
# PURE-PYTHON ISO/IEC 18004 QR CODE SVG GENERATOR (LEVEL L, VERSIONS 1..10)
# ============================================================================

# Version table for ECC Level L:
# version: (total_data_codewords, ec_codewords_per_block, num_blocks_group1, data_cw_group1, num_blocks_group2, data_cw_group2, alignment_coords)
QR_VERSION_L_SPECS = {
    1:  (19,   7,  1, 19,  0, 0,  []),
    2:  (34,  10,  1, 34,  0, 0,  [6, 18]),
    3:  (55,  15,  1, 55,  0, 0,  [6, 22]),
    4:  (80,  20,  1, 80,  0, 0,  [6, 26]),
    5:  (108, 26,  1, 108, 0, 0,  [6, 30]),
    6:  (136, 18,  2, 68,  0, 0,  [6, 34]),
    7:  (156, 20,  2, 78,  0, 0,  [6, 22, 38]),
    8:  (194, 24,  2, 97,  0, 0,  [6, 24, 42]),
    9:  (232, 30,  2, 116, 0, 0,  [6, 26, 46]),
    10: (274, 18,  2, 68,  2, 69, [6, 28, 50]),
}

QR_VERSION_INFO_BITS = {
    7:  0x07C94,
    8:  0x085BC,
    9:  0x09A99,
    10: 0x0A4D3,
}

# Precompute GF(256) log/exp tables with primitive polynomial 0x11D
GF_EXP = [0] * 512
GF_LOG = [0] * 256
_x = 1
for _i in range(255):
    GF_EXP[_i] = _x
    GF_LOG[_x] = _i
    _x <<= 1
    if _x & 0x100:
        _x ^= 0x11D
for _i in range(255, 512):
    GF_EXP[_i] = GF_EXP[_i - 255]


def _gf_mul(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    return GF_EXP[GF_LOG[a] + GF_LOG[b]]


def _rs_generator_poly(degree: int) -> list:
    poly = [1]
    for i in range(degree):
        next_poly = [0] * (len(poly) + 1)
        factor = GF_EXP[i]
        for j, coeff in enumerate(poly):
            next_poly[j] ^= coeff
            next_poly[j + 1] ^= _gf_mul(coeff, factor)
        poly = next_poly
    return poly


def _rs_encode(data_bytes: list, ec_len: int) -> list:
    gen = _rs_generator_poly(ec_len)
    res = list(data_bytes) + [0] * ec_len
    for i in range(len(data_bytes)):
        coeff = res[i]
        if coeff != 0:
            for j in range(1, len(gen)):
                res[i + j] ^= _gf_mul(gen[j], coeff)
    return res[len(data_bytes):]


def _choose_qr_version(byte_len: int) -> int:
    for ver in range(1, 11):
        total_cw = QR_VERSION_L_SPECS[ver][0]
        # Byte mode overhead: 4 bits mode + (8 or 16 bits length) => 2 or 3 bytes
        len_bits = 8 if ver <= 9 else 16
        capacity = ((total_cw * 8) - 4 - len_bits) // 8
        if byte_len <= capacity:
            return ver
    raise ValueError("Data too long for QR Version 1-10")


def _encode_data_codewords(payload: bytes, version: int) -> list:
    total_cw = QR_VERSION_L_SPECS[version][0]
    bits = []

    def append_bits(val: int, count: int):
        for i in range(count - 1, -1, -1):
            bits.append((val >> i) & 1)

    # Mode indicator: Byte mode = 0100 (4)
    append_bits(0b0100, 4)
    # Character count indicator: 8 bits for v1-9, 16 bits for v10
    append_bits(len(payload), 8 if version <= 9 else 16)
    for b in payload:
        append_bits(b, 8)

    # Terminator: up to 4 zero bits
    max_bits = total_cw * 8
    term_len = min(4, max_bits - len(bits))
    append_bits(0, term_len)

    # Pad to byte boundary
    while len(bits) % 8 != 0:
        bits.append(0)

    # Convert to bytes
    codewords = []
    for i in range(0, len(bits), 8):
        byte_val = 0
        for b in bits[i:i + 8]:
            byte_val = (byte_val << 1) | b
        codewords.append(byte_val)

    # Pad with alternating 0xEC, 0x11
    pad_bytes = [0xEC, 0x11]
    pad_idx = 0
    while len(codewords) < total_cw:
        codewords.append(pad_bytes[pad_idx % 2])
        pad_idx += 1

    return codewords


def _interleave_blocks(data_cw: list, version: int) -> list:
    _, ec_len, nb1, dc1, nb2, dc2, _ = QR_VERSION_L_SPECS[version]
    blocks_data = []
    blocks_ec = []
    idx = 0
    for _ in range(nb1):
        blk = data_cw[idx:idx + dc1]
        idx += dc1
        blocks_data.append(blk)
        blocks_ec.append(_rs_encode(blk, ec_len))
    for _ in range(nb2):
        blk = data_cw[idx:idx + dc2]
        idx += dc2
        blocks_data.append(blk)
        blocks_ec.append(_rs_encode(blk, ec_len))

    result = []
    max_dc = max(dc1, dc2)
    for i in range(max_dc):
        for blk in blocks_data:
            if i < len(blk):
                result.append(blk[i])
    for i in range(ec_len):
        for ec in blocks_ec:
            result.append(ec[i])
    return result


def build_qr_matrix(text: str) -> list:
    """Build a 2D boolean matrix (True = dark module, False = light module) for `text`."""
    payload = text.encode("utf-8")
    version = _choose_qr_version(len(payload))
    size = version * 4 + 17

    matrix = [[False] * size for _ in range(size)]
    is_function = [[False] * size for _ in range(size)]

    def set_func(r: int, c: int, val: bool):
        if 0 <= r < size and 0 <= c < size:
            matrix[r][c] = val
            is_function[r][c] = True

    # 1. Finder patterns + separators
    def place_finder(top: int, left: int):
        for dr in range(-1, 8):
            for dc in range(-1, 8):
                r, c = top + dr, left + dc
                if 0 <= r < size and 0 <= c < size:
                    if 0 <= dr <= 6 and 0 <= dc <= 6:
                        is_dark = (
                            dr in (0, 6)
                            or dc in (0, 6)
                            or (2 <= dr <= 4 and 2 <= dc <= 4)
                        )
                        set_func(r, c, is_dark)
                    else:
                        set_func(r, c, False)

    place_finder(0, 0)
    place_finder(0, size - 7)
    place_finder(size - 7, 0)

    # 2. Timing patterns
    for i in range(8, size - 8):
        set_func(6, i, i % 2 == 0)
        set_func(i, 6, i % 2 == 0)

    # 3. Alignment patterns
    align_coords = QR_VERSION_L_SPECS[version][6]
    for ar in align_coords:
        for ac in align_coords:
            if (ar == 6 and ac == 6) or (ar == 6 and ac == size - 7) or (ar == size - 7 and ac == 6):
                continue
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    dist = max(abs(dr), abs(dc))
                    set_func(ar + dr, ac + dc, dist in (0, 2))

    # 4. Reserve format information areas & dark module
    for i in range(9):
        if not is_function[8][i]:
            set_func(8, i, False)
        if not is_function[i][8]:
            set_func(i, 8, False)
    for i in range(8):
        if not is_function[8][size - 1 - i]:
            set_func(8, size - 1 - i, False)
        if not is_function[size - 1 - i][8]:
            set_func(size - 1 - i, 8, False)
    # Dark module
    set_func(size - 8, 8, True)

    # 5. Version information (for version >= 7)
    if version >= 7:
        vbits = QR_VERSION_INFO_BITS[version]
        for i in range(18):
            bit = ((vbits >> i) & 1) == 1
            r = i // 3
            c = size - 11 + (i % 3)
            set_func(r, c, bit)
            set_func(c, r, bit)

    # 6. Encode & place data bits
    data_cw = _encode_data_codewords(payload, version)
    full_cw = _interleave_blocks(data_cw, version)
    all_bits = []
    for cw in full_cw:
        for i in range(7, -1, -1):
            all_bits.append((cw >> i) & 1)

    bit_idx = 0
    upward = True
    col = size - 1
    while col > 0:
        if col == 6:
            col -= 1
        row_iter = range(size - 1, -1, -1) if upward else range(size)
        for r in row_iter:
            for dc in (0, 1):
                c = col - dc
                if not is_function[r][c]:
                    bit_val = (all_bits[bit_idx] == 1) if bit_idx < len(all_bits) else False
                    bit_idx += 1
                    # Apply Mask 0: (r + c) % 2 == 0
                    if (r + c) % 2 == 0:
                        bit_val = not bit_val
                    matrix[r][c] = bit_val
        upward = not upward
        col -= 2

    # 7. Place Format Information for Level L (01) and Mask 0 (000)
    # Data bits = 01_000 = 0b01000. Precomputed BCH + XOR 0x5412 = 0x77C4 (30660)
    format_bits = 0x77C4
    # Around top-left
    coords_tl = [
        (8, 0), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 7), (8, 8),
        (7, 8), (5, 8), (4, 8), (3, 8), (2, 8), (1, 8), (0, 8)
    ]
    for i, (r, c) in enumerate(coords_tl):
        matrix[r][c] = ((format_bits >> (14 - i)) & 1) == 1

    # Around bottom-left (bits 14..8) and top-right (bits 7..0)
    for i in range(7):
        matrix[size - 1 - i][8] = ((format_bits >> (14 - i)) & 1) == 1
    for i in range(8):
        matrix[8][size - 8 + i] = ((format_bits >> (7 - i)) & 1) == 1

    return matrix


def generate_qr_svg(text: str, border: int = 2, dark_color: str = "#072A19", light_color: str = "#FFFFFF") -> str:
    """Render an ISO/IEC 18004 QR Code as a compact, crisp SVG string."""
    matrix = build_qr_matrix(text)
    size = len(matrix)
    total = size + border * 2
    rects = []
    for r in range(size):
        for c in range(size):
            if matrix[r][c]:
                rects.append(f"M{c + border},{r + border}h1v1h-1z")
    path_d = "".join(rects)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total} {total}" '
        f'shape-rendering="crispEdges" class="w-full h-full">'
        f'<rect width="{total}" height="{total}" fill="{light_color}"/>'
        f'<path d="{path_d}" fill="{dark_color}"/>'
        f'</svg>'
    )
