Deep design audit of one app, ending in plans: every route, the whole scroll of
each, phone and desktop, hover and focus and open-menu states, the load
sequence as frames, and the product interior behind the login, then one plan in
`plans/` per fix, written by `improve`. Use when the ask is "critique this app
properly", when a logo or brand needs judging on its own, or when
`/portfolio-critique` has pointed at a product and the next step is the full
treatment. `--pick` stops to choose which fixes get plans.

**First**: read `/critique`. The rubric and the outside-the-context rule are the
same. What changes is coverage. `/critique` judges the fold of one route in one
still; `/portfolio-critique` measured that as about 20% of one page on one route,
with everything that animates in on scroll captured at opacity 0. This command
exists to see the rest.

## Step 0: Pin the app

One product per run. Name its surfaces from `~/.claude/portfolio.md`, and for
each one decide the base URL:

- **Public routes**: production. Nothing to boot.
- **Behind a login**: boot the repo locally against seeded data and capture
  `localhost`. Read the repo's `README`, `package.json` scripts, `docker-compose`,
  and `.env.example` for the recipe. If the app needs credentials that no seed
  provides, or does not come up in about ten minutes of honest effort, record
  what it needs and audit the public surfaces alone. Say so in the report's
  first line.

**Done when** every surface of the product has a base URL, or a written reason
it does not.

## Step 1: Capture

Run the harness once per surface:

```bash
node ~/.claude/scripts/app-capture.js --url <base> --name <product>-<surface> \
  --out "$OUT/<surface>" --control
```

It discovers up to six same-origin routes (nav links first), and for each one
scrolls the whole page in steps so scroll-triggered reveals fire, then writes:

- `<route>-desktop-full.png`, the entire page at 1440 wide
- `<route>-desktop-N.png`, the page in 900px screens, up to five
- `<route>-mobile-full.png`, the entire page on an iPhone 14 Pro profile
- `<route>-hover.png`, `<route>-focus.png`, `<route>-mobile-menu.png`
- `home-motion-1..3.png`, the landing route at 120ms, 620ms, 1620ms after load
- `capture.json`: page heights, measured overflow, clipped elements, elements
  still hidden after the scroll, and the control's numbers

Pass `--routes /a,/b` to override discovery when the nav misses what matters, and
`--max` to widen it. For a logged-in interior, hand it the URLs of the screens a
real user spends time on: the dashboard, the main list, one detail view, one
form, one empty state.

Read `capture.json` before anything else. `stillHiddenAfterScroll` above zero
means reveals the scroll did not wake, and the critics will judge that content
as missing. `unshelled: true` means the page was a fixed-height app shell and
the harness let its scroll pane grow to capture the whole thing. The control's
overflow and clipped counts should be zero; when they are not, the recipe is
broken and no critique runs until it is fixed.

**A negative in `notes` is a claim about the harness until a live check says
otherwise.** "Mobile menu failed" on every route of a site means the locator
picked the wrong button far more often than it means the site has no phone
navigation. Open the page in Playwright, find the trigger by its `aria-label`,
click it, and count the links before and after. Three artifacts reached critics
on the first Protasca run this way: a sticky strip widened by the capture, a
menu that opened fine, and photos missing from a local boot.

**Look at one interior capture yourself before spending critics on it.** A
local boot has no image storage, so photos come up as broken images, and a
signed-in capture can be seven shots of the same login page when the session
did not stick. Both look like design defects to a critic. Whatever the
environment did to the captures goes into every critic prompt as one sentence,
the same way `/critique` tells a critic a login wall is a login wall.

**Done when** every surface has a `capture.json` and the control reads clean.

## Step 2: Five critics, one dimension each

Fan out five `general-purpose` subagents, `model: "opus"`, in parallel. Each gets
every image for the product plus the path `~/.claude/critique-rubric.md`, and
nothing else. A generalist critic given forty images skims; a specialist given
forty images and one question reads all of them.

Reuse these prompts verbatim across rounds and across apps, so scores compare.

