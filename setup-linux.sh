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
sudo apt-get install -y zsh-syntax-highlighting || echo "Could not install zsh-syntax-highlighting, continuing..."

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
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Check if an LTS version is already installed
if command -v nvm &> /dev/null; then
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
    echo "NVM not properly loaded. Please check your installation."
fi

# Install rbenv and ruby-build
echo "Setting up rbenv and Ruby..."
if [ ! -d ~/.rbenv ]; then
    git clone https://github.com/rbenv/rbenv.git ~/.rbenv
    
    # Add rbenv to PATH for current session
    export PATH="$HOME/.rbenv/bin:$PATH"
    
    # Add rbenv to PATH permanently (if not already there)
    if ! grep -q 'export PATH="$HOME/.rbenv/bin:$PATH"' ~/.bashrc; then
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
    fi
    
    if ! grep -q 'eval "$(rbenv init -)"' ~/.bashrc; then
        echo 'eval "$(rbenv init -)"' >> ~/.bashrc
    fi
    
    # Also add to zshrc if it exists
    if [ -f ~/.zshrc ]; then
        if ! grep -q 'export PATH="$HOME/.rbenv/bin:$PATH"' ~/.zshrc; then
            echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
        fi
        
        if ! grep -q 'eval "$(rbenv init -)"' ~/.zshrc; then
            echo 'eval "$(rbenv init -)"' >> ~/.zshrc
        fi
    fi
    
    # Initialize rbenv for current session
    eval "$(rbenv init -)"
    
    # Install ruby-build if not already installed
    if [ ! -d ~/.rbenv/plugins/ruby-build ]; then
        git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
        
        if ! grep -q 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' ~/.bashrc; then
            echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc
        fi
        
        # Also add to zshrc if it exists
        if [ -f ~/.zshrc ]; then
            if ! grep -q 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' ~/.zshrc; then
                echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.zshrc
            fi
        fi
        
        # Update path for current session
        export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"
    fi
else
    # Add rbenv to PATH for current session if not already initialized
    export PATH="$HOME/.rbenv/bin:$PATH"
    eval "$(rbenv init -)"
    echo "rbenv already installed"
fi

# Verify rbenv is working
if command -v rbenv &> /dev/null; then
    # Install latest stable Ruby if not already installed
    latest_stable=$(rbenv install -l 2>/dev/null | grep -v - | tail -1 | tr -d '[:space:]')
    
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
    echo "rbenv command not found. Please check your installation and PATH."
fi

# Install pyenv
echo "Installing pyenv..."
if [ ! -d "$HOME/.pyenv" ]; then
    curl https://pyenv.run | bash
fi

# Set up pyenv environment
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"

# Initialize pyenv if available
if command -v pyenv &> /dev/null; then
    eval "$(pyenv init -)"
    
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
    
    # Install pyenv-virtualenv
    echo "Installing pyenv-virtualenv..."
    if [ ! -d "$(pyenv root)/plugins/pyenv-virtualenv" ]; then
        git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
        
        # Add to shell configuration files if not already there
        if ! grep -q 'eval "$(pyenv virtualenv-init -)"' ~/.bashrc; then
            echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
        fi
        
        if [ -f ~/.zshrc ]; then
            if ! grep -q 'eval "$(pyenv virtualenv-init -)"' ~/.zshrc; then
                echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.zshrc
            fi
        fi
        
        eval "$(pyenv virtualenv-init -)"
    else
        echo "pyenv-virtualenv already installed"
    fi
else
    echo "pyenv command not found. Please check your installation and PATH."
fi

# Install PostgreSQL for Rails development
echo "Installing PostgreSQL for Rails development..."

# Check if PostgreSQL is already installed
if command -v psql &> /dev/null; then
  echo "PostgreSQL is already installed"
else
  # Add PostgreSQL repository
  echo "Adding PostgreSQL repository..."
  sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
  
  # Update package lists
  sudo apt-get update
  
  # Install PostgreSQL 14 (or the latest version compatible with your Rails projects)
  echo "Installing PostgreSQL 14..."
  sudo apt-get install -y postgresql-14 postgresql-contrib libpq-dev
  
  # Ensure the PostgreSQL service is started
  sudo systemctl enable postgresql
  sudo systemctl start postgresql
  
  # Set up a PostgreSQL user with the same name as your system user (Rails convention)
  echo "Setting up PostgreSQL user..."
  # Use conditional logic to avoid errors if the user already exists
  sudo -u postgres psql -c "DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$(whoami)') THEN
      CREATE ROLE $(whoami) WITH SUPERUSER CREATEDB LOGIN PASSWORD '$(whoami)';
    ELSE
      ALTER ROLE $(whoami) WITH SUPERUSER CREATEDB LOGIN PASSWORD '$(whoami)';
    END IF;
  END
  \$\$;"
  
  # Create a database with the same name as your user if it doesn't exist
  echo "Creating a default database for Rails development..."
  # Check if the database already exists
  if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$(whoami)"; then
    sudo -u postgres createdb "$(whoami)"
    echo "Database '$(whoami)' created."
  else
    echo "Database '$(whoami)' already exists."
  fi
  
  echo "PostgreSQL setup complete!"
  echo "You can connect to the default database with: psql"
  echo "Or if password required: psql -U $(whoami) -d $(whoami) -W"
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

# Install Fly.io CLI
echo "Installing Fly.io CLI..."
if ! command -v flyctl &> /dev/null && ! command -v fly &> /dev/null; then
    curl -L https://fly.io/install.sh | sh
    
    # Add Fly.io to PATH for current session
    export FLYCTL_INSTALL="/home/$USER/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
else
    echo "Fly.io CLI already installed"
fi

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
    if [ ! -d ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions ]; then
        git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    fi

    # Make zsh the default shell
    chsh -s $(which zsh)
else
    echo "Oh My Zsh already installed"
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
    
    echo "Snap installed. You'll need to log out and back in for snap to function properly."
else
    echo "Snap already installed"
fi

# Interactive app installation
echo "Would you like to install additional applications? (y/n)"
read install_apps

if [[ $install_apps =~ ^[Yy]$ ]]; then
    echo "Installing applications..."

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
        wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
        echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
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