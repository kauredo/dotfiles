#!/usr/bin/env node
// Runs Hallmark's sloplint on pages that are not Hallmark builds and prints a
// short report. Defaults are calibrated on six real apps (2026-11-22):
//   - dropped: gates that only make sense for a Hallmark build or that
//     misread common stacks (see DROPPED)
//   - text-reading gates skip component sources (.svelte, .tsx, .jsx, .vue),
//     where they read template expressions as copy
//   - house-taste gates print as notes (see HOUSE_NOTES)
// sloplint writes `.hallmark/` (before record, URL screenshots, compare.html)
// into its working directory. This wrapper runs it from a cache folder per
// project, ~/.cache/build-ui-lint/<repo>-<hash>/, so nothing lands in the
// project (a `.hallmark/` there breaks `prettier --check .` and friends), and
// `--before` and `--kept` find the same record. Rendering an .html file directly
// still writes its shots beside that file.
//   --waive 47b,34@Base.astro
//                    drop findings the caller has a recorded reason for: a bare
//                    gate drops it everywhere, `gate@text` only where the
//                    finding's file or evidence contains that text (an approved
//                    redesign drop: `kept@rooms.html`). Rendered findings carry
//                    the URL as their file, so waive them by route (`44c@/faq`).
//                    The reason lives in the critique ledger, not in the CSS.
//   --depth full|restyle|polish
//                    a redesign: at restyle and polish the layout and spacing
//                    gates print as notes, the way a Hallmark stamp's
//                    `redesign:` field does. Gate 58 (words per
//                    screen) is a note at every depth, since the words are the
//                    owner's.
//   --doc            a document page (privacy, terms, docs, a changelog): the
//                    landing-page layout gates print as notes.
// Every other argument goes to sloplint unchanged. Exit 1 when a FAIL remains.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';

const SLOPLINT = join(homedir(), '.claude/skills/hallmark/scripts/sloplint.mjs');
const DROPPED = new Set([
  '20',  // no Hallmark stamp: fires on every page that is not a Hallmark build
  '85',  // reads the Hallmark stamp, and calls a sign-in form a stock email close
  'F18', // reads shadcn's data-slot="button" as an image slot
  '70',  // "success with no request": misses Convex/RPC calls, reads className strings
  '28a', // "lazy LCP image" counts the first image per component file
  '41',  // static dark-surface/text pairing; ignores theme-scoped tokens
]);
const TEXT_GATES = new Set(['19', '49', '50', '63']);
const COMPONENT_SOURCE = /\.(svelte|tsx|jsx|vue)$/;
// 24b: the 4px scale. 77: "thin section", which flags the short closing bands
// ANATOMY.md asks for. 26b: disabled-state styling, which fired on plain links and
// on pages with no control that can be disabled in three of six runs. 72: "text
// crowds the edge", which measured text inside closed <details> and cropped mockups.
const HOUSE_NOTES = ['24b', '77', '26b', '72'];
const LAYOUT = ['6b', '8', '9', '32', '42', '44a', '44c', '58', '77', '79'];
const SPACING = ['24b', '59', '78'];
const NOTES_BY_DEPTH = { full: ['58'], restyle: [...LAYOUT, ...SPACING], polish: [...LAYOUT, ...SPACING] };

const args = process.argv.slice(2);
const waived = new Set();
let depth = null;
let doc = false;
const pass = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--waive') { for (const g of (args[++i] || '').split(',')) if (g) waived.add(g.trim()); }
  else if (args[i] === '--depth') { depth = args[++i]; }
  else if (args[i] === '--doc') { doc = true; }
  else pass.push(args[i]);
}
if (depth && !NOTES_BY_DEPTH[depth]) { console.error('--depth must be full, restyle or polish'); process.exit(2); }
const VALUE_FLAGS = new Set(['--url', '--scope', '--genre', '--stage', '--tier']);
const paths = pass.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.has(pass[i - 1]));
if (!paths.length) {
  console.error('usage: lint.mjs <src-dir-or-file ...> [--render] [--url http://localhost:PORT/route ...] [--scope page|component|app] [--before | --kept] [--depth full|restyle|polish] [--doc] [--waive 47b,34@Base.astro]');
  process.exit(2);
}

