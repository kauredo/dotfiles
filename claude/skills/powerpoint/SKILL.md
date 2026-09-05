---
name: powerpoint
description: |-
  Handle PowerPoint (.pptx) creation, design, and analysis. Use for pitch decks, status updates, and visual storytelling. Use proactively when precise layout positioning and design principles are needed.
  
  Examples:
  - user: "Create a 10-slide deck for the board meeting" -> use design principles + html2pptx
  - user: "Convert this report into a presentation" -> extract text and map to template
  - user: "Audit this deck for layout issues" -> generate thumbnail grid for inspection
---
<instructions>
<scope_split>
Use this skill for from-scratch, high-fidelity new decks (the html2pptx pipeline below). For editing, analyzing, or proofreading an *existing* Office document, including an existing .pptx, use the `officecli` skill instead.
</scope_split>

<powerpoint_professional_suite>

<high_fidelity_creation>
The preferred method for precise layout positioning:
1. **HTML**: Create slides (720pt x 405pt). Text MUST be in `<p>`, `<h1>`-`<h6>`, or `<ul>`.
2. **Visuals**: You MUST rasterize gradients/icons as PNGs using Sharp FIRST. **Reference**: `references/html2pptx.md`.
3. **Execution**: Run `html2pptx.js` to generate the presentation.
</high_fidelity_creation>

<template_structure>
For deck editing or template mapping:
- **Audit**: Generate thumbnail grid (`scripts/thumbnail.py`) to analyze layout.
- **Duplication**: Use `scripts/rearrange.py` to duplicate and reorder slides.
- **Text Injection**: Generate the JSON inventory with `scripts/inventory.py <input.pptx> <output.json>`, then apply it with `scripts/replace.py`.
</template_structure>

<design_quality>
- **Fonts**: You MUST use web-safe fonts ONLY (Arial, Helvetica, Georgia).
- **Colors**: You MUST NOT use the `#` prefix in PptxGenJS hex codes (causes corruption).
- **Layout**: You SHOULD prefer two-column or full-slide layouts. You MUST NOT stack charts below text.
- **Verification**: You MUST generate a final thumbnail grid with `--cols 4` to inspect for text cutoff or overlap issues.
- **Raw-XML validation**: for schema validation or structure work beyond what the html2pptx path covers, see `references/ooxml.md` and its `unpack.py` / `validate.py` / `pack.py` scripts under `references/ooxml/scripts/`.
</design_quality>

</powerpoint_professional_suite>
</instructions>
