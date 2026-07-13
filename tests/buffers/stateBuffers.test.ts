import { PlayerStateHistory } from '../../game/engine/systems/history';
import {
  ATTACK_IDS,
  GRAB_IDS,
  STATE_IDS
} from '../../game/engine/finiteStateMachines/player/shared';

jest.mock('../../game/engine/config/main-config', () => ({
  envConfig: {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'MaxSensorsPerPlayer':
          return 25;
        case 'MaxHurtBubblesPerPlayer':
          return 25;
        case 'MaxGrabBubblesPerPlayer':
          return 25;
        case 'MaxAtkBubblesPerPlayer':
          return 25;
        default:
          return 10; // Default for other things like MaxFrameStorage
      }
    })
  }
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
      active: true
    };
    sourceHistory.sensors[1] = {
      xOffsetRaw: 4,
      yOffsetRaw: 5,
      radiusRaw: 6,
      active: false
    };

    // Populate some computed values to ensure they are serialized
    sourceHistory.comp_sensors[0] = {
      globalXRaw: 10,
      globalYRaw: 20,
      radiusRaw: 30,
      active: true
    };
    sourceHistory.comp_ecbDiamond[0] = { xRaw: 11, yRaw: 22 };
    sourceHistory.comp_hurtCapsules[0] = {
      x1Raw: 1,
      y1Raw: 2,
      x2Raw: 3,
      y2Raw: 4,
      radiusRaw: 5,
      active: true
    };
    sourceHistory.comp_attackCircles[0] = {
      id: 1,
      xRaw: 2,
      yRaw: 3,
      radiusRaw: 4,
      active: true
    };
    sourceHistory.comp_grabCircles[0] = {
      iD: 1,
      xRaw: 1,
      yRaw: 2,
      radiusRaw: 3,
      active: true
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
    const stateForFrame = destHistory.Deserialize(buffer, 0);

    // 4. Assert
    expect(stateForFrame).toBe(frameNumber);

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

  it('should calculate the exact BufferSize needed for serialization', () => {
    const history = new PlayerStateHistory();
    const byteSize = PlayerStateHistory.BufferSize();
    const elementCount = byteSize / Int32Array.BYTES_PER_ELEMENT;

    // Allocate a buffer of the EXACT size predicted by BufferSize()
    const sharedBuffer = new SharedArrayBuffer(byteSize);
    const buffer = new Int32Array(sharedBuffer);

    // Fill with a sentinel value to verify the entire buffer is utilized
    const sentinel = -999;
    buffer.fill(sentinel);

    const frameNumber = 1;
    const writtenElements = history.Serialize(buffer, 0, frameNumber);

    // The number of elements written must exactly match the calculated size
    expect(writtenElements).toBe(elementCount);

    // The very last slot should have been utilized (overwritten)
    expect(buffer[elementCount - 1]).not.toBe(sentinel);
  });

  it('should handle undefined ids mapping to -1 and back to undefined', () => {
    const hist = new PlayerStateHistory();
    hist.grabId = undefined;
    hist.holdingPlayerId = undefined;
    hist.atkId = undefined;

    const buffer = new Int32Array(
      new SharedArrayBuffer(PlayerStateHistory.BufferSize())
    );
    hist.Serialize(buffer, 0, 42);

    const dest = new PlayerStateHistory();
    dest.Deserialize(buffer, 0);

    expect(dest.grabId).toBeUndefined();
    expect(dest.holdingPlayerId).toBeUndefined();
    expect(dest.atkId).toBeUndefined();
  });

  it('should handle 0 values for ids properly', () => {
    const hist = new PlayerStateHistory();
    hist.grabId = 0;
    hist.holdingPlayerId = 0;
    hist.atkId = 0;

    const buffer = new Int32Array(
      new SharedArrayBuffer(PlayerStateHistory.BufferSize())
    );
    hist.Serialize(buffer, 0, 42);

    const dest = new PlayerStateHistory();
    dest.Deserialize(buffer, 0);

    expect(dest.grabId).toBe(0);
    expect(dest.holdingPlayerId).toBe(0);
    expect(dest.atkId).toBe(0);
  });

  it('should return false from Deserialize if the seqlock is odd (write in progress)', () => {
    const buffer = new Int32Array(
      new SharedArrayBuffer(PlayerStateHistory.BufferSize())
    );

    // Set the seqlock start integer (offset 0) to an odd number
    buffer[0] = 3;

    const dest = new PlayerStateHistory();
    const result = dest.Deserialize(buffer, 0);

    // Retries should exhaust completely and return false
    expect(result).toBe(false);
  });

  it('should ensure no properties overlap by using distinct values across the entire struct', () => {
    const source = new PlayerStateHistory();
    let valCounter = 1;

    // Set simple numeric properties
    source.posXRaw = valCounter++;
    source.posYRaw = valCounter++;
    source.velXRaw = valCounter++;
    source.velYRaw = valCounter++;
    source.damageRaw = valCounter++;
    source.stateId = valCounter++;
    source.stateFrame = valCounter++;
    source.hitStopFrames = valCounter++;
    source.hitStunFrames = valCounter++;
    source.jumpCount = valCounter++;
    source.hitPauseFrames = valCounter++;
    source.intangabilityFrames = valCounter++;
    source.disablePlatformDetectionFrames = valCounter++;
    source.hitStunVxRaw = valCounter++;
    source.hitStunVyRaw = valCounter++;
    source.hitStunNextStateId = valCounter++;
    source.grabMeterRaw = valCounter++;
    source.shieldRadiusRaw = valCounter++;
    source.calcRadiusRaw = valCounter++;
    source.shieldTiltXRaw = valCounter++;
    source.shieldTiltYRaw = valCounter++;
    source.ldGrabCount = valCounter++;
    source.grabId = valCounter++;
    source.holdingPlayerId = valCounter++;
    source.atkId = valCounter++;

    source.comp_shield.calcXRaw = valCounter++;
    source.comp_shield.calcYRaw = valCounter++;

    // Set nested arrays
    for (let i = 0; i < source.sensors.length; i++) {
      source.sensors[i].xOffsetRaw = valCounter++;
      source.sensors[i].yOffsetRaw = valCounter++;
      source.sensors[i].radiusRaw = valCounter++;
      source.sensors[i].active = valCounter++ % 2 === 0;
    }

    for (let i = 0; i < source.comp_sensors.length; i++) {
      source.comp_sensors[i].globalXRaw = valCounter++;
      source.comp_sensors[i].globalYRaw = valCounter++;
      source.comp_sensors[i].radiusRaw = valCounter++;
      source.comp_sensors[i].active = valCounter++ % 2 === 0;
    }

    for (let i = 0; i < source.comp_ecbDiamond.length; i++) {
      source.comp_ecbDiamond[i].xRaw = valCounter++;
      source.comp_ecbDiamond[i].yRaw = valCounter++;
    }

    for (let i = 0; i < source.comp_hurtCapsules.length; i++) {
      source.comp_hurtCapsules[i].x1Raw = valCounter++;
      source.comp_hurtCapsules[i].y1Raw = valCounter++;
      source.comp_hurtCapsules[i].x2Raw = valCounter++;
      source.comp_hurtCapsules[i].y2Raw = valCounter++;
      source.comp_hurtCapsules[i].radiusRaw = valCounter++;
      source.comp_hurtCapsules[i].active = valCounter++ % 2 === 0;
    }

    for (let i = 0; i < source.comp_attackCircles.length; i++) {
      source.comp_attackCircles[i].xRaw = valCounter++;
      source.comp_attackCircles[i].yRaw = valCounter++;
      source.comp_attackCircles[i].radiusRaw = valCounter++;
      source.comp_attackCircles[i].active = valCounter++ % 2 === 0;
    }

    for (let i = 0; i < source.comp_grabCircles.length; i++) {
      source.comp_grabCircles[i].iD = valCounter++;
      source.comp_grabCircles[i].xRaw = valCounter++;
      source.comp_grabCircles[i].yRaw = valCounter++;
      source.comp_grabCircles[i].radiusRaw = valCounter++;
      source.comp_grabCircles[i].active = valCounter++ % 2 === 0;
    }

    for (let i = 0; i < source.comp_ledgeDetectorLeft.length; i++) {
      source.comp_ledgeDetectorLeft[i].xRaw = valCounter++;
      source.comp_ledgeDetectorLeft[i].yRaw = valCounter++;
    }

    for (let i = 0; i < source.comp_ledgeDetectorRight.length; i++) {
      source.comp_ledgeDetectorRight[i].xRaw = valCounter++;
      source.comp_ledgeDetectorRight[i].yRaw = valCounter++;
    }

    const buffer = new Int32Array(
      new SharedArrayBuffer(PlayerStateHistory.BufferSize())
    );
    const testFrame = 999;
    source.Serialize(buffer, 0, testFrame);

    const dest = new PlayerStateHistory();
    const result = dest.Deserialize(buffer, 0);

    expect(result).toBe(testFrame);

    // Clean un-serialized properties for deep equality check
    const fresh = new PlayerStateHistory();
    const sourceCmp = { ...source };
    sourceCmp.playersHit = fresh.playersHit;
    sourceCmp.sensorReactor = fresh.sensorReactor;
    sourceCmp.ldgGrbdLdg = fresh.ldgGrbdLdg;

    const destCmp = { ...dest };
    destCmp.playersHit = fresh.playersHit;
    destCmp.sensorReactor = fresh.sensorReactor;
    destCmp.ldgGrbdLdg = fresh.ldgGrbdLdg;

    expect(destCmp).toEqual(sourceCmp);
  });
});
