/**
 * KERTAGOSA - Master CMS Dashboard Backoffice Logic
 * Kejaksaan Negeri Klungkung
 */

let adminData = {
  contents: {},
  news: [],
  services: [],
  schedules: [],
  skm: {},
  complaints: [],
  deliveries: []
};

document.addEventListener('DOMContentLoaded', async () => {
  await verifyAdminSession();
  await loadAllDashboardData();
  lucide.createIcons();
});

async function verifyAdminSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.authenticated || data.user.role !== 'ADMIN') {
      window.location.href = '/?login=admin';
    } else {
      const nameEl = document.getElementById('admin-user-name');
      if (nameEl) nameEl.textContent = data.user.full_name;
    }
  } catch (err) {
    window.location.href = '/?login=admin';
  }
}

async function loadAllDashboardData() {
  try {
    // 1. Load Homepage Data (Contents, News, Services, Schedules, SKM)
    const res = await fetch('/api/public/homepage-data');
    const data = await res.json();
    if (data.success) {
      adminData.contents = data.contents;
      adminData.news = data.news;
      adminData.services = data.services;
      adminData.schedules = data.schedules;
      adminData.skm = data.skm;

      updateOverviewStats();
      populateGeneralContentsForm();
      populateHeroContentsForm();
      populateTickerForm();
      renderAdminNewsTable();
      renderAdminServices();
      renderAdminJagaditaTable();
      populateSkmSettings();
    }

    // 2. Load Citizen Submissions (MASADU & SEMARA BAKTI)
    const subRes = await fetch('/api/admin/submissions');
    const subData = await subRes.json();
    if (subData.success) {
      adminData.complaints = subData.complaints;
      adminData.deliveries = subData.deliveries;
      renderAdminSubmissions();
    }

    // 3. Load Admin Users
    await loadAdminUsers();

    // 4. Load SAKIP Accountability Docs
    await loadAccountabilityAdminData();
    await loadAnnouncementsAdminData();

  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
}

// Mobile Off-Canvas Sidebar Toggle for Admin Dashboard
function toggleAdminMobileSidebar(forceClose = false) {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (!sidebar) return;

  if (forceClose) {
    sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  } else {
    const isClosed = sidebar.classList.toggle('-translate-x-full');
    if (backdrop) {
      if (isClosed) backdrop.classList.add('hidden');
      else backdrop.classList.remove('hidden');
    }
  }
}

// Tab Switching
function switchTab(tabId) {
  // Close mobile sidebar drawer if open on smartphone/tablet
  toggleAdminMobileSidebar(true);

  const tabs = ['tab-overview', 'tab-page-contents', 'tab-hero-kajari', 'tab-news', 'tab-announcements', 'tab-services', 'tab-jagadita', 'tab-skm', 'tab-inbox', 'tab-org', 'tab-profile-cms', 'tab-accountability', 'tab-admins'];
  tabs.forEach(t => {
    const el = document.getElementById(t);
    const navBtn = document.getElementById(`nav-${t.replace('tab-', '')}`);
    if (t === tabId) {
      if (el) el.classList.remove('hidden');
      if (navBtn) {
        navBtn.className = 'w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-900/80 text-white shadow-sm';
      }
    } else {
      if (el) el.classList.add('hidden');
      if (navBtn) {
        navBtn.className = 'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-emerald-200 hover:bg-emerald-900/50 hover:text-white transition-colors';
      }
    }
  });

  // Header Title
  const titleMap = {
    'tab-overview': 'Ringkasan & Status Portal KERTAGOSA',
    'tab-page-contents': 'Pengaturan Teks & Identitas Instansi',
    'tab-hero-kajari': 'Hero Section & Profil Kajari',
    'tab-news': 'Manajemen Berita & Running Ticker',
    'tab-services': 'Kelola 4 Pilar Layanan Unggulan',
    'tab-jagadita': 'Jadwal Sidang JAGADITA',
    'tab-skm': 'Skor Indeks Kepuasan Masyarakat (SKM)',
    'tab-inbox': 'Kotak Masuk Layanan Warga',
    'tab-org': 'Manajemen Struktur Organisasi (Hierarki & Watermark)',
    'tab-profile-cms': 'Kelola Seluruh Halaman Profil Instansi',
    'tab-accountability': 'Manajemen Dokumen Akuntabilitas Kinerja (SAKIP)',
    'tab-announcements': 'Manajemen Pengumuman & Maklumat Resmi',
    'tab-admins': 'Manajemen Akun Administrator & Hak Akses'
  };
  document.getElementById('dashboard-header-title').textContent = titleMap[tabId] || 'Master CMS Dashboard';
  if (tabId === 'tab-org') {
    loadOrgAdminData();
  } else if (tabId === 'tab-admins') {
    loadAdminUsers();
  } else if (tabId === 'tab-accountability') {
    loadAccountabilityAdminData();
  } else if (tabId === 'tab-profile-cms') {
    loadAdminProfileCms();
  } else if (tabId === 'tab-announcements') {
    loadAnnouncementsAdminData();
  }
  lucide.createIcons();
}

// 1. Overview Tab
function updateOverviewStats() {
  document.getElementById('stat-schedules-count').textContent = adminData.schedules.length;
  document.getElementById('stat-news-count').textContent = adminData.news.length;
  document.getElementById('stat-skm-score').textContent = adminData.skm.main_score || '88.31';
  document.getElementById('stat-complaints-count').textContent = adminData.complaints.length;
}

// 2. General Contents Tab
function populateGeneralContentsForm() {
  const c = adminData.contents;
  const form = document.getElementById('form-general-contents');
  if (!form) return;
  form.querySelectorAll('[data-key]').forEach(input => {
    const k = input.getAttribute('data-key');
    if (c[k]) input.value = c[k].value;
  });

  // Header and Footer logo previews
  const logoUrl = (c.header_logo_url && c.header_logo_url.value && c.header_logo_url.value.trim()) 
    ? c.header_logo_url.value.trim() 
    : '/static/images/logo-kejari.svg';

  const logoInput = document.getElementById('header-logo-url-input');
  if (logoInput) logoInput.value = logoUrl;

  const previewHeader = document.getElementById('preview-header-logo');
  if (previewHeader) previewHeader.src = logoUrl;

  const previewFooter = document.getElementById('preview-footer-logo');
  if (previewFooter) previewFooter.src = logoUrl;

  const adminTopLogo = document.getElementById('admin-top-logo');
  if (adminTopLogo) adminTopLogo.src = logoUrl;
}

async function uploadSiteLogo(e) {
  const file = e.target.files ? e.target.files[0] : null;
  if (!file) return;

  const btnText = document.getElementById('btn-upload-logo-text');
  const statusBadge = document.getElementById('logo-upload-status');
  if (btnText) btnText.textContent = 'Mengunggah...';
  if (statusBadge) {
    statusBadge.className = 'px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5';
    statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Mengunggah Logo...';
  }

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64 = evt.target.result;
    try {
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          file_data: base64,
          data: base64,
          content_key: 'header_logo_url'
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        const input = document.getElementById('header-logo-url-input');
        const previewHeader = document.getElementById('preview-header-logo');
        const previewFooter = document.getElementById('preview-footer-logo');
        const adminTopLogo = document.getElementById('admin-top-logo');

        if (input) input.value = data.url;
        if (previewHeader) previewHeader.src = data.url;
        if (previewFooter) previewFooter.src = data.url;
        if (adminTopLogo) adminTopLogo.src = data.url;

        if (!adminData.contents) adminData.contents = {};
        adminData.contents.header_logo_url = {
          content_key: 'header_logo_url',
          content_value: data.url,
          value: data.url
        };

        if (statusBadge) {
          statusBadge.className = 'px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5';
          statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-600"></span> Logo Tersimpan &amp; Sinkron';
        }

        alert('Logo Resmi Instansi berhasil diunggah dan disimpan! Logo baru kini aktif di Header, Navbar, dan Footer seluruh portal.');
      } else {
        alert('Gagal mengunggah logo: ' + (data.error || 'Terjadi kesalahan sistem'));
        if (statusBadge) {
          statusBadge.className = 'px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1.5';
          statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-600"></span> Gagal Mengunggah';
        }
      }
    } catch (err) {
      alert('Gagal mengunggah file logo.');
    } finally {
      if (btnText) btnText.textContent = 'Pilih File Logo';
      e.target.value = '';
    }
  };
  reader.readAsDataURL(file);
}

async function setPresetSiteLogo(url) {
  const input = document.getElementById('header-logo-url-input');
  const previewHeader = document.getElementById('preview-header-logo');
  const previewFooter = document.getElementById('preview-footer-logo');
  const adminTopLogo = document.getElementById('admin-top-logo');
  const statusBadge = document.getElementById('logo-upload-status');

  if (input) input.value = url;
  if (previewHeader) previewHeader.src = url;
  if (previewFooter) previewFooter.src = url;
  if (adminTopLogo) adminTopLogo.src = url;

  try {
    const res = await fetch('/api/admin/page-contents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_key: 'header_logo_url',
        content_value: url
      })
    });
    const data = await res.json();
    if (data.success) {
      if (!adminData.contents) adminData.contents = {};
      adminData.contents.header_logo_url = {
        content_key: 'header_logo_url',
        content_value: url,
        value: url
      };
      if (statusBadge) {
        statusBadge.className = 'px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5';
        statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-600"></span> Logo Default Aktif';
      }
      alert('Logo resmi instansi berhasil direset ke logo default Kejaksaan!');
    }
  } catch (err) {
    console.error('Failed to set preset logo:', err);
  }
}

// 3. Hero Contents Tab
function populateHeroContentsForm() {
  const c = adminData.contents;
  const form = document.getElementById('form-hero-contents');
  if (!form) return;
  form.querySelectorAll('[data-key]').forEach(input => {
    const k = input.getAttribute('data-key');
    if (c[k]) input.value = c[k].value;
  });
}

async function saveBatchContents(formId) {
  const form = document.getElementById(formId);
  const items = {};
  form.querySelectorAll('[data-key]').forEach(input => {
    items[input.getAttribute('data-key')] = input.value.trim();
  });

  try {
    const res = await fetch('/api/admin/page-contents/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      loadAllDashboardData();
    }
  } catch (err) {
    alert('Gagal menyimpan perubahan');
  }
}

// 4. News & Ticker Tab
function populateTickerForm() {
  const c = adminData.contents;
  if (c.ticker_badge_label) document.getElementById('admin-ticker-badge').value = c.ticker_badge_label.value;
  if (c.ticker_text) document.getElementById('admin-ticker-text').value = c.ticker_text.value;
}

async function saveTickerContent() {
  const badge = document.getElementById('admin-ticker-badge').value.trim();
  const text = document.getElementById('admin-ticker-text').value.trim();

  await fetch('/api/admin/page-contents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_key: 'ticker_badge_label', content_value: badge })
  });
  await fetch('/api/admin/page-contents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_key: 'ticker_text', content_value: text })
  });

  alert('Ticker pengumuman berhasil disimpan!');
  loadAllDashboardData();
}

function renderAdminNewsTable() {
  const tbody = document.getElementById('admin-news-table-body');
  if (!tbody) return;

  tbody.innerHTML = adminData.news.map(item => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-3">
        <img src="${item.thumbnail_url}" class="w-12 h-8 rounded object-cover border border-slate-200">
      </td>
      <td class="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">${item.title}</td>
      <td class="py-3 px-3 font-semibold text-emerald-800">${item.category}</td>
      <td class="py-3 px-3 font-mono text-[11px] text-slate-500">${item.layout_type}</td>
      <td class="py-3 px-3 text-slate-500">${item.published_at}</td>
      <td class="py-3 px-3 text-right space-x-2">
        <button onclick="openNewsEditModal(${item.id})" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[11px]">Edit</button>
        <button onclick="deleteNewsItem(${item.id})" class="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-[11px]">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function setNewsThumbnailPreview(src, labelText) {
  const hiddenInput = document.getElementById('news-form-thumbnail');
  const emptyState = document.getElementById('news-thumbnail-empty-state');
  const previewWrap = document.getElementById('news-thumbnail-preview-wrap');
  const previewImg = document.getElementById('news-thumbnail-preview-img');
  const previewName = document.getElementById('news-thumbnail-preview-name');
  const errEl = document.getElementById('news-thumbnail-error');

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

function clearNewsThumbnail() {
  const fileInput = document.getElementById('news-form-thumbnail-file');
  if (fileInput) fileInput.value = '';
  setNewsThumbnailPreview('', '');
}

function handleNewsThumbnailDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('news-thumbnail-dropzone');
  if (dz) {
    dz.classList.add('border-emerald-600', 'bg-emerald-50/60');
  }
}

function handleNewsThumbnailDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('news-thumbnail-dropzone');
  if (dz) {
    dz.classList.remove('border-emerald-600', 'bg-emerald-50/60');
  }
}

function handleNewsThumbnailDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  handleNewsThumbnailDragLeave(e);
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length > 0) {
    processNewsThumbnailFile(files[0]);
  }
}

