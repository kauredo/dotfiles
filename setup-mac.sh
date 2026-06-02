#!/bin/bash

# Exit if any command fails
set -e

# Run from the repo directory so relative paths (Brewfile, lib, link script) work.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
source "$SCRIPT_DIR/lib/setup-common.sh"

echo "=========================================="
echo "Setting up your Mac development environment"
echo "=========================================="

# Install homebrew if it's not installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon Macs if needed
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "Homebrew already installed, updating..."
    brew update
fi

# Install Xcode Command Line Tools if not already installed
if ! xcode-select -p &> /dev/null; then
    echo "Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "When the installation completes, press any key to continue..."
    read -n 1
fi

# Install packages from Brewfile
if [ -f "$SCRIPT_DIR/Brewfile" ]; then
    echo "Installing packages from Brewfile..."
    brew bundle --file="$SCRIPT_DIR/Brewfile"
else
    echo "Brewfile not found. Skipping package installation."
fi

# Git identity, colors, and global gitignore all come from the tracked
# gitconfig that link-dotfiles.sh symlinks to ~/.gitconfig below. Setting them
# again with `git config --global` here is redundant and, on a re-run where
# ~/.gitconfig is already the symlink, would write into the tracked repo file.

# Create SSH key if it doesn't exist
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)"

    echo "=========================================="
    echo "Your SSH public key is:"
    cat ~/.ssh/id_rsa.pub
    echo "=========================================="
    echo "Please add this key to GitHub: https://github.com/settings/ssh"
    echo "Then test with: ssh -T git@github.com"
else
    echo "SSH key already exists"
fi

# Install Oh My Zsh if it's not installed
if [ ! -d ~/.oh-my-zsh ]; then
    echo "Installing Oh My Zsh..."
    # Pinned to a specific commit instead of the moving master branch.
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/70ad5e3df8f7bed68aa6672029496926e632aedd/tools/install.sh)" "" --unattended

    # Install zsh-syntax-highlighting plugin
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

    # Install zsh-autosuggestions plugin
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
else
    echo "Oh My Zsh already installed"
fi

# Set up Node.js with nvm (installed via Brewfile)
if [ -f "$(brew --prefix)/opt/nvm/nvm.sh" ]; then
    echo "Setting up Node.js environment..."
    export NVM_DIR="$HOME/.nvm"
    mkdir -p "$NVM_DIR"
    source "$(brew --prefix)/opt/nvm/nvm.sh"
    setup_node
else
    echo "nvm not found. Make sure it was installed via Homebrew."
fi

# Set up Ruby environment with rbenv (installed via Brewfile)
echo "Setting up Ruby environment..."
setup_ruby

# Set up Python environment with pyenv (installed via Brewfile)
echo "Setting up Python environment..."
setup_python

# Set up PostgreSQL (installed via Brewfile)
echo "Setting up PostgreSQL..."
if brew list postgresql@14 &> /dev/null; then
  brew services start postgresql@14
  setup_postgres_role_and_db "psql -d postgres" "createdb"
  echo "PostgreSQL setup complete!"
  echo "You can connect to the default database with: psql"
else
  echo "postgresql@14 not installed (check Brewfile). Skipping PostgreSQL setup."
fi

# Install pgAdmin (optional GUI tool)
echo "Would you like to install pgAdmin (PostgreSQL GUI tool)? (y/n)"
read install_pgadmin

if [[ $install_pgadmin =~ ^[Yy]$ ]]; then
  brew install --cask pgadmin4
  echo "pgAdmin installed!"
fi

# Install Redis (commonly used with Rails for background jobs)
echo "Would you like to install Redis (commonly used with Rails)? (y/n)"
read install_redis

if [[ $install_redis =~ ^[Yy]$ ]]; then
  if brew list redis &>/dev/null; then
    echo "Redis is already installed"
  else
    brew install redis
    brew services start redis
    echo "Redis installed and started!"
  fi
fi

# Install Claude Code (native, self-updating installer)
if ! command -v claude &> /dev/null; then
    echo "Installing Claude Code..."
    curl -fsSL https://claude.ai/install.sh | bash
else
    echo "Claude Code already installed"
fi

# Symlink dotfiles into $HOME (edits in this repo stay live)
echo "Setting up dotfiles..."
if [ -f "$SCRIPT_DIR/link-dotfiles.sh" ]; then
    chmod +x "$SCRIPT_DIR/link-dotfiles.sh"
    "$SCRIPT_DIR/link-dotfiles.sh"
