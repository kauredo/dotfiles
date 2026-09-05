# Verify before you assert

Shared by the `/code-review` reviewer agents (architecture, correctness, performance, security, style, test).

A finding is only as good as the facts under it. Before you write one down, confirm its premise against the actual code rather than inferring it from a name or a plausible story.

**Claims in code comments or PR replies about other code.** An inline comment or author reply that justifies the change by asserting how something else behaves is a claim to check, not proof. Read the referenced code and confirm it before you rely on it, or before you drop a finding because of it. Assertions about out-of-diff behavior are where a wrong assumption survives longest, because nobody reading only the diff sees them.

If you can't confirm a claim with a quick read or grep, hedge it in the text ("likely", "if…") instead of stating it as fact.

## CLAUDE.md / AGENTS.md read step

Read `CLAUDE.md` and `AGENTS.md` from the repo root and any nested ones in changed directories before reviewing. They may contain project-specific rules relevant to your domain; cite them in a finding when they apply.
