---
name: demo-video
description: Record a short Playwright video of a web app driven through a scripted flow, for a PR or ticket.
disable-model-invocation: true
---

# Demo video

Record a short, plain video of a web app being driven through a scripted flow, so a reviewer can see it work. Playwright's built-in `recordVideo` does the filming; captions are an overlay. There are no cinematic effects.

## Content rule

Film seeded, fixture or demo data only. A video escapes every access control the app has, and nothing gets masked afterward. Redact by never typing the real value: use placeholder text in `fill`, or let the browser prefill and click submit.

Read the repo's CLAUDE.md or AGENTS.md for which targets are allowed. If the target looks like production, stop and ask.

## Inputs

- **URL**: a local dev server by default; ask if unknown. If no app is running, ask or start it with the project's normal run command.
- **Steps**: a JSON array, one object per step, each with an `op`:
  - `goto` (`url`, optional `ready` selector to wait for)
  - `click` (`selector`)
  - `fill` (`selector`, `text`)
  - `press` (`key`)
  - `wait` (`ms`, or a `selector` to appear)
  - `scroll` (`selector` to bring into view, or `y` pixels)
  - `caption` (`text`, optional `ms`, default 2500)
- **Viewport**: `--size 1280x720` by default; the video matches it.
- **Output**: `--out` takes a path without extension. Default is a temp directory. Put it in the repo only when asked. The file ends `.mp4` when converted, else `.webm`.
- **Sign-in hook** (optional): `.agents/demo-video.mjs` in the target repo, overridable with `--hook` or `DEMO_VIDEO_HOOK`. It exports `async login(page, { url })`. No file means unauthenticated.
- Optional flags: `--headed`, `--slow <ms>` (pause after each step, default 400), `--dry`.

Write the steps file in a temp directory, never the repo. The runner is already written: `scripts/record.mjs` beside this file.

## 1. Preflight

Check four things and report each:

1. Playwright resolves. The script looks in the target project's `node_modules` first, then the global install, so run it **from the target project's directory**.
2. Chromium is installed. When it is missing, print `npx playwright install chromium` and stop.
3. `ffmpeg` is on PATH (`which ffmpeg`). Without it the output stays webm.
4. The URL answers a plain fetch, and the data is seed or demo data.

Done when all four are reported, and any failure has stopped the run before recording.

## 2. Dry run

Run the steps headless with `--dry`. It records no video, saves a screenshot after every step, and fails fast on any selector that does not match.

```
cd <target project> && node <this skill's dir>/scripts/record.mjs --steps <steps.json> --url <url> --dry
```

Done when every selector matched and you have opened the screenshots and looked at them.

## 3. Record

Run the same command without `--dry` and with `--out`. The script runs the sign-in hook in a separate, unfilmed context and carries its storage state in. It injects the caption overlay (fixed near the bottom, click-through, one caption at a time, self-clearing), runs the steps with a 10 second timeout each, and closes the context so the video flushes.

A step with no matching or visible target fails. The run stops there, saves a screenshot of the failing page, exits non-zero, and keeps the partial video. Do not film on past a step where nothing happens. A hook error aborts before recording starts.

Done when a video file exists at the printed path with a nonzero size and the exit code is 0.

## 4. Convert

The script transcodes webm to mp4 (H.264, yuv420p, faststart) when `ffmpeg` exists. If conversion fails, it keeps the webm and says so. Without `ffmpeg`, deliver the webm and tell the user mp4 was skipped and why.

Done when the final file path is decided.

## 5. Report

Give the user the absolute path, the size and duration, and the step list used. Name anything skipped (mp4). Nothing is uploaded; the user does that. Remind them the content rule travels with the file.

On failure, report the step index and op, the selector, the failure screenshot path and the partial video path. Never call a partial take a success.

Done when the user has the path, or the failing step.

## Writing good steps

- One idea per caption, in plain subject-verb-object, describing what happens. No marketing adjectives.
- Put the caption before the action it introduces, and hold a beat after a page change.
- Aim for under a minute; two or three routes usually tell the whole story.
- Prefer stable selectors: role, text, test ids. Scroll into view before acting.
- Hand over a first short take and ask about pacing and captions before filming a longer one.

## Boundaries

This is not a UI test; assertions belong in the project's own test runner. Static captures and design review go to screenshots or `visual-recap`. Native mobile simulators are out of scope.
