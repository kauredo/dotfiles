---
name: build-ui
description: My end-to-end flow for building UIs, pages, and sites. Use when starting UI work, building components/pages, or asked how to build an interface. Runs design context > style (ui-ux-pro-max) > build (frontend-design) > review/polish > code-review + polish-loop.
---

# build-ui

You are following the UI Finesse Playbook workflow for building exceptional user interfaces.

## Phase 0: Mode Detection

Before starting, determine which mode applies:

### Enhancement Mode (Existing Component Library)
Detected when ANY of these are true:
- `components/ui/button.tsx` exists (shadcn/ui pattern)
- `@radix-ui/*` packages in dependencies
- `@headlessui/*` packages in dependencies

### Standalone Mode (Greenfield)
Detected when NONE of the above are present.

## Phase 1: Context Gathering

**ALWAYS start here before building UI.**

Check for `docs/design-system.md` (the persisted Design Context).
- **If it exists**, read it and use it, do not re-interview.
- **If it doesn't**, run `/teach-impeccable` to interview the user (via `AskUserQuestion`) and persist the result to `docs/design-system.md`, linked from the project `CLAUDE.md`. Then continue.

The context you need either way: target audience and use cases, brand personality (3 words), aesthetic direction and references, anti-references (what to avoid).

## Phase 2: Foundation

**First, diverge.** Skip this for a small tweak. For a new page, a new site, or a redesign, produce three or four genuinely different directions before committing to one:

- Give the model a source of randomness from outside itself so it stops reaching for its defaults. Have it run `openssl rand -hex 24` and derive the creative direction from that string: palette, layout, typography, texture. Tell it to read past the surface of the string, into subpatterns, repeated characters, numbers that mean something, and to keep the string out of the design itself. It is inspiration, not content. Prompting for "something unique" or "decide at random" does not work, because the model predicts what random-sounding looks like, which is its own template.
- Or write a brief with a reference borrowed from outside software: a video game, an interior design trend, an art installation. "Each section is a still from a 16-bit platformer." "An isometric city where the features are neighborhoods." The more specific the brief, the more the model has to decide against.
- **Build the directions in parallel, one subagent each, in a single message.** Generating three directions in a row inside one context does not give you three directions. The second is written by an agent that has already seen the first, the third has seen both, and they converge on whatever the first one committed to. That is the same failure the seed string exists to prevent, one level up. Spawn a `general-purpose` agent per direction, give each the Design Context and nothing else, and have each generate its own seed inside its own context. No agent sees another's output, and none of them sees this conversation.
- Build each direction as a rough throwaway, show them side by side, say which one you would pick and why, then ask the user. Write down their reaction, especially what they dislike, and feed that back as the sharpening prompt.
- Try the direction that sounds like it cannot work. "There is no way this looks good" is a signal you have left the median, and the agent will sometimes land it. When it does not, throw the result away and keep the prompt. Retry the ones that failed when a new model ships, since a brief that was too ambitious for one generation is often exactly what the next one needs.

**Then decide the look.** Use the `ui-ux-pro-max` skill to pick a concrete UI style, color palette, font pairing, and (if needed) chart type that fit the Design Context. These choices feed the design tokens below, don't invent palettes/type from scratch when the database has vetted options.

### Standalone Mode
1. Use design tokens from `/tokens/` if present
2. Follow composition patterns in `/patterns/composition.md`
3. Follow theme architecture in `/patterns/theming.md`

### Enhancement Mode
1. Use the library's existing token system
2. Follow extension patterns in `/patterns/extension.md`
3. Reference `/patterns/elevation.md` for transcending defaults

## Phase 3: Building

For every component:
1. Consult the `frontend-design` skill for aesthetic direction
2. Follow `interface-guidelines` skill for interaction patterns
3. Reference `/docs/` for specific techniques
4. Use composition over duplication
5. When a section needs visual weight, generate real imagery with the `genmedia` skill (fal.ai) rather than reaching for a CSS gradient or a blurred blob. Coding agents default to gradients and shapes because those are code, and that reflex is one of the clearest signs nobody art-directed the page.

