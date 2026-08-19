# Calibration

Read this before assigning any rating. The rubric text in the answer keys tells you what each level
contains. This file tells you where the levels actually sit, which is not the same thing and is where
scoring goes wrong.

No rubric text is reproduced here. The rubrics live in the vault at
`~/Notes/03_Resources/interview-kits/` and are the authority on content.

## Where the numbers actually sit

The kits document the scale as 3 = Mid = L2 and 5 = Senior = L3. That is the paper version. The
practical calibration, from the interviewer who runs these kits:

> "BARS é abstracto, sendo que um 5 corresponde a Senior II praticamente."

A 5 is Senior II territory. Treat the working scale as:

| Rating | What it means in practice |
|---|---|
| 1 | Below bar. Cannot engage with the question. |
| 2 | Approaching Mid. Has fragments, cannot assemble them, or gets there only when handed the answer. |
| 3 | **Mid.** A complete, correct answer drawn from work they have actually done. |
| 4 | **Senior.** The correct answer plus the trade-off, the measurement, and the reason. This is the hiring bar for a Senior req. |
| 5 | **Senior II.** Rare, and mostly unreachable in a 90-minute conversation. Reserve it. |

Three consequences that change how you score:

**A candidate averaging 3 is a competent Mid, not a failing Senior.** Do not write up a row of 3s as
"slightly below the Senior bar". Write it up as Mid, and say so in the level call.

**A strong answer grounded only in lived experience caps at 3.** This is the single most common
inflation error. When a candidate answers fluently, with a real example from their own codebase, and
nothing in the answer names a trade-off or a way to tell whether it worked, that is a 3. It is a good
3. It is not a 4.

**"His best answer of the session" is a relative judgment and does not move the number.** Being the
strongest answer in a weak session is still whatever it is on the absolute scale. Expect to write
genuinely admiring bullets under a 3, and do not talk yourself into a 4 to make the prose and the
number agree. Fix the prose instead, by naming what capped it.

## What lifts a 3 to a 4

Never more facts. Listing six caching techniques instead of three is still a 3. What lifts it:

- **The trade-off named.** An index is a write cost paid forever for a read you may not be making.
- **The measurement named.** Which metric moves, and how they would know it worked. p95, not "faster".
- **The invalidation, the failure mode, the thing that breaks.** Anyone can add a cache. What happens
  when the underlying data changes is the question.
- **Grounded in something they shipped, with the outcome.** Not "we used Redis" but what it fixed and
  what it cost.

Most level-4 and level-5 definitions in the answer keys turn on exactly one such element. Find that
element in the rubric, then check whether it is present in the transcript. If it is absent, the
rating is capped regardless of how fluent the answer sounded.

## BARS is abstract, so anchor to the differentiator

Two interviewers reading the same answer will land on different numbers if both are scoring overall
impression. The rubric's named differentiator is the only stable anchor. Score against that specific
element, quote the line that satisfies or misses it, and the rating becomes defensible instead of a
vibe.

## Worked example

An anonymized write-up filed after a real second-round technical interview. Senior Full-Stack (Rails)
req. Read it for two things: the register of the prose, and the fact that the highest rating in the
whole document is a 3.

---

**Note:** Overall Recommendation is a yes, leveled as Mid Full-Stack Engineer rather than Senior
Full-Stack Engineer.

**TLDR**

- Solid Mid backend engineer. Not a Senior, and not full-stack.
- He is strong on anything he has done before (error handling, production monitoring and query
  performance were all good answers), and weaker on anything he has not done before. The answers
  simply stop there.
- Two gaps matter for this project. He does not understand API backward compatibility very well, and
  he had no answer for protecting write operations from data corruption.
- Frontend is his weakest area. He says so himself.
- Honest all session. He never bluffed once. He asked for feedback on his own performance, then
  committed to fixing the gap I pointed out.

**AI-Native Development.** Rating: 3/5

- Uses an agentic CLI every day. Wrote his own rules file describing how he wants the agent to work.
- One rule came from a real incident. Two developers created migrations with the same timestamp, so
  now he forces the framework to generate them.
- He reviews every file the agent writes. He asks about syntax he does not recognize. He wants to
  defend the code as if he wrote it himself.
- He could not explain how his own rules file gets loaded. That is a basic gap.
- He has built no commands, hooks or MCP integrations. He does not use subagents. He will not let the
  agent commit, which costs him speed without buying much safety.

