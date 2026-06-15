# GitHub: Pending (Draft) PR Reviews

GitHub natively supports "draft reviews" — a review that stays in PENDING state with all its comments, only visible to you, until you explicitly submit it. Useful after a `/code-review` when you want to triage findings before they hit the PR author.

`gh` doesn't expose pending reviews directly. Use `gh api` and **omit the `event` field**:

```bash
gh api repos/<OWNER>/<REPO>/pulls/<PR>/reviews \
  -f body="<top-level summary>" \
  -F 'comments[][path]=path/to/file.js' \
  -F 'comments[][line]=63' \
  -F 'comments[][body]=<finding body>' \
  -F 'comments[][path]=path/to/other.js' \
  -F 'comments[][line]=48' \
  -F 'comments[][body]=<finding body>'
```

- **No `-f event=...`** → stays PENDING. You'll see a "Finish your review" banner on the PR page.
- Adding `-f event=APPROVE | REQUEST_CHANGES | COMMENT` submits immediately instead.
- In the GitHub UI you can edit/delete individual comments before submitting.

## Comment fields

- `path` — required, repo-relative file path.
- `line` — the line in the file's RIGHT side of the diff (new version). For LEFT side, also pass `side=LEFT`.
- `body` — markdown supported.
- For multi-line ranges: `start_line` + `line` (+ optional `start_side`/`side`).

## When to use

- After `/code-review` produces a list of findings, post them as a pending review so you can skim/edit before the author gets notified.
- For self-review on your own PRs before requesting reviewers.

## From /code-review to a posted pending review

`/code-review` is intentionally broad — it surfaces nitpicks alongside real defects so the full landscape is visible. Going from that report to a pending review is filtering, verifying, and softening. When the user opts into posting after a PR-sourced `/code-review`, run this workflow.

### 1. Triage — drop the nitpicks

Drop findings in these categories unless they're tied to a concrete defect:

- **Naming preferences** — "name describes the flag not the capability", "use `*Flag` suffix", "this name is too generic", "describe block title embeds the flag key".
- **Pattern preferences** — "this isn't how other controllers do it", "use `combineLatest` instead of two subscriptions", "extract a getter for this expression" (when the existing form works).
- **Cosmetic restructuring** — "extract this getter", "split this `ng-if`", "reorder these declarations".
- **Duplicate-but-harmless** — two reads of the same value, redundant `!!` coercions, etc., when both produce the same result in practice.
- **Pre-existing issues** — anything the diff didn't introduce, even if visible while reading the file. (Mention truly important ones in the top-level body, otherwise skip.)
- **Out-of-diff findings** — files the PR doesn't touch. GitHub rejects inline comments on lines outside the diff hunks anyway.
- **Convention drift** — missing `// TODO: remove after GA`, describe titles using flag keys, missing JSDoc, etc.
- **Brittleness already explained in code** — e.g. an inline comment that already notes the trade-off and a conservative buffer.
- **Already in the conversation** — anything raised, addressed, or explicitly rejected in existing PR comments, review comments, or review summaries. Don't re-litigate a settled point; it wastes the author's time and signals the conversation wasn't read.
- **Comment length / verbosity** — never flag this in posted reviews (per the tone rules below).

Keep findings that are:

