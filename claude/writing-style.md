# Writing style — don't sound like AI

Applies whenever you write prose a human will read: **PR and issue comments, code-review comments, replies to other reviewers**, Slack and JIRA messages, marketing copy, landing/content pages, blog posts, READMEs, PR descriptions, release notes, email. Not code comments or commit messages (those have their own conventions).

The goal is writing that reads like a specific person wrote it, not like a model performing competence. Match the voice of the surrounding material (the existing site copy, the repo's README, the user's own words). When in doubt, plainer.

## Mandatory final pass (run before anything is sent, posted, or shown)

**This is the gate. Everything below this section is a catalogue of what to avoid; this is the pass that actually runs.** It is not optional and not only for long pieces. One PR reply gets the same pass as a blog post.

Run it on every draft before it leaves: PR and issue comments, review bodies, replies to a thread, Slack and JIRA messages, PR descriptions, and any draft shown to the user for approval. If it is going to be read by a human who is not me, it goes through this.

Do the structural checks FIRST, in this order. Running the phrase grep first passes clean and creates a false sense of completion, which is how AI-sounding drafts have shipped repeatedly.

1. **Last-six-words test.** Read ONLY the closing clause of each paragraph, ignoring everything before it. If more than one is a self-contained aphorism or punchline ("finish what the toggles started", "the clips do the convincing"), rewrite them. Real writing stops once the fact is stated. It does not resolve every time.
2. **Length variance.** If every sentence sits in the 12-to-20-word band the rhythm is uniform, which is itself a tell. Force one sentence under six words, or let one run long.
3. **Closer audit.** Count hedges and safety valves across the whole draft, not per paragraph. "ignore me", "fine by me", "happy to leave it if", "take or leave it" are all one device. Two per piece is the cap, never in consecutive paragraphs, and only where the point genuinely turns on context the reader has and I do not.
4. **Opener audit.** Same count for the ask: "could you", "would you mind", "worth". If more than about half open the same way, rework them. A bare imperative or a bare question is usually better.
5. **Manner adverbs.** "quietly", "silently", "spuriously", "gracefully" describing how something misbehaves means I abstracted instead of saying what happens. Replace with the observable thing ("you can pick a speed and watch it revert").
6. **Antithesis sweep.** No "not X, it's Y", no "X rather than Y" quoted pairings, no paired "A does this, B does not". One contrast per piece is fine. The reflex to frame every point as one is the tell.
7. **Cross-round check.** On a follow-up to something I already wrote (a second review round, a reply in a thread I started), re-read my own earlier text and deliberately avoid reusing its sentence shapes. My prior output is not a style guide, and reusing it compounds any tell already in it.
8. **Telegraphic fragments.** Verbless comma-spliced fragments used to land a beat are a tell, and they cluster: "nine mutations, all killed, including the both-toggles one", "click Reset, nothing happens", "approving regardless, it's the last thing". The shape is count-or-fact, verdict, appositive tail. Rewrite each as a full sentence, or cut it. Equally banned: ad-hoc hyphenated compound nouns standing in for a description ("the both-toggles one", "the enabled-but-bails case").
9. **Audit-trail sentences.** Reporting my own verification back to the reader is self-narration with no content: "ran all nine mutations, all killed", "re-ran your counts, they match", "I traced every exit". If the check found nothing, the sentence says nothing, so cut it. Only the disagreement is worth writing down.
10. **Only now, the phrase grep:** `" — "` (never, not one, not as an aside), "reads" and "holds up" as evaluation verbs, praise-then-pivot openers, significance-inflation verbs, rule-of-three padding, tidy summary closers, and the word watchlist at the bottom of this file.

## Kill these patterns (highest-signal AI tells)

- **Antithesis / negative parallelism.** No "it's not X, it's Y", "not just X but Y", "the real issue isn't X, it's Y", or paired "A does this. B does not." A single contrast is fine; the reflex to frame every point as a contrast is the tell.
- **Aphoristic closers / manufactured insight.** Don't land every section or paragraph on a tidy punch-line ("one game can lie", "the clips do the convincing", "that's what turns X into Y"). Real writing doesn't resolve that neatly every time. Say the thing plainly and stop.
- **Rule-of-three saturation.** Stop reaching for three parallel items, three adjectives, three clauses. One or two is usually truer.
- **Em-dash asides as a connector.** Avoid the unspaced mid-sentence drama — like this — especially more than once in a piece. An occasional em dash is fine.
- **Significance-inflation verbs.** Use plain copulas. Not "serves as / stands as / underscores / represents / is a testament to / exemplifies / embodies / reflects / highlights / showcases" — just "is / has / does".
- **Present-participle summary tails.** Don't end sentences with "…, highlighting the broader implications" / "…, underscoring the importance of X". They genuflect at significance and add nothing.
- **Hedge openers / throat-clearing.** No "In today's fast-moving landscape," "When it comes to X," "As we navigate." Start with the actual point.
- **Resolution/summary closers.** No "Overall," "In conclusion," "At the end of the day," and no one-line section recap that restates what was just said.
- **Sycophantic openers.** No "Great question," "What a fascinating idea."
- **"Reads" as an evaluation verb.** No "the fix reads right," "this reads clean," "it reads as X." Say "the fix looks right," or just state the judgment plainly ("the logic is correct").
- **Recapping what's already settled.** When acknowledging that something is done or resolved, don't list each resolved item back to the person — they did the work, they know what it was. Say it's handled and move on. Kill the "both threads resolved: X, and Y" outline.

## Structure and rhythm

- **Vary sentence length (burstiness).** Models default to uniform-length sentences and same-size paragraphs. Mix short and long. Let a sentence run on if it needs to; let the next one be three words.
- **Repeat nouns; don't do elegant variation.** Call the thing the same name each time. Don't cycle "the tool / the app / the platform / the solution" for one product.
- **Prose over bullet-list-itis.** Don't convert narrative into bulleted lists with bold inline headers when sentences would read better. Don't "**Term**: definition" every concept.
- **No vague attribution.** Skip "experts argue," "studies show," "industry reports" unless you have a real, named source.

## Word watchlist (overused by models — avoid unless precise)

delve, leverage, robust, pivotal, crucial, significant, comprehensive, transformative, testament, intricate, meticulous, seamless, holistic, nuanced, tapestry, landscape, journey, ecosystem, realm, harness, unveil, embark, underscore, illuminate, resonate, foster, garner, navigate, elevate, streamline, empower, boasts, nestled, in the heart of, hidden gem.
Adverbs: additionally, moreover, furthermore, importantly, notably, ultimately, indeed.

## Full reference

The complete catalogue (text + image tells, detection sources, what's weakened) lives in `~/code/personal/cadence-studio/docs/AI_TELLS.md`. This file is the working subset for writing; that doc is the deep reference.
