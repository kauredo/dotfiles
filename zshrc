# Path to your oh-my-zsh installation
export ZSH="$HOME/.oh-my-zsh"

# Theme
# ZSH_THEME="avit"
ZSH_THEME="robbyrussell"

# Auto-update behavior
DISABLE_UPDATE_PROMPT="true"

# Plugins
plugins=(git gitfast last-working-dir common-aliases sublime zsh-autosuggestions zsh-syntax-highlighting history-substring-search nvm)

# Load Oh My Zsh
zstyle ':omz:plugins:nvm' autoload yes
source $ZSH/oh-my-zsh.sh

# NVM setup
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# History settings
export HISTSIZE=1000000
export SAVEHIST=1000000
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_REDUCE_BLANKS

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

  # Android/Java toolchain for app-mobile builds (RN 0.86 needs JDK 17, not 21).
  # Their absence burned two Play versionCodes on the 1.0.22 release; see
  # app-mobile/RELEASES.md. Note the brew prefix is not itself a JDK home: it
  # holds bin symlinks and no release/lib, which Gradle reads to pick a
  # toolchain. The real home is the bundle under libexec.
  JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null)"
  [[ -z "$JAVA_HOME" ]] && JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
  if [[ -x "$JAVA_HOME/bin/java" ]]; then
    export JAVA_HOME
    export PATH="$JAVA_HOME/bin:$PATH"
  else
    unset JAVA_HOME
  fi

  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$ANDROID_HOME/platform-tools:$PATH"
fi

# Single-user installers (Claude Code, uv, rustup) drop binaries here on every
# platform. Was Linux-only, which left `claude` off PATH on a fresh Mac until
# its installer happened to append to the untracked ~/.zshrc.local.
export PATH="$HOME/.local/bin:$PATH"

# Load aliases
[[ -f "$HOME/.aliases" ]] && source "$HOME/.aliases"

# Machine-specific config (untracked; tool installers append here)
[[ -f "$HOME/.aliases.local" ]] && source "$HOME/.aliases.local"
[[ -f "$HOME/.zshrc.local" ]] && source "$HOME/.zshrc.local"
