#!/usr/bin/env node
// Record a scripted browser flow as video with Playwright's recordVideo.
// Usage: node record.mjs --steps steps.json [--url URL] [--out file] [--size 1280x720]
//        [--slow 400] [--hook .agents/demo-video.mjs] [--headed] [--dry]
// Run it from the target project so Playwright resolves from its node_modules.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const { values: a } = (await import('node:util')).parseArgs({
  options: {
    steps: { type: 'string' }, url: { type: 'string' }, out: { type: 'string' },
    size: { type: 'string', default: '1280x720' }, slow: { type: 'string', default: '400' },
    hook: { type: 'string', default: process.env.DEMO_VIDEO_HOOK || '.agents/demo-video.mjs' },
    headed: { type: 'boolean', default: false }, dry: { type: 'boolean', default: false },
  },
});
if (!a.steps) { console.error('missing --steps <file.json>'); process.exit(2); }

function loadPlaywright() {
  const tries = [process.cwd() + '/'];
  try { tries.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim() + '/'); } catch {}
  for (const base of tries) {
    try { return createRequire(base)('playwright'); } catch {}
  }
  console.error('Playwright not found in this project or globally. Install: npm i -D playwright');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const [width, height] = a.size.split('x').map(Number);
const viewport = { width, height };
const slow = Number(a.slow);
const steps = JSON.parse(readFileSync(a.steps, 'utf8'));
const work = join(tmpdir(), `demo-video-${Date.now()}`);
mkdirSync(work, { recursive: true });
const base = a.url || 'http://localhost:3000';
const abs = (u) => new URL(u, base).href;

// Caption overlay: fixed, bottom, click-through, one at a time. An init script
// re-adds the helper after every navigation.
const overlay = () => {
  window.__caption = (text, ms) => {
    document.getElementById('__cap')?.remove();
    const el = document.createElement('div');
    el.id = '__cap';
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);max-width:80%;' +
      'padding:10px 18px;border-radius:8px;background:rgba(0,0,0,.82);color:#fff;font:600 20px/1.3 system-ui,sans-serif;' +
      'z-index:2147483647;pointer-events:none;text-align:center';
    (document.body || document.documentElement).appendChild(el);
    setTimeout(() => el.remove(), ms);
  };
};

const browser = await chromium.launch({ headless: !a.headed, executablePath: process.env.DEMO_VIDEO_CHROMIUM || undefined }).catch((e) => {
  console.error(`${e.message.split('\n')[0]}\nIf Chromium is missing: npx playwright install chromium`);
  process.exit(2);
});

// Sign-in runs in its own context so it is never filmed; its storage state carries over.
let storageState;
if (existsSync(a.hook)) {
  try {
    const mod = await import(pathToFileURL(resolve(a.hook)).href);
    const ctx = await browser.newContext({ viewport });
    await mod.login(await ctx.newPage(), { url: base });
    storageState = await ctx.storageState();
    await ctx.close();
  } catch (e) { console.error(`login hook failed: ${e.message}`); await browser.close(); process.exit(1); }
}

const context = await browser.newContext({
  viewport, storageState,
  ...(a.dry ? {} : { recordVideo: { dir: work, size: viewport } }),
});
context.setDefaultTimeout(10000);
await context.addInitScript(overlay);
const page = await context.newPage();

let failed = null;
for (const [i, s] of steps.entries()) {
  try {
    if (s.op === 'goto') { await page.goto(abs(s.url ?? '/')); if (s.ready) await page.waitForSelector(s.ready); }
    else if (s.op === 'click') await page.click(s.selector);
    else if (s.op === 'fill') await page.fill(s.selector, s.text);
    else if (s.op === 'press') await page.keyboard.press(s.key);
    else if (s.op === 'wait') typeof s.ms === 'number' ? await page.waitForTimeout(s.ms) : await page.waitForSelector(s.selector);
    else if (s.op === 'scroll') s.selector
      ? await page.locator(s.selector).scrollIntoViewIfNeeded()
      : await page.mouse.wheel(0, s.y ?? 400);
    else if (s.op === 'caption') {
      const ms = s.ms ?? 2500;
      await page.evaluate(([t, d]) => window.__caption(t, d), [s.text, ms]);
      await page.waitForTimeout(ms);
    } else throw new Error(`unknown op "${s.op}"`);
    if (a.dry) await page.screenshot({ path: join(work, `step-${String(i + 1).padStart(2, '0')}.png`) });
    await page.waitForTimeout(slow);
  } catch (e) {
    failed = { i: i + 1, op: s.op, selector: s.selector, msg: e.message.split('\n')[0] };
    await page.screenshot({ path: join(work, 'failure.png') }).catch(() => {});
    break;
  }
}

await context.close(); // flushes the video file
await browser.close();

if (failed) {
  console.error(`FAILED at step ${failed.i} (${failed.op}${failed.selector ? ` ${failed.selector}` : ''}): ${failed.msg}`);
  console.error(`screenshot: ${join(work, 'failure.png')}`);
}
if (a.dry) { console.log(`dry run ${failed ? 'stopped' : 'ok'}; screenshots in ${work}`); process.exit(failed ? 1 : 0); }

const webm = readdirSync(work).find((f) => f.endsWith('.webm'));
if (!webm || statSync(join(work, webm)).size === 0) { console.error('no video was written'); process.exit(1); }
let out = resolve(a.out || join(work, 'demo.webm')).replace(/\.(mp4|webm)$/, '');
mkdirSync(dirname(out), { recursive: true });
const rawPath = `${out}.webm`;
renameSync(join(work, webm), rawPath);
out = rawPath;
try {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', rawPath.replace(/\.webm$/, '.mp4')]);
  out = rawPath.replace(/\.webm$/, '.mp4');
} catch { console.error('mp4 skipped (ffmpeg missing or failed); keeping webm'); }
console.log(`${out} (${(statSync(out).size / 1024).toFixed(0)} KB)`);
process.exit(failed ? 1 : 0);
