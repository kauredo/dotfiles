#!/bin/bash
# Shared setup helpers sourced by setup-mac.sh and setup-linux.sh.
#
# These assume the relevant version manager has already been installed and
# loaded by the caller (the install mechanism differs per platform), then
# handle the identical "install latest + configure globals" work.

# Install the latest Node LTS via an already-loaded nvm, plus npm/yarn.
setup_node() {
  if ! command -v nvm &> /dev/null; then
    echo "nvm not available; skipping Node.js setup."
    return
  fi

  if nvm ls | grep -q "lts"; then
    echo "Node.js LTS is already installed"
    nvm use --lts
  else
    echo "Installing Node.js LTS..."
    nvm install --lts
    nvm use --lts
    nvm alias default 'lts/*'
  fi

  echo "Updating npm to the latest version..."
  npm install -g npm@latest
  echo "npm version:"
  npm --version

  echo "Installing common global npm packages..."
  npm install -g yarn

  echo "Node.js environment setup complete!"
}

# Install the latest stable Ruby via an already-installed rbenv, plus bundler/rails.
setup_ruby() {
  if ! command -v rbenv &> /dev/null; then
    echo "rbenv not available; skipping Ruby setup."
    return
  fi

  eval "$(rbenv init -)"

  local latest_stable
  latest_stable=$(rbenv install -l 2>/dev/null | grep -v - | tail -1 | tr -d '[:space:]')
  if [ -z "$latest_stable" ]; then
    echo "Could not determine the latest Ruby version; skipping Ruby install."
    return
  fi

  if rbenv versions | grep -q "$latest_stable"; then
    echo "Ruby $latest_stable is already installed"
  else
    echo "Installing Ruby $latest_stable..."
    rbenv install "$latest_stable"
  fi

  echo "Setting Ruby $latest_stable as global version..."
  rbenv global "$latest_stable"
  rbenv rehash

  echo "Installing bundler and Rails..."
  gem install bundler
  gem install rails
  rbenv rehash
}

# Install the latest stable Python via an already-installed pyenv.
setup_python() {
  if ! command -v pyenv &> /dev/null; then
    echo "pyenv not available; skipping Python setup."
    return
  fi

  eval "$(pyenv init -)"
  if command -v pyenv-virtualenv-init &> /dev/null; then
    eval "$(pyenv virtualenv-init -)"
  fi

  local latest_python
  latest_python=$(pyenv install --list | grep -v - | grep -v a | grep -v b | grep -v rc | tail -1 | tr -d '[:space:]')
  if [ -z "$latest_python" ]; then
    echo "Could not determine the latest Python version; skipping Python install."
    return
  fi

  if pyenv versions | grep -q "$latest_python"; then
    echo "Python $latest_python is already installed"
  else
    echo "Installing Python $latest_python..."
    pyenv install "$latest_python"
  fi

  echo "Setting Python $latest_python as global version..."
  pyenv global "$latest_python"
}

# Block until PostgreSQL accepts connections (the service start is async).
wait_for_postgres() {
  local i=0
  until pg_isready &> /dev/null; do
    i=$((i + 1))
    if [ "$i" -ge 30 ]; then
      echo "PostgreSQL did not become ready in time."
      return 1
    fi
    sleep 1
  done
}

# Create the dev superuser role and matching database, idempotently.
# Args: $1 = psql command (e.g. "psql -d postgres" or "sudo -u postgres psql")
#       $2 = createdb command (e.g. "createdb" or "sudo -u postgres createdb")
# Role is created without a password; local socket (peer/trust) auth is used.
setup_postgres_role_and_db() {
  local psql_cmd="$1" createdb_cmd="$2"
  local user
  user="$(whoami)"

  if ! wait_for_postgres; then
    echo "Skipping PostgreSQL role/database setup."
    echo "You may need to start PostgreSQL manually and re-run this script."
    return
  fi

  echo "Setting up PostgreSQL role '$user'..."
  $psql_cmd -c "DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$user') THEN
      CREATE ROLE $user WITH SUPERUSER CREATEDB LOGIN;
    ELSE
      ALTER ROLE $user WITH SUPERUSER CREATEDB LOGIN;
    END IF;
  END
  \$\$;"

  if $psql_cmd -lqt | cut -d \| -f 1 | grep -qw "$user"; then
    echo "Database '$user' already exists."
  else
    echo "Creating a default database for Rails development..."
    $createdb_cmd "$user"
    echo "Database '$user' created."
  fi
}
