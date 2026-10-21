/**
 * KERTAGOSA - Portal Kejaksaan Negeri Klungkung
 * Client-Side Dynamic Engine & Live Inline CMS Controller
 */

// Default Fallback Data for Zero-Latency & Offline Resilience
const DEFAULT_PORTAL_DATA = {
  contents: {
    header_logo_url: { value: '/static/images/logo-kejari.svg' },
    header_title: { value: 'KEJAKSAAN REPUBLIK INDONESIA - KEJAKSAAN NEGERI KLUNGKUNG' },
    header_wbk_badge: { value: 'ZONA INTEGRITAS WBK / WBBM' },
    header_hours: { value: 'Senin - Jumat: 08.00 - 16.00 WITA' },
    header_cta_text: { value: 'Lacak Tiket Layanan' },
    header_hotline_badge: { value: 'Hotline PTSP: 0811-3800-4444' },
    hero_badge_1: { value: 'KEJAKSAAN NEGERI KLUNGKUNG' },
    hero_badge_2: { value: 'PELAYANAN PUBLIK TERPADU' },
    hero_main_title: { value: 'KERTAGOSA' },
    hero_description: { value: 'Melalui "KERTAGOSA", KEJARI Klungkung berkomitmen untuk memberikan kerja yang menekankan pelayanan dan penegakan hukum yang cepat, tepat, dan profesional kepada seluruh masyarakat.' },
    hero_btn_primary_text: { value: 'Pelayanan Hukum' },
    hero_btn_primary_link: { value: '#layanan' },
    hero_btn_secondary_text: { value: 'Laporkan Pengaduan (MASADU)' },
    hero_btn_secondary_link: { value: '#masadu' },
    hero_stat_1_value: { value: '88.31' },
    hero_stat_1_label: { value: 'Indeks Kepuasan (Sangat Baik)' },
    hero_stat_2_value: { value: '100%' },
    hero_stat_2_label: { value: 'Transparansi Sidang & Perkara' },
    hero_stat_3_value: { value: 'Rp 0,-' },
    hero_stat_3_label: { value: 'Biaya Pengantaran BB (Gratis)' },
    kajari_photo_url: { value: '/static/images/kajari-portrait.jpg' },
    kajari_position_badge: { value: 'KEPALA KEJAKSAAN NEGERI KLUNGKUNG' },
    kajari_full_name: { value: 'R. Indra Senjaya, S.H., M.H.' },
    ticker_badge_label: { value: 'PENGUMUMAN PENTING' },
    ticker_text: { value: 'Jadwal Pelayanan Terpadu Satu Pintu (PTSP) beroperasi penuh Senin - Jumat (08.00 - 16.00 WITA). Pengantaran Barang Bukti (SEMARA BAKTI) 100% GRATIS ke seluruh daratan Klungkung & Nusa Penida. Aduan dugaan korupsi dapat disampaikan melalui MASADU dengan kerahasiaan 100% terjamin.' },
    news_section_badge: { value: 'KABAR TERKINI & AGENDA KEJAKSAAN' },
    news_section_title: { value: 'Pusat Berita & Publikasi Hukum' },
    news_section_desc: { value: 'Informasi transparan mengenai penegakan hukum, kegiatan sosial, pemulihan keuangan negara, dan pelayanan hukum Kejari Klungkung.' },
    services_section_title: { value: '4 Pilar Layanan Unggulan KERTAGOSA' },
    services_section_desc: { value: 'Inovasi pelayanan digital terintegrasi untuk masyarakat Kabupaten Klungkung yang transparan, mudah, dan bebas biaya.' },
    digital_services_badge: { value: 'PORTAL INTEGRASI RESMI' },
    digital_services_title: { value: 'Layanan Digital Terpadu Kejaksaan RI' },
    digital_services_desc: { value: 'Akses cepat ke portal dan aplikasi resmi nasional Kejaksaan RI dan SP4N LAPOR!' },
    control_board_title: { value: 'Papan Kendali Operasional Pengadilan & Mutu' },
    control_board_source_note: { value: 'Terakhir diperbarui: Hari ini, Pukul 10:15 WITA • Sumber: CMS Pengadilan Negeri & Kejari Klungkung' },
    skm_period_badge: { value: 'TRIWULAN III' },
    skm_main_score: { value: '88.31' },
    skm_predicate_text: { value: 'Mutu Pelayanan: A (Sangat Baik)' },
    skm_respondents_count: { value: '412' },
    office_section_title: { value: 'Kantor Kejaksaan Negeri Klungkung' },
    office_description: { value: 'Wilayah hukum Kejaksaan Negeri Klungkung mencakup daratan Klungkung hingga kepulauan Nusa Penida, siap melayani dengan integritas tinggi dan keterbukaan informasi publik.' },
    office_address_text: { value: 'Jl. Gajah Mada No. 32, Semarapura, Kab. Klungkung, Bali 80711' },
    office_hours_text: { value: 'Senin - Kamis: 08.00 - 16.00 WITA | Jumat: 08.00 - 16.30 WITA' },
    office_map_image_url: { value: '/static/images/peta-klungkung.png' },
    office_gmaps_url: { value: 'https://maps.google.com/?q=Kejaksaan+Negeri+Klungkung' },
    office_whatsapp_number: { value: '6281138004444' },
    office_phone_number: { value: '(0366) 21151' },
    office_email: { value: 'kejari.klungkung@kejaksaan.go.id' },
    footer_copyright: { value: '© 2026 Kejaksaan Negeri Klungkung - Hak Cipta Dilindungi Undang-Undang. Portal KERTAGOSA v2.4' }
  },
  news: [
    {
      id: 1,
      title: 'Pencanangan Pembangunan Zona Integritas Menuju WBK/WBBM Tahun 2026',
      slug: 'pencanangan-wbk-wbbm-2026',
      category: 'Siaran Pers',
      badge_label: 'UTAMA',
      excerpt: 'Kejaksaan Negeri Klungkung menggelar apel komitmen bersama seluruh jajaran pegawai untuk memperkuat integritas dan pelayanan publik.',
      published_at: '2026-10-18',
      views: 342,
      thumbnail_url: '/static/images/news-wbk.jpg',
      author: 'Tim Humas Kejari'
    },
    {
      id: 2,
      title: 'Layanan SEMARA BAKTI Antar Barang Bukti Sepeda Motor ke Nusa Penida',
      slug: 'semara-bakti-antar-bb-nusa-penida',
      category: 'Pelayanan Publik',
      badge_label: 'INOVASI',
      excerpt: 'Tim Pengelolaan Barang Bukti Kejari Klungkung menyeberangi selat Badung guna mengantar barang bukti motor langsung ke rumah warga.',
      published_at: '2026-10-17',
      views: 289,
      thumbnail_url: '/static/images/news-bb.jpg',
      author: 'Seksi PB3R'
    },
    {
      id: 3,
      title: 'Restorative Justice Kasus Penganiayaan Ringan di Banjarangkan Berhasil Didamaikan',
      slug: 'restorative-justice-banjarangkan',
      category: 'Restorative Justice',
      badge_label: 'KASIH HUKUM',
      excerpt: 'Jaksa Fasilitator Kejari Klungkung mengedepankan keadilan restoratif dengan mendamaikan dua belah pihak tanpa melalui persidangan.',
      published_at: '2026-10-15',
      views: 512,
      thumbnail_url: '/static/images/news-rj.jpg',
      author: 'Seksi Pidum'
    }
  ],
  services: [
    {
      id: 1,
      code: 'JAGADITA',
      title: 'JAGADITA (Jadwal Giat Sidang Digital)',
      badge_text: 'LAYANAN PUBLIK',
      theme_color: 'green',
      icon_name: 'gavel',
      description: 'Sistem transparansi jadwal persidangan perkara pidana umum dan khusus yang disidangkan di Pengadilan Negeri secara real-time.',
      info_box_text: '🔍 Temukan jam sidang, nomor perkara, nama Jaksa Penuntut Umum (JPU), agenda sidang, dan ruang sidang tanpa harus datang ke pengadilan.',
      btn_text: 'Cari Sidang',
      btn_action: 'SEARCH_JAGADITA',
      link_text: 'Lihat Jadwal Hari Ini →',
      link_action: 'GOTO_JAGADITA_TABLE',
      order_num: 1
    },
    {
      id: 2,
      code: 'MASADU',
      title: 'MASADU (Masyarakat Sampaikan Aduan)',
      badge_text: 'RESPON CEPAT 1X24 JAM',
      theme_color: 'red',
      icon_name: 'shield-alert',
      description: 'Saluran pengaduan masyarakat atas dugaan tindak pidana korupsi, penyalahgunaan wewenang, atau pelanggaran hukum lainnya di Kabupaten Klungkung.',
      info_box_text: '🔒 Identitas pelapor dijamin kerahasiaannya dengan enkripsi end-to-end sesuai SOP Kejaksaan RI. Bebas intervensi dan terlindungi.',
      btn_text: 'Buat Laporan Pengaduan',
      btn_action: 'OPEN_COMPLAINT_MODAL',
      link_text: 'Lacak Tiket Aduan →',
      link_action: 'OPEN_TRACKER_MODAL',
      order_num: 2
    },
    {
      id: 3,
      code: 'SEMARA_BAKTI',
      title: 'SEMARA BAKTI (Pengantaran Barang Bukti)',
      badge_text: '100% GRATIS',
      theme_color: 'amber',
      icon_name: 'truck',
      description: 'Layanan antar barang bukti perkara yang telah berkekuatan hukum tetap (inkracht) langsung ke kediaman pemilik yang sah tanpa dipungut biaya apapun.',
      info_box_text: '📦 Menjangkau 4 kecamatan: Klungkung, Banjarangkan, Dawan, hingga Kepulauan Nusa Penida diantar dengan armada dinas Kejari.',
      btn_text: 'Ajukan Pengantaran',
      btn_action: 'OPEN_SEMARA_MODAL',
      link_text: 'Cek Status Antar →',
      link_action: 'OPEN_SEMARA_TRACKER',
      order_num: 3
    },
    {
      id: 4,
      code: 'PTSP_ONLINE',
      title: 'PTSP & Konsultasi Hukum Gratis (Halo JPN)',
      badge_text: 'PELAYANAN TERPADU',
      theme_color: 'emerald',
      icon_name: 'building-columns',
      description: 'Pelayanan konsultasi hukum gratis di bidang Perdata dan Tata Usaha Negara oleh Jaksa Pengacara Negara (JPN) secara online maupun tatap muka.',
      info_box_text: '⚖️ Bantuan hukum gratis untuk instansi pemerintah, BUMN/BUMD, serta masyarakat umum terkait sengketa tanah, waris, dan perdata.',
      btn_text: 'Konsultasi Sekarang',
      btn_action: 'OPEN_PTSP_CONSULT',
      link_text: 'Alur Layanan PTSP →',
      link_action: 'GOTO_PTSP_INFO',
      order_num: 4
    }
  ],
  schedules: [
    {
      id: 1,
      session_time: '10:00 WITA',
      court_room: 'Ruang Candra (PN Semarapura)',
      case_number: '88/Pid.B/2026/PN Smp',
      defendant_name: 'I Wayan Kertayasa alias Yan Taru',
      case_type: 'PIDUM',
      agenda: 'Pemeriksaan Saksi Korban & Ahli Forensik',
      prosecutor: 'I Kadek Wahyudi, S.H.',
      status: 'SEDANG BERLANGSUNG'
    },
    {
      id: 2,
      session_time: '11:30 WITA',
      court_room: 'Ruang Kartika (PN Semarapura)',
      case_number: '14/Pid.Sus-TPK/2026/PN Dps',
      defendant_name: 'I Nyoman Suardana',
      case_type: 'TIPIKOR',
      agenda: 'Pembacaan Surat Tuntutan (Requisitoir)',
      prosecutor: 'Putu Gede Darmawan, S.H.',
      status: 'TERJADWAL'
    },
    {
      id: 3,
      session_time: '13:00 WITA',
      court_room: 'Ruang Tirta (PN Semarapura)',
      case_number: '102/Pid.Sus/2026/PN Smp',
      defendant_name: 'Ketut Sudiana alias Mangku',
      case_type: 'PIDUM',
      agenda: 'Eksepsi Penasihat Hukum Terdakwa',
      prosecutor: 'Ni Made Lestari, S.H., M.H.',
      status: 'TERJADWAL'
    }
  ],
  schedule_counts: { all: 3, pidum: 2, pidsus: 1 },
  skm: {
    main_score: '88.31',
    period_badge: 'TRIWULAN III',
    predicate: 'Mutu Pelayanan: A (Sangat Baik)',
    respondents_count: '412',
    mode: 'MANUAL',
    metrics: [
      { label: 'Prosedur & Persyaratan', score: 91.2 },
      { label: 'Kecepatan Waktu Pelayanan', score: 87.5 },
      { label: 'Bebas Biaya / Tarif (Gratis)', score: 100.0 },
      { label: 'Kompetensi & Perilaku Petugas', score: 89.4 }
    ]
  }
};

// Application State (Pre-populated with default portal data for zero-latency initial render)
const state = {
  contents: { ...DEFAULT_PORTAL_DATA.contents },
  news: [ ...DEFAULT_PORTAL_DATA.news ],
  services: [ ...DEFAULT_PORTAL_DATA.services ],
  schedules: [ ...DEFAULT_PORTAL_DATA.schedules ],
  scheduleCounts: { ...DEFAULT_PORTAL_DATA.schedule_counts },
  skm: { ...DEFAULT_PORTAL_DATA.skm },
  activeNewsCategory: 'Semua Berita',
  newsSearchQuery: '',
  activeScheduleType: 'Semua',
  scheduleSearchQuery: '',
  sakipDocs: [],
  sakipCounts: { ALL: 0, RENSTRA: 0, RENJA: 0, LKJ: 0, TRIWULAN: 0 },
  activeSakipCategory: 'ALL',
  sakipSearchQuery: '',
  tickerIndex: 0,
  isTickerPaused: false,
  currentUser: null,
  isLiveEditActive: false,
  profileData: null,
  profileItems: [],
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  initLiveClock();
  // Render default sections immediately so UI is never blank
  renderAllSections();
  await checkAuthSession();
  ensureCommonModals();
  ensureCmsModals();
  await Promise.all([
    loadHomepageData(),
    loadHomeSakipData(),
    initProfilePageCms(),
    initInformationPageCms()
  ]);
  setupEventListeners();
});

// ============================================================================
// DATA FETCHING & RENDERING
// ============================================================================

