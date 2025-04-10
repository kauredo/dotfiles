#!/bin/bash

# Exit if any command fails
set -e

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
if [ -f Brewfile ]; then
    echo "Installing packages from Brewfile..."
    brew bundle --file=Brewfile
else
    echo "Brewfile not found. Skipping package installation."
fi

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

# Install Oh My Zsh if it's not installed
if [ ! -d ~/.oh-my-zsh ]; then
    echo "Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

    # Install zsh-syntax-highlighting plugin
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

    # Install zsh-autosuggestions plugin
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
else
    echo "Oh My Zsh already installed"
fi

# Set up Ruby environment with rbenv
if command -v rbenv &> /dev/null; then
    echo "Setting up Ruby environment..."
    # Install latest stable Ruby
    latest_stable=$(rbenv install -l | grep -v - | tail -1 | tr -d '[:space:]')
    echo "Installing Ruby $latest_stable..."
    rbenv install $latest_stable
    rbenv global $latest_stable

    # Install bundler and Rails
    echo "Installing bundler and Rails..."
    gem install bundler
    gem install rails
    rbenv rehash
else
    echo "rbenv not found. Make sure it was installed via Homebrew."
fi

# Set up Node.js with nvm
if command -v nvm &> /dev/null; then
    echo "Setting up Node.js environment..."
    export NVM_DIR="$HOME/.nvm"
    source $(brew --prefix nvm)/nvm.sh
    # Install latest LTS version of Node.js
    echo "Installing Node.js LTS..."
    nvm install --lts
    nvm use --lts
    nvm alias default 'lts/*'
else
    echo "nvm not found. Make sure it was installed via Homebrew."
fi

# Set up Python environment with pyenv
if command -v pyenv &> /dev/null; then
    echo "Setting up Python environment..."
    # Initialize pyenv-virtualenv if installed
    eval "$(pyenv virtualenv-init -)"

    # Install latest stable Python
    latest_python=$(pyenv install --list | grep -v - | grep -v a | grep -v b | tail -1 | tr -d '[:space:]')
    echo "Installing Python $latest_python..."
    pyenv install $latest_python
    pyenv global $latest_python
else
    echo "pyenv not found. Make sure it was installed via Homebrew."
fi

# Copy config files if they exist
echo "Setting up dotfiles..."
[ -f gitconfig ] && cp gitconfig ~/.gitconfig
[ -f zshrc ] && cp zshrc ~/.zshrc
[ -f aliases ] && cp aliases ~/.aliases
[ -f gitignore_global ] && cp gitignore_global ~/.gitignore_global

# Source the updated files
echo "Sourcing new configuration..."
exec zsh

# Interactive app installation
echo "Would you like to install additional applications? (y/n)"
read -r install_apps

if [[ $install_apps =~ ^[Yy]$ ]]; then
    echo "Installing applications..."

    read -p "Install Finicky (browser selector)? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask finicky
    fi

    read -p "Install Visual Studio Code? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask visual-studio-code
    fi

    read -p "Install Sublime Text? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask sublime-text
    fi

    read -p "Install iTerm2? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask iterm2
    fi

    read -p "Install Zen Browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask zen-browser
    fi

    read -p "Install Google Chrome? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask google-chrome
    fi

    read -p "Install Slack? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask slack
    fi

    read -p "Install Spotify? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install --cask spotify
    fi
fi

echo "=========================================="
echo "Setup complete! Your Mac development environment is ready."
echo ""
echo "To install additional applications in bulk, visit:"
echo "https://macapps.link"
echo "=========================================="
