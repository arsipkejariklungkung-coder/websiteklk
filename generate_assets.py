#!/usr/bin/env python3
"""
Generate high-fidelity vector & SVG graphics for KERTAGOSA portal.
Includes:
- Official Kejaksaan RI Logo SVG
- High-res Kajari Portrait SVG / Composite
- News thumbnails
- Map of Klungkung SVG
"""
import os

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static', 'images')
os.makedirs(STATIC_DIR, exist_ok=True)

# 1. Official Kejaksaan RI Logo SVG
LOGO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100%" height="100%">
  <defs>
    <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="70%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#B45309"/>
    </radialGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F4229"/>
      <stop offset="50%" stop-color="#08301D"/>
      <stop offset="100%" stop-color="#03180D"/>
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#CA8A04" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Outer Ring with Gold Border -->
  <circle cx="120" cy="120" r="114" fill="#0B3B24" stroke="url(#goldGrad)" stroke-width="6"/>
  <circle cx="120" cy="120" r="106" fill="none" stroke="#CA8A04" stroke-width="1.5" stroke-dasharray="3,3"/>
  
  <!-- Text Ring Arc path -->
  <path id="topTextArc" d="M 30,120 A 90,90 0 0,1 210,120" fill="none"/>
  <path id="bottomTextArc" d="M 210,120 A 90,90 0 0,1 30,120" fill="none"/>

  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11.5" font-weight="800" fill="#FEF08A" letter-spacing="2.5">
    <textPath href="#topTextArc" startOffset="50%" text-anchor="middle">
      KEJAKSAAN REPUBLIK INDONESIA
    </textPath>
  </text>
  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="700" fill="#FDE047" letter-spacing="3.5">
    <textPath href="#bottomTextArc" startOffset="50%" text-anchor="middle">
      SATYA ADHI WICAKSANA
    </textPath>
  </text>

  <!-- Inner Circle Shield -->
  <circle cx="120" cy="120" r="74" fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="3.5" filter="url(#goldGlow)"/>

  <!-- Star of Justice (Bintang 8) -->
  <g transform="translate(120, 68)">
    <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="url(#goldGrad)"/>
    <circle cx="0" cy="0" r="3.5" fill="#FFFBEB"/>
  </g>

  <!-- Paddy & Cotton Wreath (Padi & Kapas) -->
  <path d="M 75,130 C 70,105 85,85 105,78" fill="none" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
  <path d="M 165,130 C 170,105 155,85 135,78" fill="none" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
  <!-- Leaves / Grains -->
  <g fill="#EAB308">
    <circle cx="82" cy="115" r="3.5"/>
    <circle cx="78" cy="100" r="3.5"/>
    <circle cx="82" cy="88" r="3"/>
    <circle cx="92" cy="80" r="3"/>
    <circle cx="158" cy="115" r="3.5"/>
    <circle cx="162" cy="100" r="3.5"/>
    <circle cx="158" cy="88" r="3"/>
    <circle cx="148" cy="80" r="3"/>
  </g>

  <!-- Pedang Keadilan (Sword of Truth) -->
  <g transform="translate(120, 122)">
    <!-- Blade -->
    <path d="M 0,-42 L 3.5,-36 L 2.5,24 L 0,28 L -2.5,24 L -3.5,-36 Z" fill="#F8FAFC" stroke="#CA8A04" stroke-width="1"/>
    <!-- Guard -->
    <rect x="-18" y="-18" width="36" height="5" rx="2.5" fill="url(#goldGrad)"/>
    <!-- Grip & Pommel -->
    <rect x="-3" y="-30" width="6" height="12" fill="url(#goldGrad)"/>
    <circle cx="0" cy="-32" r="4.5" fill="url(#goldGrad)"/>
  </g>

  <!-- Timbangan Keadilan (Scales of Justice) -->
  <g transform="translate(120, 104)">
    <!-- Balance Beam -->
    <rect x="-36" y="0" width="72" height="4" rx="2" fill="url(#goldGrad)"/>
    <circle cx="0" cy="2" r="5" fill="#FDE047"/>
    
    <!-- Left Plate -->
    <line x1="-30" y1="3" x2="-40" y2="28" stroke="#FDE047" stroke-width="1.5"/>
    <line x1="-30" y1="3" x2="-20" y2="28" stroke="#FDE047" stroke-width="1.5"/>
    <path d="M -45,28 Q -30,38 -15,28 Z" fill="url(#goldGrad)"/>

    <!-- Right Plate -->
    <line x1="30" y1="3" x2="20" y2="28" stroke="#FDE047" stroke-width="1.5"/>
    <line x1="30" y1="3" x2="40" y2="28" stroke="#FDE047" stroke-width="1.5"/>
    <path d="M 15,28 Q 30,38 45,28 Z" fill="url(#goldGrad)"/>
  </g>

  <!-- Ribbon at bottom inside circle -->
  <path d="M 88,154 Q 120,164 152,154 L 148,162 Q 120,172 92,162 Z" fill="url(#goldGrad)"/>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'logo-kejari.svg'), 'w', encoding='utf-8') as f:
    f.write(LOGO_SVG)

