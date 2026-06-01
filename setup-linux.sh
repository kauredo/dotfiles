#!/bin/bash

# Exit if any command fails
set -e

# Run from the repo directory so relative paths (lib, link script) work.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
source "$SCRIPT_DIR/lib/setup-common.sh"

echo "=========================================="
echo "Setting up your Linux development environment"
echo "=========================================="

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install Git and basic tools
echo "Installing Git and essential tools..."
sudo apt-get install -y git git-core curl zlib1g-dev build-essential libssl-dev \
  libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev \
  libcurl4-openssl-dev software-properties-common libffi-dev \
  zstd openssl coreutils pkgconf tmux tree wget jq

# Install zsh-syntax-highlighting
echo "Installing zsh-syntax-highlighting..."
sudo apt-get install -y zsh-syntax-highlighting || echo "Could not install zsh-syntax-highlighting, continuing..."

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

# Install GitHub CLI
echo "Installing GitHub CLI..."
if ! command -v gh &> /dev/null; then
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y gh
else
    echo "GitHub CLI already installed"
fi

# Install Node.js via nvm
echo "Setting up Node Version Manager (nvm)..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

setup_node

# Install rbenv and ruby-build
echo "Setting up rbenv and Ruby..."
if [ ! -d ~/.rbenv ]; then
    git clone https://github.com/rbenv/rbenv.git ~/.rbenv

    # Add rbenv to ~/.bashrc for bash sessions. The tracked zshrc already
    # initializes rbenv, so don't append to ~/.zshrc (it's a symlink to the
    # repo file and would pollute the tracked dotfile).
    if ! grep -q 'export PATH="$HOME/.rbenv/bin:$PATH"' ~/.bashrc; then
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
    fi
    if ! grep -q 'eval "$(rbenv init -)"' ~/.bashrc; then
        echo 'eval "$(rbenv init -)"' >> ~/.bashrc
    fi

    # Install ruby-build plugin (auto-discovered by rbenv)
    if [ ! -d ~/.rbenv/plugins/ruby-build ]; then
        git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
    fi
else
    echo "rbenv already installed"
fi

# Make rbenv available for the rest of this script, then install Ruby.
export PATH="$HOME/.rbenv/bin:$PATH"
setup_ruby

# Install pyenv
echo "Installing pyenv..."
if [ ! -d "$HOME/.pyenv" ]; then
    curl -fsSL https://pyenv.run | bash
fi

# Make pyenv available for the rest of this script
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"

# Install the pyenv-virtualenv plugin before installing Python so setup_python
# can pick up virtualenv-init if present.
if command -v pyenv &> /dev/null; then
    eval "$(pyenv init -)"
    if [ ! -d "$(pyenv root)/plugins/pyenv-virtualenv" ]; then
        echo "Installing pyenv-virtualenv..."
        git clone https://github.com/pyenv/pyenv-virtualenv.git "$(pyenv root)/plugins/pyenv-virtualenv"
        # Add to ~/.bashrc only. Don't append to ~/.zshrc; it's a symlink to the
        # tracked repo file and the write would pollute the tracked dotfile.
        if ! grep -q 'eval "$(pyenv virtualenv-init -)"' ~/.bashrc; then
            echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
        fi
    else
        echo "pyenv-virtualenv already installed"
    fi
fi

setup_python

# Install PostgreSQL for Rails development
echo "Installing PostgreSQL for Rails development..."

# Check if PostgreSQL is already installed
if command -v psql &> /dev/null; then
  echo "PostgreSQL is already installed"
else
  # Add PostgreSQL repository (signed keyring instead of deprecated apt-key)
  echo "Adding PostgreSQL repository..."
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | sudo gpg --dearmor -o /usr/share/keyrings/postgresql-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/postgresql-archive-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    | sudo tee /etc/apt/sources.list.d/pgdg.list > /dev/null
  
  # Update package lists
  sudo apt-get update
  
  # Install PostgreSQL 14 (or the latest version compatible with your Rails projects)
  echo "Installing PostgreSQL 14..."
  sudo apt-get install -y postgresql-14 postgresql-contrib libpq-dev
  
  # Ensure the PostgreSQL service is started
  sudo systemctl enable postgresql
  sudo systemctl start postgresql

  setup_postgres_role_and_db "sudo -u postgres psql" "sudo -u postgres createdb"

  echo "PostgreSQL setup complete!"
  echo "You can connect to the default database with: psql"
