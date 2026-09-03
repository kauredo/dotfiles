#!/usr/bin/env node
/**
 * Capture harness for /app-critique.
 *
 * Chrome's own --screenshot flag never applies a page's meta viewport tag, so
 * mobile captures taken that way crop a desktop layout and every site looks
 * broken. Everything here goes through Playwright device emulation instead.
 *
 *   node app-capture.js --url https://example.com --name myapp --out /tmp/shots
 *
 * Options:
 *   --routes /a,/b   capture these paths instead of discovering them
 *   --max 8          cap on discovered routes (default 6)
 *   --control        also shoot stripe.com through the identical recipe
 *   --login /login --user a@b.c --pass secret
 *                    sign in first (fills the first email and password fields on
 *                    that path, submits, keeps the session for every capture)
 */

const fs = require('fs');
const path = require('path');

const PW = [
  '/Users/kauredo/code/personal/basketball-stats-app/node_modules/playwright-core',
  'playwright-core',
  'playwright',
];
let chromium, devices;
for (const p of PW) {
  try { ({ chromium, devices } = require(p)); break; } catch (e) { /* keep looking */ }
}
if (!chromium) {
  console.error('playwright-core not found. Checked:\n  ' + PW.join('\n  '));
  process.exit(1);
}

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const has = flag => process.argv.includes(flag);

const BASE = arg('--url');
const NAME = arg('--name', 'app');
const OUT = arg('--out', `/tmp/${NAME}-shots`);
const MAX = parseInt(arg('--max', '6'), 10);
const ROUTES_ARG = arg('--routes');

if (!BASE) { console.error('--url is required'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const DESKTOP = { width: 1440, height: 900 };
const PHONE = 'iPhone 14 Pro';
const report = { app: NAME, base: BASE, captured: new Date().toISOString(), routes: [], notes: [] };

/** Scroll the whole page in steps so IntersectionObserver reveals fire, then return to the top.
 *  Without this, anything that animates in on scroll is captured at opacity 0 and reads as absent. */
async function wakeReveals(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    const end = document.documentElement.scrollHeight;
    for (let y = 0; y < end; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 420));
  });
}

/** A dashboard shell is often 100vh with the content scrolling inside a pane, so the
 *  document never grows and fullPage captures one screen. Find the pane that actually
 *  scrolls and let it grow, so the whole page exists to be captured. Returns true when
 *  it did something, so the caller can say so in capture.json. */
async function unshell(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    if (doc.scrollHeight > window.innerHeight + 80) return false;
    let best = null, bestDelta = 0;
    for (const el of document.querySelectorAll('main, div, section')) {
      const d = el.scrollHeight - el.clientHeight;
      const oy = getComputedStyle(el).overflowY;
      if (d > bestDelta && (oy === 'auto' || oy === 'scroll')) { best = el; bestDelta = d; }
    }
    if (!best || bestDelta < 80) return false;
    for (let el = best; el && el !== document.body; el = el.parentElement) {
      el.style.height = 'auto';
      el.style.maxHeight = 'none';
      el.style.minHeight = '0';
      el.style.overflow = 'visible';
    }
    document.body.style.height = 'auto';
    document.body.style.overflow = 'visible';
    return true;
  });
}

/** A fixed or sticky header gets stitched into a full-page capture at whatever
 *  scroll offset it last had, painting over content mid-page. Pin it in flow once. */
async function pinStickyChrome(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('header, nav, [class*="header" i], [class*="navbar" i], [class*="sticky" i], [class*="fixed" i], [class*="cookie" i], [class*="consent" i], [class*="banner" i]')) {
      const s = getComputedStyle(el);
      if (/cookie|consent|banner/i.test(el.className) && (s.position === 'fixed' || s.position === 'sticky')) {
        el.style.display = 'none';
        continue;
      }
      // Sticky elements are already in flow: static keeps their width. Making them
      // absolute frees a horizontal strip from its container and widens the page,
      // which then reads as overflow that the live site does not have.
      if (s.position === 'sticky') {
        el.style.position = 'static';
        el.style.transform = 'none';
        el.style.transition = 'none';
      } else if (s.position === 'fixed') {
        const r = el.getBoundingClientRect();
        el.style.position = 'absolute';
        el.style.top = `${r.top + window.scrollY}px`;
        el.style.left = `${r.left}px`;
        el.style.width = `${r.width}px`;
        el.style.transform = 'none';
        el.style.transition = 'none';
      }
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
}

