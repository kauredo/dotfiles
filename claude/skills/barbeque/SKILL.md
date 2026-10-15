---
name: barbeque
description: Barbeque a plan: grill it yourself, auto-accept your own recommended answers, and return a plan with a decision log plus "sauces and sides". Use when the user says barbeque in any spelling (barbecue, bbq, bar-b-q, BBQ me), or clearly wants Claude to grill the plan and answer the questions itself. A plain "grill me" (the user answers the questions) is not barbeque.
---

A **grilling** is a relentless interview about a plan: walk the design tree, and give a recommended answer for each question. In barbeque, you play both sides. For each question, pick your recommended answer and move on. Ask the user nothing until the report is out.

## 1. Self-grill

Walk down each branch of the design tree, one decision at a time, resolving dependencies in order. Look up facts in the codebase. Decide the rest yourself.

**Budget:** 12 questions by default. The user can shape it with a list of items, extra context, or a number. **20 is the hard ceiling**, whatever the user says. When the budget runs out, mark every unvisited branch 🥩 Underdone.

Rate each pick as you make it:

- ✅ **Grilled**: confident pick, the obvious answer.
- 🔥 **Burned**: you picked, but a sensible person could pick otherwise. Check this one.
- 🥩 **Underdone**: you could not resolve it. The user must decide.

Be honest with the 🔥 flags. Your picks are right most of the time and sometimes totally off. The flags exist to point at the "totally off" ones.

The step is done when every branch is visited or the budget is spent.

## 2. Write the full plan

Write the full plan to a markdown file: `barbeque-<plan-slug>.md` in the session scratchpad directory, or in `~/.claude/plans/` when the session has no scratchpad. This file is the source of truth for the work. It holds every step, file, and detail the build needs.

## 3. Report

The chat report is the short version. Plain words, everyday concepts, no jargon. Keep the barbeque flavor playful.

Always write a rating as emoji plus word: `✅ Grilled`, `🔥 Burned`, `🥩 Underdone`. The emoji alone is not enough.

```
# 🍖 Barbeque: <plan name>

## The plan (short)
<3 to 5 numbered lines, one sentence each>

Full plan: [barbeque-<plan-slug>.md](<path>)

## Decision log
| Rating | Area | Question | Pick | Note |
|---|---|---|---|---|
| ✅ Grilled | Scope | <question> | <pick> | |
| 🔥 Burned | Tech | <question> | <pick> | <why it might be wrong> |
| 🥩 Underdone | Users | <question> | (none) | <what you must decide> |

## 🥫 Sauces: small tweaks to this plan
| Tweak | Why it matters |
|---|---|
| <tweak> | <reason> |

## 🥗 Sides: a different plate entirely
| Idea | Why it matters |
|---|---|
| <other approach or reframe> | <reason> |

## Verdict
<one line>
```

Keep each table cell short: a few words, one sentence at most. Sort the decision log so the 🥩 Underdone and 🔥 Burned rows come first.

**Sauces and sides** give the user a beat to think laterally. A sauce is a small change to this plan (max 3). A side is a different approach or a reframe of the problem (max 2). Fewer is fine. Filler is not.

**Verdict:**

- Fewer than 3 🔥 Burned / 🥩 Underdone rows, and no 🥩 Underdone on a core decision (scope, audience, what is being built): "😋 **Delicious.** Say **go** and I start." Use a playful line in this spirit.
- 3 or more 🔥 Burned / 🥩 Underdone rows, or a 🥩 Underdone on a core decision: "🍖 **This one needs a slow cook.** Want me to grill you on the hard parts?" The ✅ Grilled picks stand.

## 4. Wait

The report is a plan. Start the work only after the user says go or fixes the picks.

- On **go**: read the full plan file and build from it.
- On fixes: update the full plan file, then post a new short report.
- On slow cook: grill the user on only the 🔥 Burned and 🥩 Underdone questions. Use the `grilling` skill: ask the whole frontier in numbered rounds, each question with your recommended answer, and wait for the replies before the next round. Only these questions enter the tree. Then update the full plan file.
