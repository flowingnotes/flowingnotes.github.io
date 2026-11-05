/* FlowingNotes — localStorage wrapper.
   Every tool stores data under its own namespaced key ("fn.<id>") so
   tools can never overwrite each other's data. */

'use strict';

const Store = {
  NS: 'fn.',
  VALID_KEYS: [
    'settings', 'tasks', 'notes', 'calcHistory', 'typingBest',
    'decks', 'pomodoro', 'grades', 'quizzes', 'classes',
    'citations', 'checklists'
  ],

  get(key, fallback) {
    try {
      const raw = localStorage.getItem(this.NS + key);
      if (raw === null) return fallback;
      const val = JSON.parse(raw);
      return val === null || val === undefined ? fallback : val;
    } catch (e) {
      return fallback; // corrupted entry -> fall back gracefully
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.NS + key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (window.App) App.toast('Could not save — storage is full or unavailable', 'error');
      return false;
    }
  },

  remove(key) {
    try { localStorage.removeItem(this.NS + key); } catch (e) { /* ignore */ }
  },

  keys() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.NS)) out.push(k.slice(this.NS.length));
      }
    } catch (e) { /* ignore */ }
    return out;
  },

  exportAll() {
    const data = {};
    this.keys().forEach(k => {
      try {
        const raw = localStorage.getItem(this.NS + k);
        if (raw !== null) data[k] = JSON.parse(raw);
      } catch (e) { /* skip corrupted */ }
    });
    return { app: 'FlowingNotes', version: 1, exported: new Date().toISOString(), data };
  },

  /* Validate + merge imported data. Only known keys are accepted.
     Returns number of keys written, or throws on invalid input. */
  importAll(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('File does not contain a valid FlowingNotes export.');
    if (!payload.data || typeof payload.data !== 'object') throw new Error('Export file is missing its data section.');
    const written = [];
    for (const key of Object.keys(payload.data)) {
      if (!this.VALID_KEYS.includes(key)) continue; // silently ignore unknown keys
      try {
        localStorage.setItem(this.NS + key, JSON.stringify(payload.data[key]));
        written.push(key);
      } catch (e) { /* skip unwritable keys */ }
    }
    if (written.length === 0) throw new Error('No FlowingNotes data found in this file.');
    return written;
  },

  clearAll() {
    this.keys().forEach(k => this.remove(k));
  }
};