- **Correctness bugs** — wrong logic, unhandled edges, race conditions, broken contracts, mis-paired resource on/off.
- **Regression risk** — the diff introduces a new failure mode (e.g. a new hard dependency in the load path that didn't exist before, even when the new behavior is flag-off).
- **Real coverage gaps** — production code paths that no test exercises (the error handler that has no test). Not the property that has a default value set in the constructor.
- **Test correctness** — tests that pass vacuously (synchronous assertion on an async outcome), tests that exercise the wrong branch, tests that don't isolate the new behavior, shim tests that verify the mock returned what the mock was told to return.
- **Maintenance smells with history** — duplicated structures that have already drifted at least once (e.g. a DI list that has moved before).

When in doubt, drop it. Five substantive findings beat nineteen mixed ones.

The same drop/keep lists apply when fixing locally (non-PR sources) — filter nitpicks before implementing.

### 2. Verify line numbers

Re-read the file at HEAD before drafting. Reviewers cite lines from what they read; if drafting hours later or HEAD moved, anchor numbers can drift. For each kept finding:

- Confirm the line still says what the reviewer claims.
- Confirm the line is **inside the diff** for inline comments. If it isn't, demote to the top-level review body — the API rejects inline comments on lines outside the diff hunks.

### 3. Draft each kept finding in a real voice, not a template

Apply the rules in "Tone for GitHub review content" below. The shape of each comment should match what the finding actually is, not a one-size template. Three broad shapes work:

**Direct request** — when the diff has a concrete defect and the fix is mechanical (missing test assertion, wrong branch, off-by-one, dropped error handling). No safety valve, no preamble. There's no honest trade-off to acknowledge, so don't fake one. The ask doesn't have to be a question — a bare imperative often reads cleaner for a clear defect ("write the value back before returning on this path").

> [observation in one or two sentences].
>
> [concrete change — bare imperative ("add the missing assertion") or a question ("could you add …?"), your choice per comment]

**Suggestion with a safety valve** — when the change depends on context the author may have and you don't (architectural moves, design trade-offs, taste calls). The closing line should name the *specific* alternative interpretation, not be a generic "happy to leave it."

> i think / i believe / i'd suggest [observation in one or two sentences].
>
> [concrete change — often a phrased-as-statement suggestion reads better here than a question: "reading `agents_count` instead would avoid the extra query"]. [optional: why this matters]
>
> [closing that names a real alternative — e.g. "happy to leave it if X is intentional", "if this is meant as a follow-up, ignore"]

**Short observation** — when the ask is self-contained. One or two sentences total, no preamble, no closing.

> [observation + ask in one breath]

Pick the shape that fits the finding. **Never apply the same closing pattern to every comment.** If you find yourself reaching for "happy to leave it if..." because the previous three comments had one, drop it — every safety-valve line that carries no information dilutes the ones that do. A review where every comment closes with the same hedge reads as a template, not a conversation.

Within a single posted review, vary the shapes. A typical mix: one or two direct requests for the clear defects, one suggestion-with-safety-valve for the genuine judgment call, one short observation for the obvious thing. Reviewing your draft top-to-bottom, if more than ~half the comments share the same closing phrase, rework them.

**Vary the opener too, not just the closer.** "could you …?" is one way to phrase a request, not the default. If most comments open the ask with "could you", it reads as templated even when the findings are good. Rotate: a bare imperative for clear defects ("write the value back before returning"), a phrased-as-statement suggestion for judgment calls ("reading `agents_count` instead would avoid the join"), an outright statement of the fix for the obvious ones ("`status` and `invalid_statuses` need `validate_lang` too"), and the occasional genuine question. Same test as the closer: scan the drafts top-to-bottom, and if more than ~half start the ask the same way, rework them.

### 4. Show drafts before posting

Present the drafted top-level body and inline comments to the user as a clearly-labeled list. Wait for explicit approval before invoking `gh api`. Don't post a pending review uninvited — even though it's only visible to them, a surprise review is annoying.

### 5. Post

Use the `gh api` form at the top of this file. Omit `event` to keep it PENDING. After posting, give the user the PR URL so they can finish the review in the GitHub UI.

## Tone for GitHub review content

Applies to any text that will be posted to GitHub: inline review comments, top-level review summaries, replies to other reviewers.

- **Match register to the finding.** Direct requests are fine when the diff is clearly wrong and the fix is mechanical ("add the missing `record_fallback` assertion"). Soften when the change depends on context the author may have ("happy to leave it if X is intentional"). Avoid commanding language ("this is wrong", "we should X") and avoid pattern-applying the same line to every comment — both the closing hedge ("happy to leave it if…") and the opening verb ("could you…"). When a phrase repeats across most comments it reads as a template even if each finding is sound. The goal is collaborative, not commanding, and not formulaic.
- **Don't flag comment length or verbosity in posted reviews.** Do not include suggestions like "trim this comment", "DROP the docblock", "TRIM the verbose explanation", or "this comment is too long" in inline review comments or replies. Other developers read those as noise. This applies to the PR author's own comments AND to other reviewers' comments. Critique substance, not someone's writing style. Comment-length feedback can still appear in the local report shown to me in chat (where I can decide privately whether to act on it), but it must not be baked into copy-pasteable PR review comments.
- **No em dashes**, no AI stock phrasing ("I want to make sure we're on the same page", "Please find below", "Per our discussion"). Match the codebase's existing review-comment voice — short, direct sentences, occasional lowercase starts, conversational connectors are fine.
- **Plain over clever.** "Turning off a spinner we never turned on" beats "emits a spurious off to the global manager". "Tests pass by accident, not because the guard works" beats "tests pass vacuously". Don't reach for abstract verbs (`emit`, `extinguish`, `consume`, `propagate`) or Latinate adverbs (`vacuously`, `spuriously`, `silently`) when a concrete description of the same thing fits. If a sentence sounds like a textbook or a paper abstract, rewrite it the way you'd say it out loud to a teammate.