# 2. Kajari Portrait SVG Graphic (Distinguished portrait of R. Indra Senjaya, S.H., M.H.)
KAJARI_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B4D33"/>
      <stop offset="40%" stop-color="#0E3821"/>
      <stop offset="100%" stop-color="#082314"/>
    </linearGradient>
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>
    <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#164E31"/>
      <stop offset="60%" stop-color="#0E3821"/>
      <stop offset="100%" stop-color="#072213"/>
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCD3B0"/>
      <stop offset="100%" stop-color="#E7A87A"/>
    </linearGradient>
    <linearGradient id="flagRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#991B1B"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Office / Ceremonial Wall -->
  <rect x="0" y="0" width="400" height="520" fill="url(#bgGrad)"/>
  
  <!-- Subtle Indonesian Flag on Left Wall -->
  <g opacity="0.35" transform="translate(20, 40)">
    <rect x="0" y="0" width="50" height="90" fill="url(#flagRed)"/>
    <rect x="0" y="90" width="50" height="90" fill="#FFFFFF"/>
  </g>

  <!-- Kejaksaan Gold Crest Emboss on Right Wall -->
  <g opacity="0.25" transform="translate(320, 100) scale(0.35)">
    <circle cx="0" cy="0" r="90" fill="none" stroke="#FDE047" stroke-width="4"/>
    <polygon points="0,-30 8,-8 30,0 8,8 0,30 -8,8 -30,0 -8,-8" fill="#FDE047"/>
  </g>

  <!-- Official Kajari Silhouette & Detailed Attire -->
  <!-- Shoulders & Torso (PDU Green Uniform) -->
  <path d="M 50,520 L 70,360 L 120,310 L 150,300 L 200,315 L 250,300 L 280,310 L 330,360 L 350,520 Z" fill="url(#suitGrad)" filter="url(#softShadow)"/>

  <!-- Epaulets (Tanda Pangkat Bahu Emas Kejaksaan) -->
  <!-- Left Epaulet -->
  <g transform="translate(95, 312) rotate(-15)">
    <rect x="-10" y="-30" width="20" height="42" rx="3" fill="#D97706" stroke="#FEF08A" stroke-width="1.5"/>
    <polygon points="0,-20 3,-14 9,-14 4,-10 6,-4 0,-7 -6,-4 -4,-10 -9,-14 -3,-14" fill="#FEF08A"/>
    <polygon points="0,-3 3,3 9,3 4,7 6,13 0,10 -6,13 -4,7 -9,3 -3,3" fill="#FEF08A"/>
  </g>
  <!-- Right Epaulet -->
  <g transform="translate(305, 312) rotate(15)">
    <rect x="-10" y="-30" width="20" height="42" rx="3" fill="#D97706" stroke="#FEF08A" stroke-width="1.5"/>
    <polygon points="0,-20 3,-14 9,-14 4,-10 6,-4 0,-7 -6,-4 -4,-10 -9,-14 -3,-14" fill="#FEF08A"/>
    <polygon points="0,-3 3,3 9,3 4,7 6,13 0,10 -6,13 -4,7 -9,3 -3,3" fill="#FEF08A"/>
  </g>

  <!-- White Collar & Green Tie -->
  <polygon points="175,300 200,345 160,300" fill="#FFFFFF"/>
  <polygon points="225,300 200,345 240,300" fill="#FFFFFF"/>
  <polygon points="194,330 206,330 210,430 200,445 190,430" fill="#0A331E"/>

  <!-- Service Ribbons & Medals on Left Chest -->
  <g transform="translate(130, 360)">
    <!-- Row 1 -->
    <rect x="0" y="0" width="16" height="7" rx="1" fill="#DC2626"/>
    <rect x="18" y="0" width="16" height="7" rx="1" fill="#2563EB"/>
    <rect x="36" y="0" width="16" height="7" rx="1" fill="#D97706"/>
    <!-- Row 2 -->
    <rect x="0" y="9" width="16" height="7" rx="1" fill="#059669"/>
    <rect x="18" y="9" width="16" height="7" rx="1" fill="#EAB308"/>
    <rect x="36" y="9" width="16" height="7" rx="1" fill="#7C3AED"/>
  </g>

  <!-- Kejaksaan Metal Badge on Right Chest -->
  <g transform="translate(230, 365)">
    <circle cx="15" cy="8" r="10" fill="url(#goldFrame)"/>
    <circle cx="15" cy="8" r="7" fill="#0B3B24"/>
    <polygon points="15,4 16,7 19,7 17,9 18,12 15,10 12,12 13,9 11,7 14,7" fill="#FEF08A"/>
  </g>

  <!-- Golden Buttons along Center Placket -->
  <circle cx="200" cy="385" r="5" fill="url(#goldFrame)"/>
  <circle cx="200" cy="430" r="5" fill="url(#goldFrame)"/>
  <circle cx="200" cy="475" r="5" fill="url(#goldFrame)"/>

  <!-- Neck -->
  <path d="M 180,240 L 180,310 L 220,310 L 220,240 Z" fill="url(#skinGrad)"/>
  <path d="M 180,290 Q 200,305 220,290 Z" fill="#D1875A" opacity="0.6"/>

  <!-- Head & Facial Features -->
  <!-- Ears -->
  <ellipse cx="146" cy="188" rx="8" ry="16" fill="url(#skinGrad)"/>
  <ellipse cx="254" cy="188" rx="8" ry="16" fill="url(#skinGrad)"/>

  <!-- Face Contour -->
  <path d="M 152,145 Q 150,210 170,242 Q 200,265 230,242 Q 250,210 248,145 Z" fill="url(#skinGrad)" filter="url(#softShadow)"/>

  <!-- Hair (Neat Short Side-Part Official Cut) -->
  <path d="M 148,145 Q 148,100 200,98 Q 252,100 252,145 Q 242,128 200,126 Q 158,128 148,145 Z" fill="#1C1917"/>
  <path d="M 148,145 L 152,180 L 158,160 Q 156,135 170,128 Z" fill="#1C1917"/>
  <path d="M 252,145 L 248,180 L 242,160 Q 244,135 230,128 Z" fill="#1C1917"/>

  <!-- Eyes & Eyebrows -->
  <path d="M 166,160 Q 178,155 188,160" stroke="#1C1917" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 212,160 Q 222,155 234,160" stroke="#1C1917" stroke-width="3" fill="none" stroke-linecap="round"/>
  
  <ellipse cx="178" cy="172" rx="6" ry="4" fill="#FFFFFF"/>
  <circle cx="178" cy="172" r="3" fill="#292524"/>
  <circle cx="177" cy="171" r="1" fill="#FFFFFF"/>
  <path d="M 170,170 Q 178,166 186,170" stroke="#44403C" stroke-width="1.2" fill="none"/>

  <ellipse cx="222" cy="172" rx="6" ry="4" fill="#FFFFFF"/>
  <circle cx="222" cy="172" r="3" fill="#292524"/>
  <circle cx="221" cy="171" r="1" fill="#FFFFFF"/>
  <path d="M 214,170 Q 222,166 230,170" stroke="#44403C" stroke-width="1.2" fill="none"/>

  <!-- Nose -->
  <path d="M 200,168 L 198,198 L 206,198" stroke="#B8734A" stroke-width="1.8" fill="none" stroke-linecap="round"/>

  <!-- Smile / Confident Expression -->
  <path d="M 184,216 Q 200,228 216,216" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 188,217 Q 200,223 212,217" fill="#FFFFFF"/>

  <!-- Subtle Vignette Frame Edge -->
  <rect x="0" y="0" width="400" height="520" fill="none" stroke="#CA8A04" stroke-width="2" opacity="0.6"/>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'kajari-portrait.svg'), 'w', encoding='utf-8') as f:
    f.write(KAJARI_SVG)

