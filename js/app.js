/* ============================================
   null testament — core SPA engine
   ============================================ */
window.NT = window.NT || {};

(function () {
  'use strict';

  /* ---- alias ---- */
  var N = window.NT;

  /* ================================================================
     DOM HELPERS
     ================================================================ */
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    return e;
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  N.el = el; N.$ = $; N.$$ = $$;

  /* ================================================================
     TOAST
     ================================================================ */
  N.toast = function (msg, dur) {
    var box = document.getElementById('toast-container');
    if (!box) return;
    var t = el('div', { class: 'toast', text: msg });
    box.appendChild(t);
    setTimeout(function () { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; }, 10);
    setTimeout(function () {
      t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, dur || 3000);
  };

  /* ================================================================
     PERSISTENCE
     ================================================================ */
  function loadSettings() {
    try { return JSON.parse(localStorage.getItem('nt-settings') || '{}'); }
    catch (_) { return {}; }
  }
  function saveSettings(s) { localStorage.setItem('nt-settings', JSON.stringify(s)); }
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem('nt-completed') || '[]'); }
    catch (_) { return []; }
  }
  function markLessonCompleted(subj, idx) {
    var c = getCompleted();
    var key = subj + ':' + idx;
    if (c.indexOf(key) === -1) { c.push(key); localStorage.setItem('nt-completed', JSON.stringify(c)); }
  }
  function isLessonCompleted(subj, idx) { return getCompleted().indexOf(subj + ':' + idx) !== -1; }

  /* ================================================================
     LESSON HELPERS
     ================================================================ */
  function getAllLessons() {
    var result = [];
    var lessons = N.lessons || {};
    Object.keys(lessons).forEach(function (subj) {
      var s = lessons[subj];
      if (!s || !s.lessons) return;
      s.lessons.forEach(function (l, i) {
        result.push({ lesson: l, subject: subj, subjectName: s.name || subj, index: i });
      });
    });
    return result;
  }

  function getAllQuizQuestions() {
    var all = [];
    getAllLessons().forEach(function (e) {
      if (e.lesson.quiz) {
        e.lesson.quiz.forEach(function (q) {
          all.push({ question: q, subject: e.subjectName, lesson: e.lesson.title });
        });
      }
    });
    return all;
  }

  function countStats() {
    var lessons = getAllLessons();
    var subjects = {};
    lessons.forEach(function (e) { subjects[e.subject] = true; });
    return {
      lessons: lessons.length,
      subjects: Object.keys(subjects).length,
      quizzes: lessons.filter(function (e) { return e.lesson.quiz && e.lesson.quiz.length; }).length,
      tools: 7,
      games: '2000+'
    };
  }

  /* ================================================================
     SVG ICONS
     ================================================================ */
  var svgHome = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var svgGames = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z"/></svg>';
  var svgEmulators = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>';
  var svgLearn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z"/></svg>';
  var svgNotes = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
  var svgTools = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>';
  var svgWriter = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>';
  var svgSources = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var svgReference = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>';
  var svgStudy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
  var svgPlanner = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  var svgGpa = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>';
  var svgHabits = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  var svgPrivacy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  var svgSettings = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';

  /* ================================================================
     NAVIGATION
     ================================================================ */
  var NAV_PAGES = [
    { id: 'home',      label: 'home',      icon: svgHome },
    { id: 'games',     label: 'games',     icon: svgGames },
    { id: 'emulators', label: 'emulators', icon: svgEmulators },
    { id: '_divider' },
    { id: 'learn',     label: 'learn',     icon: svgLearn },
    { id: 'noteshelf', label: 'noteshelf', icon: svgNotes },
    { id: 'tools',     label: 'tools',     icon: svgTools },
    { id: 'writer',    label: 'writer',    icon: svgWriter },
    { id: 'sources',   label: 'sources',   icon: svgSources },
    { id: 'reference', label: 'reference', icon: svgReference },
    { id: 'study',     label: 'study',     icon: svgStudy },
    { id: 'planner',   label: 'planner',   icon: svgPlanner },
    { id: 'gpa',       label: 'gpa',       icon: svgGpa },
    { id: 'habits',    label: 'habits',    icon: svgHabits },
    { id: '_divider' },
    { id: 'privacy',   label: 'privacy',   icon: svgPrivacy },
    { id: 'settings',  label: 'settings',  icon: svgSettings },
  ];

  var currentPage = 'home';

  function buildSidebar() {
    var nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';
    NAV_PAGES.forEach(function (p) {
      if (p.id === '_divider') {
        nav.appendChild(el('div', { class: 'nav-divider' }));
        return;
      }
      var link = el('div', { class: 'nav-link', 'data-page': p.id });
      link.innerHTML = '<span class="nav-icon">' + p.icon + '</span><span class="nav-label">' + p.label + '</span>';
      link.addEventListener('click', function () { navigate(p.id); });
      nav.appendChild(link);
    });

    var panicBtn = document.getElementById('panic-btn');
    if (panicBtn) {
      panicBtn.addEventListener('click', function () {
        if (N.privacy && N.privacy.triggerPanic) N.privacy.triggerPanic();
      });
    }
  }

  function navigate(pageId, opts) {
    currentPage = pageId;
    $$('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-page') === pageId);
    });
    var content = document.getElementById('content');
    if (!content) return;
    content.scrollTop = 0;
    content.innerHTML = '';

    var renderer = renderers[pageId];
    if (renderer) {
      renderer(content, opts);
    } else {
      content.innerHTML = '<p style="color:var(--text-dim);padding:40px;">page not found.</p>';
    }
  }
  N.navigate = navigate;

  /* ================================================================
     RENDERER MAP
     ================================================================ */
  var renderers = {
    home:      renderHome,
    games:     function (c) { if (N.renderGames) N.renderGames(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">games module loading...</p>'; },
    emulators: function (c) { if (N.emulators && N.emulators.renderPage) N.emulators.renderPage(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">emulators module loading...</p>'; },
    learn:     renderLearn,
    noteshelf: function (c) { if (N.renderNoteshelf) N.renderNoteshelf(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">noteshelf module loading...</p>'; },
    tools:     function (c) { if (N.renderTools) N.renderTools(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">tools module loading...</p>'; },
    writer:    renderWriter,
    sources:   function (c) { if (N.renderSources) N.renderSources(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">sources module loading...</p>'; },
    reference: renderReference,
    study:     renderStudy,
    whiteboard: renderWhiteboard,
    planner:   renderPlanner,
    gpa:       renderGPA,
    habits:    function (c) { if (N.renderHabits) N.renderHabits(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">habits module loading...</p>'; },
    privacy:   function (c) { if (N.privacy && N.privacy.renderPage) N.privacy.renderPage(c); else c.innerHTML = '<p style="padding:40px;color:var(--text-dim);">privacy module loading...</p>'; },
    settings:  renderSettings,
  };

  /* ================================================================
     QUOTES
     ================================================================ */
  var QUOTES = [
    'the best defense is a good education.',
    'knowledge is the ultimate shield.',
    'stay focused. stay sharp. stay hidden.',
    'your privacy. your education. your rules.',
    'work hard in silence. let success make the noise.',
    'the only limit is the one you set for yourself.',
    'curiosity is the engine of achievement.',
    'learn today. lead tomorrow.',
    'education is the passport to the future.',
    'the mind is not a vessel to be filled, but a fire to be kindled.',
    'every expert was once a beginner.',
    'discipline is the bridge between goals and accomplishment.',
    'what you learn today shapes who you become tomorrow.',
    'privacy is not about having something to hide.',
    'a smooth sea never made a skilled sailor.',
    'the harder you work, the luckier you get.',
  ];

  /* ================================================================
     PAGE: HOME
     ================================================================ */
  function renderHome(container) {
    var stats = countStats();
    var quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    container.innerHTML = ''
      + '<div class="hero">'
      +   '<h1 class="hero-title">null testament</h1>'
      +   '<p class="hero-subtitle">the privacy shield</p>'
      +   '<p class="hero-quote" id="home-quote">"' + quote + '"</p>'
      + '</div>'
      + '<div class="quick-actions" id="home-actions"></div>'
      + '<div class="stat-bar" id="home-stats"></div>';

    var actions = [
      { icon: svgGames,   title: 'games',   desc: 'play 2000+ games',           page: 'games' },
      { icon: svgLearn,   title: 'learn',    desc: '251 lessons & quizzes',       page: 'learn' },
      { icon: svgNotes,   title: 'notes',    desc: 'take & organize notes',       page: 'noteshelf' },
      { icon: svgTools,   title: 'tools',    desc: 'calculator, timer & more',    page: 'tools' },
      { icon: svgPrivacy, title: 'privacy',  desc: 'shield settings',             page: 'privacy' },
      { icon: svgWriter,  title: 'writer',   desc: 'ai-powered writing',          page: 'writer' },
    ];

    var grid = $('#home-actions', container);
    actions.forEach(function (a) {
      var card = el('div', { class: 'action-card' });
      card.innerHTML = '<span class="card-icon">' + a.icon + '</span>'
        + '<span class="card-title">' + a.title + '</span>'
        + '<span class="card-desc">' + a.desc + '</span>';
      card.addEventListener('click', function () { navigate(a.page); });
      grid.appendChild(card);
    });

    var statsBar = $('#home-stats', container);
    var statItems = [
      { num: stats.games,    label: 'games' },
      { num: stats.lessons,  label: 'lessons' },
      { num: stats.subjects, label: 'subjects' },
      { num: stats.tools,    label: 'tools' },
    ];
    statItems.forEach(function (s) {
      var card = el('div', { class: 'stat-card' });
      var isStr = typeof s.num === 'string';
      card.innerHTML = '<span class="stat-number"' + (isStr ? '' : ' data-target="' + s.num + '"') + '>' + (isStr ? s.num : '0') + '</span><span class="stat-label">' + s.label + '</span>';
      statsBar.appendChild(card);
    });

    setTimeout(function () {
      $$('.stat-number[data-target]', container).forEach(function (numEl) {
        var target = parseInt(numEl.getAttribute('data-target')) || 0;
        if (!target) { numEl.textContent = '0'; return; }
        var cur = 0;
        var step = Math.max(1, Math.ceil(target / 30));
        var iv = setInterval(function () {
          cur += step;
          if (cur >= target) { cur = target; clearInterval(iv); }
          numEl.textContent = cur;
        }, 30);
      });
    }, 200);
  }

  /* ================================================================
     PAGE: LEARN
     ================================================================ */
  function renderLearn(container) {
    container.innerHTML = ''
      + '<div class="page-header"><h2>learn</h2><p class="page-desc">browse lessons across all subjects</p></div>'
      + '<div class="learn-controls">'
      +   '<input type="text" class="input-field" id="learn-search" placeholder="search lessons...">'
      +   '<select class="input-field" id="learn-subject"><option value="">all subjects</option></select>'
      +   '<select class="input-field" id="learn-category"><option value="">all categories</option></select>'
      + '</div>'
      + '<div class="lesson-grid" id="learn-grid"></div>'
      + '<div class="lesson-viewer hidden" id="lesson-viewer"></div>';

    var subjSel = $('#learn-subject', container);
    Object.keys(N.lessons || {}).forEach(function (key) {
      var o = el('option', { value: key, text: ((N.lessons[key] || {}).name || key).toLowerCase() });
      subjSel.appendChild(o);
    });

    function updateCategories() {
      var catSel = $('#learn-category', container);
      catSel.innerHTML = '<option value="">all categories</option>';
      var subj = subjSel.value;
      var cats = {};
      getAllLessons().forEach(function (e) {
        if (subj && e.subject !== subj) return;
        if (e.lesson.cat) cats[e.lesson.cat] = true;
      });
      Object.keys(cats).sort().forEach(function (c) {
        catSel.appendChild(el('option', { value: c, text: c.toLowerCase() }));
      });
    }

    subjSel.addEventListener('change', function () { updateCategories(); buildLessonGrid(container); });
    updateCategories();
    $('#learn-search', container).addEventListener('input', function () { buildLessonGrid(container); });
    $('#learn-category', container).addEventListener('change', function () { buildLessonGrid(container); });
    buildLessonGrid(container);
  }

  function buildLessonGrid(container) {
    var grid = $('#learn-grid', container);
    var viewer = $('#lesson-viewer', container);
    grid.innerHTML = '';
    grid.style.display = '';
    viewer.classList.add('hidden');
    var ctrl = $('.learn-controls', container);
    if (ctrl) ctrl.style.display = '';

    var search = ($('#learn-search', container) || {}).value || '';
    search = search.toLowerCase();
    var subjFilter = ($('#learn-subject', container) || {}).value || '';
    var catFilter = ($('#learn-category', container) || {}).value || '';

    getAllLessons().forEach(function (entry) {
      var l = entry.lesson;
      if (subjFilter && entry.subject !== subjFilter) return;
      if (catFilter && l.cat !== catFilter) return;
      if (search && l.title.toLowerCase().indexOf(search) === -1) return;

      var completed = isLessonCompleted(entry.subject, entry.index);
      var card = el('div', { class: 'lesson-card' });
      card.innerHTML = ''
        + '<div class="lesson-card-subject">' + entry.subjectName + '</div>'
        + '<div class="lesson-card-title">' + l.title.toLowerCase() + '</div>'
        + '<div class="lesson-card-cat">' + (l.cat || '').toLowerCase() + '</div>'
        + (completed ? '<span class="lesson-card-badge completed">done</span>' : '<span class="lesson-card-badge">new</span>');
      card.addEventListener('click', function () { openLesson(container, entry); });
      grid.appendChild(card);
    });

    if (!grid.children.length) {
      grid.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;padding:20px;">no lessons found.</p>';
    }
  }

  function openLesson(container, entry) {
    var grid = $('#learn-grid', container);
    var viewer = $('#lesson-viewer', container);
    var ctrl = $('.learn-controls', container);
    grid.style.display = 'none';
    if (ctrl) ctrl.style.display = 'none';
    viewer.classList.remove('hidden');

    var l = entry.lesson;
    viewer.innerHTML = ''
      + '<button class="back-btn" id="lesson-back">&larr; back to lessons</button>'
      + '<div class="page-header">'
      +   '<div class="lesson-card-subject" style="margin-bottom:6px;">' + entry.subjectName + '</div>'
      +   '<h2>' + l.title.toLowerCase() + '</h2>'
      +   '<p class="page-desc">' + (l.cat || '').toLowerCase() + '</p>'
      + '</div>'
      + '<div class="lesson-content">' + (l.content || '<p>no content available.</p>') + '</div>'
      + (l.quiz && l.quiz.length ? '<div class="lesson-quiz" id="lesson-quiz"></div>' : '');

    $('#lesson-back', viewer).addEventListener('click', function () { buildLessonGrid(container); });
    if (l.quiz && l.quiz.length) renderQuiz($('#lesson-quiz', viewer), l.quiz, entry.subject, entry.index);
  }

  function renderQuiz(quizEl, questions, subj, idx) {
    quizEl.innerHTML = '<h3 style="font-size:1.1rem;color:var(--accent);margin-bottom:16px;">quiz</h3>';
    var totalQ = questions.length;
    var answered = 0;
    var correct = 0;

    questions.forEach(function (q, qi) {
      var qDiv = el('div', { class: 'quiz-question' });
      qDiv.innerHTML = '<div class="quiz-q">' + (qi + 1) + '. ' + q.q + '</div><div class="quiz-options" data-qi="' + qi + '"></div>';
      var optsDiv = qDiv.querySelector('.quiz-options');

      q.options.forEach(function (opt, oi) {
        var btn = el('button', { class: 'quiz-option', text: opt });
        btn.addEventListener('click', function () {
          if (btn.classList.contains('disabled')) return;
          answered++;
          var isCorrect = (oi === q.answer);
          if (isCorrect) correct++;
          $$('.quiz-option', optsDiv).forEach(function (b, bi) {
            b.classList.add('disabled');
            if (bi === q.answer) b.classList.add('correct');
            else if (bi === oi && !isCorrect) b.classList.add('wrong');
          });
          if (answered === totalQ) {
            markLessonCompleted(subj, idx);
            var scoreDiv = el('div', { class: 'quiz-score' });
            scoreDiv.textContent = 'score: ' + correct + '/' + totalQ + (correct === totalQ ? ' — perfect!' : '');
            quizEl.appendChild(scoreDiv);
            N.toast('lesson completed! ' + correct + '/' + totalQ);
          }
        });
        optsDiv.appendChild(btn);
      });
      quizEl.appendChild(qDiv);
    });
  }

  /* ================================================================
     PAGE: WRITER
     ================================================================ */
  function renderWriter(container) {
    var tabs = [
      { id: 'essay',      label: 'essay writer' },
      { id: 'humanizer',  label: 'humanizer' },
      { id: 'summarizer', label: 'summarizer' },
      { id: 'outliner',   label: 'outliner' },
    ];

    container.innerHTML = ''
      + '<div class="page-header"><h2>writer</h2><p class="page-desc">ai-powered writing tools</p></div>'
      + '<div class="writer-tabs" id="writer-tabs"></div>'
      + '<div id="writer-sections"></div>';

    var tabBar = $('#writer-tabs', container);
    var sections = $('#writer-sections', container);

    tabs.forEach(function (t, i) {
      var btn = el('button', { class: 'writer-tab' + (i === 0 ? ' active' : ''), 'data-tab': t.id, text: t.label });
      btn.addEventListener('click', function () {
        $$('.writer-tab', container).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        $$('.writer-section', container).forEach(function (s) { s.classList.remove('active'); });
        var sec = $('#writer-' + t.id, container);
        if (sec) sec.classList.add('active');
      });
      tabBar.appendChild(btn);
    });

    sections.innerHTML = ''
      + '<div class="writer-section active" id="writer-essay">'
      +   '<div class="writer-options">'
      +     '<input type="text" class="input-field" id="essay-topic" placeholder="essay topic..." style="flex:2;min-width:200px;">'
      +     '<select class="input-field" id="essay-length"><option value="short">short (~300 words)</option><option value="medium">medium (~600 words)</option><option value="long">long (~1000 words)</option></select>'
      +     '<select class="input-field" id="essay-tone"><option value="formal">formal</option><option value="casual">casual</option><option value="academic">academic</option><option value="persuasive">persuasive</option></select>'
      +     '<button class="primary-btn" id="essay-go">generate</button>'
      +   '</div>'
      +   '<div class="writer-output" id="essay-output"></div>'
      + '</div>'
      + '<div class="writer-section" id="writer-humanizer">'
      +   '<textarea class="textarea-field" id="humanizer-input" rows="6" placeholder="paste ai-generated text here..."></textarea>'
      +   '<div class="writer-options" style="margin-top:10px;"><button class="primary-btn" id="humanizer-go">humanize</button></div>'
      +   '<div class="writer-output" id="humanizer-output"></div>'
      + '</div>'
      + '<div class="writer-section" id="writer-summarizer">'
      +   '<textarea class="textarea-field" id="summarizer-input" rows="6" placeholder="paste text to summarize..."></textarea>'
      +   '<div class="writer-options" style="margin-top:10px;"><button class="primary-btn" id="summarizer-go">summarize</button></div>'
      +   '<div class="writer-output" id="summarizer-output"></div>'
      + '</div>'
      + '<div class="writer-section" id="writer-outliner">'
      +   '<input type="text" class="input-field" id="outliner-topic" placeholder="essay topic for outline..." style="width:100%;margin-bottom:10px;">'
      +   '<div class="writer-options"><button class="primary-btn" id="outliner-go">create outline</button></div>'
      +   '<div class="writer-output" id="outliner-output"></div>'
      + '</div>';

    $('#essay-go', container).addEventListener('click', function () {
      var topic = ($('#essay-topic', container).value || '').trim();
      var length = ($('#essay-length', container) || {}).value || 'medium';
      var tone = ($('#essay-tone', container) || {}).value || 'formal';
      if (!topic) { N.toast('enter a topic first'); return; }
      var wordTarget = length === 'short' ? 300 : length === 'medium' ? 600 : 1000;
      callWriter('Write a ' + tone + ' essay about "' + topic + '" in approximately ' + wordTarget + ' words. Do not include a title heading. Use clean paragraph formatting. Do not use markdown.', '#essay-output', container);
    });

    $('#humanizer-go', container).addEventListener('click', function () {
      var text = ($('#humanizer-input', container).value || '').trim();
      if (!text) { N.toast('paste some text first'); return; }
      callWriter('Rewrite the following text to sound more naturally human-written. Vary sentence length, add subtle imperfections, use natural transitions, and remove any overly formal or robotic phrasing. Keep the same meaning and approximate length. Do not use markdown:\n\n' + text, '#humanizer-output', container);
    });

    $('#summarizer-go', container).addEventListener('click', function () {
      var text = ($('#summarizer-input', container).value || '').trim();
      if (!text) { N.toast('paste some text first'); return; }
      callWriter('Summarize the following text concisely, keeping only the key points. Use plain text, no markdown:\n\n' + text, '#summarizer-output', container);
    });

    $('#outliner-go', container).addEventListener('click', function () {
      var topic = ($('#outliner-topic', container).value || '').trim();
      if (!topic) { N.toast('enter a topic first'); return; }
      callWriter('Create a detailed essay outline for the topic "' + topic + '". Include a thesis statement, main sections with sub-points, and a conclusion. Use numbered format. Do not use markdown.', '#outliner-output', container);
    });
  }

  function callWriter(prompt, outputSel, container) {
    var outputEl = $(outputSel, container);
    if (!outputEl) return;
    outputEl.innerHTML = '<div class="spinner"></div> <span style="color:var(--text-dim);font-size:0.82rem;">generating...</span>';

    fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'openai' }),
    })
    .then(function (res) { return res.text(); })
    .then(function (text) {
      outputEl.textContent = text;
      N.toast('generation complete');
    })
    .catch(function (err) {
      outputEl.textContent = 'error: ' + (err.message || 'request failed');
    });
  }

  /* ================================================================
     PAGE: REFERENCE
     ================================================================ */
  function renderReference(container) {
    var tabs = [
      { id: 'formulas',  label: 'formulas' },
      { id: 'periodic',  label: 'periodic table' },
      { id: 'constants', label: 'constants' },
      { id: 'grammar',   label: 'grammar' },
      { id: 'timelines', label: 'timelines' },
    ];

    container.innerHTML = ''
      + '<div class="page-header"><h2>reference</h2><p class="page-desc">quick lookup tables & guides</p></div>'
      + '<div class="reference-tabs" id="ref-tabs"></div>'
      + '<div class="reference-content" id="ref-content"></div>';

    var tabBar = $('#ref-tabs', container);
    tabs.forEach(function (t, i) {
      var btn = el('button', { class: 'ref-tab' + (i === 0 ? ' active' : ''), text: t.label, 'data-ref': t.id });
      btn.addEventListener('click', function () {
        $$('.ref-tab', container).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        showRefContent(container, t.id);
      });
      tabBar.appendChild(btn);
    });
    showRefContent(container, 'formulas');
  }

  function showRefContent(container, tabId) {
    var refEl = $('#ref-content', container);
    var d = N.data || {};

    if (tabId === 'formulas') {
      var formulas = d.formulas || [
        { cat: 'algebra', items: ['quadratic formula: x = (-b ± √(b²-4ac)) / 2a', 'slope: m = (y₂-y₁)/(x₂-x₁)', 'distance: d = √((x₂-x₁)²+(y₂-y₁)²)'] },
        { cat: 'geometry', items: ['area of circle: A = πr²', 'circumference: C = 2πr', 'pythagorean theorem: a²+b²=c²'] },
        { cat: 'trigonometry', items: ['sin(θ) = opp/hyp', 'cos(θ) = adj/hyp', 'tan(θ) = opp/adj'] },
      ];
      var html = '';
      formulas.forEach(function (f) {
        html += '<h3>' + f.cat + '</h3><table><tbody>';
        f.items.forEach(function (item) { html += '<tr><td>' + item + '</td></tr>'; });
        html += '</tbody></table>';
      });
      refEl.innerHTML = html;

    } else if (tabId === 'periodic') {
      var elements = d.periodicTable || [];
      var html2 = '<h3>periodic table</h3><table><thead><tr><th>#</th><th>symbol</th><th>name</th><th>mass</th></tr></thead><tbody>';
      if (elements.length) {
        elements.forEach(function (e) { html2 += '<tr><td>' + e.n + '</td><td>' + e.sym + '</td><td>' + e.name + '</td><td>' + e.mass + '</td></tr>'; });
      } else {
        html2 += '<tr><td colspan="4" style="color:var(--text-dim)">data loading...</td></tr>';
      }
      refEl.innerHTML = html2 + '</tbody></table>';

    } else if (tabId === 'constants') {
      var consts = d.constants || [];
      var html3 = '<h3>physical & mathematical constants</h3><table><thead><tr><th>name</th><th>symbol</th><th>value</th></tr></thead><tbody>';
      if (consts.length) {
        consts.forEach(function (c) { html3 += '<tr><td>' + c.name + '</td><td>' + c.sym + '</td><td>' + c.val + '</td></tr>'; });
      } else {
        html3 += '<tr><td colspan="3" style="color:var(--text-dim)">data loading...</td></tr>';
      }
      refEl.innerHTML = html3 + '</tbody></table>';

    } else if (tabId === 'grammar') {
      var grammar = d.grammar || [];
      var html4 = '<h3>grammar quick reference</h3><table><thead><tr><th>rule</th><th>description</th></tr></thead><tbody>';
      if (grammar.length) {
        grammar.forEach(function (g) { html4 += '<tr><td>' + g.rule + '</td><td>' + g.desc + '</td></tr>'; });
      } else {
        html4 += '<tr><td colspan="2" style="color:var(--text-dim)">data loading...</td></tr>';
      }
      refEl.innerHTML = html4 + '</tbody></table>';

    } else if (tabId === 'timelines') {
      var timelines = d.timelines || [];
      var html5 = '<h3>historical timelines</h3>';
      if (timelines.length) {
        timelines.forEach(function (t) {
          html5 += '<h3>' + t.era + '</h3><table><tbody>';
          t.events.forEach(function (e) { html5 += '<tr><td>' + e + '</td></tr>'; });
          html5 += '</tbody></table>';
        });
      } else {
        html5 += '<p style="color:var(--text-dim)">data loading...</p>';
      }
      refEl.innerHTML = html5;
    }
  }

  /* ================================================================
     PAGE: STUDY
     ================================================================ */
  function renderStudy(container) {
    var tabs = [
      { id: 'flashcards', label: 'flashcards' },
      { id: 'quickquiz',  label: 'quick quiz' },
      { id: 'review',     label: 'review tracker' },
    ];

    container.innerHTML = ''
      + '<div class="page-header"><h2>study</h2><p class="page-desc">flashcards, quizzes & progress tracking</p></div>'
      + '<div class="study-tabs" id="study-tabs"></div>'
      + '<div class="study-content" id="study-content"></div>';

    var tabBar = $('#study-tabs', container);
    var contentEl = $('#study-content', container);
    var activeTab = 'flashcards';

    tabs.forEach(function (t) {
      var btn = el('button', { class: 'study-tab' + (t.id === activeTab ? ' active' : ''), text: t.label, 'data-study': t.id });
      btn.addEventListener('click', function () {
        activeTab = t.id;
        $$('.study-tab', container).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderStudyTab(contentEl, t.id);
      });
      tabBar.appendChild(btn);
    });
    renderStudyTab(contentEl, activeTab);
  }

  function renderStudyTab(contentEl, tabId) {
    contentEl.innerHTML = '';

    if (tabId === 'flashcards') {
      var allQ = getAllQuizQuestions();
      if (!allQ.length) { contentEl.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;padding:20px;">no quiz questions available yet.</p>'; return; }
      var shuffled = allQ.slice().sort(function () { return Math.random() - 0.5; });
      var currentIdx = 0;
      var showAnswer = false;

      function renderCard() {
        var q = shuffled[currentIdx];
        contentEl.innerHTML = ''
          + '<div class="flashcard">'
          +   '<div class="flashcard-inner" id="fc-inner">'
          +     (showAnswer
                  ? '<div><span style="color:var(--text-dim);font-size:0.72rem;display:block;margin-bottom:8px;">answer</span>' + q.question.options[q.question.answer] + '</div>'
                  : '<div><span style="color:var(--text-dim);font-size:0.72rem;display:block;margin-bottom:8px;">' + q.subject.toLowerCase() + '</span>' + q.question.q + '</div>')
          +   '</div>'
          +   '<div class="flashcard-controls">'
          +     '<button class="small-btn" id="fc-prev">&larr; prev</button>'
          +     '<button class="small-btn primary" id="fc-flip">flip</button>'
          +     '<button class="small-btn" id="fc-next">next &rarr;</button>'
          +   '</div>'
          +   '<p style="text-align:center;font-size:0.72rem;color:var(--text-dim);margin-top:8px;">' + (currentIdx + 1) + ' / ' + shuffled.length + '</p>'
          + '</div>';

        $('#fc-flip', contentEl).addEventListener('click', function () { showAnswer = !showAnswer; renderCard(); });
        $('#fc-prev', contentEl).addEventListener('click', function () { showAnswer = false; currentIdx = (currentIdx - 1 + shuffled.length) % shuffled.length; renderCard(); });
        $('#fc-next', contentEl).addEventListener('click', function () { showAnswer = false; currentIdx = (currentIdx + 1) % shuffled.length; renderCard(); });
        $('#fc-inner', contentEl).addEventListener('click', function () { showAnswer = !showAnswer; renderCard(); });
      }
      renderCard();

    } else if (tabId === 'quickquiz') {
      var allQ2 = getAllQuizQuestions();
      if (allQ2.length < 1) { contentEl.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;padding:20px;">no quiz questions available.</p>'; return; }
      var shuffled2 = allQ2.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 10);
      var totalQ = shuffled2.length;
      var answered2 = 0;
      var correct2 = 0;

      contentEl.innerHTML = '<h3 style="font-size:1rem;color:var(--accent);margin-bottom:16px;">quick quiz (' + totalQ + ' questions)</h3>';

      shuffled2.forEach(function (item, qi) {
        var q = item.question;
        var qDiv = el('div', { class: 'quiz-question' });
        qDiv.innerHTML = '<div class="quiz-q"><span style="color:var(--text-dim);font-size:0.7rem;">' + item.subject.toLowerCase() + '</span><br>' + (qi + 1) + '. ' + q.q + '</div><div class="quiz-options" data-qi="' + qi + '"></div>';
        var optsDiv = qDiv.querySelector('.quiz-options');

        q.options.forEach(function (opt, oi) {
          var btn = el('button', { class: 'quiz-option', text: opt });
          btn.addEventListener('click', function () {
            if (btn.classList.contains('disabled')) return;
            answered2++;
            if (oi === q.answer) correct2++;
            $$('.quiz-option', optsDiv).forEach(function (b, bi) {
              b.classList.add('disabled');
              if (bi === q.answer) b.classList.add('correct');
              else if (bi === oi && oi !== q.answer) b.classList.add('wrong');
            });
            if (answered2 === totalQ) {
              var scoreDiv = el('div', { class: 'quiz-score' });
              scoreDiv.textContent = 'final score: ' + correct2 + '/' + totalQ;
              contentEl.appendChild(scoreDiv);
              N.toast('quiz finished! ' + correct2 + '/' + totalQ);
            }
          });
          optsDiv.appendChild(btn);
        });
        contentEl.appendChild(qDiv);
      });

    } else if (tabId === 'review') {
      var completed = getCompleted();
      var subjects = N.lessons || {};
      var html = '<h3 style="font-size:1rem;color:var(--accent);margin-bottom:16px;">completion by subject</h3>';

      Object.keys(subjects).forEach(function (subj) {
        var s = subjects[subj];
        if (!s || !s.lessons) return;
        var total = s.lessons.length;
        var done = 0;
        s.lessons.forEach(function (_, i) { if (completed.indexOf(subj + ':' + i) !== -1) done++; });
        var pct = total > 0 ? Math.round((done / total) * 100) : 0;
        html += '<div style="margin-bottom:20px;"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.85rem;color:var(--text);">' + (s.name || subj).toLowerCase() + '</span><span style="font-size:0.75rem;color:var(--text-muted);">' + done + '/' + total + ' lessons</span></div><div class="progress-bar-container" style="margin-top:6px;"><div class="progress-bar-fill" style="width:' + pct + '%;"></div></div></div>';
      });

      html += '<div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border);"><span style="font-size:0.82rem;color:var(--text-muted);">total completed: <strong style="color:var(--accent);">' + completed.length + '</strong> lessons</span></div>';
      contentEl.innerHTML = html;
    }
  }

  /* ================================================================
     PAGE: WHITEBOARD
     ================================================================ */
  function renderWhiteboard(container) {
    container.innerHTML = ''
      + '<div class="page-header"><h2>whiteboard</h2><p class="page-desc">freeform canvas drawing tool</p></div>'
      + '<div class="whiteboard-toolbar" id="wb-toolbar">'
      +   '<button class="wb-tool active" id="wb-pen">pen</button>'
      +   '<button class="wb-tool" id="wb-eraser">eraser</button>'
      +   '<label style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--text-muted);">size <input type="range" class="wb-slider" id="wb-size" min="1" max="30" value="3"></label>'
      +   '<input type="color" class="wb-color" id="wb-color" value="#f0f0f0">'
      +   '<button class="wb-tool" id="wb-clear">clear</button>'
      +   '<button class="wb-tool" id="wb-save">save</button>'
      + '</div>'
      + '<canvas class="whiteboard-canvas" id="wb-canvas"></canvas>';

    var canvas = $('#wb-canvas', container);
    var ctx = canvas.getContext('2d');

    requestAnimationFrame(function () {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    var drawing = false, tool = 'pen', brushSize = 3, brushColor = '#f0f0f0';

    $('#wb-pen', container).addEventListener('click', function () { tool = 'pen'; $$('.wb-tool', container).forEach(function (t) { t.classList.remove('active'); }); this.classList.add('active'); });
    $('#wb-eraser', container).addEventListener('click', function () { tool = 'eraser'; $$('.wb-tool', container).forEach(function (t) { t.classList.remove('active'); }); this.classList.add('active'); });
    $('#wb-size', container).addEventListener('input', function () { brushSize = parseInt(this.value); });
    $('#wb-color', container).addEventListener('input', function () { brushColor = this.value; });
    $('#wb-clear', container).addEventListener('click', function () { ctx.fillStyle = '#111111'; ctx.fillRect(0, 0, canvas.width, canvas.height); N.toast('canvas cleared'); });
    $('#wb-save', container).addEventListener('click', function () {
      var link = document.createElement('a');
      link.download = 'nt-whiteboard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      N.toast('whiteboard saved');
    });

    function getPos(e) {
      var r = canvas.getBoundingClientRect();
      if (e.touches) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function startDraw(e) { drawing = true; var p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    function draw(e) {
      if (!drawing) return; e.preventDefault(); var p = getPos(e);
      ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = tool === 'eraser' ? '#111111' : brushColor;
      ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    function stopDraw() { drawing = false; ctx.beginPath(); }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
  }

  /* ================================================================
     PAGE: PLANNER
     ================================================================ */
  function renderPlanner(container) {
    container.innerHTML = ''
      + '<div class="page-header"><h2>planner</h2><p class="page-desc">track assignments & tasks</p></div>'
      + '<div class="planner-controls">'
      +   '<button class="primary-btn" id="planner-add">+ add task</button>'
      +   '<select class="input-field" id="planner-filter"><option value="all">all tasks</option><option value="active">active</option><option value="completed">completed</option><option value="overdue">overdue</option></select>'
      + '</div>'
      + '<div class="planner-list" id="planner-list"></div>'
      + '<div class="modal hidden" id="planner-modal"><div class="modal-content">'
      +   '<h3>add task</h3>'
      +   '<input type="text" class="input-field" id="task-name" placeholder="task name...">'
      +   '<input type="text" class="input-field" id="task-subject" placeholder="subject...">'
      +   '<input type="date" class="input-field" id="task-due">'
      +   '<select class="input-field" id="task-priority"><option value="low">low priority</option><option value="medium">medium priority</option><option value="high">high priority</option></select>'
      +   '<textarea class="textarea-field" id="task-notes" rows="2" placeholder="notes..."></textarea>'
      +   '<div class="modal-actions"><button class="small-btn" id="task-cancel">cancel</button><button class="small-btn primary" id="task-save">save</button></div>'
      + '</div></div>';

    function getTasks() { try { return JSON.parse(localStorage.getItem('nt-tasks') || '[]'); } catch (_) { return []; } }
    function saveTasks(t) { localStorage.setItem('nt-tasks', JSON.stringify(t)); }

    function renderTasks() {
      var list = $('#planner-list', container);
      var filter = ($('#planner-filter', container) || {}).value || 'all';
      var tasks = getTasks();
      var now = new Date().toISOString().split('T')[0];
      list.innerHTML = '';

      tasks.forEach(function (t, i) {
        var isOverdue = t.due && t.due < now && !t.done;
        if (filter === 'active' && t.done) return;
        if (filter === 'completed' && !t.done) return;
        if (filter === 'overdue' && !isOverdue) return;

        var item = el('div', { class: 'planner-item' + (t.done ? ' completed' : '') + (isOverdue ? ' overdue' : '') });
        item.innerHTML = ''
          + '<div class="planner-checkbox' + (t.done ? ' checked' : '') + '" data-idx="' + i + '"></div>'
          + '<div class="planner-item-info">'
          +   '<div class="planner-item-name">' + (t.name || 'untitled').toLowerCase() + '</div>'
          +   '<div class="planner-item-meta">' + (t.subject ? t.subject.toLowerCase() + ' &middot; ' : '') + (t.due ? 'due: ' + t.due : 'no due date') + '</div>'
          + '</div>'
          + '<span class="planner-item-priority ' + (t.priority || 'low') + '">' + (t.priority || 'low') + '</span>'
          + '<button class="danger-btn" data-del="' + i + '" style="padding:3px 8px;font-size:0.7rem;">&times;</button>';

        item.querySelector('.planner-checkbox').addEventListener('click', function () {
          var tasks2 = getTasks(); tasks2[i].done = !tasks2[i].done; saveTasks(tasks2); renderTasks();
          N.toast(tasks2[i].done ? 'task completed' : 'task reopened');
        });
        item.querySelector('[data-del]').addEventListener('click', function () {
          var tasks2 = getTasks(); tasks2.splice(i, 1); saveTasks(tasks2); renderTasks(); N.toast('task deleted');
        });
        list.appendChild(item);
      });

      if (!list.children.length) list.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;padding:12px;">no tasks.</p>';
    }

    $('#planner-filter', container).addEventListener('change', renderTasks);
    $('#planner-add', container).addEventListener('click', function () {
      $('#planner-modal', container).classList.remove('hidden');
      $('#task-name', container).value = '';
      $('#task-subject', container).value = '';
      $('#task-due', container).value = '';
      $('#task-priority', container).value = 'low';
      $('#task-notes', container).value = '';
    });
    $('#task-cancel', container).addEventListener('click', function () { $('#planner-modal', container).classList.add('hidden'); });
    $('#task-save', container).addEventListener('click', function () {
      var name = ($('#task-name', container).value || '').trim();
      if (!name) { N.toast('enter a task name'); return; }
      var tasks = getTasks();
      tasks.push({
        name: name,
        subject: ($('#task-subject', container).value || '').trim(),
        due: ($('#task-due', container) || {}).value || '',
        priority: ($('#task-priority', container) || {}).value || 'low',
        notes: ($('#task-notes', container).value || '').trim(),
        done: false,
      });
      saveTasks(tasks);
      $('#planner-modal', container).classList.add('hidden');
      renderTasks();
      N.toast('task added');
    });
    $('#planner-modal', container).addEventListener('click', function (e) { if (e.target === this) this.classList.add('hidden'); });
    renderTasks();
  }

  /* ================================================================
     PAGE: GPA
     ================================================================ */
  function renderGPA(container) {
    var GRADE_MAP = { 'a+': 4.0, 'a': 4.0, 'a-': 3.7, 'b+': 3.3, 'b': 3.0, 'b-': 2.7, 'c+': 2.3, 'c': 2.0, 'c-': 1.7, 'd+': 1.3, 'd': 1.0, 'd-': 0.7, 'f': 0.0 };
    var gradeOptions = Object.keys(GRADE_MAP).map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');

    container.innerHTML = ''
      + '<div class="page-header"><h2>gpa tracker</h2><p class="page-desc">calculate your weighted gpa</p></div>'
      + '<div class="gpa-layout">'
      +   '<div class="gpa-input-section">'
      +     '<div class="gpa-row gpa-header-row"><span>course</span><span>grade</span><span>credits</span><span></span></div>'
      +     '<div id="gpa-rows"></div>'
      +     '<div style="margin-top:12px;display:flex;gap:8px;">'
      +       '<button class="small-btn" id="gpa-add-row">+ add course</button>'
      +       '<button class="small-btn primary" id="gpa-calc">calculate</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="gpa-result-section">'
      +     '<div class="gpa-circle"><span class="gpa-number" id="gpa-number">0.00</span><span class="gpa-label">gpa</span></div>'
      +     '<div class="gpa-stats" id="gpa-stats">add courses and calculate</div>'
      +   '</div>'
      + '</div>';

    function getCourses() { try { return JSON.parse(localStorage.getItem('nt-gpa') || '[]'); } catch (_) { return []; } }
    function saveCourses(c) { localStorage.setItem('nt-gpa', JSON.stringify(c)); }

    function addRow(course) {
      var rows = $('#gpa-rows', container);
      var row = el('div', { class: 'gpa-row' });
      row.innerHTML = '<input type="text" class="input-field gpa-course" value="' + (course ? (course.name || '') : '') + '" placeholder="course name">'
        + '<select class="input-field gpa-grade">' + gradeOptions + '</select>'
        + '<input type="number" class="input-field gpa-credits" value="' + (course ? (course.credits || 3) : 3) + '" min="0" max="12" step="0.5">'
        + '<button class="remove-row">&times;</button>';
      if (course && course.grade) { var sel = row.querySelector('.gpa-grade'); if (sel) sel.value = course.grade; }
      row.querySelector('.remove-row').addEventListener('click', function () { row.remove(); });
      rows.appendChild(row);
    }

    var saved = getCourses();
    if (saved.length) saved.forEach(addRow); else addRow();

    $('#gpa-add-row', container).addEventListener('click', function () { addRow(); });
    $('#gpa-calc', container).addEventListener('click', function () {
      var rowEls = $$('.gpa-row:not(.gpa-header-row)', container);
      var courses = [], totalPoints = 0, totalCredits = 0;

      rowEls.forEach(function (row) {
        var name = (row.querySelector('.gpa-course') || {}).value || '';
        var grade = (row.querySelector('.gpa-grade') || {}).value || 'a';
        var credits = parseFloat((row.querySelector('.gpa-credits') || {}).value) || 0;
        courses.push({ name: name, grade: grade, credits: credits });
        var pts = GRADE_MAP[grade] !== undefined ? GRADE_MAP[grade] : 0;
        totalPoints += pts * credits;
        totalCredits += credits;
      });

      saveCourses(courses);
      var gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
      $('#gpa-number', container).textContent = gpa.toFixed(2);
      $('#gpa-stats', container).innerHTML = '<span>' + courses.length + '</span> courses &middot; <span>' + totalCredits + '</span> total credits';
      N.toast('gpa calculated: ' + gpa.toFixed(2));
    });
  }

  /* ================================================================
     PAGE: SETTINGS
     ================================================================ */
  function renderSettings(container) {
    var settings = loadSettings();

    container.innerHTML = ''
      + '<div class="page-header"><h2>settings</h2><p class="page-desc">customize your experience</p></div>'
      + '<div class="settings-list">'
      +   '<div class="setting-item">'
      +     '<div class="setting-info"><span class="setting-name">about:blank launcher</span><span class="setting-desc">open null testament in an about:blank tab for URL privacy</span></div>'
      +     '<a href="launcher.html" target="_blank" class="small-btn primary" style="text-decoration:none;">launch</a>'
      +   '</div>'
      +   '<div class="setting-item">'
      +     '<div class="setting-info"><span class="setting-name">export all data</span><span class="setting-desc">download all saved data as JSON</span></div>'
      +     '<button class="small-btn" id="set-export">export</button>'
      +   '</div>'
      +   '<div class="setting-item">'
      +     '<div class="setting-info"><span class="setting-name">import data</span><span class="setting-desc">restore from a previously exported JSON file</span></div>'
      +     '<button class="small-btn" id="set-import">import</button>'
      +     '<input type="file" id="set-import-file" accept=".json" style="display:none;">'
      +   '</div>'
      +   '<div class="setting-item">'
      +     '<div class="setting-info"><span class="setting-name">clear all data</span><span class="setting-desc">erase all saved notes, tasks, gpa, progress</span></div>'
      +     '<button class="danger-btn" id="set-reset">clear</button>'
      +   '</div>'
      +   '<div class="setting-item">'
      +     '<div class="setting-info"><span class="setting-name">about</span><span class="setting-desc">null testament v1.0 — the privacy shield</span></div>'
      +   '</div>'
      + '</div>';

    $('#set-export', container).addEventListener('click', function () {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('nt-') === 0) data[key] = localStorage.getItem(key);
      }
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'null-testament-data.json';
      a.click();
      URL.revokeObjectURL(a.href);
      N.toast('data exported');
    });

    $('#set-import', container).addEventListener('click', function () { $('#set-import-file', container).click(); });
    $('#set-import-file', container).addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          Object.keys(data).forEach(function (key) { localStorage.setItem(key, data[key]); });
          N.toast('data imported successfully');
        } catch (err) { N.toast('invalid file format'); }
      };
      reader.readAsText(file);
    });

    $('#set-reset', container).addEventListener('click', function () {
      if (!confirm('are you sure? this will erase all saved data.')) return;
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('nt-') === 0) keys.push(key);
      }
      keys.forEach(function (k) { localStorage.removeItem(k); });
      N.toast('all data has been reset');
      renderSettings(container);
    });
  }

  /* ================================================================
     INIT
     ================================================================ */
  function init() {
    /* splash */
    var splash = document.getElementById('splash-overlay');
    if (splash) {
      setTimeout(function () {
        splash.style.opacity = '0';
        setTimeout(function () { splash.style.display = 'none'; }, 400);
      }, 2500);
    }

    /* sidebar */
    buildSidebar();

    /* privacy shield init */
    if (N.privacy) {
      if (N.privacy.restoreCloak) N.privacy.restoreCloak();
      var settings = loadSettings();
      if (settings.extensionMonitor !== false && N.privacy.startMonitor) N.privacy.startMonitor();
    }

    /* panic key listener */
    document.addEventListener('keydown', function (e) {
      var key = '`';
      try { key = N.privacy.getPanicKey ? N.privacy.getPanicKey() : '`'; } catch (_) {}
      if (e.key === key && !e.ctrlKey && !e.altKey && !e.metaKey) {
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
        e.preventDefault();
        if (N.privacy && N.privacy.triggerPanic) N.privacy.triggerPanic();
      }
    });

    /* game overlay controls */
    var gameClose = document.getElementById('game-close');
    if (gameClose) {
      gameClose.addEventListener('click', function () {
        var overlay = document.getElementById('game-overlay');
        var frame = document.getElementById('game-frame');
        if (overlay) { overlay.classList.remove('active'); overlay.classList.add('hidden'); }
        if (frame) frame.src = 'about:blank';
      });
    }

    var gameFS = document.getElementById('game-fullscreen');
    if (gameFS) {
      gameFS.addEventListener('click', function () {
        var frame = document.getElementById('game-frame');
        if (frame && frame.requestFullscreen) frame.requestFullscreen();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var overlay = document.getElementById('game-overlay');
        if (overlay && overlay.classList.contains('active')) {
          overlay.classList.remove('active');
          overlay.classList.add('hidden');
          var frame = document.getElementById('game-frame');
          if (frame) frame.src = 'about:blank';
        }
      }
    });

    /* navigate to home */
    navigate('home');
  }

  document.addEventListener('DOMContentLoaded', init);

})();
