/* ============================================
   null testament — habits module
   provides window.NT.renderHabits(container)
   ============================================ */
window.NT = window.NT || {};

window.NT.renderHabits = (function () {
  'use strict';

  var STORAGE_KEY = 'nt-habits';
  var toast = function (m) { if (window.NT && window.NT.toast) window.NT.toast(m); };

  /* ---------- data helpers ---------- */
  function loadData () {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { habits: [] };
  }

  function saveData (data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function generateId () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function todayStr () {
    var d = new Date();
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function getDateRange (weeks) {
    var days = weeks * 7;
    var result = [];
    var now = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var mm = ('0' + (d.getMonth() + 1)).slice(-2);
      var dd = ('0' + d.getDate()).slice(-2);
      result.push(d.getFullYear() + '-' + mm + '-' + dd);
    }
    return result;
  }

  function calcStreak (habit) {
    var streak = 0;
    var d = new Date();
    while (true) {
      var mm = ('0' + (d.getMonth() + 1)).slice(-2);
      var dd = ('0' + d.getDate()).slice(-2);
      var key = d.getFullYear() + '-' + mm + '-' + dd;
      if (habit.completions && habit.completions[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  /* ---------- module state ---------- */
  var _data = null;

  /* ================================================
     MAIN RENDER
     ================================================ */
  function render (container) {
    _data = loadData();
    container.innerHTML = '';

    /* page header */
    var header = document.createElement('h2');
    header.className = 'page-header';
    header.textContent = 'habits';
    container.appendChild(header);

    var desc = document.createElement('p');
    desc.className = 'page-desc';
    desc.textContent = 'track daily habits & build streaks';
    container.appendChild(desc);

    /* controls */
    var controls = document.createElement('div');
    controls.className = 'habit-controls';

    var addBtn = document.createElement('button');
    addBtn.className = 'primary-btn';
    addBtn.textContent = '+ new habit';
    addBtn.addEventListener('click', function () { openModal(); });
    controls.appendChild(addBtn);
    container.appendChild(controls);

    /* habit grid */
    var grid = document.createElement('div');
    grid.className = 'habit-grid';
    container.appendChild(grid);

    /* ---- render habit cards ---- */
    function renderGrid () {
      grid.innerHTML = '';

      if (_data.habits.length === 0) {
        var empty = document.createElement('p');
        empty.style.cssText = 'color:var(--text-dim);font-size:0.85rem;';
        empty.textContent = 'no habits yet. create one to start tracking.';
        grid.appendChild(empty);
        return;
      }

      var today = todayStr();
      var dates = getDateRange(16);

      _data.habits.forEach(function (habit) {
        var card = document.createElement('div');
        card.className = 'habit-card';

        /* header row */
        var headerRow = document.createElement('div');
        headerRow.className = 'habit-header';

        var nameEl = document.createElement('span');
        nameEl.className = 'habit-name';
        nameEl.textContent = habit.name;

        var streak = calcStreak(habit);
        var streakEl = document.createElement('span');
        streakEl.className = 'habit-streak';
        streakEl.textContent = streak + ' day' + (streak !== 1 ? 's' : '');

        var delBtn = document.createElement('button');
        delBtn.className = 'danger-btn';
        delBtn.textContent = 'delete';
        delBtn.addEventListener('click', function () {
          if (!confirm('delete habit "' + habit.name + '"?')) return;
          _data.habits = _data.habits.filter(function (h) { return h.id !== habit.id; });
          saveData(_data);
          renderGrid();
          toast('habit deleted');
        });

        headerRow.appendChild(nameEl);
        headerRow.appendChild(streakEl);
        headerRow.appendChild(delBtn);
        card.appendChild(headerRow);

        /* today toggle */
        var todayRow = document.createElement('div');
        todayRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;';

        var done = !!(habit.completions && habit.completions[today]);
        var checkbox = document.createElement('div');
        checkbox.className = 'planner-checkbox' + (done ? ' checked' : '');
        checkbox.addEventListener('click', function () {
          if (!habit.completions) habit.completions = {};
          if (habit.completions[today]) {
            delete habit.completions[today];
          } else {
            habit.completions[today] = true;
          }
          saveData(_data);
          renderGrid();
          toast(habit.completions[today] ? 'habit completed for today' : 'habit unmarked');
        });

        var label = document.createElement('span');
        label.style.cssText = 'font-size:0.8rem;color:var(--text-dim);';
        label.textContent = done ? 'done today' : 'mark today as done';

        todayRow.appendChild(checkbox);
        todayRow.appendChild(label);
        card.appendChild(todayRow);

        /* heatmap */
        var heatmap = document.createElement('div');
        heatmap.className = 'habit-heatmap';

        dates.forEach(function (dateStr) {
          var cell = document.createElement('div');
          cell.className = 'heatmap-cell';
          if (habit.completions && habit.completions[dateStr]) cell.className += ' done';
          if (dateStr === today) cell.className += ' today';
          cell.title = dateStr;
          heatmap.appendChild(cell);
        });

        card.appendChild(heatmap);

        /* goal */
        if (habit.goal) {
          var goalEl = document.createElement('div');
          goalEl.className = 'habit-goal';
          goalEl.textContent = 'goal: ' + habit.goal;
          card.appendChild(goalEl);
        }

        grid.appendChild(card);
      });
    }

    /* ---- add habit modal ---- */
    function openModal () {
      var overlay = document.createElement('div');
      overlay.className = 'modal';

      var content = document.createElement('div');
      content.className = 'modal-content';

      var title = document.createElement('h3');
      title.textContent = 'new habit';
      content.appendChild(title);

      var nameInput = document.createElement('input');
      nameInput.className = 'input-field';
      nameInput.placeholder = 'habit name...';
      nameInput.style.width = '100%';
      content.appendChild(nameInput);

      var goalInput = document.createElement('input');
      goalInput.className = 'input-field';
      goalInput.placeholder = 'goal (optional)...';
      goalInput.style.cssText = 'width:100%;margin-top:8px;';
      content.appendChild(goalInput);

      var actions = document.createElement('div');
      actions.className = 'modal-actions';

      var cancelBtn = document.createElement('button');
      cancelBtn.className = 'small-btn';
      cancelBtn.textContent = 'cancel';
      cancelBtn.addEventListener('click', function () { overlay.remove(); });

      var createBtn = document.createElement('button');
      createBtn.className = 'small-btn primary';
      createBtn.textContent = 'create';
      createBtn.addEventListener('click', function () {
        var name = nameInput.value.trim().toLowerCase();
        if (!name) { toast('enter a habit name'); return; }
        var habit = {
          id: generateId(),
          name: name,
          goal: goalInput.value.trim().toLowerCase() || '',
          createdAt: Date.now(),
          completions: {}
        };
        _data.habits.push(habit);
        saveData(_data);
        overlay.remove();
        renderGrid();
        toast('habit created');
      });

      actions.appendChild(cancelBtn);
      actions.appendChild(createBtn);
      content.appendChild(actions);
      overlay.appendChild(content);

      /* click outside to close */
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.remove();
      });

      document.body.appendChild(overlay);
      setTimeout(function () { nameInput.focus(); }, 50);
    }

    /* ---- initial render ---- */
    renderGrid();
  }

  return render;
})();