# Also save as kajari-portrait.jpg fallback / alias
with open(os.path.join(STATIC_DIR, 'kajari-portrait.jpg'), 'w', encoding='utf-8') as f:
    f.write(KAJARI_SVG)

# 3. News Images SVG
NEWS_FEATURED_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="officeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#090D16"/>
    </linearGradient>
    <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#officeBg)"/>
  
  <!-- Backdrop flags & banner -->
  <rect x="180" y="40" width="440" height="180" rx="8" fill="#0B3B24" stroke="#EAB308" stroke-width="2"/>
  <circle cx="400" cy="110" r="45" fill="#062817" stroke="#EAB308" stroke-width="2"/>
  <polygon points="400,85 407,100 424,100 410,111 415,127 400,117 385,127 390,111 376,100 393,100" fill="#FDE047"/>
  <text x="400" y="175" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="700" fill="#FEF08A" text-anchor="middle" letter-spacing="1.5">
    KEJAKSAAN NEGERI KLUNGKUNG
  </text>
  <text x="400" y="195" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#E2E8F0" text-anchor="middle">
    SEKSI PERDATA DAN TATA USAHA NEGARA (DATUN)
  </text>

  <!-- Indonesian Flag -->
  <rect x="100" y="60" width="60" height="70" fill="#DC2626"/>
  <rect x="100" y="130" width="60" height="70" fill="#F8FAFC"/>
  <line x1="98" y1="50" x2="98" y2="280" stroke="#94A3B8" stroke-width="4"/>

  <!-- Press Conference Desk -->
  <ellipse cx="400" cy="380" rx="360" ry="140" fill="url(#deskGrad)" stroke="#10B981" stroke-width="3"/>
  <path d="M 40,380 L 100,500 L 700,500 L 760,380 Z" fill="#064E3B"/>

  <!-- Microphones on Desk -->
  <g transform="translate(350, 320)">
    <circle cx="0" cy="0" r="10" fill="#334155"/>
    <line x1="0" y1="0" x2="-20" y2="-40" stroke="#64748B" stroke-width="4"/>
    <ellipse cx="-22" cy="-44" rx="7" ry="11" fill="#0F172A" stroke="#94A3B8" stroke-width="1.5"/>
  </g>
  <g transform="translate(450, 320)">
    <circle cx="0" cy="0" r="10" fill="#334155"/>
    <line x1="0" y1="0" x2="20" y2="-40" stroke="#64748B" stroke-width="4"/>
    <ellipse cx="22" cy="-44" rx="7" ry="11" fill="#0F172A" stroke="#94A3B8" stroke-width="1.5"/>
  </g>

  <!-- Officials Seated (Prosecutor Silhouette Figures) -->
  <!-- Center: Kajari -->
  <g transform="translate(400, 240)">
    <ellipse cx="0" cy="0" rx="42" ry="50" fill="#E2E8F0"/>
    <path d="M -70,120 L -50,60 L 50,60 L 70,120 Z" fill="#0B3B24"/>
    <circle cx="0" cy="2" r="32" fill="#E7A87A"/>
    <path d="M -32,2 Q -30,-30 0,-32 Q 30,-30 32,2 Z" fill="#1E293B"/>
    <rect x="-10" y="60" width="20" height="30" fill="#FFFFFF"/>
    <polygon points="-5,60 5,60 8,110 -8,110" fill="#047857"/>
    <!-- Gold Epaulets -->
    <rect x="-55" y="65" width="22" height="8" rx="2" fill="#EAB308"/>
    <rect x="33" y="65" width="22" height="8" rx="2" fill="#EAB308"/>
  </g>
  <!-- Left Official: Kasi Datun -->
  <g transform="translate(240, 255)">
    <ellipse cx="0" cy="0" rx="36" ry="44" fill="#CBD5E1"/>
    <path d="M -60,110 L -42,50 L 42,50 L 60,110 Z" fill="#0B3B24"/>
    <circle cx="0" cy="2" r="28" fill="#E7A87A"/>
    <path d="M -28,2 Q -25,-26 0,-28 Q 25,-26 28,2 Z" fill="#1E293B"/>
  </g>
  <!-- Right Official: Kasi Intel -->
  <g transform="translate(560, 255)">
    <ellipse cx="0" cy="0" rx="36" ry="44" fill="#CBD5E1"/>
    <path d="M -60,110 L -42,50 L 42,50 L 60,110 Z" fill="#0B3B24"/>
    <circle cx="0" cy="2" r="28" fill="#E7A87A"/>
    <path d="M -28,2 Q -25,-26 0,-28 Q 25,-26 28,2 Z" fill="#1E293B"/>
  </g>

  <!-- Symbolic Recovery Cheque / State Asset Recovery Case File on Table -->
  <g transform="translate(320, 360)">
    <rect x="0" y="0" width="160" height="70" rx="4" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
    <text x="80" y="24" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="700" fill="#92400E" text-anchor="middle">PEMULIHAN KEUANGAN NEGARA</text>
    <text x="80" y="50" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="900" fill="#065F46" text-anchor="middle">Rp 1.250.000.000,-</text>
  </g>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'news-featured.jpg'), 'w', encoding='utf-8') as f:
    f.write(NEWS_FEATURED_SVG)

