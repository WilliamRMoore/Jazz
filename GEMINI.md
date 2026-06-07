# AI Guidelines for Jazz Engine

These rules MUST be followed at all times to ensure the integrity and performance of the competitive platform fighter engine.

## AI Behaviors
- **NO Git Commits:** Do not commit anything in git on my behalf.
- **NO File Deletion:** Never delete a file without asking me first.
- **NO DB Queries:** Do not automatically run queries against any databases.
- **NO Unauthorized Terminal Commands:** Do not run complex terminal commands without asking first.
- **NO Unapproved Dependencies:** Do not add new dependencies in `package.json` without explicit permission.
- **Testing Requirement:** Always run the test suite after modifying core engine systems.

## Engine Architecture
- This codebase is an engine written in TypeScript, designed to be a competitive platform fighter.

## Determinism & Math
- All game math (math that affects state for the game simulation that is not recalculated) MUST be cross-platform deterministic.
- **Pattern Example:** Always use `FixedPoint` from `game/engine/math/fixedPoint` for physics and state calculations. Avoid standard JS floating-point numbers (`Math.random`, `Math.sin`, or standard `number` types) in game simulation state.

## Memory Management (Zero-Allocation)
- The code must avoid creating any unnecessary memory or garbage during the game loop to prevent GC pauses.
- **Pattern Example:** Use the existing object pooling system via `PoolContainer` and `Pool<T>` (e.g., `VecPool`, `ColResPool`). When you need a vector or collision result, rent it from the pool instead of using the `new` keyword, and be sure to return it to the pool when finished.

## Coding Standards (V8 JIT & GC Optimization)
- **Hot Loops:** Iteration in hot paths (like the game loop) MUST be done with simple `for` loops (e.g., `for (let i = 0; i < arr.length; i++)`). If array iterators like `.forEach()`, `.map()`, or `.filter()` must be used, the callback function MUST have a stable reference (e.g., declared outside the loop) so it does not create heap garbage from repeated anonymous function allocations.
- **Avoid Polymorphism:** Keep object shapes monomorphic whenever possible. Avoid excessive polymorphism or changing object properties at runtime, as this will cause Javascript JIT engine deoptimizations.
