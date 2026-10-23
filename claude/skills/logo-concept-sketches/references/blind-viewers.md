# Blind viewers

The designer is the worst judge of what a sketch shows: they know what it is meant to be. A blind viewer is a fresh `general-purpose` subagent with `model: "opus"` that gets only image paths and the prompt below. No brand name, no word list, no labels, no reasons. Render its images with `--blind` (`sheet.mjs` and `lookagain.mjs`), so cells carry numbers and nothing else.

Send the same prompt to three viewers at once. Readings that two of three name unprompted are real; a reading only one names is a lead to check yourself.

A red flag cuts the cell when two or more viewers flag the same category (genital, hate symbol, religious symbol, weapon, gesture, gang sign, mockery), or one viewer calls it clear or strong. Discount a flag the viewer itself calls very faint. A single loose flag stays as a note on the cell and gets checked again after refinement. Viewers also name cultural readings outside the list (a wire coat hanger as a protest symbol, a tombstone); pass those to the user, who decides.

Read the gap-filled and upside-down views as hard as the drawn one: a mark reversed out of a dark ground is its gap view. Caricature turns up there: a face drawn in light features on a dark disc read as blackface, and a wide flat brim over a round head as a conical-hat caricature, both cut. For a brand that serves children, add a **safeguarding** category to the prompt and cut by the same rule: an adult figure joined to a child figure below the shoulder read as joined at the hip, and a lone child on a bed read as a safeguarding image.

## Viewer prompt

```
You are looking at numbered sketches of possible logo marks. Read each image with the Read tool:

<one line per image path>

<If the images are look-again pages, add: "Each numbered row shows one sketch four ways: as drawn, its enclosed gaps filled black, then both of those upside down.">

For every number, answer in this order:
1. What you see, first reading first. Up to three readings, including what the shape looks like turned, mirrored, or read through its gaps. Name objects, letters, numerals, animals, symbols: whatever is actually there.
2. Red flags: does it resemble, even loosely, any of these: genitals or anything phallic; a swastika or any hate symbol, including rotational four-arm shapes and runes; a religious symbol (cross, crescent and star, star of David, and so on); a weapon; an obscene or rude gesture; a gang sign; anything mocking a group of people<for a children's brand, add: "; any contact between an adult and a child that a parent would object to">? Say which, and in which view.

Keep each number to two or three lines. Report what you see, not what you think it is meant to be. Read-only: edit nothing.
```

## Using the answers

- **Look again:** add every reading two or more viewers named, and that touches a word in the brand-notes list (cut words included), to the finds sheet.
- **Aha test:** a concept passes when two of three viewers name its intended double reading unprompted.
- **Red flags:** a cutting flag removes the cell and every variant built from the same shape arrangement (two balls with a shaft between them stays phallic however it is dressed). Log it in the found-shape ledger with the viewer's words. A cutting flag is settled by cutting, never by arguing it away.

## Critic prompt (refinement rounds)

Same blind setup: fresh `general-purpose` subagents with `model: "opus"`, numbers-only sheets, three at once. They also get one image of the bar: a grid of marks by the designer the work aims at (for Peters, his published daily-logo grids). Reuse the prompt verbatim every round, so scores compare. When no image of the bar exists, describe the bar in the same words every round: scores then compare within the run only. The wider scores (readability, distinctiveness, simplicity) and the identity viewers are in `rubric.md`.

```
You are a design director judging numbered logo-mark sketches. Read both images with the Read tool:

<bar image path>  (the bar: <one line: whose marks these are>)
<round sheet path>  (the sketches to judge, numbered)

Answer, for every number:
1. What you see, first reading first, up to three readings (including upside down or through its gaps).
2. A score out of 10 against the bar: 10 would sit comfortably in that grid, 5 is a competent stock icon, 1 is clip art.
3. A fit score out of 10 for this feel: <the brand's temperature>. Say plainly if anything feels creepy, cold or smug.
4. The one change that would move it up the most. Be concrete: which part, what is wrong, what to do.
5. Red flags: does it resemble, even loosely, genitals or anything phallic, a hate symbol (including rotational four-arm shapes), a religious symbol, a weapon, a rude gesture, a gang sign, or mockery of a group? Say which.

Then, overall: which three numbers are closest to the bar, and what do the strongest marks in the bar do that these do not? Be blunt. Read-only: edit nothing.
```

Take each "one change" that two critics agree on into the next round. A round's result is the median score of its best mark; refinement continues while that number rises.

Scores drift with the sheet: the same mark scored a median of 7 on one sheet and 6 on a harsher one. Once a mark has passed, put it on every later sheet unlabelled as the **anchor**, and judge the rest against it: a concept passes when its median is 7 or more, or at least the anchor's median on the same sheet.

## Keep-the-winner A/B (every refinement round)

A revised variant replaces the one before it only when it wins blind. Build the pairs with `node scripts/ab.mjs pairs.json <dir>`: it shuffles before and after into `pairN-a.png` / `pairN-b.png` and writes `<dir>.mapping.json` beside the folder, which never goes to the critic. The round's three critics take the pairs in the same prompt as the sheet, so one set of three does both jobs; append:

```
Then <N> pairs, each two versions of ONE logo mark. Read every image in <dir> (pairN-a.png and pairN-b.png).

<one line per pair: "Pair N: it should read as <the pair's says line>">

For each pair: the winner, a score out of 10 against the bar and a fit score for each, and one line on why. If they are within half a point, say "tie". Then any red flag in either version.
```

The after version stays when two of three critics pick it and its fit median holds. A tie or a loss keeps the before version, and the change goes in the found-shape ledger with the critics' reasons.

## Running blind agents

- **Images** sit in a folder inside the workspace with a neutral name (`blind-<hex>`), not the project path: the Read tool refuses `/tmp`, and a path naming the brand tells viewers the answer.
- **Replies** cut off near 4,000 characters are lost. Ask for two or three lines per number, and write each batch's answers to files before the next batch starts: one run lost a whole critic round this way.
- **Calls** carry three agents each and finish inside about eight minutes; the runs that died were the ones blocked longest. Append a line to a `STATE.md` after every stage, so a killed run resumes from disk and no completed round is repeated.
- **Claims** about a file or a fix are checked on disk: two helper agents reported fixes that never touched the file.
