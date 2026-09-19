---
name: Editor Feature Pipeline
description: >-
  Orchestrates the 5-agent feature implementation workflow for the Jazz Character Editor.
  Guides feature development through Analyst (with user clarification), Pragmatic UX Critic,
  Code Monkey (UI engineer), Pragmatic Code Critic, and Test Specialist.
---

# Editor Feature Pipeline

Use this workflow whenever implementing or significantly refactoring a feature in the **Jazz Character Editor** (e.g. *"Make me a feature for attaching hit boxes to the armature bones"* or *"Add an ECB fulcrum selection tool"*).

This pipeline executes in **5 distinct phases** with **anti-doom-spiral safeguards** to ensure domain accuracy, developer ergonomics, pragmatic code quality, and test coverage.

---

## The 5 Phases at a Glance

1. **Phase 1: Plan Designer / Analyst**
   - *Phase 1A: Ambiguity Elimination*: Asks the user targeted clarifying questions with concrete choices before locking in the design.
   - *Phase 1B: Technical Proposal*: Drafts a concise specification covering UI flow, data structures, and 3D-to-2D compilation.
2. **Phase 2: Pragmatic Plan Critic**
   - Evaluates the plan against practical fighting game tooling needs.
   - *Anti-doom-spiral*: Focuses on correctness and workflow integrity; max 1 revision cycle; non-blocking items become `APPROVED WITH NOTES`.
3. **Phase 3: Code Monkey / UI Engineer**
   - Implements the feature using Vanilla DOM, Three.js, and CSS tokens from `editor.css`.
   - Strictly zero new `package.json` dependencies.
4. **Phase 4: Pragmatic Code Critic**
   - Reviews the code for runtime bugs, unhandled errors, memory leaks, and dependency bloat.
   - *Anti-doom-spiral*: No nitpicking on subjective style; max 1 revision cycle.
5. **Phase 5: Test Specialist**
   - Writes Jest unit tests in `tests/` for new compilers, math logic, or config transformations.
   - Runs `npm test` and confirms 100% pass rate.

---

## Detailed Phase Workflows

### PHASE 1: Plan Designer / Analyst (`fg-mechanics-analyst`)
*Reference: [references/analyst_rubric.md](references/analyst_rubric.md)*

1. **Phase 1A — Ambiguity Elimination (Interview the User)**:
   - Identify open design decisions (e.g., bone coordinate spaces, UI placement, frame range bindings).
   - Present **focused questions** with **concrete options** (e.g., *(A) Attach to bone center with manual offset gizmo, or (B) Auto-snap to bone head/tail?*).
   - Wait for user feedback before finalizing the technical design.
2. **Phase 1B — Technical Proposal**:
   - Create a feature proposal artifact detailing:
     - User interaction flow (canvas raycasting, panel forms, timeline scrubbing).
     - Data models updated (`project_config.json`, `DisplayLayerConfig`, `CharacterConfig`).
     - 3D-to-2D projection math and compilation triggers.

---

### PHASE 2: Pragmatic Plan Critic (`fg-ui-critic`)
*Reference: [references/critic_guidelines.md](references/critic_guidelines.md)*

1. Inspect the proposal:
   - Does it fulfill what the user actually requested?
   - Does it respect the 3D-to-2D deterministic compilation architecture?
2. Apply the **Anti-Doom-Spiral Rubric**:
   - **BLOCK (REVISE — max 1 time)**: Only if fundamental architecture or requirements are broken.
   - **APPROVE WITH NOTES**: For minor suggestions, styling ideas, or optional extras.
3. If revised once and critical items are addressed, proceed immediately to Phase 3.

---

### PHASE 3: Code Monkey / UI Engineer (`editor-ui-engineer`)
*Reference: [.agents/rules/ui_coding_standards.md](../../rules/ui_coding_standards.md)*

1. Receive the approved plan.
2. Implement code following repo UI standards:
   - **Vanilla DOM**: Native DOM element construction; clean hierarchy.
   - **CSS System**: Use existing tokens in `editor.css` (`--bg-dark`, `--panel-bg`, `--accent`, etc.).
   - **Three.js Discipline**: Correct matrix updates, dispose geometries/materials on cleanup, zero allocations in hot animation loops.
   - **Zero Dependencies**: Never touch `package.json` dependencies.

---

### PHASE 4: Pragmatic Code Critic (`ui-code-critic`)
*Reference: [references/critic_guidelines.md](references/critic_guidelines.md)*

1. Review the implemented diffs:
   - Are there runtime errors, syntax issues, or broken imports?
   - Were any unauthorized packages added to `package.json`?
   - Are event listeners or Three.js objects leaking memory?
2. Apply the **Anti-Doom-Spiral Rubric**:
   - **BLOCK (REVISE — max 1 time)**: Real bugs, memory leaks, unapproved dependencies, or broken existing tests.
   - **APPROVE WITH NOTES**: Stylistic code structure, simple vs complex debate, minor naming.
3. Once approved, hand off to Phase 5.

---

### PHASE 5: Test Specialist (`ui-test-specialist`)
*Reference: [references/qa_testing_guide.md](references/qa_testing_guide.md)*

1. Write focused Jest unit tests for:
   - Math projections, bone coordinate transformations, offset compilers.
   - Config mutations and serialization.
2. Run automated validation:
   ```bash
   npm test
   ```
3. Generate a final `walkthrough.md` artifact showing:
   - Summary of implemented components.
   - Automated test results.
   - Instructions for manual visual verification in `http://localhost:8000/characterEditor.html`.