fi

# Install pgAdmin (optional GUI tool)
echo "Would you like to install pgAdmin (PostgreSQL GUI tool)? (y/n)"
read install_pgadmin

if [[ $install_pgadmin =~ ^[Yy]$ ]]; then
  # Install the public key for the repository
  curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
  
  # Create the repository configuration file
  sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'
  
  # Update package lists
  sudo apt-get update
  
  # Install pgAdmin for both desktop and web modes
  sudo apt-get install -y pgadmin4
  
  echo "pgAdmin installed!"
fi

# Install Redis (commonly used with Rails for background jobs, caching, etc.)
echo "Would you like to install Redis (commonly used with Rails)? (y/n)"
read install_redis

if [[ $install_redis =~ ^[Yy]$ ]]; then
  if command -v redis-server &> /dev/null; then
    echo "Redis is already installed"
  else
    sudo apt-get install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    echo "Redis installed and started!"
  fi
fi

# Install zsh if not already installed
echo "Installing and configuring Zsh..."
if ! command -v zsh &> /dev/null; then
    sudo apt-get install -y zsh
fi

# Install Oh My Zsh if not already installed
if [ ! -d ~/.oh-my-zsh ]; then
    # Pinned to a specific commit instead of the moving master branch.
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/70ad5e3df8f7bed68aa6672029496926e632aedd/tools/install.sh)" "" --unattended

    # Install zsh-syntax-highlighting plugin if not already installed
    if [ ! -d ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting ]; then
        git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    fi

    # Install zsh-autosuggestions plugin
    if [ ! -d ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions ]; then
        git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    fi

    # Make zsh the default shell
    chsh -s "$(which zsh)"
else
    echo "Oh My Zsh already installed"
fi

# Copy config files if they exist
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

# Install Finicky alternative
echo "Note: Finicky (browser selector) is macOS-only. Consider installing an alternative like 'browser-select' for Linux."

# Interactive app installation
echo "Would you like to install additional applications? (y/n)"
read install_apps

