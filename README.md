# Development Environment Setup

This repository contains scripts and configuration files to quickly set up a consistent development environment on both macOS and Linux machines.

## What's Included

- **Dotfiles** (symlinked into `$HOME`, so edits in this repo are live):

  - `zshrc` -> `~/.zshrc` - Zsh shell configuration
  - `gitconfig` -> `~/.gitconfig` - Git configuration
  - `aliases` -> `~/.aliases` - Custom command aliases
  - `gitignore_global` -> `~/.gitignore_global` - Global gitignore

- **Claude Code config** (`claude/`, symlinked into `~/.claude`):

  - Global instructions (`CLAUDE.md`, `RTK.md`, `github-pending-review.md`)
  - `settings.json`, custom `commands/`, `agents/`, `hooks/`, `scripts/`, and hand-written `skills/`

- **Setup Scripts**:
  - `setup-mac.sh` - Setup script for macOS
  - `setup-linux.sh` - Setup script for Linux (Ubuntu/Debian-based)
  - `link-dotfiles.sh` - Symlinks all dotfiles + `claude/` into place (run by the setup scripts)
  - `lib/setup-common.sh` - Shared Node/Ruby/Python/PostgreSQL helpers used by both setup scripts
  - `Brewfile` - Package definitions for Homebrew (macOS)

## Getting Started on a New Machine

### 1. Clone this repository:

Clone over **HTTPS** — the repo is public, and a fresh machine has no SSH key yet
(the setup script generates one later, see step 4):

```bash
git clone https://github.com/kauredo/dotfiles.git
cd dotfiles
```

### 2. Run the appropriate setup script:

#### For macOS:

```bash
chmod +x setup-mac.sh
./setup-mac.sh
```

#### For Linux (Ubuntu/Debian-based):

```bash
chmod +x setup-linux.sh
./setup-linux.sh
```

### 3. Follow any on-screen instructions

The scripts will:

- Install necessary package managers and tools
- Generate SSH keys if needed (and show instructions for adding to GitHub)
- Install programming language environments (Ruby, Node.js, Python)
- Install and configure PostgreSQL (starts the service and creates a dev role plus a database named after your user)
- Set up Zsh with Oh My Zsh
- Install Claude Code (native, self-updating installer)
- Symlink your dotfiles into place (via `link-dotfiles.sh`); this is also what applies your Git config. Name, email, and aliases come from the tracked `gitconfig`, with machine-specific overrides in `~/.gitconfig.local`
- Prompt (y/n) for pgAdmin, Redis, and a set of common applications, e.g.:
  - Ghostty (terminal)
  - Visual Studio Code
  - Sublime Text
  - iTerm2 (macOS only)
  - Zen Browser (macOS only)
  - Google Chrome
  - Slack
  - Spotify

The script will ask for confirmation before installing each optional application.

### 4. Add SSH Key to GitHub

After running the setup script, make sure to:

1. Copy the displayed SSH public key
2. Add it to your GitHub account at https://github.com/settings/ssh
3. Test your connection with: `ssh -T git@github.com`
4. (Optional) switch this repo's remote from HTTPS to SSH so you can push without a token:
   ```bash
   git remote set-url origin git@github.com:kauredo/dotfiles.git
   ```

### 5. Managing Language Versions

After setup, you can manage your language versions:

#### Node.js (via nvm):

```bash
nvm ls                    # List installed versions
nvm install 16.14.0       # Install specific version
nvm use 16.14.0           # Switch to a specific version
nvm alias default 16.14.0 # Set default version
```

#### Ruby (via rbenv):

```bash
rbenv versions            # List installed versions
rbenv install 3.1.0       # Install specific version
rbenv global 3.1.0        # Set global version
rbenv local 3.1.0         # Set local version (project-specific)
```

#### Python (via pyenv):

```bash
pyenv versions            # List installed versions
pyenv install 3.10.0      # Install specific version
pyenv global 3.10.0       # Set global version
pyenv local 3.10.0        # Set local version (project-specific)
```

### 6. Verify Installation

The setup should be complete! Open a new terminal and check that:

- Zsh is your default shell
- Your aliases are working
- Git is configured correctly
- Language version managers (rbenv, nvm, pyenv) are working

## How Dotfiles Are Linked

`link-dotfiles.sh` symlinks every tracked dotfile (`zshrc`, `aliases`,
`gitconfig`, `gitignore_global`) and the `claude/` config into place, so editing
a file in this repo immediately affects the running config (and vice versa). The
setup scripts run it for you; you can also run it manually anytime:

```bash
./link-dotfiles.sh   # (re)create all symlinks
```

If a destination already exists as a real file, it is moved aside to
`<name>.bak.<timestamp>` before linking.

### Machine-specific config (`.local` files)

Anything that should not be tracked (per-machine PATHs, tool-installer lines,
work-only aliases) goes in untracked escape-hatch files that the tracked
dotfiles source if present:

- `~/.zshrc.local` - shell/env/PATH lines
- `~/.aliases.local` - machine-only aliases and functions
- `~/.gitconfig.local` - included via `[include]` in the tracked gitconfig

Heads-up: because `~/.zshrc` is a symlink, a tool installer that appends to it
with `>> ~/.zshrc` writes into the **tracked** repo file. If that happens, move
those lines into `~/.zshrc.local` and revert the repo file.

### Claude Code config

Claude Code itself is installed by the setup scripts via the native installer
(`curl -fsSL https://claude.ai/install.sh | bash`), which self-updates. Notes on
the versioned `claude/` config:

- Plugins are **not** versioned. They are reinstalled from the `enabledPlugins`
  and `extraKnownMarketplaces` entries in `claude/settings.json`.
- Runtime data (`projects/`, `sessions/`, `history.jsonl`, caches) is left out.
- `settings.json` uses `$HOME` rather than absolute paths, so it works across
  machines regardless of username.
- Skills are linked individually, so plugin-managed skills in `~/.claude/skills`
  are left untouched.

## Customizing the Setup

- Edit `zshrc` to customize your shell (it's symlinked to `~/.zshrc`, so changes are live)
- Add new aliases to `aliases`; keep machine-specific ones in `~/.aliases.local`
- Edit `Brewfile` to add/remove core macOS packages
- Modify the setup scripts to:
  - Change the list of applications in the interactive installation
  - Add new development tools
  - Customize language versions and defaults

## Development

Shell scripts in this repo are linted by a [shellcheck](https://www.shellcheck.net)
GitHub Actions workflow (`.github/workflows/shellcheck.yml`) on every push and
pull request, at `--severity=warning`. Run the same check locally before pushing:

```bash
git ls-files '*.sh' | xargs shellcheck --severity=warning
```

Shared install logic (Node/Ruby/Python/PostgreSQL) lives in `lib/setup-common.sh`
and is sourced by both setup scripts, so platform-specific tweaks only need to
change the version-manager install, not the "install latest + configure" steps.

## Updating Your Environment

To update all your packages later:

### macOS:

```bash
brew update && brew upgrade
```

### Linux:

```bash
sudo apt update && sudo apt upgrade
```

## Troubleshooting

If you encounter any issues:

1. Check the error messages
2. Make sure you have sufficient permissions
3. For Linux, ensure you're using a Debian/Ubuntu-based distribution
4. For specific version managers, consult their documentation:
   - nvm: https://github.com/nvm-sh/nvm
   - rbenv: https://github.com/rbenv/rbenv
   - pyenv: https://github.com/pyenv/pyenv

## Additional Resources

- For bulk application installation on macOS: https://macapps.link
- For bulk application installation on Windows/Linux: https://ninite.com
