#!/usr/bin/env node
// Sweeps every surface in ~/.claude/portfolio.md for generated-site tells and
// prints one Markdown table per checker:
//   - each deployed URL through `impeccable detect` at desktop and phone width
//   - each repo's source through lint.mjs (sloplint plus the T checks)
//   --urls-only | --repos-only    run one half
//   --only <text>                 surfaces whose product, surface or repo contains <text>
//   --out <file>                  also write the report there
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOME = homedir();
const LINT = join(dirname(fileURLToPath(import.meta.url)), 'lint.mjs');
const DETECT = join(HOME, '.claude/skills/impeccable/scripts/impeccable');
const MANIFEST = join(HOME, '.claude/portfolio.md');
const SKIP = new Set(['node_modules', 'dist', 'build', '.next', '.astro', '.svelte-kit', 'coverage', 'vendor', '.git', 'tmp', 'public']);

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const value = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const only = value('--only')?.toLowerCase();

const rows = readFileSync(MANIFEST, 'utf8').split('\n')
  .filter((l) => l.startsWith('| ') && !/^\|\s*(Product|---)/.test(l))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .filter((c) => c.length >= 5)
  .map((c) => ({ product: c[0], surface: c[1], render: c[3], repo: c[c.length - 1] }))
  .filter((r) => !only || `${r.product} ${r.surface} ${r.repo}`.toLowerCase().includes(only));

const repoPath = (r) => {
  const m = r.match(/^(personal|upspeech)\/(\S+)/);
  return m ? join(HOME, 'code', m[1], m[2]) : null;
};

// Source roots worth linting: every `src` dir down to depth 3, plus Rails views and locales.
function sourceRoots(root) {
  const found = [];
  const walk = (dir, depth) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name) || name.startsWith('.')) continue;
      const p = join(dir, name);
      if (!statSync(p).isDirectory()) continue;
      if (name === 'src') { found.push(p); continue; }
      if (depth < 3) walk(p, depth + 1);
    }
  };
  walk(root, 0);
  for (const extra of ['app/views', 'config/locales', 'views']) if (existsSync(join(root, extra))) found.push(join(root, extra));
  return found;
}

const out = [];
const print = (s = '') => { out.push(s); console.log(s); };

if (!flag('--repos-only')) {
  print('## Deployed URLs (impeccable detect)\n');
  print('| Surface | URL | Desktop | Phone |');
  print('|---|---|---|---|');
  for (const r of rows.filter((x) => /^https?:/.test(x.render))) {
    const scan = (extra) => {
      const run = spawnSync(DETECT, ['detect', '--json', ...extra, r.render], { encoding: 'utf8', timeout: 180000, maxBuffer: 32 * 1024 * 1024 });
      try {
        const counts = {};
        for (const f of JSON.parse(run.stdout || '[]')) if (f.category !== 'quality') counts[f.antipattern] = (counts[f.antipattern] || 0) + 1;
        return Object.entries(counts).map(([k, n]) => `${k}${n > 1 ? ` ×${n}` : ''}`).join(', ') || 'clean';
      } catch { return `failed (${run.status ?? run.signal})`; }
    };
    print(`| ${r.product}: ${r.surface} | ${r.render} | ${scan([])} | ${scan(['--viewport', '390x844'])} |`);
  }
  print();
}

if (!flag('--urls-only')) {
  print('## Source (lint.mjs, tell gates)\n');
  print('| Repo | Tell findings |');
  print('|---|---|');
  const TELL_GATES = /^(T\d|54|67|30a|65|63|19|46a|74|2a)$/;
  const seen = new Set();
  for (const r of rows) {
    const root = repoPath(r.repo);
    if (!root || seen.has(root) || !existsSync(root)) continue;
    seen.add(root);
    const roots = sourceRoots(root);
    if (!roots.length) { print(`| ${r.repo} | no source roots found |`); continue; }
    const run = spawnSync(process.execPath, [LINT, ...roots], { encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
    const counts = {};
    for (const l of (run.stdout || '').split('\n')) {
      const m = l.match(/^(FAIL|REFLEX|WARN)\s+(\S+)/);
      if (m && TELL_GATES.test(m[2])) counts[`${m[2]} ${m[1]}`] = (counts[`${m[2]} ${m[1]}`] || 0) + 1;
    }
    const cell = Object.entries(counts).sort().map(([k, n]) => `${k}${n > 1 ? ` ×${n}` : ''}`).join(', ');
    print(`| ${r.repo} | ${run.status === null ? 'timed out' : cell || 'clean'} |`);
  }
}

const file = value('--out');
if (file) writeFileSync(file, out.join('\n') + '\n');
