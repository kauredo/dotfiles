// The T checks: visual habits that mark a page as model-made, read straight from
// source (markup, CSS, Tailwind config, locale files). lint.mjs merges them into
// sloplint's report. T1 glued arrow / stock second action, T2 cream + clay,
// T3 fragment headlines, T4 one highlighted pricing tier, T5 star runs and
// "trusted by N+", T6 stock indigo and lavender washes.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', '.next', '.astro', '.svelte-kit', 'coverage', 'vendor', '__tests__']);
const MAX_BYTES = 1.5 * 1024 * 1024;
const MARKUP = new Set(['.html', '.jsx', '.tsx', '.vue', '.svelte', '.astro']);
const LOCALE_DIR = /[\\/](locales?|i18n|lang|messages|translations)[\\/]/;
const LANG = /^[a-z]{2}(?:[-_][A-Za-z]{2,4})?$/;
const TW_CONFIG = /^tailwind\.config\.(js|cjs|mjs|ts)$/;

const FIX = {
  arrow: 'End the label on its verb; the control already says it goes somewhere',
  second: 'Give the hero one primary button; a second action is a text link that names what it opens',
  clay: 'Pick the accent from the product\'s own world, off the clay hues, or set the page on a background other than cream. When the brand chose these values, keep them, change how much surface each covers, and waive T2 with that reason',
  fragment: 'Write the headline as one plain sentence that says what the product does',
  tier: 'Name the recommended tier in a word on the card and give it the primary button; keep every card the same fill',
  proof: 'Show proof a visitor can check: a named customer, a quote with a name, or a real count with its date',
  indigo: 'Choose the primary from the brand\'s own colours, away from the stock indigo-violet band',
  lavender: 'Let the hero sit on the page background, or on a tint of the brand colour',
};

// ---------- files ----------
export function collectFiles(paths) {
  const files = new Set();
  const seen = new Set();
  const visit = (p, top) => {
    let st, real;
    try { st = statSync(p); real = realpathSync(p); } catch { return; }
    if (seen.has(real)) return;
    seen.add(real);
    const base = basename(p);
    if (st.isDirectory()) {
      if (!top && (SKIP_DIRS.has(base) || base.startsWith('.'))) return;
      let entries;
      try { entries = readdirSync(p); } catch { return; }
      for (const e of entries) visit(join(p, e), false);
    } else if (st.size <= MAX_BYTES && !/\.min\.[^.]+$/.test(base) && (top || !/\.(test|spec)\.[^.]+$/.test(base))) files.add(p);
  };
  for (const p of paths) {
    visit(resolve(p), true);
    const cfg = nearestTailwindConfig(resolve(p));
    if (cfg) files.add(cfg);
  }
  return [...files];
}

function nearestTailwindConfig(p) {
  let dir = existsSync(p) && statSync(p).isDirectory() ? p : dirname(p);
  for (let k = 0; k < 5; k++) {
    for (const ext of ['js', 'cjs', 'mjs', 'ts']) { const c = join(dir, `tailwind.config.${ext}`); if (existsSync(c)) return c; }
    if (existsSync(join(dir, 'package.json'))) return null;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
  return null;
}

function classify(file) {
  const ext = extname(file).toLowerCase();
  const base = basename(file);
  const stem = base.slice(0, base.length - ext.length);
  if (TW_CONFIG.test(base)) return 'twconfig';
  if (MARKUP.has(ext)) return 'markup';
  if (ext === '.css') return 'css';
  if (ext === '.json') return (LOCALE_DIR.test(file) || LANG.test(stem)) && !/^(package|tsconfig|jsconfig|components|vercel)/.test(stem) ? 'locale' : null;
  if (ext === '.yml' || ext === '.yaml') return LOCALE_DIR.test(file) ? 'locale' : null;
  if (['.ts', '.js', '.mjs', '.cjs'].includes(ext)) return LOCALE_DIR.test(file) ? 'locale' : 'script';
  return null;
}

// One language per set of translations: English when there is one.
function englishOnly(files) {
  const slots = new Map();
  const keep = [];
  for (const f of files) {
    const ext = extname(f);
    const stem = basename(f, ext);
    const dir = basename(dirname(f));
    let lang = null, slot = null;
    if (LANG.test(stem)) { lang = stem; slot = `${dirname(f)}|${ext}`; }
    else if (LANG.test(dir)) { lang = dir; slot = `${dirname(dirname(f))}|${basename(f)}`; }
    if (!slot) { keep.push(f); continue; }
    if (!slots.has(slot)) slots.set(slot, []);
    slots.get(slot).push({ f, lang });
  }
  for (const group of slots.values()) {
    const en = group.filter((g) => /^en/i.test(g.lang));
    const langs = [...new Set(group.map((g) => g.lang))].sort();
    keep.push(...(en.length ? en : group.filter((g) => g.lang === langs[0])).map((g) => g.f));
  }
  return keep;
}

// ---------- scanning helpers ----------
function lineIndex(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) starts.push(i + 1);
  return (pos) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}

function skipString(src, i) {
  const q = src[i];
  let j = i + 1;
  while (j < src.length) {
    const c = src[j];
    if (c === '\\') { j += 2; continue; }
    if (q === '`' && c === '$' && src[j + 1] === '{') { j = braceEnd(src, j + 1) + 1; continue; }
    if (c === q) return j + 1;
    if (c === '\n' && q !== '`') return j + 1;
    j++;
  }
  return j;
}

function braceEnd(src, i) {
  let depth = 0;
  let j = i;
  while (j < src.length) {
    const c = src[j];
    if (c === '"' || c === "'" || c === '`') { j = skipString(src, j); continue; }
    if (c === '/' && src[j + 1] === '/') { const e = src.indexOf('\n', j); j = e < 0 ? src.length : e; continue; }
    if (c === '/' && src[j + 1] === '*') { const e = src.indexOf('*/', j + 2); j = e < 0 ? src.length : e + 2; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return j; }
    j++;
  }
  return src.length - 1;
}

// ---------- markup tree (HTML, JSX, Svelte, Vue, Astro) ----------
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea']);

