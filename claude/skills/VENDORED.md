# Vendored skills

Skills copied from third-party repos, kept here so they stay symlinked and editable
like everything else. Both sources are MIT; copyright notices below satisfy that.

## mattpocock/skills: MIT, Copyright (c) 2026 Matt Pocock
https://github.com/mattpocock/skills

| Skill | Local changes |
|---|---|
| codebase-design | two TypeScript samples swapped for Ruby |
| diagnosing-bugs | none |
| domain-modeling | vendored as a wayfinder dependency; `ADR-FORMAT.md` looks for the repo's own ADR directory, numbering and generator first, records one settled decision per ADR with rejected alternatives and a downside, and supersedes with a two-way link; `SKILL.md` reports a term defined nowhere as undefined |
| grilling | each settled answer is logged as a decision record with a one-way or two-way door; "you pick" turns the remaining questions into open decisions carrying a recommendation; description defers to `barbeque` |
| research | none (vendored as a wayfinder dependency) |
| prototype | UI branch removed, delegates to `build-ui`; the leftover UI clauses in its rules are cut too |
| resolving-merge-conflicts | none |
| tdd | none |
| to-questionnaire | none |
| wait-what | none |
| wayfinder | defaults to the bundled `issue-tracker-local.md` instead of telling the user to run `/setup-matt-pocock-skills`; hand-off clause added naming `improve` as the edge of the map; a Prototype ticket sends logic to `prototype` and look-and-feel to `build-ui` |
| wizard | none |
| writing-for-agents | none |

`issue-tracker-local.md` inside `wayfinder/` is lifted from that repo's
`setup-matt-pocock-skills` skill, unchanged.

`improve` is not vendored from here, but Phase 1 gained a bullet that reads a
wayfinder map when one exists, so the two compose. See its own file.

`agents/openai.yaml` (Codex) dropped from each.

Last synced to upstream `b0618bc` on 2026-10-09. That sync took upstream's
`CONTEXT.md` → `GLOSSARY.md` rename (and `CONTEXT-MAP.md` → `GLOSSARY-MAP.md`),
and `improve` now reads `GLOSSARY.md` to match. `resolving-merge-conflicts` was
deleted upstream on 2026-09-24, so this copy has nothing left to track.

## backnotprop/pstack: MIT, mirror of cursor/plugins/pstack
https://github.com/backnotprop/pstack

| Skill | Local changes |
|---|---|
| blast-radius | none |
| create-verification-skill | writes `.claude/skills/` instead of `.cursor/skills/`; em dashes replaced |
| maintain-verification-skill | same path fix; em dashes replaced |
| recall | Cursor transcript path → `~/.claude/projects/<slug>/<uuid>.jsonl` plus the `memory/` index; `session-pickup` → `claude --resume`; dropped the `automate-me` route (skill not vendored); `unslop` → `writing-style.md` tier 1 |
| technical-writing | scope note added (this owns document shape, `writing-style.md` owns voice and wins on conflict); the two `unslop` references repointed at `writing-style.md` |
| unslop | `disable-model-invocation: true` added; description rewritten to defer to `writing-style.md`; a repo's own writing standard, when its `CLAUDE.md` or `AGENTS.md` names one, wins over `writing-style.md` for that repo |
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
| frontend-design | rewritten around a "Mandatory preparation" block and a local "Match complexity to the vision" paragraph; upstream's typography, structure, motion, cliché-cluster, plan and writing rules merged in beside them on 2026-10-09; "confirm the subject with the client" skipped, since the preparation block covers it; em dashes replaced |

Copied from the Claude plugin installation. The licence is stored beside the
skill. The `frontend-design@claude-plugins-official` plugin is uninstalled, so
only this copy loads. This copy is no longer a straight vendor: to refresh it,
diff upstream against the version merged on 2026-10-09 and port the new rules by
hand.

## nextlevelbuilder/ui-ux-pro-max-skill: MIT
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

| Skill | Local changes |
|---|---|
| ui-ux-pro-max | plugin-root paths replaced with the cross-tool `~/.agents/skills` path; em dashes replaced |

Only the `ui-ux-pro-max` runtime skill is vendored, including its search scripts,
data, and references. The plugin's other specialist skills and development files
are not required by the design stack in `CLAUDE.md`. The licence is stored beside
the skill. The `ui-ux-pro-max@ui-ux-pro-max-skill` plugin and its marketplace are
uninstalled, so only this copy loads. This copy also carries the
Refero Styles step (Step 1b) and stack detection, which upstream does not have.

Last synced to upstream main `1a2c459` (2.13.0) on 2026-10-09. Everything outside
`SKILL.md` is a straight copy, `scripts/tests/` included, so a re-sync copies
over all but `SKILL.md` and merges that file by hand.

## pbakaus/impeccable: Apache-2.0
https://github.com/pbakaus/impeccable, `c5ae03e` (v4.5.1), from `plugin/skills/impeccable`

