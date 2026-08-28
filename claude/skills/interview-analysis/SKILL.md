---
name: interview-analysis
description: Score a technical interview transcript against the interview kits and produce a written evaluation (per-stage BARS ratings, TLDR, level call, hire recommendation). Use when given an interview transcript or recording notes and asked for feedback, a scorecard, an evaluation, or a write-up on a candidate.
argument-hint: "<transcript path> [--role full-stack|back-end|front-end|design|devops] [--prior <path>] [--script <path>] [--audience internal|candidate]"
---

Turn an interview transcript into the written evaluation an interviewer would file: per-question BARS ratings against the official rubric, a level call, and a hire recommendation.

The rubrics are not yours to invent. They live in `~/Notes/03_Resources/interview-kits/` and every rating you give must trace to a level definition in there.

**Read `reference/calibration.md` in this skill directory before assigning a single rating.** The answer keys tell you what each level contains. That file tells you where the levels actually sit, which is different and is where scoring goes wrong. The short version: a 5 is Senior II in practice and you will almost never award one, 4 is the Senior bar, and a fluent answer grounded only in what the candidate has already done is a 3 no matter how good it sounded.

> **Voice, read this first, it applies to every word of output.** The report goes to hiring managers and sometimes to the candidate. It must read like an engineer who sat in the room, not a model producing a rubric summary. Short declarative sentences. Plain words. State the judgment instead of dressing it up.
>
> **No em dashes in prose. Ever.** Not as an aside, not a "correct" one. If you are about to type ", " inside a sentence, split the sentence or use a comma. The only exception is the report's own title line and stage headings, which follow the format the team already files (`<Name>, Technical Interview (Part II)`). Inside a bullet or a sentence there is no exception.
>
> Banned outright: significance-inflation verbs ("demonstrates", "showcases", "underscores", "exemplifies"), "robust", "comprehensive", "crucial", "solid grasp of", rule-of-three padding, tidy summary closers, and "reads"/"holds up" as evaluation verbs. Do not write "he demonstrated strong understanding of X" when "he knows X, and he gave a real example" says it. Do not narrate your own process ("I traced every answer", "after reviewing the transcript").
>
> **Concrete over abstract, always.** "He reads the SQL first, counts the queries, then questions the data model" beats "shows strong performance instincts". "It took about thirteen minutes and I had to hand him the answer" beats "required significant guidance". The best line in a write-up is a specific behaviour with a number attached.
>
> **Sentence length must vary.** Some bullets are four words. Some run two clauses. Uniform 15-word bullets are the single loudest tell.
>
> **Mandatory final pass before you show anything:** the 14-check list in `~/.claude/writing-style.md` under "Mandatory final pass". Structural checks first, phrase grep last. Read that file if it is not in context. Running the grep first passes clean and feels finished, which is exactly how AI-sounding drafts have shipped before.

## Step 1: Resolve inputs

Argument: `$ARGUMENTS`

**Transcript** (required). A path to a `.csv`, `.vtt`, `.srt`, `.txt`, `.md`, `.docx` or `.pdf`. If no path was given, ask for one and stop. If the path is a directory or a glob matches several files, list them with modified times and ask which one; do not guess. When filenames differ only by a `(1)` / `(2)` suffix, those are usually re-downloads of the same recording or different rounds, so confirm rather than assuming the newest.

**Role** (`--role`, optional). Determines which kit you score against. Infer it from the transcript or the filename when not given ("Senior Full-Stack Engineer (Ruby on Rails)" → full-stack), then state the inference in one line before proceeding. Mapping:

| Role | Kit | Answer key |
|---|---|---|
| full-stack | `Full-Stack Engineer Kit.md` | `Full-Stack Answer Key.md` |
| back-end | `Back-End Engineer Kit.md` | `Back-End Answer Key.md` |
| front-end | `Front-End Engineer Kit.md` | `Front-End Answer Key.md` |
| design | `Design Engineer Kit.md` | `Design Engineer Answer Key.md` |
| devops | `DevOps Engineer Kit.md` | `DevOps Answer Key.md` |

**Prior-round notes** (`--prior`, optional). Earlier write-ups on the same candidate. Worth having: a gap that shows up in two independent rounds is a conclusion, and one round contradicting another is worth saying out loud.

