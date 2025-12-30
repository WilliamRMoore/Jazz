import { World } from '../world/world';

export function SheildRegen(w: World) {
  const pd = w.PlayerData;
  const playerCount = pd.PlayerCount;
  for (let i = 0; i < playerCount; i++) {
    const p = pd.Player(i);
    const shield = p.Shield;
    if (!shield.Active) {
      shield.Grow();
    }
  }
}