function handleNewsThumbnailFileSelect(e) {
  const files = e.target && e.target.files;
  if (files && files.length > 0) {
    processNewsThumbnailFile(files[0]);
  }
}

function processNewsThumbnailFile(file) {
  const errEl = document.getElementById('news-thumbnail-error');
  const fileInput = document.getElementById('news-form-thumbnail-file');

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
    // Immediately display preview inside the dropzone box
    setNewsThumbnailPreview(base64Data, file.name);

    // Upload to backend media endpoint if available
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
        const hiddenInput = document.getElementById('news-form-thumbnail');
        if (hiddenInput) hiddenInput.value = data.url;
      }
    } catch (_) {
      // Keep base64Data in hidden input as fallback
    }
  };
  reader.readAsDataURL(file);
}

function openNewsCreateModal() {
  document.getElementById('news-form-id').value = '';
  document.getElementById('news-form-title').textContent = 'Tambah Artikel Berita Baru';
  document.getElementById('admin-news-form').reset();
  clearNewsThumbnail();
  const ytInput = document.getElementById('news-form-youtube');
  if (ytInput) ytInput.value = '';
  const aiUrl = document.getElementById('admin-news-ai-url');
  if (aiUrl) aiUrl.value = '';
  const aiStatus = document.getElementById('admin-news-ai-status');
  if (aiStatus) {
    aiStatus.className = 'hidden text-[11px] font-medium p-2.5 rounded-lg items-center gap-2';
    aiStatus.innerHTML = '';
  }
  openModal('modal-admin-news-form');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openNewsEditModal(id) {
  const item = adminData.news.find(n => n.id === id);
  if (!item) return;

  document.getElementById('news-form-id').value = item.id;
  document.getElementById('news-form-title').textContent = 'Edit Artikel Berita';
  document.getElementById('news-form-title-input').value = item.title;
  document.getElementById('news-form-category').value = item.category;
  document.getElementById('news-form-badge').value = item.badge_label || '';
  document.getElementById('news-form-layout').value = item.layout_type;
  document.getElementById('news-form-author').value = item.author;
  document.getElementById('news-form-excerpt').value = item.excerpt;
  document.getElementById('news-form-quote').value = item.highlight_quote || '';
  document.getElementById('news-form-content').value = item.content || '';

  const ytInput = document.getElementById('news-form-youtube');
  if (ytInput) ytInput.value = item.youtube_url || '';

  const aiUrl = document.getElementById('admin-news-ai-url');
  if (aiUrl) aiUrl.value = '';
  const aiStatus = document.getElementById('admin-news-ai-status');
  if (aiStatus) {
    aiStatus.className = 'hidden text-[11px] font-medium p-2.5 rounded-lg items-center gap-2';
    aiStatus.innerHTML = '';
  }

  if (item.thumbnail_url) {
    setNewsThumbnailPreview(item.thumbnail_url, item.thumbnail_url.split('/').pop() || 'thumbnail.jpg');
  } else {
    clearNewsThumbnail();
  }

  openModal('modal-admin-news-form');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// ADVANCE FEATURE: AUTO-GENERATE BERITA DENGAN GEMINI AI (URL SCRAPER)
// ============================================================================

async function handleGenerateNewsWithAI() {
  const urlInput = document.getElementById('admin-news-ai-url');
  const statusEl = document.getElementById('admin-news-ai-status');
  const btn = document.getElementById('btn-admin-news-ai-generate');

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

  // Set loading state with spinner
  const origBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Menganalisis Link via AI...</span>
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

      // Auto-fill form fields
      const titleInput = document.getElementById('news-form-title-input');
      if (titleInput && d.title) titleInput.value = d.title;

      const catSelect = document.getElementById('news-form-category');
      if (catSelect && d.category) {
        // If option exists, select it
        const hasOpt = Array.from(catSelect.options).some(opt => opt.value === d.category);
        if (hasOpt) catSelect.value = d.category;
      }

      const badgeInput = document.getElementById('news-form-badge');
      if (badgeInput && d.badge_label) badgeInput.value = d.badge_label;

      const layoutSelect = document.getElementById('news-form-layout');
      if (layoutSelect && d.layout_type) layoutSelect.value = d.layout_type;

      const authorInput = document.getElementById('news-form-author');
      if (authorInput && d.author) authorInput.value = d.author;

      const excerptInput = document.getElementById('news-form-excerpt');
      if (excerptInput && d.excerpt) excerptInput.value = d.excerpt;

      const quoteInput = document.getElementById('news-form-quote');
      if (quoteInput && d.highlight_quote) quoteInput.value = d.highlight_quote;

      const contentInput = document.getElementById('news-form-content');
      if (contentInput && d.content) contentInput.value = d.content;

      const ytInput = document.getElementById('news-form-youtube');
      if (ytInput && d.youtube_url) ytInput.value = d.youtube_url;

      if (d.thumbnail_url) {
        setNewsThumbnailPreview(d.thumbnail_url, 'Cover AI Scraped');
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

// ============================================================================
// ADVANCE FEATURE: FITUR IMPORT DATA VIA EXCEL (BULK UPLOAD)
// ============================================================================

let currentParsedNewsRows = [];
let currentNewsExcelFile = null;

function openNewsExcelImportModal() {
  currentParsedNewsRows = [];
  currentNewsExcelFile = null;

  const fileInput = document.getElementById('news-excel-file-input');
  if (fileInput) fileInput.value = '';

  const replaceChk = document.getElementById('news-import-replace-all');
  if (replaceChk) replaceChk.checked = false;

  const emptyState = document.getElementById('news-excel-empty-state');
  if (emptyState) emptyState.classList.remove('hidden');

  const fileState = document.getElementById('news-excel-file-state');
  if (fileState) {
    fileState.classList.add('hidden');
    fileState.classList.remove('flex');
  }

  const previewContainer = document.getElementById('news-excel-preview-container');
  if (previewContainer) previewContainer.classList.add('hidden');

  const errEl = document.getElementById('news-excel-error');
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }

  openModal('modal-news-excel-import');
  if (window.lucide) lucide.createIcons();
}

function downloadNewsExcelTemplate(format = 'xlsx') {
  window.location.href = `/api/admin/news/template?format=${encodeURIComponent(format)}`;
}

function handleNewsExcelDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('news-excel-dropzone');
  if (dz) {
    dz.classList.add('border-emerald-600', 'bg-emerald-50/60');
  }
}

function handleNewsExcelDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('news-excel-dropzone');
  if (dz) {
    dz.classList.remove('border-emerald-600', 'bg-emerald-50/60');
  }
}

function handleNewsExcelDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  handleNewsExcelDragLeave(e);
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length > 0) {
    processNewsExcelFile(files[0]);
  }
}

function handleNewsExcelFileSelect(e) {
  const files = e.target && e.target.files;
  if (files && files.length > 0) {
    processNewsExcelFile(files[0]);
  }
}

function processNewsExcelFile(file) {
  const errEl = document.getElementById('news-excel-error');
  const emptyState = document.getElementById('news-excel-empty-state');
  const fileState = document.getElementById('news-excel-file-state');
  const filenameEl = document.getElementById('news-excel-filename');
  const filesizeEl = document.getElementById('news-excel-filesize');
  const previewContainer = document.getElementById('news-excel-preview-container');

  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext !== 'xlsx' && ext !== 'csv' && ext !== 'tsv') {
    if (errEl) {
      errEl.textContent = 'Format file tidak didukung. Harap pilih file berekstensi .xlsx atau .csv.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  currentNewsExcelFile = file;

  // Update file selected UI
  if (emptyState) emptyState.classList.add('hidden');
  if (fileState) {
    fileState.classList.remove('hidden');
    fileState.classList.add('flex');
  }
  if (filenameEl) filenameEl.textContent = file.name;
  if (filesizeEl) {
    const kb = (file.size / 1024).toFixed(1);
    filesizeEl.textContent = `(${kb} KB)`;
  }

  // Parse using SheetJS (XLSX) if available in browser
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      if (typeof XLSX !== 'undefined') {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          throw new Error('File Excel tidak berisi data artikel berita.');
        }

        mapAndPreviewNewsExcel(rawJson);
      } else {
        // Fallback info if XLSX is not loaded
        currentParsedNewsRows = [];
        if (previewContainer) previewContainer.classList.remove('hidden');
        const list = document.getElementById('news-excel-preview-list');
        if (list) list.innerHTML = `<div class="p-2 text-slate-500 text-[11px]">File ${file.name} siap diproses oleh backend server.</div>`;
      }
    } catch (err) {
      console.warn('SheetJS parsing fallback to server:', err);
      if (errEl) {
        errEl.textContent = 'Catatan: ' + err.message;
        errEl.classList.remove('hidden');
      }
    }
  };
  reader.readAsArrayBuffer(file);
}

function mapAndPreviewNewsExcel(rowsMatrix) {
  if (!rowsMatrix || rowsMatrix.length < 2) return;

  const rawHeaders = rowsMatrix[0].map(h => String(h || '').trim());
  const normHeaders = rawHeaders.map(h =>
    h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  );

  const mappedItems = [];
  for (let i = 1; i < rowsMatrix.length; i++) {
    const r = rowsMatrix[i];
    if (!r || r.length === 0 || !r.some(cell => String(cell || '').trim() !== '')) {
      continue;
    }

    const rowObj = {};
    normHeaders.forEach((k, idx) => {
      rowObj[k] = (r[idx] !== undefined && r[idx] !== null) ? String(r[idx]).trim() : '';
      rowObj[`_col_${idx}`] = rowObj[k];
    });

    const title = rowObj['judul_artikel_wajib'] || rowObj['judul_artikel'] || rowObj['judul'] || rowObj['title'] || rowObj['_col_1'] || '';
    const category = rowObj['kategori_wajib'] || rowObj['kategori'] || rowObj['category'] || rowObj['_col_2'] || 'Kegiatan Kejari';
    const badge_label = rowObj['teks_badge_label'] || rowObj['badge_label'] || rowObj['badge'] || rowObj['_col_3'] || 'BERITA TERBARU';
    const layout_type = rowObj['tata_letak_layout'] || rowObj['tata_letak'] || rowObj['layout_type'] || rowObj['layout'] || rowObj['_col_4'] || 'COMPACT_BOTTOM';
    const author = rowObj['penulis'] || rowObj['author'] || rowObj['_col_5'] || 'Tim Publikasi Kejari';
    const excerpt = rowObj['ringkasan_singkat_wajib'] || rowObj['ringkasan_singkat'] || rowObj['ringkasan'] || rowObj['excerpt'] || rowObj['_col_6'] || '';
    const highlight_quote = rowObj['kutipan_highlight'] || rowObj['kutipan'] || rowObj['highlight_quote'] || rowObj['_col_7'] || '';
    const thumbnail_url = rowObj['nama_file_url_gambar'] || rowObj['url_gambar'] || rowObj['gambar'] || rowObj['thumbnail_url'] || rowObj['_col_8'] || '/static/images/news-featured.jpg';
    const youtube_url = rowObj['tautan_video_youtube'] || rowObj['video_youtube'] || rowObj['youtube_url'] || rowObj['_col_9'] || '';
    const content = rowObj['isi_berita_lengkap'] || rowObj['isi_berita'] || rowObj['content'] || rowObj['_col_10'] || '';

    if (title) {
      mappedItems.push({
        title,
        category,
        badge_label,
        layout_type,
        author,
        excerpt: excerpt || (content.slice(0, 150) + '...'),
        highlight_quote,
        thumbnail_url: thumbnail_url || '/static/images/news-featured.jpg',
        youtube_url,
        content: content || excerpt
      });
    }
  }

  currentParsedNewsRows = mappedItems;

  const previewContainer = document.getElementById('news-excel-preview-container');
  const badgeEl = document.getElementById('news-excel-rows-badge');
  const listEl = document.getElementById('news-excel-preview-list');

  if (previewContainer) {
    previewContainer.classList.remove('hidden');
  }
  if (badgeEl) {
    badgeEl.textContent = `${mappedItems.length} Berita Terdeteksi`;
  }
  if (listEl) {
    if (mappedItems.length === 0) {
      listEl.innerHTML = `<div class="p-2 text-center text-slate-400 text-[11px]">Tidak ada baris judul berita yang valid.</div>`;
    } else {
      listEl.innerHTML = mappedItems.slice(0, 5).map((item, idx) => `
        <div class="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-[11px] gap-2">
          <div class="flex items-center gap-2 overflow-hidden">
            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">${idx + 1}</span>
            <div class="truncate">
              <span class="font-bold text-slate-800 block truncate">${escapeAdminHtml(item.title)}</span>
              <span class="text-slate-500 text-[10px]">${escapeAdminHtml(item.category)} &bull; ${escapeAdminHtml(item.layout_type)}</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] shrink-0 font-semibold">${item.youtube_url ? 'Ada YouTube' : 'Teks/Foto'}</span>
        </div>
      `).join('') + (mappedItems.length > 5 ? `<div class="text-center text-[10px] text-slate-500 pt-1 font-semibold">+ ${mappedItems.length - 5} artikel lainnya siap diimpor</div>` : '');
    }
  }

  if (window.lucide) lucide.createIcons();
}

