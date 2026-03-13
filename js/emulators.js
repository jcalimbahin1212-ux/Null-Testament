/* ============================================
   null testament — emulatorjs wrapper module
   system cards, rom browser, rom upload,
   emulatorjs integration via srcdoc
   ============================================ */
(function () {
  'use strict';

  window.NT = window.NT || {};
  NT.emulators = NT.emulators || {};

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

  // ── constants ─────────────────────────────────────────────────────
  var EJS_DATA_PATH = 'emulators/emulatorjs/data/';

  // ── SVG icon helpers (replace emoji) ─────────────────────────────
  var svgGamepad = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z"/></svg>';
  var svgJoystick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><circle cx="12" cy="18" r="4"/><line x1="12" y1="14" x2="12" y2="6"/><circle cx="12" cy="5" r="1"/></svg>';
  var svgHandheld = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="6" y="3" width="12" height="18" rx="2"/><rect x="9" y="6" width="6" height="5" rx="1"/><circle cx="10" cy="15" r="0.5"/><circle cx="14" cy="15" r="0.5"/><line x1="10" y1="18" x2="14" y2="18"/></svg>';
  var svgChip = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>';
  var svgDisc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>';

  var SYSTEMS = [
    {
      id: 'nes',
      name: 'NES',
      core: 'nes',
      icon: svgGamepad,
      extensions: ['.nes'],
      description: 'Nintendo Entertainment System'
    },
    {
      id: 'snes',
      name: 'SNES',
      core: 'snes',
      icon: svgJoystick,
      extensions: ['.smc', '.sfc'],
      description: 'Super Nintendo Entertainment System'
    },
    {
      id: 'gb',
      name: 'Game Boy',
      core: 'gb',
      icon: svgHandheld,
      extensions: ['.gb'],
      description: 'Nintendo Game Boy'
    },
    {
      id: 'gba',
      name: 'GBA',
      core: 'gba',
      icon: svgHandheld,
      extensions: ['.gba'],
      description: 'Game Boy Advance'
    },
    {
      id: 'n64',
      name: 'N64',
      core: 'n64',
      icon: svgChip,
      extensions: ['.z64', '.n64', '.v64'],
      description: 'Nintendo 64'
    },
    {
      id: 'nds',
      name: 'NDS',
      core: 'nds',
      icon: svgHandheld,
      extensions: ['.nds'],
      description: 'Nintendo DS'
    },
    {
      id: 'genesis',
      name: 'Sega Genesis',
      core: 'segaMD',
      icon: svgGamepad,
      extensions: ['.md', '.gen', '.bin'],
      description: 'Sega Genesis / Mega Drive'
    },
    {
      id: 'psx',
      name: 'PlayStation',
      core: 'psx',
      icon: svgDisc,
      extensions: ['.bin', '.iso', '.cue', '.pbp'],
      description: 'Sony PlayStation'
    },
    {
      id: 'atari2600',
      name: 'Atari 2600',
      core: 'atari2600',
      icon: svgJoystick,
      extensions: ['.a26', '.bin'],
      description: 'Atari 2600 Video Computer System'
    }
  ];

  // ── emulatorjs launcher ───────────────────────────────────────────
  /**
   * Sets up EmulatorJS inside an iframe via srcdoc.
   * @param {HTMLIFrameElement} iframeEl - the target iframe
   * @param {string} core - EmulatorJS core name (e.g. 'nes', 'gba')
   * @param {string} romPath - path or URL to the ROM file
   */
  NT.emulators.launch = function (iframeEl, core, romPath) {
    var origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
    var basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    var fullDataPath = origin + basePath + EJS_DATA_PATH;

    // if romPath is relative, make it absolute
    var fullRomPath = romPath;
    if (romPath && romPath.indexOf('://') === -1 && romPath.indexOf('blob:') !== 0) {
      fullRomPath = origin + basePath + romPath;
    }

    var html = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="UTF-8">',
      '<style>',
      '  * { margin: 0; padding: 0; box-sizing: border-box; }',
      '  html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }',
      '  #game { width: 100%; height: 100%; }',
      '</style>',
      '</head>',
      '<body>',
      '<div id="game"></div>',
      '<script>',
      '  var EJS_player = "#game";',
      '  var EJS_core = "' + escapeJS(core) + '";',
      '  var EJS_gameUrl = "' + escapeJS(fullRomPath) + '";',
      '  var EJS_pathToData = "' + escapeJS(fullDataPath) + '";',
      '  var EJS_startOnLoaded = true;',
      '  var EJS_color = "#d4d4d4";',
      '  var EJS_backgroundColor = "#000";',
      '<\/script>',
      '<script src="' + escapeJS(fullDataPath) + 'loader.js"><\/script>',
      '</body>',
      '</html>'
    ].join('\n');

    iframeEl.srcdoc = html;
  };

  function escapeJS(str) {
    return String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }

  // ── rom catalog helper ────────────────────────────────────────────
  function getRomsForSystem(systemId) {
    if (!NT.games || !NT.games.getAllGames) return [];
    var allGames = NT.games.getAllGames();
    return allGames.filter(function (g) {
      return g.type === 'emulator' && (g.sourceId === systemId || g.core === systemId);
    });
  }

  // ── launch rom via game overlay ───────────────────────────────────
  NT.emulators.launchRom = function (system, romPath) {
    var overlay = document.getElementById('game-overlay');
    var frame   = document.getElementById('game-frame');
    var toolbar = document.getElementById('game-toolbar');

    if (!overlay || !frame) {
      toast('game overlay not found');
      return;
    }

    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    if (toolbar) {
      var titleEl = toolbar.querySelector('.game-toolbar-title');
      if (titleEl) {
        var romName = romPath.split('/').pop().replace(/\.[^.]+$/, '');
        titleEl.textContent = romName + ' (' + system.name + ')';
      }
    }

    NT.emulators.launch(frame, system.core, romPath);
  };

  // ── render page ───────────────────────────────────────────────────
  var _currentView = 'grid';  // 'grid' or 'browser'
  var _selectedSystem = null;
  var _containerRef = null;

  NT.emulators.renderPage = function (container) {
    _containerRef = container;
    container.innerHTML = '';

    if (_currentView === 'browser' && _selectedSystem) {
      renderRomBrowser(container);
    } else {
      renderSystemGrid(container);
    }
  };

  // ── system grid ───────────────────────────────────────────────────
  function renderSystemGrid(container) {
    _currentView = 'grid';

    var header = el('div', { class: 'page-header' }, [
      el('h2', { text: 'emulators' }),
      el('p', { class: 'page-desc', text: 'play classic console games directly in the browser via EmulatorJS' })
    ]);
    container.appendChild(header);

    var grid = el('div', { class: 'emulator-grid' });

    SYSTEMS.forEach(function (sys) {
      var romCount = getRomsForSystem(sys.id).length;
      var countText = romCount > 0 ? (romCount + ' rom' + (romCount > 1 ? 's' : '')) : 'upload roms';

      var card = el('div', { class: 'emulator-card' }, [
        el('div', { class: 'emulator-card-icon', html: sys.icon }),
        el('div', { class: 'emulator-card-info' }, [
          el('div', { class: 'emulator-card-title', text: sys.name }),
          el('div', { class: 'emulator-card-desc', text: sys.description }),
          el('div', {
            style: 'font-size:0.65rem;color:var(--text-dim);margin-top:4px;',
            text: countText
          })
        ])
      ]);

      card.addEventListener('click', function () {
        _selectedSystem = sys;
        _currentView = 'browser';
        NT.emulators.renderPage(_containerRef);
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);

    // upload section at bottom
    var uploadSection = el('div', {
      style: 'margin-top:32px;padding:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;text-align:center;'
    }, [
      el('p', {
        style: 'font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;',
        text: 'or upload a ROM file for any supported system'
      }),
      createUploadButton(null)
    ]);
    container.appendChild(uploadSection);
  }

  // ── rom browser ───────────────────────────────────────────────────
  function renderRomBrowser(container) {
    var sys = _selectedSystem;
    if (!sys) return;

    // back button
    var backBtn = el('button', { class: 'back-btn', text: '\u2190 back to systems' });
    backBtn.addEventListener('click', function () {
      _currentView = 'grid';
      _selectedSystem = null;
      NT.emulators.renderPage(_containerRef);
    });
    container.appendChild(backBtn);

    // header
    var header = el('div', { class: 'page-header' }, [
      el('h2', { html: '<span style="display:inline-block;width:24px;height:24px;vertical-align:-4px;margin-right:8px;">' + sys.icon + '</span>' + sys.name }),
      el('p', { class: 'page-desc', text: sys.description + ' \u2014 supported formats: ' + sys.extensions.join(', ') })
    ]);
    container.appendChild(header);

    // upload button
    var uploadWrap = el('div', { style: 'margin-bottom:16px;display:flex;gap:10px;align-items:center;' }, [
      createUploadButton(sys)
    ]);
    container.appendChild(uploadWrap);

    // rom list from catalog
    var roms = getRomsForSystem(sys.id);
    var romList = el('div', { class: 'emulator-rom-list' });

    if (roms.length === 0) {
      romList.appendChild(el('div', {
        style: 'text-align:center;padding:40px 0;color:var(--text-dim);font-size:0.85rem;',
        text: 'no ROMs found in catalog for ' + sys.name + '. upload a ROM to get started.'
      }));
    } else {
      roms.forEach(function (rom) {
        var romItem = el('div', { class: 'emulator-rom-item' }, [
          el('div', {}, [
            el('div', { class: 'emulator-rom-name', text: rom.name }),
            el('div', { class: 'emulator-rom-meta', text: rom.source || sys.name })
          ]),
          el('button', {
            class: 'small-btn primary',
            text: 'play',
            onclick: function (e) {
              e.stopPropagation();
              NT.emulators.launchRom(sys, rom.path);
            }
          })
        ]);

        romItem.addEventListener('click', function () {
          NT.emulators.launchRom(sys, rom.path);
        });

        romList.appendChild(romItem);
      });
    }

    container.appendChild(romList);
  }

  // ── upload button factory ─────────────────────────────────────────
  function createUploadButton(system) {
    var fileInput = el('input', {
      type: 'file',
      style: 'display:none;'
    });

    // build accept string from system or all systems
    var accepts;
    if (system) {
      accepts = system.extensions.join(',');
    } else {
      var allExts = [];
      SYSTEMS.forEach(function (s) {
        s.extensions.forEach(function (ext) {
          if (allExts.indexOf(ext) === -1) allExts.push(ext);
        });
      });
      accepts = allExts.join(',');
    }
    fileInput.setAttribute('accept', accepts);

    var btn = el('button', {
      class: 'primary-btn',
      text: system ? ('upload ' + system.name + ' ROM') : 'upload ROM'
    });

    btn.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;

      // detect system from extension if not specified
      var targetSystem = system;
      if (!targetSystem) {
        var ext = '.' + file.name.split('.').pop().toLowerCase();
        for (var i = 0; i < SYSTEMS.length; i++) {
          if (SYSTEMS[i].extensions.indexOf(ext) !== -1) {
            targetSystem = SYSTEMS[i];
            break;
          }
        }
      }

      if (!targetSystem) {
        toast('unsupported file format: ' + file.name);
        fileInput.value = '';
        return;
      }

      // read file as blob URL
      var reader = new FileReader();
      reader.onload = function () {
        var blob = new Blob([reader.result]);
        var blobUrl = URL.createObjectURL(blob);

        toast('launching ' + file.name + ' on ' + targetSystem.name);
        NT.emulators.launchRom(targetSystem, blobUrl);
      };
      reader.onerror = function () {
        toast('failed to read ROM file');
      };
      reader.readAsArrayBuffer(file);

      // reset input so the same file can be selected again
      fileInput.value = '';
    });

    var wrap = el('div', { style: 'display:inline-flex;' }, [btn, fileInput]);
    return wrap;
  }

  // ── close handler for emulator overlay ────────────────────────────
  function bindClose() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var overlay = document.getElementById('game-overlay');
        if (overlay && overlay.classList.contains('active')) {
          if (NT.games && NT.games.closeGame) {
            NT.games.closeGame();
          } else {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            var frame = document.getElementById('game-frame');
            if (frame) frame.src = 'about:blank';
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindClose);
  } else {
    bindClose();
  }

  // ── public helpers on namespace ───────────────────────────────────
  NT.emulators.SYSTEMS     = SYSTEMS;
  NT.emulators.EJS_DATA_PATH = EJS_DATA_PATH;
  NT.emulators.getSystemById = function (id) {
    for (var i = 0; i < SYSTEMS.length; i++) {
      if (SYSTEMS[i].id === id) return SYSTEMS[i];
    }
    return null;
  };

})();