**Brand and mark.** The one the portfolio run never asked directly.

```
Read every image in <dir>. They are one product, <name>, which does <one line>.

Find the logo or wordmark on every screen it appears. Judge it twice: alone, as
a mark, and against the product it stands for.

Alone: is it drawn, or assembled from an icon library and a font? Does it hold
at 16px in the header and at 512px? Would you recognise it without the name?

In context: does it promise what the product delivers? A photo product with an
abstract geometric mark, a restaurant tool with a stock cutlery icon, a finance
app with a piggy bank, a sprout and a tree, are three different failures. Name
which, if any, this one is.

Then the identity around it: does one system carry across every route and both
viewports? Same accent doing the same job, same radius, same button weight, same
voice in the copy? Where does it break?

Mark score: N/10 for the logo alone.
Brand score: N/10 for the system's consistency.
The single change that would move each up.
```

**Colour and type.**

```
Read every image in <dir>. They are one product, <name>.

Palette: list the colours actually in use, with their jobs. Is there an accent,
and does it mean one thing? Count how many roles the accent plays on the landing
page. Does the palette survive the phone, the hover state, and the login? Check
contrast on the smallest text and on the primary button label, and estimate the
ratio.

Type: name the families as best you can, count the distinct styles on the
landing route, and say which ones earn their place. Is the body measure
comfortable? Does the hierarchy signal what to read first, second, third? Do the
choices say anything about this product, or would they sit on any product?

Then the AI tells in this dimension: the AI palette, gradient text, dark mode
with glow, generic fonts, more than four type styles. Name the ones present and
where.

Colour score: N/10. Type score: N/10. The two changes that would move each up.
```

**Layout and composition, the whole scroll.**

```
Read every image in <dir>. They are one product, <name>. The *-desktop-full and
*-mobile-full images are entire pages; the numbered desktop images are the same
pages in 900px screens for detail.

Read the page top to bottom as a sequence. Does each section earn its place, or
is the page long because sections were added rather than chosen? Where does the
rhythm break: a section that changes the grid, a gap that reads as leftover, a
component that belongs to a different page?

Where is the product actually shown, and how far down? What does a visitor see
in the first 900px, and is it the strongest thing on the page?

Compare desktop to phone: same page, or two pages that share content? Where did
the phone layout stop being designed?

Then the AI tells in this dimension: hero metric rows, identical card grids,
cards around everything, eyebrows restating headings, background gradients,
empty hero halves, cookie banners over live content. Name each, with the route
and the screen number.

Composition score: N/10. The two changes that would move it up.
```

**Copy and voice.**

```
Read every image in <dir>. They are one product, <name>.

Transcribe the headline, subhead, primary CTA label, and the first sentence of
each section on the landing route. Then answer: has a person rewritten any of
this since a model produced it? Look for em dashes, "not X, Y" antithesis,
rule-of-three lists, aphoristic closers, "beautiful", "seamless", "the tools you
need", stock CTAs ("See how it works", "Get started today").

Quote the five worst strings and rewrite each, shorter, naming the mechanism or
the number instead of the adjective. Quote the strings a person clearly wrote
and say why they work.

If the product is Portuguese, check register and locale: tu against você,
pt-PT against pt-BR, on the same screen.

Copy score: N/10. The three strings to rewrite first.
```

**Interaction and states.**

```
Read every image in <dir>. They are one product, <name>. The *-hover images
show the primary action under the pointer, *-focus shows the first field
focused, *-mobile-menu shows the phone navigation opened, and home-motion-1
through 3 are the landing page at 120ms, 620ms, and 1620ms after load.

Does anything respond to being used? Compare hover to rest: is there a change,
and is it the right size? Is the focus ring visible, and is it the brand's or
the browser's? Does the mobile menu look designed or default? Across the three
motion frames, what moves, and does the sequence add anything a still would not?

Then states: find every empty state, loading state, error, and success message
in the images. Does each one guide or just report? What is missing that a real
user would hit in the first ten minutes?

Interaction score: N/10. States score: N/10. The two changes that would move
each up.
```

