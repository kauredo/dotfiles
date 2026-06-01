#!/usr/bin/env bash
# Claude Code status line.
# Layout:  <cwd> │ <model> ✦<effort> │ <bar> <pct>% (<used>/<limit>)

input=$(cat)

# --- ANSI ---
ESC=$'\033'
RESET="${ESC}[0m"
BOLD="${ESC}[1m"
DIM="${ESC}[2m"
YELLOW="${ESC}[38;5;221m"
GREEN="${ESC}[38;5;114m"
RED="${ESC}[38;5;203m"
GRAY="${ESC}[38;5;244m"
SEP=" │ "

# --- Parse stdin ---
cwd=$(printf '%s' "$input" | jq -r '.workspace.current_dir // .cwd // ""')
model_name=$(printf '%s' "$input" | jq -r '.model.display_name // .model.id // "?"')
# Strip trailing "(... context)" annotations
model_name=$(printf '%s' "$model_name" | sed -E 's/[[:space:]]*\([^()]*context[^()]*\)[[:space:]]*$//')
model_id=$(printf '%s' "$input" | jq -r '.model.id // ""')
transcript=$(printf '%s' "$input" | jq -r '.transcript_path // ""')

# Show only the project basename
cwd="${cwd##*/}"
[ -z "$cwd" ] && cwd="/"

# --- Thinking / effort indicator from active config ---
config_dir="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
settings_file="$config_dir/settings.json"
effort_badge=""
if [ -f "$settings_file" ]; then
  thinking=$(jq -r '.alwaysThinkingEnabled // false' "$settings_file" 2>/dev/null)
  level=$(jq -r '.effortLevel // ""' "$settings_file" 2>/dev/null)
  [ "$level" = "null" ] && level=""
  if [ "$thinking" = "true" ] && [ -n "$level" ]; then
    effort_badge=" ✦${level}"
  elif [ "$thinking" = "true" ]; then
    effort_badge=" ✦"
  elif [ -n "$level" ]; then
    effort_badge=" ${level}"
  fi
fi

# --- Context limit ---
case "$model_id" in
  *"[1m]"*|*-1m*|*"1m]"*) limit=1000000 ;;
  *) limit=200000 ;;
esac

# --- Latest message usage ---
# Read the transcript newest-line-first so jq stops at the first usage entry
# instead of parsing the whole (potentially large) file on every render.
total=0
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  if command -v tac >/dev/null 2>&1; then
    reverse=(tac)
  else
    reverse=(tail -r)
  fi
  usage=$("${reverse[@]}" "$transcript" 2>/dev/null \
    | jq -c -R 'fromjson? | select(.message.usage) | .message.usage' 2>/dev/null \
    | head -n 1)
  if [ -n "$usage" ] && [ "$usage" != "null" ]; then
    total=$(printf '%s' "$usage" | jq -r '
      ((.input_tokens // 0)
       + (.cache_read_input_tokens // 0)
       + (.cache_creation_input_tokens // 0))
    ')
    case "$total" in ''|null) total=0 ;; esac
  fi
fi

pct=$(awk -v t="$total" -v l="$limit" 'BEGIN { p=(t/l)*100; if(p>100) p=100; if(p<0) p=0; printf "%.1f", p }')

# --- Bar color by usage ---
if awk -v p="$pct" 'BEGIN { exit !(p < 50) }'; then
  bar_color="$GREEN"
elif awk -v p="$pct" 'BEGIN { exit !(p < 80) }'; then
  bar_color="$YELLOW"
else
  bar_color="$RED"
fi

# --- Build bar with sub-cell unicode fractions ---
width=16
eighths=$(awk -v p="$pct" -v w="$width" 'BEGIN { e=int((p/100)*w*8); if(e>w*8) e=w*8; print e }')
full_cells=$((eighths / 8))
remainder=$((eighths % 8))
frac_chars=("" "▏" "▎" "▍" "▌" "▋" "▊" "▉")

filled=""
i=0
while [ $i -lt $full_cells ]; do filled="${filled}█"; i=$((i+1)); done
empty_count=$((width - full_cells))
if [ "$remainder" -gt 0 ] && [ "$full_cells" -lt "$width" ]; then
  filled="${filled}${frac_chars[$remainder]}"
  empty_count=$((empty_count - 1))
fi
empty=""
i=0
while [ $i -lt $empty_count ]; do empty="${empty}░"; i=$((i+1)); done

bar="${bar_color}${filled}${RESET}${GRAY}${empty}${RESET}"

# --- Compact token counts (401k, 1.2M) ---
fmt_compact() {
  awk -v n="$1" 'BEGIN {
    if (n >= 1000000) printf "%.1fM", n/1000000
    else if (n >= 1000)    printf "%dk", n/1000
    else                   printf "%d", n
  }'
}
total_h=$(fmt_compact "$total")
limit_h=$(fmt_compact "$limit")

# --- Render ---
printf '%s' \
"${cwd}${SEP}${model_name}${effort_badge}${SEP}${bar} ${BOLD}${pct}%${RESET} ${DIM}(${total_h}/${limit_h})${RESET}"