if [[ $install_apps =~ ^[Yy]$ ]]; then
    echo "Installing applications..."

    # Several apps below install via snap, so set it up first (only when the
    # user actually opted into app installation).
    if ! command -v snap &> /dev/null; then
        echo "Installing snap..."
        sudo apt-get update
        sudo apt-get install -y snapd
        sudo snap install core
        sudo ln -s /var/lib/snapd/snap /snap 2>/dev/null || true
        echo "Snap installed. You'll need to log out and back in for snap to function properly."
    else
        echo "Snap already installed"
    fi

    read -p "Install Visual Studio Code? (y/n) " install_vscode
    if [[ $install_vscode =~ ^[Yy]$ ]]; then
        if command -v snap &> /dev/null; then
            sudo snap install code --classic
        else
            echo "Snap not available. Installing VS Code via apt..."
            wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
            sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
            sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
            rm -f packages.microsoft.gpg
            sudo apt-get update
            sudo apt-get install -y code
        fi
    fi

    read -p "Install Sublime Text? (y/n) " install_sublime
    if [[ $install_sublime =~ ^[Yy]$ ]]; then
        wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg \
            | sudo gpg --dearmor -o /usr/share/keyrings/sublimehq-archive-keyring.gpg
        echo "deb [signed-by=/usr/share/keyrings/sublimehq-archive-keyring.gpg] https://download.sublimetext.com/ apt/stable/" \
            | sudo tee /etc/apt/sources.list.d/sublime-text.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y sublime-text
    fi

    read -p "Install Google Chrome? (y/n) " install_chrome
    if [[ $install_chrome =~ ^[Yy]$ ]]; then
        wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
        sudo dpkg -i google-chrome-stable_current_amd64.deb
        sudo apt-get install -f -y
        rm google-chrome-stable_current_amd64.deb
    fi

    read -p "Install Slack? (y/n) " install_slack
    if [[ $install_slack =~ ^[Yy]$ ]]; then
        if command -v snap &> /dev/null; then
            sudo snap install slack --classic
        else
            echo "Snap not available. You may need to install Slack manually."
        fi
    fi

    read -p "Install Spotify? (y/n) " install_spotify
    if [[ $install_spotify =~ ^[Yy]$ ]]; then
        if command -v snap &> /dev/null; then
            sudo snap install spotify
        else
            echo "Snap not available. You may need to install Spotify manually."
        fi
    fi

    read -p "Install Caffeine alternative (prevents system sleep)? (y/n) " install_caffeine
    if [[ $install_caffeine =~ ^[Yy]$ ]]; then
        sudo apt-get install -y caffeine
    fi

    read -p "Install MEGAsync? (y/n) " install_megasync
    if [[ $install_megasync =~ ^[Yy]$ ]]; then
        # Add MEGA repository
        release="$(lsb_release -rs)"
        wget "https://mega.nz/linux/repo/xUbuntu_${release}/amd64/megasync-xUbuntu_${release}_amd64.deb"
        sudo apt-get install -y "./megasync-xUbuntu_${release}_amd64.deb"
        rm "megasync-xUbuntu_${release}_amd64.deb"
    fi

    read -p "Install Albert (application launcher, alternative to Raycast)? (y/n) " install_albert
    if [[ $install_albert =~ ^[Yy]$ ]]; then
        sudo apt-get install -y albert
    fi

    read -p "Install OneDrive client? (y/n) " install_onedrive
    if [[ $install_onedrive =~ ^[Yy]$ ]]; then
        # Install OneDrive client for Linux
        sudo apt-get install -y onedrive
    fi

    read -p "Install Google Cloud CLI? (y/n) " install_gcloud
    if [[ $install_gcloud =~ ^[Yy]$ ]]; then
        if command -v snap &> /dev/null; then
            sudo snap install google-cloud-cli --classic
        else
            echo "Snap not available. Install the Google Cloud CLI manually: https://cloud.google.com/sdk/docs/install"
        fi
    fi

    read -p "Install ngrok? (y/n) " install_ngrok
    if [[ $install_ngrok =~ ^[Yy]$ ]]; then
        if command -v snap &> /dev/null; then
            sudo snap install ngrok
        else
            echo "Snap not available. Install ngrok manually: https://ngrok.com/download"
        fi
    fi

    read -p "Install Obsidian (knowledge management)? (y/n) " install_obsidian
    if [[ $install_obsidian =~ ^[Yy]$ ]]; then
        # Resolve the latest amd64 .deb from the GitHub releases API.
        obsidian_url=$(curl -fsSL https://api.github.com/repos/obsidianmd/obsidian-releases/releases/latest \
            | jq -r '.assets[] | select(.name | test("amd64\\.deb$")) | .browser_download_url' | head -1)
        if [ -n "$obsidian_url" ]; then
            wget -O obsidian.deb "$obsidian_url"
            sudo apt-get install -y ./obsidian.deb
            rm obsidian.deb
        else
            echo "Could not resolve the latest Obsidian release; skipping."
        fi
    fi

    read -p "Install Docker Engine (Orbstack alternative for Linux)? (y/n) " install_docker
    if [[ $install_docker =~ ^[Yy]$ ]]; then
        # Set up Docker's apt repository
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        
        # Add the repository to Apt sources
        docker_arch="$(dpkg --print-architecture)"
        docker_codename="$(. /etc/os-release && echo "$VERSION_CODENAME")"
        echo "deb [arch=$docker_arch signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $docker_codename stable" \
            | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Add user to docker group to run docker without sudo
        sudo usermod -aG docker $USER
        echo "Docker installed. You'll need to log out and back in for docker group changes to take effect."
    fi

    echo "Note: Zen Browser and iTerm2 are macOS-only applications and cannot be installed on Linux."
fi

echo "=========================================="
echo "Setup complete! Your Linux development environment is ready."
echo "Please log out and log back in for all changes to take effect."
echo ""
echo "To install additional applications in bulk (on Windows), visit:"
echo "https://ninite.com"
echo ""
echo "Your Node.js, Ruby, Python, and PostgreSQL environments are now set up and ready to use."
echo "=========================================="