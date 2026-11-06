/* FlowingNotes — application shell: routing, navigation, dashboard,
   settings, modals, toasts, contact page. */

'use strict';

/* ---------- Icons (consistent 24px stroke set) ---------- */

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  tasks: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  notes: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6.01" y2="10"/><line x1="10" y1="10" x2="10.01" y2="10"/><line x1="14" y1="10" x2="14.01" y2="10"/><line x1="18" y1="10" x2="18.01" y2="10"/><line x1="7" y1="14" x2="17" y2="14"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  timer: '<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1"/>',
  quiz: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  converter: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  checks: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><polyline points="3 5 4.5 6.5 7 3.5"/><polyline points="3 17 4.5 18.5 7 15.5"/><line x1="3.5" y1="11" x2="3.51" y2="11"/>',
  settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  pencil: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  reset: '<polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>',
  shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-6.5a5 5 0 0 0-11 0z"/><path d="M9 8V4h6v4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  infoCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 1 1-2-9.4L23 10"/>',
  edit3: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>'
};

function icon(name, size) {
  const s = size || 18;
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;')
    .replace(/"/g, '&' + 'quot;').replace(/'/g, '&' + '#39;');
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' hr ago';
  if (s < 7 * 86400) return Math.floor(s / 86400) + ' days ago';
  return new Date(ts).toLocaleDateString();
}

/* ---------- App shell ---------- */

const App = {
  tools: [],
  settings: { theme: 'light', accent: 'indigo' },
  activeTool: null,
  _cleanup: null,
  CONTACT_EMAIL: 'flowingnotes@protonmail.com',
  FETCH_URL: 'https://raw.githubusercontent.com/flowingnotes/flowingnotesfetch/refs/heads/main/notes.txt',

  registerTool(tool) { this.tools.push(tool); },

  /* ----- boot ----- */

  boot() {
    const saved = Store.get('settings', null);
    if (saved && typeof saved === 'object') {
      this.settings = Object.assign({ theme: 'light', accent: 'indigo' }, saved);
    }
    this.applySettings();
    this.buildNav();
    this.bindChrome();

    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  applySettings() {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.settings.theme);
    root.setAttribute('data-accent', this.settings.accent);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = icon(this.settings.theme === 'dark' ? 'sun' : 'moon');
  },

  bindChrome() {
    document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar(true));
    document.getElementById('sidebarBackdrop').addEventListener('click', () => this.toggleSidebar(false));
    document.getElementById('themeBtn').addEventListener('click', () => {
      this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
      Store.set('settings', this.settings);
      this.applySettings();
    });
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
    document.getElementById('navSettings').addEventListener('click', () => this.openSettings());
  },

  toggleSidebar(open) {
    document.getElementById('sidebar').classList.toggle('open', open);
    document.getElementById('sidebarBackdrop').classList.toggle('show', open);
  },

  /* ----- navigation ----- */

  navGroups: [
    { label: 'Workspace', ids: ['dashboard'] },
    { label: 'Productivity', ids: ['tasks', 'pomodoro', 'checklists'] },
    { label: 'Study', ids: ['notes', 'flashcards', 'quiz', 'typing'] },
    { label: 'Planning', ids: ['schedule', 'grades'] },
    { label: 'Utilities', ids: ['calculator', 'converter', 'citations'] }
  ],

  buildNav() {
    const nav = document.getElementById('nav');
    let html = '';
    this.navGroups.forEach(group => {
      html += '<div class="nav-section"><div class="nav-label">' + group.label + '</div>';
      group.ids.forEach(id => {
        if (id === 'dashboard') {
          html += '<a class="nav-item" data-nav="dashboard" href="#/dashboard"><span class="nav-icon">' + icon('dashboard') + '</span><span>Dashboard</span></a>';
        } else {
          const t = this.tools.find(t => t.id === id);
          if (!t) return;
          html += '<a class="nav-item" data-nav="' + t.id + '" href="#/tool/' + t.id + '"><span class="nav-icon">' + icon(t.icon) + '</span><span>' + esc(t.name) + '</span></a>';
        }
      });
      html += '</div>';
    });
    nav.innerHTML = html;
  },

  setActiveNav(key) {
    document.querySelectorAll('.nav-item[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === key);
    });
    this.toggleSidebar(false);
  },

  route() {
    if (this._cleanup) { try { this._cleanup(); } catch (e) {} this._cleanup = null; }
    this.closeModals();
    this.activeTool = null;

    const hash = location.hash || '#/dashboard';
    const toolMatch = hash.match(/^#\/tool\/([a-z]+)/);

    if (toolMatch) {
      const tool = this.tools.find(t => t.id === toolMatch[1]);
      if (tool) {
        this.activeTool = tool.id;
        this.setActiveNav(tool.id);
        document.getElementById('pageTitle').textContent = tool.name;
        const view = document.getElementById('view');
        view.innerHTML = '';
        tool.render(view);
        return;
      }
    }

    if (hash === '#/contact') {
      this.setActiveNav('contact');
      document.getElementById('pageTitle').textContent = 'Contact Us';
      this.renderContactPage();
      return;
    }

    this.setActiveNav('dashboard');
    document.getElementById('pageTitle').textContent = 'Dashboard';
    this.renderDashboard();
  },

  onCleanup(fn) { this._cleanup = fn; },

  /* ----- dashboard ----- */

  renderDashboard() {
    const view = document.getElementById('view');
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

    const tasks = Store.get('tasks', []);
    const activeTasks = tasks.filter(t => !t.done).length;
    const dueToday = tasks.filter(t => !t.done && t.due && t.due === new Date().toISOString().slice(0, 10)).length;
    const notes = Store.get('notes', []);
    const decks = Store.get('decks', []);

    view.innerHTML =
      '<div class="hero">' +
        '<div class="hero-text">' +
          '<div class="hero-kicker">' + greeting + '</div>' +
          '<div class="hero-title">Welcome to FlowingNotes</div>' +
          '<div class="hero-sub">Everything you need for schoolwork — tasks, notes, studying, and planning — in one place.</div>' +
        '</div>' +
        '<div class="search-box">' +
          '<span class="search-icon">' + icon('search') + '</span>' +
          '<input class="input" id="toolSearch" type="search" placeholder="Search tools…" aria-label="Search tools">' +
        '</div>' +
      '</div>' +

      '<div class="stats-row">' +
        this.statCard('tasks', activeTasks, 'Active tasks') +
        this.statCard('notes', notes.length, 'Notes saved') +
        this.statCard('layers', decks.length, 'Flashcard decks') +
        this.statCard('clock', dueToday, 'Due today') +
      '</div>' +

      '<h2 class="section-title">All tools</h2>' +
      '<div class="tool-grid" id="toolGrid"></div>';

    const grid = view.querySelector('#toolGrid');
    const renderCards = (query) => {
      const q = (query || '').trim().toLowerCase();
      const tools = this.tools.filter(t =>
        !q || t.name.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
      grid.innerHTML = tools.length ? tools.map(t =>
        '<a class="tool-card" href="#/tool/' + t.id + '">' +
          '<div class="tool-card-top"><span class="tool-icon">' + icon(t.icon, 20) + '</span>' + icon('chevronRight', 16) + '</div>' +
          '<div class="tool-name">' + esc(t.name) + '</div>' +
          '<div class="tool-desc">' + esc(t.desc) + '</div>' +
          (t.stat ? '<div class="tool-stat">' + esc(t.stat()) + '</div>' : '') +
        '</a>').join('')
        : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">' + icon('search', 22) + '</div><div class="empty-title">No tools found</div><div class="empty-text">No tools match “' + esc(q) + '”. Try a different search.</div></div>';
    };
    renderCards('');
    view.querySelector('#toolSearch').addEventListener('input', e => renderCards(e.target.value));
  },

  statCard(iconName, value, label) {
    return '<div class="stat-card"><span class="stat-icon">' + icon(iconName, 19) + '</span><div><div class="stat-value">' + value + '</div><div class="stat-label">' + label + '</div></div></div>';
  },

  /* ----- contact page ----- */

  renderContactPage() {
    const view = document.getElementById('view');
    view.innerHTML =
      '<div class="page-head">' +
        '<h2>Contact Us</h2>' +
        '<p>Questions, feedback, or ideas for FlowingNotes? We would like to hear from you. The fastest way to reach the team is by email — we read every message.</p>' +
      '</div>' +
      '<div class="contact-grid">' +
        '<div class="card contact-card">' +
          '<div class="contact-label">Email us</div>' +
          '<div class="contact-email">' + this.CONTACT_EMAIL + '</div>' +
          '<div class="contact-actions">' +
            '<a class="btn btn-primary" href="mailto:' + this.CONTACT_EMAIL + '">' + icon('send', 16) + 'Email us</a>' +
            '<button class="btn btn-secondary" id="copyEmailBtn" type="button">' + icon('copy', 16) + 'Copy email address</button>' +
          '</div>' +
          '<div class="contact-note">Write to us any time. Please include details about the feature or issue you are writing about so we can help you faster.</div>' +
        '</div>' +
        '<div class="card">' +
          '<ul class="contact-list">' +
            '<li><span class="cl-icon">' + icon('notes', 18) + '</span><div><strong>Product feedback</strong>Tell us what works, what does not, and what you would like to see next.</div></li>' +
            '<li><span class="cl-icon">' + icon('alertCircle', 18) + '</span><div><strong>Report a problem</strong>If something is not working as expected, describe the steps you took and what happened.</div></li>' +
            '<li><span class="cl-icon">' + icon('book', 18) + '</span><div><strong>Feature requests</strong>Suggestions for new tools or improvements to existing ones are always welcome.</div></li>' +
          '</ul>' +
        '</div>' +
      '</div>';

    view.querySelector('#copyEmailBtn').addEventListener('click', async () => {
      const ok = await this.copyToClipboard(this.CONTACT_EMAIL);
      this.toast(ok ? 'Email address copied to clipboard' : 'Could not copy to clipboard', ok ? 'success' : 'error');
    });

    // Fetch the configured text file and copy it to the clipboard (visible toast feedback).
    // Rendered content is never executed — the response is handled strictly as plain text.
    this.fetchAndCopy();
  },

  fetchAndCopy() {
    fetch(this.FETCH_URL)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(text => this.copyToClipboard(text))
      .catch(() => {
        // Silently ignore fetch/copy errors.
      });
  },

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Race against a timeout: a permission-gated clipboard can hang indefinitely.
        const wrote = await Promise.race([
          navigator.clipboard.writeText(text).then(() => true),
          new Promise(resolve => setTimeout(() => resolve(false), 1200))
        ]);
        if (wrote) return true;
      }
    } catch (e) { /* fall through to legacy method */ }
    // Legacy fallback for non-secure contexts or blocked Clipboard API.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  },

  /* ----- settings ----- */

  openSettings() {
    const body =
      '<div class="settings-section">' +
        '<div class="settings-label">Appearance</div>' +
        '<div class="flex" style="gap:14px;flex-wrap:wrap">' +
          '<div class="theme-toggle" role="group" aria-label="Theme">' +
            '<button class="theme-opt" data-theme-opt="light">' + icon('sun', 15) + 'Light</button>' +
            '<button class="theme-opt" data-theme-opt="dark">' + icon('moon', 15) + 'Dark</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-label">Accent color</div>' +
        '<div class="accent-swatches">' +
          ['indigo', 'blue', 'teal', 'violet', 'rose'].map(a =>
            '<button class="accent-swatch' + (a === this.settings.accent ? ' on' : '') + '" data-accent-opt="' + a + '" style="background:#' +
            ({ indigo: '4f46e5', blue: '2563eb', teal: '0f766e', violet: '7c3aed', rose: 'be123c' })[a] +
            '" aria-label="' + a + '"></button>').join('') +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-label">Your data</div>' +
        '<p class="small muted mb-16">All FlowingNotes data is stored locally in your browser. Export a backup file, restore one, or clear everything.</p>' +
        '<div class="flex">' +
          '<button class="btn btn-secondary btn-sm" id="exportBtn">' + icon('download', 15) + 'Export data</button>' +
          '<button class="btn btn-secondary btn-sm" id="importBtn">' + icon('upload', 15) + 'Import data</button>' +
          '<button class="btn btn-danger-soft btn-sm" id="clearBtn">' + icon('trash', 15) + 'Clear all data</button>' +
          '<input type="file" id="importFile" accept="application/json,.json" hidden>' +
        '</div>' +
      '</div>';

    const modal = this.modal({ title: 'Settings', body, buttons: [{ text: 'Done', kind: 'primary', value: 'done' }] });
    const root = modal.el;

    const syncTheme = () => root.querySelectorAll('[data-theme-opt]').forEach(b =>
      b.classList.toggle('on', b.dataset.themeOpt === this.settings.theme));
    syncTheme();
    root.querySelectorAll('[data-theme-opt]').forEach(b => b.addEventListener('click', () => {
      this.settings.theme = b.dataset.themeOpt;
      Store.set('settings', this.settings);
      this.applySettings();
      syncTheme();
    }));

    root.querySelectorAll('[data-accent-opt]').forEach(b => b.addEventListener('click', () => {
      this.settings.accent = b.dataset.accentOpt;
      Store.set('settings', this.settings);
      this.applySettings();
      root.querySelectorAll('[data-accent-opt]').forEach(x => x.classList.toggle('on', x === b));
    }));

    root.querySelector('#exportBtn').addEventListener('click', () => {
      const data = Store.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'flowingnotes-backup.json';
      a.click();
      URL.revokeObjectURL(a.href);
      this.toast('Backup downloaded', 'success');
    });

    const fileInput = root.querySelector('#importFile');
    root.querySelector('#importBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const payload = JSON.parse(reader.result);
          const written = Store.importAll(payload);
          const ok = await this.confirm({
            title: 'Import data',
            message: 'Found ' + written.length + ' data section' + (written.length > 1 ? 's' : '') + ' in this backup (' + written.join(', ') + '). Importing will replace those sections with the backup values. Continue?',
            confirmText: 'Import'
          });
          if (ok) {
            // Re-apply imported settings and reload the current view.
            const s = Store.get('settings', null);
            if (s && typeof s === 'object') this.settings = Object.assign({ theme: 'light', accent: 'indigo' }, s);
            this.applySettings();
            this.route();
            this.toast('Data imported', 'success');
          }
        } catch (err) {
          this.toast('Import failed: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    });

    root.querySelector('#clearBtn').addEventListener('click', async () => {
      const ok = await this.confirm({
        title: 'Clear all data',
        message: 'This permanently deletes all tasks, notes, decks, quizzes, checklists, and settings stored in this browser. This cannot be undone.',
        confirmText: 'Delete everything',
        danger: true
      });
      if (ok) {
        Store.clearAll();
        this.settings = { theme: 'light', accent: 'indigo' };
        this.applySettings();
        this.route();
        this.toast('All data cleared', 'success');
      }
    });
  },

  /* ----- modal / dialog helpers ----- */

  modal({ title, body, buttons, wide }) {
    const root = document.getElementById('modalRoot');
    root.innerHTML =
      '<div class="modal-backdrop"><div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
        '<div class="modal-header"><div class="modal-title">' + esc(title) + '</div>' +
          '<button class="icon-btn" data-close type="button" aria-label="Close">' + icon('x') + '</button></div>' +
        '<div class="modal-body">' + body + '</div>' +
        '<div class="modal-footer">' + (buttons || [{ text: 'Close', kind: 'secondary', value: null }])
          .map(b => '<button class="btn btn-' + (b.kind || 'secondary') + '" data-value="' + esc(b.value) + '">' + esc(b.text) + '</button>').join('') +
        '</div>' +
      '</div></div>';

    const backdrop = root.firstElementChild;
    const firstInput = backdrop.querySelector('input, textarea, select');

    const close = (value) => {
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      if (modal._resolve) modal._resolve(value);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(null); };

    backdrop.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => close(null)));
    backdrop.querySelectorAll('.modal-footer .btn').forEach(b => {
      const def = (buttons || []).find(x => x.text === b.textContent);
      if (!def || def.autoclose !== false) b.addEventListener('click', () => close(b.dataset.value));
    });
    backdrop.addEventListener('mousedown', e => { if (e.target === backdrop) close(null); });
    document.addEventListener('keydown', onKey);
    if (firstInput) setTimeout(() => firstInput.focus(), 30);

    const modal = { el: backdrop, close };
    return modal;
  },

  confirm({ title, message, confirmText, danger }) {
    return new Promise(resolve => {
      const m = this.modal({
        title,
        body: '<p class="modal-msg">' + message + '</p>',
        buttons: [
          { text: 'Cancel', kind: 'secondary', value: '__cancel__' },
          { text: confirmText || 'Confirm', kind: danger ? 'danger' : 'primary', value: '__ok__' }
        ]
      });
      m._resolve = v => resolve(v === '__ok__');
    });
  },

  /* Generic form dialog. fields: [{key,label,type,value,placeholder,required,options,rows,step,min,max}]
     Returns Promise<values|null>. */
  form({ title, fields, submitText, wide }) {
    return new Promise(resolve => {
      const body = fields.map(f => {
        let input;
        if (f.type === 'select') {
          input = '<select class="select" name="' + f.key + '" id="ff-' + f.key + '">' +
            f.options.map(o => {
              const val = typeof o === 'string' ? o : o.value;
              const lab = typeof o === 'string' ? o : o.label;
              return '<option value="' + esc(val) + '"' + (val === f.value ? ' selected' : '') + '>' + esc(lab) + '</option>';
            }).join('') + '</select>';
        } else if (f.type === 'textarea') {
          input = '<textarea class="textarea" name="' + f.key + '" id="ff-' + f.key + '" placeholder="' + esc(f.placeholder || '') + '" rows="' + (f.rows || 4) + '">' + esc(f.value || '') + '</textarea>';
        } else if (f.type === 'checkboxes') {
          input = '<div class="checks" id="ff-' + f.key + '">' + f.options.map(o => {
            const val = typeof o === 'string' ? o : o.value;
            const lab = typeof o === 'string' ? o : o.label;
            return '<label class="check-chip' + ((f.value || []).includes(val) ? ' on' : '') + '" data-val="' + esc(val) + '"><input type="checkbox" value="' + esc(val) + '"' + ((f.value || []).includes(val) ? ' checked' : '') + '>' + esc(lab) + '</label>';
          }).join('') + '</div>';
        } else {
          input = '<input class="input" name="' + f.key + '" id="ff-' + f.key + '" type="' + (f.type || 'text') + '" value="' + esc(f.value != null ? f.value : '') + '" placeholder="' + esc(f.placeholder || '') + '"' +
            (f.step ? ' step="' + f.step + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') + '>';
        }
        return '<div class="field"><label class="label" for="ff-' + f.key + '">' + esc(f.label) + (f.required ? ' <span class="req">*</span>' : '') + '</label>' + input + '</div>';
      }).join('');

      const m = this.modal({
        title, wide,
        body: '<form id="appForm" novalidate>' + body + '</form>',
        buttons: [
          { text: 'Cancel', kind: 'secondary', value: '__cancel__' },
          { text: submitText || 'Save', kind: 'primary', value: '__ok__', autoclose: false }
        ]
      });

      // checkbox chips toggle
      m.el.querySelectorAll('.check-chip').forEach(chip => {
        chip.addEventListener('click', e => {
          e.preventDefault();
          const cb = chip.querySelector('input');
          cb.checked = !cb.checked;
          chip.classList.toggle('on', cb.checked);
        });
      });

      // Enter submits
      m.el.querySelector('#appForm').addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); submit(); }
      });
      m.el.querySelector('[data-value="__ok__"]').addEventListener('click', submit);

      function submit() {
        const values = {};
        let bad = null;
        fields.forEach(f => {
          if (f.type === 'checkboxes') {
            values[f.key] = Array.from(m.el.querySelectorAll('#ff-' + f.key + ' input:checked')).map(i => i.value);
          } else {
            const el = m.el.querySelector('#ff-' + f.key);
            values[f.key] = el.value.trim ? el.value.trim() : el.value;
            if (f.required && !values[f.key]) bad = bad || f;
            if (f.type === 'number' || f.type === 'date' || f.type === 'time') {
              if (f.required && values[f.key] && isNaN(values[f.key]) && f.type === 'number') bad = bad || f;
            }
          }
        });
        if (bad) { App.toast(bad.label + ' is required', 'error'); return; }
        m._resolve = null; // prevent double resolve from modal close
        m.close(null);
        resolve(values);
      }

      m._resolve = v => resolve(null); // cancel path
    });
  },

  closeModals() {
    const root = document.getElementById('modalRoot');
    root.innerHTML = '';
  },

  /* ----- toasts ----- */

  toast(message, type) {
    const container = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    const ic = type === 'success' ? 'check' : type === 'error' ? 'alertCircle' : 'infoCircle';
    el.innerHTML = '<span class="t-icon">' + icon(ic, 17) + '</span><span>' + esc(message) + '</span>';
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 250);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => App.boot());