| Skill | Local changes |
|---|---|
| impeccable | `PRODUCT.md` and `DESIGN.md` become `docs/design-system.md#product` and `#design` throughout the Markdown, with an override section in `SKILL.md` that explains it; `document.md` writes a section into that file instead of a new one; `init.md` adds the `CLAUDE.md` pointer step from the old `teach-impeccable`; `critique.md` opens with the local Step 0 outside critic and AI tells table, prints `Critic score: N/10` second, and skips its questions when a loop calls it; em dashes replaced; description trimmed from about 895 to about 290 characters |

Replaces the old commands `adapt`, `audit`, `bolder`, `clarify`, `colorize`,
`critique`, `extract`, `harden`, `normalize` (now `polish`), `onboard`,
`optimize`, `quieter`, `simplify` (now `distill`) and `teach-impeccable` (now
`init`). LICENSE and NOTICE sit beside the skill.

The compiled binary that `scripts/impeccable` downloads on first run hardcodes
`PRODUCT.md` and `DESIGN.md`, so `context` and `live` report both missing. The
override section tells the model to read `docs/design-system.md` itself. The
upstream hooks (SessionStart, PostToolUse on Edit and Write, a 30-second Stop
pass) and the `impeccable-*` subagents are not installed; the skill falls back
to `reference/degraded/` without them.

## emilkowalski/skills: MIT
https://github.com/emilkowalski/skills

| Skill | Local changes |
|---|---|
| apple-design | em dashes replaced (headings take a colon, prose a comma) |

Installed with `npx skills add emilkowalski/skills@apple-design -g`, then moved
here and removed from the `npx skills` lock, so `npx skills update` no longer
sees it. The licence is stored beside the skill. `build-ui` Phase 3 and
`interface-guidelines` point at it for gesture-driven motion.

## Moved out of `npx skills`

Installed with `npx skills add … -g`, then copied here, removed from the
`~/.agents/.skill-lock.json` lock and symlinked, so `npx skills update` no
longer sees them. To refresh one, `npx skills add` it into a scratch project
and copy the folder over. Em dashes were replaced in their Markdown only;
scripts, JSON and HTML templates keep theirs, since some are runtime strings.

| Skill | Source | Licence |
|---|---|---|
| hyperframes, hyperframes-animation, hyperframes-audio, hyperframes-cli, hyperframes-core, hyperframes-creative, hyperframes-keyframes, hyperframes-registry, hyperframes-studio, media-use, motion-graphics | https://github.com/heygen-com/hyperframes | Apache-2.0 |
| brag | https://github.com/latent-spaces/brag | MIT |
| svg-character-animation | https://github.com/calesthio/openmontage | MIT per its frontmatter; the repo is AGPL-3.0 |

`brag/assets/` is 16 MB of music and sound effects the skill renders with.
`brag` has `disable-model-invocation: true` and a one-line description, since
it only runs by name and its triggers collided with `hyperframes`.

The hyperframes pack updates itself: its router runs `npx hyperframes skills
update`, which writes real directories over the symlinks in `~/.claude/skills`.
That happened on 2026-10-12 to nine of them (all but `-keyframes` and
`-studio`), so they ran unedited upstream text. On 2026-10-15 those nine were
copied back here from the newer install, em dashes replaced again, and
relinked. After any future update, check `readlink ~/.claude/skills/hyperframes`
and repeat that if it is a directory. Local description changes: `hyperframes`,
`-animation`, `-audio`, `-registry`, `-studio` and `media-use` trimmed to about
300 characters, and `hyperframes` defers short single-message pieces to
`motion-graphics`.

## iOfficeAI/OfficeCLI: install script, not a repo copy
https://github.com/iOfficeAI/OfficeCLI

| Skill | Local changes |
|---|---|
| officecli | none tracked: `SKILL.md` self-declares this install source (`install.sh`/`install.ps1` from this repo); the CLI binary is fetched at install time, only the skill doc lives here |

## Source unclear, appears installed

These don't self-declare an origin (no install command, no metadata JSON, no LICENSE) but read like generated/installed content rather than hand-authored prose, so flagging honestly instead of guessing a repo:

| Skill | Why it looks installed |
|---|---|
| powerpoint | Script set (`html2pptx.js`, `thumbnail.py`, `rearrange.py`, `replace.py`, `inventory.py`) and a full `references/ooxml/` schema tree match a packaged document-creation skill's shape, not hand-written notes. No self-declared source found. |
| remotion-best-practices | `rules/` is a flat third-person reference dump (one file per topic) with no source string, install command, or license anywhere in the skill. The description is rewritten locally to fire only in projects that already use Remotion and to defer to `hyperframes`. |

## agent-native/core: local-file build, installed via npx
https://www.npmjs.com/package/@agent-native/core

| Skill | Local changes |
|---|---|
| visual-plan | none tracked: `agent-native-skill.json` self-declares `source: "agent-native"`, `planMode: "local-files"`, update via `npx @agent-native/core@latest skills update visual-plan` |
| visual-recap | none tracked: same install mechanism, own `agent-native-skill.json` |

