/* ============================================
   null testament — game catalog engine
   lazy-loaded catalog, search, filters,
   favorites, recently played, pagination
   ============================================ */
(function () {
  'use strict';

  window.NT = window.NT || {};

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

  // ── module state ──────────────────────────────────────────────────
  var PAGE_SIZE        = 80;

  var _catalog         = null;   // raw catalog JSON
  var _allGames        = [];     // flattened game array
  var _filteredGames   = [];     // after search + filter
  var _favorites       = loadJSON('nt-game-favorites', []);
  var _recentlyPlayed  = loadJSON('nt-game-recent', []);
  var _searchQuery     = '';
  var _activeFilter    = 'all';
  var _visibleCount    = PAGE_SIZE;
  var _containerRef    = null;   // for re-renders

  // ── localStorage helpers ──────────────────────────────────────────
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (_) { return fallback; }
  }
  function saveJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
  }

  // ── catalog loader (lazy, one-shot) ───────────────────────────────
  function loadCatalog(cb) {
    if (_catalog) { cb(null); return; }

    // Try embedded catalog first (works with file:// protocol)
    if (window.__NT_CATALOG) {
      _catalog = window.__NT_CATALOG;
      _allGames = flattenCatalog(_catalog);
      cb(null);
      return;
    }

    // Fallback to fetch (works with http:// server)
    fetch('js/game-catalog.json')
      .then(function (r) {
        if (!r.ok) throw new Error('catalog fetch failed: ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _catalog = data;
        _allGames = flattenCatalog(data);
        cb(null);
      })
      .catch(function (err) {
        cb(err);
      });
  }

  // ── flatten all sources into one array ────────────────────────────
  function flattenCatalog(catalog) {
    var games = [];
    var sources = catalog.sources || catalog;

    // support array-of-sources or object-keyed sources
    if (Array.isArray(sources)) {
      sources.forEach(function (src) {
        flattenSource(src, games);
      });
    } else if (typeof sources === 'object') {
      Object.keys(sources).forEach(function (key) {
        var src = sources[key];
        if (typeof src === 'object') {
          src._key = src._key || key;
          flattenSource(src, games);
        }
      });
    }
    return games;
  }

  function flattenSource(src, out) {
    var sourceId   = src.id || src._key || 'unknown';
    var sourceName = src.name || src.label || sourceId;
    var items      = src.games || src.items || src.roms || [];

    if (Array.isArray(items)) {
      items.forEach(function (g, idx) {
        out.push({
          id:       g.id || (sourceId + '-' + idx),
          name:     g.name || g.title || 'Untitled',
          slug:     g.slug || slugify(g.name || g.title || ''),
          path:     g.path || g.url || g.src || '',
          source:   sourceName,
          sourceId: sourceId,
          tags:     g.tags || [],
          thumb:    g.thumb || g.thumbnail || g.image || '',
          type:     g.type || (g.core ? 'emulator' : 'html5')
        });
      });
    }
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // ── filtering engine ──────────────────────────────────────────────
  function applyFilters() {
    var base;

    if (_activeFilter === 'all') {
      base = _allGames;
    } else if (_activeFilter === 'favorites') {
      base = _allGames.filter(function (g) { return _favorites.indexOf(g.id) !== -1; });
    } else if (_activeFilter === 'recent') {
      // order by recency
      var recentIds = _recentlyPlayed.slice().reverse();
      base = [];
      recentIds.forEach(function (id) {
        var found = findGame(id);
        if (found) base.push(found);
      });
    } else {
      // source-based filter
      base = _allGames.filter(function (g) { return g.sourceId === _activeFilter; });
    }

    if (_searchQuery) {
      var q = _searchQuery.toLowerCase();
      base = base.filter(function (g) {
        return g.name.toLowerCase().indexOf(q) !== -1
            || g.source.toLowerCase().indexOf(q) !== -1
            || (g.tags && g.tags.join(' ').toLowerCase().indexOf(q) !== -1);
      });
    }

    _filteredGames = base;
    _visibleCount = PAGE_SIZE;
  }

  function findGame(id) {
    for (var i = 0; i < _allGames.length; i++) {
      if (_allGames[i].id === id) return _allGames[i];
    }
    return null;
  }

  // ── unique sources for tabs ───────────────────────────────────────
  function getSourceTabs() {
    var seen = {};
    var tabs = [];
    _allGames.forEach(function (g) {
      if (!seen[g.sourceId]) {
        seen[g.sourceId] = true;
        tabs.push({ id: g.sourceId, label: g.source });
      }
    });
    return tabs;
  }

  // ── favorites ─────────────────────────────────────────────────────
  function isFavorite(id) {
    return _favorites.indexOf(id) !== -1;
  }

  function toggleFavorite(id) {
    var idx = _favorites.indexOf(id);
    if (idx === -1) {
      _favorites.push(id);
      toast('added to favorites');
    } else {
      _favorites.splice(idx, 1);
      toast('removed from favorites');
    }
    saveJSON('nt-game-favorites', _favorites);
  }

  // ── recently played ───────────────────────────────────────────────
  function addToRecent(id) {
    var idx = _recentlyPlayed.indexOf(id);
    if (idx !== -1) _recentlyPlayed.splice(idx, 1);
    _recentlyPlayed.push(id);
    if (_recentlyPlayed.length > 50) _recentlyPlayed.shift();
    saveJSON('nt-game-recent', _recentlyPlayed);
  }

  // ── game launch ───────────────────────────────────────────────────
  function launchGame(game) {
    var overlay = document.getElementById('game-overlay');
    var frame   = document.getElementById('game-frame');
    var toolbar = document.getElementById('game-toolbar');

    if (!overlay || !frame) return;

    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    // set toolbar title
    if (toolbar) {
      var titleEl = toolbar.querySelector('.game-toolbar-title');
      if (titleEl) titleEl.textContent = game.name;
    }

    if (game.type === 'emulator' && NT.emulators && NT.emulators.launch) {
      // delegate to emulator module
      var core = game.core || game.sourceId || '';
      NT.emulators.launch(frame, core, game.path);
    } else {
      frame.src = game.path;
    }

    addToRecent(game.id);

    try {
      history.replaceState({ ntGame: game.id }, '', '#game/' + game.slug);
    } catch (_) {}
  }

  function closeGame() {
    var overlay = document.getElementById('game-overlay');
    var frame   = document.getElementById('game-frame');

    if (overlay) {
      overlay.classList.remove('active');
      overlay.classList.add('hidden');
    }
    if (frame) {
      frame.src = 'about:blank';
    }

    try {
      history.replaceState(null, '', window.location.pathname);
    } catch (_) {}
  }

  // ── render ────────────────────────────────────────────────────────
  function render(container) {
    _containerRef = container;
    container.innerHTML = '';

    // show spinner while loading
    var loader = el('div', { style: 'display:flex;align-items:center;justify-content:center;padding:60px 0;' }, [
      el('div', { class: 'spinner' })
    ]);
    container.appendChild(loader);

    loadCatalog(function (err) {
      container.innerHTML = '';

      if (err) {
        container.appendChild(el('div', {
          class: 'page-header',
          style: 'color:#ef4444;'
        }, [
          el('h2', { text: 'games' }),
          el('p', { class: 'page-desc', text: 'failed to load game catalog: ' + err.message })
        ]));
        return;
      }

      applyFilters();
      renderPage(container);
    });
  }

  function renderPage(container) {
    container.innerHTML = '';

    // ── header ──────────────────────────────────────────────────
    var header = el('div', { class: 'page-header' }, [
      el('h2', { text: 'games' }),
      el('p', { class: 'page-desc', text: _allGames.length + ' games available' })
    ]);
    container.appendChild(header);

    // ── search bar ──────────────────────────────────────────────
    var searchWrap = el('div', { class: 'game-search' });
    var searchIcon = el('div', {
      class: 'game-search-icon',
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    });
    var searchInput = el('input', {
      type: 'text',
      class: 'input-field',
      placeholder: 'search games...',
      value: _searchQuery
    });
    searchInput.addEventListener('input', function () {
      _searchQuery = searchInput.value;
      applyFilters();
      renderGrid(gridContainer, loadMoreWrap);
      updateCount(countEl);
    });
    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(searchInput);
    container.appendChild(searchWrap);

    // ── filter tabs ─────────────────────────────────────────────
    var tabsWrap = el('div', { class: 'game-tabs' });

    var builtInTabs = [
      { id: 'all',       label: 'All' },
      { id: 'favorites', label: 'Favorites' },
      { id: 'recent',    label: 'Recently Played' }
    ];

    var sourceTabs = getSourceTabs();

    builtInTabs.concat(sourceTabs).forEach(function (tab) {
      var btn = el('button', {
        text: tab.label,
        class: tab.id === _activeFilter ? 'active' : ''
      });
      btn.addEventListener('click', function () {
        _activeFilter = tab.id;
        applyFilters();
        // update tab active states
        $$('button', tabsWrap).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderGrid(gridContainer, loadMoreWrap);
        updateCount(countEl);
      });
      tabsWrap.appendChild(btn);
    });
    container.appendChild(tabsWrap);

    // ── count indicator ─────────────────────────────────────────
    var countEl = el('div', { class: 'game-count' });
    updateCount(countEl);
    container.appendChild(countEl);

    // ── game grid ───────────────────────────────────────────────
    var gridContainer = el('div', { class: 'game-grid' });
    container.appendChild(gridContainer);

    // ── load more ───────────────────────────────────────────────
    var loadMoreWrap = el('div', { style: 'text-align:center;margin-top:20px;' });
    container.appendChild(loadMoreWrap);

    renderGrid(gridContainer, loadMoreWrap);
  }

  function updateCount(countEl) {
    countEl.textContent = _filteredGames.length + ' game' + (_filteredGames.length !== 1 ? 's' : '') + ' found';
  }

  function renderGrid(gridContainer, loadMoreWrap) {
    gridContainer.innerHTML = '';
    loadMoreWrap.innerHTML = '';

    if (_filteredGames.length === 0) {
      gridContainer.appendChild(el('div', {
        style: 'grid-column:1/-1;text-align:center;padding:40px 0;color:#666;font-size:0.85rem;',
        text: _searchQuery ? 'no games match "' + _searchQuery + '"' : 'no games in this category'
      }));
      return;
    }

    var visible = _filteredGames.slice(0, _visibleCount);

    visible.forEach(function (game) {
      var card = createGameCard(game);
      gridContainer.appendChild(card);
    });

    // load more button
    if (_visibleCount < _filteredGames.length) {
      var remaining = _filteredGames.length - _visibleCount;
      var btn = el('button', {
        class: 'primary-btn',
        text: 'load more (' + remaining + ' remaining)'
      });
      btn.addEventListener('click', function () {
        _visibleCount += PAGE_SIZE;
        renderGrid(gridContainer, loadMoreWrap);
      });
      loadMoreWrap.appendChild(btn);
    }
  }

  // ── game card ─────────────────────────────────────────────────
  function createGameCard(game) {
    // thumbnail
    var thumbContent;
    if (game.thumb) {
      var img = el('img', { src: game.thumb, alt: game.name });
      img.addEventListener('error', function () {
        img.style.display = 'none';
        thumbEl.textContent = game.name.charAt(0).toUpperCase();
      });
      thumbContent = [img];
    } else {
      thumbContent = null;
    }

    var thumbEl = el('div', { class: 'game-card-thumb' }, thumbContent);
    if (!game.thumb) {
      thumbEl.textContent = game.name.charAt(0).toUpperCase();
    }

    // favorite star overlay
    var favStar = el('div', {
      style: 'position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;'
           + 'background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;'
           + 'opacity:0;transition:opacity 0.15s;cursor:pointer;z-index:2;font-size:14px;',
      html: isFavorite(game.id)
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    });
    favStar.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleFavorite(game.id);
      // update star visual
      favStar.innerHTML = isFavorite(game.id)
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    });

    // thumb wrapper with relative positioning for star
    var thumbWrap = el('div', { style: 'position:relative;' }, [thumbEl, favStar]);

    // card info
    var info = el('div', { class: 'game-card-info' }, [
      el('div', { class: 'game-card-title', text: game.name }),
      el('div', { class: 'game-card-source', text: game.source })
    ]);

    var card = el('div', { class: 'game-card' }, [thumbWrap, info]);

    // show star on hover
    card.addEventListener('mouseenter', function () { favStar.style.opacity = '1'; });
    card.addEventListener('mouseleave', function () { favStar.style.opacity = '0'; });

    // always show filled star for favorited games
    if (isFavorite(game.id)) {
      favStar.style.opacity = '0.8';
      card.addEventListener('mouseleave', function () { favStar.style.opacity = '0.8'; });
    }

    // launch on click
    card.addEventListener('click', function () {
      launchGame(game);
    });

    return card;
  }

  // ── wire up close button in game overlay ──────────────────────
  function bindOverlayClose() {
    var overlay = document.getElementById('game-overlay');
    if (!overlay) return;

    // bind any existing close buttons
    var closeBtns = overlay.querySelectorAll('.close-game');
    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        closeGame();
      });
    });

    // ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeGame();
      }
    });
  }

  // bind once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindOverlayClose);
  } else {
    bindOverlayClose();
  }

  // ── public API ────────────────────────────────────────────────────
  NT.renderGames = render;

  NT.games = {
    render:          render,
    launchGame:      launchGame,
    closeGame:       closeGame,
    toggleFavorite:  toggleFavorite,
    addToRecent:     addToRecent,
    getCatalog:      function () { return _catalog; },
    getAllGames:     function () { return _allGames; },
    getFavorites:    function () { return _favorites.slice(); },
    getRecent:       function () { return _recentlyPlayed.slice(); },
    findGame:        findGame
  };

})();
