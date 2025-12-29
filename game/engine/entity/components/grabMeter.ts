import { FixedPoint, NumberToRaw } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

type GrabMeterSnapShot = {
  meter: number;
  holdingPlayerId: number | undefined;
};

export class GrabMeterComponent implements IHistoryEnabled<GrabMeterSnapShot> {
  public readonly Meter = new FixedPoint(0);
  public readonly BaseDecayRate = NumberToRaw(1); // 1 frame per frame
  private playerId: number | undefined = undefined;

  public get HoldingPlayerId(): number | undefined {
    return this.playerId;
  }

  public SetHoldingPlayerId(id: number): void {
    this.playerId = id;
  }

  public ZeroHoldingPlayerId(): void {
    this.playerId = undefined;
  }

  public SnapShot(): GrabMeterSnapShot {
    return {
      meter: this.Meter.AsNumber,
      holdingPlayerId: this.playerId,
    } as GrabMeterSnapShot;
  }

  public SetFromSnapShot(snapShot: GrabMeterSnapShot): void {
    this.Meter.SetFromNumber(snapShot.meter);
    this.playerId = snapShot.holdingPlayerId;
  }
}
