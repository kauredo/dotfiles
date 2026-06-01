#!/bin/bash

# Symlinks the tracked dotfiles into $HOME so edits in this repo are live.
# Existing real files/dirs at the destination are moved aside to
# <name>.bak.<timestamp> before linking; existing symlinks are replaced.
#
# Machine-specific config that should NOT be tracked goes in the untracked
# escape-hatch files, which the tracked dotfiles source if present:
#   ~/.zshrc.local   ~/.aliases.local   ~/.gitconfig.local

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Shell and git dotfiles (repo name -> ~/.name)
link "$SCRIPT_DIR/zshrc"            "$HOME/.zshrc"
link "$SCRIPT_DIR/aliases"          "$HOME/.aliases"
link "$SCRIPT_DIR/gitconfig"        "$HOME/.gitconfig"
link "$SCRIPT_DIR/gitignore_global" "$HOME/.gitignore_global"

# Claude Code config
SRC="$SCRIPT_DIR/claude"
DST="$HOME/.claude"
mkdir -p "$DST/skills"

for f in CLAUDE.md RTK.md github-pending-review.md settings.json; do
  link "$SRC/$f" "$DST/$f"
done

for d in commands agents hooks scripts; do
  link "$SRC/$d" "$DST/$d"
done

# Hand-written skills (linked individually so plugin-managed skills in
# ~/.claude/skills are left untouched)
for d in "$SRC/skills"/*/; do
  name="$(basename "$d")"
  link "$SRC/skills/$name" "$DST/skills/$name"
done

echo "Dotfiles linked."