NEWS_JMS_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#0F172A"/>
  <!-- School Hall stage -->
  <rect x="40" y="40" width="520" height="180" rx="8" fill="#1E293B"/>
  <rect x="180" y="60" width="240" height="80" rx="4" fill="#064E3B" stroke="#FDE047" stroke-width="1.5"/>
  <text x="300" y="95" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#FEF08A" text-anchor="middle">JAKSA MASUK SEKOLAH (JMS)</text>
  <text x="300" y="120" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#E2E8F0" text-anchor="middle">SMA NEGERI 1 SEMARAPURA</text>

  <!-- Students in Auditorium -->
  <g fill="#475569">
    <circle cx="100" cy="300" r="22"/>
    <circle cx="160" cy="290" r="22"/>
    <circle cx="220" cy="305" r="22"/>
    <circle cx="280" cy="295" r="22"/>
    <circle cx="340" cy="300" r="22"/>
    <circle cx="400" cy="290" r="22"/>
    <circle cx="460" cy="305" r="22"/>
    <circle cx="520" cy="295" r="22"/>
  </g>

  <!-- Prosecutor Speaker on Stage -->
  <g transform="translate(300, 180)">
    <circle cx="0" cy="-20" r="16" fill="#FCD34D"/>
    <rect x="-18" y="0" width="36" height="50" rx="6" fill="#0B3B24"/>
    <line x1="20" y1="10" x2="45" y2="-10" stroke="#FCD34D" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'news-jms.jpg'), 'w', encoding='utf-8') as f:
    f.write(NEWS_JMS_SVG)