async function loadHomepageData() {
  // If running via file:// protocol directly from disk, don't attempt network fetch
  if (window.location.protocol === 'file:') {
    console.info('KERTAGOSA: Menjalankan dalam mode pratinjau lokal offline (file://). Menggunakan data statis bawaan.');
    renderAllSections();
    return;
  }

  try {
    let url = `/api/public/homepage-data?`;
    if (state.activeNewsCategory && state.activeNewsCategory !== 'Semua Berita') {
      url += `category=${encodeURIComponent(state.activeNewsCategory)}&`;
    }
    if (state.activeScheduleType && state.activeScheduleType !== 'Semua') {
      url += `type=${encodeURIComponent(state.activeScheduleType)}&`;
    }
    if (state.scheduleSearchQuery) {
      url += `search=${encodeURIComponent(state.scheduleSearchQuery)}&`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();

    if (data && data.success) {
      state.contents = { ...state.contents, ...(data.contents || {}) };
      if (Array.isArray(data.news) && data.news.length > 0) state.news = data.news;
      if (Array.isArray(data.services) && data.services.length > 0) state.services = data.services;
      if (Array.isArray(data.schedules) && data.schedules.length > 0) state.schedules = data.schedules;
      if (data.schedule_counts) state.scheduleCounts = data.schedule_counts;
      if (data.skm && data.skm.main_score) state.skm = data.skm;

      renderAllSections();
    }
  } catch (err) {
    console.warn('Sinkronisasi data portal live belum terhubung, menggunakan data lokal bawaan:', err);
    // Keep rendering with default data so portal remains fully visible and intact
    renderAllSections();
  }
}

function renderAllSections() {
  renderHeader();
  renderHero();
  renderTicker();
  renderNewsSection();
  renderServicesSection();
  renderDigitalServicesSection();
  renderControlBoard();
  renderOfficeAndMap();
  renderFooter();

  if (window.setLanguage && window.currentLanguage === 'en') {
    window.setLanguage('en');
  }

  if (state.currentUser && state.currentUser.role === 'ADMIN') {
    renderAdminFloatingBar();
  }
}

function renderDigitalServicesSection() {
  const c = state.contents;
  if (!c) return;
  const badge = document.getElementById('digital-services-badge');
  if (badge && c.digital_services_badge) badge.textContent = c.digital_services_badge.value;
  const title = document.getElementById('digital-services-title');
  if (title && c.digital_services_title) title.textContent = c.digital_services_title.value;
  const desc = document.getElementById('digital-services-desc');
  if (desc && c.digital_services_desc) desc.textContent = c.digital_services_desc.value;
}

// ============================================================================
// SECTION 1: TOP BAR & NAVIGATION HEADER
// ============================================================================

function renderHeader() {
  const c = state.contents;

  // Logo Resmi Instansi (Header, Navbar & Footer)
  const logoUrl = (c.header_logo_url && c.header_logo_url.value && c.header_logo_url.value.trim()) 
    ? c.header_logo_url.value.trim() 
    : '/static/images/logo-kejari.svg';

  const logoEl = document.getElementById('header-logo');
  if (logoEl) {
    logoEl.src = logoUrl;
  }
  const footerLogoEl = document.getElementById('footer-logo');
  if (footerLogoEl) {
    footerLogoEl.src = logoUrl;
  }
  document.querySelectorAll('.site-logo-img').forEach(img => {
    img.src = logoUrl;
  });

  // Header Title
  const titleEl = document.getElementById('header-title');
  if (titleEl && c.header_title) {
    titleEl.textContent = c.header_title.value;
  }

  // WBK Badge
  const wbkEl = document.getElementById('header-wbk-badge');
  if (wbkEl && c.header_wbk_badge) {
    wbkEl.textContent = c.header_wbk_badge.value;
  }

  // Jam Operasional Header
  const hoursEl = document.getElementById('header-hours');
  if (hoursEl && c.header_hours) {
    hoursEl.textContent = c.header_hours.value;
  }

  // CTA Text
  const ctaEl = document.getElementById('header-cta-text');
  if (ctaEl && ctaEl.querySelector('span') && c.header_cta_text) {
    ctaEl.querySelector('span').textContent = c.header_cta_text.value;
  }

  // Hotline Badge
  const hotlineEl = document.getElementById('header-hotline-badge');
  if (hotlineEl && c.header_hotline_badge) {
    hotlineEl.textContent = c.header_hotline_badge.value;
  }
}

// ============================================================================
// SECTION 2: HERO & KAJARI PROFILE
// ============================================================================

function renderHero() {
  const c = state.contents;

  // Badges
  const badge1 = document.getElementById('hero-badge-1');
  if (badge1 && c.hero_badge_1) badge1.textContent = c.hero_badge_1.value;

  const badge2 = document.getElementById('hero-badge-2');
  if (badge2 && c.hero_badge_2) badge2.textContent = c.hero_badge_2.value;

  // Main Title & Description
  const title = document.getElementById('hero-main-title');
  if (title && c.hero_main_title) title.textContent = c.hero_main_title.value;

  const desc = document.getElementById('hero-description');
  if (desc && c.hero_description) desc.textContent = c.hero_description.value;

  // CTA Buttons
  const btnPrimary = document.getElementById('hero-btn-primary-text');
  if (btnPrimary && c.hero_btn_primary_text) btnPrimary.textContent = c.hero_btn_primary_text.value;

  const btnSec = document.getElementById('hero-btn-secondary-text');
  if (btnSec && c.hero_btn_secondary_text) btnSec.textContent = c.hero_btn_secondary_text.value;

  // 3 Glassmorphism Stat Cards
  const s1Val = document.getElementById('hero-stat-1-value');
  const s1Lbl = document.getElementById('hero-stat-1-label');
  if (s1Val && c.hero_stat_1_value) {
    s1Val.dataset.targetVal = c.hero_stat_1_value.value;
    s1Val.textContent = c.hero_stat_1_value.value;
  }
  if (s1Lbl && c.hero_stat_1_label) s1Lbl.textContent = c.hero_stat_1_label.value;

  const s2Val = document.getElementById('hero-stat-2-value');
  const s2Lbl = document.getElementById('hero-stat-2-label');
  if (s2Val && c.hero_stat_2_value) {
    s2Val.dataset.targetVal = c.hero_stat_2_value.value;
    s2Val.textContent = c.hero_stat_2_value.value;
  }
  if (s2Lbl && c.hero_stat_2_label) s2Lbl.textContent = c.hero_stat_2_label.value;

  const s3Val = document.getElementById('hero-stat-3-value');
  const s3Lbl = document.getElementById('hero-stat-3-label');
  if (s3Val && c.hero_stat_3_value) s3Val.textContent = c.hero_stat_3_value.value;
  if (s3Lbl && c.hero_stat_3_label) s3Lbl.textContent = c.hero_stat_3_label.value;

  if (typeof initNumberCounters === 'function') {
    initNumberCounters();
  }

  // Kajari Photo & Info
  const kajariPhoto = document.getElementById('kajari-photo');
  if (kajariPhoto && c.kajari_photo_url) kajariPhoto.src = c.kajari_photo_url.value;

  const kajariBadge = document.getElementById('kajari-position-badge');
  if (kajariBadge && c.kajari_position_badge) kajariBadge.textContent = c.kajari_position_badge.value;

  const kajariName = document.getElementById('kajari-full-name');
  if (kajariName && c.kajari_full_name) kajariName.textContent = c.kajari_full_name.value;
}

// ============================================================================
// SECTION 3: TICKER & NEWS CENTER (BENTO GRID)
// ============================================================================

function renderTicker() {
  const c = state.contents;
  const badge = document.getElementById('ticker-badge-label');
  if (badge && c.ticker_badge_label) badge.textContent = c.ticker_badge_label.value;

  const text = document.getElementById('ticker-text');
  if (text && c.ticker_text) {
    // Duplicate text for infinite seamless scroll
    text.textContent = `${c.ticker_text.value}   +++   ${c.ticker_text.value}`;
  }
}

function renderNewsSection() {
  const c = state.contents;
  const badge = document.getElementById('news-section-badge');
  if (badge && c.news_section_badge) badge.textContent = c.news_section_badge.value;

  const title = document.getElementById('news-section-title');
  if (title && c.news_section_title) title.textContent = c.news_section_title.value;

  const desc = document.getElementById('news-section-desc');
  if (desc && c.news_section_desc) desc.textContent = c.news_section_desc.value;

  // Render Bento Grid Cards (with live keyword search filter)
  const mainCardContainer = document.getElementById('news-featured-main');
  const sideCardsContainer = document.getElementById('news-featured-side');
  const bottomCardsContainer = document.getElementById('news-compact-bottom');

  if (!mainCardContainer || !sideCardsContainer || !bottomCardsContainer) return;

  const q = (state.newsSearchQuery || '').toLowerCase();
  const filteredNews = q
    ? state.news.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.excerpt || '').toLowerCase().includes(q) ||
        (n.category || '').toLowerCase().includes(q) ||
        (n.badge_label || '').toLowerCase().includes(q)
      )
    : state.news;

  if (filteredNews.length === 0) {
    mainCardContainer.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-xs">
        Tidak ditemukan berita atau pengumuman dengan kata kunci "<strong>${state.newsSearchQuery}</strong>".
      </div>
    `;
    sideCardsContainer.innerHTML = '';
    bottomCardsContainer.innerHTML = '';
    return;
  }

  const featuredMain = filteredNews.find(n => n.layout_type === 'FEATURED_MAIN') || filteredNews[0];
  const sideNews = filteredNews.filter(n => n.id !== featuredMain?.id).slice(0, 2);
  const bottomNews = filteredNews.filter(n => !sideNews.includes(n) && n.id !== featuredMain?.id).slice(0, 3);

  // 1. Featured Main Card (Left 50-60%)
  if (featuredMain) {
    mainCardContainer.innerHTML = `
      <div class="bento-card bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full group hover:border-emerald-600/40">
        <div class="relative overflow-hidden h-64 sm:h-72 w-full cms-image-wrapper">
          <img src="${featuredMain.thumbnail_url}" alt="${featuredMain.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute top-4 left-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-md">
              <span class="w-2 h-2 rounded-full bg-amber-900 animate-pulse"></span>
              ${featuredMain.badge_label || 'BERITA UTAMA'}
            </span>
          </div>
          <div class="cms-image-overlay" onclick="openImageEditModal('posts', ${featuredMain.id}, '${featuredMain.thumbnail_url}')">
            <button class="px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg shadow text-xs flex items-center gap-2">
              <i data-lucide="camera" class="w-4 h-4"></i> Ganti Foto Berita
            </button>
          </div>
        </div>

        <div class="p-6 flex flex-col flex-1">
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span class="font-semibold text-emerald-800">${featuredMain.category}</span>
            <span>•</span>
            <span>${featuredMain.published_at}</span>
            <span>•</span>
            <span>${featuredMain.author}</span>
          </div>

          <h3 class="font-heading text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-emerald-800 transition-colors cursor-pointer" onclick="openNewsDetail('${featuredMain.slug}')">
            ${featuredMain.title}
          </h3>

          <p class="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
            ${featuredMain.excerpt}
          </p>

          ${featuredMain.highlight_quote ? `
          <div class="bg-slate-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg mb-5 text-xs text-slate-700 italic flex items-start gap-2.5">
            <i data-lucide="quote" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"></i>
            <span>"${featuredMain.highlight_quote}"</span>
          </div>
          ` : ''}

          <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <button onclick="openNewsDetail('${featuredMain.slug}')" class="inline-flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-700 group/btn">
              Baca Selengkapnya
              <i data-lucide="arrow-right" class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"></i>
            </button>

            ${state.currentUser && state.currentUser.role === 'ADMIN' ? `
            <div class="flex items-center gap-2">
              <button onclick="openNewsEditModal(${featuredMain.id})" class="text-xs bg-slate-100 hover:bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded">Edit</button>
              <button onclick="deleteNewsItem(${featuredMain.id})" class="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded">Hapus</button>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 2. Side Cards (Right Column - 2 Horizontal Cards)
  sideCardsContainer.innerHTML = sideNews.map(item => `
    <div class="bento-card bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:border-emerald-600/40">
      <div class="sm:w-2/5 relative h-48 sm:h-auto overflow-hidden cms-image-wrapper">
        <img src="${item.thumbnail_url}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-800/90 text-white shadow">
          ${item.badge_label || item.category}
        </span>
        <div class="cms-image-overlay" onclick="openImageEditModal('posts', ${item.id}, '${item.thumbnail_url}')">
          <button class="px-2.5 py-1 bg-amber-500 text-slate-900 font-bold rounded shadow text-[10px]">
            Ganti Foto
          </button>
        </div>
      </div>
      <div class="sm:w-3/5 p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>${item.published_at}</span>
            <span>•</span>
            <span class="text-slate-600">${item.author}</span>
          </div>
          <h4 class="font-heading text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-800 transition-colors cursor-pointer line-clamp-2" onclick="openNewsDetail('${item.slug}')">
            ${item.title}
          </h4>
          <p class="text-xs text-slate-600 line-clamp-2 mb-3">
            ${item.excerpt}
          </p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <button onclick="openNewsDetail('${item.slug}')" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-700">
            Baca Berita <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
          ${state.currentUser && state.currentUser.role === 'ADMIN' ? `
          <button onclick="openNewsEditModal(${item.id})" class="text-[11px] text-amber-700 font-semibold hover:underline">Edit</button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // 3. Compact Bottom Cards (3 Columns)
  bottomCardsContainer.innerHTML = bottomNews.map(item => `
    <div class="bento-card bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-emerald-600/40 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="px-2.5 py-1 rounded text-[11px] font-bold ${getCategoryBadgeClass(item.badge_label || item.category)}">
            ${item.badge_label || item.category}
          </span>
          <span class="text-[11px] text-slate-400">${item.published_at}</span>
        </div>
        <h4 class="font-heading text-sm font-bold text-slate-900 mb-2 line-clamp-2 hover:text-emerald-800 transition-colors cursor-pointer" onclick="openNewsDetail('${item.slug}')">
          ${item.title}
        </h4>
        <p class="text-xs text-slate-600 line-clamp-2 mb-4">
          ${item.excerpt}
        </p>
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <button onclick="openNewsDetail('${item.slug}')" class="font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1">
          Baca Artikel <i data-lucide="arrow-right" class="w-3 h-3"></i>
        </button>
        ${state.currentUser && state.currentUser.role === 'ADMIN' ? `
        <button onclick="openNewsEditModal(${item.id})" class="text-amber-700 font-medium hover:underline text-[11px]">Edit</button>
        ` : ''}
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function getCategoryBadgeClass(category) {
  const cat = (category || '').toUpperCase();
  if (cat.includes('PENGUMUMAN')) return 'bg-amber-100 text-amber-900';
  if (cat.includes('PIDUM') || cat.includes('PIDANA UMUM')) return 'bg-blue-100 text-blue-900';
  if (cat.includes('PEMBINAAN')) return 'bg-emerald-100 text-emerald-900';
  if (cat.includes('INTELIJEN')) return 'bg-purple-100 text-purple-900';
  if (cat.includes('DATUN')) return 'bg-teal-100 text-teal-900';
  return 'bg-slate-100 text-slate-800';
}

// Filter News by Category Pill
function setNewsCategory(categoryName) {
  state.activeNewsCategory = categoryName;

  // Update pills UI
  document.querySelectorAll('.news-category-pill').forEach(btn => {
    if (btn.getAttribute('data-category') === categoryName) {
      btn.className = 'news-category-pill px-4 py-1.5 rounded-full text-xs font-bold bg-[#0B3B24] text-white shadow-sm transition-all';
    } else {
      btn.className = 'news-category-pill px-4 py-1.5 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 transition-all';
    }
  });

  loadHomepageData();
}

// ============================================================================
// SECTION 4: 4 PILAR LAYANAN UNGGULAN KERTAGOSA
// ============================================================================

function renderServicesSection() {
  const c = state.contents;
  const title = document.getElementById('services-section-title');
  if (title && c.services_section_title) title.textContent = c.services_section_title.value;

  const desc = document.getElementById('services-section-desc');
  if (desc && c.services_section_desc) desc.textContent = c.services_section_desc.value;

  const container = document.getElementById('services-grid-container');
  if (!container) return;

  container.innerHTML = state.services.map(svc => {
    const isJagadita = svc.code === 'JAGADITA';
    const isMasadu = svc.code === 'MASADU';
    const isSemara = svc.code === 'SEMARA_BAKTI';
    const isDatun = svc.code === 'DATUN';

    // Theme color styles
    let themeBorder = 'border-slate-200';
    let iconBg = 'bg-emerald-100 text-emerald-800';
    let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let btnClass = 'bg-[#0B3B24] text-white hover:bg-[#072A19]';

    if (svc.theme_color === 'red') {
      iconBg = 'bg-red-100 text-red-800';
      badgeClass = 'bg-red-50 text-red-800 border-red-200';
      btnClass = 'bg-[#991B1B] text-white hover:bg-[#DC2626]';
    } else if (svc.theme_color === 'amber') {
      iconBg = 'bg-amber-100 text-amber-800';
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
      btnClass = 'bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold';
    }

    const cardModifier = isMasadu ? 'card-masadu' : (isSemara ? 'card-semara' : (isDatun ? 'card-datun' : 'card-jagadita'));

    return `
      <div class="pillar-card ${cardModifier} bg-white rounded-2xl border ${themeBorder} p-7 shadow-sm flex flex-col justify-between relative group hover:border-emerald-600/40">
        <!-- Top bar of card -->
        <div>
          <div class="flex items-start justify-between mb-5">
            <div class="w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-inner">
              <i data-lucide="${getLucideIconName(svc.icon_name)}" class="w-6 h-6"></i>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}">
              ${svc.badge_text}
            </span>
          </div>

          <h3 class="font-heading text-lg font-bold text-slate-900 mb-2">
            ${svc.title}
          </h3>

          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
            ${svc.description}
          </p>

          <!-- Interactive element inside card -->
          ${isJagadita ? `
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-6">
            <label class="block text-[11px] font-semibold text-slate-500 mb-2">Cari Jadwal Sidang Hari Ini:</label>
            <div class="flex gap-2">
              <input type="text" id="jagadita-quick-search" placeholder="No. Perkara / Nama Terdakwa..." class="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700">
              <button onclick="handleJagaditaCardSearch()" class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm">
                ${svc.btn_text}
              </button>
            </div>
          </div>
          ` : `
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-6 text-xs text-slate-600 flex items-start gap-2.5">
            <span class="text-base leading-none">💡</span>
            <span>${svc.info_box_text}</span>
          </div>
          `}
        </div>

        <!-- Bottom Actions -->
        <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <a href="javascript:void(0)" onclick="handleServiceLinkAction('${svc.link_action}', '${svc.code}')" class="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1">
            ${svc.link_text}
          </a>

          ${!isJagadita ? `
          <button onclick="handleServiceBtnAction('${svc.btn_action}', '${svc.code}')" class="px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors text-center ${btnClass}">
            ${svc.btn_text}
          </button>
          ` : `
          <a href="#papan-kendali" class="text-xs text-slate-500 hover:text-slate-700 font-medium">Buka Tabel Penuh ↓</a>
          `}
        </div>

        ${state.currentUser && state.currentUser.role === 'ADMIN' ? `
        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="openServiceEditModal(${svc.id})" class="p-1.5 bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 text-xs">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function getLucideIconName(name) {
  if (name === 'gavel' || name === 'calendar-clock') return 'gavel';
  if (name === 'shield-alert') return 'shield-alert';
  if (name === 'truck') return 'truck';
  if (name === 'scale') return 'scale';
  return 'layers';
}

function handleJagaditaCardSearch() {
  const input = document.getElementById('jagadita-quick-search');
  const val = input ? input.value.trim() : '';
  state.scheduleSearchQuery = val;
  const tableInput = document.getElementById('schedule-search-input');
  if (tableInput) tableInput.value = val;

  // Smooth scroll to table
  const el = document.getElementById('papan-kendali');
  if (el) el.scrollIntoView({ behavior: 'smooth' });

  loadHomepageData();
}

function handleServiceBtnAction(action, code) {
  if (action === 'OPEN_COMPLAINT_MODAL' || code === 'MASADU') {
    openModal('modal-complaint');
  } else if (action === 'OPEN_BB_DELIVERY_MODAL' || code === 'SEMARA_BAKTI') {
    openModal('modal-bb-delivery');
  } else if (action === 'OPEN_DATUN_MODAL' || code === 'DATUN') {
    openModal('modal-datun-consult');
  }
}

function handleServiceLinkAction(action, code) {
  if (action === 'GOTO_JAGADITA_TABLE') {
    const el = document.getElementById('papan-kendali');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else if (action === 'OPEN_TRACKER_MODAL') {
    openModal('modal-ticket-tracker');
  } else if (action === 'OPEN_BB_TERMS') {
    showToast('Persyaratan SEMARA BAKTI: KTP Asli & Bukti Kepemilikan Sah (STNK/BPKB/Kuitansi).', 'info');
  } else if (action === 'OPEN_DATUN_INFO') {
    showToast('Layanan Bantuan Hukum Datun Kejari Klungkung: Bebas Biaya untuk Pemerintah & Warga.', 'info');
  }
}

// ============================================================================
// SECTION 5: PAPAN KENDALI OPERASIONAL (JAGADITA TABLE & SKM CARD)
// ============================================================================

function renderControlBoard() {
  const c = state.contents;
  const title = document.getElementById('control-board-title');
  if (title && c.control_board_title) title.textContent = c.control_board_title.value;

  const note = document.getElementById('control-board-source-note');
  if (note && c.control_board_source_note) note.textContent = c.control_board_source_note.value;

  // 1. Render Schedule Tabs with Counts
  const tabAll = document.getElementById('tab-count-all');
  const tabPidum = document.getElementById('tab-count-pidum');
  const tabPidsus = document.getElementById('tab-count-pidsus');
  if (tabAll) tabAll.textContent = state.scheduleCounts.all;
  if (tabPidum) tabPidum.textContent = state.scheduleCounts.pidum;
  if (tabPidsus) tabPidsus.textContent = state.scheduleCounts.pidsus;

  // 2. Render JAGADITA Table Rows
  const tableBody = document.getElementById('jagadita-table-body');
  if (tableBody) {
    if (state.schedules.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8 text-sm text-slate-400">
            Tidak ada jadwal sidang yang sesuai dengan pencarian.
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = state.schedules.map(row => `
        <tr onclick="openScheduleDetailModal(${row.id})" title="Klik untuk melihat detail perkara &amp; sidang" class="jagadita-row-interactive hover:bg-emerald-50/60 transition-colors border-b border-slate-100 text-xs">
          <td class="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
            <div>${row.session_time}</div>
            <div class="text-[11px] text-slate-400 font-normal">${row.court_room}</div>
          </td>
          <td class="py-3.5 px-4">
            <div class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>${row.case_number}</span>
              <i data-lucide="info" class="w-3.5 h-3.5 text-emerald-700 opacity-70"></i>
            </div>
            <div class="text-slate-600">${row.defendant_name}</div>
          </td>
          <td class="py-3.5 px-4 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${row.case_type === 'PIDUM' ? 'bg-blue-100 text-blue-900' : 'bg-red-100 text-red-900'}">
              ${row.case_type}
            </span>
          </td>
          <td class="py-3.5 px-4 text-slate-700">
            ${row.agenda}
          </td>
          <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap">
            ${row.prosecutor}
          </td>
          <td class="py-3.5 px-4 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${getScheduleStatusBadgeClass(row.status)}">
              <span class="w-1.5 h-1.5 rounded-full ${getScheduleStatusDotClass(row.status)}"></span>
              ${row.status}
            </span>
          </td>
        </tr>
      `).join('');
      lucide.createIcons();
    }
  }

  // 3. Render SKM Card
  const skm = state.skm;
  const periodBadge = document.getElementById('skm-period-badge');
  if (periodBadge) periodBadge.textContent = skm.period_badge || 'TRIWULAN III';

  const scoreEl = document.getElementById('skm-main-score');
  if (scoreEl) {
    scoreEl.dataset.targetVal = skm.main_score || '88.31';
    scoreEl.textContent = skm.main_score || '88.31';
  }

  const predicateEl = document.getElementById('skm-predicate-text');
  if (predicateEl) predicateEl.textContent = skm.predicate || 'Mutu Pelayanan: A (Sangat Baik)';

  const respCountEl = document.getElementById('skm-respondents-count');
  if (respCountEl) {
    respCountEl.dataset.targetVal = skm.respondents_count || '412';
    respCountEl.textContent = skm.respondents_count || '412';
  }

  if (typeof initNumberCounters === 'function') {
    initNumberCounters();
  }

  // Render 4 Progress Bars
  const metricsContainer = document.getElementById('skm-metrics-container');
  if (metricsContainer && skm.metrics) {
    metricsContainer.innerHTML = skm.metrics.map(m => `
      <div>
        <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>${m.label}</span>
          <span class="font-bold text-emerald-800">${parseFloat(m.score).toFixed(1)}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-600 to-amber-500 h-2.5 rounded-full transition-all duration-700" style="width: ${Math.min(parseFloat(m.score), 100)}%"></div>
        </div>
      </div>
    `).join('');
  }
}

function getScheduleStatusBadgeClass(status) {
  if (status === 'SEDANG BERLANGSUNG') return 'badge-status-sedang';
  if (status === 'TERJADWAL') return 'badge-status-terjadwal';
  if (status === 'SELESAI') return 'badge-status-selesai';
  return 'bg-slate-100 text-slate-800';
}

function getScheduleStatusDotClass(status) {
  if (status === 'SEDANG BERLANGSUNG') return 'bg-amber-500 animate-pulse';
  if (status === 'TERJADWAL') return 'bg-blue-500';
  if (status === 'SELESAI') return 'bg-emerald-500';
  return 'bg-slate-400';
}

function setScheduleTab(type) {
  state.activeScheduleType = type;
  document.querySelectorAll('.schedule-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === type) {
      btn.className = 'schedule-tab-btn px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm';
    } else {
      btn.className = 'schedule-tab-btn px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200';
    }
  });

  loadHomepageData();
}

// ============================================================================
// SECTION 6: KANTOR & PETA KLUNGKUNG
// ============================================================================

function renderOfficeAndMap() {
  const c = state.contents;

  const title = document.getElementById('office-section-title');
  if (title && c.office_section_title) title.textContent = c.office_section_title.value;

  const desc = document.getElementById('office-description');
  if (desc && c.office_description) desc.textContent = c.office_description.value;

  const addr = document.getElementById('office-address-text');
  if (addr && c.office_address_text) addr.textContent = c.office_address_text.value;

  const hours = document.getElementById('office-hours-text');
  if (hours && c.office_hours_text) hours.textContent = c.office_hours_text.value;

  const mapImg = document.getElementById('office-map-image');
  if (mapImg && c.office_map_image_url) mapImg.src = c.office_map_image_url.value;

  const gmapsBtn = document.getElementById('office-gmaps-link');
  if (gmapsBtn && c.office_gmaps_url) gmapsBtn.href = c.office_gmaps_url.value;

  const waBtn = document.getElementById('office-whatsapp-btn');
  if (waBtn && c.office_whatsapp_number) {
    waBtn.href = `https://wa.me/${c.office_whatsapp_number.value}?text=Halo%20PTSP%20Kejaksaan%20Negeri%20Klungkung`;
  }
}

// ============================================================================
// SECTION 7: FOOTER
// ============================================================================

function renderFooter() {
  const c = state.contents;
  const copy = document.getElementById('footer-copyright');
  if (copy && c.footer_copyright) copy.textContent = c.footer_copyright.value;
}

// ============================================================================
// MODALS CONTROLLERS (PUBLIC & ADMIN)
// ============================================================================

function openModal(modalId) {
  if (modalId === 'modal-admin-login') {
    renderAdminLoginModalState();
  }
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function renderAdminLoginModalState() {
  const user = state.currentUser;
  const credForm = document.getElementById('form-login-step-credentials') || document.getElementById('admin-login-step1-form');
  const mfaForm = document.getElementById('form-login-step-mfa') || document.getElementById('admin-login-step2-mfa');
  const loggedPanel = document.getElementById('admin-logged-in-panel');
  const titleEl = document.getElementById('admin-login-modal-title');
  const subEl = document.getElementById('admin-login-modal-subtitle');

  if (user && user.role === 'ADMIN') {
    // SUDAH LOGIN: Sembunyikan form input, tampilkan panel info sesi aktif & satu tombol besar Log Out
    if (credForm) credForm.classList.add('hidden');
    if (mfaForm) mfaForm.classList.add('hidden');
    if (loggedPanel) {
      loggedPanel.classList.remove('hidden');

      const nameEl = document.getElementById('admin-logged-fullname');
      const roleEl = document.getElementById('admin-logged-label-role');
      const subText = document.getElementById('admin-logged-user-sub');
      const roleBadge = document.getElementById('admin-logged-role-badge');
      const initialsEl = document.getElementById('admin-logged-avatar-initials');

      const fullName = user.full_name || user.username || 'Administrator';
      const roleName = user.role === 'ADMIN' ? 'Master Administrator' : (user.role || 'Petugas Admin');
      const emailOrUser = user.email || user.username || 'admin@kejariklungkung.go.id';

      if (nameEl) nameEl.textContent = fullName;
      if (roleEl) roleEl.textContent = `${fullName} (${roleName})`;
      if (subText) subText.textContent = emailOrUser;
      if (roleBadge) roleBadge.textContent = `Sesi Aktif • ${roleName}`;
      if (initialsEl) {
        const parts = fullName.split(' ').filter(Boolean);
        const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : fullName.substring(0, 2).toUpperCase();
        initialsEl.textContent = initials;
      }
    }
    if (titleEl) titleEl.textContent = 'Status Akun Petugas & Admin';
    if (subEl) subEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sesi Login Aktif Terverifikasi';
  } else {
    // BELUM LOGIN: Tampilkan form input login seperti biasa
    if (loggedPanel) loggedPanel.classList.add('hidden');
    if (credForm) credForm.classList.remove('hidden');
    if (mfaForm) mfaForm.classList.add('hidden');
    if (titleEl) titleEl.textContent = 'Login Master Admin';
    if (subEl) subEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Google &amp; Microsoft Authenticator (2FA)';
  }
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

async function handleAdminLogoutFromModal() {
  const btn = document.getElementById('btn-modal-logout');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin">⏳</span> Memproses Log Out...';
  }
  await handleAdminLogout();
  renderAdminLoginModalState();
  closeModal('modal-admin-login');
  showToast('Anda telah berhasil keluar dari akun admin.', 'info');
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// 1. Submit MASADU Complaint
async function submitComplaintForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mengirim Laporan...';

  const payload = {
    title: form.title.value,
    category: form.category.value,
    chronology: form.chronology.value,
    is_anonymous: form.is_anonymous.checked,
    reporter_name: form.reporter_name.value,
    reporter_phone: form.reporter_phone.value,
  };

  try {
    const res = await fetch('/api/public/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-complaint');
      form.reset();
      showSuccessTicketModal(data.ticket_code, 'Pengaduan MASADU');
    } else {
      showToast(data.error || 'Gagal mengirim aduan', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kirim Laporan Pengaduan';
  }
}

// 2. Submit SEMARA BAKTI Delivery
async function submitDeliveryForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mendaftarkan Permohonan...';

  const payload = {
    case_number: form.case_number.value,
    defendant_name: form.defendant_name ? form.defendant_name.value : '',
    owner_name: form.owner_name.value,
    owner_job: form.owner_job ? form.owner_job.value : 'Wiraswasta',
    id_card_number: form.id_card_number.value,
    item_description: form.item_description.value,
    delivery_address: form.delivery_address.value,
    district: form.district.value,
    phone_number: form.phone_number.value,
    preferred_date: form.preferred_date.value,
  };

  try {
    const res = await fetch('/api/public/bb-deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-bb-delivery');
      form.reset();
      showSuccessTicketModal(data.ticket_code, 'Pengantaran BB SEMARA BAKTI');
    } else {
      showToast(data.error || 'Gagal mengirim permohonan', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ajukan Pengantaran Sekarang';
  }
}

// 3. Submit SKM Survey
async function submitSurveyForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Menyimpan Penilaian...';

  const payload = {
    respondent_name: form.respondent_name.value,
    respondent_phone: form.respondent_phone.value,
    service_used: form.service_used.value,
    score_persyaratan: form.score_persyaratan.value,
    score_waktu: form.score_waktu.value,
    score_biaya: form.score_biaya.value,
    score_petugas: form.score_petugas.value,
    comments: form.comments.value,
  };

  try {
    const res = await fetch('/api/public/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-skm-survey');
      form.reset();
      showToast(data.message, 'success');
      loadHomepageData();
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kirim Penilaian Survei';
  }
}

// 4. Ticket Tracker Lookup
async function lookupTicketCode() {
  const input = document.getElementById('tracker-input-code');
  const code = input ? input.value.trim() : '';
  if (!code) {
    showToast('Silakan masukkan nomor tiket layanan.', 'warning');
    return;
  }

  const resultContainer = document.getElementById('tracker-result-area');
  resultContainer.innerHTML = `<div class="text-center py-6 text-sm text-slate-500">Mencari data tiket...</div>`;

  try {
    const res = await fetch(`/api/public/ticket/${encodeURIComponent(code)}`);
    const data = await res.json();

    if (data.success) {
      const t = data.ticket;
      const isDelivery = t.ticket_code && t.ticket_code.startsWith('TRK-BB-');
      resultContainer.innerHTML = `
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-emerald-900">${t.ticket_code}</span>
            <span class="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-emerald-800 text-white">${t.status}</span>
          </div>
          <div class="font-semibold text-slate-800 mb-1">${t.ticket_type}</div>
          <div class="text-slate-600 mb-3">${t.title || t.item_description || 'Permohonan Layanan'}</div>
          <div class="bg-white p-3 rounded-lg border border-emerald-100 text-slate-700">
            <strong>Catatan Petugas:</strong> ${t.admin_notes || 'Sedang dalam proses telaah.'}
          </div>
          ${isDelivery ? `
            <div class="mt-3 pt-3 border-t border-emerald-200">
              <button type="button" onclick="openPublicBa20Modal('${t.ticket_code}')" class="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
                <i data-lucide="file-check-2" class="w-4 h-4 text-amber-300"></i>
                <span>Lihat &amp; Cetak Berita Acara BA-20 Resmi</span>
              </button>
            </div>
          ` : ''}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    } else {
      resultContainer.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs text-center">
          ${data.error}
        </div>
      `;
    }
  } catch (err) {
    resultContainer.innerHTML = `<div class="text-red-600 text-xs text-center py-4">Gagal terhubung ke server.</div>`;
  }
}

function showSuccessTicketModal(ticketCode, serviceTitle) {
  const container = document.getElementById('modal-ticket-success-content');
  if (container) {
    container.innerHTML = `
      <div class="text-center">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="check-circle-2" class="w-9 h-9"></i>
        </div>
        <h3 class="font-heading text-lg font-bold text-slate-900 mb-1">Permohonan Berhasil Dikirim!</h3>
        <p class="text-xs text-slate-600 mb-4">Layanan: <strong>${serviceTitle}</strong></p>
        
        <div class="bg-slate-100 border border-slate-300 p-4 rounded-xl mb-4">
          <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nomor Tiket Anda:</div>
          <div class="font-mono text-xl font-black text-emerald-900 tracking-wider">${ticketCode}</div>
        </div>

        <p class="text-[11px] text-slate-500 mb-5 leading-relaxed">
          Catat atau tangkap layar (screenshot) nomor tiket ini. Anda dapat menggunakannya kapan saja pada menu <strong>Lacak Tiket Layanan</strong> untuk memeriksa perkembangan proses.
        </p>

        <button onclick="closeModal('modal-ticket-success')" class="w-full py-2.5 bg-[#0B3B24] text-white font-bold rounded-xl text-xs hover:bg-[#072A19]">
          Selesai &amp; Tutup
        </button>
      </div>
    `;
    lucide.createIcons();
    openModal('modal-ticket-success');
  }
}

// Helper to extract YouTube Video ID from URL
function extractYouTubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[1] && match[1].length === 11) ? match[1] : null;
}

// 5. Read Full News Detail
async function openNewsDetail(slug) {
  try {
    const res = await fetch(`/api/public/news/${slug}`);
    const data = await res.json();
    if (data.success) {
      const p = data.post;
      const ytId = extractYouTubeVideoId(p.youtube_url);
      const modalBody = document.getElementById('news-detail-content');
      modalBody.innerHTML = `
        <div class="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl mb-6">
          <img src="${p.thumbnail_url}" alt="${p.title}" class="w-full h-full object-cover">
          <span class="absolute top-4 left-4 px-3 py-1 bg-[#0B3B24] text-white text-xs font-bold rounded-full">
            ${p.category}
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span>${p.published_at}</span>
          <span>•</span>
          <span class="font-medium text-emerald-900">Oleh: ${p.author}</span>
          <span>•</span>
          <span>${p.views} Kali Dilihat</span>
        </div>

        <h2 class="font-heading text-2xl font-bold text-slate-900 mb-4 leading-snug">
          ${p.title}
        </h2>

        ${p.highlight_quote ? `
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 text-sm text-amber-950 italic">
          "${p.highlight_quote}"
        </div>
        ` : ''}

        ${ytId ? `
        <div class="mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
          <div class="aspect-video w-full">
            <iframe class="w-full h-full" src="https://www.youtube.com/embed/${ytId}" title="Video Dokumentasi Berita" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
        ` : (p.youtube_url ? `
        <div class="mb-6">
          <a href="${p.youtube_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors">
            <i data-lucide="youtube" class="w-4 h-4"></i>
            <span>Tonton Video Dokumentasi di YouTube</span>
          </a>
        </div>
        ` : '')}

        <div class="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
          ${p.content || p.excerpt}
        </div>
      `;
      openModal('modal-news-detail');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } catch (err) {
    showToast('Gagal memuat detail artikel', 'error');
  }
}

// ============================================================================
// AUTH & ADMIN CMS LIVE INLINE EDIT SYSTEM
// ============================================================================

async function checkAuthSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.authenticated) {
      state.currentUser = data.user;
    } else {
      state.currentUser = null;
    }
  } catch (err) {
    state.currentUser = null;
  }
  renderAdminLoginModalState();
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const form = e.target;
  const username = (form.username?.value || document.getElementById('login-input-username')?.value || document.getElementById('admin-input-username')?.value || '').trim();
  const password = (form.password?.value || document.getElementById('login-input-password')?.value || document.getElementById('admin-input-password')?.value || '').trim();

  if (!username || !password) {
    showToast('Harap masukkan username dan kata sandi.', 'error');
    return;
  }

  const btnStep1 = document.getElementById('btn-login-step1') || document.getElementById('btn-admin-login-step1');
  if (btnStep1) {
    btnStep1.disabled = true;
    btnStep1.innerHTML = '<span class="animate-spin">⏳</span> Memeriksa Kredensial...';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.require_mfa) {
      // Transition to Step 2: Google / Microsoft Authenticator TOTP Verification
      state.pendingMfaToken = data.mfa_token;
      state.pendingTotpSecret = data.totp_secret || '';
      state.pendingTotpFormatted = data.totp_secret_formatted || data.totp_secret || '';
      state.pendingUsername = username;

      // Determine enrollment status: server says enrolled, or local storage has record
      const isEnrolled = !!(data.mfa_enrolled || localStorage.getItem('mfa_enrolled_' + username) === '1');
      state.isMfaEnrolled = isEnrolled;

      const step1 = document.getElementById('form-login-step-credentials') || document.getElementById('admin-login-step1-form');
      const step2 = document.getElementById('form-login-step-mfa') || document.getElementById('admin-login-step2-mfa');
      const emailTarget = document.getElementById('mfa-target-email');
      const otpInput = document.getElementById('mfa-otp-input') || document.getElementById('admin-input-mfa-code');
      const qrContainer = document.getElementById('mfa-qr-container');
      const secretDisplay = document.getElementById('mfa-secret-display');
      const tabsSwitcher = document.getElementById('mfa-tabs-switcher');
      const qrPanel = document.getElementById('mfa-panel-qr');
      const promptText = document.getElementById('mfa-prompt-text');

      if (emailTarget) emailTarget.textContent = data.account_name || data.masked_email;
      if (secretDisplay) secretDisplay.textContent = state.pendingTotpFormatted;

      if (step1 && step2) {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
      }

      if (isEnrolled) {
        // Enrolled: strictly hide QR setup, hide tabs switcher, show only OTP code input
        if (tabsSwitcher) tabsSwitcher.classList.add('hidden');
        if (qrPanel) qrPanel.classList.add('hidden');
        if (qrContainer) qrContainer.innerHTML = '';
        if (promptText) {
          promptText.innerHTML = 'Masukkan 6 digit kode yang tampil pada aplikasi <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong> Anda.';
        }
        switchMfaLoginSubTab('verify');
      } else {
        // Not yet enrolled: show QR code setup so user can scan it first
        if (qrContainer && data.qr_svg) qrContainer.innerHTML = data.qr_svg;
        if (tabsSwitcher) tabsSwitcher.classList.remove('hidden');
        if (promptText) {
          promptText.innerHTML = 'Masukkan 6-digit kode dari aplikasi <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong> Anda. Belum scan QR? Buka tab <button type="button" onclick="switchMfaLoginSubTab(\'qr\')" class="font-extrabold underline text-emerald-950 hover:text-amber-700">Scan QR Aplikasi</button>.';
        }
        switchMfaLoginSubTab('qr');
      }

      selectMfaAppBadge(data.mfa_provider === 'MICROSOFT' ? 'MICROSOFT' : 'GOOGLE');
      startMfaTotpCountdown();

      if (otpInput) {
        otpInput.value = '';
        if (isEnrolled) {
          setTimeout(() => otpInput.focus(), 150);
        }
      }

      lucide.createIcons();
      showToast(isEnrolled ? 'Buka Google / Microsoft Authenticator & masukkan 6-digit kode TOTP.' : 'Pindai QR Code di aplikasi Authenticator untuk mengaktifkan 2FA.', 'info');
    } else if (data.success) {
      state.currentUser = data.user;
      renderAdminLoginModalState();
      closeModal('modal-admin-login');
      showToast(data.message, 'success');
      renderAdminFloatingBar();
      resetLoginModal();
      await initProfilePageCms();
      await initInformationPageCms();
    } else {
      showToast(data.error || 'Login gagal. Periksa kembali kredensial Anda.', 'error');
    }
  } catch (err) {
    showToast('Gagal terhubung ke server', 'error');
  } finally {
    if (btnStep1) {
      btnStep1.disabled = false;
      btnStep1.innerHTML = '<span>Lanjutkan ke Google / Microsoft MFA</span> <i data-lucide="arrow-right" class="w-4 h-4 text-amber-400"></i>';
      lucide.createIcons();
    }
  }
}

function switchMfaLoginSubTab(mode) {
  // If user has already enrolled MFA, forbid switching to QR tab and force verification form
  if (state.isMfaEnrolled && mode === 'qr') {
    mode = 'verify';
  }
  const panelVerify = document.getElementById('mfa-panel-verify');
  const panelQr = document.getElementById('mfa-panel-qr');
  const btnVerify = document.getElementById('mfa-subtab-btn-verify');
  const btnQr = document.getElementById('mfa-subtab-btn-qr');

  if (mode === 'qr' && !state.isMfaEnrolled) {
    if (panelVerify) panelVerify.classList.add('hidden');
    if (panelQr) panelQr.classList.remove('hidden');
    if (btnQr) btnQr.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] bg-[#0B3B24] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
    if (btnVerify) btnVerify.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all';
  } else {
    if (panelQr) panelQr.classList.add('hidden');
    if (panelVerify) panelVerify.classList.remove('hidden');
    if (btnVerify) btnVerify.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] bg-[#0B3B24] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
    if (btnQr) btnQr.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all';
    const otpInput = document.getElementById('mfa-otp-input') || document.getElementById('admin-input-mfa-code');
    if (otpInput) setTimeout(() => otpInput.focus(), 80);
  }
  lucide.createIcons();
}

function selectMfaAppBadge(provider) {
  const gBtn = document.getElementById('mfa-badge-google');
  const mBtn = document.getElementById('mfa-badge-microsoft');
  const appNameEl = document.getElementById('mfa-selected-app-name');
  const guideTitle = document.getElementById('mfa-qr-guide-title');
  const guideSteps = document.getElementById('mfa-qr-guide-steps');

  if (provider === 'MICROSOFT') {
    if (mBtn) mBtn.className = 'px-3 py-1.5 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-950 font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all';
    if (gBtn) gBtn.className = 'px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[11px] flex items-center gap-1.5 transition-all';
    if (appNameEl) appNameEl.textContent = 'Microsoft Authenticator';
    if (guideTitle) guideTitle.textContent = 'Panduan Microsoft Authenticator:';
    if (guideSteps) {
      guideSteps.innerHTML = `
        <li>Buka aplikasi <strong>Microsoft Authenticator</strong> di smartphone Anda.</li>
        <li>Ketuk ikon <strong>+ (Add account)</strong> &rarr; pilih <strong>Other account (Google, Facebook, etc.)</strong>.</li>
        <li>Arahkan kamera ke QR Code di bawah, lalu masukkan 6-digit kode yang tampil.</li>
      `;
    }
  } else {
    if (gBtn) gBtn.className = 'px-3 py-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all';
    if (mBtn) mBtn.className = 'px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[11px] flex items-center gap-1.5 transition-all';
    if (appNameEl) appNameEl.textContent = 'Google Authenticator';
    if (guideTitle) guideTitle.textContent = 'Panduan Google Authenticator:';
    if (guideSteps) {
      guideSteps.innerHTML = `
        <li>Buka aplikasi <strong>Google Authenticator</strong> di smartphone Anda.</li>
        <li>Ketuk tombol <strong>+</strong> di kanan bawah &rarr; pilih <strong>Scan a QR code</strong>.</li>
        <li>Arahkan kamera ke QR Code di bawah, lalu masukkan 6-digit kode yang tampil.</li>
      `;
    }
  }
}

function startMfaTotpCountdown() {
  if (state.mfaTimerInterval) clearInterval(state.mfaTimerInterval);

  const updateTick = () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const rem = 30 - (nowSec % 30);
    const textEl = document.getElementById('mfa-totp-countdown-text');
    const barEl = document.getElementById('mfa-totp-progress-bar');

    if (textEl) textEl.textContent = `${rem} dtk`;
    if (barEl) {
      const pct = Math.max(4, Math.round((rem / 30) * 100));
      barEl.style.width = `${pct}%`;
    }
  };

  updateTick();
  state.mfaTimerInterval = setInterval(updateTick, 1000);
}

