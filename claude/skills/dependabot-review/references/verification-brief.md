# Verification brief

Include this in every verification subagent's brief, next to the unit facts from Phase 4 of `SKILL.md`. Do the work per affected workspace, in order, logging the command, outcome and timing of each check.

## Procedure

**A. Apply the bump.** Change the manifest, then install with lifecycle scripts disabled (flag in the package-manager reference). Next run the install-time scripts (prepare, postinstall and similar) of the root project and workspace packages only. Dependency scripts stay off unless the repo already permits them. Keep the install warnings, new peer-dependency ones above all. Report any dependency whose install scripts are new or modified as a finding.

**B. Project checks.** Run typecheck, lint, unit, browser or Storybook, e2e, then the production build. Omit a check only if the project has none. If you can't tell what the command is, that is a gap rather than an omission.

**C. Generated suite.** Create it in the scratchpad, outside the repo, scaled to how far the change can reach. Scrub the env before anything: unset credentials, then use a fake storage endpoint, a local mail catcher and a throwaway local database. Real email, real bucket writes, and paid or production APIs are forbidden. A probe that would need a real service is listed as "not covered".

- Build: scan the entire log for errors, since the exit code alone misses some.
- Boot: run the production server on any free port. Request the main routes, the login or admin page and the health endpoints, logging status codes.
- Probes matched to the package:
  - image library: call the optimizer endpoint, and push one upload through the server-side API into local storage
  - CSS tool: compare generated CSS from before and after
  - HTTP client or mailer: make one call at a local target
  - database driver: do a single read and write on the throwaway database
- Anything behind a login is tested headless first, via the server API or a script. A human gets only the visual checks.
- Running code: grep the built bundle for the version string. Look for copies the lockfile can't govern, such as one embedded in another dependency or fetched from a CDN at runtime.
- Major jumps: diff build output across the bump. Identical bytes are strong proof.
- Afterwards, stop the servers and delete the throwaway database.

**D. Changelog.** For each package, read every release between current and target. Collect breaking changes, removed APIs, altered defaults and new runtime requirements, and grep the codebase for each removed or altered API.

**E. Reachability** (major jumps and every risky verdict). Find every importer: our own source, the dependency tree, and the code in open dependency PRs. Set them against the breaking changes. Name what touches changed code, or say nothing does.

**F. Upstream research** (PAPER FIX, NO FIX, BREAKS, major jumps). Search issues and PRs of the package and its parent, and read the advisory page. Log the advisory date, upstream issue, maintainer stance and open fix PRs, all with links.

**G. Adversarial review.** Argue the bump is unsafe. Which code path uses the package? What changed in the new version? What would the checks miss (real data, logged-in flows, edge runtime)? Write the best case against.

## Baseline

When a check fails, repeat it in a separate checkout of the base branch. A failure there is pre-existing: report it, but don't blame the bump. Delete the extra checkout when done.

## Report format, one block per unit

- unit
- bump: package, from, to
- alerts closed
- verdict (defined below)
- evidence, one line per check: what ran, the command, what came back
- where the running code was inspected, and the version found
- pre-existing failures
- changelog risks, or "none found in versions read"
- reachability, or "not required"
- upstream, or "not required"
- strongest case against
- not covered
- fix proposal, needed for BREAKS, NO FIX, PAPER FIX and SAFE WITH CHANGE only: the fix, one alternative, and each one's risk

## Verdict definitions

- **SAFE**: the running code has the fixed version, checks pass or equal the baseline, and the changelog shows nothing risky on paths we use.
- **SAFE WITH CHANGE**: safe only if the planned fix is altered (stay in the major, refresh rather than override). State the change and its evidence.
- **NEEDS TESTING**: checks pass, yet a key path stays unexercised (real data, auth, a protected preview).
- **PAPER FIX**: audit is green but vulnerable code keeps running from a bundled or CDN copy. Say where.
- **BREAKS**: a check fails due to the bump. Quote the exact error.
- **NO FIX**: no patched release exists, or the sole fix breaks the project.

The block is finished once every field is filled and the evidence supports the verdict.