**A prior write-up's claims about an earlier round are claims, not findings.** When a filed evaluation says "round 1 concluded the same" or "this was already flagged", that is an assertion about a document or a session you have not read. Ask for the earlier transcript or the earlier write-up and check it. A previous round's transcript often shows the interviewer's spoken verdict was warmer or vaguer than the later summary of it, and a level call may not appear anywhere in the recording at all. If you cannot verify it, report it as unverified rather than as corroboration. **Two rounds agreeing is the strongest signal an evaluation can carry, which is exactly why it must not be asserted on trust.**

**Interview script** (`--script`, optional). If the interviewer worked from a plan, it tells you what was meant to be covered, which is how you spot what got skipped.

**Audience** (`--audience`, optional, defaults to `internal`). `internal` is the filed evaluation: blunt, names gaps as gaps, records that you had to hand over an answer. `candidate` is feedback the person will read: same ratings, same named gaps, no commentary on how the interview felt to run and no hire language. Never guess this one. If the user's request suggests they want something to send the candidate and no flag was passed, ask which before writing.

## Step 2: Read the transcript in full, then the rubric

Read the whole transcript before scoring anything. Large files come back truncated, so keep paging with `offset` until you have reached the end. **Never score from a partial read.** A single exchange near the end can flip a rating, and the interviewer's own closing feedback (often the last few minutes) is the best calibration signal in the file.

Then read:

- `~/Notes/03_Resources/interview-kits/Evaluation Grids.md`: the competency and stage rows for this role. These are the scoring surface.
- The role's answer key, per-question level 1 through 5.
- The role's kit, when you need the interviewer guidelines or the intended stage order.

**Questions asked outside the role's own kit.** Interviews drift, and a good interviewer asks whatever the project needs. When an exchange has no matching question in the role's answer key (API versioning in a full-stack interview, a Kubernetes question in a back-end one), grep the other answer keys for it and score it against the rubric that actually covers it. Say which key you borrowed from in the report footer. Do not invent a rubric, and do not drop the exchange for lack of one.

**AI-Native Development** only has a rubric in the Design Engineer kit. Any role's interview may probe it, so borrow that one and note it.

## Step 3: Establish who is speaking

Do this before the evidence map, because every rating downstream depends on it and it is the easiest thing in the whole process to get silently wrong.

Auto-generated transcripts mislabel speakers, merge cross-talk into one turn, and sometimes attribute a whole passage to whoever spoke first. **If an interviewer's explanation lands under the candidate's name, you will score the interviewer's knowledge as the candidate's, and nothing later in the process catches it.**

From the opening minutes, where people introduce themselves, build a roster: each speaker label, their real name, and their role (candidate, lead interviewer, observer). Then:

- **State the roster in one line before scoring** so the user can correct you cheaply.
- **Sanity-check it against content.** The candidate answers questions and the interviewers ask them. A turn labelled as the candidate that asks a probing follow-up, or one that explains a concept the candidate elsewhere says they do not know, is mislabelled.
- **Flag low-confidence segments rather than scoring them.** A passage where you cannot tell who is talking is not evidence. Say so in the footer and score around it.
- **Note who else was in the room.** An observer who barely speaks still shapes the session, and a second interviewer's questions belong to them, not to the lead.

## Step 4: Build the evidence map

Before any rating exists, walk the transcript once and record, per topic:

- **What the interviewer actually asked**, including the follow-ups. The question that was asked bounds what you can score.
- **What the candidate said**, in enough concrete detail to quote or closely paraphrase later. Specifics are the whole value of the report.
- **Who supplied the answer.** This is the single most important column and the easiest to get wrong. Track whether the candidate arrived somewhere on their own, after a nudge, after a scenario was handed to them, or only after the interviewer said the answer out loud. **An answer the interviewer supplied is not evidence the candidate knew it.** A candidate whose first instinct was wrong and who was walked to the right answer over four exchanges scores on the first instinct, with the correction noted.
- **Time spent**, when the transcript has timestamps. "Thirteen minutes on one question with the answer handed over at the end" is a fact about the candidate, and it belongs in the report.
- **What the candidate volunteered unprompted.** Raising monitoring before being asked about it is worth more than answering a direct question about monitoring.
- **Honesty and bluffing.** Note every "I don't know" and every claim that outran the candidate's actual experience. Both are load-bearing. A candidate who never bluffs is a different hire from one who does, at the same score.
- **Whether the topic was actually probed.** An area the interviewer raised once and let drop is not a measured weakness. Mark it unprobed.

## Step 5: Fan out the scorers

