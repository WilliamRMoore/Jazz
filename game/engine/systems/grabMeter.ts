import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { MultiplyRaw } from '../math/fixedPoint';
import {
  ONE_POINT_FIVE,
  POINT_FOUR,
  POINT_TWO_FIVE,
  SIXTY,
  TWO,
} from '../math/numberConstants';
import { World } from '../world/world';

const BASE_METER = SIXTY;

export function GrabMeter(w: World) {
  const pd = w.PlayerData;
  const playerCount = pd.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = pd.Player(playerIndex);
    if (p.FSMInfo.CurrentStatetId !== STATE_IDS.GRAB_HELD_S) {
      continue;
    }
    const grabMeterComp = p.GrabMeter;
    const baseDecay = grabMeterComp.BaseDecayRate;
    const damage = p.Damage.Damage;
    const currentMeter = grabMeterComp.Meter;
    const maxMeter = BASE_METER + MultiplyRaw(damage.Raw, TWO);
    const iS = pd.InputStore(playerIndex);
    const previousInput = iS.GetInputForFrame(w.PreviousFrame);
    const currentInput = iS.GetInputForFrame(w.LocalFrame);
    const actionBonusDecay =
      previousInput.Action !== currentInput.Action ? ONE_POINT_FIVE : 0;
    let stickbonusDecay = 0;
    if (
      Math.abs(previousInput.LXAxis.Raw - currentInput.LXAxis.Raw) > POINT_FOUR
    ) {
      stickbonusDecay += POINT_TWO_FIVE;
    }
    if (
      Math.abs(previousInput.LYAxis.Raw - currentInput.LYAxis.Raw) > POINT_FOUR
    ) {
      stickbonusDecay += POINT_TWO_FIVE;
    }
    if (
      Math.abs(previousInput.RXAxis.Raw - currentInput.RXAxis.Raw) > POINT_FOUR
    ) {
      stickbonusDecay += POINT_TWO_FIVE;
    }
    if (
      Math.abs(previousInput.RYAxis.Raw - currentInput.RYAxis.Raw) > POINT_FOUR
    ) {
      stickbonusDecay += POINT_TWO_FIVE;
    }
    const decay = baseDecay + actionBonusDecay + stickbonusDecay;
    currentMeter.AddRaw(decay);
    if (currentMeter.Raw >= maxMeter) {
      const sm = pd.StateMachine(p.ID);
      const grabber = pd.Player(grabMeterComp.HoldingPlayerId!);
      const grabberSm = pd.StateMachine(grabber.ID);
      sm.UpdateFromWorld(GAME_EVENT_IDS.GRAB_ESCAPE_GE);
      grabberSm.UpdateFromWorld(GAME_EVENT_IDS.GRAB_RELEASE_GE);
    }
  }
}