function parseTag(src, i) {
  let j = i + 1;
  if (src[j] === '>') return { name: '', attrs: {}, selfClosing: false, end: j + 1 };
  const m = /^[A-Za-z][\w.:-]*/.exec(src.slice(j, j + 80));
  if (!m) return null;
  const name = m[0];
  j += name.length;
  if (!/[\s/>]/.test(src[j] || '')) return null;
  if (/^[A-Z]$/.test(name) && /^\s+extends\b/.test(src.slice(j, j + 20))) return null;
  const attrs = {};
  const limit = Math.min(src.length, i + 8000);
  while (j < limit) {
    const c = src[j];
    if (/\s/.test(c)) { j++; continue; }
    if (c === '>') return { name, attrs, selfClosing: false, end: j + 1 };
    if (c === '/' && src[j + 1] === '>') return { name, attrs, selfClosing: true, end: j + 2 };
    if (c === '{') { j = braceEnd(src, j) + 1; continue; }
    const an = /^[^\s=/>{}"']+/.exec(src.slice(j, j + 200));
    if (!an) { j++; continue; }
    const attr = { pos: j };
    j += an[0].length;
    let k = j;
    while (/\s/.test(src[k] || '')) k++;
    if (src[k] === '=') {
      k++;
      while (/\s/.test(src[k] || '')) k++;
      const q = src[k];
      if (q === '"' || q === "'") { const e = src.indexOf(q, k + 1); const stop = e < 0 ? src.length : e; attr.str = src.slice(k + 1, stop); j = stop + 1; }
      else if (q === '{') { const e = braceEnd(src, k); attr.expr = src.slice(k + 1, e); j = e + 1; }
      else { const v = /^[^\s>]+/.exec(src.slice(k, k + 200)); attr.str = v ? v[0] : ''; j = k + (v ? v[0].length : 0); }
    }
    attrs[an[0]] = attr;
  }
  return null;
}

function jsxStartOk(src, i) {
  if (!/[A-Za-z>]/.test(src[i + 1] || '')) return false;
  let k = i - 1;
  while (k >= 0 && /\s/.test(src[k])) k--;
  if (k < 0) return true;
  if ('(,=:?&|!{}[;>'.includes(src[k])) return true;
  const w = /([A-Za-z]+)$/.exec(src.slice(Math.max(0, k - 10), k + 1));
  return !!w && /^(return|yield|default|case|else|do|in|of)$/.test(w[1]);
}

export function parseMarkup(src, ext) {
  const line = lineIndex(src);
  const lower = src.toLowerCase();
  const root = { type: 'el', name: '#root', attrs: {}, children: [], line: 1, pos: 0, parent: null };
  const styles = [];
  const jsx = ext === '.jsx' || ext === '.tsx';
  const braces = ext !== '.html';
  const frames = [{ kind: jsx ? 'js' : 'children', el: root }];
  let i = 0;
  let text = '';
  let textPos = 0;
  if (ext === '.astro') { const m = /^\s*---[\s\S]*?\n---/.exec(src); if (m) i = m[0].length; }
  const top = () => frames[frames.length - 1];
  const nearestExpr = () => top().exprNode || null;
  const flushText = () => {
    if (text && top().kind === 'children') top().el.children.push({ type: 'text', value: text, pos: textPos, line: line(textPos) });
    text = '';
  };
  const openTag = (tag, pos) => {
    const host = top().el;
    const el = { type: 'el', name: tag.name, attrs: tag.attrs, children: [], pos, line: line(pos), parent: host, expr: nearestExpr() };
    host.children.push(el);
    const lname = tag.name.toLowerCase();
    if (tag.selfClosing || VOID.has(tag.name)) return tag.end;
    if (!jsx && RAW.has(lname)) {
      const e = lower.indexOf(`</${lname}`, tag.end);
      const stop = e < 0 ? src.length : e;
      if (lname === 'style') styles.push({ css: src.slice(tag.end, stop), line: line(tag.end) - 1 });
      const close = src.indexOf('>', stop);
      return close < 0 ? src.length : close + 1;
    }
    frames.push({ kind: 'children', el, exprNode: top().exprNode });
    return tag.end;
  };
  const closeTag = (name) => {
    for (let k = frames.length - 1; k > 0; k--) {
      if (frames[k].kind !== 'children') return;
      if (frames[k].el.name === name) { frames.length = k; return; }
    }
  };
  while (i < src.length) {
    const f = top();
    const c = src[i];
    if (f.kind === 'children') {
      if (c === '<') {
        if (src.startsWith('<!--', i)) { flushText(); const e = src.indexOf('-->', i); i = e < 0 ? src.length : e + 3; continue; }
        if (src[i + 1] === '/') {
          const m = /^<\/\s*([\w.:-]*)\s*>/.exec(src.slice(i, i + 200));
          if (m) { flushText(); closeTag(m[1]); i += m[0].length; continue; }
        } else {
          const tag = parseTag(src, i);
          if (tag) { flushText(); i = openTag(tag, i); continue; }
        }
      } else if (c === '{' && braces) {
        flushText();
        const node = { type: 'expr', pos: i + 1, line: line(i), raw: '' };
        f.el.children.push(node);
        frames.push({ kind: 'expr', el: f.el, node, depth: 0, exprNode: node });
        i++;
        continue;
      }
      if (!text) textPos = i;
      text += c;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue; }
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = e < 0 ? src.length : e; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (f.kind === 'expr') {
      if (c === '{') { f.depth++; i++; continue; }
      if (c === '}') {
        if (f.depth === 0) { f.node.raw = src.slice(f.node.pos, i); frames.pop(); i++; continue; }
        f.depth--; i++; continue;
      }
    }
    if (c === '<' && jsxStartOk(src, i)) {
      const tag = parseTag(src, i);
      if (tag) { i = openTag(tag, i); continue; }
    }
    i++;
  }
  flushText();
  return { root, styles };
}

// Iterative pre-order walk: unclosed tags can nest far deeper than the call stack.
function walk(node, fn) {
  const stack = [node];
  while (stack.length) {
    const n = stack.pop();
    fn(n);
    if (n.children) for (let k = n.children.length - 1; k >= 0; k--) stack.push(n.children[k]);
  }
}
function findAll(node, pred) { const out = []; walk(node, (n) => { if (n.type === 'el' && pred(n)) out.push(n); }); return out; }
function ancestors(el) { const out = []; for (let p = el.parent; p; p = p.parent) out.push(p); return out; }

const ENT = { rarr: '→', larr: '←', raquo: '»', rsaquo: '›', amp: '&', nbsp: ' ', gt: '>', lt: '<', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', hellip: '…', middot: '·', starf: '★', bull: '•' };
const decode = (s) => s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e] ?? m)));
const squash = (s) => s.replace(/\s+/g, ' ').trim();
function literalOf(raw) {
  const m = /^\s*(["'`])([\s\S]*)\1\s*$/.exec(raw || '');
  if (!m || (m[1] === '`' && m[2].includes('${')) || m[2].includes(m[1])) return null;
  return m[2];
}
// Expressions that hold markup (`{x && <b/>}`) are skipped here: their elements are children too.
function textOf(node, withExprs = false) {
  let out = '';
  walk(node, (n) => {
    if (n.type === 'text') out += decode(n.value);
    else if (n.type === 'expr') {
      const lit = literalOf(n.raw);
      if (lit != null) out += lit;
      else if (withExprs && !n.raw.includes('<')) out += `{${n.raw.trim()}}`;
    } else if (n.name === 'br') out += ' ';
  });
  return out;
}
const hasDynamicText = (el) => { let dyn = false; walk(el, (n) => { if (n.type === 'expr' && literalOf(n.raw) == null && !n.raw.includes('<') && n.raw.trim()) dyn = true; }); return dyn; };

function stringsIn(code) {
  const out = [];
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (c === '"' || c === "'") { const e = skipString(code, i); out.push(code.slice(i + 1, e - 1)); i = e; continue; }
    if (c === '`') {
      let j = i + 1, part = '';
      while (j < code.length && code[j] !== '`') {
        if (code[j] === '\\') { part += code[j + 1] || ''; j += 2; continue; }
        if (code[j] === '$' && code[j + 1] === '{') { const e = braceEnd(code, j + 1); out.push(stringsIn(code.slice(j + 2, e))); part += ' '; j = e + 1; continue; }
        part += code[j];
        j++;
      }
      out.push(part);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out.join(' ');
}
function classOf(el) {
  let out = '';
  for (const k of ['class', 'className', ':class', 'class:list']) {
    const a = el.attrs[k];
    if (!a) continue;
    if (a.str != null) out += ` ${a.str}`;
    if (a.expr != null) out += ` ${stringsIn(a.expr)}`;
  }
  return out.trim();
}
// Only the classes every render gets: drops ternary and `&&` branches and `${}` holes.
function staticClassOf(el) {
  let out = '';
  for (const k of ['class', 'className', ':class', 'class:list']) {
    const a = el.attrs[k];
    if (!a) continue;
    if (a.str != null) out += ` ${a.str}`;
    if (a.expr == null) continue;
    const code = a.expr;
    for (let i = 0; i < code.length;) {
      const c = code[i];
      if (c !== '"' && c !== "'" && c !== '`') { i++; continue; }
      const e = skipString(code, i);
      if (!/(\?|:|&&|\|\|)\s*$/.test(code.slice(0, i))) out += ` ${code.slice(i + 1, e - 1).replace(/\$\{[\s\S]*?\}/g, ' ')}`;
      i = e;
    }
  }
  return out.trim();
}
const RESPONSIVE =/^(sm|md|lg|xl|2xl):/;
const baseTokens = (cls) => cls.split(/\s+/).filter(Boolean).map((t) => t.replace(/^!/, '').replace(RESPONSIVE, '')).filter((t) => !t.includes(':'));
const lightTokens = (cls) => cls.split(/\s+/).filter((t) => t && !/(^|:)dark:/.test(t)).map((t) => t.split(':').pop());

const isClickable = (el) => el.name === 'a' || el.name === 'button' || /^(Link|Button|NavLink)$/.test(el.name) || /^[A-Z][\w.]*(Link|Button|Btn|Cta|CTA)$/.test(el.name);
const outermostClickables = (root) => findAll(root, (el) => isClickable(el) && !ancestors(el).some(isClickable));

const NO_FILL_BG = /^bg-(transparent|none|white|background|inherit|current|clip-|gradient|linear|radial|cover|contain|center|no-repeat|repeat|fixed|local|scroll|origin|top|bottom|left|right|auto|blend|opacity|\[url)/;
const isFillToken = (t) => /^bg-/.test(t) && !NO_FILL_BG.test(t);
const QUIET_VARIANT = /^(outline|ghost|secondary|link|tertiary|subtle|plain|text|quiet|unstyled|minimal)/i;
function filled(el) {
  const v = el.attrs.variant?.str;
  if (v != null) return !QUIET_VARIANT.test(v);
  const base = baseTokens(classOf(el));
  if (base.some((t) => /(^|-)(ghost|outline|secondary|tertiary|link)$/.test(t))) return false;
  if (base.some(isFillToken) || base.some((t) => /^(btn-)?(primary|cta)$/.test(t))) return true;
  return /Button$/.test(el.name);
}

// ---------- T1 ----------
const ARROW_TXT = /(→|->|⟶|›|»|⇒|➜|➔)\s*$/;
const ARROW_ONLY = /^(→|->|⟶|›|»|⇒|➜|➔)$/;
const ARROW_ICON = /^(?:Icon|Fi|Hi|Hi2|Fa|Md|Lu|Bs|Ri|Tb|Io|Ai|Bi)?(ArrowRight|ChevronRight|ArrowLongRight|ArrowNarrowRight|MoveRight)(Icon|Outline|Solid|Filled|Rounded|Sharp)?$/;
function lastChild(el) {
  for (let k = el.children.length - 1; k >= 0; k--) {
    const ch = el.children[k];
    if (ch.type === 'text' && !decode(ch.value).trim()) continue;
    if (ch.type === 'expr' && (literalOf(ch.raw) ?? (ch.raw.trim() ? 'x' : '')).trim() === '') continue;
    return ch;
  }
  return null;
}
// 'text' for a typed arrow, 'icon' for an arrow component, false for neither.
function endsInArrow(el, depth = 0) {
  const ch = lastChild(el);
  if (!ch || depth > 3) return false;
  if (ch.type === 'text') return ARROW_TXT.test(decode(ch.value)) && 'text';
  if (ch.type === 'expr') { const lit = literalOf(ch.raw); return lit != null && ARROW_TXT.test(lit) && 'text'; }
  if (ARROW_ICON.test(ch.name)) return 'icon';
  const t = squash(textOf(ch));
  if (ARROW_ONLY.test(t)) return 'text';
  if (!t || isClickable(ch)) return endsInArrow(ch, depth + 1);
  return false;
}
// A link that wraps a title and a description is a row or a card; its chevron is the row's affordance.
const BLOCK = /^(div|p|h[1-6]|ul|ol|li|section|article|figure|table|dl|header|footer|img|picture)$/;
const ownText = (e) => squash(e.children.filter((c) => c.type !== 'el').map((c) => textOf(c, true)).join(' '));
const isRowLink = (el) => findAll(el, (e) => BLOCK.test(e.name)).length > 0
  || /(^|[\s_-])row([\s_-]|$)/.test(classOf(el))
  || findAll(el, (e) => { const t = ownText(e); return t && !ARROW_ONLY.test(t); }).length >= 2;
const SEQUENCE = /(^|[^a-z])(next|continue|previous|prev|back|seguinte|pr[oó]ximo|anterior|siguiente|suivant|weiter|forward)/i;
const buttonStyled = (el) => {
  if (/Button$|^button$/.test(el.name) && (el.name !== 'button' || classOf(el))) return true;
  const b = baseTokens(classOf(el));
  return b.some(isFillToken) || (b.some((t) => /^border(-\d)?$/.test(t)) && b.some((t) => /^p[xy]?-/.test(t))) || b.some((t) => /(^|-)btn(-|$)|^button$/.test(t));
};
const STOCK = /^(learn more|see how it works|explore|discover more|find out more)$/;
function keyWords(raw) {
  const s = /["'`]([\w.:-]+)["'`]/.exec(raw);
  const key = s ? s[1].split(/[.:]/).pop() : (/([A-Za-z_$][\w$]*)\s*\)?\s*$/.exec(raw) || [])[1] || '';
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase().trim();
}
function labelWords(el) {
  const t = squash(textOf(el)).replace(ARROW_TXT, '').trim();
  if (t) return t.toLowerCase();
  let raw = null;
  walk(el, (n) => { if (!raw && n.type === 'expr' && !n.raw.includes('<') && n.raw.trim()) raw = n.raw; });
  return raw ? keyWords(raw) : '';
}

function checkT1(doc, report) {
  const clicks = outermostClickables(doc.root);
  if (doc.ext !== '.html') {
    for (const el of clicks) {
      const label = squash(textOf(el, true)).replace(ARROW_TXT, '').trim();
      if (!label || isRowLink(el) || SEQUENCE.test(label)) continue;
      const arrow = endsInArrow(el);
      if (arrow === 'text' || (arrow === 'icon' && buttonStyled(el))) report('T1', 'FAIL', doc.file, el.line, `arrow glued to the label "${trunc(squash(textOf(el, true)), 40)}"${arrow === 'icon' ? ' (arrow icon last)' : ''}`, FIX.arrow);
    }
  }
  const set = new Set(clicks);
  const parents = new Set(clicks.map((c) => c.parent));
  for (const p of parents) {
    const row = p.children.filter((ch) => set.has(ch));
    for (let k = 1; k < row.length; k++) {
      const [a, b] = [row[k - 1], row[k]];
      const words = labelWords(b);
      if (!STOCK.test(words) || filled(b) || !filled(a)) continue;
      report('T1', 'FAIL', doc.file, b.line, `stock second action "${trunc(squash(textOf(b, true)), 30)}" (${words}) beside the primary "${trunc(squash(textOf(a, true)), 30)}"`, FIX.second);
    }
  }
}

// ---------- T3 ----------
export function isFragment(raw) {
  const s = squash(raw).replace(/(\d)\.(\d)/g, '$1,$2');
  if (!s || s.length > 120) return false;
  if (/^[^.!?]{1,40}, simplified\.$/i.test(s)) return true;
  if (/^an? (better|simpler|smarter|faster|easier|new) way to [^.!?]+[.!]$/i.test(s)) return true;
  if (/^less [^.!?]+\. more [^.!?]+[.!]$/i.test(s) || /^simple [^.!?]+\. powerful [^.!?]+[.!]$/i.test(s)) return true;
  const parts = s.match(/[^.!?]+[.!?]+/g);
  if (!parts || parts.length < 2 || parts.join('').replace(/\s/g, '') !== s.replace(/\s/g, '')) return false;
  return parts.every((p) => { const w = p.trim().split(/\s+/).length; return w >= 1 && w <= 5; });
}
const HEADING_PROP_HOST = /Heading|Hero|Section|Header|Intro|Banner|Headline|Title/;
const NOT_HEADING_HOST = /Dialog|Modal|Toast|Alert|Confirm|Drawer|Sheet|Tooltip|Popover|Menu|Tab|Field|Input|Select|Meta|Seo|SEO|Head$|Helmet/;
const HEADLINE_KEY = /title|heading|headline|hero|h1|h2|tagline/i;

function markupHeadlines(doc) {
  const out = [];
  for (const el of findAll(doc.root, (e) => /^h[123]$/.test(e.name))) {
    if (hasDynamicText(el)) continue;
    const text = squash(textOf(el));
    if (text) out.push({ file: doc.file, line: el.line, text });
  }
  for (const el of findAll(doc.root, (e) => /^[A-Z]/.test(e.name) && HEADING_PROP_HOST.test(e.name) && !NOT_HEADING_HOST.test(e.name))) {
    for (const k of ['title', 'heading', 'headline', 'tagline']) {
      const a = el.attrs[k];
      const v = a ? (a.str ?? literalOf(a.expr)) : null;
      if (v) out.push({ file: doc.file, line: el.line, text: squash(decode(v)) });
    }
  }
  return out;
}

// ---------- locale / config objects ----------
function scanObject(src) {
  const line = lineIndex(src);
  const out = [];
  const stack = [];
  let key = null, expect = false, i = 0;
  const path = () => stack.map((s) => s.key).filter((k) => k != null);
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = e < 0 ? src.length : e; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const e = skipString(src, i);
      const body = src.slice(i + 1, e - 1);
      const pos = i;
      i = e;
      let k = i;
      while (/\s/.test(src[k] || '')) k++;
      if (src[k] === ':') { key = body; expect = true; i = k + 1; continue; }
      const inArray = stack.length && stack[stack.length - 1].array;
      if ((expect || inArray) && !(c === '`' && body.includes('${'))) out.push({ path: expect ? [...path(), key] : path(), value: body.replace(/\\(.)/g, '$1'), line: line(pos) });
      expect = false; key = null;
      continue;
    }
    if (c === '{' || c === '[') { stack.push({ key: expect ? key : null, array: c === '[' }); expect = false; key = null; i++; continue; }
    if (c === '}' || c === ']') { stack.pop(); expect = false; i++; continue; }
    if (c === ',') { expect = false; key = null; i++; continue; }
    const id = /^[A-Za-z_$\d][\w$.]*/.exec(src.slice(i, i + 100));
    if (id) {
      i += id[0].length;
      let k = i;
      while (/\s/.test(src[k] || '')) k++;
      if (src[k] === ':' && src[k + 1] !== ':') { key = id[0]; expect = true; i = k + 1; } else expect = false;
      continue;
    }
    i++;
  }
  return out;
}
function scanYaml(src) {
  const out = [];
  const stack = [];
  src.split('\n').forEach((ln, idx) => {
    if (/^\s*(#|$)/.test(ln)) return;
    const m = /^(\s*)(?:-\s+)?("[^"]+"|'[^']+'|[\w.-]+):(?:\s+(.*))?$/.exec(ln);
    if (!m) return;
    const ind = m[1].length;
    while (stack.length && stack[stack.length - 1].ind >= ind) stack.pop();
    const key = m[2].replace(/^["']|["']$/g, '');
    const v = (m[3] || '').replace(/\s+#.*$/, '').trim();
    if (!v || /^[|>][-+]?$/.test(v)) { stack.push({ ind, key }); return; }
    out.push({ path: [...stack.map((s) => s.key), key], value: v.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'), line: idx + 1 });
  });
  return out;
}
const leafKey = (path) => String(path[path.length - 1] ?? '').split('.').pop();

// ---------- colour ----------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: r + m, g: g + m, b: b + m };
}
const num = (s) => parseFloat(s);
export function parseColor(input, triplet = 'rgb') {
  const s = String(input || '').trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
  }
  m = /^oklch\(\s*([\d.]+)(%?)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:deg)?\s*(?:\/[^)]*)?\)$/.exec(s);
  if (m) return { okl: { L: m[2] ? num(m[1]) / 100 : num(m[1]), C: num(m[3]), H: num(m[4]) } };
  m = /^(rgba?|hsla?)\(\s*(.+?)\s*\)$/.exec(s);
  const parts = (m ? m[2] : s).split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || !parts.slice(0, 3).every((p) => /^-?[\d.]+(%|deg)?$/.test(p))) return null;
  const kind = m ? m[1].slice(0, 3) : (parts.slice(1, 3).some((p) => p.endsWith('%')) ? 'hsl' : triplet);
  if (kind === 'hsl') return hslToRgb(num(parts[0]), num(parts[1]) / 100, num(parts[2]) / 100);
  const ch = (p) => clamp01(p.endsWith('%') ? num(p) / 100 : num(p) / 255);
  return { r: ch(parts[0]), g: ch(parts[1]), b: ch(parts[2]) };
}
export function toOklch(c) {
  if (!c) return null;
  if (c.okl) return c.okl;
  const lin = (u) => (u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [lin(c.r), lin(c.g), lin(c.b)];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}
const okLab = (o) => [o.L, o.C * Math.cos((o.H * Math.PI) / 180), o.C * Math.sin((o.H * Math.PI) / 180)];
const deltaE = (a, b) => { const [x, y] = [okLab(a), okLab(b)]; return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
const fmtOk = (o) => `oklch ${o.L.toFixed(2)} ${o.C.toFixed(3)} ${Math.round(o.H)}`;
const isCream = (o) => o.L >= 0.9 && o.C >= 0.005 && o.C <= 0.06 && o.H >= 55 && o.H <= 105;
const isClay = (o) => o.H >= 15 && o.H <= 55 && o.C >= 0.08 && o.L >= 0.45 && o.L <= 0.72;
const isLavender = (o) => o.H >= 240 && o.H <= 300 && o.L > 0.9 && o.C > 0.01;
const STOCK_INDIGO = ['#4f46e5', '#6366f1', '#4338ca', '#7c3aed', '#8b5cf6', '#a855f7'].map((h) => ({ hex: h, okl: toOklch(parseColor(h)) }));
const nearIndigo = (o) => STOCK_INDIGO.find((s) => deltaE(o, s.okl) < 0.02);
const TW = {
  'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe',
  'indigo-50': '#eef2ff', 'indigo-100': '#e0e7ff', 'indigo-200': '#c7d2fe',
  'violet-50': '#f5f3ff', 'violet-100': '#ede9fe', 'violet-200': '#ddd6fe',
  'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff',
};
const COLOR_IN = /#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch)\([^()]*\)/g;

function cssDecls(css, file, lineOffset = 0) {
  const out = [];
  const line = lineIndex(css);
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const stack = [];
  let buf = '', start = 0;
  const flush = () => {
    const m = /^\s*([-\w]+)\s*:\s*([\s\S]+?)\s*$/.exec(buf);
    if (!m) return;
    const sel = stack.join(' > ');
    out.push({ prop: m[1], value: m[2], selector: sel, dark: DARK.test(sel), file, line: line(start + buf.search(/\S/)) + lineOffset });
  };
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (c === '{') { stack.push(buf.trim()); buf = ''; start = i + 1; }
    else if (c === '}' || c === ';') { flush(); if (c === '}') stack.pop(); buf = ''; start = i + 1; }
    else buf += c;
  }
  return out;
}
const DARK = /\.dark\b|\[data-(theme|mode)=["']?dark|prefers-color-scheme:\s*dark|\.theme-dark/;

const BG_NAME = /(^|-)(background|bg|paper|page|canvas|surface)$|(^|-)(cream|parchment|ivory|linen|sand|bone|oat|eggshell|beige)(-light|-lighter|-50|-100)?$/;
const BG_NOT = /(card|popover|sidebar|input|muted|accent|primary|secondary|destructive|button|btn|header|footer|nav|hover|active|selected|overlay|modal|dialog|tooltip|code|chart|inverse|inverted|dark)-/;
const PRIMARY_ROLE = /(^|-)(primary|accent|brand|cta)(-default|-500|-600)?$/;
const CLAY_NAME = /(^|-)(terracotta|clay|rust|ember|sienna|copper)(-default|-500|-600)?$/;
const SERIF_FACE = /fraunces|playfair|instrument serif|cormorant|dm serif|newsreader|libre caslon|lora|merriweather|georgia|garamond|crimson|source serif|ibm plex serif|spectral|young serif|gloock|canela|freight|tiempos|recoleta|bodoni|didot|noto serif|pt serif|literata/i;
const isSerifStack = (v) => SERIF_FACE.test(v) || /(^|[\s,"'])serif\b/i.test(v.replace(/sans-serif/gi, ''));

function buildPalette(cssList, configEntries, docs) {
  const tokens = new Map();
  for (const d of cssList) if (d.prop.startsWith('--')) { if (!tokens.has(d.prop)) tokens.set(d.prop, []); tokens.get(d.prop).push(d); }
  const allCss = cssList.map((d) => d.value).join('\n');
  const resolveVars = (value, depth = 0) => {
    let src = null;
    const text = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (m, name, fb) => {
      const d = (tokens.get(name) || []).find((x) => !x.dark);
      if (!d || depth > 8) return fb ?? m;
      const r = resolveVars(d.value, depth + 1);
      src = r.src || d;
      return r.text;
    });
    return { text, src };
  };
  const toColor = (name, value) => {
    const { text, src } = resolveVars(value);
    const hint = new RegExp(`hsla?\\(\\s*var\\(${name.replace(/[-]/g, '\\-')}\\b`).test(allCss) ? 'hsl' : 'rgb';
    const okl = toOklch(parseColor(text, hint));
    return okl ? { okl, resolved: text, src } : null;
  };
  const bg = [], primary = [], role = [];
  const add = (list, c) => list.push(c);
  for (const [name, decls] of tokens) {
    const d = decls.find((x) => !x.dark);
    if (!d) continue;
    const bare = name.slice(2);
    const isBg = BG_NAME.test(bare) && !BG_NOT.test(bare) && !/foreground$/.test(bare);
    const isRole = PRIMARY_ROLE.test(bare) && !/foreground$/.test(bare);
    const isClayName = CLAY_NAME.test(bare);
    if (!isBg && !isRole && !isClayName) continue;
    const c = toColor(name, d.value);
    if (!c) continue;
    const cand = { name, raw: d.value, ...c, file: (c.src || d).file, line: (c.src || d).line };
    if (isBg) add(bg, cand);
    if (isRole || isClayName) add(primary, cand);
    if (isRole) add(role, cand);
  }
  for (const d of cssList) {
    if (d.dark || !/^background(-color)?$/.test(d.prop) || !/(^|[\s,>])(html|body|main|:root)\s*$/.test(d.selector)) continue;
    const c = toColor('', d.value);
    if (c) bg.push({ name: `${d.selector} background`, raw: d.value, ...c, file: (c.src || d).file, line: (c.src || d).line });
  }
  for (const e of configEntries) {
    const ci = e.path.indexOf('colors');
    if (ci < 0) continue;
    const [key, sub] = e.path.slice(ci + 1);
    if (!key || e.path.length > ci + 3) continue;
    const name = `colors.${e.path.slice(ci + 1).join('.')}`;
    const c = toColor('', e.value);
    if (!c) continue;
    const cand = { name, raw: e.value, ...c, file: (c.src || e).file, line: (c.src || e).line };
    if (BG_NAME.test(key) && (!sub || /^(DEFAULT|50|100)$/.test(sub))) bg.push(cand);
    if ((PRIMARY_ROLE.test(key) || CLAY_NAME.test(key)) && (!sub || /^(DEFAULT|500|600)$/.test(sub))) { primary.push(cand); if (PRIMARY_ROLE.test(key)) role.push(cand); }
  }
  const lookupUtility = (u) => {
    const t = tokens.get(`--color-${u}`)?.find((x) => !x.dark);
    if (t) { const c = toColor(`--color-${u}`, t.value); return c && { ...c, file: t.file, line: t.line }; }
    const e = configEntries.find((x) => { const ci = x.path.indexOf('colors'); return ci >= 0 && x.path.slice(ci + 1).join('-').replace(/-DEFAULT$/, '') === u; });
    return e ? { ...toColor('', e.value), file: e.file, line: e.line } : null;
  };
  for (const doc of docs) {
    for (const el of findAll(doc.root, (e) => /^(html|body|main)$/.test(e.name))) {
      for (const t of baseTokens(classOf(el))) {
        let m = /^bg-\[(.+)\]$/.exec(t);
        if (m) { const okl = toOklch(parseColor(m[1].replace(/_/g, ' '))); if (okl) bg.push({ name: `${t} on <${el.name}>`, raw: m[1], okl, file: doc.file, line: el.line }); continue; }
        m = /^bg-(stone|amber|orange)-50$/.exec(t);
        if (m) { bg.push({ name: `${t} on <${el.name}>`, raw: t, forced: true, okl: toOklch(parseColor({ stone: '#fafaf9', amber: '#fffbeb', orange: '#fff7ed' }[m[1]])), file: doc.file, line: el.line }); continue; }
        m = /^bg-([\w-]+)$/.exec(t);
        if (m && isFillToken(t)) { const c = lookupUtility(m[1]); if (c?.okl) bg.push({ name: `${t} on <${el.name}>`, raw: c.resolved || t, okl: c.okl, file: c.file, line: c.line }); }
      }
    }
  }
  let serif = null;
  for (const [name, decls] of tokens) {
    if (!/font-(display|heading|headline|title|serif)$/.test(name)) continue;
    const d = decls.find((x) => !x.dark);
    if (d && isSerifStack(resolveVars(d.value).text)) { serif = `${name}: ${d.value}`; break; }
  }
  if (!serif) for (const e of configEntries) if (/fontFamily/.test(e.path.join('.')) && /^(display|heading|headline|title|serif)$/.test(e.path[e.path.indexOf('fontFamily') + 1] || '') && isSerifStack(e.value)) { serif = `fontFamily.${e.path[e.path.indexOf('fontFamily') + 1]}: ${e.value}`; break; }
  if (!serif) for (const doc of docs) { const h = findAll(doc.root, (e) => /^h[12]$/.test(e.name) && baseTokens(classOf(e)).includes('font-serif'))[0]; if (h) { serif = `font-serif on <${h.name}>`; break; } }
  return { bg, primary, role, serif, tokens, resolveVars };
}

const show = (c) => `${c.name} ${c.raw}${c.resolved && squash(c.resolved) !== squash(c.raw) ? ` = ${squash(c.resolved)}` : ''} (${fmtOk(c.okl)})`;

function checkT2(pal, report) {
  const cream = pal.bg.find((c) => c.forced || isCream(c.okl));
  const clay = pal.primary.find((c) => isClay(c.okl));
  if (cream && clay) { report('T2', 'FAIL', clay.file, clay.line, `cream background ${show(cream)} + clay accent ${show(clay)}`, FIX.clay); return; }
  const one = cream || clay;
  if (one && pal.serif) report('T2', 'REFLEX', one.file, one.line, `${cream ? `cream background ${show(cream)}` : `clay accent ${show(clay)}`} with a serif display face (${trunc(pal.serif, 50)})`, FIX.clay);
}

function checkT6(pal, docs, cssList, report) {
  const seen = new Set();
  for (const c of pal.role) {
    const hit = nearIndigo(c.okl);
    if (!hit || seen.has(c.name)) continue;
    seen.add(c.name);
    report('T6', 'FAIL', c.file, c.line, `stock indigo/violet primary ${show(c)}, matches ${hit.hex}`, FIX.indigo);
  }
  for (const doc of docs) {
    const hits = [];
    for (const el of outermostClickables(doc.root)) {
      const t = baseTokens(staticClassOf(el)).find((x) => /^bg-(indigo|violet)-[567]00$|^bg-purple-6\d\d$/.test(x));
      if (t) hits.push({ el, t });
    }
    if (hits.length) report('T6', 'FAIL', doc.file, hits[0].el.line, `stock indigo/violet on a call to action: ${hits[0].t}${hits.length > 1 ? ` (${hits.length} controls)` : ''}`, FIX.indigo);
    let wash = null;
    walk(doc.root, (n) => {
      if (wash || n.type !== 'el') return;
      for (const t of lightTokens(classOf(n))) {
        const m = /^(from|via|to)-(?:([a-z]+-\d+)|\[(#[0-9a-fA-F]{3,8})\])$/.exec(t);
        const hex = m && (m[3] || TW[m[2]]);
        const okl = hex && toOklch(parseColor(hex));
        if (okl && isLavender(okl)) { wash = { el: n, t, okl }; return; }
      }
    });
    if (wash) report('T6', 'WARN', doc.file, wash.el.line, `lavender gradient wash ${wash.t} (${fmtOk(wash.okl)})`, FIX.lavender);
  }
  const ctaHit = new Set();
  const washed = new Set();
  for (const d of cssList) {
    if (d.dark || d.prop.startsWith('--')) continue;
    if (/^background(-color)?$/.test(d.prop) && /btn|button|cta/i.test(d.selector) && !/:(hover|focus|active)/.test(d.selector) && !ctaHit.has(d.file)) {
      const okl = toOklch(parseColor(pal.resolveVars(d.value).text));
      const hit = okl && nearIndigo(okl);
      if (hit) { ctaHit.add(d.file); report('T6', 'FAIL', d.file, d.line, `stock indigo/violet on a call to action: ${d.selector} { ${d.prop}: ${d.value} }`, FIX.indigo); }
    }
    if (/gradient\(/.test(d.value) && !washed.has(d.file)) {
      for (const col of pal.resolveVars(d.value).text.match(COLOR_IN) || []) {
        const okl = toOklch(parseColor(col));
        if (okl && isLavender(okl)) { washed.add(d.file); report('T6', 'WARN', d.file, d.line, `lavender gradient wash ${col} on ${d.selector} (${fmtOk(okl)})`, FIX.lavender); break; }
      }
    }
  }
}

// ---------- T4 ----------
const PRICE_TEXT = /[$€£]\s?\d|\d(?:[.,]\d+)?\s?€|\/\s?(?:mo|month|mês|mes|yr|year)\b|\bper (?:month|year|seat|user)\b|\bpor mês\b/i;
const PRICE_CODE = /price|amount|perMonth/i;
const BADGE_TXT = /most popular|recommended|best value|mais popular|\bpopular\b|best deal|melhor/i;
const BADGE_KEY = /badge|popular|recommend|featured|best/i;
const NEUTRAL_BG = /^bg-(white|black|transparent|card|background|muted|gray|grey|slate|zinc|neutral|stone|surface|base|paper|cream|popover|default|page|canvas|inherit|current)/;
const NEUTRAL_BORDER = /^border-(gray|grey|slate|zinc|neutral|stone|border|input|muted|white|black|transparent|cream|surface|base|current|[0-8]$|[trblxyse](-|$)|solid|dashed|dotted|none|opacity)/;
function ownPriceSignal(el) {
  if (/Price/.test(el.name)) return true;
  for (const ch of el.children) {
    if (ch.type === 'text' && PRICE_TEXT.test(decode(ch.value))) return true;
    if (ch.type === 'expr' && !ch.raw.includes('<') && (PRICE_CODE.test(ch.raw) || PRICE_TEXT.test(literalOf(ch.raw) || ''))) return true;
  }
  return Object.entries(el.attrs).some(([k, a]) => /^(amount|price|perMonth)$/i.test(k) || (a.expr && PRICE_CODE.test(a.expr) && !/^(class|className|key|style|on\w+)$/.test(k)));
}
function cardLike(el) {
  if (/^Card$|PricingCard|PlanCard|TierCard/.test(el.name)) return true;
  const cls = classOf(el);
  if (/(^|\s)[\w-]*(card|tier|plan)(-[\w-]*)?(\s|$)/i.test(cls) && !/(^|\s)(grid|flex)(\s|$)/.test(cls)) return true;
  const b = baseTokens(cls);
  const has = (re) => b.some((t) => re.test(t));
  const rounded = has(/^rounded/), border = has(/^border(-\d)?$/), bg = has(/^bg-/), shadow = has(/^shadow/), pad = has(/^p[xy]?-/);
  return (rounded || border) && [rounded, border, bg, shadow, pad].filter(Boolean).length >= 3;
}
const hasTwoElements = (el) => { let n = 0; for (const c of el.children) if (c.type === 'el' && ++n >= 2) return true; return el.children.some((c) => c.type === 'el' && c.children.some((g) => g.type === 'el')); };
function isPill(el) {
  if (/Badge|Pill|Chip|Ribbon/.test(el.name)) return true;
  const b = baseTokens(classOf(el));
  if (b.some((t) => /badge|pill|chip|ribbon/.test(t))) return true;
  return b.some((t) => /^(rounded-full|absolute)$/.test(t)) && b.some((t) => /^bg-/.test(t));
}
function tierMarks(card) {
  const b = baseTokens(classOf(card));
  const all = classOf(card).split(/\s+/);
  const marks = [];
  const fill = b.find((t) => isFillToken(t) && !NEUTRAL_BG.test(t));
  if (fill) marks.push(['fill', fill]);
  const featuredCls = all.find((t) => /(^|-)(featured|popular|highlight(ed)?|recommended)$/.test(t));
  if (featuredCls) marks.push(['class', featuredCls]);
  const ring = b.find((t) => /^ring(-\d|-\[)/.test(t) && t !== 'ring-0');
  if (ring) marks.push(['ring', ring]);
  const thick = b.find((t) => /^border-[2-8]$/.test(t));
  const tint = b.find((t) => /^border-/.test(t) && !/^border-[2-8]$/.test(t) && !NEUTRAL_BORDER.test(t));
  if (thick && tint) marks.push(['border', `${thick} ${tint}`]);
  const scale = all.map((t) => t.replace(RESPONSIVE, '')).find((t) => /^scale-(1(0[1-9]|[1-9]\d)|\[1\.0*[1-9]\d*\])$/.test(t));
  if (scale) marks.push(['scale', scale]);
  const badge = findAll(card, (e) => isPill(e) && (BADGE_TXT.test(textOf(e)) || (() => { let k = false; walk(e, (n) => { if (n.type === 'expr' && BADGE_KEY.test(n.raw)) k = true; }); return k || /Badge/.test(e.name); })()))[0];
  if (badge) marks.push(['badge', `"${trunc(squash(textOf(badge, true)), 24)}" badge`]);
  return marks;
}
function judgeTiers(cards) {
  const marks = cards.map(tierMarks);
  const out = new Map();
  for (const kind of ['fill', 'class', 'ring', 'border', 'scale', 'badge']) {
    const holders = cards.filter((_, k) => marks[k].some((m) => m[0] === kind));
    if (holders.length !== 1) continue;
    const k = cards.indexOf(holders[0]);
    if (!out.has(holders[0])) out.set(holders[0], []);
    out.get(holders[0]).push(marks[k].find((m) => m[0] === kind)[1]);
  }
  return out;
}
const FLAG = /\b(\w+)\.(highlighted|featured|popular|recommended|isPopular|isFeatured|isRecommended|isHighlighted|mostPopular)\b\s*(?:\?|&&)/;
const FLAG_TRUE = /\b(highlighted|featured|popular|recommended|isPopular|isFeatured|isRecommended|isHighlighted|mostPopular)\s*:\s*true\b/;
function checkT4(doc, flagSources, report) {
  const cards = new Set();
  walk(doc.root, (n) => {
    if (n.type !== 'el' || !ownPriceSignal(n)) return;
    for (let p = n, d = 0; p && p.name !== '#root' && d < 8; p = p.parent, d++) if (cardLike(p) && hasTwoElements(p)) { cards.add(p); break; }
  });
  const inner = [...cards].filter((c) => ![...cards].some((o) => o !== c && ancestors(o).includes(c)));
  let reported = false;
  const tryGroup = (group) => {
    if (reported || group.length < 2 || group.length > 4) return;
    for (const [card, why] of judgeTiers(group)) {
      report('T4', 'FAIL', doc.file, card.line, `one of ${group.length} pricing cards is styled apart: ${why.join(', ')}`, FIX.tier);
      reported = true;
    }
  };
  const byParent = new Map();
  for (const c of inner) { if (!byParent.has(c.parent)) byParent.set(c.parent, []); byParent.get(c.parent).push(c); }
  for (const g of byParent.values()) tryGroup(g);
  tryGroup(inner);
  if (reported) return;
  const m = FLAG.exec(doc.src);
  if (m && (PRICE_TEXT.test(doc.src) || /price/i.test(doc.src))) {
    const src = flagSources[0];
    report('T4', 'FAIL', doc.file, doc.line(m.index), `${m[1]}.${m[2]} styles one pricing tier apart${src ? ` (set in ${basename(src.file)}:${src.line})` : ''}`, FIX.tier);
  }
}

// ---------- T5 ----------
const STARS = /(?:[★⭐]️?\s*){3,}/;
const STAR_EL = /^(?:Icon|Fa|Hi|Hi2|Md|Lu|Bs|Ri|Tb|Ai|Bi|Io)?Star(?:Icon|Solid|Filled|Fill|Outline)?$/;
const FIVE = /Array\(\s*5\s*\)|length:\s*5\b|\[\s*1\s*,\s*2\s*,\s*3\s*,\s*4\s*,\s*5\s*\]/;
const PROOF = [
  /trusted by\s+(?:over\s+|more than\s+)?\d[\d,.]*\s*[kKmM]?\+(?:\s+[a-z]+)?/i,
  /\b\d{1,3}(?:[,.]\d{3})+\+?\s+(?:happy\s+)?(?:teams|users|customers)\b/i,
  /\b\d+(?:[.,]\d+)?\s*[kKmM]\+?\s+(?:happy\s+)?(?:teams|users|customers)\b/i,
  /\b\d+\+\s+(?:happy\s+)?(?:teams|users|customers)\b/i,
];
const proofIn = (s) => { for (const re of PROOF) { const m = re.exec(s); if (m) return m[0]; } return null; };
function heroRegions(doc) {
  if (/hero|header/i.test(basename(doc.file))) return [doc.root];
  const out = findAll(doc.root, (n) => n.name === 'header' || /(^|[\s_-])hero([\s_-]|$)/i.test(`${classOf(n)} ${n.attrs.id?.str || ''}`));
  const h1 = findAll(doc.root, (n) => n.name === 'h1')[0];
  if (h1) { let p = h1.parent; while (p && !/^(section|header)$/.test(p.name)) p = p.parent; if (p) out.push(p); }
  return out;
}
function checkT5(doc, report) {
  const seen = new Set();
  const once = (line, evidence) => { const k = `${line}|${evidence}`; if (seen.has(k)) return; seen.add(k); report('T5', 'FAIL', doc.file, line, evidence, FIX.proof); };
  for (const region of heroRegions(doc)) {
    walk(region, (n) => {
      if (n.type === 'text') { const m = STARS.exec(decode(n.value)); if (m) once(n.line, `star run "${m[0].trim()}" in the hero`); }
      if (n.type !== 'el') return;
      const stars = n.children.filter((c) => c.type === 'el' && STAR_EL.test(c.name));
      if (stars.length >= 5) once(stars[0].line, `${stars.length} ${stars[0].name} icons in a row in the hero`);
      else if (STAR_EL.test(n.name) && n.expr && FIVE.test(n.expr.raw)) once(n.line, `${n.name} repeated five times in the hero`);
    });
  }
  // Each element's text built once from its children's; null past 300 chars (a proof line is short).
  const els = findAll(doc.root, () => true);
  const text = new Map();
  for (let k = els.length - 1; k >= 0; k--) {
    const n = els[k];
    let s = '';
    for (const c of n.children) {
      const t = c.type === 'el' ? (c.name === 'br' ? ' ' : text.get(c)) : textOf(c);
      if (t == null || s.length > 300) { s = null; break; }
      s += t;
    }
    text.set(n, s && s.length <= 300 ? squash(s) : null);
  }
  for (const n of els) {
    if (n.name === '#root' || !text.get(n)) continue;
    const hit = proofIn(text.get(n));
    if (hit && !n.children.some((c) => c.type === 'el' && text.get(c) && proofIn(text.get(c)))) once(n.line, `unsourced social proof "${hit}"`);
  }
}

const trunc = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ---------- run ----------
export function runTells(paths) {
  const findings = [];
  const report = (gate, grade, file, line, evidence, fix) => findings.push({ gate, grade, file, line, evidence, fix });
  const files = collectFiles(paths);
  const kinds = new Map(files.map((f) => [f, classify(f)]));
  const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } };
  // One unreadable or pathological file costs its own findings, never the run.
  const skip = (f, e) => console.error(`tells: skipped ${f} (${e.message.split('\n')[0]})`);
  const docs = [], cssList = [], configEntries = [], localeEntries = [], flagSources = [];
  for (const f of files) {
    const kind = kinds.get(f);
    if (!kind) continue;
    try {
      const src = read(f);
      if (kind === 'markup') {
        const { root, styles } = parseMarkup(src, extname(f).toLowerCase());
        docs.push({ file: f, ext: extname(f).toLowerCase(), src, root, line: lineIndex(src) });
        for (const s of styles) cssList.push(...cssDecls(s.css, f, s.line));
      } else if (kind === 'css') cssList.push(...cssDecls(src, f));
      else if (kind === 'twconfig') configEntries.push(...scanObject(src).map((e) => ({ ...e, file: f })));
      if (kind === 'markup' || kind === 'script') {
        const m = FLAG_TRUE.exec(src);
        if (m) flagSources.push({ file: f, line: lineIndex(src)(m.index) });
      }
    } catch (e) { skip(f, e); }
  }
  for (const f of englishOnly(files.filter((x) => kinds.get(x) === 'locale'))) {
    try {
      const src = read(f);
      const entries = /\.ya?ml$/i.test(f) ? scanYaml(src) : scanObject(src);
      localeEntries.push(...entries.map((e) => ({ ...e, file: f })));
    } catch (e) { skip(f, e); }
  }

  const heads = [];
  for (const doc of [...docs]) {
    const mine = [];
    const local = (...a) => mine.push(a);
    try {
      checkT1(doc, local); checkT4(doc, flagSources, local); checkT5(doc, local);
      heads.push(...markupHeadlines(doc));
      for (const a of mine) report(...a);
    } catch (e) { skip(doc.file, e); docs.splice(docs.indexOf(doc), 1); }
  }

  for (const e of localeEntries) if (HEADLINE_KEY.test(leafKey(e.path))) heads.push({ file: e.file, line: e.line, text: squash(e.value) });
  const fragments = heads.filter((h) => isFragment(h.text));
  const uniq = [...new Map(fragments.map((h) => [`${h.file}:${h.line}:${h.text}`, h])).values()];
  for (const h of uniq) report('T3', uniq.length >= 2 ? 'FAIL' : 'WARN', h.file, h.line, `fragment headline "${trunc(h.text, 60)}"${uniq.length >= 2 ? ` (${uniq.length} in this set)` : ''}`, FIX.fragment);

  for (const e of localeEntries) {
    const hit = proofIn(e.value);
    if (hit) report('T5', 'FAIL', e.file, e.line, `unsourced social proof "${hit}"`, FIX.proof);
  }

  const pal = buildPalette(cssList, configEntries, docs);
  checkT2(pal, report);
  checkT6(pal, docs, cssList, report);
  return findings;
}
