Conduct a holistic design critique, evaluating whether the interface actually works, not just technically but as a designed experience. Think like a design director giving feedback.

**First**: Use the frontend-design skill for design principles and anti-patterns.

## Step 0: Look at it rendered, and let someone else judge

You cannot answer the AI slop question from source code. Two things have to be true for this critique to mean anything: you looked at the rendered page, and the judgment came from outside the context that built it.

If the target can be rendered, do this before the rubric below.

1. **Render it.** Launch the app with the `run` skill or the project's dev script, wait for it to be ready, then use the **chrome-devtools** MCP to navigate to each affected route and screenshot it. Desktop width, plus 390px if the change is responsive. Save the files to a temp dir. Reuse a dev server already running from an earlier round.

   The MCP refuses to attach when a Chrome is already running on its profile (`The browser is already running for ~/.cache/chrome-devtools-mcp/chrome-profile`). That browser may be the user's, so do not kill it. Screenshot headless instead, against a scratch profile of your own:

   ```
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
     --hide-scrollbars --window-size=1440,900 --screenshot="$OUT/shot.png" \
     --user-data-dir="$OUT/cprofile" "$URL"
   ```

   Run it with a timeout and check for the file afterwards rather than trusting the exit code. Headless Chrome writes the PNG and then sometimes hangs instead of exiting, so the command times out on a screenshot that is already on disk.
2. **Find a bar to measure against.** Look for reference images the project already has: whatever `docs/design-system.md` points at, a `docs/references/` directory, anything the user pasted earlier in the session. Three or four in the same genre is enough.
3. **Hand it to a fresh subagent.** Spawn a `general-purpose` agent with `model: "opus"` and give it the screenshot paths, the reference paths, Section 1's table below, and the path `~/.claude/critique-rubric.md` to read for the rest. Tell it to `Read` each image. Give it nothing else: no code, no diff, no implementation notes, no earlier critiques, no account of why any choice was made. If it can see the reasoning, it will agree with the reasoning.
4. **Ask for a ranking, not a review.** "Rank these five images by polish and taste, ours is `<file>`, and name the two changes that would move it up." A ranking against real work gives a stable answer across runs. "Does this look beautiful and not AI-generated" gives a different answer every time. Say explicitly that the references set a quality floor, so it does not hand back a copy of one of them.
5. **Ask for a score out of 10** alongside the ranking: how close is this to what a good studio would ship. Never tell the critic what score you are aiming for. A critic that knows the bar is 9 starts handing out 9s.
6. Its verdict and its score open the report, as the Anti-Patterns Verdict below.

Reuse this prompt verbatim on every round. Editing it between rounds means the scores are no longer comparable, and a rising score is the only evidence you have that the fixes are working.

**With no reference images available**, tell the critic to name three or four real products in the same genre and rank against those from memory. Say in the report that the bar was self-supplied, which makes it softer.

**If the target cannot be rendered** (a component with no route, tokens in isolation, no dev server), critique from the code and say so in the report's first line. A code-only critique cannot answer Section 1 with any confidence.

## Design Critique

Evaluate the interface across these dimensions:

### 1. AI Slop Detection (CRITICAL)

**This is the most important check.** Does this look like every other AI-generated interface from 2024-2025?

Review the design against ALL the **DON'T** guidelines in the frontend-design skill, they are the fingerprints of AI-generated work. Check for the AI color palette, gradient text, dark mode with glowing accents, glassmorphism, hero metric layouts, identical card grids, generic fonts, and all other tells.

Then walk this list. Look for each pattern by name, and where you find one, try the alternative and compare the two.

| Overused pattern | Try instead |
|---|---|
| Eyebrow text, meaning the small label above a heading that restates what the heading already says | Delete it. Nine times out of ten nothing is lost |
| Background gradients | A photograph, a texture, a pattern, or a flat solid color |
| Cards and containers around everything | A flatter layout. A grid or tiles, with the borders gone |
| Many fonts, text styles, and heading levels | One or two fonts and two to four styles. Accent colors and italics used a few times, not throughout |

None of these is banned. A gradient, a card, or a label can be the right call, and prompting a model to avoid all four from the start makes it overthink and reach for stranger patterns instead. That is why this list belongs here in refinement, where you are looking at a rendered page, and not in the build prompt.

**The test**: If you showed this to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

**Sections 2 through 10 live in `~/.claude/critique-rubric.md`.** Read that file now and work through every dimension in it: visual hierarchy, information architecture, emotional resonance, discoverability, composition, typography, color, states and edge cases, and microcopy. Section 1 above is not the whole critique.

## Generate Critique Report

Structure your feedback as a design director would:

### Anti-Patterns Verdict
**Start here.** Open with the critic's score on its own line, as `Critic score: N/10`, so a loop can compare rounds. If the critique was code-only with no screenshot, write `Critic score: none (code-only)` instead, and say why.

Then pass/fail: does this look AI-generated? Name every tell you found, both the four in the Section 1 table and the ones in the frontend-design skill's Anti-Patterns section. Be brutally honest.

### Overall Impression
A brief gut reaction, what works, what doesn't, and the single biggest opportunity.

### What's Working
Highlight 2-3 things done well. Be specific about why they work.

### Priority Issues
The 3-5 most impactful design problems, ordered by importance:

For each issue:
- **What**: Name the problem clearly
- **Why it matters**: How this hurts users or undermines goals
- **Fix**: What to do about it (be concrete)
- **Command**: Which command to use (`/polish`, `/simplify`, `/bolder`, `/quieter`, etc.)

### Minor Observations
Quick notes on smaller issues worth addressing.

### Questions to Consider
Provocative questions that might unlock better solutions:
- "What if the primary action were more prominent?"
- "Does this need to feel this complex?"
- "What would a confident version of this look like?"

**Remember**:
- Be direct, vague feedback wastes everyone's time
- Be specific: "the submit button" not "some elements"
- Say what's wrong AND why it matters to users
- Give concrete suggestions, not just "consider exploring..."
- Prioritize ruthlessly, if everything is important, nothing is
- Don't soften criticism, developers need honest feedback to ship great design