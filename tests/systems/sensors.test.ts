import { DefaultCharacterConfig } from '../../game/character/default';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../../game/engine/entity/playerOrchestrator';
import { PlayerSensors } from '../../game/engine/systems/sensors';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/input/Input';
import { STATE_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import { ApplyVelocity } from '../../game/engine/systems/velocity';
import { ApplyVelocityDecay } from '../../game/engine/systems/velocityDecay';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { NumberToRaw } from '../../game/engine/math/fixedPoint';

describe('Sensor system tests', () => {
  let world: World;
  let playerA: Player; // Attacker
  let playerB: Player; // Target

  beforeEach(() => {
    world = new World();
    world.SetStage(defaultStage());
    const charConfig = new DefaultCharacterConfig();

    playerA = new Player(0, charConfig);
    playerA.Position.X.SetFromNumber(600);
    playerA.Position.Y.SetFromNumber(650.1);
    playerA.Flags.FaceRight();

    playerB = new Player(1, charConfig);
    // Position playerB so its hurtbox will be hit by playerA's side special sensor.
    // pA sensor is at relative (45, -15) with radius 30.
    // pB hurtbox is at relative (0, -40) with radius 40.
    // pA at (100, 100) -> sensor at (145, 85).
    // Place pB at (180, 100) -> hurtbox at (180, 60).
    // The two circles should intersect.
    playerB.Position.X.SetFromNumber(680);
    playerB.Position.Y.SetFromNumber(650.1);

    world.SetPlayer(playerA);
    world.SetPlayer(playerB);
  });

  test('Side Special sensor should trigger state change on collision', () => {
    // Arrange: Put playerA into the Side Special state.
    // The OnEnter logic for the state will arm the reactor command.
    const ia = NewInputAction();
    ia.LXAxis.SetFromNumber(0.9);
    world.PlayerData.InputStore(playerA.ID).StoreInputForFrame(0, ia);
    const sm = world.PlayerData.StateMachine(playerA.ID);
    sm.ForceState(STATE_IDS.SIDE_SPCL_S);

    // Act: Simulate frames advancing.
    // We need to run for at least 15 frames for the sensors to activate.
    const maxFrames = 20;
    let transitioned = false;
    for (let i = 0; i < maxFrames; i++) {
      world.localFrame = i;

      // Update the FSM to process OnUpdate events (like activating sensors and applying impulses)
      const blankInput = NewInputAction();

      world.PlayerData.InputStore(playerA.ID).StoreInputForFrame(i, blankInput);
      sm.UpdateFromInput(blankInput, world);

      // Apply movement from impulses
      ApplyVelocity(world);
      ApplyVelocityDecay(world);

      // Run the system under test
      PlayerSensors(world);

      if (playerA.FSMInfo.CurrentState.StateId === STATE_IDS.SIDE_SPCL_EX_S) {
        transitioned = true;
        break;
      }
    }

    // Assert: Check if the state transition occurred
    expect(transitioned).toBe(true);
    expect(playerA.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.SIDE_SPCL_EX_S);
  });

  test('Side Special sensor should trigger state change on collision from right side', () => {
    // Arrange: Put playerA into the Side Special state.
    // The OnEnter logic for the state will arm the reactor command.
    SetPlayerInitialPositionRaw(playerA, NumberToRaw(680), NumberToRaw(650.1));
    SetPlayerInitialPositionRaw(playerB, NumberToRaw(600), NumberToRaw(650.1));
    playerA.Flags.FaceLeft();
    const ia = NewInputAction();
    ia.LXAxis.SetFromNumber(-0.9);
    world.PlayerData.InputStore(playerA.ID).StoreInputForFrame(0, ia);
    const sm = world.PlayerData.StateMachine(playerA.ID);
    sm.ForceState(STATE_IDS.SIDE_SPCL_S);

    // Act: Simulate frames advancing.
    // We need to run for at least 15 frames for the sensors to activate.
    const maxFrames = 20;
    let transitioned = false;
    for (let i = 0; i < maxFrames; i++) {
      world.localFrame = i;

      // Update the FSM to process OnUpdate events (like activating sensors and applying impulses)
      const blankInput = NewInputAction();

      world.PlayerData.InputStore(playerA.ID).StoreInputForFrame(i, blankInput);
      sm.UpdateFromInput(blankInput, world);

      // Apply movement from impulses
      ApplyVelocity(world);
      ApplyVelocityDecay(world);

      // Run the system under test
      PlayerSensors(world);

      if (playerA.FSMInfo.CurrentState.StateId === STATE_IDS.SIDE_SPCL_EX_S) {
        transitioned = true;
        break;
      }
    }

    // Assert: Check if the state transition occurred
    expect(transitioned).toBe(true);
    expect(playerA.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.SIDE_SPCL_EX_S);
  });
});
