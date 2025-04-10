# Path to your oh-my-zsh installation
export ZSH="$HOME/.oh-my-zsh"

# Theme
# ZSH_THEME="avit"
ZSH_THEME="robbyrussell"

# Auto-update behavior
DISABLE_UPDATE_PROMPT="true"

# Plugins
plugins=(git gitfast last-working-dir common-aliases sublime zsh-autosuggestions zsh-syntax-highlighting history-substring-search)

# Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# NVM setup
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# rbenv setup
export PATH="$HOME/.rbenv/bin:$PATH"
command -v rbenv >/dev/null && eval "$(rbenv init -)"  # Only initialize if rbenv is installed

# pyenv setup
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null && export PATH="$PYENV_ROOT/bin:$PATH" && eval "$(pyenv init -)"  # Only initialize if pyenv is installed

# Platform-specific paths
if [[ $(uname) == "Darwin" ]]; then
  # macOS specific settings
  export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
elif [[ $(uname) == "Linux" ]]; then
  # Linux specific settings
  export PATH="$HOME/.local/bin:$PATH"
fi

# Load aliases
[[ -f "$HOME/.aliases" ]] && source "$HOME/.aliases"
