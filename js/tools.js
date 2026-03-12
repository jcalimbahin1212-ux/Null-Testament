/* ============================================
   null testament — tools module
   provides window.NT.renderTools(container)
   ============================================ */
window.NT = window.NT || {};

window.NT.renderTools = (function () {
  'use strict';

  /* ---------- shared helpers ---------- */
  var toast = function (m) { if (window.NT && window.NT.toast) window.NT.toast(m); };
  var uid = function () { return Math.random().toString(36).slice(2, 10); };

  /* ---------- svg icon helpers ---------- */
  function svgCalc () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="16" y2="18"/></svg>'; }
  function svgRuler () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 010 3.4l-2.6 2.6a2.4 2.4 0 01-3.4 0L2.7 8.7a2.4 2.4 0 010-3.4l2.6-2.6a2.4 2.4 0 013.4 0z"/><line x1="14.5" y1="12.5" x2="11" y2="16"/><line x1="11" y1="9" x2="7.5" y2="12.5"/><line x1="8" y1="6" x2="4.5" y2="9.5"/><line x1="17.5" y1="15.5" x2="14" y2="19"/></svg>'; }
  function svgClock () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'; }
  function svgStopwatch () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="9"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="16.24" y1="7.76" x2="14.12" y2="9.88"/><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="2" x2="12" y2="4"/></svg>'; }
  function svgGraph () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="3" x2="3" y2="21"/><line x1="3" y1="21" x2="21" y2="21"/><path d="M3 17l4-4 4 4 6-8 4 4"/></svg>'; }
  function svgTranslate () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 0"/><path d="M8 5v3"/><path d="M5 11c.5 2.5 3 4 6 4"/><path d="M11 8c-.4 3-2.6 5.5-6 7"/><path d="M13 18l2-5 2 5"/><path d="M13.5 16.5h3"/></svg>'; }
  function svgBook () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="13" y2="11"/></svg>'; }
  function svgFlashcard () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'; }
  function svgPomodoro () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="9"/><polyline points="12 9 12 13 15 15"/><path d="M9 2L12 4 15 2"/></svg>'; }
  function svgWordCount () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>'; }
  function svgCitation () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17h3l2-4V7H5v6h3"/><path d="M15 17h3l2-4V7h-6v6h3"/></svg>'; }
  function svgDice () { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/></svg>'; }

  /* ---------- tool definitions ---------- */
  var TOOLS = [
    { id: 'calculator',       name: 'calculator',         icon: svgCalc },
    { id: 'unit-converter',   name: 'unit converter',     icon: svgRuler },
    { id: 'timer',            name: 'timer',              icon: svgClock },
    { id: 'stopwatch',        name: 'stopwatch',          icon: svgStopwatch },
    { id: 'grapher',          name: 'grapher',            icon: svgGraph },
    { id: 'translator',       name: 'translator',         icon: svgTranslate },
    { id: 'dictionary',       name: 'dictionary',         icon: svgBook },
    { id: 'flashcard-maker',  name: 'flashcard maker',    icon: svgFlashcard },
    { id: 'pomodoro',         name: 'pomodoro timer',     icon: svgPomodoro },
    { id: 'word-counter',     name: 'word counter',       icon: svgWordCount },
    { id: 'citation-gen',     name: 'citation generator', icon: svgCitation },
    { id: 'randomizer',       name: 'randomizer',         icon: svgDice }
  ];

  /* ---------- format helpers ---------- */
  function formatTime (totalSeconds) {
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = Math.floor(totalSeconds % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function formatStopwatch (ms) {
    var h = Math.floor(ms / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    var ml = ms % 1000;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(ml).padStart(3, '0');
  }

  function safeMathEval (expr) {
    try {
      var sanitized = expr
        .replace(/\u00d7/g, '*')
        .replace(/\u00f7/g, '/')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/pi/g, 'Math.PI')
        .replace(/e(?![a-zA-Z])/g, 'Math.E')
        .replace(/\^/g, '**');
      return Function('"use strict"; return (' + sanitized + ')')();
    } catch (e) {
      return 'error';
    }
  }

  /* ---------- localStorage helpers ---------- */
  function lsGet (key, fallback) {
    try { var v = localStorage.getItem('nt-' + key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  function lsSet (key, val) {
    try { localStorage.setItem('nt-' + key, JSON.stringify(val)); } catch (_) {}
  }

  /* ---------- audio beep ---------- */
  function beep (freq, dur) {
    freq = freq || 800;
    dur = dur || 0.5;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + dur);
      setTimeout(function () { ctx.close(); }, (dur + 0.1) * 1000);
    } catch (_) {}
  }

  /* ---------- tool render map ---------- */
  var RENDERERS = {
    'calculator':       renderCalculator,
    'unit-converter':   renderUnitConverter,
    'timer':            renderTimer,
    'stopwatch':        renderStopwatch,
    'grapher':          renderGrapher,
    'translator':       renderTranslator,
    'dictionary':       renderDictionary,
    'flashcard-maker':  renderFlashcardMaker,
    'pomodoro':         renderPomodoro,
    'word-counter':     renderWordCounter,
    'citation-gen':     renderCitationGenerator,
    'randomizer':       renderRandomizer
  };

  /* ---------- module state ---------- */
  var _container = null;
  var _cleanups = [];

  function addCleanup (fn) { _cleanups.push(fn); }
  function runCleanups () { _cleanups.forEach(function (fn) { fn(); }); _cleanups = []; }

  /* ================================================
     MAIN RENDER
     ================================================ */
  function render (container) {
    _container = container;
    runCleanups();
    container.innerHTML = '';

    /* grid */
    var grid = document.createElement('div');
    grid.className = 'tools-grid';

    TOOLS.forEach(function (t) {
      var card = document.createElement('div');
      card.className = 'tool-card';
      card.setAttribute('data-tool', t.id);
      card.innerHTML =
        '<span class="tool-icon">' + t.icon() + '</span>' +
        '<span class="tool-name">' + t.name + '</span>';
      card.addEventListener('click', function () { openTool(t.id, grid, panel); });
      grid.appendChild(card);
    });
    container.appendChild(grid);

    /* panel */
    var panel = document.createElement('div');
    panel.className = 'tool-panel hidden';
    container.appendChild(panel);
  }

  function openTool (id, grid, panel) {
    runCleanups();
    grid.style.display = 'none';
    panel.classList.remove('hidden');
    panel.innerHTML = '';

    /* back button */
    var back = document.createElement('button');
    back.className = 'back-btn';
    back.textContent = '\u2190 back to tools';
    back.addEventListener('click', function () {
      runCleanups();
      grid.style.display = '';
      panel.classList.add('hidden');
      panel.innerHTML = '';
    });
    panel.appendChild(back);

    /* title */
    var title = document.createElement('h3');
    var toolDef = TOOLS.find(function (t) { return t.id === id; });
    title.textContent = toolDef ? toolDef.name : id;
    panel.appendChild(title);

    /* tool body */
    var body = document.createElement('div');
    body.style.marginTop = '16px';
    panel.appendChild(body);

    if (RENDERERS[id]) RENDERERS[id](body);

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ====================================================
     1. CALCULATOR
     ==================================================== */
  function renderCalculator (el) {
    /* history area */
    var historyBox = document.createElement('div');
    historyBox.style.cssText = 'max-height:80px;overflow-y:auto;font-size:0.72rem;color:var(--text-dim);margin-bottom:8px;';
    el.appendChild(historyBox);
    var history = [];

    /* display */
    var display = document.createElement('div');
    display.className = 'calc-display';
    display.textContent = '0';
    el.appendChild(display);

    var expr = '';
    var justEvaluated = false;

    /* button grid */
    var grid = document.createElement('div');
    grid.className = 'calc-grid';

    var buttons = [
      { l: 'C', cls: 'op' },   { l: '(',  cls: 'op' },  { l: ')',  cls: 'op' },    { l: '\u232b', cls: 'op' },
      { l: '\u221a', cls: 'op' },{ l: 'x\u00b2', cls: 'op' },{ l: '%', cls: 'op' },{ l: '\u00f7', cls: 'op' },
      { l: '7', cls: '' },      { l: '8', cls: '' },      { l: '9', cls: '' },       { l: '\u00d7', cls: 'op' },
      { l: '4', cls: '' },      { l: '5', cls: '' },      { l: '6', cls: '' },       { l: '-', cls: 'op' },
      { l: '1', cls: '' },      { l: '2', cls: '' },      { l: '3', cls: '' },       { l: '+', cls: 'op' },
      { l: '\u00b1', cls: 'op' },{ l: '0', cls: '' },     { l: '.', cls: '' },       { l: '=', cls: 'eq' }
    ];

    buttons.forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'calc-btn' + (b.cls ? ' ' + b.cls : '');
      btn.textContent = b.l;
      btn.addEventListener('click', function () { handleCalc(b.l); });
      grid.appendChild(btn);
    });
    el.appendChild(grid);

    function handleCalc (key) {
      if (key === 'C') {
        expr = '';
        display.textContent = '0';
        justEvaluated = false;
        return;
      }
      if (key === '\u232b') {
        expr = expr.slice(0, -1);
        display.textContent = expr || '0';
        return;
      }
      if (key === '=') {
        var sanitized = expr
          .replace(/\u00d7/g, '*')
          .replace(/\u00f7/g, '/');
        var result = safeMathEval(sanitized);
        if (result === 'error' || !isFinite(result)) {
          display.textContent = 'error';
          expr = '';
        } else {
          history.unshift(expr + ' = ' + result);
          if (history.length > 10) history.pop();
          historyBox.innerHTML = history.map(function (h) { return '<div>' + h + '</div>'; }).join('');
          expr = String(result);
          display.textContent = expr;
          justEvaluated = true;
        }
        return;
      }
      if (key === '\u00b1') {
        if (expr && !isNaN(parseFloat(expr))) {
          expr = expr.charAt(0) === '-' ? expr.slice(1) : '-' + expr;
          display.textContent = expr;
        }
        return;
      }
      if (key === '\u221a') {
        var val = parseFloat(expr) || 0;
        var res = Math.sqrt(val);
        expr = String(isNaN(res) ? 0 : res);
        display.textContent = expr;
        justEvaluated = true;
        return;
      }
      if (key === 'x\u00b2') {
        var v = parseFloat(expr) || 0;
        expr = String(v * v);
        display.textContent = expr;
        justEvaluated = true;
        return;
      }
      /* number / operator input */
      if (justEvaluated && !isNaN(key)) {
        expr = key;
        justEvaluated = false;
      } else {
        if (justEvaluated) justEvaluated = false;
        expr += key;
      }
      display.textContent = expr;
    }
  }

  /* ====================================================
     2. UNIT CONVERTER
     ==================================================== */
  function renderUnitConverter (el) {
    var categories = {
      length: {
        units: ['m', 'km', 'cm', 'mm', 'mile', 'yard', 'foot', 'inch'],
        toBase: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254 }
      },
      weight: {
        units: ['kg', 'g', 'mg', 'pound', 'ounce', 'ton'],
        toBase: { kg: 1, g: 0.001, mg: 0.000001, pound: 0.453592, ounce: 0.0283495, ton: 1000 }
      },
      temperature: {
        units: ['celsius', 'fahrenheit', 'kelvin'],
        toBase: null
      },
      volume: {
        units: ['liter', 'ml', 'gallon', 'quart', 'cup', 'fl oz'],
        toBase: { liter: 1, ml: 0.001, gallon: 3.78541, quart: 0.946353, cup: 0.236588, 'fl oz': 0.0295735 }
      },
      speed: {
        units: ['m/s', 'km/h', 'mph'],
        toBase: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704 }
      }
    };

    var currentCat = 'length';

    /* category buttons */
    var catRow = document.createElement('div');
    catRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;';
    Object.keys(categories).forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'small-btn' + (c === currentCat ? ' primary' : '');
      btn.textContent = c;
      btn.addEventListener('click', function () {
        currentCat = c;
        catRow.querySelectorAll('.small-btn').forEach(function (b) { b.classList.remove('primary'); });
        btn.classList.add('primary');
        buildConverter();
      });
      catRow.appendChild(btn);
    });
    el.appendChild(catRow);

    var converterArea = document.createElement('div');
    el.appendChild(converterArea);

    function buildConverter () {
      var cat = categories[currentCat];
      converterArea.innerHTML = '';

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;';

      var inp = document.createElement('input');
      inp.className = 'input-field';
      inp.type = 'number';
      inp.placeholder = 'value';
      inp.style.width = '140px';

      var fromSel = document.createElement('select');
      fromSel.className = 'input-field';
      cat.units.forEach(function (u) {
        var o = document.createElement('option'); o.value = u; o.textContent = u;
        fromSel.appendChild(o);
      });

      var swapBtn = document.createElement('button');
      swapBtn.className = 'small-btn';
      swapBtn.textContent = '\u21c4';
      swapBtn.addEventListener('click', function () {
        var tmp = fromSel.value;
        fromSel.value = toSel.value;
        toSel.value = tmp;
        convert();
      });

      var toSel = document.createElement('select');
      toSel.className = 'input-field';
      cat.units.forEach(function (u) {
        var o = document.createElement('option'); o.value = u; o.textContent = u;
        toSel.appendChild(o);
      });
      if (cat.units.length > 1) toSel.value = cat.units[1];

      row.appendChild(inp);
      row.appendChild(fromSel);
      row.appendChild(swapBtn);
      row.appendChild(toSel);
      converterArea.appendChild(row);

      var resultEl = document.createElement('div');
      resultEl.style.cssText = 'margin-top:16px;font-size:1.6rem;font-weight:300;color:var(--accent-hover);';
      converterArea.appendChild(resultEl);

      function convert () {
        var v = parseFloat(inp.value);
        if (isNaN(v)) { resultEl.textContent = ''; return; }
        var from = fromSel.value;
        var to = toSel.value;
        var result;
        if (currentCat === 'temperature') {
          result = convertTemp(v, from, to);
        } else {
          var base = v * cat.toBase[from];
          result = base / cat.toBase[to];
        }
        resultEl.textContent = v + ' ' + from + ' = ' + (Math.round(result * 1e8) / 1e8) + ' ' + to;
      }

      inp.addEventListener('input', convert);
      fromSel.addEventListener('change', convert);
      toSel.addEventListener('change', convert);
    }

    function convertTemp (v, from, to) {
      var celsius;
      if (from === 'celsius') celsius = v;
      else if (from === 'fahrenheit') celsius = (v - 32) * 5 / 9;
      else celsius = v - 273.15;
      if (to === 'celsius') return celsius;
      if (to === 'fahrenheit') return celsius * 9 / 5 + 32;
      return celsius + 273.15;
    }

    buildConverter();
  }

  /* ====================================================
     3. TIMER
     ==================================================== */
  function renderTimer (el) {
    var remaining = 0;
    var intervalId = null;
    var running = false;

    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;';

    function makeInput (ph, val) {
      var inp = document.createElement('input');
      inp.className = 'input-field';
      inp.type = 'number';
      inp.min = '0';
      inp.placeholder = ph;
      inp.value = val || '';
      inp.style.width = '80px';
      return inp;
    }
    var hInput = makeInput('hours', '0');
    var mInput = makeInput('min', '5');
    var sInput = makeInput('sec', '0');
    inputRow.appendChild(hInput);
    inputRow.appendChild(mInput);
    inputRow.appendChild(sInput);
    el.appendChild(inputRow);

    var disp = document.createElement('div');
    disp.style.cssText = 'font-size:3.5rem;font-weight:300;color:var(--accent-hover);text-align:center;margin:24px 0;letter-spacing:2px;font-variant-numeric:tabular-nums;';
    disp.textContent = '00:05:00';
    el.appendChild(disp);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';

    var startBtn = document.createElement('button');
    startBtn.className = 'primary-btn';
    startBtn.textContent = 'start';

    var pauseBtn = document.createElement('button');
    pauseBtn.className = 'small-btn';
    pauseBtn.textContent = 'pause';

    var resetBtn = document.createElement('button');
    resetBtn.className = 'small-btn';
    resetBtn.textContent = 'reset';

    btnRow.appendChild(startBtn);
    btnRow.appendChild(pauseBtn);
    btnRow.appendChild(resetBtn);
    el.appendChild(btnRow);

    function readInputs () {
      return (parseInt(hInput.value) || 0) * 3600 + (parseInt(mInput.value) || 0) * 60 + (parseInt(sInput.value) || 0);
    }

    function updateDisplay () { disp.textContent = formatTime(remaining); }

    function tick () {
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        running = false;
        disp.textContent = '00:00:00';
        startBtn.textContent = 'start';
        beep(800, 0.6);
        setTimeout(function () { beep(1000, 0.4); }, 300);
        toast('timer finished!');
        return;
      }
      remaining--;
      updateDisplay();
    }

    function onInputChange () {
      if (!running) { remaining = readInputs(); updateDisplay(); }
    }
    hInput.addEventListener('input', onInputChange);
    mInput.addEventListener('input', onInputChange);
    sInput.addEventListener('input', onInputChange);

    startBtn.addEventListener('click', function () {
      if (running) return;
      if (remaining <= 0) remaining = readInputs();
      if (remaining <= 0) { toast('enter a time first'); return; }
      running = true;
      startBtn.textContent = 'running...';
      intervalId = setInterval(tick, 1000);
    });

    pauseBtn.addEventListener('click', function () {
      if (!running) return;
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      startBtn.textContent = 'resume';
    });

    resetBtn.addEventListener('click', function () {
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      remaining = readInputs();
      updateDisplay();
      startBtn.textContent = 'start';
    });

    remaining = readInputs();
    updateDisplay();

    addCleanup(function () { clearInterval(intervalId); });
  }

  /* ====================================================
     4. STOPWATCH
     ==================================================== */
  function renderStopwatch (el) {
    var elapsed = 0;
    var startTime = 0;
    var rafId = null;
    var running = false;
    var laps = [];

    var disp = document.createElement('div');
    disp.style.cssText = 'font-size:3.5rem;font-weight:300;color:var(--accent-hover);text-align:center;margin:24px 0;letter-spacing:2px;font-variant-numeric:tabular-nums;';
    disp.textContent = '00:00:00.000';
    el.appendChild(disp);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-bottom:16px;';

    var startBtn = document.createElement('button');
    startBtn.className = 'primary-btn';
    startBtn.textContent = 'start';

    var lapBtn = document.createElement('button');
    lapBtn.className = 'small-btn';
    lapBtn.textContent = 'lap';

    var resetBtn = document.createElement('button');
    resetBtn.className = 'small-btn';
    resetBtn.textContent = 'reset';

    btnRow.appendChild(startBtn);
    btnRow.appendChild(lapBtn);
    btnRow.appendChild(resetBtn);
    el.appendChild(btnRow);

    var lapList = document.createElement('div');
    lapList.style.cssText = 'max-height:200px;overflow-y:auto;';
    el.appendChild(lapList);

    function update () {
      var now = Date.now();
      var total = elapsed + (now - startTime);
      disp.textContent = formatStopwatch(total);
      rafId = requestAnimationFrame(update);
    }

    startBtn.addEventListener('click', function () {
      if (!running) {
        running = true;
        startTime = Date.now();
        startBtn.textContent = 'stop';
        update();
      } else {
        running = false;
        elapsed += Date.now() - startTime;
        cancelAnimationFrame(rafId);
        startBtn.textContent = 'start';
        disp.textContent = formatStopwatch(elapsed);
      }
    });

    lapBtn.addEventListener('click', function () {
      if (!running) return;
      var total = elapsed + (Date.now() - startTime);
      laps.push(total);
      var html = laps.map(function (l, i) {
        return '<div style="display:flex;justify-content:space-between;padding:6px 10px;font-size:0.8rem;color:var(--text-muted);border-bottom:1px solid var(--border)">' +
          '<span>lap ' + (i + 1) + '</span><span>' + formatStopwatch(l) + '</span></div>';
      }).reverse().join('');
      lapList.innerHTML = html;
    });

    resetBtn.addEventListener('click', function () {
      running = false;
      elapsed = 0;
      cancelAnimationFrame(rafId);
      disp.textContent = '00:00:00.000';
      startBtn.textContent = 'start';
      laps = [];
      lapList.innerHTML = '';
    });

    addCleanup(function () { cancelAnimationFrame(rafId); });
  }

  /* ====================================================
     5. GRAPHER
     ==================================================== */
  function renderGrapher (el) {
    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center;';

    var label = document.createElement('span');
    label.style.cssText = 'color:var(--text-muted);font-size:0.85rem;';
    label.textContent = 'f(x) =';

    var exprInput = document.createElement('input');
    exprInput.className = 'input-field';
    exprInput.placeholder = 'e.g. sin(x), x^2, cos(x)*x';
    exprInput.value = 'sin(x)';
    exprInput.style.cssText = 'flex:1;min-width:200px;';

    var plotBtn = document.createElement('button');
    plotBtn.className = 'primary-btn';
    plotBtn.textContent = 'plot';

    inputRow.appendChild(label);
    inputRow.appendChild(exprInput);
    inputRow.appendChild(plotBtn);
    el.appendChild(inputRow);

    /* zoom / pan controls */
    var ctrlRow = document.createElement('div');
    ctrlRow.style.cssText = 'display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center;';

    function mkBtn (txt) {
      var b = document.createElement('button');
      b.className = 'small-btn';
      b.textContent = txt;
      ctrlRow.appendChild(b);
      return b;
    }
    var zoomInBtn   = mkBtn('zoom in');
    var zoomOutBtn  = mkBtn('zoom out');
    var resetViewBtn = mkBtn('reset view');
    var panLeftBtn  = mkBtn('\u2190');
    var panRightBtn = mkBtn('\u2192');
    var panUpBtn    = mkBtn('\u2191');
    var panDownBtn  = mkBtn('\u2193');

    var rangeLabel = document.createElement('span');
    rangeLabel.style.cssText = 'font-size:0.72rem;color:var(--text-dim);margin-left:8px;';
    ctrlRow.appendChild(rangeLabel);
    el.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 400;
    canvas.style.cssText = 'width:100%;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;';
    el.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var xMin = -10, xMax = 10, yMin = -10, yMax = 10;

    function evalExpr (exprStr, x) {
      try {
        var sanitized = exprStr
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/abs\(/g, 'Math.abs(')
          .replace(/pi/g, 'Math.PI')
          .replace(/\^/g, '**')
          .replace(/e(?![a-zA-Z])/g, 'Math.E');
        return Function('x', '"use strict"; return (' + sanitized + ')')(x);
      } catch (_) {
        return NaN;
      }
    }

    function draw () {
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      var xRange = xMax - xMin;
      var yRange = yMax - yMin;

      function toCanvasX (x) { return ((x - xMin) / xRange) * w; }
      function toCanvasY (y) { return h - ((y - yMin) / yRange) * h; }

      /* grid lines */
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;

      var xStep = Math.pow(10, Math.floor(Math.log10(xRange / 5)));
      if (xRange / xStep > 20) xStep *= 5;
      else if (xRange / xStep > 10) xStep *= 2;

      var yStep = Math.pow(10, Math.floor(Math.log10(yRange / 5)));
      if (yRange / yStep > 20) yStep *= 5;
      else if (yRange / yStep > 10) yStep *= 2;

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#666666';

      var gx = Math.ceil(xMin / xStep) * xStep;
      while (gx <= xMax) {
        var cx = toCanvasX(gx);
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
        if (Math.abs(gx) > xStep * 0.01) {
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(gx * 1000) / 1000, cx, h - 5);
        }
        gx += xStep;
      }

      var gy = Math.ceil(yMin / yStep) * yStep;
      while (gy <= yMax) {
        var cy = toCanvasY(gy);
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        if (Math.abs(gy) > yStep * 0.01) {
          ctx.textAlign = 'right';
          ctx.fillText(Math.round(gy * 1000) / 1000, 30, cy - 3);
        }
        gy += yStep;
      }

      /* axes */
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1.5;
      var zeroY = toCanvasY(0);
      if (zeroY >= 0 && zeroY <= h) {
        ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();
      }
      var zeroX = toCanvasX(0);
      if (zeroX >= 0 && zeroX <= w) {
        ctx.beginPath(); ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, h); ctx.stroke();
      }

      /* plot curve */
      var exprStr = exprInput.value.trim();
      if (!exprStr) return;

      ctx.strokeStyle = '#d4d4d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var started = false;
      var steps = w * 2;
      for (var i = 0; i <= steps; i++) {
        var xv = xMin + (i / steps) * xRange;
        var yv = evalExpr(exprStr, xv);
        if (isNaN(yv) || !isFinite(yv)) { started = false; continue; }
        var px = toCanvasX(xv);
        var py = toCanvasY(yv);
        if (py < -2000 || py > h + 2000) { started = false; continue; }
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      rangeLabel.textContent = 'x: [' + xMin.toFixed(1) + ', ' + xMax.toFixed(1) + ']  y: [' + yMin.toFixed(1) + ', ' + yMax.toFixed(1) + ']';
    }

    plotBtn.addEventListener('click', function () {
      /* auto-fit y range */
      var exprStr = exprInput.value.trim();
      if (!exprStr) return;
      var yLo = Infinity, yHi = -Infinity;
      for (var i = 0; i <= 200; i++) {
        var x = xMin + (i / 200) * (xMax - xMin);
        var y = evalExpr(exprStr, x);
        if (isFinite(y)) { if (y < yLo) yLo = y; if (y > yHi) yHi = y; }
      }
      if (isFinite(yLo) && isFinite(yHi)) {
        var pad = (yHi - yLo) * 0.2 || 2;
        yMin = Math.floor(yLo - pad);
        yMax = Math.ceil(yHi + pad);
      }
      draw();
    });
    exprInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') plotBtn.click(); });

    zoomInBtn.addEventListener('click', function () {
      var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2;
      var xr = (xMax - xMin) / 4, yr = (yMax - yMin) / 4;
      xMin = cx - xr; xMax = cx + xr; yMin = cy - yr; yMax = cy + yr;
      draw();
    });
    zoomOutBtn.addEventListener('click', function () {
      var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2;
      var xr = (xMax - xMin), yr = (yMax - yMin);
      xMin = cx - xr; xMax = cx + xr; yMin = cy - yr; yMax = cy + yr;
      draw();
    });
    resetViewBtn.addEventListener('click', function () {
      xMin = -10; xMax = 10; yMin = -10; yMax = 10; draw();
    });
    panLeftBtn.addEventListener('click', function ()  { var d = (xMax - xMin) * 0.2; xMin -= d; xMax -= d; draw(); });
    panRightBtn.addEventListener('click', function () { var d = (xMax - xMin) * 0.2; xMin += d; xMax += d; draw(); });
    panUpBtn.addEventListener('click', function ()    { var d = (yMax - yMin) * 0.2; yMin += d; yMax += d; draw(); });
    panDownBtn.addEventListener('click', function ()  { var d = (yMax - yMin) * 0.2; yMin -= d; yMax -= d; draw(); });

    /* initial resize + draw */
    function resizeCanvas () {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      draw();
    }
    setTimeout(resizeCanvas, 50);
    draw();
  }

  /* ====================================================
     6. TRANSLATOR
     ==================================================== */
  function renderTranslator (el) {
    var langs = [
      { code: 'en', name: 'english' },
      { code: 'es', name: 'spanish' },
      { code: 'fr', name: 'french' },
      { code: 'de', name: 'german' },
      { code: 'it', name: 'italian' },
      { code: 'pt', name: 'portuguese' },
      { code: 'ja', name: 'japanese' },
      { code: 'zh', name: 'chinese' },
      { code: 'ko', name: 'korean' },
      { code: 'ru', name: 'russian' }
    ];

    var langOpts = langs.map(function (l) {
      return '<option value="' + l.code + '">' + l.name + '</option>';
    }).join('');

    el.innerHTML =
      '<div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">' +
        '<select class="input-field" id="tr-from">' + langOpts + '</select>' +
        '<button class="small-btn" id="tr-swap">\u21c4</button>' +
        '<select class="input-field" id="tr-to">' + langOpts + '</select>' +
      '</div>' +
      '<textarea class="textarea-field" id="tr-input" rows="4" placeholder="enter text to translate..."></textarea>' +
      '<button class="primary-btn" id="tr-go" style="margin-top:12px">translate</button>' +
      '<div id="tr-output" style="margin-top:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:16px;min-height:60px;font-size:0.88rem;color:var(--text);white-space:pre-wrap"></div>';

    el.querySelector('#tr-to').value = 'es';

    el.querySelector('#tr-swap').addEventListener('click', function () {
      var from = el.querySelector('#tr-from');
      var to = el.querySelector('#tr-to');
      var tmp = from.value;
      from.value = to.value;
      to.value = tmp;
    });

    el.querySelector('#tr-go').addEventListener('click', function () {
      var text = el.querySelector('#tr-input').value.trim();
      if (!text) { toast('enter text to translate'); return; }

      var fromLang = el.querySelector('#tr-from').value;
      var toLang = el.querySelector('#tr-to').value;
      var output = el.querySelector('#tr-output');
      output.innerHTML = '<span class="spinner"></span> translating...';

      var url = 'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(text) + '&langpair=' + fromLang + '|' + toLang;

      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.responseData && data.responseData.translatedText) {
            output.textContent = data.responseData.translatedText;
            toast('translation complete');
          } else {
            output.textContent = 'translation unavailable';
          }
        })
        .catch(function () {
          output.textContent = 'translation service unavailable. check your connection.';
        });
    });
  }

  /* ====================================================
     7. DICTIONARY
     ==================================================== */
  function renderDictionary (el) {
    el.innerHTML =
      '<div style="display:flex;gap:10px;margin-bottom:16px">' +
        '<input type="text" class="input-field" id="dict-word" placeholder="enter a word..." style="flex:1">' +
        '<button class="primary-btn" id="dict-search">look up</button>' +
      '</div>' +
      '<div id="dict-result"></div>';

    var wordInput = el.querySelector('#dict-word');
    var searchBtn = el.querySelector('#dict-search');
    var resultDiv = el.querySelector('#dict-result');

    function doSearch () {
      var word = wordInput.value.trim().toLowerCase();
      if (!word) { toast('enter a word to look up'); return; }
      resultDiv.innerHTML = '<span class="spinner"></span> looking up...';

      fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word))
        .then(function (r) {
          if (!r.ok) throw new Error('not found');
          return r.json();
        })
        .then(function (data) {
          var entry = data[0];
          var phonetic = '';
          if (entry.phonetics) {
            for (var p = 0; p < entry.phonetics.length; p++) {
              if (entry.phonetics[p].text) { phonetic = entry.phonetics[p].text; break; }
            }
          }

          var audioUrl = '';
          if (entry.phonetics) {
            for (var a = 0; a < entry.phonetics.length; a++) {
              if (entry.phonetics[a].audio) { audioUrl = entry.phonetics[a].audio; break; }
            }
          }

          var html = '<div style="margin-bottom:12px">' +
            '<span style="font-size:1.3rem;font-weight:600;color:var(--accent-hover)">' + entry.word + '</span>';
          if (phonetic) html += ' <span style="color:var(--text-dim);font-size:0.85rem">' + phonetic + '</span>';
          if (audioUrl) html += ' <button class="small-btn" id="dict-audio" style="font-size:0.7rem;padding:2px 8px">\u25b6 play</button>';
          html += '</div>';

          for (var m = 0; m < entry.meanings.length; m++) {
            var meaning = entry.meanings[m];
            html += '<div style="margin-bottom:14px">' +
              '<div style="font-size:0.75rem;color:var(--text-dim);font-style:italic;margin-bottom:6px">' + meaning.partOfSpeech + '</div>';

            for (var d = 0; d < meaning.definitions.length && d < 4; d++) {
              var def = meaning.definitions[d];
              html += '<div style="margin-bottom:8px;padding-left:12px;border-left:2px solid var(--border)">' +
                '<div style="font-size:0.85rem;color:var(--text)">' + (d + 1) + '. ' + def.definition + '</div>';
              if (def.example) {
                html += '<div style="font-size:0.78rem;color:var(--text-muted);font-style:italic;margin-top:3px">"' + def.example + '"</div>';
              }
              html += '</div>';
            }

            if (meaning.synonyms && meaning.synonyms.length > 0) {
              html += '<div style="font-size:0.75rem;color:var(--text-dim);margin-top:4px">synonyms: ' + meaning.synonyms.slice(0, 5).join(', ') + '</div>';
            }
            html += '</div>';
          }

          resultDiv.innerHTML = html;

          if (audioUrl) {
            var audioBtn = el.querySelector('#dict-audio');
            if (audioBtn) {
              audioBtn.addEventListener('click', function () {
                new Audio(audioUrl).play();
              });
            }
          }
        })
        .catch(function () {
          resultDiv.innerHTML = '<div style="color:var(--text-dim);font-size:0.85rem">no definition found for "' + word + '".</div>';
        });
    }

    searchBtn.addEventListener('click', doSearch);
    wordInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
  }

  /* ====================================================
     8. FLASHCARD MAKER
     ==================================================== */
  function renderFlashcardMaker (el) {
    var decks = lsGet('flashcard-decks', []);
    var currentDeck = null;
    var studyIndex = 0;
    var showingAnswer = false;

    function saveDecks () { lsSet('flashcard-decks', decks); }

    function renderMain () {
      el.innerHTML = '';

      /* create deck row */
      var createRow = document.createElement('div');
      createRow.style.cssText = 'display:flex;gap:10px;margin-bottom:16px;';
      createRow.innerHTML =
        '<input type="text" class="input-field" id="fc-new-name" placeholder="new deck name..." style="flex:1">' +
        '<button class="primary-btn" id="fc-create">create deck</button>';
      el.appendChild(createRow);

      el.querySelector('#fc-create').addEventListener('click', function () {
        var name = el.querySelector('#fc-new-name').value.trim();
        if (!name) { toast('enter a deck name'); return; }
        decks.push({ name: name, cards: [] });
        saveDecks();
        toast('deck "' + name + '" created');
        renderMain();
      });

      /* deck list */
      if (decks.length === 0) {
        var empty = document.createElement('div');
        empty.style.cssText = 'color:var(--text-dim);font-size:0.82rem;padding:16px;text-align:center;';
        empty.textContent = 'no decks yet. create one above.';
        el.appendChild(empty);
        return;
      }

      var deckList = document.createElement('div');
      decks.forEach(function (deck, i) {
        var row = document.createElement('div');
        row.className = 'saved-source-item';
        row.style.cursor = 'default';
        row.innerHTML =
          '<span style="flex:1">' + deck.name + ' <span style="color:var(--text-dim)">(' + deck.cards.length + ' cards)</span></span>';

        var studyBtn = document.createElement('button');
        studyBtn.className = 'small-btn';
        studyBtn.textContent = 'study';
        studyBtn.style.marginRight = '6px';
        studyBtn.addEventListener('click', function () {
          if (deck.cards.length === 0) { toast('add cards first'); return; }
          currentDeck = i;
          renderStudy();
        });

        var editBtn = document.createElement('button');
        editBtn.className = 'small-btn';
        editBtn.textContent = 'edit';
        editBtn.style.marginRight = '6px';
        editBtn.addEventListener('click', function () { currentDeck = i; renderEditor(); });

        var delBtn = document.createElement('button');
        delBtn.className = 'remove-source';
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', function () {
          if (!confirm('delete deck "' + deck.name + '"?')) return;
          decks.splice(i, 1);
          saveDecks();
          toast('deck deleted');
          renderMain();
        });

        row.appendChild(studyBtn);
        row.appendChild(editBtn);
        row.appendChild(delBtn);
        deckList.appendChild(row);
      });
      el.appendChild(deckList);
    }

    function renderEditor () {
      var deck = decks[currentDeck];
      el.innerHTML = '';

      var backBtn = document.createElement('button');
      backBtn.className = 'back-btn';
      backBtn.textContent = '\u2190 back to decks';
      backBtn.addEventListener('click', renderMain);
      el.appendChild(backBtn);

      var heading = document.createElement('div');
      heading.style.cssText = 'font-size:0.9rem;color:var(--accent-hover);margin-bottom:12px;';
      heading.textContent = 'editing: ' + deck.name;
      el.appendChild(heading);

      /* card list */
      var cardList = document.createElement('div');
      deck.cards.forEach(function (c, ci) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';

        var termInp = document.createElement('input');
        termInp.className = 'input-field';
        termInp.value = c.front;
        termInp.placeholder = 'front (question)';
        termInp.style.flex = '1';
        termInp.addEventListener('change', function () { c.front = termInp.value; saveDecks(); });

        var defInp = document.createElement('input');
        defInp.className = 'input-field';
        defInp.value = c.back;
        defInp.placeholder = 'back (answer)';
        defInp.style.flex = '1';
        defInp.addEventListener('change', function () { c.back = defInp.value; saveDecks(); });

        var rmBtn = document.createElement('button');
        rmBtn.className = 'remove-source';
        rmBtn.innerHTML = '&times;';
        rmBtn.addEventListener('click', function () { deck.cards.splice(ci, 1); saveDecks(); renderEditor(); });

        row.appendChild(termInp);
        row.appendChild(defInp);
        row.appendChild(rmBtn);
        cardList.appendChild(row);
      });
      el.appendChild(cardList);

      /* add card row */
      var addRow = document.createElement('div');
      addRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
      addRow.innerHTML =
        '<input type="text" class="input-field" id="fc-add-front" placeholder="front (question)" style="flex:1">' +
        '<input type="text" class="input-field" id="fc-add-back" placeholder="back (answer)" style="flex:1">' +
        '<button class="primary-btn" id="fc-add-card">add</button>';
      el.appendChild(addRow);

      el.querySelector('#fc-add-card').addEventListener('click', function () {
        var f = el.querySelector('#fc-add-front').value.trim();
        var b = el.querySelector('#fc-add-back').value.trim();
        if (!f || !b) { toast('fill in both sides'); return; }
        deck.cards.push({ front: f, back: b });
        saveDecks();
        toast('card added');
        renderEditor();
      });
    }

    function renderStudy () {
      var deck = decks[currentDeck];
      studyIndex = 0;
      showingAnswer = false;
      renderCard();

      function renderCard () {
        el.innerHTML = '';

        var backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.textContent = '\u2190 back to decks';
        backBtn.addEventListener('click', renderMain);
        el.appendChild(backBtn);

        var counter = document.createElement('div');
        counter.style.cssText = 'text-align:center;font-size:0.82rem;color:var(--text-dim);margin-bottom:16px;';
        counter.textContent = 'card ' + (studyIndex + 1) + ' / ' + deck.cards.length + ' \u2014 ' + deck.name;
        el.appendChild(counter);

        var card = deck.cards[studyIndex];
        var flashcard = document.createElement('div');
        flashcard.className = 'flashcard';
        var inner = document.createElement('div');
        inner.className = 'flashcard-inner';
        inner.style.cursor = 'default';
        inner.innerHTML =
          '<div>' +
            '<div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:8px">' + (showingAnswer ? 'answer' : 'question') + '</div>' +
            '<div>' + (showingAnswer ? card.back : card.front) + '</div>' +
          '</div>';
        inner.addEventListener('click', function () { showingAnswer = !showingAnswer; renderCard(); });
        flashcard.appendChild(inner);
        el.appendChild(flashcard);

        var controls = document.createElement('div');
        controls.className = 'flashcard-controls';

        function mkCtrl (txt, cls, fn) {
          var b = document.createElement('button');
          b.className = cls;
          b.textContent = txt;
          b.addEventListener('click', fn);
          controls.appendChild(b);
        }
        mkCtrl('prev', 'small-btn', function () {
          showingAnswer = false;
          studyIndex = (studyIndex - 1 + deck.cards.length) % deck.cards.length;
          renderCard();
        });
        mkCtrl('flip', 'primary-btn', function () { showingAnswer = !showingAnswer; renderCard(); });
        mkCtrl('next', 'small-btn', function () {
          showingAnswer = false;
          studyIndex = (studyIndex + 1) % deck.cards.length;
          renderCard();
        });
        mkCtrl('shuffle', 'small-btn', function () {
          for (var i = deck.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = deck.cards[i]; deck.cards[i] = deck.cards[j]; deck.cards[j] = tmp;
          }
          saveDecks();
          studyIndex = 0;
          showingAnswer = false;
          toast('cards shuffled');
          renderCard();
        });
        el.appendChild(controls);
      }
    }

    renderMain();
  }

  /* ====================================================
     9. POMODORO TIMER
     ==================================================== */
  function renderPomodoro (el) {
    var WORK = 25 * 60;
    var BREAK_TIME = 5 * 60;
    var isWork = true;
    var remaining = WORK;
    var running = false;
    var intervalId = null;
    var sessions = 0;

    /* progress ring */
    var ringSize = 180;
    var ringStroke = 6;
    var radius = (ringSize - ringStroke) / 2;
    var circumference = 2 * Math.PI * radius;

    var ringWrap = document.createElement('div');
    ringWrap.style.cssText = 'text-align:center;margin:20px 0;position:relative;width:' + ringSize + 'px;height:' + ringSize + 'px;margin-left:auto;margin-right:auto;';
    ringWrap.innerHTML =
      '<svg width="' + ringSize + '" height="' + ringSize + '" style="transform:rotate(-90deg);position:absolute;top:0;left:0;">' +
        '<circle cx="' + (ringSize / 2) + '" cy="' + (ringSize / 2) + '" r="' + radius + '" stroke="var(--border)" stroke-width="' + ringStroke + '" fill="none"/>' +
        '<circle class="pomo-ring" cx="' + (ringSize / 2) + '" cy="' + (ringSize / 2) + '" r="' + radius + '" stroke="var(--accent)" stroke-width="' + ringStroke + '" fill="none" stroke-dasharray="' + circumference + '" stroke-dashoffset="0" stroke-linecap="round"/>' +
      '</svg>';

    var timerDisp = document.createElement('div');
    timerDisp.style.cssText = 'position:absolute;top:0;left:0;right:0;height:' + ringSize + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:2.5rem;font-weight:300;color:var(--accent-hover);z-index:1;';
    ringWrap.appendChild(timerDisp);
    el.appendChild(ringWrap);

    var phaseLabel = document.createElement('div');
    phaseLabel.style.cssText = 'text-align:center;font-size:0.82rem;color:var(--text-muted);margin-bottom:4px;';
    el.appendChild(phaseLabel);

    var sessionLabel = document.createElement('div');
    sessionLabel.style.cssText = 'text-align:center;font-size:0.75rem;color:var(--text-dim);margin-bottom:16px;';
    el.appendChild(sessionLabel);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';

    var startBtn = document.createElement('button');
    startBtn.className = 'primary-btn';
    startBtn.textContent = 'start';
    var pauseBtn = document.createElement('button');
    pauseBtn.className = 'small-btn';
    pauseBtn.textContent = 'pause';
    var skipBtn = document.createElement('button');
    skipBtn.className = 'small-btn';
    skipBtn.textContent = 'skip';

    btnRow.appendChild(startBtn);
    btnRow.appendChild(pauseBtn);
    btnRow.appendChild(skipBtn);
    el.appendChild(btnRow);

    function updateDisplay () {
      timerDisp.textContent = formatTime(remaining);
      phaseLabel.textContent = isWork ? 'work session' : 'break time';
      sessionLabel.textContent = 'sessions completed: ' + sessions;

      var total = isWork ? WORK : BREAK_TIME;
      var progress = (total - remaining) / total;
      var ring = el.querySelector('.pomo-ring');
      if (ring) ring.setAttribute('stroke-dashoffset', circumference * (1 - progress));
    }

    function switchPhase () {
      if (isWork) { sessions++; isWork = false; remaining = BREAK_TIME; toast('break time!'); }
      else { isWork = true; remaining = WORK; toast('back to work!'); }
      beep(isWork ? 600 : 900, 0.4);
      updateDisplay();
    }

    startBtn.addEventListener('click', function () {
      if (running) return;
      running = true;
      startBtn.textContent = 'running...';
      intervalId = setInterval(function () {
        remaining--;
        updateDisplay();
        if (remaining <= 0) {
          clearInterval(intervalId);
          running = false;
          startBtn.textContent = 'start';
          switchPhase();
        }
      }, 1000);
    });

    pauseBtn.addEventListener('click', function () {
      if (!running) return;
      clearInterval(intervalId);
      running = false;
      startBtn.textContent = 'resume';
    });

    skipBtn.addEventListener('click', function () {
      clearInterval(intervalId);
      running = false;
      startBtn.textContent = 'start';
      switchPhase();
    });

    updateDisplay();
    addCleanup(function () { clearInterval(intervalId); });
  }

  /* ====================================================
     10. WORD COUNTER
     ==================================================== */
  function renderWordCounter (el) {
    el.innerHTML =
      '<textarea class="textarea-field" id="wc-input" rows="8" placeholder="paste or type your text here..." style="width:100%"></textarea>' +
      '<div id="wc-stats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:16px"></div>';

    var input = el.querySelector('#wc-input');
    var stats = el.querySelector('#wc-stats');

    function analyze () {
      var text = input.value;
      var trimmed = text.trim();

      var charCount = text.length;
      var charNoSpaces = text.replace(/\s/g, '').length;
      var words = trimmed ? trimmed.split(/\s+/) : [];
      var wordCount = words.length;
      var sentences = trimmed ? trimmed.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }) : [];
      var sentenceCount = sentences.length;
      var paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 0; }) : [];
      var paragraphCount = trimmed ? Math.max(paragraphs.length, 1) : 0;

      var readingTime = Math.ceil(wordCount / 200);
      var speakingTime = Math.ceil(wordCount / 130);

      var items = [
        { label: 'words', value: wordCount },
        { label: 'characters', value: charCount },
        { label: 'characters (no spaces)', value: charNoSpaces },
        { label: 'sentences', value: sentenceCount },
        { label: 'paragraphs', value: paragraphCount },
        { label: 'reading time', value: readingTime + ' min' },
        { label: 'speaking time', value: speakingTime + ' min' }
      ];

      stats.innerHTML = items.map(function (item) {
        return '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">' +
          '<div style="font-size:1.4rem;font-weight:600;color:var(--accent-hover)">' + item.value + '</div>' +
          '<div style="font-size:0.72rem;color:var(--text-dim);margin-top:4px">' + item.label + '</div>' +
        '</div>';
      }).join('');
    }

    input.addEventListener('input', analyze);
    analyze();
  }

  /* ====================================================
     11. CITATION GENERATOR
     ==================================================== */
  function renderCitationGenerator (el) {
    el.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
        '<input type="text" class="input-field" id="cite-author" placeholder="author (last, first)">' +
        '<input type="text" class="input-field" id="cite-title" placeholder="title">' +
        '<input type="text" class="input-field" id="cite-year" placeholder="year">' +
        '<input type="text" class="input-field" id="cite-publisher" placeholder="publisher">' +
        '<input type="text" class="input-field" id="cite-url" placeholder="url (optional)" style="grid-column:span 2">' +
      '</div>' +
      '<button class="primary-btn" id="cite-generate" style="margin-bottom:16px">generate citations</button>' +
      '<div id="cite-output"></div>';

    el.querySelector('#cite-generate').addEventListener('click', function () {
      var author    = el.querySelector('#cite-author').value.trim() || 'unknown';
      var title     = el.querySelector('#cite-title').value.trim() || 'untitled';
      var year      = el.querySelector('#cite-year').value.trim() || 'n.d.';
      var publisher = el.querySelector('#cite-publisher').value.trim();
      var url       = el.querySelector('#cite-url').value.trim();

      var authorParts = author.split(',').map(function (s) { return s.trim(); });
      var lastName  = authorParts[0] || '';
      var firstName = authorParts[1] || '';
      var firstInitial = firstName ? firstName.charAt(0) + '.' : '';

      /* MLA */
      var mla = lastName + (firstName ? ', ' + firstName : '') + '. ';
      mla += '<i>' + title + '</i>. ';
      if (publisher) mla += publisher + ', ';
      mla += year + '.';
      if (url) mla += ' ' + url + '.';

      /* APA */
      var apa = lastName + (firstInitial ? ', ' + firstInitial : '') + ' ';
      apa += '(' + year + '). ';
      apa += '<i>' + title + '</i>. ';
      if (publisher) apa += publisher + '.';
      if (url) apa += ' retrieved from ' + url;

      /* Chicago */
      var chicago = lastName + (firstName ? ', ' + firstName : '') + '. ';
      chicago += '<i>' + title + '</i>. ';
      if (publisher) chicago += publisher + ', ';
      chicago += year + '.';
      if (url) chicago += ' ' + url + '.';

      var output = el.querySelector('#cite-output');
      var formats = [
        { label: 'mla', html: mla },
        { label: 'apa', html: apa },
        { label: 'chicago', html: chicago }
      ];

      output.innerHTML = formats.map(function (f) {
        return '<div style="margin-bottom:16px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<span style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px">' + f.label + '</span>' +
            '<button class="small-btn cite-copy" data-format="' + f.label + '">copy</button>' +
          '</div>' +
          '<div class="writer-output" id="cite-' + f.label + '" style="min-height:auto;padding:12px;font-size:0.82rem">' + f.html + '</div>' +
        '</div>';
      }).join('');

      output.querySelectorAll('.cite-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var fmt = btn.getAttribute('data-format');
          var txt = el.querySelector('#cite-' + fmt).textContent;
          navigator.clipboard.writeText(txt).then(function () {
            toast(fmt + ' citation copied');
          }).catch(function () { toast('failed to copy'); });
        });
      });
    });
  }

  /* ====================================================
     12. RANDOMIZER
     ==================================================== */
  function renderRandomizer (el) {
    var tabs = [
      { id: 'number',  label: 'number' },
      { id: 'coin',    label: 'coin flip' },
      { id: 'dice',    label: 'dice roll' },
      { id: 'picker',  label: 'name picker' },
      { id: 'group',   label: 'group maker' }
    ];
    var activeTab = 'number';

    var tabRow = document.createElement('div');
    tabRow.style.cssText = 'display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap;';
    el.appendChild(tabRow);

    var content = document.createElement('div');
    el.appendChild(content);

    function renderTabs () {
      tabRow.innerHTML = '';
      tabs.forEach(function (t) {
        var btn = document.createElement('button');
        btn.className = 'small-btn' + (t.id === activeTab ? ' primary' : '');
        btn.textContent = t.label;
        btn.addEventListener('click', function () { activeTab = t.id; renderTabs(); renderBody(); });
        tabRow.appendChild(btn);
      });
    }

    function renderBody () {
      content.innerHTML = '';
      if (activeTab === 'number')  renderNumber();
      else if (activeTab === 'coin')    renderCoin();
      else if (activeTab === 'dice')    renderDiceTab();
      else if (activeTab === 'picker')  renderPicker();
      else if (activeTab === 'group')   renderGroups();
    }

    /* --- number --- */
    function renderNumber () {
      content.innerHTML =
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px">' +
          '<label style="font-size:0.82rem;color:var(--text-muted)">min: <input type="number" class="input-field" id="rand-min" value="1" style="width:80px"></label>' +
          '<label style="font-size:0.82rem;color:var(--text-muted)">max: <input type="number" class="input-field" id="rand-max" value="100" style="width:80px"></label>' +
          '<button class="primary-btn" id="rand-gen">generate</button>' +
        '</div>' +
        '<div id="rand-result" style="font-size:3rem;font-weight:300;color:var(--accent-hover);text-align:center;padding:20px"></div>';

      content.querySelector('#rand-gen').addEventListener('click', function () {
        var mn = parseInt(content.querySelector('#rand-min').value) || 0;
        var mx = parseInt(content.querySelector('#rand-max').value) || 100;
        if (mn > mx) { var t = mn; mn = mx; mx = t; }
        content.querySelector('#rand-result').textContent = Math.floor(Math.random() * (mx - mn + 1)) + mn;
      });
    }

    /* --- coin --- */
    function renderCoin () {
      content.innerHTML =
        '<div style="text-align:center;padding:20px">' +
          '<div id="coin-result" style="font-size:3rem;font-weight:300;color:var(--accent-hover);margin-bottom:20px;min-height:60px"></div>' +
          '<button class="primary-btn" id="coin-flip">flip coin</button>' +
          '<div id="coin-stats" style="font-size:0.75rem;color:var(--text-dim);margin-top:16px"></div>' +
        '</div>';

      var heads = 0, tails = 0;
      content.querySelector('#coin-flip').addEventListener('click', function () {
        var r = Math.random() < 0.5 ? 'heads' : 'tails';
        if (r === 'heads') heads++; else tails++;
        content.querySelector('#coin-result').textContent = r;
        content.querySelector('#coin-stats').textContent = 'heads: ' + heads + ' | tails: ' + tails;
      });
    }

    /* --- dice --- */
    function renderDiceTab () {
      var diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
      content.innerHTML =
        '<div style="text-align:center;padding:20px">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:16px" id="dice-btns"></div>' +
          '<div id="dice-result" style="font-size:3rem;font-weight:300;color:var(--accent-hover);margin-bottom:12px;min-height:60px"></div>' +
        '</div>';

      var btnsArea = content.querySelector('#dice-btns');
      diceTypes.forEach(function (d) {
        var sides = parseInt(d.slice(1));
        var btn = document.createElement('button');
        btn.className = 'small-btn';
        btn.textContent = d;
        btn.addEventListener('click', function () {
          content.querySelector('#dice-result').textContent = d + ': ' + (Math.floor(Math.random() * sides) + 1);
        });
        btnsArea.appendChild(btn);
      });
    }

    /* --- name picker --- */
    function renderPicker () {
      content.innerHTML =
        '<textarea class="textarea-field" id="pick-names" rows="5" placeholder="enter names, one per line..." style="width:100%"></textarea>' +
        '<div style="display:flex;gap:10px;margin-top:10px;margin-bottom:16px">' +
          '<button class="primary-btn" id="pick-go">pick a name</button>' +
        '</div>' +
        '<div id="pick-result" style="font-size:2rem;font-weight:400;color:var(--accent-hover);text-align:center;padding:16px;background:var(--bg-card);border-radius:8px;min-height:40px"></div>';

      content.querySelector('#pick-go').addEventListener('click', function () {
        var names = content.querySelector('#pick-names').value.split('\n').map(function (n) { return n.trim(); }).filter(Boolean);
        if (!names.length) { toast('enter some names first'); return; }
        content.querySelector('#pick-result').textContent = names[Math.floor(Math.random() * names.length)];
      });
    }

    /* --- group maker --- */
    function renderGroups () {
      content.innerHTML =
        '<textarea class="textarea-field" id="grp-names" rows="5" placeholder="enter names, one per line..." style="width:100%"></textarea>' +
        '<div style="display:flex;gap:10px;align-items:center;margin-top:10px;margin-bottom:16px">' +
          '<label style="font-size:0.82rem;color:var(--text-muted)">groups: <input type="number" class="input-field" id="grp-count" value="2" min="2" style="width:60px"></label>' +
          '<button class="primary-btn" id="grp-go">make groups</button>' +
        '</div>' +
        '<div id="grp-result"></div>';

      content.querySelector('#grp-go').addEventListener('click', function () {
        var items = content.querySelector('#grp-names').value.split('\n').map(function (n) { return n.trim(); }).filter(Boolean);
        if (!items.length) { toast('enter some names first'); return; }
        var numGroups = Math.min(parseInt(content.querySelector('#grp-count').value) || 2, items.length);

        /* shuffle */
        for (var i = items.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
        }

        var groups = [];
        for (var g = 0; g < numGroups; g++) groups.push([]);
        items.forEach(function (name, idx) { groups[idx % numGroups].push(name); });

        content.querySelector('#grp-result').innerHTML = groups.map(function (gr, gi) {
          return '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px">' +
            '<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:6px">group ' + (gi + 1) + '</div>' +
            '<div style="font-size:0.85rem;color:var(--text)">' + gr.join(', ') + '</div>' +
          '</div>';
        }).join('');
      });
    }

    renderTabs();
    renderBody();
  }

  /* ================================================
     return the main render function
     ================================================ */
  return render;
})();
