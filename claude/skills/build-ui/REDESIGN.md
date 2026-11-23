# Redesign

Read when the request changes a design that already exists: a redesign, restyle, reskin or polish, or "make this look less generated". The material is the page that exists. `SKILL.md` runs the phases; this file says which ones, what the run keeps, what it records first and what it checks at the end. Adapted from Hallmark's `references/redesign.md`.

## 1. Ask, then name the depth

When the request already says what stays, or nobody can answer (a subagent run, a batch), skip the ask. Otherwise send one message:

> Before I redesign, three things. 1. **What must stay**: the brand, a section, a page? Say *keep the layout* and I only restyle. 2. **What is wrong with it**, in your words, and the feeling you want instead. 3. **Anything new to show**: screenshots, photos, numbers, a quote. Or say **go ahead** and I will redesign it in full.

Then name one depth in your reply. Depths never blend.

| Depth | Stays | Changes | Phases (`SKILL.md`) |
|---|---|---|---|
| **full** | content and wiring | the system and the composition: what leads, the hero, the sections, nav and footer | 1, 2 (Shape, Directions, Look), 3, 4, 5 |
| **restyle** | the layout | the system: colour, type, radius, shadow, motion, the controls | 1, 2 (Directions with the layout frozen, Look), 3, 4, 5 |
| **polish** | the system and the layout | only what LINT or the critique names: the tells, contrast, states, motion, tokens | 1 (read the Design Context, no interview), 4, 5 |

**full** is the default. "Keep the layout", "restyle", "reskin" or "only the colours and type" mean **restyle**. "Polish", "keep our look" or "only fix what looks generated" mean **polish**. A polish that finds the concept itself wrong says so and recommends full, and changes nothing structural on its own.

Where the sections below fall in `SKILL.md`'s phases: §2 and §3 run before any edit, §4 is Phase 2 and 3, §5 items 3 and 4 are Phase 4, and §5 items 1 and 2 and §6 are Phase 5.

## 2. Record the page as it stands

Start from a clean git tree, so the redesign is one diff the user can read and revert. When the tree is dirty, ask the user to commit or stash, and leave both to them. Start the dev server and confirm each route shows the real page ([`LINT.md`](LINT.md) §1, which also says what to pass), then:

```
LINT <files and dirs, per LINT.md §2> --render --before --url http://localhost:<port>/<route> [--url ...] [--scope app] > <work>/before-lint.txt
```

Redirect the output to a file, as above, so you can open the screenshots before the findings.

LINT keeps the record outside the project, in the folder its first line names (`~/.cache/build-ui-lint/<repo>-<hash>/.hallmark/`): `before.json` lists every link, form, field, inline handler, test hook, script, queried selector, heading and figure, and `before/` holds the screenshots. One `--url` per route in scope.

Look at the screenshots **before** reading the findings, so the linter does not write your verdict. Then write the **read**, four lines:

1. What the page is for: its audience and its one action.
2. What works and stays. Name at least one thing.
3. What reads as generated, worst tell first.
4. What is broken.

The read goes in your reply. Its lines 1 and 2 (what the page is for, what works and stays) become the first entries of the critique ledger's settled list.

## 3. The keeps contract

Every depth keeps these, so write the contract in your reply at every depth, Shape or not. It goes into the frozen list ([`DIRECTIONS.md`](DIRECTIONS.md) §1) before any direction is generated, and into `critique-loop`'s settled list before round 1, with the depth's frozen layout at restyle and polish.

- **Content.** Every fact, claim, name, price, date and quote the page states. Figures, quotes and logos already on the page are the owner's material: carry them over as found and list them in the handoff for the owner to check. Add only what the user hands over and what an accessibility fix needs (a focus ring, a pause control on a loop).
- **Wiring.** Every link, form, field, handler, route, id and test hook, plus every script, data call and analytics call. Edit markup inside the component that owns it. Keep every `name`, `id`, `key`, `type`, `href` and `data-testid` that a script or a test reads, and every prop name. When a screen has no logic for a state (a failed load, an undo), list it for the owner.
- **Files.** Deleting a file, removing a route or replacing a component tree needs a file-level plan the user approved. Tests stay as they are.
- **Brand.** A brand is something the project chose: a logo, a colour or a face it names in a brand file, a logo asset, named tokens or its own font files, or something the user states. It stays at every depth, with its values read from the project's files. A framework default, or one of the looks in `frontend-design`'s "Process" section (stock indigo, Inter as the display face, the SaaS-card kit), is a default: restyle and full replace it, and your reply says so in case it was chosen on purpose. In a settled design doc or brand file (whatever Phase 1 read), the brand is its logo and marks, its token **names and roles**, and anything an ADR, the brand file or the user pins as a value. A restyle or full request is the user's approval to change the unpinned token **values** (the colours, faces, radii and shadows themselves); at polish, the values stay too. When the request names what a pin covers ("the colours and type feel flat" and the brand file pins both hexes and both faces), the request wins for those items, and your reply names the file and line it overrides. A pinned value the request does not name stays, and the restyle works on how the page uses it (tone steps, weight, which surfaces carry it).
- **Words.** Change a line only where LINT's copy gates or the critique name it, tightening from facts already on the page, and list every changed line in the handoff as before and after. When an eyebrow goes, a figurative heading under it becomes the plain label: *When to find us* under *Opening hours* becomes *Opening hours*. An eyebrow that carries a fact (who, where) moves the fact into the heading or the line under it; at polish, where that would change the layout, it stays and its gate is waived with that reason. Terms, disclaimers and consent text keep their exact wording. When the user says to keep every word, record `copy: verbatim` in the ledger and treat the copy findings as notes.

