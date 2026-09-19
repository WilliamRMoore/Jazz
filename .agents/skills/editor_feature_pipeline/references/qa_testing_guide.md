# QA & Testing Guide (Character Editor)

This guide provides testing standards and patterns for the **Test Specialist Agent** when validating new features in the Character Editor.

---

## 1. Testing Philosophy

- **Test Logic, Math, and Compilers:** Focus tests on calculations, compilers (e.g. bone coordinate projection to 2D), data transformations, serialization, and state machines.
- **Avoid Fragile DOM Tests:** Avoid testing whether a `div` has a specific pixel padding. Test whether user interactions trigger the correct data mutations, config updates, and event callbacks.
- **Speed & Isolation:** Unit tests run in Jest (`npm test`). They must execute deterministically in memory within milliseconds.

---

## 2. Testing Compilers & Math Projections

When testing 3D-to-2D projection or bone tracking:
- Create mock skeleton/bone hierarchies using minimal mock objects or Three.js `Bone` objects:
  ```typescript
  import * as THREE from 'three';

  const root = new THREE.Bone();
  root.name = 'Root';
  root.position.set(0, 0, 0);

  const hand = new THREE.Bone();
  hand.name = 'RightHand';
  hand.position.set(10, 5, 0);
  root.add(hand);

  root.updateMatrixWorld(true);
  ```
- Verify that the compiler extracts the expected `{ x, y }` coordinates.
- Verify that flipping character facing direction or applying scale transforms properly scales and mirrors offsets.

---

## 3. Testing Config Mutation & Serialization

- Verify that adding a bone hitbox association correctly populates `project_config.json` / `DisplayLayerConfig`.
- Verify that exporting/compiling creates valid `HitBubblesConifg` objects with accurate frame maps.
- Verify that removing or unbinding a bone cleanly cleans up associations without leaving orphan entries.

---

## 4. Execution & Verification Command

Always run the full test suite to guarantee zero engine regressions:
```bash
npm test
```
All existing tests (36 suites, ~212 tests) must remain 100% green.
