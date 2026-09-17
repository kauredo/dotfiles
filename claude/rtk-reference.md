# RTK reference

rtk's own commands, for when I ask about rtk itself. The always-loaded part lives in `RTK.md`.

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

## Reading `rtk discover`

Its MISSED SAVINGS table reads far higher than reality. discover scans Claude
Code transcripts, and a transcript stores the command as it was written, before
the hook rewrote it. Commands that ran as `rtk read` are logged as `cat`, so
they show up as missed. The "Already using RTK: 0.2%" line counts only the
times someone typed `rtk` by hand.

The TOP UNHANDLED COMMANDS section is the part worth acting on.
