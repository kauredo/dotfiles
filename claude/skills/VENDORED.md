# Vendored skills

Skills copied from third-party repos, kept here so they stay symlinked and editable
like everything else. Both sources are MIT; copyright notices below satisfy that.

## mattpocock/skills: MIT, Copyright (c) 2026 Matt Pocock
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

## backnotprop/pstack: MIT, mirror of cursor/plugins/pstack
https://github.com/backnotprop/pstack

| Skill | Local changes |
|---|---|
| blast-radius | none |
| create-verification-skill | writes `.claude/skills/` instead of `.cursor/skills/`; em dashes replaced |
| maintain-verification-skill | same path fix; em dashes replaced |
| recall | Cursor transcript path → `~/.claude/projects/<slug>/<uuid>.jsonl` plus the `memory/` index; `session-pickup` → `claude --resume`; dropped the `automate-me` route (skill not vendored); `unslop` → `writing-style.md` tier 1 |
| technical-writing | scope note added (this owns document shape, `writing-style.md` owns voice and wins on conflict); the two `unslop` references repointed at `writing-style.md` |
| unslop | `disable-model-invocation: true` added; description rewritten to defer to `writing-style.md` |
| why | `generalPurpose` → `general-purpose`; Cursor model slugs → `sonnet`/`opus` |
| how | `generalPurpose` → `general-purpose`; Cursor model slugs → `sonnet`/`opus` |

## genmedia.sh registry: installed by the `genmedia` CLI
https://github.com/fal-ai-community/genmedia-cli

| Skill | Local changes |
|---|---|
| genmedia | em dashes replaced |

Installed with `genmedia init --no-cursor --no-agents-md`, then moved here and
symlinked so it is versioned like the rest. That move leaves the CLI's
`.claude/skills/.installed.json` behind, so `genmedia skills update` will not
see it. To update, re-run the install in a scratch directory and copy the folder
over.

The registry holds 17 skills; only the default one is installed. `marketing` and
`commercial` were deliberately skipped: they give generic campaign advice that
competes with the Upspeech brand system in `upspeech-website`.

## Anthropic frontend-design: Apache 2.0
https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design

| Skill | Local changes |
|---|---|
| frontend-design | em dashes replaced |

Copied from the Claude plugin installation. The licence is stored beside the
skill.

## nextlevelbuilder/ui-ux-pro-max-skill: MIT
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

| Skill | Local changes |
|---|---|
| ui-ux-pro-max | plugin-root paths replaced with the cross-tool `~/.agents/skills` path; em dashes replaced |

Only the `ui-ux-pro-max` runtime skill is vendored, including its search scripts,
data, and references. The plugin's other specialist skills and development files
are not required by the design stack in `CLAUDE.md`. The licence is stored beside
the skill.

## iOfficeAI/OfficeCLI: install script, not a repo copy
https://github.com/iOfficeAI/OfficeCLI

| Skill | Local changes |
|---|---|
| officecli | none tracked — `SKILL.md` self-declares this install source (`install.sh`/`install.ps1` from this repo); the CLI binary is fetched at install time, only the skill doc lives here |

## Source unclear, appears installed

These don't self-declare an origin (no install command, no metadata JSON, no LICENSE) but read like generated/installed content rather than hand-authored prose — flagging honestly instead of guessing a repo:

| Skill | Why it looks installed |
|---|---|
| powerpoint | Script set (`html2pptx.js`, `thumbnail.py`, `rearrange.py`, `replace.py`, `inventory.py`) and a full `references/ooxml/` schema tree match a packaged document-creation skill's shape, not hand-written notes. No self-declared source found. |
| remotion-best-practices | `rules/` is a flat third-person reference dump (one file per topic) with no source string, install command, or license anywhere in the skill. |

## agent-native/core: local-file build, installed via npx
https://www.npmjs.com/package/@agent-native/core

| Skill | Local changes |
|---|---|
| visual-plan | none tracked — `agent-native-skill.json` self-declares `source: "agent-native"`, `planMode: "local-files"`, update via `npx @agent-native/core@latest skills update visual-plan` |
| visual-recap | none tracked — same install mechanism, own `agent-native-skill.json` |

These two share an identical ~230-word "Installed Mode" preamble; if either is hand-edited going forward, extract that shared block into one file both point at rather than maintaining two copies (see the writing-for-agents audit finding).

## The em dash rule applies to these too

August 2026: every em dash in this directory was replaced, vendored copies
included, which is why three rows above say so. These are instruction files an
agent reads on every run, and one that uses a punctuation mark the house rule
bans teaches the habit to the session reading it. The cost is that re-vendoring
now has one more change to re-apply.

## Updating

These are copies, not submodules. To refresh one, re-download from source and
re-apply the changes in the tables above.
