#!/usr/bin/env node
// room.mjs <project-dir> [--out <dir>] [--skip-build]
//
// Builds a copy room: the project's real page, with every dictionary string editable in place.
// Reads <project-dir>/.copy-room.json (see the skill's SKILL.md for the fields), runs the project's
// dump and its tagged build, then turns the tagged page into a self-contained artifact page:
//   - text-content markers become <span data-copy="key"> (data-copy-html when the value holds markup)
//   - markers inside a tag's attributes are stripped and recorded as data-copy-attr="attr=key;..."
//   - markers inside <title>, <script> or <style> are stripped (those keys stay editable in the list)
//   - site scripts are removed, stylesheets inlined, absolute asset URLs made relative and copied
//   - the editor (editor.css, editor.js) and the full dictionary are injected
// Writes <out>/index.html, the copied assets, and <out>/report.json, and prints the coverage report.
//
// Marker contract (what the project's tagged build must emit for each string):
//   U+E000 <key> U+E001 <value> U+E002      key: [A-Za-z0-9_.-]+
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const project = resolve(args[0] || '.');
const outIdx = args.indexOf('--out');
const skipBuild = args.includes('--skip-build');
const cfg = JSON.parse(readFileSync(join(project, '.copy-room.json'), 'utf8'));
const out = resolve(outIdx > -1 ? args[outIdx + 1] : join(project, cfg.out || '.copy-room'));
const S = '\uE000', M = '\uE001', E = '\uE002';
const run = (cmd, env = {}) => execSync(cmd, { cwd: project, stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, ...env }, maxBuffer: 64 << 20 }).toString();

// 1. the dictionary, flattened: key -> { lang: value }
const dump = JSON.parse(run(cfg.dump));
const copy = {};
const flat = (o, lang, p = '') => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object') flat(v, lang, key);
    else if (typeof v === 'string') (copy[key] ??= {})[lang] = v;
  }
};
for (const lang of cfg.langs) flat(dump[lang] || {}, lang);

// 2. the tagged build
if (!skipBuild) run(cfg.build, cfg.buildEnv || {});
const dist = join(project, cfg.dist);
let html = readFileSync(join(dist, cfg.page), 'utf8');
if (!html.includes(S)) { console.error('No markers in the built page: the tagged build did not run, or the adapter is not wired in.'); process.exit(1); }

const placed = new Set(), attrs = new Set(), hidden = new Set(), broken = [];

// 3a. scripts and styles: strip markers, drop site scripts entirely
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (s) => { collect(s, hidden); return ''; });
html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (s) => { collect(s, hidden); return strip(s); });
// 3b. <title>: replaced by the room's own title, its key kept for the list
html = html.replace(/<title>([\s\S]*?)<\/title>/i, (_, t) => { collect(t, hidden); return `<title>${esc(cfg.title || 'Copy room')}</title>`; });
// 3c. markers inside tags: record attribute -> key on the element
html = html.replace(/<[a-zA-Z][^<>]*>/g, (tag) => {
  if (!tag.includes(S)) return tag;
  const found = [];
  tag = tag.replace(/([\w:-]+)\s*=\s*"([^"]*)"/g, (m, name, val) => {
    if (!val.includes(S)) return m;
    for (const k of keysIn(val)) { found.push(`${name}=${k}`); attrs.add(k); }
    return `${name}="${strip(val)}"`;
  });
  return found.length ? tag.replace(/\s*(\/?)>$/, ` data-copy-attr="${found.join(';')}"$1>`) : strip(tag);
});
// 3d. markers in text: wrap in a span the editor can edit
html = html.replace(new RegExp(`${S}([A-Za-z0-9_.-]+)${M}([\\s\\S]*?)${E}`, 'g'), (m, key, val) => {
  if (val.includes(S)) { broken.push(key); return strip(m); }
  placed.add(key);
  const rich = /<[a-z]/i.test(val);
  return `<span data-copy="${key}"${rich ? ' data-copy-html' : ''}>${val}</span>`;
});
if (/[\uE000-\uE002]/.test(html)) { broken.push('(leftover markers)'); html = strip(html); }

