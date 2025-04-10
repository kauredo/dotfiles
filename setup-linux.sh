#!/bin/bash

# Exit if any command fails
set -e

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
sudo apt-get install -y zsh-syntax-highlighting

# Set up Git configuration
echo "Setting up Git..."
git config --global color.ui true
git config --global user.name "kauredo"
git config --global user.email "vaskafig@gmail.com"

# Set up global .gitignore
echo "Setting up global .gitignore..."
git config --global core.excludesfile ~/.gitignore_global

# Create SSH key if it doesn't exist
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -C "vaskafig@gmail.com"

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
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt-get update
sudo apt-get install -y gh

# Install Node.js via nvm
echo "Setting up Node Version Manager (nvm)..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install latest LTS version of Node.js
echo "Installing Node.js LTS..."
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

# Install rbenv and ruby-build
echo "Setting up rbenv and Ruby..."
if [ ! -d ~/.rbenv ]; then
    git clone https://github.com/rbenv/rbenv.git ~/.rbenv
    echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
    echo 'eval "$(rbenv init -)"' >> ~/.bashrc

    export PATH="$HOME/.rbenv/bin:$PATH"
    eval "$(rbenv init -)"

    git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
    echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc

    export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"
fi

# Install Ruby
latest_stable=$(~/.rbenv/bin/rbenv install -l 2>/dev/null | grep -v - | tail -1 | tr -d '[:space:]')
echo "Installing Ruby $latest_stable..."
~/.rbenv/bin/rbenv install $latest_stable
~/.rbenv/bin/rbenv global $latest_stable

# Install bundler
echo "Installing bundler and Rails..."
~/.rbenv/shims/gem install bundler
~/.rbenv/shims/gem install rails
~/.rbenv/bin/rbenv rehash

# Install pyenv
echo "Installing pyenv..."
curl https://pyenv.run | bash
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Install latest Python
latest_python=$(pyenv install --list | grep -v - | grep -v a | grep -v b | tail -1 | tr -d '[:space:]')
echo "Installing Python $latest_python..."
pyenv install $latest_python
pyenv global $latest_python

# Install pyenv-virtualenv
echo "Installing pyenv-virtualenv..."
git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.zshrc
eval "$(pyenv virtualenv-init -)"

# Install Fly.io CLI
echo "Installing Fly.io CLI..."
curl -L https://fly.io/install.sh | sh

# Install zsh if not already installed
echo "Installing and configuring Zsh..."
if ! command -v zsh &> /dev/null; then
    sudo apt-get install -y zsh
fi

# Install Oh My Zsh if not already installed
if [ ! -d ~/.oh-my-zsh ]; then
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

    # Install zsh-syntax-highlighting plugin if not already installed
    if [ ! -d ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting ]; then
        git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    fi

    # Install zsh-autosuggestions plugin
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

    # Make zsh the default shell
    chsh -s $(which zsh)
fi

# Copy config files if they exist
echo "Setting up dotfiles..."
[ -f gitconfig ] && cp gitconfig ~/.gitconfig
[ -f zshrc ] && cp zshrc ~/.zshrc
[ -f aliases ] && cp aliases ~/.aliases
[ -f gitignore_global ] && cp gitignore_global ~/.gitignore_global

# Install Finicky alternative
echo "Note: Finicky (browser selector) is macOS-only. Consider installing an alternative like 'browser-select' for Linux."

# Install snap if not present
if ! command -v snap &> /dev/null; then
    echo "Installing snap..."
    sudo apt-get update
    sudo apt-get install -y snapd
    # Ensure snap's core is installed and up to date
    sudo snap install core
    # Ensure snap paths are set up correctly
    sudo ln -s /var/lib/snapd/snap /snap 2>/dev/null || true

    echo "Reloading shell to enable snap..."
    exec zsh
fi

# Interactive app installation
echo "Would you like to install additional applications? (y/n)"
read -r install_apps

if [[ $install_apps =~ ^[Yy]$ ]]; then
    echo "Installing applications..."

    read -p "Install Visual Studio Code? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo snap install code --classic
    fi

    read -p "Install Sublime Text? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
        echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
        sudo apt-get update
        sudo apt-get install -y sublime-text
    fi

    read -p "Install Google Chrome? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
        sudo dpkg -i google-chrome-stable_current_amd64.deb
        sudo apt-get install -f -y
        rm google-chrome-stable_current_amd64.deb
    fi

    read -p "Install Slack? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo snap install slack --classic
    fi

    read -p "Install Spotify? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo snap install spotify
    fi

    echo "Note: Zen Browser and iTerm2 are macOS-only applications and cannot be installed on Linux."
fi

echo "=========================================="
echo "Setup complete! Your Linux development environment is ready."
echo "Please log out and log back in for all changes to take effect."
echo ""
echo "To install additional applications in bulk (on Windows), visit:"
echo "https://ninite.com"
echo "=========================================="
