import { HandleCommand } from '../../command/command';
import { Attack } from '../../entity/components/attack';
import { Grab } from '../../entity/components/grab';
import { Player } from '../../entity/playerOrchestrator';
import { MultiplyRaw } from '../../math/fixedPoint';
import { POINT_EIGHT } from '../../math/numberConstants';
import { FlatVec } from '../../physics/vector';
import { World } from '../../world/world';
import { GameEventId, StateId } from './shared';

export function fastFallCheck(p: Player, w: World) {
  const inputStore = w.PlayerData.InputStore(p.ID);
  const curFrame = w.LocalFrame;
  const prevFrame = w.PreviousFrame;
  const ia = inputStore.GetInputForFrame(curFrame);
  const prevIa = inputStore.GetInputForFrame(prevFrame);
  if (
    p.Velocity.Y.Raw >= 0 &&
    prevIa !== undefined &&
    ShouldFastFall(ia.LYAxis.Raw, prevIa.LYAxis.Raw)
  ) {
    p.Flags.FastFallOn();
  }
}

export function attackOnEnter(p: Player, w: World, gameEventId: GameEventId) {
  const attackComp = p.Attacks;
  attackComp.SetCurrentAttack(gameEventId);
  const atk = attackComp.GetAttack();
  if (atk === undefined) {
    return;
  }
  const onEnterCommands = atk.onEnterCommands;
  const onEnterEventCount = onEnterCommands.length;
  for (let i = 0; i < onEnterEventCount; i++) {
    const onEnterCommand = onEnterCommands[i];
    HandleCommand(w, p, onEnterCommand);
  }
}

export function attackOnUpdate(p: Player, w: World) {
  const attack = p.Attacks.GetAttack();

  if (attack === undefined) {
    return;
  }

  const currentStateFrame = p.FSMInfo.CurrentStateFrame;
  const impulse = attack.GetImpulseForFrame(currentStateFrame);

  if (impulse !== undefined) {
    addAttackImpulseToPlayer(p, impulse, attack);
  }

  const updateCommands = attack.onUpdateCommands.get(currentStateFrame);

  if (updateCommands !== undefined) {
    const updateCommandCount = updateCommands.length;
    for (let i = 0; i < updateCommandCount; i++) {
      const updateCommand = updateCommands[i];
      HandleCommand(w, p, updateCommand);
    }
  }
}

export function aerialInputOnUpdate(p: Player, w: World) {
  const inputStore = w.PlayerData.InputStore(p.ID);
  const curFrame = w.LocalFrame;
  const ia = inputStore.GetInputForFrame(curFrame);
  const speedsComp = p.Speeds;

  if (!p.Flags.IsPlatDetectDisabled) {
    fastFallCheck(p, w);
  }

  p.Velocity.AddClampedXImpulseRaw(
    speedsComp.AerialSpeedInpulseLimitRaw,
    MultiplyRaw(ia.LXAxis.Raw, speedsComp.ArielVelocityMultiplierRaw)
  );
}

export function attackOnExit(p: Player, w: World) {
  const attackComp = p.Attacks;
  const atk = attackComp.GetAttack();
  if (atk === undefined) {
    return;
  }
  const onExitCommands = atk.onExitCommands;
  const onExitCommandCount = onExitCommands.length;
  for (let i = 0; i < onExitCommandCount; i++) {
    const onExitCommand = onExitCommands[i];
    HandleCommand(w, p, onExitCommand);
  }
  attackComp.ZeroCurrentAttack();
}

export function ShouldFastFall(
  curLYAxsisRaw: number,
  prevLYAxsisRaw: number
): boolean {
  return curLYAxsisRaw < -POINT_EIGHT && prevLYAxsisRaw > -POINT_EIGHT;
}

export function addAttackImpulseToPlayer(p: Player, impulse: FlatVec, attack: Attack) {
  const xRaw = p.Flags.IsFacingRight ? impulse.X.Raw : -impulse.X.Raw;
  const yRaw = impulse.Y.Raw;
  const clampRaw = attack?.ImpulseClamp?.Raw;
  const pVel = p.Velocity;
  if (clampRaw !== undefined) {
    pVel.AddClampedXImpulseRaw(clampRaw, xRaw);
    pVel.AddClampedYImpulseRaw(clampRaw, yRaw);
  }
}

export function grabOnEnter(p: Player, gameEventId: GameEventId, stateId: StateId) {
  const grabComp = p.Grabs;
  grabComp.SetGrab(gameEventId);
  const grab = grabComp.GetGrab();
  if (grab === undefined) {
    return;
  }
}

export function grabOnUpdate(p: Player, w: World) {
  const grabs = p.Grabs;
  const grab = grabs.GetGrab();
  if (grab === undefined) {
    return;
  }

  const currentStateFrame = p.FSMInfo.CurrentStateFrame;
  const impulse = grab.GetImpulseForFrame(currentStateFrame);

  if (impulse !== undefined) {
    addGrabImpulseToPlayer(p, impulse, grab);
  }
}

export function grabOnExit(p: Player, w: World) {
  const grabComp = p.Grabs;
  const grab = grabComp.GetGrab();
  if (grab === undefined) {
    return;
  }
  grabComp.ZeroCurrentGrab();
}

export function addGrabImpulseToPlayer(p: Player, impulse: FlatVec, grab: Grab) {
  const xRaw = p.Flags.IsFacingRight ? impulse.X.Raw : -impulse.X.Raw;
  const yRaw = impulse.Y.Raw;
  const clampRaw = grab?.ImpulseClamp?.Raw;
  const pVel = p.Velocity;
  if (clampRaw !== undefined) {
    pVel.AddClampedXImpulseRaw(clampRaw, xRaw);
    pVel.AddClampedYImpulseRaw(clampRaw, yRaw);
  }
}
