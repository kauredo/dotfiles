---
name: build-ui
description: My end-to-end flow for building UIs, pages, and sites. Use when starting UI work, building components/pages, redesigning, restyling or polishing an existing design, or asked how to build an interface. Runs design context > shape > blind direction fan-out > build > lint and outside critique > code-review + polish-loop.
---

# build-ui

`LINT` in this skill's files means `node ~/.claude/skills/build-ui/scripts/lint.mjs`: Hallmark's rendered linter, tuned for pages that are not Hallmark builds. Gate meanings live in `~/.claude/skills/hallmark/references/gates.md`. `<work>` is a scratch folder outside the project, such as the session scratchpad.

## Phase 0: Branch and mode

**Branch.** Name it in your first reply. This table, and `REDESIGN.md` §1 for redesigns, say which phases run.

| Request | Branch | Phases |
|---|---|---|
| A page, site or surface that does not exist yet | **new** | 1, 2 (Shape, Directions, Look), 3, 4, 5 |
| Redesign, restyle, reskin or polish of something that exists, or "it looks generated" | **redesign** | Read [`REDESIGN.md`](REDESIGN.md) now. Its §1 names the depth (full, restyle or polish) and the phases for it |
| A new section, state or screen inside a surface whose identity is settled | **extension** | 1, 2 (Look only), 3, 4, 5 |

**Mode.**
- **Enhancement mode**: the project has a component library that carries its own tokens, such as shadcn/ui (`components/ui/button.tsx` with CSS variables) or a themed kit. Its tokens are the system.
- **Standalone mode**: no such library. Headless primitives (`@radix-ui/*`, `@headlessui/*`) carry behaviour, not tokens, so a project with only those is standalone, and its tokens live wherever its CSS defines them (a Tailwind `@theme`, a `:root` block).

## Phase 1: Context

Read `docs/design-system.md`, or wherever the project already keeps its design context: a doc its `CLAUDE.md` or `AGENTS.md` names (`docs/design.md`, `DESIGN.md`, a brand file), or a `## Design Context` section inside `CLAUDE.md` or `AGENTS.md` itself. That place is the Design Context's home for this project, and later steps write to it. When none exists, run `/impeccable init`, which interviews the user and writes `docs/design-system.md`, linked from the project `CLAUDE.md`. Init leaves visual taste to later steps, so ask for the rest yourself and add it under `# Product` as `## Design Context`.

Rules the project's own docs set (a touch-target size, a font count, an illustration style) win over any skill's or LINT's default where the two disagree; waive the LINT gate with the doc as the reason.

Phase 1 is done when the Design Context names the audience and use cases, the brand personality in three words, reference sites, anti-references, light or dark, and the colours to use or avoid. With nobody to ask, fill the gaps yourself and mark each as your choice.

## Phase 2: Foundation

### Shape

Write these down before any direction exists. Each direction agent receives them, so the fan-out varies the look and keeps the substance.