### Motion beyond CSS

CSS transitions cover most of what a page needs. For the two cases below, generate the motion with a video model through `genmedia`.

**Animated graphics that do not read as video.** Generate a looping clip against a solid background, then chroma key it out, or run a video matting model when the edges are complex. What you get back is an animation you can layer anywhere in the UI. For anything glassy, chrome, or refractive, render the clip over the page's own background colors first so the refraction bakes into the pixels, then matte the background out. Render it on a neutral background and composite afterwards and the glass looks fake.

**Scroll and gesture transitions.** Many video models interpolate between two keyframe images, so two product stills become a transition clip you can scrub frame by frame as the user scrolls or swipes. Chain several by seeding each clip with the previous clip's final frame, which keeps the sequence continuous. Ask `genmedia` for a model with strong physics and temporal consistency.

Video is billed per clip. Check `genmedia pricing <endpoint_id>` before a batch and keep the clips short.

## Phase 4: Refinement

Reviewing your own design is not an independent check. You can see the code, the rationale, and the last three attempts, so you grade generously. The judgment has to come from outside that context.

After building:
1. Run `/critique`. Its Step 0 screenshots the running page and hands the judgment to a fresh subagent that cannot see the code. Apply what holds up.
2. Run `design-polish` skill for systematic final pass
3. Run `design-review` skill for accessibility verification

## Phase 5: Quality Gate

Before shipping, verify:
- All checklist items from `ui-checklist.md`
- No critical accessibility issues
- Passes the "AI slop test" (doesn't look generic)
- **Every line of copy has been rewritten by hand.** Whatever the model wrote into the design is placeholder text, there to show the structure and the line lengths. Rewrite each string against `~/.claude/writing-style.md`, in one voice, and expect it to get shorter. Ask the user for the lines you cannot write yourself, like a product claim or a price

Then close out the feature:
1. Run `/code-review` and apply all fixes.
2. Run `/polish-loop` until it comes back clean.

**Invoked from `/ship`?** Stop after Phase 4. Ship owns this close-out at its own Steps 3 and 4.

## Quick Reference

| Need | Resource |
|------|----------|
| Persisted design context | `docs/design-system.md` (via `/teach-impeccable`) |
| Divergent directions | seed string (`openssl rand -hex 24`) or an outside-reference brief |
| Style / palette / type / charts | `ui-ux-pro-max` skill |
| Aesthetic direction | `frontend-design` skill |
| Real imagery and motion | `genmedia` skill (fal.ai) |
| Interaction patterns | `interface-guidelines` skill |
| Independent design judgment | `/critique` (its Step 0) |
| Named AI tells and their alternatives | `/critique` (its Section 1 table) |
| Copy that ships | rewrite by hand against `~/.claude/writing-style.md` |
| Final polish | `design-polish` skill |
| Accessibility review | `design-review` skill |
| Close-out review | `/code-review` (apply fixes) then `/polish-loop` |
| Visual techniques | `/docs/` best practices |
| Extension patterns | `/patterns/extension.md` |
| DRY principles | `/patterns/composition.md` |

## Anti-Patterns to Avoid

### Building
- Starting without design context
- Copying styles instead of wrapping components
- Hardcoding colors/spacing instead of using tokens

### Aesthetics
- Generic "AI slop" (purple gradients, glowing accents, Inter font)
- Glassmorphism everywhere
- Same-sized card grids
- Gradient text on metrics
- Custom controls where the platform ships a real one. A hand-rolled button, select, or text field almost always looks worse than the stock iOS, Android, or browser component, and rolling your own throws away the accessibility that came with it

### Refinement
- Shipping the copy the model wrote, without a human rewriting each line
- Adding when the fix is subtracting. AI piles things on and rarely takes them away: glow effects, highlighted words, labels repeating what the image already says, custom controls that beat the platform ones at nothing. The subtraction pass is its own prompt: simplify the layout into an image-centric grid, strip gradients, glows, and containers holding nothing, and fall back to native components.
- Grading your own work from inside the context that produced it
