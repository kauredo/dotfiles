# Directions: the blind fan-out and the pick

Read at Phase 2 on the routes Phase 0 sends here. Three or four genuinely different directions get built before one is chosen. This file is the source for what each branch freezes; `critique-loop`'s fan-out reads its lists from here on a `build-ui` run.

## 1. Freeze what is settled

Write the frozen and variable lists first, by branch:

- **new**, no identity yet: nothing is frozen; the seed steers palette, type, layout and texture.
- **new**, identity settled: the identity is frozen (fonts, palette, icons, components); the seed steers layout, density, hierarchy and motion.
- **redesign, full**: the brand from `REDESIGN.md` §3 is frozen (marks, token names, pinned values); the seed steers the composition and the unpinned token values. When those tokens also serve pages outside the request, the new values stay page-scoped (`REDESIGN.md` §4), so the rest of the app is untouched.
- **redesign, restyle**: the layout is frozen box for box, with the same brand; the seed steers the unpinned token values (palette, faces, radii, shadows, motion). Box for box fixes each box's position, order and copy. What fills a box stays variable: text alone, a thumbnail of what the control puts out, a live readout. A grid of identical text cards may come back as a grid of pictures.

Then hold the frozen list against `frontend-design`'s five looks. When the frozen values themselves sit inside one (a brand of cream ground and clay accent is look 1), name that look in the frozen list. Every direction then spends the frozen values to leave it: how much surface they cover, which tone steps carry the weight, where the accent lives.

## 2. Seed each direction from outside the model

- Have the direction agent run `openssl rand -hex 24` and derive the creative direction from that string: palette, layout, typography, texture. Tell it to read past the surface of the string, into subpatterns, repeated characters, numbers that mean something, and to keep the string itself out of the design. Prompting for "something unique" or "decide at random" fails, because the model predicts what random-sounding looks like, which is its own template.
- Or write a brief with a reference borrowed from outside software: a video game, an interior design trend, an art installation. "Each section is a still from a 16-bit platformer." "An isometric city where the features are neighborhoods." The more specific the brief, the more the model has to decide against.
- Spend one direction on the brief that sounds like it cannot work. "There is no way this looks good" is a signal you have left the median, and the agent will sometimes land it. When it does not, throw the result away and keep the prompt.

## 3. Give each direction its own premise

Seeds alone converge when the brief is strong: a project with a vivid brand doc hands every agent the same motifs, and three blind agents return three versions of one idea. So each agent also gets a different **structural premise**, assigned by you, one per agent:

- **Strip**: only what is load-bearing; the page is as short as it can be.
- **Lead with type**: the display face and a real hierarchy carry the page; the containers go.
- **Reorder**: a different thing is the first thing seen (the signature moved, the action first, the proof first).
- **Borrow**: the structure of a named reference from outside software (a box score, a timetable board, a record sleeve), in this project's palette and type.
- **The one that cannot work**, from §2.

A restyle freezes the layout, so it uses premises about the system instead:

- **Quiet**: one ink and one accent; weight and size carry the hierarchy.
- **Committed**: one saturated colour owns whole surfaces, not just accents.
- **Material**: the brand's signature face, texture or mark leads wherever the layout allows.
- **Borrow**: the type and colour system of a named reference from outside software.

Write each agent's premise and seed source in its brief. When two cards come back with the same first viewport in different paint (the same thing leads, at the same scale, in the same place), the round has converged. Rerun the weaker one with a premise no card used when the round has fewer than three distinct directions left; otherwise drop the weaker one from the payload. On a restyle every card shares the layout by design, so the test there is the system: two cards that would produce the same token file have converged.

## 4. Build them blind and in parallel