function copyMfaSecretKey() {
  const key = state.pendingTotpSecret || '';
  if (!key) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(key);
  }
  showToast('Kunci Setup Base32 berhasil disalin!', 'success');
}

async function handleMfaVerify(e) {
  e.preventDefault();
  const otpInput = document.getElementById('mfa-otp-input') || document.getElementById('admin-input-mfa-code');
  const otpCode = otpInput ? otpInput.value.trim() : '';

  if (!otpCode || otpCode.length !== 6) {
    showToast('Masukkan 6-digit kode Authenticator dengan lengkap.', 'error');
    return;
  }

  const btnMfa = document.getElementById('btn-login-mfa') || document.getElementById('btn-admin-login-step2');
  if (btnMfa) {
    btnMfa.disabled = true;
    btnMfa.innerHTML = '<span class="animate-spin">⏳</span> Memverifikasi Kode Authenticator...';
  }

  try {
    const res = await fetch('/api/auth/verify-mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mfa_token: state.pendingMfaToken,
        otp_code: otpCode
      })
    });
    const data = await res.json();
    if (data.success) {
      // Remember MFA enrolled status for this user in localStorage
      if (state.pendingUsername) {
        localStorage.setItem('mfa_enrolled_' + state.pendingUsername, '1');
      }
      if (data.user) {
        if (data.user.username) localStorage.setItem('mfa_enrolled_' + data.user.username, '1');
        if (data.user.email) localStorage.setItem('mfa_enrolled_' + data.user.email, '1');
      }
      state.currentUser = data.user;
      renderAdminLoginModalState();
      closeModal('modal-admin-login');
      showToast(data.message, 'success');
      renderAdminFloatingBar();
      resetLoginModal();
      await initProfilePageCms();
      await initInformationPageCms();
    } else {
      showToast(data.error || 'Verifikasi MFA gagal!', 'error');
    }
  } catch (err) {
    showToast('Gagal memverifikasi kode MFA. Coba lagi.', 'error');
  } finally {
    if (btnMfa) {
      btnMfa.disabled = false;
      btnMfa.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <span>Verifikasi &amp; Masuk Dashboard</span>';
      lucide.createIcons();
    }
  }
}

function resetLoginModal() {
  if (state.mfaTimerInterval) {
    clearInterval(state.mfaTimerInterval);
    state.mfaTimerInterval = null;
  }
  const step1 = document.getElementById('form-login-step-credentials') || document.getElementById('admin-login-step1-form');
  const step2 = document.getElementById('form-login-step-mfa') || document.getElementById('admin-login-step2-mfa');
  if (step1 && step2) {
    if (typeof step1.reset === 'function') step1.reset();
    if (typeof step2.reset === 'function') step2.reset();
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
  }
  const qrContainer = document.getElementById('mfa-qr-container');
  if (qrContainer) qrContainer.innerHTML = '';
  state.pendingMfaToken = null;
  state.pendingTotpSecret = null;
  state.pendingUsername = null;
  state.isMfaEnrolled = false;
  renderAdminLoginModalState();
  lucide.createIcons();
}

async function handleAdminLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  state.currentUser = null;
  state.isLiveEditActive = false;
  document.body.classList.remove('live-edit-active');
  const bar = document.getElementById('admin-floating-bar');
  if (bar) bar.remove();
  renderAdminLoginModalState();
  showToast('Admin berhasil logout', 'info');
  loadHomepageData();
  await initProfilePageCms();
  await initInformationPageCms();
}

function renderAdminFloatingBar() {
  let bar = document.getElementById('admin-floating-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'admin-floating-bar';
    bar.className = 'admin-floating-bar';
    document.body.appendChild(bar);
  }

  if (!state.currentUser) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';

  const isExpanded = !!state.adminBarMobileExpanded;
  if (isExpanded) {
    bar.classList.add('is-expanded');
  } else {
    bar.classList.remove('is-expanded');
  }

  const pType = getProfilePageType();
  const profileActionBtnDesktop = (pType && pType !== 'STRUKTUR_ORGANISASI') ? `
    <button onclick="openAddProfileItemModal('${pType}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-sm">
      <i data-lucide="plus" class="w-3.5 h-3.5"></i>
      <span>+ Tambah Item ${pType === 'VISI_MISI' ? 'Misi' : pType === 'SEJARAH' ? 'Sejarah' : pType === 'LOGO_MAKNA' ? 'Elemen Logo' : 'Bidang'}</span>
    </button>
  ` : '';

  const iType = getInformationPageType();
  let infoActionBtnDesktop = '';
  if (iType === 'INFO_BERITA') {
    infoActionBtnDesktop = `
      <button onclick="openAddNewsModal()" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-sm">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        <span>+ Tambah Berita Baru</span>
      </button>
    `;
  } else if (iType === 'INFO_PENGUMUMAN') {
    infoActionBtnDesktop = `
      <button onclick="openAddAnnouncementModal()" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-sm">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        <span>+ Tambah Pengumuman</span>
      </button>
    `;
  } else if (iType === 'INFO_SIDANG') {
    infoActionBtnDesktop = `
      <button onclick="openAddJagaditaModal()" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-sm">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        <span>+ Tambah Jadwal Sidang</span>
      </button>
    `;
  } else if (iType === 'INFO_SKM') {
    infoActionBtnDesktop = `
      <button onclick="openSkmEditModal()" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-sm">
        <i data-lucide="award" class="w-3.5 h-3.5"></i>
        <span>✏️ Edit Skor & Indikator SKM</span>
      </button>
    `;
  }

  // Mobile contextual action
  let mobilePageActionBtn = '';
  if (pType && pType !== 'STRUKTUR_ORGANISASI') {
    mobilePageActionBtn = `
      <button onclick="openAddProfileItemModal('${pType}')" class="p-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center justify-center gap-1.5 shadow-sm col-span-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>+ Tambah Item ${pType === 'VISI_MISI' ? 'Misi' : pType === 'SEJARAH' ? 'Sejarah' : pType === 'LOGO_MAKNA' ? 'Elemen Logo' : 'Bidang'}</span>
      </button>
    `;
  } else if (iType === 'INFO_BERITA') {
    mobilePageActionBtn = `
      <button onclick="openAddNewsModal()" class="p-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center justify-center gap-1.5 shadow-sm col-span-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>+ Tambah Berita Baru</span>
      </button>
    `;
  } else if (iType === 'INFO_PENGUMUMAN') {
    mobilePageActionBtn = `
      <button onclick="openAddAnnouncementModal()" class="p-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center justify-center gap-1.5 shadow-sm col-span-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>+ Tambah Pengumuman</span>
      </button>
    `;
  } else if (iType === 'INFO_SIDANG') {
    mobilePageActionBtn = `
      <button onclick="openAddJagaditaModal()" class="p-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center justify-center gap-1.5 shadow-sm col-span-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>+ Tambah Jadwal Sidang</span>
      </button>
    `;
  } else if (iType === 'INFO_SKM') {
    mobilePageActionBtn = `
      <button onclick="openSkmEditModal()" class="p-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center justify-center gap-1.5 shadow-sm col-span-2">
        <i data-lucide="award" class="w-4 h-4"></i>
        <span>✏️ Edit Skor & Indikator SKM</span>
      </button>
    `;
  }

  bar.innerHTML = `
    <!-- DESKTOP TOOLBAR (>= 1024px) -->
    <div class="hidden lg:flex items-center gap-3 text-xs font-bold text-white">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span>👑 Admin: <strong class="text-amber-300">${state.currentUser.full_name}</strong></span>
      </div>

      <div class="h-4 w-px bg-emerald-700"></div>

      <button onclick="toggleLiveEditMode()" class="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${state.isLiveEditActive ? 'bg-amber-400 text-slate-900 shadow-lg' : 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'}">
        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
        <span>Mode Edit Langsung: ${state.isLiveEditActive ? 'AKTIF' : 'NONAKTIF'}</span>
      </button>

      ${profileActionBtnDesktop}
      ${infoActionBtnDesktop}

      <a href="/admin" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-emerald-950 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm">
        <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i> Dashboard Backoffice
      </a>

      <button onclick="handleAdminLogout()" class="text-xs text-red-300 hover:text-red-200 font-semibold px-2">
        Logout
      </button>
    </div>

    <!-- MOBILE TOOLBAR (< 1024px) -->
    <div class="lg:hidden w-full">
      ${!isExpanded ? `
        <!-- COLLAPSED COMPACT PILL ON MOBILE -->
        <div class="flex items-center justify-between gap-2">
          <button type="button" onclick="toggleAdminBarMobileExpanded()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-bold border border-amber-400/80 shadow-md">
            <span class="w-2 h-2 rounded-full ${state.isLiveEditActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}"></span>
            <span>👑 Admin</span>
            <i data-lucide="chevron-up" class="w-3.5 h-3.5 text-amber-400"></i>
          </button>

          <button type="button" onclick="toggleLiveEditMode()" class="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${state.isLiveEditActive ? 'bg-amber-400 text-slate-950 shadow-amber-400/40 font-black animate-pulse' : 'bg-emerald-950 text-emerald-200 border border-emerald-700/80'}">
            <i data-lucide="${state.isLiveEditActive ? 'check' : 'edit-3'}" class="w-3.5 h-3.5"></i>
            <span>${state.isLiveEditActive ? 'Edit: AKTIF' : 'Mode Edit'}</span>
          </button>
        </div>
      ` : `
        <!-- EXPANDED ACTION SHEET ON MOBILE -->
        <div class="w-full space-y-2.5 p-1">
          <div class="flex items-center justify-between pb-2 border-b border-emerald-800/60">
            <div class="flex items-center gap-2 text-xs font-bold text-white">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>👑 Admin: <strong class="text-amber-300">${state.currentUser.full_name}</strong></span>
            </div>
            <button type="button" onclick="toggleAdminBarMobileExpanded()" class="p-1 rounded-full text-slate-300 hover:text-white bg-emerald-900/80 text-xs">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs font-bold">
            <!-- Toggle Edit Mode -->
            <button onclick="toggleLiveEditMode()" class="col-span-2 p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${state.isLiveEditActive ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'bg-emerald-900/90 text-emerald-100 hover:bg-emerald-800 border border-emerald-700'}">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
              <span>Mode Edit Langsung: <strong>${state.isLiveEditActive ? 'AKTIF' : 'NONAKTIF'}</strong></span>
            </button>

            ${mobilePageActionBtn}

            <!-- Dashboard -->
            <a href="/admin" class="${mobilePageActionBtn ? 'col-span-1' : 'col-span-2'} p-2.5 rounded-xl bg-white text-emerald-950 flex items-center justify-center gap-1.5 shadow-sm text-center">
              <i data-lucide="layout-dashboard" class="w-4 h-4 text-emerald-800"></i>
              <span>Dashboard Backoffice</span>
            </a>

            <!-- Logout -->
            <button onclick="handleAdminLogout()" class="col-span-2 p-2 rounded-xl bg-red-950/80 text-red-200 border border-red-800/60 hover:bg-red-900 flex items-center justify-center gap-1.5">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      `}
    </div>
  `;

  if (window.lucide) {
    lucide.createIcons();
  }
}

