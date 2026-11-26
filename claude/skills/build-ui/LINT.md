# Running LINT

Read at Phase 4 step 0, and before `REDESIGN.md` §2's before record. `LINT` means `node ~/.claude/skills/build-ui/scripts/lint.mjs`; its header lists every flag, and it prints usage with no arguments.

## 1. Get the real page on screen

- Start the dev server on a fixed port (Vite: `--port N --strictPort`) as a background task with the longest timeout the harness allows; a full redesign runs past the usual 30 minutes.
- Screenshot each route (`node ~/.claude/skills/hallmark/scripts/capture.mjs <url> --sizes desktop --name <route> --out <work>`) and look at it. A dev server can answer 200 with an error overlay (a missing generated file, a failed import), and a route that errors skips every rendered check.
- **Behind a login**, a screen renders only when signed in. Use the dev or test account the project documents. With none, ask the user for one. With nobody to ask, run LINT without `--render` and say in the handoff that no rendered check ran. Faking the backend with fixtures costs more than the check is worth.
- **Colour schemes.** LINT renders in the machine's scheme; `capture.mjs` renders light unless given `--dark`. When the app ships both, screenshot the other scheme at desktop and phone sizes and look at it before the critique.

## 2. Run it

```
LINT <files and dirs> --render --url http://localhost:<port>/<route> [--url ...]
```

- **What to pass:** the files you built or changed, the shared components they render, and the global stylesheets the page loads (reset, tokens, base styles), which hold rules such as the focus ring. Include the locale files (`src/locales`, `src/i18n`, `config/locales`) when the copy lives there, since the headline check reads them. Leave out any directory holding an HTML shell template such as SvelteKit's `src/app.html`, which LINT would lint as a page.
- **Flags:** `--scope app` for app screens, `--scope component` for a lone component, `--doc` for a document page (privacy, terms, docs), `--depth <depth>` on a redesign.
- LINT keeps its records (the before record, URL screenshots, `compare.html`) in a cache folder per project and prints its path on the first line.

## 3. Work the findings

- A finding cites one instance of a pattern: fix every instance of it in that file before re-running.
- Fix every FAIL.
- Fix every REFLEX, or keep it with a reason you can state and waive it on later runs: `--waive 34@Base.astro` for one file, `--waive 44c@/faq` for one rendered route, a bare gate only when it is wrong everywhere on this page.
- A finding that is wrong about this page (it cites code that does not do what it says) is waived with that reason.
- Read each WARN and decide.
- Findings in files outside what you passed belong to another screen: list them for that screen's owner.
- Every waiver and its reason goes in the handoff.

Done when LINT reports 0 FAIL on every route.
