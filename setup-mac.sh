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

# Set up Node.js with nvm
if [ -f "$(brew --prefix)/opt/nvm/nvm.sh" ]; then
    echo "Setting up Node.js environment..."
    export NVM_DIR="$HOME/.nvm"
    mkdir -p "$NVM_DIR"
    source "$(brew --prefix)/opt/nvm/nvm.sh"
    
    # Check if an LTS version is already installed
    if nvm ls | grep -q "lts"; then
        echo "Node.js LTS is already installed"
        # Use the installed LTS version
        nvm use --lts
    else
        # Install latest LTS version of Node.js
        echo "Installing Node.js LTS..."
        nvm install --lts
        nvm use --lts
        nvm alias default 'lts/*'
    fi
    
    # Update npm to the latest version
    echo "Updating npm to the latest version..."
    npm install -g npm@latest
    
    # Verify the npm version
    echo "npm version:"
    npm --version
    
    # Install commonly used global npm packages
    echo "Installing common global npm packages..."
    npm install -g yarn
    
    echo "Node.js environment setup complete!"
else
    echo "nvm not found. Make sure it was installed via Homebrew."
fi

# Set up Ruby environment with rbenv
if command -v rbenv &> /dev/null; then
    echo "Setting up Ruby environment..."
    
    # Ensure rbenv is initialized properly
    eval "$(rbenv init -)"
    
    # Install latest stable Ruby if not already installed
    latest_stable=$(rbenv install -l | grep -v - | tail -1 | tr -d '[:space:]')
    
    # Check if this version is already installed
    if rbenv versions | grep -q "$latest_stable"; then
        echo "Ruby $latest_stable is already installed"
    else
        echo "Installing Ruby $latest_stable..."
        rbenv install $latest_stable
    fi
    
    # Set as global version
    echo "Setting Ruby $latest_stable as global version..."
    rbenv global $latest_stable
    
    # Ensure the correct Ruby is being used
    eval "$(rbenv init -)"
    rbenv rehash
    
    # Install bundler and Rails
    echo "Installing bundler and Rails..."
    gem install bundler
    gem install rails
    
    # Rehash again to update paths
    rbenv rehash
else
    echo "rbenv not found. Make sure it was installed via Homebrew."
fi

# Set up Python environment with pyenv
if command -v pyenv &> /dev/null; then
    echo "Setting up Python environment..."
    # Add pyenv init to shell
    eval "$(pyenv init -)"
    
    # Initialize pyenv-virtualenv if installed
    if command -v pyenv-virtualenv-init &> /dev/null; then
        eval "$(pyenv virtualenv-init -)"
    fi

    # Find latest stable Python version
    latest_python=$(pyenv install --list | grep -v - | grep -v a | grep -v b | grep -v rc | tail -1 | tr -d '[:space:]')
    
    # Check if this version is already installed
    if pyenv versions | grep -q "$latest_python"; then
        echo "Python $latest_python is already installed"
    else
        echo "Installing Python $latest_python..."
        pyenv install $latest_python
    fi
    
    # Set as global version
    echo "Setting Python $latest_python as global version..."
    pyenv global $latest_python
else
    echo "pyenv not found. Make sure it was installed via Homebrew."
fi

# Install PostgreSQL using Homebrew
echo "Installing PostgreSQL..."
if brew list postgresql@14 &>/dev/null; then
  echo "PostgreSQL is already installed"
else
  brew install postgresql@14
  
  # Start PostgreSQL service
  brew services start postgresql@14
  
  # Create a database with the same name as your user (Rails convention)
  echo "Creating a default database for Rails development..."
  createdb "$(whoami)"
  
  # Wait a moment for PostgreSQL to fully start
  sleep 3
  
  # Check if PostgreSQL is running
  if pg_isready &>/dev/null; then
    echo "PostgreSQL is running successfully!"
  else
    echo "PostgreSQL may not be running. You might need to start it manually with:"
    echo "brew services start postgresql@14"
  fi
  
  # Optional: Set up a PostgreSQL superuser with the same name as your system user
  echo "Setting up PostgreSQL user..."
  # Use conditional logic to avoid errors if the user already exists
  psql -d postgres -c "DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$(whoami)') THEN
      CREATE ROLE $(whoami) WITH SUPERUSER CREATEDB LOGIN;
    ELSE
      ALTER ROLE $(whoami) WITH SUPERUSER CREATEDB LOGIN;
    END IF;
  END
  \$\$;"
  
  echo "PostgreSQL setup complete!"
  echo "You can connect to the default database with: psql"
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

# Copy config files if they exist
echo "Setting up dotfiles..."
[ -f gitconfig ] && cp gitconfig ~/.gitconfig
[ -f zshrc ] && cp zshrc ~/.zshrc
[ -f aliases ] && cp aliases ~/.aliases
[ -f gitignore_global ] && cp gitignore_global ~/.gitignore_global

# Interactive app installation
echo "Would you like to install additional applications? (y/n)"
read install_apps

if [[ $install_apps =~ ^[Yy]$ ]]; then
    echo "Installing applications..."

    read -p "Install Finicky (browser selector)? (y/n) " install_finicky
    if [[ $install_finicky =~ ^[Yy]$ ]]; then
        brew install --cask finicky
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
        brew install --cask caffeine
    fi

    read -p "Install Flycut (clipboard manager)? (y/n) " install_flycut
    if [[ $install_flycut =~ ^[Yy]$ ]]; then
        brew install --cask flycut
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

    read -p "Install Rectangle (window manager)? (y/n) " install_rectangle
    if [[ $install_rectangle =~ ^[Yy]$ ]]; then
        brew install --cask rectangle
    fi

    read -p "Install Obsidian (knowledge management)? (y/n) " install_obsidian
    if [[ $install_obsidian =~ ^[Yy]$ ]]; then
        brew install --cask obsidian
    fi

    read -p "Install Orbstack (Docker Desktop alternative)? (y/n) " install_orbstack
    if [[ $install_orbstack =~ ^[Yy]$ ]]; then
        brew install --cask orbstack
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