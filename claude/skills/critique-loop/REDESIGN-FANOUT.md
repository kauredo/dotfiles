# Redesign fan-out

Reached from the plateau table in [`SKILL.md`](SKILL.md): the score sits below 6 after two rounds of fixes, or a re-ask round failed to move it. You are buying a direction here, not four finished screens.

Scope it to one screen, the worst-scoring one. The winning direction reaches the rest of the surface through the normal loop, which is cheap again once the ceiling has moved.

## 1. Write the constraint contract

Split the design system in two, and write both lists down before generating anything.

**Frozen** is identity: the palette, the type roles, the icon set, the component primitives, the voice. Find them in the project's design-system doc, its token file, and its `AGENTS.md` or `CLAUDE.md`, and point at those rather than restating them. A candidate that moves one of these is a different product, not a candidate. Where a linter already enforces part of the list, it fails those candidates before a critic sees them.

**Variable** is composition: what leads the page, density, how much chrome and containment, the hierarchy between primary and secondary actions, the layout shape, the type scale, how hard the accent font works, motion.

Plateaus live in the variable list almost every time, which is what lets the fan-out be aggressive and still land inside the app.

## 2. Generate candidates

One agent asked for three options returns one idea in three paint jobs. Spawn the candidates in parallel, each blind to the others, each given the frozen list and the screen's real content, each seeded with a different structural premise:

- **Strip**: remove every element that is not load-bearing, `/simplify` taken past where you would normally stop.
- **Lead with type**: the accent font and a real hierarchy carry the page, and the containers go.
- **Reorder**: change what the screen is about, so a different thing is the first thing seen.
- **Borrow**: take the structure of whichever reference the critic ranked top, in our palette and our components.

Build them in the running app, on scratch routes, with seeded data and the real component library. Mocks plateau: a set of them sat flat at 7/10 across three rounds and only started moving once the loop ran against built screens. A candidate that is already real code is also one you can merge instead of re-implement.

## 3. Rank blind

Render every candidate **and the incumbent**, save them under neutral names (`a.png`, `b.png`, …), shuffle the order, and hand the set to a fresh critic with the references. Ask for one ranking and a score each, and say nothing about which one is live. A critic that spots the incumbent either defends it or punishes it, and the number stops meaning anything either way.

Render everything at the same fidelity. An incumbent carrying real content against candidates carrying placeholder text gets ranked on completeness, which tells you nothing about the design.

## 4. Resume and record

Take the winner back into [`SKILL.md`](SKILL.md) at round one. Delete the scratch routes and the losing candidates.

A direction outlasts the task that produced it, so write it down where the project keeps design decisions: what won, what else was on the table, why, and what it cost.
