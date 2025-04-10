# Development Environment Setup

This repository contains scripts and configuration files to quickly set up a consistent development environment on both macOS and Linux machines.

## What's Included

- **Dotfiles**:

  - `.zshrc` - Zsh shell configuration
  - `.gitconfig` - Git configuration
  - `.aliases` - Custom command aliases

- **Setup Scripts**:
  - `setup_mac.sh` - Setup script for macOS
  - `setup_linux.sh` - Setup script for Linux (Ubuntu/Debian-based)
  - `Brewfile` - Package definitions for Homebrew (macOS)

## Getting Started on a New Machine

### 1. Clone this repository:

```bash
git clone https://github.com/kauredo/dotfiles.git
cd dotfiles
```

### 2. Run the appropriate setup script:

#### For macOS:

```bash
chmod +x setup_mac.sh
./setup_mac.sh
```

#### For Linux (Ubuntu/Debian-based):

```bash
chmod +x setup_linux.sh
./setup_linux.sh
```

### 3. Follow any on-screen instructions

The scripts will:

- Install necessary package managers and tools
- Configure Git with your information
- Generate SSH keys if needed (and show instructions for adding to GitHub)
- Install programming language environments (Ruby, Node.js, Python)
- Set up Zsh with Oh My Zsh
- Copy your dotfiles to the appropriate locations
- Prompt for installation of common applications:
  - Visual Studio Code
  - Sublime Text
  - iTerm2 (macOS only)
  - Zen Browser (macOS only)
  - Google Chrome
  - Slack
  - Spotify
  - Finicky (macOS only)

The script will ask for confirmation before installing each application.

### 4. Add SSH Key to GitHub

After running the setup script, make sure to:

1. Copy the displayed SSH public key
2. Add it to your GitHub account at https://github.com/settings/ssh
3. Test your connection with: `ssh -T git@github.com`

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

## Customizing the Setup

- Edit `.zshrc` to customize your shell
- Add new aliases to `.aliases`
- Edit `Brewfile` to add/remove core macOS packages
- Modify the setup scripts to:
  - Change the list of applications in the interactive installation
  - Add new development tools
  - Customize language versions and defaults

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
