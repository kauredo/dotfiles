# Vendored skills

Skills copied from third-party repos, kept here so they stay symlinked and editable
like everything else. Both sources are MIT; copyright notices below satisfy that.

## mattpocock/skills — MIT, Copyright (c) 2026 Matt Pocock
https://github.com/mattpocock/skills

| Skill | Local changes |
|---|---|
| codebase-design | two TypeScript samples swapped for Ruby |
| diagnosing-bugs | none |
| grilling | none |
| prototype | UI branch removed, delegates to `build-ui` |
| resolving-merge-conflicts | none |
| tdd | none |
| wait-what | none |
| wizard | none |
| writing-for-agents | none |

`agents/openai.yaml` (Codex) dropped from each.

## backnotprop/pstack — MIT, mirror of cursor/plugins/pstack
https://github.com/backnotprop/pstack

| Skill | Local changes |
|---|---|
| blast-radius | none |
| create-verification-skill | writes `.claude/skills/` instead of `.cursor/skills/` |
| maintain-verification-skill | same path fix |
| unslop | `disable-model-invocation: true` added; description rewritten to defer to `writing-style.md` |
| why | `generalPurpose` → `general-purpose`; Cursor model slugs → `sonnet`/`opus` |

## Updating

These are copies, not submodules. To refresh one, re-download from source and
re-apply the changes in the tables above.