// 4. assets: inline stylesheets, relativise and copy everything the page points at
mkdirSync(out, { recursive: true });
const assets = new Set();
const local = (u) => u.startsWith('/') && !u.startsWith('//');
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi, (tag) => {
  const href = (tag.match(/href="([^"]+)"/) || [])[1];
  if (!href || !local(href)) return tag;
  const file = join(dist, href.split('?')[0]);
  if (!existsSync(file)) return '';
  const css = readFileSync(file, 'utf8').replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (m, q, u) => (assets.add(u.split(/[?#]/)[0]), `url(${q}${u.slice(1)}${q})`));
  return `<style>${css}</style>`;
});
html = html.replace(/\b(src|srcset|poster)="([^"]+)"/g, (m, a, v) => `${a}="${v.split(',').map((part) => {
  const [u, ...rest] = part.trim().split(/\s+/);
  if (!local(u)) return part.trim();
  assets.add(u.split(/[?#]/)[0]);
  return [u.slice(1), ...rest].join(' ');
}).join(', ')}"`);
html = html.replace(/<link\b[^>]*rel="(?:icon|apple-touch-icon|manifest|preload|modulepreload|alternate|canonical)"[^>]*>/gi, '');
for (const a of assets) {
  const src = join(dist, a);
  if (!existsSync(src)) continue;
  const dst = join(out, a);
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
}

// 5. the artifact page holds body content only: move head content into the body, keep html/body attributes
const htmlAttrs = (html.match(/<html\b([^>]*)>/i) || [])[1] || '';
const bodyAttrs = (html.match(/<body\b([^>]*)>/i) || [])[1] || '';
const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || '';
const body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || html;
const keepHead = head.replace(/<meta\b[^>]*charset[^>]*>/gi, '').replace(/<meta\b[^>]*name="viewport"[^>]*>/gi, '');
const titleTag = (keepHead.match(/<title>[\s\S]*?<\/title>/i) || [`<title>${esc(cfg.title || 'Copy room')}</title>`])[0];
const hide = (cfg.hide || []).length ? `<style>${cfg.hide.join(',')}{display:none!important}</style>` : '';
const room = {
  title: cfg.title || 'Copy room', langs: cfg.langs, primary: cfg.langs[0], langNames: cfg.langNames || {},
  rules: cfg.rules || [], legal: cfg.legal || null, groups: cfg.groups || {}, copy,
  htmlAttrs: attrMap(htmlAttrs), bodyAttrs: attrMap(bodyAttrs),
};
const page = [
  titleTag,
  keepHead.replace(/<title>[\s\S]*?<\/title>/i, ''),
  hide,
  `<style>${readFileSync(join(HERE, 'editor.css'), 'utf8')}</style>`,
  body,
  `<script>window.__ROOM=${JSON.stringify(room).replace(/</g, '\\u003c')};</script>`,
  `<script>${readFileSync(join(HERE, 'editor.js'), 'utf8')}</script>`,
].join('\n');
writeFileSync(join(out, 'index.html'), page);

// 6. report
const all = Object.keys(copy);
// a key the dictionary does not have means code changed the tagged string (toLowerCase, slicing)
for (const set of [placed, attrs, hidden]) for (const k of [...set]) if (!copy[k]) { set.delete(k); broken.push(`${k} (changed by code)`); }
const report = {
  keys: all.length, onPage: placed.size, attributes: [...attrs], hiddenOnly: [...hidden].filter((k) => !placed.has(k) && !attrs.has(k)),
  notRendered: all.filter((k) => !placed.has(k) && !attrs.has(k) && !hidden.has(k)), broken, assets: [...assets],
};
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(`copy room: ${out}/index.html`);
console.log(`  ${report.keys} keys · ${report.onPage} editable on the page · ${report.attributes.length} in attributes · ${report.hiddenOnly.length} only in title/scripts · ${report.notRendered.length} not rendered on this page`);
if (broken.length) console.log(`  broken markers (string split or nested by the code): ${broken.join(', ')}`);
console.log(`  ${assets.size} assets copied`);

function keysIn(s) { return [...s.matchAll(new RegExp(`${S}([A-Za-z0-9_.-]+)${M}`, 'g'))].map((m) => m[1]); }
function collect(s, set) { for (const k of keysIn(s)) set.add(k); }
function strip(s) { return s.replace(new RegExp(`${S}[A-Za-z0-9_.-]+${M}`, 'g'), '').replace(/[\uE000-\uE002]/g, ''); }
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function attrMap(s) { return Object.fromEntries([...s.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2] ?? ''])); }
