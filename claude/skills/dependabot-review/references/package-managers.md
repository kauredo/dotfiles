# Package manager commands

Choose by lockfile. Yarn Berry ships `.yarnrc.yml` next to `yarn.lock`; yarn classic has only `yarn.lock`. Override syntax differs between majors, so read the installed version first.

## pnpm

- Lockfile: `pnpm-lock.yaml`
- Audit: `pnpm audit --json`
- Why: `pnpm why`
- Overrides: `overrides` in the workspace yaml, or `pnpm.overrides` in package.json. Scoped form: `"pkg@<x": "^y"`
- Install without scripts: `--ignore-scripts`
- Repo scripts: `pnpm run`, `-r`
- Dependency scripts, once reviewed: `pnpm rebuild <pkg>`
- Refresh in range: `pnpm update <pkg> --depth Infinity`
- Patching: `pnpm patch`

## npm

- Lockfile: `package-lock.json`
- Audit: `npm audit --json`
- Why: `npm explain`
- Overrides: `overrides`, scoped by the same key form or nested under the parent
- Install without scripts: `--ignore-scripts`
- Repo scripts: `npm run`, `--workspaces`
- Dependency scripts, once reviewed: `npm rebuild <pkg>`
- Refresh in range: `npm update <pkg>`
- Patching: `patch-package`

## yarn Berry

- Lockfile: `yarn.lock` plus `.yarnrc.yml`
- Audit: `yarn npm audit --all --recursive --json`
- Why: `yarn why -R`
- Overrides: `resolutions`. Scoped form: `"pkg@npm:^a": "^y"`
- Install without scripts: `--mode=skip-build`
- Repo scripts: `yarn run`, or `workspaces foreach -A`
- Dependency scripts, once reviewed: `yarn rebuild <pkg>`
- Refresh in range: `yarn up -R <pkg>`
- Patching: `yarn patch`

## yarn classic

- Lockfile: `yarn.lock` only
- Audit: `yarn audit --json`
- Why: `yarn why`
- Overrides: `resolutions`. Scoped form: `"**/parent/pkg"`, with no range keys
- Install without scripts: `--ignore-scripts`
- Repo scripts: `yarn run`
- Dependency scripts, once reviewed: `yarn install --force`
- Refresh in range: `yarn upgrade <pkg>`
- Patching: `patch-package`