1. **The job.** The one thing a visitor comes to do (subscribe, book, visit, attend, buy, try, sign up, hire, join, listen). Read that job in [`ANATOMY.md`](ANATOMY.md) and write its three lines for this page: where the action sits, the sections that belong to it, how the page ends. An app screen's job is the task the person repeats there: name the task, the information it needs and its states, and skip the anatomy.
2. **The material inventory**, three lists:
   - *real*: every concrete thing the brief and the project supply (name, claims, numbers, places, dates, images, the product itself)
   - *pictures*: what the page will show and where each comes from (the user's files, screenshots of the running product, the product built in code, imagery generated with `genmedia`)
   - *absent*: every proof nobody gave (logos, quotes, metrics, reviews)

   Only *real* items reach the page as fact. Sections built on *absent* content follow `ANATOMY.md`'s sample rule.
3. **The signature.** The one thing a visitor would remember: the strongest *real* item shown at its best (the photograph that is the place, the product doing its one job, a price set huge because it is the offer). It sits on the first screen.
4. **On a redesign, the keeps contract** from `REDESIGN.md` §3.

### Directions

Read [`DIRECTIONS.md`](DIRECTIONS.md) and follow it: freeze what is settled, seed three or four directions from outside the model, build them blind in parallel, and put them on impeccable's decision page for the user to pick. The step is done when a direction is picked and recorded in the Design Context.

### Look

- **After Directions**: the picked card's palette and type stand. Use the `ui-ux-pro-max` skill for what the card leaves open (a UI style, a body face to pair with the display face, a chart type).
- **On an extension**: the Design Context's tokens are the look. Use `ui-ux-pro-max` only for a gap they leave, such as a chart palette or a missing state colour, and keep every font. With no gap, skip it.

Start from the database's vetted options. If the Design Context names a real product as a reference, run `ui-ux-pro-max`'s Step 1b (Refero Styles) first to get its actual DESIGN.md.

**Standalone mode:** define tokens (color, type, spacing, radius, shadow) as CSS custom properties and record them in the Design Context's home under `# Design System`. Theme by swapping token values, so every component reads its colors from a token.

**Enhancement mode:** use the library's token system, as the Design Context records it. Wrap library components and extend them through their props and `className`. Write new CSS only where the library has no slot.

## Phase 3: Building

For the page and every component in it:
1. Consult the `frontend-design` skill for aesthetic direction. Its "Process" section holds the one list of looks generated pages fall into; on any axis the brief leaves free, pick something that list does not name.
2. Follow the `interface-guidelines` skill for interaction patterns. Use the platform's own controls: a stock button, select or text field looks better than a hand-rolled one, and keeps its accessibility.
3. When the component moves with the user's hand (drag, swipe, sheet, carousel, pull-to-refresh), build its motion from the `apple-design` skill: springs, velocity handoff, momentum, rubber-banding. Its code targets `motion` on the web; on React Native, carry the same physics over to Reanimated and Gesture Handler.
4. Write the styles with the `good-css` skill, the source for CSS technique (layout, container queries, show-and-hide, motion). In files that already exist, the codebase's own conventions win where the two differ.
5. On a new page or a full redesign, build the sections below the first screen from the picked card's `sections` list. Each section's composition comes from what it holds: a sequence reads as a timeline, a comparison as the same data side by side, a set of facts as a table, a single proof as one large picture. Done when no two sections in a row share a composition and each one's composition names its content.
6. When a section needs visual weight, use a real picture from the Shape inventory: the user's files, a screenshot of the running product, or imagery generated with the `genmedia` skill (fal.ai).
7. When a section needs generated motion (a matted loop or a scroll-scrubbed transition), read [`MOTION.md`](MOTION.md).

## Phase 4: Refinement

Your own context grades too kindly: it holds the code, the rationale and the last three attempts. The mechanical checks run first, then a critic that cannot see the code.

0. **LINT.** Read [`LINT.md`](LINT.md) and follow it. Done when LINT reports 0 FAIL on every route.
1. **Critique.** Run `/impeccable critique`. Its Step 0 screenshots the running page and hands the judgment to a fresh subagent. Give it the Shape notes, the Design Context's reference sites as its bar (critics with no references all reach for the same few sites from memory) and, on a redesign, the before screenshots and the question in `REDESIGN.md` §5 item 4. When it reaches the ship line (a score of 8; at restyle and polish, the one in `REDESIGN.md` §5 item 3), fix each finding or write down why it stays. When it misses, leave the findings unapplied and run `critique-loop`. Its round 1 saves a baseline, critiques again and keeps each fix only if it wins a blind A/B against that baseline; fixes applied before the loop starts would have nothing to be measured against. The loop scores every round as the median of three critics; compare those medians with each other, not with this single score.
2. **Subtraction.** A separate pass with its own prompt: simplify the layout around the pictures, and cut every gradient, glow, container and label that carries nothing the page needs. Done when each one left has a job you can name.
3. **Polish.** Run the `design-polish` skill. Done when its checklist is ticked.
4. **Accessibility.** Run the `design-review` skill. Done when it reports no critical issue.

## Phase 5: Quality Gate

Confirm each, and list any that fails for the user:
- LINT reports 0 FAIL on every route built, and each waiver has its reason written down.
- The last critique reached the ship line (a score of 8; at restyle and polish, the one in `REDESIGN.md` §5 item 3), or its open findings are listed.
- Phase 4 steps 2 to 4 are done.
- On a redesign, `REDESIGN.md` §5 and §6 are done.
- **Copy.** On new and extension pages, every line the model wrote is placeholder: rewrite each against `~/.claude/writing-style.md` in one voice, expect it to get shorter, and ask the user for lines you cannot write (a product claim, a price). On a redesign, `REDESIGN.md` §3 "Words" decides which lines change.

**Invoked from `/ship`?** Pass this gate, then stop. Ship owns the close-out at its Steps 3 and 4.

Otherwise close out the feature:
1. Run `/code-review` and apply all fixes.
2. Run `/polish-loop` until it comes back clean.
