"""Keeps claude/suggest-skills.md in step with the user-invoked skills.

Every skill or command with `disable-model-invocation: true` needs a row there,
because the agent can't see its description and the table is how it learns to
suggest it. A row for a skill that is no longer user-invoked is stale. Reads the
live set under ~/.claude, so private skills linked in from elsewhere count too.
Exits 1 on any mismatch.
"""
import os
import re
import sys

repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
home = os.path.expanduser("~/.claude")
table = open(os.path.join(repo, "claude", "suggest-skills.md"), encoding="utf8").read()
listed = set(re.findall(r"`/([a-z0-9-]+)`", table))


def user_invoked(path):
    text = open(path, encoding="utf8").read()
    front = re.match(r"---\n(.*?)\n---", text, re.S)
    return bool(front and re.search(r"^disable-model-invocation:\s*true", front.group(1), re.M))


found = set()
for name in os.listdir(os.path.join(home, "skills")):
    path = os.path.join(home, "skills", name, "SKILL.md")
    if os.path.isfile(path) and user_invoked(path):
        found.add(name)
for name in os.listdir(os.path.join(home, "commands")):
    if name.endswith(".md") and user_invoked(os.path.join(home, "commands", name)):
        found.add(name[:-3])

missing = sorted(found - listed)
stale = sorted(listed - found)
for name in missing:
    print(f"suggest-skills.md: add a row for /{name}, which is user-invoked")
for name in stale:
    print(f"suggest-skills.md: /{name} is no longer user-invoked; remove its row")
sys.exit(1 if missing or stale else 0)
