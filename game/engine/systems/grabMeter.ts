import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { MultiplyRaw, NumberToRaw } from '../math/fixedPoint';
import { World } from '../world/world';

const POINT_TWO_FIVE = NumberToRaw(0.25);
const POINT_FOUR = NumberToRaw(0.4);
const ONE_POINT_FIVE = NumberToRaw(1.5);
const TWO = NumberToRaw(2);
const BASE_METER = NumberToRaw(60);

export function GrabMeter(w: World) {
  const pd = w.PlayerData;
  const playerCount = pd.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = pd.Player(playerIndex);
    if (p.FSMInfo.CurrentState.StateId !== STATE_IDS.GRAB_HELD_S) {
      continue;
    }
    const grabMeterComp = p.GrabMeter;
    const baseDecay = grabMeterComp.BaseDecayRate;
    const damage = p.Damage.Damage;
    const currentMeter = grabMeterComp.Meter;
    const maxMeter = BASE_METER + MultiplyRaw(damage.Raw, TWO);
    const iS = pd.InputStore(playerIndex);
    const previousInput = iS.GetInputForFrame(w.PreviousFrame);
    const currentInput = iS.GetInputForFrame(w.localFrame);
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
