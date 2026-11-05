/* Flashcards — decks, study mode, progress tracking */

'use strict';

App.registerTool({
  id: 'flashcards',
  name: 'Flashcards',
  icon: 'layers',
  category: 'Study',
  desc: 'Build decks, flip and shuffle cards, and track what you know.',

  stat() {
    const d = Store.get('decks', []);
    return d.length ? d.length + (d.length === 1 ? ' deck' : ' decks') : 'No decks yet';
  },

  render(view) {
    let openDeckId = null;
    let study = null; // {idx, order, flipped, seenCount}

    view.innerHTML = '<div id="fcRoot"></div>';
    const root = view.querySelector('#fcRoot');

    const load = () => Store.get('decks', []);
    const save = (d) => Store.set('decks', d);

    function renderDecks() {
      const decks = load();
      root.innerHTML =
        '<div class="toolbar"><button class="btn btn-primary" id="newDeck">' + icon('plus', 16) + 'New deck</button></div>' +
        (decks.length ?
          '<div class="deck-grid">' + decks.map(d => {
            const known = d.cards.filter(c => c.known).length;
            return '<button class="card deck-card" data-open="' + d.id + '" type="button">' +
              '<div class="tool-card-top"><span class="tool-icon">' + icon('layers', 19) + '</span>' + icon('chevronRight', 16) + '</div>' +
              '<div class="deck-name">' + esc(d.name) + '</div>' +
              '<div class="deck-sub">' + d.cards.length + (d.cards.length === 1 ? ' card' : ' cards') + ' · ' + known + ' known</div>' +
              '<div class="progress"><div class="progress-bar" style="width:' + (d.cards.length ? Math.round(known / d.cards.length * 100) : 0) + '%"></div></div>' +
            '</button>';
          }).join('') + '</div>'
          :
          '<div class="card"><div class="empty"><div class="empty-icon">' + icon('layers', 22) + '</div><div class="empty-title">No decks yet</div><div class="empty-text">Create a deck of flashcards for any subject, then study it with flip, shuffle, and progress tracking.</div><button class="btn btn-primary btn-sm mt-8" id="emptyNewDeck">' + icon('plus', 15) + 'New deck</button></div></div>');

      const wire = (id) => root.querySelector('#' + id).addEventListener('click', () => createDeck());
      if (root.querySelector('#newDeck')) wire('newDeck');
      if (root.querySelector('#emptyNewDeck')) wire('emptyNewDeck');
      root.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => {
        openDeckId = el.dataset.open;
        renderDeck();
      }));
    }

    async function createDeck() {
      const v = await App.form({
        title: 'New deck',
        fields: [{ key: 'name', label: 'Deck name', required: true, placeholder: 'e.g. Biology — Chapter 4' }],
        submitText: 'Create deck'
      });
      if (!v) return;
      const decks = load();
      decks.push({ id: uid(), name: v.name, cards: [], created: Date.now() });
      save(decks);
      openDeckId = decks[decks.length - 1].id;
      renderDeck();
      App.toast('Deck created', 'success');
    }

    function renderDeck() {
      const deck = load().find(d => d.id === openDeckId);
      if (!deck) { renderDecks(); return; }

      root.innerHTML =
        '<div class="toolbar">' +
          '<button class="btn btn-ghost" id="backBtn">' + icon('arrowLeft', 16) + 'All decks</button>' +
          '<span class="card-title" style="font-size:16px">' + esc(deck.name) + '</span>' +
          '<span class="spacer"></span>' +
          (deck.cards.length ? '<button class="btn btn-primary" id="studyBtn">' + icon('play', 15) + 'Study deck</button>' : '') +
          '<button class="btn btn-secondary" id="renameDeck">Rename</button>' +
          '<button class="btn btn-danger-soft" id="deleteDeck">' + icon('trash', 15) + 'Delete</button>' +
        '</div>' +
        '<div class="card" id="cardsCard"></div>';

      root.querySelector('#backBtn').addEventListener('click', () => { openDeckId = null; renderDecks(); });
      root.querySelector('#renameDeck').addEventListener('click', async () => {
        const v = await App.form({ title: 'Rename deck', fields: [{ key: 'name', label: 'Deck name', required: true, value: deck.name }], submitText: 'Rename' });
        if (!v) return;
        const decks = load(); const d = decks.find(x => x.id === deck.id);
        if (d) { d.name = v.name; save(decks); renderDeck(); }
      });
      root.querySelector('#deleteDeck').addEventListener('click', async () => {
        const ok = await App.confirm({ title: 'Delete deck', message: 'Delete “' + deck.name + '” and all ' + deck.cards.length + ' of its cards? This cannot be undone.', confirmText: 'Delete', danger: true });
        if (!ok) return;
        save(load().filter(d => d.id !== deck.id));
        openDeckId = null; renderDecks();
        App.toast('Deck deleted', 'success');
      });
      const sb = root.querySelector('#studyBtn');
      if (sb) sb.addEventListener('click', () => startStudy(deck));

      const cardsEl = root.querySelector('#cardsCard');
      if (!deck.cards.length) {
        cardsEl.innerHTML = '<div class="empty"><div class="empty-icon">' + icon('plus', 22) + '</div><div class="empty-title">No cards in this deck</div><div class="empty-text">Add your first question-and-answer card below.</div></div>';
      } else {
        cardsEl.innerHTML = deck.cards.map(c =>
          '<div class="list-item">' +
            '<input type="checkbox" class="check" data-known="' + c.id + '" ' + (c.known ? 'checked' : '') + ' aria-label="Mark known">' +
            '<div class="list-body"><div class="list-title">' + esc(c.front) + '</div><div class="list-meta muted">' + esc(c.back) + '</div></div>' +
            '<div class="list-actions">' +
              '<button class="icon-btn" data-edit="' + c.id + '" aria-label="Edit card">' + icon('pencil', 16) + '</button>' +
              '<button class="icon-btn icon-btn-danger" data-del="' + c.id + '" aria-label="Delete card">' + icon('trash', 16) + '</button>' +
            '</div>' +
          '</div>').join('');
      }
      cardsEl.insertAdjacentHTML('beforeend',
        '<div class="add-row"><input class="input" id="newFront" placeholder="New card question (front)"><input class="input" id="newBack" placeholder="Answer (back)"><button class="btn btn-primary" id="addCard">Add</button></div>');

      cardsEl.addEventListener('click', async (e) => {
        const known = e.target.closest('[data-known]');
        if (known) {
          const decks = load(); const d = decks.find(x => x.id === deck.id);
          const c = d.cards.find(c => c.id === known.dataset.known);
          c.known = known.checked;
          save(decks);
          return;
        }
        const edit = e.target.closest('[data-edit]');
        if (edit) {
          const decks = load(); const d = decks.find(x => x.id === deck.id);
          const c = d.cards.find(c => c.id === edit.dataset.edit);
          const v = await App.form({
            title: 'Edit card',
            fields: [
              { key: 'front', label: 'Question (front)', required: true, value: c.front },
              { key: 'back', label: 'Answer (back)', required: true, value: c.back }
            ]
          });
          if (v) { c.front = v.front; c.back = v.back; save(decks); renderDeck(); App.toast('Card updated', 'success'); }
          return;
        }
        const del = e.target.closest('[data-del]');
        if (del) {
          const ok = await App.confirm({ title: 'Delete card', message: 'Delete this card?', confirmText: 'Delete', danger: true });
          if (!ok) return;
          const decks = load(); const d = decks.find(x => x.id === deck.id);
          d.cards = d.cards.filter(c => c.id !== del.dataset.del);
          save(decks); renderDeck();
          App.toast('Card deleted', 'success');
        }
      });

      root.querySelector('#addCard').addEventListener('click', () => {
        const f = root.querySelector('#newFront'), b = root.querySelector('#newBack');
        if (!f.value.trim() || !b.value.trim()) { App.toast('Enter both a question and an answer', 'error'); return; }
        const decks = load(); const d = decks.find(x => x.id === deck.id);
        d.cards.push({ id: uid(), front: f.value.trim(), back: b.value.trim(), known: false });
        save(decks);
        renderDeck();
        App.toast('Card added', 'success');
      });
    }

    function startStudy(deck) {
      study = { idx: 0, order: deck.cards.map(c => c.id), flipped: false, seen: new Set() };
      renderStudy();
    }

    function renderStudy() {
      const decks = load();
      const deck = decks.find(d => d.id === openDeckId);
      if (!deck || !study) { renderDecks(); return; }
      const cards = study.order.map(id => deck.cards.find(c => c.id === id)).filter(Boolean);
      if (!cards.length) { renderDeck(); return; }
      const card = cards[Math.min(study.idx, cards.length - 1)];
      const knownCount = deck.cards.filter(c => c.known).length;

      root.innerHTML =
        '<div class="toolbar">' +
          '<button class="btn btn-ghost" id="exitStudy">' + icon('arrowLeft', 16) + 'Exit study</button>' +
          '<span class="spacer"></span>' +
          '<span class="badge badge-accent">' + knownCount + ' of ' + deck.cards.length + ' known</span>' +
          '<span class="badge">' + study.seen.size + ' studied this session</span>' +
        '</div>' +
        '<div class="flashcard" id="flashcard" role="button" tabindex="0" aria-label="Flashcard, click to flip">' +
          '<span class="fc-label">' + (study.flipped ? 'Answer' : 'Question') + '</span>' +
          '<span class="fc-text">' + esc(study.flipped ? card.back : card.front) + '</span>' +
          '<span class="fc-hint">Click card or press Space to flip</span>' +
        '</div>' +
        '<div class="study-nav">' +
          '<button class="btn btn-secondary" id="prevCard">' + icon('chevronLeft', 15) + 'Prev</button>' +
          '<span class="study-count">' + (study.idx + 1) + ' / ' + cards.length + '</span>' +
          '<button class="btn btn-secondary" id="nextCard">Next' + icon('chevronRight', 15) + '</button>' +
          '<button class="btn btn-secondary" id="shuffleDeck">' + icon('shuffle', 15) + 'Shuffle</button>' +
          '<span style="width:1px;height:24px;background:var(--border)"></span>' +
          '<button class="btn btn-danger-soft" id="markPractice">Needs practice</button>' +
          '<button class="btn btn-secondary" id="markKnown" style="color:var(--success)">' + icon('check', 15) + 'Got it</button>' +
        '</div>';

      const cardEl = root.querySelector('#flashcard');
      cardEl.addEventListener('click', () => { study.flipped = !study.flipped; renderStudy(); });

      root.querySelector('#prevCard').addEventListener('click', () => { study.idx = (study.idx - 1 + cards.length) % cards.length; study.flipped = false; renderStudy(); });
      root.querySelector('#nextCard').addEventListener('click', () => { study.idx = (study.idx + 1) % cards.length; study.flipped = false; renderStudy(); });
      root.querySelector('#shuffleDeck').addEventListener('click', () => {
        for (let i = study.order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [study.order[i], study.order[j]] = [study.order[j], study.order[i]];
        }
        study.idx = 0; study.flipped = false;
        renderStudy();
        App.toast('Deck shuffled', 'success');
      });

      const mark = (known) => {
        const decks = load();
        const d = decks.find(x => x.id === openDeckId);
        const c = d.cards.find(c => c.id === card.id);
        c.known = known;
        save(decks);
        study.seen.add(card.id);
        study.idx = (study.idx + 1) % cards.length;
        study.flipped = false;
        renderStudy();
      };
      root.querySelector('#markPractice').addEventListener('click', () => mark(false));
      root.querySelector('#markKnown').addEventListener('click', () => mark(true));
      root.querySelector('#exitStudy').addEventListener('click', () => { study = null; renderDeck(); });
    }

    renderDecks();
  }
});
