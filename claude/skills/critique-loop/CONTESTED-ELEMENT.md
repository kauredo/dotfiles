# Contested element

Reached from triage in [`SKILL.md`](SKILL.md): a finding reverses an applied change (one element has been through two shapes and a critic rejected each in favour of the other), or it reopens a settled entry with a new reason. Sequential rounds cannot settle this. Each critic sees one shape with no memory of what was already tried, so it optimises locally and hands back the shape its predecessor rejected.

The fix is to stop asking *is this good* and start asking *which of these is best*. A critic comparing shapes side by side picks a winner on the merits. A critic seeing one shape invents a preference.

Scope is the element, not the screen. Everything around it is settled and stays frozen, which is what keeps this cheap: [`REDESIGN-FANOUT.md`](REDESIGN-FANOUT.md) buys a direction for a whole surface, this buys one shape.

## 1. Name what the element must say

Write the sentence before generating anything. Not what the element looks like: what a reader must take from it, and what they must not.

Both rejections are evidence for this sentence, so mine them. A reversal almost always means each shape **quoted** an established pattern whose conventional meaning fights the intent, and the two critics caught different quotes. Seven filled slots quote a weekday tracker; one filled track quotes percent-complete. Name the patterns both shapes quoted and add them to the list of readings to avoid.

## 2. Generate candidates

Three or four, each a genuinely different structure rather than a restyle of one. Include:

- **Both contested shapes**, as they stand. One of them may simply win once a critic can see the alternative.
- **A shape that quotes neither pattern**, built against the list from step 1.
- **No graphic at all**, carrying the meaning in type and copy alone. Cheapest to build, impossible to misread, and it wins often enough to be worth a slot every time. It also sets the bar: a graphic that cannot beat plain text is not earning its space.

Build them as real stories with the real component library and seeded data, the same states the loop is already capturing. A candidate that is already real code is one you merge rather than re-implement.

## 3. Rank blind

Follow **Rank blind** in [`REDESIGN-FANOUT.md`](REDESIGN-FANOUT.md): neutral file names, shuffled order, one fresh critic, nothing said about which is live or which were rejected before.

Two additions here. Give the critic the sentence from step 1 and ask it to rank against that sentence rather than on taste. And ask it, for each candidate, what established pattern the shape quotes and whether that pattern's conventional meaning matches the sentence. That question is what a sequential round keeps discovering one shape too late.

## 4. Resolve

The ranking decides it. Take the winner back into [`SKILL.md`](SKILL.md) as a round, add it to the ledger's **settled** list with its score and the reason it won, add every losing shape to **rejected**, and delete the rest.

Hand the choice to the user when the top two score within a point of each other, and give them the ranking and the reasoning rather than the question you started with. A tie between two shapes a critic could compare is a real preference call; the deadlock that sent you here was not.

Record the winner where the project keeps design decisions when the element is load-bearing enough that someone will re-litigate it: what won, what else was on the table, and which reading each loser invited.
