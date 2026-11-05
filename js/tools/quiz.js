/* Quiz Generator — build quizzes, take them, auto-grade */

'use strict';

App.registerTool({
  id: 'quiz',
  name: 'Quiz Generator',
  icon: 'quiz',
  category: 'Study',
  desc: 'Create multiple-choice and true/false quizzes with automatic grading.',

  render(view) {
    let openQuizId = null;
    view.innerHTML = '<div id="quizRoot"></div>';
    const root = view.querySelector('#quizRoot');

    const load = () => Store.get('quizzes', []);
    const save = (q) => Store.set('quizzes', q);

    function renderList() {
      const quizzes = load();
      root.innerHTML =
        '<div class="toolbar"><button class="btn btn-primary" id="newQuiz">' + icon('plus', 16) + 'New quiz</button></div>' +
        (quizzes.length ?
          '<div class="card">' + quizzes.map(q =>
            '<div class="list-item">' +
              '<div class="list-body">' +
                '<div class="list-title">' + esc(q.title) + '</div>' +
                '<div class="list-meta">' + q.questions.length + (q.questions.length === 1 ? ' question' : ' questions') + ' · created ' + esc(new Date(q.created).toLocaleDateString()) + '</div>' +
              '</div>' +
              '<div class="list-actions">' +
                '<button class="btn btn-primary btn-sm" data-take="' + q.id + '">' + icon('play', 14) + 'Take</button>' +
                '<button class="btn btn-secondary btn-sm" data-edit="' + q.id + '">Edit</button>' +
                '<button class="icon-btn icon-btn-danger" data-del="' + q.id + '" aria-label="Delete quiz">' + icon('trash', 16) + '</button>' +
              '</div>' +
            '</div>').join('') + '</div>'
          :
          '<div class="card"><div class="empty"><div class="empty-icon">' + icon('quiz', 22) + '</div><div class="empty-title">No quizzes yet</div><div class="empty-text">Write your own study questions, then take the quiz and see which answers you got wrong.</div></div></div>');

      root.querySelector('#newQuiz').addEventListener('click', async () => {
        const v = await App.form({ title: 'New quiz', fields: [{ key: 'title', label: 'Quiz title', required: true, placeholder: 'e.g. History — World War II review' }], submitText: 'Create quiz' });
        if (!v) return;
        const quizzes = load();
        quizzes.push({ id: uid(), title: v.title, questions: [], created: Date.now() });
        save(quizzes);
        openQuizId = quizzes[quizzes.length - 1].id;
        renderEditor();
        App.toast('Quiz created', 'success');
      });

      root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { openQuizId = b.dataset.edit; renderEditor(); }));
      root.querySelectorAll('[data-take]').forEach(b => b.addEventListener('click', () => { openQuizId = b.dataset.take; renderTake(); }));
      root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
        const quiz = load().find(q => q.id === b.dataset.del);
        const ok = await App.confirm({ title: 'Delete quiz', message: 'Delete “' + quiz.title + '” and all of its questions?', confirmText: 'Delete', danger: true });
        if (ok) { save(load().filter(q => q.id !== quiz.id)); renderList(); App.toast('Quiz deleted', 'success'); }
      }));
    }

    function renderEditor() {
      const quiz = load().find(q => q.id === openQuizId);
      if (!quiz) { renderList(); return; }

      root.innerHTML =
        '<div class="toolbar">' +
          '<button class="btn btn-ghost" id="backBtn">' + icon('arrowLeft', 16) + 'All quizzes</button>' +
          '<span class="card-title" style="font-size:16px">' + esc(quiz.title) + '</span>' +
          '<span class="spacer"></span>' +
          (quiz.questions.length ? '<button class="btn btn-primary" id="takeBtn">' + icon('play', 15) + 'Take quiz</button>' : '') +
          '<button class="btn btn-secondary" id="renameBtn">Rename</button>' +
        '</div>' +
        '<div class="card" id="qList"></div>' +
        '<div class="mt-16"><button class="btn btn-primary" id="addQ">' + icon('plus', 16) + 'Add question</button></div>';

      root.querySelector('#backBtn').addEventListener('click', () => { openQuizId = null; renderList(); });
      root.querySelector('#renameBtn').addEventListener('click', async () => {
        const v = await App.form({ title: 'Rename quiz', fields: [{ key: 'title', label: 'Quiz title', required: true, value: quiz.title }], submitText: 'Rename' });
        if (!v) return;
        const quizzes = load(); const q = quizzes.find(x => x.id === quiz.id);
        if (q) { q.title = v.title; save(quizzes); renderEditor(); }
      });
      const tb = root.querySelector('#takeBtn');
      if (tb) tb.addEventListener('click', renderTake);
      root.querySelector('#addQ').addEventListener('click', () => addQuestion(quiz));

      const list = root.querySelector('#qList');
      if (!quiz.questions.length) {
        list.innerHTML = '<div class="empty"><div class="empty-icon">' + icon('quiz', 22) + '</div><div class="empty-title">No questions yet</div><div class="empty-text">Add multiple-choice or true/false questions to this quiz.</div></div>';
      } else {
        list.innerHTML = quiz.questions.map((q, i) =>
          '<div class="list-item">' +
            '<div class="list-body">' +
              '<div class="list-title"><span class="quiz-q-num">' + (i + 1) + '.</span>' + esc(q.text) + '</div>' +
              '<div class="list-meta"><span class="badge">' + (q.type === 'mc' ? 'Multiple choice' : 'True / False') + '</span>' +
              (q.type === 'mc' ? '<span class="badge badge-accent">' + esc(q.options[q.correct] || '') + '</span>' : '<span class="badge badge-accent">' + (q.correct ? 'True' : 'False') + '</span>') + '</div>' +
            '</div>' +
            '<div class="list-actions">' +
              '<button class="icon-btn" data-qedit="' + q.id + '" aria-label="Edit question">' + icon('pencil', 16) + '</button>' +
              '<button class="icon-btn icon-btn-danger" data-qdel="' + q.id + '" aria-label="Delete question">' + icon('trash', 16) + '</button>' +
            '</div>' +
          '</div>').join('');
      }

      list.addEventListener('click', async (e) => {
        const ed = e.target.closest('[data-qedit]');
        if (ed) {
          const question = quiz.questions.find(q => q.id === ed.dataset.qedit);
          if (question) addQuestion(quiz, question);
          return;
        }
        const del = e.target.closest('[data-qdel]');
        if (del) {
          const ok = await App.confirm({ title: 'Delete question', message: 'Remove this question from the quiz?', confirmText: 'Delete', danger: true });
          if (!ok) return;
          const quizzes = load(); const q = quizzes.find(x => x.id === quiz.id);
          q.questions = q.questions.filter(x => x.id !== del.dataset.qdel);
          save(quizzes);
          renderEditor();
        }
      });
    }

    async function addQuestion(quiz, existing) {
      const isMc = existing ? existing.type === 'mc' : true;
      const fields = [
        { key: 'type', label: 'Question type', type: 'select', value: existing ? existing.type : 'mc', options: [{ value: 'mc', label: 'Multiple choice' }, { value: 'tf', label: 'True / False' }] },
        { key: 'text', label: 'Question text', required: true, value: existing ? existing.text : '', placeholder: 'e.g. What year did the event take place?' }
      ];
      const v = await App.form({
        title: existing ? 'Edit question' : 'Add question',
        fields,
        submitText: existing ? 'Save' : 'Add question'
      });
      if (!v) return;

      if (v.type === 'mc') {
        // collect options + correct answer in a second step
        const opts = existing && existing.type === 'mc' ? existing.options : ['', '', '', ''];
        const correct = existing && existing.type === 'mc' ? existing.correct : 0;
        const optFields = opts.map((o, i) => ({ key: 'opt' + i, label: 'Option ' + 'ABCD'[i] + (i === 0 ? ' (correct)' : ''), required: true, value: o }));
        const res = await App.form({
          title: 'Multiple-choice options',
          body: null,
          fields: optFields,
          submitText: 'Save question'
        });
        if (!res) return;
        const newOpts = opts.map((_, i) => res['opt' + i].trim()).filter(Boolean);
        if (newOpts.length < 2) { App.toast('Provide at least two options', 'error'); return; }
        const ans = await App.form({
          title: 'Correct answer',
          fields: [{ key: 'correct', label: 'Which option is correct?', type: 'select', value: 'ABCD'[correct], options: newOpts.map((o, i) => ({ value: i, label: o })) }],
          submitText: 'Save question'
        });
        if (!ans) return;
        const q = { id: existing ? existing.id : uid(), type: 'mc', text: v.text, options: newOpts, correct: +ans.correct };
        upsertQuestion(quiz, q);
      } else {
        const ans = await App.form({
          title: 'True / false answer',
          fields: [{ key: 'correct', label: 'Correct answer', type: 'select', value: existing && existing.type === 'tf' ? (existing.correct ? 'true' : 'false') : 'true', options: [{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }] }],
          submitText: 'Save question'
        });
        if (!ans) return;
        const q = { id: existing ? existing.id : uid(), type: 'tf', text: v.text, correct: ans.correct === 'true' };
        upsertQuestion(quiz, q);
      }
    }

    function upsertQuestion(quiz, q) {
      const quizzes = load();
      const target = quizzes.find(x => x.id === quiz.id);
      const idx = target.questions.findIndex(x => x.id === q.id);
      if (idx >= 0) target.questions[idx] = q;
      else target.questions.push(q);
      save(quizzes);
      renderEditor();
      App.toast(idx >= 0 ? 'Question updated' : 'Question added', 'success');
    }

    function renderTake() {
      const quiz = load().find(q => q.id === openQuizId);
      if (!quiz || !quiz.questions.length) { renderList(); return; }
      const answers = {};

      root.innerHTML =
        '<div class="toolbar">' +
          '<button class="btn btn-ghost" id="exitTake">' + icon('arrowLeft', 16) + 'Back to editor</button>' +
          '<span class="card-title" style="font-size:16px">' + esc(quiz.title) + '</span>' +
        '</div>' +
        '<div id="takeBody"></div>';

      root.querySelector('#exitTake').addEventListener('click', renderEditor);

      const body = root.querySelector('#takeBody');

      function renderForm() {
        body.innerHTML =
          quiz.questions.map((q, qi) =>
            '<div class="card quiz-card mb-16" data-q="' + q.id + '">' +
              '<div class="quiz-q-text"><span class="quiz-q-num">' + (qi + 1) + '.</span><span>' + esc(q.text) + '</span></div>' +
              '<div class="quiz-options">' +
                (q.type === 'mc' ? q.options.map((o, oi) =>
                  '<label class="quiz-opt"><input type="radio" name="q' + q.id + '" value="' + oi + '"><span>' + esc(o) + '</span></label>').join('')
                  : '<label class="quiz-opt"><input type="radio" name="q' + q.id + '" value="true"><span>True</span></label><label class="quiz-opt"><input type="radio" name="q' + q.id + '" value="false"><span>False</span></label>') +
              '</div>' +
            '</div>').join('') +
          '<div class="flex" style="justify-content:center"><button class="btn btn-primary" id="submitQuiz">Submit answers</button></div>';

        body.querySelectorAll('input[type=radio]').forEach(r => r.addEventListener('change', () => {
          const card = r.closest('.quiz-card');
          card.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('sel'));
          r.closest('.quiz-opt').classList.add('sel');
          answers[card.dataset.q] = r.value;
        }));

        body.querySelector('#submitQuiz').addEventListener('click', () => {
          const unanswered = quiz.questions.filter(q => answers[q.id] === undefined);
          if (unanswered.length) { App.toast('Answer all ' + quiz.questions.length + ' questions first', 'error'); return; }
          renderResults();
        });
      }

      function renderResults() {
        let correct = 0;
        const rows = quiz.questions.map((q, qi) => {
          const given = answers[q.id];
          const right = q.type === 'mc' ? String(q.correct) === given : (q.correct ? 'true' : 'false') === given;
          if (right) correct++;
          const givenText = q.type === 'mc' ? (q.options[+given] || '—') : (given === 'true' ? 'True' : 'False');
          const rightText = q.type === 'mc' ? q.options[q.correct] : (q.correct ? 'True' : 'False');
          return '<div class="card quiz-card mb-16">' +
            '<div class="quiz-q-text"><span class="quiz-q-num">' + (qi + 1) + '.</span><span>' + esc(q.text) + '</span><span class="quiz-review-tag ' + (right ? 'ok' : 'no') + '">' + (right ? 'Correct' : 'Incorrect') + '</span></div>' +
            (right ? '' : '<p class="small muted">Your answer: <b>' + esc(givenText) + '</b> · Correct answer: <b style="color:var(--success)">' + esc(rightText) + '</b></p>') +
            '</div>';
        }).join('');

        body.innerHTML =
          '<div class="score-banner mb-16"><div class="big">' + correct + ' / ' + quiz.questions.length + '</div>' +
          '<div class="muted">' + Math.round(correct / quiz.questions.length * 100) + '% — ' + (correct === quiz.questions.length ? 'Perfect score' : correct / quiz.questions.length >= .7 ? 'Nice work' : 'Keep practicing') + '</div></div>' +
          rows +
          '<div class="flex" style="justify-content:center"><button class="btn btn-primary" id="retake">' + icon('refresh', 15) + 'Retake quiz</button><button class="btn btn-secondary" id="backEdit">Back to editor</button></div>';

        body.querySelector('#retake').addEventListener('click', () => { for (const k of Object.keys(answers)) delete answers[k]; renderForm(); });
        body.querySelector('#backEdit').addEventListener('click', renderEditor);
      }

      renderForm();
    }

    renderList();
  }
});