async function handleNewsExcelImport(e) {
  e.preventDefault();
  const replaceAll = document.getElementById('news-import-replace-all')?.checked || false;
  const btn = document.getElementById('btn-submit-news-import');
  const errEl = document.getElementById('news-excel-error');

  if (!currentNewsExcelFile && (!currentParsedNewsRows || currentParsedNewsRows.length === 0)) {
    if (errEl) {
      errEl.textContent = 'Silakan pilih file Excel (.xlsx) atau .csv terlebih dahulu.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  // Loading spinner on import button
  const origBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Mengimpor Berita...</span>
    `;
  }

  try {
    let payload = {
      replace_all: replaceAll
    };

    if (currentParsedNewsRows && currentParsedNewsRows.length > 0) {
      payload.items = currentParsedNewsRows;
    }

    if (currentNewsExcelFile) {
      payload.filename = currentNewsExcelFile.name;
      payload.file_data = await readFileAsBase64(currentNewsExcelFile);
    }

    const res = await fetch('/api/admin/news/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok && data.success) {
      closeModal('modal-news-excel-import');
      alert(data.message || `${data.count || ''} artikel berita berhasil diimpor!`);
      loadAllDashboardData();
    } else {
      if (errEl) {
        errEl.textContent = data.error || 'Gagal mengimpor file berita.';
        errEl.classList.remove('hidden');
      }
      alert(data.error || 'Gagal mengimpor data berita.');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan saat mengunggah file.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnHtml;
      if (window.lucide) lucide.createIcons();
    }
  }
}

async function handleSaveNews(e) {
  e.preventDefault();
  const id = document.getElementById('news-form-id').value;
  const thumbnailVal = (document.getElementById('news-form-thumbnail')?.value || '').trim() || '/static/images/news-featured.jpg';
  const youtubeVal = (document.getElementById('news-form-youtube')?.value || '').trim();

  const payload = {
    title: document.getElementById('news-form-title-input').value,
    category: document.getElementById('news-form-category').value,
    badge_label: document.getElementById('news-form-badge').value,
    layout_type: document.getElementById('news-form-layout').value,
    author: document.getElementById('news-form-author').value,
    excerpt: document.getElementById('news-form-excerpt').value,
    highlight_quote: document.getElementById('news-form-quote').value,
    thumbnail_url: thumbnailVal,
    youtube_url: youtubeVal || null,
    content: document.getElementById('news-form-content').value,
  };

  const url = id ? `/api/admin/news/${id}` : '/api/admin/news';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.success) {
    closeModal('modal-admin-news-form');
    alert(data.message);
    loadAllDashboardData();
  }
}

async function deleteNewsItem(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus artikel berita ini?')) return;
  const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllDashboardData();
  }
}

// 5. 4 Services Tab
function renderAdminServices() {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  container.innerHTML = adminData.services.map(svc => `
    <div class="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900">${svc.title} (${svc.code})</span>
        <button onclick="saveServiceCard(${svc.id})" class="px-3 py-1 bg-[#0B3B24] text-white font-bold rounded text-xs hover:bg-[#072A19]">
          Simpan Kartu
        </button>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">Judul Layanan</label>
          <input type="text" id="svc-title-${svc.id}" value="${svc.title}" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs">
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">Badge Teks</label>
          <input type="text" id="svc-badge-${svc.id}" value="${svc.badge_text}" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs">
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">Warna Tema</label>
          <select id="svc-color-${svc.id}" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs">
            <option value="green" ${svc.theme_color === 'green' ? 'selected' : ''}>Green</option>
            <option value="red" ${svc.theme_color === 'red' ? 'selected' : ''}>Red (Masadu)</option>
            <option value="amber" ${svc.theme_color === 'amber' ? 'selected' : ''}>Amber (Semara)</option>
            <option value="emerald" ${svc.theme_color === 'emerald' ? 'selected' : ''}>Emerald (Datun)</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-[11px] font-semibold text-slate-500 mb-1">Deskripsi Ringkas</label>
        <textarea id="svc-desc-${svc.id}" rows="2" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs">${svc.description}</textarea>
      </div>
      <div>
        <label class="block text-[11px] font-semibold text-slate-500 mb-1">Teks Info Box (Abu-Abu)</label>
        <input type="text" id="svc-info-${svc.id}" value="${svc.info_box_text}" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs">
      </div>
    </div>
  `).join('');
}

async function saveServiceCard(id) {
  const payload = {
    title: document.getElementById(`svc-title-${id}`).value,
    badge_text: document.getElementById(`svc-badge-${id}`).value,
    theme_color: document.getElementById(`svc-color-${id}`).value,
    description: document.getElementById(`svc-desc-${id}`).value,
    info_box_text: document.getElementById(`svc-info-${id}`).value,
  };

  const res = await fetch(`/api/admin/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllDashboardData();
  }
}

// 6. JAGADITA Tab
function renderAdminJagaditaTable() {
  const tbody = document.getElementById('admin-jagadita-table-body');
  if (!tbody) return;

  tbody.innerHTML = adminData.schedules.map(row => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-3 font-semibold text-slate-800">
        <div>${row.session_time}</div>
        <div class="text-[10px] text-slate-400">${row.court_room}</div>
      </td>
      <td class="py-3 px-3">
        <div class="font-bold text-slate-900">${row.case_number}</div>
        <div class="text-slate-600">${row.defendant_name}</div>
      </td>
      <td class="py-3 px-3 font-extrabold text-[11px] ${row.case_type === 'PIDUM' ? 'text-blue-700' : 'text-red-700'}">${row.case_type}</td>
      <td class="py-3 px-3 text-slate-600 max-w-xs truncate">${row.agenda}</td>
      <td class="py-3 px-3 text-slate-700 font-medium">${row.prosecutor}</td>
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getScheduleBadgeClass(row.status)}">${row.status}</span>
      </td>
      <td class="py-3 px-3 text-right space-x-2">
        <button onclick="openJagaditaEditModal(${row.id})" class="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[10px]">Edit</button>
        <button onclick="deleteJagaditaItem(${row.id})" class="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-[10px]">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function getScheduleBadgeClass(status) {
  if (status === 'SEDANG BERLANGSUNG') return 'bg-amber-100 text-amber-900 border border-amber-300';
  if (status === 'TERJADWAL') return 'bg-blue-100 text-blue-900 border border-blue-200';
  if (status === 'SELESAI') return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
  return 'bg-slate-100 text-slate-800';
}

function openJagaditaCreateModal() {
  document.getElementById('jagadita-form-id').value = '';
  document.getElementById('jagadita-form-title').textContent = 'Tambah Jadwal Sidang JAGADITA';
  document.getElementById('admin-jagadita-form').reset();
  openModal('modal-admin-jagadita-form');
}

function openJagaditaEditModal(id) {
  const row = adminData.schedules.find(s => s.id === id);
  if (!row) return;

  document.getElementById('jagadita-form-id').value = row.id;
  document.getElementById('jagadita-form-title').textContent = 'Edit Jadwal Sidang JAGADITA';
  document.getElementById('jagadita-form-time').value = row.session_time;
  document.getElementById('jagadita-form-room').value = row.court_room;
  document.getElementById('jagadita-form-case').value = row.case_number;
  document.getElementById('jagadita-form-type').value = row.case_type;
  document.getElementById('jagadita-form-defendant').value = row.defendant_name;
  document.getElementById('jagadita-form-agenda').value = row.agenda;
  document.getElementById('jagadita-form-prosecutor').value = row.prosecutor;
  document.getElementById('jagadita-form-status').value = row.status;

  openModal('modal-admin-jagadita-form');
}

async function handleSaveJagadita(e) {
  e.preventDefault();
  const id = document.getElementById('jagadita-form-id').value;
  const payload = {
    session_time: document.getElementById('jagadita-form-time').value,
    court_room: document.getElementById('jagadita-form-room').value,
    case_number: document.getElementById('jagadita-form-case').value,
    case_type: document.getElementById('jagadita-form-type').value,
    defendant_name: document.getElementById('jagadita-form-defendant').value,
    agenda: document.getElementById('jagadita-form-agenda').value,
    prosecutor: document.getElementById('jagadita-form-prosecutor').value,
    status: document.getElementById('jagadita-form-status').value,
  };

  const url = id ? `/api/admin/jagadita/${id}` : '/api/admin/jagadita';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.success) {
    closeModal('modal-admin-jagadita-form');
    alert(data.message);
    loadAllDashboardData();
  }
}

async function deleteJagaditaItem(id) {
  if (!confirm('Hapus jadwal sidang ini dari JAGADITA?')) return;
  const res = await fetch(`/api/admin/jagadita/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllDashboardData();
  }
}

function exportJagaditaData(format = 'xlsx', isTemplate = false) {
  const tplParam = isTemplate ? '&template=1' : '';
  window.location.href = `/api/admin/jagadita/export?format=${encodeURIComponent(format)}${tplParam}`;
}

function openJagaditaImportModal() {
  const fileInput = document.getElementById('jagadita-excel-file-input');
  if (fileInput) fileInput.value = '';
  const replaceChk = document.getElementById('jagadita-import-replace-all');
  if (replaceChk) replaceChk.checked = false;
  openModal('modal-jagadita-excel-import');
  if (window.lucide) lucide.createIcons();
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

async function handleJagaditaExcelImport(e) {
  e.preventDefault();
  const fileInput = document.getElementById('jagadita-excel-file-input');
  const replaceAll = document.getElementById('jagadita-import-replace-all')?.checked || false;
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert('Silakan pilih file Excel (.xlsx) atau CSV terlebih dahulu.');
    return;
  }

  const file = fileInput.files[0];
  const btn = document.getElementById('btn-submit-jagadita-import');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Memproses Excel...</span>';
  }

  try {
    const b64 = await readFileAsBase64(file);
    const res = await fetch('/api/admin/jagadita/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        file_data: b64,
        replace_all: replaceAll
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      closeModal('modal-jagadita-excel-import');
      alert(data.message);
      loadAllDashboardData();
    } else {
      alert(data.error || 'Gagal mengimpor file Excel Jadwal Sidang.');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat membaca atau mengunggah file Excel.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// 7. SKM Settings Tab
function populateSkmSettings() {
  const skm = adminData.skm;
  if (!skm) return;

  document.getElementById('admin-skm-mode').value = skm.mode || 'MANUAL';
  document.getElementById('admin-skm-score').value = skm.main_score || '88.31';
  document.getElementById('admin-skm-period').value = skm.period_badge || 'TRIWULAN III';
  document.getElementById('admin-skm-predicate').value = skm.predicate || 'Mutu Pelayanan: A (Sangat Baik)';

  if (skm.metrics && skm.metrics.length >= 4) {
    document.getElementById('admin-metric-0').value = skm.metrics[0].score;
    document.getElementById('admin-metric-1').value = skm.metrics[1].score;
    document.getElementById('admin-metric-2').value = skm.metrics[2].score;
    document.getElementById('admin-metric-3').value = skm.metrics[3].score;
  }
}

async function saveSkmSettings() {
  const payload = {
    mode: document.getElementById('admin-skm-mode').value,
    main_score: document.getElementById('admin-skm-score').value,
    period_badge: document.getElementById('admin-skm-period').value,
    predicate: document.getElementById('admin-skm-predicate').value,
    metrics: [
      { label: "Prosedur & Persyaratan", score: parseFloat(document.getElementById('admin-metric-0').value) },
      { label: "Kecepatan Waktu Pelayanan", score: parseFloat(document.getElementById('admin-metric-1').value) },
      { label: "Bebas Biaya / Tarif (Gratis)", score: parseFloat(document.getElementById('admin-metric-2').value) },
      { label: "Kompetensi & Perilaku Petugas", score: parseFloat(document.getElementById('admin-metric-3').value) }
    ]
  };

  const res = await fetch('/api/admin/skm', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllDashboardData();
  }
}

// 8. Inbox Tab (MASADU & SEMARA BAKTI)
function renderAdminSubmissions() {
  document.getElementById('inbox-complaints-count').textContent = adminData.complaints.length;
  document.getElementById('inbox-deliveries-count').textContent = adminData.deliveries.length;

  // Complaints Body
  const cBody = document.getElementById('inbox-complaints-body');
  if (cBody) {
    cBody.innerHTML = adminData.complaints.map(item => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3 font-mono font-bold text-emerald-900">${item.ticket_code}</td>
        <td class="py-3 px-3">${item.reporter_name} <br><span class="text-[10px] text-slate-400">${item.reporter_phone || '-'}</span></td>
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900">${item.title}</div>
          <div class="text-[11px] text-slate-500">${item.category}</div>
        </td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getSubmissionStatusBadge(item.status)}">${item.status}</span>
        </td>
        <td class="py-3 px-3 text-slate-600 max-w-xs truncate">${item.admin_notes || '-'}</td>
        <td class="py-3 px-3 text-right">
          <button onclick="openSubmissionStatusModal('complaint', '${item.ticket_code}', '${item.status}', '${(item.admin_notes || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded text-[11px]">
            Tindak Lanjut
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Deliveries Body
  const dBody = document.getElementById('inbox-deliveries-body');
  if (dBody) {
    dBody.innerHTML = adminData.deliveries.map(item => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3 font-mono font-bold text-amber-900">${item.ticket_code}</td>
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900">${item.owner_name}</div>
          <div class="text-[10px] text-slate-400">${item.case_number}</div>
        </td>
        <td class="py-3 px-3 font-medium text-slate-800">${item.item_description}</td>
        <td class="py-3 px-3 text-slate-600">${item.district}</td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getSubmissionStatusBadge(item.status)}">${item.status}</span>
        </td>
        <td class="py-3 px-3 text-right">
          <button onclick="openSubmissionStatusModal('delivery', '${item.ticket_code}', '${item.status}', '${(item.admin_notes || '').replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[11px]">
            Tindak Lanjut
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function getSubmissionStatusBadge(status) {
  if (status === 'TERKIRIM') return 'bg-amber-100 text-amber-900';
  if (status === 'DIVERIFIKASI' || status === 'DIJADWALKAN') return 'bg-blue-100 text-blue-900';
  if (status === 'DALAM_PROSES') return 'bg-purple-100 text-purple-900';
  if (status === 'SELESAI') return 'bg-emerald-100 text-emerald-900';
  if (status === 'DITOLAK') return 'bg-red-100 text-red-900';
  return 'bg-slate-100 text-slate-800';
}

window.currentInboxSubtab = 'complaints';

function switchInboxSubtab(subtab) {
  window.currentInboxSubtab = subtab;
  if (subtab === 'complaints') {
    document.getElementById('inbox-complaints-view').classList.remove('hidden');
    document.getElementById('inbox-deliveries-view').classList.add('hidden');
    document.getElementById('subtab-btn-complaints').className = 'px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0B3B24] text-white';
    document.getElementById('subtab-btn-deliveries').className = 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600';
  } else {
    document.getElementById('inbox-complaints-view').classList.add('hidden');
    document.getElementById('inbox-deliveries-view').classList.remove('hidden');
    document.getElementById('subtab-btn-complaints').className = 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600';
    document.getElementById('subtab-btn-deliveries').className = 'px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0B3B24] text-white';
  }
}

function exportInboxData(type = 'all', format = 'xlsx', isTemplate = false) {
  const tplParam = isTemplate ? '&template=1' : '';
  window.location.href = `/api/admin/submissions/export?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}${tplParam}`;
}

function openInboxExcelImportModal() {
  const targetSel = document.getElementById('inbox-import-target');
  if (targetSel && (window.currentInboxSubtab === 'complaints' || window.currentInboxSubtab === 'deliveries')) {
    targetSel.value = window.currentInboxSubtab;
  }
  const fileInput = document.getElementById('inbox-excel-file-input');
  if (fileInput) fileInput.value = '';
  openModal('modal-inbox-excel-import');
  if (window.lucide) lucide.createIcons();
}

async function handleInboxExcelImport(e) {
  e.preventDefault();
  const target = document.getElementById('inbox-import-target')?.value || 'complaints';
  const fileInput = document.getElementById('inbox-excel-file-input');
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert('Silakan pilih file Excel (.xlsx) atau CSV terlebih dahulu.');
    return;
  }

  const file = fileInput.files[0];
  const btn = document.getElementById('btn-submit-inbox-import');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Memproses Excel...</span>';
  }

  try {
    const b64 = await readFileAsBase64(file);
    const res = await fetch('/api/admin/submissions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: target,
        filename: file.name,
        file_data: b64
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      closeModal('modal-inbox-excel-import');
      alert(data.message);
      switchInboxSubtab(target);
      loadAllDashboardData();
    } else {
      alert(data.error || 'Gagal mengimpor file Excel.');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat membaca atau mengunggah file Excel.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

function openSubmissionStatusModal(type, ticketCode, currentStatus, currentNotes) {
  document.getElementById('submission-update-type').value = type;
  document.getElementById('submission-update-id').value = ticketCode;
  document.getElementById('submission-update-status').value = currentStatus;
  document.getElementById('submission-update-notes').value = currentNotes;
  openModal('modal-submission-update');
}

async function saveSubmissionStatus() {
  const type = document.getElementById('submission-update-type').value;
  const id = document.getElementById('submission-update-id').value;
  const status = document.getElementById('submission-update-status').value;
  const admin_notes = document.getElementById('submission-update-notes').value;

  const res = await fetch(`/api/admin/submissions/${type}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes })
  });
  const data = await res.json();
  if (data.success) {
    closeModal('modal-submission-update');
    alert(data.message);
    loadAllDashboardData();
  }
}

