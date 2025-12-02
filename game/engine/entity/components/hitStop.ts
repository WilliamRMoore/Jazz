import { IHistoryEnabled } from '../componentHistory';

export type hitStopSnapShot = number;

export class HitStopComponent implements IHistoryEnabled<hitStopSnapShot> {
  private hitStopFrames: number = 0;

  public SetHitStop(frames: number): void {
    this.hitStopFrames = frames;
  }

  public Decrement(): void {
    this.hitStopFrames--;
  }

  public SetZero(): void {
    this.hitStopFrames = 0;
  }

  public get HitStopFrames(): number {
    return this.hitStopFrames;
  }

  public SnapShot(): hitStopSnapShot {
    return this.hitStopFrames as hitStopSnapShot;
  }

  public SetFromSnapShot(snapShot: hitStopSnapShot): void {
    this.hitStopFrames = snapShot;
  }
}
