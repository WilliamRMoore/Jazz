# Engine TODOS

## Systems

1. Update ledge grab system (cont. collision, consisten placement, prevent others from grabbing)
2. Projectiles
3. Throws?
4. Add an iteration mechanic to the attack system (combos)
5. Add Crouch canceling

## States

1. Ledge Get Up
2. Ledge get up attack
3. Launch DI
4. Smash DI
5. throws
6. flinch
7. clang
8. wall slam
9. Wall Kick
10. ground slam (Do we re-bound, or not?)
11. Bonk
12. pummel
13. dirct nap
14. Get up attack
15. GroundTech
16. GrundTech Roll
17. ECB track system (the shape changes per-frame)

## State-Relations

1. Clean up buggy graph (not all states are transitioning properly [forward tilt to walk, dash to turn, run to turn])
2. Add stick jumping

## Character

1. Finish out the default character config
2. Create a tool to turn that config into json

## world

1. Create a working networked input manager [and have the world use an interface so it can use local or remote]
2. Implement a "set world to frame" function for resetting world state to a specific snapshot.

## Features

1. Implement Rollback netowkorking code (predictive rollback, desync detection, exponential backoff, etc)
2. Create a character editor
3. Create a stage editor
4. Playback/match viewer
5. Limited pre-defined chat (p2p only)
6. Controller / keyboard mapping

## Utilities

1. Add debugging features for testing scenarios
2. Add debugging for testing world state setting, resetting, and fastforwarding

## Presentation

1. Site UI (css theme, page structure, etc...)
2. Art (models / sprites)
3. Sound (effects, music)
4. Menu (fighter select, stage select, etc)