function toggleAdminBarMobileExpanded() {
  state.adminBarMobileExpanded = !state.adminBarMobileExpanded;
  renderAdminFloatingBar();
}
window.toggleAdminBarMobileExpanded = toggleAdminBarMobileExpanded;

function toggleLiveEditMode() {
  state.isLiveEditActive = !state.isLiveEditActive;
  if (state.isLiveEditActive) {
    document.body.classList.add('live-edit-active');
    showToast('Mode Edit Langsung AKTIF. Klik teks mana pun atau ganti gambar.', 'success');
  } else {
    document.body.classList.remove('live-edit-active');
    showToast('Mode Edit Langsung NONAKTIF.', 'info');
  }
  renderAdminFloatingBar();
  initProfilePageCms();
  initInformationPageCms();
}

// ============================================================================
// LIVE INLINE CMS CLICK HANDLERS & MODAL MANAGEMENT
// ============================================================================

function setupEventListeners() {
  // Delegate clicks on [data-cms-key]
  document.body.addEventListener('click', (e) => {
    if (!state.isLiveEditActive) return;

    const target = e.target.closest('[data-cms-key]');
    if (target && !e.target.closest('.cms-image-overlay') && !e.target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      const key = target.getAttribute('data-cms-key');
      const label = target.getAttribute('data-cms-label') || key;
      const curVal = (state.contents && state.contents[key]) ? state.contents[key].value : target.innerText;
      openContentInlineModal(key, label, curVal);
    }
  });

  // Table search input
  const tableSearch = document.getElementById('schedule-search-input');
  if (tableSearch) {
    tableSearch.addEventListener('input', (e) => {
      state.scheduleSearchQuery = e.target.value.trim();
      loadHomepageData();
    });
  }

  // Auto-open admin login modal if ?login=admin in query
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'admin') {
      setTimeout(() => openModal('modal-admin-login'), 200);
    }
  } catch (_) {}
}

// Inline Content Edit Modal
function openContentInlineModal(key, label, currentValue) {
  ensureCmsModals();
  const modal = document.getElementById('modal-inline-edit');
  if (!modal) return;

  document.getElementById('inline-edit-key').value = key;
  document.getElementById('inline-edit-label').textContent = label;
  
  const textarea = document.getElementById('inline-edit-value');
  textarea.value = currentValue;

  openModal('modal-inline-edit');
}

async function saveInlineContent(e) {
  e.preventDefault();
  const key = document.getElementById('inline-edit-key').value;
  const value = document.getElementById('inline-edit-value').value;

  try {
    const res = await fetch('/api/admin/page-contents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_key: key, content_value: value }),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-inline-edit');
      showToast(data.message || 'Perubahan teks berhasil disimpan!', 'success');
      
      // Update DOM immediately
      document.querySelectorAll(`[data-cms-key="${key}"]`).forEach(el => {
        el.innerText = value;
      });

      if (state.contents) {
        state.contents[key] = { value: value };
      }

      loadHomepageData();
      if (getProfilePageType()) {
        await initProfilePageCms();
      }
    } else {
      showToast(data.error || 'Gagal menyimpan perubahan', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

// Image Edit Modal
let activeImageEditTarget = null;

function openImageEditModal(targetType, targetId, currentUrl) {
  ensureCmsModals();
  activeImageEditTarget = { targetType, targetId, currentUrl };
  const preview = document.getElementById('image-edit-preview');
  if (preview) preview.src = currentUrl || '/static/images/logo-kejari.svg';
  openModal('modal-image-edit');
}

async function handleImageUploadChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const base64Data = evt.target.result;
    const preview = document.getElementById('image-edit-preview');
    if (preview) preview.src = base64Data;

    try {
      const payload = {
        file_data: base64Data,
        filename: file.name,
      };

      if (activeImageEditTarget && activeImageEditTarget.targetType === 'page_contents') {
        payload.content_key = activeImageEditTarget.targetId;
      }

      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (activeImageEditTarget && activeImageEditTarget.targetType === 'posts') {
          // Update post thumbnail
          await fetch(`/api/admin/news/${activeImageEditTarget.targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thumbnail_url: data.url }),
          });
        } else if (activeImageEditTarget && activeImageEditTarget.targetType === 'announcements') {
          // Update announcement flyer/image
          await fetch(`/api/admin/announcements/${activeImageEditTarget.targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: data.url }),
          });
        }

        closeModal('modal-image-edit');
        showToast('Foto/Logo berhasil diperbarui seketika!', 'success');

        // Instantly update elements on the page
        const newUrl = data.url;
        if (activeImageEditTarget && activeImageEditTarget.targetId === 'header_logo_url') {
          document.querySelectorAll('.site-logo-img').forEach(img => img.src = newUrl);
          const emblem = document.getElementById('profil-logo-official-img');
          if (emblem) emblem.src = newUrl;
        }
        if (activeImageEditTarget && activeImageEditTarget.targetId) {
          const imgElem = document.getElementById(activeImageEditTarget.targetId.replace(/_/g, '-'));
          if (imgElem) imgElem.src = newUrl;
        }

        loadHomepageData();
        if (getProfilePageType()) {
          await initProfilePageCms();
        }
        if (getInformationPageType()) {
          await initInformationPageCms();
        }
      } else {
        showToast(data.error || 'Gagal mengunggah foto', 'error');
      }
    } catch (err) {
      showToast('Gagal memproses unggahan', 'error');
    }
  };
  reader.readAsDataURL(file);
}

// ============================================================================
// PROFILE PAGES CMS CONTROLLER (Visi Misi, Sejarah, Logo Makna, Tugas Wewenang)
// ============================================================================

function getProfilePageType() {
  const p = window.location.pathname;
  if (p.includes('visi-misi')) return 'VISI_MISI';
  if (p.includes('sejarah')) return 'SEJARAH';
  if (p.includes('logo-makna')) return 'LOGO_MAKNA';
  if (p.includes('tugas-wewenang')) return 'TUGAS_WEWENANG';
  if (p.includes('struktur-organisasi')) return 'STRUKTUR_ORGANISASI';
  return null;
}

function getInformationPageType() {
  const p = window.location.pathname;
  if (p.includes('informasi-berita') || p === '/informasi/berita') return 'INFO_BERITA';
  if (p.includes('informasi-pengumuman') || p === '/informasi/pengumuman') return 'INFO_PENGUMUMAN';
  if (p.includes('informasi-jadwal-sidang') || p === '/informasi/jadwal-sidang') return 'INFO_SIDANG';
  if (p.includes('informasi-skm') || p === '/informasi/skm' || p.includes('ikm')) return 'INFO_SKM';
  return null;
}

