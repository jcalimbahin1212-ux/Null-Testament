/* ============================================
   null testament — sources module
   provides window.NT.renderSources(container)
   multi-database search, citation engine, ai chat
   ============================================ */
window.NT = window.NT || {};

window.NT.renderSources = (function () {
  'use strict';

  var STORAGE_KEY = 'nt-sources';
  var toast = function (m) { if (window.NT && window.NT.toast) window.NT.toast(m); };

  /* ---- persistence ---- */
  function loadSaved() {
    try { var r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
    catch (_) { return []; }
  }
  function saveSaved(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
  }

  /* ---- citation formatting ---- */
  function formatCitation(source, format) {
    var author    = source.author    || 'unknown author';
    var title     = source.title     || 'untitled';
    var year      = source.year      || 'n.d.';
    var publisher = source.publisher || '';
    var url       = source.url       || '';
    var accessed  = new Date().toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    if (format === 'mla') {
      var mla = author + '. "' + title + '."';
      if (publisher) mla += ' <i>' + publisher + '</i>,';
      mla += ' ' + year + '.';
      if (url) mla += ' ' + url + '. accessed ' + accessed + '.';
      return mla;
    }
    if (format === 'apa') {
      var apa = author + ' (' + year + '). ' + title + '.';
      if (publisher) apa += ' <i>' + publisher + '</i>.';
      if (url) apa += ' retrieved from ' + url;
      return apa;
    }
    if (format === 'chicago') {
      var chi = author + '. "' + title + '."';
      if (publisher) chi += ' <i>' + publisher + '</i>,';
      chi += ' ' + year + '.';
      if (url) chi += ' ' + url + '.';
      return chi;
    }
    return title;
  }
  function citationPlainText(source, format) {
    return formatCitation(source, format).replace(/<\/?i>/g, '');
  }

  /* ---- html strip ---- */
  function stripTags(str) { return (str || '').replace(/<[^>]*>/g, ''); }

  /* ======== API SEARCH FUNCTIONS (each returns Promise<Source[]>) ======== */

  /* 1. wikipedia — encyclopedia */
  function searchWikipedia(query) {
    var url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
      encodeURIComponent(query) + '&srlimit=8&format=json&origin=*';
    return fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var results = (data.query && data.query.search) ? data.query.search : [];
      return results.map(function (item) {
        return {
          title: item.title,
          author: 'wikipedia contributors',
          year: new Date().getFullYear().toString(),
          publisher: 'wikipedia, the free encyclopedia',
          url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_')),
          snippet: stripTags(item.snippet),
          category: 'encyclopedia', source: 'wikipedia'
        };
      });
    });
  }

  /* 2. duckduckgo — web */
  function searchDuckDuckGo(query) {
    var url = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) +
      '&format=json&no_redirect=1&no_html=1';
    return fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var results = [];
      if (data.Abstract) {
        results.push({
          title: data.Heading || query,
          author: data.AbstractSource || 'unknown author',
          year: 'n.d.', publisher: data.AbstractSource || '',
          url: data.AbstractURL || '', snippet: data.Abstract,
          category: 'web', source: 'duckduckgo'
        });
      }
      if (data.RelatedTopics && data.RelatedTopics.length) {
        data.RelatedTopics.forEach(function (topic) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.substring(0, 80),
              author: 'duckduckgo', year: 'n.d.', publisher: '',
              url: topic.FirstURL, snippet: topic.Text,
              category: 'web', source: 'duckduckgo'
            });
          }
        });
      }
      return results.slice(0, 8);
    });
  }

  /* 3. open library — books */
  function searchOpenLibrary(query) {
    var url = 'https://openlibrary.org/search.json?q=' + encodeURIComponent(query) + '&limit=8';
    return fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      return (data.docs || []).map(function (doc) {
        var authors  = (doc.author_name || []).join(', ') || 'unknown author';
        var pub      = (doc.publisher && doc.publisher[0]) || '';
        var subjects = (doc.subject || []).slice(0, 3).join(', ');
        return {
          title: doc.title || 'untitled', author: authors,
          year: doc.first_publish_year ? doc.first_publish_year.toString() : 'n.d.',
          publisher: pub,
          url: doc.key ? 'https://openlibrary.org' + doc.key : '',
          snippet: doc.subtitle || subjects || '',
          category: 'book', source: 'open library'
        };
      });
    });
  }

  /* 4. semantic scholar — academic papers */
  function searchSemanticScholar(query) {
    var url = 'https://api.semanticscholar.org/graph/v1/paper/search?query=' +
      encodeURIComponent(query) + '&limit=8&fields=title,authors,year,abstract,url,venue';
    return fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      return (data.data || []).map(function (p) {
        var authors = (p.authors || []).map(function (a) { return a.name; }).join(', ') || 'unknown author';
        return {
          title: p.title || 'untitled', author: authors,
          year: p.year ? p.year.toString() : 'n.d.',
          publisher: p.venue || '',
          url: p.url || ('https://www.semanticscholar.org/paper/' + (p.paperId || '')),
          snippet: p.abstract || '',
          category: 'academic', source: 'semantic scholar'
        };
      });
    });
  }

  /* ---- AI chat via pollinations ---- */
  var AI_SYSTEM_PROMPT = 'You are a research assistant for students. Help them find sources, ' +
    'refine search queries, suggest search terms, explain topics, and generate citations. ' +
    'Be concise and helpful. All text should be lowercase.';

  function chatWithAI(messages) {
    return fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages, model: 'openai' })
    }).then(function (r) { return r.text(); });
  }

  /* ======== MODULE STATE ======== */
  var _savedSources  = [];
  var _citationFormat = 'mla';
  var _activeTab      = 'all';
  var _aiMessages     = [];

  var TABS = [
    { id: 'all',       label: 'all' },
    { id: 'wikipedia', label: 'wikipedia' },
    { id: 'web',       label: 'web' },
    { id: 'books',     label: 'books' },
    { id: 'academic',  label: 'academic' },
    { id: 'ai',        label: 'ai assistant' }
  ];

  /* ======== MAIN RENDER ======== */
  function render(container) {
    _savedSources  = loadSaved();
    _citationFormat = 'mla';
    _activeTab      = 'all';
    _aiMessages     = [];
    container.innerHTML = '';

    /* page header */
    var header = document.createElement('div');
    header.innerHTML =
      '<h2 style="margin:0 0 2px 0">sources</h2>' +
      '<p style="color:var(--text-dim);margin:0 0 16px 0;font-size:0.85rem">' +
        'find & cite from multiple databases</p>';
    container.appendChild(header);

    /* tab bar */
    var tabBar = document.createElement('div');
    tabBar.className = 'source-tabs';
    TABS.forEach(function (tab) {
      var btn = document.createElement('button');
      btn.className = 'source-tab' + (tab.id === _activeTab ? ' active' : '');
      btn.textContent = tab.label;
      btn.dataset.tab = tab.id;
      btn.addEventListener('click', function () {
        _activeTab = tab.id;
        renderTabBar();
        renderBody();
      });
      tabBar.appendChild(btn);
    });
    container.appendChild(tabBar);

    /* body wrapper */
    var body = document.createElement('div');
    body.className = 'sources-body';
    container.appendChild(body);

    function renderTabBar() {
      var buttons = tabBar.querySelectorAll('.source-tab');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].className = 'source-tab' + (buttons[i].dataset.tab === _activeTab ? ' active' : '');
      }
    }
    function renderBody() {
      body.innerHTML = '';
      if (_activeTab === 'ai') renderAIChat(body);
      else renderSearchLayout(body);
    }

    /* ======== SEARCH LAYOUT (non-AI tabs) ======== */
    function renderSearchLayout(parent) {
      var layout = document.createElement('div');
      layout.className = 'sources-layout';

      /* -- left panel: search -- */
      var searchPanel = document.createElement('div');
      searchPanel.className = 'source-search-panel';

      var searchInput = document.createElement('input');
      searchInput.className = 'input-field';
      searchInput.placeholder = 'search for a topic...';
      searchInput.style.width = '100%';
      searchPanel.appendChild(searchInput);

      var optionsRow = document.createElement('div');
      optionsRow.className = 'source-options';

      var formatSelect = document.createElement('select');
      formatSelect.className = 'input-field';
      ['mla', 'apa', 'chicago'].forEach(function (f) {
        var o = document.createElement('option');
        o.value = f; o.textContent = f;
        if (f === _citationFormat) o.selected = true;
        formatSelect.appendChild(o);
      });
      formatSelect.addEventListener('change', function () {
        _citationFormat = formatSelect.value;
        renderSavedPanel();
      });

      var searchBtn = document.createElement('button');
      searchBtn.className = 'primary-btn';
      searchBtn.textContent = 'search';
      optionsRow.appendChild(formatSelect);
      optionsRow.appendChild(searchBtn);
      searchPanel.appendChild(optionsRow);

      var resultsArea = document.createElement('div');
      resultsArea.className = 'source-results';
      searchPanel.appendChild(resultsArea);
      layout.appendChild(searchPanel);

      /* -- right panel: saved sources -- */
      var savedPanel = document.createElement('div');
      savedPanel.className = 'source-saved-panel';

      var savedTitle = document.createElement('h3');
      savedTitle.textContent = 'saved sources';
      savedTitle.style.margin = '0 0 8px 0';
      savedPanel.appendChild(savedTitle);

      var savedList = document.createElement('div');
      savedList.className = 'saved-sources-list';
      savedPanel.appendChild(savedList);

      var exportRow = document.createElement('div');
      exportRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';

      var copyAllBtn = document.createElement('button');
      copyAllBtn.className = 'small-btn';
      copyAllBtn.textContent = 'copy bibliography';
      copyAllBtn.addEventListener('click', function () {
        if (!_savedSources.length) { toast('no sources to copy'); return; }
        var text = _savedSources.map(function (s, i) {
          return (i + 1) + '. ' + citationPlainText(s, _citationFormat);
        }).join('\n\n');
        navigator.clipboard.writeText(text).then(function () {
          toast('bibliography copied (' + _citationFormat + ')');
        }).catch(function () { toast('failed to copy'); });
      });

      var clearAllBtn = document.createElement('button');
      clearAllBtn.className = 'danger-btn';
      clearAllBtn.textContent = 'clear all';
      clearAllBtn.addEventListener('click', function () {
        if (!_savedSources.length) return;
        if (!confirm('remove all saved sources?')) return;
        _savedSources = [];
        saveSaved(_savedSources);
        renderSavedPanel();
        toast('all sources cleared');
      });

      exportRow.appendChild(copyAllBtn);
      exportRow.appendChild(clearAllBtn);
      savedPanel.appendChild(exportRow);
      layout.appendChild(savedPanel);
      parent.appendChild(layout);

      renderSavedPanel();

      /* event handlers */
      searchBtn.addEventListener('click', function () { doSearch(); });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doSearch();
      });

      function doSearch() {
        var query = searchInput.value.trim();
        if (!query) { toast('enter a topic to search'); return; }
        resultsArea.innerHTML =
          '<div style="text-align:center;padding:24px">' +
          '<div class="spinner"></div>' +
          '<p style="color:var(--text-dim);margin-top:8px">searching for sources...</p></div>';

        var tab = _activeTab;
        var promise;
        if (tab === 'all') {
          promise = Promise.all([
            searchWikipedia(query).catch(function () { return []; }),
            searchDuckDuckGo(query).catch(function () { return []; }),
            searchOpenLibrary(query).catch(function () { return []; }),
            searchSemanticScholar(query).catch(function () { return []; })
          ]).then(function (arrays) {
            var flat = [];
            arrays.forEach(function (a) { flat = flat.concat(a); });
            return flat;
          });
        } else if (tab === 'wikipedia') {
          promise = searchWikipedia(query).catch(function () { return []; });
        } else if (tab === 'web') {
          promise = searchDuckDuckGo(query).catch(function () { return []; });
        } else if (tab === 'books') {
          promise = searchOpenLibrary(query).catch(function () { return []; });
        } else if (tab === 'academic') {
          promise = searchSemanticScholar(query).catch(function () { return []; });
        } else {
          promise = Promise.resolve([]);
        }
        promise.then(function (results) {
          renderResults(results);
        }).catch(function () {
          resultsArea.innerHTML =
            '<p style="color:var(--text-dim);text-align:center;padding:24px">' +
            'search failed. check your connection.</p>';
        });
      }

      function renderResults(results) {
        resultsArea.innerHTML = '';
        if (!results.length) {
          resultsArea.innerHTML =
            '<p style="color:var(--text-dim);text-align:center;padding:24px">' +
            'no sources found. try a different query.</p>';
          return;
        }
        results.forEach(function (src) {
          var card = document.createElement('div');
          card.className = 'source-result-card';
          var badgeClass = 'source-category-badge';
          if (src.category === 'book') badgeClass += ' book';
          else if (src.category === 'web') badgeClass += ' web';
          else if (src.category === 'academic') badgeClass += ' academic';

          var snippetText = src.snippet || '';
          if (snippetText.length > 200) snippetText = snippetText.substring(0, 200) + '...';

          card.innerHTML =
            '<div class="source-result-title">' + (src.title || 'untitled') + '</div>' +
            '<span class="' + badgeClass + '">' + src.source + '</span>' +
            '<div class="source-result-snippet">' + snippetText + '</div>' +
            '<div class="source-result-actions"></div>';

          var actions = card.querySelector('.source-result-actions');

          var saveBtn = document.createElement('button');
          saveBtn.className = 'small-btn';
          saveBtn.textContent = 'save source';
          saveBtn.addEventListener('click', (function (s) {
            return function () {
              var exists = _savedSources.find(function (x) {
                return x.title === s.title && x.source === s.source;
              });
              if (exists) { toast('source already saved'); return; }
              var entry = Object.assign({}, s, {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
              });
              _savedSources.push(entry);
              saveSaved(_savedSources);
              renderSavedPanel();
              toast('source saved');
            };
          })(src));

          var citeBtn = document.createElement('button');
          citeBtn.className = 'small-btn';
          citeBtn.textContent = 'copy citation';
          citeBtn.addEventListener('click', (function (s) {
            return function () {
              var cite = citationPlainText(s, _citationFormat);
              navigator.clipboard.writeText(cite).then(function () {
                toast('citation copied (' + _citationFormat + ')');
              }).catch(function () { toast('failed to copy'); });
            };
          })(src));

          var viewBtn = document.createElement('a');
          viewBtn.className = 'small-btn';
          viewBtn.textContent = 'view';
          viewBtn.href = src.url || '#';
          viewBtn.target = '_blank';
          viewBtn.rel = 'noopener';
          viewBtn.style.textDecoration = 'none';

          actions.appendChild(saveBtn);
          actions.appendChild(citeBtn);
          if (src.url) actions.appendChild(viewBtn);
          resultsArea.appendChild(card);
        });
      }

      function renderSavedPanel() {
        savedList.innerHTML = '';
        if (!_savedSources.length) {
          savedList.innerHTML =
            '<p style="color:var(--text-dim);font-size:0.75rem">no saved sources yet</p>';
          return;
        }
        _savedSources.forEach(function (source, i) {
          var item = document.createElement('div');
          item.className = 'saved-source-item';
          var titleText = source.title || 'untitled';
          if (titleText.length > 40) titleText = titleText.substring(0, 40) + '...';

          var textSpan = document.createElement('span');
          textSpan.textContent = titleText;
          textSpan.title = citationPlainText(source, _citationFormat);
          textSpan.style.flex = '1';

          var removeBtn = document.createElement('button');
          removeBtn.className = 'remove-source';
          removeBtn.innerHTML = '&times;';
          removeBtn.addEventListener('click', (function (idx) {
            return function () {
              _savedSources.splice(idx, 1);
              saveSaved(_savedSources);
              renderSavedPanel();
              toast('source removed');
            };
          })(i));

          item.appendChild(textSpan);
          item.appendChild(removeBtn);
          savedList.appendChild(item);
        });
      }
    }

    /* ======== AI CHAT INTERFACE ======== */
    function renderAIChat(parent) {
      var chatPanel = document.createElement('div');
      chatPanel.className = 'source-ai-chat';

      var messagesArea = document.createElement('div');
      messagesArea.className = 'source-ai-messages';
      chatPanel.appendChild(messagesArea);

      var inputRow = document.createElement('div');
      inputRow.className = 'ai-input-row';
      var chatInput = document.createElement('input');
      chatInput.className = 'input-field';
      chatInput.placeholder = 'ask your research assistant...';
      chatInput.style.flex = '1';
      var sendBtn = document.createElement('button');
      sendBtn.className = 'primary-btn';
      sendBtn.textContent = 'send';
      inputRow.appendChild(chatInput);
      inputRow.appendChild(sendBtn);
      chatPanel.appendChild(inputRow);
      parent.appendChild(chatPanel);

      if (!_aiMessages.length) {
        _aiMessages.push({
          role: 'assistant',
          content: 'hi! i\'m your research assistant. tell me what you\'re looking for and ' +
            'i\'ll help you find the right sources, refine your search, or explain topics.'
        });
      }
      renderMessages();

      sendBtn.addEventListener('click', sendMessage);
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendMessage();
      });

      function sendMessage() {
        var text = chatInput.value.trim();
        if (!text) return;
        _aiMessages.push({ role: 'user', content: text });
        chatInput.value = '';
        renderMessages();

        var apiMessages = [{ role: 'system', content: AI_SYSTEM_PROMPT }];
        _aiMessages.forEach(function (m) {
          apiMessages.push({ role: m.role, content: m.content });
        });

        var typingEl = document.createElement('div');
        typingEl.className = 'ai-message assistant';
        typingEl.textContent = '...';
        typingEl.style.opacity = '0.5';
        messagesArea.appendChild(typingEl);
        messagesArea.scrollTop = messagesArea.scrollHeight;

        chatWithAI(apiMessages).then(function (response) {
          if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
          _aiMessages.push({ role: 'assistant', content: response });
          renderMessages();
        }).catch(function () {
          if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
          _aiMessages.push({
            role: 'assistant',
            content: 'sorry, i couldn\'t connect to the ai service. check your connection and try again.'
          });
          renderMessages();
        });
      }

      function renderMessages() {
        messagesArea.innerHTML = '';
        _aiMessages.forEach(function (msg) {
          var el = document.createElement('div');
          el.className = 'ai-message ' + msg.role;
          el.textContent = msg.content;
          messagesArea.appendChild(el);
        });
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    }

    /* initial body render */
    renderBody();
  }

  return render;
})();
