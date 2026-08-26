# Vendored skills

Skills copied from third-party repos, kept here so they stay symlinked and editable
like everything else. Both sources are MIT; copyright notices below satisfy that.

## mattpocock/skills — MIT, Copyright (c) 2026 Matt Pocock
https://github.com/mattpocock/skills

| Skill | Local changes |
|---|---|
| codebase-design | two TypeScript samples swapped for Ruby |
| diagnosing-bugs | none |
| domain-modeling | none (vendored as a wayfinder dependency) |
| grilling | none |
| research | none (vendored as a wayfinder dependency) |
| prototype | UI branch removed, delegates to `build-ui` |
| resolving-merge-conflicts | none |
| tdd | none |
| to-questionnaire | none |
| wait-what | none |
| wayfinder | defaults to the bundled `issue-tracker-local.md` instead of telling the user to run `/setup-matt-pocock-skills`; hand-off clause added naming `improve` as the edge of the map |
| wizard | none |
| writing-for-agents | none |

`issue-tracker-local.md` inside `wayfinder/` is lifted from that repo's
`setup-matt-pocock-skills` skill, unchanged.

`improve` is not vendored from here, but Phase 1 gained a bullet that reads a
wayfinder map when one exists, so the two compose. See its own file.

`agents/openai.yaml` (Codex) dropped from each.

## backnotprop/pstack — MIT, mirror of cursor/plugins/pstack
https://github.com/backnotprop/pstack

| Skill | Local changes |
|---|---|
| blast-radius | none |
| create-verification-skill | writes `.claude/skills/` instead of `.cursor/skills/` |
| maintain-verification-skill | same path fix |
| recall | Cursor transcript path → `~/.claude/projects/<slug>/<uuid>.jsonl` plus the `memory/` index; `session-pickup` → `claude --resume`; dropped the `automate-me` route (skill not vendored); `unslop` → `writing-style.md` tier 1 |
| technical-writing | scope note added (this owns document shape, `writing-style.md` owns voice and wins on conflict); the two `unslop` references repointed at `writing-style.md` |
| unslop | `disable-model-invocation: true` added; description rewritten to defer to `writing-style.md` |
| why | `generalPurpose` → `general-purpose`; Cursor model slugs → `sonnet`/`opus` |

## genmedia.sh registry — installed by the `genmedia` CLI
https://github.com/fal-ai-community/genmedia-cli

| Skill | Local changes |
|---|---|
| genmedia | none |

Installed with `genmedia init --no-cursor --no-agents-md`, then moved here and
symlinked so it is versioned like the rest. That move leaves the CLI's
`.claude/skills/.installed.json` behind, so `genmedia skills update` will not
see it. To update, re-run the install in a scratch directory and copy the folder
over.

The registry holds 17 skills; only the default one is installed. `marketing` and
`commercial` were deliberately skipped: they give generic campaign advice that
competes with the Upspeech brand system in `upspeech-website`.

## Updating

These are copies, not submodules. To refresh one, re-download from source and
re-apply the changes in the tables above.
