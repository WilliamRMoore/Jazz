import { PlayerData } from '../world/world';

export function PlayerShields(pd: PlayerData, localFrame: number) {
  const playerCount = pd.PlayerCount;
  for (let i = 0; i < playerCount; i++) {
    const p = pd.Player(i);
    const shield = p.Shield;

    if (shield.Active) {
      const inputStore = pd.InputStore(i);
      const input = inputStore.GetInputForFrame(localFrame);
      const triggerValue =
        input.LTValRaw >= input.RTValRaw ? input.LTValRaw : input.RTValRaw;
      shield.ShrinkRaw(triggerValue);
      return;
    }

    shield.Grow();
  }
}
