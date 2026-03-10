import { FixedPoint } from '../../math/fixedPoint';
import { ONE } from '../../math/numberConstants';

export class GrabMeterComponent {
  public readonly Meter = new FixedPoint(0);
  public readonly BaseDecayRate = ONE; // 1 frame per frame
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

  public set CompState(history: GrabMetereHist) {
    this.Meter.SetFromRaw(history.grabMeterRaw);
    this.playerId = history.holdingPlayerId;
  }
}

export type GrabMetereHist = {
  grabMeterRaw: number;
  holdingPlayerId: number | undefined;
};
