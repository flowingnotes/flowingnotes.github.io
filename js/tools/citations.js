/* Citation Generator — MLA, APA, Chicago */

'use strict';

App.registerTool({
  id: 'citations',
  name: 'Citation Generator',
  icon: 'book',
  category: 'Utilities',
  desc: 'Build formatted MLA, APA, and Chicago citations for websites.',

  render(view) {
    const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
    const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let style = 'mla';
    let lastCitation = '';

    view.innerHTML =
      '<div class="toolbar">' +
        '<div class="cite-style-tabs" role="group" aria-label="Citation style">' +
          '<button class="cite-style-tab on" data-style="mla" type="button">MLA</button>' +
          '<button class="cite-style-tab" data-style="apa" type="button">APA</button>' +
          '<button class="cite-style-tab" data-style="chicago" type="button">Chicago</button>' +
        '</div>' +
      '</div>' +
      '<div class="grid-2" style="align-items:start">' +
        '<div class="card card-pad">' +
          '<div class="field"><label class="label" for="cAuthor">Author (First Last)</label><input class="input" id="cAuthor" placeholder="e.g. Jane Smith"></div>' +
          '<div class="field"><label class="label" for="cTitle">Page or article title <span class="req">*</span></label><input class="input" id="cTitle" placeholder="e.g. The history of the printing press"></div>' +
          '<div class="field"><label class="label" for="cSite">Website or publisher</label><input class="input" id="cSite" placeholder="e.g. Encyclopedia Online"></div>' +
          '<div class="form-row">' +
            '<div class="field"><label class="label" for="cDate">Publication date</label><input class="input" id="cDate" type="date"></div>' +
            '<div class="field"><label class="label" for="cAccess">Access date</label><input class="input" id="cAccess" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
          '</div>' +
          '<div class="field"><label class="label" for="cUrl">URL</label><input class="input" id="cUrl" placeholder="https://example.com/article"></div>' +
          '<button class="btn btn-primary" id="cGenerate">Generate citation</button>' +
        '</div>' +
        '<div class="card card-pad">' +
          '<div class="settings-label">Generated citation</div>' +
          '<div class="cite-preview" id="citeOut"><span class="faint">Fill in the form and generate a citation — it appears here in ' + style.toUpperCase() + ' format.</span></div>' +
          '<div class="flex mt-16"><button class="btn btn-primary" id="citeCopy">' + icon('copy', 16) + 'Copy citation</button><button class="btn btn-secondary" id="citeSave">Save to list</button></div>' +
        '</div>' +
      '</div>' +
      '<h2 class="section-title mt-24">Saved citations</h2>' +
      '<div class="card" id="savedList"></div>';

    const outEl = view.querySelector('#citeOut');
    const savedEl = view.querySelector('#savedList');

    function splitAuthor(a) {
      a = (a || '').trim();
      if (!a) return null;
      const parts = a.split(/\s+/);
      return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
    }

    function fmtDateMLA(iso) {
      if (!iso) return '';
      const [y, m, d] = iso.split('-').map(Number);
      return (d ? d + ' ' : '') + MONTHS[m - 1] + ' ' + y;
    }
    function fmtDateAPA(iso) {
      if (!iso) return '';
      const [y, m, d] = iso.split('-').map(Number);
      return y + ', ' + MONTHS_FULL[m - 1] + (d ? ' ' + d : '');
    }
    function fmtDateChicago(iso) {
      if (!iso) return '';
      const [y, m, d] = iso.split('-').map(Number);
      return MONTHS_FULL[m - 1] + (d ? ' ' + d + ', ' : ' ') + y;
    }

    function build() {
      const title = view.querySelector('#cTitle').value.trim();
      if (!title) { App.toast('A title is required', 'error'); return null; }
      const author = splitAuthor(view.querySelector('#cAuthor').value);
      const site = view.querySelector('#cSite').value.trim();
      const date = view.querySelector('#cDate').value;
      const access = view.querySelector('#cAccess').value;
      const url = view.querySelector('#cUrl').value.trim();

      let citation = '';
      if (style === 'mla') {
        const segs = [];
        if (author) segs.push(author.last + (author.first ? ', ' + author.first : '') + '.');
        segs.push('“' + title + '.”');
        if (site) segs.push(site + ',');
        if (date) segs.push(fmtDateMLA(date) + ',');
        if (url) segs.push(url + '.');
        if (access) segs.push('Accessed ' + fmtDateMLA(access) + '.');
        citation = segs.join(' ');
      } else if (style === 'apa') {
        const segs = [];
        if (author) segs.push(author.last + (author.first ? ', ' + author.first[0] + '.' : '') + '.');
        segs.push('(' + fmtDateAPA(date || '') + (date ? '' : 'n.d.') + ').');
        segs.push(title + '.');
        if (site) segs.push(site + '.');
        if (url) segs.push(url);
        citation = segs.join(' ');
        citation = citation.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\.\./g, '.');
      } else {
        const segs = [];
        if (author) segs.push(author.last + (author.first ? ', ' + author.first : '') + '.');
        segs.push('“' + title + '.”');
        if (site) segs.push(site + '.');
        if (date) segs.push(fmtDateChicago(date) + '.');
        if (url) segs.push(url + '.');
        citation = segs.join(' ');
      }
      return citation;
    }

    view.querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => {
      style = b.dataset.style;
      view.querySelectorAll('[data-style]').forEach(x => x.classList.toggle('on', x === b));
      if (lastCitation) { view.querySelector('#cGenerate').click(); }
      else outEl.innerHTML = '<span class="faint">Fill in the form and generate a citation — it appears here in ' + style.toUpperCase() + ' format.</span>';
    }));

    view.querySelector('#cGenerate').addEventListener('click', () => {
      const c = build();
      if (!c) return;
      lastCitation = c;
      outEl.textContent = c;
    });

    view.querySelector('#citeCopy').addEventListener('click', async () => {
      if (!lastCitation) { App.toast('Generate a citation first', 'error'); return; }
      const ok = await App.copyToClipboard(lastCitation);
      App.toast(ok ? 'Citation copied to clipboard' : 'Could not copy to clipboard', ok ? 'success' : 'error');
    });

    function renderSaved() {
      const saved = Store.get('citations', []);
      if (!saved.length) {
        savedEl.innerHTML = '<div class="empty" style="padding:28px"><div class="empty-icon">' + icon('book', 22) + '</div><div class="empty-title">No saved citations</div><div class="empty-text">Generate a citation and save it here to keep a running bibliography.</div></div>';
        return;
      }
      savedEl.innerHTML = saved.map(c =>
        '<div class="list-item">' +
          '<div class="list-body"><div style="font-size:14px;line-height:1.6">' + esc(c.text) + '</div><div class="list-meta"><span class="badge">' + esc(c.style.toUpperCase()) + '</span><span class="badge">' + esc(timeAgo(c.created)) + '</span></div></div>' +
          '<div class="list-actions">' +
            '<button class="icon-btn" data-copy="' + c.id + '" aria-label="Copy citation">' + icon('copy', 16) + '</button>' +
            '<button class="icon-btn icon-btn-danger" data-del="' + c.id + '" aria-label="Delete citation">' + icon('trash', 16) + '</button>' +
          '</div>' +
        '</div>').join('');
    }

    view.querySelector('#citeSave').addEventListener('click', () => {
      if (!lastCitation) { App.toast('Generate a citation first', 'error'); return; }
      const saved = Store.get('citations', []);
      saved.unshift({ id: uid(), text: lastCitation, style, created: Date.now() });
      Store.set('citations', saved);
      renderSaved();
      App.toast('Citation saved', 'success');
    });

    savedEl.addEventListener('click', async (e) => {
      const cp = e.target.closest('[data-copy]');
      if (cp) {
        const c = Store.get('citations', []).find(x => x.id === cp.dataset.copy);
        if (c) {
          const ok = await App.copyToClipboard(c.text);
          App.toast(ok ? 'Citation copied to clipboard' : 'Could not copy to clipboard', ok ? 'success' : 'error');
        }
        return;
      }
      const del = e.target.closest('[data-del]');
      if (del) {
        Store.set('citations', Store.get('citations', []).filter(x => x.id !== del.dataset.del));
        renderSaved();
        App.toast('Citation removed', 'success');
      }
    });

    renderSaved();
  }
});
