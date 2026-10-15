# docs

Docs that disagree with the code, point at things that are gone, or disagree with each other. A wrong doc is read as true, so each claim gets checked in source. Sounding plausible proves nothing. No doc gets edited here.

Detects: broken references (links, paths, symbols); command and config drift (scripts, env vars, config keys); code-claim mismatch (APIs, flows, structure); internal contradictions (doc against doc, doc against itself); stale or superseded content (removed features, ADRs not marked superseded); structural gaps (missing index links, no per-area instructions file, undocumented features).

## Phase 1: discover the doc surface

- CLAUDE.md or AGENTS.md at the repo root may say where docs live; read it first. After that, list every instruction file (root and nested), every README, and markdown in doc folders. Do not assume a layout, since monorepos keep docs per app or package.
- Skip anything the project does not own: `vendor`, `node_modules`, `dist`, `build`, installed agent skills, and markdown shipped by dependencies.
- Find the generated docs by looking for generator scripts and regenerate-and-diff checks. Generated output is correct by construction. Drift there means rerunning the generator: never hand-edit it, never flag it.
- Read the generator before trusting that label. One that only scaffolds from a template is not regenerate-and-diff: its output gets hand-edited afterwards and is auditable (it may scaffold ADR files but not the hand-kept index).
- Group what remains by owning area (root docs, each app, each package, docs directory plus ADRs, infra). The groups drive fan-out.
- Summarize: file count, excluded set, generated set, area groups.

## Phase 2: verify, one claim at a time

Quote the claim verbatim with its `file:line`, then cite the source that proves or disproves it. Use Grep, Glob and Read. A failed grep is evidence; "I did not see it" is not.

| Claim | Check |
|---|---|
| file or directory path | glob it or read it |
| symbol (function, class, constant, export, middleware, env key) | grep its exact name; no hit means renamed or never real |
| command or script | read the manifest or build file (package scripts, Makefile, task runner config); confirm it exists in the right workspace |
| env var | read the env schema and the example env file, both directions: a doc naming a var the schema lacks, and a schema requiring a var the doc omits |
| config key | read the real config; check the key name and the value shape |
| relative link | resolve against the doc's own directory; a wrong `../` depth is the commonest bug |
| inline code-span path | same rule, relative to the doc's directory; do not read a package-relative path as repo-relative |
| ADR reference | number, title and filename agree; supersession is consistent in both directions |
| count | count the real items; tolerate `~`, "roughly", "e.g."; flag exact claims that are wrong |
| architecture or flow | read the implementing module and trace the flow; prose can outlive a refactor the code did not |
| behavior | follow the code path and see which part does the work; ownership may have shifted |

Contradictions: when two docs state one fact differently, source decides which is right. A doc also must not disagree with itself. If a hand-written doc repeats a generated one, the generated one wins.

## Not a finding

- Illustrative or teaching snippets with placeholder identifiers. Exception: one presented as real, copy-pasteable API that names something nonexistent. Test: would it typecheck against the real types?
- Generated or gitignored paths a doc cites. Check them against the generator config, not file existence.
- Approximations.
- Prose opinions, tone, wording.

## Severity

Harm to a contributor who acts on the doc.

- High (the reader is misled or stuck): a setup step that names an env var or secret that does not exist; a config key that does not exist, which does nothing when set; a command that fails or is absent; behavior described wrongly, such as the wrong middleware, flow or owner; a dead link to a required doc, including a wrong `../` depth.
- Medium (the reader is misinformed but can continue): a bad path in a key-files table; the wrong test framework or setup path; an env var the schema requires but an existing table omits; a wrong default, count or flag; an ADR with a bad timestamp or an out-of-date cross-reference.
- Low (gaps and nitpicks): no index link; a half-filled table; a per-area instructions file absent while its siblings have one; a directory README with no index; typos and whitespace.

Raise the tier for setup, security and runtime-behavior claims. `references/method.md` has the report shape and calibration. Claims that looked wrong but were right go under `Checked and correct`; generated docs go under `Notes`.
