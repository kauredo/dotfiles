# Blind viewers

The designer is the worst judge of what a sketch shows: they know what it is meant to be. A blind viewer is a fresh `general-purpose` subagent with `model: "opus"` that gets only image paths and the prompt below. No brand name, no word list, no labels, no reasons. Render its images with `--blind` (`sheet.mjs` and `lookagain.mjs`), so cells carry numbers and nothing else.

Send the same prompt to three viewers at once. Readings that two of three name unprompted are real; a reading only one names is a lead to check yourself.

A red flag cuts the cell when two or more viewers flag the same category (genital, hate symbol, religious symbol, weapon, gesture, gang sign, mockery), or one viewer calls it clear or strong. Discount a flag the viewer itself calls very faint. A single loose flag stays as a note on the cell and gets checked again after refinement. Viewers also name cultural readings outside the list (a wire coat hanger as a protest symbol, a tombstone); pass those to the user, who decides.

## Viewer prompt

```
You are looking at numbered sketches of possible logo marks. Read each image with the Read tool:

<one line per image path>

<If the images are look-again pages, add: "Each numbered row shows one sketch four ways: as drawn, its enclosed gaps filled black, then both of those upside down.">

For every number, answer in this order:
1. What you see, first reading first. Up to three readings, including what the shape looks like turned, mirrored, or read through its gaps. Name objects, letters, numerals, animals, symbols: whatever is actually there.
2. Red flags: does it resemble, even loosely, any of these: genitals or anything phallic; a swastika or any hate symbol, including rotational four-arm shapes and runes; a religious symbol (cross, crescent and star, star of David, and so on); a weapon; an obscene or rude gesture; a gang sign; anything mocking a group of people? Say which, and in which view.

Keep each number to two or three lines. Report what you see, not what you think it is meant to be. Read-only: edit nothing.
```

## Using the answers

- **Look again:** add every reading two or more viewers named, and that touches a word in the brand-notes list (cut words included), to the finds sheet.
- **Aha test:** a concept passes when two of three viewers name its intended double reading unprompted.
- **Red flags:** a cutting flag removes the cell and every variant built from the same shape arrangement (two balls with a shaft between them stays phallic however it is dressed). Log it in the found-shape ledger with the viewer's words. A cutting flag is settled by cutting, never by arguing it away.