**Web Fundamentals.** Ratings: Caching and Performance 3/5, Data and Persistence 3/5,
API Versioning 2/5

- Good performance instincts. He reads the SQL first, counts the queries, then questions the data
  model. Caching comes last. He gave a real example from his own codebase.
- He knows one caching strategy: Redis. No HTTP caching, no CDN. He named no measurement tools at all.
- The database write flow was his cleanest answer. Correct and fluent from form to response, with no
  help from me.
- Versioning is a real weakness. He only knows URL versioning. He could not follow the problem of an
  old mobile app calling a changed endpoint. It took about thirteen minutes and I had to hand him the
  answer.

**Advanced Deep-Dive.** Ratings: System Design 2/5, Testing and Quality 2/5

- On scaling he named read replicas and a message bus. Then he stopped and said the rest is DevOps
  work.
- He never mentioned caching or a CDN, even though we had discussed Redis earlier. Load balancers
  came only after I pushed.
- On quality he answered about process rather than testing. That part was strong. Code owners per
  service, mandatory cross-team review, linting and automated review tools.
- He only mentioned unit tests. No integration tests, no end-to-end tests, no frameworks named. I did
  not push him back to it, so treat this half as partly unprobed.

**Final Summary**

Candidate is honest, easy to talk to and clearly coachable. Where he has hands-on experience he
reasons well and brings real examples. Where he does not, he has little to offer, and he says so
rather than bluffing. For this role that boundary falls in the wrong places: API compatibility, write
safety, architecture and the whole frontend. He is a Mid backend engineer, which is what round 1
concluded too. Recommend advancing him to the management round as a Mid Back-End, not as a Senior
Full-Stack.

---

## What to copy from that example

**The ceiling.** Nothing above 3, in a write-up that calls three separate answers good. That is
correct under this calibration, not an oversight.

**Bullets that carry a fact, not an assessment.** "He reads the SQL first, counts the queries, then
questions the data model" is a behaviour. "Shows strong performance instincts" is a label. The first
one is why the reader trusts the rating.

**Numbers where they exist.** "About thirteen minutes and I had to hand him the answer" is worth more
than any adjective.

**The gap named as a list of absences.** "He said nothing about transactions, idempotency, CSRF or
audit logs" beats "limited depth on data safety", because the reader can check it.

**A gap stated flatly, then the credit stated flatly.** No pairing a weakness with a compliment
inside one sentence to soften it. Separate bullets, plain register in both.

**The unprobed admission.** "I did not push him back to it, so treat this half as partly unprobed"
is the line that makes the rest of the document credible.

**The level call as its own sentence.** Not "slightly below Senior" but "he is a Mid backend
engineer", followed by the track to advance him on. The recommendation and the level are two
separate findings.

## A miss to avoid

A first pass at this same transcript, scored without this calibration file, made three errors worth
naming because they are the errors you will make:

1. **It scored a 4 on two stages.** Under the real calibration both were 3s. The answers were fluent
   and experience-backed, and that is a 3.
2. **It scored API Abstraction a 3 by reading only the end of the exchange.** The candidate's opening
   instinct was to hardcode the endpoint everywhere. The shared wrapper appeared only after the
   interviewer pushed. Correct rating is 2, on the first instinct.
3. **It never questioned the level.** It scored against the Senior Full-Stack req all the way through
   and concluded "yes, but not a strong yes", which is a confidence call. The actual finding was a
   track and level mismatch, and it was the most useful thing in the room.
4. **It produced a number for a stage row whose activity never happened.** The practical coding
   exercise was skipped in both technical rounds. The Stack Knowledge row is written around locating
   code, adding tests and verifying results, so a block of conceptual questions cannot score it. Both
   the first pass and the filed write-up put those questions under that heading anyway, because the
   kit's stage names invite it. The row should read `not assessed`, and the skipped exercise is the
   single largest evidence hole on a Senior req, because nobody watched the candidate write code.

## Use the example for register, not as a lookup table

The worked example above is here to calibrate the ceiling and the prose. It is not a set of answers to
match a transcript against. A scorer that reasons "this transcript resembles the example, and the
example says 3" has skipped the actual work and will carry over any error the example contains.

Derive every rating from the rubric's own named differentiator and say which element decided it. If a
transcript genuinely resembles the example, that is a reason to be more careful rather than less:
state the differentiator you checked and quote the line that satisfied or missed it. Arriving at the
same number by reading the rubric is worth something. Arriving at it by recognising the example is
worth nothing.
