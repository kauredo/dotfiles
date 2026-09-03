Rate a whole portfolio of apps at once: one leaderboard across every surface, a
brand verdict per product, and a count of which AI tells repeat. Use when
critiquing more than one project, comparing the surfaces of one product, or
ranking apps against each other.

**First**: read `/critique`. Every per-surface judgment here runs that rubric
unchanged, and Step 1 below reuses its screenshot recipe. This command adds the
two things a portfolio needs and a single critique cannot give you: a **brand**
pass comparing the surfaces of one product against each other, and a **blind
ranking** that puts every surface in one order.

A **surface** is one thing a person looks at. A marketing site, an app, a
backoffice, a phone screen, a desktop window. Products have several, and each
one gets rated on its own.

## Step 0: Resolve the manifest

Read `~/.claude/portfolio.md`. Every surface has a render target, a genre, and
an `Interior` value saying whether its URL reaches the real product or stops at
a login.

Regenerate when the user asks, when a surface 404s, or when a new project ships:

```bash
vercel project ls --scope kauredos-projects            # deployed URLs, page 1
vercel project ls --scope kauredos-projects --next <n> # until it returns empty
ls ~/code/personal                                     # repos with no deploy
```

Read `package.json` scripts or the `Gemfile` for the boot command of anything
Vercel does not host. Write the table back to
`~/code/dotfiles/claude/portfolio.md`, which is the symlink target.

Confirm with the user before regenerating. `Interior` and the `Skipped` table
hold answers that cost a render to learn, and a blind regenerate discards them.

**Done when** every surface has a render target and a genre.

## Step 1: Render every surface

**Desktop** follows `/critique` Step 0: headless Chrome, one scratch profile,
check for the file afterwards rather than trusting the exit code. Add
`--virtual-time-budget=9000` so client-rendered apps finish painting before the
shot. Save to one run directory as `$OUT/<surface>-desktop.png` at 1440x900.

**Mobile needs Playwright, not Chrome's `--screenshot`.** Chrome's CLI capture
path never applies the page's meta viewport tag, so `--window-size=390,844`
lays the page out wide and crops it at 390. Every surface then looks like it
has horizontal overflow, right padding gone and text cut mid-word, and a critic
reports that as a bug on all of them. Use Playwright with a real device profile,
which applies the viewport tag and reports true overflow:

```js
const { chromium, devices } = require('playwright-core');
const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'] });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
const d = await page.evaluate(() => {
  const e = document.documentElement;
  return { scroll: e.scrollWidth, client: e.clientWidth };
});           // scroll > client is real overflow, and now you can prove it
await page.screenshot({ path: `${OUT}/${name}-mobile.png` });
```

Playwright lives in `~/code/personal/basketball-stats-app/node_modules`, with
browsers cached under `~/Library/Caches/ms-playwright`.

**Shoot one control surface every run**, a site built by people with money and
taste (stripe.com works). It goes through the identical recipe and never reaches
a critic. When the control shows the same defect the portfolio shows, the defect
is in the capture. Fifteen surfaces reporting one identical layout bug is the
signature of a broken recipe, not of fifteen broken sites.

Record `scrollWidth` and `clientWidth` per surface and carry the numbers into
the report. Overflow is then a measurement rather than an impression.

The three that are not a URL:

- **`local:node`, `local:rails`**: boot the manifest's dev script, wait for the
  port, screenshot, stop the server you started. Anything needing env vars or a
  seeded database that does not answer within 60 seconds goes on the failure
  list, and you move to the next surface.
- **`local:expo`**: build to a simulator with XcodeBuildMCP and use its
  `screenshot` tool. Expo's web target lays out differently than the phone does,
  so it is the fallback, and a shot taken that way is labelled as such in the
  report.
- **`local:electron`**: the renderer is a web app, so run its own dev server and
  shoot it like any other web surface. Failing that, launch the packaged app and
  capture the window with `screencapture -o -l <window-id>`. This is the least
  reliable path here.

**Resolve `Interior` from the shot.** A login screen means `wall`, the product
means `public`, and either answer gets written back to the manifest. A login
screen scored as if it were the app is a wrong number rather than a rough one.

**Done when** every surface in the manifest has a PNG on disk or a line in the
failure list. The report prints that list, so an absent surface reads as absent
rather than as a low score.

## Step 2: One critic per surface, from outside the context

