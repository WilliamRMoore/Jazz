# 3D Character Editor Design & Architecture

This document serves as the master blueprint for the Jazz 3D Character Editor. It captures the detailed architectural decisions, data structures, UI layouts, and compilation pipelines required to visually build and configure a character for the engine.

## 1. Core Architecture & UI Philosophy

* **3D Format**: The editor exclusively uses **GLTF / GLB** files. This format is heavily optimized for web and integrates seamlessly with our chosen 3D renderer, Three.js.
* **UI Framework**: The interface will be built entirely using **Vanilla DOM manipulation**. We will avoid heavy frameworks (like React, Preact, or Lit) in favor of keeping things lightweight and aligned with the existing codebase structure (e.g., `characterEditor/index.ts`).

## 2. Project Management

Instead of directly modifying backend config files in-place, the editor operates on the concept of **Projects**. 

* **Toolbar Mechanics**: 
  * **New Project**: Clicking "New" prompts the user to import a `.glb` model. The editor creates a new project directory (e.g., `characterEditor/projects/[ProjectName]/`) and copies the model into it.
  * **Open / Save**: Projects can be loaded from the toolbar or saved at any point. Saves capture incomplete work so the user never loses progress.
  * **Export Process**: A dedicated "Compile & Export" pipeline (detailed below) compresses the visual project data into the highly optimized `CharacterConfig` JSON that the backend actually uses.

* **Project Structure**:
  * `[model_name].glb`: The visual 3D asset.
  * `project_config.json`: The **Frontend Editor Config**. This stores all the visual and editorial metadata that the backend engine doesn't care about. For example: mapping FSM states to animation clip names, storing which hitboxes are bound to which bones, and which bone acts as the ECB fulcrum.
  * `character_config.json`: The **Backend Engine Config**. This is the raw numerical data (`ECBShape` dimensions, fixed hitbox offsets, dynamic hurt capsule coordinates) that the game engine consumes.

## 3. User Interface Layout

### Left Panel: FSM State Tree
* Rather than presenting a massive, overwhelming list of every single `STATE_IDS` enum, the state tree will be organized into a hardcoded, logical hierarchy (e.g., *Aerials*, *Grounded*, *Specials*, *Techs*).
* **Animation Binding**: Clicking a state opens fields to bind a specific 3D animation clip to that state. Since the backend FSM only cares about state frames, this binding is purely visual and is saved to `project_config.json`. The user configures:
  * `Animation Clip Name`
  * `Start Frame` & `End Frame` (time slicing)
  * `Playback Speed`
  * `Loopable` (Boolean)

### Center Panel: 3D Canvas
* A **Three.js Canvas** rendering the imported character model.
* 2D visual overlays will render on top of (or intersected with) the 3D model to visualize the compiled ECB diamond, hit bubbles, and hurt capsules in real-time.

### Right Panel: Context Inspector
* Context-aware forms that change based on what the user is editing.
* **Attack Properties**: Fields for setting Damage, Radius, Base Knockback, Launch Angle, Shield Stun, etc.
* **Command Bindings**: UI to append dynamic engine commands (e.g., `SwitchPlayerState`, `SetSuperArmor`, `ActivatePlayerSensor`). Since the engine's `Command` type is just `{ commandName: string; payload: any; }`, the UI will dynamically present payload fields based on the selected command from the `COMMAND_NAMES` registry.

### Bottom Panel: Timeline Scrubber
* Once animations are bound to states, a timeline scrubber allows the user to step through the state frame-by-frame. 
* Scrubbing updates the 3D model pose and recalculates/displays the dynamic ECB shapes and hit/hurt boxes for that exact frame.

## 4. Editor Compilation Workflows (3D to 2D)

The engine requires static 2D numerical data for determinism, but the editor operates in a 3D animated space. The editor features a **Compile** step that "stencils" the 3D bone data into 2D projections based on the character facing right. 

To prevent the compiler from being incredibly slow, we strictly track **bone joints** (not mesh vertices) and apply optional padding scalars.

### 4.1 ECB Compiler & Fulcrum
The ECB changes dynamically per frame to perfectly match the animation. 
* **Bone Tracking**: The compiler projects the right-most, left-most, and top-most bones onto a 2D plane for every frame. 
* **Padding**: An optional scalar padding value expands this bone bounding-box to cover the actual skin mesh.
* **The Fulcrum**: The user selects a specific bone (e.g., the `Torso`) to act as the "fulcrum". The Y-coordinate of this bone dictates the vertical split of the ECB. Instead of a perfectly symmetrical diamond, the left and right points of the ECB will sit horizontally at the height of the fulcrum bone, allowing for top-heavy or bottom-heavy ECB shapes. 
* **Output**: A dynamic array of `ECBShape` objects per FSM state frame.

### 4.2 Hitbox Compiler
* **Bone Binding**: In the 3D canvas, the user can attach a hitbox to a specific bone (e.g., `RightHand`). This association is saved in `project_config.json`.
* **Output**: During compilation, the script tracks the global 2D projected position of that bone frame-by-frame, baking out static raw X/Y offsets into the backend `CharacterConfig`. The engine never knows about "hands", it only knows about offsets.

### 4.3 Hurt Capsule Compiler
* **Dynamic Enhancement**: The `HurtCapsuleConfig` will be completely overhauled in the engine to support dynamic, per-frame movement. 
  ```typescript
  export type HurtCapsuleConfig = {
    radius: number;
    // Maps StateId -> Frame Number -> Capsule Coordinates
    frameOffsets: Map<StateId, Map<number, {x1: number, y1: number, x2: number, y2: number}>>;
  };
  ```
* **Bone Pairs**: In the editor, hurt capsules are defined by binding them between two bones (e.g., `Shoulder -> Wrist`, `Hip -> Knee`, or `Neck -> Head`).
* **Output**: The compiler projects these bone pairs into 2D line segments, baking their coordinates into the massive `HurtCapsuleConfig` map for every frame of every animated state. 

*(Note: Updating `HurtCapsuleConfig` will require subsequent engine updates to `hurtCircles.ts` and the rollback history payload buffer sizes).*
