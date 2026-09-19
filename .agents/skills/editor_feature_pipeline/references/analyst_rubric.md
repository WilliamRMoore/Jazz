# Fighting Game Domain & Architecture Rubric

This guide provides the domain context for the **Plan Designer / Analyst Agent** when designing features for the Jazz Character Editor.

---

## 1. Jazz Engine Architecture & Determinism

- **The Separation of Concerns:**
  - **The 3D Visual Space (Editor):** Three.js scene, GLTF/GLB models, bone hierarchies, animation clips, time scrubbing, and visual gizmos.
  - **The 2D Simulation Space (Engine):** Cross-platform deterministic rollback simulation. The engine knows nothing about 3D meshes or bones. It strictly consumes 2D numbers: fixed hitbox offsets, ECB diamond coordinates, dynamic hurt capsule line segments, and frame-by-frame state data.
  
- **Compilation Philosophy:**
  - The editor is not just an inspector—it is a **compiler**.
  - Visual bindings (e.g. "hitbox attached to `RightHand` bone") are authored in 3D, but when exported, the compiler stencils the projected 2D coordinates frame-by-frame into the backend `CharacterConfig`.

---

## 2. Core Fighting Game Concepts in Jazz

### Hitboxes & Attacks
- An attack (`AttackConfig`) contains:
  - `TotalFrameLength`: Duration of the move.
  - `InteruptableFrame`: Earliest frame the character can act out of the move (FAF/IASA).
  - `BaseKnockBack` & `KnockBackScaling`: BKB and KBG determining hitstun and launch speed.
  - `HitBubbles`: An array of circular hitboxes (`HitBubblesConifg`), each with `Damage`, `Radius`, `LaunchAngle`, `Priority`, and a frame-offset map (`frameOffsets: Map<frameNumber, ConfigVec>`).
- **Bone Tracking:** A hitbox can be pinned to a bone in 3D (e.g., `RightHand`). On each frame the attack is active, the compiler computes the bone's global position projected onto the 2D plane (character facing right) and bakes that as `{ x, y }` into `frameOffsets`.

### Environmental Collision Box (ECB)
- A 4-point diamond (Top, Bottom, Left, Right) representing stage/platform collision.
- The ECB updates dynamically per frame based on projected bone bounds.
- Features a **Fulcrum Bone** (e.g. `Torso`) whose Y-position dictates the horizontal split between top and bottom halves of the diamond.

### Hurt Capsules
- Capsule volumes protecting the character's vulnerable areas.
- Defined by pairs of bones (e.g. `Shoulder -> Wrist`, `Hip -> Knee`, `Neck -> Head`).
- Project to 2D line segments with a radius parameter.

---

## 3. Ambiguity Elimination Checklist

Before writing any technical proposal, the Analyst must clarify:
1. **User Interaction:** How does the developer interact with this feature in the canvas and panels? (e.g., dropdown list, 3D raycast click, gizmo drag).
2. **Coordinate Framing:** Are offsets global, relative to character root, or relative to the bone origin?
3. **Frame Span:** Does this feature apply to a single frame, a range of active frames, or automatically for the duration of the state animation?
4. **Data Persistence:** Where is the authoring state stored (in `DisplayLayerConfig` / `project_config.json`) vs where does the compiled result go (`CharacterConfig`)?
