/* ============================================
   null testament — privacy shield module
   tab cloaking, panic button, extension
   detection, history spoofing, settings ui
   ============================================ */
(function () {
  'use strict';

  window.NT = window.NT || {};
  var NT = window.NT;
  NT.privacy = NT.privacy || {};

  // ── dom helpers ───────────────────────────────────────────────────
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class')     e.className = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k === 'text') e.textContent = attrs[k];
        else if (k === 'style') e.style.cssText = attrs[k];
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      });
    }
    if (kids) {
      if (typeof kids === 'string') e.innerHTML = kids;
      else if (Array.isArray(kids)) kids.forEach(function (c) { if (c) e.appendChild(c); });
    }
    return e;
  }

  function toast(msg) {
    if (NT.toast) { NT.toast(msg); return; }
    /* fallback if NT.toast is not available */
    var container = document.getElementById('toast-container');
    if (!container) {
      container = el('div', { id: 'toast-container', style: 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;' });
      document.body.appendChild(container);
    }
    var t = el('div', {
      text: msg,
      style: 'background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:10px 16px;font-size:0.8rem;color:#f0f0f0;box-shadow:0 8px 24px rgba(0,0,0,0.5);animation:toastIn 0.3s ease;'
    });
    container.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
  }

  // ── cloak presets ─────────────────────────────────────────────────
  var CLOAK_PRESETS = {
    'google-docs': {
      title: 'Google Docs',
      favicon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
    },
    'google-classroom': {
      title: 'Google Classroom',
      favicon: 'https://ssl.gstatic.com/classroom/favicon.png'
    },
    'canvas': {
      title: 'Dashboard',
      favicon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
    },
    'khan-academy': {
      title: 'Khan Academy',
      favicon: 'https://cdn.kastatic.org/images/favicon.ico?logo'
    },
    'custom': {
      title: '',
      favicon: ''
    }
  };

  // ── tab cloaking ──────────────────────────────────────────────────
  function getOrCreateFaviconLink() {
    var link = $('link[rel="icon"]') || $('link[rel="shortcut icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    return link;
  }

  function loadCloakState() {
    try {
      return JSON.parse(localStorage.getItem('nt-cloak') || 'null');
    } catch (_) {
      return null;
    }
  }

  function saveCloakState(state) {
    if (state) {
      localStorage.setItem('nt-cloak', JSON.stringify(state));
    } else {
      localStorage.removeItem('nt-cloak');
    }
  }

  NT.privacy.applyCloak = function (presetId) {
    var preset = CLOAK_PRESETS[presetId];
    if (!preset) return;

    var state;
    if (presetId === 'custom') {
      var saved = loadCloakState();
      var customTitle = (saved && saved.preset === 'custom' && saved.customTitle) ? saved.customTitle : 'My Document';
      var customFavicon = (saved && saved.preset === 'custom' && saved.customFavicon) ? saved.customFavicon : '';
      state = { preset: 'custom', customTitle: customTitle, customFavicon: customFavicon };
      document.title = customTitle;
      if (customFavicon) getOrCreateFaviconLink().href = customFavicon;
    } else {
      state = { preset: presetId };
      document.title = preset.title;
      getOrCreateFaviconLink().href = preset.favicon;
    }

    saveCloakState(state);
  };

  NT.privacy.applyCustomCloak = function (title, faviconUrl) {
    var state = { preset: 'custom', customTitle: title || 'My Document', customFavicon: faviconUrl || '' };
    document.title = state.customTitle;
    if (state.customFavicon) getOrCreateFaviconLink().href = state.customFavicon;
    saveCloakState(state);
  };

  NT.privacy.removeCloak = function () {
    saveCloakState(null);
    document.title = 'null testament';
    getOrCreateFaviconLink().href = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">\u2205</text></svg>'
    );
  };

  NT.privacy.restoreCloak = function () {
    var saved = loadCloakState();
    if (!saved || !saved.preset) return;
    if (saved.preset === 'custom') {
      document.title = saved.customTitle || 'My Document';
      if (saved.customFavicon) getOrCreateFaviconLink().href = saved.customFavicon;
    } else {
      var p = CLOAK_PRESETS[saved.preset];
      if (p) {
        document.title = p.title;
        getOrCreateFaviconLink().href = p.favicon;
      }
    }
  };

  // restore on load
  NT.privacy.restoreCloak();

  // ── panic button ──────────────────────────────────────────────────
  var FAKE_GDOCS_HTML = [
    '<style>',
    '  * { margin:0; padding:0; box-sizing:border-box; cursor:default !important; }',
    '  body { font-family: "Google Sans", "Product Sans", Arial, sans-serif; background:#fff; color:#202124; overflow:hidden; }',
    '  .gdocs-topbar { display:flex; align-items:center; height:48px; padding:0 12px; background:#fff; border-bottom:1px solid #dadce0; }',
    '  .gdocs-icon { width:24px; height:24px; margin-right:10px; }',
    '  .gdocs-icon svg { width:100%; height:100%; }',
    '  .gdocs-title { font-size:18px; font-weight:400; color:#202124; outline:none; border:none; background:none; padding:4px 6px; margin-right:16px; flex-shrink:0; }',
    '  .gdocs-star { width:20px; height:20px; color:#5f6368; margin-right:8px; opacity:0.6; }',
    '  .gdocs-star svg { width:100%; height:100%; }',
    '  .gdocs-folder { width:20px; height:20px; color:#5f6368; margin-right:16px; opacity:0.6; }',
    '  .gdocs-folder svg { width:100%; height:100%; }',
    '  .gdocs-menubar { display:flex; align-items:center; height:28px; padding:0 14px; background:#fff; gap:2px; }',
    '  .gdocs-menu-item { font-size:13px; color:#202124; padding:4px 8px; border-radius:4px; letter-spacing:0.1px; }',
    '  .gdocs-menu-item:hover { background:#e8eaed; }',
    '  .gdocs-toolbar { display:flex; align-items:center; height:40px; padding:0 14px; background:#edf2fa; border-radius:0 0 0 0; margin:0; gap:4px; flex-wrap:nowrap; overflow:hidden; border-bottom:1px solid #dadce0; }',
    '  .gdocs-tool-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; color:#444746; flex-shrink:0; }',
    '  .gdocs-tool-btn:hover { background:#d3d3d3; }',
    '  .gdocs-tool-btn svg { width:18px; height:18px; }',
    '  .gdocs-tool-sep { width:1px; height:20px; background:#c4c7c5; margin:0 4px; flex-shrink:0; }',
    '  .gdocs-tool-select { font-size:12px; color:#202124; padding:3px 8px; border:1px solid transparent; border-radius:4px; background:none; height:28px; display:flex; align-items:center; gap:4px; flex-shrink:0; }',
    '  .gdocs-tool-select:hover { border-color:#c4c7c5; background:#fff; }',
    '  .gdocs-tool-select svg { width:12px; height:12px; color:#444746; }',
    '  .gdocs-share-area { margin-left:auto; display:flex; align-items:center; gap:8px; }',
    '  .gdocs-share-btn { background:#1a73e8; color:#fff; border:none; border-radius:24px; padding:8px 22px; font-size:14px; font-weight:500; letter-spacing:0.25px; }',
    '  .gdocs-avatar { width:32px; height:32px; border-radius:50%; background:#1a73e8; color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:500; }',
    '  .gdocs-page-area { display:flex; justify-content:center; padding-top:20px; background:#f8f9fa; min-height:calc(100vh - 120px); }',
    '  .gdocs-page { width:816px; min-height:1056px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06); padding:96px 72px; }',
    '  .gdocs-page .cursor-line { border-left:2px solid #000; height:18px; animation:blink 1s step-end infinite; display:inline-block; vertical-align:text-bottom; }',
    '  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }',
    '</style>',
    '<div class="gdocs-topbar">',
    '  <div class="gdocs-icon"><svg viewBox="0 0 24 24"><path fill="#4285F4" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"/><path fill="#F1F1F1" d="M14 2l6 6h-6V2z"/><path fill="#fff" opacity=".5" d="M14 2v6h6L14 2z"/><path fill="#F1F1F1" d="M8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z"/></svg></div>',
    '  <span class="gdocs-title">Untitled document</span>',
    '  <div class="gdocs-star"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>',
    '  <div class="gdocs-folder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg></div>',
    '  <div class="gdocs-share-area">',
    '    <button class="gdocs-share-btn">Share</button>',
    '    <div class="gdocs-avatar">U</div>',
    '  </div>',
    '</div>',
    '<div class="gdocs-menubar">',
    '  <div class="gdocs-menu-item">File</div>',
    '  <div class="gdocs-menu-item">Edit</div>',
    '  <div class="gdocs-menu-item">View</div>',
    '  <div class="gdocs-menu-item">Insert</div>',
    '  <div class="gdocs-menu-item">Format</div>',
    '  <div class="gdocs-menu-item">Tools</div>',
    '  <div class="gdocs-menu-item">Extensions</div>',
    '  <div class="gdocs-menu-item">Help</div>',
    '</div>',
    '<div class="gdocs-toolbar">',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.95 7.95 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg></div>',
    '  <div class="gdocs-tool-sep"></div>',
    '  <div class="gdocs-tool-select">100% <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z"/></svg></div>',
    '  <div class="gdocs-tool-sep"></div>',
    '  <div class="gdocs-tool-select">Normal text <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z"/></svg></div>',
    '  <div class="gdocs-tool-sep"></div>',
    '  <div class="gdocs-tool-select">Arial <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z"/></svg></div>',
    '  <div class="gdocs-tool-sep"></div>',
    '  <div class="gdocs-tool-select">11 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z"/></svg></div>',
    '  <div class="gdocs-tool-sep"></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/></svg></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15a1.49 1.49 0 000 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5zM2 20h20v4H2v-4z"/></svg></div>',
    '  <div class="gdocs-tool-sep"></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg></div>',
    '  <div class="gdocs-tool-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/></svg></div>',
    '</div>',
    '<div class="gdocs-page-area">',
    '  <div class="gdocs-page"><span class="cursor-line"></span></div>',
    '</div>'
  ].join('\n');

  function getPanicKey() {
    return localStorage.getItem('nt-panic-key') || '`';
  }

  function setPanicKey(key) {
    localStorage.setItem('nt-panic-key', key);
    rebindPanicKey();
  }

  var panicBound = false;
  var currentPanicHandler = null;

  function rebindPanicKey() {
    if (currentPanicHandler) {
      document.removeEventListener('keydown', currentPanicHandler);
    }
    var key = getPanicKey();
    currentPanicHandler = function (e) {
      if (e.key === key) {
        e.preventDefault();
        e.stopPropagation();
        NT.privacy.triggerPanic();
      }
    };
    document.addEventListener('keydown', currentPanicHandler);
    panicBound = true;
  }

  NT.privacy.triggerPanic = function () {
    /* stop the extension monitor so it does not fire after panic */
    NT.privacy.stopMonitor();

    /* replace everything */
    document.body.innerHTML = FAKE_GDOCS_HTML;

    /* clobber the URL */
    try {
      history.replaceState(null, '', '/');
    } catch (_) { /* sandboxed iframe, ignore */ }

    /* title + favicon */
    document.title = 'Untitled document - Google Docs';
    getOrCreateFaviconLink().href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';

    /* strip dark-theme styles that would bleed through */
    $$('link[rel="stylesheet"]').forEach(function (l) { l.disabled = true; });
    $$('style').forEach(function (s) {
      /* keep only the inline style we just injected */
      if (s.parentNode !== document.body && s.parentNode !== document.head) return;
      if (s.textContent.indexOf('gdocs-topbar') === -1) s.disabled = true;
    });
  };

  /* bind on load */
  rebindPanicKey();

  // ── anti-extension detection ──────────────────────────────────────
  NT.privacy.detectExtensions = function () {
    var threats = [];

    /* GoGuardian */
    var ggIframes = $$('iframe').filter(function (f) {
      return (f.src && f.src.toLowerCase().indexOf('goguardian') !== -1);
    });
    var ggAttrs = $$('[data-goguardian]');
    if (ggIframes.length || ggAttrs.length) {
      threats.push('GoGuardian');
    }

    /* Securly */
    var securlyHeader = $('#securly-header');
    var securlyClasses = $$('[class*="securly"]');
    if (securlyHeader || securlyClasses.length) {
      threats.push('Securly');
    }

    /* Cisco Umbrella / OpenDNS */
    var openDns = $$('[class*="opendns"]');
    var umbrella = $$('[class*="umbrella"]');
    if (openDns.length || umbrella.length) {
      threats.push('Cisco Umbrella / OpenDNS');
    }

    /* Lightspeed */
    var relayEl = $$('relay-element');
    var lightspeedCls = $$('[class*="lightspeed"]');
    if (relayEl.length || lightspeedCls.length) {
      threats.push('Lightspeed');
    }

    /* unknown injected iframes from non-local origins */
    var allIframes = $$('iframe');
    var localOrigins = [
      window.location.origin,
      'about:blank',
      'about:srcdoc',
      ''
    ];
    allIframes.forEach(function (f) {
      var src = (f.src || '').toLowerCase();
      /* skip already-flagged */
      if (src.indexOf('goguardian') !== -1) return;
      if (!src || localOrigins.indexOf(src) !== -1) return;
      try {
        var u = new URL(src, window.location.href);
        if (u.origin === window.location.origin) return;
      } catch (_) { return; }
      var label = 'Unknown iframe: ' + src.slice(0, 60);
      if (threats.indexOf(label) === -1) threats.push(label);
    });

    return threats;
  };

  var monitorInterval = null;

  NT.privacy.startMonitor = function () {
    if (monitorInterval) return;
    monitorInterval = setInterval(function () {
      var threats = NT.privacy.detectExtensions();
      if (threats.length) {
        toast('shield alert: detected ' + threats.join(', '));
      }
    }, 5000);
    localStorage.setItem('nt-monitor', '1');
  };

  NT.privacy.stopMonitor = function () {
    if (monitorInterval) {
      clearInterval(monitorInterval);
      monitorInterval = null;
    }
    localStorage.setItem('nt-monitor', '0');
  };

  /* restore monitor state */
  if (localStorage.getItem('nt-monitor') === '1') {
    NT.privacy.startMonitor();
  }

  // ── history spoofing ──────────────────────────────────────────────
  var SPOOF_URLS = [
    { path: '/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit', title: 'Chapter 5 Notes - Google Docs' },
    { path: '/document/d/2xYzAbCdEfGhIjKlMnOpQrStUv/edit', title: 'Research Paper Draft - Google Docs' },
    { path: '/presentation/d/3pQrStUvWxYzAbCdEfGhIjKlMn/edit', title: 'History Presentation - Google Slides' },
    { path: '/spreadsheets/d/4eFgHiJkLmNoPqRsTuVwXyZaBcD/edit', title: 'Grade Tracker - Google Sheets' },
    { path: '/u/0/c/MTIzNDU2Nzg5/a/MjM0NTY3ODkw/details', title: 'English 3 - Google Classroom' },
    { path: '/u/0/c/OTg3NjU0MzIx/a/NTQzMjEwOTg3/details', title: 'AP Biology - Google Classroom' },
    { path: '/math/algebra2/x11-polynomial-functions', title: 'Polynomial functions | Algebra 2 | Khan Academy' },
    { path: '/science/ap-biology/gene-expression-and-regulation', title: 'Gene expression | AP Biology | Khan Academy' },
    { path: '/567234891/chemistry-chapter-8-flash-cards/', title: 'Chemistry Chapter 8 Flashcards | Quizlet' },
    { path: '/234891567/ap-us-history-unit-5/', title: 'AP US History Unit 5 Flashcards | Quizlet' },
    { path: '/courses/12345/assignments/67890', title: 'Assignment: Essay Draft - Canvas' },
    { path: '/courses/54321/quizzes/98765', title: 'Quiz: Unit 4 Review - Canvas' }
  ];

  var spoofActive = localStorage.getItem('nt-history-spoof') === '1';

  NT.privacy.spoofHistory = function () {
    if (spoofActive) return; /* already on */
    spoofActive = true;
    localStorage.setItem('nt-history-spoof', '1');

    var originalPath = window.location.pathname;
    var originalTitle = document.title;

    SPOOF_URLS.forEach(function (entry) {
      try {
        history.pushState({ spoofed: true }, entry.title, entry.path);
      } catch (_) { /* ignore cross-origin security blocks */ }
    });

    /* restore real location */
    try {
      history.pushState(null, originalTitle, originalPath);
    } catch (_) { /* ignore */ }
  };

  NT.privacy.disableSpoofHistory = function () {
    spoofActive = false;
    localStorage.setItem('nt-history-spoof', '0');
  };

  NT.privacy.isSpoofActive = function () {
    return spoofActive;
  };

  /* auto-spoof if enabled */
  if (spoofActive) {
    NT.privacy.spoofHistory();
  }

  // ── privacy settings page renderer ────────────────────────────────
  NT.privacy.renderPage = function (container) {
    container.innerHTML = '';

    /* ── shield status summary ─────────────────────────────────── */
    var cloakState = loadCloakState();
    var cloakOn = !!cloakState;
    var monitorOn = !!monitorInterval;
    var spoofOn = spoofActive;
    var threats = NT.privacy.detectExtensions();

    var statusColor = threats.length ? '#ef4444' : '#d4d4d4';
    var statusLabel = threats.length
      ? threats.length + ' threat' + (threats.length > 1 ? 's' : '') + ' detected'
      : 'no threats detected';

    var header = el('div', { class: 'page-header' }, [
      el('h2', { text: 'privacy shield' }),
      el('p', { class: 'page-desc', text: 'protect your session from monitoring software' })
    ]);
    container.appendChild(header);

    /* status card */
    var statusCard = el('div', {
      class: 'action-card',
      style: 'margin-bottom:24px;display:flex;align-items:center;gap:16px;padding:20px;'
    }, [
      el('div', {
        style: 'width:48px;height:48px;border-radius:50%;background:' + statusColor + '22;display:flex;align-items:center;justify-content:center;flex-shrink:0;',
        html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + statusColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
      }),
      el('div', { style: 'flex:1;' }, [
        el('div', {
          style: 'font-size:1rem;font-weight:600;color:' + statusColor + ';margin-bottom:4px;',
          text: 'shield status'
        }),
        el('div', {
          style: 'font-size:0.78rem;color:#999;',
          text: statusLabel
              + '  \u2022  cloak: ' + (cloakOn ? 'on' : 'off')
              + '  \u2022  monitor: ' + (monitorOn ? 'on' : 'off')
              + '  \u2022  history spoof: ' + (spoofOn ? 'on' : 'off')
        })
      ])
    ]);
    container.appendChild(statusCard);

    /* ── settings list wrapper ─────────────────────────────────── */
    var list = el('div', { class: 'settings-list' });
    container.appendChild(list);

    /* ── 1. cloak preset selector ──────────────────────────────── */
    var activePreset = cloakState ? cloakState.preset : '';
    var presetSelect = el('select', { class: 'input-field', style: 'max-width:260px;' });
    var presetOptions = [
      { value: '',                label: 'off (no cloak)' },
      { value: 'google-docs',    label: 'Google Docs' },
      { value: 'google-classroom', label: 'Google Classroom' },
      { value: 'canvas',         label: 'Canvas LMS' },
      { value: 'khan-academy',   label: 'Khan Academy' },
      { value: 'custom',         label: 'custom...' }
    ];
    presetOptions.forEach(function (o) {
      var opt = el('option', { value: o.value, text: o.label });
      if (o.value === activePreset) opt.selected = true;
      presetSelect.appendChild(opt);
    });

    var cloakItem = el('div', { class: 'setting-item' }, [
      el('div', { class: 'setting-info' }, [
        el('span', { class: 'setting-name', text: 'tab cloak' }),
        el('span', { class: 'setting-desc', text: 'disguise the browser tab as a school app' })
      ]),
      presetSelect
    ]);
    list.appendChild(cloakItem);

    /* ── 2. custom cloak fields ────────────────────────────────── */
    var customTitle = (cloakState && cloakState.preset === 'custom' && cloakState.customTitle) ? cloakState.customTitle : '';
    var customFavicon = (cloakState && cloakState.preset === 'custom' && cloakState.customFavicon) ? cloakState.customFavicon : '';

    var customTitleInput = el('input', {
      type: 'text',
      class: 'input-field',
      placeholder: 'tab title',
      value: customTitle,
      style: 'max-width:260px;'
    });
    var customFaviconInput = el('input', {
      type: 'text',
      class: 'input-field',
      placeholder: 'favicon url',
      value: customFavicon,
      style: 'max-width:260px;'
    });

    var customFields = el('div', {
      class: 'setting-item',
      style: 'flex-direction:column;align-items:stretch;gap:10px;' + (activePreset !== 'custom' ? 'display:none;' : '')
    }, [
      el('div', { class: 'setting-info' }, [
        el('span', { class: 'setting-name', text: 'custom cloak' }),
        el('span', { class: 'setting-desc', text: 'set your own title and favicon' })
      ]),
      el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;' }, [
        customTitleInput,
        customFaviconInput,
        el('button', {
          class: 'small-btn primary',
          text: 'apply',
          onclick: function () {
            var t = customTitleInput.value.trim();
            var f = customFaviconInput.value.trim();
            if (!t) { toast('enter a title'); return; }
            NT.privacy.applyCustomCloak(t, f);
            toast('custom cloak applied');
            NT.privacy.renderPage(container);
          }
        })
      ])
    ]);
    list.appendChild(customFields);

    /* show/hide custom fields when preset changes */
    presetSelect.addEventListener('change', function () {
      var val = presetSelect.value;
      if (val === '') {
        NT.privacy.removeCloak();
        customFields.style.display = 'none';
        toast('cloak removed');
      } else if (val === 'custom') {
        customFields.style.display = '';
        /* don't auto-apply; wait for user to click apply */
      } else {
        NT.privacy.applyCloak(val);
        customFields.style.display = 'none';
        toast('cloaked as ' + CLOAK_PRESETS[val].title);
      }
      NT.privacy.renderPage(container);
    });

    /* ── 3. panic key ──────────────────────────────────────────── */
    var panicKeyValue = getPanicKey();
    var panicKeyDisplay = el('span', {
      style: 'display:inline-block;padding:4px 12px;background:#111;border:1px solid #2a2a2a;border-radius:6px;font-size:0.85rem;color:#f0f0f0;font-family:monospace;min-width:36px;text-align:center;',
      text: panicKeyValue === '`' ? '` (backtick)' : panicKeyValue
    });

    var recordingKey = false;
    var recordBtn = el('button', {
      class: 'small-btn',
      text: 'change key',
      onclick: function () {
        if (recordingKey) return;
        recordingKey = true;
        recordBtn.textContent = 'press a key...';
        panicKeyDisplay.textContent = '...';
        panicKeyDisplay.style.borderColor = '#d4d4d4';

        function onKey(e) {
          e.preventDefault();
          e.stopPropagation();
          document.removeEventListener('keydown', onKey, true);
          recordingKey = false;
          var k = e.key;
          setPanicKey(k);
          panicKeyDisplay.textContent = k === '`' ? '` (backtick)' : k;
          panicKeyDisplay.style.borderColor = '#2a2a2a';
          recordBtn.textContent = 'change key';
          toast('panic key set to ' + k);
        }
        document.addEventListener('keydown', onKey, true);
      }
    });

    var panicTestBtn = el('button', {
      class: 'small-btn primary',
      text: 'test panic',
      style: 'color:#ef4444;border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.06);',
      onclick: function () {
        if (confirm('this will replace the page with a fake google docs screen. you will need to refresh to get back. continue?')) {
          NT.privacy.triggerPanic();
        }
      }
    });

    var panicItem = el('div', { class: 'setting-item', style: 'flex-wrap:wrap;gap:10px;' }, [
      el('div', { class: 'setting-info' }, [
        el('span', { class: 'setting-name', text: 'panic button' }),
        el('span', { class: 'setting-desc', text: 'instantly replace the page with a fake google docs screen' })
      ]),
      el('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;' }, [
        panicKeyDisplay,
        recordBtn,
        panicTestBtn
      ])
    ]);
    list.appendChild(panicItem);

    /* ── 4. history spoof toggle ───────────────────────────────── */
    var spoofToggle = el('input', { type: 'checkbox' });
    spoofToggle.checked = spoofActive;
    var spoofLabel = el('label', { class: 'toggle' }, [
      spoofToggle,
      el('span', { class: 'toggle-slider' })
    ]);

    spoofToggle.addEventListener('change', function () {
      if (spoofToggle.checked) {
        spoofActive = true;
        localStorage.setItem('nt-history-spoof', '1');
        NT.privacy.spoofHistory();
        toast('history spoofing enabled');
      } else {
        NT.privacy.disableSpoofHistory();
        toast('history spoofing disabled');
      }
      NT.privacy.renderPage(container);
    });

    var spoofItem = el('div', { class: 'setting-item' }, [
      el('div', { class: 'setting-info' }, [
        el('span', { class: 'setting-name', text: 'history spoofing' }),
        el('span', { class: 'setting-desc', text: 'inject fake edu urls into browser history (docs, classroom, khan academy, quizlet)' })
      ]),
      spoofLabel
    ]);
    list.appendChild(spoofItem);

    /* ── 5. extension monitor toggle ───────────────────────────── */
    var monToggle = el('input', { type: 'checkbox' });
    monToggle.checked = monitorOn;
    var monLabel = el('label', { class: 'toggle' }, [
      monToggle,
      el('span', { class: 'toggle-slider' })
    ]);

    monToggle.addEventListener('change', function () {
      if (monToggle.checked) {
        NT.privacy.startMonitor();
        toast('extension monitor active');
      } else {
        NT.privacy.stopMonitor();
        toast('extension monitor stopped');
      }
      NT.privacy.renderPage(container);
    });

    var monItem = el('div', { class: 'setting-item' }, [
      el('div', { class: 'setting-info' }, [
        el('span', { class: 'setting-name', text: 'extension monitor' }),
        el('span', { class: 'setting-desc', text: 'scan for goguardian, securly, lightspeed, cisco umbrella every 5 seconds' })
      ]),
      monLabel
    ]);
    list.appendChild(monItem);

    /* ── 6. scan now ───────────────────────────────────────────── */
    var scanResults = el('div', {
      style: 'margin-top:10px;font-size:0.78rem;color:#999;display:none;'
    });

    var scanBtn = el('button', {
      class: 'primary-btn',
      text: 'scan now',
      style: 'flex-shrink:0;',
      onclick: function () {
        var results = NT.privacy.detectExtensions();
        scanResults.style.display = 'block';
        if (results.length === 0) {
          scanResults.innerHTML = '';
          scanResults.style.color = '#d4d4d4';
          scanResults.textContent = 'scan complete — no monitoring extensions detected';
        } else {
          scanResults.style.color = '#ef4444';
          scanResults.innerHTML = '';
          var heading = el('div', {
            text: 'detected ' + results.length + ' threat' + (results.length > 1 ? 's' : '') + ':',
            style: 'margin-bottom:6px;font-weight:500;'
          });
          scanResults.appendChild(heading);
          results.forEach(function (r) {
            var row = el('div', {
              style: 'padding:4px 0;padding-left:12px;',
              text: '\u2022 ' + r
            });
            scanResults.appendChild(row);
          });
        }
        toast(results.length ? results.length + ' threat(s) found' : 'scan clean');
      }
    });

    var scanItem = el('div', {
      class: 'setting-item',
      style: 'flex-direction:column;align-items:stretch;gap:10px;'
    }, [
      el('div', { style: 'display:flex;align-items:center;justify-content:space-between;' }, [
        el('div', { class: 'setting-info' }, [
          el('span', { class: 'setting-name', text: 'manual scan' }),
          el('span', { class: 'setting-desc', text: 'run a one-time scan for monitoring extensions' })
        ]),
        scanBtn
      ]),
      scanResults
    ]);
    list.appendChild(scanItem);
  };

})();
