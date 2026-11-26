import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runTells, parseColor, toOklch } from './tells.mjs';

const fixture = (p) => fileURLToPath(new URL(`./test-fixtures/${p}`, import.meta.url));
const LINT = fileURLToPath(new URL('./lint.mjs', import.meta.url));
const of = (findings, gate, grade) => findings.filter((f) => f.gate === gate && (!grade || f.grade === grade));
const fires = (findings, gate, grade, re) => {
  const hits = of(findings, gate, grade).filter((f) => !re || re.test(`${f.file}:${f.line} ${f.evidence}`));
  assert.ok(hits.length, `${gate}${grade ? ` ${grade}` : ''}${re ? ` ${re}` : ''} did not fire; got:\n${findings.map((f) => `${f.gate} ${f.grade} ${f.file}:${f.line} ${f.evidence}`).join('\n')}`);
  return hits;
};

test('html fixture: second CTA, cream + clay, fragments, pricing, proof, lavender', () => {
  const f = runTells([fixture('html')]);
  fires(f, 'T1', 'FAIL', /index\.html:16 .*Learn more/);
  assert.equal(of(f, 'T1').filter((x) => /arrow/.test(x.evidence)).length, 0, 'gate 63 owns arrows in .html');
  fires(f, 'T2', 'FAIL', /--color-paper.*--color-accent|--color-accent.*--color-paper/);
  assert.equal(fires(f, 'T3', 'FAIL').length, 4);
  fires(f, 'T4', 'FAIL', /index\.html:34/);
  fires(f, 'T5', 'FAIL', /★/);
  fires(f, 'T5', 'FAIL', /2,500\+ teams/);
  fires(f, 'T6', 'WARN', /styles\.css:11/);
});

test('tsx fixture: arrow and stock CTA on a component, indigo CTA, lavender classes', () => {
  const f = runTells([fixture('tsx')]);
  fires(f, 'T1', 'FAIL', /Landing\.tsx:27 .*arrow/);
  fires(f, 'T1', 'FAIL', /Landing\.tsx:27 .*Learn more/);
  fires(f, 'T2', 'REFLEX', /#F4F1EA/i);
  assert.equal(fires(f, 'T3', 'FAIL').length, 3);
  fires(f, 'T4', 'FAIL', /Landing\.tsx:47/);
  fires(f, 'T5', 'FAIL', /Landing\.tsx:22/);
  fires(f, 'T6', 'FAIL', /bg-indigo-600/);
  fires(f, 'T6', 'WARN', /from-violet-100/);
});

test('svelte fixture: arrow icon, Explore, stars, violet CTA', () => {
  const f = runTells([fixture('svelte')]);
  fires(f, 'T1', 'FAIL', /Hero\.svelte:11 .*arrow/);
  fires(f, 'T1', 'FAIL', /Hero\.svelte:12 .*Explore/);
  fires(f, 'T5', 'FAIL', /Hero\.svelte:8/);
  fires(f, 'T6', 'FAIL', /bg-violet-600/);
});

test('astro fixture: highlighted tier, glued arrow, one fragment headline', () => {
  const f = runTells([fixture('astro')]);
  fires(f, 'T4', 'FAIL', /Pricing\.astro:20/);
  fires(f, 'T1', 'FAIL', /Pricing\.astro:28 .*arrow/);
  fires(f, 'T3', 'WARN', /Simple pricing/);
});

test('locale fixtures: json, ts and Rails yml headlines; English only', () => {
  const f = runTells([fixture('locale')]);
  const t3 = fires(f, 'T3', 'FAIL');
  const where = t3.map((x) => `${x.file.split('/test-fixtures/')[1]}:${x.line}`).sort();
  assert.deepEqual(where, [
    'locale/config/locales/en.yml:3',
    'locale/config/locales/en.yml:4',
    'locale/i18n/en.ts:3',
    'locale/locales/en.json:3',
    'locale/locales/en.json:7',
  ]);
  fires(f, 'T5', 'FAIL', /en\.json:11 .*2,500\+ coaches/);
});

test('tailwind.config: clay primary on cream background', () => {
  const f = runTells([fixture('tailwind')]);
  fires(f, 'T2', 'FAIL', /#F5EFE6.*#C2410C|#C2410C.*#F5EFE6/i);
});

test('hsl channel triplets resolve', () => {
  const f = runTells([fixture('triplet')]);
  fires(f, 'T2', 'FAIL', /--background.*--primary/);
});

test('data-driven pricing: featured flag read in a className', () => {
  const f = runTells([fixture('pricing-data')]);
  fires(f, 'T4', 'FAIL', /PricingCards\.tsx:10 .*plan\.featured/);
});

test('clean fixture has no T findings', () => {
  const f = runTells([fixture('clean')]);
  assert.deepEqual(f.map((x) => `${x.gate} ${x.file}:${x.line} ${x.evidence}`), []);
});

test('colour parsing: channel triplets and oklch', () => {
  const rgb = toOklch(parseColor('184 92 58', 'rgb'));
  assert.ok(rgb.H > 30 && rgb.H < 45 && rgb.C > 0.1, JSON.stringify(rgb));
  const hsl = toOklch(parseColor('40 38% 95%', 'hsl'));
  assert.ok(hsl.L > 0.9 && hsl.H > 55 && hsl.H < 105, JSON.stringify(hsl));
  assert.deepEqual(toOklch(parseColor('oklch(62% 0.14 40)')), { L: 0.62, C: 0.14, H: 40 });
  const white = toOklch(parseColor('#fff'));
  assert.ok(white.L > 0.99 && white.C < 0.001);
});

test('lint.mjs merges T findings and honours --waive', () => {
  const run = (...a) => spawnSync(process.execPath, [LINT, ...a], { encoding: 'utf8', timeout: 120000 });
  const loud = run(fixture('tsx'));
  assert.match(loud.stdout, /^FAIL +T4 /m);
  assert.equal(loud.status, 1);
  const waived = run(fixture('tsx'), '--waive', 'T4@Landing');
  assert.doesNotMatch(waived.stdout, / T4 /);
  const clean = run(fixture('clean'));
  assert.doesNotMatch(clean.stdout, /^\w+ +T\d /m);
});
