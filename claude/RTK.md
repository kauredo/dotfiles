# RTK - Rust Token Killer

A Claude Code hook rewrites Bash commands to their token-optimized `rtk`
equivalents, so `git status` runs as `rtk git status`. Write commands normally.

## What the hook still misses (verified on rtk 0.49.0)

It splits on `&&` and `;`, and since 0.49 it rewrites the producer in a
pipeline, so `grep -rn foo . | head -30` becomes `rtk grep -rn foo . | head -30`.
Five shapes still run raw at full token cost:

| Runs raw | Write instead |
|---|---|
| `cat F \| head -20` | `rtk read F --max-lines 20` |
| `cat F \| tail -20` | `rtk read F --tail-lines 20` |
| `sed -n '1,40p' F` | `rtk read F --max-lines 40` |
| `for f in *; do cat $f; done` | `rtk read $f1 $f2 ...` (it takes many files, like `cat`) |
| `stdbuf -oL <cmd>` | drop the `stdbuf` prefix |

`cat` is the odd one out. Piping `ls`, `git`, `find`, or `grep` into `head` is
fine now; piping `cat` into it is not.

To check whether any command has a rule, run `rtk rewrite '<command>'`. Exit 0
or 3 means it is handled, exit 1 means there is no equivalent.

Questions about rtk itself (`rtk gain`, `rtk discover` and its inflated
numbers, install checks): read `~/.claude/rtk-reference.md`.