NEWS_BB_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#1C1917"/>
  <rect x="0" y="240" width="600" height="160" fill="#292524"/>
  <!-- Incinerator / Destruction Barrel with Flame -->
  <rect x="250" y="200" width="100" height="120" rx="8" fill="#44403C" stroke="#78716C" stroke-width="2"/>
  <path d="M 270,200 Q 300,120 310,180 Q 320,100 335,200 Z" fill="#EF4444"/>
  <path d="M 285,200 Q 300,145 315,200 Z" fill="#F59E0B"/>
  
  <text x="300" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#FEF08A" text-anchor="middle">PEMUSNAHAN BARANG BUKTI INKRACHT</text>
  <text x="300" y="85" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#D6D3D1" text-anchor="middle">TRIWULAN III - KEJARI KLUNGKUNG</text>
  
  <!-- Officers in Green uniform observing -->
  <g transform="translate(180, 220)">
    <circle cx="0" cy="-20" r="15" fill="#E7A87A"/>
    <rect x="-16" y="0" width="32" height="50" rx="4" fill="#0B3B24"/>
  </g>
  <g transform="translate(420, 220)">
    <circle cx="0" cy="-20" r="15" fill="#E7A87A"/>
    <rect x="-16" y="0" width="32" height="50" rx="4" fill="#0B3B24"/>
  </g>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'news-bb.jpg'), 'w', encoding='utf-8') as f:
    f.write(NEWS_BB_SVG)