Fan out. One `general-purpose` subagent per surface, `model: "opus"`, six at a
time. Each gets the screenshot paths and the path
`~/.claude/critique-rubric.md`, and nothing else. A critic that can see the
reasoning agrees with the reasoning.

Use this prompt verbatim, every surface, every round. Editing it between rounds
means the scores stop comparing, and a rising score is the only evidence you
have that a fix worked.

```
Read each of these images: <paths>.

They are one <genre> interface. Read ~/.claude/critique-rubric.md and work
through every dimension in it.

Name three or four real products in the same genre you know well, then rank
these images among them for polish and taste. Say where this one lands.

Answer in this shape:

Critic score: N/10
How close is this to what a good design studio would ship?

AI tells: every pattern that marks this as model-generated. Go through the AI
color palette, gradient text, dark mode with glowing accents, glassmorphism,
hero metric layouts, identical card grids, generic fonts, eyebrow text that
restates the heading below it, background gradients, cards around everything,
and more than four type styles. Name the ones you find and where.

Copy: is the writing still in the form a model would have produced? Quote the
worst two strings.

The two changes that would move this up the ranking. Name the element you mean.

Be direct and specific. Say what is working only where it genuinely is.
```

Give the critic the prompt and nothing about the target score. A critic that
knows the bar is 9 hands out 9s.

For a `wall` surface, append one line: this is the login screen rather than the
product interior, so judge it as a login screen.

**Done when** every rendered surface has a `Critic score`.

## Step 3: Brand, per product

Runs for products with two or more surfaces. One `general-purpose` subagent per
product, `model: "opus"`, given that product's screenshots at once and told
which surface is which.

```
These images are <n> surfaces of one product: <surface names>.

Would a visitor know they are the same product? Work through:

Wordmark: one treatment everywhere, or does each surface do its own?
Palette: the same colors carrying the same meaning on every surface?
Type: the same families and the same scale?
Density and shape: the same spacing rhythm, corner radius, button weight?
Voice: does the copy sound like one writer?
Promise: the marketing site sells something. Does the product look like it?

Brand score: N/10, where 10 is one designed system and 1 is unrelated products
sharing a name.

Name the single worst inconsistency and the change that fixes it.
```

A one-surface product has no brand score, and its row says so.

**Done when** every multi-surface product has a `Brand score`.

## Step 4: Blind ranking across the portfolio

Step 2's scores come from separate critics who never saw each other's work, so
they compare loosely. This step compares them properly, and its ordering wins
wherever the two disagree.

One `general-purpose` subagent, `model: "opus"`. Give it the 1440-wide shot for
every surface that rendered, labelled with opaque ids alone. Product names,
genres, Step 2 scores, and brand verdicts all stay out. Ask for every image
ranked best to worst on polish and taste, the top five and bottom five named,
and what separates them.

Tell it the surfaces do different jobs, and to rank on execution rather than
ambition, so a plain thing done well beats a complicated thing done badly.

Map the ids back to products yourself, after the ranking lands.

**Done when** every rendered surface has a rank.

## Step 5: Report

Write to `~/code/dotfiles/claude/portfolio-report.md` and publish an Artifact
carrying the leaderboard and the screenshots.

Lead with the leaderboard, in Step 4's order:

| Rank | Product | Surface | Critic | Brand | Worst tell |
|---|---|---|---|---|---|

Then:

- **The bottom five**, each with its two changes from Step 2 and the command to
  reach for: `/critique`, `/polish-loop`, `/simplify`, `/bolder`, `/quieter`,
  `/normalize`, `/colorize`.
- **Brand verdicts**, one paragraph per multi-surface product, worst
  inconsistency first.
- **Tells across the portfolio**: how many surfaces show each one. A pattern on
  fifteen surfaces is a habit, and fixing the habit beats fixing fifteen pages.
- **Copy**: every surface still carrying model-written strings, quoted. Rewrite
  against `~/.claude/writing-style.md`. The rewrite is almost always shorter.
- **Did not render**: the failure list from Step 1, with the reason.

State the bar. With no reference images supplied, the critics ranked against
their own memory of real products, which is softer than ranking against pasted
references. The report says that, so the numbers read as what they are.

## Cost

Thirty surfaces means roughly thirty opus critics in Step 2, five in Step 3, one
in Step 4. Say the count before starting. For a cheaper run, do Step 1 and Step
4 alone: the blind ranking is the most useful single output here and it costs
one agent.
