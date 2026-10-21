---
name: logo-brand-package
description: Build the final logo deliverable package Allan Peters-style — lockup variations, a logo-derived seamless pattern, mockups, and a one-page brand style guide. Use once a final logo SVG is chosen and ready to hand off.
model: opus
metadata: { "openclaw": { "emoji": "📦" } }
---

# Logo Brand Package

Turn one finalized logo SVG into the full handoff set. Read `references/mockup-templates.md` before step 4; it holds proportions and placement for each mockup type.

## Workflow

1. **Confirm the source.** Get the final logo SVG and its palette (primary + up to 2 accent hex colors). If colors aren't given, pull them from the SVG's fill/stroke attributes and confirm with the user. **Done when:** one clean source SVG and a named hex palette are set.

2. **Lockups.** From the same paths (no redrawing), produce: horizontal (icon + wordmark side by side), stacked (icon above wordmark), icon-only, and full-mono (single color, for low-contrast use). **Done when:** 4 lockup SVGs exist, each a valid standalone SVG reusing the source paths.

3. **Pattern.** Pick one repeatable motif from the logo (a sub-shape, not the whole mark). Run `node scripts/pattern-tile.mjs <motif.svg> <output.svg> --rows=N --cols=N [--rotate=deg] [--scale=x]` to tile it into a seamless background. **Done when:** one pattern SVG exists that tiles edge-to-edge with no visible seam at its own repeat boundary.

4. **Mockups.** Using `references/mockup-templates.md` proportions, build flat vector mockup scenes (not photorealistic) with the logo composited in: business card, apparel/tote, signage, social avatar. Each is its own SVG: template shape + logo at the specified scale/position. **Done when:** one mockup SVG per template, logo legible and correctly scaled in each.

5. **Style guide one-pager.** Assemble a single HTML/SVG board: logo + all 4 lockups, palette swatches with hex codes, one typography recommendation, 2-3 usage dos/don'ts (min size, clear space, no-recolor example). Render to PNG via Playwright: navigate to the board's `file://` path, then take a screenshot. **Done when:** one style-guide.png exists covering every item above.

Deliver the whole set as one folder: `logo.svg`, `lockups/`, `pattern.svg`, `mockups/`, `style-guide.png`.
