/* Calculator — expression parser (no eval) with history */

'use strict';

App.registerTool({
  id: 'calculator',
  name: 'Calculator',
  icon: 'calculator',
  category: 'Utilities',
  desc: 'Full calculator with parentheses, decimals, history, and keyboard input.',

  render(view) {
    view.innerHTML =
      '<div class="calc-layout">' +
        '<div class="card">' +
          '<div class="calc-display"><div class="calc-expr" id="calcExpr">&nbsp;</div><div class="calc-result" id="calcResult">0</div></div>' +
          '<div class="calc-keys" id="calcKeys"></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">History</span><button class="btn btn-ghost btn-sm" id="clearHistory">Clear</button></div>' +
          '<div class="calc-history" id="calcHistory"></div>' +
        '</div>' +
      '</div>';

    const keys = [
      { k: 'C', cls: 'fn', act: 'clear' }, { k: '( )', cls: 'fn', act: 'paren' }, { k: '%', cls: 'op', act: 'char:%' }, { k: '÷', cls: 'op', act: 'char:÷' },
      { k: '7', act: 'char:7' }, { k: '8', act: 'char:8' }, { k: '9', act: 'char:9' }, { k: '×', cls: 'op', act: 'char:×' },
      { k: '4', act: 'char:4' }, { k: '5', act: 'char:5' }, { k: '6', act: 'char:6' }, { k: '−', cls: 'op', act: 'char:−' },
      { k: '1', act: 'char:1' }, { k: '2', act: 'char:2' }, { k: '3', act: 'char:3' }, { k: '+', cls: 'op', act: 'char:+' },
      { k: '0', act: 'char:0' }, { k: '.', act: 'char:.' }, { k: '⌫', cls: 'fn', act: 'back' }, { k: '=', cls: 'eq', act: 'equals' }
    ];
    view.querySelector('#calcKeys').innerHTML = keys.map(k =>
      '<button class="calc-key ' + (k.cls || '') + '" data-act="' + k.act + '" type="button">' + k.k + '</button>').join('');

    const exprEl = view.querySelector('#calcExpr');
    const resultEl = view.querySelector('#calcResult');
    const histEl = view.querySelector('#calcHistory');
    let expr = '';

    function evaluate(input) {
      // normalize symbols, then run recursive-descent parser
      const src = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
        .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
      let i = 0;
      function peek() { return src[i]; }
      function parseExpr() {
        let v = parseTerm();
        while (peek() === '+' || peek() === '-') {
          const op = src[i++]; const r = parseTerm();
          v = op === '+' ? v + r : v - r;
        }
        return v;
      }
      function parseTerm() {
        let v = parseUnary();
        while (peek() === '*' || peek() === '/') {
          const op = src[i++]; const r = parseUnary();
          if (op === '/') { if (r === 0) throw new Error('Cannot divide by zero'); v /= r; }
          else v *= r;
        }
        return v;
      }
      function parseUnary() {
        if (peek() === '-') { i++; return -parseUnary(); }
        if (peek() === '+') { i++; return parseUnary(); }
        if (peek() === '(') {
          i++;
          const v = parseExpr();
          if (peek() !== ')') throw new Error('Missing closing parenthesis');
          i++;
          return v;
        }
        return parseNumber();
      }
      function parseNumber() {
        let s = '';
        while (i < src.length && /[0-9.]/.test(src[i])) s += src[i++];
        if (!s) throw new Error(src[i] ? 'Unexpected “' + src[i] + '”' : 'Incomplete expression');
        if ((s.match(/\./g) || []).length > 1) throw new Error('Invalid number');
        return parseFloat(s);
      }
      const v = parseExpr();
      if (i < src.length) throw new Error('Unexpected “' + src[i] + '”');
      if (!isFinite(v)) throw new Error('Result is not a finite number');
      return v;
    }

    function fmt(v) {
      if (Number.isInteger(v)) return String(v);
      return String(Math.round(v * 1e10) / 1e10);
    }

    function render() {
      exprEl.textContent = expr || '\u00A0';
      if (!expr) { resultEl.textContent = '0'; resultEl.classList.remove('err'); return; }
      try {
        const v = evaluate(expr);
        resultEl.textContent = fmt(v);
        resultEl.classList.remove('err');
      } catch (err) {
        resultEl.textContent = expr.endsWith('=') ? 'Invalid expression' : '…';
        resultEl.classList.add('err');
      }
    }

    function renderHistory() {
      const hist = Store.get('calcHistory', []);
      if (!hist.length) {
        histEl.innerHTML = '<div class="empty" style="padding:28px 16px"><div class="empty-icon">' + icon('clock', 22) + '</div><div class="empty-title">No history yet</div><div class="empty-text">Solved calculations appear here.</div></div>';
        return;
      }
      histEl.innerHTML = hist.map((h, idx) =>
        '<button class="history-item" data-idx="' + idx + '" type="button">' +
          '<div class="history-expr">' + esc(h.expr) + ' =</div><div class="history-val">' + esc(h.value) + '</div>' +
        '</button>').join('');
    }

    function press(act) {
      if (act.startsWith('char:')) {
        expr += act.slice(5);
      } else if (act === 'clear') {
        expr = '';
      } else if (act === 'back') {
        expr = expr.slice(0, -1);
      } else if (act === 'paren') {
        const opens = (expr.match(/\(/g) || []).length;
        const closes = (expr.match(/\)/g) || []).length;
        expr += opens > closes && /[0-9.)]$/.test(expr) ? ')' : '(';
      } else if (act === 'equals') {
        if (!expr) return;
        try {
          const v = evaluate(expr);
          const hist = Store.get('calcHistory', []);
          hist.unshift({ expr, value: fmt(v) });
          Store.set('calcHistory', hist.slice(0, 50));
          expr = fmt(v);
          renderHistory();
        } catch (err) {
          App.toast(err.message, 'error');
          return;
        }
      }
      render();
    }

    view.querySelector('#calcKeys').addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (b) press(b.dataset.act);
    });

    histEl.addEventListener('click', e => {
      const item = e.target.closest('.history-item');
      if (!item) return;
      const h = Store.get('calcHistory', [])[item.dataset.idx];
      if (h) { expr = h.expr; render(); }
    });

    view.querySelector('#clearHistory').addEventListener('click', () => {
      Store.set('calcHistory', []);
      renderHistory();
    });

    // Keyboard input while this tool is active
    const keyMap = { '*': '×', '/': '÷', '-': '−' };
    const onKey = (e) => {
      if (App.activeTool !== 'calculator') return;
      if (e.target.matches('input, textarea, select')) return;
      if (/^[0-9.()+%]$/.test(e.key)) { press('char:' + e.key); e.preventDefault(); }
      else if (e.key === '+' || e.key === '*' || e.key === '/' || e.key === '-') { press('char:' + (keyMap[e.key] || e.key)); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === '=') { press('equals'); e.preventDefault(); }
      else if (e.key === 'Backspace') { press('back'); e.preventDefault(); }
      else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') { press('clear'); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    App.onCleanup(() => document.removeEventListener('keydown', onKey));

    render(); renderHistory();
  }
});
