# Critics for a package

The setup is the sketch skill's (`../logo-concept-sketches/references/blind-viewers.md`): fresh `general-purpose` subagents with `model: "opus"`, three at once, given image paths and the prompt below and nothing else. Package critics need their own prompts because they judge pieces and a system, not marks.

## Keep them blind

- Copy what they read into a folder with a neutral name, `<scratchpad>/blind-<openssl rand -hex 4>/`: a path like `brand/casas/` tells them the concept before they look.
- Name each piece by what it is ("a tote bag"), never by what it should read as ("the stems become the handle"). Intent in the prompt is the reading they then report back.

## A round

One round is one rebuild and one pass of three critics that does both jobs:

1. **A/B** on every piece that changed: `node ../logo-concept-sketches/scripts/ab.mjs pairs.json <blind dir>` with each pair's before and after PNG.
2. **System score**: the board PNG of the whole package as it would stand if every after won.

The after version stays when two of three critics pick it. A tie, a split or a loss keeps the before, and "lost its last A/B" means any of those. A change shared by several pieces (the lettering, the palette) is tested once, on the piece that shows it largest (the primary lockup), and the winner then goes everywhere.

Round 1 has nothing to compare, so it is the score prompt alone.

## Score prompt (round 1)

```
You are an identity design director at the level of Allan Peters, Pentagram or Koto, judging a brand package built around one logo mark. Read every image in <blind dir>:
<one line per image: "<file>: <what it is>">

For each piece: a score out of 10 (10 is a case study a top studio would publish, 5 is a competent template, 1 is clip art), a fit score out of 10 for this feel: <the brand's temperature> (say if anything feels creepy, cold or smug), and the one change that would move it up the most: which part, what is wrong, what to do.

Then the system: does every piece look built from the mark's own geometry by one designer? Score the system out of 10. What would a studio at that level do with this mark that the package does not?

Red flags, for every piece including its whole silhouette: anything that resembles, even loosely, genitals or anything phallic, a body part, a sexual term or acronym spelled by letters, a hate symbol, a religious symbol, a weapon, a rude gesture or mockery of a group. Say which piece and how strong. Be blunt. Read-only: edit nothing.
```

## A/B prompt (round 2 on)

```
You are an identity design director at the level of Allan Peters, Pentagram or Koto. <N> pairs, each two versions of one piece of a brand package, and one board of the whole package. Read every image in <blind dir>.

<one line per pair: "Pair N: <what the piece is>">
board.png: the whole package

For each pair: the winner, a score out of 10 and a fit score for <the brand's temperature> for each version, one line on why, and "tie" if they are within half a point. Name the one change that would most improve the winner. Then score the system on the board out of 10 and name what holds it back most. Red flags in any image, as above: <paste the red-flag paragraph>. Read-only: edit nothing.
```

## Using the answers

- Every change two critics agree on goes into the next rebuild. Log every reverted change with the critics' words.
- An after that wins on the score but drops the fit median loses: a package that gets cleverer and colder has gone backwards.
- Each A/B win is local; the board decides. When the system median falls after a round whose changes each won their pair (two packages fell from 7.5 to 6.5 this way), the hand-off is the board from the best-scoring round, and the later state is kept beside it as `-v2`.
- Red flags follow the sketch skill's cut rule. A body reading counts as its own category, and two viewers naming different body parts for one shape is two of one category. A flag that shows up only in a turned view of a pattern whose copies never turn is a note, not a cut.
- Run the identity viewers (`../logo-concept-sketches/references/rubric.md`) once on the primary lockup in round 1: a package cannot add what the mark does not say, and the result goes in the report beside the scores.
- A recurring gap the vector scenes cannot close (two rounds of "flat diagrams, no material") is the ceiling of this method, not a fix to chase: report it.
