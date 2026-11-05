/* Grade Calculator — points and weighted-category grading */

'use strict';

App.registerTool({
  id: 'grades',
  name: 'Grade Calculator',
  icon: 'award',
  category: 'Planning',
  desc: 'Compute assignment percentages and overall grades, weighted or points-based.',

  render(view) {
    const state = Object.assign({ mode: 'points', categories: [], assignments: [] }, Store.get('grades', {}));
    if (!Array.isArray(state.categories)) state.categories = [];
    if (!Array.isArray(state.assignments)) state.assignments = [];

    view.innerHTML =
      '<div class="toolbar">' +
        '<button class="btn btn-primary" id="addAssign">' + icon('plus', 16) + 'Add assignment</button>' +
        '<button class="btn btn-secondary" id="editCats">Categories</button>' +
        '<span class="spacer"></span>' +
        '<div class="dur-tabs" role="group" aria-label="Grading mode">' +
          '<button class="dur-tab' + (state.mode === 'points' ? ' on' : '') + '" data-mode="points" type="button">Points</button>' +
          '<button class="dur-tab' + (state.mode === 'weighted' ? ' on' : '') + '" data-mode="weighted" type="button">Weighted</button>' +
        '</div>' +
      '</div>' +
      '<div class="card mb-16"><div style="overflow-x:auto"><table class="grade-table" id="gradeTable"></table></div></div>' +
      '<div id="gradeResults"></div>';

    const tableEl = view.querySelector('#gradeTable');
    const resultsEl = view.querySelector('#gradeResults');
    const save = () => Store.set('grades', state);

    const LETTERS = [[93, 'A'], [90, 'A−'], [87, 'B+'], [83, 'B'], [80, 'B−'], [77, 'C+'], [73, 'C'], [70, 'C−'], [67, 'D+'], [63, 'D'], [60, 'D−'], [-1, 'F']];
    const letterFor = (pct) => { for (const [cut, l] of LETTERS) if (pct >= cut) return l; return 'F'; };
    const pct = (a) => (a.max > 0 && a.score !== '' && !isNaN(a.score)) ? a.score / a.max : null;

    function renderTable() {
      const cats = state.categories;
      tableEl.innerHTML =
        '<thead><tr><th>Assignment</th><th style="width:90px">Score</th><th style="width:90px">Out of</th>' +
          (state.mode === 'weighted' ? '<th style="width:150px">Category</th>' : '') +
          '<th style="width:80px">Grade</th><th class="cell-actions"></th></tr></thead>' +
        '<tbody id="assignRows">' +
        (state.assignments.length ? state.assignments.map(a =>
          '<tr data-id="' + a.id + '">' +
            '<td><input class="input" data-f="name" value="' + esc(a.name) + '" placeholder="Assignment name"></td>' +
            '<td><input class="input" data-f="score" type="number" step="any" min="0" value="' + esc(a.score) + '"></td>' +
            '<td><input class="input" data-f="max" type="number" step="any" min="0" value="' + esc(a.max) + '"></td>' +
            (state.mode === 'weighted' ? '<td><select class="select" data-f="cat"><option value="">—</option>' +
              cats.map(c => '<option value="' + c.id + '"' + (a.cat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></td>' : '') +
            '<td class="cell-num" data-cell="grade">' + (pct(a) !== null ? Math.round(pct(a) * 100) + '%' : '—') + '</td>' +
            '<td class="cell-actions"><button class="icon-btn icon-btn-danger" data-del="' + a.id + '" aria-label="Remove assignment">' + icon('trash', 15) + '</button></td>' +
          '</tr>').join('')
          : '<tr><td colspan="6"><div class="empty" style="padding:28px 12px"><div class="empty-icon">' + icon('award', 22) + '</div><div class="empty-title">No assignments yet</div><div class="empty-text">Add assignments with scores to calculate your grade.</div></div></td></tr>') +
        '</tbody>';
    }

    function renderResults() {
      const results = [];
      const valid = state.assignments.filter(a => pct(a) !== null);

      if (state.mode === 'points') {
        const sumScore = valid.reduce((s, a) => s + (+a.score), 0);
        const sumMax = valid.reduce((s, a) => s + (+a.max), 0);
        if (sumMax > 0) {
          const p = sumScore / sumMax * 100;
          results.push('<div class="grade-result overall"><b>' + p.toFixed(1) + '%</b><span>Overall grade</span></div>');
          results.push('<div class="grade-result"><b>' + letterFor(p) + '</b><span>Letter grade</span></div>');
          results.push('<div class="grade-result"><b>' + sumScore.toFixed(0) + ' / ' + sumMax.toFixed(0) + '</b><span>Points earned</span></div>');
          results.push('<div class="grade-result"><b>' + valid.length + '</b><span>Assignments counted</span></div>');
        }
      } else {
        let weightedSum = 0, weightUsed = 0;
        state.categories.forEach(c => {
          const w = Number(c.weight) || 0;
          const inCat = valid.filter(a => a.cat === c.id);
          if (inCat.length) {
            const s = inCat.reduce((x, a) => x + (+a.score), 0);
            const m = inCat.reduce((x, a) => x + (+a.max), 0);
            if (m > 0) {
              const avg = s / m * 100;
              weightedSum += avg * w;
              weightUsed += w;
              results.push('<div class="grade-result"><b>' + avg.toFixed(1) + '%</b><span>' + esc(c.name) + ' (weight ' + w + '%)</span></div>');
            }
          }
        });
        if (weightUsed > 0) {
          const p = weightedSum / weightUsed;
          results.unshift('<div class="grade-result overall"><b>' + p.toFixed(1) + '%</b><span>Overall grade</span></div>');
          results.splice(1, 0, '<div class="grade-result"><b>' + letterFor(p) + '</b><span>Letter grade</span></div>');
        }
      }

      resultsEl.innerHTML = results.length ?
        '<div class="grade-results">' + results.join('') + '</div>'
        : '<div class="card"><div class="empty" style="padding:28px"><div class="empty-icon">' + icon('award', 22) + '</div><div class="empty-title">Nothing to calculate yet</div><div class="empty-text">Add at least one assignment with a score and maximum points.</div></div></div>';
    }

    function renderAll() { renderTable(); renderResults(); }

    tableEl.addEventListener('input', (e) => {
      const row = e.target.closest('tr[data-id]');
      if (!row) return;
      const a = state.assignments.find(x => x.id === row.dataset.id);
      if (!a) return;
      const f = e.target.dataset.f;
      a[f] = f === 'name' ? e.target.value : e.target.value;
      if (f === 'name') save();
      const g = row.querySelector('[data-cell="grade"]');
      if (g) g.textContent = pct(a) !== null ? Math.round(pct(a) * 100) + '%' : '—';
      renderResults();
    });
    tableEl.addEventListener('change', (e) => {
      const row = e.target.closest('tr[data-id]');
      if (row) { save(); }
    });
    tableEl.addEventListener('click', async (e) => {
      const del = e.target.closest('[data-del]');
      if (!del) return;
      const ok = await App.confirm({ title: 'Remove assignment', message: 'Remove this assignment from the grade calculation?', confirmText: 'Remove', danger: true });
      if (!ok) return;
      state.assignments = state.assignments.filter(a => a.id !== del.dataset.del);
      save(); renderAll();
    });

    view.querySelector('#addAssign').addEventListener('click', () => {
      state.assignments.push({ id: uid(), name: '', score: '', max: '', cat: state.categories[0] ? state.categories[0].id : '' });
      save(); renderAll();
      const rows = tableEl.querySelectorAll('#assignRows tr');
      if (rows.length) rows[rows.length - 1].querySelector('input').focus();
    });

    view.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
      state.mode = b.dataset.mode;
      save();
      view.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
      renderAll();
    }));

    view.querySelector('#editCats').addEventListener('click', () => openCats());

    function openCats() {
      const cats = state.categories.map(c => c);
      const body =
        '<p class="small muted mb-16">Categories are used in weighted mode. Each has a weight (percent); the overall grade is the weighted average of category averages.</p>' +
        '<div id="catRows">' + cats.map((c, i) =>
          '<div class="flex mb-16"><input class="input" data-ci="' + i + '" data-cf="name" value="' + esc(c.name) + '" placeholder="Category name" style="flex:2"><input class="input" data-ci="' + i + '" data-cf="weight" type="number" min="0" max="100" value="' + esc(c.weight) + '" placeholder="Weight %" style="flex:1"><button class="icon-btn icon-btn-danger" data-cdel="' + i + '" aria-label="Remove category">' + icon('trash', 16) + '</button></div>').join('') + '</div>' +
        '<button class="btn btn-secondary btn-sm" id="addCat">' + icon('plus', 15) + 'Add category</button>';

      const m = App.modal({ title: 'Categories', body, wide: true, buttons: [{ text: 'Done', kind: 'primary', value: 'done' }] });

      const rerender = () => {
        m.el.querySelector('#catRows').innerHTML = cats.map((c, i) =>
          '<div class="flex mb-16"><input class="input" data-ci="' + i + '" data-cf="name" value="' + esc(c.name) + '" placeholder="Category name" style="flex:2"><input class="input" data-ci="' + i + '" data-cf="weight" type="number" min="0" max="100" value="' + esc(c.weight) + '" placeholder="Weight %" style="flex:1"><button class="icon-btn icon-btn-danger" data-cdel="' + i + '" aria-label="Remove category">' + icon('trash', 16) + '</button></div>').join('');
      };

      m.el.addEventListener('click', (e) => {
        const add = e.target.closest('#addCat');
        if (add) { cats.push({ id: uid(), name: '', weight: 10 }); rerender(); return; }
        const del = e.target.closest('[data-cdel]');
        if (del) { cats.splice(+del.dataset.cdel, 1); rerender(); }
      });
      m.el.addEventListener('input', (e) => {
        const f = e.target.dataset.cf;
        if (!f) return;
        const c = cats[+e.target.dataset.ci];
        if (c) c[f] = f === 'weight' ? (parseFloat(e.target.value) || 0) : e.target.value;
      });
      m.el.querySelector('[data-value="done"]').addEventListener('click', () => {
        state.categories = cats.filter(c => c.name.trim());
        save(); renderAll();
      });
    }

    renderAll();
  }
});
