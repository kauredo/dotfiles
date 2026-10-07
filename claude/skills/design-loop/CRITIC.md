# Critic prompts

Three prompts, each saved to a file in the loop's work folder and handed to a fresh `general-purpose` subagent with `model: "opus"`. The subagent gets the prompt path and the image folder, and nothing else: no code, no diff, no earlier critique, no reason for any choice. A critic that can see the reasoning agrees with it.

Fill the placeholders once, then reuse the round prompt **verbatim** every round. Only the ledger list grows. An edited prompt makes the scores incomparable, and the score trend is the only evidence the fixes work.

## Round prompt

```
You are a design director judging screenshots of <PRODUCT, one line: what it is and who uses it>. Read each image with the Read tool:

<one line per screenshot: path, then who the screen is for and which state it shows>

There are no reference images. Use these real products as the quality bar, from memory: <3 to 6 products in the genre>. They set a floor; do not hand back a copy of any of them.

Then read ~/.claude/critique-rubric.md and use its dimensions.

Answer, in this order:
1. Rank the audiences' screens against the bar products by polish and taste. For each, say where it would sit among those products.
2. One overall score out of 10: how close is this set to what a good studio would ship.
3. Does any screen look AI-generated? Name each tell you see.
4. For each screen, the two changes that would move it up the most. Be concrete: the element, what is wrong, what to do.
5. Anything that would confuse the person the screen is for.
6. For each graphic element, name the established UI pattern its shape quotes, and say whether that pattern's conventional meaning matches what this element is for.
7. These shapes have already been tried and rejected, with the reason each was rejected:
<the rejection ledger, one line each: screen, element, shape, reason; "none yet" on round 1>
Propose something that is none of them.

Be blunt. Do not soften.
```

## Direction re-ask (plateau)

```
You are a design director. Read each of these screenshots with the Read tool: <same list>.
Use these real products as the bar, from memory: <same products>.
Rank these audiences' screens against those products. Describe the design direction of the top-ranked bar product for each audience in two sentences: what is it committing to? Describe ours the same way, per audience. What would ours have to become to reach an 8, rather than what would you adjust? Name the elements that go, stay and arrive. Keep the brand: <the frozen list, one line>.
```

## Blind ranking (contested element or fan-out)

```
You are a design director. <N> separate comparisons, each a set of candidates for ONE element. Read every image in <folder>. Rank each set on its own, against <bar products>.

## Set 1: <element>
Images: <set-a.png ...>
What it must say: "<the sentence>". It must not read as <the patterns both rejected shapes quoted>.

For each set: rank best first with a score out of 10 each; for each candidate, the UI pattern its shape quotes and whether its meaning matches the sentence; for the winner, the one change that would make it better.
```

Candidates go in under neutral shuffled names (`set-a.png` …), with the mapping saved beside them and never shown to the critic. Say nothing about which one is live.
