#!/bin/bash

# Symlinks the versioned Claude Code config (claude/) into ~/.claude so edits
# in this repo are live. Existing real files/dirs at the destination are moved
# aside to <name>.bak.<timestamp> before linking; existing symlinks are replaced.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/claude"
DST="$HOME/.claude"

mkdir -p "$DST/skills"

link() {
  local target="$1" dest="$2"
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -e "$dest" ]; then
    mv "$dest" "$dest.bak.$(date +%s)"
    echo "backed up existing $dest"
  fi
  ln -s "$target" "$dest"
  echo "linked $dest -> $target"
}

# Top-level files
for f in CLAUDE.md RTK.md github-pending-review.md settings.json; do
  link "$SRC/$f" "$DST/$f"
done

# User-owned directories (linked whole)
for d in commands agents hooks scripts; do
  link "$SRC/$d" "$DST/$d"
done

# Hand-written skills (linked individually so plugin-managed skills in
# ~/.claude/skills are left untouched)
for d in "$SRC/skills"/*/; do
  name="$(basename "$d")"
  link "$SRC/skills/$name" "$DST/skills/$name"
done

echo "Claude config linked."
