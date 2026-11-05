/* Pomodoro — work/break timer with settings and notifications */

'use strict';

App.registerTool({
  id: 'pomodoro',
  name: 'Pomodoro Timer',
  icon: 'timer',
  category: 'Productivity',
  desc: 'Focused work sessions with breaks, session counting, and notifications.',

  render(view) {
    const cfg = Object.assign({ work: 25, short: 5, long: 15, longEvery: 4, notify: false }, Store.get('pomodoro', {}));
    const state = { phase: 'work', remaining: cfg.work * 60, running: false, completed: 0, timerId: null };

    const phaseLabel = { work: 'Focus session', short: 'Short break', long: 'Long break' };
    const R = 100, CIRC = 2 * Math.PI * R;

    view.innerHTML =
      '<div class="pomo-wrap">' +
        '<div class="card card-pad center">' +
          '<div class="pomo-ring">' +
            '<svg width="240" height="240" viewBox="0 0 240 240">' +
              '<circle class="track" cx="120" cy="120" r="' + R + '" fill="none" stroke-width="10"/>' +
              '<circle class="bar" id="ringBar" cx="120" cy="120" r="' + R + '" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + CIRC + '" stroke-dashoffset="0"/>' +
            '</svg>' +
            '<div class="pomo-center"><div class="pomo-time" id="pomoTime">25:00</div><div class="pomo-phase" id="pomoPhase">Focus session</div></div>' +
          '</div>' +
          '<div class="pomo-sessions" id="pomoSessions" title="Completed focus sessions"></div>' +
          '<div class="pomo-controls">' +
            '<button class="btn btn-primary" id="pomoStart">' + icon('play', 16) + 'Start</button>' +
            '<button class="btn btn-secondary" id="pomoReset">' + icon('reset', 15) + 'Reset</button>' +
            '<button class="btn btn-ghost" id="pomoSkip">Skip</button>' +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">Timer settings</span></div>' +
          '<div class="card-pad">' +
            '<div class="pomo-settings-grid">' +
              '<div class="field"><label class="label" for="setWork">Focus (minutes)</label><input class="input" id="setWork" type="number" min="1" max="180" value="' + cfg.work + '"></div>' +
              '<div class="field"><label class="label" for="setShort">Short break</label><input class="input" id="setShort" type="number" min="1" max="60" value="' + cfg.short + '"></div>' +
              '<div class="field"><label class="label" for="setLong">Long break</label><input class="input" id="setLong" type="number" min="1" max="120" value="' + cfg.long + '"></div>' +
              '<div class="field"><label class="label" for="setEvery">Long break every</label><input class="input" id="setEvery" type="number" min="2" max="12" value="' + cfg.longEvery + '"></div>' +
            '</div>' +
            '<div class="flex" style="justify-content:space-between">' +
              '<span class="small muted">Notify me when a session ends</span>' +
              '<input type="checkbox" class="check" id="setNotify" ' + (cfg.notify ? 'checked' : '') + ' aria-label="Enable notifications">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    const timeEl = view.querySelector('#pomoTime');
    const phaseEl = view.querySelector('#pomoPhase');
    const barEl = view.querySelector('#ringBar');
    const startBtn = view.querySelector('#pomoStart');
    const sessionsEl = view.querySelector('#pomoSessions');

    const saveCfg = () => Store.set('pomodoro', cfg);

    function renderSessions() {
      const total = cfg.longEvery;
      let html = '';
      for (let i = 0; i < total; i++) html += '<span class="pomo-dot' + (i < state.completed % total || (state.completed > 0 && state.completed % total === 0) ? ' on' : '') + '"></span>';
      sessionsEl.innerHTML = html;
    }

    function render() {
      const m = Math.floor(state.remaining / 60), s = state.remaining % 60;
      timeEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      phaseEl.textContent = phaseLabel[state.phase];
      const total = (state.phase === 'work' ? cfg.work : state.phase === 'short' ? cfg.short : cfg.long) * 60;
      const pct = total ? (total - state.remaining) / total : 0;
      barEl.style.strokeDashoffset = CIRC * (1 - pct);
      startBtn.innerHTML = state.running ? icon('pause', 16) + 'Pause' : icon('play', 16) + 'Start';
      renderSessions();
    }

    function notify(title, body) {
      if (!cfg.notify) return;
      try {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') new Notification(title, { body });
      } catch (e) { /* notifications unavailable */ }
    }

    function nextPhase() {
      if (state.phase === 'work') {
        state.completed++;
        state.phase = (state.completed % cfg.longEvery === 0) ? 'long' : 'short';
        notify('Focus session complete', 'Time for a ' + (state.phase === 'long' ? 'long' : 'short') + ' break.');
        App.toast('Focus session complete — take a break', 'success');
      } else {
        state.phase = 'work';
        notify('Break over', 'Back to focus.');
        App.toast('Break over — back to focus', 'info');
      }
      state.remaining = (state.phase === 'work' ? cfg.work : state.phase === 'short' ? cfg.short : cfg.long) * 60;
      render();
    }

    function tick() {
      state.remaining--;
      if (state.remaining <= 0) { nextPhase(); return; }
      render();
    }

    function setRunning(on) {
      state.running = on;
      if (on) {
        state.timerId = setInterval(tick, 1000);
      } else {
        clearInterval(state.timerId);
        state.timerId = null;
      }
      render();
    }

    startBtn.addEventListener('click', () => setRunning(!state.running));
    view.querySelector('#pomoReset').addEventListener('click', () => {
      setRunning(false);
      state.phase = 'work';
      state.remaining = cfg.work * 60;
      render();
    });
    view.querySelector('#pomoSkip').addEventListener('click', () => { nextPhase(); });

    view.querySelector('#setNotify').addEventListener('change', async (e) => {
      cfg.notify = e.target.checked;
      saveCfg();
      if (cfg.notify && 'Notification' in window && Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch (err) { /* ignore */ }
      }
    });

    const bindNum = (id, key, min, max) => {
      view.querySelector(id).addEventListener('change', (e) => {
        let v = parseInt(e.target.value, 10);
        if (isNaN(v)) { e.target.value = cfg[key]; return; }
        v = Math.min(max, Math.max(min, v));
        e.target.value = v;
        cfg[key] = v;
        saveCfg();
        if (!state.running && key === (state.phase === 'work' ? 'work' : state.phase)) {
          state.remaining = cfg[key] * 60;
          render();
        } else if (!state.running && ((state.phase === 'short' && key === 'short') || (state.phase === 'long' && key === 'long'))) {
          state.remaining = cfg[key] * 60;
          render();
        }
        App.toast('Timer settings saved', 'success');
      });
    };
    bindNum('#setWork', 'work', 1, 180);
    bindNum('#setShort', 'short', 1, 60);
    bindNum('#setLong', 'long', 1, 120);
    bindNum('#setEvery', 'longEvery', 2, 12);

    App.onCleanup(() => { if (state.timerId) clearInterval(state.timerId); });

    render();
  }
});
