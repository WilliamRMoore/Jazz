import { DefaultCharacterConfig } from '../game/character/default';
import { COMMAND_NAMES } from '../game/engine/command/command';
import { SetPlayerSensorDetectCommand } from '../game/engine/command/commands/setPlayerSensorReactor';
import { SetVelocityCommand } from '../game/engine/command/commands/setPlayerVelocity';
import { SwitchPlayerStateCommand } from '../game/engine/command/commands/switchPlayerState';
import {
  ATTACK_IDS,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../game/engine/finite-state-machine/stateConfigurations/shared';
import { Player } from '../game/engine/entity/playerOrchestrator';

describe('Player Orechstraotr Initialization', () => {
  let config: DefaultCharacterConfig;
  let po: Player;

  beforeAll(() => {
    config = new DefaultCharacterConfig();
    po = new Player(0, config);
  });

  test('Should have weight of 110', () => {
    expect(po.Weight.Value.AsNumber).toBe(110);
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
    expect(shield.InitialRadius.AsNumber).toBe(75);
    expect(shield.YOffsetConstant.AsNumber).toBe(-50);
  });

  test('Should have down special attack properties', () => {
    const attacks = po.Attacks._attacks;
    const downSpecial = attacks.get(ATTACK_IDS.D_SPCL_ATK);

    expect(downSpecial).toBeDefined();
    if (!downSpecial) return;

    expect(downSpecial.Name).toBe('DSpecial');
    expect(downSpecial.TotalFrameLength).toBe(77);
    expect(downSpecial.BaseKnockBack.AsNumber).toBe(15);
    expect(downSpecial.KnockBackScaling.AsNumber).toBe(66);
    expect(downSpecial.GravityActive).toBe(false);
    expect(downSpecial.ImpulseClamp?.AsNumber).toBe(12);
    expect(downSpecial.HitBubbles.length).toBe(4);

    const impulse = downSpecial?.Impulses?.get(23);
    expect(impulse).toBeDefined();
    if (!impulse) return;
    expect(impulse.X.AsNumber).toBe(2);
    expect(impulse.Y.AsNumber).toBe(0);

    const hb1 = downSpecial.HitBubbles[0];
    expect(hb1.Damage.AsNumber).toBe(15);
    expect(hb1.Radius.AsNumber).toBe(20);
    expect(hb1.Priority).toBe(0);
    expect(hb1.launchAngle.AsNumber).toBe(45);

    const hb4 = downSpecial.HitBubbles.find((hb) => hb.Priority === 4);
    expect(hb4).toBeDefined();
    if (!hb4) return;
    expect(hb4.Damage.AsNumber).toBe(16);
    expect(hb4.Radius.AsNumber).toBe(25);

    const hb1Offset = hb1.frameOffsets.get(23);
    expect(hb1Offset).toBeDefined();
    if (!hb1Offset) return;
    expect(hb1Offset.X.AsNumber).toBe(100);
    expect(hb1Offset.Y.AsNumber).toBe(-25);

    const hb4Offset = hb4.frameOffsets.get(51);
    expect(hb4Offset).toBeDefined();
    if (!hb4Offset) return;
    expect(hb4Offset.X.AsNumber).toBe(120);
    expect(hb4Offset.Y.AsNumber).toBe(-25);
  });
});
