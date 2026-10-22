# Lettering from the mark

A wordmark set in a stock face shares nothing with the mark; critics scored Poppins Bold beside the d-casa mark 3-4. Drawing the name takes the mark's rules and applies them to every letter:

1. **One stroke.** A line mark gives its own stroke. A solid mark has no stroke, and a letter stroke of 1u (its narrowest ink) left the letters "a quarter of the mark's mass" for three rounds; size by mass instead: the mark as tall as the ascender, an x-height of about 4.5 strokes.
2. **The mark's ends**: square ends give butt caps and mitred joins; round ends give round caps and joins.
3. **The mark's corner rule**: where the mark turns, the letters turn the same way. The d-casa mark slopes only at its roof, so its letters cut their top corners at 45 degrees and keep the bottom ones square.

Square monoline letters with cut corners read as a techno display face (Eurostile, Orbitron, "LCD, crypto") to every critic on both runs, at every weight, and fight a warm palette. On d-casa the drawn name lost its blind ranking 3-0 to Space Grotesk Light (7 against 5.5), a grotesk whose light stroke matched the mark's line and whose flat-tailed g echoed its floor. That is why step 2 ranks the drawn name against three or four typefaces chosen for stroke weight and terminals before anything carries it.

## Letters and spacing

- Give every letter a shape no other letter shares. A one-storey a drawn like the o read "ogentes".
- Word space: the white between the last letter of one word and the first of the next is about 2.4 times the letter gap. Twice the gap ran the name into one word; three times read as two logos.
- If the mark is a letter of the name, the primary lockup lets it **be** that letter, sized to the tallest lowercase letter of the word (the t), not past the ascender line: taller, it read as an icon pushed against the type. A lockup with the mark beside the full word is cut (the d-casa mark before "dois" read "ddois").

## Worked alphabet: dois agentes (line mark)

Stroke units, stroke = 1, y down, the default grid of `lettering.mjs`: ascender top 0, x-height 5, baseline 14, descender to 18. A centerline 0.5 in from an edge puts the stroke's outer edge on it. Letter gap 1.75.

```js
const bowl = "M6 5.5L2 5.5L0.5 7L0.5 13.5L5.5 13.5";
export const ALPHABET = {
  d: { w: 6, d: ["M5.5 0L5.5 14", bowl] },
  a: { w: 6, d: ["M0.5 5.5L5.5 5.5L5.5 14", "M5.5 9.5L2 9.5L0.5 11L0.5 13.5L5.5 13.5"] }, // two-storey
  g: { w: 6, d: ["M5.5 5L5.5 17.5L0 17.5", bowl] },
  o: { w: 6, d: ["M2 5.5L4 5.5L5.5 7L5.5 13.5L0.5 13.5L0.5 7Z"] },
  e: { w: 6, d: ["M1 9.5L5.5 9.5L5.5 7L4 5.5L2 5.5L0.5 7L0.5 13.5L6 13.5"] },
  n: { w: 6, d: ["M0.5 5L0.5 14", "M1 5.5L4 5.5L5.5 7L5.5 14"] },
  i: { w: 1, d: ["M0.5 5L0.5 14", "M0.5 2L0.5 3.5"] },
  s: { w: 6, d: ["M6 5.5L2 5.5L0.5 7L0.5 9.5L5.5 9.5L5.5 13.5L0 13.5"] },
  t: { w: 5, d: ["M1.5 2L1.5 13.5L5 13.5", "M0 5.5L5 5.5"] },
  " ": { w: 0.75, d: [] },
};
```

A filled shape goes in `fill`, unioned as drawn: `i: { w: 1, d: ["M0.5 5L0.5 14"], fill: ["M0 3.5V2.5L0.5 2L1 2.5V3.5Z"] }` gives the i a house for a dot.
