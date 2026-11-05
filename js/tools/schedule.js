/* Schedule Planner — weekly class schedule */

'use strict';

App.registerTool({
  id: 'schedule',
  name: 'Schedule Planner',
  icon: 'calendar',
  category: 'Planning',
  desc: 'Organize classes in a weekly grid with times and days.',

  render(view) {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const H_START = 7, H_END = 22; // 7:00 – 22:00

    view.innerHTML =
      '<div class="toolbar">' +
        '<button class="btn btn-primary" id="addClass">' + icon('plus', 16) + 'Add class</button>' +
        '<span class="spacer"></span>' +
        '<span class="small muted">Today is highlighted</span>' +
      '</div>' +
      '<div class="card mb-16" id="classListCard"></div>' +
      '<div class="card schedule-scroll"><div class="schedule-grid" id="scheduleGrid"></div></div>';

    const gridEl = view.querySelector('#scheduleGrid');
    const listCard = view.querySelector('#classListCard');

    const load = () => Store.get('classes', []);
    const save = (c) => Store.set('classes', c);

    function todayIdx() { return (new Date().getDay() + 6) % 7; }

    function renderGrid() {
      const classes = load();
      const today = todayIdx();
      let html = '<div class="sched-corner"></div>' + DAYS.map((d, i) =>
        '<div class="sched-head' + (i === today ? ' today' : '') + '">' + d + '</div>').join('');

      // time column + day columns
      const totalMin = (H_END - H_START) * 60;
      html += '<div class="sched-timecol">';
      for (let h = H_START; h < H_END; h++) {
        html += '<div class="sched-hour" style="height:' + (60 / totalMin * 100) + '%">' + (h < 12 ? h + ' AM' : h === 12 ? '12 PM' : (h - 12) + ' PM') + '</div>';
      }
      html += '</div>';

      for (let d = 0; d < 7; d++) {
        html += '<div class="sched-day' + (d === today ? ' today' : '') + '"><div class="sched-day-inner">';
        classes.filter(c => c.days.includes(d)).forEach(c => {
          const [sh, sm] = c.start.split(':').map(Number);
          const [eh, em] = c.end.split(':').map(Number);
          const startMin = (sh * 60 + sm) - H_START * 60;
          const durMin = (eh * 60 + em) - (sh * 60 + sm);
          if (durMin <= 0) return;
          const top = startMin / totalMin * 100;
          const height = durMin / totalMin * 100;
          html += '<div class="sched-block" data-id="' + c.id + '" style="top:' + top + '%;height:' + height + '%"><b>' + esc(c.name) + '</b><span>' + esc(fmtTime(c.start)) + '–' + esc(fmtTime(c.end)) + '</span></div>';
        });
        html += '</div></div>';
      }
      gridEl.innerHTML = html;

      gridEl.querySelectorAll('.sched-block').forEach(b => b.addEventListener('click', () => {
        const cls = load().find(c => c.id === b.dataset.id);
        if (cls) openDialog(cls);
      }));
    }

    function fmtTime(t) {
      const [h, m] = t.split(':').map(Number);
      const ampm = h < 12 ? 'AM' : 'PM';
      const hh = h % 12 === 0 ? 12 : h % 12;
      return hh + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ampm;
    }

    function renderList() {
      const classes = load();
      if (!classes.length) {
        listCard.innerHTML = '<div class="empty" style="padding:28px"><div class="empty-icon">' + icon('calendar', 22) + '</div><div class="empty-title">No classes yet</div><div class="empty-text">Add your classes with their days and times to see them on the weekly schedule.</div></div>';
        return;
      }
      listCard.innerHTML = classes.map(c =>
        '<div class="list-item">' +
          '<span class="tool-icon" style="width:34px;height:34px">' + icon('calendar', 17) + '</span>' +
          '<div class="list-body"><div class="list-title">' + esc(c.name) + '</div>' +
            '<div class="list-meta">' + esc(fmtTime(c.start) + '–' + fmtTime(c.end)) + ' · ' + c.days.map(d => DAYS[d]).join(', ') + '</div></div>' +
          '<div class="list-actions">' +
            '<button class="icon-btn" data-edit="' + c.id + '" aria-label="Edit class">' + icon('pencil', 16) + '</button>' +
            '<button class="icon-btn icon-btn-danger" data-del="' + c.id + '" aria-label="Delete class">' + icon('trash', 16) + '</button>' +
          '</div>' +
        '</div>').join('');
    }

    async function openDialog(existing) {
      const values = await App.form({
        title: existing ? 'Edit class' : 'Add class',
        fields: [
          { key: 'name', label: 'Class name', required: true, value: existing ? existing.name : '', placeholder: 'e.g. Algebra II' },
          { key: 'days', label: 'Days', type: 'checkboxes', required: true, value: existing ? existing.days : [0], options: DAYS.map((d, i) => ({ value: i, label: d })) },
          { key: 'start', label: 'Start time', type: 'time', required: true, value: existing ? existing.start : '08:00' },
          { key: 'end', label: 'End time', type: 'time', required: true, value: existing ? existing.end : '09:00' }
        ],
        submitText: existing ? 'Save changes' : 'Add class'
      });
      if (!values) return;
      if (!values.days.length) { App.toast('Select at least one day', 'error'); return; }
      if (values.end <= values.start) { App.toast('End time must be after the start time', 'error'); return; }
      const days = values.days.map(Number);
      const classes = load();
      if (existing) {
        const c = classes.find(x => x.id === existing.id);
        if (c) Object.assign(c, values, { days });
      } else {
        classes.push(Object.assign({ id: uid() }, values, { days }));
      }
      save(classes);
      renderList(); renderGrid();
      App.toast(existing ? 'Class updated' : 'Class added', 'success');
    }

    view.querySelector('#addClass').addEventListener('click', () => openDialog());
    listCard.addEventListener('click', async (e) => {
      const edit = e.target.closest('[data-edit]');
      if (edit) { openDialog(load().find(c => c.id === edit.dataset.edit)); return; }
      const del = e.target.closest('[data-del]');
      if (del) {
        const cls = load().find(c => c.id === del.dataset.del);
        const ok = await App.confirm({ title: 'Delete class', message: 'Remove “' + cls.name + '” from your schedule?', confirmText: 'Remove', danger: true });
        if (ok) { save(load().filter(c => c.id !== cls.id)); renderList(); renderGrid(); App.toast('Class removed', 'success'); }
      }
    });

    renderList(); renderGrid();
  }
});