These two share an identical ~230-word "Installed Mode" preamble; if either is hand-edited going forward, extract that shared block into one file both point at rather than maintaining two copies (see the writing-for-agents audit finding).

## coreyhaines31/marketingskills: MIT, Copyright (c) 2025 Corey Haines
https://github.com/coreyhaines31/marketingskills, `1efedbc` (skills v2.1.3), 2026-10-10

| Skill | Local changes |
|---|---|
| pricing | `evals/` dropped; em dashes replaced; description trimmed from about 870 to about 300 characters |
| competitor-profiling | `evals/` dropped; em dashes replaced; description trimmed from about 690 to about 280 characters |

Cloned and copied, never in the `npx skills` lock. The licence is stored beside
each skill. `pricing` is the upstream rename of `pricing-strategy`, which is the
name `npx skills find` still lists. Both skills point at sibling skills that are
not vendored (`paywalls`, `cro`, `schema`, `ai-seo`, `competitors` and others)
and read `.agents/product-marketing.md` from the project when it exists.
`competitor-profiling` prefers the Firecrawl and DataForSEO MCPs, neither of
which is installed, so it runs on its WebFetch fallback and marks SEO metrics
unavailable.

## vojtaholik/good-css: MIT
https://github.com/vojtaholik/good-css, `92d436b`, 2026-10-15

| Skill | Local changes |
|---|---|
| good-css | none |

The skill folder only (`skills/good-css/`, with its eight `references/` files).
The site, harness and the 92 KB `PRACTICES.md` source stay upstream. The licence
is stored beside the skill. It sits under `build-ui` and `design-polish` at the
CSS-technique level, which nothing else here covers.

## joaopmarques/barbeque: MIT
https://github.com/joaopmarques/barbeque, `b795fe3`, 2026-10-15

| Skill | Local changes |
|---|---|
| barbeque | em dashes replaced; the slow cook follows `grilling`'s frontier rounds, limited to the 🔥 and 🥩 questions, where upstream asked one question at a time |

The `.claude-plugin/` manifest is dropped. Barbeque calls `grilling` for its
slow cook when it is installed, and `grilling` is vendored above.

## joaopmarques/dial-in: MIT
https://github.com/joaopmarques/dial-in, `f6f987c`, 2026-10-21

| Skill | Local changes |
|---|---|
| dial-in | the one em dash replaced (an empty table cell in `references/manifest.md`) |

The skill folder only (`skills/dial-in/`), plus the repo licence beside
`SKILL.md`. The plugin manifest, demo page, Playwright tests and promo video
stay upstream. `assets/vendor/` holds tweakpane 4.0.5 and
`@tweakpane/plugin-essentials` 0.2.1, which matched the npm builds byte for byte
on 2026-10-21. It stays model-invoked: the `CLAUDE.md` design-stack table names
it for values judged by eye, and its description only fires on asks for sliders,
knobs or tuning by feel.

## cathrynlavery/diagram-design: MIT
https://github.com/cathrynlavery/diagram-design, `d97c5c7`, 2026-10-15

| Skill | Local changes |
|---|---|
| diagram-design | em dashes replaced in the Markdown files; description trimmed from about 840 to about 255 characters, with a `dataviz` deferral for data charts |

The skill folder only (`skills/diagram-design/`, with its `references/`,
`assets/` and `scripts/`), plus the repo licence beside `SKILL.md`. The plugin
manifests, CI configs, docs and prompts stay upstream. It ships a neutral skin
in `references/style-guide.md` and a first-run onboarding step that rekeys it to
a project's design tokens from a URL, a folder or pasted values.

## BuilderIO/skills: MIT
https://github.com/BuilderIO/skills, `0ecfb56f3bf7`, 2026-10-15

| Skill | Local changes |
|---|---|
| agent-watchdog, quick-recap, rewind, visual-edit | `disable-model-invocation: true`; description rewritten as a one-line human summary |
| read-the-damn-docs, plow-ahead | description trimmed and front-loaded (the docs one said "Forces Codex") |
| efficient-fable, efficient-frontier, plan-arbiter, stay-within-limits | none |

All ten also have em dashes replaced in their Markdown. Copied from the
`builder-skills@builder-skills` plugin cache, with the repo licence beside each.
The plugin is disabled in `settings.json`, because its `visual-plan` and
`visual-recap` duplicated the installed builds listed under agent-native/core,
and Claude Code can't turn off one skill inside a plugin. Those two installed
builds still tell the agent to avoid the `builder-skills:` copies, which no
longer load. To refresh, re-enable the plugin long enough to update its cache,
or clone the repo, and copy the folders over.

## The em dash rule applies to these too

August 2026: every em dash in this directory was replaced, vendored copies
included, which is why three rows above say so. These are instruction files an
agent reads on every run, and one that uses a punctuation mark the house rule
bans teaches the habit to the session reading it. The cost is that re-vendoring
now has one more change to re-apply.

## Updating

These are copies, not submodules. To refresh one, re-download from source and
re-apply the changes in the tables above.