## 4. Build

- **full**: Shape takes the page's own content as its inventory and the read's first line as the job. Each direction agent also gets the keeps contract and the before screenshots, as evidence of what the subject is.
- **restyle**: Directions runs with the layout on the frozen list, so every candidate keeps the existing layout box for box, and the palette, faces, radii, shadows and motion are the variable list. Each direction agent gets the read, the keeps contract and the before screenshots in place of Shape notes.
- **polish**: fix in place, one element or token at a time, from LINT's findings and the critique.
- **Shared code, at every depth.** Global tokens, base styles, the layout shell (nav, footer) and shared components (a `Button`, an `.eyebrow` class) render on pages outside the request. When the request names one page, leave their shared values and markup as they are: add page-scoped tokens, overrides or variants, and fix only defects there: something broken for every route (an overflow, a missing or low-contrast focus ring, a contrast failure, a script error). A style finding in a shared file (a tracked-caps class, a font count, a glass nav) goes in the handoff with the routes it would change, unfixed. List every shared-file fix in the handoff with the other routes it touches. A request that covers the site changes the shared code. Say which in your reply.
- **Several pages**: settle the system on the most visited page first, record it in `docs/design-system.md` under `# Design System`, then carry it to the rest. Past three pages, give each page its own subagent with that file, the page's files and this one.
- Pass `--depth <depth>` to every LINT call. At restyle and polish, the layout gates print as notes; list them in the handoff as the findings a full redesign would settle.

## 5. After

1. Run `LINT <the same files and dirs> --render --kept --depth <depth> --url ...`. Anything the page had and no longer has shows as `FAIL kept` (a link, form, field, handler, test hook, script, or a selector a script still queries) or `WARN kept` (a heading, figure, image or id). Restore it, or record a drop the user approved with `--waive kept@<the item>` (LINT groups kept findings by kind, so a waiver matching one item hides that whole group: run it last, after every other kept finding is restored) and write it into the handoff with their reason. LINT prints the kept counts (`links 14/14, fields 5/5 ...`) for the handoff's Kept row, and the path to `compare.html`, the before and after side by side. The check compares the source files it reads, so an element you stop rendering (a component removed from a layout) still counts as kept while its source exists: list the ids and hooks of every component you unmounted by hand.
2. Run the project's own type check, build and tests. A redesign that breaks one is not finished.
3. At restyle and polish, a critique finding that asks for a layout change (fewer containers, a different order, a max width) joins the layout notes, and the critique's ship line is "no open finding inside this depth's scope" instead of a score of 8, which a frozen layout may never reach. `critique-loop` runs with the layout notes in its settled list, and its plateau goes to the user as a recommendation to run full, never to a redesign fan-out.
4. The Phase 4 critique also gets the `before/` screenshots, labelled as the old page, and one extra question in its prompt from round 1: *what did the old page do better?* A plain defect it names (a misalignment, a broken glyph, a label that lies) gets fixed at any depth. A finding that asks for a new composition joins the layout notes. A finding that asks for content the page never had goes to the owner.

## 6. Handoff

Put this ahead of the copy list:

```
Redesign  full, 3 pages (/, /pricing, /docs)
Before    LINT 14 FAIL, 9 REFLEX
After     LINT 0 FAIL, 1 REFLEX waived (47b: reason)
Kept      14/14 links, 5/5 fields, 9/9 handlers, 11/11 headings, every figure
Changed   the system and the composition
Dropped   none
Owner's   2 claims kept as found ("50,000+ teams", the Acme quote), 4 lines reworded (listed below)
Notes     layout findings a full redesign would settle (restyle and polish only)
Compare   ~/.cache/build-ui-lint/<repo>-<hash>/.hallmark/compare.html (the path LINT prints)
```

The run is done when the Kept row accounts for everything in `before.json` (kept, or dropped with its reason) and the After row shows 0 FAIL.