async function logoutAdmin() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    el.classList.add('flex');
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('hidden');
    el.classList.remove('flex');
  }
}

// =====================================================================
// TAB 9: STRUKTUR ORGANISASI & MANAJEMEN PEGAWAI (CRUD)
// =====================================================================

let orgAdminData = {
  settings: {},
  members: [],
  currentLevelFilter: 'all'
};

function switchOrgSubtab(subtab) {
  const btnMembers = document.getElementById('btn-org-subtab-members');
  const btnSettings = document.getElementById('btn-org-subtab-settings');
  const viewMembers = document.getElementById('org-view-members');
  const viewSettings = document.getElementById('org-view-settings');

  if (subtab === 'members') {
    viewMembers.classList.remove('hidden');
    viewSettings.classList.add('hidden');
    btnMembers.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#0B3B24] text-white shadow-sm flex items-center gap-2 transition-all';
    btnSettings.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 transition-all';
  } else {
    viewMembers.classList.add('hidden');
    viewSettings.classList.remove('hidden');
    btnSettings.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#0B3B24] text-white shadow-sm flex items-center gap-2 transition-all';
    btnMembers.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 transition-all';
  }
  lucide.createIcons();
}

async function loadOrgAdminData() {
  try {
    const res = await fetch('/api/public/organization');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    orgAdminData.settings = data.settings || {};
    orgAdminData.members = data.members || [];
    orgAdminData.hierarchy = data.hierarchy || {};

    // 1. Update count badges
    const totalCount = orgAdminData.members.length;
    const l1Count = orgAdminData.members.filter(m => m.level === 1).length;
    const l2Count = orgAdminData.members.filter(m => m.level === 2).length;
    const l3Count = orgAdminData.members.filter(m => m.level === 3).length;
    const l4Count = orgAdminData.members.filter(m => m.level === 4).length;

    const bTotal = document.getElementById('org-total-count-badge');
    const bAll = document.getElementById('count-level-all');
    const b1 = document.getElementById('count-level-1');
    const b2 = document.getElementById('count-level-2');
    const b3 = document.getElementById('count-level-3');
    const b4 = document.getElementById('count-level-4');

    if (bTotal) bTotal.textContent = totalCount;
    if (bAll) bAll.textContent = totalCount;
    if (b1) b1.textContent = l1Count;
    if (b2) b2.textContent = l2Count;
    if (b3) b3.textContent = l3Count;
    if (b4) b4.textContent = l4Count;

    // 2. Populate Settings Form
    const s = orgAdminData.settings;
    if (document.getElementById('org-setting-logo-left')) {
      document.getElementById('org-setting-logo-left').value = s.logo_left || '/static/images/logo-kejari.svg';
      document.getElementById('preview-org-logo-left').src = s.logo_left || '/static/images/logo-kejari.svg';
    }
    if (document.getElementById('org-setting-logo-right')) {
      document.getElementById('org-setting-logo-right').value = s.logo_right || '/static/images/logo-wbk.svg';
      document.getElementById('preview-org-logo-right').src = s.logo_right || '/static/images/logo-wbk.svg';
    }
    if (document.getElementById('org-setting-watermark-bg')) {
      document.getElementById('org-setting-watermark-bg').value = s.watermark_bg || '/static/images/logo-kejari.svg';
      document.getElementById('preview-org-watermark').src = s.watermark_bg || '/static/images/logo-kejari.svg';
    }
    if (document.getElementById('org-setting-watermark-opacity')) {
      document.getElementById('org-setting-watermark-opacity').value = s.watermark_opacity || 12;
      document.getElementById('lbl-watermark-opacity').textContent = (s.watermark_opacity || 12) + '%';
    }
    if (document.getElementById('org-setting-title')) {
      document.getElementById('org-setting-title').value = s.title || 'STRUKTUR ORGANISASI';
    }
    if (document.getElementById('org-setting-subtitle')) {
      document.getElementById('org-setting-subtitle').value = s.subtitle || 'KEJAKSAAN NEGERI KLUNGKUNG';
    }
    if (document.getElementById('org-setting-legal-basis')) {
      document.getElementById('org-setting-legal-basis').value = s.legal_basis || '';
    }

    // 3. Populate Parent Dropdown in Modal
    populateOrgParentDropdown();

    // 4. Render Members Table
    renderOrgMembersTable();

  } catch (err) {
    console.error('Failed to load organization admin data:', err);
  }
}

function populateOrgParentDropdown(selectedParentId = null) {
  const select = document.getElementById('org-member-parent');
  if (!select) return;

  let html = '<option value="">-- Tanpa Atasan (Level 1) --</option>';
  const potentialParents = orgAdminData.members.filter(m => m.level === 1 || m.level === 2);
  potentialParents.forEach(m => {
    const isSelected = selectedParentId && parseInt(selectedParentId) === m.id ? 'selected' : '';
    html += `<option value="${m.id}" ${isSelected}>[Level ${m.level}] ${escapeHtml(m.position)} - ${escapeHtml(m.name)}</option>`;
  });
  select.innerHTML = html;
}

function filterOrgLevel(level) {
  orgAdminData.currentLevelFilter = level;

  document.querySelectorAll('.org-filter-btn').forEach(btn => {
    btn.className = 'org-filter-btn px-3 py-1.5 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors';
  });

  const activeBtn = document.getElementById(level === 'all' ? 'btn-org-filter-all' : `btn-org-filter-${level}`);
  if (activeBtn) {
    activeBtn.className = 'org-filter-btn px-3 py-1.5 rounded-lg font-bold bg-[#0B3B24] text-white shadow-sm transition-colors';
  }

  renderOrgMembersTable();
}