NEWS_LELANG_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#0F172A"/>
  <rect x="50" y="50" width="500" height="300" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
  <text x="300" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#FBBF24" text-anchor="middle">LELANG BARANG RAMPASAN NEGARA</text>
  <text x="300" y="140" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#94A3B8" text-anchor="middle">KPKNL Denpasar &amp; Kejari Klungkung</text>
  <circle cx="300" cy="220" r="50" fill="#D97706"/>
  <!-- Gavel Icon -->
  <path d="M 285,205 L 315,190 L 325,210 L 295,225 Z" fill="#FFFBEB"/>
  <line x1="305" y1="210" x2="335" y2="250" stroke="#FFFBEB" stroke-width="6" stroke-linecap="round"/>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'news-lelang.jpg'), 'w', encoding='utf-8') as f:
    f.write(NEWS_LELANG_SVG)

NEWS_RJ_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#022C22"/>
  <rect x="50" y="50" width="500" height="300" rx="12" fill="#064E3B" stroke="#34D399" stroke-width="2"/>
  <text x="300" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#6EE7B7" text-anchor="middle">RESTORATIVE JUSTICE (RJ)</text>
  <text x="300" y="140" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#A7F3D0" text-anchor="middle">Penyelesaian Perkara Berkeadilan Humanis</text>
  <!-- Handshake vector -->
  <circle cx="300" cy="230" r="45" fill="#047857"/>
  <path d="M 275,230 L 295,215 L 315,235 L 325,225" stroke="#ECFDF5" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'news-rj.jpg'), 'w', encoding='utf-8') as f:
    f.write(NEWS_RJ_SVG)

NEWS_WBK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#042F2E"/>
  <rect x="50" y="50" width="500" height="300" rx="12" fill="#115E59" stroke="#5EEAD4" stroke-width="2"/>
  <text x="300" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#99F6E4" text-anchor="middle">ZONA INTEGRITAS WBK / WBBM</text>
  <text x="300" y="140" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#CCFBF1" text-anchor="middle">Birokrasi Bersih, Melayani, &amp; Bebas Korupsi</text>
  <circle cx="300" cy="225" r="45" fill="#0D9488"/>
  <!-- Shield Icon -->
  <polygon points="300,195 325,205 325,235 300,255 275,235 275,205" fill="#F0FDFA"/>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'news-wbk.jpg'), 'w', encoding='utf-8') as f:
    f.write(NEWS_WBK_SVG)

