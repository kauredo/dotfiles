# Rubric

Craft against the bar rewards cleverness and never asks whether a stranger can tell what the brand does. Score four things, then apply two gates. Same blind setup as `blind-viewers.md`: fresh subagents, numbers-only images, anchors on every sheet.

## Identity (run first, viewers, no scores shown)

Three fresh viewers per group of four or five marks, each mark large. Prompt:

```
These are possible logos. Read each image with the Read tool: <paths>.
For every number: if this were the logo of an app or company, what would it do? Give your best guess in a few words, and name any existing logo or brand it reminds you of.
```

Keep the field, the brand name and the project folder out of the prompt and the path. Code each guess against the brand's field: **hit** (names the field or its core activity), **partial** (right neighbourhood, generic: "chat app" for a speech brand), **miss**. Report hits out of 3 (a partial counts half) and every brand named, with counts. A brand or symbol named by two or more viewers is a **lookalike**: log it in the ledger, and run a trademark search before building on the mark.

## Critic scores (three critics, 1 to 10, medians)

Add these lines to the critic prompt in `blind-viewers.md`, after the fit item. Show the sheet at 24 and 48 px, in one colour, reversed on navy and in greyscale, so readability has something to judge.

```
3a. Readability: does it stay recognisable small, in one colour, reversed and in greyscale? Score out of 10.
3b. Distinctiveness: would you confuse it with a stock icon or a known brand? Name which. Score out of 10.
3c. Simplicity: could you redraw it from memory after five seconds? Score out of 10.
```

**Distinctiveness** takes a correction: subtract the largest number of identity viewers who named any one real brand or symbol. Critics scored the "up" marks 6 on distinctiveness while all three strangers said Upwork. Readability and simplicity move together (correlation 0.69), so read them as one **legibility** score. The old craft score stays on the sheet for comparison with earlier runs.

## Gates (pass or fail, never averaged)

- **Safety:** critics name any red flag in any view (drawn, turned 90°, upside down, reversed) with category and strength. The cut rule in `blind-viewers.md` applies.
- **Polish:** fails when two critics name the same concrete drawing fault (a lumpy curve, mismatched radii, a join that kinks). As a score, polish put 12 of 14 marks at 6 or 7 and separated nothing.

## Finalist bar

Identity at least 2 of 3, distinctiveness at least 5 after the correction, fit at least 7, legibility at least 7, both gates passed. This is a first guess: recalibrate it from the spread of each run. When one number is needed: (2 × identity on a 10 scale + 2 × distinctiveness + fit + legibility) / 6, with identity and distinctiveness doubled because they separated the field.

## Why these

Rescore of 14 candidates on 23 Oct (9 identity viewers, 9 critics, three anchors on every sheet): the order by craft did not predict the order by the wider rubric (rank correlation 0.22). The marks critics liked best drew "freelance jobs platform", "parking sign" and "payments"; three marks drew a speech or voice guess from every stranger. No mark met the finalist bar; the closest missed on legibility. Keep the working folder free of the brand name: one run's workspace instructions named it, and leakage into the guesses could not be ruled out.
