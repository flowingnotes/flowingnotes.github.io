/* Typing Test — WPM, accuracy, live feedback */

'use strict';

App.registerTool({
  id: 'typing',
  name: 'Typing Test',
  icon: 'keyboard',
  category: 'Study',
  desc: 'Measure typing speed and accuracy with timed practice passages.',

  render(view) {
    const PASSAGES = [
      'Studying a little every day works better than cramming the night before an exam. Short, focused sessions help the brain move new material into long-term memory, where it stays ready for test day.',
      'Good notes are short, clear, and written in your own words. When you rephrase an idea, your mind must process it first, and that extra step is exactly what makes the memory stronger later.',
      'The library opened early, and students found quiet tables near the tall windows. Some spread out their notes, some opened laptops, and a few simply sat with coffee and watched the morning light fill the room.',
      'A clear schedule reduces stress more than almost any other study habit. Decide what you will work on, decide when, and then protect that time as if it were an appointment you cannot miss.',
      'Sleep is part of studying. During deep sleep the brain replays and strengthens what you learned that day, which is why an all nighter often leaves you tired and unprepared rather than ahead.',
      'Active recall means closing the book and asking yourself what you remember. It feels harder than rereading, and that difficulty is the point: the effort of retrieval is what builds durable knowledge.',
      'The scientific method begins with a question, continues with careful observation, and ends with a conclusion that can be tested again. Results that cannot be repeated are not considered reliable evidence.',
      'Reading assigned material before class turns a lecture from a first encounter into a review. You arrive with questions already formed, and you know which parts of the topic deserve your closest attention.',
      'Group study works best when each person arrives prepared. Discussing a problem out loud exposes gaps in understanding quickly, and explaining a concept to someone else is one of the strongest ways to learn it.',
      'Distraction is the quiet enemy of focus. Every time the phone buzzes, attention shatters and takes several minutes to fully return, so most serious studying happens with notifications silenced and out of reach.'
    ];

    const state = {
      duration: 30, passage: '', typed: '', startTs: 0, timerId: null,
      running: false, finished: false
    };

    view.innerHTML = '<div class="typing-wrap" id="typingWrap"></div>';
    const wrap = view.querySelector('#typingWrap');

    function intro() {
      state.running = false; state.finished = false;
      wrap.innerHTML =
        '<div class="toolbar" style="justify-content:center;margin-bottom:22px">' +
          '<div class="dur-tabs" role="group" aria-label="Test duration">' +
            [15, 30, 60].map(d => '<button class="dur-tab' + (d === state.duration ? ' on' : '') + '" data-dur="' + d + '" type="button">' + d + 's</button>').join('') +
          '</div>' +
        '</div>' +
        '<div class="card card-pad center" style="padding:36px 24px">' +
          '<div class="hero-title" style="font-size:20px">Typing speed test</div>' +
          '<p class="muted small mt-8">A random passage appears when the test starts. Type it exactly — your speed and accuracy are measured live, and the test ends when time runs out.</p>' +
          '<div class="mt-20"><button class="btn btn-primary" id="startTest">' + icon('play', 16) + 'Start ' + state.duration + '-second test</button></div>' +
          '<p class="faint small mt-16">Best WPM so far: <b id="bestWpm">' + (Store.get('typingBest', 0) || '—') + '</b></p>' +
        '</div>';

      wrap.querySelectorAll('[data-dur]').forEach(b => b.addEventListener('click', () => {
        state.duration = +b.dataset.dur;
        wrap.querySelectorAll('[data-dur]').forEach(x => x.classList.toggle('on', x === b));
        const st = wrap.querySelector('#startTest');
        if (st) st.innerHTML = icon('play', 16) + 'Start ' + state.duration + '-second test';
      }));
      wrap.querySelector('#startTest').addEventListener('click', start);
    }

    function start() {
      state.passage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
      state.typed = '';
      state.startTs = 0;
      state.running = true;
      state.finished = false;

      wrap.innerHTML =
        '<div class="typing-meta" id="typingMeta">' +
          '<div class="typing-stat"><b id="mTime">' + state.duration + '</b><span>Seconds left</span></div>' +
          '<div class="typing-stat"><b id="mWpm">0</b><span>WPM</span></div>' +
          '<div class="typing-stat"><b id="mAcc">100%</b><span>Accuracy</span></div>' +
        '</div>' +
        '<div class="typing-text" id="typingText" tabindex="0" role="textbox" aria-label="Typing area"></div>' +
        '<div class="flex mt-16" style="justify-content:center"><span class="faint small">Click the text, then just start typing. <kbd>Backspace</kbd> fixes mistakes.</span></div>';

      renderText();
      const box = wrap.querySelector('#typingText');
      box.focus();

      state.timerId = setInterval(() => {
        if (!state.startTs) return; // clock starts on first keystroke
        const left = state.duration - Math.floor((Date.now() - state.startTs) / 1000);
        const t = wrap.querySelector('#mTime');
        if (t) t.textContent = Math.max(0, left);
        if (left <= 0) finish();
      }, 250);

      App.onCleanup(() => clearInterval(state.timerId));
    }

    function renderText() {
      const box = wrap.querySelector('#typingText');
      if (!box) return;
      let html = '';
      for (let i = 0; i < state.passage.length; i++) {
        const c = state.passage[i];
        let cls = 'ch';
        if (i < state.typed.length) cls += state.typed[i] === c ? ' correct' : ' incorrect';
        else if (i === state.typed.length && state.running) cls += ' current';
        if (c === ' ') cls += ' space';
        html += '<span class="' + cls + '">' + (c === ' ' ? ' ' : esc(c)) + '</span>';
      }
      box.innerHTML = html;
    }

    function metrics() {
      let correct = 0;
      for (let i = 0; i < state.typed.length; i++) if (state.typed[i] === state.passage[i]) correct++;
      const elapsedMin = state.startTs ? Math.max((Date.now() - state.startTs) / 60000, 1 / 60000) : 0;
      const wpm = state.startTs ? Math.round((state.typed.length / 5) / elapsedMin) : 0;
      const acc = state.typed.length ? Math.round(correct / state.typed.length * 100) : 100;
      return { correct, wpm, acc };
    }

    function updateMeta() {
      const m = metrics();
      const w = wrap.querySelector('#mWpm'), a = wrap.querySelector('#mAcc');
      if (w) w.textContent = m.wpm;
      if (a) a.textContent = m.acc + '%';
    }

    function finish() {
      clearInterval(state.timerId);
      state.running = false;
      state.finished = true;
      const m = metrics();
      const elapsed = Math.round((Date.now() - state.startTs) / 1000);
      const best = Store.get('typingBest', 0);
      if (m.wpm > best) Store.set('typingBest', m.wpm);

      wrap.innerHTML =
        '<div class="card typing-results">' +
          '<div class="big">' + m.wpm + '</div><div class="unit">words per minute</div>' +
          '<div class="stats-row mt-24" style="text-align:left">' +
            '<div class="stat-card"><span class="stat-icon">' + icon('check', 19) + '</span><div><div class="stat-value">' + m.acc + '%</div><div class="stat-label">Accuracy</div></div></div>' +
            '<div class="stat-card"><span class="stat-icon">' + icon('keyboard', 19) + '</span><div><div class="stat-value">' + state.typed.length + '</div><div class="stat-label">Characters typed</div></div></div>' +
            '<div class="stat-card"><span class="stat-icon">' + icon('clock', 19) + '</span><div><div class="stat-value">' + Math.min(elapsed, state.duration) + 's</div><div class="stat-label">Time used</div></div></div>' +
          '</div>' +
          (m.wpm > best ? '<p class="small" style="color:var(--success);font-weight:600">New personal best.</p>' : '<p class="faint small">Personal best: ' + Math.max(best, m.wpm) + ' WPM</p>') +
          '<div class="flex mt-16" style="justify-content:center"><button class="btn btn-primary" id="againBtn">' + icon('refresh', 16) + 'Take another test</button></div>' +
        '</div>';
      wrap.querySelector('#againBtn').addEventListener('click', intro);
    }

    const onKey = (e) => {
      if (App.activeTool !== 'typing' || !state.running) return;
      if (e.target instanceof Element && e.target.matches('input, textarea, select')) return;
      if (e.key === 'Backspace') {
        state.typed = state.typed.slice(0, -1);
        renderText(); updateMeta();
        e.preventDefault();
        return;
      }
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!state.startTs) state.startTs = Date.now();
      state.typed += e.key;
      renderText(); updateMeta();
      if (state.typed.length >= state.passage.length) finish();
      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    App.onCleanup(() => { document.removeEventListener('keydown', onKey); clearInterval(state.timerId); });

    intro();
  }
});