// Paths are made absolute; sloplint then runs from the cache folder of the first one's repo.
const missing = paths.filter((p) => !existsSync(resolve(p)));
if (missing.length) { console.error(`not found from ${process.cwd()}: ${missing.join(', ')}. Pass absolute paths or run from the project.`); process.exit(2); }
const absPass = pass.map((a, i) => (paths.includes(a) && !VALUE_FLAGS.has(pass[i - 1]) ? resolve(a) : a));
const first = resolve(paths[0]);
const startDir = existsSync(first) && statSync(first).isDirectory() ? first : dirname(first);
const top = spawnSync('git', ['-C', startDir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
const root = top.status === 0 ? top.stdout.trim() : startDir;
const cwd = join(homedir(), '.cache', 'build-ui-lint', `${basename(root)}-${createHash('sha1').update(root).digest('hex').slice(0, 8)}`);
mkdirSync(cwd, { recursive: true });

const run = spawnSync(process.execPath, [SLOPLINT, ...absPass, '--json'], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (run.error) { console.error(`sloplint did not run: ${run.error.message}`); process.exit(2); }
for (const l of run.stderr.split('\n')) if (l.trim()) console.error(l);

let report;
try { report = JSON.parse(run.stdout); }
catch { process.stdout.write(run.stdout); process.exit(run.status ?? 2); }

const noted = new Set([...HOUSE_NOTES, ...(depth ? NOTES_BY_DEPTH[depth] : []), ...(doc ? LAYOUT : [])]);
const order = { FAIL: 0, REFLEX: 1, WARN: 2 };
const live = (report.findings || []).filter((f) => {
  const g = String(f.gate);
  if (!(f.grade in order) || DROPPED.has(g)) return false;
  for (const w of waived) {
    const [wg, where] = w.split('@');
    if (wg === g && (!where || String(f.file || '').includes(where) || String(f.evidence || '').includes(where))) return false;
  }
  if (TEXT_GATES.has(g) && COMPONENT_SOURCE.test(f.file || '')) return false;
  return true;
});
const findings = live.filter((f) => !noted.has(String(f.gate))).sort((a, b) => order[a.grade] - order[b.grade]);
const notes = live.filter((f) => noted.has(String(f.gate)));
const count = (g) => findings.filter((f) => f.grade === g).length;

const line = (f) => {
  const where = f.file ? `${/^https?:/.test(f.file) ? f.file : relative(process.cwd(), f.file) || f.file}${f.line ? `:${f.line}` : ''}` : '';
  return `${String(f.gate).padEnd(4)} ${where}  ${f.evidence}${f.fix ? `  | fix: ${f.fix}` : ''}`;
};
console.log(`lint: ${count('FAIL')} FAIL, ${count('REFLEX')} REFLEX, ${count('WARN')} WARN` +
  (notes.length ? `, ${notes.length} notes` : '') +
  (waived.size ? `, waived ${[...waived].join(',')}` : '') +
  `, render ${report.summary?.render ?? 'off'}, records in ${join(cwd, '.hallmark')}`);
if (report.summary?.before) console.log(report.summary.before);
if (report.summary?.kept) console.log(report.summary.kept.replace(/; before \d+ FAIL.*$/, '')); // its counts are sloplint's raw ones, before this wrapper's filters
const compare = join(cwd, '.hallmark', 'compare.html');
if (pass.includes('--kept') && existsSync(compare)) console.log(`compare: ${compare}`);
for (const f of findings) {
  if (String(f.gate) === 'kept') f.fix = 'Restore each one, or after the user approves the drop, waive it with --waive kept@<item> and give their reason in the handoff';
  console.log(`${f.grade.padEnd(6)} ${line(f)}`);
}
for (const f of notes) console.log(`note   ${line(f)}`);
process.exit(count('FAIL') ? 1 : 0);
