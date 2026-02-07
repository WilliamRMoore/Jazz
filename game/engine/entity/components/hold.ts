import { IHistoryEnabled } from '../componentHistory';

type HoldSnapShot = number | undefined;

export class HoldComponent implements IHistoryEnabled<HoldSnapShot> {
  private heldPlayerId: number | undefined = undefined;

  public SetHeldPlayerId(playerId: number) {
    this.heldPlayerId = playerId;
  }

  public get HeldPlayerId(): number | undefined {
    return this.heldPlayerId;
  }

  public ClearHeldPlayerId() {
    this.heldPlayerId = undefined;
  }

  public SnapShot(): HoldSnapShot {
    return this.heldPlayerId;
  }

  public SetFromSnapShot(snapShot: HoldSnapShot): void {
    this.heldPlayerId = snapShot;
  }
}
