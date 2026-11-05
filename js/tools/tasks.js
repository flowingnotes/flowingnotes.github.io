/* TaskFlow — task manager */

'use strict';

App.registerTool({
  id: 'tasks',
  name: 'TaskFlow',
  icon: 'tasks',
  category: 'Productivity',
  desc: 'Track schoolwork with priorities, due dates, categories, and progress.',

  stat() {
    const t = Store.get('tasks', []);
    const active = t.filter(x => !x.done).length;
    return active ? active + ' active' : 'All caught up';
  },

  render(view) {
    const state = { status: 'active', category: 'all', sort: 'due' };

    view.innerHTML =
      '<div class="toolbar">' +
        '<button class="btn btn-primary" id="addTask">' + icon('plus', 16) + 'New task</button>' +
        '<span class="spacer"></span>' +
        '<select class="select" id="fStatus" aria-label="Filter by status">' +
          '<option value="active">Active</option><option value="done">Completed</option><option value="all">All</option>' +
        '</select>' +
        '<select class="select" id="fCategory" aria-label="Filter by category"><option value="all">All categories</option></select>' +
        '<select class="select" id="fSort" aria-label="Sort tasks">' +
          '<option value="due">Sort: due date</option><option value="priority">Sort: priority</option><option value="created">Sort: newest</option>' +
        '</select>' +
      '</div>' +
      '<div class="card mb-16" id="progressCard"></div>' +
      '<div class="card"><div id="taskList"></div></div>';

    const listEl = view.querySelector('#taskList');
    const catSel = view.querySelector('#fCategory');

    const load = () => Store.get('tasks', []);
    const save = (t) => Store.set('tasks', t);

    const priRank = { high: 0, medium: 1, low: 2 };

    function categories() {
      return Array.from(new Set(load().map(t => t.category).filter(Boolean)));
    }

    function renderCats() {
      const cats = categories();
      const prev = catSel.value;
      catSel.innerHTML = '<option value="all">All categories</option>' +
        cats.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
      if (cats.includes(prev)) catSel.value = prev;
    }

    function renderProgress() {
      const tasks = load();
      const done = tasks.filter(t => t.done).length;
      const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
      view.querySelector('#progressCard').innerHTML = tasks.length ?
        '<div class="card-pad"><div class="flex" style="justify-content:space-between;margin-bottom:8px"><span class="card-title">Progress</span><span class="small muted">' + done + ' of ' + tasks.length + ' completed</span></div><div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div></div>' : '';
    }

    function renderList() {
      let tasks = load();
      if (state.status === 'active') tasks = tasks.filter(t => !t.done);
      if (state.status === 'done') tasks = tasks.filter(t => t.done);
      if (state.category !== 'all') tasks = tasks.filter(t => t.category === state.category);

      tasks.sort((a, b) => {
        if (state.sort === 'priority') return (priRank[a.priority] - priRank[b.priority]) || (a.due || '9999').localeCompare(b.due || '9999');
        if (state.sort === 'created') return b.created - a.created;
        return (a.due || '9999').localeCompare(b.due || '9999') || (priRank[a.priority] - priRank[b.priority]);
      });

      if (!tasks.length) {
        listEl.innerHTML = '<div class="empty"><div class="empty-icon">' + icon('tasks', 22) + '</div><div class="empty-title">No tasks here</div><div class="empty-text">' +
          (load().length ? 'No tasks match the current filters.' : 'Create your first task to start tracking your schoolwork.') +
          '</div><button class="btn btn-primary btn-sm mt-8" id="emptyAdd">' + icon('plus', 15) + 'New task</button></div>';
        const b = listEl.querySelector('#emptyAdd');
        if (b) b.addEventListener('click', () => openDialog());
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      listEl.innerHTML = tasks.map(t => {
        const overdue = t.due && t.due < today && !t.done;
        const priClass = t.priority === 'high' ? 'badge-high' : t.priority === 'medium' ? 'badge-med' : 'badge-low';
        return '<div class="list-item" data-id="' + t.id + '">' +
          '<input type="checkbox" class="check" data-act="toggle" ' + (t.done ? 'checked' : '') + ' aria-label="Mark task complete">' +
          '<div class="list-body">' +
            '<div class="list-title' + (t.done ? ' done-text' : '') + '">' + esc(t.title) + '</div>' +
            '<div class="list-meta">' +
              '<span class="badge ' + priClass + '">' + esc(t.priority) + '</span>' +
              (t.category ? '<span class="badge">' + esc(t.category) + '</span>' : '') +
              (t.due ? '<span class="badge ' + (overdue ? 'badge-overdue' : 'badge-due') + '">' + icon('clock', 12) + (overdue ? 'Overdue — ' : '') + esc(t.due) + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="list-actions">' +
            '<button class="icon-btn" data-act="edit" aria-label="Edit task">' + icon('pencil', 16) + '</button>' +
            '<button class="icon-btn icon-btn-danger" data-act="delete" aria-label="Delete task">' + icon('trash', 16) + '</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderAll() { renderCats(); renderProgress(); renderList(); }

    async function openDialog(existing) {
      const cats = categories();
      const values = await App.form({
        title: existing ? 'Edit task' : 'New task',
        fields: [
          { key: 'title', label: 'Task', required: true, value: existing ? existing.title : '', placeholder: 'e.g. Finish chemistry lab report' },
          { key: 'category', label: 'Category', value: existing ? existing.category : '', placeholder: 'e.g. Chemistry' },
          { key: 'priority', label: 'Priority', type: 'select', value: existing ? existing.priority : 'medium', options: ['low', 'medium', 'high'] },
          { key: 'due', label: 'Due date', type: 'date', value: existing ? existing.due : '' }
        ],
        submitText: existing ? 'Save changes' : 'Add task'
      });
      if (!values) return;
      const tasks = load();
      if (existing) {
        const t = tasks.find(x => x.id === existing.id);
        if (t) Object.assign(t, { title: values.title, category: values.category, priority: values.priority, due: values.due });
      } else {
        tasks.push({ id: uid(), title: values.title, category: values.category, priority: values.priority, due: values.due, done: false, created: Date.now() });
      }
      save(tasks);
      renderAll();
      App.toast(existing ? 'Task updated' : 'Task added', 'success');
    }

    listEl.addEventListener('click', async (e) => {
      const row = e.target.closest('.list-item');
      if (!row) return;
      const id = row.dataset.id;
      const act = e.target.closest('[data-act]');
      if (!act) return;
      const tasks = load();
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      if (act.dataset.act === 'toggle') {
        task.done = !task.done;
        save(tasks); renderAll();
      } else if (act.dataset.act === 'edit') {
        openDialog(task);
      } else if (act.dataset.act === 'delete') {
        const ok = await App.confirm({ title: 'Delete task', message: 'Delete “' + task.title + '”? This cannot be undone.', confirmText: 'Delete', danger: true });
        if (ok) { save(tasks.filter(t => t.id !== id)); renderAll(); App.toast('Task deleted', 'success'); }
      }
    });

    view.querySelector('#addTask').addEventListener('click', () => openDialog());
    view.querySelector('#fStatus').addEventListener('change', e => { state.status = e.target.value; renderList(); });
    catSel.addEventListener('change', e => { state.category = e.target.value; renderList(); });
    view.querySelector('#fSort').addEventListener('change', e => { state.sort = e.target.value; renderList(); });

    renderAll();
  }
});