Never tell a critic what score you are hoping for.

**Done when** all five have returned scores.

## Step 3: One synthesis

You have five specialist reads. Write the report yourself; do not spawn a sixth
agent to summarise five agents.

**The report lives in the repo it judges**, at `docs/design-audit-<date>.md`,
or the repo root when there is no `docs/`. `improve` globs `docs/` for intent
documents before it plans, so an audit there feeds the next step without being
pointed at, and a report in dotfiles feeds nothing. For a product spread over
several repos, the report goes in the one holding the marketing site, with a
one-line pointer in each of the others. Publish an Artifact of the same content
with the full-page captures alongside the findings. Structure:

- **First line**: which surfaces were captured from production, which from a
  local boot, which were not reached and why.
- **Scores**, one row per dimension, seven numbers.
- **The one thing.** If they fix a single thing, which. Pick it from the five
  critics' top changes, and say why it outranks the others.
- **Per dimension**, the critic's verdict compressed to its findings and its
  changes. Keep the quoted strings and the measured numbers. Drop the
  reasoning that led to them.
- **Measured**: overflow, clipped elements, page heights, the control, from
  `capture.json`.
- **Not seen**: routes discovery skipped, interiors not reached, anything
  `stillHiddenAfterScroll` flagged.
- **Where each fix goes.** One row per change the critics named, routed to the
  tool that does that kind of work. This is the table `improve` turns into
  plans, so every row names the element and the file or route, and none says
  "consider". The routing:

  | Kind of change | Route |
  |---|---|
  | A bug with a stack trace or a measured overflow | `/ship`, no plan needed beyond the row |
  | A token change across codebases (accent, radius, label colour) | `/improve plan` then `/ship` |
  | A page or component that needs its composition rethought | `/build-ui` from step 2, identity settled |
  | A mark or logo | `ui-ux-pro-max:design` for the exploration, then `/critique` |
  | Imagery the page is missing | a real screenshot first; `genmedia` only for what cannot be photographed |
  | Contrast, states, empty states, error paths | `/harden` |
  | Too many styles, duplicated sections, dead space | `/simplify` |
  | The same operation named or laid out three ways | `/normalize` |
  | Copy, labels, register, locale | `/clarify`, against `~/.claude/writing-style.md` |
  | Phone layout that stopped being designed | `/adapt` |

State the bar: no reference images were supplied, so each critic ranked against
memory. The scores are a band.

## Step 4: Plan, via the `improve` skill

The run is not finished at a report. It is finished when `plans/` holds one plan
per row of the routing table, written for an executor with no memory of this
session. Invoke the **`improve`** skill (Skill tool) with this input, filling in
the path:

```
plan from docs/design-audit-<date>.md. Every row of "Where each fix goes" is a
vetted finding: skip your own audit and the Vet phase, take the rows as the
findings, and write one plan per row in the report's order. Rows routed to
/ship are bugs with evidence attached; a plan for one of those is short. Rows
routed to /build-ui, /harden, /simplify, /normalize, /clarify, or /adapt name
that command as the executor's tool in the plan body. Reconcile with the
existing plans/ index rather than duplicating.
```

`improve` keeps its own rules: it reads the code to specify each plan
properly, it never edits source, and it writes only under `plans/`. It also
stops to ask which findings to plan when it can; pass `--pick` to keep that
gate, otherwise tell it to plan every row and record that default in
`plans/README.md`, the way `/ship` runs unattended.

**Done when** `plans/README.md` lists every row of the routing table with a
plan file, numbered after whatever was already there.

## Step 5: Hand it on

One line, naming the first plan by title: `/ship <title>`. `/ship` calls
`improve` to verify the plan, routes UI steps through `build-ui`, and writes the
PR back into `plans/`. For a product with several bug rows, say `/ship` will
stack them.

## Cost

Five opus critics per product, each reading thirty to fifty images, then an
`improve` run that reads the codebase once per plan. One product is more than
the agent spend of a whole portfolio triage. Run one product, let the user
react, then the next.
