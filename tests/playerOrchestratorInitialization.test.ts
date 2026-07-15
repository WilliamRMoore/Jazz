import { DefaultCharacterConfig } from '../game/character/default';
import { COMMAND_NAMES } from '../game/engine/command/command';
import { SetPlayerSensorDetectCommand } from '../game/engine/command/commands/setPlayerSensorReactor';
import { SetVelocityCommand } from '../game/engine/command/commands/setPlayerVelocity';
import { SwitchPlayerStateCommand } from '../game/engine/command/commands/switchPlayerState';
import {
  Player, PlayerECBAABB,
  PlayerHurtCapAABB
} from '../game/engine/entity/playerOrchestrator';
import {
  ATTACK_IDS,
  GAME_EVENT_IDS,
  STATE_IDS
} from '../game/engine/finiteStateMachines/player/states/shared';
import { PlayerStateHistory } from '../game/engine/systems/history';

describe('Player Orechstraotr Initialization', () => {
  let config: DefaultCharacterConfig;
  let po: Player;

  beforeAll(() => {
    config = new DefaultCharacterConfig();
    po = new Player(0, config);
  });

  test('Should have weight', () => {
    expect(po.Weight.Value.AsNumber).toBeGreaterThan(0);
  });

  test('Should have side special configuration', () => {
    const attacks = po.Attacks._attacks;

    const sideSpecial = attacks.get(ATTACK_IDS.S_SPCL_ATK);
    const setVelCommand = sideSpecial?.onEnterCommands.find(
      (c) => c.commandName == COMMAND_NAMES.VELOCITY_SET
    )! as SetVelocityCommand;
    const payLoad = setVelCommand.payload;
    expect(payLoad.x).toBe(0);
    expect(payLoad.y).toBe(0);

    const c = sideSpecial?.onEnterCommands.find(
      (c) => c.commandName == COMMAND_NAMES.SET_SENSOR_REACT_COMMAND
    )! as SetPlayerSensorDetectCommand;
    const cPayload = c.payload as SwitchPlayerStateCommand;
    const ge = cPayload.payload;

    expect(ge).toBe(GAME_EVENT_IDS.SIDE_SPCL_EX_GE);
  });

  test('Should have shape', () => {
    const shapes = po.ECB._db_ecbShapes;
    const jumpShape = shapes.get(STATE_IDS.JUMP_S)!;
    expect(jumpShape.height.AsNumber).toBe(60);
    expect(jumpShape.width.AsNumber).toBe(70);
    expect(jumpShape.yOffset.AsNumber).toBe(-15);
  });

  test('Should have shield component configured correctly', () => {
    const shield = po.Shield;
    expect(shield.InitialRadius.AsNumber).toBeGreaterThan(0);
    expect(shield.YOffsetConstant.AsNumber).toBeLessThan(1);
  });
});

describe('PlayerECBAABB', () => {
  it('should create an AABB encompassing the current and previous ECB states (union)', () => {
    // Mock the current Player object's ECB state
    const mockPlayer = {
      ECB: {
        Left: { X: { Raw: 100 }, Y: { Raw: 75 } },
        Top: { X: { Raw: 125 }, Y: { Raw: 50 } },
        Right: { X: { Raw: 150 }, Y: { Raw: 75 } },
        Bottom: { X: { Raw: 125 }, Y: { Raw: 100 } },
        Width: { Raw: 50 },
        Height: { Raw: 50 }
      }
    } as unknown as Player;

    // Mock the previous player state history
    // Based on the array indices used in the orchestrator: 0=Bottom, 1=Left, 2=Right, 3=Top
    const mockLastState = {
      comp_ecbDiamond: [
        { xRaw: 105, yRaw: 120 }, // Bottom (0)
        { xRaw: 80, yRaw: 95 }, // Left (1)
        { xRaw: 130, yRaw: 95 }, // Right (2)
        { xRaw: 105, yRaw: 70 } // Top (3)
      ]
    } as unknown as PlayerStateHistory;

    const aabb = {
      xRaw: 0,
      yRaw: 0,
      widthRaw: 0,
      heightRaw: 0
    };

    PlayerECBAABB(mockPlayer, mockLastState, aabb);

    // Verify that the resulting AABB fully encapsulates both current and previous ECB positions
    expect(aabb.xRaw).toBe(80); // Math.min(100, 80)
    expect(aabb.yRaw).toBe(50); // Math.min(50, 70)
    expect(aabb.widthRaw).toBe(70); // Math.max(150, 130) - 80
    expect(aabb.heightRaw).toBe(70); // Math.max(100, 120) - 50
  });
});

describe('PlayerHurtCapAABB', () => {
  it('should create a swept AABB encompassing current and previous hurt capsules', () => {
    // Mock current player state
    const mockPlayer = {
      Position: {
        X: { Raw: 200 },
        Y: { Raw: 150 }
      },
      HurtCircles: {
        HurtCapsules: [
          {
            // Main body capsule
            StartOffsetX: { Raw: 0 },
            StartOffsetY: { Raw: -80 },
            EndOffsetX: { Raw: 0 },
            EndOffsetY: { Raw: -20 },
            Radius: { Raw: 25 }
          },
          {
            // Head capsule
            StartOffsetX: { Raw: 0 },
            StartOffsetY: { Raw: -100 },
            EndOffsetX: { Raw: 0 },
            EndOffsetY: { Raw: -80 },
            Radius: { Raw: 20 }
          }
        ]
      }
    } as unknown as Player;

    //x: 200 - 25 = 175
    //y: 150 -100 - 20 = 30;
    //width = 0 + 25
    //height = -100 - 20 = -120 or just 120

    // Mock previous player state
    const mockLastState = {
      posXRaw: 180,
      posYRaw: 140,
      comp_hurtCapsules: [
        {
          // Main body capsule
          active: true,
          x1Raw: 180, // Global: 180 + 0
          y1Raw: 65, // Global: 140 + (-75)
          x2Raw: 180, // Global: 180 + 0
          y2Raw: 125, // Global: 140 + (-15)
          radiusRaw: 25
        },
        {
          // Head capsule
          active: true,
          x1Raw: 180, // Global: 180 + 0
          y1Raw: 45, // Global: 140 + (-95)
          x2Raw: 180, // Global: 180 + 0
          y2Raw: 65, // Global: 140 + (-75)
          radiusRaw: 20
        }
      ]
    } as unknown as PlayerStateHistory;

    const aabb = { xRaw: 0, yRaw: 0, widthRaw: 0, heightRaw: 0 };

    PlayerHurtCapAABB(mockPlayer, mockLastState, aabb);

    // --- Expected values calculation ---
    // Current AABB: { x: 175, y: 30, right: 225, bottom: 155 }
    // Previous AABB: { x: 155, y: 25, right: 205, bottom: 150 }

    // Swept AABB (union of current and previous):
    const expectedX = 155; // Math.min(175, 155)
    const expectedY = 25; // Math.min(30, 25)
    const expectedRight = 225; // Math.max(225, 205)
    const expectedBottom = 155; // Math.max(155, 150)
    const expectedWidth = expectedRight - expectedX; // 225 - 155 = 70
    const expectedHeight = expectedBottom - expectedY; // 155 - 25 = 130

    expect(aabb.xRaw).toBe(expectedX);
    expect(aabb.yRaw).toBe(expectedY);
    expect(aabb.widthRaw).toBe(expectedWidth);
    expect(aabb.heightRaw).toBe(expectedHeight);
  });
});
