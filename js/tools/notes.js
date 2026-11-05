/* Notes — note taking with autosave and search */

'use strict';

App.registerTool({
  id: 'notes',
  name: 'Notes',
  icon: 'notes',
  category: 'Study',
  desc: 'Write and organize notes with automatic saving and full-text search.',

  stat() {
    const n = Store.get('notes', []);
    return n.length ? n.length + (n.length === 1 ? ' note' : ' notes') : 'No notes yet';
  },

  render(view) {
    let selected = null;
    let search = '';
    let saveTimer = null;

    view.innerHTML =
      '<div class="toolbar">' +
        '<button class="btn btn-primary" id="newNote">' + icon('plus', 16) + 'New note</button>' +
        '<span class="spacer"></span>' +
        '<input class="input" id="noteSearch" type="search" placeholder="Search notes…" aria-label="Search notes" style="width:240px;max-width:100%">' +
      '</div>' +
      '<div class="notes-layout">' +
        '<div class="card"><div id="noteList"></div></div>' +
        '<div class="card" id="editorCard"></div>' +
      '</div>';

    const listEl = view.querySelector('#noteList');
    const editorCard = view.querySelector('#editorCard');

    const load = () => Store.get('notes', []);
    const save = (n) => Store.set('notes', n);

    function renderList() {
      const notes = load();
      const visible = notes
        .filter(n => !search || (n.title + ' ' + n.body).toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (b.pinned - a.pinned) || (b.updated - a.updated));

      if (!visible.length) {
        listEl.innerHTML = '<div class="empty" style="padding:32px 16px"><div class="empty-icon">' + icon('notes', 22) + '</div><div class="empty-title">' +
          (notes.length ? 'No matches' : 'No notes yet') + '</div><div class="empty-text">' +
          (notes.length ? 'No notes match your search.' : 'Create a note to get started.') + '</div></div>';
        return;
      }

      listEl.innerHTML = visible.map(n =>
        '<button class="note-row' + (selected && selected.id === n.id ? ' active' : '') + '" data-id="' + n.id + '" type="button">' +
          '<span class="note-row-title">' + (n.pinned ? '<span class="pin">' + icon('pin', 13) + '</span>' : '') + esc(n.title || 'Untitled') + '</span>' +
          '<span class="note-row-meta">' + esc(timeAgo(n.updated)) + '</span>' +
        '</button>').join('');
    }

    function renderEditor() {
      if (!selected) {
        editorCard.innerHTML = '<div class="empty" style="min-height:320px"><div class="empty-icon">' + icon('notes', 22) + '</div><div class="empty-title">No note selected</div><div class="empty-text">Select a note from the list, or create a new one.</div></div>';
        return;
      }
      editorCard.innerHTML =
        '<div class="note-editor-head">' +
          '<input class="note-title-input" id="noteTitle" placeholder="Note title" value="' + esc(selected.title) + '" aria-label="Note title">' +
          '<span class="save-state" id="saveState">Saved</span>' +
          '<button class="icon-btn" id="pinNote" aria-label="Pin note" title="Pin">' + icon('pin', 16) + '</button>' +
          '<button class="icon-btn icon-btn-danger" id="deleteNote" aria-label="Delete note">' + icon('trash', 16) + '</button>' +
        '</div>' +
        '<textarea class="note-body-input" id="noteBody" placeholder="Start writing…" aria-label="Note body">' + esc(selected.body) + '</textarea>' +
        '<div class="note-editor-head" style="border-bottom:none;border-top:1px solid var(--border)"><span class="save-state" id="lastEdited">Last edited ' + esc(timeAgo(selected.updated)) + '</span></div>';

      const titleEl = editorCard.querySelector('#noteTitle');
      const bodyEl = editorCard.querySelector('#noteBody');
      const stateEl = editorCard.querySelector('#saveState');

      const persist = () => {
        const notes = load();
        const note = notes.find(n => n.id === selected.id);
        if (!note) return;
        note.title = titleEl.value;
        note.body = bodyEl.value;
        note.updated = Date.now();
        save(notes);
        selected = note;
        stateEl.textContent = 'Saved';
        const le = editorCard.querySelector('#lastEdited');
        if (le) le.textContent = 'Last edited just now';
        renderList();
      };

      const onInput = () => {
        stateEl.textContent = 'Saving…';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(persist, 500);
      };
      titleEl.addEventListener('input', onInput);
      bodyEl.addEventListener('input', onInput);

      editorCard.querySelector('#pinNote').addEventListener('click', () => {
        const notes = load();
        const note = notes.find(n => n.id === selected.id);
        if (note) { note.pinned = note.pinned ? 0 : 1; save(notes); selected = note; renderList(); }
      });

      editorCard.querySelector('#deleteNote').addEventListener('click', async () => {
        const ok = await App.confirm({ title: 'Delete note', message: 'Delete “' + (selected.title || 'Untitled') + '”? This cannot be undone.', confirmText: 'Delete', danger: true });
        if (!ok) return;
        save(load().filter(n => n.id !== selected.id));
        selected = null;
        renderList(); renderEditor();
        App.toast('Note deleted', 'success');
      });
    }

    function newNote() {
      const notes = load();
      const note = { id: uid(), title: '', body: '', updated: Date.now(), pinned: 0 };
      notes.push(note);
      save(notes);
      selected = note;
      renderList(); renderEditor();
      const t = editorCard.querySelector('#noteTitle');
      if (t) t.focus();
    }

    listEl.addEventListener('click', (e) => {
      const row = e.target.closest('.note-row');
      if (!row) return;
      selected = load().find(n => n.id === row.dataset.id) || null;
      renderList(); renderEditor();
    });

    view.querySelector('#newNote').addEventListener('click', newNote);
    view.querySelector('#noteSearch').addEventListener('input', e => { search = e.target.value; renderList(); });

    renderList(); renderEditor();
  }
});