Invoke one subagent per stage in the role's grid (typically 3 to 5: Personal ↔ Professional, the two or three technical stages, Advanced Deep-Dive, plus AI-Native when it came up). Send them **in a single message with multiple tool_use blocks** so they run concurrently. Use `subagent_type: "general-purpose"`.

Each scorer gets:

1. The transcript path, with an instruction to read it in full (paging past truncation).
2. The answer key path and the exact heading range for its stage's questions.
3. The path to `reference/calibration.md` in this skill directory, as required reading before it scores anything.
4. The speaker roster from Step 3 and the evidence map entries for its stage from Step 4.
5. The stage row and relevant competency rows from `Evaluation Grids.md`.
6. This instruction: **for each question, return the rating, the level-definition language that justifies it, the specific transcript evidence, and the single element that would have moved it one point up.** That last item is what makes the report useful to the candidate.
7. This instruction: **rate what the candidate produced unaided.** If the interviewer supplied the answer, the rating reflects where the candidate was before that, and the return must say so explicitly.
8. This instruction: **if a question in the kit was never asked, return it as unasked rather than inferring a rating from adjacent answers.**
9. This instruction: **check whether the stage's defining activity actually happened before returning a rating for the stage row.** Read the row's own level definitions and ask what behaviour they describe. If the row is written around observable hands-on work (locating code, writing or updating tests, verifying results, debugging live) and the interview only contained conversation, the row was not exercised. Return `not assessed` with the reason, alongside the individual question ratings. Do not convert conceptual answers into a number for a row that scores implementation.
10. This instruction: **if the questions asked do not belong to the stage they were nominally grouped under, say which competency row they actually exercise.** Interviewers ask in the order that suits the conversation, not the order the kit prints, and a well-run session often lands a whole block of questions somewhere other than where its heading suggests.

Tell the user which scorers you are running in one line.

## Step 6: Calibrate against inflation

Scorers are generous. They pattern-match a plausible-sounding answer to the level-3 text, then drift up from there. Before aggregating, re-read `reference/calibration.md` and then the transcript passage behind every rating of 3 or higher, and check five things:

- **Is this a 4 that should be a 3?** The default failure. A fluent, correct, experience-backed answer with no trade-off named and no measurement named is a 3. A 4 is the Senior bar and needs the rubric's differentiator actually present in the transcript. A 5 is Senior II and you should expect to award none.
- **Did the candidate get there first, or get walked there?** Re-read the exchange in full, not the scorer's summary. The most common single-rating error is scoring the end of a long exchange: the candidate's opening instinct was to hardcode the endpoint in twenty places, the shared wrapper appeared only after the interviewer pushed, and the rating belongs on the first instinct.
- **Is the rubric's named differentiator actually present?** Most level-4 and level-5 definitions turn on exactly one element: a metric or measurement tool, an invalidation strategy, a stated trade-off, a named framework, a number. Absent means capped, regardless of fluency.
- **Would this rating survive the candidate reading it?** Every rating must be defensible from a line you can quote. If you cannot point at the transcript, drop it to what you can point at.
- **Does the prose match the number, and if not, which one is wrong?** Usually the number. "His best answer of the session" is a relative judgment and does not lift an absolute rating, so expect to write admiring bullets under a 3. When they conflict, fix the prose by naming what capped the rating, not the rating by inflating it to match the praise.

Then one check on what kind of evidence each rating rests on. Not all evidence is the same weight, and the differences matter more than any single rubric reading:

- **Observed behaviour beats self-report.** Watching a candidate catch a problem in generated code is worth more than hearing them describe how carefully they review it. When both exist for one competency and they agree, say so. When the observed behaviour exceeds the description, that is a finding and it belongs in the write-up.
- **A failed direct probe beats an untested absence.** "Asked how it works and could not say" is evidence. "Never asked" is not. A stage that looks strong may only look that way because nobody tested the thing that would have broken it.
- **A first instinct beats a corrected answer**, which is already in the check above.
- **An interviewer's spoken verdict is not a level call.** Warm closing remarks are how people end a conversation. They are not a rating and must not be read as one.

Then two checks on the rows rather than the ratings:

