# RTK - Rust Token Killer

**Usage**: Token-optimized CLI proxy (60-90% savings on dev operations)

## Meta Commands (always use rtk directly)

```bash
rtk gain              # Show token savings analytics
rtk gain --history    # Show command usage history with savings
rtk discover          # Analyze Claude Code history for missed opportunities
rtk proxy <cmd>       # Execute raw command without filtering (for debugging)
```

## Installation Verification

```bash
rtk --version         # Should show: rtk X.Y.Z
rtk gain              # Should work (not "command not found")
which rtk             # Verify correct binary
```

⚠️ **Name collision**: If `rtk gain` fails, you may have reachingforthejack/rtk (Rust Type Kit) installed instead.

## Hook-Based Usage

All other commands are automatically rewritten by the Claude Code hook.
Example: `git status` → `rtk git status` (transparent, 0 tokens overhead)

### What the hook still misses (verified on rtk 0.49.0)

It splits on `&&` and `;`, and since 0.49 it rewrites the producer in a
pipeline, so `grep -rn foo . | head -30` becomes `rtk grep -rn foo . | head -30`.
Four shapes still run raw at full token cost:

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

## Reading `rtk discover`

Its MISSED SAVINGS table reads far higher than reality. discover scans Claude
Code transcripts, and a transcript stores the command as it was written, before
the hook rewrote it. Commands that ran as `rtk read` are logged as `cat`, so
they show up as missed. The "Already using RTK: 0.2%" line counts only the
times someone typed `rtk` by hand.

The TOP UNHANDLED COMMANDS section is the part worth acting on.
