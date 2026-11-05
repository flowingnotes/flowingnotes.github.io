/* Checklist — multiple checklists with progress and autosave */

'use strict';

App.registerTool({
  id: 'checklists',
  name: 'Checklist',
  icon: 'checks',
  category: 'Productivity',
  desc: 'Simple checklists for assignments, projects, and everyday organization.',

  render(view) {
    let openId = null;

    view.innerHTML =
      '<div class="toolbar"><button class="btn btn-primary" id="newList">' + icon('plus', 16) + 'New checklist</button></div>' +
      '<div class="check-layout">' +
        '<div class="card"><div id="listsCol"></div></div>' +
        '<div class="card" id="itemsCard"></div>' +
      '</div>';

    const listsCol = view.querySelector('#listsCol');
    const itemsCard = view.querySelector('#itemsCard');

    const load = () => Store.get('checklists', []);
    const save = (l) => Store.set('checklists', l);

    function renderLists() {
      const lists = load();
      if (!openId || !lists.find(l => l.id === openId)) openId = lists.length ? lists[0].id : null;

      if (!lists.length) {
        listsCol.innerHTML = '<div class="empty" style="padding:32px 16px"><div class="empty-icon">' + icon('checks', 22) + '</div><div class="empty-title">No checklists</div><div class="empty-text">Create checklists for assignments, packing, projects, or anything else.</div></div>';
        return;
      }
      listsCol.innerHTML = lists.map(l => {
        const done = l.items.filter(i => i.done).length;
        return '<button class="note-row' + (l.id === openId ? ' active' : '') + '" data-id="' + l.id + '" type="button">' +
          '<span class="note-row-title">' + esc(l.name) + '</span>' +
          '<span class="note-row-meta">' + done + ' of ' + l.items.length + ' done</span>' +
        '</button>';
      }).join('');
    }

    function renderItems() {
      const list = load().find(l => l.id === openId);
      if (!list) {
        itemsCard.innerHTML = '<div class="empty" style="min-height:260px"><div class="empty-icon">' + icon('checks', 22) + '</div><div class="empty-title">No checklist selected</div><div class="empty-text">Create a checklist to get started.</div></div>';
        return;
      }
      const done = list.items.filter(i => i.done).length;
      const pct = list.items.length ? Math.round(done / list.items.length * 100) : 0;

      itemsCard.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title">' + esc(list.name) + '</span>' +
          '<span class="flex" style="gap:4px">' +
            '<button class="icon-btn" id="renameList" aria-label="Rename checklist">' + icon('pencil', 16) + '</button>' +
            '<button class="icon-btn icon-btn-danger" id="deleteList" aria-label="Delete checklist">' + icon('trash', 16) + '</button>' +
          '</span>' +
        '</div>' +
        '<div class="add-row"><input class="input" id="newItem" placeholder="Add an item…" aria-label="New item"><button class="btn btn-primary" id="addItem">' + icon('plus', 15) + 'Add</button></div>' +
        '<div id="itemsList"></div>' +
        '<div class="card-pad" style="border-top:1px solid var(--border)">' +
          '<div class="flex" style="justify-content:space-between;margin-bottom:8px"><span class="small muted">Progress</span><span class="small muted">' + done + ' of ' + list.items.length + '</span></div>' +
          '<div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
        '</div>';

      const itemsEl = itemsCard.querySelector('#itemsList');
      itemsEl.innerHTML = list.items.length ? list.items.map(i =>
        '<div class="check-item" data-id="' + i.id + '">' +
          '<input type="checkbox" class="check" data-toggle ' + (i.done ? 'checked' : '') + ' aria-label="Mark item complete">' +
          '<input type="text" data-text value="' + esc(i.text) + '" aria-label="Item text">' +
          '<button class="icon-btn icon-btn-danger" data-del aria-label="Remove item">' + icon('x', 15) + '</button>' +
        '</div>').join('')
        : '<div class="empty" style="padding:28px 16px"><div class="empty-icon">' + icon('checks', 22) + '</div><div class="empty-title">Nothing here yet</div><div class="empty-text">Add items to this checklist above.</div></div>';

      // events
      itemsEl.addEventListener('change', (e) => {
        if (!e.target.matches('[data-toggle]')) return;
        const lists = load();
        const l = lists.find(x => x.id === openId);
        const item = l.items.find(i => i.id === e.target.closest('.check-item').dataset.id);
        item.done = e.target.checked;
        save(lists);
        renderLists();
        // refresh progress bar without rebuilding inputs (keeps focus)
        const done2 = l.items.filter(i => i.done).length;
        itemsCard.querySelector('.progress-bar').style.width = (l.items.length ? Math.round(done2 / l.items.length * 100) : 0) + '%';
        const counter = itemsCard.querySelectorAll('.card-pad')[1];
        if (counter) counter.querySelector('.muted:last-child').textContent = done2 + ' of ' + l.items.length;
      });

      itemsEl.addEventListener('input', (e) => {
        if (!e.target.matches('[data-text]')) return;
        const lists = load();
        const l = lists.find(x => x.id === openId);
        const item = l.items.find(i => i.id === e.target.closest('.check-item').dataset.id);
        item.text = e.target.value;
        save(lists);
      });

      itemsEl.addEventListener('click', async (e) => {
        const del = e.target.closest('[data-del]');
        if (!del) return;
        const lists = load();
        const l = lists.find(x => x.id === openId);
        l.items = l.items.filter(i => i.id !== del.closest('.check-item').dataset.id);
        save(lists);
        renderLists(); renderItems();
      });

      itemsCard.querySelector('#addItem').addEventListener('click', () => {
        const input = itemsCard.querySelector('#newItem');
        if (!input.value.trim()) { App.toast('Enter an item first', 'error'); return; }
        const lists = load();
        const l = lists.find(x => x.id === openId);
        l.items.push({ id: uid(), text: input.value.trim(), done: false });
        save(lists);
        input.value = '';
        renderLists(); renderItems();
      });
      itemsCard.querySelector('#newItem').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') itemsCard.querySelector('#addItem').click();
      });

      itemsCard.querySelector('#renameList').addEventListener('click', async () => {
        const v = await App.form({ title: 'Rename checklist', fields: [{ key: 'name', label: 'Checklist name', required: true, value: list.name }], submitText: 'Rename' });
        if (!v) return;
        const lists = load();
        lists.find(x => x.id === openId).name = v.name;
        save(lists);
        renderLists(); renderItems();
      });

      itemsCard.querySelector('#deleteList').addEventListener('click', async () => {
        const ok = await App.confirm({ title: 'Delete checklist', message: 'Delete “' + list.name + '” and its ' + list.items.length + ' items?', confirmText: 'Delete', danger: true });
        if (!ok) return;
        save(load().filter(l => l.id !== openId));
        openId = null;
        renderLists(); renderItems();
        App.toast('Checklist deleted', 'success');
      });
    }

    view.querySelector('#newList').addEventListener('click', async () => {
      const v = await App.form({ title: 'New checklist', fields: [{ key: 'name', label: 'Checklist name', required: true, placeholder: 'e.g. English essay steps' }], submitText: 'Create' });
      if (!v) return;
      const lists = load();
      lists.push({ id: uid(), name: v.name, items: [] });
      save(lists);
      openId = lists[lists.length - 1].id;
      renderLists(); renderItems();
      App.toast('Checklist created', 'success');
    });

    listsCol.addEventListener('click', (e) => {
      const row = e.target.closest('.note-row');
      if (!row) return;
      openId = row.dataset.id;
      renderLists(); renderItems();
    });

    renderLists(); renderItems();
  }
});
