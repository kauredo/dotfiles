// Copy room editor. Injected by room.mjs after window.__ROOM. Turns every [data-copy] span into
// editable text, keeps attribute strings ([data-copy-attr]) and hidden strings editable in a side
// panel and an "All text" list, and saves to the artifact db: edits/<key> = {key, values:{lang:text}, note, by, at}.
(() => {
  const R = window.__ROOM;
  const LANGS = R.langs;
  const legal = R.legal ? new RegExp(R.legal) : null;
  const docId = (k) => k.replace(/[^A-Za-z0-9_-]/g, '_');
  const orig = (k, l) => (R.copy[k] || {})[l] ?? '';
  const isRich = (k) => LANGS.some((l) => /<[a-z]/i.test(orig(k, l)));
  const edits = new Map();          // key -> {values, note, by, at}
  const timers = new Map();
  let lang = R.primary, db = null, user = null, me = null, canWrite = false, selected = null, onlyChanged = false, query = '';

  for (const [k, v] of Object.entries(R.htmlAttrs || {})) if (k !== 'lang') document.documentElement.setAttribute(k, v);
  for (const [k, v] of Object.entries(R.bodyAttrs || {})) if (k === 'class') document.body.classList.add(...v.split(/\s+/).filter(Boolean)); else document.body.setAttribute(k, v);

  const el = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  };
  const value = (k, l = lang) => { const ed = edits.get(k); return ed && typeof ed.values?.[l] === 'string' ? ed.values[l] : orig(k, l); };
  const changed = (k) => { const ed = edits.get(k); return !!ed && (LANGS.some((l) => value(k, l) !== orig(k, l)) || !!ed.note); };
  const label = (k) => { const [g, ...rest] = k.split('.'); return `${R.groups[g] || g} · ${rest.join(' · ') || g}`; };

  // markup from the db is untrusted: keep only the tags and attributes the original string uses
  function sanitize(k, html) {
    const allowed = new Set();
    for (const l of LANGS) for (const m of orig(k, l).matchAll(/<([a-z][a-z0-9-]*)/gi)) allowed.add(m[1].toLowerCase());
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const walk = (node) => {
      for (const c of [...node.childNodes]) {
        if (c.nodeType === 1) {
          const t = c.tagName.toLowerCase();
          if (!allowed.has(t)) { c.replaceWith(document.createTextNode(c.textContent)); continue; }
          for (const a of [...c.attributes]) if (/^on/i.test(a.name) || /javascript:/i.test(a.value) || /^(src|href|srcdoc|style)$/i.test(a.name)) c.removeAttribute(a.name);
          walk(c);
        } else if (c.nodeType !== 3) c.remove();
      }
    };
    walk(tpl.content);
    return tpl.innerHTML;
  }

  // paint the page in the current language
  function paintKey(k) {
    for (const n of document.querySelectorAll(`[data-copy="${CSS.escape(k)}"]`)) {
      if (n === document.activeElement) continue;
      if (n.__orig === undefined) n.__orig = n.innerHTML;   // the page's own render of the primary language
      const v = value(k);
      if (lang === R.primary && v === orig(k, lang)) n.innerHTML = n.__orig;
      else if (n.hasAttribute('data-copy-html')) n.innerHTML = sanitize(k, v);
      else n.textContent = v;
      n.classList.toggle('room-changed', changed(k));
    }
    for (const n of document.querySelectorAll('[data-copy-attr]')) {
      for (const pair of n.getAttribute('data-copy-attr').split(';')) {
        const [attr, key] = pair.split('=');
        if (key === k) n.setAttribute(attr, value(k));
      }
    }
  }
  function paintAll() {
    document.documentElement.lang = R.htmlLang?.[lang] || lang;
    for (const k of Object.keys(R.copy)) paintKey(k);
    renderBar(); if (selected) renderPanel(); if (!list.hidden) renderList();
  }

  // ---- toolbar
  const bar = el('div', { class: 'room-ui room-bar', role: 'toolbar', 'aria-label': 'Copy room' });
  const panel = el('aside', { class: 'room-ui room-panel', hidden: true, 'aria-label': 'Edit text' });
  const list = el('div', { class: 'room-ui room-list', hidden: true, role: 'dialog', 'aria-label': 'All text' });
  const toast = el('div', { class: 'room-ui room-toast', role: 'status', 'aria-live': 'polite' });
  document.body.append(bar, panel, list, toast);
  document.body.classList.add('room-on');
  const say = (msg) => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 1500); };

  function renderBar() {
    const n = Object.keys(R.copy).filter(changed).length;
    bar.replaceChildren(
      el('strong', { class: 'room-title', text: R.title }),
      el('div', { class: 'room-seg', role: 'group', 'aria-label': 'Language' }, LANGS.map((l) =>
        el('button', { type: 'button', 'aria-pressed': String(l === lang), onclick: () => { lang = l; paintAll(); }, text: R.langNames[l] || l.toUpperCase() }))),
      el('button', { type: 'button', class: 'room-btn', onclick: () => { list.hidden = !list.hidden; if (!list.hidden) renderList(); }, text: `All text (${Object.keys(R.copy).length})` }),
      R.rules.length ? el('details', { class: 'room-rules' }, el('summary', { text: 'Rules' }), el('ul', {}, R.rules.map((r) => el('li', { text: r })))) : null,
      el('span', { class: 'room-status', text: `${n} changed · ${db ? (canWrite ? 'saving as you type' : 'read only') : 'connecting…'}` }));
  }

  // ---- editing on the page
  document.addEventListener('click', (ev) => {
    if (ev.target.closest('.room-ui')) return;
    const a = ev.target.closest('a');
    if (a && !(a.getAttribute('href') || '').startsWith('#')) ev.preventDefault();
    const span = ev.target.closest('[data-copy]');
    if (span) { ev.preventDefault(); return select(span.dataset.copy, span); }
    const host = ev.target.closest('[data-copy-attr]');
    if (host) { ev.preventDefault(); return select(host.getAttribute('data-copy-attr').split(';')[0].split('=')[1], null); }
  }, true);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { if (!list.hidden) list.hidden = true; else close(); }
    const span = ev.target.closest?.('[data-copy]');
    if (span && ev.key === 'Enter') { ev.preventDefault(); span.blur(); }
  });

  function select(k, span) {
    selected = k;
    document.querySelectorAll('.room-selected').forEach((n) => n.classList.remove('room-selected'));
    document.querySelectorAll(`[data-copy="${CSS.escape(k)}"]`).forEach((n) => n.classList.add('room-selected'));
    if (span && canWrite) {
      const rich = span.hasAttribute('data-copy-html');
      if (rich) {
        // words stay editable, the formatting (underline svg, <small>, icons) is locked
        span.contentEditable = 'true';
        span.querySelectorAll('svg, img, br').forEach((n) => n.setAttribute('contenteditable', 'false'));
      } else {
        try { span.contentEditable = 'plaintext-only'; } catch { span.contentEditable = 'true'; }
        if (span.contentEditable !== 'plaintext-only') span.contentEditable = 'true';
      }
      span.focus();
      span.oninput = () => { setValue(k, lang, rich ? cleanHTML(span) : span.textContent); renderPanel(true); };
      span.onblur = () => { span.contentEditable = 'false'; paintKey(k); };
    }
    renderPanel();
  }
  function cleanHTML(span) {
    const c = span.cloneNode(true);
    c.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
    return sanitize(span.dataset.copy, c.innerHTML.replace(/&nbsp;/g, ' '));
  }
  function close() { selected = null; panel.hidden = true; document.querySelectorAll('.room-selected').forEach((n) => n.classList.remove('room-selected')); }

  function editorFor(k, compact) {
    const wrap = el('div', { class: 'room-entry' + (changed(k) ? ' is-changed' : '') });
    const onPage = document.querySelector(`[data-copy="${CSS.escape(k)}"]`);
    const inAttr = !onPage && [...document.querySelectorAll('[data-copy-attr]')].some((n) => n.getAttribute('data-copy-attr').split(';').some((p) => p.endsWith('=' + k)));
    wrap.append(el('div', { class: 'room-head' },
      el('span', { class: 'room-name', text: label(k) }), el('code', { text: k }),
      legal && legal.test(k) ? el('span', { class: 'room-chip legal', text: 'Required' }) : null,
      changed(k) ? el('span', { class: 'room-chip edited', text: 'Edited' }) : null,
      !onPage ? el('span', { class: 'room-chip', text: inAttr ? 'Image or link text' : 'Not visible on the page' }) : null,
      compact && onPage ? el('button', { type: 'button', class: 'room-link', onclick: () => { list.hidden = true; onPage.scrollIntoView({ block: 'center', behavior: 'smooth' }); select(k, onPage); }, text: 'Show on page' }) : null));
    const rich = isRich(k);
    const words = (s) => { const t = document.createElement('template'); t.innerHTML = s; return t.content.textContent; };
    if (rich) wrap.append(el('p', { class: 'room-hint', text: onPage ? 'This text has formatting. Click it on the page and type over the words; the formatting stays. Switch language at the top to edit the other one.' : 'This text has formatting tags. Keep them as they are; change only the words between them.' }));
    for (const l of LANGS) {
      const id = `room-${compact ? 'l' : 'p'}-${docId(k)}-${l}`;
      const ta = el('textarea', { id, rows: '2', disabled: !canWrite });
      ta.value = value(k, l);
      ta.addEventListener('input', () => { setValue(k, l, ta.value); if (l === lang) paintKey(k); });
      const name = R.langNames[l] || l.toUpperCase();
      const was = value(k, l) !== orig(k, l) ? el('p', { class: 'room-was' }, 'Was: ', el('s', { text: rich ? words(orig(k, l)) : orig(k, l) })) : null;
      if (rich && onPage) {
        wrap.append(...[el('p', { class: 'room-lang', text: name }), el('p', { class: 'room-words', text: words(value(k, l)) }), was,
          el('details', { class: 'room-raw' }, el('summary', { text: 'Edit with the formatting tags (advanced)' }), ta)].filter(Boolean));
      } else {
        wrap.append(...[el('label', { for: id, class: 'room-lang', text: name }), ta, was].filter(Boolean));
      }
    }
    const note = el('textarea', { id: `room-note-${compact ? 'l' : 'p'}-${docId(k)}`, rows: '1', placeholder: 'Note for Claude (optional)', 'aria-label': 'Note for Claude', disabled: !canWrite });
    note.value = edits.get(k)?.note || '';
    note.addEventListener('input', () => setNote(k, note.value));
    wrap.append(note);
    if (changed(k) && canWrite) wrap.append(el('button', { type: 'button', class: 'room-link', onclick: () => undo(k), text: 'Undo my changes to this text' }));
    if (edits.get(k)?.by) whoInto(wrap, edits.get(k));
    return wrap;
  }
  function renderPanel(typing) {
    if (!selected) return;
    if (typing && panel.contains(document.activeElement)) return;
    const focusId = panel.contains(document.activeElement) ? document.activeElement.id : null;
    panel.hidden = false;
    panel.replaceChildren(el('button', { type: 'button', class: 'room-close', 'aria-label': 'Close', onclick: close, text: '×' }), editorFor(selected, false));
    if (focusId) document.getElementById(focusId)?.focus();
  }
  function renderList() {
    const focusId = list.contains(document.activeElement) ? document.activeElement.id : null;
    const groups = {};
    for (const k of Object.keys(R.copy)) {
      if (onlyChanged && !changed(k)) continue;
      if (query && !(k + ' ' + LANGS.map((l) => value(k, l)).join(' ')).toLowerCase().includes(query)) continue;
      (groups[k.split('.')[0]] ??= []).push(k);
    }
    const search = el('input', { id: 'room-search', type: 'search', placeholder: 'Find text', value: query, 'aria-label': 'Find text' });
    search.addEventListener('input', () => { query = search.value.toLowerCase(); renderList(); });
    const only = el('label', { class: 'room-only' }, el('input', { type: 'checkbox', id: 'room-only', checked: onlyChanged, onchange: (e) => { onlyChanged = e.target.checked; renderList(); } }), ' Only changed');
    list.replaceChildren(
      el('div', { class: 'room-list-head' }, el('strong', { text: 'All text' }), search, only, el('button', { type: 'button', class: 'room-close', 'aria-label': 'Close', onclick: () => { list.hidden = true; }, text: '×' })),
      el('div', { class: 'room-list-body' }, Object.entries(groups).map(([g, keys]) => el('section', {}, el('h3', { text: R.groups[g] || g }), keys.map((k) => editorFor(k, true))))));
    if (focusId) { const f = document.getElementById(focusId); if (f) { f.focus(); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } }
  }
  async function whoInto(wrap, ed) {
    if (!user) return;
    try { const ps = await user.profiles([ed.by]); wrap.append(el('p', { class: 'room-who', text: `Last changed by ${(ps[ed.by] && ps[ed.by].name) || 'someone'}` })); } catch {}
  }

  // ---- saving
  function setValue(k, l, v) {
    const ed = edits.get(k) || { key: k, values: {}, note: '' };
    ed.values = { ...ed.values, [l]: v };
    edits.set(k, ed); queue(k); renderBar();
  }
  function setNote(k, v) { const ed = edits.get(k) || { key: k, values: {}, note: '' }; ed.note = v; edits.set(k, ed); queue(k); }
  function undo(k) { edits.set(k, { key: k, values: {}, note: '' }); paintKey(k); queue(k); renderPanel(); if (!list.hidden) renderList(); renderBar(); }
  function queue(k) { clearTimeout(timers.get(k)); timers.set(k, setTimeout(() => save(k), 700)); }
  async function save(k) {
    timers.delete(k);
    if (!db || !canWrite) return;
    const ed = edits.get(k) || { values: {}, note: '' };
    const values = Object.fromEntries(LANGS.filter((l) => typeof ed.values?.[l] === 'string' && ed.values[l] !== orig(k, l)).map((l) => [l, ed.values[l]]));
    const ref = db.doc(`edits/${docId(k)}`);
    try {
      if (!Object.keys(values).length && !ed.note) await ref.delete();
      else await ref.set({ key: k, values, note: ed.note || '', by: me, at: Date.now() });
      say('Saved');
    } catch (e) { say("Couldn't save: " + (e?.code || 'error')); }
  }

  // ---- connect
  paintAll();
  (async () => {
    db = await window.claude?.use?.('db');
    user = await window.claude?.use?.('user');
    if (user) { try { const m = await user.me(); me = m?.id || null; } catch {} }
    canWrite = !!db;
    renderBar();
    if (!db) { say('Read only: saving is not available here'); return; }
    db.collection('edits').onSnapshot((snap) => {
      const seen = new Set();
      for (const d of snap.docs) {
        const v = d.data();
        if (!v || typeof v.key !== 'string' || !R.copy[v.key] || typeof v.values !== 'object' || !v.values) continue;
        const values = Object.fromEntries(Object.entries(v.values).filter(([l, t]) => LANGS.includes(l) && typeof t === 'string'));
        seen.add(v.key);
        if (timers.has(v.key)) continue;           // our own unsaved typing wins until it saves
        edits.set(v.key, { key: v.key, values, note: typeof v.note === 'string' ? v.note : '', by: v.by, at: v.at });
        paintKey(v.key);
      }
      for (const k of [...edits.keys()]) if (!seen.has(k) && !timers.has(k)) { edits.delete(k); paintKey(k); }
      renderBar();
      if (selected && !panel.contains(document.activeElement)) renderPanel();
      if (!list.hidden && !list.contains(document.activeElement)) renderList();
    }, () => say('Lost the connection to the shared edits'));
  })();
})();