function loadCanvasImage(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateCanvasText(ctx, text, maxWidth) {
  const str = String(text || '');
  if (ctx.measureText(str).width <= maxWidth) return str;
  let truncated = str;
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

async function downloadAdminOrgChartJpg() {
  try {
    const res = await fetch('/api/public/organization');
    const data = await res.json();
    if (!data.success) {
      alert('Gagal memuat data struktur organisasi.');
      return;
    }

    const s = data.settings || {};
    const h = data.hierarchy || {};
    const W = 2400;
    const H = 1680;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 1. Background & Institutional Frame
    ctx.fillStyle = '#FAF8F3';
    ctx.fillRect(0, 0, W, H);

    // Outer Forest Green Border + Gold Inner Frame
    ctx.strokeStyle = '#0B3B24';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, W - 68, H - 68);

    // Preload logos & watermark
    const [logoLeft, logoRight, watermarkImg] = await Promise.all([
      loadCanvasImage(s.logo_left || '/static/images/logo-kejari.svg'),
      loadCanvasImage(s.logo_right || '/static/images/logo-wbk.svg'),
      loadCanvasImage(s.watermark_bg || '/static/images/logo-kejari.svg')
    ]);

    // 2. Center Watermark
    if (watermarkImg) {
      ctx.save();
      ctx.globalAlpha = Math.max(0.04, Math.min(0.35, (s.watermark_opacity || 12) / 100));
      ctx.drawImage(watermarkImg, (W - 620) / 2, (H - 620) / 2 + 60, 620, 620);
      ctx.restore();
    }

    // 3. Header Section
    if (logoLeft) ctx.drawImage(logoLeft, 85, 65, 130, 130);
    if (logoRight) ctx.drawImage(logoRight, W - 215, 65, 130, 130);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#B45309';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('BAGAN STRUKTURAL RESMI KEJAKSAAN RI', W / 2, 85);

    ctx.fillStyle = '#0F172A';
    ctx.font = '900 44px Georgia, serif';
    ctx.fillText((s.title || 'STRUKTUR ORGANISASI').toUpperCase(), W / 2, 136);

    ctx.fillStyle = '#0B3B24';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText((s.subtitle || 'KEJAKSAAN NEGERI KLUNGKUNG').toUpperCase(), W / 2, 170);

    ctx.fillStyle = '#64748B';
    ctx.font = '15px sans-serif';
    ctx.fillText(s.legal_basis || 'Berdasarkan Peraturan Kejaksaan RI Nomor PER-006/A/JA/07/2017 tentang Organisasi dan Tata Kerja Kejaksaan RI', W / 2, 198);

    // Divider line below header
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 222);
    ctx.lineTo(W - 75, 222);
    ctx.stroke();

    // Helper to draw an officer card
    async function drawMemberCard(m, x, y, w, cardH, badgeText, badgeBg, badgeFg, isLarge = false) {
      if (!m) return;
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;
      drawRoundedRect(ctx, x, y, w, cardH, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      drawRoundedRect(ctx, x, y, w, cardH, 16);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gold top accent bar
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x + 12, y, w - 24, 6);

      const photoSize = isLarge ? 92 : (cardH >= 120 ? 64 : 52);
      const px = x + 16;
      const py = y + (cardH - photoSize) / 2 + 2;

      const photoImg = await loadCanvasImage(m.photo_url || '/static/images/avatar-officer-male.svg');
      ctx.save();
      drawRoundedRect(ctx, px, py, photoSize, photoSize, 12);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.clip();
      if (photoImg) {
        ctx.drawImage(photoImg, px, py, photoSize, photoSize);
      }
      ctx.restore();
      drawRoundedRect(ctx, px, py, photoSize, photoSize, 12);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const tx = px + photoSize + 14;
      const maxTw = w - (photoSize + 44);
      ctx.textAlign = 'left';

      if (badgeText) {
        ctx.fillStyle = badgeBg || '#FEF3C7';
        const bw = Math.min(maxTw, ctx.measureText(badgeText).width + 20);
        drawRoundedRect(ctx, tx, y + 16, bw, 22, 6);
        ctx.fill();
        ctx.fillStyle = badgeFg || '#92400E';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(truncateCanvasText(ctx, badgeText, maxTw - 8), tx + 8, y + 31);
      }

      ctx.fillStyle = '#475569';
      ctx.font = isLarge ? '600 15px sans-serif' : '600 13px sans-serif';
      const posY = badgeText ? y + 56 : y + 36;
      ctx.fillText(truncateCanvasText(ctx, m.position || '', maxTw), tx, posY);

      ctx.fillStyle = '#0F172A';
      ctx.font = isLarge ? 'bold 21px sans-serif' : 'bold 15px sans-serif';
      ctx.fillText(truncateCanvasText(ctx, m.name || '', maxTw), tx, posY + (isLarge ? 26 : 22));

      if (m.nip) {
        ctx.fillStyle = '#92400E';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(truncateCanvasText(ctx, 'NIP. ' + m.nip, maxTw), tx, posY + (isLarge ? 48 : 40));
      }
    }

    // 4. Level 1 Card (Pimpinan)
    const l1 = (h.level_1 && h.level_1[0]) ? h.level_1[0] : {
      name: 'R. Indra Senjaya, S.H., M.H.',
      position: 'Kepala Kejaksaan Negeri Klungkung',
      photo_url: '/static/images/kajari-portrait.jpg'
    };
    const l1W = 660, l1H = 132, l1X = (W - l1W) / 2, l1Y = 246;
    await drawMemberCard(l1, l1X, l1Y, l1W, l1H, 'LEVEL 1 • KEPALA KEJAKSAAN NEGERI', '#FEF3C7', '#92400E', true);

    // 5. Orthogonal Gold Connector Lines from Level 1 to 6 Level 2 Columns
    const l2List = (h.level_2 || []).slice(0, 6);
    const colCount = Math.max(1, l2List.length || 6);
    const gridLeft = 56;
    const gridGap = 24;
    const colW = (W - gridLeft * 2 - gridGap * (colCount - 1)) / colCount;
    const busY = 415;
    const l2Y = 450;

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3.5;
    // Stem down from Level 1
    ctx.beginPath();
    ctx.moveTo(W / 2, l1Y + l1H);
    ctx.lineTo(W / 2, busY);
    ctx.stroke();

    if (colCount > 1) {
      const firstCenter = gridLeft + colW / 2;
      const lastCenter = gridLeft + (colCount - 1) * (colW + gridGap) + colW / 2;
      ctx.beginPath();
      ctx.moveTo(firstCenter, busY);
      ctx.lineTo(lastCenter, busY);
      ctx.stroke();
    }

    // 6. Draw Level 2 & Level 3 Columns
    for (let i = 0; i < l2List.length; i++) {
      const kasi = l2List[i];
      const cx = gridLeft + i * (colW + gridGap);
      const centerColX = cx + colW / 2;

      // Vertical drop from bus to Level 2 card
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerColX, busY);
      ctx.lineTo(centerColX, l2Y);
      ctx.stroke();

      await drawMemberCard(kasi, cx, l2Y, colW, 128, 'ESELON IV • LEVEL 2', '#ECFDF5', '#065F46', false);

      const children = kasi.children || [];
      let curSubY = l2Y + 128 + 26;
      for (let j = 0; j < children.length; j++) {
        // Connector line to child
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerColX, curSubY - 26);
        ctx.lineTo(centerColX, curSubY);
        ctx.stroke();

        await drawMemberCard(children[j], cx, curSubY, colW, 114, 'SUB-BAGIAN / SEKSI', '#F1F5F9', '#334155', false);
        curSubY += 114 + 20;
      }
    }

    // 7. Level 4 (Kelompok Jabatan Fungsional)
    const l4YHeader = 1040;
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, l4YHeader);
    ctx.lineTo(W - 75, l4YHeader);
    ctx.stroke();

    ctx.textAlign = 'center';
    drawRoundedRect(ctx, W / 2 - 280, l4YHeader - 18, 560, 36, 18);
    ctx.fillStyle = '#0B3B24';
    ctx.fill();
    ctx.fillStyle = '#FCD34D';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('LEVEL 4: KELOMPOK JABATAN FUNGSIONAL & AHLI YUSTISIAL', W / 2, l4YHeader + 5);

    const l4List = h.level_4 || [];
    const l4Cols = 5;
    const l4Gap = 24;
    const l4W = (W - gridLeft * 2 - l4Gap * (l4Cols - 1)) / l4Cols;
    for (let k = 0; k < l4List.length; k++) {
      const rowIdx = Math.floor(k / l4Cols);
      const colIdx = k % l4Cols;
      const fx = gridLeft + colIdx * (l4W + l4Gap);
      const fy = l4YHeader + 42 + rowIdx * (122 + 20);
      await drawMemberCard(l4List[k], fx, fy, l4W, 122, 'JABATAN FUNGSIONAL', '#FEF3C7', '#92400E', false);
    }

    // 8. Footer Bar
    ctx.fillStyle = '#0B3B24';
    ctx.fillRect(34, H - 84, W - 68, 50);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('PORTAL PELAYANAN PUBLIK TERPADU KERTAGOSA — KEJAKSAAN NEGERI KLUNGKUNG', 64, H - 53);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FCD34D';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Diunduh Resmi • ' + new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), W - 64, H - 53);

    // 9. Trigger JPG Download
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = 'Struktur-Organisasi-Kejari-Klungkung.jpg';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to render Org Chart JPG:', err);
    alert('Gagal mengunduh bagan struktur organisasi dalam format JPG.');
  }
}

