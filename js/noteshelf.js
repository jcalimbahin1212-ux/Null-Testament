/* ============================================
   null testament — noteshelf module
   provides window.NT.renderNoteshelf(container)
   ============================================ */
window.NT = window.NT || {};

window.NT.renderNoteshelf = (function () {
  'use strict';

  var STORAGE_KEY = 'nt-noteshelf';
  var toast = function (m) { if (window.NT && window.NT.toast) window.NT.toast(m); };

  /* ---------- data helpers ---------- */
  function loadData () {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { folders: ['general', 'school', 'ideas'], notes: [] };
  }

  function saveData (data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function generateId () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatDate (ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function countWords (html) {
    var stripped = (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!stripped) return 0;
    return stripped.split(/\s+/).length;
  }

  function stripHtml (html) {
    return (html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/blockquote>/gi, '\n')
      .replace(/<blockquote[^>]*>/gi, '> ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function htmlToMarkdown (html) {
    return (html || '')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /* ---------- module state ---------- */
  var _data = null;
  var _activeFolder = 'all';
  var _activeNoteId = null;
  var _saveTimeout = null;

  /* ================================================
     MAIN RENDER
     ================================================ */
  function render (container) {
    _data = loadData();
    _activeFolder = 'all';
    _activeNoteId = null;
    container.innerHTML = '';

    /* layout */
    var layout = document.createElement('div');
    layout.className = 'noteshelf-layout';

    /* --- sidebar --- */
    var sidebar = document.createElement('div');
    sidebar.className = 'noteshelf-sidebar';

    /* sidebar header buttons */
    var sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'noteshelf-sidebar-header';

    var newFolderBtn = document.createElement('button');
    newFolderBtn.className = 'small-btn';
    newFolderBtn.textContent = '+ folder';
    newFolderBtn.addEventListener('click', function () {
      var name = prompt('folder name:');
      if (!name || !name.trim()) return;
      var folderName = name.trim().toLowerCase();
      if (_data.folders.indexOf(folderName) !== -1) { toast('folder already exists'); return; }
      _data.folders.push(folderName);
      saveData(_data);
      renderFolders();
      renderNoteList();
      toast('folder created');
    });

    var newNoteBtn = document.createElement('button');
    newNoteBtn.className = 'small-btn';
    newNoteBtn.textContent = '+ note';
    newNoteBtn.addEventListener('click', function () {
      var note = {
        id: generateId(),
        title: '',
        body: '',
        folder: _activeFolder === 'all' ? (_data.folders[0] || 'general') : _activeFolder,
        created: Date.now(),
        modified: Date.now()
      };
      _data.notes.unshift(note);
      saveData(_data);
      _activeNoteId = note.id;
      renderFolders();
      renderNoteList();
      openNote(note);
      setTimeout(function () {
        var ti = editor.querySelector('.note-title-input');
        if (ti) ti.focus();
      }, 50);
    });

    sidebarHeader.appendChild(newFolderBtn);
    sidebarHeader.appendChild(newNoteBtn);
    sidebar.appendChild(sidebarHeader);

    /* folder list */
    var folderList = document.createElement('div');
    folderList.className = 'folder-list';
    sidebar.appendChild(folderList);

    /* note list */
    var noteList = document.createElement('div');
    noteList.className = 'note-list';
    sidebar.appendChild(noteList);

    layout.appendChild(sidebar);

    /* --- editor panel --- */
    var editor = document.createElement('div');
    editor.className = 'noteshelf-editor';

    /* empty state */
    var emptyState = document.createElement('div');
    emptyState.className = 'editor-empty';
    emptyState.textContent = 'select a note or create a new one';
    editor.appendChild(emptyState);

    /* note editor (hidden initially) */
    var noteEditor = document.createElement('div');
    noteEditor.style.cssText = 'display:none;flex-direction:column;flex:1;';

    /* title */
    var titleInput = document.createElement('input');
    titleInput.className = 'note-title-input';
    titleInput.placeholder = 'untitled note...';
    noteEditor.appendChild(titleInput);

    /* toolbar */
    var toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';

    var toolbarButtons = [
      { label: 'B', cmd: 'bold', style: 'font-weight:bold' },
      { label: 'I', cmd: 'italic', style: 'font-style:italic' },
      { label: 'U', cmd: 'underline', style: 'text-decoration:underline' },
      { divider: true },
      { label: '\u2022 list', cmd: 'insertUnorderedList' },
      { label: '1. list', cmd: 'insertOrderedList' },
      { divider: true },
      { label: 'H2', cmd: 'formatBlock:H2' },
      { label: '\u201c quote', cmd: 'formatBlock:BLOCKQUOTE' }
    ];

    toolbarButtons.forEach(function (b) {
      if (b.divider) {
        var d = document.createElement('div');
        d.className = 'toolbar-divider';
        toolbar.appendChild(d);
        return;
      }
      var btn = document.createElement('button');
      btn.textContent = b.label;
      if (b.style) btn.style.cssText = b.style;
      btn.addEventListener('click', function () {
        if (b.cmd.indexOf('formatBlock:') === 0) {
          document.execCommand('formatBlock', false, b.cmd.split(':')[1]);
        } else {
          document.execCommand(b.cmd, false, null);
        }
      });
      toolbar.appendChild(btn);
    });

    noteEditor.appendChild(toolbar);

    /* body (contenteditable) */
    var noteBody = document.createElement('div');
    noteBody.className = 'note-body';
    noteBody.setAttribute('contenteditable', 'true');
    noteEditor.appendChild(noteBody);

    /* meta bar */
    var metaBar = document.createElement('div');
    metaBar.className = 'note-meta';

    var wordCountEl = document.createElement('span');
    wordCountEl.textContent = '0 words';

    var metaRight = document.createElement('div');
    metaRight.style.cssText = 'display:flex;gap:8px;align-items:center;';

    var lastModEl = document.createElement('span');

    var exportTxtBtn = document.createElement('button');
    exportTxtBtn.className = 'small-btn';
    exportTxtBtn.textContent = 'export .txt';
    exportTxtBtn.addEventListener('click', function () { exportNote('txt'); });

    var exportMdBtn = document.createElement('button');
    exportMdBtn.className = 'small-btn';
    exportMdBtn.textContent = 'export .md';
    exportMdBtn.addEventListener('click', function () { exportNote('md'); });

    var deleteNoteBtn = document.createElement('button');
    deleteNoteBtn.className = 'danger-btn';
    deleteNoteBtn.textContent = 'delete';
    deleteNoteBtn.addEventListener('click', function () {
      if (!_activeNoteId) return;
      if (!confirm('delete this note?')) return;
      _data.notes = _data.notes.filter(function (n) { return n.id !== _activeNoteId; });
      saveData(_data);
      closeEditor();
      renderFolders();
      renderNoteList();
      toast('note deleted');
    });

    metaRight.appendChild(lastModEl);
    metaRight.appendChild(exportTxtBtn);
    metaRight.appendChild(exportMdBtn);
    metaRight.appendChild(deleteNoteBtn);
    metaBar.appendChild(wordCountEl);
    metaBar.appendChild(metaRight);
    noteEditor.appendChild(metaBar);

    editor.appendChild(noteEditor);
    layout.appendChild(editor);
    container.appendChild(layout);

    /* ---- render functions ---- */
    function renderFolders () {
      folderList.innerHTML = '';

      /* "all notes" item */
      var allDiv = document.createElement('div');
      allDiv.className = 'folder-item' + (_activeFolder === 'all' ? ' active' : '');
      allDiv.innerHTML = '<span>all notes</span><span class="folder-count">' + _data.notes.length + '</span>';
      allDiv.addEventListener('click', function () {
        _activeFolder = 'all';
        renderFolders();
        renderNoteList();
      });
      folderList.appendChild(allDiv);

      _data.folders.forEach(function (f) {
        var count = _data.notes.filter(function (n) { return n.folder === f; }).length;
        var div = document.createElement('div');
        div.className = 'folder-item' + (_activeFolder === f ? ' active' : '');

        var nameSpan = document.createElement('span');
        nameSpan.textContent = f;

        var rightSide = document.createElement('div');
        rightSide.style.cssText = 'display:flex;align-items:center;gap:4px;';

        var countSpan = document.createElement('span');
        countSpan.className = 'folder-count';
        countSpan.textContent = count;

        rightSide.appendChild(countSpan);

        /* rename button (context) */
        var renameBtn = document.createElement('button');
        renameBtn.style.cssText = 'background:none;border:none;color:var(--text-dim);font-size:0.7rem;padding:0 2px;display:none;';
        renameBtn.textContent = '\u270e';
        renameBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var newName = prompt('rename folder:', f);
          if (!newName || !newName.trim() || newName.trim().toLowerCase() === f) return;
          var nn = newName.trim().toLowerCase();
          if (_data.folders.indexOf(nn) !== -1) { toast('folder name already used'); return; }
          /* update notes in this folder */
          _data.notes.forEach(function (n) { if (n.folder === f) n.folder = nn; });
          _data.folders[_data.folders.indexOf(f)] = nn;
          if (_activeFolder === f) _activeFolder = nn;
          saveData(_data);
          renderFolders();
          renderNoteList();
          toast('folder renamed');
        });

        /* delete button */
        var delBtn = document.createElement('button');
        delBtn.style.cssText = 'background:none;border:none;color:var(--text-dim);font-size:0.7rem;padding:0 2px;display:none;';
        delBtn.textContent = '\u2715';
        delBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!confirm('delete folder "' + f + '"? notes will move to general.')) return;
          _data.notes.forEach(function (n) { if (n.folder === f) n.folder = 'general'; });
          _data.folders.splice(_data.folders.indexOf(f), 1);
          if (_activeFolder === f) _activeFolder = 'all';
          saveData(_data);
          renderFolders();
          renderNoteList();
          toast('folder deleted');
        });

        rightSide.appendChild(renameBtn);
        rightSide.appendChild(delBtn);

        div.appendChild(nameSpan);
        div.appendChild(rightSide);

        /* show edit/delete on hover */
        div.addEventListener('mouseenter', function () { renameBtn.style.display = ''; delBtn.style.display = ''; });
        div.addEventListener('mouseleave', function () { renameBtn.style.display = 'none'; delBtn.style.display = 'none'; });

        div.addEventListener('click', function () {
          _activeFolder = f;
          renderFolders();
          renderNoteList();
        });
        folderList.appendChild(div);
      });
    }

    function renderNoteList () {
      noteList.innerHTML = '';

      var filtered = _activeFolder === 'all'
        ? _data.notes.slice()
        : _data.notes.filter(function (n) { return n.folder === _activeFolder; });

      if (filtered.length === 0) {
        noteList.innerHTML = '<p style="color:var(--text-dim);font-size:0.75rem;padding:8px 10px">no notes in this folder</p>';
        return;
      }

      /* sort by modified date newest first */
      filtered.sort(function (a, b) { return (b.modified || 0) - (a.modified || 0); });

      filtered.forEach(function (note) {
        var div = document.createElement('div');
        div.className = 'note-item' + (_activeNoteId === note.id ? ' active' : '');
        div.innerHTML =
          '<span class="note-item-title">' + (note.title || 'untitled') + '</span>' +
          '<span class="note-item-date">' + formatDate(note.modified) + '</span>';
        div.addEventListener('click', function () {
          _activeNoteId = note.id;
          renderNoteList();
          openNote(note);
        });
        noteList.appendChild(div);
      });
    }

    function openNote (note) {
      emptyState.style.display = 'none';
      noteEditor.style.display = 'flex';

      titleInput.value = note.title || '';
      noteBody.innerHTML = note.body || '';
      wordCountEl.textContent = countWords(note.body || '') + ' words';
      lastModEl.textContent = note.modified ? 'edited ' + formatDate(note.modified) : '';

      /* remove old listeners by cloning */
      var newTitle = titleInput.cloneNode(true);
      titleInput.parentNode.replaceChild(newTitle, titleInput);
      titleInput = newTitle;

      var newBody = noteBody.cloneNode(true);
      newBody.setAttribute('contenteditable', 'true');
      noteBody.parentNode.replaceChild(newBody, noteBody);
      noteBody = newBody;

      /* restore content after cloning */
      titleInput.value = note.title || '';
      noteBody.innerHTML = note.body || '';

      /* auto-save on title change */
      titleInput.addEventListener('input', function () {
        note.title = titleInput.value;
        note.modified = Date.now();
        saveData(_data);
        renderNoteList();
      });

      /* auto-save on body change (debounced) */
      noteBody.addEventListener('input', function () {
        clearTimeout(_saveTimeout);
        _saveTimeout = setTimeout(function () {
          note.body = noteBody.innerHTML;
          note.modified = Date.now();
          saveData(_data);
          wordCountEl.textContent = countWords(noteBody.innerHTML) + ' words';
          lastModEl.textContent = 'edited ' + formatDate(note.modified);
          renderNoteList();
        }, 500);
      });
    }

    function closeEditor () {
      emptyState.style.display = '';
      noteEditor.style.display = 'none';
      _activeNoteId = null;
      titleInput.value = '';
      noteBody.innerHTML = '';
    }

    function exportNote (format) {
      if (!_activeNoteId) return;
      var note = _data.notes.find(function (n) { return n.id === _activeNoteId; });
      if (!note) return;

      var title = note.title || 'untitled';
      var content;
      var ext;
      var mime;

      if (format === 'md') {
        content = '# ' + title + '\n\n' + htmlToMarkdown(note.body || '');
        ext = '.md';
        mime = 'text/markdown';
      } else {
        var body = stripHtml(note.body || '');
        content = title + '\n' + '='.repeat(title.length) + '\n\n' + body;
        ext = '.txt';
        mime = 'text/plain';
      }

      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (title.replace(/[^a-z0-9]/gi, '-') || 'note') + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('note exported as ' + format);
    }

    /* ---- initial render ---- */
    renderFolders();
    renderNoteList();
  }

  return render;
})();