- **Did each stage's defining activity actually happen?** Read the row's level definitions and ask what behaviour they describe. A row written around hands-on work (locating code, adding tests, verifying results, debugging) is not scoreable from conversation alone, and the practical exercise being skipped is the usual cause. Mark it `not assessed`, name the exercise that did not run, and put it at the top of `Not probed`. A skipped exercise on a Senior req is a larger hole than any single rating, because nobody watched the candidate write code.
- **Are the questions filed under the row they actually exercise?** The kit's stage headings describe an intended session, not the one that happened. When a block of questions sits under a heading whose row scores something else, move them to the competency row they genuinely evidence and record the move in the footer. Following the heading instead of the content produces a coherent-looking table measuring the wrong thing.

**Do not let one low rating drag a row its other questions earned.** Two clean 3s and a 2 is a 3 row with the 2 visible on its own line, not a 2 row. Averaging downward hides which specific thing was weak, which is the only part the reader can act on.

Record what you downgraded, reclassified, or overruled, one line each, in the report footer. The user needs to be able to overrule you back.

## Step 7: Separate the level call from the recommendation

Two independent questions, and conflating them is the classic failure of an interview write-up.

1. **Is this a hire?** Strong Yes / Yes / Neutral / No / Strong No.
2. **At what level, and on which track?** Per `reference/calibration.md`: a row of 3s is Mid, a Senior hire wants 4s, and 5s are Senior II. Nothing in these kits assesses L4 (Staff).

A candidate interviewing for Senior Full-Stack who scores 3s on back-end questions and 2s on everything front-end is not a weak Senior Full-Stack. They are a Mid Back-End, and the report has to say that rather than reporting a slightly-below-bar Senior. **Scoring against the requested title and never asking whether it is the right title is the most valuable thing an interview write-up can get wrong.** It is also the easiest to miss, because scoring every stage against the req feels like the job and produces a coherent-looking document with the wrong conclusion in it.

Two triggers that force this section to say something:

- **The ratings average at or below 3.** That is a Mid, stated as a Mid.
- **The ratings cluster on one side of the stack.** Strong back-end and weak front-end on a full-stack req is a track finding, not a spread of scores. Say which track.

Then say where the boundary of the candidate's experience falls, and whether it falls in the right place for this specific role. A candidate can be a genuinely good hire whose gaps sit exactly where the project needs strength, and that is a different recommendation from the same ratings with the gaps somewhere harmless.

### When you have more than one round

Verify any claim the later write-up makes about the earlier one first (Step 1). Then:

**Rounds usually complement rather than repeat.** Different interviewers ask different things, so the same competency row often has a rating in one round and no evidence in the other. Combine the coverage instead of averaging the rows. A row scored in only one round is still that row's best evidence, and a row no round exercised stays `not assessed` no matter how many sessions there were.

**When two rounds score the same competency differently, do not average and do not take the later one on seniority.** Work out what evidence each round had that the other lacked, then apply the hierarchy from Step 6. The usual shape: one round watched the candidate do the thing, the other asked a question that exposed a gap. Both ratings are locally correct. Name the process-level rating, say which round's evidence decided it, and keep the other round's finding in the write-up rather than discarding it, because a real positive that a later session had no way to observe is still real.

**The same weakness named independently by two interviewers who have not seen each other's feedback is the strongest finding an evaluation can produce.** Neither round shows it alone. Read both interviewers' closing remarks against each other, in their own words, and resist smoothing two different critiques into one: "go deeper when asked" and "volunteer breadth beyond your own lane" are different asks that can share a root. Say what the shared root is and quote both.

**Check whether feedback given in an earlier round was acted on.** If an interviewer named something to fix and the next round shows the same behaviour, that is a finding about coachability that outweighs any single answer. If it was acted on, say that too, because it is the best evidence of growth a process can generate.

## Step 8: Write the report

Output in chat, in this shape. It mirrors the format the team already files.

