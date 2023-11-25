import { Player } from '../Player/Player';

class LedgeDetectionSystem {
  Players: Array<Player>;

  constructor(players: Array<Player>) {
    this.Players = players;
  }

  public CheckForLedge() {
    const length = this.Players.length;

    for (let i = 0; i < length; i++) {
      const p = this.Players[i];

      //let rightBp.LedgeDetector.GetVerticies().slice(0, 3);
    }
  }
}