function ensureCommonModals() {
  // 1. Ticket Tracker Modal (PTSP)
  if (!document.getElementById('modal-ticket-tracker')) {
    const trackerDiv = document.createElement('div');
    trackerDiv.id = 'modal-ticket-tracker';
    trackerDiv.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4';
    trackerDiv.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 class="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <i data-lucide="search" class="w-4 h-4 text-emerald-800"></i>
            <span>Lacak Tiket Layanan PTSP</span>
          </h3>
          <button type="button" onclick="closeModal('modal-ticket-tracker')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-6">
          <p class="text-xs text-slate-600 mb-4">
            Masukkan nomor tiket yang Anda dapatkan saat mengirim aduan (MASADU) atau mengajukan pengantaran barang bukti (SEMARA BAKTI).
          </p>
          <div class="flex gap-2 mb-4">
            <input type="text" id="tracker-input-code" placeholder="Contoh: TRK-MASADU-8821 atau TRK-BB-4102" class="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 uppercase font-mono">
            <button type="button" onclick="lookupTicketCode()" class="px-4 py-2.5 rounded-xl bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#072A19] shadow-sm">
              Cari
            </button>
          </div>
          <div id="tracker-result-box" class="hidden p-4 rounded-xl border text-xs"></div>
        </div>
      </div>
    `;
    document.body.appendChild(trackerDiv);
  }

  // 2. Admin Login Modal (Dual-Factor MFA)
  if (!document.getElementById('modal-admin-login')) {
    const adminDiv = document.createElement('div');
    adminDiv.id = 'modal-admin-login';
    adminDiv.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4';
    adminDiv.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-[#0B3B24] to-[#072A19] text-white">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400">
              <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 id="admin-login-modal-title" class="font-heading font-extrabold text-sm text-white">Login Master Admin</h3>
              <span id="admin-login-modal-subtitle" class="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Google &amp; Microsoft Authenticator (2FA)
              </span>
            </div>
          </div>
          <button type="button" onclick="closeModal('modal-admin-login')" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- AUTHENTICATED STATE: JIKA ADMIN SUDAH LOGIN -->
        <div id="admin-logged-in-panel" class="hidden p-6 space-y-5 text-xs animate-in fade-in">
          <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-teal-50 border border-emerald-200/80 flex items-start gap-3.5 shadow-xs">
            <div class="w-12 h-12 rounded-2xl bg-[#0B3B24] text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
              <span id="admin-logged-avatar-initials">AD</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-800 text-amber-300 font-extrabold text-[10px] mb-1 tracking-wide uppercase">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                <span id="admin-logged-role-badge">Sesi Aktif • Administrator</span>
              </div>
              <h4 class="font-heading font-black text-sm text-slate-900 truncate" id="admin-logged-fullname">R. Indra Senjaya, S.H., M.H.</h4>
              <p class="text-[11px] text-slate-600 truncate mt-0.5" id="admin-logged-user-sub">admin@kejariklungkung.go.id</p>
            </div>
          </div>

          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 space-y-2">
            <div class="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-700"></i>
              <span>Anda saat ini sudah login sebagai <strong id="admin-logged-label-role" class="text-[#0B3B24]">Administrator</strong></span>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed">
              Anda memiliki hak akses penuh untuk mengelola berita, jadwal sidang, struktur organisasi, dan konten publik melalui Dashboard CMS.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <a href="/admin" class="py-2.5 px-3 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition-all">
              <i data-lucide="layout-dashboard" class="w-4 h-4 text-amber-400"></i>
              <span>Dashboard CMS</span>
            </a>
            <button type="button" onclick="toggleLiveVisualEditor(); closeModal('modal-admin-login');" class="py-2.5 px-3 rounded-xl border border-emerald-700 bg-white hover:bg-emerald-50 text-emerald-900 font-bold flex items-center justify-center gap-1.5 transition-all">
              <i data-lucide="edit-3" class="w-4 h-4 text-emerald-700"></i>
              <span>Mode Edit Live</span>
            </button>
          </div>

          <!-- SATU TOMBOL BESAR UNTUK LOG OUT -->
          <button type="button" id="btn-modal-logout" onclick="handleAdminLogoutFromModal()" class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-800 text-white font-heading font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer">
            <i data-lucide="log-out" class="w-4 h-4 text-white"></i>
            <span>Log Out (Keluar dari Akun)</span>
          </button>
        </div>

        <form id="form-login-step-credentials" onsubmit="handleAdminLogin(event)" class="p-6 space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email / NIP / Username *</label>
            <div class="relative">
              <input type="text" id="login-input-username" name="username" required placeholder="Masukkan email atau username admin" class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]">
              <i data-lucide="user" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Password *</label>
            <div class="relative">
              <input type="password" id="login-input-password" name="password" required placeholder="Masukkan kata sandi" class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]">
              <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
            </div>
          </div>
          <button type="submit" id="btn-login-step1" class="w-full py-3 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-heading font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
            <span>Lanjutkan ke Google / Microsoft MFA</span>
            <i data-lucide="arrow-right" class="w-4 h-4 text-amber-400"></i>
          </button>
        </form>

        <form id="form-login-step-mfa" onsubmit="handleMfaVerify(event)" class="hidden p-5 sm:p-6 space-y-4 text-xs">
          <!-- Supported Authenticator App Badges -->
          <div class="flex items-center justify-center gap-2">
            <button type="button" onclick="selectMfaAppBadge('GOOGLE')" id="mfa-badge-google" class="px-3 py-1.5 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-950 font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all">
              <span class="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-blue-600">G</span>
              <span>Google Authenticator</span>
            </button>
            <button type="button" onclick="selectMfaAppBadge('MICROSOFT')" id="mfa-badge-microsoft" class="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-950 font-bold text-[11px] flex items-center gap-1.5 transition-all">
              <span class="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-black text-[9px]">M</span>
              <span>Microsoft Authenticator</span>
            </button>
          </div>

          <!-- Mode Switcher Tabs: Verify Code vs Scan QR Setup -->
          <div id="mfa-tabs-switcher" class="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button type="button" id="mfa-subtab-btn-verify" onclick="switchMfaLoginSubTab('verify')" class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-[#0B3B24] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all">
              <i data-lucide="key-round" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Masukkan Kode</span>
            </button>
            <button type="button" id="mfa-subtab-btn-qr" onclick="switchMfaLoginSubTab('qr')" class="py-1.5 px-2 rounded-lg font-bold text-[11px] text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all">
              <i data-lucide="qr-code" class="w-3.5 h-3.5 text-emerald-700"></i>
              <span>Scan QR Aplikasi</span>
            </button>
          </div>

          <!-- SUB-PANEL A: ENTER 6-DIGIT TOTP CODE -->
          <div id="mfa-panel-verify" class="space-y-3.5">
            <div class="text-center space-y-1">
              <h4 id="mfa-selected-app-title" class="font-heading font-black text-sm text-slate-900">Otentikasi Dua Langkah (TOTP 6-Digit)</h4>
              <p class="text-[11px] text-slate-500 leading-snug">
                Buka aplikasi <strong id="mfa-selected-app-name" class="text-slate-800">Google / Microsoft Authenticator</strong> untuk akun:<br>
                <strong id="mfa-target-email" class="text-emerald-900 font-bold"></strong>
              </p>
            </div>

            <div class="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-left space-y-1">
              <p id="mfa-prompt-text" class="text-[11px] text-emerald-900/90 leading-relaxed">
                Masukkan 6 digit kode yang tampil pada aplikasi <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong> Anda.
              </p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 text-center mb-1.5">Masukkan 6-Digit Kode Authenticator</label>
              <input type="text" id="mfa-otp-input" maxlength="6" pattern="[0-9]{6}" inputmode="numeric" autocomplete="one-time-code" required placeholder="000000" class="w-full py-2.5 text-center font-mono font-black text-2xl tracking-[0.4em] border-2 border-emerald-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-700/20 text-slate-900 bg-emerald-50/30">
            </div>

            <button type="submit" id="btn-login-mfa" class="w-full py-2.5 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i>
              <span>Verifikasi &amp; Masuk Dashboard</span>
            </button>
          </div>

          <!-- SUB-PANEL B: SCAN QR CODE -->
          <div id="mfa-panel-qr" class="hidden space-y-3">
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
              <span class="font-extrabold flex items-center gap-1.5 text-emerald-900">
                <i data-lucide="smartphone" class="w-4 h-4 text-emerald-700"></i>
                <span id="mfa-qr-guide-title">Panduan Hubungkan Google / Microsoft Authenticator:</span>
              </span>
            </div>
            <div class="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-800/30 rounded-2xl shadow-inner">
              <div id="mfa-qr-container" class="w-44 h-44 bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-center"></div>
              <span class="text-[10px] font-bold text-slate-500 mt-1.5">KERTAGOSA Kejari Klungkung • TOTP Standar</span>
            </div>
            <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <div class="min-w-0">
                <span class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Kunci Setup Manual (Base32):</span>
                <code id="mfa-secret-display" class="font-mono font-bold text-xs text-slate-900 select-all truncate block">---- ---- ---- ----</code>
              </div>
              <button type="button" onclick="copyMfaSecretKey()" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 border border-slate-300 font-bold text-[10px] shrink-0 flex items-center gap-1">
                <i data-lucide="copy" class="w-3 h-3"></i>
                <span>Salin Kunci</span>
              </button>
            </div>
            <button type="button" onclick="switchMfaLoginSubTab('verify')" class="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
              <i data-lucide="key-round" class="w-4 h-4"></i>
              <span>Sudah Scan? Masukkan 6-Digit Kode →</span>
            </button>
          </div>

          <button type="button" onclick="resetLoginModal()" class="w-full py-1.5 text-slate-500 hover:text-slate-800 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            <span>Kembali ke input email/kata sandi</span>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(adminDiv);
  }

  // 3. Mobile Navigation Drawer (if not present)
  if (!document.getElementById('mobile-nav-drawer')) {
    const navDrawer = document.createElement('div');
    navDrawer.id = 'mobile-nav-drawer';
    navDrawer.className = 'hidden lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4 shadow-2xl';
    navDrawer.innerHTML = `
      <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <i data-lucide="languages" class="w-4 h-4 text-emerald-800"></i>
          <span>Pilih Bahasa / Language:</span>
        </span>
        <div class="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs">
          <button type="button" id="mob-btn-lang-id" onclick="setLanguage('id')" class="px-3 py-1 rounded-md text-xs font-bold bg-[#0B3B24] text-white">ID</button>
          <button type="button" id="mob-btn-lang-en" onclick="setLanguage('en')" class="px-3 py-1 rounded-md text-xs font-bold text-slate-600">EN</button>
        </div>
      </div>
      <div>
        <div class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 px-1">Navigasi Utama</div>
        <div class="grid grid-cols-2 gap-2 text-xs font-bold">
          <a href="/" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="home" class="w-4 h-4 text-[#0B3B24]"></i> Beranda
          </a>
          <a href="/informasi/jadwal-sidang" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="calendar" class="w-4 h-4 text-[#0B3B24]"></i> Jadwal Sidang
          </a>
          <a href="/profil/struktur-organisasi" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="network" class="w-4 h-4 text-[#0B3B24]"></i> Struktur
          </a>
          <a href="/profil/visi-misi" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="compass" class="w-4 h-4 text-[#0B3B24]"></i> Visi &amp; Misi
          </a>
          <a href="/profil/sejarah" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="landmark" class="w-4 h-4 text-[#0B3B24]"></i> Sejarah
          </a>
          <a href="/profil/logo-makna" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="shield" class="w-4 h-4 text-[#0B3B24]"></i> Logo &amp; Makna
          </a>
          <a href="/informasi/berita" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="newspaper" class="w-4 h-4 text-[#0B3B24]"></i> Berita
          </a>
          <a href="/informasi/skm" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-[#0B3B24]"></i> Indeks SKM
          </a>
          <a href="/akuntabilitas-kinerja" class="col-span-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 flex items-center gap-2">
            <i data-lucide="file-check" class="w-4 h-4 text-[#0B3B24]"></i> Akuntabilitas Kinerja (SAKIP)
          </a>
        </div>
      </div>
    `;
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(navDrawer);
    } else {
      document.body.prepend(navDrawer);
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

function ensureCmsModals() {
  // 1. Modal Inline Edit
  if (!document.getElementById('modal-inline-edit')) {
    const div = document.createElement('div');
    div.id = 'modal-inline-edit';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
            <span>Edit Konten Langsung (Live CMS)</span>
          </h3>
          <button type="button" onclick="closeModal('modal-inline-edit')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form onsubmit="saveInlineContent(event)" class="p-6 space-y-4 text-xs">
          <input type="hidden" id="inline-edit-key">
          <div>
            <label id="inline-edit-label" class="block font-bold text-slate-700 mb-1"></label>
            <textarea id="inline-edit-value" rows="5" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 leading-relaxed text-slate-800 text-xs"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" onclick="closeModal('modal-inline-edit')" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <i data-lucide="save" class="w-4 h-4 text-amber-400"></i>
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // 2. Modal Image Edit
  if (!document.getElementById('modal-image-edit')) {
    const div = document.createElement('div');
    div.id = 'modal-image-edit';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="camera" class="w-4 h-4 text-emerald-800"></i>
            <span>Ganti / Upload Foto &amp; Logo</span>
          </h3>
          <button type="button" onclick="closeModal('modal-image-edit')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-6 space-y-4 text-xs">
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
            <img id="image-edit-preview" src="" class="max-h-48 mx-auto mb-3 object-contain rounded-lg shadow-sm">
            <label class="inline-block px-4 py-2 bg-[#0B3B24] text-white font-bold rounded-xl cursor-pointer hover:bg-[#072A19] transition-colors shadow">
              <i data-lucide="upload" class="w-3.5 h-3.5 inline mr-1"></i> Pilih File Gambar / Logo
              <input type="file" accept="image/*" class="hidden" onchange="handleImageUploadChange(event)">
            </label>
            <p class="text-[11px] text-slate-400 mt-2">Format: JPG, PNG, WEBP, SVG (Maks. 2MB)</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  }

  // 3. Modal Profile Item CRUD
  if (!document.getElementById('modal-profile-item')) {
    const div = document.createElement('div');
    div.id = 'modal-profile-item';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4 overflow-y-auto';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 id="modal-profile-item-title" class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
            <span>Kelola Item Profil</span>
          </h3>
          <button type="button" onclick="closeModal('modal-profile-item')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form onsubmit="handleSaveProfileItem(event)" class="p-6 space-y-4 text-xs">
          <input type="hidden" id="form-profile-item-id">
          <input type="hidden" id="form-profile-item-page-type">
          <input type="hidden" id="form-profile-item-type">

          <div>
            <label id="lbl-profile-item-title" class="block font-bold text-slate-700 mb-1">Judul / Nama Item *</label>
            <input type="text" id="form-profile-item-title" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label id="lbl-profile-item-subtitle" class="block font-bold text-slate-700 mb-1">Subtitle / Keterangan Singkat</label>
              <input type="text" id="form-profile-item-subtitle" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Urut Tampil *</label>
              <input type="number" id="form-profile-item-order" min="1" value="1" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Ikon / Simbol (Emoji atau Nama Simbol)</label>
            <input type="text" id="form-profile-item-icon" placeholder="Contoh: ★, ⚔️, ⚖️, 🌾, 🛡️, 🎗️, target, dsb." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs">
          </div>

          <div>
            <label id="lbl-profile-item-desc" class="block font-bold text-slate-700 mb-1">Deskripsi / Penjelasan Lengkap *</label>
            <textarea id="form-profile-item-desc" rows="5" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 leading-relaxed text-xs"></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onclick="closeModal('modal-profile-item')" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4 text-amber-400"></i>
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // 4. Modal Announcement Form (Pengumuman Resmi)
  if (!document.getElementById('modal-announcement-form')) {
    const div = document.createElement('div');
    div.id = 'modal-announcement-form';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4 overflow-y-auto';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 id="modal-announcement-form-title" class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="bell" class="w-4 h-4 text-emerald-800"></i>
            <span>Kelola Pengumuman Resmi</span>
          </h3>
          <button type="button" onclick="closeModal('modal-announcement-form')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form onsubmit="handleSaveAnnouncement(event)" class="p-6 space-y-4 text-xs">
          <input type="hidden" id="form-ann-id">
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Pengumuman / Surat *</label>
              <input type="text" id="form-ann-number" required placeholder="Contoh: PENG-04/KPKNL-KLK/X/2026" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kategori Pengumuman *</label>
              <select id="form-ann-category" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
                <option value="LELANG">LELANG (Rampasan Negara)</option>
                <option value="LAYANAN">LAYANAN (Operasional PTSP)</option>
                <option value="SELEKSI">SELEKSI (CASN / Rekrutmen)</option>
                <option value="MAKLUMAT">MAKLUMAT (Pelayanan Publik)</option>
                <option value="UMUM">UMUM (Pemberitahuan Publik)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Lengkap Pengumuman *</label>
            <input type="text" id="form-ann-title" required placeholder="Contoh: Pengumuman Lelang Terbuka..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs font-semibold">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Label Badge *</label>
              <input type="text" id="form-ann-badge" required placeholder="LELANG RAMPASAN NEGARA" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Batas Waktu / Tanggal</label>
              <input type="text" id="form-ann-deadline" placeholder="28 Oktober 2026" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Ringkasan / Excerpt Singkat *</label>
            <textarea id="form-ann-excerpt" rows="2" required placeholder="Ringkasan isi pengumuman yang tampil di kartu daftar..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs"></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Isi Rincian Pengumuman (Teks/HTML) *</label>
            <textarea id="form-ann-content" rows="4" required placeholder="Rincian lengkap pengumuman, syarat dan ketentuan..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">URL Tautan Eksternal / Dokumen</label>
              <input type="text" id="form-ann-ext-url" placeholder="https://..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Label Tombol Tautan</label>
              <input type="text" id="form-ann-ext-label" placeholder="Contoh: Portal Lelang.go.id" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">URL Flyer / Gambar</label>
              <input type="text" id="form-ann-image-url" placeholder="/static/images/news-bb.jpg" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Urut Tampil</label>
              <input type="number" id="form-ann-order" min="1" value="1" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onclick="closeModal('modal-announcement-form')" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4 text-amber-400"></i>
              <span>Simpan Pengumuman</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // 5. Modal News Form (Berita)
  if (!document.getElementById('modal-news-form')) {
    const div = document.createElement('div');
    div.id = 'modal-news-form';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4 overflow-y-auto';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 id="modal-news-form-title" class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="newspaper" class="w-4 h-4 text-emerald-800"></i>
            <span>Tambah Artikel Berita Baru</span>
          </h3>
          <button type="button" onclick="closeModal('modal-news-form')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form onsubmit="handleSaveNews(event)" class="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <input type="hidden" id="form-news-id">
          <input type="hidden" id="form-news-thumbnail" value="/static/images/news-featured.jpg">

          <!-- Seksi: Generate via AI (Gemini) -->
          <div class="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-amber-50/70 border border-emerald-300/80 rounded-xl space-y-2.5 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-[#0B3B24] text-amber-300 flex items-center justify-center shadow-sm">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </span>
                <div>
                  <h4 class="font-heading font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <span>Generate via AI (Gemini)</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 shadow-xs">URL SCRAPER</span>
                  </h4>
                  <p class="text-[11px] text-slate-600">Ekstrak konteks &amp; caption link sosial media lalu susun naskah berita otomatis.</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i data-lucide="link-2" class="w-3.5 h-3.5"></i>
                </div>
                <input type="url"
                       id="form-news-ai-url"
                       placeholder="Masukkan Link Instagram / YouTube"
                       class="w-full pl-9 pr-3 py-2 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600">
              </div>
              <button type="button"
                      id="btn-form-news-ai-generate"
                      onclick="handleFormGenerateNewsWithAI()"
                      class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
                <span>Generate Berita</span>
              </button>
            </div>
            <!-- Loading Spinner & Status Alert -->
            <div id="form-news-ai-status" class="hidden text-[11px] font-medium p-2.5 rounded-lg items-center gap-2"></div>
          </div>
          
          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Berita *</label>
            <input type="text" id="form-news-title" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs font-semibold">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kategori *</label>
              <select id="form-news-category" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
                <option value="Kegiatan Kejari">Kegiatan Kejari</option>
                <option value="Tindak Pidana Umum">Tindak Pidana Umum</option>
                <option value="Tindak Pidana Khusus">Tindak Pidana Khusus</option>
                <option value="Intelijen & JMS">Intelijen &amp; JMS</option>
                <option value="Perdata & Tata Usaha Negara">Perdata &amp; Tata Usaha Negara</option>
                <option value="Pengumuman">Pengumuman</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Badge Label</label>
              <input type="text" id="form-news-badge" placeholder="BERITA UTAMA" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Penulis / Author</label>
              <input type="text" id="form-news-author" placeholder="Tim Publikasi Kejari" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tata Letak Tampilan</label>
              <select id="form-news-layout" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
                <option value="FEATURED_MAIN">Utama Besar (Featured Main)</option>
                <option value="FEATURED_SIDE">Samping (Featured Side)</option>
                <option value="COMPACT_BOTTOM">Bawah Kompak (Compact)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Ringkasan Berita *</label>
            <textarea id="form-news-excerpt" rows="2" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs"></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Kutipan Highlight (Opsional)</label>
            <input type="text" id="form-news-quote" placeholder="Kutipan penting..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
          </div>

          <!-- Fitur Upload Gambar (Thumbnail/Cover Berita) -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Upload Gambar (Thumbnail/Cover Berita)</label>
            <div id="form-news-thumbnail-dropzone"
                 ondragover="handleFormNewsThumbnailDragOver(event)"
                 ondragleave="handleFormNewsThumbnailDragLeave(event)"
                 ondrop="handleFormNewsThumbnailDrop(event)"
                 onclick="document.getElementById('form-news-thumbnail-file').click()"
                 class="relative w-full border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-4 text-center transition-colors cursor-pointer bg-slate-50/60 hover:bg-emerald-50/30">
              <input type="file"
                     id="form-news-thumbnail-file"
                     accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                     onchange="handleFormNewsThumbnailFileSelect(event)"
                     class="hidden">

              <!-- Default Empty State -->
              <div id="form-news-thumbnail-empty" class="flex flex-col items-center justify-center py-2 space-y-1.5">
                <div class="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                  <i data-lucide="image-plus" class="w-4 h-4"></i>
                </div>
                <div class="text-xs font-semibold text-slate-700">
                  Klik untuk memilih gambar <span class="font-normal text-slate-500">atau seret &amp; lepas (drag &amp; drop) ke sini</span>
                </div>
                <p class="text-[11px] text-slate-400">Hanya menerima format gambar <span class="font-semibold text-slate-500">JPG, PNG</span> (Maks. 5MB)</p>
              </div>

              <!-- Image Preview State (Small/Medium Preview Inside Box) -->
              <div id="form-news-thumbnail-preview-wrap" class="hidden flex-col items-center justify-center space-y-2.5">
                <div class="relative inline-block">
                  <img id="form-news-thumbnail-preview-img"
                       src=""
                       alt="Preview Thumbnail Berita"
                       class="h-32 sm:h-36 w-auto max-w-full object-cover rounded-lg border border-slate-200 shadow-sm mx-auto">
                  <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-semibold backdrop-blur-sm">
                    Preview Cover
                  </span>
                </div>
                <div class="flex items-center justify-center gap-2 text-[11px]">
                  <span id="form-news-thumbnail-preview-name" class="text-slate-600 font-medium truncate max-w-[200px]">thumbnail.jpg</span>
                  <button type="button"
                          onclick="event.stopPropagation(); document.getElementById('form-news-thumbnail-file').click();"
                          class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-md shadow-sm transition-colors">
                    Ganti Gambar
                  </button>
                  <button type="button"
                          onclick="event.stopPropagation(); clearFormNewsThumbnail();"
                          class="px-2.5 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-semibold rounded-md transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <p id="form-news-thumbnail-error" class="hidden text-[11px] text-red-600 font-medium mt-1"></p>
          </div>

          <!-- Input Tautan Video YouTube (Opsional) -->
          <div>
            <label for="form-news-youtube" class="block font-bold text-slate-700 mb-1">Tautan Video YouTube (Opsional)</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-600">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <input type="url"
                     id="form-news-youtube"
                     placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                     class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs text-slate-800 placeholder-slate-400">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Isi Berita Lengkap</label>
            <textarea id="form-news-content" rows="4" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs"></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onclick="closeModal('modal-news-form')" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4 text-amber-400"></i>
              <span>Simpan Berita</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // 6. Modal Jagadita Form (Jadwal Sidang)
  if (!document.getElementById('modal-jagadita-form')) {
    const div = document.createElement('div');
    div.id = 'modal-jagadita-form';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4 overflow-y-auto';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 id="modal-jagadita-form-title" class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="gavel" class="w-4 h-4 text-emerald-800"></i>
            <span>Kelola Jadwal Sidang JAGADITA</span>
          </h3>
          <button type="button" onclick="closeModal('modal-jagadita-form')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form onsubmit="handleSaveJagadita(event)" class="p-6 space-y-4 text-xs">
          <input type="hidden" id="form-jagadita-id">
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Perkara *</label>
              <input type="text" id="form-jagadita-case-number" required placeholder="Contoh: 42/Pid.B/2026/PN Sem" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Jenis Perkara *</label>
              <select id="form-jagadita-type" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
                <option value="PIDUM">Pidana Umum (PIDUM)</option>
                <option value="PIDSUS">Pidana Khusus (PIDSUS / Tipikor)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Terdakwa *</label>
            <input type="text" id="form-jagadita-defendant" required placeholder="Contoh: I Wayan Sudarta dkk." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs font-semibold">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Waktu Sidang</label>
              <input type="text" id="form-jagadita-time" placeholder="09:00 WITA" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ruang Sidang</label>
              <input type="text" id="form-jagadita-room" placeholder="R. Cakra / Ruang Utama" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Agenda Sidang *</label>
            <input type="text" id="form-jagadita-agenda" required placeholder="Contoh: Pemeriksaan Saksi / Pembacaan Tuntutan" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Jaksa Penuntut Umum (JPU)</label>
              <input type="text" id="form-jagadita-prosecutor" placeholder="Contoh: Putu Arya, S.H." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Status Sidang</label>
              <select id="form-jagadita-status" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
                <option value="TERJADWAL">TERJADWAL</option>
                <option value="SEDANG SIDANG">SEDANG SIDANG</option>
                <option value="SELESAI">SELESAI</option>
                <option value="DITUNDA">DITUNDA</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onclick="closeModal('modal-jagadita-form')" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4 text-amber-400"></i>
              <span>Simpan Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }

  // 7. Modal SKM Edit
  if (!document.getElementById('modal-skm-edit')) {
    const div = document.createElement('div');
    div.id = 'modal-skm-edit';
    div.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4 overflow-y-auto';
    div.innerHTML = `
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 class="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-emerald-800"></i>
            <span>Pengaturan Skor &amp; Indikator SKM</span>
          </h3>
          <button type="button" onclick="closeModal('modal-skm-edit')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form onsubmit="handleSaveSkm(event)" class="p-6 space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Skor Indeks SKM (Skala 100) *</label>
              <input type="text" id="form-skm-score" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs font-bold text-emerald-900">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Predikat Mutu *</label>
              <input type="text" id="form-skm-predicate" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs font-bold">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Label Periode Evaluasi *</label>
              <input type="text" id="form-skm-period" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Jumlah Responden *</label>
              <input type="text" id="form-skm-respondents" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs">
            </div>
          </div>

          <div class="border-t border-slate-100 pt-3">
            <label class="block font-bold text-slate-700 mb-2">Skor 9 Unsur Pelayanan Publik (Persentase %):</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="skm-metrics-edit-container">
              <!-- Dynamically populated U1 to U9 inputs -->
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onclick="closeModal('modal-skm-edit')" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4 text-amber-400"></i>
              <span>Simpan Skor SKM</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  }
}

async function initProfilePageCms() {
  const pageType = getProfilePageType();
  if (!pageType) return;

  const isAdmin = state.currentUser && state.currentUser.role === 'ADMIN';

  // Render Admin Toolbar if Admin is logged in
  const toolbar = document.getElementById('profile-admin-toolbar');
  if (toolbar) {
    if (isAdmin) {
      toolbar.className = 'mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0B3B24] to-emerald-900 text-white border border-amber-400/40 shadow-xl flex flex-wrap items-center justify-between gap-3';
      toolbar.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span class="font-heading font-bold text-xs text-white">👑 Mode Admin Aktif: Pengelolaan Profil Instansi</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="toggleLiveEditMode()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${state.isLiveEditActive ? 'bg-amber-400 text-slate-900 shadow-lg' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 inline mr-1"></i> Edit Teks Langsung: ${state.isLiveEditActive ? 'AKTIF' : 'NONAKTIF'}
          </button>
          <a href="/admin" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-slate-100 flex items-center gap-1.5 shadow">
            <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 text-emerald-800"></i> Buka Backoffice CMS
          </a>
        </div>
      `;
    } else {
      toolbar.className = 'hidden';
      toolbar.innerHTML = '';
    }
  }

  if (pageType === 'STRUKTUR_ORGANISASI') {
    lucide.createIcons();
    return;
  }

  try {
    const res = await fetch(`/api/public/profile-data?page_type=${pageType}`);
    const data = await res.json();
    if (!data.success) return;

    state.profileData = data;

    // 1. Populate all [data-cms-key]
    if (data.contents) {
      document.querySelectorAll('[data-cms-key]').forEach(el => {
        const key = el.getAttribute('data-cms-key');
        if (data.contents[key] && data.contents[key].value) {
          el.innerText = data.contents[key].value;
        }
      });

      // 2. Populate photos / logos
      if (data.contents.header_logo_url && data.contents.header_logo_url.value) {
        const logoUrl = data.contents.header_logo_url.value;
        document.querySelectorAll('.site-logo-img').forEach(img => img.src = logoUrl);
        const emblemImg = document.getElementById('profil-logo-official-img');
        if (emblemImg) emblemImg.src = logoUrl;
      }
      if (data.contents.profil_sejarah_img_1 && data.contents.profil_sejarah_img_1.value) {
        const img1 = document.getElementById('profil-sejarah-img-1');
        if (img1) img1.src = data.contents.profil_sejarah_img_1.value;
      }
      if (data.contents.profil_sejarah_img_2 && data.contents.profil_sejarah_img_2.value) {
        const img2 = document.getElementById('profil-sejarah-img-2');
        if (img2) img2.src = data.contents.profil_sejarah_img_2.value;
      }
    }

    // 3. Render items list
    renderProfileItems(pageType, data.items, isAdmin);

  } catch (e) {
    console.error('Failed to load profile data:', e);
  }

  lucide.createIcons();
}

function renderProfileItems(pageType, items, isAdmin) {
  if (pageType === 'VISI_MISI') {
    const container = document.getElementById('container-misi-list');
    const slot = document.getElementById('misi-admin-add-btn-slot');
    if (slot) {
      slot.innerHTML = isAdmin ? `
        <button onclick="openAddProfileItemModal('VISI_MISI', 'MISI')" class="px-3.5 py-1.5 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>+ Tambah Misi Baru</span>
        </button>
      ` : '<span class="text-xs text-slate-400 font-semibold">Agenda Aksi</span>';
    }
    if (container) {
      if (!items || items.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Belum ada item misi yang ditambahkan.</div>`;
      } else {
        container.innerHTML = items.map((item, idx) => `
          <div class="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-600/40 transition-colors group">
            <div class="flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-emerald-800 text-white font-heading font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                ${item.order_num || (idx + 1)}
              </div>
              <div>
                <h3 class="font-heading font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                  <span>${escapeHtml(item.title)}</span>
                  ${item.subtitle ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">${escapeHtml(item.subtitle)}</span>` : ''}
                </h3>
                <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(item.description)}</p>
              </div>
            </div>
            ${isAdmin ? `
              <div class="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button onclick="openEditProfileItemModal(${item.id})" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors" title="Edit Item Misi">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="handleDeleteProfileItem(${item.id}, '${escapeQuote(item.title)}')" class="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Hapus Item Misi">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            ` : ''}
          </div>
        `).join('');
      }
    }
  } else if (pageType === 'SEJARAH') {
    const container = document.getElementById('container-timeline-milestones');
    const slot = document.getElementById('timeline-admin-add-btn-slot');
    if (slot) {
      slot.innerHTML = isAdmin ? `
        <button onclick="openAddProfileItemModal('SEJARAH', 'TIMELINE')" class="px-3.5 py-1.5 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>+ Tambah Linimasa Sejarah</span>
        </button>
      ` : '';
    }
    if (container) {
      if (!items || items.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Belum ada linimasa sejarah.</div>`;
      } else {
        container.innerHTML = items.map((item, idx) => `
          <div class="relative pl-6 group">
            <span class="absolute -left-2.5 top-1 w-5 h-5 rounded-full ${idx % 2 === 0 ? 'bg-amber-400' : 'bg-emerald-700'} border-4 border-white shadow"></span>
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[11px] font-bold ${idx % 2 === 0 ? 'text-amber-700' : 'text-emerald-800'} uppercase tracking-wider">${escapeHtml(item.subtitle || 'Tonggak Sejarah')}</div>
                <h3 class="font-heading font-bold text-sm text-slate-900 mt-0.5">${escapeHtml(item.title)}</h3>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">${escapeHtml(item.description)}</p>
              </div>
              ${isAdmin ? `
                <div class="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onclick="openEditProfileItemModal(${item.id})" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors" title="Edit Linimasa">
                    <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="handleDeleteProfileItem(${item.id}, '${escapeQuote(item.title)}')" class="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Hapus Linimasa">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  } else if (pageType === 'LOGO_MAKNA') {
    const container = document.getElementById('container-logo-elements');
    const slot = document.getElementById('logo-admin-add-btn-slot');
    if (slot) {
      slot.innerHTML = isAdmin ? `
        <button onclick="openAddProfileItemModal('LOGO_MAKNA', 'LOGO_ELEM')" class="px-3.5 py-1.5 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>+ Tambah Elemen Makna Logo</span>
        </button>
      ` : '';
    }
    if (container) {
      if (!items || items.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 col-span-2">Belum ada elemen lambang.</div>`;
      } else {
        container.innerHTML = items.map((item, idx) => `
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 transition-colors group relative flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2.5 mb-2.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-[#0B3B24] text-amber-300 flex items-center justify-center font-bold text-base shadow-sm">
                    ${escapeHtml(item.icon_name || '★')}
                  </div>
                  <h3 class="font-heading font-bold text-sm text-slate-900">${escapeHtml(item.title)}</h3>
                </div>
                ${isAdmin ? `
                  <div class="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button onclick="openEditProfileItemModal(${item.id})" class="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50 transition-colors" title="Edit Elemen">
                      <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="handleDeleteProfileItem(${item.id}, '${escapeQuote(item.title)}')" class="p-1.5 rounded-lg bg-white border border-slate-200 text-red-700 hover:bg-red-50 transition-colors" title="Hapus Elemen">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                ` : ''}
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(item.description)}</p>
            </div>
          </div>
        `).join('');
      }
    }
  } else if (pageType === 'TUGAS_WEWENANG') {
    const container = document.getElementById('container-tugas-bidang');
    const slot = document.getElementById('tugas-admin-add-btn-slot');
    if (slot) {
      slot.innerHTML = isAdmin ? `
        <button onclick="openAddProfileItemModal('TUGAS_WEWENANG', 'TUGAS_BIDANG')" class="px-3.5 py-1.5 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>+ Tambah Bidang Tugas</span>
        </button>
      ` : '';
    }
    if (container) {
      if (!items || items.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Belum ada rincian bidang tugas.</div>`;
      } else {
        container.innerHTML = items.map((item, idx) => `
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-600/40 transition-colors group">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center shrink-0">
                  ${item.order_num || (idx + 1)}
                </div>
                <div>
                  ${item.subtitle ? `<span class="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">${escapeHtml(item.subtitle)}</span>` : ''}
                  <h3 class="font-heading font-extrabold text-lg text-slate-900">${escapeHtml(item.title)}</h3>
                </div>
              </div>
              ${isAdmin ? `
                <div class="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onclick="openEditProfileItemModal(${item.id})" class="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors" title="Edit Bidang">
                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                  </button>
                  <button onclick="handleDeleteProfileItem(${item.id}, '${escapeQuote(item.title)}')" class="p-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Hapus Bidang">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              ` : ''}
            </div>

            <div class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
              ${formatProfileDescription(item.description)}
            </div>
          </div>
        `).join('');
      }
    }
  }
}

function formatProfileDescription(text) {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return `<ul class="space-y-2">` + lines.map(line => {
      let cleanLine = line.replace(/^[•\-\*]\s*/, '');
      return `<li class="flex items-start gap-2.5">
        <i data-lucide="check" class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"></i>
        <span>${escapeHtml(cleanLine)}</span>
      </li>`;
    }).join('') + `</ul>`;
  }
  return escapeHtml(text);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeQuote(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function openAddProfileItemModal(pageType, itemType) {
  ensureCmsModals();
  const pType = pageType || getProfilePageType();
  const iType = itemType || (pType === 'VISI_MISI' ? 'MISI' : pType === 'SEJARAH' ? 'TIMELINE' : pType === 'LOGO_MAKNA' ? 'LOGO_ELEM' : 'TUGAS_BIDANG');
  
  document.getElementById('form-profile-item-id').value = '';
  document.getElementById('form-profile-item-page-type').value = pType;
  document.getElementById('form-profile-item-type').value = iType;
  document.getElementById('form-profile-item-title').value = '';
  document.getElementById('form-profile-item-subtitle').value = '';
  document.getElementById('form-profile-item-desc').value = '';
  document.getElementById('form-profile-item-icon').value = '';

  const curCount = (state.profileData && state.profileData.items) ? state.profileData.items.length : 0;
  document.getElementById('form-profile-item-order').value = curCount + 1;

  document.getElementById('modal-profile-item-title').innerHTML = `
    <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-800"></i>
    <span>Tambah Item Baru (${pType})</span>
  `;

  openModal('modal-profile-item');
  lucide.createIcons();
}

function openEditProfileItemModal(itemId) {
  ensureCmsModals();
  if (!state.profileData || !state.profileData.items) return;
  const item = state.profileData.items.find(i => Number(i.id) === Number(itemId));
  if (!item) return;

  document.getElementById('form-profile-item-id').value = item.id;
  document.getElementById('form-profile-item-page-type').value = item.page_type;
  document.getElementById('form-profile-item-type').value = item.item_type;
  document.getElementById('form-profile-item-title').value = item.title || '';
  document.getElementById('form-profile-item-subtitle').value = item.subtitle || '';
  document.getElementById('form-profile-item-desc').value = item.description || '';
  document.getElementById('form-profile-item-icon').value = item.icon_name || '';
  document.getElementById('form-profile-item-order').value = item.order_num || 1;

  document.getElementById('modal-profile-item-title').innerHTML = `
    <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
    <span>Edit Item Profil (#${item.id})</span>
  `;

  openModal('modal-profile-item');
  lucide.createIcons();
}

async function handleSaveProfileItem(e) {
  e.preventDefault();
  const id = document.getElementById('form-profile-item-id').value;
  const page_type = document.getElementById('form-profile-item-page-type').value;
  const item_type = document.getElementById('form-profile-item-type').value;
  const title = document.getElementById('form-profile-item-title').value.trim();
  const subtitle = document.getElementById('form-profile-item-subtitle').value.trim();
  const description = document.getElementById('form-profile-item-desc').value.trim();
  const icon_name = document.getElementById('form-profile-item-icon').value.trim();
  const order_num = parseInt(document.getElementById('form-profile-item-order').value) || 1;

  const payload = {
    page_type,
    item_type,
    title,
    subtitle,
    description,
    icon_name,
    order_num
  };

  try {
    let url = '/api/admin/profile-items';
    let method = 'POST';
    if (id) {
      url = `/api/admin/profile-items/${id}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      closeModal('modal-profile-item');
      showToast(data.message || 'Item profil berhasil disimpan!', 'success');
      await initProfilePageCms();
    } else {
      showToast(data.error || 'Gagal menyimpan item profil', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

async function handleDeleteProfileItem(id, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/profile-items/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Item berhasil dihapus!', 'success');
      await initProfilePageCms();
    } else {
      showToast(data.error || 'Gagal menghapus item', 'error');
    }
  } catch (e) {
    showToast('Gagal menghubungi server', 'error');
  }
}

// ============================================================================
// INFORMATION PAGES CMS CONTROLLER (Berita, Pengumuman, Jadwal Sidang, SKM)
// ============================================================================

async function initInformationPageCms() {
  const pageType = getInformationPageType();
  if (!pageType) return;

  const isAdmin = state.currentUser && state.currentUser.role === 'ADMIN';

  // 1. Render Admin Toolbar
  const toolbar = document.getElementById('info-admin-toolbar');
  if (toolbar) {
    if (isAdmin) {
      let titleLabel = 'Halaman Informasi Publik';
      let quickActionHtml = '';
      if (pageType === 'INFO_BERITA') {
        titleLabel = 'Pusat Berita & Publikasi Hukum';
        quickActionHtml = `
          <button onclick="openAddNewsModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 flex items-center gap-1.5 shadow">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> + Tambah Berita Baru
          </button>
        `;
      } else if (pageType === 'INFO_PENGUMUMAN') {
        titleLabel = 'Pengumuman & Maklumat Resmi';
        quickActionHtml = `
          <button onclick="openAddAnnouncementModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 flex items-center gap-1.5 shadow">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> + Tambah Pengumuman
          </button>
        `;
      } else if (pageType === 'INFO_SIDANG') {
        titleLabel = 'Jadwal Sidang JAGADITA';
        quickActionHtml = `
          <button onclick="openAddJagaditaModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 flex items-center gap-1.5 shadow">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> + Tambah Jadwal Sidang
          </button>
        `;
      } else if (pageType === 'INFO_SKM') {
        titleLabel = 'Survei Kepuasan Masyarakat (SKM)';
        quickActionHtml = `
          <button onclick="openSkmEditModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 flex items-center gap-1.5 shadow">
            <i data-lucide="award" class="w-3.5 h-3.5"></i> ✏️ Edit Skor & Indikator SKM
          </button>
        `;
      }

      toolbar.className = 'mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0B3B24] to-emerald-900 text-white border border-amber-400/40 shadow-xl flex flex-wrap items-center justify-between gap-3';
      toolbar.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span class="font-heading font-bold text-xs text-white">👑 Mode Admin Aktif: Pengelolaan ${titleLabel}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          ${quickActionHtml}
          <button onclick="toggleLiveEditMode()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${state.isLiveEditActive ? 'bg-amber-400 text-slate-900 shadow-lg' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 inline mr-1"></i> Edit Teks Langsung: ${state.isLiveEditActive ? 'AKTIF' : 'NONAKTIF'}
          </button>
          <a href="/admin" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-slate-100 flex items-center gap-1.5 shadow">
            <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 text-emerald-800"></i> Buka Backoffice CMS
          </a>
        </div>
      `;
    } else {
      toolbar.className = 'hidden';
      toolbar.innerHTML = '';
    }
  }

  // 2. Ensure contents are loaded & populate [data-cms-key]
  if (!state.contents) {
    await loadHomepageData();
  }
  if (state.contents) {
    document.querySelectorAll('[data-cms-key]').forEach(el => {
      const key = el.getAttribute('data-cms-key');
      if (state.contents[key] && state.contents[key].value) {
        el.innerText = state.contents[key].value;
      }
    });

    if (state.contents.header_logo_url && state.contents.header_logo_url.value) {
      const lUrl = state.contents.header_logo_url.value;
      document.querySelectorAll('.site-logo-img').forEach(img => img.src = lUrl);
      const hLogo = document.getElementById('header-logo');
      const fLogo = document.getElementById('footer-logo');
      if (hLogo) hLogo.src = lUrl;
      if (fLogo) fLogo.src = lUrl;
    }
  }

  // 3. Page specific initializers
  if (pageType === 'INFO_BERITA') {
    renderNewsSection();
    const searchInput = document.getElementById('news-page-search');
    if (searchInput && !searchInput._hasListener) {
      searchInput._hasListener = true;
      searchInput.addEventListener('input', (e) => {
        state.newsSearchQuery = e.target.value.trim();
        renderNewsSection();
      });
    }
  } else if (pageType === 'INFO_PENGUMUMAN') {
    await loadAnnouncementsPublic();
  } else if (pageType === 'INFO_SIDANG') {
    initSidangPageCms(isAdmin);
  } else if (pageType === 'INFO_SKM') {
    initSkmPageCms(isAdmin);
  }

  lucide.createIcons();
}

// ----------------------------------------------------------------------------
// A. PENGUMUMAN RESMI CONTROLLERS
// ----------------------------------------------------------------------------

state.announcements = [];
state.activeAnnouncementCategory = 'ALL';
state.announcementSearchQuery = '';

async function loadAnnouncementsPublic() {
  try {
    const res = await fetch('/api/public/announcements');
    const data = await res.json();
    if (data.success && data.announcements) {
      state.announcements = data.announcements;
    }
  } catch (err) {
    console.error('Failed to load announcements:', err);
  }
  renderAnnouncementsList();
}

function renderAnnouncementsList() {
  const container = document.getElementById('announcement-list-container');
  if (!container) return;

  const isAdmin = state.currentUser && state.currentUser.role === 'ADMIN';

  // Add slot button
  const slot = document.getElementById('announcement-admin-add-slot');
  if (slot) {
    slot.innerHTML = isAdmin ? `
      <div class="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div>
          <h4 class="font-bold text-amber-950 text-xs">Panel Admin Pengumuman Resmi</h4>
          <p class="text-[11px] text-amber-800">Diterbitkan dan ditampilkan seketika untuk masyarakat.</p>
        </div>
        <button onclick="openAddAnnouncementModal()" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>+ Tambah Pengumuman Baru</span>
        </button>
      </div>
    ` : '';
  }

  let items = state.announcements || [];

  // Filter category
  if (state.activeAnnouncementCategory && state.activeAnnouncementCategory !== 'ALL') {
    items = items.filter(a => (a.category || '').toUpperCase() === state.activeAnnouncementCategory.toUpperCase());
  }

  // Filter search
  if (state.announcementSearchQuery) {
    const q = state.announcementSearchQuery.toLowerCase();
    items = items.filter(a => 
      (a.title || '').toLowerCase().includes(q) ||
      (a.announcement_number || '').toLowerCase().includes(q) ||
      (a.excerpt || '').toLowerCase().includes(q)
    );
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
        <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-300"></i>
        <p class="font-bold text-slate-600">Tidak ada pengumuman yang sesuai kriteria.</p>
        <p>Silakan ganti kata kunci pencarian atau kategori filter di atas.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="announcement-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-600/60 transition-all space-y-4 group relative" data-category="${item.category || 'UMUM'}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold ${getAnnouncementBadgeColor(item.category)} border">
          ${escapeHtml(item.badge_label || item.category || 'PENGUMUMAN')}
        </span>
        <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
          <i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${escapeHtml(item.deadline_date || 'Terbaru')}
        </span>
      </div>

      <div class="flex flex-col sm:flex-row gap-5 items-start">
        ${item.image_url ? `
          <div class="w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative cms-image-wrapper">
            <img src="${item.image_url}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
            ${isAdmin ? `
              <div class="cms-image-overlay" onclick="openImageEditModal('announcements', ${item.id}, '${item.image_url}')">
                <button class="px-2.5 py-1 bg-amber-400 text-slate-900 font-bold rounded shadow text-[10px] flex items-center gap-1">
                  <i data-lucide="camera" class="w-3 h-3"></i> Ganti Flyer
                </button>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="flex-1 space-y-2">
          <div class="text-[11px] font-mono text-slate-400 font-semibold">Nomor: ${escapeHtml(item.announcement_number || '-')}</div>
          <h3 class="font-heading font-extrabold text-base text-slate-900 group-hover:text-emerald-800 transition-colors cursor-pointer" onclick="openAnnouncementDetail(${item.id})">
            ${escapeHtml(item.title)}
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">
            ${escapeHtml(item.excerpt || '')}
          </p>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span class="text-slate-500 font-medium">Batas Waktu: <strong class="text-slate-800">${escapeHtml(item.deadline_date || 'Sampai Pengumuman Dicabut')}</strong></span>
        <div class="flex items-center gap-2">
          <button onclick="openAnnouncementDetail(${item.id})" class="px-3.5 py-1.5 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-amber-400"></i> Baca Lengkap
          </button>
          ${item.external_url ? `
            <a href="${item.external_url}" target="_blank" class="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors">
              ${escapeHtml(item.external_label || 'Buka Tautan')} <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}

          ${isAdmin ? `
            <div class="flex items-center gap-1 pl-2 border-l border-slate-200">
              <button onclick="openEditAnnouncementModal(${item.id})" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors" title="Edit Pengumuman">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="handleDeleteAnnouncement(${item.id}, '${escapeQuote(item.title)}')" class="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Hapus Pengumuman">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function getAnnouncementBadgeColor(cat) {
  const c = (cat || '').toUpperCase();
  if (c === 'LELANG') return 'bg-amber-100 text-amber-900 border-amber-300';
  if (c === 'LAYANAN') return 'bg-blue-100 text-blue-900 border-blue-200';
  if (c === 'SELEKSI') return 'bg-purple-100 text-purple-900 border-purple-200';
  if (c === 'MAKLUMAT') return 'bg-rose-100 text-rose-900 border-rose-200';
  return 'bg-emerald-100 text-emerald-900 border-emerald-200';
}

function filterAnnouncementCategory(cat) {
  state.activeAnnouncementCategory = cat;
  const buttons = document.querySelectorAll('.announcement-tab-btn');
  buttons.forEach(btn => {
    const text = btn.innerText.toUpperCase();
    if ((cat === 'ALL' && text.includes('SEMUA')) || (cat !== 'ALL' && text.includes(cat))) {
      btn.className = 'announcement-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm';
    } else {
      btn.className = 'announcement-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200';
    }
  });
  renderAnnouncementsList();
}

function filterAnnouncements() {
  const input = document.getElementById('announcement-search');
  if (input) {
    state.announcementSearchQuery = input.value.trim();
    renderAnnouncementsList();
  }
}

function openAnnouncementDetail(id) {
  const item = (state.announcements || []).find(a => Number(a.id) === Number(id));
  if (!item) return;

  const contentBox = document.getElementById('announcement-detail-content');
  if (contentBox) {
    contentBox.innerHTML = `
      <div class="space-y-4">
        <div>
          <div class="text-[11px] font-mono text-slate-400 font-semibold mb-1">${escapeHtml(item.announcement_number || '')} • Batas: ${escapeHtml(item.deadline_date || 'Aktif')}</div>
          <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${getAnnouncementBadgeColor(item.category)} border mb-2">
            ${escapeHtml(item.badge_label || item.category || 'PENGUMUMAN')}
          </span>
          <h2 class="font-heading font-black text-xl text-slate-900 leading-snug">${escapeHtml(item.title)}</h2>
        </div>

        ${item.image_url ? `
          <div class="rounded-xl overflow-hidden border border-slate-200 max-h-72">
            <img src="${item.image_url}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover">
          </div>
        ` : ''}

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
          ${escapeHtml(item.excerpt || '')}
        </div>

        <div class="text-slate-700 leading-relaxed text-xs sm:text-sm space-y-3 whitespace-pre-line border-t border-slate-100 pt-3">
          ${item.content || item.excerpt || 'Tidak ada uraian rincian tambahan.'}
        </div>

        ${item.external_url ? `
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end">
            <a href="${item.external_url}" target="_blank" class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow">
              <span>${escapeHtml(item.external_label || 'Kunjungi Tautan Resmi')}</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        ` : ''}
      </div>
    `;
    openModal('modal-announcement-detail');
    lucide.createIcons();
  }
}

function openAddAnnouncementModal() {
  ensureCmsModals();
  document.getElementById('form-ann-id').value = '';
  document.getElementById('form-ann-number').value = `PENG-${Math.floor(Math.random() * 90 + 10)}/KEJARI-KLK/${new Date().getFullYear()}`;
  document.getElementById('form-ann-category').value = 'LELANG';
  document.getElementById('form-ann-title').value = '';
  document.getElementById('form-ann-badge').value = 'LELANG RAMPASAN NEGARA';
  document.getElementById('form-ann-deadline').value = '';
  document.getElementById('form-ann-excerpt').value = '';
  document.getElementById('form-ann-content').value = '';
  document.getElementById('form-ann-ext-url').value = '';
  document.getElementById('form-ann-ext-label').value = '';
  document.getElementById('form-ann-image-url').value = '/static/images/news-bb.jpg';
  document.getElementById('form-ann-order').value = (state.announcements ? state.announcements.length + 1 : 1);

  document.getElementById('modal-announcement-form-title').innerHTML = `
    <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-800"></i>
    <span>Tambah Pengumuman Baru</span>
  `;
  openModal('modal-announcement-form');
  lucide.createIcons();
}

function openEditAnnouncementModal(id) {
  ensureCmsModals();
  const item = (state.announcements || []).find(a => Number(a.id) === Number(id));
  if (!item) return;

  document.getElementById('form-ann-id').value = item.id;
  document.getElementById('form-ann-number').value = item.announcement_number || '';
  document.getElementById('form-ann-category').value = item.category || 'LELANG';
  document.getElementById('form-ann-title').value = item.title || '';
  document.getElementById('form-ann-badge').value = item.badge_label || '';
  document.getElementById('form-ann-deadline').value = item.deadline_date || '';
  document.getElementById('form-ann-excerpt').value = item.excerpt || '';
  document.getElementById('form-ann-content').value = item.content || '';
  document.getElementById('form-ann-ext-url').value = item.external_url || '';
  document.getElementById('form-ann-ext-label').value = item.external_label || '';
  document.getElementById('form-ann-image-url').value = item.image_url || '';
  document.getElementById('form-ann-order').value = item.order_num || 1;

  document.getElementById('modal-announcement-form-title').innerHTML = `
    <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
    <span>Edit Pengumuman (#${item.id})</span>
  `;
  openModal('modal-announcement-form');
  lucide.createIcons();
}

async function handleSaveAnnouncement(e) {
  e.preventDefault();
  const id = document.getElementById('form-ann-id').value;
  const payload = {
    announcement_number: document.getElementById('form-ann-number').value.trim(),
    category: document.getElementById('form-ann-category').value.trim(),
    title: document.getElementById('form-ann-title').value.trim(),
    badge_label: document.getElementById('form-ann-badge').value.trim(),
    deadline_date: document.getElementById('form-ann-deadline').value.trim(),
    excerpt: document.getElementById('form-ann-excerpt').value.trim(),
    content: document.getElementById('form-ann-content').value.trim(),
    external_url: document.getElementById('form-ann-ext-url').value.trim(),
    external_label: document.getElementById('form-ann-ext-label').value.trim(),
    image_url: document.getElementById('form-ann-image-url').value.trim(),
    order_num: parseInt(document.getElementById('form-ann-order').value || '1'),
  };

  try {
    const url = id ? `/api/admin/announcements/${id}` : '/api/admin/announcements';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-announcement-form');
      showToast(data.message || 'Pengumuman berhasil disimpan!', 'success');
      await loadAnnouncementsPublic();
    } else {
      showToast(data.error || 'Gagal menyimpan pengumuman', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

async function handleDeleteAnnouncement(id, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Pengumuman berhasil dihapus!', 'success');
      await loadAnnouncementsPublic();
    } else {
      showToast(data.error || 'Gagal menghapus pengumuman', 'error');
    }
  } catch (err) {
    showToast('Gagal menghubungi server', 'error');
  }
}

// ----------------------------------------------------------------------------
// B. BERITA (NEWS) ON-PAGE CONTROLLERS
// ----------------------------------------------------------------------------

function setFormNewsThumbnailPreview(src, labelText) {
  const hiddenInput = document.getElementById('form-news-thumbnail');
  const emptyState = document.getElementById('form-news-thumbnail-empty');
  const previewWrap = document.getElementById('form-news-thumbnail-preview-wrap');
  const previewImg = document.getElementById('form-news-thumbnail-preview-img');
  const previewName = document.getElementById('form-news-thumbnail-preview-name');
  const errEl = document.getElementById('form-news-thumbnail-error');

  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }

  if (src) {
    if (hiddenInput) hiddenInput.value = src;
    if (previewImg) previewImg.src = src;
    if (previewName) {
      previewName.textContent = labelText || (src.startsWith('data:') ? 'Gambar terpilih' : src.split('/').pop() || 'thumbnail.jpg');
    }
    if (emptyState) emptyState.classList.add('hidden');
    if (previewWrap) {
      previewWrap.classList.remove('hidden');
      previewWrap.classList.add('flex');
    }
  } else {
    if (hiddenInput) hiddenInput.value = '/static/images/news-featured.jpg';
    if (previewImg) previewImg.src = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (previewWrap) {
      previewWrap.classList.add('hidden');
      previewWrap.classList.remove('flex');
    }
  }
}

function clearFormNewsThumbnail() {
  const fileInput = document.getElementById('form-news-thumbnail-file');
  if (fileInput) fileInput.value = '';
  setFormNewsThumbnailPreview('', '');
}

function handleFormNewsThumbnailDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('form-news-thumbnail-dropzone');
  if (dz) {
    dz.classList.add('border-emerald-600', 'bg-emerald-50/60');
  }
}

function handleFormNewsThumbnailDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('form-news-thumbnail-dropzone');
  if (dz) {
    dz.classList.remove('border-emerald-600', 'bg-emerald-50/60');
  }
}

function handleFormNewsThumbnailDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  handleFormNewsThumbnailDragLeave(e);
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length > 0) {
    processFormNewsThumbnailFile(files[0]);
  }
}

function handleFormNewsThumbnailFileSelect(e) {
  const files = e.target && e.target.files;
  if (files && files.length > 0) {
    processFormNewsThumbnailFile(files[0]);
  }
}

function processFormNewsThumbnailFile(file) {
  const errEl = document.getElementById('form-news-thumbnail-error');
  const fileInput = document.getElementById('form-news-thumbnail-file');

  const validMime = ['image/jpeg', 'image/jpg', 'image/png'];
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const validExt = ['jpg', 'jpeg', 'png'];

  if (!validMime.includes(file.type) && !validExt.includes(ext)) {
    if (errEl) {
      errEl.textContent = 'Format file tidak didukung. Harap unggah gambar dengan format JPG atau PNG.';
      errEl.classList.remove('hidden');
    }
    if (fileInput) fileInput.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    if (errEl) {
      errEl.textContent = 'Ukuran gambar terlalu besar (Maksimal 5MB).';
      errEl.classList.remove('hidden');
    }
    if (fileInput) fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const base64Data = evt.target.result;
    setFormNewsThumbnailPreview(base64Data, file.name);

    try {
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_data: base64Data,
          filename: file.name
        })
      });
      const data = await res.json();
      if (data && data.success && data.url) {
        const hiddenInput = document.getElementById('form-news-thumbnail');
        if (hiddenInput) hiddenInput.value = data.url;
      }
    } catch (_) {
      // Keep base64Data in hidden input as fallback
    }
  };
  reader.readAsDataURL(file);
}

function openAddNewsModal() {
  ensureCmsModals();
  document.getElementById('form-news-id').value = '';
  document.getElementById('form-news-title').value = '';
  document.getElementById('form-news-category').value = 'Kegiatan Kejari';
  document.getElementById('form-news-badge').value = 'BERITA TERBARU';
  document.getElementById('form-news-author').value = state.currentUser ? state.currentUser.full_name : 'Tim Publikasi Kejari';
  document.getElementById('form-news-layout').value = 'COMPACT_BOTTOM';
  clearFormNewsThumbnail();
  const ytInput = document.getElementById('form-news-youtube');
  if (ytInput) ytInput.value = '';
  const aiUrl = document.getElementById('form-news-ai-url');
  if (aiUrl) aiUrl.value = '';
  const aiStatus = document.getElementById('form-news-ai-status');
  if (aiStatus) {
    aiStatus.className = 'hidden text-[11px] font-medium p-2.5 rounded-lg items-center gap-2';
    aiStatus.innerHTML = '';
  }
  document.getElementById('form-news-excerpt').value = '';
  document.getElementById('form-news-quote').value = '';
  document.getElementById('form-news-content').value = '';

  document.getElementById('modal-news-form-title').innerHTML = `
    <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-800"></i>
    <span>Tambah Artikel Berita Baru</span>
  `;
  openModal('modal-news-form');
  lucide.createIcons();
}

function openEditNewsModal(id) {
  ensureCmsModals();
  const item = (state.news || []).find(n => Number(n.id) === Number(id));
  if (!item) return;

  document.getElementById('form-news-id').value = item.id;
  document.getElementById('form-news-title').value = item.title || '';
  document.getElementById('form-news-category').value = item.category || 'Kegiatan Kejari';
  document.getElementById('form-news-badge').value = item.badge_label || '';
  document.getElementById('form-news-author').value = item.author || '';
  document.getElementById('form-news-layout').value = item.layout_type || 'COMPACT_BOTTOM';
  if (item.thumbnail_url) {
    setFormNewsThumbnailPreview(item.thumbnail_url, item.thumbnail_url.split('/').pop() || 'thumbnail.jpg');
  } else {
    clearFormNewsThumbnail();
  }
  const ytInput = document.getElementById('form-news-youtube');
  if (ytInput) ytInput.value = item.youtube_url || '';

  const aiUrl = document.getElementById('form-news-ai-url');
  if (aiUrl) aiUrl.value = '';
  const aiStatus = document.getElementById('form-news-ai-status');
  if (aiStatus) {
    aiStatus.className = 'hidden text-[11px] font-medium p-2.5 rounded-lg items-center gap-2';
    aiStatus.innerHTML = '';
  }

  document.getElementById('form-news-excerpt').value = item.excerpt || '';
  document.getElementById('form-news-quote').value = item.highlight_quote || '';
  document.getElementById('form-news-content').value = item.content || '';

  document.getElementById('modal-news-form-title').innerHTML = `
    <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
    <span>Edit Artikel Berita (#${item.id})</span>
  `;
  openModal('modal-news-form');
  lucide.createIcons();
}

async function handleFormGenerateNewsWithAI() {
  const urlInput = document.getElementById('form-news-ai-url');
  const statusEl = document.getElementById('form-news-ai-status');
  const btn = document.getElementById('btn-form-news-ai-generate');

  const rawUrl = (urlInput ? urlInput.value : '').trim();
  if (!rawUrl) {
    if (statusEl) {
      statusEl.className = 'flex text-[11px] font-semibold p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 items-center gap-2';
      statusEl.innerHTML = '<i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i><span>Harap masukkan tautan link Instagram atau YouTube terlebih dahulu.</span>';
      if (window.lucide) lucide.createIcons();
    }
    if (urlInput) urlInput.focus();
    return;
  }

  const origBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Menganalisis Link...</span>
    `;
  }

  if (statusEl) {
    statusEl.className = 'flex text-[11px] font-medium p-2.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 items-center gap-2';
    statusEl.innerHTML = `
      <svg class="animate-spin h-3.5 w-3.5 text-emerald-800 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Mengekstrak konteks, caption/transkrip, dan menyusun draf berita jurnalistik...</span>
    `;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const res = await fetch('/api/admin/news/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: rawUrl })
    });
    const result = await res.json();

    if (res.ok && result.success && result.data) {
      const d = result.data;

      const titleInput = document.getElementById('form-news-title');
      if (titleInput && d.title) titleInput.value = d.title;

      const catSelect = document.getElementById('form-news-category');
      if (catSelect && d.category) {
        const hasOpt = Array.from(catSelect.options).some(opt => opt.value === d.category);
        if (hasOpt) catSelect.value = d.category;
      }

      const badgeInput = document.getElementById('form-news-badge');
      if (badgeInput && d.badge_label) badgeInput.value = d.badge_label;

      const layoutSelect = document.getElementById('form-news-layout');
      if (layoutSelect && d.layout_type) layoutSelect.value = d.layout_type;

      const authorInput = document.getElementById('form-news-author');
      if (authorInput && d.author) authorInput.value = d.author;

      const excerptInput = document.getElementById('form-news-excerpt');
      if (excerptInput && d.excerpt) excerptInput.value = d.excerpt;

      const quoteInput = document.getElementById('form-news-quote');
      if (quoteInput && d.highlight_quote) quoteInput.value = d.highlight_quote;

      const contentInput = document.getElementById('form-news-content');
      if (contentInput && d.content) contentInput.value = d.content;

      const ytInput = document.getElementById('form-news-youtube');
      if (ytInput && d.youtube_url) ytInput.value = d.youtube_url;

      if (d.thumbnail_url) {
        setFormNewsThumbnailPreview(d.thumbnail_url, 'Cover AI Scraped');
      }

      if (statusEl) {
        statusEl.className = 'flex text-[11px] font-semibold p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 items-center gap-2';
        statusEl.innerHTML = `
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-700 shrink-0"></i>
          <span>Berita berhasil disusun otomatis oleh Gemini AI! Field di bawah telah terisi.</span>
        `;
        if (window.lucide) lucide.createIcons();
      }

      if (titleInput) {
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInput.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => titleInput.classList.remove('ring-2', 'ring-emerald-500'), 2000);
      }
    } else {
      if (statusEl) {
        statusEl.className = 'flex text-[11px] font-semibold p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 items-center gap-2';
        statusEl.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i><span>${result.error || 'Gagal menghasilkan berita dari URL tersebut.'}</span>`;
        if (window.lucide) lucide.createIcons();
      }
    }
  } catch (err) {
    console.error(err);
    if (statusEl) {
      statusEl.className = 'flex text-[11px] font-semibold p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 items-center gap-2';
      statusEl.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i><span>Terjadi gangguan koneksi saat memproses AI.</span>';
      if (window.lucide) lucide.createIcons();
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnHtml;
      if (window.lucide) lucide.createIcons();
    }
  }
}

// Aliases for homepage Bento Grid buttons
function openNewsEditModal(id) {
  openEditNewsModal(id);
}
function deleteNewsItem(id) {
  const item = (state.news || []).find(n => Number(n.id) === Number(id));
  handleDeleteNews(id, item ? item.title : `#${id}`);
}

async function handleSaveNews(e) {
  e.preventDefault();
  const id = document.getElementById('form-news-id').value;
  const thumbnailVal = (document.getElementById('form-news-thumbnail')?.value || '').trim() || '/static/images/news-featured.jpg';
  const youtubeVal = (document.getElementById('form-news-youtube')?.value || '').trim();

  const payload = {
    title: document.getElementById('form-news-title').value.trim(),
    category: document.getElementById('form-news-category').value.trim(),
    badge_label: document.getElementById('form-news-badge').value.trim(),
    author: document.getElementById('form-news-author').value.trim(),
    layout_type: document.getElementById('form-news-layout').value.trim(),
    thumbnail_url: thumbnailVal,
    youtube_url: youtubeVal || null,
    excerpt: document.getElementById('form-news-excerpt').value.trim(),
    highlight_quote: document.getElementById('form-news-quote').value.trim() || null,
    content: document.getElementById('form-news-content').value.trim() || null,
  };

  try {
    const url = id ? `/api/admin/news/${id}` : '/api/admin/news';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-news-form');
      showToast(data.message || 'Berita berhasil disimpan!', 'success');
      await loadHomepageData();
    } else {
      showToast(data.error || 'Gagal menyimpan berita', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

async function handleDeleteNews(id, title) {
  if (!confirm(`Hapus artikel berita "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/news/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Berita berhasil dihapus!', 'success');
      await loadHomepageData();
    } else {
      showToast(data.error || 'Gagal menghapus berita', 'error');
    }
  } catch (err) {
    showToast('Gagal menghubungi server', 'error');
  }
}

// ----------------------------------------------------------------------------
// C. JADWAL SIDANG (JAGADITA) ON-PAGE CONTROLLERS
// ----------------------------------------------------------------------------

function initSidangPageCms(isAdmin) {
  const slot = document.getElementById('jagadita-admin-add-slot');
  if (slot) {
    slot.innerHTML = isAdmin ? `
      <div class="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div>
          <h4 class="font-bold text-amber-950 text-xs">Panel Admin JAGADITA — Jadwal Sidang</h4>
          <p class="text-[11px] text-amber-800">Perbarui perkara pidana terdaftar untuk hari ini.</p>
        </div>
        <button onclick="openAddJagaditaModal()" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>+ Tambah Jadwal Sidang</span>
        </button>
      </div>
    ` : '';
  }
}

function openAddJagaditaModal() {
  ensureCmsModals();
  document.getElementById('form-jagadita-id').value = '';
  document.getElementById('form-jagadita-case-number').value = '';
  document.getElementById('form-jagadita-type').value = 'PIDUM';
  document.getElementById('form-jagadita-defendant').value = '';
  document.getElementById('form-jagadita-time').value = '09:00 WITA';
  document.getElementById('form-jagadita-room').value = 'R. Sidang Cakra';
  document.getElementById('form-jagadita-agenda').value = '';
  document.getElementById('form-jagadita-prosecutor').value = '';
  document.getElementById('form-jagadita-status').value = 'TERJADWAL';

  document.getElementById('modal-jagadita-form-title').innerHTML = `
    <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-800"></i>
    <span>Tambah Jadwal Sidang Baru</span>
  `;
  openModal('modal-jagadita-form');
  lucide.createIcons();
}

function openEditJagaditaModal(id) {
  ensureCmsModals();
  const schedules = (state.schedules && state.schedules.length) ? state.schedules : (window.allSchedules || []);
  const item = schedules.find(s => Number(s.id) === Number(id));
  if (!item) return;

  document.getElementById('form-jagadita-id').value = item.id;
  document.getElementById('form-jagadita-case-number').value = item.case_number || '';
  document.getElementById('form-jagadita-type').value = item.case_type || 'PIDUM';
  document.getElementById('form-jagadita-defendant').value = item.defendant_name || '';
  document.getElementById('form-jagadita-time').value = item.session_time || '09:00 WITA';
  document.getElementById('form-jagadita-room').value = item.court_room || 'R. Sidang Cakra';
  document.getElementById('form-jagadita-agenda').value = item.agenda || '';
  document.getElementById('form-jagadita-prosecutor').value = item.prosecutor || '';
  document.getElementById('form-jagadita-status').value = item.status || 'TERJADWAL';

  document.getElementById('modal-jagadita-form-title').innerHTML = `
    <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
    <span>Edit Jadwal Sidang (#${item.id})</span>
  `;
  openModal('modal-jagadita-form');
  lucide.createIcons();
}

async function handleSaveJagadita(e) {
  e.preventDefault();
  const id = document.getElementById('form-jagadita-id').value;
  const payload = {
    case_number: document.getElementById('form-jagadita-case-number').value.trim(),
    case_type: document.getElementById('form-jagadita-type').value.trim(),
    defendant_name: document.getElementById('form-jagadita-defendant').value.trim(),
    session_time: document.getElementById('form-jagadita-time').value.trim(),
    court_room: document.getElementById('form-jagadita-room').value.trim(),
    agenda: document.getElementById('form-jagadita-agenda').value.trim(),
    prosecutor: document.getElementById('form-jagadita-prosecutor').value.trim(),
    status: document.getElementById('form-jagadita-status').value.trim(),
  };

  try {
    const url = id ? `/api/admin/jagadita/${id}` : '/api/admin/jagadita';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-jagadita-form');
      showToast(data.message || 'Jadwal sidang berhasil disimpan!', 'success');
      if (typeof loadJagaditaData === 'function') {
        loadJagaditaData();
      }
      await loadHomepageData();
    } else {
      showToast(data.error || 'Gagal menyimpan jadwal sidang', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

async function handleDeleteJagadita(id, caseNumber) {
  if (!confirm(`Hapus perkara "${caseNumber}" dari jadwal sidang?`)) return;

  try {
    const res = await fetch(`/api/admin/jagadita/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Jadwal sidang berhasil dihapus!', 'success');
      if (typeof loadJagaditaData === 'function') {
        loadJagaditaData();
      }
      await loadHomepageData();
    } else {
      showToast(data.error || 'Gagal menghapus jadwal sidang', 'error');
    }
  } catch (err) {
    showToast('Gagal menghubungi server', 'error');
  }
}

// ----------------------------------------------------------------------------
// D. SKM (SURVEI KEPUASAN) ON-PAGE CONTROLLERS
// ----------------------------------------------------------------------------

function initSkmPageCms(isAdmin) {
  const slot = document.getElementById('skm-admin-edit-slot');
  if (slot) {
    slot.innerHTML = isAdmin ? `
      <div class="mb-6 flex flex-wrap items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 gap-3">
        <div>
          <h4 class="font-bold text-amber-950 text-xs">👑 Panel Admin Skor SKM & Piagam Evaluasi</h4>
          <p class="text-[11px] text-amber-800">Sesuaikan indeks kepuasan, predikat, jumlah responden, dan upload piagam resmi.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openSkmEditModal()" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>✏️ Edit Skor & Indikator</span>
          </button>
          <button onclick="openImageEditModal('page_contents', 'info_skm_infographic_url', '/static/images/hero-bg.jpg')" class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors">
            <i data-lucide="camera" class="w-3.5 h-3.5"></i>
            <span>Upload Piagam / Infografis</span>
          </button>
        </div>
      </div>
    ` : '';
  }

  // Populate Piagam / Infografis image if present
  if (state.contents && state.contents.info_skm_infographic_url && state.contents.info_skm_infographic_url.value) {
    const certImg = document.getElementById('info-skm-infographic-img');
    if (certImg) certImg.src = state.contents.info_skm_infographic_url.value;
  }
}

function openSkmEditModal() {
  ensureCmsModals();
  const c = state.contents || {};
  const skm = state.skm || {};

  document.getElementById('form-skm-score').value = (c.skm_main_score ? c.skm_main_score.value : (skm.main_score || '98.42'));
  document.getElementById('form-skm-predicate').value = (c.skm_predicate_text ? c.skm_predicate_text.value : (skm.predicate || 'A (SANGAT BAIK)'));
  document.getElementById('form-skm-period').value = (c.skm_period_badge ? c.skm_period_badge.value : (skm.period_badge || 'Triwulan IV - 2024'));
  document.getElementById('form-skm-respondents').value = (c.skm_respondents_count ? c.skm_respondents_count.value : (skm.respondents_count || '1.240 Responden'));

  // Metrics container
  const metricsCont = document.getElementById('skm-metrics-edit-container');
  if (metricsCont) {
    const defaultMetrics = [
      { label: '1. Persyaratan Pelayanan', score: 98.5 },
      { label: '2. Prosedur Pelayanan', score: 98.2 },
      { label: '3. Waktu Pelayanan', score: 97.8 },
      { label: '4. Biaya / Tarif (Rp 0,-)', score: 100.0 },
      { label: '5. Produk Spesifikasi Layanan', score: 98.0 },
      { label: '6. Kompetensi Pelaksana', score: 98.6 },
      { label: '7. Perilaku Pelaksana', score: 99.1 },
      { label: '8. Kualitas Sarana & Prasarana', score: 97.9 },
      { label: '9. Penanganan Pengaduan', score: 98.4 },
    ];

    let currentMetrics = defaultMetrics;
    if (c.skm_metrics_json && c.skm_metrics_json.value) {
      try {
        currentMetrics = JSON.parse(c.skm_metrics_json.value);
      } catch (e) {}
    }

    metricsCont.innerHTML = currentMetrics.map((m, idx) => `
      <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
        <label class="block font-bold text-slate-700 text-[11px] mb-1">${escapeHtml(m.label)}</label>
        <div class="flex items-center gap-1.5">
          <input type="number" step="0.1" min="0" max="100" class="skm-metric-input w-full px-2 py-1 border border-slate-300 rounded text-xs" data-index="${idx}" data-label="${escapeHtml(m.label)}" value="${m.score || 95}">
          <span class="text-xs font-bold text-slate-500">%</span>
        </div>
      </div>
    `).join('');
  }

  openModal('modal-skm-edit');
  lucide.createIcons();
}

async function handleSaveSkm(e) {
  e.preventDefault();
  const metricInputs = document.querySelectorAll('.skm-metric-input');
  const metrics = [];
  metricInputs.forEach(inp => {
    metrics.push({
      label: inp.getAttribute('data-label'),
      score: parseFloat(inp.value || '95')
    });
  });

  const payload = {
    main_score: document.getElementById('form-skm-score').value.trim(),
    predicate: document.getElementById('form-skm-predicate').value.trim(),
    period_badge: document.getElementById('form-skm-period').value.trim(),
    respondents_count: document.getElementById('form-skm-respondents').value.trim(),
    metrics: metrics
  };

  try {
    const res = await fetch('/api/admin/skm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-skm-edit');
      showToast(data.message || 'Skor SKM berhasil diperbarui!', 'success');
      await loadHomepageData();
      if (typeof loadSkmData === 'function') {
        loadSkmData();
      }
    } else {
      showToast(data.error || 'Gagal menyimpan skor SKM', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

// Notification Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'alert-circle';
  if (type === 'warning') icon = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-5 h-5 text-amber-400 shrink-0"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================================================
// INTERACTIVE HOMEPAGE CONTROLLERS (LIVE CLOCK, TICKER, SAKIP, MAP, ETC.)
// ============================================================================

// 1. Live WITA Digital Clock & Dynamic PTSP Operational Status
function initLiveClock() {
  const updateClock = () => {
    const clockEl = document.getElementById('live-wita-clock');
    const badgeEl = document.getElementById('ptsp-live-status-badge');

    // Compute WITA time (UTC+8)
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const witaDate = new Date(utcMs + (8 * 3600000));

    const hh = String(witaDate.getHours()).padStart(2, '0');
    const mm = String(witaDate.getMinutes()).padStart(2, '0');
    const ss = String(witaDate.getSeconds()).padStart(2, '0');

    if (clockEl) {
      clockEl.textContent = `${hh}:${mm}:${ss} WITA`;
    }

    if (badgeEl) {
      const day = witaDate.getDay(); // 0 = Sun, 1..5 = Mon..Fri, 6 = Sat
      const totalMinutes = witaDate.getHours() * 60 + witaDate.getMinutes();
      const isMonThuOpen = (day >= 1 && day <= 4) && (totalMinutes >= 480 && totalMinutes < 960); // 08:00 - 16:00
      const isFriOpen = (day === 5) && (totalMinutes >= 480 && totalMinutes < 990); // 08:00 - 16:30

      if (isMonThuOpen || isFriOpen) {
        badgeEl.textContent = 'PTSP BUKA';
        badgeEl.className = 'px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase';
      } else {
        badgeEl.textContent = 'LAYANAN ONLINE 24 JAM';
        badgeEl.className = 'px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase';
      }
    }
  };

  updateClock();
  setInterval(updateClock, 1000);

  // Initialize Global Scroll Progress Bar & Back-to-Top Button
  if (!document.getElementById('scroll-progress-bar')) {
    const pBar = document.createElement('div');
    pBar.id = 'scroll-progress-bar';
    document.body.prepend(pBar);
  }

  if (!document.getElementById('btn-back-to-top')) {
    const btnTop = document.createElement('button');
    btnTop.id = 'btn-back-to-top';
    btnTop.className = 'fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-[#0B3B24] text-amber-400 border border-amber-400/40 shadow-2xl transition-all duration-300 hidden opacity-0 pointer-events-none hover:scale-110 hover:bg-[#072A19] items-center justify-center group no-print';
    btnTop.setAttribute('aria-label', 'Kembali ke Atas');
    btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    btnTop.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-y-1 transition-transform"><path d="m18 15-6-6-6 6"/></svg>';
    document.body.appendChild(btnTop);
  }

  // Scroll listener for Progress Bar & Back-to-Top button
  window.addEventListener('scroll', () => {
    // 1. Update Scroll Progress Bar
    const progressEl = document.getElementById('scroll-progress-bar');
    if (progressEl) {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressEl.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
    }

    // 2. Update Back-to-Top visibility
    const btnTop = document.getElementById('btn-back-to-top');
    if (!btnTop) return;
    if (window.scrollY > 300) {
      btnTop.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      btnTop.classList.add('flex', 'opacity-100', 'pointer-events-auto');
    } else {
      btnTop.classList.add('hidden', 'opacity-0', 'pointer-events-none');
      btnTop.classList.remove('flex', 'opacity-100', 'pointer-events-auto');
    }
  });

  // Highlight active route in Mobile Bottom Dock & Mobile Drawer
  const currentPath = window.location.pathname || '/';
  document.querySelectorAll('#mobile-bottom-dock .mobile-dock-item[data-dock-path]').forEach(el => {
    const dockPath = el.getAttribute('data-dock-path');
    if ((dockPath === '/' && (currentPath === '/' || currentPath === '/index.html')) ||
        (dockPath !== '/' && currentPath.startsWith(dockPath))) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// 2. Responsive Mobile Menu Drawer Toggle
function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!drawer) return;
  const isNowOpen = drawer.classList.toggle('hidden') === false;
  if (isNowOpen) {
    // Ensure icons inside drawer are rendered
    if (window.lucide) lucide.createIcons();
  }
}

// 3. Interactive Running Text Ticker Controls (Play/Pause & Prev/Next)
const TICKER_MESSAGES = [
  'Selamat Datang di Portal Layanan Terpadu KERTAGOSA Kejaksaan Negeri Klungkung — Seluruh pelayanan PTSP & Pengantaran Barang Bukti SEMARA BAKTI 100% GRATIS tanpa dipungut biaya.',
  'Jadwal Sidang Pidana Umum & Tipikor (JAGADITA) diperbarui setiap hari kerja pukul 08.00 WITA. Klik baris perkara pada tabel untuk melihat detail agenda persidangan.',
  'Dokumen Transparansi & Akuntabilitas Kinerja (SAKIP): RENSTRA, RENJA, LKj, dan Laporan Triwulan kini dapat diakses dan dipratinjau langsung secara online.',
  'Saluran Pengaduan Masyarakat (MASADU) menjamin kerahasiaan identitas pelapor 100%. Laporkan indikasi korupsi atau pungutan liar melalui tombol MASADU.'
];

function toggleTickerPlay() {
  const textEl = document.getElementById('ticker-text');
  const iconEl = document.getElementById('ticker-pause-icon');
  if (!textEl) return;

  state.isTickerPaused = !state.isTickerPaused;
  if (state.isTickerPaused) {
    textEl.classList.add('ticker-paused');
    if (iconEl) iconEl.setAttribute('data-lucide', 'play');
  } else {
    textEl.classList.remove('ticker-paused');
    if (iconEl) iconEl.setAttribute('data-lucide', 'pause');
  }
  lucide.createIcons();
}

function cycleTickerAnnouncement(direction) {
  const textEl = document.getElementById('ticker-text');
  if (!textEl) return;

  const baseMsg = (state.contents.ticker_text && state.contents.ticker_text.value)
    ? state.contents.ticker_text.value
    : TICKER_MESSAGES[0];
  const pool = [baseMsg, ...TICKER_MESSAGES.slice(1)];

  state.tickerIndex = (state.tickerIndex + direction + pool.length) % pool.length;
  const chosen = pool[state.tickerIndex];
  textEl.textContent = `${chosen}   +++   ${chosen}`;
}

// 4. Live Client-Side News Search Input Handler
function handleHomeNewsSearch(query) {
  state.newsSearchQuery = (query || '').trim();
  const clearBtn = document.getElementById('home-news-search-clear');
  if (clearBtn) {
    if (state.newsSearchQuery.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }
  renderNewsSection();
}

function clearHomeNewsSearch() {
  const inp = document.getElementById('home-news-search');
  if (inp) {
    inp.value = '';
    inp.focus();
  }
  handleHomeNewsSearch('');
}

// 5. Interactive JAGADITA Court Schedule Detail Modal
function openScheduleDetailModal(scheduleId) {
  const item = state.schedules.find(s => Number(s.id) === Number(scheduleId));
  if (!item) return;

  const body = document.getElementById('schedule-detail-modal-body');
  if (!body) return;

  body.innerHTML = `
    <div class="space-y-4 text-xs">
      <div class="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nomor Register Perkara</span>
          <span class="font-mono font-black text-sm text-slate-900">${item.case_number}</span>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${getScheduleStatusBadgeClass(item.status)}">
          <span class="w-2 h-2 rounded-full ${getScheduleStatusDotClass(item.status)}"></span>
          ${item.status}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Nama Terdakwa</div>
          <div class="font-bold text-slate-900 text-xs sm:text-sm">${item.defendant_name}</div>
        </div>
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Klasifikasi Perkara</div>
          <div class="font-bold text-slate-900 text-xs sm:text-sm">${item.case_type === 'PIDUM' ? 'Tindak Pidana Umum (PIDUM)' : 'Tindak Pidana Khusus / Tipikor'}</div>
        </div>
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Waktu &amp; Ruang Sidang</div>
          <div class="font-bold text-emerald-900">${item.session_time}</div>
          <div class="text-[11px] text-slate-500">${item.court_room}</div>
        </div>
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Jaksa Penuntut Umum (JPU)</div>
          <div class="font-bold text-slate-800">${item.prosecutor}</div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 mb-1">Agenda Persidangan Hari Ini</div>
        <div class="font-heading font-bold text-sm text-emerald-950">${item.agenda}</div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onclick="closeModal('modal-schedule-detail'); openModal('modal-bb-delivery');" class="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition-colors">
          <i data-lucide="truck" class="w-3.5 h-3.5"></i>
          <span>Ajukan Pengantaran BB Perkara Ini</span>
        </button>
        <button type="button" onclick="closeModal('modal-schedule-detail')" class="px-4 py-2 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs transition-colors">
          Tutup Detail
        </button>
      </div>
    </div>
  `;
  lucide.createIcons();
  openModal('modal-schedule-detail');
}

// 6. Interactive SAKIP (Akuntabilitas Kinerja) Section on Homepage
async function loadHomeSakipData() {
  const grid = document.getElementById('home-sakip-grid');
  if (!grid) return;

  if (window.location.protocol === 'file:') {
    state.sakipDocs = [];
    renderHomeSakipSection();
    return;
  }

  try {
    const res = await fetch('/api/public/accountability');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) {
      state.sakipDocs = data.documents || [];
      const st = data.stats || {};
      state.sakipCounts = {
        ALL: st.total_docs ?? state.sakipDocs.length,
        RENSTRA: st.renstra_count ?? 0,
        RENJA: st.renja_count ?? 0,
        LKJ: st.lkj_count ?? 0,
        TRIWULAN: st.triwulan_count ?? 0,
      };
      renderHomeSakipSection();
    }
  } catch (err) {
    console.error('Failed to load homepage SAKIP docs:', err);
  }
}

function setHomeSakipCategory(category) {
  state.activeSakipCategory = category;
  document.querySelectorAll('.home-sakip-tab').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (cat === category) {
      btn.className = 'home-sakip-tab px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3B24] text-white shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap';
    } else {
      btn.className = 'home-sakip-tab px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5 whitespace-nowrap';
    }
  });
  renderHomeSakipSection();
}

function handleHomeSakipSearch(val) {
  state.sakipSearchQuery = (val || '').trim();
  renderHomeSakipSection();
}

function renderHomeSakipSection() {
  // Update tab counts
  ['ALL', 'RENSTRA', 'RENJA', 'LKJ', 'TRIWULAN'].forEach(key => {
    const el = document.getElementById(`home-sakip-count-${key}`);
    if (el && state.sakipCounts) {
      el.textContent = state.sakipCounts[key] ?? 0;
    }
  });

  const grid = document.getElementById('home-sakip-grid');
  if (!grid) return;

  const q = (state.sakipSearchQuery || '').toLowerCase();
  const filtered = state.sakipDocs.filter(doc => {
    const matchCat = state.activeSakipCategory === 'ALL' || doc.category === state.activeSakipCategory;
    const yr = doc.period_year || doc.year_label || '';
    const matchQuery = !q ||
      (doc.title || '').toLowerCase().includes(q) ||
      (doc.description || '').toLowerCase().includes(q) ||
      yr.toLowerCase().includes(q) ||
      (doc.category || '').toLowerCase().includes(q);
    return matchCat && matchQuery;
  }).slice(0, 6); // Show top 6 interactive cards on homepage

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
        Tidak ada dokumen akuntabilitas kinerja yang sesuai dengan filter pencarian.
      </div>
    `;
    return;
  }

  const catBadgeMap = {
    RENSTRA: { label: 'RENSTRA', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    RENJA: { label: 'RENJA', cls: 'bg-amber-100 text-amber-900 border-amber-300' },
    LKJ: { label: 'LAPORAN KINERJA (LKj)', cls: 'bg-blue-100 text-blue-900 border-blue-300' },
    TRIWULAN: { label: 'LAPORAN TRIWULAN', cls: 'bg-purple-100 text-purple-900 border-purple-300' },
  };

  grid.innerHTML = filtered.map(doc => {
    const badge = catBadgeMap[doc.category] || { label: doc.category, cls: 'bg-slate-100 text-slate-800 border-slate-300' };
    const docUrl = doc.doc_url || doc.gdrive_url || '#';
    const docYear = doc.period_year || doc.year_label || 'Terbaru';
    return `
      <div class="sakip-home-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.cls}">
              ${badge.label}
            </span>
            <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Tahun ${docYear}
            </span>
          </div>

          <h3 class="font-heading font-bold text-sm text-slate-900 mb-1.5 leading-snug hover:text-emerald-800 cursor-pointer transition-colors" onclick="openHomeDocViewer(${doc.id})">
            ${doc.title}
          </h3>

          <p class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            ${doc.description || 'Dokumen resmi Akuntabilitas Kinerja Instansi Pemerintah Kejaksaan Negeri Klungkung.'}
          </p>
        </div>

        <div>
          <div class="flex items-center justify-between text-[11px] text-slate-400 pb-3 mb-3 border-b border-slate-100">
            <span class="flex items-center gap-1"><i data-lucide="file-check-2" class="w-3.5 h-3.5 text-emerald-700"></i> ${doc.file_size || 'PDF Resmi'}</span>
            <span class="flex items-center gap-1"><i data-lucide="eye" class="w-3.5 h-3.5"></i> ${doc.views_count || 0}x dilihat</span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" onclick="openHomeDocViewer(${doc.id})" class="flex-1 py-2 px-3 rounded-xl bg-[#0B3B24] hover:bg-[#072A19] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Pratinjau PDF</span>
            </button>
            <a href="${docUrl}" target="_blank" rel="noopener" class="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors" title="Buka di Google Drive">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Drive</span>
            </a>
            <button type="button" onclick="copyHomeDocLink('${docUrl}', '${(doc.title || '').replace(/'/g, "\\'")}')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors" title="Salin Link Google Drive">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function getGoogleDriveEmbedUrl(url) {
  if (!url) return 'about:blank';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

async function openHomeDocViewer(docId) {
  const doc = state.sakipDocs.find(d => Number(d.id) === Number(docId));
  if (!doc) return;

  const docUrl = doc.doc_url || doc.gdrive_url || '#';
  const docYear = doc.period_year || doc.year_label || '';

  const titleEl = document.getElementById('home-doc-viewer-title');
  const badgeEl = document.getElementById('home-doc-viewer-badge');
  const extEl = document.getElementById('home-doc-viewer-external');
  const iframeEl = document.getElementById('home-doc-viewer-iframe');

  if (titleEl) titleEl.textContent = doc.title;
  if (badgeEl) badgeEl.textContent = `${doc.category} • ${docYear}`;
  if (extEl) extEl.href = docUrl;
  if (iframeEl) iframeEl.src = getGoogleDriveEmbedUrl(docUrl);

  openModal('modal-home-doc-viewer');

  // Increment view count in background
  try {
    await fetch(`/api/public/accountability/${doc.id}/view`, { method: 'POST' });
    doc.views_count = (doc.views_count || 0) + 1;
    renderHomeSakipSection();
  } catch (e) {}
}

function closeHomeDocViewer() {
  const iframeEl = document.getElementById('home-doc-viewer-iframe');
  if (iframeEl) iframeEl.src = 'about:blank';
  closeModal('modal-home-doc-viewer');
}

function copyHomeDocLink(url, title) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`Tautan "${title}" berhasil disalin!`, 'success');
    }).catch(() => {
      showToast(`Tautan: ${url}`, 'info');
    });
  } else {
    showToast(`Tautan: ${url}`, 'info');
  }
}

// 7. Interactive 4 Kecamatan Coverage Switcher in Section 6
const KECAMATAN_COVERAGE_DATA = {
  'Klungkung': {
    title: 'Kecamatan Klungkung (Pusat Kota Semarapura)',
    desc: '18 Desa/Kelurahan • Jarak 0–4 km dari Kantor Kejari • Layanan Antar BB SEMARA BAKTI Setiap Hari Kerja.'
  },
  'Banjarangkan': {
    title: 'Kecamatan Banjarangkan (Wilayah Barat)',
    desc: '13 Desa Dinas & Adat • Jarak 4–12 km dari Kantor Kejari • Jangkauan Penyuluhan Jaksa Masuk Desa & Antar BB Gratis.'
  },
  'Dawan': {
    title: 'Kecamatan Dawan (Wilayah Timur & Pelabuhan Kusamba)',
    desc: '12 Desa • Jarak 5–14 km dari Kantor Kejari • Posko Terpadu Pengawasan Pelabuhan & Layanan SEMARA BAKTI.'
  },
  'Nusa Penida': {
    title: 'Kecamatan Kepulauan Nusa Penida (Penida, Lembongan, Ceningan)',
    desc: '16 Desa Kepulauan • Layanan Sidang Daring, Pos Pelayanan Hukum Datun Kepulauan & Pengantaran BB Terjadwal.'
  }
};

function selectKecamatanInfo(district) {
  const info = KECAMATAN_COVERAGE_DATA[district];
  if (!info) return;

  document.querySelectorAll('.kecamatan-pill-btn').forEach(btn => {
    if (btn.getAttribute('data-kec') === district) {
      btn.className = 'kecamatan-pill-btn px-2.5 py-2 rounded-xl text-xs font-bold bg-[#0B3B24] text-white shadow-sm transition-all text-center';
    } else {
      btn.className = 'kecamatan-pill-btn px-2.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 transition-all text-center';
    }
  });

  const titleEl = document.getElementById('kec-info-title');
  const descEl = document.getElementById('kec-info-desc');
  if (titleEl) titleEl.textContent = info.title;
  if (descEl) descEl.textContent = info.desc;
}

// 8. Submit Pos Pelayanan Hukum (DATUN) Consultation Form
async function submitDatunConsultForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.applicant_name.value.trim();
  const phone = form.applicant_phone.value.trim();
  const topic = form.legal_topic.value;
  const summary = form.question_summary.value.trim();

  const payload = {
    title: `Konsultasi Hukum DATUN: ${topic}`,
    category: 'Pelayanan Publik Kejari',
    chronology: `[Permohonan Konsultasi JPN - ${topic}] ${summary}`,
    is_anonymous: false,
    reporter_name: name,
    reporter_phone: phone,
  };

  try {
    const res = await fetch('/api/public/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-datun-consult');
      form.reset();
      showSuccessTicketModal(data.ticket_code, 'Konsultasi Hukum Gratis (DATUN)');
    } else {
      showToast(data.error || 'Gagal mengirim permohonan konsultasi', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'error');
  }
}

// 9. Floating Quick-Assist Widget Toggle
function toggleQuickAssist() {
  const menu = document.getElementById('quick-assist-menu');
  if (!menu) return;
  menu.classList.toggle('hidden');
}

// 10. Public BA-20 (Berita Acara Pengembalian Barang Bukti) Modal Handler
async function openPublicBa20Modal(ticketCode) {
  try {
    const res = await fetch(`/api/public/deliveries/${encodeURIComponent(ticketCode)}/ba`);
    const data = await res.json();
    if (!data.success) {
      showToast(data.error || 'Data Berita Acara belum tersedia.', 'warning');
      return;
    }

    const d = data.delivery;
    const setTxt = (id, val, fallback) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || fallback || '-';
    };

    setTxt('pub-pv-ba-day', d.ba_day, 'Rabu');
    setTxt('pub-pv-ba-date-spelled', d.ba_date_spelled, 'Dua Puluh Satu bulan Oktober tahun Dua Ribu Dua Puluh Enam');
    setTxt('pub-pv-officer-name', d.officer_name, 'I Komang Arimbawa, S.H.');
    setTxt('pub-pv-officer-rank-nip', `${d.officer_rank || 'Jaksa'} / NIP. ${d.officer_nip || '-'}`);
    setTxt('pub-pv-officer-position', d.officer_position || 'Jaksa Penuntut Umum / Petugas Pengembalian BB');
    
    setTxt('pub-pv-sprint-number', d.sprint_number);
    setTxt('pub-pv-sprint-date', d.sprint_date);
    setTxt('pub-pv-defendant-name', d.defendant_name || d.owner_name);
    setTxt('pub-pv-violation-clause', d.violation_clause || 'Pasal 378 KUHP');
    setTxt('pub-pv-court-num', d.court_verdict_number || d.case_number);
    setTxt('pub-pv-court-date', d.court_verdict_date || d.sprint_date);
    
    setTxt('pub-pv-item-description', d.item_description);
    setTxt('pub-pv-owner-name', d.owner_name);
    setTxt('pub-pv-owner-job', d.owner_job || 'Wiraswasta');
    setTxt('pub-pv-delivery-address', d.delivery_address);

    setTxt('pub-pv-sig-owner', d.owner_name);
    setTxt('pub-pv-sig-officer', d.officer_name);
    setTxt('pub-pv-sig-officer-nip', `${d.officer_rank || 'Jaksa'} / NIP. ${d.officer_nip || '-'}`);
    setTxt('pub-pv-sig-kasi', d.kasi_name || 'I Dewa Gede Raka, S.H.');
    setTxt('pub-pv-sig-kasi-nip', `${d.kasi_rank || 'Jaksa Muda / III-d'} / NIP. ${d.kasi_nip || '19811105 200501 1 007'}`);

    setTxt('pub-pv-witness-1', d.witness_1 || 'I Wayan Gede Sunarta, A.Md.');
    setTxt('pub-pv-witness-2', d.witness_2 || 'I Made Sujana, S.Kom.');

    openModal('modal-public-ba20');
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    showToast('Gagal memuat Berita Acara BA-20.', 'error');
  }
}

// ============================================================================
// 12. DYNAMIC INTERACTIVE NUMBER COUNT-UP ANIMATION (ON SCROLL)
// ============================================================================
function animateNumberCountUp(el, targetVal, duration = 1200, decimals = 0, prefix = '', suffix = '') {
  if (!el) return;
  const startTime = performance.now();
  const startVal = 0;
  el.classList.add('counter-animate', 'counting');

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const current = startVal + (targetVal - startVal) * eased;
    el.textContent = `${prefix}${decimals > 0 ? current.toFixed(decimals) : Math.round(current)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = `${prefix}${decimals > 0 ? targetVal.toFixed(decimals) : Math.round(targetVal)}${suffix}`;
      el.classList.remove('counting');
    }
  }

  requestAnimationFrame(frame);
}

function initNumberCounters() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.hasAnimated === 'true') return;
        el.dataset.hasAnimated = 'true';

        let rawVal = el.dataset.targetVal || el.textContent || '';
        let numVal = parseFloat(rawVal.replace(/[^0-9.]/g, '')) || 0;
        let decimals = 0;
        let suffix = '';

        if (el.id === 'hero-stat-1-value' || el.id === 'skm-main-score') {
          decimals = 2;
        } else if (el.id === 'hero-stat-2-value' || rawVal.includes('%')) {
          suffix = '%';
        } else if (rawVal.includes('Rp')) {
          // Keep currency as is
          return;
        }

        animateNumberCountUp(el, numVal, 1200, decimals, '', suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  ['hero-stat-1-value', 'hero-stat-2-value', 'skm-main-score', 'skm-respondents-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.dataset.hasAnimated !== 'true') {
      observer.observe(el);
    }
  });

  document.querySelectorAll('.counter-animate:not([data-has-animated="true"])').forEach(el => {
    observer.observe(el);
  });
}

// ============================================================================
// 13. INTERACTIVE 5-STAR QUICK RATING (SKM CARD & MODAL)
// ============================================================================
let _selectedQuickStar = 0;

function previewQuickStars(stars) {
  const container = document.getElementById('quick-skm-stars');
  if (!container) return;
  const buttons = container.querySelectorAll('.quick-star-btn');
  buttons.forEach((btn, idx) => {
    if (idx < stars) {
      btn.classList.add('active', 'text-amber-400');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('active', 'text-amber-400');
      btn.classList.add('text-slate-300');
    }
  });

  const captions = [
    'Pilih Bintang (1 - 5)',
    '1 - Sangat Kurang ⭐',
    '2 - Kurang ⭐⭐',
    '3 - Cukup ⭐⭐⭐',
    '4 - Baik ⭐⭐⭐⭐',
    '5 - Sangat Baik! ⭐⭐⭐⭐⭐'
  ];
  const capEl = document.getElementById('quick-star-caption');
  if (capEl) capEl.textContent = captions[stars] || captions[0];
}

function resetQuickStars() {
  previewQuickStars(_selectedQuickStar);
}

function handleQuickStarRate(stars) {
  _selectedQuickStar = stars;
  previewQuickStars(stars);
  const capEl = document.getElementById('quick-star-caption');
  if (capEl) {
    capEl.textContent = `Bintang ${stars} Terpilih`;
  }

  // Open the SKM survey modal and auto-select matching ratings
  openModal('modal-skm-survey');

  const modal = document.getElementById('modal-skm-survey');
  if (modal) {
    const radioVal = stars >= 5 ? '5' : (stars >= 4 ? '4' : '3');
    ['score_persyaratan', 'score_waktu', 'score_biaya', 'score_petugas'].forEach(name => {
      const radio = modal.querySelector(`input[name="${name}"][value="${radioVal}"]`);
      if (radio) radio.checked = true;
    });
  }

  showToast(`Bintang ${stars} dipilih! Silakan lengkapi formulir survei SKM.`, 'success');
}

// ============================================================================
// 14. CLICK-TO-COPY TO CLIPBOARD WITH TOAST FEEDBACK
// ============================================================================
function copyToClipboard(text, label = 'Teks') {
  if (!text) return;
  const doShow = () => {
    if (typeof showToast === 'function') {
      showToast(`${label} berhasil disalin ke clipboard!`, 'success');
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(doShow).catch(() => {
      fallbackCopy(text);
      doShow();
    });
  } else {
    fallbackCopy(text);
    doShow();
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(ta);
}

// Expose globals for HTML inline events
window.animateNumberCountUp = animateNumberCountUp;
intersectionObservers = initNumberCounters;
window.initNumberCounters = initNumberCounters;
window.previewQuickStars = previewQuickStars;
window.resetQuickStars = resetQuickStars;
window.handleQuickStarRate = handleQuickStarRate;
window.copyToClipboard = copyToClipboard;
window.handleAdminLogin = handleAdminLogin;
window.handleMfaVerify = handleMfaVerify;
window.handleAdminLoginStep1 = handleAdminLogin;
window.handleAdminLoginStep2Mfa = handleMfaVerify;
window.switchMfaLoginSubTab = switchMfaLoginSubTab;
window.selectMfaAppBadge = selectMfaAppBadge;
window.copyMfaSecretKey = copyMfaSecretKey;
window.resetLoginModal = resetLoginModal;
window.renderAdminLoginModalState = renderAdminLoginModalState;
window.handleAdminLogoutFromModal = handleAdminLogoutFromModal;

// 11. Auto-initialize Floating Accessibility Widget (Bottom-Left)
if (typeof window.A11Y === 'undefined' && !document.getElementById('a11y-widget-root')) {
  const a11yScript = document.createElement('script');
  a11yScript.src = '/static/js/accessibility.js?v=3.0';
  document.head.appendChild(a11yScript);
}