Spawn one `general-purpose` agent per direction, all in a single message. Directions generated in a row inside one context converge: the second agent has seen the first, the third has seen both. Give each agent the Design Context, the Shape notes (on a restyle, the read, the keeps contract and the before screenshots instead), the frozen list, its premise from §3, its seed source with §2's instructions for it, and this section, and nothing else. No agent sees another's output or this conversation. Each agent loads `frontend-design` for its aesthetic calls, and writes only its two files below with the file tools: no artifacts, no publishing, no edits to the project. Everything on the frozen list appears in the sketch as it ships today (the nav, the footer, a shared component). Before returning, it runs LINT on its sketch (`node ~/.claude/skills/build-ui/scripts/lint.mjs <work>/directions/<id>.html`) and clears every REFLEX line; a sketch's FAIL lines on tokens and spacing wait for the build. It checks its card against `frontend-design`'s five looks and names any it lands in, in its `risk` line, together with the move that takes it out; for a look the frozen list named, that move is how the direction spends the frozen values. Then it screenshots its sketch (`node ~/.claude/skills/hallmark/scripts/capture.mjs <work>/directions/<id>.html --sizes desktop --out <work>/shots --name <id>`), looks at it, and fixes any overlap or clipping.

Each agent returns:
- one self-contained HTML file of the first viewport, at 1440 x 900 for a web page or 390 x 844 for a phone-first app, written to `<work>/directions/<id>.html`, with the page's real content and real copy from the Shape inventory
- a card as JSON: `label` (two or three words), `lineage` (where the idea comes from), `thesis` (one sentence: what the page commits to), `palette` (3 to 5 hex values), `materials` (two or three nouns), `viewport` (one sentence: what is where on the first screen), `risk` (one sentence: how it fails when executed timidly), and `sections` (one line per section below the first screen, in order: what it holds and the composition that content calls for, in the direction's own terms)

For a phone-first app, add `"htmlFrame": "390x844"` to each option in §5's payload. These are sketches to choose between. `critique-loop`'s redesign fan-out, which runs later on a plateau, builds its candidates in the running app instead. The step is done when every agent has returned both.

## 5. Put them in front of the user

impeccable's decision page presents the cards. This replaces impeccable's `concept-seed` round. `IMP` below means `~/.claude/skills/impeccable/scripts/impeccable`.

0. Look at every screenshot side by side and hunt the **shared tell**: a generated-looking pattern that every card carries (the same identical card grid, the same lit word in a heading, the same palette share). Blind agents only share what the brief handed them, so a shared tell is a brief defect. Fix the brief (unfreeze what fills the boxes, name the look to leave) and rerun the round. The page opens once no tell appears on every card.
1. Write `<work>/payload.json` with one option per direction: the card fields, plus `"id"`, `"kind": "grounded"` and `"html": "directions/<id>.html"`. Add `"steer": true` and `"reroll": true` at the top level. Put `"kicker": "MY PICK"` on the direction you would choose, with the reason in its `risk` line. A card whose risk line names one of `frontend-design`'s five looks is your pick only when the brief or the frozen list asks for that look. `IMP serve-question --schema` prints the full shape.
2. From `<work>`, run `IMP serve-question --start --payload payload.json`, then `open <url>` with the URL it prints.
3. Run `touch` on every `directions/*.html`. The page draws only sketch files written after it started serving.
4. Run `IMP serve-question --wait --key <key>`, repeating while it exits 3. The ANSWER is JSON:
   - `optionId` is the pick, and `steer` is any note the user typed.
   - `optionId` is `reroll`: run a fresh fan-out with new seeds and the steer, deliver it with `IMP serve-question --update --key <key> --payload <file>`, `touch` the new sketches, and wait again.
   - Exit 4 means the page closed unanswered. Ask once with `AskUserQuestion`, one option per card, each description holding the thesis and the sketch path.
5. Write the pick and the user's reaction into the Design Context, especially what they disliked, so it sharpens every later prompt.

When no person can answer (a subagent run, a batch), skip steps 1 to 4. Screenshot every sketch (`node ~/.claude/skills/hallmark/scripts/capture.mjs <work>/directions/<id>.html --sizes desktop --out <work>/shots`), look at them side by side, pick the direction yourself under the same five-looks rule, and record the pick and its reason in the Design Context.
