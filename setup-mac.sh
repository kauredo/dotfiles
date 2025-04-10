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
echo "Installing packages from Brewfile..."
brew bundle

# Set up Git configuration
echo "Setting up Git..."
git config --global color.ui true
git config --global user.name "kauredo"
git config --global user.email "vaskafig@gmail.com"

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
echo "Setting up Node.js environment..."
export NVM_DIR="$HOME/.nvm"
source $(brew --prefix nvm)/nvm.sh
# Install latest LTS version of Node.js
echo "Installing Node.js LTS..."
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

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

# Copy config files
echo "Setting up dotfiles..."
cp .gitconfig ~/.gitconfig
cp .zshrc ~/.zshrc
cp .aliases ~/.aliases

# Source the updated files
echo "Sourcing new configuration..."
source ~/.zshrc

echo "=========================================="
echo "Setup complete! Your Mac development environment is ready."
echo "=========================================="