async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    const clipped = [];
    let stillHidden = 0;
    // A card inside a horizontal carousel legitimately extends past the viewport.
    // Only count an element as clipped when no ancestor is an intentional scroller.
    const inScroller = el => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if ((ox === 'auto' || ox === 'scroll' || ox === 'hidden') && p.scrollWidth > p.clientWidth + 4) return true;
      }
      return false;
    };
    for (const el of document.querySelectorAll('a,button,h1,h2,h3,p,img,span,input,section,div')) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.left >= 0 && r.left < vw && r.right > vw + 1 && el.matches('a,button,h1,h2,p,img,input') && !inScroller(el)) {
        clipped.push({
          tag: el.tagName,
          text: (el.innerText || '').trim().slice(0, 32).replace(/\s+/g, ' '),
          cut: Math.round(r.right - vw),
        });
      }
      if (r.height > 20 && parseFloat(getComputedStyle(el).opacity) < 0.05) stillHidden++;
    }
    return {
      pageHeight: doc.scrollHeight,
      viewportWidth: vw,
      overflow: doc.scrollWidth - doc.clientWidth,
      clipped: clipped.slice(0, 8),
      stillHiddenAfterScroll: stillHidden,
      title: document.title,
    };
  });
}

async function discoverRoutes(page) {
  if (ROUTES_ARG) return ROUTES_ARG.split(',').map(s => s.trim());
  const found = await page.evaluate(() => {
    const seen = new Map();
    // nav links first: they are what the site itself considers important
    const inNav = new Set();
    for (const a of document.querySelectorAll('header a[href], nav a[href]')) inNav.add(a.href);
    for (const a of document.querySelectorAll('a[href]')) {
      try {
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin) continue;
        if (u.pathname === '/' || /\.(png|jpe?g|pdf|svg|zip|dmg)$/i.test(u.pathname)) continue;
        if (!seen.has(u.pathname)) seen.set(u.pathname, inNav.has(a.href) ? 0 : 1);
      } catch (e) { /* skip */ }
    }
    return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(e => e[0]);
  });
  return ['/', ...found.slice(0, MAX - 1)];
}

/** Hover the primary action, focus the first field, open the mobile menu.
 *  Static shots never show whether anything reacts to being used. */
async function interactionStates(ctx, url, slug) {
  const shots = [];
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1200);

    const cta = page.locator('a,button').filter({ hasText: /get started|sign up|start|request|download|try|book|reservar|entrar|criar/i }).first();
    if (await cta.count()) {
      await cta.hover({ timeout: 4000 });
      await page.waitForTimeout(450);
      const f = path.join(OUT, `${slug}-hover.png`);
      await page.screenshot({ path: f });
      shots.push({ kind: 'hover on primary action', file: path.basename(f) });
    }

    const input = page.locator('input:visible').first();
    if (await input.count()) {
      await input.focus({ timeout: 4000 });
      await page.waitForTimeout(350);
      const f = path.join(OUT, `${slug}-focus.png`);
      await page.screenshot({ path: f });
      shots.push({ kind: 'focus ring on first field', file: path.basename(f) });
    }
  } catch (e) {
    report.notes.push(`${slug}: interaction states failed, ${e.message.split('\n')[0]}`);
  }
  await page.close();
  return shots;
}

async function mobileMenu(browser, url, slug) {
  const ctx = await browser.newContext({ ...devices[PHONE] });
  const page = await ctx.newPage();
  const shots = [];
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1000);
    // Prefer an explicit label, then aria-expanded, then anything in the header;
    // and skip zero-size matches, or the first hit is a hidden language switcher.
    const burger = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="abrir" i], button[aria-label*="open" i], ' +
      'button[aria-label*="nav" i], button[aria-expanded], [class*="hamburger" i], header button, nav button'
    ).filter({ has: page.locator(':scope') }).locator('visible=true').first();
    const box = (await burger.count()) ? await burger.boundingBox() : null;
    if (box && box.width > 16 && box.height > 16) {
      await burger.click({ timeout: 4000 });
      await page.waitForTimeout(650);
      const f = path.join(OUT, `${slug}-mobile-menu.png`);
      await page.screenshot({ path: f });
      shots.push({ kind: 'mobile navigation opened', file: path.basename(f) });
    } else {
      report.notes.push(`${slug}: no mobile menu trigger found`);
    }
  } catch (e) {
    report.notes.push(`${slug}: mobile menu failed, ${e.message.split('\n')[0]}`);
  }
  await ctx.close();
  return shots;
}

/** Three frames across the first 1.6s. A single still cannot tell a paused hero
 *  from a static one, and cannot show what a load sequence does. */
async function motionFrames(browser, url, slug) {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();
  const shots = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    for (const [i, wait] of [120, 500, 1000].entries()) {
      await page.waitForTimeout(wait);
      const f = path.join(OUT, `${slug}-motion-${i + 1}.png`);
      await page.screenshot({ path: f });
      shots.push({ kind: `load frame ${i + 1}`, file: path.basename(f) });
    }
  } catch (e) {
    report.notes.push(`${slug}: motion frames failed, ${e.message.split('\n')[0]}`);
  }
  await ctx.close();
  return shots;
}

