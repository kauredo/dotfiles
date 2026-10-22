# Patterns and graphic devices

A package needs two things from the mark: a **hero device** for card backs, totes, signage and posts, and a **texture** that tiles behind a website or a run of social posts. Build several candidates for each and let blind critics rank them (`critics.md`), with the plain repeat as the anchor. Every candidate goes through the red-flag screen in every orientation, because a tote is seen upside down.

## Moves, with what they scored on d-casa

Out of 10, three blind critics each.

- **Crop set (7, 7, 7; the set beat a single crop 2-1).** The mark at 6-7x, cropped by a frame: three to five fixed crops, one rule for all of them, one scale. The rule that held: the mark's distinctive part runs off an edge (the d's stems off the top), and a piece of what makes it this mark stays in frame (the house's bowl). Two chevrons alone read as Citroën's mark and as rank stripes; a crop that left the 45-degree lines pointing sideways read as a house on its side and as a trident.
- **Line field (6-6.5 boxed, 6.5-7 once unboxed; 3-0).** Peters' FM system: the mark's own lines run across the whole field at its stroke and gap, changing direction along a seam the way the mark does (the d's roof turning up into its stem), and the mark sits in a clearing. The clearing follows the mark's silhouette as one even offset, with its concave corners bridged; a rectangle read as "a sticker on wallpaper". Stripes at the mark's real stroke weight, not finer: fine stripes moiré on screens and clog in print. Drop the stubs the clearing leaves. `scripts/repeat.mjs` does not draw this; write it with `outline()` and `subtract()`.
- **Overlap (5-6).** Peters' Synergy: copies overlapping with transparency, fading, cropped. Warm in the accent colour, but transparency goes muddy and costs extra print colours: use flat colours, three copies at most.
- **Plain repeat (5, 5, 5).** `repeat.mjs`: reads as logo wallpaper. Keep it as the texture, with gaps of at least a mark's width.
- **Turns (3.5-4).** Turning the d 90 degrees made it an arrow, a play button, an iron; "a toppled house means the opposite of home". A letter beside its mirror or its 180-degree turn spells a pair (d made "dp" and "db"; viewers cut both). Four quarter-turns around a point make a pinwheel. Turn a mark only when it is not a letter and has no up, and screen the result.

Peters' published patterns (FM, Synergy) show line systems, overlaps, crops and a knocked-out logo; no turned or mirrored copies were found in them.
