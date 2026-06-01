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

# Verify the rtk hook matches its recorded checksum before linking it. The hook
# rewrites every bash command Claude Code runs, so a tampered copy must not be
# linked silently.
verify_hook_integrity() {
  local dir="$1"
  [ -f "$dir/.rtk-hook.sha256" ] || return 0
  local sha_cmd
  if command -v sha256sum >/dev/null 2>&1; then
    sha_cmd="sha256sum"
  else
    sha_cmd="shasum -a 256"
  fi
  if (cd "$dir" && $sha_cmd -c .rtk-hook.sha256 >/dev/null 2>&1); then
    echo "rtk hook integrity verified."
    return 0
  fi
  echo "WARNING: rtk-rewrite.sh does not match .rtk-hook.sha256." >&2
  echo "If you changed it on purpose, regenerate the checksum:" >&2
  echo "  (cd $dir && $sha_cmd rtk-rewrite.sh > .rtk-hook.sha256)" >&2
  return 1
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

# Link the contents of each config dir individually (not the dir itself) so any
# plugin-managed files Claude Code places alongside them are left untouched.
for d in commands agents scripts; do
  # Drop a whole-dir symlink left by the previous scheme; otherwise mkdir/link
  # below would resolve through it and write back into this repo.
  [ -L "$DST/$d" ] && rm "$DST/$d"
  mkdir -p "$DST/$d"
  for f in "$SRC/$d"/*; do
    [ -e "$f" ] && link "$f" "$DST/$d/$(basename "$f")"
  done
done

# hooks: verify the rtk hook checksum before linking anything in here.
[ -L "$DST/hooks" ] && rm "$DST/hooks"
mkdir -p "$DST/hooks"
if verify_hook_integrity "$SRC/hooks"; then
  for f in "$SRC/hooks"/*; do
    [ -e "$f" ] && link "$f" "$DST/hooks/$(basename "$f")"
  done
else
  echo "Skipped linking hooks due to the integrity check failure above." >&2
fi

# Hand-written skills (linked individually so plugin-managed skills in
# ~/.claude/skills are left untouched)
for d in "$SRC/skills"/*/; do
  name="$(basename "$d")"
  link "$SRC/skills/$name" "$DST/skills/$name"
done

echo "Dotfiles linked."
