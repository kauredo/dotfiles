#!/bin/bash

# Lists every path link-dotfiles.sh manages under ~/.claude that is no longer a
# symlink. Tools replace links with real copies when they rewrite a file in
# place: `claude plugin` rewrites settings.json, `npx hyperframes skills update`
# rewrites its skill folders. The repo copy then stops being the live one.
# Exit 1 when anything drifted, so callers can choose to warn or fail.

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/claude"
DST="$HOME/.claude"
drift=0

check() {
  local dest="$1"
  if [ -e "$dest" ] && [ ! -L "$dest" ]; then
    echo "not a symlink: $dest"
    drift=1
  fi
}

for f in "$SRC"/*.md "$SRC/settings.json"; do
  [ -e "$f" ] && check "$DST/$(basename "$f")"
done
for d in commands agents scripts hooks; do
  for f in "$SRC/$d"/*; do
    [ -e "$f" ] && check "$DST/$d/$(basename "$f")"
  done
done
for d in "$SRC/skills"/*/; do
  check "$DST/skills/$(basename "$d")"
done

if [ "$drift" = 1 ]; then
  echo "Diff each one against its repo copy, keep what's newer, then run link-dotfiles.sh."
fi
exit "$drift"
