import { PlayerStateHistory } from '../../game/engine/systems/history';
import {
  ATTACK_IDS,
  GRAB_IDS,
  STATE_IDS,
} from '../../game/engine/finite-state-machine/stateConfigurations/shared';

jest.mock('../../game/engine/config/main-config', () => ({
  envConfig: {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'MaxSensorsPerPlayer':
          return 2;
        case 'MaxHurtBubblesPerPlayer':
          return 2;
        case 'MaxGrabBubblesPerPlayer':
          return 2;
        case 'MaxAtkBubblesPerPlayer':
          return 2;
        default:
          return 10; // Default for other things like MaxFrameStorage
      }
    }),
  },
}));

describe('PlayerStateHistory Serialization', () => {
  it('should correctly serialize and deserialize player state', () => {
    // 1. Create and populate source history object
    const sourceHistory = new PlayerStateHistory();
    sourceHistory.posXRaw = 10240; // 10.0
    sourceHistory.posYRaw = -20480; // -20.0
    sourceHistory.velXRaw = 5120;
    sourceHistory.velYRaw = -5120;
    sourceHistory.damageRaw = 12345;
    sourceHistory.facingRight = true;
    sourceHistory.fasFalling = true;
    sourceHistory.velocityDecayActive = false;
    sourceHistory.shieldJump = true;
    sourceHistory.shieldActive = true;
    sourceHistory.hitPauseFrames = 5;
    sourceHistory.intangabilityFrames = 10;
    sourceHistory.disablePlatformDetectionFrames = 15;
    sourceHistory.jumpCount = 1;
    sourceHistory.stateId = STATE_IDS.JUMP_S;
    sourceHistory.stateFrame = 7;
    sourceHistory.hitStopFrames = 3;
    sourceHistory.hitStunFrames = 8;
    sourceHistory.hitStunVxRaw = 1000;
    sourceHistory.hitStunVyRaw = -1000;
    sourceHistory.hitStunNextStateId = STATE_IDS.N_FALL_S;
    sourceHistory.grabId = GRAB_IDS.RUN_GRAB_G;
    sourceHistory.atkId = ATTACK_IDS.D_TILT_ATK;
    sourceHistory.grabMeterRaw = 25;
    sourceHistory.holdingPlayerId = 1;
    sourceHistory.shieldRadiusRaw = 500;
    sourceHistory.calcRadiusRaw = 400;
    sourceHistory.shieldTiltXRaw = 10;
    sourceHistory.shieldTiltYRaw = -10;
    sourceHistory.ldGrabCount = 2;

    sourceHistory.sensors[0] = {
      xOffsetRaw: 1,
      yOffsetRaw: 2,
      radiusRaw: 3,
      active: true,
    };
    sourceHistory.sensors[1] = {
      xOffsetRaw: 4,
      yOffsetRaw: 5,
      radiusRaw: 6,
      active: false,
    };

    // Populate some computed values to ensure they are serialized
    sourceHistory.comp_sensors[0] = {
      globalXRaw: 10,
      globalYRaw: 20,
      radiusRaw: 30,
      active: true,
    };
    sourceHistory.comp_ecbDiamond[0] = { xRaw: 11, yRaw: 22 };
    sourceHistory.comp_hurtCapsules[0] = {
      x1Raw: 1,
      y1Raw: 2,
      x2Raw: 3,
      y2Raw: 4,
      radiusRaw: 5,
      active: true,
    };
    sourceHistory.comp_attackCircles[0] = {
      xRaw: 1,
      yRaw: 2,
      radiusRaw: 3,
      active: true,
    };
    sourceHistory.comp_grabCircles[0] = {
      iD: 1,
      xRaw: 1,
      yRaw: 2,
      radiusRaw: 3,
      active: true,
    };
    sourceHistory.comp_ledgeDetectorLeft[0] = { xRaw: 1, yRaw: 2 };
    sourceHistory.comp_ledgeDetectorRight[0] = { xRaw: 3, yRaw: 4 };

    // 2. Serialize
    const bufferSize = PlayerStateHistory.BufferSize();
    const sharedBuffer = new SharedArrayBuffer(bufferSize);
    const buffer = new Int32Array(sharedBuffer);
    const frameNumber = 123;
    sourceHistory.Serialize(buffer, 0, frameNumber);

    // 3. Deserialize into a new object
    const destHistory = new PlayerStateHistory();
    const success = destHistory.Deserialize(buffer, 0);

    // 4. Assert
    expect(success).toBe(true);

    // Create a clean version for comparison of non-serialized parts
    const freshHistory = new PlayerStateHistory();

    // We can't do a simple deep equal because some properties are not part of the serialization.
    // So we copy the source, zero out the non-serialized parts, and then compare.
    const comparableSource = { ...sourceHistory };
    comparableSource.playersHit = freshHistory.playersHit;
    comparableSource.sensorReactor = freshHistory.sensorReactor;
    comparableSource.ldgGrbdLdg = freshHistory.ldgGrbdLdg;

    const comparableDest = { ...destHistory };
    comparableDest.playersHit = freshHistory.playersHit;
    comparableDest.sensorReactor = freshHistory.sensorReactor;
    comparableDest.ldgGrbdLdg = freshHistory.ldgGrbdLdg;

    // Now we can do a deep equal on the parts that should have been serialized
    expect(comparableDest).toEqual(comparableSource);

    // And explicitly check the non-serialized parts are at their default values
    expect(destHistory.playersHit).toEqual(freshHistory.playersHit);
    expect(destHistory.sensorReactor).toEqual(freshHistory.sensorReactor);
    expect(destHistory.ldgGrbdLdg).toEqual(freshHistory.ldgGrbdLdg);
  });
});