# 4. Map of Klungkung Vector SVG
MAP_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DCFCE7"/>
      <stop offset="100%" stop-color="#BBF7D0"/>
    </linearGradient>
  </defs>

  <!-- Ocean (Selat Badung & Laut Bali) -->
  <rect width="800" height="500" fill="url(#oceanGrad)"/>
  
  <!-- Subtle water ripples -->
  <path d="M 50,320 Q 200,310 350,330 T 650,320" fill="none" stroke="#7DD3FC" stroke-width="1.5" stroke-dasharray="8,8"/>
  <path d="M 120,420 Q 300,410 480,430 T 780,415" fill="none" stroke="#7DD3FC" stroke-width="1.5" stroke-dasharray="8,8"/>
  <text x="260" y="310" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-style="italic" fill="#0284C7" letter-spacing="3">SELAT BADUNG</text>
  <text x="680" y="160" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-style="italic" fill="#0284C7" letter-spacing="3">SELAT LOMBOK</text>

  <!-- Mainland Klungkung (Kecamatan Klungkung, Banjarangkan, Dawan) -->
  <path d="M 0,0 L 480,0 Q 460,70 440,110 Q 410,160 360,190 Q 300,220 220,230 Q 150,225 80,240 Q 20,230 0,220 Z" fill="url(#landGrad)" stroke="#86EFAC" stroke-width="2"/>
  
  <!-- Roads network -->
  <path d="M 40,90 Q 180,120 260,140 Q 340,160 410,120" fill="none" stroke="#FDE047" stroke-width="5" stroke-linecap="round"/>
  <path d="M 260,0 L 260,140 L 270,225" fill="none" stroke="#FED7AA" stroke-width="3" stroke-linecap="round"/>

  <!-- District labels on Mainland -->
  <text x="130" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#166534">KEC. BANJARANGKAN</text>
  <text x="350" y="100" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#166534">KEC. DAWAN</text>
  <text x="210" y="180" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#065F46">SEMARAPURA</text>

  <!-- Nusa Penida Island Group (Wilayah Hukum Kejari Klungkung) -->
  <!-- Nusa Lembongan -->
  <path d="M 440,320 Q 470,300 480,330 Q 460,355 435,340 Z" fill="#BBF7D0" stroke="#86EFAC" stroke-width="2"/>
  <text x="440" y="325" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" fill="#166534">N. Lembongan</text>

  <!-- Nusa Ceningan -->
  <ellipse cx="485" cy="345" rx="12" ry="7" fill="#BBF7D0" stroke="#86EFAC" stroke-width="1.5"/>

  <!-- Nusa Penida Big Island -->
  <path d="M 500,340 Q 560,300 660,330 Q 740,380 710,430 Q 640,460 560,440 Q 510,410 495,370 Z" fill="url(#landGrad)" stroke="#86EFAC" stroke-width="2.5"/>
  <text x="590" y="395" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#065F46" letter-spacing="1.5">KEC. NUSA PENIDA</text>
  <text x="610" y="415" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#15803D">Kantor Cabjari Nusa Penida</text>
  <!-- Small Star for Cabjari -->
  <polygon points="595,410 598,417 605,417 600,421 602,428 595,424 588,428 590,421 585,417 592,417" fill="#EAB308"/>

  <!-- Kejaksaan Negeri Klungkung Location PIN (Jl. Gajah Mada No. 32, Semarapura) -->
  <g transform="translate(265, 140)">
    <!-- Pulse ring animation circle -->
    <circle cx="0" cy="-28" r="32" fill="#DC2626" opacity="0.2"/>
    <!-- Shadow -->
    <ellipse cx="0" cy="0" rx="10" ry="4" fill="#000000" opacity="0.3"/>
    <!-- Red Pin -->
    <path d="M 0,0 C -12,-16 -18,-24 -18,-36 A 18,18 0 1,1 18,-36 C 18,-24 12,-16 0,0 Z" fill="#DC2626" stroke="#FFFFFF" stroke-width="2.5"/>
    <!-- Golden Star in Pin -->
    <circle cx="0" cy="-36" r="7" fill="#FFFFFF"/>
    <circle cx="0" cy="-36" r="5" fill="#EAB308"/>

    <!-- Pin Callout Box -->
    <rect x="-110" y="-88" width="220" height="42" rx="8" fill="#0B3B24" stroke="#FDE047" stroke-width="2"/>
    <polygon points="-6,-46 6,-46 0,-40" fill="#0B3B24"/>
    <text x="0" y="-70" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#FEF08A" text-anchor="middle">
      KEJAKSAAN NEGERI KLUNGKUNG
    </text>
    <text x="0" y="-53" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="500" fill="#E2E8F0" text-anchor="middle">
      Jl. Gajah Mada No. 32, Semarapura
    </text>
  </g>
</svg>
"""

with open(os.path.join(STATIC_DIR, 'peta-klungkung.png'), 'w', encoding='utf-8') as f:
    f.write(MAP_SVG)

print("All visual assets created successfully in", STATIC_DIR)
