/**
 * KERTAGOSA - Master Floating Accessibility System (A11Y)
 * Widget Aksesibilitas Khusus Penyandang Disabilitas (Tunanetra, Low Vision, Disleksia)
 * Pojok Kiri Bawah (Bottom-Left) dengan Fitur Suara Web Speech API, Drag-and-Drop,
 * Toggle Menghilangkan / Sembunyikan, dan Tombol Reset Pengaturan Bawaan
 * Kejaksaan Negeri Klungkung
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'kertagosa_a11y_settings';
  const POS_STORAGE_KEY = 'kertagosa_a11y_trigger_pos';

  // Default Accessibility State
  const defaultState = {
    widget_hidden: false,
    tts_active: false,
    tts_rate: 1.0,
    tts_click_mode: false,
    contrast: 'normal', // normal, dark, light, invert
    saturation: 'normal', // normal, mono, low, high
    highlight_links: false,
    font_size: 100, // 100, 115, 130, 150
    spacing: 'normal', // normal, wide, extrawide
    line_height: 'normal', // normal, 18, 22
    text_align: 'normal', // normal, left, justify, center
    dyslexic: false,
    reading_line: false,
    reading_mask: false,
  };

  let state = { ...defaultState };

  // Load persisted state
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('[A11Y] Note: localStorage not accessible', e);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
    updateBadge();
  }

  // Toast Notification Helper
  function showA11yToast(msg) {
    const toast = document.getElementById('a11y-toast');
    const txt = document.getElementById('a11y-toast-text');
    if (!toast || !txt) return;
    txt.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  }

  // =========================================================================
  // 1. Text-To-Speech (Web Speech API) Engine
  // =========================================================================
  let isSpeaking = false;
  let currentUtterance = null;
  const synth = window.speechSynthesis;

  function speakText(text, customRate) {
    if (state.widget_hidden) return;
    if (!synth) {
      alert('Browser Anda tidak mendukung Web Speech API (Text-to-Speech).');
      return;
    }
    const cleanText = (text || '').trim();
    if (!cleanText) return;

    // Cancel any current speaking
    synth.cancel();

    const isEng = (window.currentLanguage === 'en');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isEng ? 'en-US' : 'id-ID';
    utterance.rate = customRate || state.tts_rate || 1.0;
    utterance.pitch = 1.0;

    // Pick appropriate voice if available
    const voices = synth.getVoices ? synth.getVoices() : [];
    const targetTag = isEng ? 'en' : 'id';
    const pickedVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes(targetTag));
    if (pickedVoice) utterance.voice = pickedVoice;

    utterance.onstart = () => {
      isSpeaking = true;
      showTTSIndicator(cleanText);
    };

    utterance.onend = () => {
      isSpeaking = false;
      hideTTSIndicator();
      clearSpeakingHighlights();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      hideTTSIndicator();
      clearSpeakingHighlights();
    };

    currentUtterance = utterance;
    synth.speak(utterance);
  }

  function stopSpeech() {
    if (synth) synth.cancel();
    isSpeaking = false;
    hideTTSIndicator();
    clearSpeakingHighlights();
  }

  function showTTSIndicator(text) {
    let ind = document.getElementById('a11y-tts-indicator');
    if (!ind) return;
    const snippetEl = document.getElementById('a11y-tts-snippet');
    if (snippetEl) {
      snippetEl.textContent = text.length > 55 ? text.substring(0, 55) + '...' : text;
    }
    ind.classList.remove('hidden');
  }

  function hideTTSIndicator() {
    const ind = document.getElementById('a11y-tts-indicator');
    if (ind) ind.classList.add('hidden');
  }

  function clearSpeakingHighlights() {
    document.querySelectorAll('.a11y-speaking-target').forEach(el => {
      el.classList.remove('a11y-speaking-target');
    });
  }

  // Auto-read on user selection
  function handleUserSelection() {
    if (state.widget_hidden || !state.tts_active) return;
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text.length >= 2) {
      // Don't read if selected inside the A11Y menu
      const anchorNode = selection.anchorNode;
      if (anchorNode && anchorNode.parentElement && anchorNode.parentElement.closest('#a11y-widget-root')) {
        return;
      }
      speakText(text);
    }
  }

  // Click-to-read handler
  function handleDocumentClickToRead(e) {
    if (state.widget_hidden || !state.tts_active || !state.tts_click_mode) return;
    const target = e.target;
    if (target.closest('#a11y-widget-root') || target.closest('#a11y-tts-indicator') || target.closest('#a11y-restore-pill')) return;

    // Identify readable text
    const text = (target.innerText || target.textContent || '').trim();
    if (text.length > 1) {
      clearSpeakingHighlights();
      target.classList.add('a11y-speaking-target');
      speakText(text);
    }
  }

  // Read entire visible page content
  function readEntirePage() {
    const contentNodes = document.querySelectorAll('h1, h2, h3, p, article, .stat-value, .stat-label');
    let fullText = '';
    contentNodes.forEach(node => {
      if (!node.closest('#a11y-widget-root') && !node.closest('nav') && !node.closest('header')) {
        const t = (node.innerText || '').trim();
        if (t.length > 5) fullText += t + '. ';
      }
    });
    if (!fullText) {
      fullText = document.title + '. Selamat datang di Portal Kejaksaan Negeri Klungkung.';
    }
    speakText(fullText.substring(0, 1500));
  }

  // =========================================================================
  // 2. Reading Guide Line & Reading Mask
  // =========================================================================
  function updateReadingAids(e) {
    const clientY = e.clientY;
    const line = document.getElementById('a11y-reading-guide-line');
    if (line && state.reading_line) {
      line.style.top = (clientY - 2) + 'px';
    }

    const maskTop = document.getElementById('a11y-reading-mask-top');
    const maskBtm = document.getElementById('a11y-reading-mask-bottom');
    if (maskTop && maskBtm && state.reading_mask) {
      const slit = 45; // half height of slit
      const topH = Math.max(0, clientY - slit);
      maskTop.style.height = topH + 'px';
      maskBtm.style.top = (clientY + slit) + 'px';
      maskBtm.style.height = Math.max(0, window.innerHeight - (clientY + slit)) + 'px';
    }
  }

  // =========================================================================
  // 3. Apply Accessibility Settings to DOM
  // =========================================================================
  function applyAllSettings() {
    const body = document.body;
    const html = document.documentElement;
    if (!body || !html) return;

    // 0. Hidden Toggle State
    const trigger = document.getElementById('a11y-widget-trigger');
    const pill = document.getElementById('a11y-restore-pill');
    if (state.widget_hidden) {
      if (trigger) trigger.classList.add('hidden');
      if (pill) pill.classList.remove('hidden');
    } else {
      if (trigger) trigger.classList.remove('hidden');
      if (pill) pill.classList.add('hidden');
    }

    // 1. Contrast
    body.classList.remove('a11y-contrast-dark', 'a11y-contrast-light', 'a11y-contrast-invert');
    if (state.contrast && state.contrast !== 'normal') {
      body.classList.add('a11y-contrast-' + state.contrast);
    }

    // 2. Saturation
    body.classList.remove('a11y-sat-mono', 'a11y-sat-low', 'a11y-sat-high');
    if (state.saturation && state.saturation !== 'normal') {
      body.classList.add('a11y-sat-' + state.saturation);
    }

    // 3. Highlight Links
    body.classList.toggle('a11y-highlight-links', Boolean(state.highlight_links));

    // 4. Font Size
    html.classList.remove('a11y-font-115', 'a11y-font-130', 'a11y-font-150');
    if (state.font_size > 100) {
      html.classList.add('a11y-font-' + state.font_size);
    }

    // 5. Letter Spacing
    body.classList.remove('a11y-spacing-wide', 'a11y-spacing-extrawide');
    if (state.spacing && state.spacing !== 'normal') {
      body.classList.add('a11y-spacing-' + state.spacing);
    }

    // 6. Line Height
    body.classList.remove('a11y-line-18', 'a11y-line-22');
    if (state.line_height && state.line_height !== 'normal') {
      body.classList.add('a11y-line-' + state.line_height);
    }

    // 7. Text Align
    body.classList.remove('a11y-align-left', 'a11y-align-justify', 'a11y-align-center');
    if (state.text_align && state.text_align !== 'normal') {
      body.classList.add('a11y-align-' + state.text_align);
    }

    // 8. Dyslexic font
    body.classList.toggle('a11y-dyslexic', Boolean(state.dyslexic));

    // 9. Reading Guide Line
    const rLine = document.getElementById('a11y-reading-guide-line');
    if (rLine) rLine.style.display = state.reading_line ? 'block' : 'none';

    // 10. Reading Mask
    const mTop = document.getElementById('a11y-reading-mask-top');
    const mBtm = document.getElementById('a11y-reading-mask-bottom');
    if (mTop && mBtm) {
      mTop.style.display = state.reading_mask ? 'block' : 'none';
      mBtm.style.display = state.reading_mask ? 'block' : 'none';
    }

    updateMenuUI();
    updateBadge();
  }

  function countActiveFeatures() {
    let count = 0;
    if (state.tts_active) count++;
    if (state.contrast !== 'normal') count++;
    if (state.saturation !== 'normal') count++;
    if (state.highlight_links) count++;
    if (state.font_size > 100) count++;
    if (state.spacing !== 'normal') count++;
    if (state.line_height !== 'normal') count++;
    if (state.text_align !== 'normal') count++;
    if (state.dyslexic) count++;
    if (state.reading_line) count++;
    if (state.reading_mask) count++;
    return count;
  }

  function updateBadge() {
    const badge = document.getElementById('a11y-active-count-badge');
    const toggleBtn = document.getElementById('a11y-btn-toggle');
    if (!badge || !toggleBtn) return;
    const count = countActiveFeatures();
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
      toggleBtn.style.borderColor = '#E11D48';
      toggleBtn.style.boxShadow = '0 0 16px rgba(225, 29, 72, 0.6)';
    } else {
      badge.classList.add('hidden');
      toggleBtn.style.borderColor = '#FACC15';
      toggleBtn.style.boxShadow = '';
    }
  }

  // =========================================================================
  // 4. Reset & Hide Functions
  // =========================================================================
  function hideWidget() {
    // 1. Matikan dan hentikan sepenuhnya seluruh Text-to-Speech / Pembaca Suara
    stopSpeech();
    state.tts_active = false;
    state.tts_click_mode = false;
    clearSpeakingHighlights();
    hideTTSIndicator();

    // 2. Sinkronkan kontrol saklar TTS agar dalam posisi MATI (OFF)
    const ttsSwitch = document.getElementById('a11y-tts-switch');
    if (ttsSwitch) ttsSwitch.checked = false;
    const clickSwitch = document.getElementById('a11y-tts-click-mode');
    if (clickSwitch) clickSwitch.checked = false;
    const ttsStatusLabel = document.getElementById('a11y-tts-status-label');
    if (ttsStatusLabel) {
      ttsStatusLabel.textContent = 'MATI (OFF)';
      ttsStatusLabel.className = 'text-[10px] font-bold text-slate-500';
    }

    // 3. Simpan status sembunyikan widget
    state.widget_hidden = true;
    saveState();

    const trigger = document.getElementById('a11y-widget-trigger');
    if (trigger) trigger.classList.add('hidden');

    toggleMenu(false);

    const pill = document.getElementById('a11y-restore-pill');
    if (pill) pill.classList.remove('hidden');

    showA11yToast('Tombol widget dan Pembaca Teks (TTS) berhasil dimatikan & disembunyikan.');
  }

  function showWidget() {
    state.widget_hidden = false;
    saveState();

    const trigger = document.getElementById('a11y-widget-trigger');
    if (trigger) trigger.classList.remove('hidden');

    const pill = document.getElementById('a11y-restore-pill');
    if (pill) pill.classList.add('hidden');

    showA11yToast('Tombol aksesibilitas berhasil dimunculkan kembali.');
  }

  function toggleHideWidget() {
    if (state.widget_hidden) {
      showWidget();
    } else {
      hideWidget();
    }
  }

  function resetAll() {
    stopSpeech();
    state = { ...defaultState };
    state.widget_hidden = false;
    saveState();

    // Ensure trigger button is visible & restore pill is hidden
    const trigger = document.getElementById('a11y-widget-trigger');
    if (trigger) trigger.classList.remove('hidden');

    const pill = document.getElementById('a11y-restore-pill');
    if (pill) pill.classList.add('hidden');

    // Reset button position back to standard bottom-left
    resetTriggerPosition();

    // Apply clean default settings
    applyAllSettings();

    showA11yToast('Seluruh pengaturan aksesibilitas telah direset ke standar normal.');
  }

  // =========================================================================
  // 5. Update Controls in Menu Panel
  // =========================================================================
  function updateMenuUI() {
    // Active features count pill
    const countBadge = document.getElementById('a11y-menu-active-count');
    if (countBadge) {
      const c = countActiveFeatures();
      countBadge.textContent = c > 0 ? `${c} Pengaturan Aktif` : 'Bawaan Normal';
      countBadge.className = c > 0
        ? 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950'
        : 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300';
    }

    // TTS Active Switch
    const ttsToggle = document.getElementById('a11y-tts-switch');
    if (ttsToggle) {
      ttsToggle.checked = Boolean(state.tts_active);
      const label = document.getElementById('a11y-tts-status-label');
      if (label) {
        label.textContent = state.tts_active ? 'AKTIF (ON)' : 'MATI (OFF)';
        label.className = state.tts_active ? 'font-bold text-emerald-800' : 'text-slate-500';
      }
    }

    // TTS Click Mode
    const ttsClickMode = document.getElementById('a11y-tts-click-mode');
    if (ttsClickMode) ttsClickMode.checked = Boolean(state.tts_click_mode);

    // TTS Speed Rate Buttons
    ['0.8', '1.0', '1.2'].forEach(r => {
      const btn = document.getElementById('a11y-rate-' + r.replace('.', ''));
      if (btn) {
        const isMatch = Math.abs(state.tts_rate - parseFloat(r)) < 0.05;
        btn.className = isMatch
          ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm'
          : 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700';
      }
    });

    // Contrast Buttons
    ['normal', 'dark', 'light', 'invert'].forEach(c => {
      const btn = document.getElementById('a11y-contrast-' + c);
      if (btn) {
        const isMatch = state.contrast === c;
        btn.className = isMatch
          ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0B3B24] text-white ring-2 ring-amber-400 shadow-sm flex items-center justify-center gap-1.5'
          : 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5';
      }
    });

    // Saturation Buttons
    ['normal', 'mono', 'low', 'high'].forEach(s => {
      const btn = document.getElementById('a11y-sat-' + s);
      if (btn) {
        const isMatch = state.saturation === s;
        btn.className = isMatch
          ? 'px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#0B3B24] text-white ring-2 ring-amber-400 shadow-sm'
          : 'px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700';
      }
    });

    // Highlight Links Switch
    const hlBtn = document.getElementById('a11y-toggle-links');
    if (hlBtn) {
      hlBtn.className = state.highlight_links
        ? 'w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 flex items-center justify-between shadow-sm border border-amber-500'
        : 'w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-between border border-slate-200';
    }

    // Font Size Buttons
    [100, 115, 130, 150].forEach(f => {
      const btn = document.getElementById('a11y-font-' + f);
      if (btn) {
        const isMatch = state.font_size === f;
        btn.className = isMatch
          ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B3B24] text-white ring-2 ring-amber-400 shadow-sm'
          : 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700';
      }
    });

    // Letter Spacing Buttons
    ['normal', 'wide', 'extrawide'].forEach(sp => {
      const btn = document.getElementById('a11y-spacing-' + sp);
      if (btn) {
        const isMatch = state.spacing === sp;
        btn.className = isMatch
          ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm'
          : 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700';
      }
    });

    // Line Height Buttons
    ['normal', '18', '22'].forEach(lh => {
      const btn = document.getElementById('a11y-line-' + lh);
      if (btn) {
        const isMatch = state.line_height === lh;
        btn.className = isMatch
          ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm'
          : 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700';
      }
    });

    // Text Align Buttons
    ['normal', 'left', 'justify', 'center'].forEach(al => {
      const btn = document.getElementById('a11y-align-' + al);
      if (btn) {
        const isMatch = state.text_align === al;
        btn.className = isMatch
          ? 'p-1.5 rounded-lg text-xs font-bold bg-[#0B3B24] text-white shadow-sm flex items-center justify-center'
          : 'p-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center';
      }
    });

    // Dyslexic Font Button
    const dysBtn = document.getElementById('a11y-toggle-dyslexic');
    if (dysBtn) {
      dysBtn.className = state.dyslexic
        ? 'w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 flex items-center justify-between shadow-sm border border-amber-500'
        : 'w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-between border border-slate-200';
    }

    // Reading Guide Line Button
    const rLineBtn = document.getElementById('a11y-toggle-reading-line');
    if (rLineBtn) {
      rLineBtn.className = state.reading_line
        ? 'w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-800 text-white flex items-center justify-between shadow-sm'
        : 'w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-between border border-slate-200';
    }

    // Reading Mask Button
    const rMaskBtn = document.getElementById('a11y-toggle-reading-mask');
    if (rMaskBtn) {
      rMaskBtn.className = state.reading_mask
        ? 'w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-800 text-white flex items-center justify-between shadow-sm'
        : 'w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-between border border-slate-200';
    }
  }

  // =========================================================================
  // 6. Injected HTML Template (Widget Markup)
  // =========================================================================
  function injectWidgetDOM() {
    if (document.getElementById('a11y-widget-root')) return;

    const root = document.createElement('div');
    root.id = 'a11y-widget-root';
    root.className = 'no-print';

    root.innerHTML = `
      <!-- 1. Garis Bantu Baca (Reading Guide Line) -->
      <div id="a11y-reading-guide-line" aria-hidden="true"></div>

      <!-- 2. Masker Bacaan (Reading Focus Mask) -->
      <div id="a11y-reading-mask-top" aria-hidden="true" style="top: 0; height: 0;"></div>
      <div id="a11y-reading-mask-bottom" aria-hidden="true" style="bottom: 0; height: 0;"></div>

      <!-- 3. Active TTS Speaking Indicator Bar -->
      <div id="a11y-tts-indicator" class="hidden" role="status" aria-live="polite">
        <div class="flex items-center gap-1.5 text-amber-400">
          <span class="a11y-wave-bar"></span>
          <span class="a11y-wave-bar"></span>
          <span class="a11y-wave-bar"></span>
          <span class="a11y-wave-bar"></span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-white text-xs font-bold">Membacakan:</span>
          <span id="a11y-tts-snippet" class="text-amber-200 text-xs italic max-w-xs truncate">Teks...</span>
        </div>
        <button type="button" onclick="window.A11Y.stopSpeech()" class="ml-2 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] rounded-full shadow transition-all flex items-center gap-1">
          <span>⏹ Hentikan</span>
        </button>
      </div>

      <!-- 4. Floating Accessibility Trigger Button (strictly bottom-left by default) -->
      <div id="a11y-widget-trigger" role="region" aria-label="Widget Aksesibilitas Disabilitas">
        <button type="button" id="a11y-btn-toggle" aria-expanded="false" aria-controls="a11y-widget-menu" aria-label="Buka Menu Aksesibilitas Disabilitas (Pojok Kiri Bawah)" title="Aksesibilitas Disabilitas (Pojok Kiri Bawah)">
          <!-- Universal Accessibility Icon -->
          <svg class="w-7 h-7 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="4.5" r="2.5"></circle>
            <path d="M4 8.5h16"></path>
            <path d="M12 8.5V14"></path>
            <path d="m9 20 3-6 3 6"></path>
          </svg>
          <span id="a11y-active-count-badge" class="hidden">0</span>
        </button>
      </div>

      <!-- 5. Restore Pill (Muncul di Pojok Kiri Bawah saat Tombol Utama Dihilangkan) -->
      <div id="a11y-restore-pill" class="hidden" style="position: fixed; bottom: 16px; left: 16px; z-index: 99999;">
        <button type="button" onclick="window.A11Y.showWidget()" class="px-3 py-1.5 bg-slate-900/90 hover:bg-[#0B3B24] text-white text-[11px] font-bold rounded-full shadow-lg border border-amber-400 backdrop-blur flex items-center gap-1.5 hover:scale-105 transition-all" title="Klik untuk memunculkan kembali tombol aksesibilitas (atau tekan Alt + A)">
          <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="4.5" r="2.5"/><path d="M4 8.5h16"/><path d="M12 8.5V14"/><path d="m9 20 3-6 3 6"/></svg>
          <span>Buka Aksesibilitas</span>
        </button>
      </div>

      <!-- 6. Floating Accessibility Menu Panel -->
      <div id="a11y-widget-menu" class="hidden" role="dialog" aria-modal="true" aria-labelledby="a11y-menu-title">
        
        <!-- Header -->
        <div class="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.4">
                <circle cx="12" cy="4.5" r="2.5"></circle>
                <path d="M4 8.5h16"></path>
                <path d="M12 8.5V14"></path>
                <path d="m9 20 3-6 3 6"></path>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 id="a11y-menu-title" class="font-heading font-black text-sm text-white">Menu Aksesibilitas</h2>
                <span id="a11y-menu-active-count" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">Bawaan</span>
              </div>
              <p class="text-[10px] text-slate-400">Penyandang Disabilitas &bull; Ramah Tunanetra</p>
            </div>
          </div>
          
          <div class="flex items-center gap-1.5">
            <!-- Tombol Cepat Hilangkan Widget -->
            <button type="button" onclick="window.A11Y.hideWidget()" class="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 border border-slate-700 transition-all" title="Hilangkan tombol widget dari layar">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <span>Hilangkan</span>
            </button>
            <!-- Tombol Tutup -->
            <button type="button" id="a11y-btn-close" aria-label="Tutup Menu Aksesibilitas" class="text-slate-400 hover:text-white p-1 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Bar Aksi Cepat: RESET & HILANGKAN WIDGET -->
        <div class="px-3.5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 shrink-0">
          <!-- Tombol Reset Seluruh Pengaturan -->
          <button type="button" onclick="window.A11Y.resetAll()" class="flex-1 py-1.5 px-3 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-300 hover:border-red-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all" title="Kembalikan semua kontras, huruf, suara, dan mode baca ke pengaturan normal">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Reset Semua (Normal)</span>
          </button>
          <!-- Tombol Hilangkan Widget -->
          <button type="button" onclick="window.A11Y.hideWidget()" class="py-1.5 px-3 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all" title="Sembunyikan tombol terapung dari layar">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            <span>Hilangkan Widget</span>
          </button>
        </div>

        <!-- Scrollable Body with 4 Main Feature Categories -->
        <div id="a11y-menu-body" class="p-4 space-y-4 overflow-y-auto text-xs bg-white text-slate-800">

          <!-- ===============================================================
               CATEGORY 1: FITUR MEMBACA & SUARA (FOKUS UTAMA UNTUK TUNANETRA)
               =============================================================== -->
          <div class="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-base">🔊</span>
                <span class="font-bold text-slate-900 text-[11px] uppercase tracking-wider">1. Membaca &amp; Suara (TTS)</span>
              </div>
              <span id="a11y-tts-status-label" class="text-[10px] font-bold text-slate-500">MATI (OFF)</span>
            </div>

            <!-- Master Toggle Switch: Responsive Voice -->
            <label class="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer shadow-sm">
              <div class="pr-2">
                <div class="font-bold text-slate-900">Suara Pembaca Teks Otomatis</div>
                <div class="text-[10px] text-slate-500">Membaca teks yang diseleksi (diblok) secara otomatis</div>
              </div>
              <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="a11y-tts-switch" onchange="window.A11Y.toggleTTS(this.checked)" class="sr-only peer">
                <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B3B24]"></div>
              </div>
            </label>

            <!-- Mode Arahkan / Klik untuk Bicara -->
            <label class="flex items-center gap-2 text-slate-700 cursor-pointer px-1">
              <input type="checkbox" id="a11y-tts-click-mode" onchange="window.A11Y.toggleClickToRead(this.checked)" class="rounded text-[#0B3B24] focus:ring-[#0B3B24]">
              <span class="text-[11px]">Mode Klik / Arahkan Kursor untuk Membaca</span>
            </label>

            <!-- Kecepatan Suara -->
            <div class="pt-1">
              <div class="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Kecepatan Bicara:</span>
                <span id="a11y-tts-rate-label" class="text-[10px] font-mono text-slate-500 font-bold">1.0x</span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <button type="button" id="a11y-rate-08" onclick="window.A11Y.setTTSRate(0.8)">Lambat (0.8x)</button>
                <button type="button" id="a11y-rate-10" onclick="window.A11Y.setTTSRate(1.0)">Normal (1.0x)</button>
                <button type="button" id="a11y-rate-12" onclick="window.A11Y.setTTSRate(1.2)">Cepat (1.2x)</button>
              </div>
            </div>

            <!-- Tombol Aksi TTS -->
            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
              <button type="button" onclick="window.A11Y.readEntirePage()" class="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-[#0B3B24] hover:bg-[#072A19] text-white shadow-sm flex items-center justify-center gap-1.5">
                <span>📖 Baca Halaman</span>
              </button>
              <button type="button" onclick="window.A11Y.stopSpeech()" class="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center justify-center gap-1.5">
                <span>⏹ Hentikan Suara</span>
              </button>
            </div>
          </div>

          <!-- ===============================================================
               CATEGORY 2: PENYESUAIAN VISUAL & WARNA
               =============================================================== -->
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div class="flex items-center gap-1.5">
              <span class="text-base">🎨</span>
              <span class="font-bold text-slate-900 text-[11px] uppercase tracking-wider">2. Visual &amp; Warna</span>
            </div>

            <!-- Kontras -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Pilihan Kontras:</label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" id="a11y-contrast-normal" onclick="window.A11Y.setContrast('normal')">
                  <span>Normal</span>
                </button>
                <button type="button" id="a11y-contrast-dark" onclick="window.A11Y.setContrast('dark')">
                  <span class="text-amber-400 font-bold">&#9632;</span>
                  <span>Kontras Gelap</span>
                </button>
                <button type="button" id="a11y-contrast-light" onclick="window.A11Y.setContrast('light')">
                  <span class="text-black font-bold">&#9633;</span>
                  <span>Kontras Terang</span>
                </button>
                <button type="button" id="a11y-contrast-invert" onclick="window.A11Y.setContrast('invert')">
                  <span>Invert (Klise)</span>
                </button>
              </div>
            </div>

            <!-- Kejenuhan (Saturation) -->
            <div class="pt-1">
              <label class="block font-semibold text-slate-700 mb-1.5">Kejenuhan Warna (Saturation):</label>
              <div class="grid grid-cols-4 gap-1.5">
                <button type="button" id="a11y-sat-normal" onclick="window.A11Y.setSaturation('normal')">Normal</button>
                <button type="button" id="a11y-sat-mono" onclick="window.A11Y.setSaturation('mono')">Monokrom</button>
                <button type="button" id="a11y-sat-low" onclick="window.A11Y.setSaturation('low')">Rendah</button>
                <button type="button" id="a11y-sat-high" onclick="window.A11Y.setSaturation('high')">Tinggi</button>
              </div>
            </div>
          </div>

          <!-- ===============================================================
               CATEGORY 3: MODIFIKASI TEKS & TAUTAN
               =============================================================== -->
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div class="flex items-center gap-1.5">
              <span class="text-base">🔤</span>
              <span class="font-bold text-slate-900 text-[11px] uppercase tracking-wider">3. Teks &amp; Tautan</span>
            </div>

            <!-- Solo Tautan (Highlight Links) -->
            <button type="button" id="a11y-toggle-links" onclick="window.A11Y.toggleHighlightLinks()">
              <span>🔗 Sorot Tautan (Solo Links)</span>
              <span class="font-bold text-[10px] uppercase">Toggle</span>
            </button>

            <!-- Kustomisasi Teks: Ukuran Font -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-semibold text-slate-700">Ukuran Huruf (Font Size):</span>
                <span id="a11y-font-size-label" class="text-[10px] font-mono text-slate-500 font-bold">100%</span>
              </div>
              <div class="grid grid-cols-4 gap-1.5">
                <button type="button" id="a11y-font-100" onclick="window.A11Y.setFontSize(100)">100%</button>
                <button type="button" id="a11y-font-115" onclick="window.A11Y.setFontSize(115)">A+ (115%)</button>
                <button type="button" id="a11y-font-130" onclick="window.A11Y.setFontSize(130)">A++ (130%)</button>
                <button type="button" id="a11y-font-150" onclick="window.A11Y.setFontSize(150)">A+++ (150%)</button>
              </div>
            </div>

            <!-- Spasi Huruf -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Jarak Spasi Huruf:</label>
              <div class="grid grid-cols-3 gap-1.5">
                <button type="button" id="a11y-spacing-normal" onclick="window.A11Y.setSpacing('normal')">Normal</button>
                <button type="button" id="a11y-spacing-wide" onclick="window.A11Y.setSpacing('wide')">Lebar</button>
                <button type="button" id="a11y-spacing-extrawide" onclick="window.A11Y.setSpacing('extrawide')">Sangat Lebar</button>
              </div>
            </div>

            <!-- Tinggi Baris (Line Height) -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Tinggi Baris Kalimat:</label>
              <div class="grid grid-cols-3 gap-1.5">
                <button type="button" id="a11y-line-normal" onclick="window.A11Y.setLineHeight('normal')">Normal</button>
                <button type="button" id="a11y-line-18" onclick="window.A11Y.setLineHeight('18')">1.8x</button>
                <button type="button" id="a11y-line-22" onclick="window.A11Y.setLineHeight('22')">2.2x</button>
              </div>
            </div>

            <!-- Perataan Teks -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Perataan Teks (Alignment):</label>
              <div class="grid grid-cols-4 gap-1.5">
                <button type="button" id="a11y-align-normal" onclick="window.A11Y.setTextAlign('normal')">Bawaan</button>
                <button type="button" id="a11y-align-left" onclick="window.A11Y.setTextAlign('left')">Kiri</button>
                <button type="button" id="a11y-align-justify" onclick="window.A11Y.setTextAlign('justify')">Rata</button>
                <button type="button" id="a11y-align-center" onclick="window.A11Y.setTextAlign('center')">Tengah</button>
              </div>
            </div>

            <!-- Font Ramah Disleksia -->
            <button type="button" id="a11y-toggle-dyslexic" onclick="window.A11Y.toggleDyslexic()">
              <span class="flex items-center gap-1.5">
                <span class="font-bold">Aa</span>
                <span>Font Ramah Disleksia</span>
              </span>
              <span class="font-bold text-[10px] uppercase">Toggle</span>
            </button>
          </div>

          <!-- ===============================================================
               CATEGORY 4: NAVIGASI, TOGGLE HILANGKAN & RESET PENGATURAN
               =============================================================== -->
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div class="flex items-center gap-1.5">
              <span class="text-base">🧭</span>
              <span class="font-bold text-slate-900 text-[11px] uppercase tracking-wider">4. Navigasi &amp; Kontrol Widget</span>
            </div>

            <!-- Garis Bantu Baca -->
            <button type="button" id="a11y-toggle-reading-line" onclick="window.A11Y.toggleReadingLine()">
              <span class="flex items-center gap-1.5">
                <span>📏</span>
                <span>Garis Bantu Baca (Mengikuti Kursor)</span>
              </span>
              <span class="font-bold text-[10px] uppercase">Toggle</span>
            </button>

            <!-- Masker Bacaan -->
            <button type="button" id="a11y-toggle-reading-mask" onclick="window.A11Y.toggleReadingMask()">
              <span class="flex items-center gap-1.5">
                <span>🎭</span>
                <span>Masker Bacaan (Fokus Baris)</span>
              </span>
              <span class="font-bold text-[10px] uppercase">Toggle</span>
            </button>

            <!-- KOTAK KONTROL HILANGKAN & RESET WIDGET -->
            <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm">
              <!-- Hilangkan Tombol Widget -->
              <div class="flex items-center justify-between gap-2">
                <div>
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <span>Hilangkan Tombol Widget</span>
                  </div>
                  <div class="text-[10px] text-slate-500">Sembunyikan tombol mengapung jika mengganggu layar. Tekan Alt + A untuk memunculkannya kembali.</div>
                </div>
                <button type="button" onclick="window.A11Y.hideWidget()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs whitespace-nowrap transition-all shadow-sm">
                  Hilangkan
                </button>
              </div>

              <!-- Reset Seluruh Pengaturan -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    <span>Reset Semua Pengaturan</span>
                  </div>
                  <div class="text-[10px] text-slate-500">Kembalikan warna, suara, huruf, dan posisi ke standar normal.</div>
                </div>
                <button type="button" onclick="window.A11Y.resetAll()" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 font-bold rounded-lg text-xs whitespace-nowrap transition-all shadow-sm">
                  Reset Normal
                </button>
              </div>
            </div>

            <!-- Reset Posisi Tombol Drag & Drop -->
            <div class="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Posisi Tombol: <strong>Pojok Kiri Bawah</strong></span>
              <button type="button" onclick="window.A11Y.resetTriggerPosition()" class="text-emerald-800 font-bold hover:underline">
                Reset Posisi
              </button>
            </div>
            <p class="text-[10px] text-slate-400 leading-tight">
              Tips: Anda dapat menggeser (drag &amp; drop) tombol lingkaran aksesibilitas ke posisi mana saja yang nyaman di layar.
            </p>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button type="button" onclick="window.A11Y.resetAll()" class="px-3 py-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Reset Normal</span>
          </button>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.A11Y.hideWidget()" class="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <span>Hilangkan</span>
            </button>
            <button type="button" onclick="window.A11Y.toggleMenu(false)" class="px-4 py-2 bg-[#0B3B24] hover:bg-[#072A19] text-white rounded-xl font-bold text-xs shadow-sm transition-all">
              Tutup
            </button>
          </div>
        </div>

      </div>

      <!-- 7. Notifikasi Toast Aksesibilitas -->
      <div id="a11y-toast" class="hidden" role="status" aria-live="polite">
        <span id="a11y-toast-text">Notifikasi</span>
      </div>
    `;

    document.body.appendChild(root);

    // Bind event listeners
    bindDOMEvents();
    restoreTriggerPosition();
  }

  // =========================================================================
  // 7. Drag & Drop Engine for Floating Trigger Button
  // =========================================================================
  function setupDragAndDrop() {
    const trigger = document.getElementById('a11y-widget-trigger');
    const toggleBtn = document.getElementById('a11y-btn-toggle');
    if (!trigger || !toggleBtn) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    let dragThresholdPassed = false;

    function onPointerDown(e) {
      if (e.button && e.button !== 0) return; // only left click
      isDragging = true;
      dragThresholdPassed = false;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);

      const rect = trigger.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;

      trigger.classList.add('is-dragging');
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const curX = e.clientX || (e.touches && e.touches[0].clientX);
      const curY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = curX - startX;
      const deltaY = curY - startY;

      if (!dragThresholdPassed && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
        dragThresholdPassed = true;
      }

      if (dragThresholdPassed) {
        let newLeft = origLeft + deltaX;
        let newTop = origTop + deltaY;

        // Boundaries
        const maxX = window.innerWidth - 65;
        const maxY = window.innerHeight - 65;
        newLeft = Math.max(10, Math.min(maxX, newLeft));
        newTop = Math.max(10, Math.min(maxY, newTop));

        trigger.style.left = newLeft + 'px';
        trigger.style.top = newTop + 'px';
        trigger.style.bottom = 'auto';
        trigger.style.right = 'auto';

        // Reposition menu near trigger
        repositionMenu(newLeft, newTop);
      }
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      trigger.classList.remove('is-dragging');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      if (dragThresholdPassed) {
        // Save position
        const rect = trigger.getBoundingClientRect();
        let targetLeft = rect.left;
        let targetTop = rect.top;

        // On mobile (< 768px), snap to nearest edge
        if (window.innerWidth < 768) {
          if (targetLeft < window.innerWidth / 2) {
            targetLeft = 14;
          } else {
            targetLeft = window.innerWidth - 56;
          }
          trigger.style.left = targetLeft + 'px';
        }

        try {
          localStorage.setItem(POS_STORAGE_KEY, JSON.stringify({ left: targetLeft, top: targetTop }));
        } catch (err) {}
      } else {
        // Simple click -> Toggle Menu
        toggleMenu();
      }
    }

    trigger.addEventListener('pointerdown', onPointerDown);
  }

  function repositionMenu(triggerLeft, triggerTop) {
    const menu = document.getElementById('a11y-widget-menu');
    if (!menu) return;

    if (window.innerWidth < 768) {
      menu.style.left = '12px';
      menu.style.right = '12px';
      menu.style.width = 'auto';
      menu.style.maxWidth = '420px';
      menu.style.margin = '0 auto';
      menu.style.bottom = '76px';
      menu.style.top = 'auto';
      menu.style.maxHeight = 'calc(100vh - 96px)';
      menu.style.borderRadius = '20px';
      return;
    }

    const menuW = 380;
    const menuH = Math.min(window.innerHeight - 100, 600);

    let mLeft = triggerLeft;
    let mTop = triggerTop - menuH - 12;

    // Flip horizontally if out of bounds
    if (mLeft + menuW > window.innerWidth - 10) {
      mLeft = window.innerWidth - menuW - 16;
    }
    mLeft = Math.max(10, mLeft);

    // Flip vertically if out of bounds
    if (mTop < 10) {
      mTop = triggerTop + 65;
      if (mTop + menuH > window.innerHeight) {
        mTop = Math.max(10, window.innerHeight - menuH - 10);
      }
    }

    menu.style.left = mLeft + 'px';
    menu.style.top = mTop + 'px';
    menu.style.bottom = 'auto';
    menu.style.right = 'auto';
    menu.style.width = '380px';
    menu.style.maxWidth = '';
    menu.style.margin = '';
  }

  function restoreTriggerPosition() {
    const trigger = document.getElementById('a11y-widget-trigger');
    if (!trigger) return;
    try {
      const saved = localStorage.getItem(POS_STORAGE_KEY);
      if (saved) {
        const pos = JSON.parse(saved);
        if (typeof pos.left === 'number' && typeof pos.top === 'number') {
          // Boundary check
          if (pos.left < window.innerWidth - 60 && pos.top < window.innerHeight - 60) {
            trigger.style.left = pos.left + 'px';
            trigger.style.top = pos.top + 'px';
            trigger.style.bottom = 'auto';
            trigger.style.right = 'auto';
            return;
          }
        }
      }
    } catch (e) {}

    // Default: Strictly bottom-left (clear inline styles so responsive CSS
    // can lift the trigger above the mobile bottom dock on small screens)
    trigger.style.left = '';
    trigger.style.bottom = '';
    trigger.style.top = '';
    trigger.style.right = '';
  }

  function resetTriggerPosition() {
    try {
      localStorage.removeItem(POS_STORAGE_KEY);
    } catch (e) {}
    restoreTriggerPosition();
    const menu = document.getElementById('a11y-widget-menu');
    if (menu) {
      menu.style.left = '';
      menu.style.bottom = '';
      menu.style.top = '';
      menu.style.right = '';
    }
  }

  // =========================================================================
  // 8. Toggle Menu Dialog
  // =========================================================================
  function toggleMenu(forceOpen) {
    const menu = document.getElementById('a11y-widget-menu');
    const toggleBtn = document.getElementById('a11y-btn-toggle');
    if (!menu) return;

    let backdrop = document.getElementById('a11y-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'a11y-backdrop';
      backdrop.className = 'fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[99995] hidden transition-opacity';
      backdrop.onclick = () => toggleMenu(false);
      document.body.appendChild(backdrop);
    }

    const isOpen = !menu.classList.contains('hidden');
    const targetState = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;

    if (targetState) {
      menu.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      updateMenuUI();

      // Ensure proper positioning
      const trigger = document.getElementById('a11y-widget-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        repositionMenu(rect.left, rect.top);
      }
    } else {
      menu.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // =========================================================================
  // 9. Event Binding
  // =========================================================================
  function bindDOMEvents() {
    // Close button
    const closeBtn = document.getElementById('a11y-btn-close');
    if (closeBtn) closeBtn.onclick = () => toggleMenu(false);

    // Escape key closes menu & stops speech; Alt + A toggles widget
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        stopSpeech();
        toggleMenu(false);
      }
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (state.widget_hidden) {
          showWidget();
          toggleMenu(true);
        } else {
          const menu = document.getElementById('a11y-widget-menu');
          if (menu && !menu.classList.contains('hidden')) {
            toggleMenu(false);
          } else {
            toggleMenu(true);
          }
        }
      }
    });

    // Close when clicking outside menu
    document.addEventListener('click', e => {
      const menu = document.getElementById('a11y-widget-menu');
      const trigger = document.getElementById('a11y-widget-trigger');
      const pill = document.getElementById('a11y-restore-pill');
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && !trigger.contains(e.target) && (!pill || !pill.contains(e.target))) {
          toggleMenu(false);
        }
      }
    });

    // Reading guide line & mask follow mouse movement
    document.addEventListener('mousemove', updateReadingAids);
    document.addEventListener('touchmove', e => {
      if (e.touches && e.touches[0]) updateReadingAids(e.touches[0]);
    }, { passive: true });

    // Text selection auto-reading for low-vision & blind users
    document.addEventListener('mouseup', handleUserSelection);
    document.addEventListener('touchend', handleUserSelection);
    document.addEventListener('keyup', handleUserSelection);

    // Click to read
    document.addEventListener('click', handleDocumentClickToRead);

    // Setup drag and drop on trigger
    setupDragAndDrop();
  }

  // =========================================================================
  // 10. Public API Exposed to Window
  // =========================================================================
  window.A11Y = {
    toggleMenu,
    speakText,
    stopSpeech,
    readEntirePage,
    hideWidget,
    showWidget,
    toggleHideWidget,
    resetAll,

    toggleTTS: function (checked) {
      state.tts_active = Boolean(checked);
      saveState();
      updateMenuUI();
      if (state.tts_active) {
        speakText('Suara pembaca teks aktif. Silakan pilih atau blok teks apa saja di layar untuk mendengarkannya.');
      } else {
        stopSpeech();
      }
    },

    toggleClickToRead: function (checked) {
      state.tts_click_mode = Boolean(checked);
      saveState();
      updateMenuUI();
      if (state.tts_click_mode && !state.tts_active) {
        window.A11Y.toggleTTS(true);
      }
    },

    setTTSRate: function (rate) {
      state.tts_rate = rate;
      saveState();
      updateMenuUI();
      const label = document.getElementById('a11y-tts-rate-label');
      if (label) label.textContent = rate + 'x';
      speakText('Kecepatan suara diatur ke ' + rate + ' kali.', rate);
    },

    setContrast: function (mode) {
      state.contrast = mode;
      saveState();
      applyAllSettings();
    },

    setSaturation: function (mode) {
      state.saturation = mode;
      saveState();
      applyAllSettings();
    },

    toggleHighlightLinks: function () {
      state.highlight_links = !state.highlight_links;
      saveState();
      applyAllSettings();
    },

    setFontSize: function (size) {
      state.font_size = size;
      saveState();
      applyAllSettings();
      const label = document.getElementById('a11y-font-size-label');
      if (label) label.textContent = size + '%';
    },

    setSpacing: function (sp) {
      state.spacing = sp;
      saveState();
      applyAllSettings();
    },

    setLineHeight: function (lh) {
      state.line_height = lh;
      saveState();
      applyAllSettings();
    },

    setTextAlign: function (align) {
      state.text_align = align;
      saveState();
      applyAllSettings();
    },

    toggleDyslexic: function () {
      state.dyslexic = !state.dyslexic;
      saveState();
      applyAllSettings();
    },

    toggleReadingLine: function () {
      state.reading_line = !state.reading_line;
      saveState();
      applyAllSettings();
    },

    toggleReadingMask: function () {
      state.reading_mask = !state.reading_mask;
      saveState();
      applyAllSettings();
    },

    resetTriggerPosition: function () {
      resetTriggerPosition();
      showA11yToast('Posisi tombol dikembalikan ke pojok kiri bawah.');
    },

    getState: function () {
      return { ...state };
    }
  };

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectWidgetDOM();
      applyAllSettings();
    });
  } else {
    injectWidgetDOM();
    applyAllSettings();
  }

})();