function renderOrgMembersTable() {
  const tbody = document.getElementById('org-members-table-body');
  if (!tbody) return;

  let list = orgAdminData.members;
  if (orgAdminData.currentLevelFilter !== 'all') {
    const lvl = parseInt(orgAdminData.currentLevelFilter);
    list = list.filter(m => m.level === lvl);
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">
          <i data-lucide="info" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          Tidak ada data pegawai pada level ini.
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = list.map(m => {
    let levelBadge = '';
    if (m.level === 1) {
      levelBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">Level 1: Pimpinan</span>';
    } else if (m.level === 2) {
      levelBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">Level 2: Kasi / Kabag</span>';
    } else if (m.level === 3) {
      levelBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">Level 3: Sub-bagian</span>';
    } else {
      levelBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">Level 4: Fungsional</span>';
    }

    const parentText = m.parent_name ? escapeHtml(m.parent_name) : '<span class="text-slate-400 italic">Pimpinan Tertinggi</span>';

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3">
          <div class="flex items-center gap-2.5">
            <img src="${escapeAttr(m.photo_url || '/static/images/avatar-officer-male.svg')}" alt="Foto" class="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0">
            <div>
              <div class="font-bold text-slate-900 text-xs">${escapeHtml(m.name)}</div>
              <div class="text-[10px] text-slate-400">Urutan: #${m.order_num || 1}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="font-semibold text-slate-800 text-xs">${escapeHtml(m.position)}</div>
        </td>
        <td class="py-3 px-3 text-center whitespace-nowrap">
          ${levelBadge}
        </td>
        <td class="py-3 px-3 text-xs">
          ${parentText}
        </td>
        <td class="py-3 px-3 text-xs">
          <div class="font-mono text-slate-700">${escapeHtml(m.nip || '-')}</div>
          <div class="text-[10px] text-slate-400">${escapeHtml(m.rank || '-')}</div>
        </td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          <button onclick="openOrgMemberModal(${m.id})" class="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs mr-1 transition-colors">
            Edit
          </button>
          <button onclick="deleteOrgMember(${m.id}, '${escapeAttr(m.name)}')" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition-colors">
            Hapus
          </button>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function openOrgMemberModal(id = null) {
  const modal = document.getElementById('modal-admin-org-member-form');
  const title = document.getElementById('org-member-form-title');
  const btnSubmit = document.getElementById('btn-submit-org-member');
  const form = document.getElementById('admin-org-member-form');
  form.reset();

  if (id) {
    const member = orgAdminData.members.find(m => m.id === id);
    if (!member) return;
    title.textContent = `Edit Data Pegawai: ${member.name}`;
    btnSubmit.textContent = 'Simpan Perubahan';

    document.getElementById('org-member-form-id').value = member.id;
    document.getElementById('org-member-name').value = member.name || '';
    document.getElementById('org-member-position').value = member.position || '';
    document.getElementById('org-member-level').value = member.level || 4;
    document.getElementById('org-member-photo-url').value = member.photo_url || '';
    document.getElementById('preview-org-member-photo').src = member.photo_url || '/static/images/avatar-officer-male.svg';
    document.getElementById('org-member-nip').value = member.nip || '';
    document.getElementById('org-member-rank').value = member.rank || '';
    document.getElementById('org-member-order').value = member.order_num || 1;

    populateOrgParentDropdown(member.parent_id);
  } else {
    title.textContent = 'Tambah Data Pegawai Baru';
    btnSubmit.textContent = 'Tambahkan Pegawai';
    document.getElementById('org-member-form-id').value = '';
    document.getElementById('org-member-photo-url').value = '/static/images/avatar-officer-male.svg';
    document.getElementById('preview-org-member-photo').src = '/static/images/avatar-officer-male.svg';
    document.getElementById('org-member-level').value = '2';
    document.getElementById('org-member-order').value = (orgAdminData.members.length + 1);

    populateOrgParentDropdown(1);
  }

  openModal('modal-admin-org-member-form');
}

function handleLevelChange(level) {
  level = parseInt(level);
  if (level === 1) {
    populateOrgParentDropdown(null);
  } else if (level === 2) {
    const kajari = orgAdminData.members.find(m => m.level === 1);
    populateOrgParentDropdown(kajari ? kajari.id : null);
  } else if (level === 3) {
    const firstL2 = orgAdminData.members.find(m => m.level === 2);
    populateOrgParentDropdown(firstL2 ? firstL2.id : null);
  } else {
    const kajari = orgAdminData.members.find(m => m.level === 1);
    populateOrgParentDropdown(kajari ? kajari.id : null);
  }
}

function setPresetPhoto(url) {
  document.getElementById('org-member-photo-url').value = url;
  document.getElementById('preview-org-member-photo').src = url;
}

async function uploadMemberPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64 = evt.target.result;
    try {
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          data: base64
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        document.getElementById('org-member-photo-url').value = data.url;
        document.getElementById('preview-org-member-photo').src = data.url;
      } else {
        alert('Gagal mengunggah foto: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      alert('Gagal mengunggah foto.');
    }
  };
  reader.readAsDataURL(file);
}

async function uploadOrgImage(e, inputId, previewId) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64 = evt.target.result;
    try {
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          data: base64
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        document.getElementById(inputId).value = data.url;
        document.getElementById(previewId).src = data.url;
      } else {
        alert('Gagal mengunggah gambar: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      alert('Gagal mengunggah gambar.');
    }
  };
  reader.readAsDataURL(file);
}

async function handleSaveOrgMember(e) {
  e.preventDefault();
  const id = document.getElementById('org-member-form-id').value;
  const payload = {
    name: document.getElementById('org-member-name').value.trim(),
    position: document.getElementById('org-member-position').value.trim(),
    level: parseInt(document.getElementById('org-member-level').value),
    parent_id: document.getElementById('org-member-parent').value || null,
    photo_url: document.getElementById('org-member-photo-url').value.trim() || '/static/images/avatar-officer-male.svg',
    nip: document.getElementById('org-member-nip').value.trim(),
    rank: document.getElementById('org-member-rank').value.trim(),
    order_num: parseInt(document.getElementById('org-member-order').value || '1')
  };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/admin/organization/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/admin/organization/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (data.success) {
      closeModal('modal-admin-org-member-form');
      alert(data.message || 'Data pegawai berhasil disimpan!');
      await loadOrgAdminData();
    } else {
      alert('Gagal menyimpan: ' + (data.error || 'Terjadi kesalahan.'));
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.');
  }
}

async function deleteOrgMember(id, name) {
  if (!confirm(`Apakah Anda yakin ingin menghapus "${name}" dari susunan struktur organisasi?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/organization/members/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Pegawai berhasil dihapus.');
      await loadOrgAdminData();
    } else {
      alert('Gagal menghapus: ' + (data.error || 'Terjadi kesalahan.'));
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.');
  }
}

async function handleSaveOrgSettings(e) {
  e.preventDefault();
  const payload = {
    logo_left: document.getElementById('org-setting-logo-left').value.trim(),
    logo_right: document.getElementById('org-setting-logo-right').value.trim(),
    watermark_bg: document.getElementById('org-setting-watermark-bg').value.trim(),
    watermark_opacity: parseInt(document.getElementById('org-setting-watermark-opacity').value || '12'),
    title: document.getElementById('org-setting-title').value.trim(),
    subtitle: document.getElementById('org-setting-subtitle').value.trim(),
    legal_basis: document.getElementById('org-setting-legal-basis').value.trim()
  };

  try {
    const res = await fetch('/api/admin/organization/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Pengaturan tampilan bagan berhasil disimpan!');
      await loadOrgAdminData();
    } else {
      alert('Gagal menyimpan pengaturan: ' + (data.error || 'Terjadi kesalahan.'));
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.');
  }
}

async function resetOrgHierarchy() {
  if (!confirm('Apakah Anda yakin ingin me-reset struktur organisasi kembali ke 24 pejabat resmi Kejaksaan Negeri Klungkung? Semua perubahan manual akan dikembalikan ke data awal.')) {
    return;
  }

  try {
    const res = await fetch('/api/admin/organization/reset', {
      method: 'POST'
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Bagan organisasi berhasil di-reset!');
      await loadOrgAdminData();
    } else {
      alert('Gagal reset: ' + (data.error || 'Terjadi kesalahan.'));
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ============================================================================
// TAB 10: MANAJEMEN ADMINISTRATOR & USER ACCESS (MFA ENABLED)
// ============================================================================

let adminUsersList = [];

async function loadAdminUsers() {
  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) {
      adminUsersList = data.users || [];
      const countEl = document.getElementById('nav-admin-count');
      const badgeEl = document.getElementById('badge-total-admins');
      if (countEl) countEl.textContent = adminUsersList.length;
      if (badgeEl) badgeEl.textContent = `${adminUsersList.length} Administrator`;
      renderAdminUsersTable();
    }
  } catch (err) {
    console.error('Failed to load admin users:', err);
  }
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  if (adminUsersList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">
          <i data-lucide="users" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          Belum ada administrator lain yang terdaftar.
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = adminUsersList.map(u => {
    let roleBadge = '';
    if (u.role === 'SUPERADMIN') {
      roleBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">SUPERADMIN</span>';
    } else if (u.role === 'ADMIN') {
      roleBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">ADMIN</span>';
    } else {
      roleBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">EDITOR</span>';
    }

    let provLabel = 'Google Authenticator';
    if (u.mfa_provider === 'MICROSOFT') provLabel = 'Microsoft Authenticator';

    const mfaBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200"><i data-lucide="smartphone" class="w-3 h-3 text-emerald-600"></i> ${provLabel}</span>`;

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 font-extrabold flex items-center justify-center text-xs shadow-sm">
              ${escapeHtml(u.full_name ? u.full_name.charAt(0).toUpperCase() : 'A')}
            </div>
            <div>
              <div class="font-bold text-slate-900 text-xs">${escapeHtml(u.full_name)}</div>
              <div class="text-[10px] text-slate-400 font-mono">${escapeHtml(u.email)}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="font-mono text-xs font-semibold text-slate-700">@${escapeHtml(u.username)}</div>
        </td>
        <td class="py-3 px-3 text-center whitespace-nowrap">
          ${roleBadge}
        </td>
        <td class="py-3 px-3 text-center whitespace-nowrap">
          ${mfaBadge}
        </td>
        <td class="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
          ${escapeHtml(u.created_at ? u.created_at.substring(0, 10) : '-')}
        </td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          <button onclick="openAdminMfaSetupModal(${u.id})" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-xs mr-1 transition-colors inline-flex items-center gap-1">
            <i data-lucide="qr-code" class="w-3 h-3"></i>
            <span>QR MFA</span>
          </button>
          <button onclick="openAdminUserModal(${u.id})" class="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs mr-1 transition-colors">
            Edit
          </button>
          <button onclick="deleteAdminUser(${u.id}, '${escapeAttr(u.full_name)}')" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition-colors">
            Hapus
          </button>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

let activeAdminMfaState = {
  userId: null,
  rawSecret: '',
  timer: null
};

async function openAdminMfaSetupModal(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/mfa-setup`);
    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'Gagal memuat konfigurasi Authenticator');
      return;
    }

    activeAdminMfaState.userId = data.user_id;
    activeAdminMfaState.rawSecret = data.totp_secret || '';

    const idEl = document.getElementById('admin-mfa-target-userid');
    const subEl = document.getElementById('admin-mfa-qr-subtitle');
    const qrBox = document.getElementById('admin-mfa-qr-box');
    const accLabel = document.getElementById('admin-mfa-account-label');
    const secCode = document.getElementById('admin-mfa-secret-code');
    const liveRem = document.getElementById('admin-mfa-live-rem');

    if (idEl) idEl.value = data.user_id;
    if (subEl) subEl.textContent = `Akun: ${data.full_name} (@${data.username})`;
    if (qrBox && data.qr_svg) qrBox.innerHTML = data.qr_svg;
    if (accLabel) accLabel.textContent = data.account_name;
    if (secCode) secCode.textContent = data.totp_secret_formatted || data.totp_secret;
    if (liveRem) liveRem.textContent = 'Pindai QR menggunakan Google Authenticator atau Microsoft Authenticator';

    openModal('modal-admin-mfa-qr');
    lucide.createIcons();
  } catch (err) {
    alert('Gagal memuat QR Authenticator.');
  }
}

function closeAdminMfaModal() {
  if (activeAdminMfaState.timer) {
    clearInterval(activeAdminMfaState.timer);
    activeAdminMfaState.timer = null;
  }
  closeModal('modal-admin-mfa-qr');
}

function copyAdminMfaSecret() {
  if (!activeAdminMfaState.rawSecret) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(activeAdminMfaState.rawSecret);
  }
  alert('Kunci Setup Base32 berhasil disalin ke clipboard!');
}

async function resetAdminMfaSecret() {
  const userId = activeAdminMfaState.userId;
  if (!userId) return;
  if (!confirm('Apakah Anda yakin ingin membuat ulang (reset) Kunci Rahasia Authenticator? Anda wajib memindai ulang QR Code baru di aplikasi Google / Microsoft Authenticator Anda.')) {
    return;
  }
  try {
    const res = await fetch(`/api/admin/users/${userId}/mfa-reset`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      activeAdminMfaState.rawSecret = data.totp_secret || '';
      const qrBox = document.getElementById('admin-mfa-qr-box');
      const secCode = document.getElementById('admin-mfa-secret-code');
      if (qrBox && data.qr_svg) qrBox.innerHTML = data.qr_svg;
      if (secCode) secCode.textContent = data.totp_secret_formatted || data.totp_secret;
      alert(data.message);
    } else {
      alert(data.error || 'Gagal mereset kunci MFA.');
    }
  } catch (err) {
    alert('Gagal menghubungi server.');
  }
}

function openAdminUserModal(id = null) {
  const modal = document.getElementById('modal-admin-user-form');
  const title = document.getElementById('admin-user-form-title');
  const btnSubmit = document.getElementById('btn-submit-admin-user');
  const form = document.getElementById('form-admin-user');
  form.reset();

  const provSelect = document.getElementById('admin-user-mfa-provider');

  if (id) {
    const user = adminUsersList.find(u => u.id === id);
    if (!user) return;
    title.textContent = `Edit Administrator: ${user.full_name}`;
    btnSubmit.textContent = 'Simpan Perubahan';

    document.getElementById('admin-user-form-id').value = user.id;
    document.getElementById('admin-user-fullname').value = user.full_name || '';
    document.getElementById('admin-user-username').value = user.username || '';
    document.getElementById('admin-user-username').disabled = true; // username cannot change
    document.getElementById('admin-user-email').value = user.email || '';
    document.getElementById('admin-user-role').value = user.role || 'ADMIN';
    document.getElementById('admin-user-password').required = false;
    document.getElementById('admin-user-password-note').textContent = 'Kosongkan jika tidak ingin mengubah password';
    document.getElementById('admin-user-mfa').checked = true;
    if (provSelect) provSelect.value = user.mfa_provider === 'MICROSOFT' ? 'MICROSOFT' : 'GOOGLE';
  } else {
    title.textContent = 'Tambah Administrator Baru';
    btnSubmit.textContent = 'Tambahkan Admin';
    document.getElementById('admin-user-form-id').value = '';
    document.getElementById('admin-user-username').disabled = false;
    document.getElementById('admin-user-password').required = true;
    document.getElementById('admin-user-password-note').textContent = 'Minimal 6 karakter';
    document.getElementById('admin-user-mfa').checked = true;
    if (provSelect) provSelect.value = 'GOOGLE';
  }

  openModal('modal-admin-user-form');
}

async function handleSaveAdminUser(e) {
  e.preventDefault();
  const id = document.getElementById('admin-user-form-id').value;
  const provSelect = document.getElementById('admin-user-mfa-provider');
  const payload = {
    full_name: document.getElementById('admin-user-fullname').value.trim(),
    username: document.getElementById('admin-user-username').value.trim(),
    email: document.getElementById('admin-user-email').value.trim(),
    role: document.getElementById('admin-user-role').value,
    password: document.getElementById('admin-user-password').value.trim(),
    mfa_enabled: true,
    mfa_provider: (provSelect && provSelect.value === 'MICROSOFT') ? 'MICROSOFT' : 'GOOGLE'
  };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (data.success) {
      alert(data.message);
      closeModal('modal-admin-user-form');
      await loadAdminUsers();
    } else {
      alert('Gagal menyimpan data admin: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal terhubung ke server.');
  }
}

async function deleteAdminUser(id, name) {
  if (!confirm(`Apakah Anda yakin ingin menghapus administrator "${name}"? Akses login akun ini akan dicabut secara permanen.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      await loadAdminUsers();
    } else {
      alert('Gagal menghapus admin: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal menghapus admin.');
  }
}

// ============================================================================
// TAB 11: AKUNTABILITAS KINERJA (SAKIP) BACKOFFICE CONTROLLER
// ============================================================================

let accountabilityDocsList = [];
let adminSakipActiveFilter = 'ALL';

async function loadAccountabilityAdminData() {
  try {
    const res = await fetch('/api/admin/accountability');
    const data = await res.json();
    if (data.success) {
      accountabilityDocsList = data.documents || [];
      const stats = data.stats || {};

      // Update counters
      const totalEl = document.getElementById('admin-stat-sakip-total');
      const renstraEl = document.getElementById('admin-stat-sakip-renstra');
      const renjaEl = document.getElementById('admin-stat-sakip-renja');
      const lkjEl = document.getElementById('admin-stat-sakip-lkj');
      const triwulanEl = document.getElementById('admin-stat-sakip-triwulan');
      const navCount = document.getElementById('nav-accountability-count');

      if (totalEl) totalEl.textContent = stats.total || '0';
      if (renstraEl) renstraEl.textContent = stats.renstra || '0';
      if (renjaEl) renjaEl.textContent = stats.renja || '0';
      if (lkjEl) lkjEl.textContent = stats.lkj || '0';
      if (triwulanEl) triwulanEl.textContent = stats.triwulan || '0';
      if (navCount) navCount.textContent = stats.total || '0';

      filterAdminAccountabilityTable();
    }
  } catch (err) {
    console.error('Error loading SAKIP docs for admin:', err);
  }
}

function setAdminSakipFilter(cat) {
  adminSakipActiveFilter = cat;
  const cats = ['ALL', 'RENSTRA', 'RENJA', 'LKJ', 'TRIWULAN'];
  cats.forEach(c => {
    const btn = document.getElementById(`admin-sakip-filter-${c}`);
    if (!btn) return;
    if (c === cat) {
      btn.className = 'px-3 py-1 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm';
    } else {
      btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors';
    }
  });
  filterAdminAccountabilityTable();
}

function filterAdminAccountabilityTable() {
  const searchInput = document.getElementById('admin-sakip-search');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let filtered = accountabilityDocsList;

  if (adminSakipActiveFilter !== 'ALL') {
    filtered = filtered.filter(d => (d.category || '').toUpperCase() === adminSakipActiveFilter);
  }

  if (query) {
    filtered = filtered.filter(d => 
      (d.title || '').toLowerCase().includes(query) ||
      (d.period_year || '').toLowerCase().includes(query) ||
      (d.description || '').toLowerCase().includes(query) ||
      (d.category || '').toLowerCase().includes(query)
    );
  }

  renderAccountabilityTable(filtered);
}

function renderAccountabilityTable(docs = null) {
  const list = docs !== null ? docs : accountabilityDocsList;
  const tbody = document.getElementById('accountability-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-10 text-center text-slate-400">
          <i data-lucide="file-question" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <div>Tidak ada dokumen SAKIP yang cocok dengan filter.</div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = list.map(doc => {
    let catBadge = '';
    const cat = (doc.category || '').toUpperCase();
    if (cat === 'RENSTRA') {
      catBadge = '<span class="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300">RENSTRA</span>';
    } else if (cat === 'RENJA') {
      catBadge = '<span class="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-950 border border-amber-300">RENJA</span>';
    } else if (cat === 'LKJ') {
      catBadge = '<span class="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-900 border border-blue-300">LKj (Tahunan)</span>';
    } else if (cat === 'TRIWULAN') {
      catBadge = '<span class="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-100 text-purple-900 border border-purple-300">Triwulan</span>';
    } else {
      catBadge = `<span class="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">${escapeAttr(cat)}</span>`;
    }

    const isActive = doc.is_active !== 0;
    const statusBadge = isActive
      ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Publik</span>'
      : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-500"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Draft</span>';

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-3 text-center font-bold text-slate-500">${doc.order_num || 1}</td>
        <td class="py-3 px-3">${catBadge}</td>
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900">${escapeAttr(doc.title)}</div>
          ${doc.description ? `<div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${escapeAttr(doc.description)}</div>` : ''}
        </td>
        <td class="py-3 px-3 font-semibold text-slate-700">${escapeAttr(doc.period_year || '-')}</td>
        <td class="py-3 px-3 text-slate-600 font-mono text-[11px]">${escapeAttr(doc.file_size || 'PDF')}</td>
        <td class="py-3 px-3">
          <div class="flex items-center gap-1.5">
            <a href="${escapeAttr(doc.doc_url)}" target="_blank" rel="noopener noreferrer" class="text-emerald-800 hover:text-emerald-950 font-medium underline truncate max-w-[140px] block" title="${escapeAttr(doc.doc_url)}">
              Google Drive
            </a>
            <button onclick="copyAdminDocUrl('${escapeAttr(doc.doc_url)}', '${escapeAttr(doc.title)}')" class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Salin Link">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
        <td class="py-3 px-3 text-center text-slate-600 font-bold">${doc.views_count || 0}x</td>
        <td class="py-3 px-3 text-center">${statusBadge}</td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          <button onclick="openAccountabilityModal(${doc.id})" class="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs mr-1 transition-colors">
            Edit
          </button>
          <button onclick="deleteAccountabilityDoc(${doc.id}, '${escapeAttr(doc.title)}')" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition-colors">
            Hapus
          </button>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function openAccountabilityModal(id = null) {
  const modal = document.getElementById('modal-admin-accountability-form');
  const title = document.getElementById('accountability-form-title');
  const btnSubmit = document.getElementById('btn-submit-accountability');
  const form = document.getElementById('form-admin-accountability');
  form.reset();

  if (id) {
    const doc = accountabilityDocsList.find(d => d.id === id);
    if (!doc) return;
    title.textContent = `Edit Dokumen SAKIP: ${doc.title}`;
    btnSubmit.textContent = 'Simpan Perubahan';

    document.getElementById('accountability-form-id').value = doc.id;
    document.getElementById('accountability-form-category').value = doc.category || 'RENSTRA';
    document.getElementById('accountability-form-period').value = doc.period_year || '';
    document.getElementById('accountability-form-title-input').value = doc.title || '';
    document.getElementById('accountability-form-url').value = doc.doc_url || '';
    document.getElementById('accountability-form-filesize').value = doc.file_size || 'PDF (3.2 MB)';
    document.getElementById('accountability-form-order').value = doc.order_num || 1;
    document.getElementById('accountability-form-desc').value = doc.description || '';
    document.getElementById('accountability-form-active').checked = doc.is_active !== 0;
  } else {
    title.textContent = 'Tambah Dokumen SAKIP Baru';
    btnSubmit.textContent = 'Simpan Dokumen SAKIP';
    document.getElementById('accountability-form-id').value = '';
    document.getElementById('accountability-form-category').value = adminSakipActiveFilter !== 'ALL' ? adminSakipActiveFilter : 'RENSTRA';
    document.getElementById('accountability-form-period').value = new Date().getFullYear().toString();
    document.getElementById('accountability-form-filesize').value = 'PDF (3.2 MB)';
    document.getElementById('accountability-form-order').value = accountabilityDocsList.length + 1;
    document.getElementById('accountability-form-active').checked = true;
  }

  openModal('modal-admin-accountability-form');
}

async function handleSaveAccountabilityDoc(e) {
  e.preventDefault();
  const id = document.getElementById('accountability-form-id').value;
  const payload = {
    category: document.getElementById('accountability-form-category').value.trim(),
    period_year: document.getElementById('accountability-form-period').value.trim(),
    title: document.getElementById('accountability-form-title-input').value.trim(),
    doc_url: document.getElementById('accountability-form-url').value.trim(),
    file_size: document.getElementById('accountability-form-filesize').value.trim() || 'PDF (3.2 MB)',
    order_num: parseInt(document.getElementById('accountability-form-order').value) || 1,
    description: document.getElementById('accountability-form-desc').value.trim(),
    is_active: document.getElementById('accountability-form-active').checked
  };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/admin/accountability/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/admin/accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (data.success) {
      alert(data.message);
      closeModal('modal-admin-accountability-form');
      await loadAccountabilityAdminData();
    } else {
      alert('Gagal menyimpan dokumen: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal terhubung ke server.');
  }
}

async function deleteAccountabilityDoc(id, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus dokumen SAKIP "${title}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/accountability/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      await loadAccountabilityAdminData();
    } else {
      alert('Gagal menghapus dokumen: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal menghapus dokumen.');
  }
}

function copyAdminDocUrl(url, title) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      alert(`Link Google Drive dokumen "${title}" berhasil disalin!`);
    });
  } else {
    prompt('Salin tautan dokumen:', url);
  }
}

// ============================================================================
// TAB 12: KELOLA PROFIL INSTANSI BACKOFFICE CMS
// ============================================================================

let adminProfileState = {
  activeSubTab: 'visi-misi',
  items: [],
  contents: {}
};

function switchProfileSubTab(subTab) {
  adminProfileState.activeSubTab = subTab;
  const subTabs = ['visi-misi', 'sejarah', 'logo-makna', 'tugas-wewenang'];

  subTabs.forEach(st => {
    const btn = document.getElementById(`subnav-${st}`);
    const panel = document.getElementById(`subtab-panel-${st}`);
    if (st === subTab) {
      if (panel) panel.classList.remove('hidden');
      if (btn) {
        btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3B24] text-white shadow-sm flex items-center gap-1.5 transition-all';
      }
    } else {
      if (panel) panel.classList.add('hidden');
      if (btn) {
        btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-1.5 transition-all';
      }
    }
  });

  lucide.createIcons();
}

async function loadAdminProfileCms() {
  try {
    const [itemsRes, contentsRes] = await Promise.all([
      fetch('/api/admin/profile-items'),
      fetch('/api/public/profile-data?page_type=ALL')
    ]);

    const itemsData = await itemsRes.json();
    const contentsData = await contentsRes.json();

    if (itemsData.success) {
      adminProfileState.items = itemsData.items || [];
    }
    if (contentsData.success && contentsData.contents) {
      adminProfileState.contents = contentsData.contents;
    }

    populateAdminProfileForms();
    renderAdminProfileTables();
    lucide.createIcons();
  } catch (err) {
    console.error('Failed to load profile CMS data:', err);
  }
}

function populateAdminProfileForms() {
  const c = adminProfileState.contents || {};

  // 1. Visi Misi
  setVal('cms-input-profil-visi-text', c.profil_visi_text?.value);
  setVal('cms-input-profil-visi-sub', c.profil_visi_misi_sub?.value);
  setVal('cms-input-profil-doktrin-satya', c.profil_doktrin_satya?.value);
  setVal('cms-input-profil-doktrin-adhi', c.profil_doktrin_adhi?.value);
  setVal('cms-input-profil-doktrin-wicaksana', c.profil_doktrin_wicaksana?.value);

  // 2. Sejarah
  setVal('cms-input-profil-sejarah-p1', c.profil_sejarah_kerta_gosa_p1?.value);
  setVal('cms-input-profil-sejarah-p2', c.profil_sejarah_kerta_gosa_p2?.value);
  setVal('cms-input-profil-sejarah-modern', c.profil_sejarah_modern_p1?.value);
  if (c.profil_sejarah_img_1?.value) {
    const el = document.getElementById('admin-preview-sejarah-1');
    if (el) el.src = c.profil_sejarah_img_1.value;
  }
  if (c.profil_sejarah_img_2?.value) {
    const el = document.getElementById('admin-preview-sejarah-2');
    if (el) el.src = c.profil_sejarah_img_2.value;
  }

  // 3. Logo Makna
  setVal('cms-input-profil-logo-desc', c.profil_logo_satya_desc?.value);
  setVal('cms-input-profil-logo-warna', c.profil_logo_filosofi_warna?.value);
  setVal('cms-input-profil-logo-kertagosa', c.profil_logo_filosofi_kertagosa?.value);
  if (c.header_logo_url?.value) {
    const el = document.getElementById('admin-preview-logo-makna');
    if (el) el.src = c.header_logo_url.value;
  }

  // 4. Tugas Wewenang
  setVal('cms-input-profil-tugas-hukum', c.profil_tugas_dasar_hukum?.value);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) {
    el.value = val;
  }
}

function renderAdminProfileTables() {
  const items = adminProfileState.items || [];

  // Table 1: Misi
  const misiItems = items.filter(i => i.page_type === 'VISI_MISI');
  const misiTbody = document.getElementById('table-body-admin-misi');
  if (misiTbody) {
    if (misiItems.length === 0) {
      misiTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400">Belum ada item misi.</td></tr>`;
    } else {
      misiTbody.innerHTML = misiItems.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-2.5 px-3 text-center font-bold text-slate-700">${item.order_num}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${escapeAdminHtml(item.title)}</td>
          <td class="py-2.5 px-3 text-slate-600 max-w-xs truncate">${escapeAdminHtml(item.description)}</td>
          <td class="py-2.5 px-3 text-right space-x-1">
            <button onclick="openAdminProfileItemModal('VISI_MISI', 'MISI', ${item.id})" class="p-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100" title="Edit"><i data-lucide="edit-2" class="w-3.5 h-3.5 inline"></i></button>
            <button onclick="deleteAdminProfileItem(${item.id}, '${escapeAdminQuote(item.title)}')" class="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Table 2: Sejarah Milestones
  const sejarahItems = items.filter(i => i.page_type === 'SEJARAH');
  const sejarahTbody = document.getElementById('table-body-admin-sejarah');
  if (sejarahTbody) {
    if (sejarahItems.length === 0) {
      sejarahTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400">Belum ada linimasa sejarah.</td></tr>`;
    } else {
      sejarahTbody.innerHTML = sejarahItems.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-2.5 px-3 text-center font-bold text-slate-700">${item.order_num}</td>
          <td class="py-2.5 px-3 font-bold text-amber-700">${escapeAdminHtml(item.subtitle || '-')}</td>
          <td class="py-2.5 px-3">
            <div class="font-semibold text-slate-900">${escapeAdminHtml(item.title)}</div>
            <div class="text-slate-500 text-[11px] truncate max-w-sm">${escapeAdminHtml(item.description)}</div>
          </td>
          <td class="py-2.5 px-3 text-right space-x-1">
            <button onclick="openAdminProfileItemModal('SEJARAH', 'TIMELINE', ${item.id})" class="p-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100" title="Edit"><i data-lucide="edit-2" class="w-3.5 h-3.5 inline"></i></button>
            <button onclick="deleteAdminProfileItem(${item.id}, '${escapeAdminQuote(item.title)}')" class="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Table 3: Logo Elements
  const logoItems = items.filter(i => i.page_type === 'LOGO_MAKNA');
  const logoTbody = document.getElementById('table-body-admin-logo');
  if (logoTbody) {
    if (logoItems.length === 0) {
      logoTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400">Belum ada elemen logo.</td></tr>`;
    } else {
      logoTbody.innerHTML = logoItems.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-2.5 px-3 text-center text-base">${item.icon_name || '★'}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${escapeAdminHtml(item.title)}</td>
          <td class="py-2.5 px-3 text-slate-600 max-w-xs truncate">${escapeAdminHtml(item.description)}</td>
          <td class="py-2.5 px-3 text-right space-x-1">
            <button onclick="openAdminProfileItemModal('LOGO_MAKNA', 'LOGO_ELEM', ${item.id})" class="p-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100" title="Edit"><i data-lucide="edit-2" class="w-3.5 h-3.5 inline"></i></button>
            <button onclick="deleteAdminProfileItem(${item.id}, '${escapeAdminQuote(item.title)}')" class="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Table 4: Tugas Bidang
  const tugasItems = items.filter(i => i.page_type === 'TUGAS_WEWENANG');
  const tugasTbody = document.getElementById('table-body-admin-tugas');
  if (tugasTbody) {
    if (tugasItems.length === 0) {
      tugasTbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400">Belum ada bidang tugas.</td></tr>`;
    } else {
      tugasTbody.innerHTML = tugasItems.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-2.5 px-3 text-center font-bold text-slate-700">${item.order_num}</td>
          <td class="py-2.5 px-3">
            <div class="font-bold text-slate-900">${escapeAdminHtml(item.title)}</div>
            ${item.subtitle ? `<div class="text-[10px] text-blue-800 font-bold">${escapeAdminHtml(item.subtitle)}</div>` : ''}
          </td>
          <td class="py-2.5 px-3 text-slate-600 max-w-xs truncate whitespace-pre-line">${escapeAdminHtml(item.description)}</td>
          <td class="py-2.5 px-3 text-right space-x-1">
            <button onclick="openAdminProfileItemModal('TUGAS_WEWENANG', 'TUGAS_BIDANG', ${item.id})" class="p-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100" title="Edit"><i data-lucide="edit-2" class="w-3.5 h-3.5 inline"></i></button>
            <button onclick="deleteAdminProfileItem(${item.id}, '${escapeAdminQuote(item.title)}')" class="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }
}

async function saveAdminProfileText(contentKey, inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const val = el.value.trim();

  try {
    const res = await fetch('/api/admin/page-contents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_key: contentKey, content_value: val })
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Teks berhasil disimpan!');
      if (!adminProfileState.contents[contentKey]) adminProfileState.contents[contentKey] = {};
      adminProfileState.contents[contentKey].value = val;
    } else {
      alert('Gagal menyimpan teks: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (e) {
    alert('Gagal terhubung ke server.');
  }
}

async function uploadAdminProfileImage(contentKey, event, previewId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    const preview = document.getElementById(previewId);
    if (preview) preview.src = base64Data;

    try {
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_data: base64Data,
          filename: file.name,
          content_key: contentKey
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Foto/Logo berhasil diupload dan disimpan!');
        if (contentKey === 'header_logo_url') {
          document.querySelectorAll('.site-logo-img').forEach(img => img.src = data.url);
        }
        await loadAdminProfileCms();
      } else {
        alert('Gagal upload: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      alert('Gagal mengirim file ke server.');
    }
  };
  reader.readAsDataURL(file);
}

function openAdminProfileItemModal(pageType, itemType, itemId) {
  const titleEl = document.getElementById('admin-profile-item-modal-title');
  const idInput = document.getElementById('admin-profile-item-id');
  const pageTypeInput = document.getElementById('admin-profile-item-page-type');
  const typeInput = document.getElementById('admin-profile-item-type');
  const titleInput = document.getElementById('admin-profile-item-title');
  const subInput = document.getElementById('admin-profile-item-sub');
  const orderInput = document.getElementById('admin-profile-item-order');
  const iconInput = document.getElementById('admin-profile-item-icon');
  const descInput = document.getElementById('admin-profile-item-desc');

  if (itemId) {
    const item = adminProfileState.items.find(i => Number(i.id) === Number(itemId));
    if (!item) return;

    idInput.value = item.id;
    pageTypeInput.value = item.page_type;
    typeInput.value = item.item_type;
    titleInput.value = item.title || '';
    subInput.value = item.subtitle || '';
    orderInput.value = item.order_num || 1;
    iconInput.value = item.icon_name || '';
    descInput.value = item.description || '';

    titleEl.innerHTML = `<i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i><span>Edit Item Profil (${item.page_type} #${item.id})</span>`;
  } else {
    idInput.value = '';
    pageTypeInput.value = pageType;
    typeInput.value = itemType;
    titleInput.value = '';
    subInput.value = '';
    iconInput.value = '';
    descInput.value = '';

    const currentItems = adminProfileState.items.filter(i => i.page_type === pageType);
    orderInput.value = currentItems.length + 1;

    titleEl.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-emerald-800"></i><span>Tambah Item Profil Baru (${pageType})</span>`;
  }

  openModal('modal-admin-profile-item-form');
  lucide.createIcons();
}

async function saveAdminProfileItem(e) {
  e.preventDefault();
  const id = document.getElementById('admin-profile-item-id').value;
  const page_type = document.getElementById('admin-profile-item-page-type').value;
  const item_type = document.getElementById('admin-profile-item-type').value;
  const title = document.getElementById('admin-profile-item-title').value.trim();
  const subtitle = document.getElementById('admin-profile-item-sub').value.trim();
  const order_num = parseInt(document.getElementById('admin-profile-item-order').value) || 1;
  const icon_name = document.getElementById('admin-profile-item-icon').value.trim();
  const description = document.getElementById('admin-profile-item-desc').value.trim();

  const payload = {
    page_type,
    item_type,
    title,
    subtitle,
    order_num,
    icon_name,
    description
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
      alert(data.message || 'Item profil berhasil disimpan!');
      closeModal('modal-admin-profile-item-form');
      await loadAdminProfileCms();
    } else {
      alert('Gagal menyimpan: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal menghubungi server.');
  }
}

async function deleteAdminProfileItem(id, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/profile-items/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Item profil berhasil dihapus!');
      await loadAdminProfileCms();
    } else {
      alert('Gagal menghapus: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal menghapus item.');
  }
}

function escapeAdminHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAdminQuote(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ============================================================================
// ADMIN ANNOUNCEMENTS MANAGEMENT (Pengumuman Resmi)
// ============================================================================

adminData.announcements = [];

async function loadAnnouncementsAdminData() {
  try {
    const res = await fetch('/api/admin/announcements');
    const data = await res.json();
    if (data.success && data.announcements) {
      adminData.announcements = data.announcements;
      renderAdminAnnouncementsTable();
      const countEl = document.getElementById('nav-announcement-count');
      if (countEl) countEl.textContent = data.announcements.length;
    }
  } catch (err) {
    console.error('Error loading admin announcements:', err);
  }
}

function renderAdminAnnouncementsTable() {
  const tbody = document.getElementById('admin-announcements-tbody');
  if (!tbody) return;

  const items = adminData.announcements || [];
  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400">
          Belum ada pengumuman resmi. Klik "Tambah Pengumuman Baru" untuk menerbitkan.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-3">
        <div class="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          <img src="${item.image_url || '/static/images/news-bb.jpg'}" alt="${escapeAdminHtml(item.title)}" class="w-full h-full object-cover">
        </div>
      </td>
      <td class="py-3 px-3">
        <div class="text-[11px] font-mono text-slate-400 font-semibold">${escapeAdminHtml(item.announcement_number || '-')}</div>
        <div class="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">${escapeAdminHtml(item.title)}</div>
        <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${escapeAdminHtml(item.excerpt || '')}</div>
      </td>
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getAdminAnnouncementBadge(item.category)} border">
          ${escapeAdminHtml(item.badge_label || item.category || 'UMUM')}
        </span>
      </td>
      <td class="py-3 px-3 whitespace-nowrap text-slate-600">
        ${escapeAdminHtml(item.deadline_date || '-')}
      </td>
      <td class="py-3 px-3">
        ${item.external_url ? `
          <a href="${item.external_url}" target="_blank" class="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]">
            <span>${escapeAdminHtml(item.external_label || 'Tautan')}</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
        ` : '<span class="text-slate-400">-</span>'}
      </td>
      <td class="py-3 px-3 text-center font-bold text-slate-700">
        ${item.order_num || 1}
      </td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openAdminAnnouncementModal(${item.id})" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors" title="Edit Pengumuman">
            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteAdminAnnouncement(${item.id}, '${escapeAdminQuote(item.title)}')" class="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Hapus Pengumuman">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function getAdminAnnouncementBadge(cat) {
  const c = (cat || '').toUpperCase();
  if (c === 'LELANG') return 'bg-amber-100 text-amber-900 border-amber-300';
  if (c === 'LAYANAN') return 'bg-blue-100 text-blue-900 border-blue-200';
  if (c === 'SELEKSI') return 'bg-purple-100 text-purple-900 border-purple-200';
  if (c === 'MAKLUMAT') return 'bg-rose-100 text-rose-900 border-rose-200';
  return 'bg-emerald-100 text-emerald-900 border-emerald-200';
}

function openAdminAnnouncementModal(id = null) {
  const modal = document.getElementById('modal-admin-announcement');
  if (!modal) return;

  if (id) {
    const item = (adminData.announcements || []).find(a => Number(a.id) === Number(id));
    if (!item) return;
    document.getElementById('admin-ann-id').value = item.id;
    document.getElementById('admin-ann-number').value = item.announcement_number || '';
    document.getElementById('admin-ann-category').value = item.category || 'LELANG';
    document.getElementById('admin-ann-title').value = item.title || '';
    document.getElementById('admin-ann-badge').value = item.badge_label || '';
    document.getElementById('admin-ann-deadline').value = item.deadline_date || '';
    document.getElementById('admin-ann-excerpt').value = item.excerpt || '';
    document.getElementById('admin-ann-content').value = item.content || '';
    document.getElementById('admin-ann-ext-url').value = item.external_url || '';
    document.getElementById('admin-ann-ext-label').value = item.external_label || '';
    document.getElementById('admin-ann-image-url').value = item.image_url || '';
    document.getElementById('admin-ann-order').value = item.order_num || 1;
    document.getElementById('modal-admin-announcement-title').innerHTML = `
      <i data-lucide="edit-3" class="w-4 h-4 text-emerald-800"></i>
      <span>Edit Pengumuman (#${item.id})</span>
    `;
  } else {
    document.getElementById('admin-ann-id').value = '';
    document.getElementById('admin-ann-number').value = `PENG-${Math.floor(Math.random() * 90 + 10)}/KEJARI-KLK/${new Date().getFullYear()}`;
    document.getElementById('admin-ann-category').value = 'LELANG';
    document.getElementById('admin-ann-title').value = '';
    document.getElementById('admin-ann-badge').value = 'LELANG RAMPASAN NEGARA';
    document.getElementById('admin-ann-deadline').value = '';
    document.getElementById('admin-ann-excerpt').value = '';
    document.getElementById('admin-ann-content').value = '';
    document.getElementById('admin-ann-ext-url').value = '';
    document.getElementById('admin-ann-ext-label').value = '';
    document.getElementById('admin-ann-image-url').value = '/static/images/news-bb.jpg';
    document.getElementById('admin-ann-order').value = (adminData.announcements ? adminData.announcements.length + 1 : 1);
    document.getElementById('modal-admin-announcement-title').innerHTML = `
      <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-800"></i>
      <span>Tambah Pengumuman Baru</span>
    `;
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

async function saveAdminAnnouncement(e) {
  e.preventDefault();
  const id = document.getElementById('admin-ann-id').value;
  const payload = {
    announcement_number: document.getElementById('admin-ann-number').value.trim(),
    category: document.getElementById('admin-ann-category').value.trim(),
    title: document.getElementById('admin-ann-title').value.trim(),
    badge_label: document.getElementById('admin-ann-badge').value.trim(),
    deadline_date: document.getElementById('admin-ann-deadline').value.trim(),
    excerpt: document.getElementById('admin-ann-excerpt').value.trim(),
    content: document.getElementById('admin-ann-content').value.trim(),
    external_url: document.getElementById('admin-ann-ext-url').value.trim(),
    external_label: document.getElementById('admin-ann-ext-label').value.trim(),
    image_url: document.getElementById('admin-ann-image-url').value.trim(),
    order_num: parseInt(document.getElementById('admin-ann-order').value || '1'),
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
      closeModal('modal-admin-announcement');
      alert(data.message || 'Pengumuman berhasil disimpan!');
      await loadAnnouncementsAdminData();
    } else {
      alert('Gagal menyimpan: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.');
  }
}

async function deleteAdminAnnouncement(id, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Pengumuman berhasil dihapus!');
      await loadAnnouncementsAdminData();
    } else {
      alert('Gagal menghapus: ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    alert('Gagal menghapus pengumuman.');
  }
}
