# Docker rules

Levels are defaults. Compose services follow the same pinning rule as Dockerfiles.

## Rules

- **Pinned base image.** An explicit tag, patch level preferred. `latest` in a prod image is P1; a moving tag elsewhere is P2.
- **Non-root runtime.** The runtime stage sets `USER`, and writable paths are chowned before it. Missing in a runtime image is P1.
- **Multi-stage.** The runtime stage copies artifacts only. A single-stage image that ships build tools is P2.
- **No baked secrets.** No secrets through `ENV`, `ARG`, or `COPY` of env or key files. Use BuildKit secret mounts. Judge the value, not the mechanism. A secret baked in is P1.
- **Client-bundle env.** `VITE_*`, `REACT_APP_*` and `NEXT_PUBLIC_*` freeze at build time, and runtime env does not override them. Use per-environment build args or a placeholder the entrypoint substitutes. A bundle env defaulted to localhost is P1.
- **Production dependencies.** The runtime image installs prod dependencies only. P3.
- **Build-output assertion.** Assert the artifact exists, for example `RUN test -f ...`, so an empty build fails the image build. P3.
- **`.dockerignore`.** Covers `.git`, dependency directories, env and secret files, and build output, most of all before `COPY . .`. Thin coverage is P3.

## Not a finding

- A dev-only compose file with root or local credentials. Confirm it is dev-only: local ports, not referenced by any deploy.
- Non-secret `ARG` or `ENV`: public client variables, codegen placeholders.
- A deliberate major or minor tag pin on a managed image.