fi

# Clone the Notes vault (personal knowledge base). The global CLAUDE.md and the
# os-audit launchd job both reference ~/Notes, so the setup depends on it.
# Cloned, not submoduled: it has its own sync cadence (.cli.sh). Non-fatal —
# needs the SSH key (generated above) registered on GitHub first.
if [ ! -d "$HOME/Notes/.git" ]; then
    echo "Cloning Notes vault..."
    if git clone git@github.com:kauredo/Notes.git "$HOME/Notes"; then
        echo "Notes vault cloned"
    else
        echo "Could not clone Notes vault yet. Add your SSH key to GitHub, then run:"
        echo "  git clone git@github.com:kauredo/Notes.git ~/Notes"
    fi
else
    echo "Notes vault already present"
fi

# Interactive app installation
echo "Would you like to install additional applications? (y/n)"
read install_apps

if [[ $install_apps =~ ^[Yy]$ ]]; then
    echo "Installing applications..."

    read -p "Install Ghostty (terminal)? (y/n) " install_ghostty
    if [[ $install_ghostty =~ ^[Yy]$ ]]; then
        brew install --cask ghostty
    fi

    read -p "Install Visual Studio Code? (y/n) " install_vscode
    if [[ $install_vscode =~ ^[Yy]$ ]]; then
        brew install --cask visual-studio-code
    fi

    read -p "Install Sublime Text? (y/n) " install_sublime
    if [[ $install_sublime =~ ^[Yy]$ ]]; then
        brew install --cask sublime-text
    fi

    read -p "Install iTerm2? (y/n) " install_iterm
    if [[ $install_iterm =~ ^[Yy]$ ]]; then
        brew install --cask iterm2
    fi

    read -p "Install Zen Browser? (y/n) " install_zen
    if [[ $install_zen =~ ^[Yy]$ ]]; then
        brew install --cask zen-browser
    fi

    read -p "Install Google Chrome? (y/n) " install_chrome
    if [[ $install_chrome =~ ^[Yy]$ ]]; then
        brew install --cask google-chrome
    fi

    read -p "Install Slack? (y/n) " install_slack
    if [[ $install_slack =~ ^[Yy]$ ]]; then
        brew install --cask slack
    fi

    read -p "Install Spotify? (y/n) " install_spotify
    if [[ $install_spotify =~ ^[Yy]$ ]]; then
        brew install --cask spotify
    fi

    read -p "Install Caffeine (prevent Mac from sleeping)? (y/n) " install_caffeine
    if [[ $install_caffeine =~ ^[Yy]$ ]]; then
        brew install --cask domzilla-caffeine
    fi

    read -p "Install MEGAsync? (y/n) " install_megasync
    if [[ $install_megasync =~ ^[Yy]$ ]]; then
        brew install --cask megasync
    fi

    read -p "Install Raycast (launcher)? (y/n) " install_raycast
    if [[ $install_raycast =~ ^[Yy]$ ]]; then
        brew install --cask raycast
    fi

    read -p "Install OneDrive? (y/n) " install_onedrive
    if [[ $install_onedrive =~ ^[Yy]$ ]]; then
        brew install --cask onedrive
    fi

    read -p "Install Obsidian (knowledge management)? (y/n) " install_obsidian
    if [[ $install_obsidian =~ ^[Yy]$ ]]; then
        brew install --cask obsidian
    fi

    read -p "Install Orbstack (Docker Desktop alternative)? (y/n) " install_orbstack
    if [[ $install_orbstack =~ ^[Yy]$ ]]; then
        brew install --cask orbstack
    fi

    read -p "Install Google Cloud CLI? (y/n) " install_gcloud
    if [[ $install_gcloud =~ ^[Yy]$ ]]; then
        brew install --cask gcloud-cli
    fi

    read -p "Install ngrok? (y/n) " install_ngrok
    if [[ $install_ngrok =~ ^[Yy]$ ]]; then
        brew install --cask ngrok
    fi
fi

echo "=========================================="
echo "Setup complete! Your Mac development environment is ready."
echo ""
echo "IMPORTANT: To ensure all changes take effect, please restart your terminal or run:"
echo "source ~/.zshrc"
echo ""
echo "To install additional applications in bulk, visit:"
echo "https://macapps.link"
echo ""
echo "Your Node.js, Ruby, Python, and PostgreSQL environments are now set up and ready to use."
echo "=========================================="