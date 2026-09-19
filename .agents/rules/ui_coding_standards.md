# UI Coding Standards (Character Editor)

These standards apply to all code within `characterEditor/` and any accompanying HTML/CSS files. They exist to ensure the editor remains lightweight, responsive, and maintainable without unnecessary complexity.

---

## 1. Core Principles: Correctness & Zero Bloat

- **Zero Unapproved Dependencies:** Do not add external UI libraries (React, Vue, Lit, Tailwind, Bootstrap, lodash, etc.) to `package.json`. Everything must be written in clean, modern TypeScript and Vanilla DOM.
- **Pragmatic Quality:** Prioritize functional correctness and safety over architectural purism. Code that works cleanly and doesn't leak memory is preferable to overly abstracted multi-layer patterns.
- **Engine Rule Alignment:** Respect the core guidelines in `GEMINI.md`:
  - No Git commits.
  - No file deletions without asking.
  - Never run unapproved terminal commands.
  - Keep game simulation logic deterministic (exporting numbers/fixed-point formats).

---

## 2. DOM & UI Architecture

- **Vanilla DOM Manipulation:** Use native DOM methods (`document.createElement`, `classList`, `addEventListener`, `appendChild`).
- **Sanitization & Safety:** Avoid assigning untrusted or dynamic strings to `innerHTML`. Prefer `innerText`, `textContent`, or explicit element creation with typed attributes.
- **CSS Variables / Design System:** Use existing design tokens in `editor.css`:
  - Backgrounds: `var(--bg-dark)` (`#0d0d0d`), `var(--panel-bg)` (`#1a1a1a`)
  - Borders: `var(--border-color)` (`#333333`)
  - Typography: `var(--text-primary)` (`#e0e0e0`), font `'Inter', 'Segoe UI', Roboto, sans-serif`
  - Accents: `var(--accent)` (`#8a2be2`)
- **Panel Consistency:** Structure new UI features into modular panels or components matching `LeftPanel`, `RightPanel`, or `BottomPanel`.

---

## 3. Three.js & Performance (Anti-Leak)

- **Memory Lifecycle:** When removing or replacing meshes, geometries, materials, or animation clips, properly call `.dispose()` on geometries/materials to avoid WebGL memory leaks.
- **Animation Loop Discipline:** Do not allocate new objects (`new THREE.Vector3()`, new closures, new arrays) inside the `requestAnimationFrame` render loop (`animate()`). Reuse module-level or class-level scratch variables.
- **Clean Event Listeners:** If an element or overlay is destroyed or dynamically re-rendered, ensure any global window/document listeners are detached.

---

## 4. Separation of Concerns: Editor vs Engine

- **Editor Workspace (`DisplayLayerConfig` / `project_config.json`):** Can store authoring-only metadata (e.g., bone bindings, 3D visual offsets, preview camera settings, animation clip mappings).
- **Engine Config (`CharacterConfig`):** The output compiled for the fighting game engine. Must contain strictly deterministic 2D coordinates, static offsets, and engine command payloads.
