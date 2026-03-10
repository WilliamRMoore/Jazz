import { World } from '../world/world';

export function PlayerInput(world: World): void {
  const playerData = world.PlayerData;
  const playerCount = playerData.PlayerCount;
  const localFrame = world.LocalFrame;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    if (p.Flags.IsInHitPause) {
      continue;
    }
    const input = playerData
      .InputStore(playerIndex)
      .GetInputForFrame(localFrame);
    playerData.StateMachine(playerIndex).UpdateFromInput(input, world);
  }
}
