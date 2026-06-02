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
- **If it exists**, read it and use it — do not re-interview.
- **If it doesn't**, run `/teach-impeccable` to interview the user (via `AskUserQuestion`) and persist the result to `docs/design-system.md`, linked from the project `CLAUDE.md`. Then continue.

The context you need either way: target audience and use cases, brand personality (3 words), aesthetic direction and references, anti-references (what to avoid).

## Phase 2: Foundation

**First, decide the look.** Use the `ui-ux-pro-max` skill to pick a concrete UI style, color palette, font pairing, and (if needed) chart type that fit the Design Context. These choices feed the design tokens below — don't invent palettes/type from scratch when the database has vetted options.

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

## Phase 4: Refinement

After building:
1. Run `design-polish` skill for systematic final pass
2. Run `design-review` skill for accessibility verification

## Phase 5: Quality Gate

Before shipping, verify:
- All checklist items from `ui-checklist.md`
- No critical accessibility issues
- Passes the "AI slop test" (doesn't look generic)

Then close out the feature:
1. Run `/code-review` and apply all fixes.
2. Run `/polish-loop` until it comes back clean.

## Quick Reference

| Need | Resource |
|------|----------|
| Persisted design context | `docs/design-system.md` (via `/teach-impeccable`) |
| Style / palette / type / charts | `ui-ux-pro-max` skill |
| Aesthetic direction | `frontend-design` skill |
| Interaction patterns | `interface-guidelines` skill |
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
