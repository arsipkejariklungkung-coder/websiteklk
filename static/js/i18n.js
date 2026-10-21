/**
 * KERTAGOSA - Multi-Language Translation Engine (IND / ENG)
 * High-performance bilingual switcher for Kejaksaan Negeri Klungkung portal.
 */

(function () {
  'use strict';

  const I18N_TRANSLATIONS = {
    id: {
      lang_code: 'id',
      site_title: 'KEJAKSAAN REPUBLIK INDONESIA - KEJAKSAAN NEGERI KLUNGKUNG',
      wbk_badge: '⭐ ZONA INTEGRITAS WBK / WBBM',
      header_hours: 'Senin - Jumat: 08.00 - 16.00 WITA',
      ptsp_active: 'PTSP AKTIF',
      lacak_tiket: 'Lacak Tiket Layanan',
      login_admin: 'Login Petugas / Master Admin',

      // Navigation
      nav_home: 'Beranda',
      nav_profile: 'Profil Instansi',
      nav_structure: 'Struktur Organisasi',
      nav_vision: 'Visi & Misi',
      nav_history: 'Sejarah Kejari',
      nav_logo: 'Logo & Makna',
      nav_duties: 'Tugas & Wewenang',
      nav_services: 'Layanan Publik',
      nav_news: 'Berita & Publikasi',
      nav_accountability: 'Transparansi Kinerja',
      nav_sakip: 'SAKIP & Akuntabilitas',
      nav_ikm: 'Survei Kepuasan (IKM)',
      nav_jadwal_sidang: 'Jadwal Sidang',
      nav_contact: 'Hubungi Kami',

      // Hero
      hero_badge_1: 'KEJAKSAAN NEGERI KLUNGKUNG',
      hero_badge_2: 'PELAYANAN PUBLIK TERPADU',
      hero_title: 'KERTAGOSA',
      hero_desc: 'Melalui "KERTAGOSA", KEJARI Klungkung berkomitmen untuk memberikan kerja yang menekankan pelayanan dan penegakan hukum yang cepat, tepat, dan profesional kepada seluruh masyarakat.',
      hero_btn_primary: 'Pelayanan Hukum',
      hero_btn_secondary: 'Laporkan Pengaduan (MASADU)',
      hero_stat_1_label: 'Indeks Kepuasan (Sangat Baik)',
      hero_stat_2_label: 'Transparansi Sidang & Perkara',
      hero_stat_3_label: 'Biaya Pengantaran BB (Gratis)',
      kajari_position: 'KEPALA KEJAKSAAN NEGERI KLUNGKUNG',

      // Running Ticker
      ticker_badge: 'PENGUMUMAN PENTING',
      ticker_text: 'Jadwal Pelayanan Terpadu Satu Pintu (PTSP) beroperasi penuh Senin - Jumat (08.00 - 16.00 WITA). Pengantaran Barang Bukti (SEMARA BAKTI) 100% GRATIS ke seluruh daratan Klungkung & Nusa Penida. Aduan dugaan korupsi dapat disampaikan melalui MASADU dengan kerahasiaan 100% terjamin.',

      // 4 Pillars Section
      pillars_badge: 'INOVASI PELAYANAN UNGGULAN',
      pillars_title: '4 Pilar Layanan Unggulan KERTAGOSA',
      pillars_desc: 'Inovasi pelayanan digital terintegrasi untuk masyarakat Kabupaten Klungkung yang transparan, mudah, dan bebas biaya.',
      
      service_semara_title: 'SEMARA BAKTI',
      service_semara_subtitle: 'Pengantaran Barang Bukti',
      service_semara_desc: 'Layanan antar barang bukti perkara pidana yang telah berkekuatan hukum tetap (inkracht) langsung ke alamat penerima secara 100% GRATIS.',
      service_semara_btn: 'Ajukan Antar Barang Bukti',

      service_masadu_title: 'MASADU',
      service_masadu_subtitle: 'Aspirasi & Pengaduan Terpadu',
      service_masadu_desc: 'Kanal aduan resmi dugaan tindak pidana korupsi, penyalahgunaan wewenang, pungutan liar, serta pelayanan pegawai dengan jaminan kerahasiaan identitas.',
      service_masadu_btn: 'Laporkan Pengaduan Sekarang',

      service_jagadita_title: 'JAGADITA',
      service_jagadita_subtitle: 'Jadwal & Agenda Sidang Terbuka',
      service_jagadita_desc: 'Papan transparansi jadwal sidang perkara pidana umum, khusus, dan perdata di Pengadilan Negeri Semarapura secara realtime.',
      service_jagadita_btn: 'Lihat Jadwal Sidang',

      service_sikonsul_title: 'SI-KONSUL',
      service_sikonsul_subtitle: 'Konsultasi Hukum Online',
      service_sikonsul_desc: 'Konsultasi hukum perdata dan tata usaha negara gratis oleh Jaksa Pengacara Negara (JPN) bagi perorangan, lembaga desa, dan instansi.',
      service_sikonsul_btn: 'Mulai Konsultasi Online',

      // Digital Integrations
      digital_badge: 'PORTAL INTEGRASI RESMI',
      digital_title: 'Layanan Digital Terpadu Kejaksaan RI',
      digital_desc: 'Akses cepat ke portal dan aplikasi resmi nasional Kejaksaan RI dan SP4N LAPOR!',

      // News Section
      news_badge: 'KABAR TERKINI & AGENDA KEJAKSAAN',
      news_title: 'Pusat Berita & Publikasi Hukum',
      news_desc: 'Informasi transparan mengenai penegakan hukum, kegiatan sosial, pemulihan keuangan negara, dan pelayanan hukum Kejari Klungkung.',
      news_cat_all: 'Semua Berita',
      news_cat_press: 'Siaran Pers',
      news_cat_activity: 'Kegiatan Kejari',
      news_cat_public: 'Pelayanan Publik',
      news_cat_counsel: 'Penyuluhan Hukum',
      news_read_more: 'Baca Selengkapnya',

      // SKM / IKM Section
      skm_badge: 'SURVEI KEPUASAN MASYARAKAT',
      skm_title: 'Indeks Kepuasan Masyarakat (IKM)',
      skm_desc: 'Berdasarkan survei berkala responden pengguna layanan PTSP Kejaksaan Negeri Klungkung secara transparan dan akuntabel.',
      skm_predicate: 'Mutu Pelayanan: A (Sangat Baik)',
      skm_respondents: 'Total Responden Terverifikasi',

      // Office & Contact Section
      office_title: 'Kantor Kejaksaan Negeri Klungkung',
      office_desc: 'Wilayah hukum Kejaksaan Negeri Klungkung mencakup daratan Klungkung hingga kepulauan Nusa Penida, siap melayani dengan integritas tinggi dan keterbukaan informasi publik.',
      office_address_label: 'Alamat Kantor',
      office_hours_label: 'Jam Operasional Pelayanan',
      office_hotline_label: 'Hotline PTSP & WhatsApp',
      office_phone_label: 'Telepon Kantor',
      office_email_label: 'Email Resmi',
      office_btn_maps: 'Buka Petunjuk Arah Google Maps',

      // Ticket Tracker Modal
      tracker_modal_title: 'Lacak Status Tiket Layanan',
      tracker_modal_desc: 'Pantau status dan tindak lanjut aduan MASADU atau permohonan SEMARA BAKTI Anda secara realtime.',
      tracker_input_placeholder: 'Masukkan Kode Tiket (Contoh: TRK-MASADU-XXXX)',
      tracker_btn_search: 'Cari Tiket',

      // Footer
      footer_about_title: 'Tentang Kejari Klungkung',
      footer_about_text: 'Kejaksaan Negeri Klungkung adalah lembaga penegak hukum yang menjunjung tinggi keadilan, integritas, dan profesionalisme dengan semangat melayani masyarakat.',
      footer_links_title: 'Tautan Pintas',
      footer_services_title: 'Layanan Terpadu',
      footer_contact_title: 'Kontak & Lokasi',
      footer_copyright: '© 2026 Kejaksaan Negeri Klungkung - Hak Cipta Dilindungi Undang-Undang. Portal KERTAGOSA v2.4'
    },

    en: {
      lang_code: 'en',
      site_title: 'ATTORNEY GENERAL OF INDONESIA - DISTRICT ATTORNEY OF KLUNGKUNG',
      wbk_badge: '⭐ INTEGRITY ZONE WBK / WBBM',
      header_hours: 'Monday - Friday: 08.00 - 16.00 WITA',
      ptsp_active: 'PTSP ACTIVE',
      lacak_tiket: 'Track Service Ticket',
      login_admin: 'Officer / Master Admin Login',

      // Navigation
      nav_home: 'Home',
      nav_profile: 'Agency Profile',
      nav_structure: 'Organization Structure',
      nav_vision: 'Vision & Mission',
      nav_history: 'History',
      nav_logo: 'Logo & Symbolism',
      nav_duties: 'Duties & Authorities',
      nav_services: 'Public Services',
      nav_news: 'News & Media',
      nav_accountability: 'Accountability',
      nav_sakip: 'SAKIP & Performance',
      nav_ikm: 'Satisfaction Survey (IKM)',
      nav_jadwal_sidang: 'Court Schedules',
      nav_contact: 'Contact Us',

      // Hero
      hero_badge_1: 'DISTRICT ATTORNEY OF KLUNGKUNG',
      hero_badge_2: 'INTEGRATED PUBLIC SERVICE',
      hero_title: 'KERTAGOSA',
      hero_desc: 'Through "KERTAGOSA", the District Attorney of Klungkung is committed to delivering fast, accurate, and professional public service and law enforcement to all citizens.',
      hero_btn_primary: 'Legal Services',
      hero_btn_secondary: 'File a Complaint (MASADU)',
      hero_stat_1_label: 'Satisfaction Index (Excellent)',
      hero_stat_2_label: 'Court & Trial Transparency',
      hero_stat_3_label: 'Evidence Delivery Fee (Free)',
      kajari_position: 'HEAD OF DISTRICT ATTORNEY OF KLUNGKUNG',

      // Running Ticker
      ticker_badge: 'IMPORTANT NOTICE',
      ticker_text: 'Integrated One-Door Service (PTSP) is fully operational Monday - Friday (08.00 - 16.00 WITA). Evidence Delivery Service (SEMARA BAKTI) is 100% FREE across mainland Klungkung & Nusa Penida islands. Corruption grievances can be securely filed through MASADU with guaranteed whistleblower confidentiality.',

      // 4 Pillars Section
      pillars_badge: 'FLAGSHIP SERVICE INNOVATIONS',
      pillars_title: '4 Flagship Service Pillars of KERTAGOSA',
      pillars_desc: 'Integrated digital public services for the community of Klungkung Regency: transparent, accessible, and completely free.',
      
      service_semara_title: 'SEMARA BAKTI',
      service_semara_subtitle: 'Evidence Doorstep Delivery',
      service_semara_desc: 'Direct doorstep delivery service for legally final court-returned evidence and criminal case property, 100% FREE of charge.',
      service_semara_btn: 'Request Evidence Delivery',

      service_masadu_title: 'MASADU',
      service_masadu_subtitle: 'Integrated Grievance & Whistleblower Channel',
      service_masadu_desc: 'Official reporting channel for alleged corruption, abuse of power, illegal fees, and public service misconduct with guaranteed identity protection.',
      service_masadu_btn: 'File Complaint Now',

      service_jagadita_title: 'JAGADITA',
      service_jagadita_subtitle: 'Open Court Agendas & Schedules',
      service_jagadita_desc: 'Transparent real-time board for public criminal, special criminal, and civil court trial dockets at Semarapura District Court.',
      service_jagadita_btn: 'View Court Schedules',

      service_sikonsul_title: 'SI-KONSUL',
      service_sikonsul_subtitle: 'Free Online Legal Consultation',
      service_sikonsul_desc: 'Free civil and state administrative legal counseling by State Prosecutors (JPN) for citizens, village institutions, and government bodies.',
      service_sikonsul_btn: 'Start Online Legal Advisory',

      // Digital Integrations
      digital_badge: 'OFFICIAL INTEGRATION PORTAL',
      digital_title: 'Integrated Digital Portals of Attorney General RI',
      digital_desc: 'Quick access to national official portals and systems of the Attorney General of the Republic of Indonesia and SP4N LAPOR!',

      // News Section
      news_badge: 'LATEST NEWS & PROSECUTOR UPDATES',
      news_title: 'Legal Publications & News Center',
      news_desc: 'Transparent official updates regarding law enforcement, social community activities, state asset recovery, and legal assistance.',
      news_cat_all: 'All News',
      news_cat_press: 'Press Releases',
      news_cat_activity: 'Prosecution Activities',
      news_cat_public: 'Public Services',
      news_cat_counsel: 'Legal Counseling',
      news_read_more: 'Read Full Article',

      // SKM / IKM Section
      skm_badge: 'PUBLIC SATISFACTION SURVEY',
      skm_title: 'Public Satisfaction Index (IKM)',
      skm_desc: 'Based on transparent and accountable periodic surveys of PTSP service users at Klungkung District Attorney.',
      skm_predicate: 'Service Quality: A (Excellent)',
      skm_respondents: 'Total Verified Respondents',

      // Office & Contact Section
      office_title: 'District Attorney Office of Klungkung',
      office_desc: 'The legal jurisdiction of Klungkung District Attorney encompasses the Klungkung mainland and Nusa Penida islands, ready to serve with integrity and public transparency.',
      office_address_label: 'Office Address',
      office_hours_label: 'Public Service Hours',
      office_hotline_label: 'PTSP & WhatsApp Hotline',
      office_phone_label: 'Office Phone',
      office_email_label: 'Official Email',
      office_btn_maps: 'Open Google Maps Directions',

      // Ticket Tracker Modal
      tracker_modal_title: 'Track Service Ticket Status',
      tracker_modal_desc: 'Monitor real-time status and progress of your MASADU grievance or SEMARA BAKTI evidence delivery request.',
      tracker_input_placeholder: 'Enter Ticket Code (e.g. TRK-MASADU-XXXX)',
      tracker_btn_search: 'Search Ticket',

      // Footer
      footer_about_title: 'About Kejari Klungkung',
      footer_about_text: 'District Attorney of Klungkung is a law enforcement institution committed to justice, integrity, and professionalism in public service.',
      footer_links_title: 'Quick Links',
      footer_services_title: 'Integrated Services',
      footer_contact_title: 'Contact & Location',
      footer_copyright: '© 2026 District Attorney of Klungkung - All Rights Reserved. KERTAGOSA Portal v2.4'
    }
  };

  let currentLang = 'id';

  function initLanguage() {
    try {
      const saved = localStorage.getItem('kertagosa_lang');
      if (saved === 'en' || saved === 'id') {
        currentLang = saved;
      }
    } catch (e) {
      currentLang = 'id';
    }
    window.currentLanguage = currentLang;
    applyLanguage(currentLang, false);
  }

  function setLanguage(lang) {
    if (lang !== 'id' && lang !== 'en') return;
    currentLang = lang;
    window.currentLanguage = lang;
    try {
      localStorage.setItem('kertagosa_lang', lang);
    } catch (e) {}

    applyLanguage(lang, true);
  }

  function applyLanguage(lang, showToastNotification) {
    const dict = I18N_TRANSLATIONS[lang] || I18N_TRANSLATIONS.id;

    // 1. Set document language
    document.documentElement.lang = lang;

    // 2. Update toggle buttons appearance
    const btnId = document.getElementById('btn-lang-id');
    const btnEn = document.getElementById('btn-lang-en');
    const mobBtnId = document.getElementById('mob-btn-lang-id');
    const mobBtnEn = document.getElementById('mob-btn-lang-en');

    const activeClass = 'bg-[#0B3B24] text-white shadow-xs';
    const inactiveClass = 'text-slate-600 hover:text-slate-900';

    if (btnId && btnEn) {
      if (lang === 'en') {
        btnId.className = 'px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ' + inactiveClass;
        btnEn.className = 'px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ' + activeClass;
      } else {
        btnId.className = 'px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ' + activeClass;
        btnEn.className = 'px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ' + inactiveClass;
      }
    }

    if (mobBtnId && mobBtnEn) {
      if (lang === 'en') {
        mobBtnId.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all ' + inactiveClass;
        mobBtnEn.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all ' + activeClass;
      } else {
        mobBtnId.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all ' + activeClass;
        mobBtnEn.className = 'px-3 py-1 rounded-md text-xs font-bold transition-all ' + inactiveClass;
      }
    }

    // 3. Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key] !== undefined) {
        // Save original ID text if not saved yet
        if (!el.hasAttribute('data-i18n-orig')) {
          el.setAttribute('data-i18n-orig', el.textContent.trim());
        }
        el.textContent = dict[key];
      }
    });

    // 4. Translate all elements with data-i18n-html
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key && dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // 5. Translate input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // 6. Direct UI element updates by ID
    const directUpdates = [
      { id: 'header-hours', key: 'header_hours' },
      { id: 'header-wbk-badge', key: 'wbk_badge' },
      { id: 'ptsp-live-status-badge', key: 'ptsp_active' },
      { id: 'hero-badge-1', key: 'hero_badge_1' },
      { id: 'hero-badge-2', key: 'hero_badge_2' },
      { id: 'hero-main-title', key: 'hero_title' },
      { id: 'hero-description', key: 'hero_desc' },
      { id: 'hero-btn-primary-text', key: 'hero_btn_primary' },
      { id: 'hero-btn-secondary-text', key: 'hero_btn_secondary' },
      { id: 'hero-stat-1-label', key: 'hero_stat_1_label' },
      { id: 'hero-stat-2-label', key: 'hero_stat_2_label' },
      { id: 'hero-stat-3-label', key: 'hero_stat_3_label' },
      { id: 'kajari-position-badge', key: 'kajari_position' },
      { id: 'ticker-badge-label', key: 'ticker_badge' },
      { id: 'ticker-text', key: 'ticker_text' },
      { id: 'pillars-badge', key: 'pillars_badge' },
      { id: 'pillars-title', key: 'pillars_title' },
      { id: 'pillars-desc', key: 'pillars_desc' },
      { id: 'digital-services-badge', key: 'digital_badge' },
      { id: 'digital-services-title', key: 'digital_title' },
      { id: 'digital-services-desc', key: 'digital_desc' },
      { id: 'news-section-badge', key: 'news_badge' },
      { id: 'news-section-title', key: 'news_title' },
      { id: 'news-section-desc', key: 'news_desc' },
      { id: 'footer-copyright', key: 'footer_copyright' }
    ];

    directUpdates.forEach(item => {
      const el = document.getElementById(item.id);
      if (el && dict[item.key]) {
        el.textContent = dict[item.key];
      }
    });

    // Update CTA text inside button
    const ctaText = document.getElementById('header-cta-text');
    if (ctaText) {
      const span = ctaText.querySelector('span');
      if (span) span.textContent = dict.lacak_tiket;
    }

    // Refresh lucide icons if loaded
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));

    if (showToastNotification) {
      showLangToast(lang === 'en' ? 'Switched to English' : 'Bahasa Indonesia aktif');
    }
  }

  function showLangToast(msg) {
    let toast = document.getElementById('kertagosa-lang-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'kertagosa-lang-toast';
      toast.className = 'fixed top-16 right-5 z-[9999] px-4 py-2.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl border border-slate-700 backdrop-blur-sm transition-all duration-300 pointer-events-none transform translate-y-0 opacity-100 flex items-center gap-2';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> <span>${msg}</span>`;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');

    clearTimeout(window._langToastTimer);
    window._langToastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2400);
  }

  // Expose global functions
  window.setLanguage = setLanguage;
  window.currentLanguage = currentLang;
  window.I18N = {
    setLanguage: setLanguage,
    getLanguage: () => currentLang,
    t: (key) => (I18N_TRANSLATIONS[currentLang] || {})[key] || key
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }
})();