async function captureRoute(browser, url, slug) {
  const entry = { url, slug, shots: [] };

  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1200);
  entry.unshelled = await unshell(page);
  await wakeReveals(page);
  entry.desktop = await measure(page);

  // Tiles first, with the real sticky header in place, so they show the page as used.
  const tiles = Math.min(5, Math.ceil(entry.desktop.pageHeight / 900));
  for (let i = 0; i < tiles; i++) {
    await page.evaluate(y => window.scrollTo(0, y), i * 900);
    await page.waitForTimeout(420);
    const f = path.join(OUT, `${slug}-desktop-${i + 1}.png`);
    await page.screenshot({ path: f });
    entry.shots.push({ kind: `desktop, screen ${i + 1} of ${tiles}`, file: path.basename(f) });
  }

  await pinStickyChrome(page);
  const full = path.join(OUT, `${slug}-desktop-full.png`);
  await page.screenshot({ path: full, fullPage: true });
  entry.shots.push({ kind: 'desktop, whole page', file: path.basename(full) });
  await ctx.close();

  const mctx = await browser.newContext({ ...devices[PHONE] });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await mpage.waitForTimeout(1200);
  await unshell(mpage);
  await wakeReveals(mpage);
  entry.mobile = await measure(mpage);
  await pinStickyChrome(mpage);
  const mfull = path.join(OUT, `${slug}-mobile-full.png`);
  await mpage.screenshot({ path: mfull, fullPage: true });
  entry.shots.push({ kind: 'phone, whole page', file: path.basename(mfull) });
  await mctx.close();

  entry.shots.push(...await interactionStates(await browser.newContext({ viewport: DESKTOP }), url, slug));
  entry.shots.push(...await mobileMenu(browser, url, slug));

  return entry;
}

/** Sign in once and carry the cookies into every later context. */
async function signIn(browser) {
  const loginPath = arg('--login');
  if (!loginPath) return;
  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();
  await page.goto(new URL(loginPath, BASE).href, { waitUntil: 'networkidle', timeout: 45000 });
  await page.locator('input[type="email"], input[name*="email" i], input[type="text"]').first().fill(arg('--user'));
  await page.locator('input[type="password"]').first().fill(arg('--pass'));
  await Promise.all([
    page.waitForURL(u => !u.pathname.startsWith(loginPath), { timeout: 15000 }).catch(() => {}),
    page.locator('input[type="password"]').first().press('Enter'),
  ]);
  await page.waitForTimeout(1500);
  const landed = page.url();
  const state = path.join(OUT, 'state.json');
  await ctx.storageState({ path: state });
  await ctx.close();
  // Every context from here on starts signed in.
  const plain = browser.newContext.bind(browser);
  browser.newContext = o => plain({ ...o, storageState: state });
  report.signedIn = { as: arg('--user'), landed };
  console.log(`signed in as ${arg('--user')}, landed on ${new URL(landed).pathname}`);
}

(async () => {
  const browser = await chromium.launch();
  await signIn(browser);

  const probe = await browser.newContext({ viewport: DESKTOP });
  const ppage = await probe.newPage();
  await ppage.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  await ppage.waitForTimeout(1000);
  const routes = await discoverRoutes(ppage);
  await probe.close();

  console.log(`${NAME}: ${routes.length} routes`);

  for (const r of routes) {
    const url = new URL(r, BASE).href;
    const slug = r === '/' ? 'home' : r.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40);
    try {
      const entry = await captureRoute(browser, url, slug);
      report.routes.push(entry);
      const m = entry.desktop;
      console.log(
        `  ${slug.padEnd(22)} ${String(m.pageHeight).padStart(6)}px  ` +
        `overflow ${entry.mobile.overflow}  clipped ${entry.mobile.clipped.length}  ` +
        `shots ${entry.shots.length}`
      );
    } catch (e) {
      report.notes.push(`${slug}: capture failed, ${e.message.split('\n')[0]}`);
      console.log(`  ${slug.padEnd(22)} FAILED`);
    }
  }

  // Motion frames only for the landing route; a load sequence repeats across a site.
  report.motion = await motionFrames(browser, BASE, 'home');

  if (has('--control')) {
    const ctx = await browser.newContext({ ...devices[PHONE] });
    const page = await ctx.newPage();
    await page.goto('https://stripe.com', { waitUntil: 'networkidle', timeout: 45000 });
    report.control = await measure(page);
    console.log(`  control stripe.com     overflow ${report.control.overflow}  clipped ${report.control.clipped.length}`);
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'capture.json'), JSON.stringify(report, null, 2));
  const total = report.routes.reduce((n, r) => n + r.shots.length, 0) + (report.motion?.length || 0);
  console.log(`\n${total} images and capture.json in ${OUT}`);
  if (report.notes.length) console.log('notes:\n  ' + report.notes.join('\n  '));
})();