```
# <Candidate name>: Technical Interview <round, if any>

**Note:** Overall Recommendation is a <recommendation>, leveled as <level and track> rather than
<the level and track they interviewed for>.
(Drop the "rather than" clause when the level matches the role applied for.)

## TLDR

- <the one-line verdict: level, track, and the sharpest qualifier>
- <the pattern that explains most of the ratings>
- <the gaps that matter for this specific project, named>
- <weakest area>
- <behaviour worth recording: honesty, coachability, how they took feedback>

## <Stage name, from the grid>

**Rating<s>:** <Question or dimension> <n>/5<, one per question in the stage>

- <bullet: concrete behaviour, with the evidence in it>
- <bullet: what was missing, named specifically>

## <next stage>
...

## Competencies

| Competency | Rating | Basis |
|---|---|---|
| <competency row from the grid> | <n>/5 | <the stages that evidenced it, in a few words> |

## Final Summary

<Three to six sentences. What this candidate is. Where the boundary of their experience falls and
whether it falls in the right place for this role. The level and track you would hire at. The
recommendation, and what the next round should probe.>

## Not probed

<Every question in the kit that was never asked, and every topic raised but dropped too fast to
score. One line each. This is the agenda for the next round, so write it as topics to cover rather
than as apologies.>

## Footer
- Scored against: <kit name>, <answer key name>, Evaluation Grids, calibration.md
- Speakers: <label → name, role> (note any segment you could not attribute)
- Borrowed rubrics: <question> from <other key> (omit when none)
- Downgraded in calibration: <rating> → <rating> on <question>, <why> (omit when none)
- Cross-round: <competency> scored <n> in <round> and <n> in <round>; process rating <n>, decided by <which evidence> (omit when single-round)
- Unverified: <claim a prior write-up makes that you could not check, and what would settle it> (omit when none)
```

Rules for the body:

- **Every stage rating gets at least one bullet that could only have been written about this candidate.** A bullet that would fit any candidate at that score is filler. Cut it.
- **Name the gap, do not gesture at it.** "He said nothing about transactions, idempotency, CSRF or audit logs" works. "Limited depth on data safety" does not.
- **Give credit where the answer was genuinely good**, in the same plain register as the criticism. Do not soften a weakness by pairing it with a compliment in the same sentence.
- **Say what was unprobed, twice.** Once in the stage bullet where it matters, in the interviewer's own voice ("I did not push him back to it, so treat this half as partly unprobed"), and once in the `Not probed` section as a flat list. An area the interview never reached is a hole in the evidence, not a candidate weakness, and a write-up that scores one as the other loses the reader's trust in all the other ratings.
- **The competency table is a roll-up, not new scoring.** Each competency row in the grid cuts across several stages. Derive its rating from the stage ratings that evidenced it and say which ones in the Basis column. When a competency was never meaningfully exercised, write `not assessed` rather than averaging your way to a number.
- **`not assessed` applies to stage rows too, and it is not a failure of the report.** A row whose defining activity never happened gets `not assessed` plus the reason, in the table and again in `Not probed`. Writing a number there because the table looks incomplete without one is the worse outcome: it reads as measured and it is not.
- **When a question block was refiled under a different competency, say so where the ratings appear**, in one italic line under the heading. The reader needs to know why those questions are not where the kit would have put them.
- **Report in English** even when the interview was in another language. Translate quoted specifics rather than dropping them, and where a quote is load-bearing for a rating, keep the original in parentheses so the user can check the reading.
- **Keep the whole report to roughly two pages.** Ratings plus bullets, no restating the transcript.

### When `--audience candidate`

Same ratings, same named gaps, same specificity. What changes:

- Drop hire language entirely. No recommendation, no level-and-track call, no Strong Yes / Yes scale.
- Drop commentary on how the session felt to run. "It took thirteen minutes and I had to hand him the answer" becomes "this one took a while to land, and the piece that was missing was X".
- Keep the "what would have moved this up a point" element from every scorer and make it the most prominent part of each section. That is the entire value of the document to the person receiving it.
- Keep the honest gaps. Softening them wastes the candidate's time, which is the one thing this document exists to save.

## Step 9: Offer the file, do not write it uninvited

Show the report in chat first. Then offer to save it as markdown, defaulting to `~/Downloads/<Candidate>, Technical Interview<round>.md`.

**Never write a candidate evaluation into `~/Notes/`.** That vault is a git repository that syncs, and named candidate evaluations were deliberately kept out of it (see `0_Interview_Kits_Index.md`). Downloads or a path the user names, nothing else. Same reason: do not publish one as an artifact unless the user explicitly asks.

## Important

- The rubric is the authority. Any rating you cannot trace to a level definition in the answer key is your opinion, and it does not go in as a number.
- Do not soften ratings because the candidate seems likeable, and do not harden them because a gap is easy to write about.
- If the transcript is too short or too shallow to score a stage, say so and score nothing there. A round that produced insufficient evidence is a real and reportable outcome.
- When the interviewer gave the candidate live feedback near the end, read it closely and weigh it. They were in the room. Where your read differs from theirs, say where and why rather than quietly overriding them.
